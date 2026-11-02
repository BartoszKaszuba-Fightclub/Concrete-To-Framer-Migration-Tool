---
name: orchestrate-design-to-components
description: Orchestrates the current one-width capture, digest, and design-token pipeline. Dismisses the cookie banner, then reads one settled page into structure, computed styles, sections, a schema 2.0.0 component digest, and a design-token file. Use when asked to capture, digest, or create Framer color and text styles for a public page.
---

# Current pipeline

Capture one public page at one width, in the default static state, then write one schema 2.0.0 digest per component. Follow this document and the scripts it names. The historical multi-width approval flow is not part of this pipeline.

Default viewport: **1200 × 900**. State: **default**. Pass one width with `--widths` when a different width is required. Extra width values are ignored with a warning. Do not ask the developer to confirm breakpoints, and do not capture a second width.

## Commands

| Purpose | Command |
| --- | --- |
| Capture | `npm run extract:generic -- <url> [--widths 1200] [--height 900] [--slug name] [--out Database] [--settle-timeout 10000] [--components all\|button\|field]` |
| Digest | `node --import tsx scripts/digest/cli.ts --structure <structure.json> --computed <computed.json> --component-id <id> --component-type <type> --root <nodeId> --out <digest.json>` |
| Design tokens | `node --import tsx scripts/design-tokens/cli.ts --structure <structure.json> --computed <computed.json> --language <tag>` |

Read `scripts/generic-extractor/cli.ts` and `scripts/digest/cli.ts` before changing flags. Defaults are height `900`, settle timeout `10000`, max nodes `0`, and output directory `Database`. `--components` accepts `all`, `button`, or `field`.

## 1. Capture

Use one Playwright page. Do this in order, on that same page:

1. Open the public page.
2. Click the cookie banner’s visible reject or dismiss control.
3. Leave that banner out of the element tree and out of the styles. If the click removes it, it is gone before the read. If a cookie, consent, OneTrust, or Cookiebot dialog remains, skip that subtree and skip its stylesheet.
4. Wait until fonts and images settle, and until no covering overlay remains.
5. Only then read the page CSS, walk the elements, and measure styles.

A covering overlay with no dismiss control fails the run and writes nothing. A visible text, button, or field node missing font or colour fails the run and writes nothing.

The CSS read records `@media` min-width and max-width values and any stylesheet that could not be read. Those notes are stored on the capture. They do not add widths.

Structure and computed style come from one walk. Each node keeps a capture-local id (`n-` plus a sequence). Those ids join the files of this capture. They are not stable across a new capture.

Measured style includes font, colour, background, spacing, gap, border, radius, shadow, opacity, and, when present, `zIndex`, `transform`, `filter`, `backdropFilter`, `clipPath`, `maskImage`, `overflowX`, and `overflowY`. Painting `::before` and `::after` are included.

Sections are chosen automatically: header, hero, main, footer, and nav. `--sections` is ignored. There is no clip-approval pause.

`--components button` or `--components field` limits the component inventory to those visible controls. Each occurrence is a component record, or a `missing-measurement` blocker. Buttons and fields are grouped by colour, border, and typography. The label is not part of that group.

A wrapper is removed from the simplified tree only when it has no meaningful text, no paint or pseudo-element, no spacing, layout, transform, clipping, or stacking effect, and its children keep order and geometry. Hidden nodes stay in `structure.json` and are listed as dropped in `reconstruction.json`.

Capture initial appearance only. Do not open menus, accordions, tabs, or carousel slides.

### Files written

`<slug>` comes from the URL path unless `--slug` is set. `<width>` is the one selected width.

