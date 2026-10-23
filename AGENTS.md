# Instructions for AI coding agents: rapttor/yii2-themes

Yii2 package that gives each user a **theme chosen by id**. A theme is a complete set of six colours with its own mode, so
there is no separate light/dark switch. Read this file before integrating or changing the package.

## What it is (and is not)

- `rapttor\themes\Themes`: application component. Lists themes, normalizes ids, renders CSS variables and `<html>` attributes.
- `rapttor\themes\widgets\ThemePicker`: grouped swatch picker for an ActiveForm, live preview via `theme-picker.js`.
- `rapttor\themes\ThemeBuilder::fromDominant($colors, 'light'|'dark')`: contrast-safe theme from the dominant colours of any image.
- `rapttor\themes\Color`: hex/HSL/contrast helpers. `rapttor\themes\Palettes::THEMES`: the built-in data.
- It does **not** store the choice (the host app owns one `theme varchar(32) default 'system'` column), restyle the host's
  components for you, or translate theme names (they are proper names; only group headings and `system` are translated).

## Integrate (4 steps)

1. `composer require rapttor/yii2-themes`; config: `'components' => ['themes' => ['class' => rapttor\themes\Themes::class]]`.
2. Store the id: column `theme varchar(32) not null default 'system'`; validate with `...Yii::$app->themes->rules()`.
3. Layout, before the head renders: `$id = $t->normalize($identity?->theme); $t->registerHead($this, $id);` and put
   `<?= $t->htmlAttributes($id) ?>` on the `<html>` tag (`$t = Yii::$app->themes`). Never hand-write `data-theme` / `data-mode`.
4. Form: `<?= \rapttor\themes\widgets\ThemePicker::widget(['form' => $form, 'model' => $model]) ?>`; save the posted id as is.

Style the host with the CSS variables only: `--bg --surface --text --muted --line --brand --brand-ink --link --accent`
and `--elev --elev-sm --elev-in`. Do not hard-code colours that should follow the theme (semantic red/green for errors are fine).
Use `--link` for links and `--brand` for buttons and highlights; text on a `--brand` background uses `--brand-ink`.

## Rules that must keep holding

- Ids are stable strings stored in users' rows: never rename or reuse an id. To retire a theme set it to `null` in the
  `themes` config (users then fall back to `default` through `normalize()`).
- Every theme must pass `tests/ThemesTest::testEveryBuiltInThemeMeetsTheContrastRules` (text 7:1 on bg and surface; muted,
  brand and link 4.5:1; accent 3:1 on bg; readable ink on brand; mode matches the background's lightness). Run
  `vendor/bin/phpunit -c phpunit.xml` after any change to `Palettes` or `Themes::resolved()`. Do not lower thresholds to make a theme pass: change the colour.
- Soft (neumorphic) themes (`'style' => 'soft'`) set `--elev*` to dual shadows; flat themes set them to `none`. Host CSS
  applies `box-shadow: var(--elev)` to raised surfaces, `var(--elev-in)` to inputs, so one stylesheet serves both. Keep input outlines or other non-shadow cues legible.
- `system` follows `prefers-color-scheme` through a media query: no `data-mode` attribute, so host dark-mode hooks must use
  `:root:not([data-mode=light])` inside `@media (prefers-color-scheme: dark)` and `:root[data-mode=dark]`.
- Art themes carry a `credit`; keep it, and show credits somewhere in the host (the picker shows it as a tooltip).
- Do not add runtime dependencies beyond Yii2. Keep PHP >= 8.2, `declare(strict_types=1)`, PSR-4 `rapttor\themes\`.

## Per-app themes, groups, cookie

- Host themes and groups go in the component config (`themes`, `groups`; a group is `'id' => 'Label'` or `['label' => ..., 'position' => 'top'|'bottom']`), never in the package's `Palettes` unless every app should get them.
- Always cover them in the host's tests: `assertSame([], Yii::$app->themes->audit())`.
- Visitors: `resolveFor($identity?->theme, $request)` for rendering, `remember($response, $request, $id)` only after the user picks a theme, and adopt `fromRequest($request)` into a new account. Never set the cookie without a user action. The host's cookie page must list it.

## Add a theme

Host-only: `'themes' => ['mine' => ['label' => 'Mine', 'group' => 'custom', 'mode' => 'light', 'bg' => '#ffffff', 'surface' => '#f5f5f5', 'text' => '#111111', 'brand' => '#0044aa', 'link' => '#0044aa', 'accent' => '#aa4400']]` in the component config.
Package-wide: add a row to `Palettes::THEMES` (same fields, optional `style`, `contrast` => `high` and `credit`), then run the tests and add the
id to the README table. From an image: extract dominant colours (for example k-means), call `ThemeBuilder::fromDominant`,
paste the result with a `credit` line. Use public-domain or otherwise clearly reusable sources.

## Files

`src/Themes.php` component, `src/Palettes.php` data, `src/ThemeBuilder.php`, `src/Color.php`, `src/widgets/ThemePicker.php`,
`src/assets/` (ThemeAsset, `theme.css` defaults and picker styles, `theme-picker.js` live preview),
`messages/<lang>/themes.php` (group headings, 15 locales, machine translations), `tests/`.
