# Portable output contract

Use this contract in every generated card set. It turns the most important editorial and visual rules into machine-checkable HTML metadata so different agent hosts cannot silently treat them as optional suggestions.

## Required document metadata

```html
<body
  data-platform="xiaohongshu"
  data-topic-subject="Claude Code"
  data-cover-asset="required"
  data-title-emphasis="recognition"
  data-title-emphasis-mode="scale">
```

- `data-topic-subject` is the exact company, person, product, or model that should drive cover recognition.
- `data-cover-asset` is `required` for company-, product-, model-, or person-led news when an authentic official/editorial asset is available. Use `none` only for a deliberately text-led cover, and explain the missing or unnecessary asset in `SOURCES.md`.
- `data-title-emphasis` is `recognition` when the named subject leads or `support` when the verified change, quote, or consequence leads. The choice must match `ART_DIRECTION.md`.
- `data-title-emphasis-mode` is `scale` when size carries the hierarchy or `composition` when position, color, asset proximity, or reading order carries it. Use `composition` only when `ART_DIRECTION.md` explains the cue.
- Do not use `optional`; make the editorial decision before layout.

## Required cover roles

```html
<section
  class="poster"
  id="card-01"
  data-cover-next-question="What are the exact access conditions?">
<h1 class="cover-title">
  <span data-role="recognition-anchor">Claude Code</span>
  <span data-role="support-title">手机可发起本地会话</span>
</h1>
</section>
```

- Exactly one recognition anchor and one support title are required.
- The recognition anchor must contain `data-topic-subject`.
- In `scale` mode, the declared role is at least 96 px and normally at least 1.15× the secondary role.
- In `composition` mode, both roles remain clearly readable, the leading role is at least 72 px, and `ART_DIRECTION.md` states whether position, color, reading order, or asset proximity creates the hierarchy.
- When recognition leads, its anchor is normally at least 96 px and the support role at least 52 px. When support leads and an authentic identity asset or brand lockup is present, the recognition anchor may be compact—normally at least 28 px—provided it remains clear at 360 px cover width.
- The roles may share one title module or form a coordinated title-plus-brand lockup. A generic metadata label does not count as recognition, but a clearly visible brand name attached to the correct identity asset can.
- `data-cover-next-question` is required on the cover and names the exact question intentionally handed to page 2. It should match page 2's `data-page-question`; a different wording is a warning that the story handoff may be weak.

## Recognition assets

```html
<img
  data-role="recognition-asset"
  data-asset-role="identity"
  data-asset-origin="official"
  data-asset-kind="icon"
  data-subject="Claude Code"
  data-source-page="https://official.example/product"
  data-source-url="https://official.example/icon.svg"
  data-rights-note="Editorial identification; trademark remains its owner's."
  data-pixel-checked="true"
  src="https://official.example/icon.svg"
  alt="Claude Code official icon" />
```

- Allowed editorial roles: `identity`, `evidence`, and `context`.
- Allowed origins depend on the role:
  - `identity`: `official`, `primary-source`, `verified-third-party`, `user-provided`.
  - `evidence`: `official`, `primary-source`, `licensed-editorial`, `user-provided`.
  - `context`: `licensed-editorial`, `contextual`, `user-provided`.
