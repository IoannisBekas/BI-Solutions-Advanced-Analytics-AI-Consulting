from __future__ import annotations

import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


CHROME = Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe")
VIEWPORT = "1920,1080"


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: render_svg_covers.py <cover-directory>", file=sys.stderr)
        return 2

    cover_dir = Path(sys.argv[1]).resolve()
    svg_files = sorted(cover_dir.glob("*.svg"))
    if not CHROME.is_file():
        print(f"Chrome was not found at {CHROME}", file=sys.stderr)
        return 1
    if not svg_files:
        print(f"No SVG files found in {cover_dir}", file=sys.stderr)
        return 1

    profile_dir = Path(tempfile.mkdtemp(prefix="bi-cover-render-"))
    try:
        for svg_file in svg_files:
            png_file = svg_file.with_suffix(".png")
            command = [
                str(CHROME),
                "--headless=new",
                "--disable-gpu",
                "--hide-scrollbars",
                "--no-first-run",
                "--force-device-scale-factor=1",
                f"--window-size={VIEWPORT}",
                f"--user-data-dir={profile_dir}",
                f"--screenshot={png_file}",
                svg_file.as_uri(),
            ]
            result = subprocess.run(command, capture_output=True, text=True, timeout=60)
            if result.returncode != 0 or not png_file.is_file():
                print(f"Failed to render {svg_file.name}", file=sys.stderr)
                if result.stderr:
                    print(result.stderr, file=sys.stderr)
                return 1
            print(f"Rendered {png_file.name}")
    finally:
        shutil.rmtree(profile_dir, ignore_errors=True)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
