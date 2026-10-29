<?php

declare(strict_types=1);

namespace rapttor\themes;

/**
 * The background catalogue and everything derived from a {@see Background}: validation, the CSS variables, the palette it carries.
 *
 *   label  name in the picker
 *   css    static / gradient: the value of `background` (layers allowed); anim: a still thumbnail of the effect
 *   theme  optional theme id whose colours the background carries (used when the user ticks "use this background's colours")
 *
 * Animated effects are implemented in assets/bg/<id>.js. Photos come from Unsplash (see {@see UnsplashClient}); only
 * images.unsplash.com paths are accepted, never free URLs.
 */
final class Backgrounds
{
    public const STATIC = [
        'blueprint' => ['label' => 'Blueprint', 'theme' => 'blueprint', 'css' => 'linear-gradient(rgba(255,255,255,.16) 1px,transparent 1px) 0 0/48px 48px,linear-gradient(90deg,rgba(255,255,255,.16) 1px,transparent 1px) 0 0/48px 48px,linear-gradient(rgba(255,255,255,.07) 1px,transparent 1px) 0 0/12px 12px,linear-gradient(90deg,rgba(255,255,255,.07) 1px,transparent 1px) 0 0/12px 12px,#0b3a66'],
        'chalkboard' => ['label' => 'Chalkboard', 'theme' => 'chalkboard', 'css' => 'radial-gradient(ellipse at 30% 20%,rgba(255,255,255,.09),transparent 55%),radial-gradient(ellipse at 75% 85%,rgba(255,255,255,.06),transparent 50%),repeating-linear-gradient(8deg,rgba(255,255,255,.018) 0 2px,transparent 2px 7px),#22392f'],
        'graphite' => ['label' => 'Graphite', 'theme' => 'graphite', 'css' => 'repeating-linear-gradient(135deg,rgba(255,255,255,.02) 0 1px,transparent 1px 4px),linear-gradient(145deg,#2d3138,#1c1f23)'],
        'graph-paper' => ['label' => 'Graph paper', 'theme' => 'paper', 'css' => 'linear-gradient(rgba(60,90,140,.16) 1px,transparent 1px) 0 0/32px 32px,linear-gradient(90deg,rgba(60,90,140,.16) 1px,transparent 1px) 0 0/32px 32px,linear-gradient(rgba(60,90,140,.07) 1px,transparent 1px) 0 0/8px 8px,linear-gradient(90deg,rgba(60,90,140,.07) 1px,transparent 1px) 0 0/8px 8px,#f6efdc'],
        'dot-grid' => ['label' => 'Dot grid', 'theme' => 'mono-light', 'css' => 'radial-gradient(rgba(0,0,0,.22) 1.2px,transparent 1.6px) 0 0/22px 22px,#f4f4f2'],
        'midnight-sky' => ['label' => 'Midnight', 'theme' => 'midnight', 'css' => 'radial-gradient(ellipse at 50% 120%,#25356b,transparent 60%),linear-gradient(#070b1d,#0e1635)'],
    ];

    public const GRADIENTS = [
        'sunrise' => ['label' => 'Sunrise', 'theme' => 'sunrise', 'css' => 'linear-gradient(160deg,#ffd7a8,#ff9aa2 55%,#b68bd6)'],
        'dusk' => ['label' => 'Dusk', 'theme' => 'dusk', 'css' => 'linear-gradient(160deg,#2a1b4d,#7a3b73 55%,#e8795a)'],
        'ocean-deep' => ['label' => 'Deep ocean', 'theme' => 'ocean', 'css' => 'linear-gradient(160deg,#0a2540,#0e5a7a 60%,#2db3b0)'],
        'forest-mist' => ['label' => 'Forest mist', 'theme' => 'forest', 'css' => 'linear-gradient(160deg,#0f2a1c,#27533b 60%,#7fae8a)'],
        'lavender' => ['label' => 'Lavender', 'theme' => 'glass-frost', 'css' => 'linear-gradient(160deg,#e6defa,#c7d4f7 60%,#bfe6f5)'],
        'peach' => ['label' => 'Peach', 'theme' => 'glass-rose', 'css' => 'linear-gradient(160deg,#fff0e3,#ffd1c7 60%,#f4b6c9)'],
        'steel' => ['label' => 'Steel', 'theme' => 'slate', 'css' => 'linear-gradient(160deg,#1f262e,#34404d 60%,#56677a)'],
    ];

