# Unattended improvement 2

Website: https://yellowhive.com/nl
Framer project: Enchanting Whoever (`B64kxxljgwceYGrBUPBt`)
Framer branch: silken-ember (`k5bhnj4io`), created from main. `cbe7itpwl` and `hopal35hm` were left untouched.
Git branch: `pipeline-improvement`
Width: 1200
Criteria: `.cursor/SKILLS/pipeline-review/criteria.md`
Page: Home, Desktop 1200 × 5255
Capture: `Database/digest/nesting/nl/1200/default/`
Build report: `Database/digest/nesting/nl/1200/default/build-report.md`

Scored rows: 7 Must, 6 Should, M1–M18, and one Other row. Met 23 of 32, 71.9%. At least 80% of 32 is 26.

## What the test showed

| Step | Skill | Started | Ended | Duration | Activities |
| --- | --- | --- | --- | --- | --- |
| 1. Collect the page | `.cursor/SKILLS/COLLECTOR.md` | 2026-11-10T20:25:15+0100 | 2026-11-10T20:26:41+0100 | 1m 26s | `npm run extract:generic -- https://yellowhive.com/nl --widths 1200 --height 900 --components all`. Tokens, digests, screenshot. 71 digests, 11 colours, 25 text styles. `npm test` 29 passed. |
| 2. Define sections | `.cursor/SKILLS/SECTIONS.md` | 2026-11-10T20:27:30+0100 | 2026-11-10T20:34:07+0100 | 6m 37s, parallel with step 3 | Wrote `sections-prompt.md`. |
| 3. Export styles | `.cursor/SKILLS/BUILDER.md` | 2026-11-10T20:27:30+0100 | 2026-11-10T20:34:07+0100 | 6m 37s, parallel with step 2 | Created `silken-ember`. 11 colour styles, 25 text styles. `letterSpacing: "normal"` stored as `-0.02em`. |
| 4. Place organisms | `.cursor/SKILLS/BUILDER.md` | 2026-11-10T20:35:02+0100 | end clock not recorded | aborted, no report | First phase 2 turn returned aborted. |
| 5. Place organisms | `.cursor/SKILLS/BUILDER.md` | 2026-11-10T21:21:39+0100 | 2026-11-10T21:30:16+0100 | 8m 37s | Same builder, same branch. Wrote `build-report.md` for silken-ember. Nine organisms and the cookie dialog. Custom code: none. |

Runner wall time: 2026-11-10T20:23:38+0100 to 2026-11-10T21:31:50+0100, 1h 8m 12s.

The collector writes into the same folder and does not delete files it does not rewrite. `build-report.md` from pass 1 stayed until step 5 replaced it. `reconstruction.json` and `signatures.json` are still dated 5 November.

## Which criteria failed, and why

Style mapping: every text style stores `-0.02em` while the live headings are `normal`, and news body `Ls5uQCMl5` has gap `0px` against live separations of 10px, 20px, 20px, and 36px.

Links: LinkedIn icon `NZL4MS236` has no link. Header `IoOwLODBJ` has no Nederlands, Deutsch, English, or español link. Alle merken stays empty and is flagged. Phone `gILFT4QRU` is `tel:+31850831001`.

M1: the nine organisms were first reported at 21:30:16, 1h 6m 38s after the runner started.

M7: preset `dm9T0dFSM` is `-0.02em`. `tokens.json` asked for `normal`.

M9: live Werken before the photo loads is 465px and news starts at y 2691. Framer `cgUELKPCX` is the loaded block, 510px, so the rest of the page sits 45px lower. The capture screenshot is the loaded page.

M10: `Ls5uQCMl5` gap is `0px`. The live spaces are child margins, and the leftover gray sits under Lees meer.

M16: empty dialog `P10xqh2Hh` covers the hero. The four hero slides are all opacity 1 in the same 775px box.

M17: the third news title is four lines. Live `n-000268` is five lines, 180px. The title style is `-0.02em`.

Other: the yellow hero curve (`n-000112` and the three hidden copies) was not placed. The live page shows a 48×48 cookie control. Framer has the empty dialog and no widget.

## Which problems the criterion agents validated

Style mapping. Evidence: all 25 presets on silken-ember are `-0.02em`, and `Ls5uQCMl5` has no spacer between `PIcaTzXpn`, `PpyN7bSFO`, `XjcA_drI4`, and `FF4zs09ca`. Proposal: send `0px`, and place the child margins as spacers.

