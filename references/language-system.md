# Language system

## Selection and declarations

- Choose language independently of platform, palette, and tone. Default to Simplified Chinese (`zh-CN`) when unspecified; selecting dark tone does not imply English, and selecting English does not imply dark tone or a different palette.
- When the user requests English, produce a complete English edition: card titles and body, section and source labels, `POST_COPY.md`, hashtags, alt text, caveats, and contextual-image disclosures. English source names and official product names can remain unchanged in Chinese editions.
- Every new document declares `<html lang="zh-CN">` or `<html lang="en">` and the identical `body[data-language]` value. Declare the selected `body[data-palette]` and `body[data-tone]` separately; see [portable-contract.md](portable-contract.md). Both languages work with light/dark tone in all three palettes.
- A clearly bilingual request normally receives two complete editions. If the user explicitly wants one mixed-language layout, choose its primary document language and mark retained secondary-language fragments with `lang`; do not alternate languages line by line by default.
- Keep official company/product/model names, quotations, and source titles in their authoritative form when translation could change meaning. In an English edition, mark retained Chinese text with `lang="zh-CN"`, for example `<span lang="zh-CN">小马智行</span>`; do not use that exception to leave ordinary copy untranslated.

## English writing

- Write idiomatic editorial English. Rebuild the sentence around its strongest fact instead of translating Chinese syntax; titles, explanations, labels, and the post package should sound as if they were written in English first.
- Cover headlines: normally 4–10 words and no more than three lines.
- Content-page headlines: normally 4–12 words.
- Supporting fragments: normally 6–18 words each; use complete sentences when nuance requires them.
- Prefer active verbs and concrete nouns. Avoid stacked abstractions, unexplained acronyms, breathless launch language, and title case on every line.
- Use sentence case by default. Preserve official capitalization such as OpenAI, Robotaxi, or Sora.
- Translate claim status and boundaries as carefully as headlines: “reported”, “company target”, “editorial interpretation”, and “not yet confirmed” are distinct. Never turn a plan or target into an achieved result through compression.

## Facts and locale

- Changing language changes expression, not the fact ledger. Retain every number, sign, range, date, unit, currency, market, SKU, price type, and comparison/test basis unless the user separately requests and the sources support a conversion or new market edition.
- English does not imply a US audience or USD. For a China-market price, `CNY 6,999` or `¥6,999 (China)` is clearer than an ambiguous dollar sign; label the original market visibly and keep it consistent across comparisons.
- Expand Chinese large-number units accurately: `197.5 万` becomes `1.975 million`, not `197.5 million`. Abbreviations are allowed only when they preserve precision needed for the claim.
- Use unambiguous English dates such as `30 June 2026`. Do not silently change time zones or reporting periods.
- Keep stable source IDs and fact IDs between language editions. Authoritative source titles and quotations may remain in their original language; translate surrounding explanation and disclosure.

## English layout

- Use the existing Latin-first font stack. Do not condense, stretch, or reduce tracking to force English into a Chinese-sized box.
- Recompose when English expands: shorten copy, widen the text block, or switch page grammar before reducing type below the system minimum.
- Avoid single-word orphan lines. Keep short prepositions and articles attached to their phrase when practical.
- Check labels, number/unit pairs, comparison headings, footers, logos, and product names for collisions caused by longer English text.
- Tone does not relax typography or safe margins. Inspect the English edition at contact-sheet and full size in its selected tone.

## Chinese writing

- Use Simplified Chinese unless the user asks for another Chinese variant.
- Prefer conversational, information-dense phrasing suitable for Xiaohongshu. Avoid press-release syntax and unnecessary English insertions.
- Keep the existing 22-character cover target and move necessary nuance to supporting copy or the final boundary card.

## Multiple editions

Keep facts and page sequence aligned across requested Chinese/English or light/dark editions, but allow each language to reflow independently. Name task output folders clearly, for example `zh-CN-light/`, `en-light/`, `zh-CN-dark/`, and `en-dark/`. Each delivered edition has its own HTML, ordered PNGs, contact sheet, `POST_COPY.md`, and test results; a shared source ledger is acceptable if its location is explicit and traceable.

A request for English dark cards does not require all 12 combinations. Produce only the requested editions; language × tone × palette support defines the available choices, not a mandatory output count.
