import { mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { parseArgs } from "node:util"
import { collectTokens, type ComputedStyle, type StructureNode } from "./collect.ts"
import { TokenValidationError, validateTokens } from "./schema.ts"

const USAGE = `node --import tsx scripts/design-tokens/cli.ts --structure <structure.json> --computed <computed.json> [--language nl] [--out <tokens.json>]

Reads one capture and writes a design-token rebuild document.
Default output: Database/digest/tokens/<slug>/<width>/tokens.json
Validation failures are printed and no file is written.`

const { values } = parseArgs({
  options: {
    structure: { type: "string" },
    computed: { type: "string" },
    language: { type: "string" },
    out: { type: "string" },
    help: { type: "boolean", short: "h" },
  },
})

if (values.help) {
  console.log(USAGE)
  process.exit(0)
}

if (!values.structure || !values.computed) {
  console.error(USAGE)
  process.exit(1)
}

const structure = JSON.parse(await readFile(values.structure, "utf8")) as {
  url?: string
  slug?: string
  state?: string
  viewport?: { width?: number; height?: number } | null
  nodes?: Record<string, StructureNode>
}
const computed = JSON.parse(await readFile(values.computed, "utf8")) as {
  url?: string
  slug?: string
  width?: number | null
  state?: string
  nodes?: Record<string, ComputedStyle>
  skipped?: { nodeId?: string; reason?: string }[]
}

const tokens = collectTokens({ structure, computed, language: values.language ?? "nl" })
try {
  validateTokens(tokens)
} catch (error) {
  if (error instanceof TokenValidationError) {
    console.error(error.errors.join("\n"))
    process.exit(1)
  }
  throw error
}

const source = tokens.source as { slug: string; viewport: { width: number } }
const out = values.out ?? join("Database", "digest", "tokens", source.slug, String(source.viewport.width), "tokens.json")
await mkdir(dirname(out), { recursive: true })
await writeFile(out, `${JSON.stringify(tokens, null, 2)}\n`)
const counts = {
  colours: (tokens.colours as unknown[]).length,
  textStyles: (tokens.textStyles as unknown[]).length,
  spacing: (tokens.spacing as unknown[]).length,
  borders: (tokens.borders as unknown[]).length,
  radii: (tokens.radii as unknown[]).length,
  shadows: (tokens.shadows as unknown[]).length,
}
console.log(`${out} ${JSON.stringify(counts)}`)
