# Digest contract

Schema version **2.0.0**. One digest is the only builder input for one component at one captured width and state. The builder does not open structure files, computed-style files, or separate media, link, or widget folders.

This document is the human contract. `scripts/digest/schema.ts` is the machine check. `docs/poc-v2/examples/button.digest.json` is a validated example. Nothing here marks a POC v2 acceptance criterion passed.

## 1. Capture identity

| Field | Required | Meaning |
| --- | --- | --- |
| `schemaVersion` | yes | Always `"2.0.0"` for this contract. |
| `idStability` | yes | Always `"capture-local"`. |
| `capture.captureId` | yes | Caller-supplied id. If omitted, the generator derives `slug-width-state` and sets `config.captureIdDerived`. |
| `capture.url` | yes | Requested page URL. |
| `capture.finalUrl` | yes, as a measurement | URL after navigation. Taken from the caller, otherwise from `structure.url` (`page.url()`). |
| `capture.language` | yes, as a measurement | BCP 47 tag when the caller supplies it. The structure file does not contain it. |
| `capture.timestamp` | yes, as a measurement | Caller-supplied instant. The extractor does not write one. |
| `capture.viewport` | yes | `{ width, height }` in CSS pixels. A numeric zero is a real measurement. A missing number fails validation. |
| `capture.state` | yes | Captured interaction state. Only `default` is produced today. |
| `capture.config` | yes | Capture configuration that is not a measured style: slug, source paths, and caller keys. |

## 2. Component, hierarchy, and ids

| Field | Meaning |
| --- | --- |
| `component.id` | Caller name for this component definition. |
| `component.type` | `button`, `field`, or another caller type such as `section`. |
| `component.rootIds` | Capture-local ids of the source roots. For `button` and `field`, each root is one occurrence. |
| `hierarchy` | Preorder of kept nodes with parent, sibling index, and child ids. |
| `nodes` | Kept nodes keyed by the capture-local id. |
| `provenance.roots` | Digest root to source id. |
| `provenance.folded` | Wrappers removed by the simplification rule, with the child ids that replaced them. |
| `provenance.omitted` | `display:none` subtrees that were not promoted. |

Node ids are the extractor ids (`n-` plus a per-capture sequence). They join structure and computed style inside one capture. **Ids are not stable across recaptures.** A new capture can assign a different id to the same visual control. Do not store them as cross-capture keys.

`selector`, `domId`, `classes`, and `sourceOrder` are provenance. Grouping does not read them.

## 3. Text, runs, and label nodes

`text.exact` is the visible text of that node and its kept descendants, in source order, with no added separators. `text.runs` points each direct string at the node that owns it and at that node's typography token.

Every button or field occurrence has `labelNodes`. Each entry is a node id, the exact text on that node, and `typographyRef`. If the control has no text, the label entry is the control itself and the text measurement is **empty**, not missing. Label typography is the label node's computed style, which can differ from the control's own type. The example is that case.

Visible link labels are `links[].label`. `links[].destination.status` is `unsupported`. The digest has no `href` and no destination URL.

## 4. Measured styles and tokens

Each kept node stores resolved typography, fill, border (per side: width, style, colour, and four radii), spacing (padding, margin, row and column gap), opacity, and shadow. Token ids sit beside those resolved values. A token's `proposal.name` and `proposal.roles` are names for reuse. They do not replace or rewrite the measured string.

Colour roles (`text`, `fill`, `border`) are proposals. The same measured colour string is one colour token. Different strings are different tokens, including `rgb(...)` versus `rgba(...)`.

Occurrences group by observed visual signature:

- tag, control kind, and field type
- control typography and label typography
- fill colour and background image
- per-side border, radius, and `boxShadow`
- painting pseudo-element colour and border

Labels, classes, selectors, geometry, and spacing do not form the group. Equivalent signatures share one typography token, one fill token, and one border token. Different colours, borders, or type stay in different groups. Spacing still has its own token per exact spacing value, so two controls can share a group and keep different padding.

Control kind is generic. A `button` element, or an input whose type is `button`, `submit`, `reset`, or `image`, is a button. Other fields are fields. An anchor with visible text and either a positive border or a non-transparent fill is a button. Other anchors with text are links. Classification does not use site selectors or class names.

## 5. Geometry, layout, stacking, media, and pseudos

