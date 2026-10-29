<?php

declare(strict_types=1);

namespace rapttor\themes\widgets;

use rapttor\themes\Background;
use rapttor\themes\Backgrounds;
use rapttor\themes\Themes;
use Yii;
use yii\base\Model;
use yii\base\Widget;
use yii\helpers\Html;
use yii\widgets\ActiveForm;

/**
 * Theme picker for an ActiveForm: grouped swatches (background, text sample and the highlight, link and accent colours),
 * previewing live (see theme-picker.js), with category chips (one category at a time, or All) and an All / Light / Dark filter. The label comes from the
 * model's attributeLabels(). The custom controls live inside the picker, so the field reads its value from the theme radios by
 * name (otherwise Yii's client-side validation would read the colour input).
 *
 *   <?= ThemePicker::widget(['form' => $form, 'model' => $model]) ?>   // attribute `theme`
 */
final class ThemePicker extends Widget
{
    public ActiveForm $form;
    public Model $model;
    public string $attribute = 'theme';
    public ?Themes $themes = null;

    /** `tabs`, `list` or `auto`; null = the Themes component's `pickerLayout`. */
    public ?string $layout = null;

    /** Attribute holding the user-defined theme value (`dark:#336699`); null or a model without it = no custom controls. */
    public ?string $customAttribute = 'theme_custom';

    /** URL returning {css, attrs} for `?theme=custom&custom=dark:#336699` (Themes::preview()); without it the custom theme previews after saving. */
    public ?string $previewUrl = null;

    /** Attribute holding the background value (JSON, see {@see \rapttor\themes\Background}); null or a model without it = no Backgrounds tab. */
    public ?string $backgroundAttribute = 'theme_bg';

    /** URL of {@see \rapttor\themes\actions\BackgroundSearchAction} for the Unsplash photo search; without it the photo section is hidden. */
    public ?string $searchUrl = null;