    public const ANIMATED = [
        'aurora' => ['label' => 'Aurora', 'group' => 'nature', 'theme' => 'aurora', 'css' => 'linear-gradient(160deg,#071a1f,#0f5a55 45%,#5b2d8f)'],
        'gradient-flow' => ['label' => 'Gradient flow', 'group' => 'abstract', 'css' => 'linear-gradient(120deg,#4338ca,#db2777 50%,#f59e0b)'],
        'blobs' => ['label' => 'Liquid blobs', 'group' => 'abstract', 'css' => 'radial-gradient(circle at 25% 30%,#7c3aed,transparent 45%),radial-gradient(circle at 75% 70%,#0ea5e9,transparent 45%),#111827'],
        'waves' => ['label' => 'Waves', 'group' => 'nature', 'theme' => 'ocean', 'css' => 'linear-gradient(#0e5a7a,#0a2540)'],
        'bubbles' => ['label' => 'Bubbles', 'group' => 'nature', 'theme' => 'summer', 'css' => 'radial-gradient(circle at 30% 70%,rgba(255,255,255,.5) 0 6%,transparent 7%),radial-gradient(circle at 65% 40%,rgba(255,255,255,.4) 0 9%,transparent 10%),linear-gradient(#38bdf8,#0369a1)'],
        'stars' => ['label' => 'Night sky', 'group' => 'space', 'theme' => 'midnight', 'css' => 'radial-gradient(1.5px 1.5px at 20% 30%,#fff,transparent),radial-gradient(1.5px 1.5px at 70% 60%,#fff,transparent),radial-gradient(2px 2px at 45% 80%,#fff,transparent),linear-gradient(#050816,#0e1635)'],
        'starfield' => ['label' => 'Starfield', 'group' => 'space', 'theme' => 'midnight', 'css' => 'radial-gradient(circle at 50% 50%,#2b3a7a,#050816 70%)'],
        'snow' => ['label' => 'Snowfall', 'group' => 'nature', 'theme' => 'winter', 'css' => 'radial-gradient(3px 3px at 25% 25%,#fff,transparent),radial-gradient(3px 3px at 60% 55%,#fff,transparent),radial-gradient(2px 2px at 80% 20%,#fff,transparent),linear-gradient(#35506b,#1b2a3b)'],
        'rain' => ['label' => 'Rain', 'group' => 'nature', 'theme' => 'slate', 'css' => 'repeating-linear-gradient(100deg,rgba(255,255,255,.12) 0 1px,transparent 1px 14px),linear-gradient(#2a3441,#171d25)'],
        'fireflies' => ['label' => 'Fireflies', 'group' => 'sparks', 'theme' => 'forest', 'css' => 'radial-gradient(4px 4px at 30% 40%,#f6e27a,transparent),radial-gradient(3px 3px at 65% 65%,#f6e27a,transparent),radial-gradient(3px 3px at 80% 25%,#f6e27a,transparent),linear-gradient(#0f1d14,#08110b)'],
        'particles' => ['label' => 'Particle network', 'group' => 'tech', 'css' => 'radial-gradient(3px 3px at 20% 30%,#fff,transparent),radial-gradient(3px 3px at 55% 60%,#fff,transparent),radial-gradient(3px 3px at 80% 30%,#fff,transparent),linear-gradient(#0f172a,#1e293b)'],
        'matrix' => ['label' => 'Digital rain', 'group' => 'tech', 'theme' => 'terminal-green', 'css' => 'repeating-linear-gradient(90deg,rgba(60,255,120,.35) 0 2px,transparent 2px 14px),linear-gradient(#000,#021208)'],
        'ripples' => ['label' => 'Ripples', 'group' => 'abstract', 'theme' => 'ocean', 'css' => 'repeating-radial-gradient(circle at 50% 50%,rgba(255,255,255,.2) 0 2px,transparent 2px 22px),linear-gradient(#0e5a7a,#0a2540)'],
        'clouds' => ['label' => 'Clouds', 'group' => 'nature', 'theme' => 'glass-ocean', 'css' => 'radial-gradient(ellipse at 30% 40%,rgba(255,255,255,.8),transparent 45%),radial-gradient(ellipse at 70% 65%,rgba(255,255,255,.7),transparent 45%),linear-gradient(#7cc3f0,#d6ecf3)'],
        'contours' => ['label' => 'Contour lines', 'group' => 'abstract', 'theme' => 'desert', 'css' => 'repeating-radial-gradient(ellipse at 40% 60%,rgba(90,60,20,.3) 0 1.5px,transparent 1.5px 16px),#e9dcc0'],
        'neon-grid' => ['label' => 'Neon grid', 'group' => 'tech', 'theme' => 'synthwave', 'css' => 'linear-gradient(rgba(255,60,200,.5) 1px,transparent 1px) 0 100%/40px 40px,linear-gradient(90deg,rgba(255,60,200,.5) 1px,transparent 1px) 0 0/40px 40px,linear-gradient(#1a0536,#3b0a5c)'],
        'embers' => ['label' => 'Embers', 'group' => 'sparks', 'theme' => 'volcano', 'css' => 'radial-gradient(3px 3px at 30% 70%,#ffb347,transparent),radial-gradient(3px 3px at 60% 40%,#ff7043,transparent),radial-gradient(2px 2px at 78% 80%,#ffb347,transparent),linear-gradient(#1c0a06,#3a1308)'],
        'petals' => ['label' => 'Petals', 'group' => 'nature', 'theme' => 'spring', 'css' => 'radial-gradient(ellipse 6px 3px at 30% 30%,#ffc2d4,transparent),radial-gradient(ellipse 6px 3px at 65% 55%,#ffc2d4,transparent),radial-gradient(ellipse 6px 3px at 80% 25%,#ffc2d4,transparent),linear-gradient(#e8f5e1,#c9e8c5)'],
        'plasma' => ['label' => 'Plasma', 'group' => 'abstract', 'theme' => 'synthwave', 'css' => 'radial-gradient(circle at 30% 30%,#ff3cac,transparent 50%),radial-gradient(circle at 70% 70%,#2b86c5,transparent 50%),#42275a'],
        'confetti-dust' => ['label' => 'Floating dust', 'group' => 'sparks', 'theme' => 'golden-hour', 'css' => 'radial-gradient(circle at 25% 35%,rgba(255,220,150,.6) 0 8%,transparent 9%),radial-gradient(circle at 60% 60%,rgba(255,180,120,.5) 0 11%,transparent 12%),linear-gradient(#3a2a1a,#1a120a)'],
        'birds' => ['label' => 'Birds', 'group' => 'nature', 'theme' => 'sunrise', 'css' => 'linear-gradient(#8ec5e8,#f3e6d0)'],
        'fog' => ['label' => 'Fog', 'group' => 'nature', 'theme' => 'slate', 'css' => 'radial-gradient(ellipse at 30% 60%,rgba(255,255,255,.35),transparent 60%),radial-gradient(ellipse at 75% 40%,rgba(255,255,255,.25),transparent 55%),linear-gradient(#3a4452,#1f252d)'],
        'kelp' => ['label' => 'Kelp', 'group' => 'nature', 'theme' => 'ocean', 'css' => 'repeating-linear-gradient(80deg,rgba(40,160,110,.55) 0 3px,transparent 3px 16px) 0 100%/100% 60% no-repeat,linear-gradient(#0e5a7a,#062a40)'],
        'sunbeams' => ['label' => 'Sunbeams', 'group' => 'nature', 'theme' => 'golden-hour', 'css' => 'conic-gradient(from 200deg at 0% 0%,transparent 0 10%,rgba(255,230,160,.5) 14%,transparent 22%,rgba(255,230,160,.35) 28%,transparent 38%),linear-gradient(#f0b46a,#7a3b2a)'],
        'swirl' => ['label' => 'Swirl', 'group' => 'abstract', 'theme' => 'aurora', 'css' => 'conic-gradient(from 0deg at 50% 50%,#1e3a8a,#7c3aed,#db2777,#f59e0b,#1e3a8a)'],
        'ribbons' => ['label' => 'Ribbons', 'group' => 'abstract', 'theme' => 'glass-aurora', 'css' => 'repeating-linear-gradient(170deg,rgba(255,255,255,.18) 0 2px,transparent 2px 10px),linear-gradient(120deg,#0ea5e9,#8b5cf6 60%,#ec4899)'],
        'rings' => ['label' => 'Rings', 'group' => 'abstract', 'theme' => 'midnight', 'css' => 'repeating-radial-gradient(circle at 50% 50%,rgba(120,200,255,.5) 0 2px,transparent 2px 18px),#0a1830'],
        'low-poly' => ['label' => 'Low poly', 'group' => 'abstract', 'theme' => 'glass-frost', 'css' => 'linear-gradient(135deg,rgba(255,255,255,.25) 25%,transparent 25% 50%,rgba(0,0,0,.12) 50% 75%,transparent 75%) 0 0/36px 36px,linear-gradient(135deg,#4f6bed,#8f5bd6)'],
        'dots-wave' => ['label' => 'Dot wave', 'group' => 'tech', 'theme' => 'mono-dark', 'css' => 'radial-gradient(rgba(255,255,255,.7) 2px,transparent 2.5px) 0 0/20px 20px,#0f172a'],
        'hex-grid' => ['label' => 'Hex grid', 'group' => 'tech', 'theme' => 'tokyo-night', 'css' => 'repeating-linear-gradient(60deg,rgba(120,180,255,.2) 0 1px,transparent 1px 22px),repeating-linear-gradient(-60deg,rgba(120,180,255,.2) 0 1px,transparent 1px 22px),#0b1226'],
        'circuit' => ['label' => 'Circuit', 'group' => 'tech', 'theme' => 'terminal-green', 'css' => 'linear-gradient(rgba(60,255,160,.25) 2px,transparent 2px) 0 0/40px 40px,linear-gradient(90deg,rgba(60,255,160,.25) 2px,transparent 2px) 0 0/40px 40px,#04140f'],
        'galaxy' => ['label' => 'Galaxy', 'group' => 'space', 'theme' => 'midnight', 'css' => 'radial-gradient(circle at 50% 50%,#ffd9a8 0 3%,#7a5bd6 12%,transparent 55%),#070a1c'],
        'meteors' => ['label' => 'Meteors', 'group' => 'space', 'theme' => 'midnight', 'css' => 'linear-gradient(115deg,transparent 40%,rgba(255,255,255,.8) 41%,transparent 42%),radial-gradient(1.5px 1.5px at 25% 30%,#fff,transparent),radial-gradient(1.5px 1.5px at 75% 65%,#fff,transparent),linear-gradient(#050816,#101a3c)'],
        'orbits' => ['label' => 'Orbits', 'group' => 'space', 'theme' => 'blueprint', 'css' => 'repeating-radial-gradient(ellipse 60% 40% at 50% 50%,rgba(255,255,255,.3) 0 1px,transparent 1px 24px),#0b2b4a'],
        'fireworks' => ['label' => 'Fireworks', 'group' => 'sparks', 'theme' => 'synthwave', 'css' => 'radial-gradient(circle at 30% 35%,#ffd36a 0 2%,transparent 14%),radial-gradient(circle at 70% 55%,#ff5fa2 0 2%,transparent 14%),#0a0a1f'],
        'squares' => ['label' => 'Squares', 'group' => 'sparks', 'theme' => 'glass-sunset', 'css' => 'linear-gradient(45deg,rgba(255,255,255,.2) 0 12%,transparent 12%) 20% 70%/40px 40px no-repeat,linear-gradient(45deg,rgba(255,255,255,.15) 0 12%,transparent 12%) 70% 30%/60px 60px no-repeat,linear-gradient(#5b2a86,#e8795a)'],
        'pointer-glow' => ['label' => 'Pointer glow', 'group' => 'abstract', 'theme' => 'glass-aurora', 'css' => 'radial-gradient(circle at 60% 40%,rgba(120,220,255,.7),transparent 45%),radial-gradient(circle at 35% 65%,rgba(180,120,255,.5),transparent 50%),#0b1a2a'],
        'scroll-hue' => ['label' => 'Scroll hue', 'group' => 'abstract', 'theme' => 'glass-sunset', 'css' => 'linear-gradient(200deg,#6d28d9,#db2777 45%,#f59e0b 80%,#10b981)'],
        'wave-gradient' => ['label' => 'Gradient sea', 'group' => 'abstract', 'theme' => 'glass-ocean', 'css' => 'radial-gradient(ellipse 120% 40% at 50% 105%,rgba(255,255,255,.35),transparent 70%),radial-gradient(ellipse 90% 30% at 30% 100%,rgba(255,255,255,.25),transparent 70%),linear-gradient(#38bdf8,#6366f1 55%,#a855f7)'],
        'psychedelic' => ['label' => 'Psychedelic', 'group' => 'abstract', 'theme' => 'synthwave', 'css' => 'repeating-radial-gradient(circle at 50% 50%,#ff3cac 0 6px,#784ba0 6px 12px,#2b86c5 12px 18px)'],
        'prism-currents' => ['label' => 'Prism currents', 'group' => 'abstract', 'theme' => 'aurora', 'css' => 'conic-gradient(from 90deg at 40% 60%,#00e5ff,#7c4dff,#ff4081,#ffd740,#00e5ff)'],
        'jellyfish' => ['label' => 'Jellyfish', 'group' => 'nature', 'theme' => 'ocean', 'css' => 'radial-gradient(ellipse 14% 10% at 35% 40%,rgba(255,170,255,.75),transparent),radial-gradient(ellipse 10% 7% at 68% 62%,rgba(150,230,255,.7),transparent),linear-gradient(#08304a,#031422)'],
        'kaleidoscope' => ['label' => 'Kaleidoscope', 'group' => 'abstract', 'theme' => 'glass-rose', 'css' => 'conic-gradient(from 0deg at 50% 50%,#f472b6,#a78bfa,#38bdf8,#34d399,#fbbf24,#f472b6)'],
        'tunnel' => ['label' => 'Tunnel', 'group' => 'space', 'theme' => 'midnight', 'css' => 'repeating-radial-gradient(circle at 50% 50%,rgba(120,180,255,.55) 0 2px,transparent 2px 26px),radial-gradient(circle at 50% 50%,#1b2b66,#050816 70%)'],
        'terrain' => ['label' => 'Terrain', 'group' => 'tech', 'theme' => 'synthwave', 'css' => 'linear-gradient(transparent 55%,rgba(255,60,200,.6) 56%,transparent 58%),repeating-linear-gradient(90deg,rgba(255,60,200,.35) 0 1px,transparent 1px 28px) 0 100%/100% 45% no-repeat,linear-gradient(#1a0536,#7a1f6b 60%,#ff7a59)'],
        'equalizer' => ['label' => 'Equalizer', 'group' => 'tech', 'theme' => 'tokyo-night', 'css' => 'repeating-linear-gradient(90deg,rgba(125,207,255,.8) 0 6px,transparent 6px 14px) 0 100%/100% 40% no-repeat,linear-gradient(#0b1226,#1a2250)'],
        'lightning-storm' => ['label' => 'Storm', 'group' => 'nature', 'theme' => 'slate', 'css' => 'radial-gradient(ellipse at 70% 20%,rgba(200,215,255,.55),transparent 35%),linear-gradient(#1a2130,#0b0f18)'],
        'spirograph' => ['label' => 'Spirograph', 'group' => 'abstract', 'theme' => 'glass-frost', 'css' => 'repeating-conic-gradient(from 0deg at 50% 50%,rgba(99,102,241,.55) 0 8deg,transparent 8deg 20deg),radial-gradient(circle,#eef2ff,#c7d2fe)'],
    ];

