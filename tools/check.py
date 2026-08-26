#!/usr/bin/env python3
"""Guard the one thing that must never break: every published link resolves.

The Google Play listing for Ulam points at https://blinkneuron.eu/ulam/privacy/.
A store listing with a dead privacy-policy URL is a policy violation, so this
check runs before every deploy.

    python3 tools/check.py
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DOMAIN = "blinkneuron.eu"
PRIVACY = ROOT / "ulam" / "privacy" / "index.html"

LINK = re.compile(r'(?:href|src)="([^"]+)"')
EXTERNAL = ("http://", "https://", "mailto:", "tel:", "data:", "#")

errors = []


def check_links() -> None:
    for page in sorted(ROOT.rglob("*.html")):
        if "tools" in page.relative_to(ROOT).parts:
            continue
        for target in LINK.findall(page.read_text(encoding="utf-8")):
            if target.startswith(EXTERNAL):
                continue
            path = target.split("#")[0].split("?")[0]
            if not path:
                continue
            resolved = ROOT / path.lstrip("/") if path.startswith("/") else page.parent / path
            if resolved.is_dir() or path.endswith("/"):
                resolved = resolved / "index.html"
            if not resolved.exists():
                errors.append(f"{page.relative_to(ROOT)} -> {target} is missing")


def check_domain() -> None:
    cname = ROOT / "CNAME"
    if not cname.exists():
        errors.append("CNAME is missing — GitHub Pages will drop the custom domain")
    elif cname.read_text().strip() != DOMAIN:
        errors.append(f"CNAME says {cname.read_text().strip()!r}, expected {DOMAIN!r}")


def check_privacy() -> None:
    if not PRIVACY.exists():
        errors.append("ulam/privacy/index.html is missing — the Play listing points at it")
        return
    text = PRIVACY.read_text(encoding="utf-8")
    for needle in ("eu.blinkneuron.ulam", "krzysztof"):
        if needle not in text:
            errors.append(f"the privacy policy no longer names {needle}")


check_links()
check_domain()
check_privacy()

if errors:
    for error in errors:
        print(f"FAIL  {error}")
    sys.exit(1)

print("OK  links resolve, CNAME is right, the privacy policy is in place")
