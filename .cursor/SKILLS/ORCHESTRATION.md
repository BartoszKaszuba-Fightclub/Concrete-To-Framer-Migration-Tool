```yaml
---
name: orchestrate-design-to-components
description: Orchestrates rebuilding the initial appearance of one public website page as native Framer components through browser-only generic DOM extraction. Captures confirmed responsive widths in a shared Playwright session, preserves full and source-linked simplified trees, digests visual sections, creates color and text styles, then builds molecules, organisms and templates mobile-first in Framer Assets. Use when asked to capture, digest, or visually recreate a public page or its sections as Framer components.
---
```

Rebuild the initial appearance of one public source page as native Framer components at the confirmed widths. A section (clip) is a distinct, full-width content area that organises a long page into visually separated chunks, not a CMS block or HTML tag by definition. The run is done when every confirmed clip exists as a template in Framer Assets; report incomplete work explicitly.

Run Extract with `npm run extract:generic`. Computed styles, asset download, the digest schema, and ID stability across recaptures remain open. Do not invent answers for those open items.

## Inputs

- URL of the source page
- Framer project, connected through the Framer CLI / Agent API
- Source access: public website through Playwright only. No CMS admin, server-side adapter, CMS API or site modification is required. Describe observed DOM structure; do not infer CMS Areas or block handles.

## Pipeline

| # | Step | Output | Developer checkpoint |
| --- | --- | --- | --- |
| 1 | Detect breakpoints | The site's own breakpoint widths | Confirm the list |
| 2 | Capture and extract | Full DOM tree, registry, measurements, visual sections, source-linked simplified tree, match proposals, screenshots/snapshots, assets and map | Ambiguous sections, responsive matches, readiness/coverage gaps and data-loss limits |
| 3 | Digest | One digest per confirmed visual clip per width, linked to source nodes | Schema not agreed, unresolved grouping or data-loss limits |
| 4 | Design tokens | Page breakpoints, color styles, text styles, fonts | Missing fonts |
| 5 | Component creation | Molecules, organisms, templates in Assets | Non-native parts, similar existing components |
| 6 | Report | Clip → template table, open items | — |

Run the pipeline steps in order. Capture substeps are: prepare → extract/validate identities → measure → group visual sections and derive the simplified tree → capture aligned evidence. Section grouping may depend on measured geometry.

Extraction, measurement and screenshots share the same live Playwright page/session and initial capture state. Re-extract and re-measure after viewport/state changes; do not independently reload between identifying and measuring elements.

## Scripts

| Purpose | Command |
| --- | --- |
| Capture (Playwright) | `npm run capture` |
| Computed styles | [PLACEHOLDER: getComputedStyle command] |
| Extract | `npm run extract:generic -- <url> --widths <confirmed widths>` |
- Read `package.json` and the script source for arguments before running a script. Extract defaults are `--height 900`, `--settle-timeout 10000`, `--max-nodes 0`, and `--out Database`. Pass the confirmed widths. Ask before using other height, settle, or limit values.
- A second run with `--sections overrides.json` records approved clips. The file is `{ "<width>": [["<selector>", "..."], ["<selector>"]] }`, one inner array per clip.
- Never write new scripts or edit existing ones. If a script does not produce an output listed below, stop, describe the gap, and propose a script change for the developer to approve.
- Read outputs from the destinations below. Do not move or rename files.

### Extract files

`<slug>` is the capture slug. `<width>` is one confirmed width. `default` is the initial capture state.

| Data | File | Destination |
| --- | --- | --- |
| Element registry | `elements.json` | `Database/digest/nesting/<slug>/<width>/default/elements.json` |
| Full tree, section candidates, shell, warnings | `structure.json` | `Database/digest/nesting/<slug>/<width>/default/structure.json` |
| Simplified tree and dropped nodes | `reconstruction.json` | `Database/digest/nesting/<slug>/<width>/default/reconstruction.json` |
| Counts, excluded nodes, coverage | `report.json` | `Database/digest/nesting/<slug>/<width>/default/report.json` |
| Limit stop | `pending-decision.json` | `Database/digest/nesting/<slug>/<width>/default/pending-decision.json` |
| Cross-width match proposals | `matches.proposed.json` | `Database/digest/nesting/<slug>/matches.proposed.json` |
| Full-page screenshot | `screenshot.png` | `Database/Screenshots/<slug>/<width>/default/screenshot.png` |
| Section overlay preview | `sections-preview.png` | `Database/Screenshots/<slug>/<width>/default/sections-preview.png` |
| Raw page HTML | `snapshot.html` | `Database/snapshots/<slug>/<width>/default/snapshot.html` |

