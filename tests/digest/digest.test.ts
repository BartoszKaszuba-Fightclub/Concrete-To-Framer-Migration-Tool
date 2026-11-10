import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { applyTokenNames, generateDigest, type ComputedStyle, type DigestInput, type StructureNode } from "../../scripts/digest/generate.ts"
import { planDigestJobs } from "../../scripts/digest/jobs.ts"
import { DigestValidationError, validateDigest } from "../../scripts/digest/schema.ts"

const SIDES = ["Top", "Right", "Bottom", "Left"]

function css(overrides: Record<string, string> = {}): ComputedStyle {
  const style: Record<string, string> = {
    fontFamily: "Test, sans-serif",
    fontSize: "16px",
    fontWeight: "400",
    lineHeight: "20px",
    letterSpacing: "0px",
    textTransform: "none",
    color: "rgb(0, 0, 0)",
    backgroundColor: "rgba(0, 0, 0, 0)",
    backgroundImage: "none",
    opacity: "1",
    boxShadow: "none",
    rowGap: "0px",
    columnGap: "0px",
    paddingTop: "0px",
    paddingRight: "0px",
    paddingBottom: "0px",
    paddingLeft: "0px",
    marginTop: "0px",
    marginRight: "0px",
    marginBottom: "0px",
    marginLeft: "0px",
  }
  for (const side of SIDES) {
    style[`border${side}Width`] = "0px"
    style[`border${side}Style`] = "none"
    style[`border${side}Color`] = "rgb(0, 0, 0)"
  }
  for (const corner of ["borderTopLeftRadius", "borderTopRightRadius", "borderBottomRightRadius", "borderBottomLeftRadius"]) style[corner] = "0px"
  return { ...style, ...overrides }
}

function node(partial: Partial<StructureNode> & { tag: string }): StructureNode {
  return {
    domId: "",
    classes: [],
    selector: partial.tag,
    parentId: null,
    order: 0,
    children: [],
    box: { x: 0, y: 0, width: 10, height: 10 },
    render: { display: "block", visibility: "visible", opacity: "1", position: "static" },
    traits: [],
    ...partial,
  }
}

function input(partial: Partial<DigestInput> & Pick<DigestInput, "structure" | "component">): DigestInput {
  return {
    capture: {
      captureId: "fixture",
      url: "https://example.test/page",
      finalUrl: "https://example.test/page",
      language: "en",
      timestamp: "2026-01-01T00:00:00.000Z",
      viewport: { width: 1200, height: 900 },
      state: "default",
      config: { fixture: true },
    },
    computed: { nodes: {} },
    evidence: {
      screenshot: { path: "screenshot.png" },
      crops: [],
      fonts: [{ family: "Test, sans-serif", availability: "available", source: "fixture" }],
    },
    ...partial,
  }
}

function button(id: string, label: string, overrides: Record<string, string> = {}, classes: string[] = []): DigestInput {
  return input({
    component: { id: "button", type: "button", rootIds: [id] },
    structure: { nodes: { [id]: node({ tag: "button", selector: id, classes, content: [label], box: { x: 1, y: 2, width: 30, height: 12 } }) } },
    computed: { nodes: { [id]: css({ backgroundColor: "rgb(1, 2, 3)", borderTopWidth: "2px", borderTopStyle: "solid", ...overrides }) } },
  })
}

function reverseKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(reverseKeys)
  if (value && typeof value === "object") {
    const source = value as Record<string, unknown>
    const reversed: Record<string, unknown> = {}
    for (const key of Object.keys(source).reverse()) reversed[key] = reverseKeys(source[key])
    return reversed
  }
  return value
}

test("same frozen input produces the same semantic digest", () => {
  const frozen = button("n-1", "Save")
  const once = generateDigest(frozen)
  const twice = generateDigest(reverseKeys(frozen) as DigestInput)
  assert.deepEqual(once, twice)
  assert.deepEqual(Object.keys(once), [...Object.keys(once)].sort())
  validateDigest(once)
})

