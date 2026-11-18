# Section candidates and component fields

Which extractor fields the builder still needs. Quality means the builder can still set text, box, fill, border, radius, padding, gap, links, images, svg, and overlay placement from `.cursor/SKILLS/BUILDER.md`. A removal that needs a second store or a new lookup stays. Sitting in JSON is not use.

`buildSections` writes seven evidence keys: `nodeId`, `tag`, `box`, `position`, `viewportWidthRatio`, `paints`, `headings` (`scripts/generic-extractor/sections.ts:133`). The request named three of those and left two slots empty. All seven are judged. `components.filter` here is the string stored on `components.json`. The `--components` flag still chooses which records are built (`scripts/generic-extractor/components.ts:123`).

The builder reads `sections-prompt.md`, `tokens.json`, `digests/index.json`, `consent.json`, the digest files the prompt lists, and the screenshot (`.cursor/SKILLS/BUILDER.md:36`). It does not open `structure.json` or `computed.json` (`.cursor/SKILLS/BUILDER.md:85`).

## Verdicts

| Field | Verdict | Why |
| --- | --- | --- |
| `sectionCandidates[].status` | DROP | The value is the string `"auto"` on every candidate (`scripts/generic-extractor/sections.ts:129`). Jobs read `id` and `rootIds` (`scripts/digest/jobs.ts:18`). The section skill names `id`, `rootIds`, `memberIds`, and evidence boxes (`.cursor/SKILLS/SECTIONS.md:14`). |
| `sectionCandidates[].memberIds` | KEEP | The section skill assigns a digest when its root sits in `memberIds` (`.cursor/SKILLS/SECTIONS.md:24`), and the builder builds those digest files (`.cursor/SKILLS/BUILDER.md:36`). Rebuilding the set walks `children` and stops at other roots (`scripts/generic-extractor/sections.ts:31`). |
| `evidence.nodeId` | DROP | The same id is already on `rootIds` (`scripts/generic-extractor/sections.ts:134`). Jobs copy `rootIds` onto the section digest (`scripts/digest/jobs.ts:18`). |
| `evidence.tag` | DROP | The digest copies `nodes[].tag` (`scripts/digest/generate.ts:187`). The builder sets `htmlTag` from that digest tag (`.cursor/SKILLS/BUILDER.md:44`). |
| `evidence.box` | KEEP | The section skill writes prompt bounds from this box, and fixed or sticky `box.y` is viewport y (`.cursor/SKILLS/SECTIONS.md:14`). The builder places an overlay and the page bottom from that prompt (`.cursor/SKILLS/BUILDER.md:42`). Opening `nodes` for `box` is limited to a split (`.cursor/SKILLS/SECTIONS.md:14`). |
| `evidence.position` | KEEP | Fixed or sticky becomes Role overlay (`.cursor/SKILLS/SECTIONS.md:24`). The builder places that role absolute on the breakpoint (`.cursor/SKILLS/BUILDER.md:42`). The layer list does not include `layout.position` (`.cursor/SKILLS/BUILDER.md:38`). |
| `evidence.viewportWidthRatio` | DROP | The value is box width divided by layout width, rounded to two decimals (`scripts/generic-extractor/sections.ts:138`). Jobs, the section skill, and the builder never read it. The builder places from the box in pixels (`.cursor/SKILLS/BUILDER.md:38`). |
| `evidence.paints` | DROP | The value is a list of trait names such as `background` or `border`. The digest already has the computed fill, border, and radius (`scripts/digest/generate.ts:560`, `scripts/digest/generate.ts:561`), and those measurements are what the builder paints (`.cursor/SKILLS/BUILDER.md:38`). |
| `evidence.headings` | DROP | The value is a count of `h1` through `h6` in the subtree (`scripts/generic-extractor/sections.ts:140`). The prompt names headings from the digest tags and their text (`.cursor/SKILLS/SECTIONS.md:52`, `scripts/digest/generate.ts:187`). A count does not become a layer. |
| `components.filter` | DROP | The stored string repeats the `--components` flag used to build the file (`scripts/generic-extractor/extract.ts:122`). Jobs iterate `records` (`scripts/digest/jobs.ts:12`). The flag still decides which records are created (`scripts/generic-extractor/components.ts:123`). |
| `records[].sectionId` | DROP | Jobs read `id`, `kind`, and `nodeId` (`scripts/digest/jobs.ts:9`). The section prompt assigns a digest with `memberIds` (`.cursor/SKILLS/SECTIONS.md:24`). The builder does not open `components.json` (`.cursor/SKILLS/BUILDER.md:36`). |
| `records[].blocker` | DROP | Every written record sets it to `null` (`scripts/generic-extractor/components.ts:153`). A control with a missing measurement is kept off the record list (`scripts/generic-extractor/components.ts:135`). No digest, token, skill, or CLI read uses the field. |
| `blockers[]` | DROP | The array would list those skipped controls. A capture with a missing measurement exits before write (`scripts/generic-extractor/cli.ts:96`), so a finished capture has `[]`. The builder never opens this array. |
| `definitions[].id` | DROP | The id describes the same molecule group a second time. It is also stored on `records[].signatureId` (`scripts/generic-extractor/components.ts:152`). Digest jobs never read `definitions` (`scripts/digest/jobs.ts:9`). The molecule test is the reader (`tests/extractor/molecules.test.ts:31`). |
| `definitions[].kind` | DROP | The file keeps molecule definitions only (`scripts/generic-extractor/extract.ts:125`). The same `"molecule"` string is already on the record, and record `kind` becomes the digest type (`scripts/digest/jobs.ts:14`). |
| `definitions[].instanceIds` | DROP | Each id is already `records[].nodeId`, and that id is already the digest root (`scripts/generic-extractor/components.ts:167`, `scripts/digest/jobs.ts:14`). |

