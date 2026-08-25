# Creative direction and house style

Use this reference before composing the cover or choosing page layouts. It captures BriefGrid's design judgment without prescribing a fixed cover template.

## House style

BriefGrid should feel edited, not assembled. Optimize for these outcomes:

- **Information relationships before components.** Start from what changes, conflicts, connects, accumulates, or remains uncertain; choose geometry only after naming that relationship.
- **One dominant visual idea per page.** A viewer should be able to say what the page is doing in one short phrase: “price jumps,” “a pause interrupts,” “a route expands,” or “two states diverge.”
- **Recognition and news value cooperate.** The company, person, product, or model must be identifiable, but it should not overpower the actual change. Choose which title role leads instead of automatically enlarging the same role for every topic.
- **Whitespace is active.** Empty area may create anticipation, separation, or scale. It must not be the accidental remainder of content clustered in one corner.
- **Every module earns its area.** Remove a panel, circle, image, label, or statistic that only fills space or repeats another element.
- **Modules follow information, not the canvas.** Compact facts stay compact. A module grows tall only when its height makes a relationship, image, quote, or pause more legible.
- **A carousel is a system, not a template pack.** Pages share type, palette, spacing, and editorial voice while changing visual relationships only when the content changes.

These are defaults, not universal laws. User-provided references and explicit direction take priority.

## Required `ART_DIRECTION.md`

Before writing HTML, create a task-local `ART_DIRECTION.md` with:

1. **Audience and platform** — who scans this and where.
2. **One-sentence story thesis** — the strongest accurate interpretation of the sourced event.
3. **Click-and-recognition anchor** — the phrase most likely to make the right reader stop.
4. **Support title** — the phrase that completes the event, consequence, or tension.
5. **Asset decision** — use a logo, portrait, product image, evidence image, contextual image, or no image; state what editorial job it performs.
6. **Three cover concepts** — three short visual ideas derived from the story. They must differ by relationship or visual metaphor, not merely by moving the same boxes.
7. **Cover information budget** — for each concept, state the stop sentence, the single proof relationship, the next-page question, and the details deliberately deferred. Name the largest element and explain why it deserves to lead.
8. **Selected concept and reason** — choose one using recognition, relevance, thumbnail clarity, evidence support, handoff strength, and distinctiveness. Briefly state why the other two are weaker.
9. **Carousel rhythm** — describe how energy and information density change across the set without assigning a mandatory template to each page.

Concept sentences describe intent, not coordinates. Good: “A narrow valuation mark expands into a full-height capital scale.” Weak: “Blue title on the left with an orange rounded box on the right.”

## Cover decision principles

- Use exactly two semantic title roles: recognition anchor and support title. Declare which role leads with `body[data-title-emphasis]` and whether hierarchy comes from scale or composition with `body[data-title-emphasis-mode]`. They may share one title module or form a coordinated headline-and-brand system; do not force a compact brand lockup into headline scale when position, color, or asset proximity already makes its role clear.
- A known subject often leads because it improves recognition. Let the support title lead when the verified change, quote, or consequence is the more compelling and honest hook.
- Build the composition around one primary relationship. Examples include expansion, interruption, convergence, comparison, distance, sequence, containment, or threshold. These are prompts for invention, not a menu of layouts.
- Treat the cover as a promise, not a miniature summary. Recognition + change + normally one proof relationship is enough when page 2 owns the complete breakdown. A linked before→after pair, a two-product contrast, or a small capability cluster may contain multiple marks without becoming multiple relationships.
- Every cover concept must say what it intentionally withholds. If nothing meaningful is deferred to page 2, the concept is probably a detail page wearing a cover title.
- Do not repeat one fact through parallel treatments such as percentage pills plus a full old/new chart. Choose the treatment that reads fastest at feed size and move the other to the detail page.
- An abstract bar, line, stripe, or shape must communicate through a readable relationship—position, scale, sequence, containment, or a nearby label. If its meaning exists only in the designer's explanation, remove it or turn it into a complete information module. Never pierce a text card with an unlabeled color strip that can be mistaken for clipping, a CSS residue, or an alignment error.
- Use an asset only when it adds identity, evidence, or necessary context. Text-led and abstract data-led covers are valid when an image would merely decorate or misrepresent the event.
- Avoid redundant recognition: a logo, typed name, portrait, and screenshot should not all perform the same job. Two cover assets are valid when their roles differ—for example, an icon identifies the company while a product or event image supplies evidence or context.
- Keep routine metadata, implementation strings, and secondary caveats away from prime cover space unless they are the actual story.

