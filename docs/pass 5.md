# Pass 5

Source for the flow: `.cursor/SKILLS/unattended-pipeline-improvement/SKILL.md`, `.cursor/SKILLS/pipeline-test-run/SKILL.md`, and `.cursor/SKILLS/ORCHESTRATION.md`. Source for the files: the Yellow Hive capture at `https://yellowhive.com/nl`, width 1200, state `default`, written 11 November 2026 at 02:43. Source for the table: `docs/pipeline-runs/unattended-improvement-5.md`. Framer branch golden-crest (`kiqtpgwhp`). Git branch `pipeline-improvement`.

## How the run tells the agents to work

The unattended skill asks which website to migrate, which Framer project to build in, and which criteria file to score, then waits, and it keeps commits on `pipeline-improvement` and never merges. The test observer follows the pipeline-test-run skill: it records the clock, dispatches each subagent the runner requests, and must not capture, digest, or edit Framer itself. The runner follows `ORCHESTRATION.md` from Spawn through Report, with the answers already filled in: `https://yellowhive.com/nl`, Enchanting Whoever, a clean Framer branch taken from that project's main, and width 1200. It spawns only by returning a SPAWN block, starts the collector alone, and waits until that agent returns the slug, the capture folder, `tokens.json`, `digests/index.json`, and the screenshot path. It then starts the section agent and builder phase 1 together: the section agent writes `sections-prompt.md` and must not open Framer, and the builder exports one color style and one text style per token and stops. The observer resumes that same builder for placement, must not spawn a second builder, and the builder writes `build-report.md` and does not publish. The review then scores every Must row, every Should row, and M1 through M18 in `.cursor/SKILLS/pipeline-review/criteria.md`, and the percentage is met rows divided by scored rows. At 80% or higher the run note ends with `Next: stop` and ultra improvement does not run; under 80% the same website, project, and criteria file run again.

## What the capture and the digests hold

Paths below are under `Database/` for slug `nl`, width `1200`, state `default`. The pass 5 note times this capture at 2026-11-11T02:43:43+0100, with the digest index fourteen seconds later. `npm test` after it: 29 passed. 70 digests, 11 colours, 25 text styles.

### HTML

`snapshots/nl/1200/default/snapshot.html` is the page HTML after the cookie banner is dismissed: 268,761 bytes, `lang="nl"`, 9 inline `<style>` tags, 4 stylesheet `<link>`s, 20 scripts, and 24 `<img>` tags. The stylesheets are Google Fonts (Inter, Lexend, Raleway), a Concrete cache CSS file, Font Awesome `all.css`, and `yellowhive.css`. Those CSS files are not saved on their own. The builder does not open this snapshot.

`digest/nesting/nl/1200/default/structure.json` is the tree taken from that DOM: 376 nodes. Each node can hold `tag`, `domId`, `classes`, `role`, `selector`, `parentId`, `order`, `children`, `box` (`x`, `y`, `width`, `height`), and `href`. Counts on this capture: 59 anchors with `href`, 91 nodes with text in `content`, 15 nodes with `media` (`kind`, `url`, `alt`), 37 nodes with inline SVG `boundary` and `markup`, plus `untraversedChildren` where an SVG child was not walked. Tags present: `body`, `header`, `nav`, `main`, `footer`, `div` (156), `a` (59), `span` (39), `svg` (37), `li` (26), `p` (16), `img` (14), `ul` (7), `h2` (8), `button` (5), `h3` (3), `h1` (1). The file also stores `url`, `title`, `language`, `slug`, `viewport` (1200×900), `state` `default`, `roots` (`n-000001`), and five `sectionCandidates`. One warning: `section-unassigned` for `n-000184` and `n-000376`.

`components.json` lists 65 controls: `id`, `kind`, `nodeId`, `sectionId`, `label`, `signatureId`, `blocker`.

`digests/` has 70 files plus `index.json` (`id`, `type`, `file`, `rootIds`): 15 `button`, 50 `molecule`, 5 `section`. Those files carry 164 links. A digest node keeps `tag`, `text.exact`, `text.runs`, `labelNodes`, `geometry`, `hierarchy`, `parentId`, `children`, `assetIds`, and `links` (label, destination kind, href, status). `selector`, `classes`, and `domId` stay on the structure node and are not copied into the digest.

### CSS

