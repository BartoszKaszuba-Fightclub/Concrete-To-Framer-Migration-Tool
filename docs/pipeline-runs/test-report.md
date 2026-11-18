# Test report

| Document details | Value |
| --- | --- |
| Project | Concrete to Framer migration tool |
| Author | Bartosz Kaszuba |
| Contributor(s) | - |
| Date | 2026-11-18 |
| Version | 0.4 |
| Status | Draft. Expert feedback and reflection are still open. |
| Intended audience | Assessors, and the author |

| Version | Author | Contributor | Date | Change |
| --- | --- | --- | --- | --- |
| 0.1 | Bartosz Kaszuba | - | 2026-11-18 | First report from the pass source index. |
| 0.2 | Bartosz Kaszuba | - | 2026-11-18 | Split sentences that could be read two ways. Named M9 and M10 on metrics pass 3. |
| 0.3 | Bartosz Kaszuba | - | 2026-11-18 | Split the long lists. Cut repeated scores inside one section. |
| 0.4 | Bartosz Kaszuba | - | 2026-11-18 | Split the metrics-pass misses. Stated pass 1 as missing fields, not as deleted fields. |

## Contents

1. Introduction
2. Background
3. How this report was made
4. Fixture passes
5. Yellow Hive before the unattended loop
6. Unattended improvement
7. Two-site loop
8. Recommendation
9. Conclusion
10. Expert feedback
11. Reflection

## 1. Introduction

### Why

The tool turns a captured web page into Framer components. Each test asked whether a change made that result closer to the source, on the page that was just built. The later tests also asked whether the same kit still worked on a second site.

### Objective

This report records what each iteration found, what it changed, and why. It then says whether that change met the goal of that iteration. Small script edits are named once, as data that later stages did not read.

### Document structure

Sections 4 to 7 follow the source index. The same label "pass N" is three different loops. Each section uses the loop name from that index. Section 8 ranks what to do next. Section 9 answers the question of the tests.

## 2. Background

The kit has four stages. The collector writes the capture, the tokens, and the digests. The section step names the bands. The builder places those bands in Framer. A review then scores the page.

Two pages were used. The fixture is the local file `tests/extractor/fixtures/requirements.html`, at width 1200, on git branch `lean-pipeline`. The public page is `https://yellowhive.com/nl`, in the Framer project Enchanting Whoever. From 11 November 2026 the loop also builds `https://towmotive.com/`.

The goal of the tests is an improvement of this tool. A row is met only when that run's record cites a file, a Framer node, or a screenshot. A sentence in a skill is not a score.

## 3. How this report was made

Each section below uses the process file, the change note, and the justification named in `.scratch/pass-source-index.md`. This report does not re-run a capture or open Framer. Where two files disagree and the capture is gone, the report says so and does not pick a number.

## 4. Fixture passes

The fixture has a title, a language, six heading levels, seven links, three images, and two repeated cards. Pass 1 only reads the files. Passes 2 to 4 also look at one Framer project, Requirement fixture POC.

### Fixture pass 1, 9 November 2026

The capture held 30 nodes, 3 sections, and 0 component records. Tokens held 4 colours, 7 text styles, and 9 spacing values. Framer was not opened. The score was 0 met and 13 not met. Digest nodes still kept the heading text, the real tag, a local image path, and one style per look. Anchors had no address. `structure.json` had no title and no language. The two cards were not marked as a repeat. All seven links were `unsupported`.

The branch under test had already dropped files and fields that later stages did not read. It dropped `reconstruction.json`, `signatures.json`, `match.ts`, and `apply.ts`. It dropped the capture-time simplify and the second copy of state and viewport. It dropped stylesheet addresses on every media query, and digest copies of `selector`, `classes`, and `domId`. Colour and type were stored once. One digest process wrote every section. The reason is in `docs/poc-v2/improvements.md`, under "Stop writing data nobody reads".

That lean-up did not add the missing href, title, language, alt text, or a Framer page. The goal of this pass was to see which requirement signals the files still held. The 13 not met rows name the signals that were missing.

### Fixture pass 2, 10 November 2026

The same fixture was captured again and built on Home at desktop 1200. The capture now has the title `Requirement fixture` and language `en`. It has a link kind for each of the seven hrefs. It has warning `alt-missing` on the card without an alt, and molecule `sig-001` for the two articles. The h1 and the h2 that share a look keep their own tags and share one text style. Framer has Header, Main, Card placed twice, and Footer. Text and the card image are controls. No code file was added.

