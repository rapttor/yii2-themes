# rapttor/yii2-themes

Per-user **themes** for Yii2 apps. A theme is a complete set of six colours (background, surface, text, highlight, link,
accent) with its own mode (light or dark) and style (flat or soft/neumorphic), picked by **id**. 73 built in, in 13 groups, plus the user-defined `custom`:

| Group | Themes |
|---|---|
| Device | `system`: follows the device, by default Human Light by day and Human Dark at night |
| Design systems | `human-light`, `human-dark` (Apple Human Interface system colours), `material-light`, `material-dark` (Material 3 baseline) |
| RapTToR | `rapttor-dark` (near-black and lime, as rapttor.com), `rapttor-forest` (dark green and lime), `rapttor-light` (light grey, green text and links) |
| Accessibility | `high-contrast-light`, `high-contrast-dark` (12:1 or better, strong lines), `colorblind-light`, `colorblind-dark` (Okabe-Ito accents), `paper` (warm, low glare), `sepia-night` |
| Minimal | `mono-light`, `mono-dark`, `newsprint`, `blueprint` |
| Soft | `soft-light`, `soft-dark`, `soft-neutral`: neumorphic, depth from light and dark shadows |
| Materials | `slate`, `concrete`, `terracotta`, `linen` |
| Nature | `forest`, `ocean`, `desert`, `aurora`, `volcano` |
| Seasons | `spring`, `summer`, `autumn`, `winter` |
| Times of day | `sunrise`, `golden-hour`, `dusk`, `midnight` |
| Places | `tokyo`, `lisbon`, `marrakesh` |
| Editors | `solarized-light`, `solarized-dark`, `nord`, `nord-light`, `gruvbox-light`, `gruvbox-dark`, `dracula`, `tokyo-night`, `catppuccin-latte`, `catppuccin-mocha`, `primer-light`, `primer-dark`: the well-known editor palettes, adapted to the contrast rules with their hues kept (`credit` names the original, all MIT) |
| Art | `starry-night`, `great-wave`, `water-lilies`, `the-kiss`, `pearl`, `composition`, `sunflowers`, `cafe-terrace`, `impression`, `the-scream`, `red-fuji`, `birth-of-venus`, `composition-vii`, `milkmaid`, `poppy-field`, `almond-blossom`: colours extracted from public-domain paintings |
| Retro | `terminal-green`, `amber-crt`, `game-boy`, `synthwave` |

Every theme is tested against the same contrast rules: text 7:1 on background and surface, muted text, highlight and
link 4.5:1, accent 3:1, readable ink on the highlight colour.

## Install

```bash
composer require rapttor/yii2-themes
```

```php
// config: application component
'components' => ['themes' => ['class' => rapttor\themes\Themes::class]],
```

One column where you store the choice: `theme varchar(32) not null default 'system'`.

## Use

```php
// layout, before the head is rendered
$themes = Yii::$app->themes;
$id = $themes->normalize($identity?->theme);
$themes->registerHead($this, $id);                 // assets, the theme's CSS variables, theme-color meta
// <html lang="en" <?= $themes->htmlAttributes($id) ?>>

// model / form
public function rules(): array { return [...Yii::$app->themes->rules(), /* ... */]; }

// ActiveForm
<?= rapttor\themes\widgets\ThemePicker::widget(['form' => $form, 'model' => $model]) ?>
```

The page styles itself with CSS variables: `--bg --surface --text --muted --line --brand --brand-ink --link --accent`
and the depth tokens `--elev --elev-sm --elev-in`. Hooks on `<html>`: `data-theme="<id>"`, `data-mode="light|dark"`
(absent for `system`), `data-style="soft"`.

**Soft themes**: apply `box-shadow: var(--elev)` to raised surfaces (cards, panels, buttons: `--elev-sm`) and
`var(--elev-in)` to inset ones (inputs, pressed buttons). Flat themes set all three to `none`, so the same CSS fits both.
Soft shadows are low contrast by design: keep text and input outlines legible (the package guarantees the text colours).

Choosing in the picker previews live (`theme-picker.js`); saving is your form's job.

Web app manifest: `$themes->metaColors($id)[0]` is the splash background, `$themes->resolved($id)['brand']` the theme colour.

## Configure

