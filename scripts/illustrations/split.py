#!/usr/bin/env python3
"""Splits each setup illustration into layers the app colours with the
current palette.

The artwork is drawn in four flat colours (ink outlines, violet, amber, cream)
plus small accents. For every source image this writes, next to each other in
public/images/onboarding/:

  <id>.base.webp     everything that keeps its own colour (cream, accents)
  <id>.ink.webp      where the outline is          -> painted with --art-ink
  <id>.primary.webp  where the violet is           -> painted with --art-primary
  <id>.accent.webp   where the amber is            -> painted with --art-accent

The three masks only carry transparency; CSS fills them with a colour. Edge
pixels are split by how far they lie between the outline and the fill, so the
anti-aliasing survives any colour.

    python3 scripts/illustrations/split.py        (needs Pillow and NumPy)

Sources: docs/onboarding-illustrations/source/<id>.webp (see the README there).
"""
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "docs" / "onboarding-illustrations" / "source"
OUT = ROOT / "public" / "images" / "onboarding"

INK = np.array([29, 34, 64], float)
PRIMARY = np.array([91, 63, 214], float)
ACCENT = np.array([245, 165, 36], float)
CREAM = np.array([255, 253, 248], float)
# How far (in RGB) a pixel may sit from the line ink -> colour and still count.
TOLERANCE = 34
SIZE = (600, 400)


def along(pixels, start, end):
    """Position of each pixel between two colours (0..1) and its distance from that line."""
    direction = end - start
    t = np.clip(((pixels - start) @ direction) / (direction @ direction), 0, 1)
    off = np.linalg.norm(pixels - (start + t[..., None] * direction), axis=-1)
    return t, off


def split(image):
    px = np.asarray(image.convert("RGBA"), float)
    rgb, alpha = px[..., :3], px[..., 3] / 255
    lines = [along(rgb, INK, colour) for colour in (PRIMARY, ACCENT, CREAM)]
    kind = np.zeros(alpha.shape, int)  # 0 keeps its colour, 1 primary, 2 accent, 3 cream
    best = np.full(alpha.shape, float(TOLERANCE))
    for index, (_, off) in enumerate(lines, start=1):
        closer = off < best
        kind[closer] = index
        best[closer] = off[closer]
    t = np.select([kind == 1, kind == 2, kind == 3], [line[0] for line in lines], 0)
    masks = {
        "ink": np.where(kind > 0, 1 - t, 0) * alpha,
        "primary": np.where(kind == 1, t, 0) * alpha,
        "accent": np.where(kind == 2, t, 0) * alpha,
    }
    base = px.copy()
    base[(kind == 1) | (kind == 2), 3] = 0
    cream = kind == 3
    base[cream, :3] = CREAM  # its share of ink is drawn by the ink layer
    base[cream, 3] = (t * alpha * 255)[cream]
    return Image.fromarray(np.round(base).astype("uint8"), "RGBA"), masks


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for source in sorted(SOURCE.glob("*.webp")):
        # Shown about 270px wide, so 600px covers high-density screens.
        image = Image.open(source).convert("RGBA").resize(SIZE, Image.LANCZOS)
        base, masks = split(image)
        base.save(OUT / f"{source.stem}.base.webp", "WEBP", quality=88, method=6)
        for name, mask in masks.items():
            layer = Image.new("RGBA", base.size, (255, 255, 255, 0))
            layer.putalpha(Image.fromarray(np.round(mask * 255).astype("uint8"), "L"))
            # Only the transparency matters; it is stored lossy, which is far smaller.
            layer.save(
                OUT / f"{source.stem}.{name}.webp",
                "WEBP",
                quality=40,
                alpha_quality=70,
                method=6,
            )
    print(f"Split {len(list(SOURCE.glob('*.webp')))} illustrations into {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
