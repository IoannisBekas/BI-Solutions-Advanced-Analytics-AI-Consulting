from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


FONTS = Path(r"C:\Windows\Fonts")


def load_font(name: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(FONTS / name, size)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("destination", type=Path)
    parser.add_argument("--category", required=True)
    parser.add_argument("--title", required=True, help="Use | for a line break.")
    args = parser.parse_args()

    image = Image.open(args.source).convert("RGBA")
    width, height = image.size
    overlay = Image.new("RGBA", image.size, (0, 0, 0, 0))
    overlay_pixels = overlay.load()
    gradient_width = int(width * 0.62)
    for x in range(gradient_width):
        alpha = int(184 * (1 - x / gradient_width) ** 1.8)
        for y in range(height):
            overlay_pixels[x, y] = (5, 15, 30, alpha)

    canvas = Image.alpha_composite(image, overlay)
    draw = ImageDraw.Draw(canvas)
    margin = int(width * 0.065)
    category_font = load_font("segoeuib.ttf", max(20, int(width * 0.017)))
    title_font = load_font("segoeuib.ttf", max(46, int(width * 0.056)))
    title = args.title.replace("|", "\n")
    category_y = int(height * 0.24)
    category_box = draw.textbbox((0, 0), args.category, font=category_font)
    category_width = category_box[2] - category_box[0] + 38
    category_height = category_box[3] - category_box[1] + 22
    draw.rounded_rectangle(
        (margin, category_y, margin + category_width, category_y + category_height),
        radius=category_height // 2,
        fill=(37, 99, 235, 230),
    )
    draw.text(
        (margin + 19, category_y + 9 - category_box[1]),
        args.category,
        font=category_font,
        fill=(255, 255, 255, 255),
    )
    title_y = category_y + category_height + int(height * 0.04)
    draw.multiline_text(
        (margin, title_y),
        title,
        font=title_font,
        fill=(255, 255, 255, 255),
        spacing=int(title_font.size * 0.06),
    )
    accent_y = height - int(height * 0.17)
    draw.rounded_rectangle(
        (margin, accent_y, margin + int(width * 0.15), accent_y + 8),
        radius=4,
        fill=(245, 158, 11, 255),
    )
    args.destination.parent.mkdir(parents=True, exist_ok=True)
    canvas.convert("RGB").save(args.destination, quality=95)


if __name__ == "__main__":
    main()
