# Portable output contract

Use this contract in every generated card set. It turns the most important editorial and visual rules into machine-checkable HTML metadata so different agent hosts cannot silently treat them as optional suggestions.

## Required document metadata

```html
<body
  data-platform="xiaohongshu"
  data-topic-subject="Claude Code"
  data-cover-asset="required">
```

- `data-topic-subject` is the exact company, person, product, or model that should drive cover recognition.
- `data-cover-asset` is `required` for company-, product-, model-, or person-led news when an authentic official/editorial asset is available. Use `none` only for a deliberately text-led cover, and explain the missing or unnecessary asset in `SOURCES.md`.
- Do not use `optional`; make the editorial decision before layout.

## Required cover roles

```html
<h1 class="cover-title">
  <span data-role="recognition-anchor">Claude Code</span>
  <span data-role="support-title">手机可发起本地会话</span>
</h1>
```

- Exactly one recognition anchor and one support title are required.
- The recognition anchor must contain `data-topic-subject` and normally renders at 1.35–2.1× the support size.
- At 1080 px width, the recognition anchor must be at least 96 px and the support title at least 48 px.
- Put both roles in the same title module. A small metadata label does not count as the recognition anchor.

## Recognition assets

```html
<img
  data-role="brand-asset"
  data-asset-kind="icon"
  data-subject="Claude Code"
  data-source-url="https://official.example/icon.svg"
  src="https://official.example/icon.svg"
  alt="Claude Code official icon" />
```

- Allowed kinds: `icon`, `symbol`, `app-icon`, `wordmark`, `product-image`, and `portrait`.
- A compact icon/symbol/app-icon must render at least 96×96 px on the 1080 px canvas. A compact wordmark must remain at least 72 px high.
- `data-subject` must match `data-topic-subject`. Do not substitute a generic terminal, document, chat, robot, or AI icon for a missing brand asset.
- If the correct asset cannot be sourced, use `data-cover-asset="none"` and a text-led composition. Never quietly replace it with an adjacent mark such as Docs, Blog, Labs, or Community.
- Every cover image must declare either `data-role="brand-asset"` or `data-role="evidence-asset"` with source metadata.

## Content previews

Auxiliary cover modules that preview a capability, consequence, limit, use case, or why-it-matters statement use:

```html
<div data-role="content-preview" data-evidence="capability">...</div>
```

Allowed evidence types are `capability`, `consequence`, `limit`, `use-case`, and `why-it-matters`. Do not use a preview module only for category labels, model IDs, commands, dates, or decorative acronyms.

## Page grammar

Every `.poster` declares one dominant grammar:

```html
<section class="poster" data-page-grammar="split-field">...</section>
```

Allowed values: `cover-grid`, `type-field`, `circle-matrix`, `split-field`, `pill-stack`, `count-stack`, `contrast-pair`, `evidence-grid`, and `closing-statement`. A set of five or more cards must use at least four distinct grammars, and no grammar may appear more than twice.

## Numeric units

For an oversized number, mark the complete information unit:

```html
<div class="metric" data-role="metric">
  <span class="metric-value" data-role="metric-value">32</span>
  <span class="metric-unit" data-role="metric-object">个会话</span>
  <p class="metric-caption" data-role="metric-context">默认并发容量，不代表每台电脑都适合跑满。</p>
</div>
```

Any standalone numeric leaf at 112 px or larger must be a metric value or a labeled sequence. The counted object and useful context must be in the same module.

## Good and bad cover decisions

Good:

- `Claude Code` is the largest recognition anchor; `手机可发起本地会话` explains the news.
- The official standalone Spark icon identifies Claude Code, while capability previews explain mobile start, local execution, and multiple sessions.
- If the official icon cannot be verified, the cover becomes text-led and `SOURCES.md` explains the omission.

Bad:

- `Claude Code` is reduced to a small date or source label while `手机变成遥控器` becomes the only large headline.
- A generic terminal glyph is presented as the Claude Code logo.
- A wide `Claude Code Docs` wordmark is squeezed into a compact tile for a story that is not about Docs.
- `32`, `3`, `QR`, and `TLS` become a parameter wall before the user-facing change is clear.

## Mandatory gate

Run `node scripts/audit.cjs <index.html>` before rendering. `scripts/render.cjs` runs the same audit automatically. Any audit error blocks delivery. Warnings require full-size visual review and a note in `TEST_REPORT.md`; do not claim a clean pass merely because PNG files were produced.

`--skip-contract` exists only for the repository's non-editorial palette preview. Never use it for generated deliverables.
