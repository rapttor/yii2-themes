<?php

declare(strict_types=1);

/**
 * Regenerates the art themes of Palettes::THEMES from the dominant colours of public-domain paintings.
 *
 *   php tools/art-themes.php            prints the rows (paste them over the art block in src/Palettes.php)
 *   php tools/art-themes.php --json     prints id => theme as JSON
 *
 * The colours are the 8 k-means clusters (most frequent first) of each painting, taken from a 240px copy on Wikimedia
 * Commons; nothing from the images is kept. Add a painting: extract its clusters, add a row below, run the script.
 */

require __DIR__ . '/../src/Color.php';
require __DIR__ . '/../src/ThemeBuilder.php';

use rapttor\themes\ThemeBuilder;

/** id => [label, mode, clusters, credit] */
$art = [
    'starry-night' => ['Starry Night', 'dark', ['#171d20', '#5b7392', '#3c527e', '#7b92a8', '#1f305a', '#3f4849', '#aab8ae', '#9d9f65'], 'Vincent van Gogh, The Starry Night (1889)'],
    'great-wave' => ['Great Wave', 'light', ['#f4e9cf', '#f6f9ed', '#e6d5b4', '#a0a6a1', '#31506a', '#707d81', '#c5cfc8', '#10273f'], 'Katsushika Hokusai, The Great Wave off Kanagawa (c. 1831)'],
    'water-lilies' => ['Water Lilies', 'light', ['#58757d', '#406879', '#69838e', '#648eac', '#4f7b9b', '#88a3a3', '#2c5658', '#b0c4c3'], 'Claude Monet, Water Lilies (1906)'],
    'the-kiss' => ['The Kiss', 'dark', ['#99864b', '#836f37', '#c3ab54', '#93917b', '#c5b98d', '#685825', '#6e755a', '#2d2418'], 'Gustav Klimt, The Kiss (1907-08)'],
    'pearl' => ['Pearl', 'dark', ['#050312', '#352a27', '#5f5042', '#977b5b', '#c4a377', '#ebd2b8', '#a0b3c9', '#6d85a1'], 'Johannes Vermeer, Girl with a Pearl Earring (c. 1665)'],
    'composition' => ['Composition', 'light', ['#e8e7e4', '#e22f2a', '#d82519', '#0d1211', '#035b9a', '#cab6a6', '#3d2928', '#ecd971'], 'Piet Mondrian, Composition II in Red, Blue, and Yellow (1930)'],
    'sunflowers' => ['Sunflowers', 'light', ['#d0c344', '#b7960e', '#a27f15', '#8d660b', '#c4b135', '#ddd055', '#af9d5c', '#51560c'], 'Vincent van Gogh, Sunflowers (1889)'],
    'cafe-terrace' => ['Cafe Terrace', 'dark', ['#312d26', '#565243', '#987c33', '#cdb44e', '#727470', '#7c8fb2', '#a59d79', '#ccc8ac'], 'Vincent van Gogh, Cafe Terrace at Night (1888)'],
    'impression' => ['Impression', 'light', ['#81887d', '#6a7e77', '#8f9385', '#7d7b6a', '#9c7f6b', '#636d5e', '#ad9584', '#334738'], 'Claude Monet, Impression, Sunrise (1872)'],
    'the-scream' => ['The Scream', 'dark', ['#2f372d', '#56503c', '#131d15', '#786a50', '#cb6f33', '#bc4612', '#a08159', '#d3a167'], 'Edvard Munch, The Scream (1893)'],
    'red-fuji' => ['Red Fuji', 'light', ['#9f3423', '#30578c', '#e0eee9', '#55675f', '#262e2c', '#152f5d', '#a97761', '#90a3af'], 'Katsushika Hokusai, Red Fuji, Thirty-six Views of Mount Fuji (c. 1831)'],
    'birth-of-venus' => ['Venus', 'light', ['#d1caaa', '#c4b080', '#4c4027', '#f0e5c9', '#79633e', '#261e0f', '#b1894f', '#8e8f73'], 'Sandro Botticelli, The Birth of Venus (c. 1485)'],
    'composition-vii' => ['Composition VII', 'dark', ['#170e14', '#e6d9cb', '#8c7267', '#58372c', '#aa3f1b', '#b9a59d', '#355479', '#d19a4f'], 'Wassily Kandinsky, Composition VII (1913)'],
    'milkmaid' => ['Milkmaid', 'dark', ['#d8d1be', '#14171a', '#402d1d', '#5c4833', '#c3b79f', '#816f58', '#a6967a', '#1b3046'], 'Johannes Vermeer, The Milkmaid (c. 1658)'],
    'poppy-field' => ['Poppy Field', 'light', ['#dbd9cd', '#a69c7f', '#908b6b', '#cacfc6', '#756f51', '#a88464', '#4c4b36', '#a3bfc5'], 'Claude Monet, Poppy Field (1873)'],
    'almond-blossom' => ['Almond Blossom', 'light', ['#7ea9ae', '#6b979c', '#899d86', '#a0b6a6', '#637b67', '#c0cdb6', '#334a35', '#deead7'], 'Vincent van Gogh, Almond Blossom (1890)'],
];

$themes = [];
foreach ($art as $id => [$label, $mode, $clusters, $credit]) {
    $themes[$id] = ['label' => $label, 'group' => 'art', 'mode' => $mode] + ThemeBuilder::fromDominant($clusters, $mode) + ['credit' => $credit];
}

if (in_array('--json', $argv ?? [], true)) {
    echo json_encode($themes, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), "\n";
    exit(0);
}
foreach ($themes as $id => $t) {
    $quote = static fn (string $s): string => str_replace("'", "\\'", $s);
    echo "        '$id' => ['label' => '{$quote($t['label'])}', 'group' => 'art', 'mode' => '{$t['mode']}', 'bg' => '{$t['bg']}', 'surface' => '{$t['surface']}', 'text' => '{$t['text']}', 'brand' => '{$t['brand']}', 'link' => '{$t['link']}', 'accent' => '{$t['accent']}', 'credit' => '{$quote($t['credit'])}'],\n";
}
