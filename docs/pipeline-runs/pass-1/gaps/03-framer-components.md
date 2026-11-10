# Native Framer components

Requirement: build pages using native, reusable Framer components.

## Root cause

The pipeline stops at files. Pass 1 captured `tests/extractor/fixtures/requirements.html` and wrote `Database/pipeline-runs/pass-1/tokens.json` plus three section digests: `clip-01` (header), `clip-02` (main), and `clip-03` (footer), under `digest/nesting/requirements/1200/default/digests/`. `source.viewport` is 1200×900. There is no `sections-prompt.md` and no `build-report.md`.

Nothing in `scripts/` calls Framer. `scripts/design-tokens/apply.ts` was deleted, so the old `framer-api` writer is gone. The collector and the section card both forbid opening Framer. The only instruction that creates organism components and places them on one page is `.cursor/SKILLS/BUILDER.md`. Orchestration never spawned it. This pass named no project, so the builder would have stopped. `user-framer` (`open_project`, `exec`) was unused.

## Smallest next step

A skill instruction, not new code. The builder agent following `.cursor/SKILLS/BUILDER.md` already creates one organism component per prompt block and places those components, in order, on one page. The breakpoint is `source.viewport`: 1200×900.

Phase 2 starts only after `sections-prompt.md` exists. The section agent following `.cursor/SKILLS/SECTIONS.md` writes that file and does not open Framer. Its default path is `Database/digest/nesting/<slug>/<width>/default/`. This capture lives under `Database/pipeline-runs/pass-1/digest/nesting/requirements/1200/default/`. Point the section agent at that folder and the three digests already on disk.

The parent names the project and branch and resumes that builder. It uses `user-framer` `open_project` and `exec`, places the three organisms on one 1200×900 page, and writes `build-report.md`. No component framework, variants, or property controls.

## Alternatives rejected

Restoring `apply.ts` or calling `framer-api`. Nothing imported that file. It was a second writer, and the token path returned UNAUTHORIZED before `getProjectInfo`. `Archive/poc-html-scrape-and-visual-clone/rebuild-framer.ts` targets another project and another JSON file.

A new script under `scripts/`. Framer writes sit on the builder card. A script would repeat that card and would still need a named project.

Recapturing the fixture or reading `snapshot.html`. The builder is forbidden from both. The digests are already the layer source.

Designing atoms, variants, or property controls first. Those are other requirements. This page is the three section organisms the builder card already places. An empty `components.json` record list does not block them.

## Assumption

This pass created no project, and this note did not open Framer. If a project must be created, create it in Bartosz's Workspace. Do not use the Fightclub workspace. The parent still names the project and the branch. The builder stops when the project is missing.
