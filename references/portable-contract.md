# Portable output contract

Use this contract in every generated card set. It turns the most important editorial and visual rules into machine-checkable HTML metadata so different agent hosts cannot silently treat them as optional suggestions.

## Required document metadata

```html
<body
  data-platform="xiaohongshu"
  data-card-count="6"
  data-topic-subject="Claude Code"
  data-cover-asset="required"
  data-cover-asset-availability="available"
  data-cover-asset-reason="官方产品界面可用，封面采用产品证据图。"
  data-title-emphasis="recognition"
  data-title-emphasis-mode="scale">
```

- `data-topic-subject` is the exact company, person, product, or model that should drive cover recognition.
- `data-card-count` is the exact number of `.poster` elements in the file.
- `data-cover-asset-availability` is `available`, `unavailable`, or `not-needed` after the asset search.
- `data-cover-asset` is `required` when the selected cover uses an authentic recognition asset and `none` for a deliberately text-led cover. Availability does not force the decision: an available product image may still be declined when the chosen hook is clearer without it, but the reason must be explicit.
- `data-cover-asset-reason` records the decision in one concrete sentence. A text-led cover requires at least 12 non-space characters and a matching entry in `ART_DIRECTION.md`.
- `data-title-emphasis` is `recognition` when the named subject leads or `support` when the verified change, quote, or consequence leads. The choice must match `ART_DIRECTION.md`.
- `data-title-emphasis-mode` is `scale` when size carries the hierarchy or `composition` when position, color, asset proximity, or reading order carries it. Use `composition` only when `ART_DIRECTION.md` explains the cue.
- Do not use `optional`; make the editorial decision before layout.

The task-local `ART_DIRECTION.md` must include this exact block so the renderer can verify a text-led decision:

```text
Cover asset availability: available
Cover asset decision: none
Cover asset reason: 官方产品图可用，但封面以“如何选择”作为主钩子；产品图留给证据页可保持更清楚的阅读交接。
```

The values must match the HTML. If an asset is available but `decision` is `none`, explain the stronger editorial relationship created by the text-led cover. A generic preference such as “cleaner” is insufficient.

## Card count and one-card page shell

Every `.poster` represents exactly one logical card:

```html
<section
  class="poster"
  data-page-index="2"
  data-filename="02-price-ladder.png"
  data-page-grammar="price-ladder"
  data-page-question="Which official starting prices are comparable?"
  data-claim-status="confirmed"
  data-source-ids="apple-store">
  <div class="topline" data-role="page-header">
    <span>PRICE LADDER</span>
    <span data-role="page-number" data-page-current="2" data-page-total="6">02 / 06</span>
  </div>
  <!-- one card's content -->
  <div class="foot" data-role="page-footer">
    <span data-role="source-footer">SOURCE / APPLE STORE</span>
    <span>→</span>
  </div>
</section>
```

- `data-page-index` is a positive integer, follows DOM order, and is unique.
- `data-filename` is required and unique.
- Each poster has exactly one page header, one page number, one page footer, and one source footer. The page number sits inside the header; the source footer sits inside the footer.
- `data-page-current` matches `data-page-index`; `data-page-total` matches `body[data-card-count]`; the visible number matches those attributes.
- A poster may not contain another independent page header, counter, or source-footer system. Combining two logical cards inside one `.poster` fails the audit even if the exported PNG dimensions are correct.

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

## Product comparisons

Every product relationship declares what is being compared. A price relationship additionally declares which kind of price and keeps one common basis:

```html
<div data-role="product-comparison" data-comparison-kind="price">
  <div
    data-role="comparison-item"
    data-sku="mac-mini-m6"
    data-price-type="official-starting"
    data-comparison-basis="cn-store-current-base">
    Mac mini M6 · ¥6,999 起
  </div>
  <div
    data-role="comparison-item"
    data-sku="mac-studio-m5-max"
    data-price-type="official-starting"
    data-comparison-basis="cn-store-current-base">
    Mac Studio M5 Max · ¥19,999 起
  </div>
</div>
```

- `data-comparison-kind` is `price` or `specification`.
- Every item has a lowercase kebab-case `data-sku` and `data-comparison-basis`.
- Price items also have lowercase kebab-case `data-price-type` and a visible currency value.
- One relationship cannot mix official starting, configured, education, previous-generation, or promotional prices. It also cannot mix market, tier, or time bases. Separate such values into distinct relationships and label the difference visibly.
- A page with multiple currency values and a visible comparison cue fails if this structure is missing.

## Performance multipliers

A performance multiple is incomplete without the test relationship:

```html
<div
  data-role="performance-claim"
  data-test-subject="Mac mini with M6"
  data-test-baseline="Mac mini with M4"
  data-test-metric="ML inference throughput"
  data-test-context="Same application, model, precision, batch size, and memory class described by source apple-test-01">
  <strong>4.8×</strong>
  <span>机器学习推理吞吐提升</span>
</div>
```

- `data-test-subject`, `data-test-baseline`, `data-test-metric`, and `data-test-context` are mandatory. The subject and baseline must differ.
- `data-test-context` names enough workload, configuration, or source-test conditions to interpret the number; a label such as “官方测试” is not enough.
- A visible `×`, `x`, or “提升 N 倍” on a performance page must sit inside a `performance-claim` module.
- Multipliers from different workloads are separate claims. Never imply they are comparable rankings unless their metric and test conditions are actually aligned.

## Readability and internal density

- Substantive body copy is at least 30 px at 1080 px canvas width.
- Labels inside `.circle` and `.mini` modules are at least 26 px; `.pill` text is at least 28 px.
- Use the vertical-rhythm ranges in `visual-system.md` as starting points. Delivery is blocked by collisions, clipping, or unreadable grouping—not by a single universal line-height value.
- `data-role="text-stack"` is available when a vertical group benefits from explicit structure, but is not required when another composition communicates the relationship more clearly.
- A large rounded module must not contain only a small label surrounded by unused space. Visible text/image marks below roughly 18% vertical occupancy are a blocking audit error, not a warning, unless `data-density-exempt="true"` and a specific `data-density-reason` explain a deliberate image-, quote-, scale-, endpoint-, or whitespace-led composition.
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
- If the official icon cannot be verified, the cover becomes text-led and `ART_DIRECTION.md` records the asset availability, decision, and reason.
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
