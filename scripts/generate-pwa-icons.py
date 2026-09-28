#!/usr/bin/env python3
"""Generate Baby Tinder PWA icons (pink heart + gold superlike star).

Requires Pillow. Run from the repo root:

    python3 scripts/generate-pwa-icons.py
"""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

# Brand tokens from src/index.css
# primary: hsl(350 80% 55%) → #e8304f
# gradient end: hsl(350 80% 65%) → #ed5e76
# superlike: hsl(45 100% 50%) → #ffbf00
# superlike foreground: hsl(0 0% 13%) → #212121
PRIMARY = (232, 48, 79, 255)
PRIMARY_LIGHT = (237, 94, 118, 255)
STAR_GOLD = (255, 191, 0, 255)
STAR_INK = (33, 33, 33, 255)
WHITE = (255, 255, 255, 255)

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
SUPERSAMPLE = 4


def lerp(c1: tuple[int, int, int, int], c2: tuple[int, int, int, int], t: float) -> tuple[int, int, int, int]:
    return tuple(int(a + (b - a) * t) for a, b in zip(c1, c2))  # type: ignore[return-value]


def diagonal_gradient(size: int) -> Image.Image:
    """135deg brand gradient: primary at the top-left, lighter pink at the bottom-right."""
    sample = 128
    pixels: list[tuple[int, int, int, int]] = []
    denom = 2 * (sample - 1)
    for y in range(sample):
        for x in range(sample):
            pixels.append(lerp(PRIMARY, PRIMARY_LIGHT, (x + y) / denom))
    img = Image.new("RGBA", (sample, sample))
    img.putdata(pixels)
    return img.resize((size, size), Image.Resampling.BICUBIC)


def heart_points(cx: float, cy: float, scale: float, n: int = 480) -> list[tuple[float, float]]:
    pts: list[tuple[float, float]] = []
    for i in range(n):
        t = 2 * math.pi * i / n
        x = 16 * math.sin(t) ** 3
        y = 13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t)
        pts.append((cx + scale * x, cy - scale * y))
    return pts


def star_points(cx: float, cy: float, outer: float, inner: float, n: int = 5) -> list[tuple[float, float]]:
    pts: list[tuple[float, float]] = []
    rot = -math.pi / 2
    for i in range(n * 2):
        radius = outer if i % 2 == 0 else inner
        angle = rot + i * math.pi / n
        pts.append((cx + radius * math.cos(angle), cy + radius * math.sin(angle)))
    return pts


def draw_symbol(canvas: Image.Image, *, with_star: bool, symbol_scale: float) -> None:
    size = canvas.width
    # Parametric heart is 32 units wide. Its bbox center sits 6 units below the origin,
    # so shift cy up by that amount and a hair more for optical balance.
    heart_scale = (size * symbol_scale) / 32
    cx = size / 2
    cy = size / 2 - size * 0.02 - 6 * heart_scale
    heart = heart_points(cx, cy, heart_scale)

    shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    offset = max(1, size * 0.012)
    shifted = [(x, y + offset) for x, y in heart]
    shadow_draw.polygon(shifted, fill=(120, 16, 36, 110))
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=max(1, size * 0.018)))
    canvas.alpha_composite(shadow)

    draw = ImageDraw.Draw(canvas)
    draw.polygon(heart, fill=WHITE)

    if not with_star:
        return

    # Sit the superlike badge on the heart's upper-right lobe.
    badge_r = size * (0.132 if symbol_scale < 0.5 else 0.122)
    badge_cx = cx + heart_scale * 9.2
    badge_cy = cy - heart_scale * 1.4

    badge_shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    ImageDraw.Draw(badge_shadow).ellipse(
        (badge_cx - badge_r, badge_cy - badge_r + offset, badge_cx + badge_r, badge_cy + badge_r + offset),
        fill=(120, 16, 36, 100),
    )
    badge_shadow = badge_shadow.filter(ImageFilter.GaussianBlur(radius=max(1, size * 0.012)))
    canvas.alpha_composite(badge_shadow)

    draw = ImageDraw.Draw(canvas)
    ring = badge_r * 0.12
    draw.ellipse(
        (badge_cx - badge_r - ring, badge_cy - badge_r - ring, badge_cx + badge_r + ring, badge_cy + badge_r + ring),
        fill=WHITE,
    )
    draw.ellipse(
        (badge_cx - badge_r, badge_cy - badge_r, badge_cx + badge_r, badge_cy + badge_r),
        fill=STAR_GOLD,
    )
    draw.polygon(
        star_points(badge_cx, badge_cy + badge_r * 0.04, badge_r * 0.58, badge_r * 0.26),
        fill=STAR_INK,
    )


def render(size: int, *, rounded: bool, with_star: bool, symbol_scale: float) -> Image.Image:
    s = size * SUPERSAMPLE
    img = diagonal_gradient(s)
    if rounded:
        mask = Image.new("L", (s, s), 0)
        radius = int(s * 0.2237)
        ImageDraw.Draw(mask).rounded_rectangle((0, 0, s - 1, s - 1), radius=radius, fill=255)
        img.putalpha(mask)
    draw_symbol(img, with_star=with_star, symbol_scale=symbol_scale)
    return img.resize((size, size), Image.Resampling.LANCZOS)


def main() -> None:
    PUBLIC.mkdir(parents=True, exist_ok=True)

    # "any" icons: rounded squircle, transparent corners, safe to show in the install UI.
    any_icons = {
        192: PUBLIC / "pwa-192x192.png",
        512: PUBLIC / "pwa-512x512.png",
    }
    for size, path in any_icons.items():
        render(size, rounded=True, with_star=True, symbol_scale=0.56).save(path, "PNG")

    # Maskable icons are full-bleed; the heart stays inside the center safe zone.
    maskable = {
        192: PUBLIC / "pwa-maskable-192x192.png",
        512: PUBLIC / "pwa-maskable-512x512.png",
    }
    for size, path in maskable.items():
        render(size, rounded=False, with_star=True, symbol_scale=0.42).convert("RGB").save(path, "PNG")

    # Apple applies its own mask and paints black behind transparency.
    apple = render(180, rounded=False, with_star=True, symbol_scale=0.50).convert("RGB")
    apple.save(PUBLIC / "apple-touch-icon.png", "PNG")

    favicon = render(32, rounded=True, with_star=False, symbol_scale=0.62)
    favicon.save(PUBLIC / "favicon-32x32.png", "PNG")
    favicon.save(PUBLIC / "favicon.ico", format="ICO", sizes=[(16, 16), (32, 32)])

    print("wrote icons to", PUBLIC)


if __name__ == "__main__":
    main()
