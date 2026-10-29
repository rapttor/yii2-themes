<?php

declare(strict_types=1);

namespace rapttor\themes;

/**
 * A user's page background: what it is (kind + id, a colour, two colours and an angle, or a photo), the overlay that keeps the
 * content readable (white or black at 0-90 %), whether the page takes the background's own colour palette and how transparent the
 * main containers are (`liquid`, 0 = off, up to 70 %: the interface "liquifies" over the background). Immutable.
 * A photo can carry `colors` (its 2 to 5 dominant colours, most dominant first, extracted in the browser) and a `paletteMode`
 * (dark or light): the palette is then built from them with {@see ThemeBuilder::fromDominant()}.
 * Stored as one short JSON string (cookie, optional `theme_bg` column); {@see Backgrounds::parse()} validates it.
 *
 *   kind  static | gradient | solid | anim | img
 */
final class Background
{
    public const KINDS = ['static', 'gradient', 'solid', 'anim', 'img'];

    public function __construct(
        public readonly string $kind,
        public readonly string $id = '',
        public readonly ?string $color = null,
        public readonly ?string $color2 = null,
        public readonly int $angle = 135,
        public readonly ?string $photo = null,
        public readonly ?string $photoId = null,
        public readonly ?string $by = null,
        public readonly ?string $user = null,
        public readonly string $overlay = 'n',
        public readonly int $alpha = 0,
        public readonly bool $palette = false,
        public readonly int $liquid = 0,
        public readonly array $colors = [],
        public readonly string $paletteMode = 'dark',
    ) {
    }

    /** Canonical JSON: fixed key order, only what the kind needs. */
    public function __toString(): string
    {
        $a = ['k' => $this->kind];
        match ($this->kind) {
            'static', 'anim' => $a['id'] = $this->id,
            'gradient' => $this->id === 'custom' ? $a += ['id' => 'custom', 'c' => $this->color, 'c2' => $this->color2, 'a' => $this->angle] : $a['id'] = $this->id,
            'solid' => $a['c'] = $this->color,
            'img' => $a += ['u' => $this->photo, 'pid' => $this->photoId, 'c' => $this->color, 'by' => $this->by, 'un' => $this->user],
            default => null,
        };
        $a += ['o' => $this->overlay, 'p' => $this->alpha, 'pal' => $this->palette ? 1 : 0];
        if ($this->kind === 'img' && count($this->colors) > 1) {
            $a['pc'] = $this->colors;
            $a['pm'] = $this->paletteMode;
        }
        if ($this->liquid > 0) {
            $a['l'] = $this->liquid;
        }

        return (string) json_encode(array_filter($a, static fn ($v): bool => $v !== null), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    }

    public function with(array $changes): self
    {
        return new self(...array_merge(get_object_vars($this), $changes));
    }
}
