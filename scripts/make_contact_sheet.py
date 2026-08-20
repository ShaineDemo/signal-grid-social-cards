#!/usr/bin/env python3
import argparse
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("input_dir", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--cols", type=int, default=3)
    args = parser.parse_args()

    files = sorted(args.input_dir.glob("*.png"))
    if not files:
        raise SystemExit("No PNG files found")

    thumb_w, thumb_h = 360, 480
    gap, label_h, outer = 24, 40, 32
    rows = (len(files) + args.cols - 1) // args.cols
    width = outer * 2 + args.cols * thumb_w + (args.cols - 1) * gap
    height = outer * 2 + rows * (thumb_h + label_h) + (rows - 1) * gap
    sheet = Image.new("RGB", (width, height), "#171717")
    draw = ImageDraw.Draw(sheet)

    for i, file in enumerate(files):
        image = Image.open(file).convert("RGB")
        thumb = ImageOps.fit(image, (thumb_w, thumb_h), method=Image.Resampling.LANCZOS)
        col, row = i % args.cols, i // args.cols
        x = outer + col * (thumb_w + gap)
        y = outer + row * (thumb_h + label_h + gap)
        sheet.paste(thumb, (x, y))
        draw.text((x, y + thumb_h + 10), file.name, fill="#fbfaf6")

    args.output.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(args.output, quality=95)
    print(args.output)


if __name__ == "__main__":
    main()
