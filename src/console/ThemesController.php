<?php

declare(strict_types=1);

namespace rapttor\themes\console;

use rapttor\themes\Themes;
use Yii;
use yii\console\Controller;
use yii\console\ExitCode;

/** `yii themes/audit`: checks every theme the app offers against the contrast rules; exit code 1 on any violation (for CI). */
final class ThemesController extends Controller
{
    public function actionAudit(): int
    {
        /** @var Themes $themes */
        $themes = Yii::$app->has('themes') ? Yii::$app->get('themes') : new Themes();
        $problems = $themes->audit();
        if ($problems === []) {
            $this->stdout(count($themes->keys()) . " themes pass the contrast rules.\n");

            return ExitCode::OK;
        }
        foreach ($problems as $id => $list) {
            foreach (array_unique($list) as $line) {
                $this->stderr("$id: $line\n");
            }
        }
        $this->stderr(count($problems) . " theme(s) fail.\n");

        return ExitCode::UNSPECIFIED_ERROR;
    }
}
