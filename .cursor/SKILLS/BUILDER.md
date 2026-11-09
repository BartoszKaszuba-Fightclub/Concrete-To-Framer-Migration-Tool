---
name: build-in-framer
description: Exports Framer color and text styles from the token file, then, after the section prompt exists, reads the full-page screenshot and snapshot and builds organism components onto one page at the captured width. Use when a capture and a token file already exist. Does not open the source website.
---

# Build in Framer

## Job

Build only from files in this repo. Do not open the source website. Do not recapture. Do not read `structure.json` or `computed.json` to invent layout, copy, or colour.

Read these inputs:

- `Database/digest/tokens/<slug>/<width>/tokens.json`
- `Database/digest/nesting/<slug>/<width>/default/digests/*.json` (schema 2.0.0 only)
- `Database/digest/nesting/<slug>/<width>/default/sections-prompt.md` after the parent says it is written
- `Database/Screenshots/<slug>/<width>/default/screenshot.png` — the full-page screenshot
- `Database/snapshots/<slug>/<width>/default/snapshot.html` — the Playwright snapshot of the whole page
- `docs/poc-v2/digest-contract.md` when a digest field is unclear

The parent tells you which Framer project to open and whether to create a new branch or use an existing branch (and that branch’s name). Use that answer. If the parent did not pass a project, stop and ask. Do not pick a project yourself. Do not look for a project named in this skill.

Framer work uses the Framer MCP server (`framer` in `.cursor/mcp.json`, url `https://mcp.framer.com/mcp`). Read each tool schema before calling it. If the server needs authentication, authenticate and continue. If the tools are still absent, stop and say so.

Do not use the `@framer/agent` CLI, a CLI session file, `framer-api`, `FRAMER_TOKEN`, or `scripts/design-tokens/apply.ts`.

Do not publish. Do not change routes.

## Order

The parent starts you while the section agent is still writing. Do the token export, then stop. Continue only when the parent says `sections-prompt.md` is written.

### Phase 1 — design tokens, then stop

1. Open the Framer project the parent named. If the parent asked for a new branch, create it from the current main branch of that project and switch to it. If the parent named an existing branch, switch to that branch. Confirm the project name and the branch name before any write.
2. Create three Assets folders before any style or component: Templates, Organisms, and Design tokens. Reuse a folder that already has that name. Export the design tokens from `tokens.json` into Design tokens.
   - Create one color style per `colours` entry, using `framer.name` and `framer.light`.
   - Create one text style per `textStyles` entry. Use `framer.tag`, `fontSize`, `lineHeight`, `transform`, and the color style named by `colorStyle`. Request `framer.fontFamily` at `framer.fontWeight`. Pass `letterSpacing` only when the file gives a length. When the file says `normal`, keep that keyword and do not send `0`.
   - Create a heading tag only when that entry’s `roles` include it.
   - Keep spacing, borders, radii, and shadows as values you apply later from the token file. They are not Framer color or text styles.
   - If a font family and weight are missing in the project, skip that text style and add it to the report. Do not substitute a font.
3. Stop. Do not read the screenshot or the snapshot yet. Do not build components. Tell the parent that the token export is done and that you are waiting for the section prompt.

### Phase 2 — look, then build

Start this phase only after the parent confirms `sections-prompt.md` exists.

4. Before any component, read the full-page screenshot and the Playwright snapshot:
   - `Database/Screenshots/<slug>/<width>/default/screenshot.png`
   - `Database/snapshots/<slug>/<width>/default/snapshot.html`
   Read both for the whole page. Use them to see the headings, cards, logos, and images, and where those parts sit. Do not open the live site.
5. Create one organism component per organism in `sections-prompt.md`, in the Organisms folder. Compose it from the schema 2.0.0 digests listed for that organism, using that digest’s hierarchy, visible text, and token ids. Include the headings, cards, logos, and images. Do not build from buttons and fields alone when those parts are on the page. Follow the build rules below.
6. Place those organism components, in the prompt’s order, on one Framer page at the captured width. Do not create a template component in Assets.
7. Set that page’s breakpoint to `tokens.json` `source.viewport.width` and `source.viewport.height`. Do not add a second breakpoint. Do not publish.

## Build rules

Place every layer with auto layout, using the digest’s gaps, padding, and alignment. Read the section prompt’s bounds as the component’s width, height, and stacking order. Use absolute positioning only for a layer auto layout cannot place, such as an overlay on a slide or a decorative shape that sits across a section.

Place every digest asset whose `usablePath` is a local file, and draw every inline SVG stored on `boundary.markup`, including an SVG whose text is empty. A missing download is one line in the build report. Do not hotlink a URL the digest does not list.

Apply the font size, weight, and line height measured on that node, including a column title whose tag is `p`. Do not apply a larger heading style from elsewhere on the page. The gap above a button is that wrapper’s captured margin-top. Do not add the heading’s margin-bottom again, and do not substitute a larger spacing token. Colour still uses the Framer color style named by the token file. Spacing, border, radius, and shadow use the matching token entries. If a token or style is missing, skip that property, report the name, and do not invent a style.

In a header, start the link row at the logo’s right edge in the digest, not at a label’s text x. Size each header control and the bar from those nodes’ captured boxes.

In a slider, leave out a visually hidden label (a 1×1 box, hidden overflow, or a screen-reader-only label) and keep the visible icon. Place the dot row at the box the digest gives it, even when the section prompt does not name the dots. Place each slide’s title and text at that slide’s own captured box, and keep the captured text colour when a background image is missing.

Place a painting `::before` or `::after` that has a background image, a fill, or forms a divider, even when its content is empty. Take its size, offset, opacity, and colour from that pseudo, and use the local asset path when it has a background image. A decorative overlay that crosses a section is the absolute-position case: keep it behind the content, with overflow visible so it is not clipped to one organism.

For a repeated card group, center the heading and intro when equal side margins center their boxes, and do not stretch those boxes to the column. Use each card’s and each card image’s captured radius, and paint a label chip when that label has a captured fill and radius. Give every card the captured height so a longer title cannot move its button off the shared line, and keep the captured gap before the following button.

When a paragraph lists its own strings and then the link labels, do not join `text.exact` and do not float the anchors on top. Place each label in the sentence in source order as an inline underlined link. If the heading and paragraph boxes are centered in the column, center them. Do not invent a destination when the digest says it is unsupported.

In a footer, keep phone and email icons with those links, under the logo when that is the captured geometry, and do not position the link from its own x. Space a row of links with the captured padding or gap. Do not widen one gap because a trailing space made one item’s box wider than its text.

## Missing data

When a value you need is absent, skip that piece and append one line to the report. Do not stop the rest of the build for one missing style. Do not invent the missing value.

Write `Database/digest/nesting/<slug>/<width>/default/build-report.md`.

Keep it short. If nothing is missing, write:

```markdown
# Build report
Project: <name>
Branch: <name>
Missing: none
```

If something is missing, write:

```markdown
# Build report
Project: <name>
Branch: <name>
Missing:
- <what was missing, which organism or style, which file should have contained it>
```

No preamble. No advice. One line per gap.

## Done

Report the project, the branch, the styles created, the organism components, the page, the breakpoint width, and the report path.
