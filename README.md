# rapttor/yii2-themes

Per-user **themes** for Yii2 apps. A theme is a complete set of six colours (background, surface, text, highlight, link,
accent) with its own mode (light or dark) and style (flat or soft/neumorphic), picked by **id**. 21 built in:

| Group | Themes |
|---|---|
| Device | `system`: follows the device, by default Human Light by day and Human Dark at night |
| Design systems | `human-light`, `human-dark` (Apple Human Interface system colours), `material-light`, `material-dark` (Material 3 baseline) |
| RapTToR | `rapttor-dark` (near-black and lime, as rapttor.com), `rapttor-forest` (dark green and lime), `rapttor-light` (light grey, green text and links) |
| Soft | `soft-light`, `soft-dark`, `soft-neutral`: neumorphic, depth from light and dark shadows |
| Art | `starry-night`, `great-wave`, `water-lilies`, `the-kiss`, `pearl`, `composition`, `sunflowers`, `cafe-terrace`, `impression`, `the-scream`: colours extracted from public-domain paintings |

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

### Themes from an image

`ThemeBuilder::fromDominant(['#171d20', '#5b7392', ...], 'dark')` turns the dominant colours of any image into a theme:
the image gives the character (tint of the background, highlight, link and accent hue), then every role's lightness is
fixed so the result is readable. The built-in art themes were made this way from k-means clusters of public-domain
paintings; `credit` names the artwork.

## Translations

Group headings and the `system` label use the message category `themes` (`messages/<lang>/themes.php`: ar de es fr it ja ko nl
pl pt ru sh sv tr zh; machine translations, need native review). Theme names are proper names and are not translated.

## Tests

```bash
vendor/bin/phpunit -c phpunit.xml
```

## Credits

Human and Material themes follow the public colour guidance of Apple and Google; the art themes use colours extracted
from public-domain paintings (see `credit` in `Palettes.php`). License: MIT.
