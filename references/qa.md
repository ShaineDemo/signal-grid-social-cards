# Delivery QA

## Facts

- Every version, date, hardware condition, price, subscription, and rollout claim has a source.
- Official statements and reporter-confirmed details are not presented as equivalent when they differ.
- Inference is visibly phrased as interpretation.
- No capability is inferred merely from the model vendor's general marketing page.

## Copy

- Cover reads at 360 px width.
- Cover titles use exactly two semantic roles; the role declared by `data-title-emphasis` leads through the scale or composition mode recorded in the HTML and `ART_DIRECTION.md`. The roles may share one title block or form a coordinated headline-and-brand system.
- Every auxiliary cover module previews a concrete capability, sourced consequence, useful limit, or recognition asset; it does not merely label the category or repeat the title.
- The cover has one dominant proof relationship rather than several independent explanations competing with the headline.
- The cover declares an exact next question that page 2 answers with genuinely withheld information.
- Every semantic cover evidence module has `data-fact-ids`; the same fact ID is not repeated across separate cover modules.
- A complete table, category list, condition matrix, or implementation breakdown stays off the cover unless that complete structure is itself the news hook.
- Model IDs, API routes, versions, and routine availability metadata stay off the cover unless that exact detail is the central news hook.
- Each page has one dominant takeaway.
- `STORY_PLAN.md` shows the question, answer, evidence status, new information, and visual relationship for every page.
- `ART_DIRECTION.md` contains three genuinely different cover concepts and gives an evidence-based reason for the selected one.
- Each page answers a unique declared reader question; no page exists only to restate a previous metric with a new color.
- No title exceeds three lines.
- No accidental orphan character on a line.
- Product names and version strings are exact.
- Every product comparison names each SKU and one shared comparison basis. Price comparisons use one explicit, consistent price type; starting, configured, education, and promotional prices are never mixed in a single relationship.
- Every performance multiplier names the test subject, baseline, metric, and workload/configuration context. Multiples from unlike workloads are not presented as one comparable ranking.
- `body[data-language]` and `<html lang>` agree. The selected language is consistent across card titles/body, section and source labels, hashtags, alt text, disclosures, and `POST_COPY.md`; English reads naturally and is not a literal Chinese calque. Any retained Chinese official name or quotation in an English edition has `lang="zh-CN"` and a clear editorial reason.
- Language editions preserve numbers, currencies, units, market, reporting period, SKUs, price types, and comparison/test bases. English copy does not silently switch China prices to US pricing or USD; Chinese large-number units are expanded accurately.
- English rollout, reported facts, targets, and interpretation labels preserve the same certainty as the source and Chinese edition.
- `POST_COPY.md` includes one recommended title, distinct alternatives, publish-ready body copy, hashtags, and any required availability caveat.
- The post copy and cards use the same fact ledger and do not contradict each other.

## Layout

- Every Xiaohongshu poster is exactly 1080×1440; every X or LinkedIn poster is exactly 1080×1350.
- `body[data-card-count]` matches the number of `.poster` elements. Every poster has one unique `data-page-index`, one unique filename, exactly one page header, one page number, one page footer, and one source footer; no page number repeats across the set.
- No visible element crosses the 64 px safe margin unless it is a deliberate full-bleed field.
- No overflow or clipping.
- Body copy is at least 30 px.
- Circle and mini-module labels are at least 26 px; pill text is at least 28 px.
- English headlines do not create single-word orphan lines or exceed the copy limits in `language-system.md`.
- Page grammars express the information relationships named in `STORY_PLAN.md`; repetition creates intentional rhythm rather than template sameness.
- Circular cells contain short labels only; long paragraphs never go inside circles.
- Every numeral set larger than section-heading size is understandable inside its own module: value + object/unit + context.
- Large rounded modules do not leave most of their interior empty around a tiny fact; this is a blocking audit error. Any intentional exemption has a concrete `data-density-reason` explaining what the space communicates.
- Text and modules do not collide, merge into an accidental block, or cluster in one region while leaving the rest of the page unintentionally inert.
- Wrapped text is optically separable at thumbnail and full size; no glyph collision, accidental merged line, or ambiguous grouping remains. Suggested line-height ranges are calibration aids, not automatic pass/fail gates.
- Recognition/support titles and value/object/context groups are visually distinct through an intentional combination of scale, leading, position, color, and spacing. Flex/grid stacks are optional rather than mandatory.
- Information-only modules normally fit their content. A tall module has a visible reason—scale, duration, sequence, comparison, image, quote, meaningful endpoints, or documented editorial whitespace—and does not leave an inert lower half beneath top-clustered text.

## Style

- For Signal Blue / Alert Orange, inspect every solid and mid-tone blue/orange module at feed size: all foreground text is white/off-white and at least 4.5:1. In light mode, only genuinely pale or neutral nested fields use dark text. Check labels, separators with opacity, and inherited overrides; a numerically passing dark foreground on a saturated field still fails this palette rule.

