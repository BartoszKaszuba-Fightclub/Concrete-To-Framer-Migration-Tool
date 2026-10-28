# Node data required for metrics M1–M18

Research only. This note does not mark any POC v2 acceptance criterion passed. It answers which captured node data is needed to reconstruct and verify M1–M18, and what can be omitted. Section 5 of `docs/poc-v2/implementation-spec.txt` is a hypothesis; the tables below replace it with this capture.

## 1. Provenance

| Item | Value |
| --- | --- |
| Branch / HEAD while reading | `feat/poc-v2-metrics` at `eca84bd9983660ef9dfa03f6b7c3321ef6b3883b` (rename). Parent data commit `913e014c69ba5688a329cc6b8b463a1d7b9b5dd0`. Neither commit contains `Database/` (`Database/` is gitignored). |
| Extractor (read, not modified) | `scripts/generic-extractor/cli.ts`, `extract.ts`, `browser.js`, `sections.ts`, `simplify.ts`, `match.ts`. npm script: `extract:generic` → `node --import tsx scripts/generic-extractor/cli.ts`. Default flags in `cli.ts`: widths `1440,390`, height `900`, out `Database`, max-nodes `0`, settle-timeout `10000`. |
| Frozen capture measured | `https://yellowhive.com/nl`, slug `nl`, state `default`, viewport 1200×900. No `captureId` or timestamp inside the JSON. Directory mtime of `structure.json`: 2026-10-23 11:32. |
| Files read for the byte count | `Database/digest/nesting/nl/1200/default/structure.json` (856,366 bytes, 1,006 nodes), `computed.json` (574,042 bytes, 374 measured + 632 skipped), `elements.json` (246,165 bytes, 1,006 entries). `json.dumps(..., indent=2)` reproduces those three sizes exactly. |
| Same counts at 1500 | `Database/digest/nesting/nl/1500/default/`: 1,006 nodes, 374 measured, 632 skipped, 326 reconstruction nodes, 8 clips. |
| Node id example | `n-000737` (anchor “Meer over onze merken”), `n-000879` / `n-000880` (gold outline link whose text is on the child span), `n-000734` (hero h2 “Onze merken”), `n-000739` (hero photo), `n-000860` (Latest news root). |

`Database/` in this worktree is absent. Measurements are from the main checkout’s untracked `Database/`, which the extractor writes. Those files were not modified.

### Spec paths that the repo does not have

The spec’s example directory `Database/digest/nesting/en/1500/default/` does not exist. The source URL is `https://yellowhive.com/nl`, and `cli.ts` derives the slug from the path, so the tree is `Database/digest/nesting/nl/<width>/default/`. Clip digests are `.../default/digests/clip-04.json`, not `Database/digest/nl/1500/default/clip-04.json`. There is no `index.json` and no `sections.approved.json`. Approval is stored as `Database/digest/nesting/nl/sections.overrides.json` (3,716 bytes, 8 selector groups at each width) and as `sectionCandidates[].status = "approved"`.

| Spec claim (v1 record) | This capture |
| --- | --- |
| Slug `en`, 946 nodes, 266 simplified nodes, 10 clips, 314 measured | Slug `nl`, 1,006 nodes, 326 reconstruction nodes, 8 clips (`clip-01`…`clip-08`), 374 measured. Skipped 632 matches the spec. |
| Widths 390, 768, 992, 1200, 1500 | Also 640 and 1650. |
| 50 digests, e.g. `Den/1500/default/clip-04.json` | 8 digest files per width under `nesting/nl/<width>/default/digests/`. Seven widths × 8 = 56 files. The 1200 set is 678,426 bytes and still points at the full `structure.json`. |
| `Dlinks/`, `Dwidget type/`, cleaned HTML hold clip data | Those three directories contain only `.gitkeep` (0 bytes). |
| Media stored as URLs only, not downloaded | `Database/digest/media/` has `asset-map.json` (860 bytes, 8 URL→filename entries) and 8 downloaded files (directory 327,783 bytes). Not a complete set of node URLs. |
| `structure.json` includes alt | `extract.ts` `DomNode` has no alt. `browser.js` `collect` does not read `alt`. |

