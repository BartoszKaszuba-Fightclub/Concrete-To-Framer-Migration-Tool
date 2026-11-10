# Pass 4 changes

Date: 10 November 2026. Branch: `lean-pipeline`. Width: 1200.

No capture code changed. No Framer node changed.

The pass 3 review kept the alt note. The only implement step is one build-report sentence: Card image `slVaJcJoN` stays `Card one image` on both instances because `altText` is one shared string and cannot be omitted.

Why: `altText` accepts only a string. `null` was rejected. The image-control `alt` on each instance does not replace that shared string. Card one must keep `Card one image`, so the frame string stays.

Set aside: `alt=""`, a code component, and a second card component. A new frame per card would avoid the shared string, and the review called that larger than the failure.

Assumption: the requirement stays unmet. Pass 4 checks that the files and the Framer read still show the same split, on the same local fixture at 1200.
