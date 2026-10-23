<?php

declare(strict_types=1);

// Standalone checkout: vendor/ next to this package; inside a host app: the app's vendor/ three levels up.
$autoload = is_file(dirname(__DIR__) . '/vendor/autoload.php') ? dirname(__DIR__) . '/vendor/autoload.php' : dirname(__DIR__, 3) . '/vendor/autoload.php';
require $autoload;
require dirname($autoload) . '/yiisoft/yii2/Yii.php';

new yii\console\Application([
    'id' => 'themes-tests',
    'basePath' => __DIR__,
    'language' => 'en',
    'components' => ['themes' => ['class' => rapttor\themes\Themes::class]],
]);
