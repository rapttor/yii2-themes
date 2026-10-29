<?php

declare(strict_types=1);

namespace rapttor\themes;

use rapttor\themes\assets\ThemeAsset;
use Yii;
use yii\base\Component;
use yii\web\View;

/**
 * Application component: the themes a user can pick, by id.
 *
 *   'components' => ['themes' => ['class' => rapttor\themes\Themes::class]],
 *
 * Layout (before the head is rendered):
 *   $themes = Yii::$app->themes;
 *   $id = $themes->normalize($identity?->theme);
 *   $themes->registerHead($this, $id);                        // assets, variables, theme-color
 *   <html lang="en" <?= $themes->htmlAttributes($id) ?>>
 *
 * Form: `$themes->rules()`, `ThemePicker::widget(['form' => $form, 'model' => $model])`.
 *
 * The special id `system` follows the device: $systemLight by day, $systemDark at night. Every other id is one
 * complete theme (see Palettes) with its own mode, so there is no separate light/dark switch.
 */
class Themes extends Component
{
    public const SYSTEM = 'system';

    /** Id used when the stored value is empty or unknown. */
    public string $default = self::SYSTEM;

    public string $systemLight = 'human-light';
    public string $systemDark = 'human-dark';

    /** @var array<string, array<string, string>|null> extra themes or overrides of built-in ones (same shape as {@see Palettes::THEMES}); null removes a built-in */
    public array $themes = [];

    /**
     * @var array<string, string|array{label: string, position?: string}> the host's own picker groups, id => heading (not translated)
     * or ['label' => ..., 'position' => 'top'|'bottom']. Top (the default) = right after the `system` option, before RapTToR and
     * the other built-in groups; bottom = after the built-in ones. Within a position they keep the order given here. The
     * user-defined `custom` card is always last.
     */
    public array $groups = [];

    /**
     * @var string[]|null group ids to offer, e.g. ['design', 'rapttor', 'brand', 'custom']; null = all groups. The `system` option
     * is always offered. Themes of hidden groups disappear from the picker and from validation, and a user who had one stored
     * falls back to $default. Reserved id `custom` = the user-defined theme (once the host enables it).
     */
    public ?array $enabledGroups = null;

    /** The user-defined theme (id `custom`) when a user has not picked a colour yet: `<light|dark>:#rrggbb`. */
    public string $customDefault = 'light:#2f6f9f';

    /**
     * Look of the picker: `tabs` = category chips, one category at a time (System stays above them, `All` shows everything);
     * `list` = every group stacked with its heading; `auto` = chips when more than $tabsAbove themes are offered, else the list.
     */
    public string $pickerLayout = 'auto';

    /**
     * Where the `All` chip goes in the category chips: `last` (default), `first`, or `false` for none, so the picker never lists every
     * theme at once and always shows one category. The picker opens on the category of the current choice, else on the first category.
     */
    public string|false $allTab = 'last';

    /** @var int `auto` switches to chips above this many selectable themes. */
    public int $tabsAbove = 30;

    /** Cookie that remembers the choice of visitors who are not signed in. */
    public string $cookieName = 'theme';

    /** @var array<string, string> old id => new id for renamed or merged themes; a stored old id keeps working. Merged over {@see Palettes::ALIASES}. */
    public array $aliases = [];

    /** @var string|null theme that `system` shows under `prefers-contrast: more` (light / dark device); null = no switch. */
    public ?string $systemMoreContrastLight = 'high-contrast-light';
    public ?string $systemMoreContrastDark = 'high-contrast-dark';

    /** Table of the users whose theme is stored (used by the migration shipped in the package). */
    public string $userTable = '{{%user}}';

    /** Also register the optional base stylesheet (body, links, buttons, inputs, cards from the tokens). */
    public bool $baseStyles = false;

    /** Adopt the visitor's cookie choice into the account on sign-in, when the account still has the default. Needs the `user` component. */
    public bool $syncOnLogin = false;

    /** Offer page backgrounds (static, gradients, solid colour, animated, Unsplash photos) next to the colour themes. */
    public bool $backgroundsEnabled = true;

    /** @var array<string, array<string, array<string, mixed>|null>> host additions to the catalogue: kind (static|gradient|anim) => id => item (see {@see Backgrounds}); null removes a built-in */
    public array $backgroundItems = [];

    /** Unsplash API access key for the photo search; null = the UNSPLASH_ACCESS_KEY environment variable. Without a key the photo search is hidden. Never sent to the browser. */
    public ?string $unsplashKey = null;

