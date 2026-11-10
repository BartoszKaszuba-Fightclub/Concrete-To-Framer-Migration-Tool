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
   - One text style per `textStyles` entry. Read the measurements from `framer`: `tag`, `fontFamily`, `fontWeight`, `fontSize`, `lineHeight`, `letterSpacing`, `transform`, and `colorStyle`. When `letterSpacing` is `normal`, keep that keyword. Do not send `0`.
   - Create a heading tag only when `roles` includes it.
   - `spacing`, `borders`, `radii`, and `shadows` are applied in phase 2. They are not color or text styles.
4. A missing font is one report line. Do not substitute a font.
5. Stop. Tell the parent the export is done.

No subagents in this phase. Framer writes stay in this agent.

## Phase 2 — place organisms

Start only after the parent confirms `sections-prompt.md` exists.

Inputs: `sections-prompt.md`, `tokens.json`, `digests/index.json`, the digest files the prompt lists, and the screenshot.

1. Spawn one subagent per organism when the prompt lists more than one. Each subagent reads only that organism’s digest files and returns a layer list: visible text, tag, box, font size, weight, line height, colour token, padding, gap, `usablePath`, inline SVG, and any painting `::before` or `::after` (size, opacity, colour, fill). With one organism, read those digests yourself.
2. Create one organism component per prompt block, in Organisms. Use the layer list. Place layers with auto layout from the digest’s gap, padding, and alignment. Use absolute position only for an overlay or a shape that crosses the section.
3. Draw each inline SVG on `boundary.markup`. Draw a painting pseudo that has a fill, a background image, or forms a divider.
4. Use the font size, weight, and line height measured on that node. Do not borrow a larger heading from elsewhere. Colour uses the Framer color style. Spacing, border, radius, and shadow use the matching token entries. Skip a missing value and record it.
5. Place the organisms, in prompt order, on one page. Set the breakpoint to `source.viewport.width` and `source.viewport.height`.
6. Look at the screenshot to check placement. Do not take copy from it.
7. The layer's HTML tag is the digest node tag. Do not take the tag from `framer.tag` or from roles.
8. Bind each text layer and each image to a built-in Framer variable. The default is the captured value. Do not add variants. The capture has one state.
9. Use native Framer layers. A code component or override is allowed only for one named case, and the build report must say why. If none was used, the report includes the line "Custom code: none".
10. Upload each local `usablePath` with the Framer tool `create_upload_url` and set that asset on a frame's image. Do not put the path in a text layer.
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
