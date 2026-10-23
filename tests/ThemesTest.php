<?php

declare(strict_types=1);

namespace rapttor\themes\tests;

use PHPUnit\Framework\TestCase;
use rapttor\themes\Color;
use rapttor\themes\Themes;

final class ThemesTest extends TestCase
{
    private function themes(array $config = []): Themes
    {
        return new Themes($config);
    }

    public function testNormalizeFallsBackToDefault(): void
    {
        $t = $this->themes(['default' => 'rapttor-dark']);
        self::assertSame('pearl', $t->normalize('pearl'));
        self::assertSame('rapttor-dark', $t->normalize('no-such-theme'));
        self::assertSame('rapttor-dark', $t->normalize(null));
        self::assertSame('system', $this->themes()->normalize('nope'));
    }

    public function testEveryBuiltInThemeMeetsTheContrastRules(): void
    {
        $t = $this->themes();
        self::assertGreaterThanOrEqual(74, count($t->keys()));
        self::assertSame([], $t->audit());
    }

    public function testAuditReportsAThemeThatIsNotReadable(): void
    {
        $t = $this->themes(['themes' => ['bad' => ['label' => 'Bad', 'group' => 'custom', 'mode' => 'light', 'bg' => '#ffffff', 'surface' => '#ffffff', 'text' => '#aaaaaa', 'brand' => '#cccccc', 'link' => '#cccccc', 'accent' => '#eeeeee']]]);
        $problems = $t->audit();
        self::assertSame(['bad'], array_keys($problems));
        self::assertNotEmpty($problems['bad']);
    }

    public function testHighContrastThemesHaveStrongLines(): void
    {
        $t = $this->themes();
        $hc = $t->resolved('high-contrast-light');
        self::assertGreaterThanOrEqual(7.0, Color::contrast($hc['muted'], $hc['bg']));
        self::assertGreaterThan(Color::contrast($t->resolved('human-light')['line'], '#f2f2f7'), Color::contrast($hc['line'], '#ffffff'));
    }

    public function testCustomGroupsAreNamedAndPositionedByTheHost(): void
    {
        $theme = static fn (string $label, string $group): array => ['label' => $label, 'group' => $group, 'mode' => 'light', 'bg' => '#ffffff', 'surface' => '#f5f5f5', 'text' => '#111111', 'brand' => '#0044aa', 'link' => '#0044aa', 'accent' => '#aa4400'];
        $t = $this->themes([
            'groups' => ['brand' => ['label' => 'Our brand', 'position' => 'top'], 'coats' => 'Pet coats', 'extra' => ['label' => 'Extra', 'position' => 'bottom']],
            'themes' => ['b1' => $theme('B1', 'brand'), 'c1' => $theme('C1', 'coats'), 'e1' => $theme('E1', 'extra'), 'b2' => $theme('B2', 'brand')],
        ]);
        self::assertSame(['system', 'brand', 'coats', 'rapttor', 'design', 'accessibility', 'minimal', 'soft', 'materials', 'nature', 'seasons', 'daytime', 'places', 'editors', 'art', 'retro', 'extra', 'custom'], array_keys($t->groups()));
        self::assertSame('Our brand', $t->groups()['brand']);
        self::assertSame('Pet coats', $t->groups()['coats']);
    }

    public function testThemesAreListedGroupByGroupSoThePickerHeadingsDoNotRepeat(): void
    {
        $theme = ['mode' => 'light', 'bg' => '#ffffff', 'surface' => '#f5f5f5', 'text' => '#111111', 'brand' => '#0044aa', 'link' => '#0044aa', 'accent' => '#aa4400'];
        $t = $this->themes([
            'groups' => ['brand' => ['label' => 'Brand', 'position' => 'top']],
            'themes' => ['x' => ['label' => 'X', 'group' => 'brand'] + $theme, 'human-light' => null, 'y' => ['label' => 'Y', 'group' => 'brand'] + $theme],
        ]);
        $seen = [];
        $last = null;
        foreach ($t->all() as $id => $def) {
            if ($def['group'] !== $last) {
                self::assertNotContains($def['group'], $seen, "group {$def['group']} appears twice (at $id)");
                $seen[] = $def['group'];
                $last = $def['group'];
            }
        }
        self::assertSame(['system', 'brand', 'rapttor'], array_slice($seen, 0, 3));
        self::assertSame('custom', end($seen), 'the user-defined group is last');
    }

