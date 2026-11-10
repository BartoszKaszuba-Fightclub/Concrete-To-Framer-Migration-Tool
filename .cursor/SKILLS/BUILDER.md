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

1. The same session reads each organism’s digest files and builds. Do not spawn a subagent. A nested agent has no Task tool, which is why this step stopped. Read a layer list from those files: visible text, tag, box, layout opacity, font family, font size, weight, line height, colour token, padding, the four margin sides, `rowGap`, `columnGap`, `usablePath`, a mask asset when its kind is `mask`, inline SVG, any painting `::before` or `::after` (size, opacity, colour, fill), a side when its width is not `0px` (the width, the style, and the colour token), and a corner when the radius is not `0px`. For each digest link, also include the label, destination status, kind, href, reason, and whether the anchor is an inline run inside a parent text node. A mask asset is not its own layer. A width of `0px` is not a border. Do not invent one from a colour stored on that side. Meer over ons (`n-000204`) and Lees meer (`n-000250`) are each a 2px solid gold border and a 6px radius. A 1×1 text node with overflow hidden is not visible text and gets no rich-text layer. Previous (`n-000179`), Next (`n-000182`), and Scroll to top (`n-000375`) are that case. M14 and M17 share this skip. A layer at opacity 0 stays on the list when it shares its box with a sibling whose opacity is 1. A button with an empty links list still includes the hidden label from `labelNodes`. Previous (`n-000177`) and Next (`n-000180`) are that label. The 1×1 span stays off the list.
2. Create one organism component per prompt block, in Organisms. Use the layer list. Place layers with auto layout from the digest’s padding and alignment. A stack gets a gap only when `rowGap` or `columnGap` has status `value`; that length is the gap. The keyword `normal` is gap `0px`. A margin is not a gap. Padding already measured on the copy stack (`n-000199`) and the card body (`n-000245`) stays. Padding does not collapse, so a neighbour’s margin is not added to that padding or to the other margin. The horizontal inset of a section is the content box x from the digest. On this page that is 45px: the 15px padding plus the 30px margin of the dropped wrapper on `n-000188` (Over) and `n-000207` (Groei). Source photos `n-000191` start at x 45. Copying only that 15px padding puts them at x 15, and Groei copy then starts at x 15 against source `n-000209` at x 30 plus 15px padding. The 30px padding-top of `n-000272` stays on the parent that sits above the news button. Column widths stay the measured widths. Do not add that 30px on top of the Groei columns of 570 and 570, because the row would pass 1200. Do not invent a wrapper for the inset. A negative margin is not written, including `-15px` on `n-000349`. The 40px under h1 `n-000201` stays unplaced, and the build report lists it under Missing. The heading box is 52px at y 994.48, paragraph `n-000202` starts at y 1086.48, and parent `n-000200` is 316px (52 + 40 + 224), so that 40px is outside the heading box. It is not `paddingBottom` on the heading frame, because that padding sits inside the 52px border box. The heading stays the text node. No wrapper is added around the heading. Use absolute position only for an overlay or a shape that crosses the section.
3. Draw each inline SVG once, from `boundary.markup`. The SVG beside that 1×1 text node is drawn from `boundary.markup` at its measured box. Use the path in that markup. `fill="currentColor"` on that path takes the svg node's computed color, the `value` of `styles.typography.value.color`. Chevron `n-000019` is `rgb(27, 49, 88)`. A computed stroke on that node is the stroke when one is present. The svg stays the boundary. Its children stay out of the digest and are not drawn again. Visiting them draws the icon twice and adds shape nodes that M3 counts as Lexend. M3 and M16 are met. The phone icon's child path at opacity 0.4 stays a miss under Missing, because those children stay unvisited. Do not draw a `::before` glyph, because a non-Lexend character worsens M3, which is met. Draw a painting pseudo that has a fill, a background image, or forms a divider.
4. The line-height on a text layer is the `value` of `styles.typography.value.lineHeight` on the run that holds the glyphs (`text.runs` or `labelNodes`). Font, size, and weight come from that same run. fontFamily on each rich-text node is copied from the `value` of `styles.typography.value.fontFamily` on that run. All 70 text nodes on this page are Lexend, including `HUY4KvuZK`. Leaving fontFamily empty worsens M3, which is met. Do not borrow the parent or a larger heading. NL (`n-000072`) is 18px, not the parent button’s 21.008px. AVG (`n-000354`) is 24px, not the footer-link 20px. Apply a text style only when its font, size, weight, and line-height match that measurement. After the preset is applied, set the layer `htmlTag` back to the digest node tag when that tag is `header`, `nav`, `main`, `footer`, `section`, `div`, `button`, `p`, or `h1` through `h6`, so an h2 that shares an h1’s measurements stays an h2. An `a` or an `li` keeps an empty `htmlTag`. Do not retag them as `p`. Colour uses the Framer color style. Border, radius, and shadow use the matching token entries. Padding and gap follow step 2, so a margin token is not the stack gap and the 40px under `n-000201` is not heading padding. Skip a missing value and record it.
5. Place the organisms, in prompt order, on one page. Set the breakpoint width to `source.viewport.width`. After placement, the breakpoint height is the bottom of the last section. That bottom is the end y already in the prompt. The 900px viewport does not stay the page height. Do not clip the page at 900. Page height comes only from M14. An organism with Role: overlay is absolute inside the breakpoint, at its viewport box, with no stack slot. Header `n-000003` is that bar: position fixed, height 70, over hero `n-000091` (y 0, height 775). The box y for fixed and sticky is the viewport y. Document y 2161 is not the place. Do not use CSS position fixed. It pins to the preview, and the page screenshot does not measure it. Do not use a code override. A code override worsens custom code and M2, both met. The stitched screenshot shows the white bar starting at y 776 under the photo. That image does not set this placement. The bar overlaps the hero. A later review can score that overlap as M16, which is met.
6. Look at the screenshot to check placement. Do not take copy from it. The overlay from step 5 stays on the viewport box. The white bar at y 776 in the stitch does not move it.
7. Set `htmlTag` only for `header`, `nav`, `main`, `footer`, `section`, `div`, `button`, `p`, and `h1` through `h6`. That value is the digest node tag. Do not take the tag from `framer.tag` or from roles. An `a` or an `li` keeps an empty `htmlTag`. Do not retag them as `p`.
8. Bind each text layer and each image to a built-in Framer variable. The default is the captured value. Do not add variants when the capture has one state, except when sibling layers in one organism share a box, exactly one of them has opacity 1, and the others do not. Those layers become one variant per layer, in hierarchy order. Each variant shows only that layer. Do not place a second copy. The hero slide roots `n-000098` (opacity 1), `n-000116`, `n-000135`, and `n-000154` (opacity 0) share 0, 0, 1200×775. Built, the hidden slides sit around x 100, y 445, 650×200 (`XtsPf7b0X`, `x78MEG3VN`, `GEaiKGQBn`, opacity 0). Leaving the other slides visible stacks them on that box and worsens M16, which is met. A button with an empty links list whose hidden label is Previous or Next (`n-000177`, `n-000180`) gets a native tap to the previous or next variant. No code override. The tap does not depend on the link rule: those buttons stay without an href. A code override for the carousel worsens custom code and M2, both met. Add one string variable per digest link, named from the label. When one organism repeats a label, the node id keeps the names apart. The variable default is the digest href, including a destination edited in the file. When the status is `value` and the anchor is not an inline run, `link.href` goes on the wrapping frame and the href comes from that variable. The link is not on the rich text, because a rich-text link forces a link style and can replace Lexend, which worsens M3, which is met. When the status is uncertain or missing, or the href is empty, `link.href` stays empty and the digest reason is in the variable name. `n-000335` “Alle merken” has an empty href, so the name carries “Href is empty.” Do not use a code badge. Phone `n-000302` and email `n-000305` are real hrefs and belong on the wrapping frame. Header “Over Yellow Hive” was built as `p` on `jijNgRwNN`; the source is `li` `n-000016`, `a` `n-000017`, `span` `n-000018`, and the href is `https://yellowhive.com/nl/over-yellow-hive` on that wrapping frame. Footer AVG was built as `p` on `VKvnj8lgP`; the source is `ul` `n-000352`, `li` `n-000353`, `a` `n-000354`, and that href belongs on the wrapping frame. A destination with kind `anchor` stays unlinked when that target is in no digest on the page. A class such as `hero__prev` is not on the digest node. Do not open `structure.json` to read a class or an href.
9. Use native Framer layers. A code component or override is allowed only for one named case, and the build report must say why. An uncertain or empty link is not that case. A tap between variants on a shared box is not that case. A fixed or sticky bar placed on the breakpoint is not that case. If none was used, the report includes the line "Custom code: none".
10. Upload each local `usablePath` with the Framer tool `create_upload_url` and set that asset on a frame's image. Do not put the path in a text layer. A digest asset whose kind is `mask` is not that image and not a frame. Upload that file and set the photo frame's `masks` to one entry: `mask` is the uploaded asset, `maskMode` is `alpha`, and `maskResize` is `cover`. Photos `n-000193`, `n-000195`, and `n-000197` keep their image variable and the captured alt. The painting `::before` of `n-000186` stays its own layer.
11. Build one layer per digest node, nested by `parentId` and ordered by hierarchy order. The 1×1 text node with overflow hidden is not a layer. `display: flex` is a horizontal stack. A block parent stacks vertically. An inline link stays inside its text run. It is not its own layer. A geometry box is not the gate. The four inline links `n-000285` through `n-000288` are `display: inline` inside `p` `n-000284` and each has a geometry box. They stay inside the run and stay without an href, so that slice of the link row does not move. Pulling them out reflows the sentence and can worsen M16, which is met. `display: inline` on phone `n-000302` and email `n-000305` does not make them an inline run. A span that only carries the label stays the text run. `n-000018` is that span. A `li` that only wraps that anchor does not become a second frame. `n-000016` and `n-000353` are that case.
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