    public function run(): string
    {
        $themes = $this->themes ?? Yii::$app->get('themes');
        $layout = $themes->layoutFor($this->layout);
        $groups = $themes->groups();
        $all = $themes->all();
        $last = null;
        $customAttr = $this->customAttribute !== null && $this->model->hasProperty($this->customAttribute) ? $this->customAttribute : null;
        $customValue = $customAttr !== null ? (string) $this->model->{$customAttr} : '';
        $spec = Themes::parseCustom($customValue) ?? Themes::parseCustom($themes->customDefault) ?? ['mode' => 'light', 'color' => '#2f6f9f'];

        $t = static fn (string $m): string => Yii::t($themes->messageCategory, $m);
        $filter = '<div class="theme-filter" role="group" aria-label="' . Html::encode($t('Show')) . '">'
            . '<button type="button" class="is-on" data-theme-filter="all">' . Html::encode($t('All')) . '</button>'
            . '<button type="button" data-theme-filter="light">' . Html::encode($t('Light')) . '</button>'
            . '<button type="button" data-theme-filter="dark">' . Html::encode($t('Dark')) . '</button></div>';

        // category chips: one category at a time (All = everything, grouped); System always stays visible above them
        $chips = '';
        foreach ($groups as $gid => $glabel) {
            if ($gid !== 'system' && $gid !== 'custom') {
                $chips .= '<button type="button" data-theme-tab="' . Html::encode($gid) . '" aria-pressed="false">' . Html::encode($glabel) . '</button>';
            }
        }
        if ($customAttr !== null && isset($all['custom'])) {
            $chips .= '<button type="button" data-theme-tab="custom" aria-pressed="false">' . Html::encode($t('Custom')) . '</button>';
        }
        $allChip = '<button type="button" data-theme-tab="all" aria-pressed="false">' . Html::encode($t('All')) . '</button>';
        $chips = match ($themes->allTab) {
            'first' => $allChip . $chips,
            false => $chips,
            default => $chips . $allChip,
        };
        $tabs = $layout !== 'tabs' ? '' : '<div class="theme-tabs" role="group" aria-label="' . Html::encode($t('Category')) . '">' . $chips . '</div>';

        $hidden = $customAttr !== null ? Html::activeHiddenInput($this->model, $customAttr, ['data-custom-field' => '1', 'value' => Themes::formatCustom($spec['mode'], $spec['color'])]) : '';

        $card = $customAttr !== null && isset($all['custom']) ? $this->customCard($themes, $customAttr, $spec, $t) : '';

        $colours = $tabs . $filter . $hidden . (string) $this->form->field($this->model, $this->attribute, ['selectors' => ['input' => 'input[type=radio][name="' . Html::getInputName($this->model, $this->attribute) . '"]']])->radioList($themes->labels(), [
            'class' => 'theme-picker',
            'data-layout' => $layout,
            'data-preview-url' => $this->previewUrl,
            'item' => static function (int $i, string $label, string $name, bool $checked, string $id) use ($themes, $groups, $all, &$last, $customAttr, $spec, $t): string {
                if ($id === 'custom') {
                    return ''; // rendered separately, as the card below the groups
                }
                $group = $all[$id]['group'];
                $heading = '';
                if ($group !== $last) {
                    $heading = '<span class="theme-group" data-group="' . Html::encode($group) . '">' . Html::encode($groups[$group] ?? $group) . '</span>';
                    $last = $group;
                }
                $r = $themes->resolved($id);
                $d = $r['dark'] ?? null;
                $vars = sprintf('--sw-bg:%s;--sw-text:%s;--sw-brand:%s;--sw-link:%s;--sw-accent:%s', $r['bg'], $r['text'], $r['brand'], $r['link'], $r['accent']);
                if ($d !== null) {
                    $vars .= sprintf(';--sw-bg2:%s;--sw-text2:%s', $d['bg'], $d['text']);
                }
                $title = isset($all[$id]['credit']) ? ' title="' . Html::encode($all[$id]['credit']) . '"' : '';

                return $heading . '<label class="theme-option"' . $title . ' data-group="' . Html::encode($group) . '" data-mode="' . Html::encode($all[$id]['mode']) . '">'
                    . Html::radio($name, $checked, ['value' => $id, 'data-theme-key' => $id, 'data-css' => $themes->css($id), 'data-attrs' => $themes->htmlAttributes($id)])
                    . '<span class="theme-swatch' . ($d !== null ? ' is-split' : '') . '" style="' . Html::encode($vars) . '">'
                    . ($d !== null ? '<b><u>A</u><u>a</u></b>' : '<b>Aa</b>') . '<i></i><i></i><i></i></span>'
                    . '<span class="theme-name">' . Html::encode($label) . '</span></label>';
            },
        ]) . $card;

        $bgAttr = $themes->backgroundsEnabled && $this->backgroundAttribute !== null && $this->model->hasProperty($this->backgroundAttribute) ? $this->backgroundAttribute : null;
        if ($bgAttr === null) {
            return $colours;
        }

        $photosOn = $this->searchUrl !== null && $themes->unsplashKey() !== null;
        $tab = static fn (string $name, string $label, bool $on = false): string => '<button type="button" role="tab" class="' . ($on ? 'is-on' : '') . '" aria-selected="' . ($on ? 'true' : 'false') . '" data-pane-tab="' . $name . '">' . Html::encode($label) . '</button>';

        return '<div class="theme-modes" role="tablist">' . $tab('palette', $t('Palette'), true) . $tab('patterns', $t('Patterns')) . $tab('live', $t('Live')) . ($photosOn ? $tab('photos', $t('Photos')) : '') . '</div>'
            . '<div class="theme-pane" data-pane="palette">' . $colours . '</div>'
            . '<div class="theme-pane" data-pane="backgrounds" hidden>' . $this->backgroundPanel($themes, $bgAttr, $t) . '</div>';
    }

