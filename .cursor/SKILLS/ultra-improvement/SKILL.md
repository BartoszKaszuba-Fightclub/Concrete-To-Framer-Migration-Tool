---
name: ultra-improvement
description: Turns unmet pipeline-review rows into kit changes that hold on any captured website. Records each pass in one document.
disable-model-invocation: true
---

# Ultra improvement

You are handed a finished pipeline review. You change the pipeline kit (the scripts and the skills in this repo) so the unmet rows get closer on any website the kit captures, and a previously met row stays met. Work stays on the current branch. Commit there. Never merge.

The kit is one pipeline for every site. A change that names a capture node id, a Framer node from one build, a page label, a site URL, a font name, or a pixel recipe from one page is not a kit change. Leave that row unmet and record which fact the digest or the skill rule does not carry.

Read `docs/pipeline-runs/improvement.md` immediately after this skill. Rows and themes named under `Open` with `Status: open` are skipped.

A row can be improved when its status is Not met, Not measured, or Other. Skip Met. Skip a row named in an open issue.

## Criterion agents

Dispatch one `generalPurpose` subagent per improvable row, all in one message. Each prompt names one row only. The prompt must require the return to use these four headings, in this order: Why, Evidence, Proposal, Risk. A return that lacks one of them is not done. Send that agent back once and name the missing heading. A second return that still lacks it is dropped.

Each prompt contains:

```
Onbeheerde run: volg .cursor/skills/unattended/SKILL.md.
Repo: <absolute repo path>. Branch: the current branch. Read-only.
Row: <requirement or metric text, status, and how it falls short>.
The kit captures many websites. Find the stage that dropped or ignored the fact this row needs, in a way that would fail the same way on another site.
Evidence may cite a node id, a screenshot, or a file from this run. The proposal may not. The proposal names the field, the script, or the skill rule. It stays true if every id in the evidence is replaced.
Use these headings, in this order, and no others:

## Why

## Evidence
Cite a file path, a Framer node, or a screenshot. No citation means the problem is not validated.

## Proposal

## Risk

Change no files.
```

Done when every row has a return under those four headings, or was dropped. A return whose Evidence cites nothing is dropped. A proposal that only tells the builder how to draw this page is dropped. The rest are the validated problems. Keep them in the conversation. Do not write them to a second file.

## Senior

Dispatch one subagent. Paste every validated return into the prompt. The senior reads those returns and nothing else from the row agents.

```
Onbeheerde run: volg .cursor/skills/unattended/SKILL.md.
Repo: <absolute repo path>. Read-only. Write no file.
You have every validated proposal below. The kit must build any captured website.
For each cluster of proposals, name the stage that dropped the fact: capture, digest, tokens, section prompt, or the builder rule that ignores a field the digest already stores.
A theme changes that stage so the next site gets the fact without a sentence about this page.
Drop a proposal whose only instruction is a node id, a label, a colour, or a pixel from this capture.
Return one block per theme, and no other file:

## <theme name>
Files:
<one repo-relative path per line>
Change:
<the rule or the script change, with no capture id and no page label>
Data:
<the field the stage must store or read>
Tradeoff:
<which met row this can worsen>

## Dropped
<proposal, and the reason it was a one-site fix>
```

Done when that return is in hand and names each theme, the files, the change, the data, and the tradeoff.

## Review the senior

Dispatch a new subagent. Paste the senior's return and the validated proposals. It does not edit files.

The reviewer prefers the change that makes the requirement true, and rejects a change that makes the kit specific to one website. It looks at why the pipeline missed the fact, across capture, digest, tokens, the section prompt, and the builder. A sentence in a skill that names this page's nodes is a miss even when it would raise the score on this site.

It returns corrections: a theme to drop, a theme to narrow, a cause the senior missed, or a path that Change edits and Files omits. A theme whose Change contains a capture node id, a Framer node id, a page label, a site URL, or a pixel copied from this page is dropped.