- Every new output declares one supported `data-palette` and `data-tone`; language, palette, and tone match `ART_DIRECTION.md`. Missing mode attributes in a legacy output are recorded as compatibility warnings, not used as a shortcut for new generation.
- One dominant accent family per page. A dark edition retains the chosen Signal Blue / Alert Orange, Violet / Moss, or Petrol / Raspberry lineage; it does not introduce an unrelated fourth palette.
- Review every rendered page’s foreground/background pairs in the chosen tone: body text, muted labels, footer/source text, rules, accent panels, nested modules, and light plates inside dark pages. The semantic text color must follow the actual surface, not a page-wide inherited assumption. Complex image backgrounds and transparent/overlapping regions require manual inspection even when the automatic audit passes.
- No page-wide inversion/brightness filter is used to make a dark edition. Logos and photographs retain their original appearance; use a suitable authentic asset or contrasting plate where needed.
- One dominant visual idea is legible on each page at contact-sheet size.
- Flat fills only: no gradients, shadows, glass effects, or fake depth.
- Display type uses regular/medium weight.
- Rounded geometry is structural, not scattered decoration.
- Abstract bars, stripes, and shapes express a readable relationship or carry a label; none looks like clipping, leftover CSS, or an unexplained divider through a text module.
- No oversized number merely repeats the title, ranking, or page count, and no number is used only to occupy empty space.
- A repeated dominant metric has a new declared purpose—comparison, calculation, boundary, or sequence—and visibly adds information.
- Sequence numbers such as `01`–`05` sit directly beside the stage or item they identify.
- No copied logos or trademarks used as decoration; brand names appear as text only when editorially needed.
- Every logo or portrait has a recorded source, preserved aspect ratio, and enough clear space.
- No logo is synthesized, redrawn, recolored, stretched, or used to imply endorsement.
- Every compact logo tile uses a mark that remains recognizable at 360 px cover width; a wide wordmark is rejected when fitting it makes the brand unreadably small.
- The mark identifies the exact company or product in the story and contains no irrelevant sub-brand suffix such as `Docs`, `Blog`, `Labs`, or `Community`.
- Logo QA includes inspecting the visible asset itself; successful loading, natural dimensions, or a plausible filename are not sufficient evidence.
- No real-person portrait or interview scene is fabricated with image generation.
- Every visual asset declares its editorial role, origin, source page, direct source or user-provided status, rights note, and visual-inspection status.
- When two cover assets are used, they perform different jobs such as identity + evidence/context; they do not repeat the same recognition signal.
- `ART_DIRECTION.md` records cover asset availability, decision, and reason using the portable contract's exact fields. If usable subject material exists but the cover is text-led, the reason explains the editorial advantage rather than treating image use as mandatory or decorative.
- Identity assets come from official, primary-source, verified third-party, or user-provided origins. A verified third-party identity asset has an official verification URL.
- Evidence assets come from official, primary-source, licensed editorial, or user-provided origins. Contextual or generated imagery is visibly disclosed and never presented as evidence of a real event or person.
- External competitive or market context is decision-relevant, sourced, and labeled as reported context or inference; otherwise it is omitted.

## Final inspection

Review in two passes. First inspect the contact sheet at approximately 360 px card width: name what is seen first, whether subject and change are understandable within two seconds, whether the cover passes the one-sentence, deletion, handoff, and feed-size evidence tests, whether adjacent title lines remain visually separate, whether value/object/context groups can be scanned independently, whether any tall column looks empty or template-driven, and whether the pages feel related without repeating one safe composition. Then inspect the cover and densest page at full size: check line breaks, glyph collisions, grouping, contrast, hierarchy, spatial balance, logo/portrait integrity, module density, and the visible reason for every tall module. Record first-pass findings and corrections in `TEST_REPORT.md`, then re-render after any material edit. Read `POST_COPY.md` once as a user and once against the source ledger.

Record language, palette, and tone, then report `contract audit`, `fact audit`, `cover visual audit`, `full-set visual audit`, and `overall` as separate statuses. Include language consistency and tone/contrast findings, with any legacy-metadata warning, under those results. A clean technical audit cannot override a failed cover. If the cover is a dense detail page, duplicates facts, cannot be read at feed size, or gives page 2 nothing meaningful to reveal, set the overall result to `FAIL` until it is corrected.

For X, verify no post contains more than four images and ordinary post copy stays within 280 characters. For LinkedIn, verify 4:5 output and open the generated PDF when document-carousel delivery was requested.

## Regression test after skill changes

After changing this skill's instructions, references, templates, or rendering scripts, run one end-to-end test that exercises the changed behavior. Prefer a topic different from the example that motivated the change; when fixing a concrete failed output, first rerun that failing case as a targeted regression. Do not treat the optimization as complete after validating syntax alone.

The regression test must:

1. generate a complete card set, post copy, source ledger, and contact sheet in a separate task folder;
2. exercise the changed behavior with realistic content rather than placeholder text;
3. inspect the contact sheet plus the cover and densest page at full size;
4. verify canvas dimensions, run a DOM overflow/clipping check, manually check inherited text colors on every light/dark state for readable contrast, and inspect every cover asset for semantic match, icon/wordmark suitability, and recognition at actual display size;
5. record pass/fail results in `TEST_REPORT.md`, including the tested rule, observable evidence, any failure found, and the correction made;
6. show the resulting test artifact and summarized test result to the user.

For changes to language or tone support, cover both languages and both tones across the three palettes in the regression scope, and state exactly which combinations received a full render and visual inspection versus metadata/contrast-only checks. When the user names existing projects, rerun those projects with their original palette and unchanged fact ledger; an English dark edition is a useful combined regression, with the existing Chinese light edition retained as a comparison. Verify defaults and legacy compatibility separately. Do not claim all 12 combinations were visually validated if only a subset was rendered.

If the test exposes a material weakness, fix the skill and regenerate the test before delivery. If a limitation cannot be fixed safely in scope, mark the test failed and report it explicitly.
