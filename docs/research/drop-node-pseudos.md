# Node identity fields and pseudo copies

Question: which of these fields have to stay, because dropping them costs a Framer layer the builder skill sets, or because dropping them adds a second store or a new lookup. The rest can go.

Quality here is the builder layer list in `.cursor/SKILLS/BUILDER.md:38`: text, box, fill, border, radius, padding, gap, links, images, svg, and overlay placement (`.cursor/SKILLS/BUILDER.md:42`).

`measurePseudo` and the builder read these pseudo properties, and this drop does not include them: `content`, `color`, `backgroundColor`, `backgroundImage`, border side width, style, and color when the width is a value, `width`, `height`, `opacity` (`scripts/digest/generate.ts:911-929`, `tests/digest/digest.test.ts:434-437`, `.cursor/SKILLS/BUILDER.md:38`).

None of `domId`, `role`, or `selector` is also stored on the computed node. The digest does not read them from computed. They are not duplicates ready to leave the extractor on that ground. Pseudo keys are computed-only. They never sit on the structure node.

## Verdicts

| Field | Verdict | Why |
|---|---|---|
| `structure nodes.<id>.domId` | KEEP | `landmarkKind` folds the id into the header, footer, and hero test (`scripts/generic-extractor/sections.ts:38`). The section skill reads the candidate that test produces, and it never opens `domId` (`.cursor/SKILLS/SECTIONS.md:14`). The class string does not carry the id. |
| `structure nodes.<id>.role` | KEEP | `landmarkKind` maps `banner`, `contentinfo`, `main`, `navigation`, and `hero` (`scripts/generic-extractor/sections.ts:37-44`). `role="button"` also becomes a button record and a button text style (`scripts/generic-extractor/components.ts:63`, `scripts/design-tokens/collect.ts:294`). The prompt then marks a fixed or sticky root as overlay (`.cursor/SKILLS/SECTIONS.md:24`, `.cursor/SKILLS/BUILDER.md:42`). |
| `structure nodes.<id>.selector` | DROP | The value is a tag path with `:nth-of-type` (`scripts/generic-extractor/browser.js:61-64`). Computed style is stored on the node id during the same walk (`scripts/generic-extractor/browser.js:79`), so nothing looks the node up by that path later. The consent check uses the id and the class string (`scripts/design-tokens/collect.ts:274`). A tag path cannot contain `cookiebot` or `onetrust`. The digest does not copy the field (`scripts/digest/generate.ts:183`). |
| `computed pseudos.<name>` typography: `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, `letterSpacing`, `textTransform` | DROP | These keys are copied onto `::before` and `::after` by spreading the element style list (`scripts/generic-extractor/browser.js:48-55`). `measurePseudo` never reads them (`scripts/digest/generate.ts:911-929`). Font, size, weight, and line-height on a Framer text layer come from the node's text run (`.cursor/SKILLS/BUILDER.md:40`). The builder does not draw `::before` glyphs as text (`.cursor/SKILLS/BUILDER.md:40`). Leave `content`, `color`, `backgroundColor`, `backgroundImage`, a border side whose width is not zero, `width`, `height`, and `opacity`. |
| `computed pseudos.<name>` box and effects: padding, margin, `rowGap`, `columnGap`, border radii, `boxShadow`, `zIndex`, `transform`, `filter`, `backdropFilter`, `clipPath`, `maskImage`, `overflowX`, `overflowY` | DROP | The same spread copies these onto the pseudo (`scripts/generic-extractor/browser.js:10-19`, `scripts/generic-extractor/browser.js:55`). `measurePseudo` never reads them (`scripts/digest/generate.ts:911-929`). Spacing, radius, shadow, z-index, and effects on the frame come from the node's own computed style (`scripts/digest/generate.ts:561-563`, `scripts/digest/generate.ts:628-662`). A mask URL is already saved on the node's media during the walk (`scripts/generic-extractor/browser.js:104-107`). A token created only from a pseudo's padding or radius has no pseudo field in the digest to attach to. Same kept pseudo properties as the row above. |
| `computed skipped` and `computed unresolved` | DROP | Both arrays are written as `[]` on every capture (`scripts/generic-extractor/extract.ts:113`). The digest would turn entries into warnings (`scripts/digest/generate.ts:810-814`), and the token collector would ignore a `skipped` node marked as consent UI (`scripts/design-tokens/collect.ts:268-272`). The walk already leaves consent nodes out of the tree (`scripts/generic-extractor/browser.js:132`), so the empty arrays never remove a colour or a text style. |

## Citations

### `structure nodes.<id>.domId` — KEEP

Written on the structure node in the extractor: `domId: el.getAttribute("id") || ""` (`scripts/generic-extractor/browser.js:72`). Typed on `DomNode` (`scripts/generic-extractor/extract.ts:10`). The computed record from `styleOf` has no `domId` (`scripts/generic-extractor/browser.js:48-58`).

Readers:

- `landmarkKind` builds `blob` from `node.domId` and `node.classes` (`scripts/generic-extractor/sections.ts:38`). The header, footer, and hero regexes run on that blob (`scripts/generic-extractor/sections.ts:39-44`).
- The token collector joins `domId` into the consent haystack (`scripts/design-tokens/collect.ts:274`).
- The digest type allows `domId` (`scripts/digest/generate.ts:15`) and the digest node it writes has no `domId` (`tests/digest/digest.test.ts:383`). The digest role at `scripts/digest/generate.ts:186` is `control`, `label`, or `node`.

The section skill reads `sectionCandidates` (`id`, `rootIds`, `memberIds`, evidence boxes). When it opens a node, it reads `tag`, `box`, and `children` (`.cursor/SKILLS/SECTIONS.md:14`). It does not read `domId`. The builder sets overlay placement from the prompt role (`.cursor/SKILLS/BUILDER.md:42`) and `htmlTag` from the digest tag (`.cursor/SKILLS/BUILDER.md:44`).

`domId` is still required to produce that candidate. `proposeSectionRoots` keeps a landmark root (`scripts/generic-extractor/sections.ts:115-117`), and `buildSections` copies `landmarkKind` onto `kind` (`scripts/generic-extractor/sections.ts:128`). A `div` whose id matches header, footer, or hero has no other field in that test. Classes stay, and they do not contain the id. Copying the id into another field would be a second store. The sections fixture does not depend on the id: header, main, and footer are tags, and the hero is `class="hero"` (`tests/extractor/fixtures/sections.html:16-31`, `tests/extractor/sections.test.ts:23`).

The node computed style has no id. This is not a computed duplicate.

### `structure nodes.<id>.role` — KEEP

Written on the structure node: `role: el.getAttribute("role") || ""` (`scripts/generic-extractor/browser.js:72`). Typed as optional (`scripts/generic-extractor/extract.ts:12`). Absent from the computed style record (`scripts/generic-extractor/browser.js:48-58`). The digest `StructureNode` type has no `role` field (`scripts/digest/generate.ts:13-31`).

Readers:

- `landmarkKind` lowercases `node.role` and matches `banner`, `contentinfo`, `main`, `navigation`, and `hero` (`scripts/generic-extractor/sections.ts:37-44`).
- Token text-style role: `tag === "button" || node.role === "button"` (`scripts/design-tokens/collect.ts:294`).
- `componentKind` uses the same button check (`scripts/generic-extractor/components.ts:63`). The components.json inventory is out of scope here. The keep above stands without it.

The section skill and the builder use the candidate and the prompt role, as with `domId` (`.cursor/SKILLS/SECTIONS.md:14`, `.cursor/SKILLS/SECTIONS.md:24`, `.cursor/SKILLS/BUILDER.md:42`). `role` is still required to produce that candidate when the landmark is only an ARIA role. Tag and classes do not carry `role="banner"`. A fixed `div` with `role="banner"` becomes its own root only through this field, and that root is what the prompt can mark overlay. The sections fixture has no ARIA roles (`tests/extractor/fixtures/sections.html:16-31`).

The button text-style name is a second reader. The builder applies a text style when font, size, weight, and line-height match the digest run (`.cursor/SKILLS/BUILDER.md:41`). Those measurements stay on the node. The landmark root is the reason to keep the field.

The node computed style has no role. This is not a computed duplicate.

### `structure nodes.<id>.selector` — DROP

Written on the structure node: `selector: sel` (`scripts/generic-extractor/browser.js:73`). `sel` comes from `selectorFor`, which appends the tag and, when needed, `:nth-of-type` (`scripts/generic-extractor/browser.js:61-64`). Typed on `DomNode` (`scripts/generic-extractor/extract.ts:13`). The same local string is passed to children and stored on `excluded` rows (`scripts/generic-extractor/browser.js:130-132`, `scripts/generic-extractor/browser.js:145-147`). That local can stay. The field on the node can go.

Computed style is assigned by node id in that visit: `computed[id] = styleOf(el, cs)` (`scripts/generic-extractor/browser.js:79`). Capture does not look the node up again by the stored selector.

Readers:

- Digest comment: grouping does not read selectors (`scripts/digest/generate.ts:4`). `controlKind` says selectors are not used (`scripts/digest/generate.ts:436`). The type allows `selector` (`scripts/digest/generate.ts:17`). The written digest node has no `selector` (`tests/digest/digest.test.ts:382`).
- The token haystack includes `node.selector` (`scripts/design-tokens/collect.ts:274`). `CONSENT_MARK` looks for cookiebot, cybot, onetrust, cookie-consent, and gdpr (`scripts/design-tokens/collect.ts:23`). A tag path from `selectorFor` does not contain those strings. `domId` and `classes` in the same haystack do. The fixture selector `#CybotCookiebotDialog` (`tests/design-tokens/fixtures/structure.json:35`) is hand-written. The extractor does not store ids in `selector`.
- The section skill does not read `selector` (`.cursor/SKILLS/SECTIONS.md:14`). The builder does not open `structure.json` for a class or an href (`.cursor/SKILLS/BUILDER.md:45`).

