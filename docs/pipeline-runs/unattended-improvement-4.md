# Unattended improvement pass 4

Website: https://yellowhive.com/nl
Framer project: Enchanting Whoever (`B64kxxljgwceYGrBUPBt`)
Framer branch: sunlit-prism (`hqphn3tsl`)
Git branch: pipeline-improvement
Criteria: `.cursor/SKILLS/pipeline-review/criteria.md`
Width: 1200

The page was built. The review scored 19 of 34, 55.9%. That is under 80%.

## What the test showed

| Step | Started | Ended | Duration |
| --- | --- | --- | --- |
| Collect | 2026-11-11T00:28:39+0100 | 2026-11-11T00:30:46+0100 | 2m 7s |
| Sections | 2026-11-11T00:31:38+0100 | 2026-11-11T00:43:14+0100 | 11m 36s, parallel with styles |
| Export styles | 2026-11-11T00:31:38+0100 | 2026-11-11T00:43:14+0100 | 11m 36s, parallel with sections |
| Place organisms | after 2026-11-11T00:43:14+0100 | report file 2026-11-11T01:13:35+0100 | under 30m |

Runner wall: 2026-11-11T00:27:34+0100 to 2026-11-11T01:15:32+0100. The place-organisms start is the moment the runner asked for that step, after 00:43:14. The report file is the end.

Capture slug `nl`, 71 digests, 11 colours, 25 text styles. Screenshot: `Database/Screenshots/nl/1200/default/screenshot.png`. `npm test` after the capture: 29 passed.

Home on sunlit-prism is Desktop 1200×5255. Nine organisms. The consent widget is 48×48 at x 10, y 842. No dialog frame. Scorecard: type gap, colour pass, spacing gap, images pass. Not published.

`consent.json` still has a full-page underlay on `dialog` and the 48×48 logo button. The builder placed the button and left the underlay off the page.

## Which criteria failed

Met 19. Scored 34. 19 / 34 = 55.9%.

Not met: style mapping, alt text, links, M1, M4, M7, M8, M9, M11, M12, M17, M18, and three Other rows (phone and email icons, the LinkedIn mark, corner radius).

Contact `n-000066` is 18px white on gold, padding 10px 25px, radius 6px. Framer `yihUV7Ry4` uses the 16px navy preset `v3NdNBwDw`, and frame `zIVaoN4Kz` is padding 20px 30px with no fill and no radius. The seven closed header menus are reliable links and are not layers. Hero photo `cKzjdJ45c` has no alt. Every text style stores letter-spacing `-0.02em`. Footer `qsOaaYf0V` is padding `80px 45px 40px 45px` against live `75px 0px`. Groei `XmbD0aMGt` is 525px against 561. The phone and email sit to the right of the logo. LinkedIn `d8uHsTOFP` is a 24×24 navy square on the left. The phone and email SVGs are not drawn. News cards are white and square.

Met this pass that pass 3 had missed: capture, headings, nested layers, editable. M10, M13, M14, M15, and M16 stayed met.

## Validated problems

Contact was built as the other header links. The digest already names the 18px white style, the gold fill, the 10px 25px padding, and the 6px radius on `n-000066`. The builder skill names only `n-000017`.

The four hero alts are in `clip-02.json`. Step 10 still puts `altText` on variant copies the one-slide rule removed.

The seven menu URLs are on the kept parents in `cmp-017.json` and `cmp-018.json`. Hidden frames exist only for the four language URLs.

Groei existed before `build-report.md` was written at 01:13:35. The kit names the first component only at the end of the turn.

Footer `n-000291` is padding 75px 0px. The 45px inset is wrapper `n-000293`: margin 30px and padding 15px, and the measured box is x 30, width 1140. Phone and email belong under the logo in `n-000295`. LinkedIn belongs in row `n-000349` at x 1127. The icons are in `boundary.markup`.

`sameRgb` compared red, green, and blue and dropped alpha, so opaque gold matched the half-alpha gold.

Letter-spacing `normal` is rejected by Framer and stored as `-0.02em`. Sending `0`, `0px`, or `0em` stays out. Dropping every text style so the layer can leave letter-spacing unset would drop the presets that meet M3, M5, and M6.