    /**
     * Containers that turn semi-transparent (blurred glass over the background) when the user ticks "Liquid interface". Only the
     * outermost match is changed. CSS selector list; add your layout's wrapper (`.app-shell`, ...).
     */
    public string $liquidSelectors = 'main, [role=main], .container, .container-fluid, .container-xxl, .container-xl, .container-lg, .container-md, .container-sm, [data-liquid-surface]';

    /** Transparency (0-70 %) the picker starts with when a user first ticks "Liquid interface"; 0 = the checkbox starts unticked at 40 %. */
    public int $liquidDefault = 0;

    /** Name used in the Unsplash credit links (utm_source); null = the application name. */
    public ?string $appName = null;

    /** Message category for group names; sources ship in messages/<lang>/themes.php. */
    public string $messageCategory = 'themes';

    public function init(): void
    {
        parent::init();
        Yii::setAlias('@rapttor/themes', dirname(__DIR__));
        $i18n = Yii::$app->getI18n();
        if (!isset($i18n->translations[$this->messageCategory]) && !isset($i18n->translations[$this->messageCategory . '*'])) {
            $i18n->translations[$this->messageCategory] = [
                'class' => \yii\i18n\PhpMessageSource::class,
                'basePath' => '@rapttor/themes/messages',
                'sourceLanguage' => 'en',
            ];
        }
        if ($this->syncOnLogin && Yii::$app instanceof \yii\web\Application) {
            Yii::$app->on(\yii\base\Application::EVENT_BEFORE_REQUEST, function (): void {
                Yii::$app->getUser()->on(\yii\web\User::EVENT_AFTER_LOGIN, function (\yii\web\UserEvent $e): void {
                    $this->adopt($e->identity, Yii::$app->getRequest());
                });
            });
        }
    }

    /** The current id for a stored one: follows {@see $aliases} (old id => new id) so a renamed or merged theme keeps working. */
    public function resolveAlias(?string $id): ?string
    {
        $map = $this->aliases + Palettes::ALIASES;
        for ($i = 0; $id !== null && isset($map[$id]) && $i < 10; $i++) {
            $id = $map[$id];
        }

        return $id;
    }

    /**
     * `dark:#336699` => ['mode' => 'dark', 'color' => '#336699', 'colors' => ['#336699']], or null when it is not a valid value.
     * Up to five colours, `dark:#336699,#aa8844,...` (most dominant first), describe a palette taken from a photo (see
     * {@see Backgrounds::palette()}); the user-defined theme itself always has one.
     */
    public static function parseCustom(?string $value): ?array
    {
        if (!is_string($value) || !preg_match('/^(light|dark):(#[0-9a-f]{6}(?:,#[0-9a-f]{6}){0,4})$/i', $value, $m)) {
            return null;
        }
        $colors = explode(',', strtolower($m[2]));

        return ['mode' => strtolower($m[1]), 'color' => $colors[0], 'colors' => $colors];
    }

    /** @param string|string[] $colors one colour, or up to five (a palette) */
    public static function formatCustom(string $mode, string|array $colors): string
    {
        return ($mode === 'dark' ? 'dark' : 'light') . ':' . strtolower(implode(',', array_slice((array) $colors, 0, 5)));
    }

    /** @return array<string, array<string, string>> every theme the app knows, in picker order (grouped), whatever $enabledGroups says */
    private function catalogue(): array
    {
        $own = array_filter(array_replace(Palettes::THEMES, $this->themes), static fn ($v): bool => $v !== null);
        $own['custom'] = ['label' => 'Custom', 'group' => 'custom', 'mode' => 'auto']; // the user-defined theme, built from the user's colour
        $order = array_flip($this->groupOrder(array_unique(array_column($own, 'group'))));
        $i = 0;
        $index = [];
        foreach ($own as $id => $theme) {
            $index[$id] = [$order[$theme['group']] ?? PHP_INT_MAX, $i++];
        }
        uksort($own, static fn (string $a, string $b): int => $index[$a] <=> $index[$b]);

        return $own;
    }

    /** @return array<string, array<string, string>> every selectable theme including `system`, in picker order (grouped), limited to $enabledGroups */
    public function all(): array
    {
        $own = $this->catalogue();
        if ($this->enabledGroups !== null) {
            $own = array_filter($own, fn (array $t): bool => in_array($t['group'], $this->enabledGroups, true));
        }

        return [self::SYSTEM => ['label' => 'System', 'group' => 'system', 'mode' => 'auto']] + $own;
    }