test("dangling node, token, and asset references fail", () => {
  const digest = generateDigest(button("n-1", "Save"))
  const danglingNode = structuredClone(digest) as { nodes: Record<string, { children: string[] }> }
  danglingNode.nodes["n-1"].children.push("n-missing")
  assert.throws(() => validateDigest(danglingNode), (error: DigestValidationError) => error.errors.some((item) => item.includes("dangling node")))

  const danglingToken = structuredClone(digest) as { tokens: Record<string, unknown>; nodes: Record<string, { styles: { typography: { ref: string } } }> }
  delete danglingToken.tokens[danglingToken.nodes["n-1"].styles.typography.ref]
  assert.throws(() => validateDigest(danglingToken), (error: DigestValidationError) => error.errors.some((item) => item.includes("dangling token")))

  const danglingAsset = structuredClone(digest) as { nodes: Record<string, { assetIds: string[] }> }
  danglingAsset.nodes["n-1"].assetIds.push("asset.missing")
  assert.throws(() => validateDigest(danglingAsset), (error: DigestValidationError) => error.errors.some((item) => item.includes("dangling asset")))
})

test("missing required measured fields fail", () => {
  const missingSize = button("n-1", "Save")
  delete missingSize.computed.nodes!["n-1"].fontSize
  assert.throws(() => validateDigest(generateDigest(missingSize)), (error: DigestValidationError) => error.errors.some((item) => item.includes("fontSize")))

  const missingBox = button("n-1", "Save")
  delete missingBox.structure.nodes["n-1"].box
  assert.throws(() => validateDigest(generateDigest(missingBox)), (error: DigestValidationError) => error.errors.some((item) => item.includes("geometry")))
})

test("different colours do not collapse and equivalent styles reuse one definition", () => {
  const shared = css({ backgroundColor: "rgb(10, 20, 30)", color: "rgb(255, 255, 255)", borderTopWidth: "2px", borderTopStyle: "solid", fontWeight: "700" })
  const navy = css({ ...shared, backgroundColor: "rgb(27, 49, 88)" })
  const different = input({
    component: { id: "button", type: "button", rootIds: ["n-a", "n-b"] },
    structure: {
      nodes: {
        "n-a": node({ tag: "button", selector: "a", classes: ["alpha"], content: ["One"], box: { x: 0, y: 0, width: 20, height: 10 } }),
        "n-b": node({ tag: "button", selector: "b", classes: ["beta"], content: ["Two"], box: { x: 40, y: 0, width: 20, height: 10 } }),
      },
    },
    computed: { nodes: { "n-a": shared, "n-b": navy } },
  })
  const split = generateDigest(different) as { groups: { styleRefs: { fill: string; typography: string[] } }[] }
  validateDigest(split)
  assert.equal(split.groups.length, 2)
  assert.notEqual(split.groups[0].styleRefs.fill, split.groups[1].styleRefs.fill)
  assert.deepEqual(split.groups[0].styleRefs.typography, split.groups[1].styleRefs.typography)

  const equivalent = input({
    component: { id: "button", type: "button", rootIds: ["n-a", "n-b"] },
    structure: different.structure,
    computed: { nodes: { "n-a": shared, "n-b": { ...shared } } },
  })
  const joined = generateDigest(equivalent) as { groups: { occurrences: { nodeId: string; labels: string[] }[]; styleRefs: { fill: string; typography: string[]; border: string } }[]; tokens: Record<string, { kind: string }> }
  validateDigest(joined)
  assert.equal(joined.groups.length, 1)
  assert.deepEqual(joined.groups[0].occurrences.map((occurrence) => occurrence.labels[0]).sort(), ["One", "Two"])
  assert.equal(joined.groups[0].styleRefs.typography.length, 1)
  assert.equal(Object.values(joined.tokens).filter((token) => token.kind === "typography").length, 1)
  assert.equal(new Set(joined.groups[0].occurrences.map(() => joined.groups[0].styleRefs.fill)).size, 1)

  const padded = input({
    component: { id: "button", type: "button", rootIds: ["n-a", "n-b"] },
    structure: different.structure,
    computed: { nodes: { "n-a": shared, "n-b": { ...shared, paddingLeft: "12px" } } },
  })
  const spacing = generateDigest(padded) as { groups: { occurrences: { spacingRef: string }[] }[] }
  validateDigest(spacing)
  assert.equal(spacing.groups.length, 1)
  assert.notEqual(spacing.groups[0].occurrences[0].spacingRef, spacing.groups[0].occurrences[1].spacingRef)
})

