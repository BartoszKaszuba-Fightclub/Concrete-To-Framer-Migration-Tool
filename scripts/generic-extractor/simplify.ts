import type { Box, Nodes } from "./extract.ts"
import type { SectionCandidate } from "./sections.ts"

type ReconstructionNode = { sourceIds: string[]; tag: string; children: string[] }

const sameBox = (a: Box, b: Box) => (["x", "y", "width", "height"] as const).every((k) => Math.abs(a[k] - b[k]) <= 0.5)

// Conservative: only drops display:none subtrees and folds a wrapper into its single shown child
// when the wrapper paints nothing, carries no layout traits and occupies exactly the child's box.
export function simplify(nodes: Nodes, roots: string[], sections: SectionCandidate[]) {
  const out: Record<string, ReconstructionNode> = {}
  const reconstructionIdOf: Record<string, string> = {}
  const dropped: { sourceId: string; reason: string }[] = []
  const shown = (id: string) => nodes[id].render.display !== "none"
  let seq = 0

  const foldTarget = (id: string) => {
    const n = nodes[id]
    const kids = n.children.filter(shown)
    const ok = kids.length === 1 && !n.content && !n.boundary && !n.field && !n.media && n.traits.length === 0 && sameBox(n.box, nodes[kids[0]].box)
    return ok ? kids[0] : null
  }

  const build = (id: string): string | null => {
    if (!shown(id)) {
      dropped.push({ sourceId: id, reason: "display-none" })
      return null
    }
    const rid = `r-${String(++seq).padStart(6, "0")}`
    const sourceIds = [id]
    for (let next = foldTarget(id); next; next = foldTarget(next)) sourceIds.push(next)
    for (const s of sourceIds) reconstructionIdOf[s] = rid
    for (const s of sourceIds.slice(0, -1))
      for (const c of nodes[s].children) if (!shown(c)) dropped.push({ sourceId: c, reason: "display-none" })

    const representative = nodes[sourceIds.at(-1)!]
    out[rid] = { sourceIds, tag: representative.tag, children: [] }
    out[rid].children = representative.children.flatMap((c) => build(c) ?? [])
    return rid
  }

  return {
    roots: roots.flatMap((id) => build(id) ?? []),
    nodes: out,
    sections: sections.map((s) => ({ clipId: s.id, rootIds: s.rootIds.flatMap((id) => reconstructionIdOf[id] ?? []) })),
    dropped,
  }
}