`reconstruction.json` written while any section candidate is `needs-review` is review material. The reconstruction tree used for Framer components is the `reconstruction.json` from the `--sections` re-run, after those candidates are `approved`.

Nodes with `display: none` stay in `structure.json`. They are listed in `reconstruction.json` under `dropped`. Read hidden-at variants from the full tree in `structure.json`.

Other pipeline data belongs in these folders:

| Data | Destination |
| --- | --- |
| Widget type | `Database/digest/widget type/` |
| Cleaned HTML tree | `Database/digest/cleaned HTML tree/` |
| Media | `Database/digest/media/` |
| Links | `Database/digest/links/` |
| CMS | `Database/cms/` |
| Prompts | `Database/prompts/` |
| Code components | `Database/Framer code/` |

### Computed-style script (getComputedStyle)

Follow Spec — getComputedStyle script. At each width, measure the generic extractor's full registry in the same live page/session. Reuse extractor-issued IDs; validate selectors uniquely. Do not invent measurement IDs or depend on CMS identifiers.

- Page set: Type and Box properties for body, headings, paragraphs, first link, header/nav/footer, buttons, lists and form elements. This token summary does not replace per-node measurement.
- Digest set: Layout, Box and Visual properties for full-registry nodes, Type on text-bearing nodes, plus visibility, bounds and supported pseudo-elements. Do not measure only simplified-tree nodes.
- Collect CSS variables used by captured visual properties and their dependencies. Report declaration/access gaps; resolved computed values do not reveal variable names.
- Keep URL/slug for capture bookkeeping only, not digest routing.

Use measurements for digest styles and Framer color/text styles. Keep the full tree intact.

### Extract

Follow Spec — Generic DOM extractor:

- Identify DOM elements, wrappers and hidden elements present at each width. Supply unique extractor IDs and validated selectors; retain tags, source DOM IDs/classes, nesting and sibling order.
- Preserve the full DOM tree and a separate simplified reconstruction tree mapped to source node IDs. Do not overwrite the full tree or invent CMS classifications.
- Propose full-width visual sections using DOM evidence and measured geometry. Candidates are `needs-review` until a `--sections` re-run marks them `approved`. Ask the designer about ambiguous boundaries before digest or component creation.
- Propose desktop/mobile correspondences for designer approval before unifying reconstruction components. Preserve per-width source nodes after approval. ID stability across recaptures remains open.
- Supply observed visual media/copy to capture/digest modules; preserve CSS filters through measurement. Exclude behaviour settings.
- Derive video/form/carousel/mask/background/lightbox detection flags only where observable evidence supports them. Report uncertainty instead of inventing settings. Flags do not authorise opening extra states.
- Report iframe, shadow-root, canvas, SVG and video coverage gaps. Their exact support remains open; ordinary CSS selectors do not cross every document/root boundary.
- Ask the designer before depth, text, HTML-size, image-count or resource limits would omit relevant data. Do not silently truncate, change limits or choose a fallback.

Capture/digest cleaning removes scripts, styles and identified CMS edit-mode/toolbar markup from cleaned HTML only. Preserve other attributes as evidence and preserve raw snapshots; do not re-extract excluded attributes into structured fields.

## Step 1 — Detect breakpoints

1. Use the capture to collect every `min-width` and `max-width` value in the `@media` rules of the page's stylesheets, linked and inline.
2. Derive the breakpoints the original design uses: the width ranges where the layout changes. List any cross-origin stylesheets that could not be read.
3. Show the developer a table with: breakpoint, width range, where it was found, and proposed capture width. Wait for confirmation or edits.
4. Use the confirmed widths everywhere: capture, digests, component variants, and Framer page breakpoints. The smallest confirmed width is the mobile width.

## Step 2 — Capture and extract

Use one live Playwright page/session for preparation, extraction, measurement and screenshots of each capture state. Load the public logged-out page without CMS access. Viewport height, cookie action, lazy-load preparation, final scroll position, font/image readiness, timeout and motion handling must follow an agreed policy. These remain open in the generic spec: ask for missing decisions rather than choosing unapproved defaults. Never wait indefinitely for infinite animations/network activity.

Capture initial appearance only. Do not open menus, expand accordions, switch tabs, cycle carousels or add sticky/scroll-state captures automatically. Preparation must not silently become state exploration.

At each confirmed width:

