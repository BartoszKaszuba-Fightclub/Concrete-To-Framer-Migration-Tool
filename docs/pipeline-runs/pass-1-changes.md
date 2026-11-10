# Pass 1 — changes under test

This pass tests the `lean-pipeline` branch before any requirement fix. The notes below describe the branch as it stands. Gap agents add their own sections after the run. They do not edit this list.

Assumption for this pass: one local HTML page at 1200px is enough to see whether capture, tokens, and digests keep the requirement signals. A Framer project is opened only if the credential can reach one. Building that local page in Framer is in scope when a project is available. It is not invented from the skill text.

## Capture writer

`scripts/generic-extractor/cli.ts` no longer writes `reconstruction.json` or `signatures.json`.

Why: the digest generator builds its own simplified tree from `structure.json` and `computed.json`. Nothing in the later commands opened the signature file. Writing both files made the next agent look in the wrong place.

Alternative set aside: keep `reconstruction.json` and make the digest generator read it. That saves a second simplify, but it keeps a second tree that drifted from the digest on the last trial.

`scripts/generic-extractor/extract.ts` no longer calls `simplify()` during capture. `structure.json` no longer stores `sectionShell`, `excluded`, or a second copy of `state` and `viewport` under `metadata`. `metadata.breakpoints` remains.

Why: section coverage still warns about nodes outside a section. The shell id list and the excluded-node list had no reader. Top-level `state` and `viewport` already carry those two values.

`scripts/generic-extractor/browser.js` stores each discovered media query as `media` and `pixels` only.

Why: the old list repeated the stylesheet address on every rule. The useful unread-sheet note stays on `inaccessible`, which still has `href` and `reason`.

`scripts/generic-extractor/match.ts` is deleted.

Why: no file imported it. It belonged to the old cross-width match files, which this pipeline does not write.

Alternative set aside: leave the file so an old reader can find the idea. That makes the next agent treat dead code as part of capture.

Button grouping still happens in memory. `components.json` keeps `signatureId` on each record. `signatures.ts` stays because `components.ts` imports it.

## Tokens

`scripts/design-tokens/collect.ts` writes `source` as the viewport only. Each colour is `name` plus `framer.light`. Each text style keeps its measurements once, on `framer`. `letterSpacing` stays `normal` when that keyword was measured. Spacing, borders, radii, and shadows stay.

Why: the builder reads `framer.light` and the `framer` text fields. The old file repeated the same colour as `css`, `alpha`, and `framer.light`, and repeated each text measurement above `framer`. Spacing stays because the builder is told to apply those values on the layers.

Alternative set aside: drop spacing, borders, radii, and shadows too. That makes the file smaller and leaves the builder with no measured value to apply.

`scripts/design-tokens/cli.ts` builds the output path from `structure.slug` and `structure.viewport.width`. `--language` is accepted and not written.

`scripts/design-tokens/apply.ts` is deleted.

Why: it was a second Framer writer. The builder skill uses the Framer MCP server. Nothing imported `apply.ts`.

## Digests

`scripts/digest/cli.ts` accepts `--all`. One process reads `components.json` and `sectionCandidates`, writes every digest, and writes `digests/index.json`.

Why: the collector was starting one process per button, field, and section, and each process re-read the same two files.

`scripts/digest/jobs.ts` is the pure planner those jobs use. The unit test checks the order: component records, then section candidates.

`scripts/digest/generate.ts` no longer copies `selector`, `classes`, or `domId` onto digest nodes. It omits language, timestamp, fonts, and the “screenshot missing”, “crop missing”, and “letter-spacing normal” warnings. A painting pseudo keeps content, size, opacity, colour, background, and border sides whose width is a real value. Token records are `id`, `kind`, and `proposal`. The measured values stay on `nodes.styles`.

Why: the builder did not read those warnings or the copied token values. The keyword `normal` remains on the node’s letter-spacing measurement, so it is not thrown away.

Alternative set aside: bump the digest schema to 2.1.0. The example file is still 2.0.0. The validator accepts the older, larger example and the new smaller output, so the version stays 2.0.0.

Link destinations are still marked unsupported and the address is not stored. That behaviour is unchanged on this branch. The pass will measure it. It is not claimed as a fix.

## Agent directions

`.cursor/SKILLS/ORCHESTRATION.md`, `COLLECTOR.md`, `SECTIONS.md`, and `BUILDER.md` are shorter task cards. They name the input files, the output file, and when a stage may spawn one subagent per organism. The builder’s report includes a type, colour, spacing, and image scorecard.

Why: the previous cards told the collector to open the CLI source to discover flags, and told the builder to read the whole HTML snapshot.

`package.json` `test` runs the extractor, digest, and design-token suites. The `poc:*` scripts pointed at a `poc/` folder that is not in this tree, so they are removed. `framer-api` and `dotenv` left with `apply.ts`.

## Not changed before this run

Heading tags, alt text, link addresses, Framer component properties, and a written classification document were not part of the lean-up. The matrix after the run is the record of whether they already hold.
