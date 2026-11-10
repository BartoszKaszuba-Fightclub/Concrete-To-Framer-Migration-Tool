# Gap: Framer controls

Requirement: expose text, images, colours, variants, and interaction settings through normal Framer controls.

## Root cause

Captured values land on layers as literals. Nothing binds them to a Framer control. Pass 1 opened no project, so no component exists. `.cursor/SKILLS/BUILDER.md` phase 2 places layers with the captured text, the local image path, and the colour style. It never mentions a component variable. `scripts/` has no property-control code. The extractor stores one state, `default` (`DEFAULT_CAPTURE_STATE` in `scripts/generic-extractor/width.ts`). `tests/extractor/fixtures/requirements.html` has no hover, focus, or second appearance.

## Smallest change

Add one step to `BUILDER.md` phase 2. On the organism, bind the text and image variables Framer already provides. The captured value is the default. Those variables are the properties panel on a native component.

On this fixture:

- Heading text can be a control. One text variable per heading: `Page title`, `Same look as the title`, `Section three`, `Section four`, `Section five`, `Section six`, `Card one`, and `Card two`.
- Each image can be a control. One image variable for the logo, one for the first card image, and one for the second card image. The default is the captured file.

Colours stay the colour styles phase 1 creates from `tokens.json`. Those styles are the colour control for this page.

Variants and hover wait. The capture has no second state, and the stylesheet has no hover or focus rule. Those controls need a recorded second appearance before they can be set.

## Alternatives rejected

A code component with property controls can list text, image, colour, a variant, and a hover flag. Framer's own text and image variables already cover what this fixture can support. The variant and the hover flag would have no captured state. Custom code needs a reason this fixture does not give.

A writer under `scripts/` would be a second Framer path. This branch removed `apply.ts` so Framer writes stay in the builder.

A variant or a hover control filled from the default capture would store a state the page does not have.

## Assumption

Framer's built-in component variables are the normal controls. This pass did not open a project, so none of them exist yet. Body copy, link labels, and the footer line stay as layer text. The next build adds heading and image variables only. Colour styles, once created, are the colour control.

After review: each text layer and each image is bound to a built-in Framer variable, the default is the captured value, and no variants are added because the capture has one state.
