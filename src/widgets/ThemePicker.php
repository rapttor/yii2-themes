<?php

declare(strict_types=1);

namespace rapttor\themes\widgets;

use rapttor\themes\Themes;
use Yii;
use yii\base\Model;
use yii\base\Widget;
use yii\helpers\Html;
use yii\widgets\ActiveForm;

/**
 * Theme picker for an ActiveForm: grouped swatches (background, text sample and the highlight, link and accent colours),
 * previewing live (see theme-picker.js), with collapsible groups and an All / Light / Dark filter. The label comes from the
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

    /** Attribute holding the user-defined theme value (`dark:#336699`); null or a model without it = no custom controls. */
    public ?string $customAttribute = 'theme_custom';

    /** URL returning {css, attrs} for `?theme=custom&custom=dark:#336699` (Themes::preview()); without it the custom theme previews after saving. */
    public ?string $previewUrl = null;

    public function run(): string
    {
        $themes = $this->themes ?? Yii::$app->get('themes');
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

        $hidden = $customAttr !== null ? Html::activeHiddenInput($this->model, $customAttr, ['data-custom-field' => '1', 'value' => Themes::formatCustom($spec['mode'], $spec['color'])]) : '';

        $card = $customAttr !== null && isset($all['custom']) ? $this->customCard($themes, $customAttr, $spec, $t) : '';

        return $filter . $hidden . (string) $this->form->field($this->model, $this->attribute, ['selectors' => ['input' => 'input[type=radio][name="' . Html::getInputName($this->model, $this->attribute) . '"]']])->radioList($themes->labels(), [
            'class' => 'theme-picker',
            'data-preview-url' => $this->previewUrl,
            'item' => static function (int $i, string $label, string $name, bool $checked, string $id) use ($themes, $groups, $all, &$last, $customAttr, $spec, $t): string {
                if ($id === 'custom') {
                    return ''; // rendered separately, as the card below the groups
                }
                $group = $all[$id]['group'];
                $heading = '';
                if ($group !== $last) {
                    $heading = '<button type="button" class="theme-group" aria-expanded="true" data-group="' . Html::encode($group) . '">' . Html::encode($groups[$group] ?? $group) . '</button>';
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
