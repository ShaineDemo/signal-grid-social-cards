# BriefGrid visual system

## Design reading

The source language is a modular modernist interface rather than a conventional poster:

- Square and rectangular fields behave like app widgets.
- Oversized numbers and short verbs carry most of the meaning.
- Circular 2×2 matrices create rhythm without illustration.
- Pills and small labels act as navigation or metadata, not decoration.
- High-saturation blue and orange alternate against cool off-white and near-black.
- Corners are rounded, surfaces are flat, and depth is almost absent.
- Typography shifts dramatically in scale while remaining restrained in weight.

Translate these principles to 3:4 cards; do not reproduce the source image's exact 3×3 composition, wording, or proportions.

Read `creative-direction.md` before composing. The tokens and components below are a vocabulary, not a catalog of finished layouts.

## Canvas routing

- Xiaohongshu/RedNote: 1080×1440 (3:4), the native/default canvas.
- X and LinkedIn: 1080×1350 (4:5), rebuilt from the same page plan rather than cropped from 3:4.
- Keep the same horizontal safe area and type hierarchy at 1080-pixel width. Recover the shorter 4:5 height by tightening empty vertical zones, shortening copy, or changing page grammar—not by shrinking body text below the minimum.

## Palette routing

Choose one palette for the entire carousel. Do not mix palette families page by page. Let the subject, recognition asset, and editorial tone decide:

- **Signal Blue / Alert Orange** — default. Fast, technological, and news-forward; use when no other palette has a clearer editorial reason.
- **Violet / Moss** — research, frontier models, developer tools, and analytical subjects. Violet carries the main information field; moss marks friction, restraint, or a second state.
- **Petrol / Raspberry** — interviews, governance, safety, business strategy, and editorial explainers. Petrol carries the factual structure; raspberry carries tension or consequence.

Keep the neutral ground paired with its palette. Test the cover against the recognition asset: if the portrait or product image visually fights the accents, switch the whole set rather than recoloring the asset. Palette choice never changes claim semantics; a secondary accent is emphasis, not automatic proof of danger or failure.

## Light and dark tone

Tone is independent of language and palette. New output declares `body[data-language="en"]`, `body[data-palette="petrol-raspberry"]`, and `body[data-tone="dark"]` (choose the requested values). Use one palette and one tone for the entire edition; put parallel editions in separate folders. The original palette classes remain supported for old documents, but do not combine a legacy class with a different `data-palette`.

Use the **THEME TOKENS** block in `assets/template.html` as the executable source of truth. Copy that block with the starter; do not apply a filter to old PNGs. A dark edition keeps the original hue family in darker fills, tinted neutral surfaces, lighter text and brighter text accents. It remains flat and editorial, without glow, gradients or neon additions.

| Palette | Dark ground `--paper` | Dark surface `--surface` | Primary `--blue` | Secondary `--orange` | Text `--ink` | Text accent `--accent-text` |
| --- | --- | --- | --- | --- | --- | --- |
| Signal Blue / Alert Orange | `#111829` | `#1c2740` | `#243e8a` | `#91351f` | `#edf1ff` | `#a9beff` |
| Violet / Moss | `#181421` | `#292238` | `#4c3194` | `#405516` | `#f0ebff` | `#c7b2ff` |
| Petrol / Raspberry | `#101d1c` | `#1d302e` | `#075652` | `#82274d` | `#e6f3ee` | `#8ad2c5` |

`--blue` and `--orange` are legacy names for the palette's primary and secondary **fills**, not literal color requests. Use `--on-primary`, `--on-secondary`, `--on-mid`, and `--on-soft` for the corresponding fill text. Use `--ink` for text on `--paper` or `--surface`; `--text-muted` for secondary neutral-surface text and `--accent-text` for readable colored text. `--muted` is a decorative swatch, not a text token. Keep `--white`/`--asset-surface` as stable light surfaces for genuine source assets; do not turn every neutral panel into `--white` in a dark edition.

Inherited text color is not safe after changing a panel fill. Explicitly pair every custom surface with its matching foreground, including labels, pills, footers, charts and captions. Keep at least 4.5:1 for ordinary text and 3:1 for large text (24 CSS px or 18.66 px bold); check the actual composed background. The template uses dark text on genuinely pale fills in light mode. Signal Blue / Alert Orange solid and mid-tone fills always use white/off-white text, including secondary labels; keep every text run on those fills at least 4.5:1 even when its export font size qualifies as large. If white is too weak, darken the fill within its original hue family instead of switching to dark text. A 1080-pixel export is viewed much smaller in a feed, so the generic 3:1 large-text threshold alone is not approval. Nested neutral/soft panels reset their foreground to dark text in light mode; do not force white on all descendants of a colored page. Do not recolor, invert, or blend-mode a logo or photo; use its original pixels and a suitable asset tile when contrast requires it.

