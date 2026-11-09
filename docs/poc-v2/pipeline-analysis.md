# Pipeline analysis

Generated 2026-11-03 12:06 +01:00. Reviewed 2026-11-03 13:17 +01:00 by a separate reviewer. Verdict: **hold**. No disputes.

## Review

The reviewer agreed with these checks:

- `tokens.json` has 11 colours, 25 text styles, 48 spacing values, 9 borders, 6 radii, and 2 shadows.
- `components.json` has 16 button records and no section records. Those buttons use `clip-01`, `clip-02`, `clip-03`, and `clip-04`.
- `clip-05.json` through `clip-08.json` sit beside the 20 schema 2.0.0 digests (`clip-01` through `clip-04` and `cmp-001` through `cmp-016`). The folder has 24 JSON files. The four older files have no `schemaVersion`.
- `8bffdcd` is 2026-11-02 16:55:52 +0100, “Dismiss the cookie banner before any page CSS is read.” `1e71a97` is 2026-11-02 16:54:38 +0100, “Collect measured page tokens into one rebuild file.”

Extra advice from the review: filter the digest folder on schema 2.0.0, or remove `clip-05.json` through `clip-08.json` before the next run. Those four files are from 23 October 11:35 and use the old `clipId` / `fullTree` shape. Counting every JSON file in the folder gives 24 instead of 20.

## One pipeline walk

The fairest single walk is agent `7179c251-dcdf-4db8-8c17-4109b3c715b7`.

| | |
| --- | --- |
| Started | 2026-11-02 16:56 +01:00 |
| Finished | 2026-11-02 17:04:19 +01:00 |
| Wall clock | 8.3 minutes, bounded |
| Timing | 7 min 20 s to 8 min 19 s (7.3–8.3 minutes) |

The start line has no seconds, so 16:56:00 is the upper bound. The clock starts at that user message, the line before the first tool call. The last record has no timestamp; the transcript file time is the last write. This agent was told to walk tests, capture, digests, tokens, and the page. It did not build the pipeline. Do not add the canvas run or the October build to this number.

On branch `POC-version-2-test-1`, HEAD stayed `8bffdcd`. It ran the three test commands, captured `https://yellowhive.com/nl` at 1200×900, wrote 20 schema 2.0.0 digests, and wrote `tokens.json`. It did not create Framer styles or a page, and it made no commit.

`framer-api` with `FRAMER_TOKEN` against Enchanting Whoever returned UNAUTHORIZED before `getProjectInfo`. Tool results are not stored in the transcript, so that error string was not re-read from a tool result. Session 1 was not available during the run: `.cursor/framer-session.json` was written at 2026-11-02 17:04:26, seven seconds after this transcript.

## Other runs

Do not add these clocks together.

| Agent | Role | Start | Finish | Minutes |
| --- | --- | --- | --- | --- |
| `7202decc-45f6-4515-b84a-a099f77bc2bf` | 28 October metrics research, parallel with extractor and digest | 2026-10-28 16:21 | 16:30:39 | 9.7 |
| `53f5cfbf-f183-4832-9add-90ebf1f83f2c` | 28 October one-width extractor, parallel | 2026-10-28 16:21 | 16:41:50 | 20.8 |
| `cd60ab8e-bb70-4a13-8f72-3b4d3e857c78` | 28 October schema 2.0.0 digest, parallel | 2026-10-28 16:21 | 16:45:51 | 24.9 |
| `f446fa3c-15fa-4224-9f21-2882c29c3f52` | 2 November token collector, which also captured the page | 2026-11-02 16:41 | 16:55:05 | 14.1 |
| `40ebac65-5b7e-44dd-bdab-9e9954384e11` | 3 November Framer canvas only, CLI session 1 | 2026-11-03 09:48 | 10:23:21 | 35.4 |

The 28 October starts have no seconds. Spans to the transcript times are 8.7–9.7, 19.9–20.8, and 23.9–24.9 minutes. Commits are `1ea2e8a` at 16:30:21, `6bbfe67` at 16:41:29, and `ae9e8cf` at 16:45:35. The parent integration commit `b2a4ecd` at 16:47:42 is not part of the digest agent’s clock.

The token agent’s span is 13.1–14.1 minutes. Commit `1e71a97` is 16:54:38. That run built the collector and changed the skill, then ran `extract:generic`. It is not a walk of an already-built pipeline. Framer was blocked because the `.env` token opens Spinning Messages.

The canvas span is 34.4–35.4 minutes. It was told not to use `framer-api` or `FRAMER_TOKEN` and to use session 1. It created styles and the `/nl` page in one transcript. A parent note that it had stopped before the page was written while this transcript was still open. Do not add these 35.4 minutes to the 8.3 minute test run.

## Oddities

