# Pass 3 review

## Alt — keep

`slVaJcJoN` `altText` is the string `Card one image`. `null` was rejected (`Expected a string`). `undefined` left the string in place. A variable reference was rejected. The instance controls are image `A2BKjHfDF`, title `B2KDuUS5p`, and body `pNMqKqNCJ`.

`lCEbmYv2a` stores `{ src, alt: "Card one image" }`. `xT5lI2ZcH` stores the asset string and no `alt` key. The shared frame still reads `Card one image`. That control `alt` is a separate field.

No native write left untried can omit that string on one instance and keep it on the other. `alt=""` would store a present alt. A code component stays out. A second card component could use a new frame that never receives the string; the note's line that the split leaves the shared string in place overstates the copy. The split is still larger than this failure, so it stays out.

`clip-02.json` already stores alt `Card one image` on `n-000022` and warning `alt-missing` on `n-000026`. Leave the digest warning, both controls, and `slVaJcJoN`. The requirement stays unmet. These reads support the labeled assumption: both instances carry the frame string. The page was not published.

## Implement

1. In `Database/pipeline-runs/pass-3/digest/nesting/requirements/1200/default/build-report.md`, set the Missing alt line to this sentence only: Card image `slVaJcJoN` stays `Card one image` on both instances because `altText` is one shared string and cannot be omitted.
