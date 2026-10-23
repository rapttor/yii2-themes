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
 * previewing live (see theme-picker.js). The label comes from the model's attributeLabels().
 *
 *   <?= ThemePicker::widget(['form' => $form, 'model' => $model]) ?>   // attribute `theme`
 */
final class ThemePicker extends Widget
{
    public ActiveForm $form;
    public Model $model;
    public string $attribute = 'theme';
    public ?Themes $themes = null;

    public function run(): string
    {
        $themes = $this->themes ?? Yii::$app->get('themes');
        $groups = $themes->groups();
        $all = $themes->all();
        $last = null;

        return (string) $this->form->field($this->model, $this->attribute)->radioList($themes->labels(), [
            'class' => 'theme-picker',
            'item' => static function (int $i, string $label, string $name, bool $checked, string $id) use ($themes, $groups, $all, &$last): string {
                $group = $all[$id]['group'];
                $heading = '';
                if ($group !== $last) {
                    $heading = '<span class="theme-group">' . Html::encode($groups[$group] ?? $group) . '</span>';
                    $last = $group;
                }
                $t = $themes->resolved($id);
                $d = $t['dark'] ?? null;
                $vars = sprintf('--sw-bg:%s;--sw-text:%s;--sw-brand:%s;--sw-link:%s;--sw-accent:%s', $t['bg'], $t['text'], $t['brand'], $t['link'], $t['accent']);
                if ($d !== null) {
                    $vars .= sprintf(';--sw-bg2:%s;--sw-text2:%s', $d['bg'], $d['text']);
                }
                $title = isset($all[$id]['credit']) ? ' title="' . Html::encode($all[$id]['credit']) . '"' : '';

                return $heading . '<label class="theme-option"' . $title . '>'
                    . Html::radio($name, $checked, ['value' => $id, 'data-theme-key' => $id, 'data-css' => $themes->css($id), 'data-attrs' => $themes->htmlAttributes($id)])
                    . '<span class="theme-swatch' . ($d !== null ? ' is-split' : '') . '" style="' . Html::encode($vars) . '">'
                    . ($d !== null ? '<b><u>A</u><u>a</u></b>' : '<b>Aa</b>') . '<i></i><i></i><i></i></span>'
                    . '<span class="theme-name">' . Html::encode($label) . '</span></label>';
            },
        ]);
    }
}
