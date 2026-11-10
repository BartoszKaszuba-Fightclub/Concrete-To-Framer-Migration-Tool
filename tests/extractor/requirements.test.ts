import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { test } from "node:test"
import { fixtureUrl, removeOut, runExtractor, tempOut } from "./helpers.ts"

type Node = {
  tag: string
  parentId: string | null
  children: string[]
  content?: (string | { id: string })[]
  href?: string
  media?: { kind: string; alt?: string }[]
}

function textOf(node: Node): string {
  return (node.content ?? []).filter((part): part is string => typeof part === "string").join("").trim()
}

test("requirements capture stores title, language, raw href, and image alt", { timeout: 120_000 }, async () => {
  const out = await tempOut()
  try {
    const run = await runExtractor([
      fixtureUrl("requirements.html"),
      "--slug", "requirements",
      "--out", out,
      "--settle-timeout", "2000",
    ])
    assert.equal(run.code, 0, `${run.stderr}\n${run.stdout}`)
    const structure = JSON.parse(await readFile(join(out, "digest", "nesting", "requirements", "1200", "default", "structure.json"), "utf8")) as {
      title: string
      language: string
      nodes: Record<string, Node>
    }
    assert.equal(structure.title, "Requirement fixture")
    assert.equal(structure.language, "en")

    const nodes = Object.values(structure.nodes)
    const pricing = nodes.find((node) => node.tag === "a" && textOf(node) === "Pricing")
    const empty = nodes.find((node) => node.tag === "a" && textOf(node) === "Empty")
    assert.ok(pricing)
    assert.equal(pricing.href, "#pricing")
    assert.ok(empty)
    assert.equal(empty.href, "")

    const header = nodes.find((node) => node.tag === "header")
    assert.ok(header)
    const logo = header.children.map((id) => structure.nodes[id]).find((node) => node.tag === "img")
    assert.equal(logo?.media?.find((item) => item.kind === "img")?.alt, "Site logo")

    const heading = nodes.find((node) => node.tag === "h3" && textOf(node) === "Card two")
    assert.ok(heading?.parentId)
    const card = structure.nodes[heading.parentId]
    const image = card.children.map((id) => structure.nodes[id]).find((node) => node.tag === "img")
    const item = image?.media?.find((entry) => entry.kind === "img")
    assert.ok(image?.media?.length)
    assert.ok(item)
    assert.equal("alt" in item, false)
  } finally {
    await removeOut(out)
  }
})