1. Prepare and settle the agreed initial state.
2. Extract the full DOM tree and validate the registry. Keep hidden elements present in the DOM; off-screen content is not automatically hidden.
3. Measure in that same page state. Keep bounds/visibility evidence; zero-sized wrappers may have visible children and must not be discarded automatically.
4. Use structure and geometry to propose full-width sections and write the source-linked simplified tree. `reconstruction.json` beside `needs-review` candidates is review material. After the designer approves the boundaries, re-run with `--sections` and use that `reconstruction.json` for Framer components.
5. Take a full-page screenshot, confirmed-clip screenshots and a raw Playwright snapshot aligned with measurements. If DOM/state changes invalidate identities or measurements, refresh affected extraction/measurement before finalising evidence.
6. Propose desktop/mobile matches for designer review before unifying components. Ask before any limit would omit relevant data.

Stop when a checkpoint is reached:

- Data-loss limit: Extract exits with code 2 and writes `pending-decision.json`. Ask before re-running with a higher `--max-nodes`.
- Ambiguous sections: any `sectionCandidates[].status` of `needs-review` in `structure.json`.
- Coverage and readiness: a `report.json` warning of `unsupported-boundary`, `locator-unresolved`, `section-unassigned`, `settle-timeout`, or `dom-changed`.
- Responsive matches: `matches.proposed.json` is present and its proposals are `proposed`.

Start digest after section candidates are `approved`. Unify responsive components only after match proposals are approved.

Retain:

- Full tree, element registry and source-linked simplified tree
- Section candidates/confirmed membership, DOM tags/IDs/classes, selectors, nesting/order and measured positions
- Page/per-node styles, bounds, visibility and supported pseudo-elements
- Screenshots, raw snapshots, match proposals/decisions and coverage warnings
- Fonts and accessible font-face sources, colors and visual CSS variables/dependencies; retain responsive differences and report inaccessible sources
- Visual form fields: tag/type, label, placeholder and DOM IDs/selectors for identity/label association only; no action/method, field names or required/validation settings
- Downloaded DOM images, backgrounds and masks at the largest available source size, with the source-URL → local-file asset map; never hotlink in Framer
- Source URL and capture slug as capture bookkeeping only

Exclude structured SEO metadata, link destinations, image alt text, playback/lightbox settings, capture timestamps and HTML character counts. Keep visible headings/link labels and visual media sources. Excluded attributes may remain in source evidence but must not become functional build requirements.

Read extract output from the Extract files table. Do not invent paths or rename files to disguise schema incompatibilities.

## Step 3 — Digest

Create one digest per confirmed full-width visual section per confirmed width using generic extraction and measurements. Do not split by CMS Areas/Containers, require block handles or manufacture CMS classifications.

### What to retain per clip

- Clip identifier, section order, first heading, viewport and source-node membership
- Full-tree and simplified-tree references with source mapping; DOM tags/IDs/classes, selectors, nesting/order, measured styles, visibility and bounds
- Observed image sources/natural sizes, supported video/YouTube references, background/overlay appearance, masks and icons; resolve sources through the asset map. Exclude alt text and playback/lightbox settings.
- Exact visible copy and inline structure, including link labels but not destinations; avoid duplicated ancestor text
- Cleaned HTML without scripts/styles or identified CMS editor/toolbar markup; preserve other source attributes as evidence, including copy HTML
- Accessible relevant CSS rules, observation-supported visual flags, uncertainty and coverage warnings

Use getComputedStyle for measurements. Do not re-extract excluded functional/SEO/accessibility fields from source evidence.

### Generic schema status

The digest schema remains open. Computed styles, asset download, and ID stability across recaptures remain open. The previous Concrete-native example is retired. Read trees, matches, and warnings from the Extract files table. A digest still has to express:

- Confirmed clip membership, including possible multiple source roots without inventing a source DOM element
- Full-tree references and the source-mapped simplified tree
- Measurement joins using extractor IDs scoped to the correct width/state
- Proposed versus designer-approved responsive correspondences
- Coverage warnings, unresolved locators and designer decisions

Do not require or emit CMS `blockTypes`, `blockType` or CMS `nodeType` values. Keep URL/slug in capture bookkeeping only; omit digest routing `path`/`slug`, `capturedAt` and `htmlChars`. Use approved script schemas once agreed; stop and propose developer-approved changes if scripts conflict. Do not silently relabel outputs.

### Limits and incomplete evidence

Legacy limits were depth 8, 12 images, 800 text characters, 1,200 copy-HTML characters, 100,000 section-HTML characters and 50 CSS rules. These do not authorise silent generic-data loss. If a limit would omit relevant data, explain the affected nodes/content and ask the designer what to do before finalising affected output.

Do not automatically remove/raise caps, split content, set `html: null` or choose a screenshot/tree fallback. Record the designer's choice and report accepted omissions. Keep the full source tree intact and the simplified tree traceable.

