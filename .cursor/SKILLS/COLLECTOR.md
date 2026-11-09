---
name: collect-page
description: Captures one public page at one width, writes the capture files, then writes schema 2.0.0 digests and the design-token file in this repo. Use when asked to collect, capture, digest, or write design tokens for a public page. Does not open Framer and does not define sections.
---

# Collect a page

## Responsibilities

Collect every measurement the current pipeline already collects, and save every file the current pipeline already saves. Then write the design-token file and the schema 2.0.0 digests in this git repo.

Do not open Framer. Do not create styles. Do not define organisms or templates. Do not build a page. Do not draw sections or write a section prompt.

## Order

Do the work in this order. Do not open the website again after the capture returns.

1. **One capture.** One Playwright page, one width. The capture command writes structure, computed styles, the simplified tree, the button and field inventory, visual signatures, the full-page screenshot, and the HTML snapshot. Do not run a second capture to get tokens or digests.
2. **Design tokens next.** Run one process over the two files that capture just wrote (`structure.json` and `computed.json`). Tokens do not depend on digests. Do not walk the live DOM or the screenshot to invent colours or type.
3. **Digests last.** Each digest is a separate process that re-reads those same two files. Generate digests only after the token file exists, so a token failure is known before the digest loop. Do not hand-edit JSON to make validation pass.

## Capture rules

Default viewport: **1200 × 900**. State: **default**. Pass one width with `--widths`. Extra width values are ignored with a warning. Do not ask the developer to confirm breakpoints. Do not capture a second width.

On that same page, in this order:

1. Open the public page.
2. Click the cookie banner’s visible reject or dismiss control.
3. Leave that banner out of the element tree and the styles. Skip a remaining cookie, consent, OneTrust, or Cookiebot subtree and its stylesheet.
4. Wait until fonts and images settle and no covering overlay remains.
5. Only then read CSS, walk elements, and measure styles.

A covering overlay with no dismiss control fails the run and writes nothing. A visible text, button, or field node missing font or colour fails the run and writes nothing.

The CSS read records `@media` min-width and max-width, and any stylesheet that could not be read. Those notes are stored on the capture. They do not add widths.

Structure and computed style come from one walk. Node ids are capture-local (`n-` plus a sequence). They join the files of this capture. They are not stable across a new capture.

Measured style includes font, colour, background, spacing, gap, border, radius, shadow, opacity, and, when present, `zIndex`, `transform`, `filter`, `backdropFilter`, `clipPath`, `maskImage`, `overflowX`, and `overflowY`. Painting `::before` and `::after` are included.

Sections are chosen automatically during capture: header, hero, main, footer, nav, or content bands. `--sections` is ignored.

`--components` accepts `all`, `button`, or `field`. Use `all` unless the user asked for one kind. Each button or field occurrence is a component record or a `missing-measurement` blocker. Group them by colour, border, and typography. The label is not part of the group.

Remove a wrapper from the simplified tree only when it has no meaningful text, no paint or pseudo-element, no spacing, layout, transform, clipping, or stacking effect, and its children keep order and geometry. Hidden nodes stay in `structure.json` and are listed as dropped in `reconstruction.json`.

Capture the initial appearance only. Do not open menus, accordions, tabs, or carousel slides.

```bash
npm run extract:generic -- <url> [--widths 1200] [--height 900] [--slug name] [--out Database] [--settle-timeout 10000] [--components all|button|field]
```

Defaults: height `900`, settle timeout `10000`, max nodes `0`, output directory `Database`. Read `scripts/generic-extractor/cli.ts` before changing flags.

## Files the capture writes

`<slug>` comes from the URL path unless `--slug` is set. `<width>` is the one selected width.

- `Database/digest/nesting/<slug>/<width>/default/structure.json` — full tree, `sectionCandidates`, warnings, excluded consent nodes. Each node box is `{x, y, width, height}` in CSS pixels. `x` is the distance from the left edge of the page. `y` is the distance from the top of the page.
- `Database/digest/nesting/<slug>/<width>/default/computed.json`
- `Database/digest/nesting/<slug>/<width>/default/reconstruction.json`
- `Database/digest/nesting/<slug>/<width>/default/components.json`
- `Database/digest/nesting/<slug>/<width>/default/signatures.json`
- `Database/Screenshots/<slug>/<width>/default/screenshot.png`
- `Database/snapshots/<slug>/<width>/default/snapshot.html` — page HTML after the banner is gone
- `Database/digest/nesting/<slug>/<width>/default/assets/` and `assets.json` — one local file per media URL. `usablePath` is that local path, never a remote URL. A failed download leaves `usablePath` missing. Inline SVG stays on `boundary.markup` and is not downloaded.

Do not write `elements.json`, `report.json`, `matches.proposed.json`, `pending-decision.json`, `sections.approved.json`, or `sections-preview.png`.

## Design tokens

```bash
node --import tsx scripts/design-tokens/cli.ts \
  --structure Database/digest/nesting/<slug>/<width>/default/structure.json \
  --computed Database/digest/nesting/<slug>/<width>/default/computed.json \
  --language <language>
```

This writes `Database/digest/tokens/<slug>/<width>/tokens.json`. It must validate against `docs/poc-v2/design-tokens.schema.json` (`scripts/design-tokens/schema.ts`).

Include only tokens measured on the captured page. Equal values appear once. Keep `letterSpacing` as `normal` when that keyword was measured. Do not replace it with `0`.

Take `<language>` from the page’s `html` `lang` when the capture recorded it. Otherwise take it from the URL path (for example `nl`).

Do not call `scripts/design-tokens/apply.ts`.

## Digests

After the token file is written, write one schema `2.0.0` digest for every button and field record in `components.json`, and one digest for every `sectionCandidates` entry. For a section, use that section’s root node and component-type `section`.

Contract: `docs/poc-v2/digest-contract.md`. Validation: `scripts/digest/schema.ts`. Example: `docs/poc-v2/examples/button.digest.json`.

Join structure and computed style by the capture-local node id. The digest holds exact visible text, label-node styles, measured geometry, colours, type, spacing, borders, media references, and warnings. Letter-spacing `normal` stays the keyword `normal`.

```bash
node --import tsx scripts/digest/cli.ts \
  --structure Database/digest/nesting/<slug>/<width>/default/structure.json \
  --computed Database/digest/nesting/<slug>/<width>/default/computed.json \
  --component-id <id> \
  --component-type <button|field|section> \
  --root <nodeId> \
  --out Database/digest/nesting/<slug>/<width>/default/digests/<id>.json
```

If validation fails, fix the extractor or the digest generator. Do not hand-edit the JSON.

Read `scripts/digest/cli.ts` before changing flags.

## Checks

- `node --import tsx --test tests/extractor/*.ts`
- `node --import tsx --test tests/digest/digest.test.ts`
- `node --import tsx --test tests/design-tokens/*.ts`

## Done

Report the URL, slug, width, the file paths written, how many digests, how many colours and text styles are in the token file, and any capture warnings. Do not propose Framer edits.

