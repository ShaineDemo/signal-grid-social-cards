# Signal Grid visual system

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

## Tokens

### Signal Blue / Alert Orange — default

```css
--ink: #171717;
--paper: #f2f4fb;
--white: #fbfaf6;
--blue: #315eea;
--blue-mid: #5378ee;
--blue-soft: #96aceb;
--orange: #f24b24;
--orange-mid: #f76743;
--orange-soft: #f3a18a;
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

Use exactly two title-size levels on the cover when the hook contains both a recognizable subject and a newsworthy change:

1. **Emphasis level** — the strongest click-and-recognition anchor.
2. **Support level** — the phrase that completes the event, change, consequence, or tension.

Choose the emphasis by likely cover-scanning behavior, not only sentence grammar. For news about a well-known company, person, product, or model, that proper name is usually the stronger click anchor and should be the larger level; the event wording then explains why it matters. If the subject is unfamiliar and the change itself is more compelling, enlarge the change instead. The emphasis level should normally be about 1.5–1.9× the support level at the same canvas width. Keep both levels in the same title module and use weight consistently; create hierarchy with scale, not random bolding or extra colors. Do not split the title into three or more competing sizes.

## Cover support modules

Every non-title module on the cover must add a content reason to keep reading. Use it to preview one of these:

- two or three concrete capabilities or use cases;
- one sourced comparison, consequence, or decision-changing limit;
- one concise “why it matters” statement;
- an authentic recognition asset that makes the subject immediately identifiable.

Do not spend prime cover space on generic taxonomy such as “multimodal experiment”, implementation strings such as model IDs, routine access metadata, or version labels unless that exact detail is the story's main hook. Move API routes, model names, compatibility, rollout caveats, and other technical metadata to the access or boundary page. Auxiliary cover modules must not merely repeat the headline; together they should answer “what can it do?” or “why should I care?”.

## Layout grammar

Choose one dominant grammar per page:

1. **Type field** — one giant word or a complete numeric unit plus a context line.
2. **Circle matrix** — 2×2 equal circles for four capabilities, conditions, or steps.
3. **Split field** — a large colored block opposed by a pale information block.
4. **Pill stack** — three or four horizontal bars showing routing, order, or availability.
5. **Count stack** — one giant version/date/quantity immediately coupled to its unit or counted object, with a short consequence beneath.
6. **Contrast pair** — blue and orange halves for “before/after”, “can/cannot”, or “signal/noise”.
7. **Closing statement** — a short thesis with one compact evidence strip.

Do not place more than two dominant grammars on one page.

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

## Internal density and repeated emphasis

Empty space is intentional only when it strengthens hierarchy. It is not permission to place one small label at the edge of a large colored module.

- In a large rounded panel, visible text and graphic marks should normally occupy at least roughly one fifth of the panel's height. If they do not, shorten the panel, enlarge the meaningful content, add sourced detail, or choose a different grammar. Do not count the empty distance between one label at the top and one at the bottom as content.
- Do not stretch a two-line fact into a full-height split column. Use a comparison table, compact metric, annotated bar, or calculation instead.
- Supporting labels inside circles and mini modules should be at least 26 px; pills at least 28 px; substantive body copy at least 30 px.
- When the same number appears on multiple pages, change the visual operation as well as the wording: current value → delta → calculation → boundary. Repeating a giant percentage in a closing card is not a conclusion.
- A closing statement should synthesize an implication or action, not restate the largest number from the evidence pages.

## Page rhythm

Across a six-card set, alternate energy:

- P1 high contrast / giant hook.
- P2 pale ground / factual structure.
- P3 saturated matrix / capability rhythm.
- P4 pale ground / access conditions.
- P5 split contrast / interpretation.
- P6 saturated or warm white / closing thesis.

This is a rhythm guide, not a mandatory color sequence. In alternate palettes, “blue” means the palette's primary family and “orange” means its secondary family.
