# Story direction

Use this reference before the page plan. Its purpose is to make every carousel a concise argument rather than a sequence of formatted facts.

## Build the evidence model first

Create a compact fact ledger with four buckets:

- **Confirmed** — directly supported by a primary source.
- **Reported** — supported by a reputable secondary source.
- **Interpretation** — a useful conclusion derived from the evidence and labeled as such.
- **Unknown or dynamic** — disputed, incomplete, staged, or likely to change before publication.

Then write:

- one-sentence story thesis;
- reader tension: the misunderstanding, contrast, or unanswered question that makes the topic worth swiping;
- evidence hierarchy: the two or three facts that must survive compression;
- publication boundary: what the cards must not imply.

## Cover-to-page-2 handoff

The cover earns attention; it does not finish the explanation. Before the page table, write a cover preflight with:

- **Stop sentence** — the one sentence a reader should understand at feed size.
- **Recognition** — the subject that must be unmistakable.
- **Proof relationship** — normally one concrete relationship that makes the hook credible, such as old→new, claim→evidence, product→change, or plan→boundary. Several marks may belong to the same relationship.
- **Next question** — the exact reader question that page 2 will answer.
- **Deferred detail** — the table, taxonomy, conditions, mechanism, or secondary metrics intentionally kept off the cover.

The cover and page 2 may share the event fact, but page 2 must add the withheld answer. If the cover already contains the full table or all categories that page 2 explains, compress the cover rather than inventing another second page. Do not solve this with a fixed module count: judge the number of independent information relationships.

## Required `STORY_PLAN.md`

Before coding, create a task-local `STORY_PLAN.md` containing the evidence model above and a page table with:

| Page | Reader question | One-sentence answer | Evidence/status | New information | Visual relationship |
| --- | --- | --- | --- | --- | --- |

Every page must answer a different question and add information unavailable on earlier pages. Merge or remove a page that cannot do both.

For page 1, record the same next question declared in the cover preflight. Use that exact question in the HTML as `data-cover-next-question`; it should match page 2's `data-page-question` so the handoff remains inspectable across hosts.

## Let evidence determine page count

There is no fixed six-card or seven-card ceiling. Determine the count from the page table after the fact ledger and reader questions are clear. A compact update may need only a few cards; a research-heavy comparison, tutorial, identity reveal, or audience-specific workflow may need more.

Add a page when it protects one of these distinctions:

- two reader questions require different answers;
- confirmed fact and editorial interpretation would otherwise blur together;
- identity/event context and practical audience use would otherwise compete for the same hierarchy;
- a comparison, workflow, or boundary would become unreadable when compressed;
- a new audience decision needs evidence not available on the previous page.

Remove or merge a page when it adds no new answer. Stop when the reader has enough evidence to understand the event, consequence, practical use, and boundary. If the page table becomes too long for one comfortable reading session, propose a part-one/part-two split at a real narrative boundary, but do not delete necessary evidence merely to meet an inherited example count.

Choose a narrative lens that fits the source:

- **Event → consequence** for launches and product changes.
- **Claim → evidence → boundary** for controversial or uncertain news.
- **Number → comparison → denominator** for price, funding, valuation, and scale stories.
- **Quote → reasoning → implication** for interviews and statements.
- **Plan → current state → execution gates** for roadmaps and deployment targets.
- **Problem → workflow → decision** for practical guides and skill/tool lists.

These are reasoning lenses, not fixed page sequences.

## Content-to-visual translation

Name the relationship before selecting a component:

- change over time → scale, before/after, delta, or sequence;
- two states → contrast, parallel columns, or aligned bands;
- hierarchy → nested scale, ranked field, or typographic levels;
- route or process → path, staged bars, or connected nodes;
- uncertainty → boundary, incomplete field, threshold, or disclosed gap;
- several equal items → matrix, rows, or labeled clusters.

Use the simplest form that preserves the relationship. The starter CSS is a toolbox; custom task-scoped CSS is expected when its primitives would flatten the story into a familiar template.

## Editorial deletion test

Before layout, remove or rewrite any page that:

- restates the cover without adding evidence;
- repeats a dominant number with the same purpose;
- uses unrelated competitor or market context to manufacture importance;
- converts an unknown into a definitive conclusion;
- exists only to complete a familiar or preselected card count;
- contains more caveats than useful information because the page question is wrong.

Also compress or redesign a cover that:

- duplicates the same fact in a badge, chart, and number strip;
- contains the complete detail table that the next page is supposed to reveal;
- needs several independent sentences to describe what is visible;
- preserves information that cannot be read at feed thumbnail size;
- remains equally understandable after a secondary module is removed.

The closing page must synthesize a decision, implication, or watch point. It must not merely repeat the largest number or headline.