## Themes

Contact text measurements. File: `.cursor/SKILLS/BUILDER.md`. Keep the 18px white style on `n-000066` only. Tradeoff: sending `fontName` with the preset drops Lexend.

Padding from the node. Same file. Contact stays 10px 25px. The footer stays 75px 0px. `n-000293` keeps padding 0px 15px and margin 0px 30px. Tradeoff: 45px padding on top of the 30px margin lets the row pass 1200.

Fill including alpha. Files: `.cursor/SKILLS/BUILDER.md` and `scripts/digest/generate.ts`. A non-transparent fill is its own frame, and the colour match includes alpha. Tradeoff: dropping the header’s 0.9 alpha paints it opaque white over the hero.

Radius without a border. Same builder file. A corner with a 0px border width sets `radius` and no border. Tradeoff: a second news card fails M16.

Hero alt on the one slide. Same file. `altText` goes on the one photo and its variant overrides. Tradeoff: restoring the removed copies fails M16.

Hidden frames for the seven menu links. Same file. Buy & Build, Shared Service Center, Onze vestigingen, Vakgebieden, ESG, Persberichten, and In het nieuws. Tradeoff: a hidden child that keeps a slot fails M16.

First component, then the rest of the page. Files: `.cursor/SKILLS/BUILDER.md` and `.cursor/SKILLS/pipeline-review/SKILL.md`. Write `first-component.md` and keep building. Tradeoff: treating that line as the end of the turn leaves the page unfinished.

Footer margins as spacers. Same builder file. Gap 0px, with 30px under the logo, 50px under the three columns, and 10px on the legal row. Tradeoff: gap 0px without those spacers fails M10.

Footer columns. Same file. Phone and email stay under the logo. LinkedIn stays in the legal row at x 1127. Tradeoff: a second column draws the phone twice.

SVG icons from markup. Same file. Phone and email are the duotone SVGs. LinkedIn is one gold SVG with the href on that node. Tradeoff: drawing the glyphs as text fails M3.

Letter-spacing left unset was dropped. All 25 styles are `normal`, so leaving the preset unset would remove it from every text layer. M3, M5, and M6 are met from those presets.

## What the reviewer changed

The theme review dropped letter-spacing left unset. It narrowed the padding sentence so 45px is not written on `n-000293`. It narrowed the hidden frames to the seven submenu labels, leaving `href="#"` and the duplicate parent URLs out. It added the 30px under the logo and the 50px under the columns, and kept the legal row at 10px.

The fresh review of `b25c383` said revert, naming M14, because it read the 15px padding and the 30px margin as a row past 1200. The measured container is x 30, width 1140, so it ends at 1170. The four 285px columns start at x 30 and end at 1170. The sentence forbids the extra 45px. The commit stays.

## What each commit did

`42f2a7f` keeps Contact on the 18px white style. Fresh review: keep.

`b25c383` keeps Contact at 10px 25px and the footer at 75px 0px. Fresh review said revert for M14. Kept, for the boxes above.

`1e5b627` paints a non-transparent fill on its own frame. Fresh review: keep.

`e72d34a` sets a radius when the border width is 0px. Fresh review: keep.

`12b7911` sets the hero alts on the one slide photo. Fresh review: keep.

`a493097` adds hidden frames for the seven menu links. Fresh review: keep.

`cfd94ca` writes `first-component.md` and keeps building. Fresh review: keep.

`1f9163d` places the footer margins as spacers. Fresh review: keep.

`a70068e` keeps the phone and email under the logo. Fresh review: keep.

`5653d41` draws the phone, email, and LinkedIn marks from markup. Fresh review: keep.

`e309d61` compares alpha when two fills match. Fresh review: keep. `npm test`: 29 passed.

`2bb2139` scores M1 from `first-component.md` when that file is in the capture folder. Fresh review: keep.

Git filled the committer as Bartosz Kaszuba `<bartosz@MacBookPro.home>` because the global email is unset. Git config was not changed.

Next: rerun once
