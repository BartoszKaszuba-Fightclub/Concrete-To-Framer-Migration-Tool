# Unattended improvement 3

Website: https://yellowhive.com/nl
Framer project: Enchanting Whoever (`B64kxxljgwceYGrBUPBt`)
Framer branch: linen-beacon (`prsdixb2f`), created from main. `cbe7itpwl`, `hopal35hm`, and `k5bhnj4io` were left untouched.
Git branch: `pipeline-improvement`
Width: 1200
Criteria: `.cursor/SKILLS/pipeline-review/criteria.md`
Page: Home, Desktop 1200 × 5255
Capture: `Database/digest/nesting/nl/1200/default/`
Screenshot: `Database/Screenshots/nl/1200/default/screenshot.png`
Build report: `Database/digest/nesting/nl/1200/default/build-report.md`

The collector deleted the previous `nl` / 1200 capture before writing this one. No file in that capture, the token folder, or the screenshot folder is older than 22:43.

Scored rows: 7 Must, 6 Should, M1–M18, and three Other rows. Met 21 of 34, 61.8%. At least 80% of 34 is 28. Pass 2 was 23 of 32, 71.9%.

## What the test showed

| Step | Skill | Started | Ended | Duration | Activities |
| --- | --- | --- | --- | --- | --- |
| 1. Collect the page | `.cursor/SKILLS/COLLECTOR.md` | 2026-11-10T22:43:59+0100 | 2026-11-10T22:53:21+0100 | 9m 22s | Deleted the previous capture. `npm run extract:generic -- https://yellowhive.com/nl --widths 1200 --height 900 --components all`. 71 digests, 11 colours, 25 text styles. Header at y 0. Page height 5255. `npm test` 29 passed. |
| 2. Define sections | `.cursor/SKILLS/SECTIONS.md` | 2026-11-10T22:54:17+0100 | 2026-11-10T23:05:16+0100 | 10m 59s, parallel with step 3 | Wrote `sections-prompt.md`. |
| 3. Export styles | `.cursor/SKILLS/BUILDER.md` | 2026-11-10T22:54:17+0100 | 2026-11-10T23:05:16+0100 | 10m 59s, parallel with step 2 | Created `linen-beacon`. 11 colour styles, 25 text styles. `letterSpacing: "normal"` stored as `-0.02em`. |
| 4. Place organisms | `.cursor/SKILLS/BUILDER.md` | after 2026-11-10T23:05:16+0100 | 2026-11-10T23:26:44+0100 | about 21m | Same builder. Wrote `build-report.md`. Home 1200 × 5255. Nine organisms. Custom code: none. |

Runner wall time: 2026-11-10T22:42:42+0100 to 2026-11-10T23:27:19+0100, about 45m.

## Which criteria failed, and why

Capture: the review looked for the screenshot inside the nesting folder. The PNG is at `Database/Screenshots/nl/1200/default/screenshot.png`, and every digest records that path.

Headings: live h2 titles Groei, Werken, and Het laatste nieuws are tag h1 on preset `WLTXKiwqR`, the same preset as the real h1 `L8dFAy__J`.

Style mapping: all 25 text styles are `-0.02em`. The same h1 preset is on the navy h2 titles. Header item `ZRtbZ2Ena` is padded `0px 12px` against the live `20px 30px`.

Nested layers: hero `kbpAGl53s` is 181 layers because every variant holds all four slides at 0, 0.

Links: gold paragraph `Lc6wa1xwq` has no link. The four language URLs are variables on header `RuVZPBLrk` and are not on a frame. Alle merken stays empty and is flagged.

Editable: header frame `ZRtbZ2Ena` stores a literal href beside an unbound string variable. Previous `pGqvEVgpz` and Next `Slu68GAWn` both use `cycle`.

M1: the organisms are in the report at 23:26:44, about 44 minutes after the runner started.

M7: preset `WLTXKiwqR` is `-0.02em`.

M8: nav padding `0px 12px`, and Werken frame `LkgctVomF` is `80px 30px 0px 30px` against live `80px 0px`.

M9: Framer Werken is the loaded 510px block. The live block before the photo loads is 465px, and the page is 5255px against a live scroll height of 5210.