## Tokens

### Signal Blue / Alert Orange — default

```css
--ink: #171717;
--paper: #f2f4fb;
--white: #fbfaf6;
--blue: #315eea;
--blue-mid: #4969d1;
--blue-soft: #d9e2fa;
--orange: #ca3f1e;
--orange-mid: #bb4e33;
--orange-soft: #f9ddd2;
--on-primary: #fbfaf6;
--on-secondary: #fbfaf6;
--on-mid: #fbfaf6;
--on-soft: #171717;
--muted: #a7b5dc;
--radius-lg: 38px;
--radius-md: 24px;
--gap: 24px;
--safe: 64px;
```

### Violet / Moss

```css
--ink: #18151f;
--paper: #f1f0f6;
--white: #fbfaf6;
--blue: #6442d7;
--blue-mid: #795fe0;
--blue-soft: #a591df;
--orange: #587c00;
--orange-mid: #71970b;
--orange-soft: #a6be55;
--muted: #aca3d1;
```

### Petrol / Raspberry

```css
--ink: #15201f;
--paper: #edf3f0;
--white: #fbfaf6;
--blue: #006b68;
--blue-mid: #17847e;
--blue-soft: #72aaa2;
--orange: #be2f6a;
--orange-mid: #d34e82;
--orange-soft: #e394b0;
--muted: #9ab7b1;
```

The default font stack is `Helvetica Neue`, `Arial`, `PingFang SC`, `Hiragino Sans GB`, sans-serif. Large Latin numerals may use tighter tracking; Chinese display lines should not use strong negative tracking.

## Semantic cover hierarchy

Use exactly two semantic title roles on the cover when the hook contains both a recognizable subject and a newsworthy change:

1. **Emphasis level** — the strongest click-and-recognition anchor.
2. **Support level** — the phrase that completes the event, change, consequence, or tension.

Choose the emphasis by likely cover-scanning behavior, not only sentence grammar. For news about a well-known company, person, product, or model, that proper name is often the stronger click anchor. If the verified change, quote, or consequence is more compelling, let the support title lead while keeping the subject unmistakable. Declare the decision with `body[data-title-emphasis="recognition"]` or `body[data-title-emphasis="support"]`. The leading role should be clearly stronger. The two roles may share one title module or form a coordinated title-plus-brand lockup when a logo/product tile carries recognition more naturally. Do not create three competing headline roles.

## Cover support modules

Every non-title module on the cover must add a content reason to keep reading. Use it to preview one of these:

- two or three concrete capabilities or use cases;
- one sourced comparison, consequence, or decision-changing limit;
- one concise “why it matters” statement;
- an authentic recognition asset that makes the subject immediately identifiable.

Normally let these modules form one proof relationship rather than a miniature dashboard. A before→after pair, two-product contrast, or small capability cluster may contain multiple marks while still answering one question. Do not repeat the same fact through a badge, chart, track, and callout; choose the treatment that reads fastest at 360 px and defer the complete breakdown to page 2.

Do not spend prime cover space on generic taxonomy such as “multimodal experiment”, implementation strings such as model IDs, routine access metadata, or version labels unless that exact detail is the story's main hook. Move API routes, model names, compatibility, rollout caveats, full tables, and other technical metadata to the page that owns that question. Auxiliary cover modules must not merely repeat the headline; together they should answer “what can it do?” or “why should I care?” while leaving a meaningful next question to swipe into.

## Layout grammar

Choose one dominant grammar per page. The following are starter vocabularies, not a whitelist:

1. **Type field** — one giant word or a complete numeric unit plus a context line.
2. **Circle matrix** — 2×2 equal circles for four capabilities, conditions, or steps.
3. **Split field** — a large colored block opposed by a pale information block.
4. **Pill stack** — three or four horizontal bars showing routing, order, or availability.
5. **Count stack** — one giant version/date/quantity immediately coupled to its unit or counted object, with a short consequence beneath.
6. **Contrast pair** — blue and orange halves for “before/after”, “can/cannot”, or “signal/noise”.
7. **Closing statement** — a short thesis with one compact evidence strip.

Use a descriptive kebab-case grammar name when a custom relationship is clearer, such as `valuation-expansion`, `quote-interruption`, or `deployment-gates`. Do not place more than two dominant relationships on one page.

## Numeric information units

Oversized numerals are evidence, structure, or navigation—not decoration. A large number is valid only when the reader can understand it without searching another module for context.

Keep these three parts together inside one visual module:

