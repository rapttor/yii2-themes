<?php

declare(strict_types=1);

namespace rapttor\themes;

/**
 * Built-in themes. A theme is a complete set of colours plus a mode, picked per user by its id:
 *
 *   label    name shown in the picker (proper names, not translated)
 *   group    design | rapttor | accessibility | soft | editors | art | retro   (picker sections, see Themes::groups(); hosts may use their own group ids)
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
        'starry-night' => ['label' => 'Starry Night', 'group' => 'art', 'mode' => 'dark', 'bg' => '#111e25', 'surface' => '#182b35', 'text' => '#e8eff3', 'brand' => '#a4b5e0', 'link' => '#959bda', 'accent' => '#6b8ac7', 'credit' => 'Vincent van Gogh, The Starry Night (1889)'],
        'great-wave' => ['label' => 'Great Wave', 'group' => 'art', 'mode' => 'light', 'bg' => '#fbeed0', 'surface' => '#fef9ee', 'text' => '#282215', 'brand' => '#86682d', 'link' => '#27609b', 'accent' => '#2b6aab', 'credit' => 'Katsushika Hokusai, The Great Wave off Kanagawa (c. 1831)'],
        'water-lilies' => ['label' => 'Water Lilies', 'group' => 'art', 'mode' => 'light', 'bg' => '#d9f2f1', 'surface' => '#f2fbfa', 'text' => '#152827', 'brand' => '#3a7188', 'link' => '#3a6188', 'accent' => '#3a9398', 'credit' => 'Claude Monet, Water Lilies (1906)'],
        'the-kiss' => ['label' => 'The Kiss', 'group' => 'art', 'mode' => 'dark', 'bg' => '#271d0f', 'surface' => '#382915', 'text' => '#f3eee8', 'brand' => '#cbb76c', 'link' => '#cac868', 'accent' => '#c7a06b', 'credit' => 'Gustav Klimt, The Kiss (1907-08)'],
        'pearl' => ['label' => 'Pearl', 'group' => 'art', 'mode' => 'dark', 'bg' => '#0f0b2b', 'surface' => '#150f3d', 'text' => '#e9e8f3', 'brand' => '#d29a60', 'link' => '#7096c2', 'accent' => '#6b96c7', 'credit' => 'Johannes Vermeer, Girl with a Pearl Earring (c. 1665)'],
        'composition' => ['label' => 'Composition', 'group' => 'art', 'mode' => 'light', 'bg' => '#f5e4d6', 'surface' => '#fbf5f1', 'text' => '#281e15', 'brand' => '#0e69aa', 'link' => '#af1c18', 'accent' => '#9b663b', 'credit' => 'Piet Mondrian, Composition II in Red, Blue, and Yellow (1930)'],
        'sunflowers' => ['label' => 'Sunflowers', 'group' => 'art', 'mode' => 'light', 'bg' => '#fbf7d0', 'surface' => '#fefcee', 'text' => '#282615', 'brand' => '#846c0b', 'link' => '#636308', 'accent' => '#8b9415', 'credit' => 'Vincent van Gogh, Sunflowers (1889)'],
        'cafe-terrace' => ['label' => 'Cafe Terrace', 'group' => 'art', 'mode' => 'dark', 'bg' => '#251d11', 'surface' => '#342a18', 'text' => '#f3efe8', 'brand' => '#d2bc60', 'link' => '#8da4ce', 'accent' => '#6b8bc7', 'credit' => 'Vincent van Gogh, Cafe Terrace at Night (1888)'],
        'impression' => ['label' => 'Impression', 'group' => 'art', 'mode' => 'light', 'bg' => '#f4e3d7', 'surface' => '#fbf5f1', 'text' => '#281d15', 'brand' => '#915930', 'link' => '#735526', 'accent' => '#248f86', 'credit' => 'Claude Monet, Impression, Sunrise (1872)'],
        'the-scream' => ['label' => 'The Scream', 'group' => 'art', 'mode' => 'dark', 'bg' => '#102614', 'surface' => '#17361d', 'text' => '#e8f3ea', 'brand' => '#f4ae8f', 'link' => '#ed9a45', 'accent' => '#c79f6b', 'credit' => 'Edvard Munch, The Scream (1893)'],

        // editor and IDE classics, adapted to the readability rules (hues kept); credit names the original palette
        'solarized-light' => ['label' => 'Solarized Light', 'group' => 'editors', 'mode' => 'light', 'bg' => '#fdf6e3', 'surface' => '#eee8d5', 'text' => '#3f4d52', 'brand' => '#1d6ca2', 'link' => '#1d706a', 'accent' => '#cb4b16', 'credit' => 'Solarized by Ethan Schoonover (MIT)'],
        'solarized-dark' => ['label' => 'Solarized Dark', 'group' => 'editors', 'mode' => 'dark', 'bg' => '#002b36', 'surface' => '#073642', 'text' => '#b7c1c2', 'brand' => '#48a0de', 'link' => '#2ca9a0', 'accent' => '#cb4b16', 'credit' => 'Solarized by Ethan Schoonover (MIT)'],
        'nord' => ['label' => 'Nord', 'group' => 'editors', 'mode' => 'dark', 'bg' => '#2e3440', 'surface' => '#3b4252', 'text' => '#eceff4', 'brand' => '#88c0d0', 'link' => '#99b3cd', 'accent' => '#ebcb8b', 'credit' => 'Nord by Arctic Ice Studio (MIT)'],
        'nord-light' => ['label' => 'Nord Light', 'group' => 'editors', 'mode' => 'light', 'bg' => '#eceff4', 'surface' => '#e5e9f0', 'text' => '#2e3440', 'brand' => '#4b6a91', 'link' => '#4b6a91', 'accent' => '#c77055', 'credit' => 'Nord by Arctic Ice Studio (MIT)'],
        'gruvbox-dark' => ['label' => 'Gruvbox Dark', 'group' => 'editors', 'mode' => 'dark', 'bg' => '#282828', 'surface' => '#3c3836', 'text' => '#ebdbb2', 'brand' => '#d79921', 'link' => '#89a99d', 'accent' => '#fe8019', 'credit' => 'Gruvbox by Pavel Pertsev (MIT)'],
        'gruvbox-light' => ['label' => 'Gruvbox Light', 'group' => 'editors', 'mode' => 'light', 'bg' => '#fbf1c7', 'surface' => '#ebdbb2', 'text' => '#3c3836', 'brand' => '#82550e', 'link' => '#076678', 'accent' => '#af3a03', 'credit' => 'Gruvbox by Pavel Pertsev (MIT)'],
        'dracula' => ['label' => 'Dracula', 'group' => 'editors', 'mode' => 'dark', 'bg' => '#282a36', 'surface' => '#343746', 'text' => '#f8f8f2', 'brand' => '#bd93f9', 'link' => '#8be9fd', 'accent' => '#ff79c6', 'credit' => 'Dracula by Zeno Rocha (MIT)'],
        'tokyo-night' => ['label' => 'Tokyo Night', 'group' => 'editors', 'mode' => 'dark', 'bg' => '#1a1b26', 'surface' => '#24283b', 'text' => '#c0caf5', 'brand' => '#7aa2f7', 'link' => '#7dcfff', 'accent' => '#ff9e64', 'credit' => 'Tokyo Night by enkia (MIT)'],
        'catppuccin-latte' => ['label' => 'Catppuccin Latte', 'group' => 'editors', 'mode' => 'light', 'bg' => '#eff1f5', 'surface' => '#e6e9ef', 'text' => '#484b63', 'brand' => '#8534ef', 'link' => '#0b59f4', 'accent' => '#ef5801', 'credit' => 'Catppuccin (MIT)'],
        'catppuccin-mocha' => ['label' => 'Catppuccin Mocha', 'group' => 'editors', 'mode' => 'dark', 'bg' => '#1e1e2e', 'surface' => '#313244', 'text' => '#cdd6f4', 'brand' => '#cba6f7', 'link' => '#89b4fa', 'accent' => '#fab387', 'credit' => 'Catppuccin (MIT)'],
        'primer-light' => ['label' => 'Primer Light', 'group' => 'editors', 'mode' => 'light', 'bg' => '#ffffff', 'surface' => '#f6f8fa', 'text' => '#1f2328', 'brand' => '#0969da', 'link' => '#0969da', 'accent' => '#bc4c00', 'credit' => 'Primer by GitHub (MIT)'],
        'primer-dark' => ['label' => 'Primer Dark', 'group' => 'editors', 'mode' => 'dark', 'bg' => '#0d1117', 'surface' => '#161b22', 'text' => '#e6edf3', 'brand' => '#2f81f7', 'link' => '#58a6ff', 'accent' => '#f0883e', 'credit' => 'Primer by GitHub (MIT)'],

        // retro screens
        'terminal-green' => ['label' => 'Terminal Green', 'group' => 'retro', 'mode' => 'dark', 'bg' => '#0a0f0a', 'surface' => '#101a10', 'text' => '#7dff7d', 'brand' => '#33ff33', 'link' => '#66ffaa', 'accent' => '#ffd24d'],
        'amber-crt' => ['label' => 'Amber CRT', 'group' => 'retro', 'mode' => 'dark', 'bg' => '#120a00', 'surface' => '#1b1100', 'text' => '#ffb000', 'brand' => '#ffb000', 'link' => '#ffcc4d', 'accent' => '#ff6a00'],
        'game-boy' => ['label' => 'Game Boy', 'group' => 'retro', 'mode' => 'light', 'bg' => '#9bbc0f', 'surface' => '#8bac0f', 'text' => '#061806', 'brand' => '#1e3c1e', 'link' => '#1e3c1e', 'accent' => '#0f380f', 'credit' => 'Palette of the 1989 Game Boy screen'],
        'synthwave' => ['label' => 'Synthwave', 'group' => 'retro', 'mode' => 'dark', 'bg' => '#1a1033', 'surface' => '#241448', 'text' => '#f5e9ff', 'brand' => '#ff2bd6', 'link' => '#2de2e6', 'accent' => '#f9c80e'],

        // more art (same method as above)
        'red-fuji' => ['label' => 'Red Fuji', 'group' => 'art', 'mode' => 'light', 'bg' => '#d6f5ea', 'surface' => '#f1fcf8', 'text' => '#152821', 'brand' => '#b03927', 'link' => '#345e98', 'accent' => '#3763a0', 'credit' => 'Katsushika Hokusai, Red Fuji, Thirty-six Views of Mount Fuji (c. 1831)'],
        'birth-of-venus' => ['label' => 'Venus', 'group' => 'art', 'mode' => 'light', 'bg' => '#fbefd0', 'surface' => '#fdf9ef', 'text' => '#282315', 'brand' => '#846925', 'link' => '#645e1c', 'accent' => '#9b743b', 'credit' => 'Sandro Botticelli, The Birth of Venus (c. 1485)'],
        'composition-vii' => ['label' => 'Composition VII', 'group' => 'art', 'mode' => 'dark', 'bg' => '#260f1f', 'surface' => '#36162c', 'text' => '#f3e8ef', 'brand' => '#ea977b', 'link' => '#779bc5', 'accent' => '#6b95c7', 'credit' => 'Wassily Kandinsky, Composition VII (1913)'],
        'milkmaid' => ['label' => 'Milkmaid', 'group' => 'art', 'mode' => 'dark', 'bg' => '#111b25', 'surface' => '#182634', 'text' => '#e8edf3', 'brand' => '#ceab8d', 'link' => '#77a0ca', 'accent' => '#6b98c7', 'credit' => 'Johannes Vermeer, The Milkmaid (c. 1658)'],
        'poppy-field' => ['label' => 'Poppy Field', 'group' => 'art', 'mode' => 'light', 'bg' => '#f3efd8', 'surface' => '#fbf9f1', 'text' => '#282515', 'brand' => '#8b613c', 'link' => '#6f5a2f', 'accent' => '#269794', 'credit' => 'Claude Monet, Poppy Field (1873)'],
        'almond-blossom' => ['label' => 'Almond Blossom', 'group' => 'art', 'mode' => 'light', 'bg' => '#e1f6d5', 'surface' => '#f5fcf0', 'text' => '#1c2815', 'brand' => '#457728', 'link' => '#306b24', 'accent' => '#3c2bab', 'credit' => 'Vincent van Gogh, Almond Blossom (1890)'],
    ];
}
