<?php

declare(strict_types=1);

namespace rapttor\themes;

use yii\base\BootstrapInterface;
use yii\console\Application as ConsoleApplication;

/**
 * Runs through Composer's extension bootstrap: on the console it adds `themes/audit` and the package migration namespace
 * to the `migrate` command, so a host needs no config for either.
 */
final class Bootstrap implements BootstrapInterface
{
    public function bootstrap($app): void
    {
        if (!$app instanceof ConsoleApplication) {
            return;
        }
        $app->controllerMap['themes'] ??= ['class' => console\ThemesController::class];
        $migrate = $app->controllerMap['migrate'] ?? ['class' => \yii\console\controllers\MigrateController::class];
        if (is_array($migrate)) {
            $migrate['migrationNamespaces'] = array_values(array_unique([...($migrate['migrationNamespaces'] ?? []), 'rapttor\themes\migrations']));
            $app->controllerMap['migrate'] = $migrate;
        }
    }
}
