# Alt text

Requirement: preserve available image metadata, including alt text, and flag missing essential metadata.

## Root cause

The digest already stores alt `Card one image` on card one and warning `alt-missing` on card two, which has no alt attribute.

Both instances share frame `slVaJcJoN` in component `XbZefmp80`. Its `altText` is the literal `Card one image`, so card two shows card one's alt.

`altText` is a string. `tree.ref` of `EVs8eEs0Z` was rejected (`expected a string`). `api.controls.components` lists image `A2BKjHfDF`, title `B2KDuUS5p`, and body `pNMqKqNCJ` only, so `$control__EVs8eEs0Z` was rejected.

## Smallest change

Keep the digest warning. Read `$control__A2BKjHfDF` on both instances. Reuse that asset reference as `src`.

Set the first instance to `{ src, alt: "Card one image" }`. Read it back. If `alt` is absent, stop.

If `alt` is stored, set the second instance to the same `src` and omit `alt`. Do not write `alt=""`. Read both controls and the frame `altText`.

If card two still shows `Card one image`, clear `altText` on `slVaJcJoN` and read again. If card one lost that string, put it back on the frame and stop.

Edit `BUILDER.md` only when card one stores `Card one image` and card two does not. One sentence: the image-control value is `{ src, alt }` from the captured alt, and `alt` is omitted when the attribute is absent.

## Alternatives rejected

A code component. Control `A2BKjHfDF` already exists.

`ImageAsset.cloneWithAttributes`. It is not a project API.

Binding `EVs8eEs0Z`. Framer rejected the ref and the `$control__` write.

A second component, a variant, or another upload of `pixel.png`. The articles are one molecule, and the stored reference is the `src`.

## Assumption

An image variable value may be `{ src, alt }`. Clearing the shared frame before the read can drop `Card one image` if the control `alt` is not what the instance shows.

After review: set `A2BKjHfDF` on each instance to `{ src, alt }`, reusing the stored asset. Omit `alt` on card two. Clear `slVaJcJoN` only if card two still shows `Card one image` after that set. No code component. No `BUILDER.md` edit unless that read succeeds.
