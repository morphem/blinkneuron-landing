#!/usr/bin/env python3
"""Rebuild the two Ulam screenshots used on the page.

The source is the Play store set in the app's own repository, which is where those
files are produced and kept. One crop for both, so the pair shares an aspect ratio
and the browser never has to crop them at render time.

    python3 tools/shots.py
"""
from pathlib import Path

from PIL import Image

SOURCE = Path.home() / "projects" / "ignacy-alfik" / "store" / "screenshots"
TARGET = Path(__file__).resolve().parent.parent / "assets" / "img"

CROP = (0, 0, 1080, 1500)   # the phone shot is 1080x1920 and the last 420 rows are empty
SIZE = (640, 889)

for source_name, target_name in [("phone-question", "ulam-question"),
                                 ("phone-spiral", "ulam-spiral")]:
    image = Image.open(SOURCE / f"{source_name}.png").crop(CROP).resize(SIZE, Image.LANCZOS)
    path = TARGET / f"{target_name}.webp"
    image.save(path, "WEBP", quality=82, method=6)
    print(f"{path.name}  {path.stat().st_size // 1024} KB")