    /** Categories of the animated backgrounds (chips in the Live tab); an item's `group` is one of these ids. */
    public const ANIMATED_GROUPS = ['nature' => 'Nature', 'space' => 'Space', 'abstract' => 'Abstract', 'tech' => 'Tech', 'sparks' => 'Sparks'];

    /** Quick searches shown above the photo results. */
    public const PHOTO_TOPICS = ['nature', 'abstract', 'texture', 'city', 'space', 'minimal', 'ocean', 'mountains'];

    /** @var array<string, array<string, array<string, mixed>>> kind => id => item, with the host's additions merged in */
    private array $items;

    /** @param array<string, array<string, array<string, mixed>|null>> $extra kind (static|gradient|anim) => id => item (or null to remove a built-in) */
    public function __construct(array $extra = [])
    {
        $this->items = ['static' => self::STATIC, 'gradient' => self::GRADIENTS, 'anim' => self::ANIMATED];
        foreach ($extra as $kind => $list) {
            if (isset($this->items[$kind])) {
                $this->items[$kind] = array_filter(array_replace($this->items[$kind], $list), static fn ($v): bool => $v !== null);
            }
        }
    }

    /** @return array<string, array<string, mixed>> */
    public function items(string $kind): array
    {
        return $this->items[$kind] ?? [];
    }