| File | Path |
| --- | --- |
| Full tree, sections, warnings, excluded consent nodes | `Database/digest/nesting/<slug>/<width>/default/structure.json` |
| Computed styles | `Database/digest/nesting/<slug>/<width>/default/computed.json` |
| Simplified tree | `Database/digest/nesting/<slug>/<width>/default/reconstruction.json` |
| Button and field inventory | `Database/digest/nesting/<slug>/<width>/default/components.json` |
| Visual style groups | `Database/digest/nesting/<slug>/<width>/default/signatures.json` |
| Full-page screenshot | `Database/Screenshots/<slug>/<width>/default/screenshot.png` |
| Page HTML after the banner is gone | `Database/snapshots/<slug>/<width>/default/snapshot.html` |
| Design tokens | `Database/digest/tokens/<slug>/<width>/tokens.json` |

The active capture does not write `elements.json`, `report.json`, `matches.proposed.json`, `pending-decision.json`, `sections.approved.json`, or `sections-preview.png`. Do not recreate those files, and do not wait on them.

## 2. Digest

After a successful capture, generate one digest per component at that width. The contract is `docs/poc-v2/digest-contract.md`. Schema version is `2.0.0`. Validation is `scripts/digest/schema.ts`. A validated example is `docs/poc-v2/examples/button.digest.json`.

Join structure and computed style by the capture-local node id. Pass the component root from `components.json` for a button or field, or the section root for a section. The digest is the builder input: exact visible text, label-node styles, measured geometry, colours, type, spacing, borders, media references, and warnings. Letter-spacing `normal` stays the keyword `normal`.

If validation fails, fix the extractor or the digest generator. Do not hand-edit the JSON to make it pass.

```bash
node --import tsx scripts/digest/cli.ts \
  --structure Database/digest/nesting/<slug>/<width>/default/structure.json \
  --computed Database/digest/nesting/<slug>/<width>/default/computed.json \
  --component-id <id> \
  --component-type button \
  --root <nodeId> \
  --out Database/digest/nesting/<slug>/<width>/default/digests/<id>.json
```

## 3. Design tokens

Run the collector on this capture. Do not hunt through the page, the DOM, or the screenshots for colours or type. The token file is the only source for the styles created in this step.

```bash
node --import tsx scripts/design-tokens/cli.ts \
  --structure Database/digest/nesting/<slug>/<width>/default/structure.json \
  --computed Database/digest/nesting/<slug>/<width>/default/computed.json \
  --language <language>
```

This writes `Database/digest/tokens/<slug>/<width>/tokens.json`. Read that file. It must validate against `docs/poc-v2/design-tokens.schema.json` (`scripts/design-tokens/schema.ts`). It lists only tokens measured on the captured page. Equal values appear once. `letterSpacing` stays `normal` when that keyword was measured; do not replace it with `0`.

Connect with `process.env.FRAMER_TOKEN` from the project `.env` through `framer-api` `connect`. Read `getProjectInfo().name`. Continue only when the name is `Enchanting Whoever`. If it is a different project, stop and report the name.

Create Framer styles from the file:

1. Create one color style for each `colours` entry with `createColorStyle`, using that entry's `framer.name` and `framer.light`.
2. Create one text style for each `textStyles` entry with `createTextStyle`. Use the entry's `framer.tag`, `fontSize`, `lineHeight`, `transform`, and the color style named by `colorStyle`. Request `framer.fontFamily` at `framer.fontWeight` with `getFont`. Pass `letterSpacing` only when the file gives a length. When the file says `normal`, keep that keyword and do not send `0`.
3. A heading tag is created only when that entry's `roles` include it. Do not invent an `h1`–`h6` style the file does not list.
4. If `getFont` returns no font, record the family and weight, skip that text style, and ask the developer whether to upload the font or name a substitute. Wait for the answer. Do not substitute a font.

Do not place layers on a page or the design canvas. Do not change page breakpoints, routes, or publishing. Do not publish.

`spacing`, `borders`, `radii`, and `shadows` stay in the file for later layout. This step creates color styles and text styles only.

## Checks

- `node --import tsx --test tests/extractor/*.ts`
- `node --import tsx --test tests/digest/digest.test.ts`
- `node --import tsx --test tests/design-tokens/*.ts`

## Stopped work

Do not set Framer page breakpoints. Do not assemble a page. Component creation stays outside this pipeline.
