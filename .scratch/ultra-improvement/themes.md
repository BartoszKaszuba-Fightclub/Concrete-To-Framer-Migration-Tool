## Contact text measurements

Files
.cursor/SKILLS/BUILDER.md

Change
In step 2, keep the `n-000017` sentence. Anchor `n-000066` keeps text style `text/link/lexend-18px-700-30px-normal-none`. Do not copy `n-000017` onto that frame. In step 4, run `n-000067` uses that style: Lexend 18px, weight 700, line-height 30px, white `color/rgba-255-255-255-1`. Preset `v3NdNBwDw` stays on the other header anchors. When letter-spacing leaves the preset unset, those same measurements are `fontName`, `fontSize`, `fontWeight`, `lineHeight`, and `textColor` on the layer.

Data
`clip-01.json` already names `text/link/lexend-18px-700-30px-normal-none` on `n-000066`. The digest typography on `n-000066` and `n-000067` is Lexend 18px, weight 700, line-height 30px, `rgb(255, 255, 255)`. `tokens.json` maps that style to `color/rgba-255-255-255-1`. Sibling `n-000017` is the 16px navy preset. Nothing new is read from the page.

Tradeoff
Sending `fontName` in the same edit as the preset drops Lexend and fails M3. A colour edit that clears the preset does the same. Putting the 18px style on the other header anchors fails M4 and M8, and the wider Contact word can meet the language control and fail M16. This style’s stored tracking is still `-0.02em` while the preset stays on the layer, so the wrap themes stay open.

## Letter-spacing left unset

Files
.cursor/SKILLS/BUILDER.md

Change
In step 4 and step 7, when the matched style’s `letterSpacing` is `normal`, leave `textStylePreset` unset. Set `fontName`, `fontSize`, `fontWeight`, `lineHeight`, `textColor`, and `tag` on the layer from that run. Leave `letterSpacing` unset. Do not send `0`, `0px`, or `0em`. Phase 1 keeps that ban. Contact `n-000067` gets its 18px white measurements from the run. The same unset applies to the body styles, so Over, Groei, and the CTA can take the extra line, and the third news title can take the fifth line.

Data
`tokens.json` and the digest store `normal` on all 25 text styles. `measureLength` records that keyword as unsupported, not as a length. Framer text styles on sunlit-prism are `-0.02em`, including `c8EGE2pD3` and `XtGqN93el`, because the keyword was rejected. Presets `XBwvQw2ar` and `qYj2B3CvX` are 16px / 32px with `-0.02em`. Title `n-000268` is 302×180 in the capture; the built title inside `QFPiJgtYF` follows the `-0.02em` preset and is 144px. A Chromium measure at that width is 180px for `normal` and 144px for `-0.02em`. Nothing new is read from the page.

Tradeoff
M3, M5, and M6 are met from the preset. They go unmet if the preset is dropped and those fields do not land. Keeping the preset leaves `-0.02em` on the layer, so Groei stays 6 lines at 525px, the CTA stays 3 lines, the third news title stays 144px, and M15 stays open. Sending `0`, `0px`, or `0em` stays out. Once the extra lines land, the page grows about 96px and can fail M14.

## Padding from the node

Files
.cursor/SKILLS/BUILDER.md

Change
In step 2, `n-000066` keeps padding `10px 25px`. Footer `n-000291` keeps `75px 0px 75px 0px`. The 45px stays on `n-000293`. The 80px stays on the other bands. The 40px stays off the footer. `n-000017` keeps `20px 30px` on its own frame.

Data
The digest already has these paddings: `n-000066` is `10px 25px` in `cmp-021.json`, `n-000017` is `20px 30px` in `cmp-017.json`, and `n-000291` is `75px 0px` in `clip-04.json`. Logo `n-000297` sits 75px below the footer top and 45px from wrapper `n-000293`. Nothing new is read from the page.

Tradeoff
Removing the 45px from the footer and dropping or stacking the 30px margin lets the row pass 1200 and fails M14. Clearing the footer’s 40px gap without the spacer theme fails M10. Copying the 10px padding onto the other header links fails M8 and M4.

## Fill including alpha

Files
.cursor/SKILLS/BUILDER.md
scripts/digest/generate.ts

Change
In step 11, a node whose fill is non-transparent is its own frame, filled with the colour style that matches including alpha. `n-000066` is `color/rgba-249-176-15-1`. The card shells `n-000243`, `n-000253`, and `n-000263` are `color/rgba-242-242-242-1`. The card image and the card body sit in that shell. `n-000250` stays a transparent button with its gold border. In `sameRgb` and `rgbParts`, compare alpha. A missing alpha counts as 1.

Data
`backgroundColor` is already a full colour string on the digest fill. `measureColour` keeps the authored alpha. `sameRgb` compares only r, g, and b, and `rgbParts` parses the fourth number without returning it. The gold and the three greys are already in the capture. Nothing new is read from the page.

Tradeoff
Matching rgb and dropping a 0.9 alpha paints the header opaque white over the hero and fails M16. Painting `n-000250` with the card grey covers the gold border.

## Radius without a border

Files
.cursor/SKILLS/BUILDER.md

Change
In step 4, when every border width is `0px` and a corner is not `0px`, set the frame `radius` and do not set `border`. `n-000066` is 6px. `n-000243`, `n-000253`, and `n-000263` are 10px. `nQo88P5Kx` stays 6px with its 2px gold border. Step 1 already lists a corner whose radius is not `0px`; this step writes that radius without a stroke.