    public function testEnabledGroupsLimitWhatIsOfferedButSystemKeepsWorking(): void
    {
        $t = $this->themes(['enabledGroups' => ['rapttor', 'brand'], 'groups' => ['brand' => 'Brand'], 'themes' => [
            'b1' => ['label' => 'B1', 'group' => 'brand', 'mode' => 'light', 'bg' => '#ffffff', 'surface' => '#f5f5f5', 'text' => '#111111', 'brand' => '#0044aa', 'link' => '#0044aa', 'accent' => '#aa4400'],
        ]]);
        self::assertSame(['system', 'brand', 'rapttor'], array_keys($t->groups()), 'custom is hidden when its group is not enabled; host groups come first');
        self::assertSame(['system', 'brand', 'rapttor', 'custom'], array_keys($this->themes(['enabledGroups' => ['rapttor', 'brand', 'custom'], 'groups' => ['brand' => 'Brand'], 'themes' => ['b1' => ['label' => 'B1', 'group' => 'brand', 'mode' => 'light', 'bg' => '#ffffff', 'surface' => '#f5f5f5', 'text' => '#111111', 'brand' => '#0044aa', 'link' => '#0044aa', 'accent' => '#aa4400']]])->groups()), 'enabled: custom comes last');
        self::assertSame(['system', 'b1', 'rapttor-dark', 'rapttor-forest', 'rapttor-light'], $t->keys());
        self::assertSame('system', $t->normalize('human-light'), 'a stored theme of a hidden group falls back to the default');
        self::assertNotContains('human-light', $t->keys());
        // system still needs Human Light/Dark although their group is hidden
        self::assertSame(['#f2f2f7', '#000000'], $t->metaColors('system'));
        self::assertStringContainsString('@media (prefers-color-scheme:dark)', $t->css('system'));
        self::assertSame([], $t->audit());
        self::assertSame(array_keys($this->themes()->groups()), array_keys($this->themes(['enabledGroups' => null])->groups()), 'null = everything');
    }

    public function testUserDefinedThemeIsBuiltFromOneColour(): void
    {
        $t = $this->themes();
        self::assertSame(['mode' => 'dark', 'color' => '#336699'], Themes::parseCustom('DARK:#336699'));
        self::assertNull(Themes::parseCustom('dark:336699'));
        self::assertNull(Themes::parseCustom('blue:#336699'));
        self::assertNull(Themes::parseCustom(null));
        self::assertSame('light:#336699', Themes::formatCustom('weird', '#336699'));

        $r = $t->resolved('custom', 'dark:#cc3344');
        self::assertSame('dark', $r['mode']);
        self::assertSame('custom', $r['group']);
        self::assertEqualsWithDelta(Color::hsl('#cc3344')[0], Color::hsl($r['brand'])[0], 8, 'the picked hue is the highlight');
        self::assertLessThan(0.2, Color::luminance($r['bg']));
        self::assertSame('data-theme="custom" data-mode="dark"', $t->htmlAttributes('custom', 'dark:#cc3344'));
        self::assertNotSame($t->css('custom', 'dark:#cc3344'), $t->css('custom', 'light:#2255aa'));
        self::assertSame($t->css('custom'), $t->css('custom', 'garbage'), 'an invalid value uses the default colour');
        self::assertSame(['css', 'attrs'], array_keys($t->preview('custom', 'light:#2255aa')));
        self::assertSame([], $t->audit(), 'any colour gives a readable theme');
    }

    public function testGreyGivesANeutralTheme(): void
    {
        $r = $this->themes()->resolved('custom', 'light:#888888');
        self::assertEqualsWithDelta(0.0, Color::hsl($r['bg'])[1], 0.01);
        self::assertGreaterThanOrEqual(4.5, Color::contrast($r['brand'], $r['bg']));
    }

    public function testUserDefinedChoiceTravelsInItsOwnCookie(): void
    {
        $t = $this->themes();
        $request = new class () extends \yii\web\Request {
            /** @var array<string, string> */
            public array $jar = [];

            public function getCookies(): \yii\web\CookieCollection
            {
                $cookies = [];
                foreach ($this->jar as $name => $v) {
                    $cookies[$name] = new \yii\web\Cookie(['name' => $name, 'value' => $v]);
                }

                return new \yii\web\CookieCollection($cookies, ['readOnly' => true]);
            }
        };
        self::assertNull($t->customFor(null, $request));
        $request->jar = ['theme' => 'custom', 'theme_custom' => 'DARK:#AA5500'];
        self::assertSame('dark:#aa5500', $t->customFor(null, $request), 'a visitor gets the cookie');
        self::assertSame('light:#112233', $t->customFor('light:#112233', $request), 'a signed-in user keeps the stored value');
        self::assertNull($t->customFor('', $request), 'signed in without a stored value: not the cookie');

        $response = new \yii\web\Response();
        $t->remember($response, $request, 'custom', 'dark:#aa5500');
        self::assertSame('dark:#aa5500', $response->cookies->getValue('theme_custom'));
        $response2 = new \yii\web\Response();
        $t->remember($response2, $request, 'paper', 'dark:#aa5500');
        self::assertNull($response2->cookies->get('theme_custom'), 'only stored for the custom theme');
    }

