---
name: build-in-framer
description: Exports Framer color and text styles from the token file, then, after the section prompt exists, builds organism components onto one page at the captured width. Use when a capture and a token file already exist. Does not open the source website.
---

# Build in Framer

Build from the files the parent names. Do not open the source website. Do not recapture.

The same steps apply to every capture. Read lengths, colours, labels, and hrefs from the digest and the token file. Do not carry a node id, a label, or a pixel from a previous site into this build.

Framer work uses the Framer MCP server (`framer` in `.cursor/mcp.json`). Read a tool’s schema once, the first time you call that tool. If the server needs authentication, authenticate and continue. If the tools are absent, stop.

The parent names the project and the branch. If the project is missing, stop.

The pipeline runs on a clean Framer branch. A clean branch is a new branch taken from that project’s main. It has no components, styles, or pages from an earlier run. Main stays unchanged.

## Phase 1 — styles, then stop

Inputs: the project, the branch choice, and `tokens.json`.

1. Open the project. Create a clean branch from main. Confirm the project name and the branch name before any write. A named branch that already holds pipeline output is not clean. Create another branch from main.
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

Inputs: `sections-prompt.md`, `tokens.json`, `digests/index.json`, `consent.json`, the digest files the prompt lists, and the screenshot.

1. The same session reads each organism’s digest files and builds. Do not spawn a subagent. A nested agent has no Task tool, which is why this step stopped. Read a layer list from those files: visible text, tag, box, layout opacity, font family, font size, weight, line height, colour token, padding, the four margin sides, `rowGap`, `columnGap`, `usablePath`, a mask asset when its kind is `mask`, inline SVG, any painting `::before` or `::after` (size, opacity, colour, fill), a side when its width is not `0px` (the width, the style, and the colour token id), and a corner when the radius is not `0px` (the radius length). For each digest link, also include the label, destination status, kind, href, reason, and whether the anchor is an inline run inside a parent text node. A mask asset is not its own layer. A width of `0px` is not a border. Do not invent one from a colour stored on that side. A text node that is 1×1 with overflow hidden is not visible text and gets no rich-text layer. A layer at opacity 0 stays on the list when it shares its box with a sibling whose opacity is 1. A button with an empty links list still includes the hidden label from `labelNodes`. The 1×1 span stays off the list.
2. Create one organism component per prompt block, in Organisms. When the first organism component exists, write one line to `first-component.md` in the capture folder and stay in the turn. Build the remaining organisms and write `build-report.md` at the end. Do not return after the first organism. Use the layer list. Place layers with auto layout from the digest’s padding and alignment. A stack gets a gap only when `rowGap` or `columnGap` has status `value`; that length is the gap. The keyword `normal` is gap `0px`. A margin is not a gap. Padding on a node stays that node’s padding. Padding does not collapse, so a neighbour’s margin is not added to that padding or to the other margin. Place each direct child’s positive margin as one spacer sibling, using that child’s own margin. Do not copy one sibling’s margin onto another. A margin inside a nested row stays inside that row. The horizontal inset of a section is the content box x from the digest. Do not invent a wrapper for the inset. A negative margin is not written. A positive margin that is the space to the next sibling becomes one spacer between those two layers. The spacer is not added to padding already on the parent. A margin already placed as the section inset is not a spacer. Space between a heading and the next block sits outside the heading box. It is not padding on the heading frame, because that padding sits inside the heading’s border box. The heading stays the text node. Column widths stay the measured widths. Do not add a margin on top of those widths. Use absolute position only for an overlay or a shape that crosses the section.
3. Draw each inline SVG once, from `boundary.markup`. That markup is the icon. An `unsupported-boundary` warning is not written for an svg that has markup, and it is not a reason to skip the icon. Draw it at its measured box. Use the path in that markup. `fill="currentColor"` takes the svg node's computed color, the `value` of `styles.typography.value.color`. Any other fill in the markup is painted from that fill. A computed stroke on that node is the stroke when one is present. The svg stays the boundary. Its children stay out of the digest and are not drawn again. Do not draw `::before` glyphs for an svg that has markup. Draw a painting pseudo that has a fill, a background image, or forms a divider, at its own box. Do not apply a parent opacity a second time on that shape. Place it absolute and clip it with the parent’s overflow. A link on an svg sets `link.href` on that svg.
4. The line-height on a text layer is the `value` of `styles.typography.value.lineHeight` on the run that holds the glyphs (`text.runs` or `labelNodes`). Font, size, and weight come from that same run. fontName on each rich-text node is set from the `value` of `styles.typography.value.fontFamily` on that run. The digest field stays `fontFamily`. The Framer node field is `fontName`. Do not borrow the parent or a larger heading. Apply a text style only when its font, size, weight, and line-height match that measurement. Set only that text style. Do not send `fontName` in that same edit. After the preset is applied, set `tag` on the rich-text layer from the digest node when that tag is `h1` through `h6` or `p`. `htmlTag` stays the frame field, for `header`, `nav`, `main`, `footer`, `section`, `div`, and `button`. The preset’s tag stays whatever the collector wrote. Do not write `tag` on the preset. An `a` or an `li` keeps an empty `htmlTag`. Do not retag them as `p`. Colour uses the Framer color style, including alpha. Border, radius, and shadow use the matching token entries. When every border width is `0px` and a corner is not `0px`, set the frame `radius` and do not set `border`. When a side width is not `0px`, set that border and the corner from the digest. Padding and gap follow step 2. Skip a missing value and record it.
5. Place the organisms, in prompt order, on one page. Set the breakpoint width to `source.viewport.width`. After placement, the breakpoint height is the bottom of the last section. That bottom is the end y already in the prompt. Do not leave the capture viewport as the page height. An organism with Role: overlay is absolute inside the breakpoint, at its viewport box, with no stack slot. The box y for fixed and sticky is the viewport y. Do not use CSS position fixed. It pins to the preview, and the page screenshot does not measure it. Do not use a code override. Place a consent frame only when that side of `consent.json` exists. When `dialog` is null, place the button widget absolute on the breakpoint, at the stored box, with the stored logo, with no stack slot and no code override. Place no dialog frame. The logo stays the stored SVG. The dialog text stays out of `structure.json`.
6. Look at the screenshot to check placement. Do not take copy from it. The overlay from step 5 stays on the viewport box.
7. Set `htmlTag` on the frame for `header`, `nav`, `main`, `footer`, `section`, `div`, and `button`. That value is the digest node tag. On the rich-text layer, after the text-style preset is applied, set `tag` from the digest node when that tag is `h1` through `h6` or `p`. The preset’s tag stays whatever the collector wrote. Do not take the rich-text tag from `framer.tag` or from roles. An `a` or an `li` keeps an empty `htmlTag`. Do not retag them as `p`.
8. Bind each text layer and each image to a built-in Framer variable. The default is the captured value. Do not add variants when the capture has one state, except when sibling layers in one organism share a box, exactly one of them has opacity 1, and the others do not. Those layers become one variant per layer, in hierarchy order. Each variant shows only that layer. Do not place a second copy. Shared controls that sit outside those siblings are overridden per variant. On the first variant, the control whose hidden label means previous has no tap. On each later variant, that control targets the previous variant id. The control whose hidden label means next keeps `cycle`. The tap is the native variant interaction. No code override. The tap does not add an href. Add one string variable per digest link, named from the label. When one organism repeats a label, the node id keeps the names apart. The variable default is the digest href, including a destination edited in the file. When the status is `value` and the anchor is not an inline run, `link.href` goes on the wrapping frame and the href comes from that variable. A link whose node is an svg or img sets `link.href` on that layer and adds one string variable. Anchors omitted because their parent was kept become hidden frames on that component, `visible` false, each with the literal digest URL on `link.href`, and no stack slot. Do not draw a `display: none` panel as visible layers. Do not add a frame for an href that is `#` or a duplicate of its parent URL. An inline link stays inside its parent text, in source order, as its own text range. Each range `link.href` is the literal digest URL. fontName stays the run’s family. The paragraph layer’s `link.href` stays empty. Do not apply a text style that replaces that family. A link variable is used only where that call accepts one. When the status is uncertain or missing, or the href is empty, `link.href` stays empty and the digest reason is in the variable name. Do not use a code badge. A `tel` or `mailto` link stays on the wrapping frame. The href of an anchor wrapped only by a list item and a label span belongs on that wrapping frame. A destination with kind `anchor` stays unlinked when that target is in no digest on the page. Do not open `structure.json` to read a class or an href.
9. Use native Framer layers. A code component or override is allowed only for one named case, and the build report must say why. An uncertain or empty link is not that case. A tap between variants on a shared box is not that case. A fixed or sticky bar placed on the breakpoint is not that case. The cookie dialog and the widget placed from `consent.json` are not that case. If none was used, the report includes the line "Custom code: none".
10. Upload each local `usablePath` with the Framer tool `create_upload_url` and set that asset on a frame's image. Do not put the path in a text layer. A digest asset whose kind is `mask` is not that image and not a frame. Upload that file and set the photo frame's `masks` to one entry: `mask` is the uploaded asset, `maskMode` is `alpha`, and `maskResize` is `cover`. Each photo keeps its image variable and the captured alt. A painting `::before` stays its own layer. On a variant photo, `altText` is the alt of the slide that variant shows. Leave image variables as the asset string. Add no second photo layer for a slide that is already a variant.
11. Build one layer per digest node, nested by `parentId` and ordered by hierarchy order. A node whose fill is non-transparent is its own frame, filled with the colour style that matches including alpha. The 1×1 text node with overflow hidden is not a layer. `display: flex` is a horizontal stack. A block parent stacks vertically. An inline link stays inside its text run. It is not its own layer. A geometry box is not the gate. A node that is `display: inline` and shares its parent text with other glyphs stays a text range. A `tel` or `mailto` control stays on the wrapping frame. A span that only carries the label stays the text run. A `li` that only wraps that anchor does not become a second frame.
12. When a digest asset alt or a link destination was edited in the file, use the edited value.

Do not create a template component. Do not add a second breakpoint. Do not publish. Do not change routes.

## Report

Write `build-report.md` in the capture folder. After the scorecard, copy the Classification and Workflow sections verbatim. Create no component from them. Those sections are report prose, not build steps.

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
Classification:
An atom is one text node, one image, or one link. A molecule is repeated siblings with the same tag and the same ordered child tags. An organism is one visual band. The template is the ordered list of organisms and is not a component.
Workflow:
The collector writes the capture, tokens, and digest index. The section agent writes sections-prompt.md. The builder exports styles, places one organism per prompt block, and writes the report.
```

A line is `pass` only when that property was taken from the token file or the digest and placed. Not measured is a gap.

## Done

Report the project, the branch, the styles, the organisms, the page, the breakpoint, and the report path.

## Forbidden

The live site, `structure.json`, `computed.json`, `snapshot.html`, a second builder, and publishing.
