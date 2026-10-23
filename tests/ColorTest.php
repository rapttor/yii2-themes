<?php

declare(strict_types=1);

namespace rapttor\themes\tests;

use rapttor\themes\Color;
use PHPUnit\Framework\TestCase;

final class ColorTest extends TestCase
{
    public function testContrastKnownValues(): void
    {
        self::assertEqualsWithDelta(21.0, Color::contrast('#000000', '#ffffff'), 0.01);
        self::assertEqualsWithDelta(1.0, Color::contrast('#336699', '#336699'), 0.001);
    }

    public function testHslRoundTrip(): void
    {
        foreach (['#1b4d32', '#bb5f2a', '#6a52b3', '#ffffff', '#000000', '#808080'] as $hex) {
            [$h, $s, $l] = Color::hsl($hex);
            $back = Color::rgb(Color::fromHsl($h, $s, $l));
            foreach (Color::rgb($hex) as $i => $v) {
                self::assertEqualsWithDelta($v, $back[$i], 1, $hex);
            }
        }
    }

    public function testMixMatchesCssColorMix(): void
    {
        self::assertSame('#808080', Color::mix('#ffffff', 0.5, '#000000'));
        self::assertSame('#fbfaf7', Color::mix('#123456', 0.0, '#fbfaf7'));
    }

    public function testHueDistanceWraps(): void
    {
        self::assertEqualsWithDelta(20.0, Color::hueDistance(350, 10), 0.001);
        self::assertEqualsWithDelta(180.0, Color::hueDistance(0, 180), 0.001);
    }
}
