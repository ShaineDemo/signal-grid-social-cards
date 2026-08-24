# Contributing

Contributions are welcome when they improve factual discipline, accessibility, portability, or the quality of the reusable design system.

This is an AGPL-3.0 project built on ideas from Guizang Social Card Skill by 歸藏 (op7418). Contributions must remain compatible with AGPL-3.0 and retain upstream attribution.

## Before opening a pull request

1. Keep `SKILL.md` concise and move conditional detail into the relevant reference file.
2. Do not add third-party logos, portraits, screenshots, news photos, copied prompts, or proprietary templates.
3. Preserve the `1080×1440` card contract and the source-ledger requirements.
4. Run:

```bash
python3 scripts/validate_skill.py .
npm install
npx playwright install chromium
npm run render:example
python3 -m pip install -r requirements.txt
python3 scripts/make_contact_sheet.py examples/palette-preview/png examples/palette-preview/contact-sheet.png
```

5. Inspect the rendered example, not only the HTML source.

## Palette contributions

A palette should define ink, paper, primary, primary-mid, primary-soft, secondary, secondary-mid, secondary-soft, and muted colors. Test it across the whole sample set. Do not add palettes that are only minor hue shifts or that make body text unreadable.

## Reporting issues

Include the prompt shape, affected file, rendered screenshot when relevant, and whether the problem is factual, narrative, layout, asset provenance, or dependency-related.