```php
'themes' => [
    'class' => rapttor\themes\Themes::class,
    'default' => 'system',
    'systemLight' => 'material-light',     // what `system` shows by day / at night
    'systemDark' => 'material-dark',
    'themes' => [
        'mine' => ['label' => 'Mine', 'group' => 'custom', 'mode' => 'light', 'bg' => '#ffffff', 'surface' => '#f5f5f5',
                   'text' => '#111111', 'brand' => '#0044aa', 'link' => '#0044aa', 'accent' => '#aa4400'],
        'pearl' => null,                    // remove a built-in
    ],
],
```

Theme fields: `label`, `group`, `mode` (`light`|`dark`), optional `style` (`soft`), `bg`, `surface`, `text`, `brand`, `link`,
`accent`, optional `credit`. Muted text, lines, the ink on the highlight colour and the shadows are derived
(`Themes::resolved()`).

### Packs and how they were made

The art themes come from `tools/art-themes.php` (extracted painting colours), the Seasons / Times of day / Nature / Materials /
Minimal / Places packs from `tools/packs.php` (six colours with a mood each, then `adapt()`); both print the rows for
`Palettes.php`, and `packs.php --app` prints rows for a host app's own groups (holidays, pet coats, ...).

### Fitting an existing palette

`ThemeBuilder::adapt($theme)` takes a palette you already have (an editor theme, a brand guide) with `mode`, `bg`, `surface`,
`text`, `brand`, `link`, `accent` and moves only the lightness of text, brand, link and accent until they pass the rules,
so the hues stay recognisable. The editor and retro themes were made this way.

### Picker look

`'pickerLayout' => 'auto'` (default), `'tabs'` or `'list'` on the component, or `ThemePicker::widget([..., 'layout' => 'list'])` per
form:
- `tabs`: a row of category chips (All, RapTToR, Design systems, ..., Custom), one category at a time; System stays above it
  and the page opens on the category of the current choice. Short, and it scrolls sideways on a phone.
- `list`: every group stacked with its heading, nothing hidden.
- `auto`: chips when more than `tabsAbove` (default 30) themes are offered, otherwise the list.

### Picker

The picker has an All / Light / Dark filter and, in `tabs` layout, category chips (see **Picker look**). Add `'assetManager' => ['appendTimestamp' => true]` in the host so updated package
assets are not served from a stale browser cache.

### Themes from an image

`ThemeBuilder::fromDominant(['#171d20', '#5b7392', ...], 'dark')` turns the dominant colours of any image into a theme:
the image gives the character (tint of the background, highlight, link and accent hue), then every role's lightness is
fixed so the result is readable. The built-in art themes were made this way from k-means clusters of public-domain
paintings; `credit` names the artwork.

## Less copying per app

Everything below is optional; with it a new app needs about five lines of config.

```php
// config/web.php
'components' => ['themes' => ['class' => rapttor	hemes\Themes::class, 'syncOnLogin' => true, 'baseStyles' => true]],

// a controller: the theme page and the live preview of the user-defined theme
public function actions(): array
{
    return [
        'theme' => rapttor	hemesctions\ThemeAction::class,                  // 'view' => 'your/view' to use your own page
        'theme-preview' => rapttor	hemesctions\ThemePreviewAction::class,
    ];
}

// layout: assets, variables, theme-color and the <html> attributes in one call
<html lang="en" <?= Yii::$app->themes->prepare($this, Yii::$app->user->identity) ?>>
```

