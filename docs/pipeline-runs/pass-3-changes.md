# Pass 3 changes

Date: 10 November 2026. Branch: `lean-pipeline`. Width: 1200.

The capture code is the same as pass 2. Two Framer writes were tried on the existing project `yFvpcRHhCsaZsXsnbnCp`, after `docs/pipeline-runs/pass-2/review.md`.

## Border colour

The card frame `bfCVtnPd8` now has `border: 1px solid var(--token-xhJ1K1cgR)`. That token is the Line colour style. The write was `borderColor: tree.token("xhJ1K1cgR")`. Width stayed 1px and the style stayed solid.

Why: pass 2 stored the same grey as a raw `rgb()` string, so the reusable colour was unused.

Set aside: a second grey, a spacing-style system, and sending the bare style id. Stack padding and gaps stay the measured pixels. This project has no spacing-style node.

## Letter-spacing

Display 32 (`nKCiQkoBE`) stays `-0.02em`. Framer rejected `letterSpacing: "normal"`. `0` was not sent.

Why: the token keyword cannot be stored. The build report records that sentence. No second text style was created.

## Image alt

Card one’s image control `A2BKjHfDF` is `{ src, alt: "Card one image" }`. Card two’s control is the same asset string with no `alt` key. The shared frame `slVaJcJoN` still has `altText: "Card one image"`. `altText: null` was rejected (`Expected a string`). The frame was not set to `""`.

Why: a missing alt must stay missing, and one shared frame cannot omit a string per instance. `BUILDER.md` was not changed. No code component was added.

Set aside: `ImageAsset.cloneWithAttributes` (it is not a project API), a second card component, and binding `altText` to a variable (already rejected).

## Assumption

The same local fixture is the page under test. Pass 3 re-runs capture, tokens, and digests, then reads this Framer project. It does not build a second page.
