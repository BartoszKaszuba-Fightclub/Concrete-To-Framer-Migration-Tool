import type { DomNode, Nodes } from "./extract.ts"

export type SectionCandidate = {
  id: string
  rootIds: string[]
  kind: string
  status: "needs-review" | "approved"
  memberIds: string[]
  evidence: Record<string, unknown>[]
}

const STOP_TAGS = new Set(["section", "article", "aside", "header", "footer", "nav", "form"])
const SHELL_TAGS = new Set(["body", "main"])
const PAGE_LANDMARKS = new Set(["header", "footer", "nav", "main"])
const LANDMARKS = new Set(["header", "footer", "nav"])
const PAINT_TRAITS = new Set(["background", "background-image", "border", "shadow"])
const LAYOUT_TRAIT = /^(background|background-image|border|shadow|position|overflow|transform|display:(inline-)?(flex|grid))$/

const hasBox = (n: DomNode) => n.box.width > 0 && n.box.height > 0
const outOfFlow = (n: DomNode) => n.render.position === "fixed" || n.render.position === "absolute"
const isHeading = (n: DomNode) => /^h[1-6]$/.test(n.tag)
const isStop = (n: DomNode, kids: DomNode[]) =>
  STOP_TAGS.has(n.tag) ||
  !!n.content ||
  !!n.boundary ||
  kids.length === 0 ||
  kids.some((k) => isHeading(k) || k.tag === "p" || !!k.content) ||
  (!SHELL_TAGS.has(n.tag) && !kids.some((k) => PAGE_LANDMARKS.has(k.tag)) && n.traits.some((t) => LAYOUT_TRAIT.test(t)))

const subtree = (nodes: Nodes, id: string): string[] => [id, ...nodes[id].children.flatMap((c) => subtree(nodes, c))]

// Descend from body through unpainted, non-layout wrappers: single-child chains, and stacks of
// ≥2 children spanning ≥90% of their parent's width. A heading-only candidate is paired with its next sibling.
export function proposeSectionRoots(nodes: Nodes, roots: string[]): string[][] {
  const expand = (id: string): string[] => {
    const n = nodes[id]
    const shown = n.children.filter((c) => hasBox(nodes[c]))
    const overlays = shown.filter((c) => outOfFlow(nodes[c]))
    const kids = shown.filter((c) => !outOfFlow(nodes[c]))
    if (isStop(n, kids.map((c) => nodes[c]))) return [id]
    const descend = kids.filter((c) => nodes[c].box.width >= 0.9 * n.box.width || nodes[c].tag === "main")
    if (kids.length === 1) return [...expand(kids[0]), ...overlays]
    if (descend.length >= 2) return shown.flatMap((c) => (descend.includes(c) ? expand(c) : [c]))
    return [id]
  }
  const headingOnly = (id: string) => {
    const ids = subtree(nodes, id)
    return ids.length <= 6 && ids.some((m) => isHeading(nodes[m])) && ids.every((m) => !nodes[m].media && !nodes[m].field && !nodes[m].boundary)
  }

  const lift = (id: string) => {
    for (let p = nodes[id].parentId; p && !SHELL_TAGS.has(nodes[p].tag) && nodes[p].children.filter((c) => hasBox(nodes[c])).length === 1; p = nodes[p].parentId) id = p
    return id
  }

  const groups: string[][] = []
  // IDs are zero-padded in DOM pre-order, so a string sort restores DOM order.
  for (const id of roots.filter((r) => hasBox(nodes[r])).flatMap(expand).sort()) {
    const prev = groups.at(-1)
    const [a, b] = prev?.length === 1 ? [lift(prev[0]), lift(id)] : []
    if (a && b && headingOnly(prev![0]) && nodes[a].parentId === nodes[b].parentId) groups[groups.length - 1] = [a, b]
    else groups.push([id])
  }
  return groups
}

export function buildSections(nodes: Nodes, groups: string[][], layoutWidth: number, status: SectionCandidate["status"]): SectionCandidate[] {
  return groups.map((rootIds, i) => {
    const first = nodes[rootIds[0]]
    return {
      id: `clip-${String(i + 1).padStart(2, "0")}`,
      rootIds,
      kind: LANDMARKS.has(first.tag) ? first.tag : outOfFlow(first) ? "overlay" : "content",
      status,
      memberIds: rootIds.flatMap((id) => subtree(nodes, id)),
      evidence: rootIds.map((id) => {
        const n = nodes[id]
        return {
          nodeId: id,
          tag: n.tag,
          box: n.box,
          position: n.render.position,
          viewportWidthRatio: Math.round((n.box.width / layoutWidth) * 100) / 100,
          paints: n.traits.filter((t) => PAINT_TRAITS.has(t)),
          headings: subtree(nodes, id).filter((m) => /^h[1-6]$/.test(nodes[m].tag)).length,
        }
      }),
    }
  })
}

export function sectionCoverage(nodes: Nodes, roots: string[], candidates: SectionCandidate[]) {
  const members = new Set(candidates.flatMap((c) => c.memberIds))
  const ancestors = new Set<string>()
  for (const c of candidates)
    for (const id of c.rootIds)
      for (let p = nodes[id].parentId; p && !ancestors.has(p); p = nodes[p].parentId) ancestors.add(p)

  const shellIds: string[] = []
  const unassignedIds: string[] = []
  const walk = (id: string) => {
    if (members.has(id)) return
    if (!ancestors.has(id)) return void unassignedIds.push(id)
    shellIds.push(id)
    nodes[id].children.forEach(walk)
  }
  roots.forEach(walk)
  return { shellIds, unassignedIds }
}
