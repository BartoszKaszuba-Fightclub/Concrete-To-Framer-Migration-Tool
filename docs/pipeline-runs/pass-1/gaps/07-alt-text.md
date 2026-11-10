# Alt text

Requirement: preserve available image metadata, including alt text, and flag missing essential metadata.

## Root cause

`collect` in `scripts/generic-extractor/browser.js` builds each node in `visit`. The inner `add` pushes media as `{ kind, url }` and never reads `alt`. `extract` types `media` as `{ kind, url }` and adds no metadata warning. `generateDigest` copies each url to an asset as `originalUrl`, `usablePath`, `naturalWidth`, and `naturalHeight`. `warningRecords` flags a missing path or natural size only.

The fixture has three images. Two have alt (`Site logo`, `Card one image`). The card-two image has no alt attribute. Clip-02 is main, so its assets have `originalUrl` and `usablePath` and no alt, and no warning names the gap. `page.content()` still writes the attributes into `snapshot.html`. The builder must not open that file or `structure.json`.

## Smallest change

In `add`, for an `img` or an `input` of type `image`, set `alt` when `hasAttribute("alt")` is true, including `""`. Omit it when the attribute is absent. Do not put alt on background, mask, or poster urls.

In `extract`, for each `img` media record whose `alt` is not a string, push one warning: `{ code: "alt-missing", message: "Image has no alt attribute.", nodeIds: [id] }`. `warningRecords` already copies a structure warning when a listed node is in the digest, so clip-02 gets the card-two flag once. Do not add a second warning there.

In `generateDigest`, copy `media.alt` onto the asset when it is a string. Widen `media` on `DomNode` and `StructureNode`. Leave `validateDigest` unchanged: alt is an optional string, not a required measurement, so a missing alt does not fail the digest.

Do not add srcset, sizes, title, or captions. `currentSrc` is the rendered url. A caption is its own text node.

## Alternatives rejected

Reading `snapshot.html` from the builder. That file is forbidden, and this pass ignores facts that exist only there.

Storing alt in `assets.json` via `saveCaptureAssets` or `mediaReferences`. Those records are one per url. The three images share `pixel.png`, so one download cannot hold two alt strings and a missing flag.

Failing the capture through `missingMeasurements`. The CLI exits on that list. A missing alt stays a warning.

A second check in `warningRecords`. The structure warning is already copied.

## Assumption

Essential metadata here is the alt string. A missing alt attribute is a flag. It does not fail capture or digest validation. `alt=""` is present: store it, and do not warn.

After review: keep. Alt warning is emitted by the digest when the attribute is absent.
