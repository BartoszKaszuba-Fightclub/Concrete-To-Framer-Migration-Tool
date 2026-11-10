# Preserve H1–H6 independently of visual styling

## 1. Root cause

`roleOf` in `scripts/design-tokens/collect.ts` returns the element tag, so the fixture `h1` ("Page title") and `h2.same` ("Same look as the title") are roles `h1` and `h2`. The style key is family, size, weight, line height, letter spacing, transform, and colour. Both are Georgia, 32px, 700, 40px, so they share one entry and both roles sit on it.

On emit, roles are taken in `ROLE_ORDER` and the first `h1`–`h6` becomes `heading`. That order starts at `h1`, so the style is `text/h1/georgia-32px-700-40px-normal-none` and `framer.tag` is `"h1"`. `roles` stays `["h1", "h2"]`. Style creation reads `framer.tag`, so the shared look is created as an h1.

The digest keeps the level. `generate.ts` copies `source.tag` onto the node and keys typography on font measurements only. Clip-02 has tag `h1` and tag `h2` on `typography.0007`.

`schema.ts` rejects a second text style with the same measurements. Two styles that differ only by tag fail that check.

## 2. Smallest change

Two ways to keep that h2 an h2 when styles are created:

- Split the look. Add the heading role to the style key and the schema uniqueness key, and emit a second `createTextStyle` with `framer.tag` `"h2"`.
- Keep one style. The digest node tag already stores `h1` or `h2`. When more than one heading role shares a style, emit `framer.tag` `"p"` so creation does not stamp every user as h1. Set each text layer's tag from that node tag. Phase 2 already lists that tag.

The second is smaller. It adds no style and leaves the uniqueness rule alone. The first splits one look even though the node tag already carries the level. Pick the second.

## 3. Alternatives rejected

- Leave `framer.tag` as `"h1"` and treat `roles` as the record of `h2`. The builder creates the tag from `framer.tag`.
- Put the tag on the digest typography id. The node tag is already stored, and `typography.0007` is the shared look.
- One style per role with the same measurements. That is the split above, and the schema rejects the duplicate.

## 4. Assumption

A text layer can use the shared visual style and keep the digest node tag. This pass did not open Framer. If applying the style overwrites the layer tag and that tag cannot be set from the node afterwards, one style cannot carry both levels and the styles have to be split.

After review: the layer tag is the digest node tag, and the shared style is not retagged as p and is not split.