Resolved style is `computed.json`: the same 376 nodes, with `skipped` and `unresolved` both empty. Per node: `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, `letterSpacing`, `textTransform`, `color`, `backgroundColor`, `backgroundImage`, `opacity`, four padding sides, four margin sides, `rowGap`, `columnGap`, four border widths, styles, and colours, four radii, `boxShadow`, `zIndex`, `transform`, `filter`, `backdropFilter`, `clipPath`, `maskImage`, `overflowX`, `overflowY`. A painting `::before` or `::after` sits on `pseudos` with the same measurements plus `content`, and on this page that includes `letterSpacing: "normal"`.

`structure.json` also stores `render` (`display`, `visibility`, `opacity`, `position`) and traits such as `background`, `border`, `padding`, `margin`, `shadow`, `overflow`, `z-index`, `transform`, `clip`, `opacity`, `::before`, `::after`, and display values (`flex`, `grid`, `inline`, `none`, and the rest). `metadata.breakpoints` lists the media queries found in the stylesheets, including `min-width` 576, 768, 992, 1200, and 1400, `max-width: 900px`, and `prefers-reduced-motion`. They do not add capture widths.

`digest/tokens/nl/1200/tokens.json` is derived from those measurements: 11 `colours`, 25 `textStyles` (family, weight, size, line height, letter spacing, transform, colour style, roles), 48 `spacing` entries, 9 `borders`, 6 `radii`, 2 `shadows`. Digest nodes then point at those tokens from `styles.typography`, `styles.fill`, `styles.border`, `styles.spacing`, and `styles.shadow`, and they also store `layout` and `effects`. Text styles in this file still carry letter-spacing `normal`. Framer stored `-0.02em`.

### Screenshots and image files

`Screenshots/nl/1200/default/screenshot.png` is the full-page capture, 2.4MB, taken after the DOM read.

`assets.json` has 18 records: `nodeId`, `originalUrl`, `usablePath`, `naturalWidth`, `naturalHeight`. `assets/` holds 14 files: the logo SVG, `feature-mask.svg`, the hero JPGs, the three 550px home photos, the news thumbnails, and the join-the-hive and werken-bij images. Digest `assets` repeat `originalUrl`, `usablePath`, and the natural size. Fourteen media nodes also store alt text, including `logo-yellow-hive.svg` as "Yellow Hive".

`consent.json` is the leftover cookie control after dismiss: selector `#CookiebotWidget`, box x 10, y 842, 48×48, and the inline SVG logo. Home on golden-crest places that control at x 10, y 842.

## What golden-crest built

Home is Desktop `WQLkyLRf1`, 1200×5255. Nine organisms. Header over the hero. `first-component.md` names `Onze merken TTebqO_p7`, written at 2026-11-11T03:13:42+0100. `build-report.md` was written at 2026-11-11T03:39:24+0100. Scorecard: type gap, colour pass, spacing gap, images pass. Custom code: none. Not published.

Contact frame `SPsk6zwQZ` is padding 10px 25px, radius 6px, fill `color/rgba-249-176-15-1`. Label `XN8ZwDRgw` uses `text/link/lexend-18px-700-30px-normal-none` at 18px. The h1 style `k04zwLMx3` stores letter-spacing `-0.02em`.

## Criteria pass 5 missed

The review scored 26 of 31, 83.9%. No Other row was written. Ultra improvement did not run. The note ends with `Next: stop`.

| Criterion | What the review recorded |
| --- | --- |
| Map text, typography, colours and spacing to the correct components and reusable styles | Live letter-spacing is `normal`. All 25 text styles store `-0.02em`. Framer rejects the keyword. `0`, `0px`, and `0em` were not sent. The h1 style `k04zwLMx3` is one of those. |
| M7 — Letter-spacing | Same measurement as the style-mapping row. Every text style is `-0.02em` against live `normal`. |
| Migrate internal, external, anchor, email and phone links when destinations are reliable | The gold-band words You Sure, Felixx werk & inkomen, Yinco, and merken are underlined on the live page. Paragraph `ys5Rej8sy` has no link ranges. The hrefs sit on string variables. Alle merken has an empty href, so that label has no link. |
| M9 — Margin | The live news heading has margin `0px 180px 40px`. Framer `GgfRoOGmd` and `kIRhbrkJW` are `1fr` inside a frame with padding `0px 15px`, so the heading sits on the left. The news instance `bHbix25m4` is 1027px tall. The footer instance `oeN_wM0gk` is y 4428, height 870. Negative margins (`-15px` and the news row) were not written. |
| M17 — Text wrapping | The live third news title is five lines and 180px tall. The Framer title is four lines. The review tied that early wrap to the stored tracking of `-0.02em`. |

Rows this pass met that pass 4 had missed: alt text, M1, M4, M8, M11, M12, M18. The phone icon, the email icon, the LinkedIn mark, and the corner radius did not come back as Other rows.
