# Any-site pipeline

Klaar = both https://towmotive.com/ and https://yellowhive.com/nl have a pass in docs/pipeline-runs/improvement.md at or above 80%, on branch any-site, with no site-specific node ids written back into the skills.

- [x] Strip site recipes from BUILDER and SECTIONS. Gate the senior in ultra-improvement. One pass document. Commit 658be3f on any-site.
- [ ] Pass A: collect, sections, build, review Towmotive. Framer project Enchanting Whoever B64kxxljgwceYGrBUPBt. Clean Framer branch from main.
- [ ] If under 80%, ultra improvement, then append Pass section.
- [x] Pass B: Yellow Hive 25 of 32 (78%). Eleven slices kept. npm test 29 passed. Pass 3 committed as 40b8f78.
- [ ] Pass C: Towmotive review is 8 of 31. Ultra-improvement diagnoses are running, one per Not met or Not measured row. Senior waits until every diagnosis returns.
  - headings 669703a5-bd41-4e63-b5c0-d08a69845b29 returned. One text style per visual look, so a shared look becomes one heading tag. Proposal: include the tag in the style key, and set the rich-text tag from the digest node.
  - styles ceb58a82-7224-41ff-a6c8-db34159e70bd returned. Builder leaves inline wrappers without a text layer, paints icon paths from raw colour, and skips a last-child margin. Proposal: bind the glyph run’s text style, match a colour style for solid fills, spacer every positive margin side, and record shapePaints when the markup already has a colour.
  - controls 503391f3-26b9-4648-8a13-ea1abefa28af returned. Review read never asks for component controls. Proposal: return variable name, type, and initial value, instance $control__ values, variants, and taps, and add a controls line to the build report.
  - code 23f29d71-d009-4c4d-b342-3c7b03ef5644 returned. Report writes Custom code: none from missing code files, not from code and codeOverride values. Proposal: record those values, and leave name-only fields out of the count.
  - alt de2e93a4-2fd7-46f4-9789-00b72b12f20a returned. Builder writes the layer name into altText. Proposal: set altText from the digest asset field alt, including an empty string, and leave it unset when alt is absent.
  - nested 1bb1b7f0-6f0c-48d7-a3c3-9ceff0e99321 died without the four headings. Fresh retry ef46a495-3f2a-44d0-9814-e52c37d5f7b3. Do not resume 1bb1b7f0.
  - links 297b72e8-ccff-45da-aa70-3aba895bbd58 returned. Link variables are created with an empty initial value. Proposal: set initialValue from destination.href when status is value, and list status, kind, and href in each organism block.
  - M1 275ef248-cd16-4a92-a699-e8dc1aa8e599 returned. Builder reads and uploads every organism before first-component.md. Proposal: first organism only, then write that file, then the rest.
  - M2 5145134e-1952-4d56-b64e-a865e419ab5d returned. codeHits counts property names, not set code or codeOverride values. Proposal: the review rule counts a set value, and the caveat stays beside the percentage.
  - M4 78cf2d5c-50c9-45da-a3e6-6e23879461b6 returned. Rich-text fontSize is empty once a text style is applied. Proposal: score M4 from the preset fontSize and digest styles.typography.value.fontSize.
  - M5 e34c5894-7076-45d3-b84c-3daecec28612 returned. fontWeight is empty on every rich-text node once a text style is applied. Proposal: keep the digest weight on the node and leave the preset in place.
  - M6 540a17f5-2aa4-4501-bae5-ca19f3f70b0b returned. Line-height is on the digest and the text style, then left out of the artefacts M6 is scored from. Proposal: quote the digest length in Contains, and score M6 against the text style lineHeight.
  - M7 bba04b83-877d-4450-98b7-f98cd2db0e33 returned. measureLength stores letterSpacing normal as unsupported, with no length. Proposal: keep normal as a citable length, copy it into the section prompt, and score M7 from the text style and that measurement.
  - M8 0b95befe-c67e-4acf-bd71-21e0327d16c8 returned. Padding lengths are on the digest and on Framer frames, and the report never quotes them. Proposal: the spacing scorecard and M8 quote the four padding sides and the frame padding.
  - M9 86553e4a-1008-4aeb-938e-3a687d328692 returned. Spacers only cover a positive margin between siblings. Proposal: each stored side becomes its own spacer, including an only child, and a negative length is an offset.
  - M10 42c991be-5657-458b-b34c-97e017496d90 returned. Gap lengths never reach the section prompt or the build report. Proposal: copy rowGap and columnGap into the organism block, record the placed gap, and score M10 from those lengths.
  - M11 8435c070-ac4d-4811-94e1-6e7e789c7ea9 returned. Layer textColor is empty; the colour is on the text style. Proposal: M11 reads the preset textColor, and the colour scorecard names that colorStyle.
  - M13 c738c5ee-bdc2-4078-834d-1133c1d961cc returned. Border tokens never get a shared name, and the builder never writes borderWidth or borderColor. Proposal: name a matching borders entry, then set those fields when the four sides agree and the width is not 0px.
  - M14 72159f7f-0efe-4521-8c0f-f57e0ab208c2 returned. Overflow never reaches the review. Proposal: keep overflowX and overflowY on effects.clipping, set frame overflow from that keyword, and read it in the review.
  - M15 ee356e69-c2f6-4f71-a3bd-7241b5bf9249 returned. The review never reads a crop. Proposal: read overflow and image fill position on every frame, and screenshot the built page at the same width.
  - M16 de2e98d8-fab5-4da9-8ebf-9ddaba847757 returned. Review and builder drop position, left, top, and z-index. Proposal: record those on the Framer read, and place absolute, fixed, or sticky nodes on their geometry.
  - M17 5ae1ff78-faf3-4bbf-b23a-f044a340ce2b returned. The text summary drops textWrap, width, and height. Proposal: record those fields and the resolved text, and store line rectangles from getClientRects.
  - M18 093b6146-966b-46f7-8ade-9ad09fce4ae5 returned. Review read omits stack direction and child order. Proposal: copy stackDirection and ordered children, including stacks narrower than the breakpoint.
