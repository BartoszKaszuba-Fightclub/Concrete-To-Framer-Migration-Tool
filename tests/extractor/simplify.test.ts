import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { test } from "node:test"
import type { DomNode, Nodes } from "../../scripts/generic-extractor/extract.ts"
import { simplify } from "../../scripts/generic-extractor/simplify.ts"

type FixtureNode = Partial<DomNode> & { tag: string; children: string[]; traits: string[]; render: DomNode["render"]; box: DomNode["box"]; content?: string[] }

test("simplification keeps effects, drops hidden nodes, and records fixture node counts", async () => {
  const fixture = JSON.parse(await readFile(new URL("./fixtures/simplify-tree.json", import.meta.url), "utf8")) as {
    expected: { before: number; after: number }
    roots: string[]
    nodes: Record<string, FixtureNode>
  }
  const nodes: Nodes = {}
  for (const [id, node] of Object.entries(fixture.nodes)) {
    nodes[id] = {
      tag: node.tag,
      domId: "",
      classes: [],
      selector: id,
      parentId: null,
      order: 0,
      children: node.children,
      box: node.box,
      render: node.render,
      traits: node.traits,
      ...(node.content ? { content: node.content } : {}),
    }
  }
  const boxesBefore = JSON.stringify(Object.fromEntries(Object.entries(nodes).map(([id, node]) => [id, node.box])))
  const result = simplify(nodes, fixture.roots, [])
  assert.equal(Object.keys(nodes).length, fixture.expected.before)
  assert.equal(nodes["n-hidden"].render.display, "none")
  assert.deepEqual(result.measurement, fixture.expected)
  assert.equal(JSON.stringify(Object.fromEntries(Object.entries(nodes).map(([id, node]) => [id, node.box]))), boxesBefore)

  const provenance = (id: string) => result.provenance.find((record) => record.sourceId === id)
  assert.equal(provenance("n-hidden")?.action, "drop")
  assert.equal(provenance("n-hidden")?.reconstructionId, null)
  assert.equal(provenance("n-contents")?.action, "unwrap")
  assert.equal(provenance("n-contents")?.reason, "transparent-wrapper")
  for (const id of ["n-flex", "n-grid", "n-abs-wrap", "n-abs", "n-neg"]) assert.equal(provenance(id)?.action, "keep", id)
  assert.equal(Object.values(result.nodes).some((node) => node.sourceIds.includes("n-hidden")), false)
  assert.equal(Object.values(result.nodes).some((node) => node.sourceIds.includes("n-contents")), false)

  const body = Object.values(result.nodes).find((node) => node.sourceIds.includes("n-body"))
  assert.ok(body)
  const childSources = body.children.map((id) => result.nodes[id].sourceIds[0])
  assert.deepEqual(childSources, ["n-a", "n-b", "n-flex", "n-grid", "n-abs-wrap", "n-neg"])
  assert.deepEqual(result.nodes[body.children[2]].children.map((id) => result.nodes[id].sourceIds[0]), ["n-item"])
  assert.deepEqual(result.nodes[body.children[3]].children.map((id) => result.nodes[id].sourceIds[0]), ["n-cell"])
  assert.deepEqual(result.nodes[body.children[4]].children.map((id) => result.nodes[id].sourceIds[0]), ["n-abs"])
})
