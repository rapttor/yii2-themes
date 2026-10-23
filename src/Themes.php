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

    /** @return array<string, array<string, string>> every selectable theme including `system`, in picker order */
    public function all(): array
    {
        $own = array_filter(array_replace(Palettes::THEMES, $this->themes), static fn ($v): bool => $v !== null);
        $system = [self::SYSTEM => ['label' => 'System', 'group' => 'system', 'mode' => 'auto']];

        return $system + $own;
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
        $groups = [
            'system' => $t('Device'),
            'design' => $t('Design systems'),
            'rapttor' => 'RapTToR',
            'soft' => $t('Soft'),
            'art' => $t('Art'),
        ];
        $used = array_unique(array_column($this->all(), 'group'));
        $out = [];
        foreach ($groups as $id => $label) {
            if (in_array($id, $used, true)) {
                $out[$id] = $label;
            }
        }
        foreach ($used as $id) {
            $out[$id] ??= ucfirst((string) $id);
        }

        return $out;
    }

    /** @return array<string, string> id => name (the system entry is translated, the others are proper names) */
    public function labels(): array
    {
        $out = [];
        foreach ($this->all() as $id => $theme) {
            $out[$id] = $id === self::SYSTEM ? Yii::t($this->messageCategory, 'System') : ($theme['label'] ?? $id);
        }

        return $out;
    }

    /**
     * The theme with everything derived: muted text, lines, ink on the brand colour and (soft style) the shadows.
     * For `system` it is the light theme with the dark one under the key `dark`.
     *
     * @return array<string, mixed>
     */
    public function resolved(string $id): array
    {
        $id = $this->normalize($id);
        if ($id === self::SYSTEM) {
            return ['id' => $id, 'label' => 'System', 'group' => 'system', 'mode' => 'auto'] + $this->resolved($this->systemLight) + ['dark' => $this->resolved($this->systemDark)];
        }
        $t = $this->all()[$id] + ['style' => 'flat'];
        $dark = $t['mode'] === 'dark';
        $t['id'] = $id;
        $share = 0.62; // muted text: as soft as possible while still 4.5:1 on both the page and the surfaces
        do {
            $t['muted'] = Color::mix($t['text'], $share, $t['bg']);
            $share += 0.02;
        } while ($share < 1 && (Color::contrast($t['muted'], $t['bg']) < 4.6 || Color::contrast($t['muted'], $t['surface']) < 4.6));
        $t['line'] = Color::mix($t['text'], 0.16, $t['bg']);
        $t['brandInk'] = Color::ink($t['brand']);
        if ($t['style'] === 'soft') {
            $hi = $dark ? Color::mix('#ffffff', 0.07, $t['bg']) : Color::mix('#ffffff', 0.85, $t['bg']);
            $lo = $dark ? Color::mix('#000000', 0.45, $t['bg']) : Color::mix($t['text'], 0.3, $t['bg']);
            $t['shadowLight'] = $hi;
            $t['shadowDark'] = $lo;
        }

        return $t;
    }

    /** @return array<string, string> alias of {@see resolved()} for callers that only want the colours */
    public function colors(string $id): array
    {
        return $this->resolved($id);
    }

    /** Validation rules for a form or model with a theme attribute. */
    public function rules(string $attribute = 'theme'): array
    {
        return [[$attribute, 'in', 'range' => $this->keys()]];
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
    public function css(string $id): string
    {
        $t = $this->resolved($id);
        $css = ':root{' . $this->variables($t) . '}';
        if (isset($t['dark'])) {
            $css .= '@media (prefers-color-scheme:dark){:root{' . $this->variables($t['dark']) . '}}';
        }

        return $css;
    }

    /** Page backgrounds [light, dark] for the browser chrome / splash; both equal for a fixed-mode theme. */
    public function metaColors(string $id): array
    {
        $t = $this->resolved($id);

        return isset($t['dark']) ? [$t['bg'], $t['dark']['bg']] : [$t['bg'], $t['bg']];
    }

    /** `data-theme="x" data-mode="light|dark" data-style="soft"` for the <html> tag; data-mode is left out for `system`. */
    public function htmlAttributes(string $id): string
    {
        $t = $this->resolved($id);
        $attrs = 'data-theme="' . htmlspecialchars($t['id'], ENT_QUOTES) . '"';
        if ($t['mode'] !== 'auto') {
            $attrs .= ' data-mode="' . $t['mode'] . '"';
        }
        if (($t['style'] ?? 'flat') === 'soft') {
            $attrs .= ' data-style="soft"';
        }

        return $attrs;
    }

    /** Registers the stylesheet, the theme's variables and the theme-color meta tags. Call before the head is rendered. */
    public function registerHead(View $view, string $id): void
    {
        $id = $this->normalize($id);
        ThemeAsset::register($view);
        $view->registerCss($this->css($id), ['id' => 'theme-vars'], 'theme-vars');
        [$light, $dark] = $this->metaColors($id);
        if ($light === $dark) {
            $view->registerMetaTag(['name' => 'theme-color', 'content' => $light], 'theme-color');
        } else {
            $view->registerMetaTag(['name' => 'theme-color', 'content' => $light, 'media' => '(prefers-color-scheme: light)'], 'theme-color-light');
            $view->registerMetaTag(['name' => 'theme-color', 'content' => $dark, 'media' => '(prefers-color-scheme: dark)'], 'theme-color-dark');
        }
    }
}
