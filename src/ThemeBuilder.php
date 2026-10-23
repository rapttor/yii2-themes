<?php

declare(strict_types=1);

namespace rapttor\themes;

/**
 * Builds a full, contrast-safe theme from the dominant colours of an image (or any palette), for a chosen mode.
 * The image colours give the character (hue of the background, text tint, highlight, link, accent); the lightness of
 * every role is then fixed so the result is readable whatever the source looked like.
 *
 * Output roles: bg, surface, text, brand (highlight, buttons), link, accent. Guarantees (see tests):
 *   text on bg and surface >= 7:1, brand and link on bg and surface >= 4.5:1, ink on brand >= 4.5:1, accent on bg >= 3:1.
 */
final class ThemeBuilder
{
    /**
     * @param array<int, string|array{hex: string, w?: float}> $dominant colours, most important first
     * @return array{bg: string, surface: string, text: string, brand: string, link: string, accent: string}
     */
    public static function fromDominant(array $dominant, string $mode): array
    {
        $dark = $mode === 'dark';
        $cols = [];
        foreach ($dominant as $i => $d) {
            $hex = '#' . strtolower(ltrim(is_array($d) ? $d['hex'] : $d, '#'));
            [$h, $s, $l] = Color::hsl($hex);
            $cols[] = ['hex' => $hex, 'h' => $h, 's' => $s, 'l' => $l, 'w' => is_array($d) ? (float) ($d['w'] ?? 0.1) : 1 / (1 + $i)];
        }

        // character of the surfaces: hue/saturation of the extreme colour for the mode (darkest for dark, lightest for light)
        usort($cols, static fn (array $a, array $b): int => $a['l'] <=> $b['l']);
        $ground = $dark ? $cols[0] : $cols[count($cols) - 1];
        foreach ($dark ? $cols : array_reverse($cols) as $c) {
            if ($c['w'] >= 0.03) {
                $ground = $c;
                break;
            }
        }
        $inkSource = $dark ? $cols[count($cols) - 1] : $cols[0];

        $gs = min($ground['s'], $dark ? 0.35 : 0.45);
        $bg = Color::fromHsl($ground['h'], $gs, $dark ? 0.075 : 0.95);
        $surface = Color::fromHsl($ground['h'], $gs, $dark ? 0.115 : 0.985);
        $text = Color::fromHsl($inkSource['h'], min($inkSource['s'], 0.25), $dark ? 0.93 : 0.12);

        // vivid colours: the pool for highlight, link and accent
        $vivid = array_values(array_filter($cols, static fn (array $c): bool => $c['s'] >= 0.25 && $c['l'] > 0.12 && $c['l'] < 0.88));
        usort($vivid, static fn (array $a, array $b): int => ($b['s'] * $b['w'] ** 0.25) <=> ($a['s'] * $a['w'] ** 0.25));
        $primary = $vivid[0] ?? ['h' => $ground['h'], 's' => 0.5];
        $brandHue = $primary['h'];
        $brandSat = max(0.4, min(0.85, $primary['s']));
        $brand = self::fit($brandHue, $brandSat, $dark, [$bg, $surface], $dark ? 7.0 : 4.5, true);

        $linkSource = null;
        foreach (array_slice($vivid, 1) as $c) {
            if (Color::hueDistance($c['h'], $brandHue) >= 25) {
                $linkSource = $c;
                break;
            }
        }
        $link = self::fit($linkSource['h'] ?? $brandHue + 12, max(0.4, min(0.85, $linkSource['s'] ?? $brandSat)), $dark, [$bg, $surface], 5.5, false);

        $accentSource = null;
        $far = 0.0;
        foreach ($vivid as $c) {
            $dist = Color::hueDistance($c['h'], $brandHue);
            if ($dist > $far) {
                $far = $dist;
                $accentSource = $c;
            }
        }
        $accent = self::fit($accentSource['h'] ?? $brandHue + 150, max(0.45, min(0.9, $accentSource['s'] ?? 0.6)), $dark, [$bg], 3.0, false);

        return ['bg' => $bg, 'surface' => $surface, 'text' => $text, 'brand' => $brand, 'link' => $link, 'accent' => $accent];
    }

    /**
     * Fits an existing palette (an editor theme, a brand guide) to the readability rules while keeping its hues: bg and
     * surface stay as given, text moves until 7:1 on both, brand and link until 4.5:1 on both, accent until 3:1 on bg.
     *
     * @param array<string, string> $theme needs mode, bg, surface, text, brand, link, accent; other keys are kept
     * @return array<string, string>
     */
    public static function adapt(array $theme): array
    {
        $dark = $theme['mode'] === 'dark';
        $against = [$theme['bg'], $theme['surface']];
        foreach (['text' => [$against, 7.0], 'brand' => [$against, 4.5], 'link' => [$against, 4.5], 'accent' => [[$theme['bg']], 3.0]] as $role => [$grounds, $min]) {
            [$h, $s, $l] = Color::hsl($theme[$role]);
            for ($i = 0; $i < 90; $i++) {
                $c = Color::fromHsl($h, $s, $l);
                $ok = true;
                foreach ($grounds as $g) {
                    $ok = $ok && Color::contrast($c, $g) >= $min;
                }
                if ($ok && $role === 'brand') {
                    $ok = Color::contrast(Color::ink($c), $c) >= 4.5;
                }
                if ($ok) {
                    break;
                }
                $l = max(0.0, min(1.0, $l + ($dark ? 0.01 : -0.01)));
            }
            $theme[$role] = Color::fromHsl($h, $s, $l);
        }

        return $theme;
    }

    /**
     * Moves lightness (up for dark mode, down for light mode) until the colour reaches $min contrast on all $against.
     * $forButton additionally needs readable ink on top (always true for black/white ink at these lightnesses, checked anyway).
     *
     * @param string[] $against
     */
    private static function fit(float $h, float $s, bool $dark, array $against, float $min, bool $forButton): string
    {
        $l = $dark ? 0.6 : 0.42;
        for ($i = 0; $i < 70; $i++) {
            $c = Color::fromHsl($h, $s, $l);
            $ok = true;
            foreach ($against as $bgc) {
                $ok = $ok && Color::contrast($c, $bgc) >= $min;
            }
            if ($ok && $forButton) {
                $ok = Color::contrast(Color::ink($c), $c) >= 4.5;
            }
            if ($ok) {
                return $c;
            }
            $l += $dark ? 0.01 : -0.01;
            $l = max(0.04, min(0.97, $l));
        }

        return Color::fromHsl($h, $s, $l);
    }
}