## 2. Metric evidence, corrected from the 1200 capture

Values below are `getComputedStyle` strings in `computed.json` `nodes.<id>` (directly measured) unless marked derived or inferred. `browser.js` `computed` requests only the `PROPS` list at lines 124–133. Anything not in that list is absent even when `traits` mentions it.

| Metric | Evidence that is actually in this capture | Limitation after reading the files |
| --- | --- | --- |
| M1 Total generation time | None. No prompt, stage, or Assets-save timestamps in the node files. | Not a DOM property. These files cannot score M1. |
| M2 Native component percentage | None. Source nodes never name a Framer layer type. | A native-looking DOM tree does not prove a native Framer definition. |
| M3 Font family | `computed.nodes.<id>.fontFamily`. All 374 measured nodes, and all 373 clip+shell nodes, are `Lexend, sans-serif`. | Directly measured specified list, not a loaded face. `settle` awaits `document.fonts.ready` and discards the result (`browser.js` 194–198). A family list does not prove Lexend loaded. |
| M4 Font size | `fontSize` in px on every measured node. Kept set: 16px×274, 18px×74, 24px×6, 40px×5, 52px×4, 14px×4, 20px×4, 32px×2. Hero h2 `n-000734` is 52px; section h1 `n-000830` is 40px. | Directly measured used px. Nested nodes differ from parents (57 measured parent/child `fontSize` mismatches). The anchor `n-000879` has empty own text; the label is span `n-000880`. |
| M5 Font weight | `fontWeight` `400`×308, `700`×63, `500`×2 (`n-000931`, `n-000934`) in the kept set. Buttons/anchors above are `700`. | Directly measured computed weight. No variable axes and no check that the face exists. |
| M6 Line-height | `lineHeight` used px on every measured node. Never the keyword `normal` (0 of 374). Distinct values include 24, 20, 21.008, 30, 32, 36, 52, 60, 18, 17, 50, 22.5, 28. Hero h2 `n-000734` is 60px; gold anchors are 21.008px. Button `n-000701` is 21.008px while child spans `n-000702`/`n-000703` are 18px. | Directly measured used px, not the specified unitless or keyword value. 90 parent/child mismatches, so a parent’s line-height is not the label’s. Subpixel values such as 21.008 must be kept. |
| M7 Letter-spacing | `letterSpacing` is `normal` on all 374 measured nodes. | Directly measured keyword. It is not `0px`. Do not derive 0, and do not invent negative tracking. A07 leaves unresolved `normal` unmeasured. |
| M8 Padding | Four `padding*` sides. Non-zero on a minority (example: gold anchor `n-000737` is 10px / 25.008px / 10px / 25.008px). | Directly measured used px. `box` is the border box from `getBoundingClientRect` (`browser.js` 44). `box-sizing` is not stored. Geometry alone cannot separate padding from border or margin. |
| M9 Margin | Four `margin*` sides, including negatives (47 negative side values among measured nodes) and `n-000860` `marginBottom` `200px` (Latest news root at 1200). Heading `h1`/`h2` `marginBottom` is `40px`; hero and body paragraphs under them are `0px`. | Directly measured used px per element. Margin collapse and negatives are not modelled. Sibling boxes can support a check; they are not a substitute for the four sides. |
| M10 Gap | `rowGap`/`columnGap` are `normal` on 373 measured nodes and `0px` on grid `n-000820` (`display:grid`, class `feature__images`). | The heading–paragraph separation in this capture is heading `marginBottom`, not `gap`. `normal` is not `0px` and is not interchangeable with child margins. Flex/grid mode is only the `render.display` string (`flex` 130, `inline-flex` 11, `grid` 1 in the whole tree). `flex-direction`, `align-items`, and `order` are absent. |
| M11 Text colour | `color` plus element `opacity`. Kept text colours: navy `rgb(27, 49, 88)`×306, white×45, gold `rgb(249, 176, 15)`×12, navy 50%×5, gray `rgb(64, 64, 64)`×3, link blue `rgb(13, 110, 253)`×2. | Directly measured computed colour. Inherited source is not stored. 32 parent/child colour mismatches. The blue pair is rare and must be kept. Cookiebot nodes have no `color` at all. |
| M12 Fill colour | `backgroundColor`, `backgroundImage`, and `media[]`. `backgroundImage` is `none` on all 374 measured nodes. Non-transparent fills: gold×15, white×13, `rgb(242, 242, 242)`×4, navy×3, `rgba(255, 255, 255, 0.9)`×1. Hero photos are `img` nodes (`n-000739` URL present, box 1200×775). | Image fill is the element’s rendered box plus URL, not a flat colour. `object-fit` / `object-position` / natural size are absent. Downloaded `hero-onze-merken.jpg` is 1920×770 (file pixels, not a JSON field) against a 1200×775 box. `n-000775` and `n-000793` have boxes and no `media` URL (`swiper-lazy`, not `swiper-lazy-loaded`). |
| M13 Border colour | Per-side width, style, colour, and four radii, plus `boxShadow` (4 non-`none`). Gold filled anchors: 2px solid gold, radius 6px. Outline gold links `n-000879`/`n-000889`/`n-000899`: transparent fill, 2px gold, gold text. `n-000701`: width 2px, style solid, colour `rgba(0, 0, 0, 0)`. | Width 0 does not paint; colour is still stored on all 374 nodes and mostly repeats `currentColor`-like navy. A matching colour with width 0 is not a border. Radius `50%` and `100%` occur and must stay as those strings. Outline width/colour is not in `PROPS` (no `outline` trait on this page). |
| M14 Unintended overflow | `box` of parent and children; trait `overflow` on 53 kept nodes (flag only). In-flow measured children of those nodes do not stick out by more than 1px. Body `n-000001` has the trait and a page-height box. | The trait does not say `hidden` / `auto` / `scroll`. `scrollWidth` / `clientWidth` are absent. Zero geometric overflow is not proof that no clipping rule exists. |
| M15 Unintended clipping | Trait `clip` on 3 images (`n-000822`, `n-000824`, `n-000826`), each with a `mask` URL. Trait `overflow` as above. Full-page screenshots: `Database/Screenshots/nl/1200/default/screenshot.png` (2,038,268 bytes) and `sections-preview.png` (2,048,170 bytes). | No per-node crop, no line boxes, no clip-path geometry. Intent needs the screenshot. Mask URL is directly measured; the mask’s effect is not. |
| M16 Unintended overlap | Sibling `box`, `render.position`, DOM order. Static in-flow siblings do not intersect by more than 1px. 14 kept nodes have trait `transform`; 39 have trait `z-index`. Hero slides `n-000728`/`n-000746`/`n-000764` share the box 0,0 1200×775. | Bounding-box overlap of stacked slides is intended. Transform matrix and numeric `z-index` are not stored, so paint order is not fully determined. Screenshot is required. |
| M17 Text wrapping | `content` own text (whitespace collapsed unless `white-space` matches `pre` or `break-spaces`, and that keyword is then discarded). Child order. `fontSize`, `lineHeight`, `textTransform` (`capitalize` on 4 language spans). `box` height vs line-height (hero h2 box height 60 with line-height 60; h2 `n-000789` box height 180 with line-height 60). | No line rectangles, no `white-space`/`word-break` value. A wrong sentence cannot be scored. Stored text is the collapsed DOM text, not the post-`text-transform` glyph string. `n-000879`’s visible label is only on `n-000880`. |
| M18 Stacking | `parentId`, `order`, `children` (0 mismatches against child index), `render.display`, `render.position`, `box`. Photo `n-000846` starts at x=615, width 540, inside section `n-000834` at x=0, width 1200. Header `n-000633` is `position:fixed`, box height 70, while hero `n-000721` starts at y=0. | Flow order is directly measured. Paint order is not: numeric `z-index` and `flex-direction` are absent. This file is one width (1200). It does not prove other widths. |

