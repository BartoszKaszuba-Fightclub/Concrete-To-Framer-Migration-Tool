# Custom code only when necessary

Requirement: use custom code or overrides only when necessary, and explain why.

## Root cause

The requirement is a constraint on the build, and the build instructions do not state it.

Pass 1 built no Framer page, so no code component or override was used, and none was explained. The missing page is a separate requirement. This one fails because `.cursor/SKILLS/BUILDER.md` never says to stay on native layers, or to explain the one case that cannot.

Phase 2 draws each local image and each inline SVG from `boundary.markup`. The scorecard is type, colour, spacing, and images. Forbidden names the live site, the raw capture files, a second builder, and publishing. It has no sentence on code components, and the report has no line for one.

The fixture needs neither. Its only non-HTML-looking asset is a plain `img` (`pixel.png` in `tests/extractor/fixtures/requirements.html`). Inline SVG is the case the builder already allows as markup.

## Smallest change

One short rule in `BUILDER.md`: stay on native layers; allow a code component or override only for one case native layers cannot draw, and name why. One report line: `Custom code: none` or `Custom code: <case> — <why>`.

Do not add a code-component system.

## Alternatives rejected

A detector or a code-component authoring path. The fixture has nothing for it to place.

Folding the gap into “build the page.” The current card can still add an unexplained override.

Treating inline SVG as custom code. The builder already draws that markup as layers, and this fixture has no SVG.

## Assumption

This requirement is met when the build uses no custom code, or names the one case and why. `Custom code: none` on the build report is enough for a native page.

After review: native Framer layers are required, a code component or override is allowed only for one named case the build report explains, and otherwise the report includes the line "Custom code: none".
