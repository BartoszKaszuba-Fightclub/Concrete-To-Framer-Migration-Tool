# Build report
Project: Enchanting Whoever
Branch: sunlit-glow (wzbtrwl5n)
Page: Home
Breakpoint: 1200 x 8116
Custom code: none
Missing:
- swiper-icons is not in the Framer font catalog. No placed text uses it, and no other font was substituted.
- Altijd een trekhaak beschikbaar has no section node; top offset 80.2px is the band y minus the first root y.
- n-000598 alt missing
- n-000015 alt missing
- clip-01 n-000019 background::after asset-2.svg is not a layer. The header chevron is the inline SVG.
Scorecard:
- type: gap: placed text uses the digest text styles; swiper-icons was not placed; anonymous wrappers were not given their own text layers
- colour: gap: frame fills use the colour styles from the token file; icon SVG paths keep the digest rgb
- spacing: gap: section padding and the 8116 breakpoint height come from the digest and the prompt; nested margins were not all written as spacers
- images: gap: photos and logos use the digest assets; alt is missing on n-000598 and n-000015
Classification:
An atom is one text node, one image, or one link. A molecule is repeated siblings with the same tag and the same ordered child tags. An organism is one visual band. The template is the ordered list of organisms and is not a component.
Workflow:
The collector writes the capture, tokens, and digest index. The section agent writes sections-prompt.md. The builder exports styles, places one organism per prompt block, and writes the report.
