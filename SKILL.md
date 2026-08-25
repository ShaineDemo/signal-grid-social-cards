---
name: brief-grid
description: Create Chinese or English social-card carousels for Xiaohongshu/RedNote, X, and LinkedIn with platform-ready titles and post copy in a modular modernist “signal grid” style. Portable across Codex, Claude Code, Kimi Code CLI, Grok Build, and DeepSeek Harness. Use for explainers, product updates, launch summaries, trend cards, and visual news briefs that may benefit from sourced company logos, product images, or interview portraits; do not use for photo-led lifestyle posts or ornate editorial layouts.
license: AGPL-3.0
---

# BriefGrid

Turn a topic or source into an accurate, swipeable visual argument. Xiaohongshu/RedNote is the primary platform; X and LinkedIn use explicit reflow and copy presets instead of reusing the 3:4 Xiaohongshu export unchanged. Support both Simplified Chinese and natural editorial English.

This project is built on workflow and social-storytelling ideas from [Guizang Social Card Skill](https://github.com/op7418/guizang-social-card-skill) by [歸藏 (op7418)](https://github.com/op7418). Preserve that attribution and the AGPL-3.0 license. BriefGrid adds its own modular visual language, three palettes, bilingual copy system, evidence-led cover rules, and publish-copy workflow. Do not remove upstream attribution or copy additional upstream assets without preserving their notices and license obligations.

## Required reading

- Read [visual-system.md](references/visual-system.md) before choosing layouts or colors.
- Read [narrative-system.md](references/narrative-system.md) before writing the page plan.
- Read [story-direction.md](references/story-direction.md) before compressing sources or deciding the page count.
- Read [creative-direction.md](references/creative-direction.md) before choosing the cover concept or composing any page.
- Read [caption-system.md](references/caption-system.md) before writing the publish-ready title and post copy.
- Read [language-system.md](references/language-system.md) when choosing the output language or producing English cards.
- Read [platform-system.md](references/platform-system.md) whenever the user requests X, LinkedIn, cross-platform output, or a non-default canvas.
- Read [cover-evidence.md](references/cover-evidence.md) when the cover could benefit from a logo, product image, screenshot, person, or interview photo.
- Read [portable-contract.md](references/portable-contract.md) before writing HTML. Its data attributes and audit gate are mandatory for every generated deliverable.
- Read [qa.md](references/qa.md) before delivery.

## Workflow

1. Determine the audience, output language, target platform, desired number of cards, and any exact title or source material. If unspecified, use Simplified Chinese Xiaohongshu/RedNote cards at 1080×1440 and let the evidence determine a 4–7 card count; 5–6 is common, not mandatory. Use 1080×1350 and the platform-specific copy/count rules for X or LinkedIn. When the user asks for English, produce the complete card set and post package in English rather than translating fragments inside an otherwise Chinese package.
2. For current news, product availability, prices, policy, or changing specifications, browse first. Prefer official sources, then use a reputable report for rollout details. Keep a source ledger. Do not turn conflicting reports into a fact.
3. Create `STORY_PLAN.md` using `story-direction.md`: fact ledger, story thesis, reader tension, evidence hierarchy, publication boundary, cover handoff, and a page table. Let that table determine the exact card count, then declare the same count in HTML with `body[data-card-count]`. Give every page one unique reader question, one answer, one new information gain, one visual relationship, one claim status, and explicit source IDs. The cover must name the next reader question it deliberately leaves for page 2; merge or remove a page that cannot add a new answer.
4. Create `ART_DIRECTION.md` using `creative-direction.md`. Write three genuinely different cover concepts derived from the story. For each concept, state what stops the scroll, the single proof relationship, what is deliberately deferred, and what page 2 reveals. Select one using recognition, relevance, thumbnail clarity, evidence support, handoff strength, and distinctiveness, then describe the carousel rhythm. Select one carousel-wide palette from `visual-system.md`; default to Signal Blue / Alert Orange only when no alternate better matches the subject and recognition asset. Record the cover-asset availability, decision, and reason using the exact machine-readable fields in `portable-contract.md`. An available product image may still be declined, but a text-led cover must explain why that choice is editorially stronger.
5. Create `POST_COPY.md` from the same fact ledger and story thesis. Include one recommended title, 2–3 alternatives, publish-ready body copy, suggested hashtags, and any necessary availability caveat.
6. Decide whether the selected cover concept needs a recognition asset. Route the asset by editorial role and source fitness rather than enforcing an official-only rule. Identity assets may be official, primary-source, verified third-party, or user-provided; evidence assets may also be licensed editorial material; contextual assets may use licensed, Creative Commons, user-provided, or clearly disclosed generated imagery but must never masquerade as evidence of a real event. Prefer a standalone symbol or app/product icon for compact logo tiles; reject a wide wordmark when it becomes unreadably small, and verify that it identifies the exact subject rather than an adjacent sub-brand such as Docs, Blog, Labs, or Community. Never redraw a logo with image generation. Record provenance, rights notes, role, origin, and visual inspection before placing any asset.
7. Copy `assets/template.html` into a task folder outside the skill directory. Treat it as a canvas, token set, and primitive library—not a composition to imitate. Preserve the portable contract attributes while replacing the placeholder with the planned posters. Use task-scoped CSS whenever the existing primitives cannot express the selected visual relationship.
8. Use the content relationship—not a preferred component—as the starting point for every page. Words, numbers, sourced assets, paths, scales, bands, matrices, and custom flat geometry are available materials. On the cover, combine recognition and change with normally one proof relationship; a before→after pair or a small capability cluster may contain several marks while remaining one relationship. Defer the complete table, taxonomy, conditions, or implementation detail to the page that answers the next question. Every oversized number must stay in the same module as what it counts or measures plus one useful context cue. Declare its purpose as current value, comparison, calculation, boundary, or sequence. Do not let the same dominant number lead multiple pages unless the later page adds a visibly different comparison, calculation, boundary, or decision. If a number only repeats the title, ranking, or page count, replace it with a labeled sequence, relationship, category list, or action verb. Do not invent statistics to make a page look designed.
9. Set the card count, unique page index and filename, single page header/number/footer/source-footer shell, platform, topic subject, cover-asset availability and decision, cover roles, cover-to-page-2 handoff, semantic fact IDs for cover evidence, page grammars, evidence roles, and metric roles required by `portable-contract.md`. Price/spec comparisons must declare the compared SKU and common comparison basis; price comparisons also declare one consistent price type. Performance multiples must declare the test subject, baseline, measured metric, and workload/configuration context. Run `scripts/audit.cjs <index.html>` and fix every error before rendering. Then render with `scripts/render.cjs <index.html> <output-dir>`; the renderer repeats the audit, reads the sibling `ART_DIRECTION.md`, and checks platform dimensions. Never use `--skip-contract` for generated deliverables. If `playwright` is not locally resolvable, set `NODE_PATH` to the available workspace Node modules directory.
10. Build a review image with `scripts/make_contact_sheet.py <output-dir> <contact-sheet.png>`.
11. Run the first-render critique in `creative-direction.md`: inspect the contact sheet at thumbnail size and the cover plus densest page at full size. Apply the one-sentence, deletion, and page-2 handoff tests to the cover. Record separate contract, fact, cover-visual, full-set, and overall results in `TEST_REPORT.md`; any material cover failure makes the overall result fail even when the DOM audit is clean. Correct every material weakness and render again. A first pass may remain unchanged only when the report explains why it already passes the relevant critique questions.

## Content rules

- Lead product updates with the user-facing change, not corporate chronology.
- Cover: one concrete hook, normally no more than 22 Chinese characters, plus only the evidence needed to make that hook credible. The cover is not a miniature table of contents or a compressed detail page.
- English cover: one concrete hook, normally 4–10 words; prefer natural editorial phrasing over literal translation.
- Content pages: one dominant answer with as many short supporting fragments as the evidence relationship needs; remove fragments that do not change understanding.
- Use dates, versions, hardware requirements, and subscription conditions only when sourced.
- A product price comparison is valid only when every visible price has a named SKU, price type such as official starting/configured/education/promotional, and one shared market, tier, and time basis. Split relationships that use different bases.
- A performance multiplier is valid only when the card states what was tested, what it was compared with, which metric the multiple represents, and enough workload/configuration context to interpret it. Do not place unrelated benchmark multiples in one undifferentiated score wall.
- Label uncertainty plainly: “分批推送”, “以车辆实际收到为准”, or “官方尚未确认”.
- Never imply that a conversational model can control the vehicle unless the source explicitly confirms that capability for the released version.
- Keep source names and URLs in a task-local `SOURCES.md`; visible citations can be compact source labels in the footer.
- The post copy may add context and interpretation, but it must not introduce unsourced capabilities that do not appear in the fact ledger.
- External market, competitor, valuation, or strategy context is optional. Include it only when it changes the reader's interpretation or decision, has a traceable source, and is visibly separated from the topic's confirmed facts. Otherwise omit it.
- End the post with a useful takeaway or a specific discussion question; avoid generic engagement bait.
- Keep visible card copy, `POST_COPY.md`, alt text, and disclosure notes in the selected output language. Preserve official product names and source titles where translation would reduce accuracy.
- Do not describe one unchanged export as optimized for every platform. Reflow X and LinkedIn editions to 4:5 and apply their platform-specific card-count and copy rules.

## Visual rules

- Use one dominant accent family per page from the selected carousel-wide palette. Neutral pages may use the paired off-white with one accent.
- Typography is the image. Large type is medium or regular weight; never use a heavy display face to simulate impact.
- Rounded geometry is structural: outer panels, circular matrix cells, and compact pills. Avoid generic nested SaaS cards.
- No gradients, drop shadows, fake 3D, glassmorphism, decorative stock illustrations, emoji, or random blobs.
- Let page grammar follow the information relationship. Repetition may create rhythm, but repeating the same title-plus-four-box layout without a content reason is a failure.
- Treat a large number as information, never as filler. Pair it visibly with its unit or counted object and a consequence, comparison, time frame, stage label, or list that resolves the count.
- Preserve at least 60 px outer safe margin and 24 px gaps. Keep body text at least 30 px at 1080-pixel width.
- Treat vertical rhythm as an optical relationship, not a numeric style preset. Use the ranges in `visual-system.md` as starting points, then judge the rendered lines at thumbnail and full size. Tight leading is acceptable when glyphs remain distinct; more spacing is not automatically better.
- Separate recognition → event, value → object/unit, and object/unit → context through a deliberate combination of size, line-height, position, color, and gap. Do not force every relationship into the same vertical stack.
- Size modules from their information first. A panel should normally contract around its content; stretch it only when height itself communicates scale, duration, sequence, comparison, image presence, or deliberate editorial whitespace. A tall module with all meaningful content clustered at the top is a failed composition and blocks rendering unless a specific density exemption explains what the unused area communicates.
- Keep secondary labels inside circles and compact modules at least 26 px, pills at least 28 px, and substantive body copy at least 30 px. A large module must earn its area with readable content; as a practical floor, its visible text/image marks should occupy roughly one fifth of its height unless an intentional image-, quote-, or whitespace-led composition is documented.
- Logos and portraits are recognition evidence, not decoration. Keep them subordinate to the editorial headline, preserve their aspect ratio, and never redraw, recolor, or synthesize an official logo.
- Do not generate a fake photo of a real person or a fabricated interview scene. Use a user-supplied image, the original interview/event image, an official press image, or a clearly licensed photograph.

## Deliverables

Return:

- Editable `index.html`.
- Ordered PNG files named `01-...png`, `02-...png`, and so on.
- One contact sheet for quick review.
- `POST_COPY.md` containing the recommended title, alternatives, post body, hashtags, and disclosure/caveat when needed.
- `STORY_PLAN.md` containing the evidence model, thesis, page questions, answers, and information gain.
- `ART_DIRECTION.md` containing three cover concepts, the selected direction, asset decision, and carousel rhythm.
- `SOURCES.md` for current or evidence-based topics.
- For LinkedIn document-carousel delivery, one PDF built with `scripts/pngs_to_pdf.py`; keep the PNG source pages too.
- A concise note stating dimensions, verification performed, and any unresolved availability caveat.
- `TEST_REPORT.md` containing the contract audit result, visual-review result, corrections made, and any unresolved warning. A package that only produced PNGs but did not pass the audit is not complete.
