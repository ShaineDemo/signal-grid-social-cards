#!/usr/bin/env python3
"""Build a clean, deterministic Skill ZIP with SKILL.md at its root."""

from __future__ import annotations

import shutil
import zipfile
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"
OUTPUT = DIST / "signal-grid-social-cards.zip"
EXCLUDED_PARTS = {".git", ".github", "dist", "node_modules", "__pycache__", "png"}
EXCLUDED_NAMES = {".DS_Store", "package-lock.json"}


def included_files() -> list[Path]:
    files = []
    for path in ROOT.rglob("*"):
        if not path.is_file():
            continue
        relative = path.relative_to(ROOT)
        if any(part in EXCLUDED_PARTS for part in relative.parts):
            continue
        if path.name in EXCLUDED_NAMES or path.suffix == ".pyc":
            continue
        files.append(path)
    return sorted(files, key=lambda item: item.as_posix())


def main() -> None:
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir(parents=True)
    with zipfile.ZipFile(OUTPUT, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for path in included_files():
            relative = path.relative_to(ROOT).as_posix()
            info = zipfile.ZipInfo(relative, date_time=(2026, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o644 << 16
            archive.writestr(info, path.read_bytes())
    print(OUTPUT)


if __name__ == "__main__":
    main()
