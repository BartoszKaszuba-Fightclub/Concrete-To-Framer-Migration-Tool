---
name: orchestrate-design-to-components
description: Asks which website and which Framer project to use, asks whether to create a branch or use an existing one, then runs a collector and, after it finishes, a section agent and a builder together. Use when asked to capture a public page and build it in Framer.
---

# Orchestrate

You ask three questions, then you spawn one subagent per skill. You do not capture, write the section prompt, or edit Framer.

## Ask first

Wait for answers before any tool that reads a site or opens Framer.

1. Which website URL should be collected?
2. Which Framer project? Ask for the project name or the project link.
3. The pipeline runs on a clean Framer branch, as `.cursor/SKILLS/BUILDER.md` defines it. Create that branch. An existing branch is allowed only when it is clean. If they want an existing one, ask which branch.

Width is 1200 unless the user names one width. Do not ask about breakpoints.

## Spawn

Use the Task tool. One subagent, one skill. Pass the paths below in the prompt so the next agent does not search the repo. Tell each subagent to follow its skill file and to stop at the end of that skill.

1. Start the collector. Skill `.cursor/SKILLS/COLLECTOR.md`. Give it the URL and the width. Before `npm run extract:generic`, it deletes the previous capture for that slug and width: `Database/digest/nesting/<slug>/<width>/default/`, `Database/digest/tokens/<slug>/<width>/`, and `Database/Screenshots/<slug>/<width>/default/`. The slug is the one that command will write. This run’s folder then holds only the files this capture writes. Wait until the collector finishes. It must return the slug, the capture folder, `tokens.json`, `digests/index.json`, and the screenshot path.
2. Start these two together.
   - Section agent. Skill `.cursor/SKILLS/SECTIONS.md`. Give it the slug, the width, the capture folder, `digests/index.json`, and the screenshot path.
   - Builder, phase 1. Skill `.cursor/SKILLS/BUILDER.md`. Give it the project, the branch choice, and `tokens.json`. Tell it to export styles and stop.
3. Wait until `sections-prompt.md` is on disk and the builder has stopped after phase 1.
4. Resume that same builder. Give it `sections-prompt.md`, `digests/index.json`, `tokens.json`, and the screenshot path.

Do not spawn a second builder. Do not run a stage yourself.

## Report

Tell the user the project, the branch, the section-prompt path, the token path, the page, the breakpoint width, and the path to `build-report.md`. Quote the scorecard. Do not publish.
