# Platform system

Xiaohongshu/RedNote is the primary design target. X and LinkedIn are supported through dedicated canvas, page-count, and publish-copy presets. Never upload the 3:4 Xiaohongshu set unchanged and call it optimized for all three.

## Presets

| Platform | Canvas | Default package | Copy behavior |
| --- | --- | --- | --- |
| Xiaohongshu / RedNote | 1080×1440, 3:4 | Evidence-determined PNG set; no fixed six-card ceiling | Conversational post, 3–6 hashtags |
| X | 1080×1350, 4:5 | Up to 4 PNGs per post; split a longer story into a numbered thread | Keep each ordinary post within 280 characters including links; front-load the claim |
| LinkedIn | 1080×1350, 4:5 | 5–8 PNGs for a multi-photo post, or one PDF document carousel | Professional context, one clear implication, restrained hashtags |

Use `<body data-platform="xiaohongshu">`, `<body data-platform="x">`, or `<body data-platform="linkedin">`. The template's platform selectors and renderer enforce the expected height.

## Xiaohongshu / RedNote

- This is the native/default mode. Let the evidence model and reader questions determine the page count; example sets must not become an implicit maximum.
- Keep the first card legible as a feed cover and let later cards carry explanation and boundaries.
- Deliver the complete `POST_COPY.md`, not just the images.

## X

- A standard X post accepts up to four media items. A longer story therefore needs either evidence-safe compression to four cards or a numbered thread. Do not drop a necessary evidence or boundary page merely to force one post.
- Prefer 4:5 portrait images for this editorial-card treatment. Do not rely on 3:4 preview behavior.
- Put the strongest standalone claim on card 1 because users may not open every image or thread post.
- In `POST_COPY.md`, provide the first post and each follow-up post separately. Keep ordinary posts within 280 characters; count each link conservatively as 23 characters.
- Do not add hashtags that consume space without improving discovery. Usually 0–2 are enough.

## LinkedIn

- LinkedIn photo posts accept portrait images only up to 4:5 before cropping, so reflow every 3:4 card to 1080×1350.
- A multi-photo post can accept up to 20 photos, but its feed layout is not the same as a swipe-first document carousel. Emphasize the first image and expect the preview arrangement to depend on its orientation.
- When the user asks for a carousel, prefer a single PDF document assembled from the 4:5 pages with `scripts/pngs_to_pdf.py <png-dir> <output.pdf>`.
- LinkedIn document uploads accept one document per post and support PDF. Keep the title concise and make the post copy explain the professional implication rather than repeating every page.
- Use 0–3 precise hashtags and avoid consumer-style engagement bait.

## Cross-platform delivery

When the user requests all three platforms:

1. Keep one fact ledger and one narrative thesis.
2. Create separate `xiaohongshu/`, `x/`, and `linkedin/` directories.
3. Reflow layouts rather than cropping finished PNGs.
4. Generate a platform-specific `POST_COPY.md` inside each directory.
5. Produce the LinkedIn PDF when the requested publishing format is a document carousel.
6. State clearly which outputs were rendered and checked; do not imply that an ungenerated preset has been delivered.

## Source of platform limits

These limits were verified on 2026-08-20 against official documentation and may change:

- X posting: https://help.x.com/en/using-x/how-to-post
- X image creative ratios: https://business.x.com/en/help/campaign-setup/creative-ad-specifications
- LinkedIn photo posts: https://www.linkedin.com/help/linkedin/answer/a527229
- LinkedIn document uploads: https://www.linkedin.com/help/linkedin/answer/a523054

For a release or workflow that depends on exact current limits, re-check the official pages before claiming compatibility.
