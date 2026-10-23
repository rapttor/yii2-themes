<?php

declare(strict_types=1);

namespace rapttor\themes;

/**
 * Built-in themes. A theme is a complete set of colours plus a mode, picked per user by its id:
 *
 *   label    name shown in the picker (proper names, not translated)
 *   group    design | rapttor | soft | art   (picker sections, see Themes::groups(); hosts may use their own group ids)
 *   mode     light | dark                      (sets color-scheme and the data-mode hooks)
 *   style    flat (default) | soft            (soft = neumorphic: raised and inset surfaces from soft shadows, see theme.css)
 *   contrast optional `high`: stronger lines and muted text (accessibility themes)
 *   bg       page background          surface  cards and panels      text  body text
 *   brand    highlight: buttons, active states      link  links and link-like text      accent  decorative: dots, stars, badges
 *   credit   optional source line (art themes: the artwork the colours were extracted from)
 *
 * The rest (muted text, lines, ink on the brand colour, shadows) is derived in {@see Themes::resolved()}, so every
 * theme is checked by the same rules (see tests): text 7:1 on bg and surface, brand and link 4.5:1, accent 3:1.
 */
final class Palettes
{
    /** @var array<string, array<string, string>> */
    public const THEMES = [
        // design systems: Apple Human Interface (iOS system colours, increased-contrast blue) and Material 3 baseline tokens
        'human-light' => ['label' => 'Human Light', 'group' => 'design', 'mode' => 'light', 'bg' => '#f2f2f7', 'surface' => '#ffffff', 'text' => '#1c1c1e', 'brand' => '#0062cc', 'link' => '#0062cc', 'accent' => '#c93400'],
        'human-dark' => ['label' => 'Human Dark', 'group' => 'design', 'mode' => 'dark', 'bg' => '#000000', 'surface' => '#1c1c1e', 'text' => '#f2f2f7', 'brand' => '#0a84ff', 'link' => '#64a8ff', 'accent' => '#ff9f0a'],
        'material-light' => ['label' => 'Material Light', 'group' => 'design', 'mode' => 'light', 'bg' => '#fef7ff', 'surface' => '#f3edf7', 'text' => '#1d1b20', 'brand' => '#6750a4', 'link' => '#6750a4', 'accent' => '#7d5260'],
        'material-dark' => ['label' => 'Material Dark', 'group' => 'design', 'mode' => 'dark', 'bg' => '#141218', 'surface' => '#211f26', 'text' => '#e6e0e9', 'brand' => '#d0bcff', 'link' => '#d0bcff', 'accent' => '#efb8c8'],

        // RapTToR: the website's near-black and lime, a dark green variant, and a light grey one with green text and links
        'rapttor-dark' => ['label' => 'RapTToR Dark', 'group' => 'rapttor', 'mode' => 'dark', 'bg' => '#0b0b09', 'surface' => '#131310', 'text' => '#f0ece0', 'brand' => '#ccee00', 'link' => '#ccee00', 'accent' => '#8fd14f'],
        'rapttor-forest' => ['label' => 'RapTToR Forest', 'group' => 'rapttor', 'mode' => 'dark', 'bg' => '#0a1a10', 'surface' => '#10261a', 'text' => '#e6f0dc', 'brand' => '#ccee00', 'link' => '#b5e04a', 'accent' => '#5fd08a'],
        'rapttor-light' => ['label' => 'RapTToR Light', 'group' => 'rapttor', 'mode' => 'light', 'bg' => '#e6e9e3', 'surface' => '#f5f7f2', 'text' => '#1f3a14', 'brand' => '#3a6200', 'link' => '#2f5200', 'accent' => '#5d8200'],

        // accessibility: very high contrast, colour-blind safe accents (Okabe-Ito), low-glare paper and sepia night reading
        'high-contrast-light' => ['label' => 'High Contrast Light', 'group' => 'accessibility', 'mode' => 'light', 'contrast' => 'high', 'bg' => '#ffffff', 'surface' => '#ffffff', 'text' => '#000000', 'brand' => '#0b00a8', 'link' => '#0b00a8', 'accent' => '#a30000'],
        'high-contrast-dark' => ['label' => 'High Contrast Dark', 'group' => 'accessibility', 'mode' => 'dark', 'contrast' => 'high', 'bg' => '#000000', 'surface' => '#0a0a0a', 'text' => '#ffffff', 'brand' => '#ffff00', 'link' => '#66ccff', 'accent' => '#ff9900'],
        'colorblind-light' => ['label' => 'Colour-blind Light', 'group' => 'accessibility', 'mode' => 'light', 'bg' => '#fafafa', 'surface' => '#ffffff', 'text' => '#111111', 'brand' => '#0072b2', 'link' => '#0072b2', 'accent' => '#d55e00'],
        'colorblind-dark' => ['label' => 'Colour-blind Dark', 'group' => 'accessibility', 'mode' => 'dark', 'bg' => '#101418', 'surface' => '#1a2028', 'text' => '#f2f2f2', 'brand' => '#56b4e9', 'link' => '#56b4e9', 'accent' => '#e69f00'],
        'paper' => ['label' => 'Paper', 'group' => 'accessibility', 'mode' => 'light', 'bg' => '#f6efdc', 'surface' => '#fbf6e8', 'text' => '#2a2418', 'brand' => '#7a3e00', 'link' => '#1f4f7a', 'accent' => '#8a5a00'],
        'sepia-night' => ['label' => 'Sepia Night', 'group' => 'accessibility', 'mode' => 'dark', 'bg' => '#1b1610', 'surface' => '#251e16', 'text' => '#e9dcc3', 'brand' => '#e0a458', 'link' => '#d9b36c', 'accent' => '#c97b4a'],

        // soft (neumorphic): surface and page share one colour, depth comes from light and dark shadows
        'soft-light' => ['label' => 'Soft Light', 'group' => 'soft', 'mode' => 'light', 'style' => 'soft', 'bg' => '#e0e5ec', 'surface' => '#e0e5ec', 'text' => '#2d3748', 'brand' => '#3552c9', 'link' => '#3552c9', 'accent' => '#c2410c'],
        'soft-dark' => ['label' => 'Soft Dark', 'group' => 'soft', 'mode' => 'dark', 'style' => 'soft', 'bg' => '#2b2f36', 'surface' => '#2b2f36', 'text' => '#e6e9ef', 'brand' => '#9db2ff', 'link' => '#9db2ff', 'accent' => '#ffb26b'],
        'soft-neutral' => ['label' => 'Soft Neutral', 'group' => 'soft', 'mode' => 'light', 'style' => 'soft', 'bg' => '#e6e0d8', 'surface' => '#e6e0d8', 'text' => '#3a342c', 'brand' => '#7a4f2a', 'link' => '#7a4f2a', 'accent' => '#2f6f62'],

        // art: colours extracted from public-domain paintings (k-means on the image) and turned into themes with ThemeBuilder
        'starry-night' => ['label' => 'Starry Night', 'group' => 'art', 'mode' => 'dark', 'bg' => '#101416', 'surface' => '#191f22', 'text' => '#ecefec', 'brand' => '#95a9da', 'link' => '#8990d6', 'accent' => '#6b8ac7', 'credit' => 'Vincent van Gogh, The Starry Night (1889)'],
        'great-wave' => ['label' => 'Great Wave', 'group' => 'art', 'mode' => 'light', 'bg' => '#f5f8ed', 'surface' => '#fcfdf9', 'text' => '#171e26', 'brand' => '#8a6a2e', 'link' => '#2965a3', 'accent' => '#2b6aab', 'credit' => 'Katsushika Hokusai, The Great Wave off Kanagawa (c. 1831)'],
        'water-lilies' => ['label' => 'Water Lilies', 'group' => 'art', 'mode' => 'light', 'bg' => '#f0f4f4', 'surface' => '#fbfcfc', 'text' => '#172626', 'brand' => '#3d768f', 'link' => '#3c648b', 'accent' => '#3b979b', 'credit' => 'Claude Monet, Water Lilies (1906)'],
        'the-kiss' => ['label' => 'The Kiss', 'group' => 'art', 'mode' => 'dark', 'bg' => '#19140d', 'surface' => '#261f14', 'text' => '#f2f0e9', 'brand' => '#cab568', 'link' => '#cac868', 'accent' => '#c7a06b', 'credit' => 'Gustav Klimt, The Kiss (1907-08)'],
        'pearl' => ['label' => 'Pearl', 'group' => 'art', 'mode' => 'dark', 'bg' => '#0e0c1a', 'surface' => '#161328', 'text' => '#f2ede9', 'brand' => '#d29a60', 'link' => '#7096c2', 'accent' => '#6b96c7', 'credit' => 'Johannes Vermeer, Girl with a Pearl Earring (c. 1665)'],
        'composition' => ['label' => 'Composition', 'group' => 'art', 'mode' => 'light', 'bg' => '#f3f3f1', 'surface' => '#fbfbfb', 'text' => '#1a2422', 'brand' => '#0f71b8', 'link' => '#bd1e1a', 'accent' => '#9b663b', 'credit' => 'Piet Mondrian, Composition II in Red, Blue, and Yellow (1930)'],
        'sunflowers' => ['label' => 'Sunflowers', 'group' => 'art', 'mode' => 'light', 'bg' => '#f8f7ed', 'surface' => '#fdfdf9', 'text' => '#252617', 'brand' => '#846c0b', 'link' => '#636308', 'accent' => '#8b9415', 'credit' => 'Vincent van Gogh, Sunflowers (1889)'],
        'cafe-terrace' => ['label' => 'Cafe Terrace', 'group' => 'art', 'mode' => 'dark', 'bg' => '#161411', 'surface' => '#211e1a', 'text' => '#f1f0e9', 'brand' => '#d2bc60', 'link' => '#7e98c8', 'accent' => '#6b8bc7', 'credit' => 'Vincent van Gogh, Cafe Terrace at Night (1888)'],
        'impression' => ['label' => 'Impression', 'group' => 'art', 'mode' => 'light', 'bg' => '#f5f2f0', 'surface' => '#fcfbfa', 'text' => '#1a241c', 'brand' => '#9d6034', 'link' => '#7a5b29', 'accent' => '#279b91', 'credit' => 'Claude Monet, Impression, Sunrise (1872)'],
        'the-scream' => ['label' => 'The Scream', 'group' => 'art', 'mode' => 'dark', 'bg' => '#0f1711', 'surface' => '#17231a', 'text' => '#f2ede9', 'brand' => '#f1936a', 'link' => '#ed9a45', 'accent' => '#c79f6b', 'credit' => 'Edvard Munch, The Scream (1893)'],
    ];
}