The change followed the thirteen gap notes from pass 1. The collector stores `href`, `alt`, `title`, and `language` on the capture, because the builder is not allowed to read the HTML snapshot. Digests classify the destination and copy the token name from `tokens.json`. A molecule is a set of visible siblings with the same tag and the same child tags. `docs/classification.md` states atom, molecule, organism, and template.

The score was 11 met and 2 not met. The style row failed because Framer stored letter-spacing as `-0.02em` and the card border was raw `rgb(200, 200, 200)`. The alt row failed because both card images say `Card one image`. The goal was to put the missing facts into the files and onto a page. That goal was met on 11 rows.

### Fixture pass 3, 10 November 2026

Capture, tokens, and digests ran again. The Framer page was read and not rebuilt. The capture reports 30 elements, 3 sections, and 2 component records. Tokens: 4 colours, 7 text styles, 9 spacing values, 1 border, 1 radius, 0 shadows. Framer still shows Header, Main, two Cards, and Footer.

Capture code did not change. On the existing project the card border became `1px solid var(--token-xhJ1K1cgR)`, the Line colour. Display 32 stayed `-0.02em`, because Framer rejected `letterSpacing: "normal"` and `0` was not sent. Card one's image control stores `{ src, alt: "Card one image" }`. Card two omits `alt`. The shared frame `slVaJcJoN` still says `Card one image`. `altText: null` was rejected.

The score was 12 met and 1 not met. The style row is met because the border uses the token and the letter-spacing rejection is written in the build report. The alt row stays not met. The border change met its goal.

### Fixture pass 4, 10 November 2026

The same commands ran into a new folder. Counts match pass 3. No capture code changed and no Framer node changed. The only edit is one build-report sentence: the shared frame keeps `Card one image` because `altText` is one string for both instances.

The score stayed 12 met and 1 not met. Pass 3 records one `alt-missing` warning. Pass 4 records two. Those capture folders are not on disk, so the warning count was not checked. Both scores name the same open item, frame `slVaJcJoN`. The goal of closing that row was not met. The four fixture runs stop there.

## 5. Yellow Hive before the unattended loop

These three runs use Enchanting Whoever and `https://yellowhive.com/nl`. They are not the fixture passes.

### Test pass, 5 November 2026

One page was collected at 1200×900 and built on Framer branch `test 3` (`csad5nwqj`). Nothing was published. The patch under test split one skill into a collector, a section agent, and a builder. The builder made eight organism components and one template, and did not place the template on a page.

Capture wrote 376 elements, 4 sections, 16 buttons, 11 colours, 25 text styles, and 20 digests. Command time was 21s for capture, 25s for tokens on the agent clock, and 2s for digests. From 12:06 to 12:38 was about 32 minutes, including 6 minutes while Framer was disconnected. The first attempt created no branch.

Images were missing because the capture stored remote URLs and left `usablePath` empty. Several bands were placed from page coordinates. Framer kept `-0.02em` on every text style. There is no scorecard for this run.

After the run, the builder skill was given short rules: place sections on a page, use local images and inline SVG, and use auto layout except for an overlay. The collector now downloads each media file and records `usablePath`. This pass was not rebuilt after that change. The goal was a page built by the split pipeline. The components were built. The page does not match the source, and the new rules were not scored.

### Metrics pass 3, 10 November 2026

Git branch `metrics-pass-3`. The same Framer branch `test 3` got a new page, `/metrics-pass-3`. The prompt was 09:46. Capture ended at 09:48:05. Four components were saved before 09:53: Header, Onze merken, Over Yellow Hive, and Footer. No code files. Main was not edited.

No capture code changed. The four section bands are the components this pass saves. The 66 button digests stay in the capture. `letterSpacing` stays the keyword `normal` and is not sent as `0`.

The metric score was 10 met and 8 not met. M1 is met because those four components were saved in under 15 minutes. M7 stays not met: the styles store `-0.02em`. M9 fails on margin. M10 fails on gap. M12 fails because the main images are not placed. M14 and M15 had no check against the screenshot. M16 and M18 fail because the header box is at y 1733 and the hero is at y 0. The four native bands met the clock. The whole page did not.

### Test 4, 10 November 2026

Framer branch `test 4` (`cbe7itpwl`) was created from main. Run 1 started at 10:27. The collector wrote 70 digests. The section step wrote no `sections-prompt.md`, and phase 1 stopped because no branch titled `test 4` existed. After the branch was created, run 2 resumed at 10:39:36 and finished at 11:28:06. The last component was saved at 11:26:16. From the first prompt that is 59m 12s. The target for M1 is under 15 minutes.

Eight native components are on Home. The rating is 10 correct and 21 room for improvement. A viewer would see three misses. The header sits under the hero. The Over photos are rectangles, and the hex mask sits beside them. Previous and Next break apart inside the yellow squares. No change note belongs to this run. The goal of a full native page was met. The 15 minute target was not met.

