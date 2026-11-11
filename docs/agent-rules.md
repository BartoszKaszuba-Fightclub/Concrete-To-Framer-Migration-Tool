# Agent rules

Read this file after every context summary, before the next pipeline pass.

## Decisions

1. Take the change that fixes the cause in the kit, and record the assumption in the current pass of `docs/pipeline-runs/improvement.md`.
2. One breakpoint per proof of concept. The width is 1200 unless the pass document names a different single width.
3. An independent reviewer checks gap analysis before any code change from that analysis is applied.
4. The reviewer rejects false assumptions and fixes that miss the cause. Prefer the change that makes the requirement true on any site the kit captures. Reject a change that names one site's nodes, labels, colours, or pixels.

## Pass shape

1. Before the run, write what changed in the files under test, why, and which alternatives were set aside.
2. Run the pipeline at one width: capture, tokens, digests, then the section prompt and the Framer build when those stages are in scope for the pass.
3. Write a human-readable summary with a met / not met matrix.
4. For each requirement that is not met, start a new subagent. That agent writes why it failed and the kit change that would still hold if the cited node were swapped for another capture. One agent does not cover two requirements.
5. A new reviewer reads those notes. The gap agents then adjust. They do not implement until the review is in.
6. Start new subagents on the next pass. Do not resume the previous pass’s agents.
7. After the summary, shrink the working notes to `docs/pipeline-runs/context.md` and read this file again.

## Requirements

Must:

- Capture content, styles, measurements, screenshots, links, metadata, and assets.
- Preserve H1–H6 semantics independently of visual styling.
- Build pages with native, reusable Framer components.
- Map text, typography, colours, and spacing to the correct components and reusable styles.
- Expose text, images, colours, variants, and interaction settings through normal Framer controls.
- Use custom code or overrides only when necessary, and explain why.
- Preserve image metadata, including alt text, and flag missing essential metadata.

Should:

- Map images to Framer image fields, not text URLs.
- Translate nested source HTML into clean Framer layers, stacks, and components.
- Identify repeated elements and classify them with Atomic Design.
- Migrate internal, external, anchor, email, and phone links when the destination is reliable. Flag uncertain ones.
- Keep the result editable. Designers control uncertain decisions.
- Document component-classification rules and a repeatable migration workflow.

## Evidence

A requirement is met only when the pass summary cites a file, a command, or a Framer result from that same pass. A skill sentence is not evidence that a page was built.
