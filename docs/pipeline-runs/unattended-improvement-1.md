# Unattended improvement 1

Website: https://yellowhive.com/nl
Framer project: Enchanting Whoever (`B64kxxljgwceYGrBUPBt`)
Framer branch: airy-halo (`hopal35hm`), created from main. `cbe7itpwl` was left untouched.
Git branch: `pipeline-improvement`
Width: 1200
Page: Home (`augiA20Il`), Desktop (`WQLkyLRf1`), 1200 × 5255
Capture: `Database/digest/nesting/nl/1200/default/`
Build report: `Database/digest/nesting/nl/1200/default/build-report.md`

## What the test showed

| Step | Skill | Started | Ended | Duration | Activities |
| --- | --- | --- | --- | --- | --- |
| 1. Collect the page | `.cursor/SKILLS/COLLECTOR.md` | 2026-11-10T16:42:34+0100 | 2026-11-10T16:44:09+0100 | 1m 35s | `npm test` pass. Wrote the capture, `Database/digest/tokens/nl/1200/tokens.json`, and `Database/Screenshots/nl/1200/default/screenshot.png`. 70 digests, 11 colours, 25 text styles. |
| 2. Define sections | `.cursor/SKILLS/SECTIONS.md` | 2026-11-10T16:44:57+0100 | 2026-11-10T16:53:34+0100 | 8m 37s, parallel with step 3 | Wrote `sections-prompt.md`. |
| 3. Export styles | `.cursor/SKILLS/BUILDER.md` | 2026-11-10T16:44:57+0100 | 2026-11-10T16:53:34+0100 | 8m 37s, parallel with step 2 | Created `airy-halo`. 11 colour styles, 25 text styles. `letterSpacing: "normal"` was stored as `-0.02em`. |
| 4. Place organisms | `.cursor/SKILLS/BUILDER.md` | 2026-11-10T18:39:08+0100 | 2026-11-10T18:58:35+0100 | 19m 27s | An attempt from 16:54 was aborted with no return. This resume wrote the build report and placed eight organisms. Custom code: none. |

Runner wall time: 2026-11-10T16:41:29+0100 to 2026-11-10T19:00:11+0100, 2h 18m 42s.

## Which criteria failed, and why

Headings: live `h2` “Het laatste nieuws” is 40px. Framer `EDuT_P_M1` is tag `h1` because preset `MqenPAEmj` is an h1 style.

Style mapping and M7: all 25 text styles store `-0.02em`. The live headings compute `letter-spacing: normal`. Framer rejects the keyword `normal`.

Alt text and image fields: the three lazy hero photos live in `data-src`. All four Hero frames use `Hero-LG-Onze-merken_02.jpg`.

Atomic design: 16 button digests and the three news cards are layers inside the eight section components.

Links: “Alle merken” on the live page goes to `https://yellowhive.com/nl`, and frame `F5tnnawo5` has no link. LinkedIn SVG `DDhxy1XF8` has no link. Phone frame `tMBRRsd3U` stores `tel:+3185 083 1001`.

Documentation: `sections-prompt.md` and `build-report.md` do not state the classification rules or the workflow.

M1: the eight organisms were first reported at 18:58:35, after the aborted placement.

M8: the review measured the Over root padding at 30px against a heading that ends 60px from the edge. The copy frame already holds the other 30px, and the heading ink starts at x 630.

M16: live “Scroll to top” is at viewport x 1115, y 815. Framer `dzO8_uwPB` sits inside the footer, which starts at page y 4420.

Other: the live page shows a cookie dialog and a cookie button. Home has no cookie layer.

Met rows that this pass left in place: capture, native components, exposed properties, custom code none, nested layers, editable result, M2 through M6, M9 through M15, M17, and M18. M2 is 8 of 8 native components, 0 code files.

## Which problems the criterion agents validated

Heading level. Evidence: `EDuT_P_M1` tag `h1` on preset `MqenPAEmj`, digest node `n-000236` is `h2`, and `htmlTag` cannot store a heading. Proposal: set `tag` on the rich-text layer after the preset.

Letter-spacing. Evidence: `tokens.json` stores `normal`, preset `MqenPAEmj` stores `-0.02em`, and the phase 1 error expected a px or em length. Proposal: send `0px`.

Lazy hero photos. Evidence: `browser.js` reads `currentSrc || src`, and `n-000127`, `n-000146`, and `n-000164` have no media record. Proposal: also read `data-src` and the alt, and bind each hidden variant copy to its own image.

Button atoms. Evidence: `components.json` groups Lees meer on `sig-006` and the news cards on `sig-014`, and the Framer project has only the eight section components. Proposal: one native atom per button signature and one molecule for `sig-014`.

