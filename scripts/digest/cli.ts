import { mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { parseArgs } from "node:util"
import { readAssetEvidence } from "../generic-extractor/assets.ts"
import { applyTokenNames, generateDigest, type ComputedStyle, type DigestInput, type StructureNode, type TokenNameSource, type Warning } from "./generate.ts"
import { planDigestJobs } from "./jobs.ts"
import { DigestValidationError, validateDigest } from "./schema.ts"

const USAGE = `node --import tsx scripts/digest/cli.ts --structure <structure.json> --computed <computed.json> --component-id <id> --component-type <type> --root <nodeId> --out <digest.json>
  [--root <nodeId>] [--url <url>] [--final-url <url>] [--language <tag>] [--timestamp <iso>]
  [--capture-id <id>] [--state <state>] [--viewport <width>x<height>] [--screenshot <path>]
  [--tokens <tokens.json>] [--config <key=value>]

node --import tsx scripts/digest/cli.ts --all --structure <structure.json> --computed <computed.json>
  [--out <directory>] [--url <url>] [--final-url <url>] [--capture-id <id>] [--state <state>]
  [--viewport <width>x<height>] [--screenshot <path>] [--tokens <tokens.json>] [--config <key=value>]

Single mode writes one schema 2.0.0 digest for the component roots.
--all reads components.json beside the structure file and structure.sectionCandidates,
then writes <directory>/<id>.json and <directory>/index.json. The default directory is <structure dir>/digests.
Does not modify package.json scripts.
When assets.json sits beside the structure file, those local paths are recorded as usablePath.
--tokens, when the file exists, copies matching token names onto proposal.name. Local token ids stay.
Single-mode validation failures are printed and no file is written.
--all prints the id and errors for a failed digest, still writes the valid ones, and exits 1.`

const { values } = parseArgs({
  options: {
    all: { type: "boolean" },
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
    tokens: { type: "string" },
    config: { type: "string", multiple: true },
    help: { type: "boolean", short: "h" },
  },
})

if (values.help) {
  console.log(USAGE)
  process.exit(0)
}

const batch = values.all === true
if (!values.structure || !values.computed || (!batch && (!values["component-id"] || !values["component-type"] || !values.root?.length || !values.out))) {
  console.error(USAGE)
  process.exit(1)
}

const structurePath = values.structure
const computedPath = values.computed

type StructureFile = {
  url?: string
  slug?: string
  viewport?: { width: number; height: number } | null
  state?: string
  nodes: Record<string, StructureNode>
  warnings?: Warning[]
  sectionCandidates?: { id: string; rootIds: string[] }[]
}

const structure = JSON.parse(await readFile(structurePath, "utf8")) as StructureFile
const computed = JSON.parse(await readFile(computedPath, "utf8")) as {
  nodes?: Record<string, ComputedStyle>
  skipped?: { nodeId?: string; reason?: string }[]
  unresolved?: { nodeId?: string; selector?: string; matches?: number }[]
}
const viewport = values.viewport ? values.viewport.split("x").map(Number) : undefined
const config: Record<string, string | number | boolean> = {}
for (const pair of values.config ?? []) {
  const index = pair.indexOf("=")
  if (index <= 0) {
    console.error(`Invalid --config ${pair}; expected key=value`)
    process.exit(1)
  }
  config[pair.slice(0, index)] = pair.slice(index + 1)
}

let tokenNames: TokenNameSource | undefined
if (values.tokens) {
  try {
    const parsed = JSON.parse(await readFile(values.tokens, "utf8")) as unknown
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      console.error(`Tokens file ${values.tokens} is not an object`)
      process.exit(1)
    }
    tokenNames = parsed as TokenNameSource
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      console.error(`Missing tokens file ${values.tokens}`)
      process.exit(1)
    }
    throw error
  }
}

const suppliedAssets = await readAssetEvidence(structurePath)
const evidence: DigestInput["evidence"] = {
  ...(values.screenshot ? { screenshot: { path: values.screenshot } } : {}),
  ...(suppliedAssets ? { assets: suppliedAssets } : {}),
}
const capture: DigestInput["capture"] = {
  captureId: values["capture-id"],
  url: values.url,
  finalUrl: values["final-url"],
  language: values.language,
  timestamp: values.timestamp,
  state: values.state,
  viewport: viewport && Number.isFinite(viewport[0]) && Number.isFinite(viewport[1]) ? { width: viewport[0], height: viewport[1] } : undefined,
  config,
}

if (batch) {
  const componentsPath = join(dirname(structurePath), "components.json")
  let components: { records?: { id: string; kind: string; nodeId: string }[] }
  try {
    components = JSON.parse(await readFile(componentsPath, "utf8")) as { records?: { id: string; kind: string; nodeId: string }[] }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      console.error(`Missing components file ${componentsPath}`)
      process.exit(1)
    }
    throw error
  }
  const jobs = planDigestJobs(structure, components)
  const dir = values.out ?? join(dirname(structurePath), "digests")
  await mkdir(dir, { recursive: true })
  const written: { id: string; type: string; file: string; rootIds: string[] }[] = []
  let failed = false
  for (const job of jobs) {
    try {
      const digest = generateDigest({
        capture,
        structure,
        computed,
        component: { id: job.id, type: job.type, rootIds: job.rootIds },
        evidence,
      })
      if (tokenNames) applyTokenNames(digest, tokenNames)
      validateDigest(digest)
      const file = `${job.id}.json`
      await writeFile(join(dir, file), `${JSON.stringify(digest, null, 2)}\n`)
      written.push({ id: job.id, type: job.type, file, rootIds: job.rootIds })
    } catch (error) {
      failed = true
      console.error(job.id)
      if (error instanceof DigestValidationError) console.error(error.errors.join("\n"))
      else console.error(error instanceof Error ? error.message : String(error))
    }
  }
  await writeFile(join(dir, "index.json"), `${JSON.stringify({ digests: written }, null, 2)}\n`)
  if (failed) process.exit(1)
  console.log(dir)
} else {
  const digest = generateDigest({
    capture,
    structure,
    computed,
    component: { id: values["component-id"]!, type: values["component-type"]!, rootIds: values.root! },
    evidence,
  })
  if (tokenNames) applyTokenNames(digest, tokenNames)

  try {
    validateDigest(digest)
  } catch (error) {
    if (error instanceof DigestValidationError) {
      console.error(error.errors.join("\n"))
      process.exit(1)
    }
    throw error
  }

  await writeFile(values.out!, `${JSON.stringify(digest, null, 2)}\n`)
  console.log(values.out)
}
