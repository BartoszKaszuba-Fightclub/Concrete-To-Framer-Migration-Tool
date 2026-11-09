# Concrete to Framer migration tool

What changed since the first proof of concept is in [changelog/poc-version-2.md](changelog/poc-version-2.md).

## Setup

Requires Node.js 22 or newer.

```bash
npm install
npx @framer/agent setup
```

`npm install` adds the `@framer/agent` CLI to this project. `setup` installs the Framer skills into your home directory (`~/.agents/skills` and `~/.claude/skills`) so your local agent can use them. Each person runs `setup` once on their own machine.
