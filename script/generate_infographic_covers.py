from __future__ import annotations

import argparse
import csv
import textwrap
from pathlib import Path
from xml.sax.saxutils import escape


BLUE = "#5BC2E6"
BLUE_DARK = "#579FC9"
RED = "#F34B3B"
GREY = "#B8C3C4"
LIGHT_GREY = "#D7D7D7"
INK = "#050505"
PAPER = "#FAFAFA"


THEMES = [
    "decision",
    "semantic",
    "requirements",
    "foundation",
    "ai",
    "web",
    "kpi",
    "quality",
    "roadmap",
    "governance",
    "cloud",
    "buildbuy",
    "documents",
    "prompts",
    "governance",
    "forecast",
    "literacy",
    "mlops",
    "monitoring",
]


def lines(title: str) -> list[str]:
    return textwrap.wrap(title, width=50, break_long_words=False)[:3]


def rect(x: int, y: int, w: int, h: int, fill: str = "none", stroke: str = INK, width: int = 8, radius: int = 0) -> str:
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{radius}" fill="{fill}" stroke="{stroke}" stroke-width="{width}"/>'


def line(x1: int, y1: int, x2: int, y2: int, color: str = INK, width: int = 8, dash: str = "") -> str:
    dash_attr = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<path d="M{x1} {y1}L{x2} {y2}" fill="none" stroke="{color}" stroke-width="{width}" stroke-linecap="round"{dash_attr}/>'


def circle(cx: int, cy: int, radius: int, fill: str = "none", stroke: str = INK, width: int = 8) -> str:
    return f'<circle cx="{cx}" cy="{cy}" r="{radius}" fill="{fill}" stroke="{stroke}" stroke-width="{width}"/>'


def bar_chart(x: int, y: int, scale: float = 1.0) -> str:
    widths = int(54 * scale)
    gap = int(22 * scale)
    heights = [96, 142, 188, 236]
    colors = [GREY, RED, BLUE_DARK, BLUE_DARK]
    parts = [line(x - 12, y + int(248 * scale), x + int(4 * widths + 3 * gap + 12), y + int(248 * scale), INK, int(8 * scale))]
    for index, (height, color) in enumerate(zip(heights, colors)):
        bx = x + index * (widths + gap)
        bh = int(height * scale)
        parts.append(f'<rect x="{bx}" y="{y + int(248 * scale) - bh}" width="{widths}" height="{bh}" fill="{color}"/>')
    return "".join(parts)


def donut(cx: int, cy: int, radius: int, scale: float = 1.0) -> str:
    r = int(radius * scale)
    stroke = int(44 * scale)
    return "".join(
        [
            f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{LIGHT_GREY}" stroke-width="{stroke}"/>',
            f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{BLUE}" stroke-width="{stroke}" stroke-linecap="butt" stroke-dasharray="{int(r * 2.0)} {int(r * 4.3)}" transform="rotate(-90 {cx} {cy})"/>',
            f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{RED}" stroke-width="{stroke}" stroke-linecap="butt" stroke-dasharray="{int(r * 0.9)} {int(r * 5.4)}" stroke-dashoffset="-{int(r * 2.2)}" transform="rotate(-90 {cx} {cy})"/>',
        ]
    )


def node_network(cx: int, cy: int, scale: float = 1.0) -> str:
    points = [(0, 0, BLUE_DARK), (130, -86, BLUE), (130, 92, GREY), (278, 4, RED), (390, -90, BLUE), (390, 96, GREY)]
    parts = []
    for a, b in [(0, 1), (0, 2), (1, 3), (2, 3), (3, 4), (3, 5)]:
        x1, y1, _ = points[a]
        x2, y2, _ = points[b]
        parts.append(line(cx + int(x1 * scale), cy + int(y1 * scale), cx + int(x2 * scale), cy + int(y2 * scale), INK, int(7 * scale)))
    for x, y, color in points:
        parts.append(circle(cx + int(x * scale), cy + int(y * scale), int(23 * scale), color, INK, int(7 * scale)))
    return "".join(parts)


def report(x: int, y: int, scale: float = 1.0) -> str:
    w, h = int(238 * scale), int(310 * scale)
    parts = [rect(x, y, w, h, "#FFFFFF", INK, int(8 * scale), int(8 * scale))]
    parts.extend(
        [
            f'<rect x="{x + int(28 * scale)}" y="{y + int(34 * scale)}" width="{int(182 * scale)}" height="{int(104 * scale)}" fill="{LIGHT_GREY}"/>',
            f'<rect x="{x + int(28 * scale)}" y="{y + int(166 * scale)}" width="{int(34 * scale)}" height="{int(34 * scale)}" fill="{GREY}"/>',
            f'<rect x="{x + int(82 * scale)}" y="{y + int(166 * scale)}" width="{int(34 * scale)}" height="{int(34 * scale)}" fill="{BLUE}"/>',
            f'<rect x="{x + int(136 * scale)}" y="{y + int(166 * scale)}" width="{int(34 * scale)}" height="{int(34 * scale)}" fill="{RED}"/>',
        ]
    )
    for row in range(3):
        parts.append(line(x + int(28 * scale), y + int((230 + row * 24) * scale), x + int((190 if row == 0 else 150) * scale), y + int((230 + row * 24) * scale), INK, int(7 * scale)))
    return "".join(parts)


