import type { DomNode, Nodes } from "./extract.ts"
import type { SectionCandidate } from "./sections.ts"
import { groupBySignature, visualSignature, type SignatureDefinition } from "./signatures.ts"

export type ComponentFilter = "all" | "button" | "field"

export type ComponentRecord = {
  id: string
  kind: "button" | "field"
  nodeId: string
  sectionId: string | null
  label: string
  signatureId: string
  blocker: null
}

export type ComponentBlocker = {
  id: string
  kind: "button" | "field" | "text"
  nodeId: string
  sectionId: string | null
  label: string
  reason: "missing-measurement"
}

const REQUIRED_STYLE_KEYS = ["fontFamily", "fontSize", "fontWeight", "color"]

export function isVisible(node: DomNode): boolean {
  if (node.render.display === "none" || node.render.visibility === "hidden" || node.render.visibility === "collapse") return false
  if (Number(node.render.opacity) === 0) return false
  return node.box.width > 0 && node.box.height > 0
}

export function componentKind(node: DomNode): "button" | "field" | null {
  if (node.tag === "button" || node.role === "button") return "button"
  if (node.tag === "input") {
    const type = String(node.field?.type || "text").toLowerCase()
    if (type === "hidden") return null
    if (["button", "submit", "reset", "image"].includes(type)) return "button"
    return "field"
  }
  if (node.tag === "textarea" || node.tag === "select") return "field"
  return null
}

export function hasMeaningfulText(node: DomNode): boolean {
  return (node.content ?? []).some((part) => typeof part === "string" && part.trim().length > 0)
}

export function visibleLabel(nodes: Nodes, id: string): string {
  const parts: string[] = []
  const walk = (current: string) => {
    const node = nodes[current]
    if (!node) return
    if (node.content?.length) {
      for (const part of node.content) {
        if (typeof part === "string") parts.push(part)
        else walk(part.id)
      }
      return
    }
    node.children.forEach(walk)
  }
  walk(id)
  return parts.join("").replace(/\s+/g, " ").trim()
}

function styleMissing(style: Record<string, unknown> | undefined): boolean {
  if (!style) return true
  return REQUIRED_STYLE_KEYS.some((key) => style[key] == null || style[key] === "")
}

export function missingMeasurements(nodes: Nodes, computed: Record<string, Record<string, unknown>>): { nodeId: string; reason: "missing-measurement" }[] {
  const gaps = []
  for (const [id, node] of Object.entries(nodes)) {
    if (!isVisible(node)) continue
    if (!componentKind(node) && !hasMeaningfulText(node)) continue
    if (styleMissing(computed[id])) gaps.push({ nodeId: id, reason: "missing-measurement" as const })
  }
  return gaps
}

export function buildComponentInventory(
  nodes: Nodes,
  sections: SectionCandidate[],
  computed: Record<string, Record<string, unknown>>,
  filter: ComponentFilter,
): { filter: ComponentFilter; records: ComponentRecord[]; blockers: ComponentBlocker[]; definitions: SignatureDefinition[] } {
  const sectionOf = new Map<string, string>()
  for (const section of sections) for (const id of section.memberIds) if (!sectionOf.has(id)) sectionOf.set(id, section.id)

  const requested = Object.entries(nodes).flatMap(([id, node]) => {
    if (!isVisible(node)) return []
    const kind = componentKind(node)
    if (!kind || (filter !== "all" && filter !== kind)) return []
    return [{ id, node, kind }]
  })

  let seq = 0
  const nextId = () => `cmp-${String(++seq).padStart(3, "0")}`
  const measurable: { id: string; kind: "button" | "field"; label: string; sectionId: string | null; style: Record<string, unknown> }[] = []
  const blockers: ComponentBlocker[] = []
  for (const item of requested) {
    const style = computed[item.id]
    const label = visibleLabel(nodes, item.id)
    const sectionId = sectionOf.get(item.id) ?? null
    if (styleMissing(style)) {
      blockers.push({ id: nextId(), kind: item.kind, nodeId: item.id, sectionId, label, reason: "missing-measurement" })
      continue
    }
    measurable.push({ id: item.id, kind: item.kind, label, sectionId, style })
  }

  const definitions = groupBySignature(measurable.map((item) => ({ nodeId: item.id, kind: item.kind, signature: visualSignature(item.style) })))
  const signatureOf = new Map<string, string>()
  for (const definition of definitions) for (const nodeId of definition.instanceIds) signatureOf.set(nodeId, definition.id)

  const records: ComponentRecord[] = measurable.map((item) => ({
    id: nextId(),
    kind: item.kind,
    nodeId: item.id,
    sectionId: item.sectionId,
    label: item.label,
    signatureId: signatureOf.get(item.id) ?? "",
    blocker: null,
  }))
  return { filter, records, blockers, definitions }
}