test("button and field occurrences stay separate and media and link labels are inside the digest", () => {
  const digest = generateDigest(input({
    component: { id: "section", type: "section", rootIds: ["n-root"] },
    structure: {
      nodes: {
        "n-root": node({ tag: "div", selector: "root", children: ["n-button", "n-field", "n-link", "n-img"], box: { x: 0, y: 0, width: 100, height: 40 }, traits: ["background"] }),
        "n-button": node({ tag: "button", selector: "button", parentId: "n-root", order: 0, content: ["Go"], box: { x: 0, y: 0, width: 20, height: 10 } }),
        "n-field": node({ tag: "input", selector: "field", parentId: "n-root", order: 1, field: { type: "text", value: "", placeholder: "Name" }, box: { x: 20, y: 0, width: 20, height: 10 } }),
        "n-link": node({ tag: "a", selector: "link", parentId: "n-root", order: 2, content: ["Read more"], box: { x: 40, y: 0, width: 20, height: 10 } }),
        "n-img": node({ tag: "img", selector: "img", parentId: "n-root", order: 3, media: [{ kind: "img", url: "https://example.test/photo.jpg" }], box: { x: 60, y: 0, width: 20, height: 10 } }),
      },
    },
    computed: {
      nodes: {
        "n-root": css({ backgroundColor: "rgb(1, 1, 1)" }),
        "n-button": css({ backgroundColor: "rgb(2, 2, 2)" }),
        "n-field": css({ backgroundColor: "rgb(2, 2, 2)" }),
        "n-link": css(),
        "n-img": css(),
      },
    },
    evidence: {
      screenshot: { path: "screenshot.png" },
      crops: [{ nodeId: "n-img", path: "crops/img.png" }],
      assets: [{ nodeId: "n-img", originalUrl: "https://example.test/photo.jpg", usablePath: "assets/photo.jpg", naturalWidth: 800, naturalHeight: 0 }],
      fonts: [{ family: "Test, sans-serif", availability: "available", source: "fixture" }],
    },
  })) as {
    groups: { kind: string }[]
    links: { nodeId: string; label: string; destination: { status: string; href?: string; reason?: string }; href?: string }[]
    assets: { originalUrl: string; usablePath: { value?: string }; naturalWidth: { status: string; value: string }; naturalHeight: { status: string } }[]
    nodes: Record<string, { assetIds: string[] }>
  }
  validateDigest(digest)
  assert.deepEqual(digest.groups.map((group) => group.kind).sort(), ["button", "field"])
  assert.equal(digest.links.length, 1)
  assert.equal(digest.links[0].label, "Read more")
  assert.equal(digest.links[0].destination.status, "missing")
  assert.equal("href" in digest.links[0], false)
  assert.equal("href" in digest.links[0].destination, false)
  const legacy = structuredClone(digest)
  legacy.links[0].destination = { status: "unsupported", reason: "Visible labels are kept. Link destinations are out of scope and are not stored." }
  validateDigest(legacy)
  assert.equal(digest.assets[0].originalUrl, "https://example.test/photo.jpg")
  assert.equal(digest.assets[0].usablePath.value, "assets/photo.jpg")
  assert.equal(digest.assets[0].naturalWidth.status, "value")
  assert.equal(digest.assets[0].naturalWidth.value, "800")
  assert.equal(digest.assets[0].naturalHeight.status, "zero")
  assert.deepEqual(digest.nodes["n-img"].assetIds, ["asset.0001"])
  assert.equal(JSON.stringify(digest).includes("https://example.test/photo.jpg"), true)
})

