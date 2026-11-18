# Process map, unattended improvement 4

The map starts from the rows that were still unmet after this pass’s kit was built again. That rebuild is pass 5, review [f33549a8](f33549a8-533f-4ffb-aeec-4dd873cdf3b8), 26 of 31. Four rows stayed unmet: style mapping, links, M7, M9, and M17. Style mapping and M7 are the same letter-spacing fact.

A missing piece is recorded as a gap. It is not filled in from the pass note.

## Trace

| Piece | Where it is | Gap |
| --- | --- | --- |
| Opening scorecard | Review [1b07b6fc](1b07b6fc-6fe2-48d3-83e2-cfb3aa5db184), 19 of 34, sunlit-prism. The pass note compresses this table. | The parent message that dispatched this review was not found. |
| Row prompts | Subagent prompts at 2026-11-11 01:31, one row each. | No single parent message that pastes all of those prompts was found. |
| Row returns | The subagent replies. `.scratch/ultra-improvement/validated.md` is a compilation of them. | The turn that wrote `validated.md` was not found. |
| Senior | [98d91d92](98d91d92-09e6-47b5-ba52-e76715d7c976) at 01:53. It was told to read `validated.md` and to write `.scratch/ultra-improvement/themes.md`. | The skill text says to paste the returns and to write no file. This run did the other thing. |
| Reviewer | [14abe27a](14abe27a-1029-4573-a66f-0ce7bcd3d9b3) at 02:01. It read `themes.md` and `validated.md`. | None for the return itself. |
| Changes | Commits `42f2a7f` through `2bb2139`, still on the branch before `da49527`. | None. |
| Fresh review | One read-only agent per commit at 02:30. [47a65d3c](47a65d3c-06b0-4aba-8b62-3a0921528d43) returned `revert M14` for `b25c383`. | The parent message that kept `b25c383` anyway was not found. The keep is only in `unattended-improvement-4.md`. |
| Tests | `unattended-improvement-4.md` says `npm test` passed 29 next to `e309d61`. | The command and its output were not found in the transcripts. `e309d61` itself only changes `scripts/digest/generate.ts`. |
| Next score | Review [f33549a8](f33549a8-533f-4ffb-aeec-4dd873cdf3b8) on golden-crest, 26 of 31. `unattended-improvement-5.md` copies that result. | The pass note adds a news-instance height and a footer position that the review table does not. |

## Style mapping and M7

The opening scorecard records both rows as the same fact. All 25 text styles store `letterSpacing` `-0.02em`. Live text is `letter-spacing: normal`. Style mapping also records Contact `yihUV7Ry4` on the 16px navy preset.

The M7 prompt tells the row agent that Framer rejects `normal`, `0`, `0px`, and `0em`, and not to propose those values. The return from [ee9f07ce](ee9f07ce-8bd0-4665-9f5f-dd992024b561) leaves `textStylePreset` unset and sets the font fields on the layer. The style-mapping return from [6b7df8a7](6b7df8a7-9b3f-4d34-8d9a-546f5e4bba0b) is about Contact, and its last sentence also says to leave `letterSpacing` unset. `validated.md` drops that sentence and says letter-spacing does not move the style-mapping row.

The senior writes one theme, Letter-spacing left unset. Because all 25 styles are `normal`, the theme takes the preset off every text layer. It also folds the Contact font fields and the extra news line into that theme.

The reviewer drops the theme. M3, M5, and M6 are met from the preset, and `0`, `0px`, and `0em` stay forbidden. Contact keeps the named 18px preset, without `fontName` in that edit.

Nothing after that drop carries letter-spacing. There is no commit for it. The fresh review has no slice to judge. The next build still stores `-0.02em` on all 25 styles, including `text/h1/lexend-40px-700-52px-normal-none` (`k04zwLMx3`) on `QyZPYLYhT`. Style mapping and M7 stay unmet. The Contact half of style mapping does not: M4 and M11 are met on the next score, from `42f2a7f`.

## M17

The opening scorecard records a wrap, and it does not name tracking. The live third news title is 180px, five lines. Framer `QFPiJgtYF` wraps it onto four lines.

[19bb4990](19bb4990-de12-43d3-88ad-68370387780c) names the cause. At `normal` and at `0em` the title is 180px. At `-0.02em` it is 144px. The proposal sends `0em` on the text style and leaves the preset on the layer. The same send is required on the body styles, or Over, Groei, and the CTA stay one line short. The M7 prompt had already forbidden `0em`. The senior prompt repeats that ban, and the senior moves the wrap into Letter-spacing left unset.

The reviewer drop removes that theme, so the wrap goes with it. The next review still has four lines, and the fifth live line starts at “integreren”. M17 stays unmet for the tracking the dropped theme was going to change.

## Links

The opening scorecard’s links row is the seven closed header menus. Header `zJvMTws8n` has none of those layers. Phone and email already have `tel:` and `mailto:`. The row return and the senior theme follow that sentence. The reviewer narrows the hidden frames to those seven labels and leaves `href="#"` and the duplicate parent URLs out. `a493097` is that change. Its fresh review returned keep.

The next links row is a different sentence. In the gold band, You Sure, Felixx werk & inkomen, Yinco, and merken are underlined on the live page. Paragraph `ys5Rej8sy` has no link ranges. The hrefs sit on string variables. That sentence is absent from the opening scorecard, the links prompt, `validated.md`, and `themes.md`.

This miss does not spread through pass 4. It is first written in the next review. An earlier commit message, `31a7c6f`, names gold-band ranges. That diff was not read for this map.

## M9

The opening scorecard’s margin row is Groei at 525px against 561, the CTA at 449px against 465, and the footer at 699px against 759.

[9d5991cb](9d5991cb-28a5-4551-973e-5bfa12a327f3) gives those short bands two causes. Groei and the CTA wrapped one line early, so the proposal omits `letterSpacing` when the digest value is `normal`. The footer uses gap where the capture has margins, so the proposal sets gap `0px` and names spacers. The senior splits them. The letter-spacing half dies in the dropped theme. The spacers become `1f9163d`, with the reviewer’s added 30px under the logo and 50px under the columns.

The next margin row does not repeat Groei, the CTA, or the footer height. It says the live news heading has margin `0px 180px 40px`, and Framer `GgfRoOGmd` and `kIRhbrkJW` are `1fr` inside a frame with padding `0px 15px`, so the heading sits on the left. That margin is absent from the opening M9 cell and from the M9 proposal. It is first written in the next review.

`b25c383`, the padding commit, got `revert M14` from the fresh review. The pass note keeps it, and the parent message for that keep was not found. On the next score M14 is met.

## What the next score marked met

These pass 4 rows are met in [f33549a8](f33549a8-533f-4ffb-aeec-4dd873cdf3b8): alt text, M1, M4, M8, M11, M12, M18. The three Other rows from the opening scorecard (phone and email icons, the LinkedIn mark, corner radius) are not written again. Their commits are `12b7911`, `cfd94ca`, `2bb2139`, `42f2a7f`, `b25c383`, `e72d34a`, `1e5b627`, `e309d61`, `a70068e`, and `5653d41`.
