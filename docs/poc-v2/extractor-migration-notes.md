# Extractor migration notes

The active `npm run extract:generic` path no longer writes or reads these v1 artifacts:

- `elements.json` — node identity already lives on `structure.json`. The selector registry duplicated the tree.
- `report.json` and the per-node locator coverage pass — re-querying every selector did not stop a bad capture.
- `matches.proposed.json` — cross-width matching is outside the one-width capture path.
- `sections.approved.json`, `--sections` overrides, `sections-preview.png`, and `pending-decision.json` — sections are selected automatically. There is no clip-approval pause.
- Skipping Cookiebot nodes during measurement — consent is dismissed through its visible control before the single style traversal. Skipping those nodes hid missing styles.

Files already stored under `Database/` are left in place.

The coverage stage is replaced by `tests/extractor/`. Those fixtures check one selected width, inaccessible stylesheets, consent failure, header/hero/main/footer sections, button-only inventory, simplification provenance with before/after node counts, and visual signatures. A blocking overlay or a visible node missing required measurements exits non-zero and writes no capture.