test("simplification keeps effectful wrappers and drops only effect-free ones", () => {
  const base = input({
    component: { id: "section", type: "section", rootIds: ["n-root"] },
    structure: { nodes: {} },
    computed: { nodes: {} },
  })
  const paint = css({ backgroundColor: "rgb(9, 9, 9)" })
  const plain = css()

  const folded = input({
    ...base,
    structure: {
      nodes: {
        "n-root": node({ tag: "div", selector: "root", children: ["n-wrap"], box: { x: 0, y: 0, width: 20, height: 10 }, traits: ["background"] }),
        "n-wrap": node({ tag: "div", selector: "wrap", parentId: "n-root", children: ["n-a", "n-b"], box: { x: 0, y: 0, width: 20, height: 10 } }),
        "n-a": node({ tag: "span", selector: "a", parentId: "n-wrap", order: 0, content: ["A"], box: { x: 0, y: 0, width: 10, height: 10 } }),
        "n-b": node({ tag: "span", selector: "b", parentId: "n-wrap", order: 1, content: ["B"], box: { x: 10, y: 0, width: 10, height: 10 } }),
      },
    },
    computed: { nodes: { "n-root": paint, "n-wrap": plain, "n-a": plain, "n-b": plain } },
  })
  const simplified = generateDigest(folded) as { nodes: Record<string, { children: string[] }>; provenance: { folded: { sourceId: string; childSourceIds: string[] }[] } }
  validateDigest(simplified)
  assert.equal(simplified.nodes["n-wrap"], undefined)
  assert.deepEqual(simplified.nodes["n-root"].children, ["n-a", "n-b"])
  assert.equal(simplified.provenance.folded[0].sourceId, "n-wrap")

  const hidden = input({
    ...base,
    structure: {
      nodes: {
        "n-root": node({ tag: "div", selector: "root", children: ["n-hide", "n-show"], box: { x: 0, y: 0, width: 10, height: 10 }, traits: ["background"] }),
        "n-hide": node({ tag: "div", selector: "hide", parentId: "n-root", render: { display: "none", visibility: "visible", opacity: "1", position: "static" }, children: ["n-inner"] }),
        "n-inner": node({ tag: "span", selector: "inner", parentId: "n-hide", content: ["Hidden"] }),
        "n-show": node({ tag: "span", selector: "show", parentId: "n-root", order: 1, content: ["Shown"], box: { x: 0, y: 0, width: 10, height: 10 } }),
      },
    },
    computed: { nodes: { "n-root": paint, "n-show": plain } },
  })
  const omitted = generateDigest(hidden) as { nodes: Record<string, unknown>; provenance: { omitted: { sourceId: string }[] } }
  validateDigest(omitted)
  assert.equal(omitted.nodes["n-hide"], undefined)
  assert.equal(omitted.nodes["n-inner"], undefined)
  assert.ok(omitted.provenance.omitted.some((entry) => entry.sourceId === "n-hide"))
  assert.ok(omitted.nodes["n-show"])

  const kept = (traits: string[], render: StructureNode["render"], style: ComputedStyle, box = { x: 0, y: 0, width: 10, height: 10 }) => generateDigest(input({
    ...base,
    structure: {
      nodes: {
        "n-root": node({ tag: "div", selector: "root", children: ["n-keep"], box: { x: 0, y: 0, width: 10, height: 10 }, traits: ["background"] }),
        "n-keep": node({ tag: "div", selector: "keep", parentId: "n-root", children: ["n-child"], traits, render, box }),
        "n-child": node({ tag: "span", selector: "child", parentId: "n-keep", content: ["Child"], box: { x: 0, y: 0, width: 10, height: 10 } }),
      },
    },
    computed: { nodes: { "n-root": paint, "n-keep": style, "n-child": plain } },
  })) as { nodes: Record<string, unknown> }

  assert.ok(kept(["display:flex"], { display: "flex", visibility: "visible", opacity: "1", position: "static" }, plain).nodes["n-keep"])
  assert.ok(kept(["display:contents"], { display: "contents", visibility: "visible", opacity: "1", position: "static" }, plain).nodes["n-keep"])
  assert.ok(kept(["margin"], { display: "block", visibility: "visible", opacity: "1", position: "static" }, css({ marginTop: "-8px" })).nodes["n-keep"])
  assert.ok(kept(["position"], { display: "block", visibility: "visible", opacity: "1", position: "absolute" }, plain).nodes["n-keep"])
  const invisible = kept([], { display: "block", visibility: "hidden", opacity: "1", position: "static" }, plain)
  assert.ok(invisible.nodes["n-keep"])
  const transformed = kept(["transform"], { display: "block", visibility: "visible", opacity: "1", position: "static" }, plain)
  assert.ok(transformed.nodes["n-keep"])
  assert.throws(() => validateDigest(transformed), (error: DigestValidationError) => error.errors.some((item) => item.includes("transform")))
})

