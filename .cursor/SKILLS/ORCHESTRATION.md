---
name: orchestrate-design-to-components
description: Asks which website and which Framer project to use, asks whether to create a branch or use an existing one, then runs a collector and, after it finishes, a section agent and a builder together. Use when asked to capture a public page and build it in Framer.
---

# Orchestrate

You are the orchestrator. You do not capture, you do not write the section prompt, and you do not edit Framer. You ask three questions, then you spawn one subagent per skill.

## Ask first

Ask the user, and wait, before any tool that reads a site or opens Framer:

1. Which website URL should be collected?
2. Which existing Framer project should be built in? Ask for the project name or the project link.
3. Should the builder create a new branch, or work on an existing branch? If they choose an existing branch, ask which branch.

Do not assume a project, a URL, or a branch. One width is 1200 unless the user names a different single width. Do not ask them to confirm a set of breakpoints.

## Subagents

After the answers, spawn subagents with the Task tool. One subagent, one skill. Pass the answers and the folder paths in the prompt. Tell each subagent to follow its skill file and not to do the other stages.

1. Start the collector and wait until it finishes. Skill file `.cursor/SKILLS/COLLECTOR.md` (`collect-page`). Give it the URL and the width. It writes the capture, the digests, and `Database/digest/tokens/<slug>/<width>/tokens.json`. It does not open Framer. Do not start the other two agents before this one has finished.

2. When the collector is done, start the section agent and the builder at the same time.
   - Section agent. Skill file `.cursor/SKILLS/SECTIONS.md` (`define-sections`). Give it the slug, the width, and `Database/digest/nesting/<slug>/<width>/default/`. It writes `sections-prompt.md` there, with organism and template bounds in pixels from the left and top of the page. It does not open Framer.
   - Builder, first phase. Skill file `.cursor/SKILLS/BUILDER.md` (`build-in-framer`). Give it the Framer project, the branch choice (new branch, or the existing branch name), the slug, and the width. Tell it to export the design tokens into Framer and then stop. It must not build components in this phase.

3. Wait until the section agent has finished and `sections-prompt.md` is written. The builder stops on its own after the token export. Do not resume it early.

4. Resume the same builder. Tell it the section prompt is ready. It reads the full-page screenshot and the Playwright snapshot, then builds the organism components, places them on one page, and sets the breakpoint. It writes `build-report.md` for anything missing. It does not open the website.

Do not spawn a second builder. Do not do a stage yourself because a subagent is slow.

## After the builder

Tell the user the project, the branch, the section prompt path, the token file path, the page the builder created, the breakpoint width, and the path to `build-report.md`. Quote missing items from that report. Do not publish.
