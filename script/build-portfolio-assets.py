"""Frame and compress real screenshots captured by capture-portfolio-assets.mjs."""
import json
from pathlib import Path
from urllib.parse import urlparse
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parent.parent
projects = json.loads((root / "shared/portfolio-projects.json").read_text(encoding="utf-8"))
captures = {item["slug"]: item for item in json.loads((root / "output/portfolio/capture-report.json").read_text(encoding="utf-8"))}
target = root / "apps/client/public/assets/projects"
font = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 17) if Path("C:/Windows/Fonts/arial.ttf").exists() else ImageFont.load_default(size=17)
manifest = []

def frame(screenshot, width, height, domain):
    canvas = Image.new("RGB", (width, height), "#e8e6e1")
    draw = ImageDraw.Draw(canvas)
    margin, toolbar = round(width * .022), round(width * .029)
    left, top, right, bottom = margin, margin, width-margin, height-margin
    draw.rounded_rectangle((left, top, right, bottom), radius=12, fill="white")
    draw.text((left+80, top+toolbar/2), domain, font=font, fill="#5b6169", anchor="lm")
    for offset, colour in enumerate(["#d45b56", "#d8b451", "#70a47d"]):
        x = left+18+offset*17
        y = top+toolbar//2
        draw.ellipse((x-4,y-4,x+4,y+4), fill=colour)
    area = (right-left, bottom-top-toolbar)
    resized = screenshot.resize((area[0], round(screenshot.height*area[0]/screenshot.width)), Image.Resampling.LANCZOS)
    canvas.paste(resized.crop((0,0,area[0],area[1])), (left,top+toolbar))
    return canvas

for project in projects:
    capture = captures[project["slug"]]
    if capture.get("error") or capture["status"] != 200:
        raise ValueError(f"No verified capture for {project['slug']}")
    screenshot = Image.open(root / "output/portfolio/raw" / f"{project['slug']}.png").convert("RGB")
    directory = target / project["slug"]
    directory.mkdir(parents=True, exist_ok=True)
    cover = frame(screenshot, 1440, 810, urlparse(project["url"]).netloc)
    cover.save(directory / "cover.webp", quality=84, method=6)
    cover.resize((800,450), Image.Resampling.LANCZOS).save(directory / "800.webp", quality=82, method=6)
    frame(screenshot, 1200, 630, urlparse(project["url"]).netloc).save(directory / "social.webp", quality=84, method=6)
    manifest.append({"slug": project["slug"], "sourceUrl": project["url"], "finalUrl": capture["finalUrl"], "pageTitle": capture["title"], "httpStatus": capture["status"], "capturedAt": capture["capturedAt"], "assets": [{"file": f"{project['slug']}/{name}.webp", "width": w, "height": h, "bytes": (directory / f"{name}.webp").stat().st_size} for name,w,h in [("cover",1440,810),("800",800,450),("social",1200,630)]]})
(target / "manifest.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print(f"Created {len(projects)*3} WebP assets, {sum(asset['bytes'] for row in manifest for asset in row['assets'])/1024/1024:.2f} MiB total")
