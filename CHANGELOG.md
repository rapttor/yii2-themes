# Changelog

Format: [Keep a Changelog](https://keepachangelog.com), versioning: [SemVer](https://semver.org). Theme ids are part of the public API:
they are never renamed or reused; a rename or merge adds an entry to `aliases`.

## [1.0.1] - 2026-10-23

### Fixed
- `ThemeAction` default view pointed at `@rapttor/themes/views/theme`, which does not exist (the view is in `src/views`): the theme page returned a 500 unless the host set `view`.
- README: the class names in "Less copying per app" had lost their backslashes (`\t`, `\a` turned into control characters).

## [1.0.0] - 2026-10-23

### Added
- 73 built-in themes in 13 groups, `system` (follows the device) and the user-defined `custom` theme.
- `Themes` component, `ThemePicker` widget with live preview, `ThemeBuilder`, `Color`, per-app themes and groups, `enabledGroups`, visitor cookie.
- `aliases` (old id => new id, also `Palettes::ALIASES`): a renamed or merged theme keeps working for users who stored the old id.
- `Themes::prepare($view, $identity)`: the layout in one call (registers the head, returns the `<html>` attributes).
- `Themes::adopt()` and `'syncOnLogin' => true`: the account takes the theme the visitor chose before signing in.
- `ThemeAction`, `ThemePreviewAction`, `ThemeForm` and a default view: the theme page without copying code.
- Namespaced migration `rapttor\themes\migrations` for the `theme` and `theme_custom` user columns (`Themes::$userTable`).
- Console command `yii themes/audit` (exit code 1 on any contrast violation) for the host's CI; registered by `Bootstrap` together with the migration namespace.
- `system` honours `prefers-contrast: more` (High Contrast; `systemMoreContrastLight/Dark`, `null` turns it off).
- Optional base stylesheet (`'baseStyles' => true`): body, links, buttons, inputs and cards from the tokens, including the soft shadows.
- GitHub Actions: tests and contrast audit on PHP 8.2 to 8.4.
