# Test 4 rating

Project Enchanting Whoever, branch test 4 (`cbe7itpwl`), page Home (`augiA20Il`, path `/`). Desktop `WQLkyLRf1` is a vertical stack, 1200 × 900, overflow visible. No code file was added: `CodeFileNode` count is 0, code-file search returned 0 results, and none of the eight definitions is a code component.

What is on the desktop, top to bottom:

| Order | Node | Name | What it is | Measured box |
| --- | --- | --- | --- | --- |
| 1 | `luSh3K0Or` | Onze merken | Instance of `n2TLG1NZa` | y 0, height 775 |
| 2 | `JnbQy8Kjm` | Yellow Hive header | Instance of `NBRgyRb8t` | y 775, height 70 |
| 3 | `fwmQwCd_y` | Gap 150 | Frame | y 845, height 150 |
| 4 | `M8vAnQREa` | Over Yellow Hive | Instance of `CuLO0jO8Q` | y 995, height 540 |
| 5 | `XWX3WqQRa` | Groei door overnames | Instance of `QYs6OKovN` | y 1535, height 510 |
| 6 | `UQdcKDeKD` | Werken bij Yellow Hive | Instance of `byOynNRJJ` | y 2045, height 510 |
| 7 | `v3A8R3Vkr` | Het laatste nieuws | Instance of `xjmehdKCK` | y 2555, height 1032 |
| 8 | `x3m3KsrUY` | Wij helpen je graag verder | Instance of `PhorTOhnP` | y 3587, height 381 |
| 9 | `BIukRRfBG` | Yellow Hive footer | Instance of `SMiFm7EQH` | y 3968, height 553 |

The eight claimed ids are `ComponentNode` definitions. `clip-03` (`n-000185`) is the source `main` wrapper from y 925, and its sections are the instances above. Clock for M1 was supplied: 59m 12s, from 10:27:04 to 11:26:16. Target is under 15 minutes.

Screenshots used: the 10:27 capture `Database/Screenshots/nl/1200/default/screenshot.png` (1200 × 5255), and read-only screenshots of `WQLkyLRf1`, `dEYCPMqfy`, `A8SQxcmJG`, and `ODVX5Sm6p`.

