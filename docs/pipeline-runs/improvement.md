# Pipeline improvement

One document for every pass. Append the next pass. Leave earlier passes as they are.

## Open

No open issues.

## Pass 1

### What changed

The builder skill reads padding, margin, opacity, fills, and links from the digest of the capture it was given. The section skill marks a candidate as an overlay when that candidate's evidence position is fixed or sticky. The review skill's sample rows are placeholders, so a later review fills them from the page it has open. Ultra improvement asks the senior to name the stage that dropped a fact, and to drop a proposal that only draws the current page. This file is the only pass log. Each pass uses the other of https://towmotive.com/ and https://yellowhive.com/nl. The loop stops when each of those sites has a pass at or above 80%.

### Data

The previous run read the Yellow Hive capture at `Database/digest/nesting/nl/1200/default`. The builder skill in that run repeated node ids from that folder. This pass reads the capture folder written for the site in `docs/pipeline-runs/context.md`. The builder takes lengths, colours, and hrefs from that capture's digest and token file.

### Skills

Before this pass, the builder skill named frames, labels, and hero nodes from one Yellow Hive page, and the section skill named that page's header. Ultra improvement asked for the smallest edit that would move one row on that page.

After this pass, the builder skill takes lengths, colours, and hrefs from the digest and the token file. The section skill marks a candidate as an overlay when its evidence position is fixed or sticky. Ultra improvement tells the senior to change the stage that dropped the fact, and to drop a proposal that only draws the current page.

Next: rerun on https://towmotive.com/

## Pass 2

### What changed

https://towmotive.com/ was built in Enchanting Whoever on Framer branch silken-delta and scored 15 of 32. The token collector stores the keyword normal as 0em, and the digest still records that keyword as unsupported while treating it as the same tracking as 0em. The digest now keeps flex direction and flex wrap, and it keeps a block that is narrower than its flex or grid parent. The builder takes the named text style, the fill, the alt, the border strings, the measured width, the clipping, and a content-url pseudo from the digest. A control whose destination status is value stays a visible frame. A list the live page reorders, and names that are absent from the capture, stayed out of the kit.

### Data

Pass 1 read the Yellow Hive capture at `Database/digest/nesting/nl/1200/default`. This pass read `Database/digest/nesting/home/1200/default` for https://towmotive.com/: 124 digests, 15 colours, 29 text styles, screenshot `Database/Screenshots/home/1200/default/screenshot.png`. The builder read geometry, fill, alt, flex wrap, and the typography token name from that capture. The next pass reads a new capture of https://yellowhive.com/nl.

| Step | Skill | Started | Ended | Duration | Activities |
| --- | --- | --- | --- | --- | --- |
| 1. Collect the page | `.cursor/SKILLS/COLLECTOR.md` | 2026-11-11T19:09:35+0100 | 2026-11-11T19:11:36+0100 | 2m 1s | `npm run extract:generic`; tokens; digest; `npm test` 29 passed |
| 2. Define sections | `.cursor/SKILLS/SECTIONS.md` | 2026-11-11T19:12:15+0100 | 2026-11-11T19:22:01+0100 | 9m 46s, parallel with step 3 | wrote `sections-prompt.md` |
| 3. Export styles | `.cursor/SKILLS/BUILDER.md` | 2026-11-11T19:12:15+0100 | 2026-11-11T19:22:01+0100 | 9m 46s, parallel with step 2 | silken-delta, 15 colours, 28 text styles, missing font swiper-icons |
| 4. Place organisms | `.cursor/SKILLS/BUILDER.md` | 2026-11-11T19:31:36+0100 | 2026-11-11T19:45:51+0100 | 14m 15s | `first-component.md`, `build-report.md` |

### Skills

Before this pass, the builder sent the keyword normal for letter-spacing, matched a text style on size and weight, and turned every flex row into a stack that could be fitted to the band. After this pass, it sends 0em for that keyword, applies a text style only when the named token matches the run including colour, and keeps a nowrap row at the measured child widths.

Next: rerun on https://yellowhive.com/nl

## Pass 3

### What changed

https://yellowhive.com/nl was built in Enchanting Whoever on Framer branch mellow-harbor and scored 25 of 32. The extractor writes a used solid SVG fill and stroke into the stored markup when that colour is missing from the markup, and it leaves an unresolved custom property unwritten. The token collector passes each colour in shapePaints through the same path as a background colour. The digest stores a pseudo's left, top, transform, and position, and the builder places a painting ::before or ::after from those values. The consent record stores the panel background and its visible text, and a null dialog stays off the page. The test run writes placement-start.md at the Place organisms clock, and the review starts M1 from that file when it is earlier than first-component.md. Every slice stayed: 5307f75, d4ac8ec, 17458b4, a44bd20, 7ad1aaa, 01daace, d595d11, f0ab5e8, 1968241, 11d13b8, and f37a9ee. npm test passed 29 of 29.

### Data

This pass read `Database/digest/nesting/nl/1200/default` for https://yellowhive.com/nl. The builder read geometry, fill, alt, flex wrap, and the typography token name from that capture. The markup still held an unresolved custom property for an inline shape, the pseudo record had no left or top, and the consent record was a selector and a box. The next capture stores the resolved solid on the markup and on shapePaints, the pseudo offset, the consent panel colour and text, and placement-start.md. The next pass reads a new capture of https://towmotive.com/.

### Skills

Before this pass, the builder painted any fill other than currentColor from the attribute string, so a custom property was not a colour. A painting pseudo had size and no stored offset. The consent step placed no dialog when the record had no colour or text. M1 took its start from the newest timing table, which belonged to the previous site.

After this pass, the builder paints the solid colour already written into the markup, once. It places a painting ::before or ::after from the stored left, top, and transform, and it paints a dialog from the consent record when that dialog is present. M1 starts from placement-start.md when that timestamp is earlier than first-component.md.

Next: rerun on https://towmotive.com/
