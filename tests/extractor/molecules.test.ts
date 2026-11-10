import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { test } from "node:test"
import type { Nodes } from "../../scripts/generic-extractor/extract.ts"
import { fixtureUrl, removeOut, runExtractor, tempOut } from "./helpers.ts"

test("repeated article cards share one molecule signature", { timeout: 120_000 }, async () => {
  const out = await tempOut()
  try {
    const run = await runExtractor([fixtureUrl("requirements.html"), "--slug", "requirements", "--out", out, "--settle-timeout", "2000"])
    assert.equal(run.code, 0, `${run.stderr}\n${run.stdout}`)
    const dir = join(out, "digest", "nesting", "requirements", "1200", "default")
    const structure = JSON.parse(await readFile(join(dir, "structure.json"), "utf8"))
    const components = JSON.parse(await readFile(join(dir, "components.json"), "utf8"))
    const nodes = structure.nodes as Nodes
    const articles = Object.entries(nodes).filter(([, node]) => node.tag === "article").map(([id]) => id)
    assert.equal(articles.length, 2)
    for (const id of articles) assert.deepEqual(nodes[id].children.map((childId) => nodes[childId].tag), ["img", "h3", "p"])

    const records = components.records.filter((record: { kind: string }) => record.kind === "molecule")
    assert.equal(records.length, 2)
    assert.equal(records.every((record: { instanceIds?: unknown }) => record.instanceIds === undefined), true)
    const signatureId = records[0].signatureId
    assert.equal(records[1].signatureId, signatureId)
    assert.deepEqual(records.map((record: { nodeId: string }) => record.nodeId).sort(), [...articles].sort())

    assert.equal(components.definitions.length, 1)
    const definition = components.definitions[0]
    assert.equal(definition.kind, "molecule")
    assert.equal(definition.id, signatureId)
    assert.deepEqual([...definition.instanceIds].sort(), [...articles].sort())

    const landmarks = Object.entries(nodes).filter(([, node]) => node.tag === "header" || node.tag === "main" || node.tag === "footer" || node.tag === "a" || node.tag === "img")
    assert.equal(records.some((record: { nodeId: string }) => landmarks.some(([id]) => id === record.nodeId)), false)
  } finally {
    await removeOut(out)
  }
})
