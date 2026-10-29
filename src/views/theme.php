<?php

/** @var yii\web\View $this */
/** @var rapttor\themes\models\ThemeForm $model */
/** @var string|null $previewUrl */
/** @var string|null $searchUrl */

use rapttor\themes\widgets\ThemePicker;
use yii\helpers\Html;
use yii\widgets\ActiveForm;

$this->title = Yii::t('themes', 'Theme');
?>
<h1><?= Html::encode($this->title) ?></h1>
<?php $form = ActiveForm::begin(); ?>
<?= ThemePicker::widget(['form' => $form, 'model' => $model, 'previewUrl' => $previewUrl, 'searchUrl' => $searchUrl]) ?>
<p><?= Html::submitButton(Yii::t('themes', 'Save'), ['class' => 'btn btn-primary']) ?></p>
<?php ActiveForm::end(); ?>
