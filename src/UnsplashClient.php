<?php

declare(strict_types=1);

namespace rapttor\themes;

use Yii;

/**
 * Minimal Unsplash API client for the background picker (search and the required download ping). The access key stays on the
 * server; the browser only talks to {@see actions\BackgroundSearchAction}. Results are cached for an hour (the demo tier allows
 * 50 requests an hour). Photos are shown by hotlinking images.unsplash.com and credited as the Unsplash guidelines ask.
 */
final class UnsplashClient
{
    private const API = 'https://api.unsplash.com';

    /** @var callable(string, string[]): ?string */
    private $transport;

    /** @param callable(string, string[]): ?string|null $transport GET (url, headers) => body or null; default curl/streams */
    public function __construct(private readonly string $key, ?callable $transport = null, private readonly int $cacheSeconds = 3600)
    {
        $this->transport = $transport ?? [self::class, 'fetch'];
    }

    /**
     * @return array{total: int, pages: int, results: list<array{u: string, pid: string, c: string, thumb: string, by: string, un: string, alt: string}>}|null null when Unsplash did not answer
     */
    public function search(string $query, int $page = 1, int $perPage = 18): ?array
    {
        $query = trim(mb_substr($query, 0, 80));
        $params = ['page' => max(1, min(50, $page)), 'per_page' => max(1, min(30, $perPage)), 'content_filter' => 'high'];
        $path = $query === '' ? '/photos?' . http_build_query($params + ['order_by' => 'popular'])
            : '/search/photos?' . http_build_query($params + ['query' => $query, 'orientation' => 'landscape']);

        return $this->cached('search:' . $path, function () use ($path, $query): ?array {
            $json = $this->get($path);
            if ($json === null) {
                return null;
            }
            $list = $query === '' ? $json : ($json['results'] ?? []);
            $out = [];
            foreach (is_array($list) ? $list : [] as $p) {
                $raw = parse_url((string) ($p['urls']['raw'] ?? ''), PHP_URL_PATH);
                $thumb = (string) ($p['urls']['small'] ?? $p['urls']['thumb'] ?? '');
                $user = (string) ($p['user']['username'] ?? '');
                if (!is_string($raw) || !preg_match('#^/([A-Za-z0-9_-]{6,120})$#', $raw, $m) || !str_starts_with($thumb, 'https://images.unsplash.com/') || $user === '') {
                    continue;
                }
                $out[] = ['u' => $m[1], 'pid' => (string) ($p['id'] ?? ''), 'c' => (string) ($p['color'] ?? ''), 'thumb' => $thumb,
                    'by' => (string) ($p['user']['name'] ?? $user), 'un' => $user, 'alt' => (string) ($p['alt_description'] ?? '')];
            }

            return ['total' => (int) ($json['total'] ?? count($out)), 'pages' => (int) ($json['total_pages'] ?? 1), 'results' => $out];
        });
    }

    /** Required by the Unsplash API guidelines when a photo is used: tells Unsplash it was "downloaded". Once per photo and day. */
    public function track(string $photoId): void
    {
        if (!preg_match('/^[A-Za-z0-9_-]{4,40}$/', $photoId)) {
            return;
        }
        $this->cached('track:' . $photoId, function () use ($photoId): array {
            $this->get('/photos/' . $photoId . '/download');

            return ['ok' => true];
        }, 86400);
    }

    /** @return array<string, mixed>|null */
    private function get(string $path): ?array
    {
        $body = ($this->transport)(self::API . $path, ['Authorization: Client-ID ' . $this->key, 'Accept-Version: v1']);
        $json = is_string($body) ? json_decode($body, true) : null;

        return is_array($json) ? $json : null;
    }

    /** @param callable(): ?array<string, mixed> $load */
    private function cached(string $key, callable $load, ?int $ttl = null): ?array
    {
        $cache = Yii::$app->has('cache') ? Yii::$app->get('cache') : null;
        $key = 'rapttor-unsplash:' . md5($key);
        $hit = $cache?->get($key);
        if (is_array($hit)) {
            return $hit;
        }
        $value = $load();
        if ($value !== null) {
            $cache?->set($key, $value, $ttl ?? $this->cacheSeconds);
        }

        return $value;
    }

    /** @param string[] $headers */
    public static function fetch(string $url, array $headers): ?string
    {
        if (function_exists('curl_init')) {
            $ch = curl_init($url);
            curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_HTTPHEADER => $headers, CURLOPT_TIMEOUT => 8, CURLOPT_CONNECTTIMEOUT => 4, CURLOPT_FOLLOWLOCATION => false, CURLOPT_PROTOCOLS => CURLPROTO_HTTPS]);
            $body = curl_exec($ch);
            $code = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
            curl_close($ch);

            return is_string($body) && $code >= 200 && $code < 300 ? $body : null;
        }
        $body = @file_get_contents($url, false, stream_context_create(['http' => ['method' => 'GET', 'header' => implode("\r\n", $headers), 'timeout' => 8, 'ignore_errors' => false]]));

        return is_string($body) ? $body : null;
    }
}
