# Pass 3 summary

Date: 10 November 2026. Branch: `lean-pipeline`. Width: 1200.

Capture, tokens, and digests were run again into `Database/pipeline-runs/pass-3`. The Framer page was not rebuilt. The same project was read after the border and alt writes in `docs/pipeline-runs/pass-3-changes.md`.

Command: `npm run extract:generic` for the local fixture at 1200, then the token CLI and `digest --all`. Result: 30 elements, 3 sections, 2 components. Tokens: 4 colours, 7 text styles, 9 spacing, 1 border, 1 radius, 0 shadows.

Screenshot of desktop `WQLkyLRf1`: https://framerusercontent.com/screenshots/on-demand/9f6ed063-15ca-4a43-abba-6038153b44b8.jpg

Assumption: Framer cannot store the CSS keyword `normal`. Display 32 stays `-0.02em`, and that sentence is in the build report. `0` was not sent.

## Matrix

| Requirement | Result | Evidence |
| --- | --- | --- |
| Capture content, styles, measurements, screenshots, links, metadata, and assets | Met | Pass 3 `structure.json` title `Requirement fixture`, language `en`, viewport 1200. Screenshot folder and `tokens.json` exist. |
| Preserve H1–H6 independently of visual styling | Met | Digest nodes include tags `h1` through `h6`. Layers `IeJ6aTRx8` and `JEDoXNxb9` are `h1` and `h2` and both use `nKCiQkoBE`. |
| Build pages with native, reusable Framer components | Met | The same Home page shows Header, Main, two Cards, and Footer. No code component was added. |
| Map text, typography, colours, and spacing onto reusable styles | Met | Card border is `1px solid var(--token-xhJ1K1cgR)`. Text style Display 32 is on both large headings. Spacing stays the measured pixels. Letter-spacing keyword is the recorded rejection. |
| Expose text, images, colours, variants, and interactions as Framer controls | Met | Card one image control is `{ src, alt }`. Title text differs per card on the page. One captured state, so no variant was added. |
| Use custom code only when necessary, and explain why | Met | Build report line: Custom code: none. |
| Keep image alt text and flag a missing alt | Not met | `clip-02.json` has alt `Card one image` and warning `alt-missing`. Logo frame alt is `Site logo`. Card frame `slVaJcJoN` still says `Card one image` for both instances. |
| Put images in Framer image fields, not text URLs | Met | Both card controls use `data:framer/asset-reference,...pixel.png`. |
| Turn nested HTML into Framer layers and stacks | Met | The screenshot shows the header row, stacked headings, a horizontal card row, and the footer. |
| Classify repeated elements with Atomic Design | Met | `components.json` molecule `sig-001` lists `n-000021` and `n-000025`. The Card component is placed twice. |
| Migrate reliable links and flag uncertain ones | Met | Digests classify `#pricing`, `/about`, `https://example.com/docs`, `mailto:hello@example.com`, `tel:+31101234567`, and the inline URL. The empty href is `uncertain`. The screenshot shows Empty as plain text. |
| Keep the result editable and leave uncertain choices to a designer | Met | Empty was not given a destination. Card title and image controls are on the instances. |
| Document classification rules and a repeatable workflow | Met | `docs/classification.md` and the four skill cards. This pass used the capture, token, and digest commands those cards name. |

Met: 12. Not met: 1.

Build report: `Database/pipeline-runs/pass-3/digest/nesting/requirements/1200/default/build-report.md`.
