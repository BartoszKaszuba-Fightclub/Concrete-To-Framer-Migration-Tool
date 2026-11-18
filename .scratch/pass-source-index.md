# Pass source index

Index for the agent that documents tests and changes. Each section is one iteration. Open the files in that section. The same label "pass N" is three different loops. Use the section title.

A process file is a run record or a scorecard. A change note is the file that says what that iteration changed. A justification file is a gap analysis, a gap review, or a research note that argues for that change. When the run record also holds the score and the commits, this index says so and does not invent a second file.

Paths are from the repo root.

## Fixture passes

Local page `tests/extractor/fixtures/requirements.html`, width 1200, git branch `lean-pipeline`. No separate run record. The scorecard is the process file. Gap notes written after a score are listed on the pass that wrote them, and the next pass points back.

### Fixture pass 1

Process: `docs/pipeline-runs/pass-1-summary.md`. Run record: none.

On 9 November 2026 this scorecard runs extract, tokens, and digest on the local fixture and does not open Framer. The capture holds 30 nodes, 3 sections, 0 component records, 4 colours, 7 text styles, and 9 spacing tokens. The matrix is 0 met and 13 not met, including missing href, title, and language, one text style that stamps an h2 as h1, and no Framer component. Digest nodes still keep heading text, the real tag, local image paths, and one style per look.

Change note: `docs/pipeline-runs/pass-1-changes.md`. It records the branch as tested: no `reconstruction.json`, no `signatures.json`, no `match.ts`, no capture-time simplify, and no second copy of state and viewport under metadata.

Justification for that change note: `docs/poc-v2/improvements.md` section "Stop writing data nobody reads". That section names `reconstruction.json`, `signatures.json`, `match.ts`, and `apply.ts`.

Written after the score, and used as the justification for fixture pass 2:

- `docs/pipeline-runs/pass-1/gaps/01-capture.md`
- `docs/pipeline-runs/pass-1/gaps/02-headings.md`
- `docs/pipeline-runs/pass-1/gaps/03-framer-components.md`
- `docs/pipeline-runs/pass-1/gaps/04-map-styles.md`
- `docs/pipeline-runs/pass-1/gaps/05-framer-controls.md`
- `docs/pipeline-runs/pass-1/gaps/06-custom-code.md`
- `docs/pipeline-runs/pass-1/gaps/07-alt-text.md`
- `docs/pipeline-runs/pass-1/gaps/08-image-fields.md`
- `docs/pipeline-runs/pass-1/gaps/09-layers.md`
- `docs/pipeline-runs/pass-1/gaps/10-atomic.md`
- `docs/pipeline-runs/pass-1/gaps/11-links.md`
- `docs/pipeline-runs/pass-1/gaps/12-editable.md`
- `docs/pipeline-runs/pass-1/gaps/13-workflow.md`
- `docs/pipeline-runs/pass-1/review.md`

Related briefing, not a second score: `docs/starting point.md`. Its table source is this scorecard.

### Fixture pass 2

Process: `docs/pipeline-runs/pass-2-summary.md`. Run record: none.

On 10 November 2026 the same fixture is captured again and built in Framer project Requirement fixture POC, page Home, desktop 1200. The capture now has the title, language `en`, classified links, warning `alt-missing`, molecule `sig-001`, and h1 and h2 sharing one style while keeping their tags. Framer has Header, Main, Card placed twice, and Footer, with text and image controls and no code file. The matrix is 11 met and 2 not met: letter-spacing stayed `-0.02em`, the card border is raw rgb, and both card images use the alt `Card one image`.

Change note: `docs/pipeline-runs/pass-2-changes.md`. It records href, alt, title, language, classified destinations, and digest token names taken from `tokens.json`.

Justification: the thirteen gap notes and `docs/pipeline-runs/pass-1/review.md` listed under fixture pass 1.

Written after the score, and used as the justification for fixture pass 3:

- `docs/pipeline-runs/pass-2/gaps/04-styles.md`
- `docs/pipeline-runs/pass-2/gaps/07-alt.md`
- `docs/pipeline-runs/pass-2/review.md`