    /**
     * Group ids in picker order: system, host groups with position top, built-in groups (RapTToR first), host groups at the bottom, and the user-defined `custom` last.
     *
     * @param string[] $used group ids that have at least one theme
     * @return string[]
     */
    private function groupOrder(array $used): array
    {
        $builtIn = ['rapttor', 'design', 'accessibility', 'minimal', 'soft', 'glass', 'materials', 'nature', 'seasons', 'daytime', 'places', 'editors', 'art', 'retro'];
        $top = $bottom = [];
        foreach ($this->groups as $id => $def) {
            if ($this->groupPosition($def) === 'top') {
                $top[] = (string) $id;
            } else {
                $bottom[] = (string) $id;
            }
        }
        $ordered = array_merge([self::SYSTEM], $top, $builtIn, $bottom, ['custom']);
        foreach ($used as $id) { // groups used by a theme but declared nowhere keep their place at the very end
            if (!in_array($id, $ordered, true)) {
                $ordered[] = $id;
            }
        }

        return array_values(array_filter($ordered, static fn (string $id): bool => in_array($id, $used, true) || $id === self::SYSTEM));
    }

    private function groupPosition(string|array $def): string
    {
        return is_array($def) && ($def['position'] ?? 'top') === 'bottom' ? 'bottom' : 'top';
    }

    /** The picker look to use for the themes on offer: `tabs` or `list` (resolves `auto`). */
    public function layoutFor(?string $override = null): string
    {
        $layout = $override ?? $this->pickerLayout;
        if ($layout === 'tabs' || $layout === 'list') {
            return $layout;
        }

        return count($this->all()) - 1 > $this->tabsAbove ? 'tabs' : 'list'; // minus the System option
    }

    /** @return string[] */
    public function keys(): array
    {
        return array_keys($this->all());
    }

    public function normalize(?string $id): string
    {
        $all = $this->all();
        $id = $this->resolveAlias($id);

        return $id !== null && isset($all[$id]) ? $id : (isset($all[$this->default]) ? $this->default : self::SYSTEM);
    }

    /** @return array<string, string> group id => translated heading, in picker order */
    public function groups(): array
    {
        $t = fn (string $s): string => Yii::t($this->messageCategory, $s);
        $labels = [
            'system' => $t('Device'),
            'custom' => $t('Custom'),
            'design' => $t('Design systems'),
            'rapttor' => 'RapTToR',
            'accessibility' => $t('Accessibility'),
            'minimal' => $t('Minimal'),
            'soft' => $t('Soft'),
            'glass' => $t('Glass'),
            'materials' => $t('Materials'),
            'nature' => $t('Nature'),
            'seasons' => $t('Seasons'),
            'daytime' => $t('Times of day'),
            'places' => $t('Places'),
            'editors' => $t('Editors'),
            'art' => $t('Art'),
            'retro' => $t('Retro'),
        ];
        foreach ($this->groups as $id => $def) {
            $labels[(string) $id] = is_array($def) ? (string) $def['label'] : (string) $def;
        }
        $used = array_unique(array_column($this->all(), 'group'));
        $out = [];
        foreach ($this->groupOrder($used) as $id) {
            $out[$id] = $labels[$id] ?? ucfirst($id);
        }

        return $out;
    }

    /** @return array<string, string> id => name (the system entry is translated, the others are proper names) */
    public function labels(): array
    {
        $out = [];
        foreach ($this->all() as $id => $theme) {
            $out[$id] = $id === self::SYSTEM ? Yii::t($this->messageCategory, 'System') : ($id === 'custom' ? Yii::t($this->messageCategory, 'Custom') : ($theme['label'] ?? $id));
        }

        return $out;
    }

    /**
     * The theme with everything derived: muted text, lines, ink on the brand colour and (soft style) the shadows.
     * For `system` it is the light theme with the dark one under the key `dark`.
     *
     * @return array<string, mixed>
     */
    public function resolved(string $id, ?string $custom = null): array
    {
        $id = $this->normalize($id);
        if ($id === self::SYSTEM) {
            // the pair may belong to a hidden group: resolve it from the full catalogue
            return ['id' => $id, 'label' => 'System', 'group' => 'system', 'mode' => 'auto'] + $this->resolveTheme($this->systemLight) + ['dark' => $this->resolveTheme($this->systemDark)]
                + ($this->systemMoreContrastLight !== null && $this->systemMoreContrastDark !== null && isset($this->catalogue()[$this->systemMoreContrastLight], $this->catalogue()[$this->systemMoreContrastDark])
                    ? ['moreContrast' => $this->resolveTheme($this->systemMoreContrastLight), 'moreContrastDark' => $this->resolveTheme($this->systemMoreContrastDark)] : []);
        }
        if ($id === 'custom') {
            $spec = self::parseCustom($custom) ?? self::parseCustom($this->customDefault) ?? ['mode' => 'light', 'color' => '#2f6f9f', 'colors' => ['#2f6f9f']];
            $roles = count($spec['colors']) > 1 ? ThemeBuilder::fromDominant($spec['colors'], $spec['mode']) : ThemeBuilder::fromColor($spec['color'], $spec['mode']);

            return $this->finish(['id' => 'custom', 'label' => 'Custom', 'group' => 'custom', 'mode' => $spec['mode'], 'custom' => self::formatCustom($spec['mode'], $spec['colors'])] + $roles);
        }

        return $this->resolveTheme($id);
    }

