# Capture gap

The 1200 capture of `tests/extractor/fixtures/requirements.html` already stores visible text, boxes, computed styles, the screenshot, and asset files. It misses this requirement because `collect` never reads a link address or the document title and language. They never land on `structure.json`, which the digest and token commands already open. The snapshot still has them because the CLI writes `page.content()`, which later stages must not open.

`visit` copies tag, box, computed style, and text. A URL is stored only by `add`, as `{ kind, url }` on `media`, for images, video, posters, and CSS `url()` values. An anchor is handled in that same function and is not one of those cases, so the seven `<a>` nodes (`n-000005`–`n-000010`, `n-000019`) keep labels such as "Pricing" and have no `href`. The walk starts at the children of `<html>`, and `head` is in `SKIP`, so `<title>Requirement fixture</title>` and `lang="en"` never become nodes. `extract` then writes `url`, `slug`, `viewport`, `state`, and breakpoint metadata only. `linkRecords` has nothing to copy. It marks every destination `unsupported`, and `schema.ts` rejects an `href` on a digest link. That is a second gate. The capture already lost the values.

## Smallest change

In `visit`, when `tag === "a"`, set `node.href` to `el.getAttribute("href")`, including `""`. On the object `collect` returns, add `title: document.title` and `language: document.documentElement.lang`. In `extract`, copy those two onto the structure object beside `url`. Name `href` on the extractor node type. No new file. The digest will still omit the address. Link migration owns that schema change and can then read this field.

## Rejected

Putting the address on `media` would send `#pricing`, `/about`, `mailto:`, `tel:`, and `""` through `mediaReferences`, which downloads media URLs as assets. Emitting `href` from `linkRecords` means editing `schema.ts`, which fails a digest whose destination is not `unsupported` or which contains `href`. Passing `--language`, or reading the snapshot in the digest CLI, does not help: `captureOf` never writes `language`, the digest has no title field, and a flag does not hold the seven addresses. A metadata file, or a node for `head` or `<html>`, is a new format. `head` is skipped because it is not visual.

## Assumption

The stored address is the raw `href` attribute, not `el.href`. Resolving it would turn the fragment, the path, and the empty href into file URLs. `document.title` and the `html` `lang` attribute are the metadata, not the `h1` "Page title". Classifying destinations stays with link migration.

After review: anchors store the raw `href` from `getAttribute("href")`, including `""`, and omit `href` when the attribute is absent. `collect` returns `document.title` and `document.documentElement.lang`. `extract` copies them onto the structure object as `title` and `language`, using `""` when either is missing.
