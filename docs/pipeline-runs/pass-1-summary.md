# Pass 1 summary

Date: 9 November 2026. Branch: `lean-pipeline`. Width: 1200.

The page under test is `tests/extractor/fixtures/requirements.html`. It has a title, a language, six heading levels, an H2 that uses the same size and weight as the H1, seven links (anchor, internal path, external, email, phone, empty, and one inline), three images (two with alt text, one without), and two repeated cards.

Commands:

```bash
npm run extract:generic -- <file url> --slug requirements --widths 1200 --out Database/pipeline-runs/pass-1
node --import tsx scripts/design-tokens/cli.ts --structure .../structure.json --computed .../computed.json --out Database/pipeline-runs/pass-1/tokens.json
node --import tsx scripts/digest/cli.ts --all --structure .../structure.json --computed .../computed.json --screenshot .../screenshot.png
```

The capture wrote 30 nodes, 3 sections, 0 component records, 4 colours, 7 text styles, 9 spacing tokens, and 3 local image files. The screenshot is 41 KB. Framer was not opened. Workspaces are reachable. No project was created on this pass.

Assumption: this pass judges the files the later stages are allowed to read. The HTML snapshot contains the title, the language, and the alt text, and the builder is told not to open that snapshot. Those facts count only when they also appear on `structure.json`, the token file, or a digest.

## Matrix

| Requirement | Result | Evidence |
| --- | --- | --- |
| Capture content, styles, measurements, screenshots, links, metadata, and assets | Not met | Nodes have text, boxes, and computed styles. Screenshot and `assets.json` exist. Anchor nodes have no address. `structure.json` has no title and no language. |
| Preserve H1–H6 independently of visual styling | Not met | Digest nodes keep `h1` and `h2`. They share `typography.0007`. The token style for that look has `roles: ["h1", "h2"]` and `framer.tag: "h1"`. |
| Build pages with native, reusable Framer components | Not met | No Framer session was opened and no component was created. |
| Map text, typography, colours, and spacing onto components and reusable styles | Not met | `tokens.json` has the colours, text styles, and spacing. Nothing applied them to a component. |
| Expose text, images, colours, variants, and interactions as Framer controls | Not met | No component exists, and the builder card does not mention property controls. |
| Use custom code only when necessary, and explain why | Not met | There is no built page to inspect, and no note that explains a code choice. |
| Keep image alt text and flag a missing alt | Not met | Each image record is `{ kind, url }`. The card image without an alt is not flagged. |
| Put images in Framer image fields, not text URLs | Not met | Digests store `usablePath` as a string. No Framer image field was set. |
| Turn nested HTML into Framer layers and stacks | Not met | Digests have a parent/child hierarchy. No Framer layers were created. |
| Classify repeated elements with Atomic Design | Not met | Header, main, and footer are sections. The two `article.card` blocks are not marked as a repeated component. `components.json` has an empty record list. |
| Migrate reliable links and flag uncertain ones | Not met | All seven digest links are `destination.status: "unsupported"`. The empty `href` is not separated from the reliable ones. |
| Keep the result editable and leave uncertain choices to a designer | Not met | There is no decision list a designer can change. |
| Document classification rules and a repeatable workflow | Not met | The four skill cards describe a workflow. They do not state classification rules for atoms, repeated cards, or links. |

Met: 0. Not met: 13.

## What the files do hold

- Heading text and the real tag on each digest node.
- Local image bytes and a path on each asset.
- One text style per distinct look, plus spacing and colours.
- `digests/index.json` with `clip-01` (header), `clip-02` (main), and `clip-03` (footer).
