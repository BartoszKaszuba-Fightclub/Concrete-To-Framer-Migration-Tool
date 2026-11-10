# Nested Framer layers

Requirement: translate nested source HTML into clean Framer layers, stacks, and components.

## Root cause

The digest hierarchy is already enough for a stack. It does not still contain wrappers a builder would copy blindly.

`clip-02.json` (main, root `n-000011`) keeps `parentId`, `order`, and `childIds`. `provenance.folded` is empty. The tree matches the fixture. `main` is `layout.display` `block` with 24px padding. Its children are the headings, `p` `n-000018`, and `section` `n-000020`. That section is `flex`, with `columnGap` 16px, and two `article` children. Each article has 12px padding, a 1px border, and an 8px radius, and contains `img`, `h3`, and `p`. `simplify` in `scripts/digest/generate.ts` folds only an effect-free wrapper with the same box as its children. Nothing here qualified. Those three parents are frames.

Pass 1 created no Framer layers. `.cursor/SKILLS/BUILDER.md` asks for a flat layer list, then auto layout. It never parents layers from `hierarchy`, so the list drops `section` > `article` > `img`, `h3`, `p`. Those three parents have no text run of their own. `text.exact` is the children joined, and painting it would stamp that copy onto the stack.

`computed.json` stores no flex direction or alignment. The fixture rule is `display: flex; gap: 16px`.

## Smallest change

One rule in `BUILDER.md` phase 2, using fields the digest already has. One layer per hierarchy node, parented by `parentId`, ordered by `order`. A node with `layout.display` `flex` is a horizontal stack. A `block` parent is a vertical stack. Gap and padding come from that node’s `styles.spacing`. Text on a layer is the runs whose `nodeId` is that node, so `main`, `section`, and `article` stay empty stacks. Absolute position stays the existing overlay exception. Leave the digest schema as it is.

## Alternatives rejected

Unwrap more nodes in `simplify`. This clip has nothing left to fold. Removing `section` or `article` would lose the row and the card border.

Store `flex-direction` and alignment on the digest. Those values were never measured, and this fixture does not set them.

Call the gap closed once Framer opens. The flat layer list can still place the card contents in one stack.

## Assumption

When `layout.display` is `flex` and no direction was stored, the stack is a row. That matches CSS and `n-000020`. The inline link `n-000019` stays a text run inside `p` `n-000018`. The card `img` nodes stay layers because they have `assetIds`.

After review: one layer is built per digest node, nested by parentId and ordered by hierarchy order, display flex is a horizontal stack, a block parent stacks vertically, and an inline link stays inside its text run.