## 3. Field decisions

How to read the decision column: **keep** = store on the component digest; **derive** = compute a check or a hoisted default from kept fields, and store the derived value only as a labelled extra; **omit** = do not put it in the builder digest. “Direct” is a browser measurement. “Derived” is computed from those measurements. “Inferred” is a guess (token names, intent) and must not replace the measurement.

| Field / path | Metrics | Decision | Why | Evidence on this capture | Limitation |
| --- | --- | --- | --- | --- | --- |
| `nodes` key `n-######` (`browser.js` 40) | All except M1–M2 | Keep | Joins structure to computed inside one capture. | 1,006 ids; clip members and computed ids join with no dangling clip id. | Capture-local preorder. Not stable across runs. Not an M2 Framer id. |
| `parentId`, `order`, `children` | M17, M18 | Keep | Direct tree and sibling order. | 0 order/parent mismatches. | Not paint order. |
| `selector` (`structure.nodes.<id>.selector`; duplicated as `elements.json[].selector`) | Re-query only | Omit from digest | Metric values are already joined by id. | `elements.json` is 246,165 bytes and 1,006 pairs, all present on structure. Selector text in structure is 195,863 bytes. | Needed only to re-measure a live page. `sections.overrides.json` still stores selectors, not ids. |
| `classes`, `domId` | None of M1–M18 | Omit from digest | Gold vs navy is `backgroundColor`, not the class. | 752 nodes have classes; 104 have a non-empty `domId`. Classes JSON text is 35,926 bytes. | Class names such as `hero__prev` are useful debug labels, not measurements. |
| `render.display`, `visibility`, `opacity`, `position` | M2 n/a; M14–M18 | Keep | Direct layout mode and hiding. | Display counts include flex 130, none 67, grid 1. Position: static 825, relative 110, absolute 67, fixed 4. | `display:flex` without `flex-direction`. No `display:contents` on this page. |
| `box` x/y/width/height | M8, M14–M18 | Keep | Direct border box, rounded to 0.01px, includes scroll. | Hero `n-000721` 1200×775 at y=0; header 1200×70 fixed. 675/1,006 nodes have a zero side; 79 of 374 measured nodes do. | Not padding or content box. Zero box is not a reason to drop a styled node that is `display:none` only after provenance is recorded. |
| `traits` including `transform`, `z-index`, `overflow`, `clip` | M14–M16, M18 | Keep the flag | Direct boolean that a non-initial property exists. | Kept nodes: overflow 53, z-index 39, transform 14, clip 3, shadow 4, `::before` 30, `::after` 11. | The numeric transform, z-index, and overflow keyword are **not** in `computed.json`. The flag cannot be verified to 1px by itself. |
| `computed.nodes.<id>.fontFamily/fontSize/fontWeight` | M3–M5 | Keep | Direct computed typography per node, including nested spans. | See section 2. Weight 500 occurs twice. | Family is a list. Weight is not a loaded-face check. |
| `lineHeight` | M6, M17 | Keep | Direct used px, including fractions. | `21.008px` on gold controls; `60px` on hero titles. Keyword `normal` does not occur. | Specified `normal` or unitless ratio cannot be recovered. |
| `letterSpacing` | M7 | Keep the keyword; do not derive px | Direct, and uniform. | `normal` ×374. | Unmeasured for the 0.1px threshold until a justified px resolution exists. Hoist one explicit `normal` rather than deleting it. |
| `paddingTop/Right/Bottom/Left` | M8 | Keep non-zero; schema-default `0px` may be omitted | Direct sides. | 25.008px horizontal padding on gold anchors. | Omission is safe only if missing means `0px`, not “unknown”. |
| `marginTop/Right/Bottom/Left` | M9, M18 | Keep non-zero, including negatives; schema-default `0px` | Direct sides. Latest-news 200px is the section margin. | `n-000860.marginBottom = 200px`. Negatives on hero row wrappers (`n-000730` −15px). | Collapsed margin is not stored. Do not replace with a single visual gap. |
| `rowGap`, `columnGap` | M10 | Keep deviations; hoist `normal` | Direct. Almost unused here. | Only `n-000820` is `0px`. Every other measured node is `normal`. | `normal` must not be rewritten to `0px`. Parent gap is not child margin. |
| `color`, `opacity` | M11 | Keep `color`; keep `opacity` when not `1` | Direct. | Blue `rgb(13, 110, 253)` ×2. Measured opacity not 1: 31 nodes. | No inherited-from id. Parent colour is the wrong place to read a label. |
| `backgroundColor`, `backgroundImage` | M12 | Keep non-transparent colour and any image other than `none` | Direct. | `backgroundImage` is `none` everywhere measured. Fills listed in section 2. | Transparent ancestors are not a flat fill. Hero colour is not navy in this capture; the hero is photographs. |
| `media[].kind/url` | M12, M15 | Keep | Direct `currentSrc` or CSS `url()`. | 13 kept nodes have media. Hero `n-000739` and `n-000757` have URLs. | Not natural size, not `object-fit`. Two visible lazy images have no URL. |
| Rendered image `box` vs file pixels | M12 | Keep the box; natural size is not in the node JSON | Box is direct. File pixels were read separately with `sips`. | `hero-onze-merken.jpg` 1920×770; `home-01.jpg` 550×550; `news-bhb.jpg` 576×205; logo SVG 125×55. `asset-map.json` maps URL to filename only. | Those pixel sizes are not captured fields. Do not pretend the digest already has them. Crop/fit stays unresolved. |
| Border width, style, colour, radius; `boxShadow` | M13 | Keep width when non-zero, with that side’s style and colour; keep non-zero radius and non-`none` shadow | Direct. Colour-with-zero-width does not paint. | 6 side values have width > 0 and transparent colour (`n-000701`). Radii include 6px, 10px, 5px, 50%, 100%. | Dropping colour only when width is `0px`. A transparent 2px border must stay. |
| `pseudos["::before"\|"::after"]` | M11–M13, M15 | Keep when present | Direct, only if `content` is not `none`/`normal` (`browser.js` 137–161). | 40 measured nodes. Example `n-000645` `::before` height 4px, gold background. | A `::before` trait without a computed record is an unresolved hole, not an empty pseudo. |
| `content` text runs | M17 | Keep | Direct own text; element children are `{id}` placeholders (`browser.js` 84–99). | Kept own-text payload is 3,929 bytes. `n-000880` is `Lees meer`; parent `n-000879` own text is empty. | Collapsed whitespace. Not line breaks. `textTransform: capitalize` changes display of 4 spans. |
| `textTransform` | M17 | Keep when not `none` | Direct. | `capitalize` ×4 (language labels). | Specified string and painted string can differ. |
| `field` | Forms, out of scope | Omit from page-section digests on this capture | All 9 fields are checkboxes inside Cookiebot, and none are measured. | No measured `field` in clip or shell nodes. | A future visible page field must be kept. Do not invent one for Yellow Hive. |
| `markup` (svg) | M12 icon paint | Keep for kept nodes; Cookiebot svg goes with the consent subtree | Direct `outerHTML`. | 38 svg nodes, 34,034 bytes of markup. The 13,662-byte svg is `n-000009` (zero box, inside the skipped dialog). Kept markup is 20,372 bytes on 37 icons. | Inner svg geometry is not separately styled. Dropping page icons would lose chevrons. |
| `boundary`, `untraversedChildren` | Coverage | Keep on kept nodes | Direct refusal to walk svg/iframe. | 40 boundaries in the full tree (38 svg, 2 iframe). Iframes are Cookiebot and unassigned. | Iframe/video pixels are not captured. |
| Token inventory (distinct px/colours with counts) | M3–M13 support | Derive | Counts from kept computed values. Names would be inferred. | 8 font sizes, 13 line-heights, 3 weights, 6 text colours, 5 non-transparent fills in the kept set. | Do not replace `21.008px` or `rgb(13, 110, 253)` with a nearby token. |
| `elements.json` | None | Omit | Duplicate id+selector registry (`cli.ts` 92–94). | 246,165 bytes, 0 fields missing from structure. | Removing it does not remove selectors from `structure.json`. |
| `matches.proposed.json` | None for one width | Omit from the v2 path | Cross-width proposals. | 888,171 bytes at `nesting/nl/matches.proposed.json`. | One-width scoring does not need it. |
| Cookiebot subtree (`computed.skipped`, reason `cookiebot`) | Must not be filled in | Omit from page-component digests after consent is dismissed | 632 nodes skipped by ancestor id/class (`browser.js` 135–149), including on-screen buttons `n-000625`, `n-000627`, `n-000629` that have boxes and **no** computed style. | Skip roots: `n-000002`, `n-000631`, `n-001005`, `n-001006`. Clip members contain 0 skipped nodes. | This frozen file still contains them because consent was not dismissed. Do not invent their colours. |
| `n-000813` | None | Omit | Measured, 1200×0, no children, no traits, transparent background, unassigned. | The only measured node outside clips and `sectionShell`. | The unassigned warning itself should stay in the capture report. |
| Screenshot / snapshot | M14–M17 visual check | Keep as evidence outside the node digest | Not node fields. | `Screenshots/nl/1200/default/screenshot.png`; `snapshots/nl/1200/default/snapshot.html` (263,357 bytes). | A screenshot does not supply px padding or font weight. |
| Run timestamps / Framer layer tree | M1, M2 | Not in node capture | Different records. | Absent from these JSON files. | Building them from DOM fields would be fiction. |

