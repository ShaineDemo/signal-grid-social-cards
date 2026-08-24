---
name: signal-grid-social-cards
description: Create Chinese or English social-card carousels for Xiaohongshu/RedNote, X, and LinkedIn with platform-ready titles and post copy in a modular modernist “signal grid” style. Portable across Codex, Claude Code, Kimi Code CLI, Grok Build, and DeepSeek Harness. Use for explainers, product updates, launch summaries, trend cards, and visual news briefs that may benefit from sourced company logos, product images, or interview portraits; do not use for photo-led lifestyle posts or ornate editorial layouts.
license: AGPL-3.0
---

# Signal Grid Social Cards

Turn a topic or source into an accurate, swipeable visual argument. Xiaohongshu/RedNote is the primary platform; X and LinkedIn use explicit reflow and copy presets instead of reusing the 3:4 Xiaohongshu export unchanged. Support both Simplified Chinese and natural editorial English.

This project is built on workflow and social-storytelling ideas from [Guizang Social Card Skill](https://github.com/op7418/guizang-social-card-skill) by [op7418](https://github.com/op7418). Preserve that attribution and the AGPL-3.0 license. Signal Grid adds its own modular visual language, three palettes, bilingual copy system, evidence-led cover rules, and publish-copy workflow. Do not remove upstream attribution or copy additional upstream assets without preserving their notices and license obligations.

## Required reading

- Read [visual-system.md](references/visual-system.md) before choosing layouts or colors.
- Read [narrative-system.md](references/narrative-system.md) before writing the page plan.
- Read [caption-system.md](references/caption-system.md) before writing the publish-ready title and post copy.
- Read [language-system.md](references/language-system.md) when choosing the output language or producing English cards.
- Read [platform-system.md](references/platform-system.md) whenever the user requests X, LinkedIn, cross-platform output, or a non-default canvas.
- Read [cover-evidence.md](references/cover-evidence.md) when the cover could benefit from a logo, product image, screenshot, person, or interview photo.
- Read [qa.md](references/qa.md) before delivery.

## Workflow

1. Determine the audience, output language, target platform, desired number of cards, and any exact title or source material. If unspecified, default to 6 Simplified Chinese Xiaohongshu/RedNote cards at 1080×1440. Use 1080×1350 and the platform-specific copy/count rules for X or LinkedIn. When the user asks for English, produce the complete card set and post package in English rather than translating fragments inside an otherwise Chinese package.
2. For current news, product availability, prices, policy, or changing specifications, browse first. Prefer official sources, then use a reputable report for rollout details. Keep a source ledger. Do not turn conflicting reports into a fact.
3. Write a compact page plan before coding. Each page must have one takeaway and one visual verb: announce, quantify, compare, route, qualify, or conclude. Select one carousel-wide palette from `visual-system.md`; default to Signal Blue / Alert Orange only when no alternate better matches the subject and recognition asset.
4. Use the default six-page arc when it fits: hook → what changed → what it can do → who gets it/how → why it matters → limits/takeaway. Merge weak pages instead of padding.
5. Create `POST_COPY.md` from the same fact ledger and story thesis. Include one recommended title, 2–3 alternatives, publish-ready body copy, suggested hashtags, and any necessary availability caveat.
6. Decide whether the cover needs a recognition asset. Prefer an official standalone symbol or app/product icon for compact logo tiles; reject a wide wordmark when it becomes unreadably small, and verify that the asset identifies the exact subject rather than an adjacent sub-brand such as Docs, Blog, Labs, or Community. Prefer official company/product marks for company news, an official product or UI image for product news, and a sourced photo of the person or interview scene for interviews. Record provenance before placing it.
7. Copy `assets/template.html` into a task folder outside the skill directory. Replace the placeholder with the planned posters and add only task-scoped CSS when the existing primitives cannot express the page.
8. Use words, numbers, and one recognition asset as the primary visual material. Favor matrices, bars, pills, split fields, meaningful numeric units, and short statements. Every oversized number must stay in the same module as what it counts or measures plus one useful context cue. If it only repeats the title, ranking, or page count, replace it with a labeled sequence, relationship, category list, or action verb. Do not invent statistics to make a page look designed.
9. Set `data-platform="xiaohongshu"`, `data-platform="x"`, or `data-platform="linkedin"` on `<body>`, then render with `scripts/render.cjs <index.html> <output-dir>`. The renderer checks the matching dimensions. If `playwright` is not locally resolvable, set `NODE_PATH` to the available workspace Node modules directory.
10. Build a review image with `scripts/make_contact_sheet.py <output-dir> <contact-sheet.png>`.
11. Inspect the contact sheet and at least the cover at full size. Correct overflow, weak hierarchy, repetitive layouts, factual ambiguity, accidental decoration, distorted brand assets, and misleading imagery before delivery.

## Content rules

- Lead product updates with the user-facing change, not corporate chronology.
- Cover: one concrete hook, normally no more than 22 Chinese characters.
- English cover: one concrete hook, normally 4–10 words; prefer natural editorial phrasing over literal translation.
- Content pages: 1 headline plus 1–4 short supporting fragments; move nuance to a caption or final note.
- Use dates, versions, hardware requirements, and subscription conditions only when sourced.
- Label uncertainty plainly: “分批推送”, “以车辆实际收到为准”, or “官方尚未确认”.
- Never imply that a conversational model can control the vehicle unless the source explicitly confirms that capability for the released version.
- Keep source names and URLs in a task-local `SOURCES.md`; visible citations can be compact source labels in the footer.
- The post copy may add context and interpretation, but it must not introduce unsourced capabilities that do not appear in the fact ledger.
- End the post with a useful takeaway or a specific discussion question; avoid generic engagement bait.
- Keep visible card copy, `POST_COPY.md`, alt text, and disclosure notes in the selected output language. Preserve official product names and source titles where translation would reduce accuracy.
- Do not describe one unchanged export as optimized for every platform. Reflow X and LinkedIn editions to 4:5 and apply their platform-specific card-count and copy rules.

## Visual rules

- Use one dominant accent family per page from the selected carousel-wide palette. Neutral pages may use the paired off-white with one accent.
- Typography is the image. Large type is medium or regular weight; never use a heavy display face to simulate impact.
- Rounded geometry is structural: outer panels, circular matrix cells, and compact pills. Avoid generic nested SaaS cards.
- No gradients, drop shadows, fake 3D, glassmorphism, decorative stock illustrations, emoji, or random blobs.
- Vary the page grammar across the set. Do not repeat the same title-plus-four-box layout more than twice.
- Treat a large number as information, never as filler. Pair it visibly with its unit or counted object and a consequence, comparison, time frame, stage label, or list that resolves the count.
- Preserve at least 60 px outer safe margin and 24 px gaps. Keep body text at least 30 px at 1080-pixel width.
- Logos and portraits are recognition evidence, not decoration. Keep them subordinate to the editorial headline, preserve their aspect ratio, and never redraw, recolor, or synthesize an official logo.
- Do not generate a fake photo of a real person or a fabricated interview scene. Use a user-supplied image, the original interview/event image, an official press image, or a clearly licensed photograph.

## Deliverables

Return:

- Editable `index.html`.
- Ordered PNG files named `01-...png`, `02-...png`, and so on.
- One contact sheet for quick review.
- `POST_COPY.md` containing the recommended title, alternatives, post body, hashtags, and disclosure/caveat when needed.
- `SOURCES.md` for current or evidence-based topics.
- For LinkedIn document-carousel delivery, one PDF built with `scripts/pngs_to_pdf.py`; keep the PNG source pages too.
- A concise note stating dimensions, verification performed, and any unresolved availability caveat.
