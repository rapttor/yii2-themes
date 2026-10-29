<?php

declare(strict_types=1);

namespace rapttor\themes\actions;

use rapttor\themes\models\ThemeForm;
use rapttor\themes\Themes;
use Yii;
use yii\base\Action;
use yii\web\Response;

/**
 * The theme page: shows the picker, saves the choice on the signed-in user (`theme`, `theme_custom` columns) and in the
 * first-party cookie, so it also works for visitors. Register it in a controller:
 *
 *   public function actions(): array
 *   {
 *       return ['theme' => ['class' => \rapttor\themes\actions\ThemeAction::class],
 *               'theme-preview' => ['class' => \rapttor\themes\actions\ThemePreviewAction::class]];
 *   }
 *
 * The default view is a plain form; set $view to your own (it receives `model`, `themes`, `previewUrl`, `searchUrl`).
 */
class ThemeAction extends Action
{
    public string $view = '@rapttor/themes/src/views/theme';

    /** @var string|array|null where to go after saving; null = back to the same page */
    public string|array|null $redirect = null;

    /** @var string|array|null route of {@see ThemePreviewAction} for the live preview of the user-defined theme */
    public string|array|null $previewRoute = 'theme-preview';

    /** @var string|array|null route of {@see BackgroundSearchAction} (the photo search); null = no photo search in the picker */
    public string|array|null $searchRoute = 'background-search';

    /** @var string|null flash message after saving (already translated); null = none */
    public ?string $flash = null;

    public function run(): Response|string
    {
        /** @var Themes $themes */
        $themes = Yii::$app->get('themes');
        $request = Yii::$app->getRequest();
        try {
            $identity = Yii::$app->has('user') ? Yii::$app->getUser()->getIdentity() : null;
        } catch (\yii\base\InvalidConfigException) { // an app without an identity class: visitors only
            $identity = null;
        }

        $model = new ThemeForm();
        $model->theme = $themes->resolveFor($identity?->theme ?? null, $request);
        $model->theme_custom = $themes->customFor($identity !== null ? (string) ($identity->theme_custom ?? '') : null, $request);

        $model->theme_bg = (string) $themes->backgroundFor($identity !== null ? ($identity->theme_bg ?? null) ?: null : null, $request);

        if ($model->load($request->post()) && $model->validate()) {
            if ($identity instanceof \yii\db\ActiveRecord) {
                $identity->updateAttributes(['theme' => $model->theme, 'theme_custom' => $model->theme === 'custom' ? $model->theme_custom : $identity->theme_custom]);
            }
            if ($themes->backgroundsEnabled) {
                if ($identity instanceof \yii\db\ActiveRecord && $identity->hasAttribute('theme_bg')) {
                    $identity->updateAttributes(['theme_bg' => $model->theme_bg === '' ? null : $model->theme_bg]);
                }
                $themes->rememberBackground(Yii::$app->getResponse(), $request, $model->theme_bg);
            }
            $themes->remember(Yii::$app->getResponse(), $request, (string) $model->theme, $model->theme_custom);
            if ($this->flash !== null) {
                Yii::$app->getSession()->setFlash('success', $this->flash);
            }

            return $this->controller->redirect($this->redirect ?? $request->getUrl());
        }

        return $this->controller->render($this->view, [
            'model' => $model,
            'themes' => $themes,
            'previewUrl' => $this->previewRoute === null ? null : \yii\helpers\Url::to($this->previewRoute),
            'searchUrl' => $this->searchRoute === null ? null : \yii\helpers\Url::to($this->searchRoute),
        ]);
    }
}
