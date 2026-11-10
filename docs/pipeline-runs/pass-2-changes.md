# Pass 2 — changes under test

These are the edits made after the pass 1 review. Pass 2 runs the same fixture at 1200px and, if the files hold the new fields, builds one Framer page from them.

Assumption: the fixture is still the right page. A second public site would add noise before the first page meets the list.

## Capture

`scripts/generic-extractor/browser.js` stores `href` on each anchor from `getAttribute("href")`, including an empty string. An image stores `alt` only when the attribute is present, including `""`. The collect result now includes `document.title` and the html `lang`.

`scripts/generic-extractor/extract.ts` copies those two strings onto `structure.json` as `title` and `language`.

Why: pass 1 kept the visible words and dropped the address, the title, the language, and the alt text. The HTML snapshot still had them, and the builder is not allowed to read that snapshot.

Alternative set aside: parse the snapshot later. That makes every later stage depend on a file the builder is told to ignore.

## Digests

`scripts/digest/generate.ts` writes the address on `destination`, not as a top-level `href`. `#` is anchor, a path starting with `/` is internal, `http` and `https` are external, `mailto:` is email, `tel:` is phone. An empty href and `javascript:` are `uncertain`. A missing attribute is `missing`.

An image alt string is copied onto the asset. An `img` with no alt adds warning `alt-missing`.

`scripts/digest/cli.ts` takes `--tokens`. When that file is present, a digest token's `proposal.name` becomes the matching name from `tokens.json`. The local id stays. `.cursor/SKILLS/COLLECTOR.md` runs tokens first, then digests, so the names exist.

Why: pass 1 numbered styles inside each digest (`typography.0001`), and the same number meant a different style in another section. The token file already had a stable name.

Alternative set aside: invent a third id. The token name is already the name the builder creates in Framer.

`scripts/digest/schema.ts` still accepts a destination of `unsupported`, so the older example file validates.

## Repeated cards

`scripts/generic-extractor/components.ts` adds a molecule when visible siblings share a tag and the same ordered child tags. One signature definition lists those node ids. Each sibling record has `kind: "molecule"` and that `signatureId`. Only molecule definitions are written to `components.json`.

Why: pass 1's inventory stored buttons and fields, so the two article cards were invisible as a repeated component.

Alternative set aside: a clustering pass over every node. The sibling tag sequence is enough for this fixture.

## Instructions

`.cursor/SKILLS/BUILDER.md` now says: the layer tag is the digest node tag; text and images are built-in variables; native layers are the default; upload `usablePath` onto a frame image; nest layers by `parentId`; an inline link stays inside its text; use an alt or a destination that a designer edited in the digest.

`docs/classification.md` defines atom, molecule, organism, and template and points at the skill cards for the commands.

Why: pass 1 had a workflow and no classification rules, and the builder card did not state the Framer constraints.
