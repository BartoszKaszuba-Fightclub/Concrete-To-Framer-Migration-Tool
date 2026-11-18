# Starting point

Source for the flow: `.cursor/SKILLS/ORCHESTRATION.md` on `lean-pipeline`, with `COLLECTOR.md`, `SECTIONS.md`, and `BUILDER.md` on that same branch. Source for the files: the Yellow Hive capture at `https://yellowhive.com/nl`, width 1200, state `default`. Source for the table: the first lean-pipeline review, pass 1 on 9 November 2026, written up in `docs/pipeline-runs/pass-1-summary.md`.

## How the orchestration runs the other skills

The orchestration skill asks which public URL to collect, which Framer project to use, and whether to create a branch or switch to an existing one, and it waits before any tool that reads a site or opens Framer. Width stays 1200 unless the user names one, and the parent does not capture the page, write the section prompt, or edit Framer. It spawns one subagent per skill, passes the paths in the prompt, and tells each agent to follow its skill file and stop at the end of that skill. The collector runs alone first: capture the page, write `tokens.json` from that capture, then write the digests with `--all`, and return the slug, the capture folder, `tokens.json`, `digests/index.json`, and the screenshot path. That agent must not open Framer, write `sections-prompt.md`, capture a second width, spawn a helper for the token or digest commands, or hand-edit JSON, and `npm test` has to pass or the failing test name has to be reported. After that return, the section agent and builder phase 1 start together: the section agent writes `sections-prompt.md` from `sectionCandidates`, screenshot band edges, and digest text and assets, and must not read `computed.json`, `tokens.json`, or `snapshot.html` or touch Framer, while the builder opens the named project, creates or switches the branch, exports one color style and one text style per token, and stops. The parent waits until the prompt is on disk and phase 1 has stopped, then resumes that same builder with the prompt, the digest index, the token file, and the screenshot, and it must not spawn a second builder or run a stage itself. The builder places one organism per prompt block from the digests, writes `build-report.md`, and does not publish; the parent then reports the project, the branch, the prompt path, the token path, the page, the width, and the scorecard.

## What the capture and the digests hold

Paths below are under `Database/` for slug `nl`, width `1200`, state `default`.

### HTML

`snapshots/nl/1200/default/snapshot.html` is the page HTML after the cookie banner is dismissed: 268,761 bytes, `lang="nl"`, 9 inline `<style>` tags, 4 stylesheet `<link>`s, 20 scripts, and 24 `<img>` tags. The stylesheets are Google Fonts (Inter, Lexend, Raleway), a Concrete cache CSS file, Font Awesome `all.css`, and `yellowhive.css`. Those CSS files are not saved on their own.

`digest/nesting/nl/1200/default/structure.json` is the tree taken from that DOM: 376 nodes. Each node can hold `tag`, `domId`, `classes`, `role`, `selector`, `parentId`, `order`, `children`, `box` (`x`, `y`, `width`, `height`), and `href`. Counts on this capture: 59 anchors with `href`, 91 nodes with text in `content`, 15 nodes with `media` (`kind`, `url`, `alt`), 37 nodes with inline SVG `boundary` and `markup`, plus `untraversedChildren` where an SVG child was not walked. Tags present: `body`, `header`, `nav`, `main`, `footer`, `div` (156), `a` (59), `span` (39), `svg` (37), `li` (26), `p` (16), `img` (14), `ul` (7), `h2` (8), `button` (5), `h3` (3), `h1` (1). The file also stores `url`, `title`, `language`, `slug`, `viewport` (1200×900), `state`, `roots`, and five `sectionCandidates` (`id`, `rootIds`, `memberIds`, `kind`, `status`, evidence boxes). One warning: `section-unassigned` for `n-000184` and `n-000376`.

`components.json` lists 65 controls: `id`, `kind`, `nodeId`, `sectionId`, `label`, `signatureId`, `blocker`.

`digests/` has 70 files plus `index.json` (`id`, `type`, `file`, `rootIds`): 15 `button`, 50 `molecule`, 5 `section`. Those files carry 164 links. A digest node keeps `tag`, `text.exact`, `text.runs`, `labelNodes`, `geometry`, `hierarchy`, `parentId`, `children`, `assetIds`, and `links` (label, destination kind, href, status). `selector`, `classes`, and `domId` stay on the structure node and are not copied into the digest.

### CSS

