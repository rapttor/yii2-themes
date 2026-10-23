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
        self::assertSame('rapttor-dark', $t->normalize('forest'));
        self::assertSame('rapttor-dark', $t->normalize(null));
        self::assertSame('system', $this->themes()->normalize('nope'));
    }

    public function testEveryBuiltInThemeMeetsTheContrastRules(): void
    {
        $t = $this->themes();
        self::assertGreaterThanOrEqual(27, count($t->keys()));
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

    public function testCustomGroupsAreNamedAndOrderedByTheHost(): void
    {
        $t = $this->themes([
            'groups' => ['brand' => 'Our brand'],
            'themes' => ['b' => ['label' => 'B', 'group' => 'brand', 'mode' => 'light', 'bg' => '#ffffff', 'surface' => '#f5f5f5', 'text' => '#111111', 'brand' => '#0044aa', 'link' => '#0044aa', 'accent' => '#aa4400']],
        ]);
        self::assertSame('Our brand', $t->groups()['brand']);
        self::assertSame('brand', array_key_last($t->groups()));
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
        self::assertSame(['system', 'design', 'rapttor', 'accessibility', 'soft', 'art'], array_keys($t->groups()));
        \Yii::$app->language = 'sh';
        self::assertNotSame('Art', $t->groups()['art'], 'translated');
        self::assertSame('Human Light', $t->labels()['human-light'], 'theme names are proper names');
        \Yii::$app->language = 'en';
    }

    public function testRules(): void
    {
        self::assertSame('in', $this->themes()->rules()[0][1]);
    }
}
