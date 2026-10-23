<?php

declare(strict_types=1);

namespace rapttor\themes\tests;

use PHPUnit\Framework\TestCase;
use rapttor\themes\Bootstrap;
use rapttor\themes\Themes;
use Yii;
use yii\web\Request;
use yii\web\View;

final class ReleaseFeaturesTest extends TestCase
{
    public function testAliasKeepsARenamedThemeWorking(): void
    {
        $t = new Themes(['aliases' => ['old-forest' => 'forest', 'older' => 'old-forest']]);
        self::assertSame('forest', $t->normalize('old-forest'));
        self::assertSame('forest', $t->normalize('older'));
        self::assertSame('forest', $t->resolveAlias('older'));
        self::assertSame('system', $t->normalize('unknown'));
        foreach ($t->aliases + \rapttor\themes\Palettes::ALIASES as $old => $new) {
            self::assertContains($t->resolveAlias($new), $t->keys(), "alias $old must lead to an existing theme");
        }
    }

    public function testRulesAcceptAnAliasAndStoreTheCurrentId(): void
    {
        $t = new Themes(['aliases' => ['old-forest' => 'forest']]);
        $model = \yii\base\DynamicModel::validateData(['theme' => 'old-forest', 'theme_custom' => null], $t->rules());
        self::assertFalse($model->hasErrors());
        self::assertSame('forest', $model->theme);
    }

    public function testSystemSwitchesToHighContrastWhenTheDeviceAsksForIt(): void
    {
        $t = new Themes();
        $css = $t->css('system');
        self::assertStringContainsString('@media (prefers-contrast:more){:root{', $css);
        self::assertStringContainsString('@media (prefers-contrast:more) and (prefers-color-scheme:dark)', $css);
        self::assertStringNotContainsString('prefers-contrast', (new Themes(['systemMoreContrastLight' => null]))->css('system'));
        self::assertStringNotContainsString('prefers-contrast', $t->css('forest'));
    }

    public function testPrepareRegistersTheHeadAndReturnsTheAttributes(): void
    {
        $t = new Themes();
        $web = sys_get_temp_dir() . '/themes-test-web';
        is_dir($web . '/assets') || mkdir($web . '/assets', 0777, true);
        Yii::setAlias('@webroot', $web);
        Yii::setAlias('@web', '/');
        $view = new View();
        $request = new Request(['cookieValidationKey' => 'x']);
        $identity = new class extends \yii\base\BaseObject { public string $theme = 'dracula'; public ?string $theme_custom = null; };
        $attrs = $t->prepare($view, $identity, $request);
        self::assertSame('data-theme="dracula" data-mode="dark"', $attrs);
        self::assertArrayHasKey('theme-vars', $view->css);
        self::assertSame('data-theme="system"', $t->prepare(new View(), null, $request));
    }

    public function testBootstrapAddsTheAuditCommandAndTheMigrationNamespace(): void
    {
        $app = new \yii\console\Application(['id' => 'x', 'basePath' => __DIR__, 'controllerMap' => ['migrate' => ['class' => \yii\console\controllers\MigrateController::class, 'migrationNamespaces' => ['app\migrations']]]]);
        (new Bootstrap())->bootstrap($app);
        self::assertArrayHasKey('themes', $app->controllerMap);
        self::assertSame(['app\migrations', 'rapttor\themes\migrations'], $app->controllerMap['migrate']['migrationNamespaces']);
    }

    public function testMigrationAddsTheColumnsOnce(): void
    {
        $app = new \yii\console\Application(['id' => 'm', 'basePath' => __DIR__, 'components' => [
            'db' => ['class' => \yii\db\Connection::class, 'dsn' => 'sqlite::memory:'],
            'themes' => ['class' => Themes::class],
        ]]);
        $app->db->createCommand('CREATE TABLE user (id INTEGER PRIMARY KEY)')->execute();
        $m = new \rapttor\themes\migrations\m260101_000000_add_theme_columns(['db' => $app->db, 'compact' => true]);
        ob_start();
        $m->up();
        $m->up(); // idempotent
        $cols = array_keys($app->db->getTableSchema('user', true)->columns);
        ob_end_clean(); // down() is not run: SQLite cannot drop columns
        self::assertSame(['id', 'theme', 'theme_custom'], $cols);
    }

    public function testThemeActionDefaultViewExists(): void
    {
        new Themes(); // registers the @rapttor/themes alias
        $action = new \rapttor\themes\actions\ThemeAction('theme', new \yii\web\Controller('site', Yii::$app));
        self::assertFileExists(Yii::getAlias($action->view) . '.php');
    }
}