Resolved style is `computed.json`: the same 376 nodes, with `skipped` and `unresolved` both empty. Per node: `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, `letterSpacing`, `textTransform`, `color`, `backgroundColor`, `backgroundImage`, `opacity`, four padding sides, four margin sides, `rowGap`, `columnGap`, four border widths, styles, and colours, four radii, `boxShadow`, `zIndex`, `transform`, `filter`, `backdropFilter`, `clipPath`, `maskImage`, `overflowX`, `overflowY`. A painting `::before` or `::after` sits on `pseudos` with the same measurements plus `content`, and on this page that includes `letterSpacing: "normal"`.

`structure.json` also stores `render` (`display`, `visibility`, `opacity`, `position`) and traits such as `background`, `border`, `padding`, `margin`, `shadow`, `overflow`, `z-index`, `transform`, `clip`, `opacity`, `::before`, `::after`, and display values (`flex`, `grid`, `inline`, `none`, and the rest). `metadata.breakpoints` lists the media queries found in the stylesheets, including `min-width` 576, 768, 992, 1200, and 1400, `max-width: 900px`, and `prefers-reduced-motion`. They do not add capture widths.

`digest/tokens/nl/1200/tokens.json` is derived from those measurements: 11 `colours`, 25 `textStyles` (family, weight, size, line height, letter spacing, transform, colour style, roles), 48 `spacing` entries, 9 `borders`, 6 `radii`, 2 `shadows`. Digest nodes then point at those tokens from `styles.typography`, `styles.fill`, `styles.border`, `styles.spacing`, and `styles.shadow`, and they also store `layout` and `effects`.

### Screenshots and image files

`Screenshots/nl/1200/default/screenshot.png` is the full-page capture, 2.4MB, taken after the DOM read.

`assets.json` has 18 records: `nodeId`, `originalUrl`, `usablePath`, `naturalWidth`, `naturalHeight`. `assets/` holds 14 files: the logo SVG, `feature-mask.svg`, the hero JPGs, the three 550px home photos, the news thumbnails, and the join-the-hive and werken-bij images. Digest `assets` repeat `originalUrl`, `usablePath`, and the natural size. Fourteen media nodes also store alt text, including `logo-yellow-hive.svg` as "Yellow Hive".

`consent.json` is the leftover cookie control after dismiss: selector `#CookiebotWidget`, box x 10, y 842, 48×48, and the inline SVG logo. It is not a second screenshot.

## Criteria the first lean-pipeline pass missed

Pass 1 ran on branch `lean-pipeline` at width 1200 against `tests/extractor/fixtures/requirements.html`. Capture, tokens, and digests were written. Framer was not opened. Met 0 of 13.

| Criterion | What pass 1 recorded |
| --- | --- |
| Capture content, styles, measurements, screenshots, links, metadata, and assets | Nodes have text, boxes, and computed styles. The screenshot and `assets.json` exist. Anchor nodes have no address. `structure.json` has no title and no language. |
| Preserve H1–H6 independently of visual styling | Digest nodes keep `h1` and `h2`. They share `typography.0007`. The token style for that look has `roles: ["h1", "h2"]` and `framer.tag: "h1"`. |
| Build pages with native, reusable Framer components | No Framer session was opened and no component was created. |
| Map text, typography, colours, and spacing onto components and reusable styles | `tokens.json` has the colours, text styles, and spacing. Nothing applied them to a component. |
| Expose text, images, colours, variants, and interactions as Framer controls | No component exists, and the builder card does not mention property controls. |
| Use custom code only when necessary, and explain why | There is no built page to inspect, and no note that explains a code choice. |
| Keep image alt text and flag a missing alt | Each image record is `{ kind, url }`. The card image without an alt is not flagged. |
| Put images in Framer image fields, not text URLs | Digests store `usablePath` as a string. No Framer image field was set. |
| Turn nested HTML into Framer layers and stacks | Digests have a parent/child hierarchy. No Framer layers were created. |
| Classify repeated elements with Atomic Design | Header, main, and footer are sections. The two `article.card` blocks are not marked as a repeated component. `components.json` has an empty record list. |
| Migrate reliable links and flag uncertain ones | All seven digest links are `destination.status: "unsupported"`. The empty `href` is not separated from the reliable ones. |
| Keep the result editable and leave uncertain choices to a designer | There is no decision list a designer can change. |
| Document classification rules and a repeatable workflow | The four skill cards describe a workflow. They do not state classification rules for atoms, repeated cards, or links. |