test("stored effect values satisfy flagged traits", () => {
  const fixture = button("n-1", "Save", {
    zIndex: "2",
    transform: "matrix(1, 0, 0, 1, 10, 0)",
    overflowX: "hidden",
    overflowY: "visible",
    clipPath: "none",
    maskImage: "none",
    filter: "blur(2px)",
    backdropFilter: "none",
  })
  fixture.structure.nodes["n-1"].traits = ["z-index", "transform", "overflow", "filter"]
  fixture.structure.nodes["n-1"].render = { display: "block", visibility: "visible", opacity: "1", position: "relative" }
  const digest = generateDigest(fixture) as { nodes: Record<string, { layout: { zIndex: { value: string } }; effects: { transform: { value: string }; clipping: { value: string }; filter: { value: string } } }> }
  validateDigest(digest)
  assert.equal(digest.nodes["n-1"].layout.zIndex.value, "2")
  assert.equal(digest.nodes["n-1"].effects.transform.value, "transform: matrix(1, 0, 0, 1, 10, 0)")
  assert.match(digest.nodes["n-1"].effects.clipping.value, /overflowX: hidden/)
  assert.match(digest.nodes["n-1"].effects.filter.value, /filter: blur\(2px\)/)
})

test("captured button example validates against schema 2.0.0", () => {
  const digest = JSON.parse(readFileSync(new URL("../../docs/poc-v2/examples/button.digest.json", import.meta.url), "utf8"))
  validateDigest(digest)
  assert.equal(digest.schemaVersion, "2.0.0")
  assert.equal(digest.idStability, "capture-local")
  assert.deepEqual(digest.component.rootIds, ["n-000701"])
  assert.equal(digest.capture.language.value, "nl")
  assert.equal(digest.capture.viewport.width, 1200)
  const buttonNode = digest.nodes["n-000701"]
  const label = digest.nodes["n-000702"]
  assert.equal(buttonNode.tag, "button")
  assert.equal(label.text.exact.value, "NL")
  assert.equal(buttonNode.labelNodes[0].nodeId, "n-000702")
  assert.equal(label.styles.typography.value.fontFamily.value, "Lexend, sans-serif")
  assert.equal(label.styles.typography.value.fontSize.value, "18px")
  assert.equal(label.styles.typography.value.fontWeight.value, "700")
  assert.equal(label.styles.typography.value.lineHeight.value, "18px")
  assert.equal(buttonNode.styles.typography.value.lineHeight.value, "21.008px")
  assert.equal(buttonNode.styles.border.value.borderTopWidth.value, "2px")
  assert.notEqual(buttonNode.styles.typography.ref, label.styles.typography.ref)
  assert.equal(digest.groups.length, 1)
  assert.equal(digest.groups[0].styleRefs.typography[0], label.styles.typography.ref)
  assert.equal(label.styles.typography.value.letterSpacing.status, "unsupported")
  assert.equal(digest.nodes["n-000704"].boundary.kind, "svg")
})

test("planDigestJobs lists component records before section candidates", () => {
  const jobs = planDigestJobs(
    {
      sectionCandidates: [
        { id: "clip-01", rootIds: ["n-1", "n-2"] },
        { id: "clip-skip", rootIds: [] },
      ],
    },
    {
      records: [
        { id: "cmp-001", kind: "button", nodeId: "n-9" },
        { id: "", kind: "field", nodeId: "n-8" },
        { id: "cmp-002", kind: "field", nodeId: "n-7" },
        { id: "cmp-skip", kind: "button", nodeId: "" },
      ],
    },
  )
  assert.deepEqual(jobs, [
    { id: "cmp-001", type: "button", rootIds: ["n-9"] },
    { id: "cmp-002", type: "field", rootIds: ["n-7"] },
    { id: "clip-01", type: "section", rootIds: ["n-1", "n-2"] },
  ])
})

