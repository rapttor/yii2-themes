<?php

declare(strict_types=1);

/**
 * Regenerates the hand-designed packs of Palettes::THEMES (seasons, times of day, nature, materials, minimal, places).
 * Each theme is designed as six colours with a mood; ThemeBuilder::adapt() then moves only lightness where a readability
 * rule would fail, so hues stay as designed.
 *
 *   php tools/packs.php          prints the rows to paste into src/Palettes.php
 *   php tools/packs.php --app    prints rows for a host app's `themes` config (same design, host groups)
 */

require __DIR__ . '/../src/Color.php';
require __DIR__ . '/../src/ThemeBuilder.php';

use rapttor\themes\ThemeBuilder;

/** group => [id => [label, mode, bg, surface, text, brand, link, accent]] */
$packs = [
    'seasons' => [
        'spring' => ['Spring', 'light', '#eef7e8', '#fbfef8', '#1f3322', '#3c9a4a', '#2f7fa0', '#e8709a'],
        'summer' => ['Summer', 'light', '#fff6d6', '#fffdf0', '#3a2a0a', '#e08a00', '#0a7fb5', '#e0405a'],
        'autumn' => ['Autumn', 'dark', '#1f130b', '#2a1b10', '#f3e3cf', '#e8833a', '#e0a458', '#a3b84a'],
        'winter' => ['Winter', 'light', '#e6eef7', '#f6f9fd', '#12263f', '#2b6cb0', '#1f4f8a', '#6b8fb5'],
    ],
    'daytime' => [
        'sunrise' => ['Sunrise', 'light', '#fde9dc', '#fff6ef', '#3a1d12', '#d4572a', '#b03a5b', '#f2a65a'],
        'golden-hour' => ['Golden Hour', 'light', '#fbe9b7', '#fff5d6', '#3d2a05', '#c77d0a', '#9a5b00', '#d95d39'],
        'dusk' => ['Dusk', 'dark', '#231a33', '#2d2342', '#f1e6ff', '#ff8a65', '#c9a6ff', '#ffcf6e'],
        'midnight' => ['Midnight', 'dark', '#070b18', '#0e1426', '#dfe7ff', '#6c8cff', '#8fb0ff', '#7de0d0'],
    ],
    'nature' => [
        'forest' => ['Forest', 'dark', '#0f1d14', '#162a1c', '#e1efdc', '#5fbf6a', '#8fd68f', '#d6a85a'],
        'ocean' => ['Ocean', 'dark', '#07202e', '#0d2d40', '#dcf0f7', '#2fb5d6', '#6fd0e6', '#ffb36b'],
        'desert' => ['Desert', 'dark', '#2b2112', '#382c1a', '#f4e6cc', '#e0a040', '#e8b870', '#5fb3a0'],
        'aurora' => ['Aurora', 'dark', '#0a1620', '#11222e', '#e3f4f0', '#4be3a8', '#7ad7ff', '#c58bff'],
        'volcano' => ['Volcano', 'dark', '#1a0f0f', '#261515', '#f5e3dc', '#ff5a36', '#ff9a5c', '#ffd04a'],
    ],
    'materials' => [
        'slate' => ['Slate', 'dark', '#21272e', '#2a313a', '#e6ebf0', '#7cc0f0', '#9cc9e8', '#e0b36a'],
        'concrete' => ['Concrete', 'light', '#dcdcdc', '#ebebeb', '#202020', '#3b5b8c', '#2f4d7a', '#a0522d'],
        'terracotta' => ['Terracotta', 'light', '#f0d9c8', '#f8e8db', '#3a1e12', '#b04a2a', '#8c3a1f', '#2f7f6f'],
        'linen' => ['Linen', 'light', '#f3eee3', '#faf7f0', '#2e2a22', '#7a6a4a', '#5f5238', '#4f7f6a'],
    ],
    'minimal' => [
        'mono-light' => ['Mono Light', 'light', '#ffffff', '#f5f5f5', '#111111', '#000000', '#000000', '#6b6b6b'],
        'mono-dark' => ['Mono Dark', 'dark', '#000000', '#111111', '#f5f5f5', '#ffffff', '#ffffff', '#9a9a9a'],
        'newsprint' => ['Newsprint', 'light', '#ebe7dc', '#f4f1e8', '#1a1a1a', '#7a1f1f', '#7a1f1f', '#444444'],
        'blueprint' => ['Blueprint', 'dark', '#0b3a66', '#104a80', '#e8f3ff', '#ffffff', '#bfe0ff', '#ffd54a'],
    ],
    'places' => [
        'tokyo' => ['Tokyo', 'dark', '#12101f', '#1c1830', '#f5efff', '#ff4d8d', '#4de1ff', '#ffe14d'],
        'lisbon' => ['Lisbon', 'light', '#f6efe0', '#fdfaf2', '#14263d', '#1d4f91', '#1d4f91', '#e8a317'],
        'marrakesh' => ['Marrakesh', 'dark', '#2a1710', '#37201a', '#f6e3d0', '#e0703a', '#3fb8a8', '#e8b84a'],
    ],
];

/** Pack for a host app, not for the package: holidays and more pet coats. */
$app = [
    'seasonal' => [
        'christmas' => ['Christmas', 'dark', '#0f2a1c', '#153826', '#f6eedd', '#d8353a', '#ffd36b', '#7bd88f'],
        'halloween' => ['Halloween', 'dark', '#14091f', '#1e0f2e', '#f6e8d8', '#ff7a1a', '#b78cff', '#7fe08a'],
        'birthday' => ['Birthday', 'light', '#fff0f6', '#ffffff', '#3a1530', '#d6336c', '#6f42c1', '#e08a00'],
    ],
    'coats' => [
        'tabby' => ['Tabby', 'light', '#e8e2d8', '#f3efe8', '#2b2118', '#6b4a2b', '#4a3a2a', '#c2791f'],
        'calico' => ['Calico', 'light', '#fbf3ea', '#fffaf3', '#2b2118', '#c26a1b', '#5a4636', '#3a3a3a'],
        'husky' => ['Husky', 'light', '#eef2f6', '#fafcfe', '#1b232b', '#3f6f9f', '#2c5a85', '#6a7b8c'],
        'bengal' => ['Bengal', 'light', '#ece6c8', '#f6f2de', '#2a2408', '#7a6a10', '#5e5208', '#b3541e'],
    ],
];

$print = static function (array $groups): void {
    foreach ($groups as $group => $themes) {
        echo "\n        // $group\n";
        foreach ($themes as $id => [$label, $mode, $bg, $surface, $text, $brand, $link, $accent]) {
            $t = ThemeBuilder::adapt(compact('mode', 'bg', 'surface', 'text', 'brand', 'link', 'accent'));
            echo "        '$id' => ['label' => '$label', 'group' => '$group', 'mode' => '$mode', 'bg' => '{$t['bg']}', 'surface' => '{$t['surface']}', 'text' => '{$t['text']}', 'brand' => '{$t['brand']}', 'link' => '{$t['link']}', 'accent' => '{$t['accent']}'],\n";
        }
    }
};
$print(in_array('--app', $argv ?? [], true) ? $app : $packs);
