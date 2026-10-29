<?php

declare(strict_types=1);

namespace rapttor\themes\tests;

use PHPUnit\Framework\TestCase;
use rapttor\themes\Background;
use rapttor\themes\Backgrounds;
use rapttor\themes\Themes;
use rapttor\themes\UnsplashClient;
use Yii;
use yii\web\Request;
use yii\web\View;

final class BackgroundsTest extends TestCase
{
    private function cat(): Backgrounds
    {
        return new Backgrounds();
    }

    public function testEveryCataloguedPaletteIsARealTheme(): void
    {
        $themes = (new Themes())->keys();
        foreach (['static' => Backgrounds::STATIC, 'gradient' => Backgrounds::GRADIENTS, 'anim' => Backgrounds::ANIMATED] as $kind => $items) {
            foreach ($items as $id => $item) {
                self::assertNotSame('', $item['label']);
                self::assertNotSame('', $item['css'], "$kind $id needs a thumbnail css");
                if (isset($item['theme'])) {
                    self::assertContains($item['theme'], $themes, "$kind $id carries an unknown theme");
                }
            }
        }
    }

    public function testEveryAnimatedBackgroundHasItsScript(): void
    {
        foreach (array_keys(Backgrounds::ANIMATED) as $id) {
            self::assertFileExists(dirname(__DIR__) . "/src/assets/bg/$id.js", "effect $id");
        }
    }

    public function testParseValidatesAndNormalises(): void
    {
        $c = $this->cat();
        $b = $c->parse('{"k":"static","id":"blueprint","o":"w","p":120,"pal":1}');
        self::assertSame(['static', 'blueprint', 'w', 90, true], [$b->kind, $b->id, $b->overlay, $b->alpha, $b->palette]);
        self::assertSame('{"k":"static","id":"blueprint","o":"w","p":90,"pal":1}', (string) $b);
        self::assertNull($c->parse('{"k":"static","id":"nope"}'));
        self::assertNull($c->parse('not json'));
        self::assertNull($c->parse(''));
        self::assertNull($c->parse(null));
        self::assertNull($c->parse('{"k":"solid","c":"red"}'));
        self::assertSame('#112233', $c->parse('{"k":"solid","c":"#112233"}')->color);
        self::assertSame('n', $c->parse('{"k":"anim","id":"aurora","o":"x"}')->overlay);
        $g = $c->parse('{"k":"gradient","id":"custom","c":"#ff0000","c2":"#0000ff","a":450}');
        self::assertSame(90, $g->angle);
        self::assertNull($c->parse('{"k":"gradient","id":"custom","c":"#ff0000"}'));
    }

    public function testPhotosAcceptOnlyAnUnsplashPathNeverAUrl(): void
    {
        $c = $this->cat();
        self::assertNull($c->parse('{"k":"img","u":"https://evil.example/x.jpg"}'));
        self::assertNull($c->parse('{"k":"img","u":"../../etc/passwd"}'));
        $b = $c->parse('{"k":"img","u":"photo-1506744038136-46273834b3fb","pid":"abc123","by":"A <b>\"Name\"|x","un":"jane_d"}');
        self::assertSame('A bNamex', $b->by);
        self::assertStringStartsWith('url("https://images.unsplash.com/photo-1506744038136-46273834b3fb?', $c->image($b));
        self::assertNull($c->parse('{"k":"img","u":"photo-123456","un":"bad user"}')->user);
    }

    public function testCssVariablesAndOverlay(): void
    {
        $c = $this->cat();
        $b = $c->parse('{"k":"gradient","id":"custom","c":"#112233","c2":"#445566","a":45,"o":"b","p":35}');
        self::assertSame('--tbg-image:linear-gradient(45deg,#112233,#445566);--tbg-overlay:rgba(0,0,0,0.35);', $c->variables($b));
        self::assertSame('transparent', $c->overlay($c->parse('{"k":"anim","id":"waves","o":"w","p":0}')));
        self::assertSame('rgba(255,255,255,0.9)', $c->overlay($c->parse('{"k":"anim","id":"waves","o":"w","p":90}')));
        self::assertSame('var(--bg)', $c->image($c->parse('{"k":"anim","id":"waves"}')));
    }

