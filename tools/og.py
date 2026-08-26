"""Render assets/og.png — the social preview card.

The card is drawn by a browser with the site's own stylesheet, so the wordmark
and the spiral match the page exactly. Re-run this rather than editing the PNG.

    /home/morph/projects/overworked/.venv/bin/python tools/og.py
"""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent

with sync_playwright() as play:
    browser = play.chromium.launch()
    page = browser.new_context(viewport={"width": 1200, "height": 630},
                               device_scale_factor=1,
                               color_scheme="light").new_page()
    page.goto((ROOT / "tools" / "og.html").as_uri(), wait_until="networkidle")
    page.wait_for_timeout(300)
    page.screenshot(path=str(ROOT / "assets" / "og.png"))
    browser.close()

print("wrote assets/og.png")
