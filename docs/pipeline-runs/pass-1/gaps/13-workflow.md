# Classification rules and the migration workflow

Requirement: document component-classification rules and a repeatable migration workflow.

## Root cause

The workflow is split across skill cards, and the classification rules were never written down.

`ORCHESTRATION.md` runs collector, section agent, and builder. `COLLECTOR.md` writes tokens and digests. `SECTIONS.md` calls an organism one visual band and the template the list of those bands. `BUILDER.md` builds one organism per band on one page. None of the four defines atom, molecule, organism, and template as rules with an example. `docs/` has no page whose only job is those rules.

Pass 1 classified header, main, and footer and left the repeated card unmarked. The two `article.card` blocks share tag, class, and children. `components.json` records buttons and fields only.

## Smallest change

A later pass adds `docs/classification.md`.

Headings: **Levels** (the four names), **Rules** (the five below), **Example** (this fixture), **Commands** (pointers only; the commands stay in the skill files).

1. An atom is one visible node with no child group: a heading, a paragraph, a link, or an image. The logo and each nav link are atoms.
2. A molecule is two or more siblings with the same tag, class, and child shape: one component used more than once. The two `article.card` blocks are that molecule.
3. An organism is one visual band. Header, main, and footer are organisms. A coarse main splits on a new band.
4. A template is the ordered list of those organisms. `BUILDER.md` places them on one page.
5. A node takes the smallest level that fits and stays inside its parent. The card molecule stays inside main.

## Alternatives rejected

A long specification of capture, tokens, digests, and Framer placement. The cards already name each stage’s files.

A second copy of the skill cards under `docs/`. The commands would drift. The new page points at the cards.

## Assumption

The skill cards remain the workflow. `docs/classification.md` is only the classification rules, and it points at `.cursor/SKILLS/ORCHESTRATION.md`, `COLLECTOR.md`, `SECTIONS.md`, and `BUILDER.md` for the commands.

After review: the molecule rule is repeated siblings with the same tag and the same ordered child tags.
