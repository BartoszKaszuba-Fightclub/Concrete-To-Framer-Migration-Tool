import assert from "node:assert/strict"
import { access, readFile } from "node:fs/promises"
import { join } from "node:path"
import { test } from "node:test"
import { fixtureUrl, removeOut, runExtractor, tempOut } from "./helpers.ts"

test("consent reject removes the overlay before capture", { timeout: 120_000 }, async () => {
  const out = await tempOut()
  try {
    const run = await runExtractor([fixtureUrl("consent-dismiss.html"), "--slug", "consent", "--out", out, "--settle-timeout", "2000"])
    assert.equal(run.code, 0, `${run.stderr}\n${run.stdout}`)
    const structure = JSON.parse(await readFile(join(out, "digest", "nesting", "consent", "1200", "default", "structure.json"), "utf8"))
    const computed = JSON.parse(await readFile(join(out, "digest", "nesting", "consent", "1200", "default", "computed.json"), "utf8"))
    const blob = JSON.stringify(structure.nodes)
    assert.equal(blob.includes("We use cookies"), false)
    assert.equal(blob.includes("Real page"), true)
    assert.equal(JSON.stringify(computed).includes("We use cookies"), false)
    assert.equal(structure.sectionCandidates.some((section: { kind: string }) => section.kind === "overlay"), false)
    const snapshot = await readFile(join(out, "snapshots", "consent", "1200", "default", "snapshot.html"), "utf8")
    assert.equal(snapshot.includes("We use cookies"), false)
    assert.equal(snapshot.includes("Real page"), true)
    const media = structure.metadata.breakpoints.discovered.map((item: { media: string }) => item.media).join("\n")
    assert.match(media, /min-width:\s*640px/)
    assert.doesNotMatch(media, /777px/)
  } finally {
    await removeOut(out)
  }
})

test("a covering overlay without a dismiss control fails the capture", { timeout: 120_000 }, async () => {
  const out = await tempOut()
  try {
    const run = await runExtractor([fixtureUrl("consent-blocking.html"), "--slug", "blocked", "--out", out, "--settle-timeout", "2000"])
    assert.notEqual(run.code, 0)
    assert.match(run.stderr, /blocking-overlay-without-dismiss-control/)
    await assert.rejects(access(join(out, "digest", "nesting", "blocked", "1200", "default", "structure.json")))
  } finally {
    await removeOut(out)
  }
})