test("a digest without screenshot, crops, or fonts omits that evidence and copied token values", () => {
  const digest = generateDigest({
    ...button("n-1", "Save", { letterSpacing: "normal" }),
    evidence: {},
  }) as {
    nodes: Record<string, { styles: { typography: { value: { letterSpacing: { status: string; raw: string } } } } }>
    warnings: { code: string }[]
    unsupported: { feature: string }[]
    tokens: Record<string, { id?: string; kind?: string; proposal?: { name: string; roles: string[] } }>
    fonts?: unknown
    evidence: Record<string, unknown>
  }
  validateDigest(digest)
  const node = digest.nodes["n-1"]
  assert.equal("selector" in node, false)
  assert.equal("domId" in node, false)
  assert.equal("classes" in node, false)
  const codes = digest.warnings.map((warning) => warning.code)
  for (const code of ["screenshot-missing", "crop-missing", "font-availability-missing", "letter-spacing-normal"]) {
    assert.equal(codes.includes(code), false)
  }
  assert.equal(digest.unsupported.some((item) => item.feature === "interaction-state"), false)
  assert.equal(digest.unsupported.some((item) => item.feature === "letter-spacing-normal"), false)
  assert.ok(Object.keys(digest.tokens).length > 0)
  for (const token of Object.values(digest.tokens)) {
    assert.equal(typeof token.id, "string")
    assert.equal(typeof token.kind, "string")
    assert.equal(typeof token.proposal?.name, "string")
    assert.ok(Array.isArray(token.proposal?.roles))
    assert.equal("value" in token, false)
  }
  assert.equal("fonts" in digest, false)
  assert.equal("screenshot" in digest.evidence, false)
  assert.equal("crops" in digest.evidence, false)
  assert.equal(node.styles.typography.value.letterSpacing.status, "unsupported")
  assert.equal(node.styles.typography.value.letterSpacing.raw, "normal")
})

test("a painted pseudo border keeps that side and drops type and spacing", () => {
  const fixture = button("n-1", "Save")
  fixture.structure.nodes["n-1"].traits = ["::before"]
  fixture.computed.nodes!["n-1"].pseudos = {
    "::before": {
      content: '"*"',
      width: "12px",
      height: "8px",
      opacity: "1",
      color: "rgb(1, 2, 3)",
      backgroundColor: "rgba(0, 0, 0, 0)",
      backgroundImage: "none",
      fontSize: "16px",
      paddingTop: "4px",
      borderTopWidth: "5px",
      borderTopStyle: "solid",
      borderTopColor: "rgb(9, 9, 9)",
      borderRightWidth: "0px",
      borderRightStyle: "none",
      borderBottomWidth: "0px",
      borderLeftWidth: "0px",
    },
  }
  const digest = generateDigest(fixture) as {
    nodes: Record<string, { pseudos: { elements: Record<string, Record<string, unknown>> } }>
  }
  validateDigest(digest)
  const pseudo = digest.nodes["n-1"].pseudos.elements["::before"]
  for (const key of ["content", "width", "height", "opacity", "borderTopWidth"]) assert.ok(pseudo[key])
  assert.equal("fontSize" in pseudo, false)
  assert.equal("paddingTop" in pseudo, false)
  assert.equal("borderRightWidth" in pseudo, false)
})

