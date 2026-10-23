<?php

declare(strict_types=1);

namespace rapttor\themes\assets;

use yii\web\AssetBundle;

/** Optional base.css: body, links, buttons, inputs and cards styled from the tokens. Enabled with Themes::$baseStyles. */
final class ThemeBaseAsset extends AssetBundle
{
    public $sourcePath = __DIR__;
    public $css = ['base.css'];
    public $publishOptions = ['only' => ['base.css']];
    public $depends = [ThemeAsset::class];
}
