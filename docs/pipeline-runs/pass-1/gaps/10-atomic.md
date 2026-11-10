# Gap 10 — repeated elements and Atomic Design

Requirement: identify repeated elements and classify them with Atomic Design. Unmet on `tests/extractor/fixtures/requirements.html` at 1200px.

## Root cause

The fixture has two sibling `article.card` blocks. Each child’s tags are `img`, `h3`, `p`. They sit in `section.cards`, inside `main`.

`proposeSectionRoots` in `scripts/generic-extractor/sections.ts` returns landmark roots and stops. The page has `header`, `main`, and `footer`, so those three are the only `sectionCandidates`. The cards remain members of `main`. `proposeContentBands` treats `article` as a stop tag, and it never runs once a landmark exists.

`buildComponentInventory` in `scripts/generic-extractor/components.ts` keeps a node only when `componentKind` is `button` or `field`. This fixture has neither, so `components.json` `records` has length 0. `groupBySignature` clusters that same button and field list by computed style. No step compares siblings by tag sequence.

`.cursor/SKILLS/SECTIONS.md` calls a page band an organism and the page a template. It names neither atoms nor molecules, and it has no rule for a repeated card.

## Smallest change

In `buildComponentInventory`, after the button and field scan, group each parent’s visible element children by their own tag plus the ordered tags of their direct children. When a group has two or more siblings, append one record:

- `kind`: `molecule`
- `nodeId`: the first sibling
- `instanceIds`: every sibling id in that group
- `signatureId`: `""`

On this fixture the key is `article:img,h3,p`, and `records` gains one entry whose `instanceIds` are the two articles. Widen `ComponentRecord["kind"]` with `"molecule"`. Leave section candidates as the organisms and the page as the template. Leave single text nodes, images, and links unlabeled.

## Alternatives rejected

A full Atomic Design label on every node. The failure is one unmarked repeated group. Inventorying every text node, image, and link is a larger change than this page needs.

A clustering engine or a model. Style signatures already group buttons. A general clusterer, or a trained classifier, is more machinery than a same-parent tag sequence.

Manual classification only. A designer can say “cards” in the section prompt, and the capture still writes an empty `records` list. The requirement is met when that file marks the repeat.

## Assumption

Atom: a single text node, image, or link. Molecule: a repeated sibling group with the same direct-child tag sequence. Organism: a section candidate. Template: the page. This pass writes the molecule only. Atoms stay unlabeled nodes. Organisms and the template stay the section list and the page.

After review: a molecule is repeated siblings with the same tag and the same ordered child tags. Each sibling gets a record with kind `molecule` and a `signatureId`. One signature definition of kind `molecule` holds those sibling ids in `instanceIds`. The record does not grow an `instanceIds` field. Button and field detection is unchanged, and button signature definitions stay off `components.json`. The file stores the molecule definitions. Atoms stay unlabeled. Header, main, and footer stay section candidates. On the requirements fixture the two articles, child tags `img`, `h3`, `p`, share one molecule signature, and that definition lists both ids.