    /** The Backgrounds tab: none, static, solid, gradients, animated, Unsplash photos, and the overlay / palette controls. */
    private function backgroundPanel(Themes $themes, string $attr, callable $t): string
    {
        $cat = $themes->backgrounds();
        $cur = $themes->parseBackground((string) $this->model->{$attr});
        $keys = $themes->keys();
        $tile = static function (string $kind, string $id, array $item, ?Background $cur) use ($keys): string {
            $on = $cur !== null && $cur->kind === $kind && $cur->id === $id;
            $theme = isset($item['theme']) && in_array($item['theme'], $keys, true) ? ' data-bg-theme="' . Html::encode($item['theme']) . '"' : '';

            return '<button type="button" class="bg-tile' . ($on ? ' is-on' : '') . '" aria-pressed="' . ($on ? 'true' : 'false') . '" data-bg-kind="' . $kind . '" data-bg-id="' . Html::encode($id) . '"' . $theme
                . ' data-bg-group="' . Html::encode((string) ($item['group'] ?? '')) . '" data-bg-css="' . Html::encode($item['css']) . '" style="background:' . Html::encode($item['css']) . '"><span>' . Html::encode($item['label']) . '</span></button>';
        };
        $section = static fn (string $title, string $body): string => '<section class="bg-section"><h3 class="theme-card-title">' . Html::encode($title) . '</h3><div class="bg-tiles">' . $body . '</div></section>';

        $static = '';
        foreach ($cat->items('static') as $id => $item) {
            $static .= $tile('static', (string) $id, $item, $cur);
        }
        $grad = '';
        foreach ($cat->items('gradient') as $id => $item) {
            $grad .= $tile('gradient', (string) $id, $item, $cur);
        }
        $anim = '';
        foreach ($cat->items('anim') as $id => $item) {
            $anim .= $tile('anim', (string) $id, $item, $cur);
        }
        $liveChips = '';
        foreach (Backgrounds::ANIMATED_GROUPS as $gid => $glabel) {
            if (array_filter($cat->items('anim'), static fn (array $i): bool => ($i['group'] ?? '') === $gid) !== []) {
                $liveChips .= '<button type="button" data-live-group="' . $gid . '" aria-pressed="false">' . Html::encode($t($glabel)) . '</button>';
            }
        }
        $allLive = '<button type="button" data-live-group="all" aria-pressed="false">' . Html::encode($t('All')) . '</button>';
        $liveChips = '<div class="theme-tabs" data-live-groups role="group" aria-label="' . Html::encode($t('Category')) . '">' . match ($themes->allTab) { 'first' => $allLive . $liveChips, false => $liveChips, default => $liveChips . $allLive } . '</div>';
        $customCur = $cur !== null && $cur->kind === 'gradient' && $cur->id === 'custom' ? $cur : null;
        $solidColor = $cur !== null && $cur->kind === 'solid' ? $cur->color : '#3b5bdb';
        $palette = in_array('custom', $keys, true) ? ' data-bg-theme="custom"' : '';
        $solid = '<label class="bg-tile bg-solid' . ($cur !== null && $cur->kind === 'solid' ? ' is-on' : '') . '" data-bg-kind="solid"' . $palette . '><input type="color" data-bg-color value="' . Html::encode((string) $solidColor) . '" aria-label="' . Html::encode($t('Colour')) . '"><span>' . Html::encode($t('Solid colour')) . '</span></label>';
        $custom = '<div class="bg-custom' . ($customCur !== null ? ' is-on' : '') . '" data-bg-kind="gradient" data-bg-id="custom"' . $palette . '>'
            . '<label>' . Html::encode($t('From')) . ' <input type="color" data-bg-c1 value="' . Html::encode($customCur->color ?? '#4338ca') . '"></label>'
            . '<label>' . Html::encode($t('To')) . ' <input type="color" data-bg-c2 value="' . Html::encode($customCur->color2 ?? '#db2777') . '"></label>'
            . '<label>' . Html::encode($t('Angle')) . ' <input type="range" min="0" max="359" data-bg-angle value="' . (int) ($customCur->angle ?? 135) . '"></label></div>';

        $photos = '';
        if ($this->searchUrl !== null && $themes->unsplashKey() !== null) {
            $chips = '';
            foreach (Backgrounds::PHOTO_TOPICS as $topic) {
                $chips .= '<button type="button" class="bg-chip" data-bg-topic="' . Html::encode($topic) . '">' . Html::encode($t(ucfirst($topic))) . '</button>';
            }
            $photos = '<section class="bg-section" data-bg-section="photos" data-bg-photos>'
                . '<div class="bg-search"><input type="search" data-bg-q maxlength="80" placeholder="' . Html::encode($t('Search photos')) . '" aria-label="' . Html::encode($t('Search photos')) . '">'
                . '<button type="button" data-bg-search>' . Html::encode($t('Search')) . '</button></div>'
                . '<div class="bg-chips">' . $chips . '</div><div class="bg-photo-grid" data-bg-results></div>'
                . '<p class="bg-photo-note"><button type="button" data-bg-more hidden>' . Html::encode($t('More')) . '</button> <span>' . Html::encode($t('Photos from Unsplash')) . '</span></p></section>';
        }

        $overlay = $cur?->overlay ?? 'n';
        $radio = static fn (string $v, string $label) => '<label><input type="radio" name="bg_overlay_ui" value="' . $v . '" data-bg-overlay' . ($overlay === $v ? ' checked' : '') . '><span class="app-opt">' . Html::encode($label) . '</span></label>';
        $controls = '<div class="bg-controls"><span class="appearance" role="radiogroup" aria-label="' . Html::encode($t('Overlay')) . '">' . $radio('n', $t('No overlay')) . $radio('w', $t('White')) . $radio('b', $t('Black')) . '</span>'
            . '<label class="bg-range">' . Html::encode($t('Overlay strength')) . ' <input type="range" min="0" max="90" step="5" data-bg-alpha value="' . (int) ($cur?->alpha ?? 35) . '"> <output data-bg-alpha-out>' . (int) ($cur?->alpha ?? 35) . '%</output></label>'
            . '<label class="bg-palette bg-liquid"><input type="checkbox" data-bg-liquid' . ($cur !== null && $cur->liquid > 0 ? ' checked' : '') . '> ' . Html::encode($t('Liquid interface')) . '</label>'
            . '<label class="bg-range">' . Html::encode($t('Transparency')) . ' <input type="range" min="10" max="70" step="5" data-bg-liquid-amount value="' . ($cur !== null && $cur->liquid > 0 ? $cur->liquid : max(10, min(70, $themes->liquidDefault ?: 40))) . '"> <output data-bg-liquid-out>' . ($cur !== null && $cur->liquid > 0 ? $cur->liquid : max(10, min(70, $themes->liquidDefault ?: 40))) . '%</output></label>'
            . '<label class="bg-palette"><input type="checkbox" data-bg-palette' . ($cur?->palette ? ' checked' : '') . '> ' . Html::encode($t("Use this background's colours")) . '</label>'
            . '<div class="bg-palette-box" data-bg-palette-box hidden><span class="bg-swatches" data-bg-swatches></span>'
            . '<span class="appearance" role="radiogroup" aria-label="' . Html::encode($t("Use this background's colours")) . '">'
            . '<label><input type="radio" name="bg_pmode_ui" value="dark" data-bg-pmode><span class="app-opt">' . Html::encode($t('Dark')) . '</span></label>'
            . '<label><input type="radio" name="bg_pmode_ui" value="light" data-bg-pmode><span class="app-opt">' . Html::encode($t('Light')) . '</span></label></span></div>'
            . '<button type="button" class="bg-remove" data-bg-remove>' . Html::encode($t('Remove background')) . '</button></div>';

        $none = '<button type="button" class="bg-tile is-none' . ($cur === null ? ' is-on' : '') . '" aria-pressed="' . ($cur === null ? 'true' : 'false') . '" data-bg-kind="none"><span>' . Html::encode($t('No background')) . '</span></button>';

        return '<div class="bg-picker" data-search-url="' . Html::encode((string) $this->searchUrl) . '" data-preview-url="' . Html::encode((string) $this->previewUrl) . '" data-liquid-default="' . (int) $themes->liquidDefault . '">'
            . Html::activeHiddenInput($this->model, $attr, ['data-bg-field' => '1', 'value' => (string) ($cur ?? ''), 'id' => 'theme-bg-field'])
            . '<div data-bg-section="patterns"><div class="bg-tiles">' . $none . '</div>'
            . $section($t('Static'), $static . $solid)
            . $section($t('Gradients'), $grad) . $custom . '</div>'
            . '<div data-bg-section="live" class="bg-section">' . $liveChips . '<div class="bg-tiles">' . $anim . '</div></div>'
            . $photos . $controls . '</div>';
    }

