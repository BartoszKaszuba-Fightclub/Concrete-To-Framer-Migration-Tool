# Changelog

This is what changed between the first proof of concept on `main` and `POC-version-2-test-2`.

The first proof of concept could screenshot a page and scrape a hero. This version captures one public page at one width, writes the measurements a rebuild needs, and splits the later work into three written instructions: collect the page, name the sections, and build those sections in Framer.

## What a run does now

1. Open one public page at 1200×900, unless a single different width is requested. Extra widths are ignored.
2. Dismiss the cookie banner before any CSS or elements are read. If the banner stays, that part of the page is left out. If a covering overlay cannot be dismissed, the run writes nothing.
3. Wait until fonts and images settle, then save the element tree, computed styles, a simplified tree, the button and field list, style groups, a full-page screenshot, the HTML snapshot, and the downloaded images.
4. Write `tokens.json`: the colours, text styles, spacing, borders, radii, and shadows measured on that page. Equal values are stored once.
5. Write one digest per button, field, and section. A digest is the packet for that piece: visible text, layout, colours, type, spacing, and image references. Schema version is 2.0.0.
6. In Framer, create the colour and text styles, then place the page sections on one page at the captured width. The site is not published.

Buttons and fields are grouped by colour, border, and typography. The label is not part of the group. Hover, focus, and open menus are not captured. Only the page as it first appears is captured.

## What was removed from the active path

The first pipeline asked a person to approve widths and section clips, wrote coverage reports, and tried to match the same element across several widths. That approval flow is no longer part of a normal run. The active capture does not write `elements.json`, `report.json`, cross-width match files, or the section-overlay image. Those older files are left in place if they already exist. They are not regenerated.

## How the work is divided

The old single instruction file is now four files in `.cursor/SKILLS/`:

| File | Who it is for | What they do |
| --- | --- | --- |
| `ORCHESTRATION.md` | The coordinator | Ask which site, which Framer project, and whether to create a branch or use an existing one. Then hand the work on. |
| `COLLECTOR.md` | Collection | Capture the page, write the token file, then write the digests. Do not open Framer. |
| `SECTIONS.md` | Sections | Name the sections and the page layout, with pixel bounds from the top and left of the screenshot. Write `sections-prompt.md`. Do not open Framer. |
| `BUILDER.md` | Framer | Create colour and text styles, wait for the section prompt, read the screenshot and the HTML snapshot, build each section, and place those sections on one page. |

Framer is reached through the Framer connection in `.cursor/mcp.json` (`https://mcp.framer.com/mcp`), next to the Playwright connection. The builder does not use the Framer API token or `scripts/design-tokens/apply.ts`.

A section here means a distinct block of the page, such as a header, a hero, a card group, or a footer. The page layout is the order of those blocks. The builder places the blocks on a Framer page. It does not save that layout as another component in the asset library.

## Images

Capture now downloads each image into `assets/` beside the capture and writes `assets.json` with the local path, the original URL, and the image’s natural size. Digests copy that local path into `usablePath` when `assets.json` is present. A download that fails is recorded. The remote URL is still kept.

## Tests and notes

Extractor tests cover width selection, the cookie banner, sections, style groups, simplification, and image download. Digest tests cover schema 2.0.0. A token test checks that equal values are not stored twice.

`docs/poc-v2/` holds the implementation spec, the digest contract, a real button example, the field study of the Dutch capture, a note on files the extractor stopped writing, an analysis of an earlier timed run, and the 5 November trial write-up.

## Trial on 5 November 2026

The split instructions were run on `https://yellowhive.com/nl` at 1200×900, in the Framer project Enchanting Whoever, on a new branch named `test 3`. The longer account is `docs/poc-v2/test-pass.md`.

The run saved 376 elements, 4 sections, 16 buttons, 11 colours, 25 text styles, and 20 digests. In Framer it created those 11 colour styles and 25 text styles, eight section components, and one layout component. Nothing was published.

That trial also showed the gaps below. The instructions were updated afterwards. Framer was not rebuilt with the updated rules.

- The first connection to Framer failed, so the branch was created only on a second attempt.
- The page layout was saved as a component and was not placed on a page. The builder is now told to place the sections on one page and not to save a layout component.
- Styles and components were not filed into folders. The builder is now told to create Design tokens, Organisms, and Templates folders. Templates stays unused because the layout is the page itself.
- Images had no local file. Capture now downloads them.
- Inline icons, slider dots, a decorative shape, and the footer divider were skipped. The builder is now told to draw them from the digest.
- Some type and spacing used a larger style than the measured text. The builder is now told to use the measurement on that node.
- Letter spacing stayed at `-0.02em` in Framer. The token file still stores the measured keyword `normal`.