| Requirement or metric | Verdict | Evidence |
| --- | --- | --- |
| Capture content, styles, measurements, screenshots, links, metadata, and assets | Room for improvement | `structure.json` has 376 nodes, boxes, hrefs, title Yellow Hive and language nl, `computed.json` has the styles, the screenshot is 1200 × 5255, and `assets.json` has 15 files with usable paths, while its warnings say svg content was not traversed, including `n-000019`. |
| Preserve H1–H6 semantics independently of visual styling | Correct | `HUY4KvuZK` is tag h1 at Lexend 40px, weight 700, line-height 52px, and `Lv00Nf8O2` is tag h2 at the same size, weight, and line-height, matching source `n-000201` (h1) and `n-000211` (h2). All 12 source headings have a matching tag on the page. |
| Build pages with native, reusable Framer components | Correct | All eight definitions are `ComponentNode` instances on `WQLkyLRf1`, and their layers are frames, rich text, and SVG nodes. |
| Map text, typography, colours, and spacing to the correct components and reusable styles | Room for improvement | 25 text styles exist, including `UXlfks0CG`, and 0 of the 70 rich-text nodes have `textStylePreset` set. Colour tokens are applied, as on `HUY4KvuZK` (`var(--token-d0IASSgCM)`). |
| Expose text, images, colours, variants, and interaction settings through normal Framer controls | Room for improvement | Each component has string and image variables, `CuLO0jO8Q` has three image variables, and every component has one variant. The only interaction found is the link on `wYKLcSNRW`. Previous `Aqaj2VQJc` has no tap action. |
| Use custom code or overrides only when necessary, and explain why | Correct | Code-file search returned 0 results, `CodeFileNode` count is 0, and no walked layer has a code override. |
| Preserve image metadata, including alt text, and flag missing essential metadata | Correct | All 11 source images have alt text, and the same 11 strings are stored on the frames, including `HHFNkqf2S` alt `550_home 01.jpg` for `n-000193`. No `img` in `structure.json` lacks an alt. |
| Map images to Framer image fields, not text URLs | Correct | The 11 image variables hold `data:framer/asset-reference` values, and the photo frames bind their fill to those variables, as `HHFNkqf2S` does to `GJtvH3S7L`. |
| Translate nested source HTML into clean Framer layers, stacks, and components | Room for improvement | The sections are named stacks, and source anchors and list items were not kept as layers. `build-report.md` records that `a`, `li`, and `span` could not be set as tags. |
| Identify repeated elements and classify them with Atomic Design | Correct | `components.json` signature `sig-014` groups the three news cards `n-000242`, `n-000252`, and `n-000262`, and `sig-006` groups the three Lees meer buttons. |
| Migrate internal, external, anchor, email, and phone links when the destination is reliable. Flag uncertain ones | Room for improvement | The only link on the page is `wYKLcSNRW` to `https://yellowhive.com/nl/contact`. Source phone `n-000302` (`tel:+3185 083 1001`) and email `n-000305` (`mailto:info@yellowhive.nl`) have no link, and the empty href on `n-000335` is not flagged on a layer. |
| Keep the result editable. Designers control uncertain decisions | Room for improvement | Text and image variables are editable, and the uncertain nav and footer destinations were left empty on nodes such as `jijNgRwNN` with no flag a designer can resolve. |
| Document component-classification rules and a repeatable migration workflow | Correct | `docs/classification.md` states atom, molecule, organism, and template, and points at `.cursor/SKILLS/COLLECTOR.md`, `SECTIONS.md`, `BUILDER.md`, and `ORCHESTRATION.md`. This run wrote `components.json` and `sections-prompt.md`. |
| M1 Total generation time | Room for improvement | Supplied clock is 59m 12s, from 10:27:04 to the last Assets save at 11:26:16, against the under-15-minute target. The eight components are present. |
| M2 Native component percentage | Correct | 8 of 8 definitions are native. Walked types are `ComponentNode`, `FrameNode`, `RichTextNode`, and `SVGNode`. |
| M3 Font family | Correct | All 70 rich-text nodes have `fontName` Lexend, including `HUY4KvuZK`, and `computed.json` records Lexend on all 376 nodes. |
| M4 Font size | Room for improvement | `HUY4KvuZK` is 40px, matching `n-000201`, and the heading sizes match the capture. The other paragraph sizes were not all paired node to node. |
| M5 Font weight | Room for improvement | `GhGux5Gts` is weight 500, matching `n-000302`, and the headings are 700. The remaining text nodes were not all paired. |
| M6 Line-height | Room for improvement | `yoPjabnBu` (NL) is line-height 21.008px against 18px on `n-000072`, and `VKvnj8lgP` (AVG) is 20px against 24px on `n-000354`. |
| M7 Letter-spacing | Room for improvement | Every source node in `computed.json` has letter-spacing `normal`. All 70 rich-text nodes leave `letterSpacing` unset, and every saved text style reads back `-0.02em`, including `UXlfks0CG`. |
| M8 Padding | Room for improvement | Copy frame `X3mUrqnTV` padding `50px 15px 50px 15px` matches `n-000199`, and card body `ew4unT372` padding 24px matches `n-000245`. The other paddings were not all measured. |
| M9 Margin | Room for improvement | Source h1 `n-000201` has margin-bottom 40px. Over copy stack `X3mUrqnTV` has gap 0px, and `HUY4KvuZK` has no margin. |
| M10 Gap | Room for improvement | `computed.json` row-gap and column-gap are `normal` on all 376 nodes. The only placed length is `LotMfJkS8` gap 30px, which matches card margin-right on `n-000242`, not a measured gap. |
| M11 Text colour | Room for improvement | `HUY4KvuZK` uses `var(--token-d0IASSgCM)`, which is rgb(27, 49, 88), matching `n-000201`. The other text colours were not all paired. |
| M12 Fill colour | Room for improvement | Hero shade `zeZqc2EQk` is `linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 100%)`, matching the `::before` gradient on `n-000098`. The Over screenshot of `A8SQxcmJG` shows rectangular photos, so the source mask is not the image treatment. |
| M13 Border colour | Room for improvement | Lees meer `L5LIDxfqe` is 2px solid gold with radius 6px, matching anchor `n-000250`. Meer over ons `JmGYIUZwT` has radius 0px and no border, against 2px gold and radius 6px on `n-000204`. |
| M14 Unintended overflow | Room for improvement | The hero screenshot of `dEYCPMqfy` shows Previous and Next breaking out of the 45px squares (`Aqaj2VQJc`, `HEh8qtFIL`). Desktop `WQLkyLRf1` is 900px tall and the footer starts at y 3968. The page screenshot still shows those lower sections, so the overflow is visible. |
| M15 Unintended clipping | Room for improvement | The source screenshot shows hexagonal photos. The screenshot of `A8SQxcmJG` shows three rectangular photos, and mask frame `Jm_zuvhNP` is a separate 700px image rather than a clip. |
| M16 Unintended overlap | Correct | Screenshots of `WQLkyLRf1`, `dEYCPMqfy`, `A8SQxcmJG`, and `ODVX5Sm6p` show the headline, cards, and footer columns separated. Hidden hero slides `XtsPf7b0X`, `x78MEG3VN`, and `GEaiKGQBn` are opacity 0. |
| M17 Text wrapping | Room for improvement | The hero screenshot shows Previous and Next stacked letter by letter inside the yellow squares. The Over body variable is 384 characters against 385 on `n-000202`. |
| M18 Stacking | Room for improvement | The source screenshot places the header over the hero. On `WQLkyLRf1` the header instance `JnbQy8Kjm` is the second stack child, at y 775, under the hero. |

Correct: 10. Room for improvement: 21.

Three changes a viewer would notice:

1. Put the header back across the top of the hero. It is now a white bar between the photo and Over Yellow Hive.
2. Clip the three Over Yellow Hive photos with the hex mask. They are rectangles, with the mask sitting beside them as a pale shape.
3. Replace the Previous and Next labels with the arrow controls. The words break apart inside the yellow squares.

## Geblokkeerd op mij

Niets

## Gewijzigd

`docs/pipeline-runs/test-4-rating.md`

## Gevonden

`clip-03` is the source `main` element, and its sections are already the instances on the desktop.
