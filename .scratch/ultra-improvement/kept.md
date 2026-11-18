# Kept themes

Reviewer: 79acad8e-5a6b-42f5-9b7a-8c17192ab6fd. Senior: 768dedee-5c29-4238-9580-edc1b6344092.

## 1. Text style and line-height

Narrowed. Do not send letterSpacing 0, 0px, or 0em. pass-2/gaps/04-styles.md already rejected those. Keep the glyph-run line-height rule and the preset that sets htmlTag back to the digest tag.

## 2. Gap and margin

Narrowed. paddingBottom on the heading frame sits inside the 52px border box. The 40px under n-000201 is outside that box: the heading is 52px at y 994.48, the next paragraph starts at y 1086.48, and parent n-000200 is 316px (52 + 40 + 224). Do not treat that 40px as padding inside the heading frame.

## 3. Section inset

Kept.

## 4. Border and radius

Kept.

## 5. Masked photo

Narrowed. Do not set M15 aside because FrameNode has no masks. This repo has no FrameNode schema. Missing masks on the built photo frames is not a schema.

## 6. Clipped labels and page height

Kept.

## 7. Links and tags

Narrowed. The four inline links n-000285 through n-000288 are display inline inside p n-000284 and each has a geometry box. "Has its own box" must not pull them out of the paragraph. BUILDER.md rule 11 keeps an inline link in the text run.

## 8. Variants on a shared box

Kept.

## 9. One session

Kept.

## 10. Fixed bar

Kept.

## 11. SVG fill

Narrowed. SVG children stay unvisited. Computed fill on the svg element does not read fill="currentColor" on the path. n-000019 already has color rgb(27, 49, 88) in computed.json. fill and stroke are absent because they are not in STYLE_PROPS.
