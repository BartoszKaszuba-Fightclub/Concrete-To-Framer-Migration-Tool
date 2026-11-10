# Improvements from the pipeline research

These are the changes worth making, based on the skill review, the 5 November Yellow Hive run, and the four read-only evaluations of tokens, capture scripts, capture files, and digests. Each item says what is wrong and what to change.

Already done, so they are not repeated as open work: cookie-banner dismissal before the CSS read, one width per run, image download into `assets/`, local paths copied into digests, and the split into collector, section, and builder instructions. The builder instructions now say to place sections on a page, file styles into folders, and use the measured type and images. That rebuild has not been run again.

## 1. Stop writing data nobody reads

- **Stylesheet list in `structure.json`.** About 59 KB of `metadata.breakpoints.discovered` repeats two CSS file addresses. Tokens, digests, the section step, and the builder never read it. Drop it from the capture, or keep one note that a stylesheet could not be read.
- **`reconstruction.json`.** The capture writes a simplified tree (about 101 KB on the Dutch page). The digest generator simplifies again from `structure.json` and `computed.json`. The section step is allowed to open it when a boundary is unclear, and on the trial it did not. Either use that file as the only simplified tree, or stop writing it.
- **`signatures.json`.** Six button style groups are saved, then the digest command groups buttons again from colour, border, and type. Nothing later opens the signature file. One grouping is enough.
- **`match.ts`.** Nothing imports it. It belongs to the old cross-width match files, which the current run does not write. Remove it from the active extractor folder so the next reader does not treat it as part of capture.
- **`apply.ts`.** A second way to create Framer colour and text styles. The collector and the builder are both told not to run it. Delete it or point the builder at one path only.

## 2. Make the token file match what Framer actually uses

On the trial, `tokens.json` held 11 colours, 25 text styles, 48 spacing values, 9 borders, 6 radii, and 2 shadows. The section step never opened the file. The builder created the 11 colour styles and 25 text styles, then never looked up spacing, borders, radii, or shadows. A few borders and radii were typed in as raw values (`2px`, `6px`, `100%`).

- Apply spacing, border, radius, and shadow from the token file onto the layers, or stop collecting those four groups.
- Store each colour once. `css`, `alpha`, and `framer.light` repeat the same colour. Framer only received the name and `framer.light`.
- Store each text measurement once. Family, size, weight, line height, and transform are copied into a `framer` block. The builder did not read the top-level family string.
- Keep `letterSpacing: "normal"` as the measured keyword, and send that keyword. On the trial Framer was left at `-0.02em`.
- Keep the viewport on the token file. The page URL, slug, language, and state were not read when styles were created.

## 3. Shrink the capture tree to what the next step needs

`structure.json` was 391 KB and `computed.json` was 626 KB for 376 nodes. Both are still required: the token script and the digest script join them on the node id. The waste is fields copied through even though the builder never opens these files.

- Stop copying `selector`, `classes`, and `domId` onto every node and then into every digest. All 376 nodes carry a selector (about 47,000 characters). The section step used `box`, `tag`, `classes`, display, and children. The builder never opened `structure.json`. The digest schema still requires the selector, which is why it survives.
- Leave consent and warning lists on the capture for the collector’s own check. The section step and the builder did not use `excluded`, `sectionShell`, or the warning list.
- The image URLs on a node are needed. They become the digest’s original image address. The stylesheet URLs are not.

## 4. Shrink button digests

A button digest is large because the same measurements are stored twice, not because of the screenshot warning. `cmp-001.json` is 47 KB for 4 nodes. About 70% is `nodes`. Inside that, styles are about 58% and pseudo-elements about 28%. Across all 16 button files (390 KB), styles are about 28% of the bytes and the token copy is about 24%.

- The collector never passed `--screenshot`, so every button digest stores "No screenshot path was supplied." twice: once under `evidence.screenshot` and once as a `screenshot-missing` warning. The screenshot file was already on disk. The section step and the builder opened that file, not the path inside the digest. Pass the real path, or stop writing the warning.
- Every digest also says the crop is missing. The digest command has no way to pass a crop. Remove that warning until a crop exists.
- Drop unused digest fields: font-availability notes, `capture.language` and `capture.timestamp` gap text, `capture.config` source paths, `selector`, `classes`, `domId`, empty provenance, the "interaction-state" line, and the separate letter-spacing warning. The keyword is already on the property.
- Keep `nodes.styles`, geometry, visible text, hierarchy, tokens the node points at, painting pseudo-elements, inline SVG, and asset paths. The builder used those.
- A painting `::before` or `::after` copies about 39 properties (about 3 KB) even when most are zero or empty. Store the size, offset, opacity, and paint. That is what the builder is told to use.
- Token objects inside the digest repeat the node styles, and colour and type also live in `tokens.json`. Keep the ids on the node. Keep one copy of the values.

## 5. Capture once, then read the files

- Do not run the capture a second time to produce tokens or digests. Both are derived from `structure.json` and `computed.json`.
- Write every digest in one process. The trial wrote 20 digests in about 2 seconds as separate commands. One process removes the repeated startup.
- The section step should read the screenshot for band edges and the digests for names and contents. It does not need `computed.json`.
- The builder should keep reading the screenshot, the HTML snapshot, the token file, and the digests. It should not open `structure.json` to invent layout.

## 6. Build what the trial skipped

The 5 November build in Enchanting Whoever created styles and section components, and did not publish. These gaps are still open until a new build is run with the current instructions:

- Place the sections on one Framer page at the captured width. The trial left the layout as a component in Assets.
- Draw images from the local `usablePath`, and draw inline SVG that is already in the digest (hero overlays, footer icons).
- Draw slider dots, the decorative shape, and the footer divider from the captured pseudo-elements.
- Use the font size, weight, and line height measured on that node. Do not borrow a larger heading style from elsewhere on the page.
- Prefer auto layout. Use absolute positioning only for an overlay or a shape that crosses a section.
- Create the Framer branch once, after the connection is available. The first attempt on the trial created no branch and cost most of the two minutes spent on that step.

## 7. Do not call the work finished without a scorecard

The implementation spec still asks for a criterion ledger, a per-component scorecard, a build manifest, and release notes that trace each requirement. Those files are not in the repo. A saved Framer component is not evidence that type, spacing, colour, and images match the capture. Not measured is not passed.
