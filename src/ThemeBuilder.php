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

        // character of the surfaces: the hue of the image's own ground - its shadow colour for a dark theme, its lightest
        // tint for a light one - because that is what differs between images (most palettes share the same mid-tones).
        // It is laid over the page at a visible but readable strength; muted images get a gentler tint than saturated ones.
        usort($cols, static fn (array $a, array $b): int => $a['l'] <=> $b['l']);
        $chromatic = array_values(array_filter($cols, static fn (array $c): bool => $c['s'] >= 0.12 && $c['l'] > 0.04 && $c['l'] < 0.95));
        $pool = array_values(array_filter($chromatic, static fn (array $c): bool => $c['w'] >= 0.015 && ($dark ? $c['l'] <= 0.5 : $c['l'] >= 0.55)));
        $chromatic = $pool !== [] ? ($dark ? $pool : array_reverse($pool)) : $chromatic; // darkest (dark) or lightest (light) first
        if ($pool === [] && $chromatic !== []) {
            usort($chromatic, static fn (array $a, array $b): int => ($b['s'] * sqrt($b['w'])) <=> ($a['s'] * sqrt($a['w'])));
        }
        if ($chromatic !== []) {
            $groundHue = $chromatic[0]['h'];
            $gs = $dark ? 0.30 + 0.30 * min(1.0, $chromatic[0]['s'] / 0.6) : 0.40 + 0.45 * min(1.0, $chromatic[0]['s'] / 0.6);
        } else { // greys and blacks: keep whatever faint tint the extreme colour has
            $extreme = $dark ? $cols[0] : $cols[count($cols) - 1];
            $groundHue = $extreme['h'];
            $gs = min($extreme['s'], 0.12);
        }
        $bg = Color::fromHsl($groundHue, $gs, $dark ? 0.105 : 0.9);
        $surface = Color::fromHsl($groundHue, $gs, $dark ? 0.15 : 0.965);
        $text = Color::fromHsl($groundHue, min($gs, 0.3), $dark ? 0.93 : 0.12);
        $ground = ['h' => $groundHue];

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
     * A complete theme from one colour the user picked: that colour becomes the highlight (and tints the page), a nearby hue
     * the link, a far hue the accent. Greys give a neutral theme. Guarantees as {@see fromDominant()}.
     *
     * @return array{bg: string, surface: string, text: string, brand: string, link: string, accent: string}
     */
    public static function fromColor(string $hex, string $mode): array
    {
        $dark = $mode === 'dark';
        [$h, $s] = Color::hsl($hex);
        if ($s < 0.1) { // a grey: a neutral theme, no tint
            $bg = Color::fromHsl(0, 0, $dark ? 0.08 : 0.96);
            $surface = Color::fromHsl(0, 0, $dark ? 0.12 : 1.0);
            $text = Color::fromHsl(0, 0, $dark ? 0.94 : 0.1);
            $brand = self::fit(0, 0, $dark, [$bg, $surface], $dark ? 7.0 : 4.5, true);
            $accent = self::fit(210, 0.5, $dark, [$bg], 3.0, false);

            return ['bg' => $bg, 'surface' => $surface, 'text' => $text, 'brand' => $brand, 'link' => $brand, 'accent' => $accent];
        }
        $gs = $dark ? 0.32 : 0.45;
        $bg = Color::fromHsl($h, $gs, $dark ? 0.1 : 0.93);
        $surface = Color::fromHsl($h, $gs, $dark ? 0.145 : 0.975);
        $text = Color::fromHsl($h, min($gs, 0.3), $dark ? 0.93 : 0.12);
        $sat = max(0.45, min(0.9, $s));
        $brand = self::fit($h, $sat, $dark, [$bg, $surface], $dark ? 7.0 : 4.5, true);
        $link = self::fit($h + 22, $sat, $dark, [$bg, $surface], 5.5, false);
        $accent = self::fit($h + 160, max(0.5, $sat), $dark, [$bg], 3.0, false);

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