`simplify.ts` already drops `display:none` and folds a wrapper only when it has no content, boundary, field, media, or traits and the same box within 0.5px. Reconstruction at 1200 is 48,758 bytes and 326 nodes. That file has tag, child ids, and `sourceIds` only. It cannot score M3–M17. Use it as a provenance map, not as the metric digest.

## 4. Measured reduction on this frozen input

Baseline is the three node files at 1200, summed, not a token estimate.

| Slice | Bytes | Nodes |
| --- | --- | --- |
| `structure.json` | 856,366 | 1,006 |
| `computed.json` | 574,042 | 374 with styles; 632 skipped entries |
| `elements.json` | 246,165 | 1,006 |
| Sum | 1,676,573 | |
| Structure with the 632 skipped nodes removed | 303,675 (552,691 bytes less than structure) | 374 |
| Structure with `selector`, `classes`, and `domId` removed | 545,427 (310,939 bytes less) | 1,006 |
| Computed records with schema defaults removed (see below), family, size, weight, line-height, letter-spacing, and colour always kept | 134,170 (439,872 bytes less than computed) | 374 style records; 13,878 property slots → 3,270 |
| Joined projection: clip members + 3 shell nodes, styles inlined, defaults elided, no selector/class/domId, no `elements.json`, no Cookiebot nodes, no `n-000813` | **350,549** | **373** |

