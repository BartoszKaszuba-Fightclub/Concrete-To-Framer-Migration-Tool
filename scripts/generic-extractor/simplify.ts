import type { DomNode, Nodes } from "./extract.ts"
import type { SectionCandidate } from "./sections.ts"

type ReconstructionNode = { sourceIds: string[]; tag: string; children: string[] }

export type ProvenanceRecord = {
  sourceId: string
  action: "keep" | "drop" | "unwrap"
  reason: string
  reconstructionId: string | null
}

// Simplification rule (v2):
// Remove a wrapper only when all of the following hold:
// 1. It has no meaningful text and no other content (no field, media, or boundary).
// 2. It has no paint and no generated pseudo-element.
// 3. It has no spacing, layout, transform, clipping, or stacking effect.
//    Spacing includes padding, margin (including negative margin), and gap.
//    Layout includes flex, grid, and any display mode other than an inert box.
//    display:contents does not generate a box, so it is not a layout effect.
//    Stacking and clipping include position, z-index, opacity, overflow, clip, transform, and filter.
// 4. Its children keep equivalent order and geometry. Child boxes are the measured
//    ones and stay in source order. An absolute or fixed child keeps its wrapper,
//    because dropping that wrapper would change the containing block.
// Hidden nodes stay in the full tree. They are omitted here with a provenance record.
const EFFECT_TRAITS = new Set([
  "background",
  "background-image",
  "border",
  "shadow",
  "outline",
  "padding",
  "margin",
  "gap",
  "transform",
  "opacity",
  "filter",
  "clip",
  "overflow",
  "position",
  "z-index",
  "blend",
])

function hiddenReason(node: DomNode): string | null {
  if (node.render.display === "none") return "display-none"
  if (node.render.visibility === "hidden" || node.render.visibility === "collapse") return "visibility-hidden"
  return null
}

function hasMeaningfulText(node: DomNode): boolean {
  return (node.content ?? []).some((part) => typeof part === "string" && part.trim().length > 0)
}

function hasVisualOrLayoutEffect(node: DomNode): boolean {
  return node.traits.some((trait) => {
    if (EFFECT_TRAITS.has(trait) || trait.startsWith("::")) return true
    if (trait.startsWith("display:")) return trait !== "display:contents"
    return false
  })
}

function outOfFlow(node: DomNode): boolean {
  return node.render.position === "absolute" || node.render.position === "fixed"
}

function canUnwrap(node: DomNode, nodes: Nodes): boolean {
  if (hasMeaningfulText(node) || node.boundary || node.field || node.media?.length) return false
  if (hasVisualOrLayoutEffect(node)) return false
  const visibleChildren = node.children.filter((id) => !hiddenReason(nodes[id]))
  if (visibleChildren.length === 0) return false
  if (visibleChildren.some((id) => outOfFlow(nodes[id]))) return false
  return true
}

export function simplify(nodes: Nodes, roots: string[], sections: SectionCandidate[]) {
  const out: Record<string, ReconstructionNode> = {}
  const reconstructionIdOf: Record<string, string> = {}
  const dropped: { sourceId: string; reason: string; action: "drop" | "unwrap" }[] = []
  const provenance: ProvenanceRecord[] = []
  let seq = 0

  const dropHidden = (id: string, reason: string) => {
    provenance.push({ sourceId: id, action: "drop", reason, reconstructionId: null })
    dropped.push({ sourceId: id, reason, action: "drop" })
    for (const child of nodes[id].children) dropHidden(child, reason)
  }

  const build = (id: string): string[] => {
    const node = nodes[id]
    const reason = hiddenReason(node)
    if (reason) {
      dropHidden(id, reason)
      return []
    }
    if (canUnwrap(node, nodes)) {
      const childIds = node.children.flatMap((child) => build(child))
      provenance.push({ sourceId: id, action: "unwrap", reason: "transparent-wrapper", reconstructionId: null })
      dropped.push({ sourceId: id, reason: "transparent-wrapper", action: "unwrap" })
      return childIds
    }
    const reconstructionId = `r-${String(++seq).padStart(6, "0")}`
    reconstructionIdOf[id] = reconstructionId
    provenance.push({ sourceId: id, action: "keep", reason: "effect-or-content", reconstructionId })
    out[reconstructionId] = {
      sourceIds: [id],
      tag: node.tag,
      children: node.children.flatMap((child) => build(child)),
    }
    return [reconstructionId]
  }

  const simplifiedRoots = roots.flatMap((id) => build(id))
  return {
    roots: simplifiedRoots,
    nodes: out,
    sections: sections.map((section) => ({ clipId: section.id, rootIds: section.rootIds.flatMap((id) => reconstructionIdOf[id] ?? []) })),
    dropped,
    provenance,
    measurement: { before: Object.keys(nodes).length, after: Object.keys(out).length },
  }
}
