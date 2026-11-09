---
name: define-sections
description: Defines the organisms and the template for one captured page and writes a builder prompt with pixel bounds from the top and left of the page. Use after a capture exists and before Framer building. Does not recapture and does not edit Framer.
---

# Define sections

## Job

Read the files the collector already wrote. Decide which organisms and which template this page has. Write that decision as a prompt a builder agent can follow. Do not recapture the site. Do not create Framer styles, components, or pages. Do not invent measurements that are not in the capture files.

Brad Frost, Atomic Design: an organism is a distinct section of the interface, composed of smaller parts (a header of logo, navigation, and search; a repeated card group). A template is the page-level object that places those organisms in order. This skill names them and records their bounds. It does not build them.

Work on one capture: one slug, one width, state `default`. If that capture is missing, stop. Do not guess a layout from memory or from the live site.

## Inputs, in this order

1. `Database/digest/nesting/<slug>/<width>/default/structure.json` — `sectionCandidates` and each node `box`. A box is `{x, y, width, height}` in CSS pixels. `x` is pixels from the left edge of the page. `y` is pixels from the top of the page. Read `url`, `viewport.width`, and `viewport.height` from this file for the prompt header. Resolve a candidate’s boxes through its `rootIds` (and `evidence[].box` when present) into `nodes`.
2. `Database/Screenshots/<slug>/<width>/default/screenshot.png` — use it only to see where one visual band ends and the next begins. Do not read colours, type, or copy from the image.
3. `Database/digest/nesting/<slug>/<width>/default/digests/` — section, button, and field digests. Use them to name organisms from visible text and to list which digest ids sit inside each organism.
4. `Database/digest/nesting/<slug>/<width>/default/reconstruction.json` — simplified tree if a boundary is ambiguous.

If the capture only stored landmarks, a `main` section can cover the whole column. Split that column into organisms at the visible bands (a hero, a card grid, a quote, a form). Bounds still come from node boxes, not from a guess.

## Decide the organisms

Take `sectionCandidates` as the starting cut. Keep one organism per distinct section.

Name each organism from visible text in its digest. Do not use a fixed list. Do not name an organism from a class, a tag, or a colour. If the digests do not show a section, do not invent it.

One coarse `main` digest may become several organisms. Split it only where the screenshot shows a new band and a node box in `structure.json` (or a node in `reconstruction.json`) sits on that band. Put the organism’s y edges on those node boxes.

Assign a digest to an organism when its root node is one of that organism’s nodes. List the digest filename or its id. A digest whose root is not inside any organism stays unlisted; say that in the handoff. Do not invent a digest id.

Order the organisms from the top of the page downward (increasing y). When two organisms start at the same y, order them from the left (increasing x).

Name the template from the page title or the primary heading stored in the capture or a digest. If neither is stored, write `Name: missing`. Do not invent a title.

## Bounds

Origin is the top-left of the page. For every organism record all four edges:

- x starts at `box.x` (pixels from the left)
- x ends at `box.x + box.width`
- y starts at `box.y` (pixels from the top)
- y ends at `box.y + box.height`

For the template, record where the page content starts and ends vertically (y start and y end of the stacked organisms). Horizontal bounds on the template are the page width of the capture (`viewport.width`).

Use the union of the organism’s root boxes when an organism has several roots:

- x start is the smallest `box.x`
- x end is the largest `box.x + box.width`
- y start is the smallest `box.y`
- y end is the largest `box.y + box.height`

Round to whole pixels. If a box is missing, say that edge is missing. Do not invent a coordinate. Do not copy an edge from the screenshot.

Template y start is the smallest organism y start. Template y end is the largest organism y end. If an organism edge is missing, the template edge that depends on it is missing too.

## Output

Write `Database/digest/nesting/<slug>/<width>/default/sections-prompt.md`.

This is the only file to write. Do not change `structure.json`, the digests, the screenshot, or `reconstruction.json`.

The file is the prompt for the builder. Use this shape:

```markdown
# Section prompt
Page: <url>
Capture: Database/digest/nesting/<slug>/<width>/default
Viewport: <width> x <height>
Origin: left edge of the page, top of the page. x grows right. y grows down. Unit: CSS pixels.

## Template
Name: <name from the page>
Place the organisms below in this order. y <start> to <end>. x 0 to <viewport width>.

## Organisms
### <name from visible text>
Role: <header, hero, card group, footer, or another distinct section>
Bounds: x <start> to <end>, y <start> to <end>
Digests: <digest filenames or ids that belong inside>
Contains: <short list of the visible parts, from the digests>
```

Fill every placeholder from the capture. Write a missing edge as `missing`. `Contains` lists the headings, cards, logos, and images that sit in that organism, plus the other parts named in the digests. Name a heading by its tag. Name a card when a repeated block holds an image and a heading. Name a logo when the header digest has a brand image or inline SVG. Name an image from its digest asset. Do not describe colour or type size taken from the screenshot.

One organism per distinct section. Repeat the organism block for each one, in the order recorded on the template.

## Handoff

Tell the parent the prompt path, the template name, each organism name, and each organism’s x and y bounds. Do not tell the builder to open the website.

Stop after the prompt file and that handoff. Do not recapture. Do not open Framer. Do not create styles, components, or pages.

