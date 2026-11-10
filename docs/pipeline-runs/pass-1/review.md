# Pass 1 review

## 01 Capture

Assumption: sound.
Root: yes. `visit` skips anchor addresses, and skipped `head` drops title and language.
Size: small enough.
Change the note: State that this `href` and the link note must land together. Leave `schema.ts` to that note.

## 02 Headings

Assumption: false. Phase 2 lists `tag`. Style creation still uses `framer.tag` and `roles`.
Root: yes. `ROLE_ORDER` writes `framer.tag` `h1` for the shared look.
Size: one builder sentence, smaller than a second style or a `p` tag.
Change the note: State plainly that the layer tag is the digest node tag. Delete the `p` retag and keep the one style.

## 03 Framer components

Assumption: sound.
Root: yes. The pass stops at files. No project was named.
Size: small enough. The later pass runs the existing builder skill.
Change the note: keep.

## 04 Map styles

Assumption: sound on this fixture.
Root: yes. Clip ids and token names do not join. `typography.0001` differs in the footer.
Size: copy token `name` into `proposal.name`. Keep `assignIds`.
Change the note: Read `tokens.json`, match on measurements, copy `name` onto `proposal.name`. Keep `assignIds`.

## 05 Framer controls

Assumption: false. Body, links, and the footer are text too.
Root: yes. The card never binds a variable. The missing project is note 03.
Size: one instruction for every text layer and every image.
Change the note: Bind each text layer and each image to the built-in variable, captured value as the default. Leave variants until a second state exists.

## 06 Custom code

Assumption: sound. The report line is the evidence.
Root: yes. The card never requires native layers or a named exception.
Size: small enough.
Change the note: keep.

## 07 Alt text

Assumption: sound. Missing alt warns. `alt=""` is stored.
Root: yes. Media is `{ kind, url }`. The shared file cannot hold three alt values.
Size: small enough.
Change the note: keep.

## 08 Image fields

Assumption: sound.
Root: yes. The card draws `usablePath` and never sets a Framer image.
Size: small enough.
Change the note: keep.

## 09 Layers

Assumption: sound. Unset flex direction is a row, which matches the card row.
Root: yes. The flat list drops `parentId`. `text.exact` on a parent repeats the children.
Size: small enough.
Change the note: Say in the rule that an inline link stays a text run, so it is not its own layer.

## 10 Atomic

Assumption: sound. Atoms stay unlabeled. Landmark sections stay the organisms.
Root: yes. Inventory keeps buttons and fields, so the two articles are unmarked.
Size: use the existing signature `instanceIds`. A new `instanceIds` field on the record is a second list.
Change the note: Add one `molecule` definition for the two articles, point the record at that `signatureId`, and widen `kind` only.

## 11 Links

Assumption: sound. The five kinds are reliable. Empty `href` and `javascript:` are uncertain. A missing attribute is `missing`.
Root: the digest ban in `linkRecords`, `checkLinks`, contract section 3, and the test. The unread attribute is note 01.
Size: small enough once the extractor step is removed.
Change the note: Remove the `visit` step. State that this change lands together with note 01's `href`.

## 12 Editable

Assumption: false. An empty decisions file is not designer control.
Root: alt and the empty or unparseable link are not digest fields yet. Rewriting a decisions file on every digest run would wipe the edit.
Size: one builder instruction.
Change the note: The designer edits uncertain alt and destination on the digest, and the builder reads them, after notes 07 and 11 store those fields.

## 13 Workflow

Assumption: sound. The skill cards stay the workflow.
Root: yes. No page defines the four levels.
Size: one short page. Drop the rule that splits a coarse main. It fights note 10.
Change the note: A molecule is repeated siblings with the same tag and the same ordered child tags.

## Implement on the next edit

**Extractor (`browser.js` and the extract writer)**

- Store raw `href` on each anchor, including `""`.
- Store title and html `lang` on the structure object.
- Store `alt` when the attribute is present, including `""`. Warn `alt-missing` when it is absent.

**Digest (`generate.ts`, `schema.ts`, contract section 3, digest test)**

- Copy string `alt` onto the asset.
- Match `tokens.json` on measurements and copy `name` into `proposal.name`. Keep `assignIds`.
- Classify stored `href` as anchor, internal, external, email, or phone (`value`). Empty or unparseable `href` stays `uncertain` or `missing`. Lands with the extractor `href`.

**`components.ts`**

- One `molecule` definition whose `instanceIds` are the two articles. Widen `kind` only.

**`docs/classification.md`**

- Four levels, this fixture, pointers to the skill cards. Same molecule test as the inventory. Organisms stay header, main, and footer.

**`BUILDER.md` (one edit)**

- Layer tag is the digest node tag. `framer.tag` and the roles heading line stay off the layer.
- Each text layer and each image is a built-in variable. Default is the captured value. Leave variants out.
- Native layers, unless one named case needs code. Report `Custom code: none` or that case and why.
- Upload `usablePath` and set it as the frame image.
- One layer per node, by `parentId` and `order`. `flex` is a row. A `block` parent stacks vertically. Text is that node's runs. An inline link stays a run.
- Read the designer's edited alt and destination.

Project creation stays off this list. Note 03 is a later builder run.
