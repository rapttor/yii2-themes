<?php

declare(strict_types=1);

namespace rapttor\themes\assets;

use yii\web\AssetBundle;
use yii\web\View;

/** theme.css (tokens, appearance, picker, background layers), theme-picker.js (live preview), theme-bg.js + bg/*.js (animated backgrounds, loaded on demand), theme-bg-picker.js. Registered by Themes::registerHead(). */
final class ThemeAsset extends AssetBundle
{
    public $sourcePath = __DIR__;
    public $css = ['theme.css'];
    public $js = ['theme-bg.js', 'theme-picker.js', 'theme-bg-picker.js'];
    public $jsOptions = ['position' => View::POS_END, 'defer' => true];
    public $publishOptions = ['only' => ['theme.css', 'theme-picker.js', 'theme-bg.js', 'theme-bg-picker.js', 'bg/*.js', 'base.css']];
}
