# Pass 4 summary

Date: 10 November 2026. Branch: `lean-pipeline`. Width: 1200.

This is the fourth run. Capture, tokens, and digests went to `Database/pipeline-runs/pass-4`. The Framer project was read and not rebuilt. No capture code changed. The review in `docs/pipeline-runs/pass-3/review.md` left the shared image alt as it is.

Command: `npm run extract:generic` on the local fixture at 1200, then the token CLI and `digest --all`. Result: 30 elements, 3 sections, 2 components. Tokens: 4 colours, 7 text styles, 9 spacing, 1 border, 1 radius, 0 shadows.

Assumption: one shared frame cannot omit `altText` for one instance and keep it for the other. The requirement stays unmet. `alt=""` was not written.

## Matrix

| Requirement | Result | Evidence |
| --- | --- | --- |
| Capture content, styles, measurements, screenshots, links, metadata, and assets | Met | Pass 4 `structure.json` title `Requirement fixture`, language `en`, width 1200. `tokens.json` and the screenshot folder exist. |
| Preserve H1–H6 independently of visual styling | Met | Layers `IeJ6aTRx8` and `JEDoXNxb9` are tags `h1` and `h2` and both use text style `nKCiQkoBE`. |
| Build pages with native, reusable Framer components | Met | Home still has Header, Main, Card (two instances), and Footer. No code component was added. |
| Map text, typography, colours, and spacing onto reusable styles | Met | Card border reads `1px solid var(--token-xhJ1K1cgR)`. Letter-spacing stays the recorded `-0.02em`. |
| Expose text, images, colours, variants, and interactions as Framer controls | Met | Card one image control is `{ src, alt: "Card one image" }`. One captured state, so no variant was added. |
| Use custom code only when necessary, and explain why | Met | Build report line: Custom code: none. |
| Keep image alt text and flag a missing alt | Not met | Pass 4 digests store `Card one image` and two `alt-missing` warnings. Logo alt is `Site logo`. Frame `slVaJcJoN` still says `Card one image` for both cards. |
| Put images in Framer image fields, not text URLs | Met | Both card controls are `data:framer/asset-reference,...pixel.png`. |
| Turn nested HTML into Framer layers and stacks | Met | The page read this pass is the same stack built in pass 2: header, headings, card row, footer. |
| Classify repeated elements with Atomic Design | Met | `components.json` molecule `sig-001` lists `n-000021` and `n-000025`. |
| Migrate reliable links and flag uncertain ones | Met | Digests: anchor, internal, external, email, phone, each `value`, plus one `uncertain` empty href and the inline external URL. |
| Keep the result editable and leave uncertain choices to a designer | Met | The empty href stays uncertain in the digest. Card title and image controls remain on the instances. |
| Document classification rules and a repeatable workflow | Met | `docs/classification.md` and the four skill cards. This pass ran the capture, token, and digest commands. |

Met: 12. Not met: 1.

The four runs are done. The open item is the shared card alt. The build report is `Database/pipeline-runs/pass-4/digest/nesting/requirements/1200/default/build-report.md`.
