# Concrete to Framer migration tool

What changed since the first proof of concept is in [changelog/poc-version-2.md](changelog/poc-version-2.md).

## Setup

Requires Node.js 22 or newer.

```bash
npm install
```

Capture, tokens, and digests are npm and Node commands. Framer edits go through the Framer MCP server in `.cursor/mcp.json`. Pipeline directions are the four files in `.cursor/SKILLS/`.

## Tests

```bash
npm test
```

That runs the extractor, digest, and design-token suites. Extractor tests launch Chromium.