**Three agents built the pipeline in parallel on 28 October, so no single agent walked it.** `7202decc`, `53f5cfbf`, and `cd60ab8e` each start at 16:21 that day. Transcript times are 16:30:39, 16:41:50, and 16:45:51.

**The token agent captured the site, then the test agent captured it again.** The token agent ran `npm run extract:generic -- https://yellowhive.com/nl --widths 1200 --height 900` and reported 376 elements, 4 sections, 16 components, and the same token counts. That transcript closed at 16:55:05. The test agent ran the same command. `structure.json`, `computed.json`, `components.json`, and the 1200 screenshot are dated 16:56:42. `tokens.json` is dated 16:57:06.

**The test agent was blocked on the API key, while a CLI session for Enchanting Whoever was opened only as that run ended.** The token agent’s key opens Spinning Messages. The parent asked for a Framer session at 17:03. `.cursor/framer-session.json` was written at 17:04:26, session 1, Enchanting Whoever. The test transcript closed at 17:04:19.

**The canvas agent started the next morning on a different session.** Its prompt says not to use the API key and gives session id 1. The gap from 17:04:19 to 09:48 is 16 hours 43 minutes 41 seconds if 09:48 is exactly 09:48:00, and up to 59 seconds longer because the start time has no seconds.

**The skill says not to assemble a page. The user asked for the Dutch page anyway.** `.cursor/SKILLS/ORCHESTRATION.md` says “Do not assemble a page. Component creation stays outside this pipeline.” At 16:54 on 2 November the user asked an agent to remake `https://yellowhive.com/nl`. The canvas agent then placed the page.

**The parent and the token agent both edited the orchestration skill in the same window.** The parent wrote the skill between the 16:50 and 16:54 messages. The token agent also edited it and committed that change as `1e71a97` at 16:54:38. The cookie-banner order is a separate commit, `8bffdcd` at 16:55:52, and that commit does not touch the skill. The token-completion notice arrived at 16:56, the same minute the test agent started.

**The test agent’s completion was delivered three times.** The same follow-up arrived at 17:06 on 2 November, at 03:43 on 3 November, and at 09:47 on 3 November. The first two were not followed up. The summary and the start of the canvas agent came after the 09:47 message. The test transcript had already closed at 17:04:19 the previous afternoon.

## How to make the next run faster

**One process should run capture, digests, tokens, and Framer in order.** Do not start a second agent for the canvas. The test transcript closed at 17:04:19. The canvas agent was not asked to start until 09:48 the next day. The parent received the same completion notice at 17:06 and at 03:43 and wrote no follow-up there. That removes the silent gap of 16 hours 43 minutes 41 seconds, plus up to 59 seconds. The Framer step itself then took 34.4 to 35.4 minutes. Do not add that to the 8.3 minutes of the test agent and call the sum one measured run.

**Hand over session id 1 before any Framer call, and use that CLI session.** Do not call `framer-api` with `FRAMER_TOKEN`. The test agent ended on UNAUTHORIZED for Enchanting Whoever. The token agent reached Spinning Messages with the same kind of key. The session file was written seven seconds after the test transcript closed. How many of the 7.3 to 8.3 minutes were spent on that failure is unknown: the transcript has no time per tool.

**Reuse the 1200 capture already on disk.** Do not run `extract:generic` a second time. The token agent had just captured the same page. The files now on disk are dated 16:56:42, after that transcript closed at 16:55:05. One Playwright pass would be skipped. How long that pass takes is unknown.

**Write all component digests in one call**, instead of `scripts/digest/cli.ts` once per component. The skill shows one call per component. The test agent started the CLI twenty times in one shell and wrote `cmp-016` once more. `clip-01` through `cmp-015` are dated 16:56:59 to 16:57:01. `cmp-016` is dated 16:57:18. The whole write span is 19 seconds. One call saves at most that span. The startup cost inside that window is unknown.

**Do not read the Framer skill map again.** The canvas agent was required to read the whole map before any canvas edit. It read `SKILL.md` and `index.md` once, and `how-projects-work.md` in two parts. The time inside the 34.4 to 35.4 minutes is unknown.

## Accuracy

### Tests

Reported: extractor 9 pass, digest 8 pass, design-tokens 1 pass. Rechecked on `8bffdcd`: 18 tests, 18 pass, 0 fail. `tests/digest` has 8 `test()` calls and `tests/design-tokens` has 1. `tests/extractor` has 8 `test()` calls. `tests/extractor/helpers.ts` has no `test()` and the runner still counted that file as a pass, which is the ninth extractor result.

### Capture

Rechecked from files. Viewport 1200×900, state `default`, URL `https://yellowhive.com/nl`. 376 nodes, 16 buttons, 0 fields, 0 blockers.