    public function testLiquidInterfaceIsValidatedAndRendered(): void
    {
        $c = $this->cat();
        self::assertSame(0, $c->parse('{"k":"anim","id":"waves"}')->liquid);
        self::assertSame(70, $c->parse('{"k":"anim","id":"waves","l":99}')->liquid);
        self::assertSame(0, $c->parse('{"k":"anim","id":"waves","l":-5}')->liquid);
        $b = $c->parse('{"k":"anim","id":"waves","o":"w","p":20,"l":40}');
        self::assertSame('{"k":"anim","id":"waves","o":"w","p":20,"pal":0,"l":40}', (string) $b);
        self::assertStringContainsString('--tbg-liquid:60%;', $c->variables($b));
        self::assertStringNotContainsString('--tbg-liquid', $c->variables($c->parse('{"k":"anim","id":"waves"}')));
        $t = new Themes(['liquidSelectors' => 'main, .shell']);
        self::assertStringContainsString('data-bg="anim" data-liquid data-bg-id="waves"', $t->htmlAttributes('forest', null, $b));
        self::assertStringNotContainsString('data-liquid', $t->htmlAttributes('forest', null, $c->parse('{"k":"anim","id":"waves"}')));
        $css = $t->liquidCss();
        self::assertStringStartsWith('html[data-liquid] :is(main, .shell):not(:is(main, .shell) :is(main, .shell)){', $css);
        self::assertStringContainsString('backdrop-filter:blur(16px)', $css);
    }

    public function testPhotoCarriesAPaletteOfItsDominantColoursInBothModes(): void
    {
        $c = $this->cat();
        $json = '{"k":"img","u":"photo-123456","pc":["#2a4d69","#d9b26f","#8c3b2e","#e8e1d4","#12202e","#ffffff"],"pm":"light","pal":1}';
        $b = $c->parse($json);
        self::assertCount(5, $b->colors, 'reduced to five');
        self::assertSame('light', $b->paletteMode);
        self::assertStringContainsString('"pc":["#2a4d69","#d9b26f","#8c3b2e","#e8e1d4","#12202e"],"pm":"light"', (string) $b);
        self::assertSame(['id' => 'custom', 'custom' => 'light:#2a4d69,#d9b26f,#8c3b2e,#e8e1d4,#12202e'], $c->palette($b));
        self::assertNull($c->palette($c->parse('{"k":"img","u":"photo-123456","pc":["#2a4d69"]}')), 'one colour is no palette');
        self::assertSame('dark', $c->parse('{"k":"img","u":"photo-123456","pc":["#2a4d69","#d9b26f"],"pm":"x"}')->paletteMode);
        self::assertSame([], $c->parse('{"k":"img","u":"photo-123456","pc":["red","blue"]}')->colors);

        // every palette gives a readable theme, dark and light
        $t = new Themes();
        $palettes = [['#2a4d69', '#d9b26f', '#8c3b2e', '#e8e1d4', '#12202e'], ['#ff00aa', '#00ffee', '#ffee00', '#ffffff', '#000000'], ['#777777', '#888888', '#999999', '#666666', '#aaaaaa'], ['#f4f1ea', '#e9e2d0', '#d8cfb8', '#c2b89c', '#fffaf0'], ['#0a0a0a', '#141414', '#1f1f1f', '#2b2b2b', '#101820']];
        foreach ($palettes as $colors) {
            foreach (['dark', 'light'] as $mode) {
                $r = $t->resolved('custom', Themes::formatCustom($mode, $colors));
                self::assertSame($mode, $r['mode']);
                foreach (['bg', 'surface'] as $g) {
                    self::assertGreaterThanOrEqual(7.0, \rapttor\themes\Color::contrast($r['text'], $r[$g]), "$mode " . implode(',', $colors) . " text on $g");
                    self::assertGreaterThanOrEqual(4.5, \rapttor\themes\Color::contrast($r['brand'], $r[$g]), "$mode brand on $g");
                    self::assertGreaterThanOrEqual(4.5, \rapttor\themes\Color::contrast($r['link'], $r[$g]), "$mode link on $g");
                }
            }
        }
    }