## Taste calibration

Review the repository showcase before designing, but extract principles rather than copying geometry:

- `examples/showcase/etched-valuation.png` demonstrates how a business story can combine recognition, a valuation jump, and a clear boundary without using a lonely number as decoration.
- `examples/showcase/openai-misalignment.png` demonstrates editorial tension, quote treatment, and the separation of reported fact from interpretation.
- `examples/showcase/pony-ai-robotaxi.png` demonstrates plan-versus-deployment boundaries and a palette matched to frontier mobility.

Across all three, notice the shared judgment rather than their exact geometry: information modules usually fit their contents; tall fields either carry a visual asset, distribute meaningful endpoints, or express a real contrast; page grammars change with the reader question; and whitespace separates ideas instead of accumulating below a top-aligned fact.

Do not reproduce their exact cover structures. A new topic should have its own visual idea.

## First-render critique

After the first render, inspect the contact sheet at thumbnail size and the cover plus densest page at full size. Record answers in `TEST_REPORT.md`:

- What is seen first at 360 px width?
- Can the subject and the change be understood within two seconds?
- Is there one dominant visual idea, or several equal focal points?
- Do any title lines, modules, or images collide or merge into an accidental block?
- Can individual title lines be distinguished at a glance, and can value, unit, and explanation be read as separate semantic groups rather than one compressed block?
- Is the composition top-heavy, bottom-heavy, or unintentionally empty?
- Does every large module contain enough meaningful information for its area?
- If a module is tall, what does its height communicate? Do meaningful marks occupy or explain the lower half, or is it only leftover canvas?
- Would the page become clearer if one tall column became a compact metric, bar, table, or paired calculation?
- Can every abstract mark be interpreted from the card alone, or does any bar/stripe look like an accidental layout artifact?
- Does every image perform the declared editorial role at actual display size?
- Do the pages feel related without repeating one safe composition?
- **One-sentence test:** can the visible cover be described as one subject, one change, and one proof relationship without listing several panels?
- **Deletion test:** if the smallest or hardest-to-read 30% of cover information disappears, does understanding stay the same? If yes, delete or defer it.
- **Handoff test:** does page 2 answer the question promised by the cover with information the cover did not already give away?
- **Feed-size evidence test:** is every fact intended to influence the click readable at roughly 360 px? If not, move it rather than treating full-size legibility as sufficient.

Fix every material weakness and render again. A first pass may remain unchanged only when the report gives observable reasons it already passes each relevant check.

## Anti-patterns

- Designing from the starter template before identifying the story relationship.
- Generating six pages because the example has six pages.
- Changing colors while repeating the same information or composition.
- Adding a logo or portrait only because the topic mentions a company or person.
- Treating audit compliance as proof of visual quality.
- Turning the cover into a miniature dashboard, complete price table, or compressed table of contents.
- Repeating one cover fact in a badge, chart, track, and callout because each component looks individually useful.
- Using an unlabeled bar, stripe, or geometric remnant as a metaphor when the viewer cannot decode it from the card.
- Applying numeral-style tight leading to wrapped Chinese titles, labels, or explanatory paragraphs.
- Repairing a weak composition only by increasing line-height or gap while leaving oversized empty modules unchanged.
- Stretching compact metrics into full-height columns when the height encodes no magnitude, duration, sequence, image, quote, or endpoint relationship.
- Using `<br>` to imitate spacing between different semantic groups instead of giving the groups explicit structure and gap.
- Converting one past correction into a universal layout rule.