    /** @return array<string, mixed> */
    private function resolveTheme(string $id): array
    {
        return $this->finish(['id' => $id] + $this->catalogue()[$id]);
    }

    /** Share of a blob colour over the page in the glass page gradient, and the worst case where blobs overlap (used by the audit). */
    private const GLASS_BLOB = 0.34;
    private const GLASS_BLOB_WORST = 0.48;

    /** @return string[] the glass surface (surface at its alpha) over the worst backdrops: the page itself and each blob colour at full strength */
    private function glassSurfaces(array $t): array
    {
        $alpha = (float) ($t['glassAlpha'] ?? 0.58);
        $out = [Color::mix($t['surface'], $alpha, $t['bg'])];
        foreach (['brand', 'accent', 'link'] as $role) {
            $out[] = Color::mix($t['surface'], $alpha, Color::mix($t[$role], self::GLASS_BLOB_WORST, $t['bg']));
        }

        return $out;
    }

    /** Adds what is derived from the six colours: muted text, lines, ink on the highlight colour and (soft style) shadows, (glass style) the translucent surfaces. @return array<string, mixed> */
    private function finish(array $t): array
    {
        $t += ['style' => 'flat'];
        $dark = $t['mode'] === 'dark';
        $high = ($t['contrast'] ?? '') === 'high';
        $grounds = [$t['bg'], $t['surface']];
        if ($t['style'] === 'glass') {
            $t['glassAlpha'] = (float) ($t['glassAlpha'] ?? 0.58);
            $t['glass'] = $this->glassSurfaces($t);
            $grounds = array_merge($grounds, $t['glass']);
        }
        $need = $high ? 7.1 : 4.6;
        $share = 0.62; // muted text: as soft as possible while still 4.5:1 on the page and on every surface it can sit on
        do {
            $t['muted'] = Color::mix($t['text'], $share, $t['bg']);
            $share += 0.02;
            $ok = true;
            foreach ($grounds as $g) {
                $ok = $ok && Color::contrast($t['muted'], $g) >= $need;
            }
        } while ($share < 1 && !$ok);
        $t['line'] = Color::mix($t['text'], $high ? 0.6 : 0.16, $t['bg']);
        $t['brandInk'] = Color::ink($t['brand']);
        if ($t['style'] === 'soft') {
            $t['shadowLight'] = $dark ? Color::mix('#ffffff', 0.07, $t['bg']) : Color::mix('#ffffff', 0.85, $t['bg']);
            $t['shadowDark'] = $dark ? Color::mix('#000000', 0.45, $t['bg']) : Color::mix($t['text'], 0.3, $t['bg']);
        }

        return $t;
    }

    /** @return array<string, string> alias of {@see resolved()} for callers that only want the colours */
    public function colors(string $id): array
    {
        return $this->resolved($id);
    }

    /** Validation rules for a form or model with a theme attribute. */
    public function rules(string $attribute = 'theme', ?string $customAttribute = 'theme_custom', ?string $backgroundAttribute = 'theme_bg'): array
    {
        $rules = [
            [$attribute, 'filter', 'filter' => fn ($v) => is_string($v) ? $this->resolveAlias($v) : $v],
            [$attribute, 'in', 'range' => $this->keys()],
        ];
        if ($customAttribute !== null) {
            $rules[] = [$customAttribute, 'filter', 'filter' => static fn ($v): ?string => ($c = self::parseCustom(is_string($v) ? $v : null)) === null ? null : self::formatCustom($c['mode'], $c['color'])];
        }

        if ($backgroundAttribute !== null) {
            $rules[] = [$backgroundAttribute, 'filter', 'filter' => fn ($v): string => $this->formatBackground(is_string($v) ? $v : null)];
        }

        return $rules;
    }