## 6. Unattended improvement

Git branch `pipeline-improvement`. Each run collects Yellow Hive at width 1200, builds a new Framer branch, scores the page, and may commit a kit change. The stop line used later is 80%. `npm test` is 29 passed on every run that records it.

### Unattended improvement 1, 10 November 2026

Framer branch airy-halo. Collect took 1m 35s and wrote 70 digests, 11 colours, and 25 text styles. An aborted placement left no page. The resume placed eight organisms. Runner wall time was 2h 18m 42s. Every text style stored `-0.02em`. Failed rows include heading tags, lazy hero photos, buttons left inside sections, missing links, a late M1 clock, the Over inset, scroll-to-top inside the footer, and no cookie layer.

The letter-spacing theme was dropped. Fixture pass 2 had already rejected sending `0`, `0px`, or `0em`. Kept changes set the rich-text tag from the digest node. They give each lazy hero file its own image. They copy the classification text into the build report. They place the cookie control from `consent.json`. A fixed or sticky bar becomes its own overlay. Reverted changes drew buttons a second time and filled an empty href. One change stopped after the first organism and left the rest of the page empty.

This pass has no single score. It names the met rows it left in place, including native components and M2 through M6. The goal was to turn the failed rows into kit changes that still hold. The kept commits do that for tags, lazy images, and the cookie control. Letter-spacing stays `-0.02em`.

### Unattended improvement 2, 10 November 2026

New branch silken-ember. Airy-halo was left untouched. Collect took 1m 26s. The first placement aborted. The resume wrote nine organisms and the cookie widget, and left the dialog off the page. Runner wall time was 1h 8m 12s. The score was 23 of 32, 71.9%. The 80% line for 32 rows is 26.

The letter-spacing theme was dropped again, for the same fixture reason. Also dropped: stop after the first organism, and a 305px row that does not match the loaded block. Kept: news-card margins as spacers, the icon link on the svg, inactive hero slides hidden on the variant, and the hero watermark drawn from the stored SVG. This is the first full score in this loop.

### Unattended improvement 3, 10 November 2026

The collector deleted the previous `nl` / 1200 capture, then wrote a new one: 71 digests, header at y 0, page height 5255. Framer branch linen-beacon got nine organisms. Runner wall time was about 45 minutes. The score was 21 of 34, 61.8%. Pass 2 had been 23 of 32.

The senior dropped the heading-tag theme. Letter-spacing and the first-organism stop stay out. Kept commits delete the stale capture before a run, walk paragraph text in source order, and wait for the cookie logo after dismiss. The goal was a higher score. The score went down. The row set also grew from 32 to 34, so the two percentages are not the same denominator.

### Unattended improvement 4, 11 November 2026

Framer branch sunlit-prism. Home is 1200×5255 with nine organisms. Runner wall time was about 48 minutes, from 00:27 to 01:15. The score was 19 of 34, 55.9%. Unmet rows include style mapping, alt text, links, M1, M4, M7, M8, M9, M11, M12, M17, M18, and three Other rows. All 25 text styles still store `-0.02em`.

The reviewer dropped a theme that would leave letter-spacing unset, because that would also drop the text styles that meet font family, weight, and line-height. Fresh review said revert commit `b25c383` for M14. The pass kept that commit. The note that explains why that commit stayed was not found. `npm test` stayed 29 passed. The goal was a higher score. The score went down again.

### Unattended improvement 5, 11 November 2026

Framer branch golden-crest. The review scored 26 of 31, 83.9%. The run stops. This pass adds no kit commit. It builds with the pass 4 set, including `b25c383`.

Home has nine organisms. The header sits over the hero. The h1 style still stores `-0.02em`. The remaining misses include style mapping and M7. Those two are the same letter-spacing fact. The other misses are links on the gold-band words, the news heading margin, and the wrap of the third news title. The 80% goal of this loop was met on this score. The letter-spacing row was not.

## 7. Two-site loop

`docs/pipeline-runs/improvement.md` starts after unattended improvement 5. Sites alternate between Towmotive and Yellow Hive. The file says the loop stops when each site has a pass at or above 80%.

### Improvement pass 1

This section has no score and no step clock. Before the pass, the builder skill named frames, labels, and hero nodes from one Yellow Hive page. After the pass, the builder reads padding, margin, opacity, fills, and links from the digest it was given. The section skill marks a fixed or sticky candidate as an overlay. The improvement step drops a proposal that only draws the current page. The next site in the file is `https://towmotive.com/`.

