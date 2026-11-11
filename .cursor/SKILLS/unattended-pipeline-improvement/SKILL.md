---
name: unattended-pipeline-improvement
description: Runs the migration pipeline unattended on alternating sites, reviews it, and keeps improving on the current branch until each site has reached 80%.
disable-model-invocation: true
---

# Unattended pipeline improvement

You run the migration pipeline, review the result, and hand the gaps to ultra improvement. The pipeline must still finish afterwards, and a criterion that was met stays met. The kit is for any website. Keep going until the latest pass of each listed site is at least 80%.

## Sites

Use these sites in turn. A pass uses the site the previous pass section did not use. The first pass of a run uses the site that is not the one in `docs/pipeline-runs/context.md`.

- https://yellowhive.com/nl
- https://towmotive.com/

The Framer project and the criteria file stay the ones in `docs/pipeline-runs/context.md`. When the context names no criteria file, use `.cursor/SKILLS/pipeline-review/criteria.md`. When the context names no Framer project, stop and name that missing field.

## Unattended

Read `.cursor/skills/unattended/SKILL.md` and follow it for the rest of the pass.

Stay on the current git branch. Commit only on that branch. Never merge. Do not check out `pipeline-improvement`.

## Test

Follow `.cursor/SKILLS/pipeline-test-run/SKILL.md`. The website is the one this pass selected. The Framer project is the one in the context. Git commits stay on the current branch. The Framer branch is a clean branch, as `.cursor/SKILLS/BUILDER.md` defines it: new from that project's main, with no components, styles, or pages from an earlier run. Pass that Framer branch to the test run. Do not pass the git branch name as the Framer branch. Width is 1200 unless the context names one.

Write the selected website into `docs/pipeline-runs/context.md` before the test run, and clear any earlier stop line.

Done when that skill's timing table is in the conversation.

## Review

Follow `.cursor/SKILLS/pipeline-review/SKILL.md` against the same website and Framer project. The criteria file is the one from the context. Pass that path through. The review scores every row in it.

Scored rows are every Must item, every Should item, and M1 through M18. An Other row counts when the review writes one. Percentage is met rows divided by scored rows. At least 80% means that percentage is 80 or higher. 24 of 31 is under 80. 25 of 31 is at least 80.

Done when both review tables are in the conversation and the met percentage is stated.

## Improve

When the percentage is under 80, follow `.cursor/SKILLS/ultra-improvement/SKILL.md` with those tables.

When the percentage is at least 80, skip ultra improvement.

Done when ultra improvement has kept or reverted every slice commit, or has recorded the failed themes under `Open` in `docs/pipeline-runs/improvement.md`, or was skipped because the percentage is already at least 80.

## Record

The only run document is `docs/pipeline-runs/improvement.md`. Ultra improvement appends its pass section when it runs. When it was skipped, append the next `## Pass N` yourself, with the same three headings:

### What changed

At most eight sentences. State the site, the met percentage, and that the kit was not edited.

### Data

The capture folder this pass wrote, and that the next pass reads a new capture of the other site.

### Skills

The skills were not edited. One sentence.

The last line of the section is `Next: rerun on <the other site>` when either site still lacks a pass at or above 80% in this document. The last line is `Next: stop` when both sites have one. The last line is also `Next: stop` when this pass met no row that the previous review of the same site had missed and every new slice was reverted.

Commit the document on the current branch.

## Summarize and rerun

Run `/summarize`.

When the section says `Next: rerun on <url>`, follow this skill again with that website. When it says `Next: stop`, the run is finished.
