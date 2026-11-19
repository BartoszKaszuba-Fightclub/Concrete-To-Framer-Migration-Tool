# Build report
Project: Enchanting Whoever
Branch: hazy-halo
Page: Home
Breakpoint: 1200 x 7675
Custom code: none
Missing:
- missing font Font Awesome 6 Pro
- missing font Font Awesome 6 Brands
- missing font Font Awesome 6 Duotone
- missing font swiper-icons
- alt-missing Database/digest/nesting/nl/1200/default/assets/xelion-logo-minified.png
- link.href is the digest URL; a string variable holds that href and Framer does not bind the string variable to link.href
- 52 customer logos in Deze organisaties vertrouwen dagelijks op Xelion were not placed
- story photos were not placed
- footer images were not placed
- office SVG n-000527 was not drawn
- KiKa quote was not placed
- negative margins were not written
- per-node margins inside the logo, story, and footer bands were not placed as spacers
- section background colours beyond the measured button, card, and border colours were not placed
Scorecard:
- type: gap: icon fonts were missing and not every text node became its own layer
- colour: gap: section background colours were not measured onto every band
- spacing: gap: per-node margins inside the logo, story, and footer bands were not measured onto spacers
- images: gap: customer logos, story photos, footer images, and the office illustration were not placed
Classification:
An atom is one text node, one image, or one link. A molecule is repeated siblings with the same tag and the same ordered child tags. An organism is one visual band. The template is the ordered list of organisms and is not a component.
Workflow:
The collector writes the capture, tokens, and digest index. The section agent writes sections-prompt.md. The builder exports styles, places one organism per prompt block, and writes the report.