Keep `memberIds`, `evidence.box`, and `evidence.position`. Drop the rest.

## Citations

### `sectionCandidates[].status`

Written as the literal `"auto"` on every candidate (`scripts/generic-extractor/sections.ts:129`). The type allows only that literal (`scripts/generic-extractor/sections.ts:7`).

Digest jobs take `id` and `rootIds` (`scripts/digest/jobs.ts:8`, `scripts/digest/jobs.ts:18`). The digest CLI types the same pair (`scripts/digest/cli.ts:71`). Design tokens read `nodes` (`scripts/design-tokens/cli.ts:33`, `scripts/design-tokens/collect.ts:42`). The section skill’s candidate list is `id`, `rootIds`, `memberIds`, and evidence boxes (`.cursor/SKILLS/SECTIONS.md:14`). The builder does not open `structure.json` (`.cursor/SKILLS/BUILDER.md:85`). The extractor CLI prints the candidate count (`scripts/generic-extractor/cli.ts:130`). The section test asserts `kind`, not `status` (`tests/extractor/sections.test.ts:23`).

The value is not on the structure node. Nothing copies it into a digest, the token file, or the prompt. Dropping it adds no lookup.

DROP. `"auto"` never reaches a Framer layer (`scripts/generic-extractor/sections.ts:129`, `.cursor/SKILLS/SECTIONS.md:14`).

### `sectionCandidates[].memberIds`

Written by walking each root and stopping at another section root (`scripts/generic-extractor/sections.ts:31`, `scripts/generic-extractor/sections.ts:130`). `sectionCoverage` uses that set for the unassigned warning (`scripts/generic-extractor/sections.ts:148`). Component inventory uses it to stamp `sectionId` (`scripts/generic-extractor/components.ts:118`).

Digest jobs do not read it (`scripts/digest/jobs.ts:8`). Design tokens do not (`scripts/design-tokens/collect.ts:42`). The section skill does: a digest belongs to the organism whose `memberIds` contain its root (`.cursor/SKILLS/SECTIONS.md:14`, `.cursor/SKILLS/SECTIONS.md:24`). The builder then builds the digest files that prompt lists (`.cursor/SKILLS/BUILDER.md:36`). No test asserts `memberIds`. The extractor CLI does not read it back (`scripts/generic-extractor/cli.ts:130`).

`children` on each node can rebuild the set (`scripts/generic-extractor/sections.ts:31`). The section skill is told to open `nodes` only when splitting a candidate (`.cursor/SKILLS/SECTIONS.md:14`). Doing that walk for every candidate is a new lookup, so the stored list is not ready to leave the extractor.

KEEP. Overlay and other organisms receive the right digest roots only through this list (`.cursor/SKILLS/SECTIONS.md:24`, `.cursor/SKILLS/BUILDER.md:36`).

### `evidence.nodeId`

Written as the root id inside each evidence object (`scripts/generic-extractor/sections.ts:131`, `scripts/generic-extractor/sections.ts:134`).

No digest, token collector, skill, test, or CLI reads `evidence.nodeId`. Jobs already copy `candidate.rootIds` (`scripts/digest/jobs.ts:18`). The same string is the key of `structure.nodes`.

DROP. The id the builder can reach is `rootIds` on the section digest (`scripts/digest/jobs.ts:18`).

### `evidence.tag`