    public function has(string $kind, string $id): bool
    {
        return isset($this->items[$kind][$id]);
    }

    /** Parses and validates a stored value; null (= no background) for anything that is not a valid one. */
    public function parse(?string $value): ?Background
    {
        if (!is_string($value) || $value === '' || strlen($value) > 700 || ($a = json_decode($value, true)) === null || !is_array($a)) {
            return null;
        }
        $kind = $a['k'] ?? null;
        $id = is_string($a['id'] ?? null) ? $a['id'] : '';
        $hex = static fn ($v): ?string => is_string($v) && preg_match('/^#[0-9a-f]{6}$/i', $v) ? strtolower($v) : null;
        $over = in_array($a['o'] ?? 'n', ['n', 'w', 'b'], true) ? $a['o'] ?? 'n' : 'n';
        $common = ['overlay' => $over, 'alpha' => max(0, min(90, (int) ($a['p'] ?? 0))), 'palette' => !empty($a['pal']), 'liquid' => max(0, min(70, (int) ($a['l'] ?? 0)))];
        switch ($kind) {
            case 'static':
            case 'anim':
                return $this->has($kind, $id) ? new Background($kind, $id, ...$common) : null;
            case 'gradient':
                if ($id === 'custom') {
                    $c = $hex($a['c'] ?? null);
                    $c2 = $hex($a['c2'] ?? null);

                    return $c !== null && $c2 !== null ? new Background('gradient', 'custom', $c, $c2, ((int) ($a['a'] ?? 135)) % 360, ...$common) : null;
                }

                return $this->has('gradient', $id) ? new Background('gradient', $id, ...$common) : null;
            case 'solid':
                $c = $hex($a['c'] ?? null);

                return $c !== null ? new Background('solid', '', $c, ...$common) : null;
            case 'img':
                $u = $a['u'] ?? null;
                if (!is_string($u) || !preg_match('/^[A-Za-z0-9_-]{6,120}$/', $u)) {
                    return null;
                }
                $pid = is_string($a['pid'] ?? null) && preg_match('/^[A-Za-z0-9_-]{4,40}$/', $a['pid']) ? $a['pid'] : null;
                $user = is_string($a['un'] ?? null) && preg_match('/^[A-Za-z0-9_.-]{1,40}$/', $a['un']) ? $a['un'] : null;
                $by = is_string($a['by'] ?? null) ? mb_substr(trim(preg_replace('/[\x00-\x1f|<>"\'&]/u', '', $a['by']) ?? ''), 0, 60) : null;

                $colors = [];
                foreach (is_array($a['pc'] ?? null) ? array_slice($a['pc'], 0, 5) : [] as $pc) {
                    if (($h = $hex($pc)) !== null) {
                        $colors[] = $h;
                    }
                }
                $colors = count($colors) > 1 ? $colors : [];

                return new Background('img', '', $hex($a['c'] ?? null), null, 135, $u, $pid, $by === '' ? null : $by, $user, ...$common, colors: $colors, paletteMode: ($a['pm'] ?? 'dark') === 'light' ? 'light' : 'dark');
        }

        return null;
    }

