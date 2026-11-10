# Gap 11 — Reliable link destinations

Requirement: migrate internal, external, anchor, email, and phone links when the destination is reliable, and flag uncertain ones.

## Root cause

The contract forbids the data, and the capture never reads `href`.

`tests/extractor/fixtures/requirements.html` has seven anchors: `#pricing`, `/about`, `https://example.com/docs`, `mailto:hello@example.com`, `tel:+31101234567`, `href=""`, and `https://example.com/inline`. `visit` in `scripts/generic-extractor/browser.js` stores tag, box, text, media, and fields. It never calls `getAttribute("href")`. `StructureNode` in `scripts/digest/generate.ts` has no `href`.

`linkRecords` in `scripts/digest/generate.ts` writes every anchor as `destination.status: "unsupported"` with reason "Visible labels are kept. Link destinations are out of scope and are not stored." `unsupportedRecords` adds `feature: "link-destination"` for the whole set. `checkLinks` in `scripts/digest/schema.ts` fails validation if `destination.status` is anything other than `unsupported`, or if the link object has an `href` field. Section 3 of `docs/poc-v2/digest-contract.md` states the same ban. `tests/digest/digest.test.ts` asserts status `unsupported` and that `href` is absent.

The empty `href` is therefore the same record as the five reliable kinds.

## Smallest change

1. In `visit` (`scripts/generic-extractor/browser.js`), store the raw attribute on the anchor (`getAttribute("href")`, not the resolved `el.href`, so `#` and `/` stay classifiable).
2. In `linkRecords` (`scripts/digest/generate.ts`), copy a classified destination onto the digest link. Kinds: anchor (`#`), internal (path starting with `/`), external (`http`/`https`), email (`mailto:`), phone (`tel:`). A reliable destination is `{ status: "value", kind, href }`. An empty or missing `href` stays on the link as `missing` or `uncertain`. It is not a dropped field.
3. Relax `checkLinks` in `scripts/digest/schema.ts` so a reliable destination is valid. Keep rejecting a bare unclassified URL. Narrow the `link-destination` unsupported record to uncertain links only. Update section 3 of `docs/poc-v2/digest-contract.md` and the assertion in `tests/digest/digest.test.ts`.

## Alternatives rejected

Leave destinations `unsupported` and hope the builder reads the snapshot. Rejected. `.cursor/SKILLS/BUILDER.md` forbids `snapshot.html`, `structure.json`, and `computed.json`. The digest contract says the builder does not open structure files. The snapshot still has the addresses, and the capture node does not, so the later stage cannot see them.

Drop anchors with an empty `href` from `links`. Rejected. The requirement is to flag uncertain destinations, not omit them.

Resolve with `el.href` before classifying. Rejected. The browser turns `#pricing` and `/about` into absolute URLs, so anchor and internal disappear.

## Assumption

A parseable `href` of those five kinds is reliable. `javascript:` and an empty `href` are uncertain. A missing attribute is `missing`, not a silent omission.

## After review

The `visit` step is not part of this change. The digest reads the `href` stored on the anchor, including an empty string, and this lands together with note 01. The address is `destination.href` with kind `anchor`, `internal`, `external`, `email`, or `phone`. A missing attribute is `missing`. An empty or `javascript:` address is `uncertain`. Older files may still use `unsupported`.