    public function testBackgroundsCarryTheirPalette(): void
    {
        $c = $this->cat();
        self::assertSame(['id' => 'blueprint', 'custom' => null], $c->palette($c->parse('{"k":"static","id":"blueprint"}')));
        self::assertNull($c->palette($c->parse('{"k":"anim","id":"blobs"}')));
        self::assertNull($c->palette($c->parse('{"k":"img","u":"photo-123456"}')));
        self::assertSame(['id' => 'custom', 'custom' => 'dark:#101820'], $c->palette($c->parse('{"k":"solid","c":"#101820"}')));
        self::assertSame('light:#f0e0d0', $c->palette($c->parse('{"k":"solid","c":"#f0e0d0"}'))['custom']);
    }

    public function testHostCanAddAndRemoveBackgrounds(): void
    {
        $c = new Backgrounds(['static' => ['brand' => ['label' => 'Brand', 'css' => '#123456'], 'dot-grid' => null]]);
        self::assertTrue($c->has('static', 'brand'));
        self::assertFalse($c->has('static', 'dot-grid'));
        self::assertNotNull($c->parse('{"k":"static","id":"brand"}'));
    }

    public function testThemesFormatsBackgroundsForTheForm(): void
    {
        $t = new Themes();
        self::assertSame('{"k":"anim","id":"waves","o":"n","p":0,"pal":0}', $t->formatBackground('{"k":"anim","id":"waves"}'));
        self::assertSame('', $t->formatBackground('junk'));
        self::assertSame('', (new Themes(['backgroundsEnabled' => false]))->formatBackground('{"k":"anim","id":"waves"}'));
        $model = \yii\base\DynamicModel::validateData(['theme' => 'forest', 'theme_custom' => null, 'theme_bg' => '{"k":"solid","c":"#ABCDEF","p":5}'], $t->rules());
        self::assertSame('{"k":"solid","c":"#abcdef","o":"n","p":5,"pal":0}', $model->theme_bg);
    }

    private function request(array $cookies = []): Request
    {
        $r = new Request(['cookieValidationKey' => 'x']);
        $r->cookies->fromArray($cookies);

        return $r;
    }

    public function testBackgroundIsRememberedInItsOwnCookieAndForgotten(): void
    {
        $t = new Themes();
        $response = new \yii\web\Response();
        $t->rememberBackground($response, $this->request(), '{"k":"anim","id":"waves"}');
        $cookie = $response->cookies->get('theme_bg');
        self::assertSame('{"k":"anim","id":"waves","o":"n","p":0,"pal":0}', $cookie->value);
        self::assertTrue($cookie->httpOnly);
        self::assertSame(\yii\web\Cookie::SAME_SITE_LAX, $cookie->sameSite);
        $t->rememberBackground($response, $this->request(), null);
        self::assertSame('', $response->cookies->get('theme_bg')->value);
        self::assertSame(1, $response->cookies->get('theme_bg')->expire);
        self::assertSame('waves', $t->backgroundFromRequest($this->request(['theme_bg' => new \yii\web\Cookie(['name' => 'theme_bg', 'value' => '{"k":"anim","id":"waves"}'])]))->id);
    }

