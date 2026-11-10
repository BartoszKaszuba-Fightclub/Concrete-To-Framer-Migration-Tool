import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { test } from "node:test"
import { filesUnder, fixtureUrl, removeOut, runExtractor, tempOut } from "./helpers.ts"

test("buttons with the same label and different borders stay in different signature groups", { timeout: 120_000 }, async () => {
  const out = await tempOut()
  try {
    const run = await runExtractor([fixtureUrl("signatures.html"), "--slug", "signatures", "--out", out, "--components", "button", "--settle-timeout", "2000"])
    assert.equal(run.code, 0, `${run.stderr}\n${run.stdout}`)
    const dir = join(out, "digest", "nesting", "signatures", "1200", "default")
    const components = JSON.parse(await readFile(join(dir, "components.json"), "utf8"))
    const written = await filesUnder(dir)
    assert.equal(written.some((path) => path.endsWith("signatures.json")), false)
    assert.equal(components.records.length, 3)
    assert.equal(components.blockers.length, 0)
    const signatureIds = components.records.map((record: { signatureId: string }) => record.signatureId)
    assert.equal(new Set(signatureIds).size, 2)
    const saves = components.records.filter((record: { label: string }) => record.label === "Save")
    assert.equal(saves.length, 2)
    assert.notEqual(saves[0].signatureId, saves[1].signatureId)
    const send = components.records.find((record: { label: string }) => record.label === "Send")
    assert.ok(send)
    assert.equal(saves.filter((record: { signatureId: string }) => record.signatureId === send.signatureId).length, 1)
  } finally {
    await removeOut(out)
  }
})
