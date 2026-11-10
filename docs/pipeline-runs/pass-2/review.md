# Pass 2 review

## Styles — change

Leave letter-spacing and the stack pixels. `letterSpacing` accepts a length in em or px, or a dynamic value. `"normal"` is not stored, and the rejection left `-0.02em`. Do not send `0`. One report sentence is the remainder. There is no spacing-style node. Pixels 24, 16, 12, and 8 already cover spacing.

The border step is not safe as written. A colour style is `tree.token(id)` → `var(--token-<id>)`, shown only on `fill`. `borderColor` is a string, so the token fits, but there is no border example. The bare id `xhJ1K1cgR` is the wrong value.

## Alt — change

`altText` is a string, so the rejected variable binding stands. A code component stays out. `ImageAsset.cloneWithAttributes({ altText })` is not a project API. An image variable value may be `{ src, alt }`. Reuse the asset reference already on `A2BKjHfDF`. Do not upload the file again.

Clearing `slVaJcJoN` first can drop `Card one image` if that control `alt` is not what the instance shows. Wait for the read. Keep the digest `alt-missing` warning. Card two has no alt attribute, so omit `alt`. Do not write `alt=""`. Edit `BUILDER.md` only after that read succeeds.

## Implement

Styles:

1. Leave `nKCiQkoBE` at `-0.02em`. Do not write `letterSpacing`.
2. Add one build-report sentence: Display 32 (`nKCiQkoBE`) stays `-0.02em` because `letterSpacing: "normal"` was rejected.
3. Leave the stack pixels. Do not add spacing styles.
4. Patch `bfCVtnPd8` with `borderColor: tree.token("xhJ1K1cgR")` only. Read `border`, `borderColor`, `borderWidth`, and `borderStyle`. Stop if the colour is not `var(--token-xhJ1K1cgR)`, or if the border is no longer 1px solid.

Alt:

1. Read `$control__A2BKjHfDF` on both card instances. Do not clear `slVaJcJoN`.
2. On the first instance only, set `{ src: <the stored asset reference>, alt: "Card one image" }`.
3. Read it back. If `alt` is absent, stop.
4. If `alt` is stored, set the second instance to the same `src` and omit `alt`. Read both controls and the frame `altText`.
5. If card two still shows `Card one image`, clear `altText` on `slVaJcJoN` and read again. If card one lost `Card one image`, put that string back on the frame and stop.
6. Only when card one stores `Card one image` and card two does not, add one `BUILDER.md` sentence: the image-control value is `{ src, alt }` from the captured alt, and `alt` is omitted when the attribute is absent.