## Step 4 — Design tokens

1. Set the project's page breakpoints to the confirmed widths.
2. Create color styles from the captured design tokens and colors.
3. Create text styles for `h1`–`h6`, body, links, and buttons. Make one text style per captured typography row. Set the mobile values first, then add the values for each larger confirmed width. Make all links visually distinct.
4. Check that every font is available in Framer (Framer fonts, Google Fonts, Fontshare, or custom fonts already in the project). For each missing font, ask the developer to choose: upload the font, or use a suggested alternative (name the closest match). Wait for the answer.

## Step 5 — Component creation

### Inputs per clip

Start with the mobile screenshot, snapshot, digest, and the approved source-linked reconstruction tree (`reconstruction.json` from the `--sections` re-run), then evidence for larger widths. Use designer-approved responsive correspondences to unify reconstruction components; do not automatically merge source nodes.

### Levels and folders

Put every component in the Framer Assets panel, in these three folders:

| Folder | Contains | Examples |
| --- | --- | --- |
| Molecules | Single objects | Fields, buttons, bars |
| Organisms | Groups built from molecules | Cards, forms |
| Templates | Full sections built from organisms and molecules | One template per clip |

Give each component a descriptive name for what it is.

### Order

1. Scan digests and simplified reconstruction trees. Make reusable components for repeated elements; obtain designer approval for desktop/mobile correspondences before unifying responsive source elements. Preserve full source trees.
2. Before creating a component, check the Assets panel. Reuse a matching component instead of creating a duplicate. If an existing component is similar but different, ask the developer whether to add a variant or create a new component.
3. Build all molecules.
4. Build organisms from the molecules.
5. Build one template per clip from the organisms and molecules. Elements that appear only once stay as layers inside the template.

### Building each component

- Build mobile-first: the mobile width is the primary variant. Add one variant per larger confirmed width, matching its capture. Apply hidden-at flags through these variants.
- Create components directly as components. Create-component-from-layer is not available through the Agent API.
- Use exact digest copy; do not rewrite. Reconstruct initial appearance only, without unobserved open/expanded/active or extra sticky/scroll states.
- Resolve image sources through the capture asset map and upload local files through the Framer CLI / Agent API. Never hotlink the source site. Alt text is outside this visual-reconstruction dataset: do not extract it from evidence or invent it; flag accessibility content as a separate handoff item.
- Use color styles and text styles instead of raw values.
- Expose every property as a component variable. When in doubt, expose it.
    - Visual content: text, rich text, images and icons. Expose link labels as text; do not populate destinations or alt text from this dataset.
    - Visibility toggles for optional elements
    - Colors and fills, bound to color styles
    - Spacing and layout: padding, gap, alignment
    - Variables of nested components, exposed on the parent

### Rules

- Do not use code overrides.
- Build the captured visual structure and static states natively. Pay extra attention to clips flagged video, form, carousel, mask or lightbox. Detection flags do not authorize reconstructing excluded behaviour. Link destinations, SEO, accessibility content, form handling/validation and video/lightbox behaviour are outside this dataset; report them for separate configuration rather than inferring settings from raw evidence.
- If something cannot be built natively, stop and ask the developer for permission. Explain what cannot be built and why, and every time offer exactly these two options:
    1. A code component with all its properties exposed as property controls, stored in `Database/Framer code`
    2. The developer pastes it with the HTML-to-Framer extension; provide the clip's cleaned HTML and screenshot
- Wait for the developer's choice before continuing with that part.

## Step 6 — Done and report

The run is done when every clip of the page has a template in the Templates folder. Report:

| Clip | Template | Organisms and molecules used | Notes |
| --- | --- | --- | --- |
| `muurisolatie--02` | … | … | … |

Below the table, list:

- New and reused components
- Font decisions
- Code components built and paste requests made
- Full-tree/reconstruction-tree references, approved responsive matches and unresolved section/match proposals
- Designer-approved limit handling and accepted omissions/incomplete evidence
- Unsupported boundaries, readiness issues and inaccessible stylesheets

## Edge cases

- **Missing/oversized HTML or data-loss limits:** ask the designer what to do; do not automatically fall back to tree/screenshots, split content, raise limits or accept incomplete evidence.
- **Section hidden at some widths:** hide it in those variants. Nodes with `display: none` stay in `structure.json` and are listed in `reconstruction.json` under `dropped`. Read the hidden-at variant from the full tree.
- **Section visible only at larger widths:** still build it mobile-first, hidden in the mobile variant.
- **Large edits or many images:** split them into batches.