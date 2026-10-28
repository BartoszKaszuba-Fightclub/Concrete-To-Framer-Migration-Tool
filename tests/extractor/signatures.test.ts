import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { test } from "node:test"
import { fixtureUrl, removeOut, runExtractor, tempOut } from "./helpers.ts"

test("buttons with the same label and different borders stay in different signature groups", { timeout: 120_000 }, async () => {
  const out = await tempOut()
  try {
    const run = await runExtractor([fixtureUrl("signatures.html"), "--slug", "signatures", "--out", out, "--components", "button", "--settle-timeout", "2000"])
    assert.equal(run.code, 0, `${run.stderr}\n${run.stdout}`)
    const dir = join(out, "digest", "nesting", "signatures", "1200", "default")
    const components = JSON.parse(await readFile(join(dir, "components.json"), "utf8"))
    const signatures = JSON.parse(await readFile(join(dir, "signatures.json"), "utf8"))
    assert.equal(components.records.length, 3)
    assert.equal(components.blockers.length, 0)
    assert.equal(signatures.definitions.length, 2)
    const shared = signatures.definitions.find((definition: { instanceIds: string[] }) => definition.instanceIds.length === 2)
    const single = signatures.definitions.find((definition: { instanceIds: string[] }) => definition.instanceIds.length === 1)
    assert.ok(shared)
    assert.ok(single)
    assert.notEqual(shared.signature.borderTopColor, single.signature.borderTopColor)
    const labelOf = (nodeId: string) => components.records.find((record: { nodeId: string; label: string }) => record.nodeId === nodeId).label
    assert.deepEqual(shared.instanceIds.map(labelOf).sort(), ["Save", "Send"])
    assert.equal(labelOf(single.instanceIds[0]), "Save")
    const saves = components.records.filter((record: { label: string }) => record.label === "Save")
    assert.equal(saves.length, 2)
    assert.notEqual(saves[0].signatureId, saves[1].signatureId)
  } finally {
    await removeOut(out)
  }
})