`geometry` is the structure box: document `x`, `y`, `width`, and `height`. Numbers are measured. Zero is a real coordinate or size. `status: "missing"` means the box was not captured and validation fails.

`layout` stores `display`, `visibility`, `position`, measured `opacity`, and `siblingOrder` after simplification. `zIndex` is `"auto"` with `derivation: "inferred"` when the extractor did not set a `z-index` trait (its trait rule treats computed `z-index: auto` as no trait). If the trait is present, the value is missing and validation fails, because the current extractor does not store the number.

`effects` is empty when transform, clipping, and filter traits are absent. A present trait without a stored computed value fails validation.

`assets` holds each `node.media` url: `originalUrl`, `usablePath`, `naturalWidth`, and `naturalHeight`. Nodes reference those records with `assetIds`. Inline SVG markup stays on `boundary.markup` and is not an asset url. Painting `::before` and `::after` records are `pseudos`. A flagged pseudo with no computed record fails validation.

## 6. Zero, empty, unsupported, and missing

| Status | Use |
| --- | --- |
| `value` | A measured string, including a transparent colour and a non-zero length. |
| `zero` | A measured numeric zero, such as `0px`, opacity `0`, or a zero natural size. This is not omission. |
| `empty` | A measured absence: `""`, `none` for shadow, border style, background image, or text-transform, or no text runs. The raw keyword is kept in `value` when the computed string was `none`. |
| `unsupported` | The property was captured but is not a length. `letter-spacing: normal` and `gap: normal` use this status and keep `raw`. |
| `missing` | The field applies and the capture did not contain it. |

Validation fails when a required measured field is `missing`, when a reference does not resolve, or when identity or geometry is absent. Explicit `missing` on font availability, usable asset path, natural size, screenshot, or crop is a recorded gap. It does not invent a substitute, and it does not by itself fail schema validation. A later fidelity check still cannot pass that gap.

## 7. Simplification

Remove a wrapper only when it has no meaningful text or content, no paint or pseudo-element, no spacing, layout, transform, clipping, or stacking effect, and its children retain equivalent order and geometry.

Operational checks, all required:

- no trimmed text, media, field, boundary, or markup
- `visibility: visible`, opacity `1`, `position: static`, and display `block` or `inline`
- no paint, spacing, layout, transform, clip, or stacking trait
- computed style present and showing no padding, margin, border, gap, fill, shadow, opacity, or pseudo-element effect
- the wrapper box matches the union of the kept children's boxes within 0.5px on each edge

That 0.5px edge tolerance is this generator's reading of "equivalent geometry". It matches the comparison already used by the extractor's reconstruction helper. Child order is unchanged. The removed id is recorded in `provenance.folded` and is not a dangling reference.

Requested component roots are kept. `display:none` subtrees are omitted, not folded. Styled labels, flex and grid wrappers, `display: contents`, absolute positioning, negative margins, hidden visibility, and any node whose box is not the children's union stay.

## 8. Example

The historical spec path `Database/digest/nesting/en/1500/default/` and clip-04 do not match this checkout. The capture slug is **nl**. The example is not a clip file. It is one button occurrence:

