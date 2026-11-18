# Validated problems

Pass 4 review, sunlit-prism (`hqphn3tsl`). 19 of 34 met, 55.9%.

## Style mapping

## Why

Contact is built as the other header links. Those links are 16px navy with 20px 30px padding. Contact is a separate control: 18px, weight 700, line-height 30px, white, gold fill, padding 10px 25px, radius 6px. The digest already names that text style on the anchor. The builder skill names only one header anchor, `n-000017`, and tells the build to keep 20px 30px on that frame. That measurement, and the 16px navy preset, landed on Contact. Letter-spacing does not move this row. Framer rejects `normal` and keeps `-0.02em`.

## Evidence

`Database/digest/nesting/nl/1200/default/computed.json` node `n-000066`: fontSize 18px, fontWeight 700, lineHeight 30px, color `rgb(255, 255, 255)`, backgroundColor `rgb(249, 176, 15)`, padding 10px 25px, radius 6px. Sibling `n-000017` is 16px navy, padding 20px 30px. `digests/clip-01.json`: `n-000066` uses `text/link/lexend-18px-700-30px-normal-none`. `.cursor/SKILLS/BUILDER.md` step 2 names only `n-000017`. Framer text `yihUV7Ry4` uses preset `v3NdNBwDw`. Frame `zIVaoN4Kz` is padding 20px 30px.

## Proposal

In `.cursor/SKILLS/BUILDER.md` step 2, keep the `n-000017` sentence. Add one sentence: anchor `n-000066` keeps padding 10px 25px, radius 6px, fill `color/rgba-249-176-15-1`, and text style `text/link/lexend-18px-700-30px-normal-none`. Do not copy `n-000017` onto that frame.

## Risk

M8 and M4 if the 10px padding or the 18px preset is applied to the other header links.

## Alt text

## Why

The four hero alts are in the capture. Step 10 still says to put `altText` on the existing variant copy, and those copies were removed by the one-slide rule. The photo and its overrides get a fill and no `altText`.

## Evidence

`digests/clip-02.json`: `n-000109` is `Hero-LG-Onze-merken_02.jpg`, `n-000127` is `Hero-LG-werken-bij.jpg`, `n-000146` is `Hero-LG-Join-the-Hive.jpg`, `n-000164` is `HERO_DE_shared-service-center.jpg`. On sunlit-prism, slide photo `cKzjdJ45c` and overrides `CtJDwghvwcKzjdJ45c`, `jPtWsG_GCcKzjdJ45c`, `xMjaVOq15cKzjdJ45c` have no `altText`. Frame `y1gaWtqWh` (`n-000193`) already stores its alt on the frame.

## Proposal

In `.cursor/SKILLS/BUILDER.md` step 10, set `altText` on the single slide photo to the visible slide’s digest alt, and set `altText` on each variant override of that photo. Leave image variables as the asset string. Add no photo layer.

## Risk

M16 if the removed variant copies are put back.

## Links

## Why

The seven header menu anchors sit in closed panels. The digest drops those panels and hangs the URLs on the visible parent. The builder turns that pattern into hidden frames only for the four language URLs.

## Evidence

`structure.json` panel `n-000023` is `display: none`, with Buy & Build, Shared Service Center, Onze vestigingen, Vakgebieden, and ESG. Panel `n-000052` holds Persberichten and In het nieuws. `scripts/digest/generate.ts` `simplify` omits `display: none` subtrees, and `linkRecords` copies each omitted anchor onto the nearest kept ancestor. `digests/cmp-017.json` keeps those five links on `n-000016`. `cmp-018.json` puts the two media links on `n-000045`. `build-report.md` records the missing layers. Header `zJvMTws8n` has the four language frames and no menu-item frames.

## Proposal

Add one sentence to step 8 of `.cursor/SKILLS/BUILDER.md`. For every reliable link whose anchor was omitted, add one hidden frame with the literal digest URL, `visible` false, the same way the language URLs work. Leave the panels out of the visible tree. No code override.

## Risk

M16 if a hidden child keeps a slot in the header stack. M2 if a hover override opens the menus.

## M1

## Why

The first component is finished during placement, and the kit names it only when `build-report.md` is written at the end of the turn. Groei existed and had been screenshotted while the report was still missing.

## Evidence

`.cursor/SKILLS/BUILDER.md` writes the only report after placement. `build-report.md` was created at 2026-11-11T01:13:35+0100. The same turn had already inserted Groei `obksyCTnS` and screenshotted it at `KmbpsR8yp`.

## Proposal

In step 2, when the first organism component exists, write one line to `first-component.md` in the capture folder and stay in the turn. In the review skill, if that file exists, its modification time is the first completed component.

## Risk

M16 if the line is treated as the end of phase 2. The last return-after-first-organism change was reverted in `068cdbc`.

## M4

## Why

Contact is 18px in the capture and the digest names that style. The build put the shared 16px nav preset on the label.

## Evidence