Written from `n.tag` (`scripts/generic-extractor/sections.ts:135`). The node already stores `tag` (`scripts/generic-extractor/extract.ts:9`).

The digest copies that node tag (`scripts/digest/generate.ts:187`). The builder sets frame `htmlTag`, and rich-text `tag` for `h1` through `h6` and `p`, from the digest tag (`.cursor/SKILLS/BUILDER.md:44`). The section skill reads `tag` from `nodes` when it splits a candidate (`.cursor/SKILLS/SECTIONS.md:14`). Its overlay rule keys off position, and the header clause does not name `evidence.tag` (`.cursor/SKILLS/SECTIONS.md:24`). Design tokens and both CLIs do not read it. No test asserts it.

The digest copy already serves the builder. No extra lookup.

DROP. Layer tags come from the digest’s copy of the node (`scripts/digest/generate.ts:187`, `.cursor/SKILLS/BUILDER.md:44`).

### `evidence.box`

Written as `n.box` (`scripts/generic-extractor/sections.ts:136`). The node already has `box` (`scripts/generic-extractor/extract.ts:17`). The digest copies that node box into `geometry` (`scripts/digest/generate.ts:190`, `scripts/digest/generate.ts:603`). The builder’s layer list includes that box (`.cursor/SKILLS/BUILDER.md:38`), and a section’s horizontal inset is the content box x from the digest (`.cursor/SKILLS/BUILDER.md:39`).

The section skill also reads evidence boxes for organism bounds, and it treats `box.y` as viewport y when position is fixed or sticky (`.cursor/SKILLS/SECTIONS.md:14`). The builder places Role overlay at that viewport box and sets the page bottom from the prompt’s end y (`.cursor/SKILLS/BUILDER.md:42`). It may open `nodes` for `box` only while splitting (`.cursor/SKILLS/SECTIONS.md:14`). Design tokens do not read evidence (`scripts/design-tokens/collect.ts:42`). No test asserts the evidence box.

Inner layer boxes are already served by digest geometry. Prompt bounds for the overlay and the page height are not. Pointing the section step at `nodes[].box` for every candidate is a new lookup.

KEEP. Overlay placement and page height use the prompt bounds taken from this box (`.cursor/SKILLS/SECTIONS.md:14`, `.cursor/SKILLS/BUILDER.md:42`).

### `evidence.position`

Written from `n.render.position` (`scripts/generic-extractor/sections.ts:137`). The node already has `render.position` (`scripts/generic-extractor/extract.ts:18`). The digest copies it to `layout.position` (`scripts/digest/generate.ts:639`).

The section skill sets Role overlay when that evidence position is fixed or sticky (`.cursor/SKILLS/SECTIONS.md:14`, `.cursor/SKILLS/SECTIONS.md:24`). The builder places that role absolute, with no stack slot, and does not use CSS position fixed (`.cursor/SKILLS/BUILDER.md:42`). The layer list names layout opacity, not `layout.position` (`.cursor/SKILLS/BUILDER.md:38`). When the section skill opens a node it reads `tag`, `box`, and `children` (`.cursor/SKILLS/SECTIONS.md:14`). Design tokens, tests, and both CLIs do not read evidence position.

`layout.position` does not currently place the overlay. Reading `render.position` from nodes, or `layout.position` from a digest, would be a new lookup for the section step.

KEEP. Overlay placement is the prompt role taken from this field (`.cursor/SKILLS/SECTIONS.md:24`, `.cursor/SKILLS/BUILDER.md:42`).

### `evidence.viewportWidthRatio`

Written as the root width divided by `layoutWidth`, rounded to two decimals (`scripts/generic-extractor/sections.ts:138`). `layoutWidth` is `documentElement.clientWidth` (`scripts/generic-extractor/browser.js:154`, `scripts/generic-extractor/extract.ts:92`). The ratio is not stored on the node.

Digest jobs have no evidence fields (`scripts/digest/jobs.ts:8`). The section skill names boxes and position, not this ratio (`.cursor/SKILLS/SECTIONS.md:14`). The builder’s layer list does not include it (`.cursor/SKILLS/BUILDER.md:38`). Design tokens, tests, and both CLIs do not read it.

Nothing has to recompute it.

DROP. No allowed file carries it into a layer (`scripts/generic-extractor/sections.ts:138`, `.cursor/SKILLS/BUILDER.md:38`).

### `evidence.paints`

Written as the root’s traits limited to `background`, `background-image`, `border`, and `shadow` (`scripts/generic-extractor/sections.ts:15`, `scripts/generic-extractor/sections.ts:139`). The full `traits` array stays on the node (`scripts/generic-extractor/extract.ts:19`).

