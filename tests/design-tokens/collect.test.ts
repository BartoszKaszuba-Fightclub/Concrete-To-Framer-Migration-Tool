import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { collectTokens, type ComputedStyle, type StructureNode } from "../../scripts/design-tokens/collect.ts"
import { validateTokens } from "../../scripts/design-tokens/schema.ts"

const structure = JSON.parse(readFileSync(new URL("./fixtures/structure.json", import.meta.url), "utf8")) as {
  nodes: Record<string, StructureNode>
  url: string
  slug: string
  state: string
  viewport: { width: number; height: number }
}
const computed = JSON.parse(readFileSync(new URL("./fixtures/computed.json", import.meta.url), "utf8")) as {
  nodes: Record<string, ComputedStyle>
  skipped: { nodeId: string; reason: string }[]
}
const schema = JSON.parse(readFileSync(new URL("../../docs/poc-v2/design-tokens.schema.json", import.meta.url), "utf8")) as {
  required: string[]
  properties: Record<string, { required?: string[] }>
}

test("frozen fixture collects two colours, two type sizes, and one gap", () => {
  const tokens = collectTokens({ structure, computed, language: "nl" })
  validateTokens(tokens)

  for (const key of schema.required) assert.ok(key in tokens, key)
  const colours = tokens.colours as { name: string; css: string; alpha: number; framer: { action: string; light: string } }[]
  const textStyles = tokens.textStyles as { roles: string[]; fontSize: string; letterSpacing: string; colorStyle: string; framer: { tag: string; letterSpacing: string } }[]
  const spacing = tokens.spacing as { kind: string; axes?: { column?: string } }[]

  assert.equal(colours.length, 2)
  assert.equal(new Set(colours.map((entry) => entry.css)).size, 2)
  assert.deepEqual(colours.map((entry) => entry.css).sort(), ["rgb(249, 176, 15)", "rgb(27, 49, 88)"])
  assert.equal(colours.every((entry) => entry.framer.action === "createColorStyle" && entry.framer.light.startsWith("rgba(")), true)
  assert.equal(textStyles.length, 2)
  assert.deepEqual(textStyles.map((entry) => entry.fontSize).sort(), ["16px", "32px"])
  assert.equal(textStyles.every((entry) => entry.letterSpacing === "normal" && entry.framer.letterSpacing === "normal"), true)
  assert.equal(textStyles.some((entry) => entry.roles.includes("h1") && entry.framer.tag === "h1"), true)
  assert.equal(textStyles.some((entry) => entry.framer.tag === "h2"), false)
  assert.equal(spacing.length, 1)
  assert.equal(spacing[0].kind, "gap")
  assert.equal(spacing[0].axes?.column, "16px")
  assert.equal(JSON.stringify(tokens).includes("rgb(4, 5, 6)"), false)
  assert.equal(JSON.stringify(tokens).includes("rgb(3, 3, 3)"), false)
  assert.equal(JSON.stringify(tokens).includes("99px"), false)

  const colourProps = schema.properties.colours
  assert.ok(colourProps)
  for (const entry of colours) {
    for (const key of ["name", "css", "alpha", "framer"]) assert.ok(key in entry)
  }
})
