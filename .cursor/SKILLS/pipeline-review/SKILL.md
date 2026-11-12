---
name: pipeline-review
description: Scores the current Framer migration against the requirements and metrics M1–M18. Reports what is met and what still differs. Changes nothing.
disable-model-invocation: true
---

# Pipeline review

You compare the source website with the Framer page and you write two tables. The repo, the capture, and the Framer project stay as they are. No code edits, no Framer writes, no published fixes.

The kit is for any website. A finding names the difference on this page in field terms: the source value, the Framer value, and the capture field that holds the source value. It does not name a remedy. It does not name a node, a label, a colour, or a pixel from any other site.

No arguments. Read `docs/pipeline-runs/context.md` for the source (URL or fixture), the Framer project, the branch, the page, the width, and the criteria file. Width is 1200 when the file names none. The criteria file is the path in that context. When the context names none, use [criteria.md](criteria.md) beside this skill. Score that file.

## Lay the two sides open

1. Open the source in the browser at that width. A fixture opens as a local file. Screenshot the page.
2. Open the Framer project with the Framer MCP (`user-framer`). Read each tool schema once, the first time you call it. Read the built page on the named branch at the same width: component types, text styles, fills, borders, spacing, links, image fields, alt text, and heading tags.
3. Keep the screenshot and the Framer read in front of you while you score. The live source is the copy the pipeline is supposed to match. Capture files (`computed.json`, digests, `build-report.md`, tokens) support a number. They do not replace the screenshot or the Framer read.

A row is Met only when this review cites a file path, a Framer node or style, or a screenshot from this review. A sentence in a skill is not evidence. A page you could not open is Not measured, and the cell says which side failed.

## Requirements

Score the built result. A requirement about the page is judged on the Framer page. A requirement about capture, metadata, links, or documentation is judged on the artefacts of this run. The screenshot for the capture requirement is `Database/Screenshots/<slug>/<width>/default/screenshot.png`. The digests record that path on `evidence.screenshot.path`.

Walk the requirements in the criteria file, in that order. One row per requirement. Status is Met or Not met. Met leaves "How it falls short" empty. Not met names the concrete difference: what the design has, and what the criterion asks for.

## Metrics

Walk M1–M18 in the criteria file. For M3–M18, read the source and the Framer page at the same width. Met means you found no difference of the kind that metric names. Not met quotes the source value and the Framer value, or describes the visible difference when the value is a layout failure (overflow, clipping, overlap, wrapping, stacking).

When `first-component.md` is in the capture folder, its modification time is the first completed component, counted from the start of placement. The start of placement is the placement-start timestamp in the capture folder when that timestamp is earlier than `first-component.md`. A stale timestamp lengthens M1. When that timestamp is missing or not earlier, the start is the Started time of the first Place organisms row that counts. A Place organisms row counts only when its Started time is earlier than `first-component.md` and its Ended time is later than or equal to that file. Take the row from the timing table of a pipeline test run in this conversation when the table's window ends at or after `first-component.md`, otherwise from the newest timing table under `docs/pipeline-runs/` whose window ends at or after that file. The window runs from the table's earliest Started time to its latest Ended time. When `first-component.md` is absent, M1 uses the timing table from a pipeline test run in this conversation, otherwise the newest timing table under `docs/pipeline-runs/`. When the start is still unset, Not measured, and the cell says no timed run is available.

M2 is a count of native Framer layers against components that use custom code or overrides, taken from the Framer project. Apply the M2 caveat in the criteria file. The percentage and the caveat both belong in the row.

Any further difference between the Framer page and the live source gets a row after M18, id `Other`, with both sides named.

## Output

Two tables in the reply. Describe the difference. Leave the remedy out. The rows below show the shape. Replace every placeholder with this review's findings. Do not leave the sample values in the reply.

### Requirements

| Requirement | Band | Status | How it falls short |
| --- | --- | --- | --- |
| <requirement text from the criteria file> | Must | Not met | <what this page shows> against <what the criterion asks for> |

### Metrics

| Metric | Status | How it falls short |
| --- | --- | --- |
| M4 — Font size | Not met | Source <element> is <source size>. Framer text style <style name> on that layer is <built size>. |

The requirements table has every requirement in the criteria file. The metrics table has M1–M18, then any Other rows.

The review is finished when both tables are in the reply.
