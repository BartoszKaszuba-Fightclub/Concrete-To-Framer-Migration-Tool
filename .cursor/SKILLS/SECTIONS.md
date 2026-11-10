---
name: define-sections
description: Defines the organisms and the template for one captured page and writes a builder prompt with pixel bounds from the top and left of the page. Use after a capture exists and before Framer building. Does not recapture and does not edit Framer.
---

# Define sections

Write `sections-prompt.md` for one capture. An organism is one visual band. The template is the list that places those organisms in order. You do not build them.

If the capture folder is missing, stop.

## Read

1. `structure.json` — `url`, `viewport`, and `sectionCandidates` only. Each candidate has `id`, `rootIds`, `memberIds`, and `evidence` boxes. A box is `{x, y, width, height}` in CSS pixels from the top-left of the page. When `evidence.position` is `fixed` or `sticky`, `box.y` is the viewport y and does not include scrollY. Other nodes keep document y. Open `nodes` only for a candidate you are splitting, and read `tag`, `box`, and `children` on those nodes.
2. `screenshot.png` — band edges only. Do not take colour, type, or copy from the image.
3. `digests/index.json` — which digest files exist. Then open a digest for its visible text, assets, and inline SVG.

## Decide

Keep one organism per candidate. A coarse `main` may split where the screenshot shows a new band and a node box sits on that band. Put y edges on those boxes.

Name an organism from visible text in its digest. Name the template from the page title or the primary heading. If neither is stored, write `Name: missing`.

Order flow bands by increasing y, then increasing x. A candidate whose evidence position is fixed or sticky has Role: overlay, including when the tag is header. It is not a flow band and is not sorted by document y. Header `n-000003` (`header.header--simple`, position fixed, z-index 530, background rgba(255,255,255,0.9), height 70) is that overlay. Hero `n-000091` is y 0, height 775. Document y 2161 does not place the bar under the hero. The stitched screenshot, where the white bar starts at y 776 under the photo, does not make it a flow band. Assign a digest to an organism when its root id is inside that organism’s `memberIds`. A digest that fits nowhere is listed under `Unlisted`.

Round to whole pixels. A missing box edge is the word `missing`.

## One session

The same session reads the digest files whose roots sit inside each candidate and writes one organism block per candidate. Do not spawn a subagent. A nested agent has no Task tool, which is why this step stopped. Look at the screenshot once, then write the file.

## Write

Only `Database/digest/nesting/<slug>/<width>/default/sections-prompt.md`.

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
Role: <header, hero, card group, footer, overlay, or another distinct section>
Bounds: x <start> to <end>, y <start> to <end>
Digests: <ids from the index>
Contains: <headings by tag, cards, logos, images, from the digests>

## Unlisted
<digest ids that fit no organism, or "none">
```

`Contains` names the parts the builder must draw. Template y starts at the smallest flow-band y and ends at the largest. The overlay does not move that range.

## Done

Tell the parent the prompt path, the template name, and each organism’s name and bounds. Every candidate root is inside an organism or named under `Unlisted`.

## Forbidden

`computed.json`, `tokens.json`, `snapshot.html`, recapture, and Framer.
