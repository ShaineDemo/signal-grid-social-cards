# Cover recognition assets

Use one relevant recognition asset when it makes the cover faster to understand.

## Asset routing

- Company or partnership news: official company/product logo, preferably from the official website or press kit.
- Product launch or update: official product render, interface screenshot, or application icon.
- Interview or person-led story: user-supplied portrait, the original interview/event photograph, an official speaker portrait, or a clearly licensed editorial photo.
- Data or policy story: the primary document, chart, interface, or institutional mark can be stronger than a generic photograph.

Do not force an image when the asset is low quality, legally unclear, or adds no recognition value.

## Logo selection for compact tiles

- Prefer an officially published standalone symbol, app icon, or product icon when the logo sits in a compact square or vertical tile. If the headline already names the brand, the icon-only mark is usually the stronger recognition asset.
- Inspect the actual SVG or pixels before use. A filename, page title, or successful network load does not prove that the asset is suitable.
- Match the asset's semantic scope to the story. A company story needs the company mark; a product story needs the product or parent-brand mark. Reject marks that add an unrelated suffix or neighboring brand such as `Docs`, `Blog`, `Labs`, `Community`, or a campaign name.
- Reject a horizontal wordmark when fitting it into the assigned tile makes it too small to recognize at 360 px cover width. Use an official standalone icon, enlarge/recompose the asset module, or return to a text-led cover.
- Do not crop a symbol out of a wordmark. Source the official standalone asset instead; if none exists, use the full mark at a legible size or omit it.

## Provenance and rights

- Prefer official websites and official press kits; record the exact asset URL in `SOURCES.md`.
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
```
