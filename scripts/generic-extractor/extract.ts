import { readFileSync } from "node:fs"
import type { Page } from "@playwright/test"
import { buildSections, proposeSectionRoots, sectionCoverage } from "./sections.ts"
import { simplify } from "./simplify.ts"

export type Box = { x: number; y: number; width: number; height: number }
export type DomNode = {
  tag: string
  domId: string
  classes: string[]
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
export type ExtractOptions = { slug: string; state?: string; maxNodes?: number; sectionOverrides?: string[][] }

type Collected = {
  layoutWidth: number
  roots: string[]
  nodes: Nodes
  registry: { id: string; selector: string }[]
  excluded: { selector: string; tag: string; reason: string }[]
  locatorFailures: { id: string; selector: string; matches: number }[]
  boundaries: string[]
  overrides: { selector: string; id: string | null; matches: number }[][]
  overflow: boolean
  elementCount: number
  fingerprint: string
}

const BROWSER_SRC = readFileSync(new URL("./browser.js", import.meta.url), "utf8")

export function callBrowser<T = unknown>(page: Page, fn: string, arg: unknown = null): Promise<T> {
  return page.evaluate(`(${BROWSER_SRC}).${fn}(${JSON.stringify(arg)})`) as Promise<T>
}

export async function extract(page: Page, opts: ExtractOptions) {
  const maxNodes = opts.maxNodes ?? 0
  const raw = await callBrowser<Collected>(page, "collect", { maxNodes, overrides: opts.sectionOverrides ?? [] })

  if (raw.overflow) {
    return {
      pendingDecision: {
        limit: "maxNodes",
        value: maxNodes,
        elementsInDocument: raw.elementCount,
        affected: `The page has up to ${raw.elementCount} elements; every element after the first ${maxNodes} in DOM order would be missing from the full tree, reconstruction tree, locator registry and section candidates.`,
        options: [
          `Re-run with --max-nodes ${raw.elementCount} (or 0 for no limit) to extract the full tree`,
          "Keep the limit and stop: no output is written for this page until a designer decides",
        ],
      },
    }
  }

  const { nodes, roots } = raw
  const warnings: Warning[] = [
    ...raw.locatorFailures.map((f) => ({ code: "locator-unresolved", message: `${f.selector} matched ${f.matches} elements`, nodeIds: [f.id] })),
    ...raw.boundaries.map((id) => ({ code: "unsupported-boundary", message: `${nodes[id].boundary} content was not traversed`, nodeIds: [id] })),
  ]

  let groups: string[][]
  if (raw.overrides.length) {
    groups = []
    for (const group of raw.overrides) {
      const missing = group.filter((g) => !g.id)
      if (missing.length) warnings.push({ code: "override-unresolved", message: `Section override skipped; ${missing.map((m) => `${m.selector} matched ${m.matches}`).join(", ")}` })
      else groups.push(group.map((g) => g.id!))
    }
  } else groups = proposeSectionRoots(nodes, roots)

  const sectionCandidates = buildSections(nodes, groups, raw.layoutWidth, raw.overrides.length ? "approved" : "needs-review")
  const { shellIds, unassignedIds } = sectionCoverage(nodes, roots, sectionCandidates)
  if (unassignedIds.length) warnings.push({ code: "section-unassigned", message: "Elements outside every section candidate and the page shell", nodeIds: unassignedIds })

  const reconstruction = simplify(nodes, roots, sectionCandidates)
  const structure = {
    url: page.url(),
    slug: opts.slug,
    viewport: page.viewportSize(),
    state: opts.state ?? "default",
    roots,
    nodes,
    sectionCandidates,
    sectionShell: shellIds,
    warnings,
  }
  const report = {
    counts: {
      included: Object.keys(nodes).length,
      excluded: raw.excluded.length,
      locatorFailures: raw.locatorFailures.length,
      boundaries: raw.boundaries.length,
      sectionCandidates: sectionCandidates.length,
      needsReview: sectionCandidates.filter((c) => c.status === "needs-review").length,
      droppedFromReconstruction: reconstruction.dropped.length,
    },
    excluded: raw.excluded,
    locatorFailures: raw.locatorFailures,
    boundaries: raw.boundaries.map((id) => ({ nodeId: id, kind: nodes[id].boundary, box: nodes[id].box, untraversedChildren: nodes[id].untraversedChildren ?? 0 })),
    warnings,
  }
  return { registry: raw.registry, structure, reconstruction, report, fingerprint: raw.fingerprint }
}