Done when that return is in hand and the implement round below is dispatched. The themes you keep are the senior's themes after those corrections, minus any theme named under `Open`. The review writes no code.

## Implement

This round solves the kept themes. Split them by file, then dispatch one owner per file, all in one message. A file has one owner. Themes that name the same file are slices of that owner, in theme order.

Before dispatch, read Files on each kept theme. Add a path that Change edits and Files omits. The slice text is the Change sentences for that path, plus that theme's Data, Tradeoff, and reviewer correction.

Create one detached worktree per file from `HEAD`:

```bash
git worktree add --detach .scratch/ultra-improvement/worktrees/<slug> HEAD
```

`<slug>` is the repo-relative path with each `/` replaced by `-`.

Each prompt:

```
Onbeheerde run: volg .cursor/skills/unattended/SKILL.md.
Repo: <absolute repo path>. Worktree: <absolute worktree path>. Detached HEAD. One file only: <repo-relative path>.
Slices, in this order:
1. Theme <name>. Change for this file: <sentences>. Data: <data>. Tradeoff: <tradeoff>. Reviewer: <correction or none>.
Solve each slice in that file. Edit only that file. Apply the slices in order. Commit each slice that fits in this worktree. The message says why.
A slice that would insert a capture node id, a Framer node id, a page label, a site URL, or a pixel recipe from one page is skipped. Return it under Needs as site-specific.
When a slice needs a different file, skip that slice and make no edit for it. Return the skipped slice under Needs with the path.
Return each commit hash in slice order, or no code when a slice changed nothing.
```

The worktree commit is the patch. Copy it onto the current branch. The worktree is not merged.

```bash
git diff <hash>^ <hash> -- <path> | git apply
```

Commit that patch on the current branch with the worktree message. Apply a file's slices in the returned order.

When an owner returns Needs, apply the commits it did make. Dispatch one owner for the named path after the other patches are on the branch. That worktree starts from the new `HEAD`. The slice is the skipped one. A site-specific skip is not dispatched again.

Remove a worktree after its patches are on the branch:

```bash
git worktree remove .scratch/ultra-improvement/worktrees/<slug>
```

Done when every slice is a commit on the current branch, a site-specific skip, or the owner reported that the slice needed no code.

## Test

Run `npm test` from the repo root after those commits are on the branch.

When the command exits 0, go on to Fresh review.

When the command fails, `git revert` each slice commit from this round, newest first, and leave those revert commits. Append one open issue per reverted theme under `Open` in `docs/pipeline-runs/improvement.md`:

```markdown
## <theme name>
Status: open
Files: <repo-relative paths>
Test: npm test
Failure: <the failing test name and its assertion line>
```

Do not implement an open issue again. Fresh review does not run for a round that failed this test.

## Fresh review

Dispatch a new subagent per slice commit, all in one message. None of them built the change. Each prompt names one hash and tells the agent to read that diff. The agent returns `keep` or `revert`. `revert` names the met row the diff worsens, the break in a pipeline stage that previously finished, or the capture id, page label, or site URL the diff wrote into a skill. Read-only.

For each `revert`, run `git revert` on that hash and leave the new commit. A `keep` stays.

Done when every slice commit is kept or reverted.

## Record

Append one pass section to `docs/pipeline-runs/improvement.md` after the fresh review, or after the test revert when fresh review did not run. This is the only document. Do not write a validated file, a themes file, a recurring file, or `docs/pipeline-runs/unattended-improvement-<n>.md`.

Use the next free `## Pass N`. Do not rewrite an earlier pass. The section has these three headings and no others:

### What changed

At most eight sentences. Name the commits that stayed, what the kit does differently, and which requirement that moves. A reverted slice is one sentence here.

### Data

What the previous run read (site, capture folder, and the fields the builder used), and what the kit reads now that the change is in place.

### Skills

What the edited skills told the agent to do before this pass, and the rule they tell the agent to follow after it. Quote neither file. Two short paragraphs.

Commit that document on the current branch.