Digest fill, border, radius, padding, and gap are measured from computed style (`scripts/digest/generate.ts:560`, `scripts/digest/generate.ts:561`, `scripts/digest/generate.ts:562`). The builder applies those (`.cursor/SKILLS/BUILDER.md:38`, `.cursor/SKILLS/BUILDER.md:41`). The section skill does not name `paints` (`.cursor/SKILLS/SECTIONS.md:14`). Design tokens read computed nodes, not this list (`scripts/design-tokens/cli.ts:40`). No test asserts it.

The computed values already reach the builder through the digest. The filtered trait names do not.

DROP. Fill, border, and radius do not use this list (`scripts/digest/generate.ts:560`, `.cursor/SKILLS/BUILDER.md:38`).

### `evidence.headings`

Written as the count of `h1` through `h6` under the root (`scripts/generic-extractor/sections.ts:140`). The count is not on the node. The heading elements are, via `tag` (`scripts/generic-extractor/extract.ts:9`).

The prompt’s Contains line takes headings by tag from the digests (`.cursor/SKILLS/SECTIONS.md:52`). The digest tag is the node tag (`scripts/digest/generate.ts:187`). The builder sets a heading tag from that digest node (`.cursor/SKILLS/BUILDER.md:44`). Design tokens, tests, and both CLIs do not read the count.

DROP. Heading tags already arrive on the digest (`scripts/digest/generate.ts:187`, `.cursor/SKILLS/SECTIONS.md:52`).

### `components.filter`

The CLI checks `--components` (`scripts/generic-extractor/cli.ts:32`) and passes it into extract (`scripts/generic-extractor/cli.ts:79`). Extract stores that same string (`scripts/generic-extractor/extract.ts:66`, `scripts/generic-extractor/extract.ts:122`). The inventory skips a kind the argument does not request (`scripts/generic-extractor/components.ts:123`).

Digest jobs read `records`, not `filter` (`scripts/digest/jobs.ts:9`, `scripts/digest/jobs.ts:12`). The digest CLI’s components type is records only (`scripts/digest/cli.ts:127`). Design tokens do not open `components.json` (`scripts/design-tokens/cli.ts:7`). Neither skill names the stored filter. One test asserts `components.filter === "button"` (`tests/extractor/sections.test.ts:24`). That assertion is not a reason to keep the field for Framer quality.

The flag can stay. The stored echo cannot place a layer.

DROP. Record selection already happened before write, and jobs consume the records (`scripts/generic-extractor/components.ts:123`, `scripts/digest/jobs.ts:12`).

### `records[].sectionId`

Written from the `memberIds` map for buttons, fields, and molecules (`scripts/generic-extractor/components.ts:118`, `scripts/generic-extractor/components.ts:150`, `scripts/generic-extractor/components.ts:168`). It is not a property of the structure node.

Digest jobs ignore it (`scripts/digest/jobs.ts:9`). The section skill assigns digests with `memberIds`, not with this id (`.cursor/SKILLS/SECTIONS.md:24`). The builder does not open `components.json` (`.cursor/SKILLS/BUILDER.md:36`). The section test maps a button label through `sectionId` to a section kind (`tests/extractor/sections.test.ts:33`). That is the only reader. Design tokens and the digest CLI do not read it (`scripts/digest/cli.ts:127`).

Recovering it would scan `memberIds`. The builder path does not need that scan.

DROP. Organism membership for the builder stays on `memberIds` (`.cursor/SKILLS/SECTIONS.md:24`). The test use is not Framer quality (`tests/extractor/sections.test.ts:33`).

### `records[].blocker`

The type allows only `null` (`scripts/generic-extractor/components.ts:14`). Both record writers set `null` (`scripts/generic-extractor/components.ts:153`, `scripts/generic-extractor/components.ts:171`). A control with a missing measurement goes to `blockers` and is skipped (`scripts/generic-extractor/components.ts:135`, `scripts/generic-extractor/components.ts:137`).

No digest, token, skill, test, or CLI read uses `record.blocker`. Jobs never see it (`scripts/digest/jobs.ts:9`).

DROP. The stored value is always `null` and places nothing (`scripts/generic-extractor/components.ts:153`).

### `blockers[]`

Built for a requested button or field whose computed style lacks font family, size, weight, or colour (`scripts/generic-extractor/components.ts:26`, `scripts/generic-extractor/components.ts:136`). Extract copies the array (`scripts/generic-extractor/extract.ts:124`). The same gap for a visible control or text node is `missingMeasurements` (`scripts/generic-extractor/components.ts:101`). The CLI exits on that list before it writes `components.json` (`scripts/generic-extractor/cli.ts:96`, `scripts/generic-extractor/cli.ts:125`).

