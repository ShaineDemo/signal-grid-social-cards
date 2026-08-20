# Language system

## Selection

- Xiaohongshu/RedNote is the primary platform. Default to Simplified Chinese when the user does not specify a language.
- When the user explicitly requests English, produce all visible card copy, `POST_COPY.md`, alt text, caveats, and editorial labels in English.
- When the request is clearly bilingual, either produce two complete language editions or use one primary language with only essential translated labels. Do not mix languages line by line unless the user asks for that treatment.
- Keep official product names, company names, model names, quotations, and source titles in their authoritative form when translation could change meaning.

## English writing

- Write idiomatic editorial English. Rebuild the sentence around its strongest fact instead of translating Chinese syntax.
- Cover headlines: normally 4–10 words and no more than three lines.
- Content-page headlines: normally 4–12 words.
- Supporting fragments: normally 6–18 words each; use complete sentences only when the nuance requires them.
- Prefer active verbs and concrete nouns. Avoid stacked abstractions, unexplained acronyms, breathless launch language, and title case on every line.
- Use sentence case by default. Preserve official capitalization such as OpenAI, Robotaxi, or Sora.

## English layout

- Set the document to `<html lang="en">` for an English edition.
- Use the existing Latin-first font stack. Do not condense, stretch, or reduce tracking just to force a translation into a Chinese-sized box.
- Recompose the layout when English expands: shorten copy, widen the text block, or switch page grammar before reducing type below the system minimum.
- Avoid single-word orphan lines. Keep short prepositions and articles attached to the phrase they introduce when practical.
- Check logos and product names for collisions caused by longer English labels.

## Chinese writing

- Use Simplified Chinese unless the user asks for another Chinese variant.
- Prefer conversational, information-dense phrasing suitable for Xiaohongshu. Avoid press-release syntax and unnecessary English insertions.
- Keep the existing 22-character cover target and move necessary nuance to supporting copy or the final boundary card.

## Bilingual delivery

If the user requests separate Chinese and English editions, keep the facts and page sequence aligned but allow each edition to reflow independently. Name outputs clearly, for example `zh-CN/` and `en/`, and create a language-specific `POST_COPY.md` inside each directory.
