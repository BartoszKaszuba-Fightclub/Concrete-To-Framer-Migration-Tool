import assert from "node:assert/strict"
import { spawn } from "node:child_process"
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import test from "node:test"
import { fetchPageAsset, readAssetEvidence, saveCaptureAssets } from "../../scripts/generic-extractor/assets.ts"
import { generateDigest, type StructureNode } from "../../scripts/digest/generate.ts"
import { fixtureUrl, removeOut, repoRoot, runExtractor, tempOut } from "./helpers.ts"

const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64")

function runDigest(args: string[]): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ["--import", "tsx", "scripts/digest/cli.ts", ...args], { cwd: repoRoot })
    let stdout = ""
    let stderr = ""
    child.stdout.on("data", (chunk) => { stdout += String(chunk) })
    child.stderr.on("data", (chunk) => { stderr += String(chunk) })
    child.on("close", (code) => resolve({ code: code ?? 1, stdout, stderr }))
  })
}

test("capture saves one local file per url and the digest records that path", async () => {
  const root = await mkdtemp(join(tmpdir(), "ctf-assets-"))
  const directory = join(root, "assets")
  const hero = "https://example.test/images/photo.jpg"
  const mask = "https://example.test/images/shape.svg"
  const other = "https://cdn.example.test/shape.svg"
  const missing = "https://example.test/missing.jpg"
  const page = "https://example.test/missing-page"
  const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="125" height="55" viewBox="0 0 125 55"></svg>`)
  try {
    const saved = await saveCaptureAssets({
      nodes: {
        "n-hero": { media: [{ url: hero }] },
        "n-mask": { media: [{ url: mask }] },
        "n-again": { media: [{ url: mask }] },
        "n-other": { media: [{ url: other }] },
        "n-missing": { media: [{ url: missing }] },
        "n-html": { media: [{ url: page }] },
      },
      directory,
      pathRoot: root,
      baseUrl: "https://example.test/",
      fetchAsset: async (url) => {
        if (url === hero) return { ok: true, bytes: PNG, contentType: "image/jpeg" }
        if (url === mask || url === other) return { ok: true, bytes: svg, contentType: "image/svg+xml" }
        if (url === page) return { ok: true, bytes: Buffer.from("<html></html>"), contentType: "text/html; charset=utf-8" }
        return { ok: false, bytes: Buffer.alloc(0) }
      },
    })

    assert.deepEqual(saved.assets.map((asset) => asset.nodeId), ["n-hero", "n-mask", "n-again", "n-other"])
    assert.equal(saved.assets[1].usablePath, saved.assets[2].usablePath)
    assert.notEqual(saved.assets[1].usablePath, saved.assets[3].usablePath)
    assert.equal(saved.assets.some((asset) => asset.originalUrl === missing || asset.originalUrl === page), false)
    assert.deepEqual(saved.warnings.map((warning) => warning.code), ["asset-download-failed", "asset-download-failed"])
    for (const asset of saved.assets) {
      assert.equal(/^(https?:|data:|blob:)/i.test(asset.usablePath), false)
      assert.equal(asset.usablePath.endsWith(".jpg") || asset.usablePath.endsWith(".svg"), true)
      const bytes = await readFile(join(root, asset.usablePath))
      assert.ok(bytes.length > 0)
    }
    assert.equal(saved.assets[0].naturalWidth, 1)
    assert.equal(saved.assets[0].naturalHeight, 1)
    assert.equal(saved.assets[1].naturalWidth, 125)
    assert.equal(saved.assets[1].naturalHeight, 55)
    assert.deepEqual((await readdir(directory)).sort(), ["photo.jpg", "shape-2.svg", "shape.svg"])

    const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x02, 0x00, 0x03, 0x01, 0x11, 0x00, 0x00, 0xff, 0xd9])
    const sized = await saveCaptureAssets({
      nodes: { "n-jpeg": { media: [{ url: "https://example.test/photo" }] } },
      directory: join(root, "jpeg"),
      pathRoot: root,
      baseUrl: "https://example.test/",
      fetchAsset: async () => ({ ok: true, bytes: jpeg, contentType: "image/jpeg" }),
      sizes: new Map([["https://example.test/photo", { naturalWidth: 0, naturalHeight: 0 }]]),
    })
    assert.equal(sized.assets[0].naturalWidth, 3)
    assert.equal(sized.assets[0].naturalHeight, 2)
    assert.equal(sized.assets[0].usablePath.endsWith("/photo.jpg"), true)

    await writeFile(join(root, "assets.json"), JSON.stringify([
      ...saved.assets,
      { nodeId: "n-hot", originalUrl: hero, usablePath: hero },
    ]))
    const readable = await readAssetEvidence(join(root, "structure.json"))
    assert.equal(readable?.some((asset) => asset.usablePath === hero), false)
    assert.equal(readable?.length, saved.assets.length)

    const digest = generateDigest({
      structure: {
        nodes: {
          "n-hero": {
            tag: "img",
            selector: "img",
            parentId: null,
            order: 0,
            children: [],
            box: { x: 0, y: 0, width: 10, height: 10 },
            media: [{ kind: "img", url: hero }],
          } satisfies StructureNode,
        },
      },
      computed: { nodes: {} },
      component: { id: "section", type: "section", rootIds: ["n-hero"] },
      evidence: { assets: readable },
    }) as { assets: { originalUrl: string; usablePath: { status: string; value?: string }; naturalWidth: { status: string; value?: string } }[] }
    assert.equal(digest.assets[0].originalUrl, hero)
    assert.equal(digest.assets[0].usablePath.status, "value")
    assert.equal(digest.assets[0].usablePath.value, saved.assets[0].usablePath)
    assert.equal(digest.assets[0].naturalWidth.status, "value")
    assert.equal(digest.assets[0].naturalWidth.value, "1")
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test("a data url is written to a local file", async () => {
  const dataUrl = `data:image/png;base64,${PNG.toString("base64")}`
  const fetched = await fetchPageAsset(undefined as never, dataUrl)
  assert.equal(fetched?.ok, true)
  assert.ok(fetched && fetched.bytes.equals(PNG))
})

test("the capture command writes the image and the digest command records it", { timeout: 120_000 }, async () => {
  const out = await tempOut()
  try {
    const run = await runExtractor([fixtureUrl("media.html"), "--slug", "media", "--out", out, "--settle-timeout", "2000"])
    assert.equal(run.code, 0, `${run.stderr}\n${run.stdout}`)
    const dir = join(out, "digest", "nesting", "media", "1200", "default")
    const structure = JSON.parse(await readFile(join(dir, "structure.json"), "utf8")) as {
      nodes: Record<string, { media?: { kind?: string; url?: string }[] }>
    }
    const assets = JSON.parse(await readFile(join(dir, "assets.json"), "utf8")) as { nodeId: string; originalUrl: string; usablePath: string; naturalWidth: number; naturalHeight: number }[]
    const images = Object.entries(structure.nodes).filter(([, node]) => node.media?.some((media) => media.kind === "img"))
    assert.equal(images.length, 2)
    assert.equal(assets.length, 2)
    assert.equal(assets[0].usablePath, assets[1].usablePath)
    assert.equal(/^(https?:|data:|blob:|file:)/i.test(assets[0].usablePath), false)
    const bytes = await readFile(join(repoRoot, assets[0].usablePath))
    assert.ok(bytes.equals(PNG))
    assert.equal(assets[0].naturalWidth, 1)
    assert.equal(assets[0].naturalHeight, 1)
    assert.equal((await readdir(join(dir, "assets"))).length, 1)

    const digestPath = join(dir, "digests", "media.json")
    await mkdir(join(dir, "digests"), { recursive: true })
    const digestRun = await runDigest([
      "--structure", join(dir, "structure.json"),
      "--computed", join(dir, "computed.json"),
      "--component-id", "media",
      "--component-type", "section",
      "--root", images[0][0],
      "--out", digestPath,
    ])
    assert.equal(digestRun.code, 0, `${digestRun.stderr}\n${digestRun.stdout}`)
    const digest = JSON.parse(await readFile(digestPath, "utf8")) as {
      assets: { originalUrl: string; usablePath: { status: string; value?: string }; naturalWidth: { status: string; value?: string } }[]
    }
    assert.equal(digest.assets.length, 1)
    assert.equal(digest.assets[0].originalUrl, assets[0].originalUrl)
    assert.equal(digest.assets[0].usablePath.status, "value")
    assert.equal(digest.assets[0].usablePath.value, assets[0].usablePath)
    assert.equal(digest.assets[0].naturalWidth.value, "1")
    assert.equal(digest.assets[0].originalUrl.startsWith("file:"), true)
  } finally {
    await removeOut(out)
  }
})