    public function testPrepareUsesTheBackgroundAndItsPaletteWhenAsked(): void
    {
        $web = sys_get_temp_dir() . '/themes-test-web';
        is_dir($web . '/assets') || mkdir($web . '/assets', 0777, true);
        Yii::setAlias('@webroot', $web);
        Yii::setAlias('@web', '/');
        $t = new Themes();
        $cookie = static fn (string $v): array => ['theme_bg' => new \yii\web\Cookie(['name' => 'theme_bg', 'value' => $v])];
        $identity = new class extends \yii\base\BaseObject { public string $theme = 'dracula'; public ?string $theme_custom = null; };

        $view = new View();
        $attrs = $t->prepare($view, $identity, $this->request($cookie('{"k":"static","id":"blueprint","o":"w","p":30}')));
        self::assertSame('data-theme="dracula" data-mode="dark" data-bg="static" data-bg-id="blueprint"', $attrs);
        self::assertArrayHasKey('theme-bg-vars', $view->css);
        self::assertStringContainsString('--tbg-overlay:rgba(255,255,255,0.3)', $view->css['theme-bg-vars']);

        $attrs = $t->prepare(new View(), $identity, $this->request($cookie('{"k":"static","id":"blueprint","pal":1}')));
        self::assertStringStartsWith('data-theme="blueprint"', $attrs);

        // palette only while that theme is offered
        $attrs = (new Themes(['enabledGroups' => ['design']]))->prepare(new View(), $identity, $this->request($cookie('{"k":"static","id":"blueprint","pal":1}')));
        self::assertStringStartsWith('data-theme="system"', $attrs);

        $attrs = $t->prepare(new View(), null, $this->request($cookie('{"k":"img","u":"photo-123456","pid":"abc123","by":"Jane","un":"jane"}')));
        self::assertStringContainsString('data-bg="img" data-bg-credit="Jane|jane|abc123"', $attrs);
        $photo = '{"k":"img","u":"photo-123456","pid":"abc123","un":"jane","pc":["#2a4d69","#d9b26f","#8c3b2e","#e8e1d4","#12202e"],"pm":"light","pal":1}';
        self::assertStringStartsWith('data-theme="custom" data-mode="light" data-bg="img"', $t->prepare(new View(), $identity, $this->request($cookie($photo))));
        self::assertStringStartsWith('data-theme="custom" data-mode="dark"', $t->prepare(new View(), $identity, $this->request($cookie(str_replace('"light"', '"dark"', $photo)))));
        self::assertStringStartsWith('data-theme="dracula"', $t->prepare(new View(), $identity, $this->request($cookie(str_replace('"pal":1', '"pal":0', $photo)))), 'palette only when ticked');
        self::assertSame('data-theme="system"', $t->prepare(new View(), null, $this->request()));
        self::assertSame('data-theme="system"', (new Themes(['backgroundsEnabled' => false]))->prepare(new View(), null, $this->request($cookie('{"k":"anim","id":"waves"}'))));
    }

    public function testGlassThemesShipTranslucentSurfacesAndTheirOwnTokens(): void
    {
        $t = new Themes();
        $css = $t->css('glass-aurora');
        self::assertStringContainsString('--glass-bg:rgba(', $css);
        self::assertStringContainsString('--glass-filter:blur(18px)', $css);
        self::assertStringContainsString('--page-bg:radial-gradient(', $css);
        self::assertStringContainsString('data-style="glass"', $t->htmlAttributes('glass-aurora'));
        self::assertStringContainsString('--glass-bg:var(--surface);--glass-filter:none', $t->css('forest'));
        self::assertGreaterThanOrEqual(6, count(array_filter($t->all(), static fn (array $x): bool => $x['group'] === 'glass')));
        self::assertSame([], $t->audit());
    }

    public function testUnsplashSearchIsMappedCachedAndTracked(): void
    {
        $calls = [];
        $transport = static function (string $url, array $headers) use (&$calls): ?string {
            $calls[] = [$url, $headers];

            return json_encode(['total' => 40, 'total_pages' => 3, 'results' => [
                ['id' => 'abc123', 'color' => '#336699', 'alt_description' => 'a lake', 'urls' => ['raw' => 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixid=x', 'small' => 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400'], 'user' => ['name' => 'Jane', 'username' => 'jane']],
                ['id' => 'bad', 'urls' => ['raw' => 'https://evil.example/photo-1', 'small' => 'https://evil.example/x'], 'user' => ['name' => 'X', 'username' => 'x']],
            ]]);
        };
        $client = new UnsplashClient('KEY123', $transport);
        $r = $client->search('lake', 2, 18);
        self::assertSame(1, count($r['results']));
        self::assertSame('photo-1506744038136-46273834b3fb', $r['results'][0]['u']);
        self::assertSame(3, $r['pages']);
        self::assertStringContainsString('/search/photos?', $calls[0][0]);
        self::assertStringContainsString('query=lake', $calls[0][0]);
        self::assertContains('Authorization: Client-ID KEY123', $calls[0][1]);
        $client->track('abc123');
        self::assertStringEndsWith('/photos/abc123/download', end($calls)[0]);
        $before = count($calls);
        $client->track('../x');
        self::assertCount($before, $calls);
        self::assertNull((new UnsplashClient('k', static fn () => null))->search('x'));
    }

    public function testUnsplashKeyComesFromConfigOrEnvironmentNeverRequired(): void
    {
        self::assertSame('abc', (new Themes(['unsplashKey' => 'abc']))->unsplashKey());
        putenv('UNSPLASH_ACCESS_KEY=fromenv');
        self::assertSame('fromenv', (new Themes())->unsplashKey());
        putenv('UNSPLASH_ACCESS_KEY');
        self::assertNull((new Themes())->unsplashKey());
    }
}
