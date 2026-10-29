<?php

declare(strict_types=1);

namespace rapttor\themes\actions;

use rapttor\themes\Themes;
use rapttor\themes\UnsplashClient;
use Yii;
use yii\base\Action;
use yii\web\Response;

/**
 * JSON proxy for the picker's photo search, so the Unsplash key never reaches the browser:
 *   GET ?q=mountains&page=1  => {configured, total, pages, results: [{u, pid, c, thumb, by, un, alt}]}
 *   GET ?track=<photoId>     => {ok}   (the download ping Unsplash asks for when a photo is chosen)
 * Limited to 40 requests a minute per client when a cache component exists.
 */
class BackgroundSearchAction extends Action
{
    public function run(): Response
    {
        /** @var Themes $themes */
        $themes = Yii::$app->get('themes');
        $request = Yii::$app->getRequest();
        $response = Yii::$app->getResponse();
        $response->format = Response::FORMAT_JSON;
        $key = $themes->unsplashKey();
        if ($key === null || !$themes->backgroundsEnabled) {
            $response->data = ['configured' => false, 'results' => []];

            return $response;
        }
        if (Yii::$app->has('cache')) {
            $cache = Yii::$app->get('cache');
            $slot = 'rapttor-unsplash-rate:' . md5((string) $request->getUserIP()) . ':' . intdiv(time(), 60);
            $n = (int) $cache->get($slot) + 1;
            $cache->set($slot, $n, 90);
            if ($n > 40) {
                $response->statusCode = 429;
                $response->data = ['configured' => true, 'results' => [], 'error' => 'busy'];

                return $response;
            }
        }
        $client = new UnsplashClient($key);
        $track = $request->get('track');
        if (is_string($track) && $track !== '') {
            $client->track($track);
            $response->data = ['ok' => true];

            return $response;
        }
        $found = $client->search((string) $request->get('q', ''), (int) $request->get('page', 1));
        $response->data = $found === null ? ['configured' => true, 'results' => [], 'error' => 'unavailable'] : ['configured' => true] + $found;

        return $response;
    }
}