def theme_motif(theme: str) -> str:
    if theme == "semantic":
        return node_network(845, 690, 1.45) + donut(1500, 690, 156, 0.85) + report(1480, 422, 0.72)
    if theme == "requirements":
        return report(1240, 460, 1.25) + "".join(circle(790, y, 30, color, INK, 8) + line(835, y, 1110, y, INK, 10) for y, color in [(525, BLUE), (650, RED), (775, GREY)]) + line(800, 910, 1510, 910, INK, 10)
    if theme == "foundation":
        blocks = "".join(f'<rect x="{720 + i * 92}" y="{750 - i * 40}" width="{330}" height="{64}" rx="16" fill="{color}" stroke="{INK}" stroke-width="8"/>' for i, color in enumerate([GREY, BLUE_DARK, BLUE, RED]))
        return blocks + circle(1330, 430, 86, "#FFFFFF", INK, 10) + node_network(1170, 690, 0.82)
    if theme == "ai":
        return circle(1270, 660, 180, "#FFFFFF", INK, 12) + "".join(circle(x, y, 24, color, INK, 7) + line(1270, 660, x, y, INK, 7) for x, y, color in [(1030, 520, BLUE), (1500, 500, RED), (1510, 790, BLUE_DARK), (1040, 805, GREY)]) + report(650, 580, 0.7)
    if theme == "web":
        return rect(930, 440, 620, 360, "#FFFFFF", INK, 10, 20) + line(930, 510, 1550, 510, INK, 8) + circle(982, 476, 11, RED, RED, 2) + circle(1018, 476, 11, BLUE, BLUE, 2) + f'<rect x="{1010}" y="{560}" width="{210}" height="{150}" fill="{BLUE}"/>' + f'<rect x="{1260}" y="{560}" width="{220}" height="{38}" fill="{GREY}"/>' + f'<rect x="{1260}" y="{630}" width="{175}" height="{26}" fill="{LIGHT_GREY}"/>' + f'<rect x="{1260}" y="{686}" width="{110}" height="{26}" fill="{RED}"/>' + report(630, 570, 0.63)
    if theme == "kpi":
        return donut(1250, 700, 210, 1.0) + bar_chart(1470, 510, 0.82) + node_network(670, 690, 0.75)
    if theme == "quality":
        return rect(710, 480, 580, 320, "#FFFFFF", INK, 10, 16) + "".join(f'<rect x="{750 + col * 115}" y="{530 + row * 66}" width="{82}" height="{38}" fill="{[GREY, BLUE, RED, BLUE_DARK][(row + col) % 4]}"/>' for row in range(3) for col in range(4)) + circle(1460, 690, 132, "#FFFFFF", INK, 16) + line(1550, 780, 1660, 890, INK, 20)
    if theme == "roadmap":
        steps = [(650, 740, BLUE), (960, 650, GREY), (1270, 560, RED), (1580, 470, BLUE_DARK)]
        return "".join(rect(x, y, 180, 100, color, INK, 8, 18) + (line(x + 180, y + 50, steps[i + 1][0], steps[i + 1][1] + 50, INK, 10) if i < 3 else "") for i, (x, y, color) in enumerate(steps))
    if theme == "governance":
        return '<path d="M1240 420L1480 500V670C1480 820 1380 890 1240 950C1100 890 1000 820 1000 670V500Z" fill="#FFFFFF" stroke="#050505" stroke-width="12"/>' + '<path d="M1120 665L1205 750L1375 555" fill="none" stroke="#5BC2E6" stroke-width="36" stroke-linecap="round" stroke-linejoin="round"/>' + report(650, 570, 0.68)
    if theme == "cloud":
        return '<path d="M1000 770H1530C1620 770 1682 716 1682 642C1682 571 1625 518 1555 518C1530 518 1507 524 1487 536C1450 466 1373 420 1284 420C1175 420 1082 488 1050 584C1021 568 987 560 952 560C872 560 808 624 808 704C808 742 828 770 868 770Z" fill="#FFFFFF" stroke="#050505" stroke-width="12"/>' + "".join(rect(x, 825, 120, 80, color, INK, 8, 12) + line(x + 60, 770, x + 60, 825, INK, 8) for x, color in [(900, GREY), (1100, BLUE), (1300, RED), (1500, BLUE_DARK)])
    if theme == "buildbuy":
        return rect(690, 520, 300, 260, "#FFFFFF", INK, 10, 18) + rect(1300, 520, 300, 260, "#FFFFFF", INK, 10, 18) + node_network(820, 650, 0.42) + report(1360, 565, 0.78) + line(990, 650, 1300, 650, INK, 10, "14 18")
    if theme == "documents":
        return "".join(rect(860 + i * 36, 510 - i * 28, 350, 430, "#FFFFFF", INK, 9, 12) for i in range(3)) + "".join(line(980, y, 1260, y, INK, 9) for y in [625, 685, 745]) + circle(1480, 715, 128, "#FFFFFF", INK, 15) + line(1575, 810, 1665, 900, INK, 20)
    if theme == "prompts":
        return rect(770, 560, 310, 150, "#FFFFFF", INK, 10, 16) + rect(1380, 450, 310, 150, "#FFFFFF", INK, 10, 16) + rect(1380, 760, 310, 150, "#FFFFFF", INK, 10, 16) + line(1080, 635, 1250, 635, INK, 10) + line(1250, 635, 1380, 525, INK, 10) + line(1250, 635, 1380, 835, INK, 10) + circle(1250, 635, 22, RED, INK, 7)
    if theme == "forecast":
        return rect(700, 460, 870, 400, "#FFFFFF", INK, 10, 16) + line(790, 770, 1480, 770, INK, 10) + line(790, 550, 790, 770, INK, 10) + '<path d="M815 720C930 700 980 650 1080 670C1180 690 1250 525 1460 530" fill="none" stroke="#5BC2E6" stroke-width="20" stroke-linecap="round"/>' + '<path d="M815 735C960 730 1110 700 1460 610" fill="none" stroke="#F34B3B" stroke-width="12" stroke-linecap="round" stroke-dasharray="20 18"/>'
    if theme == "literacy":
        return rect(700, 530, 330, 320, "#FFFFFF", INK, 11, 8) + rect(1030, 530, 330, 320, "#FFFFFF", INK, 11, 8) + line(1030, 530, 1030, 850, INK, 10) + donut(1540, 680, 132, 0.78) + "".join(line(760, y, 950, y, INK, 9) + line(1090, y, 1275, y, INK, 9) for y in [625, 685, 745])
    if theme == "mlops":
        return donut(1220, 680, 230, 1.0) + '<path d="M1210 400L1285 460L1182 490Z" fill="#5BC2E6"/><path d="M1470 720L1392 662L1490 630Z" fill="#F34B3B"/>' + node_network(720, 690, 0.55)
    if theme == "monitoring":
        return rect(735, 470, 780, 390, "#FFFFFF", INK, 11, 18) + line(800, 785, 1430, 785, INK, 9) + line(800, 550, 800, 785, INK, 9) + '<path d="M815 700H930L992 610L1080 760L1170 570L1260 700H1430" fill="none" stroke="#F34B3B" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>' + circle(1575, 525, 35, RED, INK, 8)
    return donut(1240, 690, 210, 1.0) + report(1480, 480, 0.84) + node_network(650, 760, 0.6)