| Item | Value |
| --- | --- |
| Structure | `Database/digest/nesting/nl/1200/default/structure.json` |
| Computed style | `Database/digest/nesting/nl/1200/default/computed.json` |
| Screenshot reference | `Database/Screenshots/nl/1200/default/screenshot.png` |
| Control | `n-000701`, tag `button`, text label on child `n-000702` (`NL`) |
| Also kept | `n-000703` (icon wrapper; its box is not the svg's box) and `n-000704` (svg boundary, one untraversed child, `::before`) |
| Viewport and state | 1200 × 900, `default` |
| URL | `https://yellowhive.com/nl` (`structure.url`) |
| Language | `nl`, read from `<html lang>` in `Database/snapshots/nl/1200/default/snapshot.html` and passed into the generator. It is not a structure field. |
| Timestamp | `2026-10-23T09:32:35.037Z`, the structure file's modification time, passed in because the extractor stores none. |

Measured values copied from that capture, not from the regression notes:

| Node | Field | Measured value |
| --- | --- | --- |
| `n-000702` | font | `Lexend, sans-serif`, `18px`, `700`, line-height `18px`, letter-spacing `normal` |
| `n-000702` | colour | `rgb(249, 176, 15)` |
| `n-000701` | font | same family, size, and weight; line-height `21.008px` |
| `n-000701` | fill | `rgba(0, 0, 0, 0)` |
| `n-000701` | border | `2px` `solid` `rgba(0, 0, 0, 0)`, radius `6px` |
| `n-000701` `::after` | caret | empty content, border-top `5px` `solid` `rgb(249, 176, 15)` |

The label line-height and the control line-height are different tokens. Font load status and the component crop are explicit `missing` measurements. No usable font file or crop exists in the capture.

Lexend, 18px, 700, 21px, and 2px borders are regression clues from the v1 evaluation. They are not constants in the generator. On this node the 2px border is transparent, the control line-height is `21.008px`, and the visible label is `18px`.

## 9. Validation and commands

`validateDigest` throws `DigestValidationError` when:

- `schemaVersion` is not `2.0.0` or `idStability` is not `capture-local`
- capture id, url, viewport, or state is absent
- a node, token, asset, crop, label, run, or group reference does not resolve
- geometry or a required computed field is `missing`
- a button or field occurrence has no `labelNodes`
- a flagged pseudo, z-index, transform, clip, or filter has no measured value

`npm test` runs Playwright and does not run this suite. Package scripts are unchanged.

```text
node --import tsx scripts/digest/cli.ts --structure <structure.json> --computed <computed.json> --component-id <id> --component-type button --root <nodeId> --out <digest.json>
node --import tsx --test tests/digest/digest.test.ts
```

The example command, run from the repository root:

```text
node --import tsx scripts/digest/cli.ts \
  --structure Database/digest/nesting/nl/1200/default/structure.json \
  --computed Database/digest/nesting/nl/1200/default/computed.json \
  --component-id button --component-type button --root n-000701 \
  --out docs/poc-v2/examples/button.digest.json \
  --url https://yellowhive.com/nl --final-url https://yellowhive.com/nl \
  --language nl --timestamp 2026-10-23T09:32:35.037Z \
  --capture-id nl-1200-default --state default --viewport 1200x900 \
  --screenshot Database/Screenshots/nl/1200/default/screenshot.png
```

The CLI refuses to write a digest that fails validation. Repeated generation of the same input is semantically identical, including object key order.

## 10. What the extractor must emit

The generator joins `structure.nodes` to `computed.nodes` by node id. It does not read the DOM. For every node that survives simplification, the frozen input needs:

| Source | Fields |
| --- | --- |
| Structure node | `tag`, `selector`, `parentId`, `order`, `children`, `box`, `render.display`, `render.visibility`, `render.opacity`, `render.position`, `traits`, optional `content`, `classes`, `domId`, `media`, `field`, `boundary`, `untraversedChildren`, `markup` |
| Computed node | The current computed property list: font family, size, weight, line-height, letter-spacing, text-transform, colour, background colour and image, opacity, four padding sides, four margin sides, row and column gap, four border widths, styles, and colours, four radii, and `boxShadow` |
| Painting pseudos | The same computed properties plus `content`, `width`, and `height` |
| Structure file | `url`, `slug`, `viewport`, `state`, `warnings` |
| Computed file | `nodes`, `skipped`, `unresolved` |

Caller input that the extractor does not currently write, and that the digest records as `missing` until supplied: `captureId`, language, timestamp, screenshot path, per-component crop, usable asset path, natural width and height, and font source or load status.

If a trait is `z-index`, `transform`, `clip`, `overflow`, or `filter`, validation fails until the computed value is stored. The current extractor records the trait and not the value. Position itself is already on `render.position`.

## 11. Questions and evidence

**Are the recorded `en` paths the capture slug?** The spec names `Database/digest/nesting/en/`. The checkout has `Database/digest/nesting/nl/` for `https://yellowhive.com/nl`. The example uses `nl` at 1200 × 900.

**Which node is the button example?** `n-000701` is a `button` in that capture. Its visible label is the child span `n-000702`. Filled gold CTAs in the same file are anchors such as `n-000737`; they are not this example.

**Can the builder ignore label nodes and copy the control's line-height?** No. On `n-000701` the control line-height is `21.008px` and the label span is `18px`. Both are stored, with different typography tokens.

**Do two buttons with the same label share a style?** No. Grouping ignores the label. Tests show two colours remain two groups, and two controls with the same measured colours, borders, and type share one definition even when labels and classes differ.
