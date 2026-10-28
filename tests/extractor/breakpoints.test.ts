import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { test } from "node:test"
import { selectCaptureWidth } from "../../scripts/generic-extractor/width.ts"
import { REMOVED_ARTIFACTS, filesUnder, fixtureUrl, removeOut, runExtractor, tempOut } from "./helpers.ts"

test("selectCaptureWidth keeps a single width and warns on the rest", () => {
  const selected = selectCaptureWidth("390,768,1200")
  assert.equal(selected.selectedWidth, 390)
  assert.deepEqual(selected.ignoredWidths, [768, 1200])
  assert.match(selected.warning ?? "", /Capturing 390 only/)
  assert.equal(selectCaptureWidth(undefined).selectedWidth, 1200)
  assert.deepEqual(selectCaptureWidth(undefined).ignoredWidths, [])
})

test("default capture discovers breakpoints, records an inaccessible sheet, and writes one width", { timeout: 120_000 }, async () => {
  const out = await tempOut()
  try {
    const run = await runExtractor([fixtureUrl("breakpoints.html"), "--slug", "breakpoints", "--out", out, "--settle-timeout", "2000"])
    assert.equal(run.code, 0, `${run.stderr}\n${run.stdout}`)
    const nesting = join(out, "digest", "nesting", "breakpoints")
    const { readdir } = await import("node:fs/promises")
    assert.deepEqual(await readdir(nesting), ["1200"])
    assert.deepEqual(await readdir(join(out, "Screenshots", "breakpoints")), ["1200"])
    const structure = JSON.parse(await readFile(join(nesting, "1200", "default", "structure.json"), "utf8"))
    assert.equal(structure.state, "default")
    assert.deepEqual(structure.viewport, { width: 1200, height: 900 })
    assert.equal(structure.metadata.breakpoints.selectedWidth, 1200)
    assert.deepEqual(structure.metadata.breakpoints.ignoredWidths, [])
    const media = structure.metadata.breakpoints.discovered.map((item: { media: string }) => item.media).join("\n")
    assert.match(media, /min-width:\s*600px/)
    assert.match(media, /max-width:\s*900px/)
    assert.match(media, /min-width:\s*1200px/)
    assert.match(media, /max-width:\s*1600px/)
    assert.ok(structure.metadata.breakpoints.inaccessible.some((sheet: { href: string | null }) => String(sheet.href).endsWith("missing.css")))
    const written = await filesUnder(out)
    for (const name of REMOVED_ARTIFACTS) assert.equal(written.some((path) => path.endsWith(name)), false, name)
    assert.equal(written.filter((path) => path.endsWith("structure.json")).length, 1)
  } finally {
    await removeOut(out)
  }
})

test("multiple --widths values do not write a multi-width capture", { timeout: 120_000 }, async () => {
  const out = await tempOut()
  try {
    const run = await runExtractor([fixtureUrl("breakpoints.html"), "--slug", "multi", "--out", out, "--widths", "390,768", "--settle-timeout", "2000"])
    assert.equal(run.code, 0, `${run.stderr}\n${run.stdout}`)
    assert.match(run.stderr, /ignoring 768/i)
    const { readdir } = await import("node:fs/promises")
    assert.deepEqual(await readdir(join(out, "digest", "nesting", "multi")), ["390"])
    const written = await filesUnder(out)
    assert.equal(written.some((path) => path.includes("/768/")), false)
    assert.equal(written.some((path) => path.endsWith("matches.proposed.json")), false)
    const structure = JSON.parse(await readFile(join(out, "digest", "nesting", "multi", "390", "default", "structure.json"), "utf8"))
    assert.equal(structure.metadata.breakpoints.selectedWidth, 390)
    assert.deepEqual(structure.metadata.breakpoints.ignoredWidths, [768])
  } finally {
    await removeOut(out)
  }
})
