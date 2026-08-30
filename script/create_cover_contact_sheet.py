from __future__ import annotations

import argparse
import csv
import textwrap
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


COLS = 4
THUMB = (448, 252)
LABEL_HEIGHT = 66
PADDING = 20
GAP = 16


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    name = "segoeuib.ttf" if bold else "segoeui.ttf"
    return ImageFont.truetype(Path(r"C:\Windows\Fonts") / name, size)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("covers", type=Path)
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    cover_dir = args.covers
    output = args.output or cover_dir / "contact-sheet.png"
    with args.manifest.open(encoding="utf-8", newline="") as file:
        covers = list(csv.DictReader(file))

    rows = (len(covers) + COLS - 1) // COLS
    width = PADDING * 2 + COLS * THUMB[0] + (COLS - 1) * GAP
    cell_height = THUMB[1] + LABEL_HEIGHT
    height = PADDING * 2 + rows * cell_height + (rows - 1) * GAP
    sheet = Image.new("RGB", (width, height), "#f8fafc")
    draw = ImageDraw.Draw(sheet)
    title_font = font(17, bold=True)
    number_font = font(15, bold=True)

    for index, cover in enumerate(covers):
        col, row = index % COLS, index // COLS
        x = PADDING + col * (THUMB[0] + GAP)
        y = PADDING + row * (cell_height + GAP)
        image = Image.open(cover_dir / cover["png_file"]).convert("RGB")
        image.thumbnail(THUMB, Image.Resampling.LANCZOS)
        sheet.paste(image, (x, y))
        draw.rounded_rectangle((x, y, x + THUMB[0], y + THUMB[1]), radius=12, outline="#cbd5e1", width=2)
        label_y = y + THUMB[1] + 8
        draw.text((x, label_y), f"{int(cover['index']):02d}", fill="#2563eb", font=number_font)
        title = "\n".join(textwrap.wrap(cover["title"], width=39)[:2])
        draw.multiline_text((x + 34, label_y), title, fill="#111827", font=title_font, spacing=2)

    output.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(output, quality=94)


if __name__ == "__main__":
    main()