`computed.json` `n-000066` and `n-000067` are Lexend 18px. `clip-01.json` names `text/link/lexend-18px-700-30px-normal-none`. Framer `yihUV7Ry4` uses `v3NdNBwDw` at 16px. Preset `Jv3vAaxk0` is the 18px style and is on no layer.

## Proposal

In `.cursor/SKILLS/BUILDER.md` step 4, the Contact run `n-000067` uses `text/link/lexend-18px-700-30px-normal-none`. Do not put `v3NdNBwDw` on that layer. Set only `textStylePreset`.

## Risk

M3 if `fontName` is sent in the same edit. M16 if the wider word meets the language control.

## M7

## Why

Live text is `letter-spacing: normal`. The builder sends that keyword. Framer rejects it and each text style keeps `-0.02em`. Layers with a preset cannot take their own font fields.

## Evidence

`computed.json` and `tokens.json` store `normal` on all 25 styles. `.cursor/SKILLS/BUILDER.md` says to keep the keyword. On sunlit-prism every text style is `-0.02em`, including `c8EGE2pD3` and `XtGqN93el`. `qkNunUI92` has the preset and no own `letterSpacing`.

## Proposal

When the matched style’s `letterSpacing` is `normal`, leave `textStylePreset` unset and set `fontName`, `fontSize`, `fontWeight`, `lineHeight`, `textColor`, and `tag` on the layer. Leave `letterSpacing` unset. Same change in step 7.

## Risk

M3, M5, and M6 are met from the preset. Dropping the preset without those fields landing makes them unmet.

## M8

## Why

Footer `n-000291` is 75px 0px. The built frame is `80px 45px 40px 45px`, mixing Groei’s band padding, the 45px inset, and a heading margin. Contact `n-000066` is 10px 25px and received `n-000017`’s 20px 30px.

## Evidence

`clip-04.json` and `computed.json`: `n-000291` padding 75px 0px. Logo `n-000297` is 75px below the footer top, x 45 from wrapper `n-000293`. `cmp-021.json`: `n-000066` is 10px 25px. `cmp-017.json`: `n-000017` is 20px 30px. Framer footer frame padding `80px 45px 40px 45px`. Frame `zIVaoN4Kz` is `20px 30px`.

## Proposal

Two sentences in step 2. Contact `n-000066` keeps `10px 25px`. Footer `n-000291` keeps `75px 0px 75px 0px`. The 45px stays on `n-000293`. The 80px stays on the other bands. The 40px stays off the footer.

## Risk

M14 if the 45px is removed from the footer and the 30px margin is dropped or stacked so the row passes 1200. M10 if the footer gap of 40px is cleared.

## M9

## Why

Groei is 36px short and the CTA is 16px short because body text wrapped one line early. The footer is 60px short because it uses a 40px gap instead of the measured margins, and Desktop stays 5255 while the stack ends at 5135.

## Evidence

`screenshot.png` shows Groei at 7 lines and the CTA at 4. Framer `XmbD0aMGt` is 525px with 6 lines. `sg9kHJ3qD` is 449px with 3 lines. Presets `XBwvQw2ar` and `qYj2B3CvX` are 16px / 32px with `-0.02em`. `build-report.md` records the short bands. Footer `ZydV3WQKa` ends at 5135. `clip-04.json` `n-000291` is height 759.

## Proposal

In step 2, omit `letterSpacing` when the digest value is `normal`. Footer stack gap `0px`, with spacers of 25px under `n-000292`, 25px under `n-000344`, 15px above `n-000371`, 30px under each column heading, and 20px under each link. Phone and email stay under the logo. LinkedIn stays on the legal row. Werken photo stays 350px.

## Risk

M10, because the footer currently stores this space as gap. M15 if Groei stays clipped at 525px.

## M11

## Why

Contact is white. The layer uses the navy 16px header-link preset.

## Evidence

`computed.json` `n-000066` color `rgb(255, 255, 255)`. `clip-01.json` proposal `text/link/lexend-18px-700-30px-normal-none` with colour `rgb(255, 255, 255)`. `tokens.json` maps that style to `color/rgba-255-255-255-1`. Framer `yihUV7Ry4` is navy `lWmRteWqw` via `v3NdNBwDw`.

## Proposal

One sentence in step 4: Contact `n-000066` uses the 18px white style. The navy 16px style stays on the other header anchors.

## Risk

M3 if a colour edit clears the preset and Lexend leaves the layer.

## M12

## Why

The builder never paints a frame from that node’s own background. Contact’s gold fill was left empty. The grey card shell was never built, and the white fill sits on the button frame.

## Evidence

`computed.json`: `n-000066` background `rgb(249, 176, 15)`. `n-000243`, `n-000253`, `n-000263` are `rgb(242, 242, 242)`. `scripts/digest/generate.ts` `sameRgb` ignores alpha. Framer `zIVaoN4Kz` fill is null. `slVlc8Byi` fill is white `ndiOJiUAG`. No frame is named `n-000243`. Footer already uses grey `ZBKNW3t8b`.

## Proposal

