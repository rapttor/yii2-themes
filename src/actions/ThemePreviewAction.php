<?php

declare(strict_types=1);

namespace rapttor\themes\actions;

use rapttor\themes\Themes;
use Yii;
use yii\base\Action;
use yii\web\Response;

/** JSON for the picker's live preview of the user-defined theme: GET `?theme=custom&custom=dark:#336699` => {css, attrs}. Nothing is stored. */
class ThemePreviewAction extends Action
{
    public function run(): Response
    {
        /** @var Themes $themes */
        $themes = Yii::$app->get('themes');
        $request = Yii::$app->getRequest();
        $custom = (string) $request->get('custom', '');
        $response = Yii::$app->getResponse();
        $response->format = Response::FORMAT_JSON;
        $response->data = $themes->preview($themes->normalize((string) $request->get('theme', '')), Themes::parseCustom($custom) === null ? null : $custom);

        return $response;
    }
}
