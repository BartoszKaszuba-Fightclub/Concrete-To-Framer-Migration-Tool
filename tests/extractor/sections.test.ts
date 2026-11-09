import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { test } from "node:test"
import { componentKind, isVisible, visibleLabel } from "../../scripts/generic-extractor/components.ts"
import type { Nodes } from "../../scripts/generic-extractor/extract.ts"
import { fixtureUrl, removeOut, runExtractor, tempOut } from "./helpers.ts"

test("header, hero, main, and footer become sections and button-only mode lists each visible button", { timeout: 120_000 }, async () => {
  const out = await tempOut()
  try {
    const run = await runExtractor([
      fixtureUrl("sections.html"),
      "--slug", "sections",
      "--out", out,
      "--components", "button",
      "--settle-timeout", "2000",
    ])
    assert.equal(run.code, 0, `${run.stderr}\n${run.stdout}`)
    const dir = join(out, "digest", "nesting", "sections", "1200", "default")
    const structure = JSON.parse(await readFile(join(dir, "structure.json"), "utf8"))
    const components = JSON.parse(await readFile(join(dir, "components.json"), "utf8"))
    assert.deepEqual(structure.sectionCandidates.map((section: { kind: string }) => section.kind), ["header", "hero", "main", "footer"])
    assert.equal(components.filter, "button")
    assert.deepEqual(components.blockers, [])
    const nodes = structure.nodes as Nodes
    const visibleButtons = Object.entries(nodes).filter(([, node]) => componentKind(node) === "button" && isVisible(node))
    assert.equal(components.records.length, visibleButtons.length)
    for (const [id] of visibleButtons) {
      assert.ok(components.records.some((record: { nodeId: string }) => record.nodeId === id) || components.blockers.some((blocker: { nodeId: string }) => blocker.nodeId === id))
    }
    const sectionKind = Object.fromEntries(structure.sectionCandidates.map((section: { id: string; kind: string }) => [section.id, section.kind]))
    const placed = Object.fromEntries(components.records.map((record: { label: string; sectionId: string }) => [record.label, sectionKind[record.sectionId]]))
    assert.deepEqual(placed, { "Header action": "header", "Hero action": "hero", "Main action": "main" })
    const hiddenId = Object.entries(nodes).find(([id, node]) => componentKind(node) === "button" && !isVisible(node) && visibleLabel(nodes, id) === "Hidden action")?.[0]
    assert.ok(hiddenId)
    assert.equal(components.records.some((record: { nodeId: string }) => record.nodeId === hiddenId), false)
    assert.equal(components.blockers.some((blocker: { nodeId: string }) => blocker.nodeId === hiddenId), false)
  } finally {
    await removeOut(out)
  }
})
