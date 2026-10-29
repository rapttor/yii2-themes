<?php

declare(strict_types=1);

namespace rapttor\themes\demo;

use rapttor\themes\actions\BackgroundSearchAction;
use rapttor\themes\actions\ThemeAction;
use rapttor\themes\actions\ThemePreviewAction;
use yii\web\Controller;

final class SiteController extends Controller
{
    public $layout = false;

    public function actions(): array
    {
        return [
            'theme' => ['class' => ThemeAction::class, 'view' => '@app/theme', 'previewRoute' => ['site/theme-preview'], 'searchRoute' => ['site/background-search']],
            'theme-preview' => ThemePreviewAction::class,
            'background-search' => BackgroundSearchAction::class,
        ];
    }
}
