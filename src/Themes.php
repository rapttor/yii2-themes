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

    /** @var int `auto` switches to chips above this many selectable themes. */
    public int $tabsAbove = 30;

    /** Cookie that remembers the choice of visitors who are not signed in. */
    public string $cookieName = 'theme';

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
    }

    /** `dark:#336699` => ['mode' => 'dark', 'color' => '#336699'], or null when it is not a valid user-defined theme value. */
    public static function parseCustom(?string $value): ?array
    {
        if (!is_string($value) || !preg_match('/^(light|dark):(#[0-9a-f]{6})$/i', $value, $m)) {
            return null;
        }

        return ['mode' => strtolower($m[1]), 'color' => strtolower($m[2])];
    }

    public static function formatCustom(string $mode, string $color): string
    {
        return ($mode === 'dark' ? 'dark' : 'light') . ':' . strtolower($color);
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
        $builtIn = ['rapttor', 'design', 'accessibility', 'minimal', 'soft', 'materials', 'nature', 'seasons', 'daytime', 'places', 'editors', 'art', 'retro'];
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
            return ['id' => $id, 'label' => 'System', 'group' => 'system', 'mode' => 'auto'] + $this->resolveTheme($this->systemLight) + ['dark' => $this->resolveTheme($this->systemDark)];
        }
        if ($id === 'custom') {
            $spec = self::parseCustom($custom) ?? self::parseCustom($this->customDefault) ?? ['mode' => 'light', 'color' => '#2f6f9f'];

            return $this->finish(['id' => 'custom', 'label' => 'Custom', 'group' => 'custom', 'mode' => $spec['mode'], 'custom' => self::formatCustom($spec['mode'], $spec['color'])]
                + ThemeBuilder::fromColor($spec['color'], $spec['mode']));
        }

        return $this->resolveTheme($id);
    }

    /** @return array<string, mixed> */
    private function resolveTheme(string $id): array
    {
        return $this->finish(['id' => $id] + $this->catalogue()[$id]);
    }

    /** Adds what is derived from the six colours: muted text, lines, ink on the highlight colour and (soft style) shadows. @return array<string, mixed> */
    private function finish(array $t): array
    {
        $t += ['style' => 'flat'];
        $dark = $t['mode'] === 'dark';
        $high = ($t['contrast'] ?? '') === 'high';
        $share = 0.62; // muted text: as soft as possible while still 4.5:1 on both the page and the surfaces
        do {
            $t['muted'] = Color::mix($t['text'], $share, $t['bg']);
            $share += 0.02;
        } while ($share < 1 && (Color::contrast($t['muted'], $t['bg']) < ($high ? 7.1 : 4.6) || Color::contrast($t['muted'], $t['surface']) < ($high ? 7.1 : 4.6)));
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
    public function rules(string $attribute = 'theme', ?string $customAttribute = 'theme_custom'): array
    {
        $rules = [[$attribute, 'in', 'range' => $this->keys()]];
        if ($customAttribute !== null) {
            $rules[] = [$customAttribute, 'filter', 'filter' => static fn ($v): ?string => ($c = self::parseCustom(is_string($v) ? $v : null)) === null ? null : self::formatCustom($c['mode'], $c['color'])];
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
        if (($t['style'] ?? 'flat') === 'soft') {
            $hi = $t['shadowLight'];
            $lo = $t['shadowDark'];
            $v .= "--elev:7px 7px 15px $lo,-7px -7px 15px $hi;--elev-sm:4px 4px 9px $lo,-4px -4px 9px $hi;--elev-in:inset 4px 4px 9px $lo,inset -4px -4px 9px $hi;";
        } else {
            $v .= '--elev:none;--elev-sm:none;--elev-in:none;';
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

        return $css;
    }

    /** Page backgrounds [light, dark] for the browser chrome / splash; both equal for a fixed-mode theme. */
    public function metaColors(string $id, ?string $custom = null): array
    {
        $t = $this->resolved($id, $custom);

        return isset($t['dark']) ? [$t['bg'], $t['dark']['bg']] : [$t['bg'], $t['bg']];
    }

    /** `data-theme="x" data-mode="light|dark" data-style="soft"` for the <html> tag; data-mode is left out for `system`. */
    public function htmlAttributes(string $id, ?string $custom = null): string
    {
        $t = $this->resolved($id, $custom);
        $attrs = 'data-theme="' . htmlspecialchars($t['id'], ENT_QUOTES) . '"';
        if ($t['mode'] !== 'auto') {
            $attrs .= ' data-mode="' . $t['mode'] . '"';
        }
        if (($t['style'] ?? 'flat') === 'soft') {
            $attrs .= ' data-style="soft"';
        }

        return $attrs;
    }

    /** Theme id remembered in the visitor's cookie, or null when absent or no longer a valid id. */
    public function fromRequest(\yii\web\Request $request): ?string
    {
        $id = $request->cookies->getValue($this->cookieName);

        return is_string($id) && in_array($id, $this->keys(), true) ? $id : null;
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

    /** Registers the stylesheet, the theme's variables and the theme-color meta tags. Call before the head is rendered. */
    public function registerHead(View $view, string $id, ?string $custom = null): void
    {
        $id = $this->normalize($id);
        ThemeAsset::register($view);
        $view->registerCss($this->css($id, $custom), ['id' => 'theme-vars'], 'theme-vars');
        [$light, $dark] = $this->metaColors($id, $custom);
        if ($light === $dark) {
            $view->registerMetaTag(['name' => 'theme-color', 'content' => $light], 'theme-color');
        } else {
            $view->registerMetaTag(['name' => 'theme-color', 'content' => $light, 'media' => '(prefers-color-scheme: light)'], 'theme-color-light');
            $view->registerMetaTag(['name' => 'theme-color', 'content' => $dark, 'media' => '(prefers-color-scheme: dark)'], 'theme-color-dark');
        }
    }
}