test("stored href is classified and an img alt is copied", () => {
  const cases = [
    ["n-hash", "#pricing", "value", "anchor"],
    ["n-path", "/about", "value", "internal"],
    ["n-https", "https://example.com/docs", "value", "external"],
    ["n-mail", "mailto:hello@example.com", "value", "email"],
    ["n-tel", "tel:+31101234567", "value", "phone"],
    ["n-empty", "", "uncertain", ""],
    ["n-js", "javascript:void(0)", "uncertain", ""],
  ] as const
  const nodes: Record<string, StructureNode> = {
    "n-root": node({ tag: "div", selector: "root", children: [...cases.map(([id]) => id), "n-img", "n-blank"], box: { x: 0, y: 0, width: 200, height: 90 }, traits: ["background"] }),
  }
  const computed: Record<string, ComputedStyle> = { "n-root": css({ backgroundColor: "rgb(1, 1, 1)" }) }
  cases.forEach(([id, href], index) => {
    nodes[id] = node({ tag: "a", selector: id, parentId: "n-root", order: index, content: [id], href, box: { x: 0, y: index * 10, width: 40, height: 10 } })
    computed[id] = css()
  })
  nodes["n-img"] = node({ tag: "img", selector: "img", parentId: "n-root", order: 7, media: [{ kind: "img", url: "https://example.test/photo.jpg", alt: "" }], box: { x: 50, y: 0, width: 20, height: 10 } })
  nodes["n-blank"] = node({ tag: "img", selector: "blank", parentId: "n-root", order: 8, media: [{ kind: "img", url: "https://example.test/blank.jpg" }], box: { x: 80, y: 0, width: 20, height: 10 } })
  computed["n-img"] = css()
  computed["n-blank"] = css()
  const digest = generateDigest(input({
    component: { id: "section", type: "section", rootIds: ["n-root"] },
    structure: { nodes },
    computed: { nodes: computed },
  })) as {
    links: { nodeId: string; destination: { status: string; kind?: string; href?: string }; href?: string }[]
    assets: { originalUrl: string; alt?: string; nodeId: string }[]
    warnings: { code: string; nodeIds?: string[] }[]
  }
  validateDigest(digest)
  for (const [id, href, status, kind] of cases) {
    const link = digest.links.find((item) => item.nodeId === id)
    assert.ok(link)
    assert.equal(link.destination.status, status)
    assert.equal("href" in link, false)
    if (status === "value") {
      assert.equal(link.destination.kind, kind)
      assert.equal(link.destination.href, href)
    } else {
      assert.equal(link.destination.href, href)
    }
  }
  assert.equal(digest.assets.find((asset) => asset.nodeId === "n-img")?.alt, "")
  assert.equal("alt" in (digest.assets.find((asset) => asset.nodeId === "n-blank") ?? {}), false)
  assert.equal(digest.warnings.some((warning) => warning.code === "alt-missing" && warning.nodeIds?.includes("n-blank")), true)
  assert.equal(digest.warnings.some((warning) => warning.code === "alt-missing" && warning.nodeIds?.includes("n-img")), false)
})

test("token file names replace proposal names when measurements match", () => {
  const built = () => generateDigest(button("n-1", "Save", {
    color: "rgb(20, 20, 20)",
    fontSize: "32px",
    fontWeight: "700",
    lineHeight: "40px",
    letterSpacing: "normal",
    marginBottom: "12px",
  })) as {
    tokens: Record<string, { id: string; kind: string; proposal: { name: string } }>
    nodes: Record<string, { styles: { typography: { ref: string; colourRef: string }; spacing: { ref: string } } }>
  }
  const digest = built()
  const typographyId = digest.nodes["n-1"].styles.typography.ref
  const colourId = digest.nodes["n-1"].styles.typography.colourRef
  const spacingId = digest.nodes["n-1"].styles.spacing.ref
  const localSpacingName = digest.tokens[spacingId].proposal.name
  applyTokenNames(digest, {
    colours: [{ name: "color/rgba-20-20-20-1", framer: { light: "rgba(20, 20, 20, 1)" } }],
    textStyles: [{
      name: "text/h1/georgia-32px-700-40px-normal-none",
      colorStyle: "color/rgba-20-20-20-1",
      framer: { fontSize: "32px", lineHeight: "40px", letterSpacing: "normal", fontWeight: 700 },
    }],
    spacing: [{ name: "spacing/margin/bottom-12px", kind: "margin", sides: { bottom: "12px" } }],
  })
  assert.equal(digest.tokens[colourId].id, colourId)
  assert.equal(digest.tokens[colourId].proposal.name, "color/rgba-20-20-20-1")
  assert.equal(digest.tokens[typographyId].id, typographyId)
  assert.equal(digest.tokens[typographyId].proposal.name, "text/h1/georgia-32px-700-40px-normal-none")
  assert.equal(digest.tokens[spacingId].id, spacingId)
  assert.equal(digest.tokens[spacingId].proposal.name, "spacing/margin/bottom-12px")
  validateDigest(digest)

  const ambiguous = built()
  applyTokenNames(ambiguous, {
    colours: [
      { name: "color/rgba-20-20-20-1", framer: { light: "rgba(20, 20, 20, 1)" } },
      { name: "color/other", framer: { light: "rgba(9, 9, 9, 1)" } },
    ],
    textStyles: [
      { name: "text/body/one", colorStyle: "color/other", framer: { fontSize: "32px", lineHeight: "40px", letterSpacing: "normal", fontWeight: 700 } },
      { name: "text/h1/match", colorStyle: "color/rgba-20-20-20-1", framer: { fontSize: "32px", lineHeight: "40px", letterSpacing: "normal", fontWeight: 700 } },
    ],
    spacing: [
      { name: "spacing/margin/bottom-12px", kind: "margin", sides: { bottom: "12px" } },
      { name: "spacing/padding/left-12px", kind: "padding", sides: { left: "12px" } },
    ],
  })
  assert.equal(ambiguous.tokens[typographyId].proposal.name, "text/h1/match")
  assert.equal(ambiguous.tokens[spacingId].proposal.name, localSpacingName)
})