The projection is 350,549 / 1,676,573 = 20.91% of the three-file byte count (1,326,024 bytes removed). It still repeats `fontFamily` and `letterSpacing` on every measured node so those values are not silently dropped. Clip digest files (678,426 bytes) are not part of this baseline; they duplicate measurements and point back at the full structure.

Defaults treated as omit-able only behind an explicit schema (missing means this value, never “unknown”): padding and margin `0px`; `backgroundColor` `rgba(0, 0, 0, 0)`; `backgroundImage` `none`; `opacity` `1`; `textTransform` `none`; `boxShadow` `none`; `rowGap`/`columnGap` `normal`; border width `0px` together with that side’s style and colour. Border colour is kept when width is not `0px`, including transparent. `letterSpacing: normal` is kept.

Not subtracted, because they are rare or visually required: svg icon markup, pseudo-elements, the two URL-less hero images, weight 500, link blue, 50%/100% radii, negative margins, `boxShadow`, `textTransform: capitalize`, and the transform/z-index/overflow/clip flags.

## 5. Question → finding → evidence → decision

**Which node fields reconstruct M3–M13?**
Finding: per-node computed typography, colour, padding, margin, border, radius, shadow, background, and image URL, plus the child span that actually holds the label.
Evidence: section 2 counts; `n-000879` own text empty and `n-000880` text `Lees meer`; `n-000701` line-height 21.008px vs child 18px; `letterSpacing` `normal` on every measured node; `n-000860.marginBottom` `200px`; `rowGap` `normal` except `n-000820`.
Decision: keep those computed fields per node. Hoist only true invariants (`Lexend, sans-serif`, `letterSpacing: normal`, gap `normal`) as named defaults. Do not convert `normal` to `0px`.

