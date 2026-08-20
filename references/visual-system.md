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

## Layout grammar

Choose one dominant grammar per page:

1. **Type field** — one giant word or number plus a small context line.
2. **Circle matrix** — 2×2 equal circles for four capabilities, conditions, or steps.
3. **Split field** — a large colored block opposed by a pale information block.
4. **Pill stack** — three or four horizontal bars showing routing, order, or availability.
5. **Count stack** — one giant version/date/quantity with a short consequence beneath.
6. **Contrast pair** — blue and orange halves for “before/after”, “can/cannot”, or “signal/noise”.
7. **Closing statement** — a short thesis with one compact evidence strip.

Do not place more than two dominant grammars on one page.

## Type scale at 1080×1440

- Micro metadata: 24–28 px, 500.
- Supporting copy: 30–40 px, 400–500.
- Section heading: 64–84 px, 400–500.
- Display statement: 112–168 px, 300–500.
- Giant numeral/Latin word: 180–260 px, 300–400.

Large display text must have breathing space. Shorten copy before shrinking below the minimum.

## Page rhythm

Across a six-card set, alternate energy:

- P1 high contrast / giant hook.
- P2 pale ground / factual structure.
- P3 saturated matrix / capability rhythm.
- P4 pale ground / access conditions.
- P5 split contrast / interpretation.
- P6 saturated or warm white / closing thesis.

This is a rhythm guide, not a mandatory color sequence. In alternate palettes, “blue” means the palette's primary family and “orange” means its secondary family.
