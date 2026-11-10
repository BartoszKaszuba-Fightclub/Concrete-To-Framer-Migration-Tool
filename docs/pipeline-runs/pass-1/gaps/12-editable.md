# Gap 12 — Designer-controlled decisions

Requirement: keep the result editable and maintainable, with designers controlling uncertain decisions.

## Root cause

Nothing written before a Framer build is a decision a designer can change.

Pass 1 stopped after capture, tokens, and digests. `Database/pipeline-runs/pass-1/digest/nesting/requirements/1200/default/` has `digests/index.json` and three clip files, and no decisions file. The pass summary records that Framer was not opened, so `build-report.md` was never written.

`.cursor/SKILLS/BUILDER.md` writes that report only after phase 2 places organisms on a page. Step 4 says to skip a missing value, record it, and continue. The scorecard appears after placement. Orchestration never hands the builder a decisions file.

The uncertain facts are also absent from files a later stage may read. Empty link `n-000010` is the text "Empty" with no `href`. Card image `n-000026` is `media: [{ kind: "img", url }]` and has no alt. Every digest link is `destination.status: "unsupported"` for one shared out-of-scope reason.

## Smallest change

When the digest command writes `digests/index.json`, also write one short list in that same folder: `decisions.md` or `decisions.json`. One row per uncertain item: node id, what is uncertain, and a default. The designer edits the default before the build. The builder reads the edited file. No review UI.

Until alt and link address exist on the files this stage reads, the list has no rows. Write the file anyway.

## Alternatives rejected

Waiting for `build-report.md`. It exists only after a Framer page, and this pass never got there. Skipping a missing value records a gap after placement.

A review screen, or Framer property controls as the decision step. Controls are a separate requirement. A screen is larger than one file beside the digests.

Putting the default inside each digest. Those files are regenerated, and the schema rejects `href`. A sibling file is the edit.

## Assumption

On this pass, uncertain means a missing alt, or a link whose address is empty or not parseable. This note does not specify how those fields are captured. They are absent today, so the decisions list is empty until they exist. The file is still written.

After review: the designer edits alt and destination on the digest, and there is no empty decisions file.