| Section | Kind | Root |
| --- | --- | --- |
| clip-01 | header | n-000003 |
| clip-02 | hero | n-000091 |
| clip-03 | main | n-000185 |
| clip-04 | footer | n-000291 |

`structure.json`, `computed.json`, `components.json`, `reconstruction.json`, `signatures.json`, `screenshot.png`, and `snapshot.html` are dated 2026-11-02 16:56:42 +0100. `structure.json` lists 6 excluded nodes with reason `consent-ui`. The run wrote files, so a covering overlay did not fail it.

Widths 390, 640, 768, 992, 1500, and 1650 under `Database/digest/nesting/nl` and `Database/Screenshots/nl` are dated 2026-10-23 11:32. They are not part of this one-width run. At 1200, `elements.json`, `report.json`, and `sections-preview.png` are also dated 2026-10-23 11:32:35 and were not rewritten.

### Digests

20 schema 2.0.0 files, 0 validation failures. `validateDigest` was run again on the 20 files dated 2 November. `clip-05.json` through `clip-08.json` are dated 2026-10-23 11:35:40, have no `schemaVersion`, and use the older shape. The directory has 24 JSON files. Write span: `clip-01` through `cmp-015` from 16:56:59 to 16:57:01, `cmp-016` at 16:57:18.

### Tokens

`Database/digest/tokens/nl/1200/tokens.json`, dated 2026-11-02 16:57:06. Schema 1.0.0, language `nl`. Counts match the report: 11, 25, 48, 9, 6, 2. All 25 text styles store letter-spacing `normal`. `validateTokens` passed on this file during the analysis.

### Framer page

Reported, not rechecked. Framer was not opened for this analysis. The claims come from the last message of `40ebac65`.

- Page: https://framer.com/projects/Enchanting-Whoever--B64kxxljgwceYGrBUPBt-g99uS?branch=yyuoavzjl&node=augiA20Il
- Branch: Yellow Hive Dutch page
- Route: `/nl`
- Styles: 11 colour styles and 25 Lexend text styles
- Placed: header, the visible hero slide, main, and footer
- Not published

`Database/digest/media` contains `logo-yellow-hive.svg`, `hero-onze-merken.jpg`, `home-01.jpg`, `home-02.jpg`, `home-03.jpg`, `join-the-hive.jpg`, and `news-bhb.jpg`, listed in `asset-map.json` (dated 2026-10-28 16:16:06). Those names match the uploads the canvas agent named. Whether they were uploaded was not rechecked.

### Gaps

| Gap | On disk | On the canvas |
| --- | --- | --- |
| Three photos missing | Verified absent: `img_540x350_werken-bij-yellow-hive.jpg`, `header_26_06_Persbericht.jpg`, `nws_thumb_Mena_Magazine.jpg`. Named in the 1200 snapshot, `structure.json`, and `clip-03.json`. Not in `Database/digest/media`. | Grey frames reported, not rechecked. |
| `feature-mask.svg` not applied | File exists, dated 2026-10-23 11:49:21, referenced from the 1200 structure, computed styles, and `clip-03`. | Reported not applied, not rechecked. |
| Small SVGs, hidden hero slides, link destinations, ellipsis and quotes | `computed.json` has opacity 0 on hero members `n-000116`, `n-000127`, `n-000135`, `n-000146`, `n-000154`, `n-000164`. Scroll-to-top wrapper `n-000372` has opacity 0 and visibility hidden. Button `n-000373` has opacity 1. | Placement, missing SVG drawing, missing links, and the quote and ellipsis rewrite were not rechecked. |
| Letter-spacing stored as `-0.04em` | All 25 text styles say `normal`. | Reported that Framer rejected `normal` and kept `-0.04em`. `0` was not sent. Not rechecked. |
| Button padding `25.008px` stored as `25px` | `cmp-002.json` records left and right padding as `25.008px`. The same value is in other 2 November button digests. | Stored `25px` not rechecked. |
| Not a pixel match, and not published | Not comparable from these files. | The canvas agent said a canvas screenshot was reviewed and not compared with the source screenshot, and that nothing was published. |

## Sources

- `.cursor/SKILLS/ORCHESTRATION.md`
- `.cursor/framer-session.json`
- `Database/digest/nesting/nl/1200/default/structure.json`
- `Database/digest/nesting/nl/1200/default/computed.json`
- `Database/digest/nesting/nl/1200/default/components.json`
- `Database/digest/nesting/nl/1200/default/digests/`
- `Database/digest/tokens/nl/1200/tokens.json`
- `Database/digest/media/`
- `Database/Screenshots/nl/`
- `Database/snapshots/nl/1200/default/snapshot.html`
- Git log on `POC-version-2-test-1`: `8bffdcd`, `1e71a97`, `ae9e8cf`, `6bbfe67`, `1ea2e8a`
- Agent transcripts for this chat and the six subagents named above