Other: no 48×48 cookie control. `consent.json` stored a 300×55 tab. The gold-band brand names have no link. Previous still advances on the first slide.

Met rows that stayed met include native components, properties, custom code, alt text, image fields, atomic design, documentation, M2–M6, M10–M18.

## Which problems the criterion agents validated

Capture. Evidence: `cli.ts` writes the PNG under `Screenshots`, and all 71 digests point at it. Proposal: name that path in the review skill.

Headings. Evidence: `n-000211`, `n-000224`, and `n-000236` are h2 in `structure.json` and h1 on `WLTXKiwqR`. Proposal: set the layer tag in the same edit as the preset. The skill already says that.

Links and the gold-band Other row. Evidence: `cmp-028.json` has the four hrefs, and `Lc6wa1xwq` has no link. Proposal: walk `content` in order and set a text-range link on each brand.

Editable and Previous. Evidence: `build-report.md` records the unbound string variable and the rejected reverse step. Proposal: a link variable where the API accepts one, and an explicit previous variant id.

M8. Evidence: `cmp-017.json` stores `20px 30px` on `n-000017`. `LkgctVomF` is `80px 30px 0px 30px`. Proposal: copy those paddings, and keep the Werken row at 350px.

Cookie. Evidence: `consent.json` is a 300×55 button at x 150, y 242.5, with a null dialog. Proposal: wait until `button.CookiebotWidget-logo` is visible.

Hero layers. Evidence: `kbpAGl53s` repeats four slide trees in every variant. Proposal: the primary holds only the visible slide, and the other variants override that frame, including its logo and curve.

## Themes, the suggested improvement, and the tradeoff

Capture screenshot path. Name the Screenshots file in the review. Tradeoff: a later review can score clipping from a capture taken before images finish.

Cookie widget after the logo is visible. Wait for `button.CookiebotWidget-logo`, then store its box and SVG. Tradeoff: a site that never shows the widget leaves the button null. Storing the 300×55 tab covers the hero.

Heading tag with the preset. Set the digest tag in the same edit as the preset. Tradeoff: those layers store no font of their own, so dropping the preset fails M3–M6.

Header and Werken padding. `20px 30px` on the nav item, `80px 0px` on the block, row stays 350px. Tradeoff: wider nav items can pass the header. Dropping the 30px without the inner inset moves the columns to x 15.

Hero primary holds the visible slide. One slide tree, overridden per variant, with that slide’s logo and curve. Tradeoff: four trees that lose opacity 0 paint on top of each other.

Gold sentence in source order. Interleave the brand names and set literal range hrefs. Tradeoff: a link text style replaces Lexend.

Hidden language frames. Four hidden header frames with literal hrefs. Tradeoff: visible language layers stack on the header.

Previous tap per variant. No tap on the first variant. Later variants target the previous id. Next keeps `cycle`. Tradeoff: a code override fails M2.

## What the senior's reviewer changed

Drop the heading-tag theme. `BUILDER.md` already tells the builder to set the layer tag after the preset, and this build still left the h2s as h1. Another copy of that sentence changes nothing.

Narrow the Werken padding. The block is `80px 0px`, and the row stays 350px with the loaded photo. The 305px text stack stays out.

The hero override has to keep each hidden slide’s logo and curve. The senior had only named the overlap risk.

Letter-spacing, the first-organism stop, and the 305px Werken row stay out. Pass 1 reverted the stop. `0`, `0px`, and `0em` stay forbidden. Skipping every text style drops the reusable styles.

## What each theme commit did, and whether the fresh review kept or reverted it

`83ec009` tells the collector to delete the previous capture for that slug and width. Kept.

`676bd8a` walks paragraph content in source order, so a child label is emitted where the anchor sits. Kept.

`1cef39e` waits for the cookie logo after dismiss, and retries a fading overlay. Kept. `npm test` 29 passed.

`31a7c6f` sets the header and Werken padding, keeps one hero slide in the primary, puts literal hrefs on the gold-band ranges and on four hidden language frames, and gives each variant its own Previous tap. Kept.

The review-skill sentence that names the screenshot path is in the working tree. That skill file is not on this commit.

Next: rerun once
