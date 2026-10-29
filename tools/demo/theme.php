<?php

/** @var yii\web\View $this */
/** @var rapttor\themes\models\ThemeForm $model */
/** @var string|null $previewUrl */
/** @var string|null $searchUrl */

use rapttor\themes\widgets\ThemePicker;
use yii\helpers\Html;
use yii\widgets\ActiveForm;

$attrs = Yii::$app->themes->prepare($this);
$this->beginPage();
?>
<!doctype html>
<html lang="en" <?= $attrs ?>>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Themes demo</title><?php $this->head() ?></head>
<body>
<?php $this->beginBody() ?>
<main style="max-width:960px;margin:0 auto;padding:16px">
    <h1>Themes demo</h1>
    <div class="card"><p>A card: <a href="#">a link</a>, <small>small muted text</small>.</p><p><button>Button</button> <button class="btn-primary" type="submit" form="f">Save</button></p></div>
    <?php $form = ActiveForm::begin(['id' => 'f']); ?>
    <?= ThemePicker::widget(['form' => $form, 'model' => $model, 'previewUrl' => $previewUrl, 'searchUrl' => $searchUrl]) ?>
    <p><?= Html::submitButton('Save', ['class' => 'btn btn-primary']) ?></p>
    <?php ActiveForm::end(); ?>
</main>
<?php $this->endBody() ?>
</body>
</html>
<?php $this->endPage() ?>
