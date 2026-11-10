# Map styles

Requirement: map text, typography, colours, and spacing to the correct components and reusable styles.

## Root cause

The digest and the token file name the same looks with different ids, so a builder cannot apply the token that belongs to a node.

`scripts/digest/generate.ts` `assignIds` numbers styles inside one digest (`typography.0007`, `colour.0002`, `spacing.0001`). `tokenRecords` turns that into `proposal.name` (`typography-0007`) and stores no measurements. `scripts/design-tokens/collect.ts` names by value. `Database/pipeline-runs/pass-1/tokens.json` has 4 colours (`color/rgba-20-20-20-1`), 7 text styles (`text/h1/georgia-32px-700-40px-normal-none`), and 9 spacing tokens (`spacing/margin/bottom-12px`).

In `clip-02.json` the h1 and the h2 share `typography.0007`. The token name is `text/h1/georgia-32px-700-40px-normal-none`. `colour.0002` is `rgb(20, 20, 20)`; the token is `color/rgba-20-20-20-1`. `spacing.0001` is margin-bottom 12px; the token is `spacing/margin/bottom-12px`. Across digests, `typography.0001` is the blue 16px link in `clip-01` and `clip-02`, and the dark 16px footer in `clip-03`.

`.cursor/SKILLS/BUILDER.md` creates styles from those names, then reads size, weight, and line height off the node. Pass 1 opened no Framer project. The node still would not name the token: `rgb` is not `rgba`, and one spacing id is the whole box while tokens split padding, margin, and gap.

## Smallest change

Use the token `name` as the only join key. `collect.ts` already chooses it. `generate.ts` writes that string as the digest ref and the `tokens` key for the whole page, instead of `assignIds` per clip.

On this capture those three token names replace `typography.0007`, `colour.0002`, and `spacing.0001`. `parseColour` turns `rgb(20, 20, 20)` into `rgba(20, 20, 20, 1)` before the colour is named. `proposal.name` is that same string. The builder looks up `tokens.json` by name. Phase 1 still creates the styles.

## Alternatives rejected

Matching size, weight, and colour by eye. Link and body share 16px/400, and a spacing bundle is not a split token.

Copying digest ordinals into `tokens.json`. `typography.0001` is a different style in the footer than in the header.

Storing node ids on each token. One node has several colour slots, and a node id does not say which slot the token fills.

Copying measurements onto digest tokens and ignoring `tokens.json` names. That is a second set of styles.

## Assumption

A fully transparent fill is not a colour token, because `collect.ts` skips alpha 0 paint, and the builder skips that fill. Each node on this fixture has one non-zero spacing kind, so one `spacing.ref` holds one name. `letterSpacing: normal` stays the keyword the token file already stores.

## After review

The digest reads `tokens.json`, matches colours, text styles, and spacing on measurements, and copies `name` onto `proposal.name`. `assignIds` and the local token id stay. If `--tokens` is omitted, the local name stays.