### Fixture pass 3

Process: `docs/pipeline-runs/pass-3-summary.md`. Run record: none.

On 10 November 2026 capture, tokens, and digests run again into `Database/pipeline-runs/pass-3`, and the Framer page is read, not rebuilt. The run reports 30 elements, 3 sections, 2 components, 4 colours, 7 text styles, 9 spacing tokens, 1 border, 1 radius, and 0 shadows. The matrix is 12 met and 1 not met. The unmet row is alt: the digest stores `Card one image` and `alt-missing`, and frame `slVaJcJoN` still says `Card one image` on both instances.

Change note: `docs/pipeline-runs/pass-3-changes.md`. Capture code is unchanged. The card border becomes `var(--token-xhJ1K1cgR)`. Display 32 stays `-0.02em`. Card one image control stores `{ src, alt }`. Card two omits `alt`. The shared frame alt string remains.

Justification: the two gap notes and `docs/pipeline-runs/pass-2/review.md` listed under fixture pass 2.

Written after the score, and used as the justification for fixture pass 4:

- `docs/pipeline-runs/pass-3/gaps/07-alt.md`
- `docs/pipeline-runs/pass-3/review.md`

### Fixture pass 4

Process: `docs/pipeline-runs/pass-4-summary.md`. Run record: none.

On 10 November 2026 capture, tokens, and digests run into `Database/pipeline-runs/pass-4`. The Framer project is read and not rebuilt. Counts match pass 3: 30 elements, 3 sections, 2 components, and the same token totals. The matrix is 12 met and 1 not met, and the unmet row is still the shared frame alt on `slVaJcJoN`.

Change note: `docs/pipeline-runs/pass-4-changes.md`. No capture code changed and no Framer node changed. The only implement step is one build-report sentence that the shared alt stays.

Justification: `docs/pipeline-runs/pass-3/gaps/07-alt.md` and `docs/pipeline-runs/pass-3/review.md`.

No later gap note. The scorecard calls the shared card alt the open item.

## Yellow Hive tests before the unattended loop

These three iterations share Enchanting Whoever. They are not the fixture passes and not unattended improvement 1–5.

### Test pass, 5 November 2026

Process: `docs/poc-v2/test-pass.md`. Scorecard: none. This file is the run record.

One public page, `https://yellowhive.com/nl`, is collected at 1200×900 and built on Framer branch `test 3` (`csad5nwqj`), and nothing is published. The patch under test splits the work into a collector, a section agent, and a builder that creates eight organism components plus one template and does not place that template on a page. Capture writes 376 elements, 4 sections, 16 buttons, 11 colours, 25 text styles, and 20 digests. Command times in the file are capture 21s, token file 25s on the agent clock, and digests 2s.

Change note: none. The patch under test is described in this same file, under "The patch under test".

Research written from this run, not a change note for it: `docs/poc-v2/improvements.md`. Earlier audit of a pipeline walk, verdict hold, 3 November 2026: `docs/poc-v2/pipeline-analysis.md`.

### Metrics pass 3

Process: `docs/pipeline-runs/metrics-pass-3-summary.md`. Run record: none. The summary holds the clock and the matrix.

On 10 November 2026, git branch `metrics-pass-3`, the page is `https://yellowhive.com/nl` at width 1200 on existing Framer branch `test 3` (`csad5nwqj`), new page `/metrics-pass-3`. The prompt is 09:46, capture ends at 09:48:05, and four components are saved before 09:53: Header `TWRugUlDT`, Onze merken `evcK9nAVX`, Over Yellow Hive `AYZYiTxeT`, Footer `Vq_Dh24u0`. The matrix is 10 met and 8 not met: M7, M9, M10, M12, M14, M15, M16, and M18. Letter-spacing stays `-0.02em`, and `0` was not sent.

Change note: `docs/pipeline-runs/metrics-pass-3-changes.md`. No capture code changed. The pass builds on the existing branch. The four section bands are the components it saves. The 66 button digests stay in the capture.

Justification file: none. The assumption sits in the change note.

