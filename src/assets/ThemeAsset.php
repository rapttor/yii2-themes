<?php

declare(strict_types=1);

namespace rapttor\themes\assets;

use yii\web\AssetBundle;
use yii\web\View;

/** theme.css (tokens, appearance, picker) and theme-picker.js (live preview). Registered by Themes::registerHead(). */
final class ThemeAsset extends AssetBundle
{
    public $sourcePath = __DIR__;
    public $css = ['theme.css'];
    public $js = ['theme-picker.js'];
    public $jsOptions = ['position' => View::POS_END, 'defer' => true];
    public $publishOptions = ['only' => ['theme.css', 'theme-picker.js']];
}