The goal was a kit that does not encode one page. The skill text does that. No build was scored, so the goal is not shown on a page.

### Improvement pass 2, 11 November 2026

`https://towmotive.com/` was built on Framer branch silken-delta and scored 15 of 32. The step table runs 19:09 to 19:45. The capture has 124 digests, 15 colours, and 29 text styles. `npm test` passed 29.

The token collector stores the keyword `normal` as `0em`. The digest keeps flex direction, flex wrap, and a block that is narrower than its flex or grid parent. A nowrap row stays at the measured child widths. A text style is applied only when the token matches the run, including colour. The goal was a second site on the same kit. The build exists. 15 of 32 is under 80%.

### Improvement pass 3

`https://yellowhive.com/nl` was built on Framer branch mellow-harbor and scored 25 of 32. The extractor writes a used solid SVG fill into the markup. The digest stores a pseudo-element's left, top, transform, and position. The consent record stores the panel background and its visible text. A null dialog stays off the page. The test run writes `placement-start.md`, and M1 may start from that file. Every commit from this pass was kept. `npm test` passed 29 of 29.

The next site named in the file is Towmotive again. Towmotive's only score is 15 of 32. Neither site has a pass at or above 80%. Unattended improvement 4, on 34 rows, was 19 met.

## 8. Recommendation

These recommendations answer the question that runs through sections 4 to 7: which changes improved the tool, and which did not hold.

Overall direction: keep a change that raises a score on the page under test and does not encode that page. Leave a Framer limit in the report when a substitute was already rejected.

| Rank | Finding | Evidence | Recommendation | Success measure |
| --- | --- | --- | --- | --- |
| Must | Letter-spacing `normal` is stored as `-0.02em` on every scored public build. Sending `0` was already rejected. | Fixture pass 2. Unattended improvement 5. | Record the rejection in the build report. Do not send `0`, `0px`, or `0em`, and do not drop the text styles to clear the field. | The next score still meets font family, weight, and line-height, and M7 stays an explicit miss. |
| Must | The shared card frame cannot hold one alt per instance. `altText: null` was rejected. | Fixture passes 3 and 4. | Leave the shared string, and keep the digest warning. Do not add a code component for this row. | The alt row stays the only open fixture requirement, with the same frame id. |
| Must | Scores fell from 23 of 32 to 21 of 34 and then 19 of 34 while each failed row added a skill sentence. | Unattended improvements 2, 3, and 4. | Add a kit change only when the next build on the other site does not lose a met row. | The next two-site pass is at or above the previous score for that site. |
| Should | Towmotive is 15 of 32. Yellow Hive in the same loop is 25 of 32. The stop rule needs both at or above 80%. | Improvement passes 2 and 3. | Run the next Towmotive pass before another Yellow Hive rule. | Both sites have one pass at or above 80%, or the miss is a recorded Framer limit. |
| Should | A full Yellow Hive page took 59m 12s in test 4 and 2h 18m 42s in unattended improvement 1. M1 was met only when four bands were saved. | Test 4. Metrics pass 3. | Time the place-organisms step from `placement-start.md`, and do not count a four-band page as the full page. | M1 for nine organisms is reported against the 15 minute target. |

### Next iteration

Build Towmotive again on the kit from improvement pass 3. Score it with the same 32 rows. Change the kit only for a miss that also appears on Yellow Hive.

## 9. Conclusion

The fixture loop did what it set out to do. Pass 1 showed no href, no title, no language, no alt, and no repeated cards in the files the builder may read. Pass 2 put those facts back and reached 11 of 13. Pass 3 fixed the card border token and left letter-spacing as a recorded Framer rejection, at 12 of 13. Pass 4 confirmed the remaining miss: one shared `altText` string.

The public-page runs did not follow one rising line. The 5 November build produced components and a template that was not placed on the page. Metrics pass 3 met the 15 minute clock for four bands and left the rest of the page out. Test 4 placed eight components in 59m 12s and failed the clock, the header position, the photo mask, and the slider labels.

The unattended loop then tried one kit change per failed row. The score went from 23 of 32 to 21 of 34 to 19 of 34. Unattended improvement 5 scored 26 of 31, 83.9%, with no new commit, and stopped. The header sits over the hero. Letter-spacing is still `-0.02em`.

The two-site loop removed Yellow Hive names from the skills and then built both sites. Towmotive scored 15 of 32. Yellow Hive scored 25 of 32. The rule that each site reach 80% is not met.

The tests improved the tool where a missing fact could be stored in the capture and read back. They did not improve it where Framer rejects the captured value, or where a new sentence for one page lowered the next score.

## 10. Expert feedback

The author writes this section.

## 11. Reflection

The author writes this section.