### Test 4

Process, both files:

- Run record: `docs/pipeline-runs/test-4-agent-log.md`
- Scorecard: `docs/pipeline-runs/test-4-rating.md`

The log is Yellow Hive at width 1200 in Enchanting Whoever, Framer branch `test 4` (`cbe7itpwl`), created from main. Run 1 starts 10:27, the collector writes 70 digests, and phase 1 stops because no branch titled `test 4` exists and no `sections-prompt.md` is written. After the branch is created, run 2 resumes at 10:39:36 and finishes at 11:28:06, with the last component saved at 11:26:16. The rating scores that Home page as 10 correct and 21 room for improvement, and names three visible misses: the header sits under the hero, the Over photos are rectangles, and Previous and Next break apart inside the yellow squares.

Change note: none.

Justification file: none.

## Unattended improvement

Yellow Hive only, git branch `pipeline-improvement`, width 1200, project Enchanting Whoever. Each `unattended-improvement-N.md` file is the run record, the score, and the commit list. There is no separate scorecard and no separate change-note file. `docs/pipeline-runs/improvement.md` is the next loop, not the change note for these five.

### Unattended improvement 1

Process: `docs/pipeline-runs/unattended-improvement-1.md`. Scorecard: none.

On 10 November 2026 the run collects `https://yellowhive.com/nl`, exports styles on new Framer branch airy-halo (`hopal35hm`), places eight organisms after one aborted placement, and records runner wall time 2h 18m 42s with `letterSpacing` stored as `-0.02em`. Failed rows include heading tags, style mapping, lazy hero photos, buttons left inside sections, missing links, missing classification text, a late M1 clock, the Over inset, scroll-to-top inside the footer, and no cookie layer. The same file validates those problems, lists themes and tradeoffs, and records which theme commits were kept or reverted. `npm test` is 29 passed.

Change note: the heading "What each theme commit did, and whether the fresh review kept or reverted it" in that same file.

Justification: the headings "Which problems the criterion agents validated", "Themes, the suggested improvement, and the tradeoff", and "What the senior's reviewer changed" in that same file. The senior drops the letter-spacing theme because `docs/pipeline-runs/pass-2/gaps/04-styles.md` already rejected sending `0`, `0px`, or `0em`.

### Unattended improvement 2

Process: `docs/pipeline-runs/unattended-improvement-2.md`. Scorecard: none.

On 10 November 2026 the run uses new Framer branch silken-ember (`k5bhnj4io`) and leaves airy-halo untouched. Collect takes 1m 26s, the first placement aborts, and the resume writes nine organisms and the cookie dialog. The score is 23 of 32, 71.9%, under 80%. The same file records the failed rows, the validated problems, the theme commits, and `npm test` 29 passed.

Change note: the heading "What each theme commit did, and whether the fresh review kept or reverted it" in that same file.

Justification: the validated-problems, themes, and senior-review headings in that same file.

### Unattended improvement 3

Process: `docs/pipeline-runs/unattended-improvement-3.md`. Scorecard: none.

On 10 November 2026 the collector deletes the previous `nl` / 1200 capture, then writes a new one, and Framer branch linen-beacon (`prsdixb2f`) gets nine organisms. The score is 21 of 34, 61.8%, against 23 of 32 on unattended improvement 2. The same file records failed rows, validated problems, and the senior dropping the heading-tag theme. Kept commits are listed, and `npm test` is 29 passed.

Change note: the heading "What each theme commit did, and whether the fresh review kept or reverted it" in that same file.

Justification: the validated-problems, themes, and senior-review headings in that same file.

### Unattended improvement 4

Process: `docs/pipeline-runs/unattended-improvement-4.md`. Scorecard: none.

On 11 November 2026 Framer branch sunlit-prism (`hqphn3tsl`) is Home at 1200×5255 with nine organisms, scored 19 of 34, 55.9%. Unmet rows include style mapping, alt text, links, M1, M4, M7, M8, M9, M11, M12, M17, M18, and three Other rows. The same file records validated problems, themes, and a fresh review that said revert `b25c383` while the commit stayed. Kept commits run through `2bb2139`, and `npm test` is 29 passed.