def create_cover(row: dict[str, str], destination: Path) -> None:
    index = int(row["index"])
    title = escape(row["title"])
    category = "BI SOLUTIONS INSIGHT"
    title_lines = lines(row["title"])
    title_svg = "".join(
        f'<text x="128" y="{145 + line_index * 58}" fill="{INK}" font-family="Arial, Helvetica, sans-serif" font-size="52" font-weight="800">{escape(value)}</text>'
        for line_index, value in enumerate(title_lines)
    )
    theme = THEMES[index - 1] if index <= len(THEMES) else "decision"
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
  <rect width="1920" height="1080" fill="{PAPER}"/>
  <path d="M0 340H1920" stroke="#E9ECEC" stroke-width="3"/>
  <path d="M0 345H1920" stroke="#FFFFFF" stroke-width="2"/>
  <circle cx="112" cy="86" r="19" fill="{BLUE}"/>
  <text x="148" y="94" fill="{INK}" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="800" letter-spacing="2">{category}</text>
  <text x="1720" y="94" fill="{RED}" font-family="Arial, Helvetica, sans-serif" font-size="25" font-weight="800">{index:02d}</text>
  {title_svg}
  <path d="M128 310H430" stroke="{BLUE}" stroke-width="12" stroke-linecap="round"/>
  <g opacity="0.32">{circle(200, 510, 14, BLUE, BLUE, 1)}{circle(280, 670, 23, RED, RED, 1)}{circle(420, 470, 32, GREY, GREY, 1)}{circle(1710, 800, 22, BLUE, BLUE, 1)}{circle(1650, 930, 16, RED, RED, 1)}</g>
  {theme_motif(theme)}
  <path d="M160 965C360 915 520 952 650 1000" fill="none" stroke="{BLUE}" stroke-width="5" stroke-dasharray="8 18"/>
  <path d="M210 905L278 850L348 905" fill="none" stroke="{INK}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M390 920H585" stroke="{INK}" stroke-width="9" stroke-linecap="round"/>
  <path d="M390 950H540" stroke="{INK}" stroke-width="9" stroke-linecap="round"/>
</svg>'''
    destination.write_text(svg, encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("manifest", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--limit", type=int)
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    with args.manifest.open(encoding="utf-8", newline="") as file:
        rows = list(csv.DictReader(file))
    if args.limit:
        rows = rows[: args.limit]
    for row in rows:
        slug = Path(row["svg_file"]).stem
        create_cover(row, args.output / f"{slug}.svg")
    print(f"Created {len(rows)} SVG covers in {args.output}")


if __name__ == "__main__":
    main()