1. **Value** — the sourced quantity, date, version, rank, or sequence number.
2. **Object or unit** — what the value counts or measures, such as “个 Skills”, “亿美元”, “周”, “辆”, or “版本”.
3. **Context** — a consequence, comparison, time frame, stage label, or compact list that explains why the value matters.

Good patterns:

- `1 次安装` + `Product Management Plugin`.
- `5 条工作流` + `研究 / 思考 / 规格 / 取舍 / 复盘`.
- `$21B 估值` + `不到一个月翻倍`.
- `01 用户研究` as a labeled sequence marker.

Avoid:

- A large `5` whose only explanation is the distant cover title “Top 5”.
- A split page containing only `1` and `5`, with descriptive labels pushed to the bottom.
- Repeating the same number on the cover and next page only to fill colored panels.
- Inventing a quantity because the composition appears empty.

If the source does not provide a meaningful quantity, replace the numeral with a short verb, a labeled workflow, a category list, or a relationship diagram. In a narrow module, five small labeled rows communicate “five workflows” better than one unsupported giant `5`.

## Type scale at 1080×1440

- Micro metadata: 24–28 px, 500.
- Supporting copy: 30–40 px, 400–500.
- Section heading: 64–84 px, 400–500.
- Display statement: 112–168 px, 300–500.
- Giant numeral/Latin word: 180–260 px, 300–400.

Large display text must have breathing space. Shorten copy before shrinking below the minimum.

## Vertical rhythm and text grouping

Readable spacing has two layers. `line-height` separates lines inside one phrase or paragraph; position, scale, color, `gap`, or margin separates different semantic groups. These controls work together, and none is a universal substitute for the others.

Useful starting ranges—not pass/fail thresholds—are roughly `0.94–1.08` for multi-line Chinese display, `1.02–1.14` for headings, `1.25–1.50` for body copy, and `1.16–1.34` for compact wrapping labels. Short Latin numerals may be tighter. Depart from these ranges when the typeface, line length, language, or composition calls for it, then verify optically at 360 px and full size.

Treat these as distinct groups even when they share one module:

1. recognition anchor → support title;
2. metric value → object or unit;
3. object or unit → explanatory context;
4. heading → supporting paragraph;
5. one evidence item → the next evidence item.

Closely related groups may sit near each other when size, weight, or color already separates them. Add more physical gap when those cues are weak or both groups wrap. Prefer explicit HTML groups over a single undifferentiated text node; use flex/grid only when it serves the relationship, not as a mandatory wrapper.

Judge spacing optically, not only mathematically. Chinese glyphs have a large visual body, so lines can appear merged even when boxes do not overlap. At the 360 px contact-sheet view, each title line and each value/object/context group should remain separately scannable.

## Internal density and repeated emphasis

Empty space is intentional only when it strengthens hierarchy. It is not permission to place one small label at the edge of a large colored module.

- Start with the natural height of the information. Let a metric, note, or comparison card contract around its meaningful groups before distributing the remaining page space.
- Stretch a module only when its height has a visible job: encoding magnitude or duration, carrying an image or quote, aligning a real comparison, placing related facts at meaningful endpoints, or creating deliberate editorial pause.
- A tall panel with all meaningful marks crowded into its upper portion and an inert lower half should be shortened or recomposed. Do not use a full-height split column merely because two metrics exist.
- Empty distance between a top label and a bottom label is not automatically evidence of a relationship. The viewer should be able to explain why those endpoints need the height.
- Supporting labels inside circles and mini modules should be at least 26 px; pills at least 28 px; substantive body copy at least 30 px.
- A text stack is not readable merely because it fits. If adjacent lines or semantic groups appear fused at thumbnail size, try line-height, width, font size, color, or grouping; do not assume larger gaps are always the best correction.
- When the same number appears on multiple pages, change the visual operation as well as the wording: current value → delta → calculation → boundary. Repeating a giant percentage in a closing card is not a conclusion.
- A closing statement should synthesize an implication or action, not restate the largest number from the evidence pages.

## Example page rhythm

For a multi-card set, alternate energy by narrative role rather than page number:

- opening: high contrast / giant hook;
- early evidence: neutral ground / factual structure;
- capability or workflow: saturated matrix, path, or grouped sequence;
- access, comparison, or conditions: neutral ground / explicit structure;
- interpretation: split contrast or editorial field;
- closing: saturated or neutral surface / synthesis and boundary. In dark mode, neutral surfaces use the dark tokens.

Repeat or omit roles as the page table requires. This is an example, not a mandatory sequence or card count. Derive the actual rhythm in `ART_DIRECTION.md`. In alternate palettes, “blue” means the palette's primary family and “orange” means its secondary family.