    /** What the picker's live preview needs for one choice: the variables and the <html> attributes. @return array{css: string, attrs: string} */
    public function preview(string $id, ?string $custom = null): array
    {
        return ['css' => $this->css($id, $custom), 'attrs' => $this->htmlAttributes($id, $custom)];
    }

    /** CSS variables of one resolved theme as `--bg:#...;--text:...;`. */
    private function variables(array $t): string
    {
        $v = '--bg:' . $t['bg'] . ';--surface:' . $t['surface'] . ';--text:' . $t['text'] . ';--muted:' . $t['muted'] . ';--line:' . $t['line']
            . ';--brand:' . $t['brand'] . ';--brand-ink:' . $t['brandInk'] . ';--link:' . $t['link'] . ';--accent:' . $t['accent'] . ';';
        $style = $t['style'] ?? 'flat';
        $dark = $t['mode'] === 'dark';
        if ($style === 'soft') {
            $hi = $t['shadowLight'];
            $lo = $t['shadowDark'];
            $v .= "--elev:7px 7px 15px $lo,-7px -7px 15px $hi;--elev-sm:4px 4px 9px $lo,-4px -4px 9px $hi;--elev-in:inset 4px 4px 9px $lo,inset -4px -4px 9px $hi;";
        } elseif ($style === 'glass') {
            $v .= $dark
                ? '--elev:0 8px 32px rgba(0,0,0,.45);--elev-sm:0 4px 14px rgba(0,0,0,.35);--elev-in:inset 0 1px 0 rgba(255,255,255,.08);'
                : '--elev:0 8px 32px rgba(31,38,64,.16);--elev-sm:0 4px 14px rgba(31,38,64,.12);--elev-in:inset 0 1px 0 rgba(255,255,255,.6);';
        } else {
            $v .= '--elev:none;--elev-sm:none;--elev-in:none;';
        }
        if ($style === 'glass') { // translucent surfaces over a soft colour page: backdrop blur, a light edge, the page gradient
            $rgba = static fn (string $hex, float $a): string => vsprintf('rgba(%d,%d,%d,%s)', [...Color::rgb($hex), rtrim(rtrim(sprintf('%.2f', $a), '0'), '.')]);
            $b = self::GLASS_BLOB;
            $v .= '--glass-bg:' . $rgba($t['surface'], $t['glassAlpha']) . ';--glass-filter:blur(18px) saturate(160%);--glass-line:' . ($dark ? 'rgba(255,255,255,.16)' : 'rgba(255,255,255,.65)')
                . ';--page-bg:radial-gradient(60% 55% at 12% 8%,' . $rgba($t['brand'], $b) . ',transparent 70%),radial-gradient(50% 50% at 88% 18%,' . $rgba($t['accent'], $b)
                . ',transparent 70%),radial-gradient(60% 55% at 55% 100%,' . $rgba($t['link'], $b) . ',transparent 70%),' . $t['bg'] . ';';
        } else {
            $v .= '--glass-bg:var(--surface);--glass-filter:none;--glass-line:var(--line);--page-bg:var(--bg);';
        }

        return $v;
    }

    /** Variables for one theme; `system` gives the light theme and, under the media query, the dark one. */
    public function css(string $id, ?string $custom = null): string
    {
        $t = $this->resolved($id, $custom);
        $css = ':root{' . $this->variables($t) . '}';
        if (isset($t['dark'])) {
            $css .= '@media (prefers-color-scheme:dark){:root{' . $this->variables($t['dark']) . '}}';
        }
        if (isset($t['moreContrast'])) { // `system` honours a device asking for more contrast
            $css .= '@media (prefers-contrast:more){:root{' . $this->variables($t['moreContrast']) . '}}'
                . '@media (prefers-contrast:more) and (prefers-color-scheme:dark){:root{' . $this->variables($t['moreContrastDark']) . '}}';
        }

        return $css;
    }

    /** Page backgrounds [light, dark] for the browser chrome / splash; both equal for a fixed-mode theme. */
    public function metaColors(string $id, ?string $custom = null): array
    {
        $t = $this->resolved($id, $custom);

        return isset($t['dark']) ? [$t['bg'], $t['dark']['bg']] : [$t['bg'], $t['bg']];
    }