`unresolved.selector` is a different field, on the computed document's `unresolved` array (`scripts/digest/generate.ts:59`). Dropping `nodes.<id>.selector` leaves that array field alone.

No Framer layer reads this path. Removing the stored property does not need a new lookup: consent matching already has id and class, and style is already keyed by node id. Not in computed. Drop the stored structure field only.

### `computed pseudos.<name>` typography — DROP

Computed-only, not in the extractor. `pick` copies `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, `letterSpacing`, and `textTransform` from `STYLE_PROPS` (`scripts/generic-extractor/browser.js:7-8`, `scripts/generic-extractor/browser.js:48`). `styleOf` spreads that pick onto each painting `::before` and `::after` (`scripts/generic-extractor/browser.js:52-55`). The structure node does not get these keys.

The same `pick(cs)` runs on the element and is stored as `computed[id]` (`scripts/generic-extractor/browser.js:50`, `scripts/generic-extractor/browser.js:79`). Those node values are a separate `getComputedStyle`. They can differ from the pseudo. They remain if the pseudo keys go.

Readers:

- `measurePseudo` writes `content`, `width`, `height`, `opacity`, `color`, `backgroundColor`, `backgroundImage`, and painted border sides (`scripts/digest/generate.ts:911-929`). It does not write the six type keys. The digest test expects `fontSize` to be absent (`tests/digest/digest.test.ts:435`).
- `measureNode` writes the six type keys from the node style (`scripts/digest/generate.ts:551-558`). Occurrence grouping reads type from the node style (`scripts/digest/generate.ts:478-479`). `pseudoSignature` reads `content`, `color`, `backgroundColor`, and `BORDER_KEYS` (`scripts/digest/generate.ts:522-524`). It does not read pseudo type.
- The token collector pushes each pseudo onto `layers` and, when `pseudoText` is true, reads the six type keys (`scripts/design-tokens/collect.ts:100-119`, `scripts/design-tokens/collect.ts:300-305`).
- Schema checks for a digest pseudo require `content`, `width`, `height`, and `opacity` (`scripts/digest/schema.ts:320-323`). They do not require the six type keys.
- The builder takes font, size, weight, and line-height from the digest run (`.cursor/SKILLS/BUILDER.md:41`). For a painting pseudo it reads size, opacity, colour, and fill (`.cursor/SKILLS/BUILDER.md:38`). It does not draw `::before` glyphs (`.cursor/SKILLS/BUILDER.md:40`).

A pseudo-only text style never becomes the run the builder styles. Dropping the six keys needs no second store. The node type measurement stays.

Kept on the pseudo, so they are not part of this drop: `content`, `color`, `backgroundColor`, `backgroundImage`, border side width, style, and color, `width`, `height`, `opacity`.

### `computed pseudos.<name>` box and effects — DROP

Computed-only, not in the extractor. The same `pick(pseudoStyle)` copies padding sides, margin sides, `rowGap`, `columnGap`, the four radii, `boxShadow`, `zIndex`, `transform`, `filter`, `backdropFilter`, `clipPath`, `maskImage`, `overflowX`, and `overflowY` (`scripts/generic-extractor/browser.js:10-19`, `scripts/generic-extractor/browser.js:55`). The structure node does not store them.

The element `pick(cs)` stores the same keys on `computed[id]` (`scripts/generic-extractor/browser.js:50`, `scripts/generic-extractor/browser.js:79`). `measureNode` reads padding, margin, gaps, radii, and `boxShadow` from that node style (`scripts/digest/generate.ts:259-263`, `scripts/digest/generate.ts:561-563`). `layoutOf` reads `zIndex` from that node style (`scripts/digest/generate.ts:628-641`). `effectsOf` reads `transform`, `filter`, `backdropFilter`, `overflowX`, `overflowY`, `clipPath`, and `maskImage` from that node style when the node traits say so (`scripts/digest/generate.ts:646-662`). Traits are computed on the element (`scripts/generic-extractor/browser.js:28-46`).

`measurePseudo` does not write the box and effect keys listed in this row (`scripts/digest/generate.ts:911-929`). The digest test expects `paddingTop` to be absent (`tests/digest/digest.test.ts:436`).

`pseudoSignature` does include the four radii, because `BORDER_KEYS` includes them (`scripts/digest/generate.ts:254-256`, `scripts/digest/generate.ts:522-524`). The builder does not read digest groups (no `groups` in `.cursor/SKILLS/BUILDER.md`). The corner it sets is the node radius from the digest border (`.cursor/SKILLS/BUILDER.md:38`, `.cursor/SKILLS/BUILDER.md:41`). A radius that exists only on the pseudo is already absent from the digest pseudo element.

The token collector runs `collectBox` on the pseudo, which records padding, margin, gap, radii, and `boxShadow` (`scripts/design-tokens/collect.ts:100-105`, `scripts/design-tokens/collect.ts:222-264`). Phase 2 applies spacing, borders, radii, and shadows from tokens onto the digest measurements (`.cursor/SKILLS/BUILDER.md:26`, `.cursor/SKILLS/BUILDER.md:41`). A token that exists only because of a pseudo box value has no digest field on the `::before` layer to match. The `::before` layer is size, opacity, colour, and fill, plus a border side whose width is not `0px` (`.cursor/SKILLS/BUILDER.md:38`).

Mask image URLs are taken from the live `getComputedStyle` during the walk and stored on `node.media` (`scripts/generic-extractor/browser.js:98-106`). The builder sets a mask from a digest asset whose kind is `mask` (`.cursor/SKILLS/BUILDER.md:47`). Dropping the stored pseudo `maskImage` string leaves that URL path in place.

`computedShowsEffect` treats any non-empty `pseudos` object as an effect (`scripts/digest/generate.ts:351`). The object remains while content, color, background, border, width, height, and opacity stay.

Kept on the pseudo, so they are not part of this drop: `content`, `color`, `backgroundColor`, `backgroundImage`, border side width, style, and color, `width`, `height`, `opacity`.

### `computed skipped` and `computed unresolved` — DROP

Written in the extractor when it assembles the computed document, as empty arrays: `skipped: []`, `unresolved: []` (`scripts/generic-extractor/extract.ts:113`). `browser.js` `collect` does not return either array. They are not style capture, and they are not structure fields.

Readers:

- The digest copies `skipped` into `computed-skipped` warnings and `unresolved` into `computed-unresolved` warnings when `nodeId` is inside the component subtree (`scripts/digest/generate.ts:810-814`). The cli types both (`scripts/digest/cli.ts:77-78`).
- The token collector ignores a `skipped` entry whose reason is `consent-ui` or `cookiebot` (`scripts/design-tokens/collect.ts:79`, `scripts/design-tokens/collect.ts:268-272`). Its input type has `skipped` and no `unresolved` (`scripts/design-tokens/collect.ts:56`). The tokens cli types `skipped` only (`scripts/design-tokens/cli.ts:46`).
- The token fixture has `skipped: [{ nodeId: "n-000006", reason: "consent-ui" }]` (`tests/design-tokens/fixtures/computed.json:86`). The test expects `rgb(3, 3, 3)` and `99px` to be absent (`tests/design-tokens/collect.test.ts:56-57`). `n-000006` has no consent id or class (`tests/design-tokens/fixtures/structure.json:39-43`). That fixture is hand-written. A capture from `extract.ts` writes `[]`.

Consent nodes are excluded during the walk (`scripts/generic-extractor/browser.js:132`, `scripts/generic-extractor/browser.js:147`, `scripts/generic-extractor/browser.js:201-202`). The haystack on `domId` and `classes` is the backstop (`scripts/design-tokens/collect.ts:274`). The empty arrays do not change a capture the extractor writes today. Both readers already use `?? []`. Dropping the keys adds no lookup.

No builder layer reads these arrays. The section skill does not open `computed.json` (`.cursor/SKILLS/SECTIONS.md:66`).

## Geblokkeerd op mij

Niets.

## Gewijzigd

`docs/research/drop-node-pseudos.md` only. No commit, no push. Autonomie L0.

## Gecontroleerd

Read `scripts/generic-extractor/browser.js`, `extract.ts`, `sections.ts`, `components.ts`, `scripts/digest/generate.ts`, `schema.ts`, `cli.ts`, `scripts/design-tokens/collect.ts`, `cli.ts`, `.cursor/SKILLS/BUILDER.md`, `.cursor/SKILLS/SECTIONS.md`, `tests/digest/digest.test.ts`, `tests/extractor/sections.test.ts`, `tests/extractor/fixtures/sections.html`, `tests/design-tokens/collect.test.ts`, and the token fixtures. No pipeline code changed, so the test suite was not run.

## Gevonden

`scripts/generic-extractor/components.ts:63` also reads `node.role === "button"` for the component inventory. That inventory is out of scope. `role` stays for landmarks, so this read keeps working.

`pseudoSignature` copies pseudo radii (`scripts/digest/generate.ts:522-524`) even though `measurePseudo` drops them. The builder does not read groups, so the radii row stays a drop.

The token fixture's `skipped` entry is not produced by `extract.ts`. A later edit that removes the collector's `skipped` reader will fail `tests/design-tokens/collect.test.ts` on that fixture.