    public function testPickerLayoutIsConfigurableAndAutoFollowsTheNumberOfThemes(): void
    {
        $t = $this->themes();
        self::assertSame('tabs', $t->layoutFor(), 'many themes: chips');
        self::assertSame('list', $t->layoutFor('list'), 'a widget can override');
        self::assertSame('list', $this->themes(['pickerLayout' => 'list'])->layoutFor());
        self::assertSame('tabs', $this->themes(['pickerLayout' => 'tabs', 'enabledGroups' => ['rapttor']])->layoutFor(), 'tabs even for a few');
        self::assertSame('list', $this->themes(['enabledGroups' => ['rapttor', 'design']])->layoutFor(), 'auto: few themes show as a list');
        self::assertSame('list', $this->themes(['pickerLayout' => 'nonsense', 'enabledGroups' => ['rapttor']])->layoutFor());
    }

    public function testCookieChoiceIsValidatedAndRemembered(): void
    {
        $t = $this->themes();
        $request = new class () extends \yii\web\Request {
            /** @var array<string, string> */
            public array $jar = [];

            public function getCookies(): \yii\web\CookieCollection
            {
                return new \yii\web\CookieCollection(array_map(static fn (string $v): \yii\web\Cookie => new \yii\web\Cookie(['name' => 'theme', 'value' => $v]), $this->jar), ['readOnly' => true]);
            }
        };
        self::assertNull($t->fromRequest($request));
        $request->jar = ['theme' => 'paper'];
        self::assertSame('paper', $t->fromRequest($request));
        self::assertSame('paper', $t->resolveFor(null, $request), 'a visitor gets the cookie');
        self::assertSame('pearl', $t->resolveFor('pearl', $request), 'a signed-in user keeps the stored theme');
        $request->jar = ['theme' => 'does-not-exist'];
        self::assertNull($t->fromRequest($request));

        $response = new \yii\web\Response();
        $t->remember($response, $request, 'rapttor-dark');
        self::assertSame('rapttor-dark', $response->cookies->getValue('theme'));
        self::assertGreaterThan(time() + 300 * 86400, $response->cookies->get('theme')->expire);
    }

    public function testSystemFollowsTheDevice(): void
    {
        $t = $this->themes(['systemLight' => 'material-light', 'systemDark' => 'material-dark']);
        $css = $t->css('system');
        self::assertStringContainsString('--bg:#fef7ff', $css);
        self::assertStringContainsString('@media (prefers-color-scheme:dark){:root{--bg:#141218', $css);
        self::assertSame('data-theme="system"', $t->htmlAttributes('system'));
        self::assertSame(['#fef7ff', '#141218'], $t->metaColors('system'));
    }

    public function testFixedThemeHasItsOwnModeAndNoMediaQuery(): void
    {
        $t = $this->themes();
        self::assertStringNotContainsString('@media', $t->css('rapttor-dark'));
        self::assertSame('data-theme="rapttor-dark" data-mode="dark"', $t->htmlAttributes('rapttor-dark'));
        self::assertSame(['#0b0b09', '#0b0b09'], $t->metaColors('rapttor-dark'));
    }

    public function testSoftThemesGetShadowsFlatThemesNone(): void
    {
        $t = $this->themes();
        self::assertStringContainsString('--elev:7px 7px 15px', $t->css('soft-light'));
        self::assertStringContainsString('--elev-in:inset', $t->css('soft-dark'));
        self::assertStringContainsString('--elev:none', $t->css('human-light'));
        self::assertSame('data-theme="soft-neutral" data-mode="light" data-style="soft"', $t->htmlAttributes('soft-neutral'));
    }

    public function testThemesCanBeAddedOverriddenAndRemoved(): void
    {
        $t = $this->themes(['themes' => [
            'mine' => ['label' => 'Mine', 'group' => 'custom', 'mode' => 'light', 'bg' => '#ffffff', 'surface' => '#f5f5f5', 'text' => '#111111', 'brand' => '#0044aa', 'link' => '#0044aa', 'accent' => '#aa4400'],
            'pearl' => null,
        ]]);
        self::assertContains('mine', $t->keys());
        self::assertNotContains('pearl', $t->keys());
        self::assertSame('Custom', $t->groups()['custom']);
    }

    public function testGroupsAndLabelsAreTranslated(): void
    {
        $t = $this->themes();
        self::assertSame(['system', 'rapttor', 'design', 'accessibility', 'minimal', 'soft', 'materials', 'nature', 'seasons', 'daytime', 'places', 'editors', 'art', 'retro', 'custom'], array_keys($t->groups()));
        \Yii::$app->language = 'sh';
        self::assertNotSame('Art', $t->groups()['art'], 'translated');
        self::assertSame('Human Light', $t->labels()['human-light'], 'theme names are proper names');
        \Yii::$app->language = 'en';
    }

    public function testRules(): void
    {
        self::assertSame('in', $this->themes()->rules()[1][1]);
    }
}