    /** `data-theme="x" data-mode="light|dark" data-style="soft"` for the <html> tag; data-mode is left out for `system`. */
    public function htmlAttributes(string $id, ?string $custom = null, ?Background $bg = null): string
    {
        $t = $this->resolved($id, $custom);
        $attrs = 'data-theme="' . htmlspecialchars($t['id'], ENT_QUOTES) . '"';
        if ($t['mode'] !== 'auto') {
            $attrs .= ' data-mode="' . $t['mode'] . '"';
        }
        if (($t['style'] ?? 'flat') !== 'flat') {
            $attrs .= ' data-style="' . $t['style'] . '"';
        }
        if ($bg !== null && $this->backgroundsEnabled) {
            $attrs .= ' data-bg="' . $bg->kind . '"' . ($bg->liquid > 0 ? ' data-liquid' : '');
            if ($bg->kind === 'img') {
                $attrs .= ' data-bg-credit="' . htmlspecialchars(($bg->by ?? '') . '|' . ($bg->user ?? '') . '|' . ($bg->photoId ?? ''), ENT_QUOTES) . '"';
            } elseif ($bg->id !== '') {
                $attrs .= ' data-bg-id="' . htmlspecialchars($bg->id, ENT_QUOTES) . '"';
            }
        }

        return $attrs;
    }

    /** Theme id remembered in the visitor's cookie, or null when absent or no longer a valid id. */
    public function fromRequest(\yii\web\Request $request): ?string
    {
        $id = $request->cookies->getValue($this->cookieName);

        $id = is_string($id) ? $this->resolveAlias($id) : null;

        return $id !== null && in_array($id, $this->keys(), true) ? $id : null;
    }

    /** Remembers the choice for a year (first-party preference cookie set by the user's own action). */
    public function remember(\yii\web\Response $response, \yii\web\Request $request, string $id, ?string $custom = null): void
    {
        $customSpec = self::parseCustom($custom);
        if ($this->normalize($id) === 'custom' && $customSpec !== null) {
            $response->cookies->add(new \yii\web\Cookie([
                'name' => $this->cookieName . '_custom',
                'value' => self::formatCustom($customSpec['mode'], $customSpec['color']),
                'expire' => time() + 365 * 86400,
                'httpOnly' => true,
                'secure' => $request->isSecureConnection,
                'sameSite' => \yii\web\Cookie::SAME_SITE_LAX,
            ]));
        }
        $response->cookies->add(new \yii\web\Cookie([
            'name' => $this->cookieName,
            'value' => $this->normalize($id),
            'expire' => time() + 365 * 86400,
            'httpOnly' => true,
            'secure' => $request->isSecureConnection,
            'sameSite' => \yii\web\Cookie::SAME_SITE_LAX,
        ]));
    }

    /** The visitor's user-defined theme value from the cookie, or null. */
    public function customFromRequest(\yii\web\Request $request): ?string
    {
        $c = self::parseCustom($request->cookies->getValue($this->cookieName . '_custom'));

        return $c === null ? null : self::formatCustom($c['mode'], $c['color']);
    }

    /** The user-defined theme value to render: the signed-in user's stored value (pass '' when there is none), else the visitor's cookie. */
    public function customFor(?string $stored, \yii\web\Request $request): ?string
    {
        if ($stored !== null) {
            $c = self::parseCustom($stored);

            return $c === null ? null : self::formatCustom($c['mode'], $c['color']);
        }

        return $this->customFromRequest($request);
    }

    /**
     * The id to render: the signed-in user's stored theme, else the cookie of a visitor, else the default.
     * Pass null as $stored for visitors.
     */
    public function resolveFor(?string $stored, \yii\web\Request $request): string
    {
        return $this->normalize($stored ?? $this->fromRequest($request));
    }