- **Columns**: `./yii migrate` finds the package migration on its own (`Bootstrap`, through Composer); table = `Themes::$userTable` (default `{{%user}}`).
- **Sign-in sync**: `'syncOnLogin' => true` (or call `$themes->adopt($identity)` yourself): an account that still has the default takes the visitor's cookie choice.
- **Contrast in CI**: `./yii themes/audit` exits 1 when a theme (yours included) breaks the rules.
- **Aliases**: `'aliases' => ['old-id' => 'new-id']` keeps a stored id working after a rename or merge (the package's own in `Palettes::ALIASES`).
- **prefers-contrast**: `system` switches to High Contrast for people whose device asks for more contrast; `'systemMoreContrastLight' => null` turns it off.
- **Base stylesheet**: `'baseStyles' => true` styles body, links, buttons, inputs and cards from the tokens (soft shadows included).

## Per-app themes and groups

Every app can add its own themes and picker groups in the component config (see **Configure**): `themes` adds, overrides or
removes (`null`), `groups` names your own group ids. They come right after the System option, before RapTToR and the other built-in groups,
in the order you list them; add `'position' => 'bottom'` to put one after the built-in groups instead (a plain string is a top group):

```php
'groups' => ['brand' => 'Our brand', 'coats' => ['label' => 'Pet coats', 'position' => 'bottom']],
'themes' => ['brand-dark' => ['label' => 'Brand Dark', 'group' => 'brand', 'mode' => 'dark', /* bg surface text brand link accent */]],
```

### The user-defined theme

The reserved id `custom` is a theme built from one colour the user picks plus light or dark: that colour becomes the
highlight and tints the page, a nearby hue the link, a far hue the accent; greys give a neutral theme. It is readable for
any colour (`ThemeBuilder::fromColor()`; `audit()` samples 216 colours). The value is a string `dark:#336699`.

Host: a nullable `theme_custom varchar(16)` column next to `theme`, `...Yii::$app->themes->rules()` (validates and normalises
it), and pass it along: `$themes->registerHead($this, $id, $custom)`, `htmlAttributes($id, $custom)`, `resolved($id, $custom)`,
`remember($response, $request, $id, $custom)` (second cookie `theme_custom`), and for rendering
`$custom = $themes->customFor($identity ? (string) $identity->theme_custom : null, $request)`.
The picker shows it as a card of its own below all the groups (the Custom tile, a colour input and a Light/Dark switch); give it a `previewUrl` for the live preview,
an action that returns `$themes->preview($themes->normalize($theme), $custom)` as JSON. Without it the colour previews
after saving. Hide the whole feature with `enabledGroups` (leave `custom` out).

### Order of the picker

Device (`system`), then your own groups (the default; `'position' => 'top'`), then the built-in groups with RapTToR first and
the rest after it, then your groups marked `'position' => 'bottom'`, and finally the user-defined card (when enabled).

### Choosing which categories to offer

An app does not have to offer everything. List the group ids to show; everything else disappears from the picker and from
validation (per-theme control is the `'id' => null` entry in `themes`, no extra option needed):

```php
'enabledGroups' => ['design', 'accessibility', 'brand', 'custom'],   // null (default) = all groups
```

Built-in group ids: `design`, `rapttor`, `accessibility`, `minimal`, `soft`, `materials`, `nature`, `seasons`, `daytime`, `places`, `editors`, `art`, `retro`, plus your own (`brand`, ...) and
the reserved `custom` for user-defined themes. The `system` option is always offered, and keeps working even when the group
of its light/dark pair (`systemLight`, `systemDark`) is hidden. A user who had a theme of a hidden group stored simply gets
the `default`.

`Yii::$app->themes->audit()` returns the readability violations of every configured theme (empty array = all good); put
`assertSame([], Yii::$app->themes->audit())` in the host app's tests so its own themes are held to the same rules.

## Remembering the choice for visitors

Signed-in users store the id in their row. For visitors (and the pages around sign-in) keep it in a first-party cookie:

```php
$id = Yii::$app->themes->resolveFor($identity?->theme, Yii::$app->request);          // user's theme, else cookie, else default
Yii::$app->themes->remember(Yii::$app->response, Yii::$app->request, $id);           // after the user picks one (1 year, HttpOnly, Lax)
$cookieId = Yii::$app->themes->fromRequest(Yii::$app->request);                       // validated id or null
```

Set the cookie only as a result of the user's own choice (it is a user-interface preference, normally exempt from consent
banners; list it on your cookie page). When someone signs in for the first time, adopt `fromRequest()` as their theme if they
have none yet. The cookie name is `$themes->cookieName` (default `theme`).

## Translations

Group headings and the `system` label use the message category `themes` (`messages/<lang>/themes.php`: ar de es fr it ja ko nl
pl pt ru sh sv tr zh; machine translations, need native review). Theme names are proper names and are not translated.

For AI coding agents see [AGENTS.md](AGENTS.md) and [llms.txt](llms.txt).

## Tests

```bash
vendor/bin/phpunit -c phpunit.xml
```

## Credits

Human and Material themes follow the public colour guidance of Apple and Google; the art themes use colours extracted
from public-domain paintings (see `credit` in `Palettes.php`). License: MIT.