In step 11, a node whose fill is non-transparent is its own frame, filled with the colour style that matches including alpha. `n-000066` is `color/rgba-249-176-15-1`. The three card shells are `color/rgba-242-242-242-1`. The card image and body sit in that card frame. `n-000250` stays a transparent button with its gold border.

## Risk

M16 if RGB matching drops the header’s 0.9 alpha and paints it opaque white over the hero.

## M17

## Why

The third news title sits on the tracking boundary. At `normal` and at `0em` it is five lines, 180px. At the stored `-0.02em` it is four lines, 144px.

## Evidence

`structure.json` `n-000268` is 302×180. `n-000248` and `n-000258` are 302×144. `screenshot.png` shows five ink bands. Preset `XtGqN93el` is `-0.02em`. Title layer `tJF4CVsM0` is inside `QFPiJgtYF`. A Chromium measure at the same width is 180px for `normal` and `0em`, and 144px for `-0.02em`.

## Proposal

When the measured letter-spacing is `normal`, send `0em` on the text style. Leave the preset on the layer. The same send is needed on the body styles, or Over, Groei, and the CTA stay one line short.

## Risk

M14 still holds if the page grows about 96px. M3 worsens if the preset is removed to set tracking on the layer. A previous pass already refused sending `0`, `0px`, and `0em`.

## M18

## Why

Phone and email belong under the logo in column `n-000295`. Framer put them on the right of a full-width space-between row. LinkedIn belongs in row `n-000349` at x 1127. Framer placed it as a later left-aligned sibling of the footer stack.

## Evidence

`clip-04.json`: `n-000295` is block, logo then contact, phone at x 74.48. `n-000349` is flex, first child width 1082, LinkedIn `n-000367` at x 1127. On sunlit-prism `xfeDFSsR5` is horizontal space-between. `d8uHsTOFP` follows the legal row as a child of `qsOaaYf0V`.

## Proposal

One sentence in step 11. `n-000295` stays vertical: logo then contact. `n-000349` stays one horizontal stack, `n-000350` width 1082px, so `n-000367` stays at x 1127. Do not lift the icon out of that row.

## Risk

M16 if the new column is added beside the current bar and the phone is drawn twice.

## Phone and email icons

## Why

The SVGs are in the digest. The builder is told to leave the phone path as a miss and not to draw the Font Awesome glyphs. The live secondary path is gold at opacity 1, not 0.4.

## Evidence

`screenshot.png` around y 4654 shows the handset and the envelope. `build-report.md` lists `n-000301` and `n-000304` as not drawn. `clip-04.json` stores both as svg, 20×16, `boundary.markup`, `currentColor`, three unvisited children. `browser.js` treats `svg` as a boundary. `.cursor/SKILLS/BUILDER.md` step 3 says the 0.4 path stays a miss.

## Proposal

In step 3, draw `n-000301` and `n-000304` once from `boundary.markup` at 20×16. Paint `fa-primary` `rgb(27, 49, 88)` and `fa-secondary` `#f9b00f` at opacity 1. Do not add the children as further layers. Do not draw the `::before` glyphs.

## Risk

M3 if the glyphs are also drawn as text. M16 if markup and children both paint the same box.

## LinkedIn mark

## Why

The link was placed on a frame styled from the parent `li`: 24×24 navy. The glyph is svg `n-000367`, 28×32, gold.

## Evidence

`clip-04.json`: `n-000367` is 28×32 at x 1127, colour `rgb(249, 176, 15)`, markup the LinkedIn path, href the company URL. Parent `n-000365` is 24px line-height and navy. `build-report.md` says the node is a frame, not the SVG. Framer `d8uHsTOFP` is 24×24, fill `lWmRteWqw`, radius 4px. Chevron `d9I1uWC9H` is already an `SVGNode` with `svg` and `link`.

## Proposal

Draw `n-000367` as one `SVGNode` from `boundary.markup`, path fill `rgb(249, 176, 15)`, 28×32, `link.href` on that node. Skip the wrapping frame. Width and fill do not come from `n-000365`.

## Risk

M3 if the path is split into extra shape nodes. M16 if the navy frame stays beside the new svg.

## Corner radius

## Why

Contact is 6px and the news-card shells are 10px. Border widths are 0px. The builder writes a radius only when it also writes a border.

## Evidence

`computed.json`: `n-000066` radius 6px, border widths 0. `n-000243`, `n-000253`, `n-000263` radius 10px, widths 0. Framer `zIVaoN4Kz`, `slVlc8Byi`, `KVf0Y3hZU`, and `J0urrt9bX` have no radius. `nQo88P5Kx` already has radius 6px with a 2px gold border. `.cursor/SKILLS/BUILDER.md` step 1 skips a width of 0px and only names the stroked corners.

## Proposal

In step 4, when every border width is 0px and a corner is not 0px, set the frame `radius` and do not set `border`. `n-000066` is 6px. The three card shells are 10px. Leave `nQo88P5Kx` at 6px with its border.

## Risk

M16 if a second news card is added. M2 if a code override sets the radius. Copying the border colour beside the 0px width would add a stroke.
