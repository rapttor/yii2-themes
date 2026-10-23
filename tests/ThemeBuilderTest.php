<?php

declare(strict_types=1);

namespace rapttor\themes\tests;

use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use rapttor\themes\Color;
use rapttor\themes\ThemeBuilder;

final class ThemeBuilderTest extends TestCase
{
    /** Dominant colours of real artworks plus awkward inputs (all grey, all near-black, one colour). */
    public static function sources(): array
    {
        $sets = [
            'starry' => ['#171d20', '#5b7392', '#3c527e', '#7b92a8', '#1f305a', '#3f4849', '#aab8ae', '#9d9f65'],
            'wave' => ['#f4e9cf', '#f6f9ed', '#e6d5b4', '#a0a6a1', '#31506a', '#707d81', '#c5cfc8', '#10273f'],
            'kiss' => ['#99864b', '#836f37', '#c3ab54', '#93917b', '#c5b98d', '#685825', '#6e755a', '#2d2418'],
            'mondrian' => ['#e8e7e4', '#e22f2a', '#d82519', '#0d1211', '#035b9a', '#cab6a6', '#3d2928', '#ecd971'],
            'greys' => ['#ffffff', '#eeeeee', '#999999', '#333333'],
            'black' => ['#000000', '#050505', '#0a0a0a'],
            'single' => ['#336699'],
        ];
        $out = [];
        foreach ($sets as $name => $cols) {
            foreach (['light', 'dark'] as $mode) {
                $out["$name $mode"] = [$cols, $mode];
            }
        }

        return $out;
    }

    #[DataProvider('sources')]
    public function testBuiltThemeIsReadable(array $colors, string $mode): void
    {
        $t = ThemeBuilder::fromDominant($colors, $mode);

        foreach (['bg', 'surface'] as $ground) {
            self::assertGreaterThanOrEqual(7.0, Color::contrast($t['text'], $t[$ground]), "text on $ground");
            self::assertGreaterThanOrEqual(4.5, Color::contrast($t['brand'], $t[$ground]), "brand on $ground");
            self::assertGreaterThanOrEqual(4.5, Color::contrast($t['link'], $t[$ground]), "link on $ground");
        }
        self::assertGreaterThanOrEqual(4.5, Color::contrast(Color::ink($t['brand']), $t['brand']), 'ink on brand');
        self::assertGreaterThanOrEqual(3.0, Color::contrast($t['accent'], $t['bg']), 'accent on bg');
        self::assertSame($mode === 'dark', Color::luminance($t['bg']) < 0.2, 'mode decides light or dark ground');
    }

    public function testKeepsTheCharacterOfTheImage(): void
    {
        $dark = ThemeBuilder::fromDominant(['#171d20', '#5b7392', '#3c527e', '#7b92a8'], 'dark');
        [$h] = Color::hsl($dark['brand']);
        self::assertEqualsWithDelta(215, $h, 25, 'the blues of the painting drive the highlight');
    }

    public function testAdaptFitsAnEstablishedPaletteAndKeepsItsHues(): void
    {
        // Solarized Light as published: the text and accents are too faint for our rules
        $solarized = ['mode' => 'light', 'bg' => '#fdf6e3', 'surface' => '#eee8d5', 'text' => '#657b83', 'brand' => '#268bd2', 'link' => '#2aa198', 'accent' => '#cb4b16'];
        $t = ThemeBuilder::adapt($solarized);

        self::assertSame('#fdf6e3', $t['bg']);
        foreach (['bg', 'surface'] as $g) {
            self::assertGreaterThanOrEqual(7.0, Color::contrast($t['text'], $t[$g]));
            self::assertGreaterThanOrEqual(4.5, Color::contrast($t['brand'], $t[$g]));
            self::assertGreaterThanOrEqual(4.5, Color::contrast($t['link'], $t[$g]));
        }
        foreach (['text', 'brand', 'link', 'accent'] as $role) {
            self::assertEqualsWithDelta(Color::hsl($solarized[$role])[0], Color::hsl($t[$role])[0], 6, "$role keeps its hue");
        }
    }
}