**What is safe to omit?**
Finding: `elements.json`, CSS selectors, classes, and `domId` add no metric that the id-joined computed values lack. Cookiebot’s 632 nodes are outside every clip and have no computed styles. `n-000813` is an empty zero-height node.
Evidence: section 4 byte counts; clip∩skipped = 0; `elements.json` ids are exactly the structure ids.
Decision: omit those from the builder digest. Keep selectors only in capture evidence used to re-query. Do not omit a node merely because its style equals a default if the schema cannot tell “default” from “missing”.

**What must not be omitted even though it is rare?**
Finding: nested label styles, transparent 2px borders, non-palette blue, weight 500, fractional line-height and padding, negative margins, percent radii, shadows, painting pseudos, svg icons, and hero images that currently lack a URL.
Evidence: counts in sections 2–3; `n-000775` and `n-000793` have boxes and `media` absent.
Decision: keep them. Record the two missing URLs as missing, not as empty decoration.

**Can M14–M18 be verified from boxes alone?**
Finding: boxes, DOM order, `display`, and `position` support a 1200px geometric check. They do not carry overflow mode, z-index, transform, flex direction, or line boxes. Hero slides occupy the same box on purpose.
Evidence: 0 in-flow overflow escapes and 0 static sibling overlaps over 1px; 14 transform flags and 39 z-index flags without values; shared hero slide box 1200×775; screenshots exist as separate files.
Decision: keep boxes, order, and render flags. Keep the trait flags as “value not captured” markers. Do not score paint order or clipping as passed from boxes alone.

**Can this file score M1 or M2?**
Finding: no.
Evidence: no timestamps and no Framer layer inventory in the three JSON files.
Decision: collect M1 from the run log and M2 from the Framer definition tree. Do not derive either from node data.

### Unresolved

- Whether `Lexend` actually loaded. The file stores the family list only.
- A px value for `letter-spacing: normal`.
- Numeric `z-index`, transform matrix, overflow keyword, `flex-direction`, alignment, `box-sizing`, `object-fit`, `object-position`, `white-space`, `word-break`, and line rectangles. Traits prove some of these are non-initial; the computed pass does not store them.
- Natural image size inside the node record, and URLs for `n-000775` and `n-000793`.
- Cookiebot buttons that were visible in this capture and have no computed style. Dismissing consent is future capture work; this file cannot supply their metrics.
- No page form field remains after Cookiebot is excluded. That is “not present”, not a measured field.
