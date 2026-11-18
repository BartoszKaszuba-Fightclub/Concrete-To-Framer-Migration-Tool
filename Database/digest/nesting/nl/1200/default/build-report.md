# Build report
Project: Enchanting Whoever
Branch: mellow-harbor (lei14qu8u)
Page: Home
Breakpoint: 1200 x 5255
Custom code: none
Missing:
- Hero hive outlines n-000112, n-000131, n-000150 and n-000168 were not drawn. Their fill is var(--bs-theme-primary).
- Collapsed hero photos n-000127, n-000146 and n-000164 were placed at the parent box 1200x775.
- Intro ::before feature-mask.svg is 700px by 700px at opacity 0.1. The digest has no left or top, so that layer was not placed. The three photo masks were placed.
- Consent dialog box is 1200x900. consent.json has no colour and no text for it, so no dialog frame was drawn.
- Footer link Alle merken (n-000335) has an empty href. The label is placed and the link is not.
Scorecard:
- type: pass
- colour: pass
- spacing: gap: collapsed hero photos n-000127, n-000146 and n-000164 use the parent box 1200x775; intro ::before has no left or top
- images: gap: hero hive outlines were not placed; intro background::before feature-mask.svg was not placed
Classification:
An atom is one text node, one image, or one link. A molecule is repeated siblings with the same tag and the same ordered child tags. An organism is one visual band. The template is the ordered list of organisms and is not a component.
Workflow:
The collector writes the capture, tokens, and digest index. The section agent writes sections-prompt.md. The builder exports styles, places one organism per prompt block, and writes the report.