- [ ] Stop when both sites have a pass at or above 80%, or a pass meets no new row and every slice was reverted.

Assumption: Framer project stays Enchanting Whoever. The user named the two sites and a new git branch, and did not name a new Framer project.

## Collector nl 1200 (this run)

Klaar = `npm test` passes, and `Database/digest/nesting/nl/1200/default/digests/index.json` plus `Database/digest/tokens/nl/1200/tokens.json` exist from this capture of https://yellowhive.com/nl at width 1200.

- [x] Delete previous nl/1200 capture folders (already absent)
- [x] npm run extract:generic
- [x] design-tokens cli
- [x] digest cli --all
- [x] npm test
- [x] Report counts

Branch: any-site. No commit, no push, no PR, no Framer.

## Phase 1 styles, nl 1200 (this run)

Klaar = schone Framer-branch vanaf main, met 11 color styles en 25 text styles uit `Database/digest/tokens/nl/1200/tokens.json`. Geen organismen, geen pagina, geen build-report, niet publiceren.

- [x] Branch mellow-harbor `lei14qu8u` vanaf main. Project Enchanting Whoever.
- [x] Assets-mappen Templates, Organisms, Design tokens.
- [x] 11 color styles, 25 text styles. Lexend aanwezig. letterSpacing `0em` opgeslagen op alle 25.
- [x] Phase 2 op mellow-harbor `lei14qu8u`. Home 1200 x 5255. Rapport `Database/digest/nesting/nl/1200/default/build-report.md`. Geen commit, geen push, geen PR.

## Collector home 1200 (2026-11-12)

Klaar = `npm test` passes, and `Database/digest/nesting/home/1200/default/digests/index.json` plus `Database/digest/tokens/home/1200/tokens.json` exist from this capture of https://towmotive.com/ at width 1200. The capture folder contains only files from this run.

- [x] Delete previous home/1200 capture folders
- [x] npm run extract:generic
- [x] design-tokens cli
- [x] digest cli --all
- [x] npm test (29 passed)
- [x] Report counts: 124 digests, 15 colours, 29 text styles

Branch: any-site. No commit (COLLECTOR.md does not ask for one), no push, no PR, no Framer.

## Collector home 1200 (previous run)

Klaar = `npm test` passes, and `Database/digest/nesting/home/1200/default/digests/index.json` plus `Database/digest/tokens/home/1200/tokens.json` exist from this capture of https://towmotive.com/ at width 1200.

- [x] Delete previous home/1200 capture folders
- [x] npm run extract:generic
- [x] design-tokens cli
- [x] digest cli --all
- [x] npm test
- [x] Report counts

Branch: any-site. No commit, no push, no PR, no Framer.

## Phase 1 styles, home 1200 (sunlit-glow)

Klaar = Enchanting Whoever, branch sunlit-glow `wzbtrwl5n`, 15 color styles and 28 text styles from `Database/digest/tokens/home/1200/tokens.json`. No organisms, no build-report, no publish.

- [x] Opened existing branch sunlit-glow `wzbtrwl5n` from main. No second branch. Main unchanged.
- [x] Assets folders Templates, Organisms, Design tokens.
- [x] 15 color styles, 28 text styles. Poppins present. letterSpacing `0em` on all 28.
- [x] Missing font: swiper-icons. Text style `text/body/swiper-icons-16px-400-16px-0em-none` removed after Framer stored Inter.
- [x] No organisms, no page, no build-report, no publish, no git commit.

## Phase 2 organisms, home 1200 (sunlit-glow)

Klaar = Home on sunlit-glow `wzbtrwl5n` shows the eleven organisms in prompt order, breakpoint 1200 x 8116, and `Database/digest/nesting/home/1200/default/build-report.md` exists.

- [x] Eleven organisms on the existing branch. No second branch. No publish.
- [x] Home path `/` unchanged. One breakpoint, Desktop `WQLkyLRf1`, 1200 x 8116.
- [x] Header absolute at the top. Cookie button absolute at left 10, top 842, stored SVG, no code override.
- [x] build-report.md written. No git commit.
