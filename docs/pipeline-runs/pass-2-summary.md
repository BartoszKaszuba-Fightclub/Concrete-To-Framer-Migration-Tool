# Pass 2 summary

Date: 10 November 2026. Branch: `lean-pipeline`. Width: 1200.

The same local page was captured again, then built in Framer. Project: [Requirement fixture POC](https://framer.com/projects/yFvpcRHhCsaZsXsnbnCp). Page: Home. Desktop breakpoint: 1200px wide.

Assumption: one local fixture is still the proof. The image file is a 1×1 pixel, so the pictures on the page are that pixel, not a designed logo.

## What the capture holds

`Database/pipeline-runs/pass-2` has the title `Requirement fixture`, language `en`, a screenshot, and local image files. The seven links are stored as anchor, internal, external, email, phone, or uncertain (the empty href). The card without an alt has warning `alt-missing`. The two articles share molecule `sig-001`. The H1 and the H2 that look the same stay `h1` and `h2` on the digest nodes and share one typography id.

## What Framer holds

Header, Main, Card, and Footer are native components. Card is placed twice. Text and the card image are component controls (`title`, `body`, `image`). Colour styles Ink, Link, Line, and Paper exist. Text styles are applied, and the H1 and H2 layers keep their own tags while sharing Display 32. No code file was added.

The empty link is plain text. Pricing points at `/#pricing`. About points at `/about`. Docs, email, phone, and the inline URL are real links.

Framer rejected `letterSpacing: "normal"` and kept `-0.02em` on Display 32. The card border is the raw colour `rgb(200, 200, 200)`, not the Line style. `altText` accepts only a string, so both cards carry `Card one image` and the Alt variable is not an instance control.

## Matrix

| Requirement | Result | Evidence |
| --- | --- | --- |
| Capture content, styles, measurements, screenshots, links, metadata, and assets | Met | Pass 2 `structure.json` has title, language, href, boxes, and styles. Screenshot and `assets.json` exist. |
| Preserve H1–H6 independently of visual styling | Met | Layers `IeJ6aTRx8` and `JEDoXNxb9` are tags `h1` and `h2` and both use text style `nKCiQkoBE`. |
| Build pages with native, reusable Framer components | Met | Header `xh_9zXGr3`, Main `M5uqo73QE`, Card `XbZefmp80`, Footer `sr44vWk0B`, placed on Home. |
| Map text, typography, colours, and spacing onto reusable styles | Not met | Text styles and Ink are applied. Letter-spacing is `-0.02em`, not `normal`. The card border does not use the Line colour style. |
| Expose text, images, colours, variants, and interactions as Framer controls | Met | Card controls are image, title, and body. Colour styles are the colour controls. No second state was captured, so no variant was invented. |
| Use custom code only when necessary, and explain why | Met | No code component. Custom code: none. |
| Keep image alt text and flag a missing alt | Not met | The digest warns `alt-missing` on card two. In Framer both images use the string `Card one image`. |
| Put images in Framer image fields, not text URLs | Met | The card image control is type `responsiveimage`. The logo fill is an asset reference. |
| Turn nested HTML into Framer layers and stacks | Met | The page is a vertical stack of header, main, a horizontal card row, and footer. |
| Classify repeated elements with Atomic Design | Met | `components.json` molecule `sig-001` lists both articles. The Card component is that molecule. |
| Migrate reliable links and flag uncertain ones | Met | `/#pricing`, `/about`, `https://example.com/docs`, `mailto:hello@example.com`, `tel:+31101234567`, and `https://example.com/inline`. Empty stays text. |
| Keep the result editable and leave uncertain choices to a designer | Met | Text and image controls are editable. The empty link was not given a destination. |
| Document classification rules and a repeatable workflow | Met | `docs/classification.md` and the four skill cards. |

Met: 11. Not met: 2.

## Build report

Project: Requirement fixture POC. Branch: main. Page: Home. Breakpoint: 1200 × auto.

Missing:

- Letter-spacing `normal` was rejected. Display 32 is `-0.02em`.
- Card border colour is raw, not the Line style.
- Card two alt is not empty. Both images say `Card one image`.

Custom code: none.
