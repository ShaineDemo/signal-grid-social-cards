#!/usr/bin/env python3
"""Repository-level validation for the open-source Skill package."""

from __future__ import annotations

import re
import sys
from pathlib import Path

import yaml


REQUIRED_FILES = {
    "SKILL.md",
    "agents/openai.yaml",
    "assets/template.html",
    "references/caption-system.md",
    "references/cover-evidence.md",
    "references/narrative-system.md",
    "references/qa.md",
    "references/visual-system.md",
    "scripts/render.cjs",
    "scripts/make_contact_sheet.py",
}

TEXT_EXTENSIONS = {".md", ".html", ".yaml", ".yml", ".py", ".cjs", ".json", ".txt"}
FORBIDDEN_PATTERNS = {
    "personal macOS path": re.compile("/" + "Users/" + r"[^/\s]+/"),
    "unfinished placeholder": re.compile(r"\b(?:TO" "DO|FIX" "ME)\b"),
    "file URI": re.compile("file:" + "//"),
}


def fail(message: str) -> None:
    raise ValueError(message)


def load_frontmatter(path: Path) -> dict:
    content = path.read_text(encoding="utf-8")
    match = re.match(r"^---\n(.*?)\n---", content, re.DOTALL)
    if not match:
        fail("SKILL.md must start with YAML frontmatter")
    data = yaml.safe_load(match.group(1))
    if not isinstance(data, dict):
        fail("SKILL.md frontmatter must be a mapping")
    return data


def validate(root: Path) -> None:
    missing = sorted(item for item in REQUIRED_FILES if not (root / item).is_file())
    if missing:
        fail("Missing required files: " + ", ".join(missing))

    frontmatter = load_frontmatter(root / "SKILL.md")
    if frontmatter.get("name") != "signal-grid-social-cards":
        fail("Unexpected Skill name")
    if not isinstance(frontmatter.get("description"), str) or not frontmatter["description"].strip():
        fail("Skill description is required")

    template = (root / "assets/template.html").read_text(encoding="utf-8")
    for marker in (
        'class="poster',
        "width:1080px",
        "height:1440px",
        "palette-violet-moss",
        "palette-petrol-raspberry",
    ):
        if marker not in template:
            fail(f"Template is missing invariant: {marker}")

    for path in root.rglob("*"):
        if not path.is_file() or path.suffix.lower() not in TEXT_EXTENSIONS:
            continue
        if any(part in {"node_modules", "dist", ".git"} for part in path.parts):
            continue
        content = path.read_text(encoding="utf-8", errors="replace")
        for label, pattern in FORBIDDEN_PATTERNS.items():
            if pattern.search(content):
                fail(f"{path.relative_to(root)} contains {label}")

    print("Skill package is valid")


if __name__ == "__main__":
    package_root = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
    try:
        validate(package_root)
    except ValueError as error:
        print(f"Validation failed: {error}", file=sys.stderr)
        raise SystemExit(1)