Links. Evidence: `clip-04.json` keeps the LinkedIn URL on `provenance.folded` for `n-000366`, and `clip-01.json` omits the hidden language anchors. Proposal: emit those hrefs as links on the kept svg and the kept header ancestor.

M1. Evidence: phase 2 reports the organisms only after the whole turn, and the first turn aborted. Proposal: return the first organism, then resume.

M7. Evidence: `G_tvWA7nE` takes tracking from `dm9T0dFSM` at `-0.02em`. Proposal: skip the text style when the token says `normal` and leave `letterSpacing` unset on the layer.

M9. Evidence: before `n-000230` loads, Werken is 465px; after it loads, the digest and the screenshot are 510px. Proposal: force the row to the 305px text stack.

M10. Evidence: child margins on `n-000245` are 10px, 20px, 20px, and 36px, and `Ls5uQCMl5` gap is `0px`. Proposal: four spacer siblings, gap stays `0px`, padding stays 24px.

M16. Evidence: `consent.json` is the pre-dismiss box, and `clip-02.json` stores opacity 0 on three slides that Framer painted at opacity 1. Proposal: leave the dialog off the page, and set the stored opacity on the four frames.

M17. Evidence: a 302px Lexend probe at `normal` is 180px and at `-0.02em` is 144px. Proposal: send `0em`.

Other. Evidence: `clip-02.json` already has the curve markup, and `cli.ts` writes `consent.json` before dismiss. Proposal: record the widget after dismiss, draw the curve from the markup, and place no dialog.

## Themes, the suggested improvement, and the tradeoff

Letter-spacing on the text style. Send `0em` for `normal`. Tradeoff: the Over paragraph grows from 192px to 224px inside a frame with 32px of slack.

News-card margins as spacers. Place the stored child margins inside each news body. Tradeoff: writing them into the 24px padding enlarges the inset, and copying 36px onto the other cards makes their last space 56px.

Folded icon link and hidden language links. Emit the LinkedIn href on the kept svg, and the four language hrefs as variables on the kept ancestor. Tradeoff: drawing the hidden menu stacks it on the header, and a rich-text href replaces Lexend.

First organism, then the rest. Return after the first block, then resume. Tradeoff: an aborted resume leaves the page short of nine instances.

Werken row from the text stack. Set the row to 305px. Tradeoff: the loaded photo is 350px and the row clips it.

Hidden slides on the variant. Set the three inactive slides to opacity 0. Tradeoff: baking that 0 into the layer keeps the slide invisible when Previous or Next selects it.

Cookie widget after dismiss. Record the 48×48 control after the click, and place that frame only. Tradeoff: the empty dialog covers the hero, and a code override fails M2.

Hero watermark from the stored SVG. Draw each curve on its own slide, clipped, in the gold token. Tradeoff: without the clip the curve hangs past the hero. Applying 0.7 on both the parent and the svg compounds to 0.49.

## What the senior's reviewer changed

Drop the letter-spacing theme. `docs/pipeline-runs/pass-2/gaps/04-styles.md` already rejected `0`, `0px`, and `0em`. Skipping every text style drops the reusable styles the review marked Met.

Drop the first-organism theme. Pass 1 reverted that stop because the rest of the page stayed unplaced.

Drop the Werken 305px theme. The digest and the screenshot are the loaded 510px block.

Narrow the slide theme. Opacity 0 belongs on the variant that hides the slide, not on the layer the tap reveals.

The watermark already has opacity 0.7 on parent `n-000111`. Applying it again on the svg compounds to 0.49.

## What each theme commit did, and whether the fresh review kept or reverted it

`6a70e15` places the news-card child margins as spacers and leaves the 24px padding. Kept.

`37213f5` puts an icon link on the svg and keeps omitted language links off the layers. Kept.

`edfaeba` hides the inactive hero slides on the variant. Kept.

`bdca144` places the cookie widget and leaves the dialog frame off the page. Kept.

`8bde0b2` draws the hero watermark from the stored SVG on its own slide. Kept.

`a64c0a6` appends a folded icon href and a hidden anchor href onto the kept node. Kept.

`16685b2` records the cookie widget after dismiss, including the logo SVG. Kept.

`1c65cbb` writes the consent record that dismiss returns. Kept.

`npm test`: 29 passed, 0 failed.

Next: rerun once
