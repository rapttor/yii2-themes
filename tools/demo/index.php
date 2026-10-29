<?php

declare(strict_types=1);

// Demo: `php -S 127.0.0.1:8100 -t tools/demo` then open http://127.0.0.1:8100/ . A visitor-only app (no user table): the picker,
// the live preview, backgrounds and the Unsplash search (key from UNSPLASH_ACCESS_KEY or ../../.env, never printed).
$root = dirname(__DIR__, 2);
foreach ([$root . '/../.env', $root . '/.env'] as $env) {
    if (is_file($env)) {
        foreach (file($env, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
            if (preg_match('/^\s*(UNSPLASH_ACCESS_KEY)\s*=\s*"?([^"\s]+)"?/', $line, $m) && getenv($m[1]) === false) {
                putenv($m[1] . '=' . $m[2]);
            }
        }
    }
}
define('YII_DEBUG', true);
require $root . '/vendor/autoload.php';
require $root . '/vendor/yiisoft/yii2/Yii.php';
require __DIR__ . '/SiteController.php';

if (preg_match('#\.(css|js|png|jpg|svg)$#', (string) parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH))) {
    return false; // let the built-in server serve published assets
}

(new yii\web\Application([
    'id' => 'themes-demo',
    'basePath' => __DIR__,
    'runtimePath' => __DIR__ . '/runtime',
    'controllerNamespace' => 'rapttor\themes\demo',
    'defaultRoute' => 'site/theme',
    'bootstrap' => [],
    'components' => [
        'request' => ['cookieValidationKey' => 'demo-only', 'enableCsrfValidation' => false],
        'themes' => ['class' => rapttor\themes\Themes::class, 'baseStyles' => true, 'liquidDefault' => 40],
        'assetManager' => ['basePath' => __DIR__ . '/assets', 'baseUrl' => '/assets', 'appendTimestamp' => true, 'forceCopy' => true],
        'cache' => ['class' => yii\caching\FileCache::class],
        'urlManager' => ['enablePrettyUrl' => false],
        'errorHandler' => ['errorAction' => null],
    ],
    'controllerMap' => ['site' => rapttor\themes\demo\SiteController::class],
    'aliases' => ['@webroot' => __DIR__, '@web' => '', '@vendor' => $root . '/vendor', '@bower' => $root . '/vendor/bower-asset', '@npm' => $root . '/vendor/npm-asset'],
]))->run();
