from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


CHROME = Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe")
VIEWPORT = "1920,1080"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("cover_directory", type=Path)
    parser.add_argument("--output-dir", type=Path)
    args = parser.parse_args()

    cover_dir = args.cover_directory.resolve()
    output_dir = (args.output_dir or cover_dir).resolve()
    svg_files = sorted(cover_dir.glob("*.svg"))
    if not CHROME.is_file():
        print(f"Chrome was not found at {CHROME}", file=sys.stderr)
        return 1
    if not svg_files:
        print(f"No SVG files found in {cover_dir}", file=sys.stderr)
        return 1

    output_dir.mkdir(parents=True, exist_ok=True)
    profile_dir = Path(tempfile.mkdtemp(prefix="bi-cover-render-"))
    try:
        for svg_file in svg_files:
            png_file = output_dir / f"{svg_file.stem}.png"
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
