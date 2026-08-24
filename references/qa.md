# Delivery QA

## Facts

- Every version, date, hardware condition, price, subscription, and rollout claim has a source.
- Official statements and reporter-confirmed details are not presented as equivalent when they differ.
- Inference is visibly phrased as interpretation.
- No capability is inferred merely from the model vendor's general marketing page.

## Copy

- Cover reads at 360 px width.
- Cover titles use exactly two semantic size levels; the larger phrase is the strongest click-and-recognition anchor. For a well-known company, person, product, or model, verify that its name was considered before automatically enlarging the change sentence.
- Every auxiliary cover module previews a concrete capability, sourced consequence, useful limit, or recognition asset; it does not merely label the category or repeat the title.
- Model IDs, API routes, versions, and routine availability metadata stay off the cover unless that exact detail is the central news hook.
- Each page has one dominant takeaway.
- Each page answers a unique declared reader question; no page exists only to restate a previous metric with a new color.
- No title exceeds three lines.
- No accidental orphan character on a line.
- Product names and version strings are exact.
- The language is consistent across cards, alt text, and `POST_COPY.md`; English reads naturally and is not a literal Chinese calque.
- `POST_COPY.md` includes one recommended title, distinct alternatives, publish-ready body copy, hashtags, and any required availability caveat.
- The post copy and cards use the same fact ledger and do not contradict each other.

## Layout

- Every Xiaohongshu poster is exactly 1080×1440; every X or LinkedIn poster is exactly 1080×1350.
- No visible element crosses the 64 px safe margin unless it is a deliberate full-bleed field.
- No overflow or clipping.
- Body copy is at least 30 px.
- Circle and mini-module labels are at least 26 px; pill text is at least 28 px.
- English headlines do not create single-word orphan lines or exceed the copy limits in `language-system.md`.
- At least four distinct page grammars appear in a six-card set.
- Circular cells contain short labels only; long paragraphs never go inside circles.
- Every numeral set larger than section-heading size is understandable inside its own module: value + object/unit + context.
- Large rounded modules do not leave most of their interior empty around a tiny fact; any intentional exemption has a documented reason.

## Style

- One dominant accent family per page.
- Flat fills only: no gradients, shadows, glass effects, or fake depth.
- Display type uses regular/medium weight.
- Rounded geometry is structural, not scattered decoration.
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
- Identity assets come from official, primary-source, verified third-party, or user-provided origins. A verified third-party identity asset has an official verification URL.
- Evidence assets come from official, primary-source, licensed editorial, or user-provided origins. Contextual or generated imagery is visibly disclosed and never presented as evidence of a real event or person.
- External competitive or market context is decision-relevant, sourced, and labeled as reported context or inference; otherwise it is omitted.

## Final inspection

Open the contact sheet, then inspect the cover and densest page at full size. Check line breaks, contrast, hierarchy, bottom balance, logo/portrait integrity, and whether the recognition asset genuinely helps. Re-render after any edit. Read `POST_COPY.md` once as a user and once against the source ledger.

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

If the test exposes a material weakness, fix the skill and regenerate the test before delivery. If a limitation cannot be fixed safely in scope, mark the test failed and report it explicitly.