    /** `background` value for the still layer (`--tbg-image`). */
    public function image(Background $b): string
    {
        switch ($b->kind) {
            case 'static':
            case 'gradient':
                if ($b->id === 'custom') {
                    return sprintf('linear-gradient(%ddeg,%s,%s)', $b->angle, $b->color, $b->color2);
                }

                return (string) $this->items[$b->kind][$b->id]['css'];
            case 'solid':
                return (string) $b->color;
            case 'img':
                return sprintf('url("https://images.unsplash.com/%s?auto=format&fit=crop&w=1800&q=70") center/cover no-repeat,%s', $b->photo, $b->color ?? '#222222');
        }

        return 'var(--bg)'; // animated: the effect draws on top of the theme's own background
    }

    /** `rgba()` of the readability overlay, or `transparent`. */
    public function overlay(Background $b): string
    {
        if ($b->overlay === 'n' || $b->alpha <= 0) {
            return 'transparent';
        }

        return sprintf('rgba(%s,%s)', $b->overlay === 'w' ? '255,255,255' : '0,0,0', rtrim(rtrim(sprintf('%.2f', $b->alpha / 100), '0'), '.'));
    }

    /**
     * The theme the background carries: ['id' => theme id, 'custom' => value|null], or null when it has none (photos, animations
     * without a palette). A solid colour or custom gradient yields the user-defined theme built from that colour; a photo with
     * extracted colours yields one built from its dominant colours in its chosen mode (dark or light).
     *
     * @return array{id: string, custom: ?string}|null
     */
    public function palette(Background $b): ?array
    {
        $mode = static fn (string $hex): string => Color::luminance($hex) < 0.3 ? 'dark' : 'light';
        if ($b->kind === 'solid' || ($b->kind === 'gradient' && $b->id === 'custom')) {
            return ['id' => 'custom', 'custom' => Themes::formatCustom($mode((string) $b->color), (string) $b->color)];
        }
        if ($b->kind === 'img') {
            return count($b->colors) > 1 ? ['id' => 'custom', 'custom' => Themes::formatCustom($b->paletteMode, $b->colors)] : null;
        }
        $theme = $this->items[$b->kind][$b->id]['theme'] ?? null;

        return is_string($theme) ? ['id' => $theme, 'custom' => null] : null;
    }

    /** Custom properties for the page: `--tbg-image`, `--tbg-overlay` and, when the interface is liquid, `--tbg-liquid` (opacity of the containers). */
    public function variables(Background $b): string
    {
        return '--tbg-image:' . $this->image($b) . ';--tbg-overlay:' . $this->overlay($b) . ';' . ($b->liquid > 0 ? '--tbg-liquid:' . (100 - $b->liquid) . '%;' : '');
    }

    /** `Photo by Name on Unsplash` credit data for a photo background, else null. @return array{by: string, url: string}|null */
    public function credit(Background $b, string $app): ?array
    {
        if ($b->kind !== 'img' || $b->user === null) {
            return null;
        }

        return ['by' => $b->by ?? $b->user, 'url' => 'https://unsplash.com/@' . rawurlencode($b->user) . '?utm_source=' . rawurlencode($app) . '&utm_medium=referral'];
    }
}
