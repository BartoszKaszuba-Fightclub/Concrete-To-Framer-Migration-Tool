# Card digest structures

| Document details | Value |
| --- | --- |
| Project | AI-assisted website migration to Framer |
| Author | Bartosz Kaszuba |
| Contributor(s) | Cursor agent (editing support) |
| Date | 2026-11-11 |
| Version | 0.1 |
| Status | Draft. Site data is not prepared. No runs. Expert feedback and reflection are not written. |
| Intended audience | Assessors, and the person who runs the migration pipeline |

## Version control

| Version | Author | Contributor | Date | Change |
| --- | --- | --- | --- | --- |
| 0.1 | Bartosz Kaszuba | Cursor agent (editing support) | 2026-11-11 | Experiment setup. Research question, method, and empty data tables. No site URLs, no packages, no runs. |

## Contents

1. [Introduction](#1-introduction)
2. [Background](#2-background)
3. [Research question](#3-research-question)
4. [Methodology](#4-methodology)
5. [Procedure](#5-procedure)
6. [Data to be prepared](#6-data-to-be-prepared)
7. [Results](#7-results)
8. [Recommendation](#8-recommendation)
9. [Conclusion](#9-conclusion)
10. [Expert feedback](#10-expert-feedback)
11. [Reflection](#11-reflection)
12. [Glossary](#12-glossary)
13. [Appendix A. Task text](#appendix-a-task-text)
14. [Appendix B. Run log](#appendix-b-run-log)
15. [Appendix C. Score sheet](#appendix-c-score-sheet)

## 1. Introduction

### Why

The migration pipeline builds a Framer page from captured files. The builder agent does not open the source website. It reads the section prompt, the token file, the digest index, the digest files that prompt lists, and the screenshot. Copy is taken from the digest, not from the screenshot (`.cursor/SKILLS/BUILDER.md`).

A card section is a repeated block. This repository has no component kind named card. The repeated block is stored as a molecule: siblings that share one tag and the same ordered list of child tags. The digest of that molecule stores the tag, the visible text, the box, an image path, and the link label and address. It has no field named media, headline, subhead, supporting text, or action (`docs/research/card-button-hero.md`).

The agent can only build the card from the package it is given. This document records an experiment that compares ways of arranging that package. The decision it supports is which arrangement the builder should receive for a card section.

### Objective

Find which data structure lets a fresh agent rebuild one card component section on two websites, with the card parts present and with no parts added that the data does not contain.

### Document structure

Section 2 states the scope and the facts already on record. Section 3 states the question. Section 4 maps each subquestion to a DOT method. Section 5 is the procedure, including the checklist. Section 6 is the data still to be prepared. Sections 7, 8, and 9 stay empty until the runs exist. Sections 10 and 11 are for the student.

Related documents: `docs/research/card-button-hero.md`, `docs/poc-v2/digest-contract.md`, `.cursor/SKILLS/BUILDER.md`.

## 2. Background

The pipeline captures a public page, writes tokens and digests, and asks an agent to place one organism per section in Framer. The experiment uses that handoff and narrows it to one kind of section: the card section.

Material Design 3 describes a card as a container of content and actions about a single subject. The container is the only required part. A common set on that page is container, image, button, supporting text, subhead, and headline (`docs/research/card-button-hero.md`). Those names are used in this experiment as the slot list. A card on a measured site may lack a slot. A missing slot is recorded as absent. It is not filled in.

The user of the result is the builder agent, and the person who maintains the pipeline. The experiment does not measure visitors of the websites. A structure can score well here and still be a weak card for a visitor. That question is out of scope.

### Scope

In scope:

- One card section on each site in the register in section 6.
- Three arrangements of the same observed facts: S1, S2, and S3 in section 5.
- A build of that card section, in a new agent session, scored with the checklist in section 5.
- Two of the registered sites used for the builds. All registered sites may be read while the card parts are listed.

Out of scope:

- A full page.
- Button and hero sections, except where they sit inside the card.
- A change to the extractor. The experiment compares packages given to the agent. Changing the writer is later work, and only if section 8 recommends it.
- Publishing the Framer page.
- A usability test with visitors.

### What is already known

The points below are taken from `docs/research/card-button-hero.md`. They are the library input for SQ1. They are not a score.

- The extractor kinds are `button`, `field`, and `molecule`. There is no kind `card`.
- A molecule is a group of visible siblings with the same tag and the same ordered child tags.
- A digest node can show an image, a heading tag, supporting text, and a link. The field names media, headline, subhead, supporting text, and action are not in the digest.
- The builder is not allowed to open the live site, `structure.json`, `computed.json`, or `snapshot.html`.

The sites named for the register are Excel, Yontal, and Motive. Their URLs are not in this version. Section 6 is where they are filled in. No card on those sites has been recorded here yet.

## 3. Research question

Which structure of the digest data lets an agent create a card component section most effectively on different websites, and which structure should the builder receive?

Effective means the checklist in section 5. A structure is more effective when more applicable items pass and fewer invented parts are counted. It counts only when that result is stable on both measurement websites and in both runs. Stable means both runs pass the same items, and the invented-part counts are equal. If the counts differ, both are reported and the lower count is not used.

The terms in the question:

| Term | Meaning in this document |
| --- | --- |
| Card component section | A repeated block of cards on one page. The build is one reusable card component, with one instance per card in the data. |
| Structure | How the same observed facts are arranged in the package. S1, S2, and S3 are the planned structures. |
| Fresh context | A new agent session. It receives Appendix A and one package. It does not receive other runs, other structures, or the live site. |
| Invented part | A visible string, image, link, button, or slot in the build that the package for that run does not contain. This is the hallucination this experiment counts. |
| Measurement website | A site marked yes in section 6. Exactly two sites are marked yes before the first run. |

| # | Subquestion | Answered in |
| --- | --- | --- |
| SQ1 | Which parts of a card section are named by the existing card description and by the current digest, and which of those parts show up on the registered sites? | Section 6, after the register is filled in |
| SQ2 | Which structures are handed to the agent, and which of the observed facts does each structure include? | Section 5 for the rules, section 6 for the files |
| SQ3 | For each structure, how many applicable checklist items does a fresh agent pass, and how many invented parts does the build contain? | Section 7 |
| SQ4 | Does that score stay the same on the second measurement website and on the second run? | Section 7 |
| SQ5 | Which structure should the builder receive, and which structures can be left out? | Section 8 |

## 4. Methodology

The setup follows the DOT framework: Library, Field, Lab, Showroom, and Workshop ([ictresearchmethods.nl/dot-framework](https://ictresearchmethods.nl/dot-framework/)). The shape is the "Choose a fitting technology" pattern: see what already exists, set the criteria from the context, build small prototypes, and test them ([ictresearchmethods.nl/patterns/choose-fitting-technology](https://ictresearchmethods.nl/patterns/choose-fitting-technology/)). Showroom is not part of this experiment. That gap is stated under Limitations.

Work that has not happened is written as the procedure. The only completed step on record is the card and digest description cited in section 2.

| Strategy | Method | Subquestions | Application |
| --- | --- | --- | --- |
| Library | Available product analysis ([method](https://www.ictresearchmethods.nl/library/available-product-analysis/)) | SQ1 | Read the card anatomy and the current digest, as already summarised in section 2. List which slot names those sources use, and which of those names the digest has a field for. This step does not decide a winning structure. |
| Field | Document analysis ([method](https://ictresearchmethods.nl/field/document-analysis/)) | SQ1, SQ2 | The method names product websites as a source. Here the question is narrower than company culture: on each registered page, record one card section and its visible parts. Those notes are the only source of the facts inside the packages. A part that is not on the page is not added. |
| Workshop | Prototyping ([method](https://ictresearchmethods.nl/workshop/prototyping/)) | SQ3 | What the prototype is for: can this package rebuild the card section. For each package, a new agent builds the section in Framer from Appendix A plus that package. The branch is not reused. |
| Lab | Component test ([method](https://ictresearchmethods.nl/lab/component-test/)) | SQ3, SQ4, SQ5 | Compare the build with the checklist. The input is the package. The expected result is the slots and values recorded in section 6. Two measurement websites, two runs, a new session each time. SQ5 is written only from those scores. |

Triangulation for the conclusion: SQ1 needs the library list and the site notes. SQ3 and SQ4 need the scores. SQ5 needs both, because a checklist item applies only when the site notes say that slot is present. A conclusion from the scores alone, with an empty section 6, is not valid.

### Limitations

- The same person prepares the packages and scores the builds, and that person framed the question. The second website and the second run are the checks asked for. They do not make the scorer independent.
- Showroom is missing. No other person reviews the comparison. The pattern page names this as a weakness of stopping after the lab test.
- Two websites is a small set. A structure that passes both can fail on a third site.
- The agent model is part of the condition. The model name is written in the run log. A run on another model is void.
- The three structures were chosen for this setup. Another form, added after the first run, is a new experiment and needs a new version row.

## 5. Procedure

### Structures

Each structure is prepared for each measurement website from the same notes in section 6. The values stay the same. The arrangement changes. A structure may drop a class of facts only when section 5 says so. It may not add a fact the notes do not contain.

Example of the rule, not a site: the notes say the heading is "News". S1 stores that string on the heading node. S2 stores it under the name heading. S3 writes that the heading is "News". None of them may write "Latest news".

| Id | What the agent receives | What it does not receive |
| --- | --- | --- |
| S1 Digest | The molecule digest for that card section, and the token entries that digest points at. | Slot names such as media or heading. The live site. The other structures. |
| S2 Slots | The same text, image paths, links, and order, written as records named container, media, heading, supporting text, and action. A slot the notes mark absent is left out. | The raw digest. The live site. The other structures. |
| S3 Prose | The same text, image paths, links, and order, written in sentences. | JSON, the slot labels as field names, the live site, and the other structures. |

S1 is the baseline, because it is the package the pipeline can already write. S2 adds the slot names from section 2 and no new site facts. S3 keeps the facts and removes the field structure. A fourth structure can be added in section 6 before the first run. After the first run the list stays as it is.

The screenshot is for the scorer. The agent receives it only when the structure under test says so. None of S1, S2, or S3 includes it. Putting the screenshot into one package and not the others changes the experiment, and that change is a version-table row before the run.

### Runs

A run is one structure, one measurement website, one session.

Planned count: 3 structures × 2 websites × 2 runs = 12 builds. If a structure is added or removed before the first run, recompute this count in the version table.

Order:

1. Finish section 6. Both measurement sites have a URL, one card section, a slot inventory, and a file for S1, S2, and S3.
2. First repetition: website A, then website B. On each website, S1, then S2, then S3.
3. Second repetition, after every first run is logged: the same order, new sessions.
4. Score after the session, from the checklist, the package, and the screenshot. The agent does not score itself.

Each session is new. The session receives the task text in Appendix A and the one package for that run. It does not receive the live site, another package, or an earlier build. In Framer, the build goes on a new branch taken from that project's main, so an earlier component is not already on the page. The project name and the branch name go in the log. This document does not name the project.

Record the model name on every row. If a row has a different model, that row is void and the run is repeated on the original model.

### Checklist

The scorer uses this list. Changing it after the first run voids the runs already logged.

Section items, scored once per build:

1. The cards in the section are instances of one component. A separate unlinked frame per card fails this item.
2. The number of instances equals the number of cards in the package.

Slot items, scored per card, and only for a slot the inventory marks present:

3. The slot is present in the instance.
4. The visible text matches the package, or the image is the package's image path.
5. When the package has a link or button address for that slot, the instance uses that address.

Invented parts, counted one by one, not as a pass or fail item:

- A visible string that is not in the package.
- An image, link, or button that is not in the package.
- A slot the inventory marks absent for that card. An action added to a card that had none is this case.

Write the result as items passed, items that apply, and the invented-part count. An item that does not apply is not a failure. The inventory decides what applies.

### Decision rule

Used later in section 8. It is fixed here so the rule is not chosen after the scores.

A structure is stable on a website when both runs pass the same items and the invented-part counts are equal. It is the structure to keep when it is stable on both measurement websites, and no other stable structure passes more items or, at the same items, has fewer invented parts. If two structures tie on both counts, section 8 says they tie. If none is stable on both websites, section 8 says none of the prepared structures is enough.

## 6. Data to be prepared

No run starts while a cell in 6.1, 6.2, or 6.3 is still "to fill" for a measurement website, or while an S1, S2, or S3 file for that website is missing.

The pages are public product pages. The packages contain the card text, image paths, and links taken from the capture. They are kept with this experiment.

### 6.1 Site register

Names as given for this experiment. The URL is filled from the page that will be captured. A row without a URL is not a measurement website. Exactly two rows are marked yes.

| Site | URL | Page | How to find the card section | Measurement site | Capture folder |
| --- | --- | --- | --- | --- | --- |
| Excel | to fill | to fill | to fill | to fill | to fill |
| Yontal | to fill | to fill | to fill | to fill | to fill |
| Motive | to fill | to fill | to fill | to fill | to fill |

### 6.2 Card section notes

One row per card in the chosen section. Date is the day the page was read. "Present" is yes or no. The value is the visible text, the image path, or the address. Empty when the slot is absent.

| Site | Card | Container | Media | Heading | Supporting text | Action | Date | Screenshot |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| to fill | to fill | to fill | to fill | to fill | to fill | to fill | to fill | to fill |

SQ1 is answered from section 2 plus this table: a part can be named by Material Design 3, missing as a digest field, and present or absent on the page. Those three facts stay separate in the write-up.

### 6.3 Packages

One file per structure per measurement website. The file contains only facts from 6.2 for that website. Before the first run, each file is checked against 6.2: same strings, same image paths, same addresses, no extra fact.

| Id | Website | File | Checked against 6.2 | Ready |
| --- | --- | --- | --- | --- |
| S1 | to fill | to fill | to fill | no |
| S1 | to fill | to fill | to fill | no |
| S2 | to fill | to fill | to fill | no |
| S2 | to fill | to fill | to fill | no |
| S3 | to fill | to fill | to fill | no |
| S3 | to fill | to fill | to fill | no |

Spare row, unused unless a version row adds a structure before the first run:

| Id | Website | File | Checked against 6.2 | Ready |
| --- | --- | --- | --- | --- |
| S4 | to fill | to fill | to fill | no |

## 7. Results

No runs have been recorded. Appendix B is filled during the experiment. This section then copies the counts from Appendix C. It does not add a judgement. The judgement goes in section 8.

| Structure | Website | Run | Items passed | Items that apply | Invented parts | Stable on this website |
| --- | --- | --- | --- | --- | --- | --- |
| not run | not run | not run | not run | not run | not run | not run |

## 8. Recommendation

Answers SQ5. No overall direction yet. Section 7 has no scores, so no structure is chosen in this version.

| Finding | Evidence | Recommendation |
| --- | --- | --- |
| No builds have been scored. | Section 7, Appendix B | Do not choose a structure for the builder until Appendix B has all 12 runs and section 7 has the counts. |

### Next iteration

After the 12 runs, write the decision rule result in the table above. If the scores tie or none is stable, the next experiment is a change of structures, recorded as a new version, not a silent edit of S1, S2, or S3.

## 9. Conclusion

SQ1, SQ2, SQ3, SQ4, and SQ5 are unanswered in version 0.1. Section 6 is still empty and section 7 has no runs. After the scores, each subquestion is answered here in two or three sentences, using only sections 5 to 8, and the main question is answered last.

## 10. Expert feedback

The student writes this section after an assessor responds. This version has none.

## 11. Reflection

The student writes this section. This version has none.

## 12. Glossary

| Term | Meaning |
| --- | --- |
| Digest | One file that describes one captured component at one width and state. The contract is `docs/poc-v2/digest-contract.md`. |
| Molecule | The extractor's record for a repeated block: siblings with the same tag and the same ordered child tags. |
| Package | The files one session is allowed to read, besides the task text. |
| Fresh context | Defined in section 3. |
| Invented part | Defined in section 3. |
| Measurement website | Defined in section 3. |

## Appendix A. Task text

The same text is sent every run. The package for that run is attached with it. Nothing else is attached.

```
Build one card component section from the data attached to this message.
Use one reusable card component, and place one instance for each card in the data.
Use only the text, images, links, and order in the data.
Do not add a part the data does not contain.
Do not open the source website.
Do not use files other than this data.
```

## Appendix B. Run log

One row per session. A void row stays in the log with the reason, and the repeated session is a new row.

| Run | Structure | Website | Repetition | Model | Framer project | Branch | Started | Stopped | Void |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| to fill | to fill | to fill | to fill | to fill | to fill | to fill | to fill | to fill | to fill |

## Appendix C. Score sheet

One row per card per run for the slot items, and one row per run for the two section items. Invented parts are listed, not folded into a pass.

| Run | Card or section | Item | Applies | Pass or fail | Invented part, if this row is one |
| --- | --- | --- | --- | --- | --- |
| to fill | to fill | to fill | to fill | to fill | to fill |