    /**
     * Checks every theme (built-in and configured) against the readability rules.
     *
     * @return array<string, string[]> theme id => violated rules; empty when everything passes
     */
    public function audit(): array
    {
        $problems = [];
        foreach ($this->keys() as $id) {
            $r = $this->resolved($id);
            foreach (isset($r['dark']) ? [$r, $r['dark']] : [$r] as $t) {
                $name = $t['id'];
                $check = static function (string $rule, float $have, float $need) use (&$problems, $id, $name): void {
                    if ($have < $need) {
                        $problems[$id][] = sprintf('%s: %s %.2f < %.1f', $name, $rule, $have, $need);
                    }
                };
                foreach (['bg', 'surface'] as $g) {
                    $check("text on $g", Color::contrast($t['text'], $t[$g]), 7.0);
                    $check("muted on $g", Color::contrast($t['muted'], $t[$g]), 4.5);
                    $check("brand on $g", Color::contrast($t['brand'], $t[$g]), 4.5);
                    $check("link on $g", Color::contrast($t['link'], $t[$g]), 4.5);
                }
                foreach ($t['glass'] ?? [] as $i => $surface) { // translucent surfaces over the page gradient's worst spots
                    $check("text on glass $i", Color::contrast($t['text'], $surface), 7.0);
                    $check("muted on glass $i", Color::contrast($t['muted'], $surface), 4.5);
                    $check("brand on glass $i", Color::contrast($t['brand'], $surface), 4.5);
                    $check("link on glass $i", Color::contrast($t['link'], $surface), 4.5);
                }
                $check('ink on brand', Color::contrast($t['brandInk'], $t['brand']), 4.5);
                $check('accent on bg', Color::contrast($t['accent'], $t['bg']), 3.0);
                if (($t['mode'] === 'dark') !== (Color::luminance($t['bg']) < 0.2)) {
                    $problems[$id][] = $name . ': mode does not match the background';
                }
            }
        }

        // the user-defined theme must hold for any colour: sample hues, saturations and both modes
        foreach (['light', 'dark'] as $mode) {
            foreach ([0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330] as $hue) {
                foreach ([0.05, 0.5, 1.0] as $sat) {
                    foreach ([0.15, 0.5, 0.85] as $l) {
                        $color = Color::fromHsl($hue, $sat, $l);
                        $t = $this->resolved('custom', self::formatCustom($mode, $color));
                        foreach (['bg', 'surface'] as $g) {
                            foreach ([['text', 7.0], ['muted', 4.5], ['brand', 4.5], ['link', 4.5]] as [$role, $min]) {
                                if (Color::contrast($t[$role], $t[$g]) < $min) {
                                    $problems['custom'][] = "$mode $color: $role on $g";
                                }
                            }
                        }
                        if (Color::contrast($t['brandInk'], $t['brand']) < 4.5 || Color::contrast($t['accent'], $t['bg']) < 3.0) {
                            $problems['custom'][] = "$mode $color: ink or accent";
                        }
                    }
                }
            }
        }

        return $problems;
    }

    private ?Backgrounds $backgroundCatalogue = null;

    public function backgrounds(): Backgrounds
    {
        return $this->backgroundCatalogue ??= new Backgrounds($this->backgroundItems);
    }

    /** The background in a stored value (cookie or column), validated; null = none. */
    public function parseBackground(?string $value): ?Background
    {
        return $this->backgroundsEnabled ? $this->backgrounds()->parse($value) : null;
    }

    /** Canonical string of a posted or stored background value ('' = none); what the form and the cookie should hold. */
    public function formatBackground(?string $value): string
    {
        return (string) ($this->parseBackground($value) ?? '');
    }

    public function unsplashKey(): ?string
    {
        $key = $this->unsplashKey ?? (getenv('UNSPLASH_ACCESS_KEY') ?: ($_ENV['UNSPLASH_ACCESS_KEY'] ?? null));

        return is_string($key) && $key !== '' ? $key : null;
    }

    /** The background from the visitor's cookie, or null. */
    public function backgroundFromRequest(\yii\web\Request $request): ?Background
    {
        $v = $request->cookies->getValue($this->cookieName . '_bg');

        return is_string($v) ? $this->parseBackground($v) : null;
    }

    /** The background to render: the signed-in user's stored value (null when the account has none), else the cookie. */
    public function backgroundFor(?string $stored, \yii\web\Request $request): ?Background
    {
        return ($stored !== null ? $this->parseBackground($stored) : null) ?? $this->backgroundFromRequest($request);
    }

    /** Remembers the background for a year, or forgets it for null / an invalid value. Call only after the user's own choice. */
    public function rememberBackground(\yii\web\Response $response, \yii\web\Request $request, ?string $value): void
    {
        $bg = $this->parseBackground($value);
        $response->cookies->add(new \yii\web\Cookie([
            'name' => $this->cookieName . '_bg',
            'value' => $bg === null ? '' : (string) $bg,
            'expire' => $bg === null ? 1 : time() + 365 * 86400,
            'httpOnly' => true,
            'secure' => $request->isSecureConnection,
            'sameSite' => \yii\web\Cookie::SAME_SITE_LAX,
        ]));
    }

    /**
     * The theme to show when the background carries its own palette and the user asked for it, else the chosen one.
     *
     * @return array{0: string, 1: ?string} id and user-defined value
     */
    public function effective(string $id, ?string $custom, ?Background $bg): array
    {
        if ($bg !== null && $bg->palette && ($p = $this->backgrounds()->palette($bg)) !== null && in_array($p['id'], $this->keys(), true)) {
            return [$p['id'], $p['custom']];
        }

        return [$this->normalize($id), $custom];
    }

