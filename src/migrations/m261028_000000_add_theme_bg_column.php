<?php

declare(strict_types=1);

namespace rapttor\themes\migrations;

use Yii;
use yii\db\Migration;

/**
 * Optional: stores the page background on the user row too (`theme_bg`), so it follows the user across devices. The cookie
 * `theme_bg` works without it. Table: {@see \rapttor\themes\Themes::$userTable}.
 */
final class m261028_000000_add_theme_bg_column extends Migration
{
    private function table(): string
    {
        return Yii::$app->has('themes') ? Yii::$app->get('themes')->userTable : '{{%user}}';
    }

    public function safeUp(): void
    {
        $schema = $this->db->getTableSchema($this->table(), true);
        if ($schema !== null && !isset($schema->columns['theme_bg'])) {
            $this->addColumn($this->table(), 'theme_bg', $this->string(700)->null());
        }
    }

    public function safeDown(): void
    {
        $schema = $this->db->getTableSchema($this->table(), true);
        if ($schema !== null && isset($schema->columns['theme_bg'])) {
            $this->dropColumn($this->table(), 'theme_bg');
        }
    }
}
