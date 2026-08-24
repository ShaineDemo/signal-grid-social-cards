# Cover recognition assets

Use one relevant recognition asset when it makes the cover faster to understand.

## Route by editorial role, then source

Do not use an official-only rule. Decide first what the image is claiming:

- **Identity** — identifies the company, product, model, or person. Allowed origins: `official`, `primary-source`, `verified-third-party`, or `user-provided`.
- **Evidence** — shows the actual product, interface, document, interview, venue, or event being discussed. Allowed origins: `official`, `primary-source`, `licensed-editorial`, or `user-provided`.
- **Context** — creates relevant atmosphere or explains a concept without proving the event happened. Allowed origins: `licensed-editorial`, `contextual`, or `user-provided`; a clear disclosure is mandatory.

Typical routing:

- Company or partnership news: a trustworthy company/product identity mark; official is preferred but a verified third-party copy is acceptable when checked against an official reference.
- Product launch or update: a primary-source product render, actual interface screenshot, app icon, or licensed editorial photograph of the product.
- Interview or person-led story: the original interview/event photograph, a user-supplied portrait, an official speaker portrait, or a reputable licensed editorial photo.
- Data or policy story: the primary document, chart, interface, or institutional mark can be stronger than a generic photograph.
- Concept story without direct imagery: use a disclosed contextual image or a text-led cover. Never present contextual imagery as a photograph of the reported event.

Do not force an image when the asset is low quality, legally unclear, semantically adjacent rather than exact, or adds no recognition value.

## Logo selection for compact tiles

- Prefer an officially published standalone symbol, app icon, or product icon when the logo sits in a compact square or vertical tile. If the headline already names the brand, the icon-only mark is usually the stronger recognition asset.
- Inspect the actual SVG or pixels before use. A filename, page title, or successful network load does not prove that the asset is suitable.
- Match the asset's semantic scope to the story. A company story needs the company mark; a product story needs the product or parent-brand mark. Reject marks that add an unrelated suffix or neighboring brand such as `Docs`, `Blog`, `Labs`, `Community`, or a campaign name.
- Reject a horizontal wordmark when fitting it into the assigned tile makes it too small to recognize at 360 px cover width. Use an official standalone icon, enlarge/recompose the asset module, or return to a text-led cover.
- Do not crop a symbol out of a wordmark. Source the official standalone asset instead; if none exists, use the full mark at a legible size or omit it.

## Provenance and rights

- Prefer the closest available source: official/primary source for identity and evidence, then reputable licensed editorial sources, then verified third-party identity copies, then user-provided assets. Record every asset in `SOURCES.md`.
- A `verified-third-party` identity asset must include both its actual source and an official page used to verify the mark's appearance and semantic scope.
- A `user-provided` asset may record source page and source URL as `user-provided`, but still needs a rights note and visual inspection.
- A contextual or generated asset needs a visible disclosure such as “示意图 / 非事件现场” or “Concept image / not event evidence.”
- Read and respect stated media/press usage terms. If terms restrict cover, advertising, or commercial use, do not silently use the asset outside those terms.
- Logos and names remain the owners' trademarks. Use them editorially to identify the subject, never to imply sponsorship, partnership, or endorsement beyond the sourced story.
- Never synthesize, redraw, recolor, stretch, crop into, or decorate an official logo.
- Do not generate an image of a real person for news or interview coverage. If an authentic photo cannot be sourced safely, use a text-led cover and say why.

## Composition

- One cover normally uses one asset cluster: one logo, a two-logo relationship, one product image, or one person/photo.
- Keep the headline dominant. The asset cluster should usually occupy 20–40% of the canvas, unless the user explicitly wants an image-led cover.
- Place logos in simple solid tiles with enough clear space. Preserve transparent backgrounds and aspect ratio. Preview the asset at the actual cover size, not only at its natural dimensions.
- For a two-company story, use equal visual weight unless the story clearly centers one party; use `×`, `+`, or an arrow only when it accurately describes the relationship.
- For portraits, preserve the face and interview context; avoid decorative cutouts that change the journalistic meaning.

Do not treat a newly added asset as an insert into a text-only cover. Re-evaluate the entire cover grammar after adding a logo, portrait, or product image. If the asset creates a second focal point, recompose the grid instead of shrinking both the asset and headline.

Preferred recognition-cover grammars:

1. **Headline + brand stack** — large headline module on the left; one or two recognition modules stacked on the right; release/version strip below. Best for company partnerships and integrations.
2. **Paired brand stage** — two equal brand modules with a truthful `×`, `+`, or arrow; short headline below. Use only when the relationship itself is the story.
3. **Image-led evidence** — one authentic product/person/interview image occupying 45–65%, with a compact title module beside or below it.

After choosing a grammar, check that the asset and headline form one composition rather than two unrelated zones. Avoid a small logo card floating above a distant headline with a large empty band between them.

## Source record example

```markdown
- `assets/company-logo.png` ← https://official.example/logo.png — official site logo, editorial identification
- `assets/interview.jpg` ← https://publisher.example/interview — original interview photograph, credit: Name
- `assets/product-photo.jpg` ← user-provided — supplied by user; rights status recorded by user
- `assets/context-image.jpg` ← https://licensed.example/image — contextual illustration, not event evidence; visible disclosure added
```