Change note: the heading "What each commit did" in that same file.

Justification: the validated-problems, themes, and "What the reviewer changed" headings in that same file. Process audit of missing parent messages, files, and test output: `docs/pipeline-runs/unattended-improvement-4-map.md`.

### Unattended improvement 5

Process: `docs/pipeline-runs/unattended-improvement-5.md`. Scorecard: none.

On 11 November 2026 Framer branch golden-crest (`kiqtpgwhp`) scores 26 of 31, 83.9%, the run stops, and ultra improvement does not run. Home is nine organisms, header over the hero, and the h1 style still stores letter-spacing `-0.02em`. Remaining misses are style mapping and M7, links on the gold-band words, M9 on the news heading, and M17 on the third news title. This pass adds no kit commit and builds with the pass 4 set, including `b25c383`, which stayed after a fresh review said revert.

Change note: the heading "What each commit did" in that same file. It records that this pass added no kit commit.

Justification: the headings "Which criteria failed" and "Validated problems" in that same file. No new gap round.

Related briefing, not a second score: `docs/pass 5.md`. Its table source is this run record.

## Two-site loop

File: `docs/pipeline-runs/improvement.md`. One file, three passes. Append-only. This loop starts after unattended improvement 5. Sites alternate between `https://towmotive.com/` and `https://yellowhive.com/nl`. Stop rule in the file: each site has a pass at or above 80%. No separate scorecard and no gap folder for these three passes. The job card for a later invocation is `docs/pipeline-runs/context.md`.

### Improvement pass 1

Process and change note: `docs/pipeline-runs/improvement.md`, heading "Pass 1". Scorecard: none.

The builder skill reads padding, margin, opacity, fills, and links from the digest of the capture it was given, and the section skill marks a fixed or sticky candidate as an overlay. The review skill's sample rows stay placeholders for the page under review. Ultra improvement must name the stage that dropped a fact and drop a proposal that only draws the current page. This section has no score and no step clock, and the next site in the file is `https://towmotive.com/`.

Justification: the "Before this pass" and "After this pass" paragraphs under "Skills" in that same heading. They say the previous builder skill named frames, labels, and hero nodes from one Yellow Hive page.

### Improvement pass 2

Process and change note: `docs/pipeline-runs/improvement.md`, heading "Pass 2". Scorecard: none.

`https://towmotive.com/` is built in Enchanting Whoever on Framer branch silken-delta and scored 15 of 32. The step table runs 19:09–19:45 on 11 November 2026: 124 digests, 15 colours, 29 text styles. The token collector stores the keyword `normal` as `0em`, and the digest keeps flex direction, flex wrap, and a block narrower than its flex or grid parent. Next site in the file: `https://yellowhive.com/nl`.

Justification: the "What changed" and "Skills" paragraphs under that same heading.

### Improvement pass 3

Process and change note: `docs/pipeline-runs/improvement.md`, heading "Pass 3". Scorecard: none.

`https://yellowhive.com/nl` is built on Framer branch mellow-harbor and scored 25 of 32. The extractor writes a used solid SVG fill into the markup, the digest stores a pseudo's left, top, transform, and position, and the consent record stores the panel background and its visible text. The test run writes `placement-start.md`, and M1 may start from that file. The heading lists the kept commits, says `npm test` passed 29 of 29, and names the next site `https://towmotive.com/`.

Justification: the "What changed" and "Skills" paragraphs under that same heading.

## Research not tied to one pass

These files do not score a pass and do not record that pass's commits. Read them when the write-up needs a field or component decision that no section above claims.

- `docs/research/drop-node-pseudos.md` — keep or drop node identity fields and pseudo copies.
- `docs/research/drop-section-components.md` — keep or drop section-candidate and component fields.
- `docs/research/card-button-hero.md` — what card, button, and hero are in this repo, and which parts the builder can read.
- `docs/research/card-digest-structure-experiment.md` — experiment setup. No site URLs and no runs.