- Every asset needs `data-source-page`, `data-source-url`, `data-rights-note`, and `data-pixel-checked="true"`. For user-provided assets, both source fields may be `user-provided`.
- A `verified-third-party` identity asset additionally needs `data-verification-url` pointing to an HTTPS official reference used to verify the mark.
- A context asset additionally needs `data-context-disclaimer` and a visible disclosure in the selected output language. It must not imply that a depicted person, place, product, or event is the actual reported scene.
- Allowed kinds: `icon`, `symbol`, `app-icon`, `wordmark`, `product-image`, and `portrait`.
- A compact icon/symbol/app-icon should render at least 88×88 px on the 1080 px canvas and remain recognizable in the 360 px contact-sheet view. A compact wordmark must remain at least 72 px high.
- `data-subject` must match `data-topic-subject`. Do not substitute a generic terminal, document, chat, robot, or AI icon for a missing brand asset.
- If the correct asset cannot be sourced, use `data-cover-asset="none"` and a text-led composition. Never quietly replace it with an adjacent mark such as Docs, Blog, Labs, or Community.
- Every cover image must declare `data-role="recognition-asset"` with the full source-matched metadata above. Record it again in `SOURCES.md` for human review.
- One or two cover assets are acceptable when they perform distinct editorial roles—for example, identity icon + evidence product image, or identity icon + contextual deployment photo. More than two needs an explicit reason in `ART_DIRECTION.md`. Multiple identity assets that repeat the same recognition job should be removed.
- Never create or redraw a company/product logo with image generation. If no trustworthy identity mark is available, use a text-led cover. Generated or stock imagery may be used only as disclosed context, never as identity or evidence.

## Content previews

Auxiliary cover modules that preview a capability, consequence, limit, use case, or why-it-matters statement use:

```html
<div
  data-role="content-preview"
  data-evidence="capability"
  data-fact-ids="mobile-start local-execution">...</div>
```

Allowed evidence types are `capability`, `consequence`, `limit`, `use-case`, and `why-it-matters`. Do not use a preview module only for category labels, model IDs, commands, dates, or decorative acronyms.

## Cover evidence semantics

Every non-title module that contributes a material fact to the cover must declare its semantic role and stable fact IDs. This allows the audit to detect duplicated facts even when different hosts render them as unrelated components.

Use `data-role="content-preview"` for a short capability, consequence, limit, use case, or why-it-matters preview. Use `data-role="cover-proof"` when a chart, comparison, evidence image group, path, or metric relationship makes the hook credible:

```html
<div
  data-role="cover-proof"
  data-proof-purpose="comparison"
  data-fact-ids="output-price-drop">
  <span>$30</span><span>→</span><span>$20</span>
</div>
```

Allowed proof purposes are `comparison`, `evidence`, `capability`, `consequence`, and `boundary`. Fact IDs are lowercase kebab-case tokens separated by spaces. A linked before→after pair is one proof relationship even though it contains several visible marks.

- Do not put the same fact ID on two separate cover modules. A percentage badge and an old→new chart for the same change are duplicates, not two proofs.
- A cover may contain several fact IDs when they form one readable relationship, but more than three distinct cover facts triggers a density warning and requires explicit visual justification.
- Wrap custom cover charts, tracks, tables, and numeric comparisons in a semantic cover-proof module. Numeric evidence that sits outside a title, recognized asset, proof, preview, or `data-role="cover-metadata"` fails the audit.
- Use `data-role="cover-metadata"` only for routine date, page, or source metadata that is not being presented as proof. If a date or version is the hook, mark it as cover proof instead.
- This contract does not prescribe a module count or geometry. It records editorial relationships so a text field, image-led cover, data scale, paired brands, or custom composition can all pass when their information budget is clear.

## Page grammar

Every `.poster` declares one dominant grammar:

```html
<section
  class="poster"
  data-page-grammar="split-field"
  data-page-question="What changed compared with before?"
  data-claim-status="confirmed"
  data-source-ids="official-release official-pricing">
  ...
</section>
```

Use a descriptive kebab-case value. Starter values include `cover-grid`, `type-field`, `circle-matrix`, `split-field`, `pill-stack`, `count-stack`, `contrast-pair`, `evidence-grid`, and `closing-statement`. Custom values are encouraged when they name the actual information relationship more clearly.

Grammar diversity is a review signal rather than a quota. Repetition is acceptable when it creates deliberate rhythm and each page adds information; variation is useful only when it clarifies a different relationship.

