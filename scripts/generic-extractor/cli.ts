import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { parseArgs } from "node:util"
import { chromium } from "@playwright/test"
import { fetchPageAsset, mediaReferences, saveCaptureAssets } from "./assets.ts"
import { callBrowser, extract } from "./extract.ts"
import { DEFAULT_CAPTURE_HEIGHT, DEFAULT_CAPTURE_STATE, selectCaptureWidth } from "./width.ts"

const USAGE = `Usage: npm run extract:generic -- <url> [--widths 1200] [--height 900] [--slug name]
  [--out Database] [--max-nodes 0] [--settle-timeout 10000] [--components all|button|field]
  One width is captured. Extra --widths values are ignored with a warning. Default is 1200×900, state default.`

const { values: o, positionals: [url] } = parseArgs({
  allowPositionals: true,
  options: {
    widths: { type: "string" },
    height: { type: "string", default: String(DEFAULT_CAPTURE_HEIGHT) },
    slug: { type: "string" },
    out: { type: "string", default: "Database" },
    "max-nodes": { type: "string", default: "0" },
    "settle-timeout": { type: "string", default: "10000" },
    sections: { type: "string" },
    components: { type: "string", default: "all" },
  },
})
if (!url) {
  console.error(USAGE)
  process.exit(1)
}
const componentFilter = o.components
if (componentFilter !== "all" && componentFilter !== "button" && componentFilter !== "field") {
  console.error("`--components` must be all, button, or field")
  process.exit(1)
}
if (o.sections) console.warn("--sections is ignored. Sections are selected automatically and clip approval files are not read.")

const selection = selectCaptureWidth(o.widths)
if (selection.warning) console.warn(selection.warning)
const height = Number(o.height)
const maxNodes = Number(o["max-nodes"])
const slug = o.slug ?? (new URL(url).pathname.replace(/^\/|\/$/g, "").replaceAll("/", "--") || "home")
const nestingDir = join(o.out, "digest", "nesting", slug, String(selection.selectedWidth), DEFAULT_CAPTURE_STATE)
const shotDir = join(o.out, "Screenshots", slug, String(selection.selectedWidth), DEFAULT_CAPTURE_STATE)
const snapDir = join(o.out, "snapshots", slug, String(selection.selectedWidth), DEFAULT_CAPTURE_STATE)

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: selection.selectedWidth, height } })

try {
  await page.goto(url, { waitUntil: "load", timeout: 60_000 })
  const consent = await callBrowser<{ blocked: boolean; reason: string }>(page, "dismissConsent")
  if (consent.blocked) {
    console.error(`Capture failed: ${consent.reason}`)
    process.exitCode = 1
  } else {
    const settled = await callBrowser<{ timedOut: boolean; pendingImages: number }>(page, "settle", Number(o["settle-timeout"]))
    const overlay = await callBrowser<{ blocked: boolean }>(page, "overlayState")
    if (overlay.blocked) {
      console.error("Capture failed: blocking overlay remained after settle")
      process.exitCode = 1
    } else {
      const discovered = await callBrowser<{ discovered: { media: string; pixels: number[]; href: string | null }[]; inaccessible: { href: string | null; reason: string }[] }>(page, "discoverBreakpoints")
      const breakpoints = { selectedWidth: selection.selectedWidth, ignoredWidths: selection.ignoredWidths, ...discovered }
      let result = null
      for (let attempt = 1; attempt <= 3; attempt++) {
        result = await extract(page, {
          slug,
          maxNodes,
          state: DEFAULT_CAPTURE_STATE,
          componentFilter,
          viewport: { width: selection.selectedWidth, height },
          breakpoints,
          widthWarning: selection.warning,
        })
        if (result.pendingDecision || result.missingMeasurements.length) break
        const stable = (await callBrowser<string>(page, "fingerprint")) === result.fingerprint
        if (stable || attempt === 3) {
          if (!stable) result.structure.warnings.push({ code: "dom-changed", message: "DOM changed between extraction and screenshot on 3 attempts; tree and screenshot may differ" })
          break
        }
      }
      if (!result) {
        process.exitCode = 1
      } else if (result.pendingDecision) {
        console.error(result.pendingDecision.affected)
        process.exitCode = 1
      } else if (result.missingMeasurements.length) {
        console.error(`Capture failed: missing required measurements for ${result.missingMeasurements.map((gap) => gap.nodeId).join(", ")}`)
        process.exitCode = 1
      } else {
        if (settled.timedOut)
          result.structure.warnings.push({ code: "settle-timeout", message: `Readiness not reached within ${o["settle-timeout"]}ms; ${settled.pendingImages} images still loading` })
        const screenshot = await page.screenshot({ fullPage: true })
        const snapshot = await page.content()
        await mkdir(nestingDir, { recursive: true })
        await mkdir(shotDir, { recursive: true })
        await mkdir(snapDir, { recursive: true })
        const urls = [...new Set(mediaReferences(result.structure.nodes).map((ref) => ref.originalUrl))]
        const measured = urls.length
          ? await callBrowser<{ url: string; naturalWidth?: number; naturalHeight?: number }[]>(page, "measureAssetSizes", urls)
          : []
        const saved = await saveCaptureAssets({
          nodes: result.structure.nodes,
          directory: join(nestingDir, "assets"),
          pathRoot: process.cwd(),
          baseUrl: page.url(),
          fetchAsset: (assetUrl) => fetchPageAsset(page, assetUrl),
          sizes: new Map(measured.map((item) => [item.url, item])),
        })
        result.structure.warnings.push(...saved.warnings)
        const json = (name: string, data: unknown) => writeFile(join(nestingDir, name), JSON.stringify(data, null, 2))
        await Promise.all([
          json("structure.json", result.structure),
          json("computed.json", result.computed),
          json("reconstruction.json", result.reconstruction),
          json("components.json", result.components),
          json("signatures.json", result.signatures),
          json("assets.json", saved.assets),
          writeFile(join(shotDir, "screenshot.png"), screenshot),
          writeFile(join(snapDir, "snapshot.html"), snapshot),
        ])
        console.log(`${selection.selectedWidth}px: ${Object.keys(result.structure.nodes).length} elements, ${result.structure.sectionCandidates.length} sections, ${result.components.records.length} components -> ${nestingDir}`)
      }
    }
  }
} finally {
  await browser.close()
}
