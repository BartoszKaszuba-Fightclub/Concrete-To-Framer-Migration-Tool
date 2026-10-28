import { readFileSync } from "node:fs"
import type { Page } from "@playwright/test"
import { buildComponentInventory, missingMeasurements, type ComponentFilter } from "./components.ts"
import { buildSections, proposeSectionRoots, sectionCoverage } from "./sections.ts"
import { simplify } from "./simplify.ts"
import { DEFAULT_CAPTURE_STATE, type WidthSelection } from "./width.ts"

export type Box = { x: number; y: number; width: number; height: number }
export type DomNode = {
  tag: string
  domId: string
  classes: string[]
  role?: string
  selector: string
  parentId: string | null
  order: number
  children: string[]
  box: Box
  render: { display: string; visibility: string; opacity: string; position: string }
  traits: string[]
  content?: (string | { id: string })[]
  field?: Record<string, string | boolean>
  media?: { kind: string; url: string }[]
  boundary?: string
  untraversedChildren?: number
  markup?: string
}
export type Nodes = Record<string, DomNode>
export type Warning = { code: string; message: string; nodeIds?: string[] }
export type BreakpointDiscovery = {
  discovered: { media: string; pixels: number[]; href: string | null }[]
  inaccessible: { href: string | null; reason: string }[]
}
export type ExtractOptions = {
  slug: string
  state?: string
  maxNodes?: number
  componentFilter?: ComponentFilter
  viewport?: { width: number; height: number }
  breakpoints?: BreakpointDiscovery & Pick<WidthSelection, "selectedWidth" | "ignoredWidths">
  widthWarning?: string
}

type Collected = {
  layoutWidth: number
  roots: string[]
  nodes: Nodes
  computed: Record<string, Record<string, unknown>>
  excluded: { selector: string; tag: string; reason: string }[]
  boundaries: string[]
  overflow: boolean
  elementCount: number
  fingerprint: string
}

const BROWSER_SRC = readFileSync(new URL("./browser.js", import.meta.url), "utf8")

export function callBrowser<T = unknown>(page: Page, fn: string, arg: unknown = null): Promise<T> {
  return page.evaluate(`(${BROWSER_SRC}).${fn}(${JSON.stringify(arg)})`) as Promise<T>
}

// Structure, geometry, and computed style come from one settled traversal (collect).
export async function extract(page: Page, opts: ExtractOptions) {
  const maxNodes = opts.maxNodes ?? 0
  const filter = opts.componentFilter ?? "all"
  const raw = await callBrowser<Collected>(page, "collect", { maxNodes })

  if (raw.overflow) {
    return {
      pendingDecision: {
        limit: "maxNodes",
        value: maxNodes,
        elementsInDocument: raw.elementCount,
        affected: `The page has up to ${raw.elementCount} elements; every element after the first ${maxNodes} in DOM order would be missing from the capture.`,
        options: [`Re-run with --max-nodes ${raw.elementCount} (or 0 for no limit) to extract the full tree`, "Keep the limit and stop without writing a capture"],
      },
      missingMeasurements: [] as { nodeId: string; reason: "missing-measurement" }[],
    }
  }

  const { nodes, roots } = raw
  const warnings: Warning[] = raw.boundaries.map((id) => ({ code: "unsupported-boundary", message: `${nodes[id].boundary} content was not traversed`, nodeIds: [id] }))
  if (opts.widthWarning) warnings.push({ code: "widths-ignored", message: opts.widthWarning })

  const groups = proposeSectionRoots(nodes, roots)
  const sectionCandidates = buildSections(nodes, groups, raw.layoutWidth)
  const { shellIds, unassignedIds } = sectionCoverage(nodes, roots, sectionCandidates)
  if (unassignedIds.length) warnings.push({ code: "section-unassigned", message: "Elements outside every section and the page shell", nodeIds: unassignedIds })

  const reconstruction = simplify(nodes, roots, sectionCandidates)
  const viewport = opts.viewport ?? page.viewportSize()
  const state = opts.state ?? DEFAULT_CAPTURE_STATE
  const structure = {
    url: page.url(),
    slug: opts.slug,
    viewport,
    state,
    metadata: {
      state,
      viewport,
      breakpoints: opts.breakpoints ?? null,
    },
    roots,
    nodes,
    sectionCandidates,
    sectionShell: shellIds,
    warnings,
  }
  const computed = { url: structure.url, slug: opts.slug, width: viewport?.width ?? null, state, nodes: raw.computed, skipped: [] as unknown[], unresolved: [] as unknown[] }
  const gaps = missingMeasurements(nodes, raw.computed)
  const inventory = buildComponentInventory(nodes, sectionCandidates, raw.computed, filter)
  return {
    pendingDecision: null,
    missingMeasurements: gaps,
    structure,
    reconstruction,
    computed,
    components: { filter: inventory.filter, records: inventory.records, blockers: inventory.blockers },
    signatures: { definitions: inventory.definitions },
    fingerprint: raw.fingerprint,
  }
}