test("an svg with markup stays a boundary and skips the untraversed warning", () => {
  const markup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path fill="currentColor" d="M0 0h10v10z"></path></svg>`
  const box = { x: 0, y: 0, width: 16, height: 16 }
  const digest = generateDigest(input({
    component: { id: "icons", type: "section", rootIds: ["n-painted", "n-bare", "n-frame"] },
    structure: {
      nodes: {
        "n-painted": node({ tag: "svg", boundary: "svg", markup, untraversedChildren: 1, box }),
        "n-bare": node({ tag: "svg", boundary: "svg", untraversedChildren: 1, box: { ...box, x: 20 } }),
        "n-frame": node({ tag: "iframe", boundary: "iframe", markup: "<iframe></iframe>", untraversedChildren: 1, box: { ...box, x: 40 } }),
      },
      warnings: [
        { code: "unsupported-boundary", message: "svg content was not traversed", nodeIds: ["n-painted"] },
        { code: "unsupported-boundary", message: "svg content was not traversed", nodeIds: ["n-bare"] },
        { code: "unsupported-boundary", message: "iframe content was not traversed", nodeIds: ["n-frame"] },
      ],
    },
    computed: {
      nodes: {
        "n-painted": css({ color: "rgb(27, 49, 88)" }),
        "n-bare": css(),
        "n-frame": css(),
      },
    },
  })) as {
    nodes: Record<string, { children: string[]; boundary: { kind: string; markup: { status: string; value: string } }; styles: { typography: { value: { color: { value: string } } } } }>
    unsupported: { feature: string; message: string; nodeIds?: string[] }[]
    warnings: { code: string; nodeIds?: string[] }[]
  }
  validateDigest(digest)
  assert.equal(digest.nodes["n-painted"].boundary.kind, "svg")
  assert.deepEqual(digest.nodes["n-painted"].children, [])
  assert.equal(digest.nodes["n-painted"].boundary.markup.status, "value")
  assert.equal(digest.nodes["n-painted"].boundary.markup.value, markup)
  assert.equal(digest.nodes["n-painted"].styles.typography.value.color.value, "rgb(27, 49, 88)")
  const warnings = digest.unsupported.filter((item) => item.feature === "untraversed-boundary")
  assert.deepEqual(warnings.map((item) => item.nodeIds?.[0]).sort(), ["n-bare", "n-frame"])
  assert.equal(warnings.find((item) => item.nodeIds?.[0] === "n-bare")?.message, "svg content was not traversed. Static contents inside the boundary are unsupported.")
  const copied = digest.warnings.filter((item) => item.code === "unsupported-boundary")
  assert.deepEqual(copied.map((item) => item.nodeIds?.[0]).sort(), ["n-bare", "n-frame"])
})
