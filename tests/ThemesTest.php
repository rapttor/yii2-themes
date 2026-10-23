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
        self::assertGreaterThanOrEqual(20, count($t->keys()));
        foreach ($t->keys() as $id) {
            $r = $t->resolved($id);
            foreach (isset($r['dark']) ? [$r, $r['dark']] : [$r] as $theme) {
                $name = $theme['id'];
                foreach (['bg', 'surface'] as $g) {
                    self::assertGreaterThanOrEqual(7.0, Color::contrast($theme['text'], $theme[$g]), "$name: text on $g");
                    self::assertGreaterThanOrEqual(4.5, Color::contrast($theme['muted'], $theme[$g]), "$name: muted text on $g");
                    self::assertGreaterThanOrEqual(4.5, Color::contrast($theme['brand'], $theme[$g]), "$name: brand on $g");
                    self::assertGreaterThanOrEqual(4.5, Color::contrast($theme['link'], $theme[$g]), "$name: link on $g");
                }
                self::assertGreaterThanOrEqual(4.5, Color::contrast($theme['brandInk'], $theme['brand']), "$name: ink on brand");
                self::assertGreaterThanOrEqual(3.0, Color::contrast($theme['accent'], $theme['bg']), "$name: accent on bg");
                self::assertSame($theme['mode'] === 'dark', Color::luminance($theme['bg']) < 0.2, "$name: mode matches the background");
            }
        }
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
        self::assertSame(['system', 'design', 'rapttor', 'soft', 'art'], array_keys($t->groups()));
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
