# Review criteria

Score every item. Copy the requirement or metric text into the table.

## Requirements

Judge whether the design meets the criterion.

### Must

- Capture every source page automatically, content, styles, measurements, screenshots, links, metadata and assets.
- Preserve H1–H6 heading semantics independently of visual styling.
- Build pages using native, reusable Framer components.
- Map text, typography, colours and spacing to the correct components and reusable styles.
- Expose component properties—such as text, images, colours, variants and interaction settings—through normal Framer controls.
- Use custom code or overrides only when necessary, and explain why.
- Preserve available image metadata, including alt text, and flag missing essential metadata.

### Should

- Map images to the correct components and Framer image fields, rather than storing them as text URLs.
- Translate nested source HTML into clean Framer layers, stacks and components.
- Identify repeated elements and classify them using Atomic Design.
- Migrate internal, external, anchor, email and phone links when destinations are reliable; flag uncertain ones.
- Keep the result editable and maintainable, with designers controlling uncertain decisions.
- Document component-classification rules and a repeatable migration workflow.

## Metrics

The Framer implementation and the website sit side by side. The pipeline is supposed to create an identical copy. A metric is not met in the way stated under it. Note any other discrepancy between the design and the live website as an Other row.

### M1 — Time to first completed component

The first usable component takes too long to appear, delaying review and correction.

### M2 — Native component percentage

Components rely on custom code or overrides instead of native Framer layers, making them harder to edit. A high percentage alone does not prove that all requested components were created or are visually accurate.

### Typography

### M3 — Font family

The wrong font or a fallback font changes the page’s appearance and text wrapping.

### M4 — Font size

Text is too large or small, or does not adjust correctly between breakpoints.

### M5 — Font weight

Text appears too light or bold, weakening the intended visual hierarchy.

### M6 — Line-height

Lines are too close together or too far apart, changing readability and block height.

### M7 — Letter-spacing

Characters are too tightly or loosely spaced, affecting appearance and wrapping.

### Spacing and colour

### M8 — Padding

Space inside a component is too large, too small or inconsistent with the source.

### M9 — Margin

Space outside a component or between sections is incorrect.

### M10 — Gap

The spacing between items in a stack, grid or component is incorrect.

### M11 — Text colour

Text uses the wrong colour, reducing visual fidelity or contrast.

### M12 — Fill colour

Backgrounds, buttons or other surfaces use the wrong colour or are missing.

### M13 — Border colour

Borders use the wrong colour or are missing; border thickness may also differ.

### Layout and responsive behaviour

### M14 — Unintended overflow

Content extends beyond its container or viewport when it should fit.

### M15 — Unintended clipping

Text, images or other important content is cut off.

### M16 — Unintended overlap

Elements cover each other when they should not, or an intended overlap is missing.

### M17 — Text wrapping

Lines break at different points, changing text height and the surrounding layout.

### M18 — Stacking

Elements appear in the wrong order or fail to switch correctly between stacked and side-by-side layouts at different widths.