    /**
     * The user-defined theme as its own card below the groups: the Custom tile (a radio of the same group, so the form
     * submits `custom` like any other choice), a colour input and a Light / Dark switch.
     *
     * @param array{mode: string, color: string} $spec
     */
    private function customCard(Themes $themes, string $customAttr, array $spec, callable $t): string
    {
        $value = Themes::formatCustom($spec['mode'], $spec['color']);
        $r = $themes->resolved('custom', $value);
        $vars = sprintf('--sw-bg:%s;--sw-text:%s;--sw-brand:%s;--sw-link:%s;--sw-accent:%s', $r['bg'], $r['text'], $r['brand'], $r['link'], $r['accent']);
        $isCustom = $this->model->{$this->attribute} === 'custom';

        return '<section class="theme-card" aria-label="' . Html::encode($t('Custom')) . '">'
            . '<h3 class="theme-card-title">' . Html::encode($t('Custom')) . '</h3>'
            . '<div class="theme-card-body"><label class="theme-option" data-group="custom" data-mode="auto">'
            . Html::radio(Html::getInputName($this->model, $this->attribute), $isCustom, ['value' => 'custom', 'id' => 'theme-custom-radio', 'data-theme-key' => 'custom', 'data-custom' => '1', 'data-css' => $themes->css('custom', $value), 'data-attrs' => $themes->htmlAttributes('custom', $value)])
            . '<span class="theme-swatch" style="' . Html::encode($vars) . '"><b>Aa</b><i></i><i></i><i></i></span><span class="theme-name">' . Html::encode($t('Custom')) . '</span></label>'
            . '<div class="theme-custom"><label>' . Html::encode($t('Colour')) . ' <input type="color" data-custom-color value="' . Html::encode($spec['color']) . '"></label>'
            . '<span class="appearance" role="radiogroup">'
            . '<label><input type="radio" name="theme_custom_mode_ui" value="light" data-custom-mode' . ($spec['mode'] === 'light' ? ' checked' : '') . '><span class="app-opt">' . Html::encode($t('Light')) . '</span></label>'
            . '<label><input type="radio" name="theme_custom_mode_ui" value="dark" data-custom-mode' . ($spec['mode'] === 'dark' ? ' checked' : '') . '><span class="app-opt">' . Html::encode($t('Dark')) . '</span></label></span></div>'
            . '</div></section>';
    }
}
