---
name: collect-page
description: Captures one public page at one width, writes the capture files, then writes schema 2.0.0 digests and the design-token file in this repo. Use when asked to collect, capture, digest, or write design tokens for a public page. Does not open Framer and does not define sections.
---

# Collect a page

Capture once. Derive tokens and digests from the files just written. Do not open Framer. Do not write a section prompt.

## Inputs

The parent gives you a URL and one width. Default width is 1200. Height is 900. State is `default`.

## Commands

Run the capture first. After it returns, run the token command, then the digest command with `--tokens` pointing at the token file. Do not run them at the same time.

```bash
npm run extract:generic -- <url> --widths <width> --height 900 --components all
```

`<slug>` comes from the URL path unless you passed `--slug`. Capture folder: `Database/digest/nesting/<slug>/<width>/default/`.

```bash
node --import tsx scripts/design-tokens/cli.ts \
  --structure Database/digest/nesting/<slug>/<width>/default/structure.json \
  --computed Database/digest/nesting/<slug>/<width>/default/computed.json
```

```bash
node --import tsx scripts/digest/cli.ts \
  --structure Database/digest/nesting/<slug>/<width>/default/structure.json \
  --computed Database/digest/nesting/<slug>/<width>/default/computed.json \
  --all \
  --tokens Database/digest/tokens/<slug>/<width>/tokens.json \
  --screenshot Database/Screenshots/<slug>/<width>/default/screenshot.png
```

`--all` writes every button, field, and section digest, plus `digests/index.json`, in one process. Do not start one process per digest.

The capture dismisses a cookie banner before it reads CSS. A banner with no dismiss control fails the run. Do not capture a second width. `--sections` is ignored.

## Files

The capture writes, inside the capture folder: `structure.json`, `computed.json`, `components.json`, `assets.json`, and `assets/`. It also writes `Database/Screenshots/<slug>/<width>/default/screenshot.png` and `Database/snapshots/<slug>/<width>/default/snapshot.html`.

Then the two commands write `Database/digest/tokens/<slug>/<width>/tokens.json` and `Database/digest/nesting/<slug>/<width>/default/digests/index.json`.

`index.json` lists each digest id, type, file name, and root ids. Later agents start there.

Breakpoint notes on `structure.json` are media queries plus any stylesheet that could not be read. They do not add widths.

## Subagents

Run the token command first, then digest `--all` with `--tokens` pointing at the token file. Do not run them at the same time. Do not spawn a subagent to run them. If validation fails, fix the generator and run the command again. Do not hand-edit JSON.

## Done

`npm test` passes, or you report the failing test name. Then report the URL, slug, width, token path, digest index path, screenshot path, digest count, colour count, and text-style count.

## Forbidden

Framer, a second capture, `sections-prompt.md`, and reading `scripts/generic-extractor/cli.ts` or `scripts/digest/cli.ts` unless a flag in this card fails.
