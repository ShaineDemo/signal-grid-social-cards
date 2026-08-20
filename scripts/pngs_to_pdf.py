#!/usr/bin/env python3
"""Combine ordered PNG cards into a LinkedIn-ready PDF document."""

import argparse
from pathlib import Path

from PIL import Image


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input_dir", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()

    files = sorted(args.input_dir.glob("*.png"))
    if not files:
        raise SystemExit("No PNG files found")

    pages = []
    expected_size = None
    for path in files:
        with Image.open(path) as source:
            page = source.convert("RGB")
            if expected_size is None:
                expected_size = page.size
            elif page.size != expected_size:
                raise SystemExit(
                    f"Mixed page sizes: {path.name} is {page.size}, expected {expected_size}"
                )
            pages.append(page.copy())

    args.output.parent.mkdir(parents=True, exist_ok=True)
    pages[0].save(
        args.output,
        "PDF",
        save_all=True,
        append_images=pages[1:],
        resolution=144,
    )
    print(args.output)


if __name__ == "__main__":
    main()
