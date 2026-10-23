<?php

declare(strict_types=1);

namespace rapttor\themes\migrations;

use Yii;
use yii\db\Migration;

/**
 * Adds `theme` and `theme_custom` to the user table ({@see \rapttor\themes\Themes::$userTable}). Registered automatically for the
 * console `migrate` command by {@see \rapttor\themes\Bootstrap}; or add 'rapttor\themes\migrations' to migrationNamespaces yourself.
 */
final class m260101_000000_add_theme_columns extends Migration
{
    private function table(): string
    {
        return Yii::$app->has('themes') ? Yii::$app->get('themes')->userTable : '{{%user}}';
    }

    public function safeUp(): void
    {
        $schema = $this->db->getTableSchema($this->table(), true);
        if ($schema === null) {
            return;
        }
        if (!isset($schema->columns['theme'])) {
            $this->addColumn($this->table(), 'theme', $this->string(32)->notNull()->defaultValue('system'));
        }
        if (!isset($schema->columns['theme_custom'])) {
            $this->addColumn($this->table(), 'theme_custom', $this->string(16)->null());
        }
    }

    public function safeDown(): void
    {
        $schema = $this->db->getTableSchema($this->table(), true);
        foreach (['theme_custom', 'theme'] as $column) {
            if ($schema !== null && isset($schema->columns[$column])) {
                $this->dropColumn($this->table(), $column);
            }
        }
    }
}