Links. Evidence: `structure.json` has an empty href on `n-000335`, the LinkedIn URL on `n-000366`, and the phone attribute with a non-breaking space. Proposal: use the capture URL for an empty href, `tel:` plus the label when the digits match, and keep a folded anchor href.

Documentation. Evidence: the two run prose files follow templates that stop at the scorecard. Proposal: copy a Classification section and a Workflow section into the build report.

M1. Evidence: phase 2 reads every organism and returns them together, and the aborted turn left Home empty. Proposal: return the first organism, then resume.

M8. Evidence: `n-000201` is x 630, width 510, and copy frame `cYMsjvgZj` already has the extra 30px. Proposal: keep that split and leave Groei and Werken on the 45px rule.

M16. Evidence: `n-000372` is fixed at viewport y 815 and stays inside footer `n-000291`. Proposal: emit that descendant as its own overlay.

Cookie. Evidence: `dismissConsent` runs before the walk, and `structure.json` has no cookiebot node. Proposal: write `consent.json` and place the two frames absolute on the breakpoint.

## Themes, the suggested improvement, and the tradeoff

Heading level on the rich-text layer. Set `tag` on the layer. Tradeoff: setting `tag` on the preset would turn the real h1 into an h2.

Letter-spacing keyword on text styles. Send `0px` for `normal`. Tradeoff: a wider line can wrap and overlap the next section.

Lazy-loaded image URL and alt. Read `data-src`, then bind each hidden copy. Tradeoff: four photos on the visible slide stack, and a 24px alt box shrinks the slide.

Button atoms and the news-card molecule. One native atom per signature and one news-card molecule. Tradeoff: a code component fails custom code and M2, and a shared thumbnail repeats the first photo.

Empty href, phone number, and folded anchor. Put those destinations on the frame or the kept SVG. Tradeoff: a link on the rich text replaces Lexend, and pulling inline links out reflows the sentence.

Classification and workflow in the build report. Copy two fixed sections after the scorecard. Tradeoff: treating the molecule sentence as a build step stacks a second card row.

First organism, then the rest of the page. Return the first block, then resume. Tradeoff: a header returned before `fontName` drops Lexend, and a missed resume leaves the page as one organism.

Section inset from the captured margin. Keep the Over heading’s extra 30px on the copy frame. Tradeoff: a 60px root beside 570px columns passes 1200.

Fixed descendant as its own overlay. Lift scroll-to-top out of the footer. Tradeoff: a code override or CSS `position: fixed` fails M2.

Cookie dialog recorded before dismiss. Write `consent.json` and place two absolute frames. Tradeoff: a dialog in the stack covers the hero, and dialog text inside `structure.json` fails the consent test.

## What the senior's reviewer changed

Drop the letter-spacing theme. `docs/pipeline-runs/pass-2/gaps/04-styles.md` already rejected sending `0`, `0px`, or `0em`, and Framer keeps `-0.02em`.

Narrow the section-inset theme. Groei and Werken stay on the 45px rule. The Over heading already ends 60px from the edge.

The button theme draws the controls twice unless the new instances replace the digest layers.

The link theme needs `scripts/digest/generate.ts`. The folded record stored no href, so the builder could not read it.

## What each theme commit did, and whether the fresh review kept or reverted it

`6a829e7` sets the rich-text `tag` from the digest node after the preset. Kept.

`e2ba764` binds each lazy hero file to its own image variable on the hidden copy. Kept.

`10f4096` added native button atoms and the news-card molecule. Reverted in `b25913c`. Nested layers: the other buttons would be drawn again beside the layer from step 11.

`e1a8a63` put the capture URL on an empty href. Reverted in `144702a`. Editable result: Alle merken had been left for the designer.

`dd4d8aa` copies Classification and Workflow into the build report. Kept.

`b51f521` returned after the first organism. Reverted in `068cdbc`. Phase 2 previously placed every organism, and this stop left the rest of the page unplaced.

`551da79` keeps the Over heading’s extra 30px on the copy frame. Kept.

`6170421` places the cookie dialog and widget from `consent.json`. Kept.

`ba85c2b` reads `data-src` and keeps the alt. Kept.

`a83836c` returns the cookie dialog and the button that stays. Kept.

`ed528a5` keeps a folded anchor href on the folded record. Kept.

`647fce3` resumed the builder for the remaining blocks. Reverted in `76da15e`. The resume did not hand those blocks back, and phase 2 still stopped after the first digest.

`ae96002` emits a fixed or sticky descendant as its own overlay. Kept.

`7149e72` names scroll-to-top as that overlay, bounds x 1115 to 1160, y 815 to 860. Kept.

`dfea406` writes `consent.json` beside `structure.json`. Kept.

`npm test`: 29 passed, 0 failed, both before the fresh review and after the reverts.

Next: rerun once
