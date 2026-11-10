---
name: build-in-framer
description: Exports Framer color and text styles from the token file, then, after the section prompt exists, builds organism components onto one page at the captured width. Use when a capture and a token file already exist. Does not open the source website.
---

# Build in Framer

Build from the files the parent names. Do not open the source website. Do not recapture.

Framer work uses the Framer MCP server (`framer` in `.cursor/mcp.json`). Read a tool’s schema once, the first time you call that tool. If the server needs authentication, authenticate and continue. If the tools are absent, stop.

The parent names the project and the branch. If the project is missing, stop.

## Phase 1 — styles, then stop

Inputs: the project, the branch choice, and `tokens.json`.

1. Open the project. Create the branch from the project’s main branch, or switch to the named branch. Confirm both names before any write.
2. Create Assets folders Templates, Organisms, and Design tokens. Reuse a folder that already has that name.
3. From `tokens.json`:
   - One color style per `colours` entry: `framer.name` and `framer.light`.
   - One text style per `textStyles` entry. Read the measurements from `framer`: `tag`, `fontFamily`, `fontWeight`, `fontSize`, `lineHeight`, `letterSpacing`, `transform`, and `colorStyle`. When `letterSpacing` is `normal`, keep that keyword. Do not send `0`, `0px`, or `0em`.
   - Create a heading tag only when `roles` includes it.
   - `spacing`, `borders`, `radii`, and `shadows` are applied in phase 2. They are not color or text styles.
4. A missing font is one report line. Do not substitute a font.
5. Stop. Tell the parent the export is done.

No subagents in this phase. Framer writes stay in this agent.

## Phase 2 — place organisms

Start only after the parent confirms `sections-prompt.md` exists.

Inputs: `sections-prompt.md`, `tokens.json`, `digests/index.json`, the digest files the prompt lists, and the screenshot.

1. Spawn one subagent per organism when the prompt lists more than one. Each subagent reads only that organism’s digest files and returns a layer list: visible text, tag, box, font size, weight, line height, colour token, padding, the four margin sides, `rowGap`, `columnGap`, `usablePath`, a mask asset when its kind is `mask`, inline SVG, any painting `::before` or `::after` (size, opacity, colour, fill), a side when its width is not `0px` (the width, the style, and the colour token), and a corner when the radius is not `0px`. A mask asset is not its own layer. A width of `0px` is not a border. Do not invent one from a colour stored on that side. Meer over ons (`n-000204`) and Lees meer (`n-000250`) are each a 2px solid gold border and a 6px radius. With one organism, read those digests yourself.
2. Create one organism component per prompt block, in Organisms. Use the layer list. Place layers with auto layout from the digest’s padding and alignment. A stack gets a gap only when `rowGap` or `columnGap` has status `value`; that length is the gap. The keyword `normal` is gap `0px`. A margin is not a gap. Padding already measured on the copy stack (`n-000199`) and the card body (`n-000245`) stays. Padding does not collapse, so a neighbour’s margin is not added to that padding or to the other margin. The horizontal inset of a section is the content box x from the digest. On this page that is 45px: the 15px padding plus the 30px margin of the dropped wrapper on `n-000188` (Over) and `n-000207` (Groei). Source photos `n-000191` start at x 45. Copying only that 15px padding puts them at x 15, and Groei copy then starts at x 15 against source `n-000209` at x 30 plus 15px padding. The 30px padding-top of `n-000272` stays on the parent that sits above the news button. Column widths stay the measured widths. Do not add that 30px on top of the Groei columns of 570 and 570, because the row would pass 1200. Do not invent a wrapper for the inset. A negative margin is not written, including `-15px` on `n-000349`. The 40px under h1 `n-000201` stays unplaced, and the build report lists it under Missing. The heading box is 52px at y 994.48, paragraph `n-000202` starts at y 1086.48, and parent `n-000200` is 316px (52 + 40 + 224), so that 40px is outside the heading box. It is not `paddingBottom` on the heading frame, because that padding sits inside the 52px border box. The heading stays the text node. No wrapper is added around the heading. Use absolute position only for an overlay or a shape that crosses the section.
3. Draw each inline SVG on `boundary.markup`. Draw a painting pseudo that has a fill, a background image, or forms a divider.
4. The line-height on a text layer is the `value` of `styles.typography.value.lineHeight` on the run that holds the glyphs (`text.runs` or `labelNodes`). Font, size, and weight come from that same run. Do not borrow the parent or a larger heading. NL (`n-000072`) is 18px, not the parent button’s 21.008px. AVG (`n-000354`) is 24px, not the footer-link 20px. Apply a text style only when its font, size, weight, and line-height match that measurement. After the preset is applied, set the layer `htmlTag` back to the digest node tag, so an h2 that shares an h1’s measurements stays an h2. Colour uses the Framer color style. Border, radius, and shadow use the matching token entries. Padding and gap follow step 2, so a margin token is not the stack gap and the 40px under `n-000201` is not heading padding. Skip a missing value and record it.
5. Place the organisms, in prompt order, on one page. Set the breakpoint to `source.viewport.width` and `source.viewport.height`.
6. Look at the screenshot to check placement. Do not take copy from it.
7. The layer's HTML tag is the digest node tag. Do not take the tag from `framer.tag` or from roles.
8. Bind each text layer and each image to a built-in Framer variable. The default is the captured value. Do not add variants. The capture has one state.
9. Use native Framer layers. A code component or override is allowed only for one named case, and the build report must say why. If none was used, the report includes the line "Custom code: none".
10. Upload each local `usablePath` with the Framer tool `create_upload_url` and set that asset on a frame's image. Do not put the path in a text layer. A digest asset whose kind is `mask` is not that image and not a frame. Upload that file and set the photo frame's `masks` to one entry: `mask` is the uploaded asset, `maskMode` is `alpha`, and `maskResize` is `cover`. Photos `n-000193`, `n-000195`, and `n-000197` keep their image variable and the captured alt. The painting `::before` of `n-000186` stays its own layer.
11. Build one layer per digest node, nested by `parentId` and ordered by hierarchy order. `display: flex` is a horizontal stack. A block parent stacks vertically. An inline link stays inside its text run. It is not its own layer.
12. When a digest asset alt or a link destination was edited in the file, use the edited value.

Do not create a template component. Do not add a second breakpoint. Do not publish. Do not change routes.

## Report

Write `build-report.md` in the capture folder.

```markdown
# Build report
Project: <name>
Branch: <name>
Page: <name>
Breakpoint: <width> x <height>
Custom code: none, or the case and why
Missing:
- <one line per gap, or "none">
Scorecard:
- type: pass | gap: <what was not measured>
- colour: pass | gap: <what was not measured>
- spacing: pass | gap: <what was not measured>
- images: pass | gap: <what was not measured>
```

A line is `pass` only when that property was taken from the token file or the digest and placed. Not measured is a gap.

## Done

Report the project, the branch, the styles, the organisms, the page, the breakpoint, and the report path.

## Forbidden

The live site, `structure.json`, `computed.json`, `snapshot.html`, a second builder, and publishing.
