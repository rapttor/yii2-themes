<?php

declare(strict_types=1);

namespace rapttor\themes\models;

use Yii;
use yii\base\Model;

/** Form model of the theme page: the id and, for the user-defined theme, its value. Validation comes from {@see \rapttor\themes\Themes::rules()}. */
final class ThemeForm extends Model
{
    public ?string $theme = null;
    public ?string $theme_custom = null;

    public function rules(): array
    {
        return Yii::$app->get('themes')->rules();
    }

    public function attributeLabels(): array
    {
        return ['theme' => Yii::t('themes', 'Theme')];
    }
}