Digest jobs do not read `blockers` (`scripts/digest/jobs.ts:9`). Neither skill does. Tests expect an empty array, or that a hidden button is absent (`tests/extractor/sections.test.ts:25`, `tests/extractor/sections.test.ts:38`, `tests/extractor/signatures.test.ts:17`). Those assertions are not a reason to keep the field.

A written capture has already passed the measurement gate. The builder never sees this array.

DROP. The files the builder reads are written only after measurements exist (`scripts/generic-extractor/cli.ts:96`).

### `definitions[].id`

Button and field groups get `sig-001` upward (`scripts/generic-extractor/signatures.ts:56`). Molecule groups continue that sequence (`scripts/generic-extractor/components.ts:157`). Extract writes molecule definitions only (`scripts/generic-extractor/extract.ts:125`). The id is also stored on `records[].signatureId` (`scripts/generic-extractor/components.ts:152`, `scripts/generic-extractor/components.ts:170`). It is not on the structure node.

Digest jobs do not read definitions or `signatureId` (`scripts/digest/jobs.ts:9`). Neither skill does. The molecule test expects `definition.id` to equal the records’ `signatureId` (`tests/extractor/molecules.test.ts:31`). The signature test checks `signatureId` on records and does not read definitions (`tests/extractor/signatures.test.ts:18`).

DROP. The id never becomes a digest field (`scripts/digest/jobs.ts:9`, `tests/extractor/molecules.test.ts:31`).

### `definitions[].kind`

Group kind is the item kind (`scripts/generic-extractor/signatures.ts:57`). Molecules are kind `"molecule"` (`scripts/generic-extractor/components.ts:158`). Extract keeps that kind and drops button and field definitions (`scripts/generic-extractor/extract.ts:125`). The same `"molecule"` string is on each molecule record (`scripts/generic-extractor/components.ts:166`). Jobs copy record kind onto the digest type (`scripts/digest/jobs.ts:14`, `scripts/digest/generate.ts:228`).

The builder copies a molecule sentence into the report and must not build from it (`.cursor/SKILLS/BUILDER.md:55`, `.cursor/SKILLS/BUILDER.md:72`). The molecule test asserts `definition.kind` (`tests/extractor/molecules.test.ts:30`). Design tokens and the section skill do not read it.

The digest type for a repeated sibling already comes from the record. The definition kind is a second copy the builder is told not to treat as a component.

DROP. Digest type comes from the record (`scripts/digest/jobs.ts:14`), and the definition kind is not a layer (`scripts/generic-extractor/extract.ts:125`, `.cursor/SKILLS/BUILDER.md:55`).

### `definitions[].instanceIds`

The signature group lists node ids that share a visual signature (`scripts/generic-extractor/signatures.ts:43`, `scripts/generic-extractor/signatures.ts:59`). A molecule definition lists the repeated siblings (`scripts/generic-extractor/components.ts:160`). Each of those ids is also a record `nodeId` (`scripts/generic-extractor/components.ts:163`). Those ids are keys in `structure.nodes`. The group itself is not on the node or in `computed.json`.

Jobs turn each record `nodeId` into a digest root (`scripts/digest/jobs.ts:14`). They never read `instanceIds`. The molecule test compares the array to the article ids (`tests/extractor/molecules.test.ts:32`). The builder’s warning is that treating the molecule sentence as a build step stacks a second copy (`.cursor/SKILLS/BUILDER.md:55`).

DROP. Each sibling is already a digest root through its record (`scripts/generic-extractor/components.ts:167`, `scripts/digest/jobs.ts:14`).

## Geblokkeerd op mij

Niets.

## Gewijzigd

`docs/research/drop-section-components.md`. Geen commit. Geen pipeline-code, tests of skills.

## Gecontroleerd

95 unieke `bestand:regel`-citaten nagelopen: elk pad bestaat en de regel is niet leeg. `htmlTag` staat op `.cursor/SKILLS/BUILDER.md:44`. Geen test of build, want de opdracht verbiedt een codewijziging. Klaar is dit bestand.

## Gevonden

`records[].signatureId` wordt geschreven en door `tests/extractor/signatures.test.ts:18` gelezen. Digest jobs lezen het niet (`scripts/digest/jobs.ts:9`). Het stond niet op de veldlijst. `sectionCandidates[].id`, `rootIds` en `kind` ook niet. Button- en field-definitions worden al weggefilterd voor het schrijven (`scripts/generic-extractor/extract.ts:125`).
