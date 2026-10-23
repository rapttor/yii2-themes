<?php

declare(strict_types=1);

namespace rapttor\themes;

/** Small colour toolbox: hex <-> HSL, WCAG contrast, sRGB mixing. All hex values are '#rrggbb' (lower case). */
final class Color
{
    /** @return array{0: int, 1: int, 2: int} */
    public static function rgb(string $hex): array
    {
        $hex = ltrim($hex, '#');

        return [(int) hexdec(substr($hex, 0, 2)), (int) hexdec(substr($hex, 2, 2)), (int) hexdec(substr($hex, 4, 2))];
    }

    public static function hex(int $r, int $g, int $b): string
    {
        return sprintf('#%02x%02x%02x', max(0, min(255, $r)), max(0, min(255, $g)), max(0, min(255, $b)));
    }

    /** @return array{0: float, 1: float, 2: float} hue 0..360, saturation 0..1, lightness 0..1 */
    public static function hsl(string $hex): array
    {
        [$r, $g, $b] = array_map(static fn (int $v): float => $v / 255, self::rgb($hex));
        $max = max($r, $g, $b);
        $min = min($r, $g, $b);
        $l = ($max + $min) / 2;
        if ($max === $min) {
            return [0.0, 0.0, $l];
        }
        $d = $max - $min;
        $s = $l > 0.5 ? $d / (2 - $max - $min) : $d / ($max + $min);
        $h = match (true) {
            $max === $r => fmod(($g - $b) / $d + ($g < $b ? 6 : 0), 6),
            $max === $g => ($b - $r) / $d + 2,
            default => ($r - $g) / $d + 4,
        };

        return [$h * 60, $s, $l];
    }

    public static function fromHsl(float $h, float $s, float $l): string
    {
        $h = fmod(fmod($h, 360) + 360, 360) / 360;
        $s = max(0.0, min(1.0, $s));
        $l = max(0.0, min(1.0, $l));
        if ($s === 0.0) {
            $v = (int) round($l * 255);

            return self::hex($v, $v, $v);
        }
        $q = $l < 0.5 ? $l * (1 + $s) : $l + $s - $l * $s;
        $p = 2 * $l - $q;
        $channel = static function (float $t) use ($p, $q): int {
            $t = $t < 0 ? $t + 1 : ($t > 1 ? $t - 1 : $t);
            $v = match (true) {
                $t < 1 / 6 => $p + ($q - $p) * 6 * $t,
                $t < 1 / 2 => $q,
                $t < 2 / 3 => $p + ($q - $p) * (2 / 3 - $t) * 6,
                default => $p,
            };

            return (int) round($v * 255);
        };

        return self::hex($channel($h + 1 / 3), $channel($h), $channel($h - 1 / 3));
    }

    /** WCAG relative luminance. */
    public static function luminance(string $hex): float
    {
        [$r, $g, $b] = array_map(static function (int $v): float {
            $c = $v / 255;

            return $c <= 0.03928 ? $c / 12.92 : (($c + 0.055) / 1.055) ** 2.4;
        }, self::rgb($hex));

        return 0.2126 * $r + 0.7152 * $g + 0.0722 * $b;
    }

    /** WCAG contrast ratio, 1..21. */
    public static function contrast(string $a, string $b): float
    {
        $la = self::luminance($a);
        $lb = self::luminance($b);

        return (max($la, $lb) + 0.05) / (min($la, $lb) + 0.05);
    }

    /** Same as CSS color-mix(in srgb, $a $share, $b): $share (0..1) of $a. */
    public static function mix(string $a, float $share, string $b): string
    {
        $ca = self::rgb($a);
        $cb = self::rgb($b);

        return self::hex(
            (int) round($ca[0] * $share + $cb[0] * (1 - $share)),
            (int) round($ca[1] * $share + $cb[1] * (1 - $share)),
            (int) round($ca[2] * $share + $cb[2] * (1 - $share)),
        );
    }

    /** Circular distance between two hues, 0..180. */
    public static function hueDistance(float $a, float $b): float
    {
        return min(fmod(abs($a - $b), 360), 360 - fmod(abs($a - $b), 360));
    }

    /** Same hue and saturation, new lightness. */
    public static function withLightness(string $hex, float $l, ?float $maxSaturation = null): string
    {
        [$h, $s] = self::hsl($hex);

        return self::fromHsl($h, $maxSaturation === null ? $s : min($s, $maxSaturation), $l);
    }

    /** Black or white, whichever reads better on $background. */
    public static function ink(string $background): string
    {
        return self::contrast('#ffffff', $background) >= self::contrast('#0a0a0a', $background) ? '#ffffff' : '#0a0a0a';
    }
}