Data
The four corner radii and the four border widths are already on `styles.border`. A width of `0` is status `zero`. Contact and the three card shells have radius set and border width `0`. Nothing new is read from the page.

Tradeoff
A second news card added to carry the radius fails M16. A code override that sets the radius fails M2. Writing the border colour next to a `0px` width adds a stroke.

## Hero alt on the one slide

Files
.cursor/SKILLS/BUILDER.md

Change
In step 10, set `altText` on the single slide photo to the visible slide’s digest alt, `n-000109`. Set `altText` on each variant override of that photo from `n-000127`, `n-000146`, and `n-000164`. Leave image variables as the asset string. Add no photo layer. `n-000193` already stores its alt on the frame and stays as it is.

Data
`clip-02.json` already has the four alts: `Hero-LG-Onze-merken_02.jpg`, `Hero-LG-werken-bij.jpg`, `Hero-LG-Join-the-Hive.jpg`, and `HERO_DE_shared-service-center.jpg`. The one-slide rule removed the variant copies that step 10 still names. Nothing new is read from the page.

Tradeoff
Putting the removed variant copies back fails M16.

## Hidden frames for omitted menu links

Files
.cursor/SKILLS/BUILDER.md

Change
In step 8, for every link whose destination status is `value` and whose anchor was omitted, add one hidden frame with the literal digest URL and `visible` false, the same way the four language URLs already work. That adds the five links on `n-000016` and the two on `n-000045`. Leave the `display: none` panels out of the visible tree. No code override. The four language frames stay as they are.

Data
`simplify` already omits `display: none` subtrees, and `linkRecords` already copies each omitted anchor with a real href onto the nearest kept ancestor. `cmp-017.json` has Buy & Build, Shared Service Center, Onze vestigingen, Vakgebieden, and ESG on `n-000016`. `cmp-018.json` has Persberichten and In het nieuws on `n-000045`. Nothing new is read from the page.

Tradeoff
A hidden child that keeps a slot in the header stack fails M16. A hover override that opens the menus fails M2.

## First component, then the rest of the page

Files
.cursor/SKILLS/BUILDER.md
.cursor/SKILLS/pipeline-review/SKILL.md

Change
In step 2, when the first organism component exists, write one line to `first-component.md` in the capture folder and stay in the turn. Build the remaining organisms and write `build-report.md` at the end. Do not return after the first organism. In the review skill, when `first-component.md` exists, its modification time is the first completed component. When that file is absent, M1 still uses the timing table.

Data
The review already looks for a timing table under `docs/pipeline-runs/`, then marks M1 Not measured. The builder already writes `build-report.md` after placement. No new page data is read. The file is a timestamp written in the capture folder during the turn.

Tradeoff
Treating the line as the end of phase 2 fails M16, because the rest of the page never lands. Returning after the first organism stays out. That return was reverted in `068cdbc`.

## Footer margins as spacers

Files
.cursor/SKILLS/BUILDER.md

Change
In step 2, the footer stack gap is `0px`. Place spacers of 25px under `n-000292`, 25px under `n-000344`, 15px above `n-000371`, 30px under each column heading, and 20px under each link. The 40px is not the footer gap. The Werken photo stays 350px. Phone, email, and LinkedIn stay where the column theme puts them.

Data
`clip-04.json` already has footer `n-000291` at height 759, and the margins between those children. The built footer ends at 5135 while the page stays 5255. `rowGap` `normal` is already gap `0px` in step 2. Nothing new is read from the page.

Tradeoff
The footer currently stores this space as a 40px gap, so replacing it fails M10 until the spacers are the space. Groei staying clipped at 525px is the letter-spacing theme, and these spacers do not fix that line count.

## Footer columns

Files
.cursor/SKILLS/BUILDER.md

Change
In step 11, `n-000295` stays a vertical stack: logo, then contact, so phone and email stay under the logo. `n-000349` stays one horizontal stack. `n-000350` keeps width 1082px, so `n-000367` stays at x 1127. Do not lift the icon out of that row.

Data
`clip-04.json` already has `n-000295` as block, logo then contact, phone at x 74.48, and `n-000349` as flex with first child width 1082 and LinkedIn `n-000367` at x 1127. Nothing new is read from the page.

Tradeoff
Adding the new column beside the current bar draws the phone twice and fails M16.

## SVG icons from markup

Files
.cursor/SKILLS/BUILDER.md

Change
In step 3, draw `n-000301` and `n-000304` once from `boundary.markup` at 20×16. Paint `fa-primary` `rgb(27, 49, 88)` and `fa-secondary` `#f9b00f` at opacity 1. Do not add the children as further layers. Do not draw the `::before` glyphs. Draw `n-000367` as one `SVGNode` from `boundary.markup`, path fill `rgb(249, 176, 15)`, 28×32, with `link.href` on that node. Skip the wrapping frame. Width and fill do not come from `n-000365`. Step 8 already keeps that href on the svg.

Data
`browser.js` already stores `outerHTML` on an svg boundary, and the digest already has that markup, the 20×16 boxes, and the LinkedIn box 28×32 at x 1127 with colour `rgb(249, 176, 15)`. The svg stays the boundary, so the duotone children stay unvisited and their computed fill is not in the digest. The two class paints are the values this change uses. Nothing new is read from the page.

Tradeoff
Drawing the `::before` glyphs as text fails M3. Painting the markup and the children both fails M16. Splitting the LinkedIn path into extra shape nodes fails M3. Leaving the 24×24 navy frame beside the new svg fails M16. Another duotone icon stays a miss, because only these three nodes get the class paints.
