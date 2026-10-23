import { mkdir, readFile, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { parseArgs } from "node:util"
import { chromium } from "@playwright/test"
import { callBrowser, extract } from "./extract.ts"
import { proposeMatches } from "./match.ts"

const USAGE = `Usage: npm run extract:generic -- <url> [--widths 1440,390] [--height 900] [--slug name]
  [--out Database] [--max-nodes 0] [--settle-timeout 10000] [--sections overrides.json]
  overrides.json: { "<width>": [["<selector>", ...], ...] }  (one inner array per approved clip)`

const { values: o, positionals: [url] } = parseArgs({
  allowPositionals: true,
  options: {
    widths: { type: "string", default: "1440,390" },
    height: { type: "string", default: "900" },
    slug: { type: "string" },
    out: { type: "string", default: "Database" },
    "max-nodes": { type: "string", default: "0" },
    "settle-timeout": { type: "string", default: "10000" },
    sections: { type: "string" },
  },
})
if (!url) {
  console.error(USAGE)
  process.exit(1)
}

const widths = o.widths.split(",").map(Number)
const height = Number(o.height)
const maxNodes = Number(o["max-nodes"])
const slug = o.slug ?? (new URL(url).pathname.replace(/^\/|\/$/g, "").replaceAll("/", "--") || "home")
const overrides: Record<string, string[][]> = o.sections ? JSON.parse(await readFile(o.sections, "utf8")) : {}
const nestingDir = (width: number) => join(o.out, "digest", "nesting", slug, String(width), "default")
const shotDir = (width: number) => join(o.out, "Screenshots", slug, String(width), "default")
const snapDir = (width: number) => join(o.out, "snapshots", slug, String(width), "default")

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: widths[0], height } })

async function captureState(width: number) {
  for (let attempt = 1; ; attempt++) {
    const result = await extract(page, { slug, maxNodes, sectionOverrides: overrides[width] })
    if (result.pendingDecision) return result
    const targets = Object.entries(result.structure.nodes).map(([id, n]) => ({ id, selector: n.selector, parentId: n.parentId }))
    const styles = await callBrowser<{ nodes: Record<string, unknown>; skipped: unknown[]; unresolved: unknown[] }>(page, "computed", targets)
    const computed = { url: result.structure.url, slug, width, state: result.structure.state, ...styles }
    const screenshot = await page.screenshot({ fullPage: true })
    const snapshot = await page.content()
    const stable = (await callBrowser<string>(page, "fingerprint")) === result.fingerprint
    if (stable || attempt === 3) {
      if (!stable) result.structure.warnings.push({ code: "dom-changed", message: "DOM changed between extraction and screenshot on 3 attempts; tree and screenshot may differ" })
      return { ...result, computed, screenshot, snapshot }
    }
  }
}

try {
  await page.goto(url, { waitUntil: "load", timeout: 60_000 })
  const captures = []
  for (const width of widths) {
    await page.setViewportSize({ width, height })
    const settled = await callBrowser<{ timedOut: boolean; pendingImages: number }>(page, "settle", Number(o["settle-timeout"]))
    const result = await captureState(width)
    if (result.pendingDecision) {
      const file = join(nestingDir(width), "pending-decision.json")
      await mkdir(nestingDir(width), { recursive: true })
      await writeFile(file, JSON.stringify(result.pendingDecision, null, 2))
      console.error(`Stopped at ${width}px. ${result.pendingDecision.affected}\nDesigner decision needed, nothing final written: ${file}`)
      process.exitCode = 2
      break
    }
    if (settled.timedOut)
      result.structure.warnings.push({ code: "settle-timeout", message: `Readiness not reached within ${o["settle-timeout"]}ms; ${settled.pendingImages} images still loading` })

    const { nodes, sectionCandidates } = result.structure
    await callBrowser(page, "overlay", sectionCandidates.map((c) => ({ label: `${c.id} ${c.kind}`, boxes: c.rootIds.map((id) => nodes[id].box) })))
    const preview = await page.screenshot({ fullPage: true })
    await callBrowser(page, "removeOverlay")
    captures.push({ width, result, preview })
  }

  if (!process.exitCode) {
    for (const { width, result, preview } of captures) {
      const nesting = nestingDir(width)
      const shots = shotDir(width)
      const snaps = snapDir(width)
      await mkdir(nesting, { recursive: true })
      await mkdir(shots, { recursive: true })
      await mkdir(snaps, { recursive: true })
      const json = (name: string, data: unknown) => writeFile(join(nesting, name), JSON.stringify(data, null, 2))
      await Promise.all([
        json("elements.json", result.registry),
        json("structure.json", result.structure),
        json("computed.json", result.computed),
        json("reconstruction.json", result.reconstruction),
        json("report.json", result.report),
        writeFile(join(shots, "screenshot.png"), result.screenshot),
        writeFile(join(shots, "sections-preview.png"), preview),
        writeFile(join(snaps, "snapshot.html"), result.snapshot),
      ])
      const { counts } = result.report
      console.log(`${width}px: ${counts.included} elements, ${counts.sectionCandidates} section candidates, ${result.report.warnings.length} warnings -> ${nesting}`)
    }
    if (captures.length > 1) {
      const matches = proposeMatches(captures.map((c) => ({ width: c.width, nodes: c.result.structure.nodes })))
      const matchFile = join(o.out, "digest", "nesting", slug, "matches.proposed.json")
      await mkdir(join(o.out, "digest", "nesting", slug), { recursive: true })
      await writeFile(matchFile, JSON.stringify(matches, null, 2))
      console.log(`${matches.proposals.length} cross-width match proposals -> ${matchFile}`)
    }
  }
} finally {
  await browser.close()
}
