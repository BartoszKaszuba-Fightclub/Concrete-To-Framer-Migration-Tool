// Not on the active capture path. Cross-width match files are not generated or read.
import type { DomNode, Nodes } from "./extract.ts"

type Key = { basis: "text" | "media"; value: string }

const ownText = (n: DomNode) =>
  (n.content ?? []).filter((c): c is string => typeof c === "string").join("").replace(/\s+/g, " ").trim()

function keysOf(n: DomNode): [string, Key][] {
  const text = ownText(n)
  const keys: [string, Key][] = text.length > 1 ? [[`${n.tag}|${text}`, { basis: "text", value: text }]] : []
  for (const url of new Set((n.media ?? []).map((m) => m.url))) keys.push([`media|${url}`, { basis: "media", value: url }])
  return keys
}

function index(nodes: Nodes) {
  const map = new Map<string, Key & { ids: string[] }>()
  for (const [id, n] of Object.entries(nodes))
    for (const [k, key] of keysOf(n)) (map.get(k) ?? map.set(k, { ...key, ids: [] }).get(k)!).ids.push(id)
  return map
}

// Proposals only: nodes stay distinct per width until a designer approves a correspondence.
export function proposeMatches(captures: { width: number; nodes: Nodes }[]) {
  const [base, ...others] = [...captures].sort((a, b) => b.width - a.width)
  const baseIndex = index(base.nodes)
  const proposals = []
  for (const other of others) {
    const otherIndex = index(other.nodes)
    for (const [k, { basis, value, ids }] of baseIndex) {
      const otherIds = otherIndex.get(k)?.ids
      if (!otherIds) continue
      const rendered = (nodes: Nodes, list: string[]) => Object.fromEntries(list.map((id) => [id, nodes[id].box.width > 0 && nodes[id].box.height > 0]))
      proposals.push({
        id: `m-${String(proposals.length + 1).padStart(5, "0")}`,
        status: "proposed",
        basis,
        confidence: ids.length === 1 && otherIds.length === 1 ? "unique" : "ambiguous",
        nodeIds: { [base.width]: ids, [other.width]: otherIds },
        evidence: { tag: base.nodes[ids[0]].tag, value, hasBox: { [base.width]: rendered(base.nodes, ids), [other.width]: rendered(other.nodes, otherIds) } },
      })
    }
  }
  return { baseWidth: base.width, proposals }
}