    /**
     * One call for the layout: works out the theme of the signed-in user (else the visitor's cookie, else the default), registers
     * the head and returns the `<html>` attributes. `$identity` needs a `theme` and, for the user-defined theme, a `theme_custom` property.
     *
     *   <html lang="en" <?= Yii::$app->themes->prepare($this, Yii::$app->user->identity) ?>>
     */
    public function prepare(View $view, ?object $identity = null, ?\yii\web\Request $request = null): string
    {
        $request ??= Yii::$app->getRequest();
        $stored = $identity !== null ? $this->identityValue($identity, 'theme') : null;
        $id = $this->resolveFor($stored, $request);
        $custom = $this->customFor($identity !== null ? (string) $this->identityValue($identity, 'theme_custom') : null, $request);
        $bg = $this->backgroundFor($identity !== null ? $this->identityValue($identity, 'theme_bg') : null, $request);
        [$id, $custom] = $this->effective($id, $custom, $bg);
        $this->registerHead($view, $id, $custom, $bg);

        return $this->htmlAttributes($id, $custom, $bg);
    }

    private function identityValue(object $identity, string $name): ?string
    {
        $v = $identity instanceof \yii\base\BaseObject || $identity instanceof \yii\base\Model ? ($identity->canGetProperty($name) ? $identity->$name : null) : ($identity->$name ?? null);

        return $v === null || $v === '' ? null : (string) $v;
    }

    /**
     * Sign-in sync: when the account has no theme of its own yet (empty or the default) and the visitor chose one before signing
     * in (cookie), the account takes it. Returns true when the identity was changed and saved.
     */
    public function adopt(object $identity, ?\yii\web\Request $request = null): bool
    {
        $request ??= Yii::$app->getRequest();
        $own = $this->identityValue($identity, 'theme');
        $cookie = $this->fromRequest($request);
        if ($cookie === null || ($own !== null && $this->normalize($own) !== $this->normalize($this->default)) || !$identity instanceof \yii\db\ActiveRecord) {
            return false;
        }
        $values = ['theme' => $cookie];
        if ($cookie === 'custom' && $identity->hasAttribute('theme_custom')) {
            $values['theme_custom'] = $this->customFromRequest($request);
        }

        return $identity->updateAttributes($values) > 0;
    }

    /** The "liquid interface" rule: outermost containers get the surface colour at `--tbg-liquid` opacity plus a backdrop blur. Active only with `html[data-liquid]`. */
    public function liquidCss(): string
    {
        $sel = $this->liquidSelectors;

        return "html[data-liquid] :is($sel):not(:is($sel) :is($sel)){background-color:color-mix(in srgb,var(--surface) var(--tbg-liquid,60%),transparent)!important;"
            . '-webkit-backdrop-filter:blur(16px) saturate(140%);backdrop-filter:blur(16px) saturate(140%);}';
    }

    /** Registers the stylesheet, the theme's variables and the theme-color meta tags. Call before the head is rendered. */
    public function registerHead(View $view, string $id, ?string $custom = null, ?Background $bg = null): void
    {
        $id = $this->normalize($id);
        ThemeAsset::register($view);
        if ($this->baseStyles) {
            \rapttor\themes\assets\ThemeBaseAsset::register($view);
        }
        $view->registerCss($this->css($id, $custom), ['id' => 'theme-vars'], 'theme-vars');
        if ($bg !== null && $this->backgroundsEnabled) {
            $view->registerCss(':root{' . $this->backgrounds()->variables($bg) . '}', ['id' => 'theme-bg-vars'], 'theme-bg-vars');
        }
        if ($this->backgroundsEnabled) {
            $view->registerCss($this->liquidCss(), ['id' => 'theme-liquid'], 'theme-liquid');
            $view->registerJs('window.rapttorThemeBgApp=' . \yii\helpers\Json::htmlEncode($this->appName ?? Yii::$app->name) . ';', View::POS_HEAD, 'theme-bg-app');
        }
        [$light, $dark] = $this->metaColors($id, $custom);
        if ($light === $dark) {
            $view->registerMetaTag(['name' => 'theme-color', 'content' => $light], 'theme-color');
        } else {
            $view->registerMetaTag(['name' => 'theme-color', 'content' => $light, 'media' => '(prefers-color-scheme: light)'], 'theme-color-light');
            $view->registerMetaTag(['name' => 'theme-color', 'content' => $dark, 'media' => '(prefers-color-scheme: dark)'], 'theme-color-dark');
        }
    }
}
