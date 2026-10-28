import { readFile, writeFile } from "node:fs/promises"
import { parseArgs } from "node:util"
import { generateDigest, type ComputedStyle, type StructureNode, type Warning } from "./generate.ts"
import { DigestValidationError, validateDigest } from "./schema.ts"

const USAGE = `node --import tsx scripts/digest/cli.ts --structure <structure.json> --computed <computed.json> --component-id <id> --component-type <type> --root <nodeId> --out <digest.json>
  [--root <nodeId>] [--url <url>] [--final-url <url>] [--language <tag>] [--timestamp <iso>]
  [--capture-id <id>] [--state <state>] [--viewport <width>x<height>] [--screenshot <path>]
  [--config <key=value>]

Writes one schema 2.0.0 digest for the component roots. Does not modify package.json scripts.
Validation failures are printed and no file is written.`

const { values } = parseArgs({
  options: {
    structure: { type: "string" },
    computed: { type: "string" },
    "component-id": { type: "string" },
    "component-type": { type: "string" },
    root: { type: "string", multiple: true },
    out: { type: "string" },
    url: { type: "string" },
    "final-url": { type: "string" },
    language: { type: "string" },
    timestamp: { type: "string" },
    "capture-id": { type: "string" },
    state: { type: "string" },
    viewport: { type: "string" },
    screenshot: { type: "string" },
    config: { type: "string", multiple: true },
    help: { type: "boolean", short: "h" },
  },
})

if (values.help) {
  console.log(USAGE)
  process.exit(0)
}

if (!values.structure || !values.computed || !values["component-id"] || !values["component-type"] || !values.root?.length || !values.out) {
  console.error(USAGE)
  process.exit(1)
}

const structure = JSON.parse(await readFile(values.structure, "utf8")) as {
  url?: string
  slug?: string
  viewport?: { width: number; height: number } | null
  state?: string
  nodes: Record<string, StructureNode>
  warnings?: Warning[]
}
const computed = JSON.parse(await readFile(values.computed, "utf8")) as {
  nodes?: Record<string, ComputedStyle>
  skipped?: { nodeId?: string; reason?: string }[]
  unresolved?: { nodeId?: string; selector?: string; matches?: number }[]
}
const viewport = values.viewport ? values.viewport.split("x").map(Number) : undefined
const config: Record<string, string | number | boolean> = {
  structurePath: values.structure,
  computedPath: values.computed,
}
for (const pair of values.config ?? []) {
  const index = pair.indexOf("=")
  if (index <= 0) {
    console.error(`Invalid --config ${pair}; expected key=value`)
    process.exit(1)
  }
  config[pair.slice(0, index)] = pair.slice(index + 1)
}

const digest = generateDigest({
  capture: {
    captureId: values["capture-id"],
    url: values.url,
    finalUrl: values["final-url"],
    language: values.language,
    timestamp: values.timestamp,
    state: values.state,
    viewport: viewport && Number.isFinite(viewport[0]) && Number.isFinite(viewport[1]) ? { width: viewport[0], height: viewport[1] } : undefined,
    config,
  },
  structure,
  computed,
  component: { id: values["component-id"], type: values["component-type"], rootIds: values.root },
  evidence: { screenshot: values.screenshot ? { path: values.screenshot } : undefined },
})

try {
  validateDigest(digest)
} catch (error) {
  if (error instanceof DigestValidationError) {
    console.error(error.errors.join("\n"))
    process.exit(1)
  }
  throw error
}

await writeFile(values.out, `${JSON.stringify(digest, null, 2)}\n`)
console.log(`${values.out}`)
