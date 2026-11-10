# Styles

Requirement: map text, typography, colours, and spacing to the correct components and reusable styles.

## Root cause

Text styles and the Ink colour are already applied. Spacing values 24, 16, 12, and 8 are already on the stacks as pixels. Project `yFvpcRHhCsaZsXsnbnCp` has no spacing-style node.

Display 32 (`nKCiQkoBE`) was given `letterSpacing` `"normal"`, the capture token. `letterSpacing` accepts a length in em or px, or a dynamic value. `"normal"` is not stored. The rejection left `-0.02em`.

Card frame `bfCVtnPd8` stores the border as the raw string `1px solid rgb(200, 200, 200)`. Colour style Line (`xhJ1K1cgR`, light `rgb(200, 200, 200)`) is unused on that border. A colour style is `tree.token(id)`, which is `var(--token-<id>)`, shown on `fill`. `borderColor` is a string. The bare id is the wrong value.

## Smallest change

Leave `nKCiQkoBE` at `-0.02em`. Do not write `letterSpacing`. Do not send `0`. Add one build-report sentence: Display 32 (`nKCiQkoBE`) stays `-0.02em` because `letterSpacing: "normal"` was rejected.

Leave the stack pixels. Do not add spacing styles.

Patch `bfCVtnPd8` with `borderColor: tree.token("xhJ1K1cgR")` only. Read `border`, `borderColor`, `borderWidth`, and `borderStyle`. Stop if the colour is not `var(--token-xhJ1K1cgR)`, or if the border is no longer 1px solid.

## Alternatives rejected

Sending `0`, `0px`, or `0em`. The token is the keyword `normal`. `-0.02em` is what Framer kept.

A new text style, or rewriting Display 32. `"normal"` still cannot be stored.

Spacing styles for 24, 16, 12, and 8. The pixels are already on the stacks.

The bare id `xhJ1K1cgR` as `borderColor`. The value is `tree.token("xhJ1K1cgR")`.

A second grey, or the raw rgb string. The reusable colour is Line.

## Assumption

`borderColor` is a string, so the token can fit, and there is no border example. The read-back checks that the colour is `var(--token-xhJ1K1cgR)` and the border stays 1px solid. Stack pixels already meet spacing.

## After review

Leave letter-spacing at `-0.02em` and keep the one build-report sentence. Do not send `0`. Do not add spacing styles. The border patch is `borderColor: tree.token("xhJ1K1cgR")` on `bfCVtnPd8`, then stop if the token is not stored or the border is no longer 1px solid.
