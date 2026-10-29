# Tasks

| Status | Task | Model |
|---|---|---|
| done | Aliases map (`aliases`, `Palettes::ALIASES`) | Sonnet |
| done | CHANGELOG, GitHub Actions CI, `tests/audit.php` | Haiku |
| done | `prepare()`, `adopt()`/`syncOnLogin`, `ThemeAction`, `ThemePreviewAction`, `ThemeForm`, migration, `Bootstrap` | Sonnet |
| done | `yii themes/audit`, `prefers-contrast: more`, optional `base.css` | Sonnet |
| todo (owner) | Commit, tag `v1.0.0`, push, register on Packagist, set the Packagist auto-update webhook | Haiku |
| todo (owner) | In host apps: drop the path repository, replace copied pieces with the package ones | Sonnet |
| later | `Themes::tokens($id)` + JSON endpoint, when the mobile app starts | Sonnet |

## 1.1.0: glass themes and page backgrounds

| Status | Task | Model |
|---|---|---|
| done | Glass group (6 themes, `style=glass`, `--glass-*` tokens, audit rule for translucent surfaces), chalkboard + graphite themes | Opus (contrast maths) |
| done | `Background` value (parse/format/validate, cookie + optional `theme_bg` column), `Backgrounds` catalogue (static, gradients, solid, animated, image), palette per background | Sonnet |
| done | `Themes` integration: `prepare()`, css vars `--tbg-image` / `--tbg-overlay`, `data-bg*` attrs, `rememberBackground()` | Sonnet |
| done | Unsplash: server-side search proxy (key from env, never sent to the browser), download tracking, attribution | Sonnet |
| done | 48 animated effects (20 + 16 + 12, categories)  `src/assets/bg/*.js` + loader `theme-bg.js` (CodePen links could not be read, 403: effects are original) | Sonnet (agent) |
| done | Picker: Colours / Backgrounds tabs, overlay white/black + slider, "use this background's colours", remove background | Sonnet |
| done | Tests, README, AGENTS.md, CHANGELOG, migration column `theme_bg` | Haiku/Sonnet |