- `data-page-question` is required, must be meaningful, and must be unique across the carousel.
- `data-claim-status` is one of `confirmed`, `reported`, `inference`, or `mixed`.
- `data-source-ids` lists the IDs used in `SOURCES.md` for that page.
- An `inference` or `mixed` page needs a visible element with `data-role="claim-label"`, such as “编辑判断” or “Editorial interpretation.”

## Numeric units

For an oversized number, mark the complete information unit:

```html
<div class="metric" data-role="metric" data-metric-purpose="comparison">
  <span class="metric-value" data-role="metric-value">32</span>
  <span class="metric-unit" data-role="metric-object">个会话</span>
  <p class="metric-caption" data-role="metric-context">默认并发容量，不代表每台电脑都适合跑满。</p>
</div>
```

Any standalone numeric leaf at 112 px or larger must be a metric value or a labeled sequence. The counted object and useful context must be in the same module.

Allowed metric purposes are `current`, `comparison`, `calculation`, `boundary`, and `sequence`. The same dominant value should not lead multiple pages unless the later appearance uses a different purpose and visibly adds new information.

## Readability and internal density

- Substantive body copy is at least 30 px at 1080 px canvas width.
- Labels inside `.circle` and `.mini` modules are at least 26 px; `.pill` text is at least 28 px.
- Use the vertical-rhythm ranges in `visual-system.md` as starting points. Delivery is blocked by collisions, clipping, or unreadable grouping—not by a single universal line-height value.
- `data-role="text-stack"` is available when a vertical group benefits from explicit structure, but is not required when another composition communicates the relationship more clearly.
- A large rounded module must not contain only a small label surrounded by unused space. Its visible text/image marks should normally occupy at least roughly 18% of its height, unless `data-density-exempt="true"` and `data-density-reason` explain a deliberate image-, quote-, or whitespace-led composition.
- A module taller than its information needs should either distribute meaningful content through its height or declare `data-density-exempt="true"` with a concrete reason such as scale, duration, image, quote, endpoints, or deliberate editorial whitespace. The declaration documents intent; visual review still decides whether the composition works.

Example:

```html
<div class="text-stack" data-role="text-stack">
  <div class="metric-line">
    <span class="metric-value" data-role="metric-value">1,975</span>
    <span class="metric-unit" data-role="metric-object">辆 Robotaxi</span>
  </div>
  <p class="metric-caption" data-role="metric-context">截至 2026 年 6 月 30 日的实际车队规模。</p>
</div>
```

The value and object may share a row, but the context remains a separate group with readable leading and vertical separation. Do not flatten all three into a single tightly led text node.

## Good and bad cover decisions

Good:

- `Claude Code` leads when product recognition is the strongest hook; `手机可发起本地会话` explains the news.
- A decisive verified change may lead when `data-title-emphasis="support"`, while `Claude Code` remains unmistakable.
- The official standalone Spark icon identifies Claude Code, while capability previews explain mobile start, local execution, and multiple sessions.
- If the official icon cannot be verified, the cover becomes text-led and `SOURCES.md` explains the omission.
- `GPT-5.6 Sol` + `API 限时降价` uses one output-price comparison as proof and hands the complete three-rate table to page 2.

Bad:

- `Claude Code` is reduced to a small date or source label while `手机变成遥控器` becomes the only large headline.
- A generic terminal glyph is presented as the Claude Code logo.
- A wide `Claude Code Docs` wordmark is squeezed into a compact tile for a story that is not about Docs.
- `32`, `3`, `QR`, and `TLS` become a parameter wall before the user-facing change is clear.
- Two percentage badges repeat the same price drops already shown in a three-row comparison chart, leaving page 2 to restate the cover.

## Mandatory gate

Run `node scripts/audit.cjs <index.html>` before rendering. `scripts/render.cjs` runs the same audit automatically. Any audit error blocks delivery. Warnings require full-size visual review and a note in `TEST_REPORT.md`; do not claim a clean pass merely because PNG files were produced.

`--skip-contract` exists only for the repository's non-editorial palette preview. Never use it for generated deliverables.
