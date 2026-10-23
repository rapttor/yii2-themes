<?php

declare(strict_types=1);

// `php tests/audit.php`: runs the console audit command against the package's own themes; exit code 1 on any violation.
require __DIR__ . '/bootstrap.php';

(new rapttor\themes\Bootstrap())->bootstrap(Yii::$app); // in a host app Composer does this

exit(Yii::$app->runAction('themes/audit'));
