# Test pass, 5 November 2026

One public page, `https://yellowhive.com/nl`, was collected at 1200×900 and built in the Framer project Enchanting Whoever. The new branch is `test 3` (`csad5nwqj`), created from main. Nothing was published. The run log is `Database/pipeline-timing.md`. The builder’s own gap list is `Database/digest/nesting/nl/1200/default/build-report.md`.

## The patch under test

The single orchestration skill had been split into a collector, a section agent, and a builder. The orchestrator asks for the site, the Framer project, and whether to create a branch. It waits for the collector, then starts the section agent and the builder together. The builder exports color and text styles and stops. When the section prompt exists, the same builder continues.

The collector dismisses the cookie banner, then writes structure, computed styles, the simplified tree, the button inventory, signatures, a full-page screenshot, and the HTML snapshot. It then writes `tokens.json` and one schema 2.0.0 digest per button and per section. The section agent writes `sections-prompt.md` with organism and template bounds in pixels from the top-left of the page. The builder was told to make organism components and one template component, and not to place that template on a page.

## What the run yielded

Capture wrote 376 elements, 4 sections, and 16 buttons. The token file has 11 colours and 25 text styles. Twenty digests were written.

The section prompt names the template Over Yellow Hive, from y 0 to 5255, and eight organisms: the hero, Over Yellow Hive, Groei door overnames, the header, Werken bij Yellow Hive, the news section, the help section, and the footer.

Framer received 11 color styles and 25 text styles. Lexend at weights 400, 500, and 700 was already in the project. Eight organism components and one template component, Over Yellow Hive, were created in Assets. The page breakpoint was set to 1200×900. The Home route stayed `/`.

Command time, not agent overhead:

| Step | Duration |
| --- | --- |
| Capture | 21s |
| Token file | 25s on the agent’s clock. The same command on the same files later took 0.09s. The stamp includes the agent reading the digest contract. |
| Digests | 2s |
| Section prompt | 4m 18s of reading the capture and writing the prompt |
| Branch `test 3` | 1m 40s, mostly Framer API docs before one create-and-switch |
| Styles, then reading the screenshot and digests | 8m 25s for the whole window. The styles themselves were a few Framer calls. |
| Organisms, template, and breakpoint | 4m 31s as one batch |

From cleanup of the previous `nl` capture (12:06) to the builder returning (12:38) was about 32 minutes. Six of those minutes were the Framer server being disconnected. The 12:12 attempt created no branch.

## What went wrong

The first builder pass could not open Framer. The server was absent from that session. It was authenticated later, and the 12:23 run created the branch.

The template was stored as a component in Assets. The skill told the builder not to place it on a page. Assets had no Templates, Organisms, or Design tokens folders.

Images were missing. Capture stored remote URLs and never wrote files, so every `usablePath` stayed empty. Inline SVG for the hero overlays and the footer phone, envelope, and LinkedIn icons was already in the digests and was not drawn.

Several organisms were positioned absolutely from page coordinates. The header links started too far right, the Contact control and the bar did not match the live header, and slider labels wrapped one letter per line. Slider dots were in the capture and were skipped. Titles and paragraphs used a larger text style than the node that was measured, so type and line spacing looked too heavy and the gap above buttons was too large. The pale yellow feature shape was a `::before` and was skipped. News titles and the intro were left-aligned instead of centered, cards were square, and the reading-time label had no chip. Help-section links were floated over the sentence. The footer dropped its icons, divider, and scroll arrow, and the bottom links were spaced unevenly.

Framer rejected `letterSpacing: normal` and kept `-0.02em` on every text style. Five organisms were listed with button digests only, so the builder fell back to the coarse section digest for their content.

## What changed after the pass

Those findings were written into `.cursor/SKILLS/BUILDER.md` as short rules: one page instead of a template component, asset folders, local images and inline SVG, auto layout except for an overlay, measured type and button gaps, and the header, slider, card, link, and footer cases. Capture now downloads each media URL into the capture’s `assets/` folder and records `usablePath`. The separate iteration files were removed after that text was in the builder skill. This pass was not rebuilt in Framer after that change.
