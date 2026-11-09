/**
 * Component digest schema 2.0.0.
 * Measurements use status so a stored zero is not an empty string, an unsupported
 * keyword, or a property the capture never wrote.
 */

export const SCHEMA_VERSION = "2.0.0"
export const ID_STABILITY = "capture-local"

export type Measurement =
  | { status: "value"; value: string; derivation?: "measured" | "inferred" }
  | { status: "zero"; value: string; derivation?: "measured" | "inferred" }
  | { status: "empty"; value: string }
  | { status: "unsupported"; raw: string; reason: string }
  | { status: "missing"; reason: string }

export class DigestValidationError extends Error {
  readonly errors: string[]
  constructor(errors: string[]) {
    super(errors.join("\n"))
    this.name = "DigestValidationError"
    this.errors = errors
  }
}

type Obj = Record<string, unknown>

const TYPOGRAPHY = ["fontFamily", "fontSize", "fontWeight", "lineHeight", "letterSpacing", "textTransform", "color"]
const SPACING = [
  "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
  "marginTop", "marginRight", "marginBottom", "marginLeft",
  "rowGap", "columnGap",
]
const BORDER = [
  ...["Top", "Right", "Bottom", "Left"].flatMap((side) => [`border${side}Width`, `border${side}Style`, `border${side}Color`]),
  "borderTopLeftRadius", "borderTopRightRadius", "borderBottomRightRadius", "borderBottomLeftRadius",
]

function isObj(value: unknown): value is Obj {
  return !!value && typeof value === "object" && !Array.isArray(value)
}

function measurement(value: unknown): value is Measurement {
  if (!isObj(value) || typeof value.status !== "string") return false
  if (value.status === "missing") return typeof value.reason === "string"
  if (value.status === "unsupported") return typeof value.raw === "string" && typeof value.reason === "string"
  if (value.status === "value" || value.status === "zero" || value.status === "empty") return typeof value.value === "string"
  return false
}

/** A required measurement was captured, including an explicit zero, empty, or unsupported keyword. */
export function measurementPresent(value: unknown): boolean {
  return measurement(value) && value.status !== "missing"
}

export function validateDigest(digest: unknown): void {
  const errors: string[] = []
  const fail = (path: string, message: string) => errors.push(`${path}: ${message}`)

  if (!isObj(digest)) {
    throw new DigestValidationError(["digest: expected an object"])
  }
  if (digest.schemaVersion !== SCHEMA_VERSION) fail("schemaVersion", `expected ${SCHEMA_VERSION}`)
  if (digest.idStability !== ID_STABILITY) fail("idStability", `expected ${ID_STABILITY}`)

  checkCapture(digest.capture, fail)
  const nodes = isObj(digest.nodes) ? digest.nodes : null
  if (!nodes) fail("nodes", "expected an object keyed by capture-local node id")
  const tokens = isObj(digest.tokens) ? digest.tokens : null
  if (!tokens) fail("tokens", "expected an object keyed by token id")
  const assets = Array.isArray(digest.assets) ? digest.assets : null
  if (!assets) fail("assets", "expected an array")

  const nodeIds = new Set(nodes ? Object.keys(nodes) : [])
  const tokenIds = new Set(tokens ? Object.keys(tokens) : [])
  const assetIds = new Set<string>()
  if (assets) {
    assets.forEach((asset, index) => {
      if (!isObj(asset) || typeof asset.id !== "string") {
        fail(`assets[${index}]`, "missing id")
        return
      }
      assetIds.add(asset.id)
      if (typeof asset.nodeId !== "string" || !nodeIds.has(asset.nodeId)) fail(`assets[${index}].nodeId`, "dangling node reference")
      if (typeof asset.originalUrl !== "string") fail(`assets[${index}].originalUrl`, "missing original url")
      for (const key of ["usablePath", "naturalWidth", "naturalHeight"]) {
        if (!measurement(asset[key])) fail(`assets[${index}].${key}`, "expected a measurement")
      }
    })
  }

  const ref = (path: string, id: unknown) => {
    if (typeof id !== "string" || !tokenIds.has(id)) fail(path, "dangling token reference")
  }
  const nodeRef = (path: string, id: unknown) => {
    if (typeof id !== "string" || !nodeIds.has(id)) fail(path, "dangling node reference")
  }

  if (nodes) {
    for (const [id, node] of Object.entries(nodes)) {
      const path = `nodes.${id}`
      if (!isObj(node)) {
        fail(path, "expected an object")
        continue
      }
      if (node.id !== id) fail(`${path}.id`, "key and id differ")
      if (typeof node.sourceId !== "string" || !node.sourceId) fail(`${path}.sourceId`, "missing source id")
      if (typeof node.tag !== "string" || !node.tag) fail(`${path}.tag`, "missing tag")
      if (!measurementPresent(node.selector)) fail(`${path}.selector`, "missing required selector")
      if (!measurement(node.domId)) fail(`${path}.domId`, "expected a measurement")
      checkGeometry(node.geometry, `${path}.geometry`, fail)
      checkLayout(node.layout, `${path}.layout`, fail)
      if (!Array.isArray(node.children)) fail(`${path}.children`, "expected an array")
      else node.children.forEach((child, index) => nodeRef(`${path}.children[${index}]`, child))
      if (node.parentId !== null && node.parentId !== undefined) nodeRef(`${path}.parentId`, node.parentId)
      checkStyles(node.styles, `${path}.styles`, fail, ref)
      checkText(node.text, `${path}.text`, fail, nodeRef, ref)
      if (node.labelNodes !== undefined) checkLabels(node.labelNodes, `${path}.labelNodes`, fail, nodeRef, ref)
      if (Array.isArray(node.assetIds)) node.assetIds.forEach((assetId, index) => {
        if (typeof assetId !== "string" || !assetIds.has(assetId)) fail(`${path}.assetIds[${index}]`, "dangling asset reference")
      })
      else fail(`${path}.assetIds`, "expected an array")
      checkPseudos(node.pseudos, `${path}.pseudos`, fail)
      checkEffects(node.effects, `${path}.effects`, fail)
    }
    for (const [id, node] of Object.entries(nodes)) {
      if (!isObj(node) || !Array.isArray(node.children)) continue
      node.children.forEach((child) => {
        const childNode = nodes[String(child)]
        if (isObj(childNode) && childNode.parentId !== id) fail(`nodes.${id}.children`, `${String(child)} does not name this parent`)
      })
    }
  }

  checkGroups(digest.groups, nodes, fail, nodeRef, ref)
  checkHierarchy(digest.hierarchy, nodeIds, nodes, fail)
  checkComponent(digest.component, nodeIds, nodes, fail)
  checkTokens(tokens, tokenIds, fail)
  checkEvidence(digest.evidence, nodeIds, fail)
  checkFonts(digest.fonts, fail)
  checkLinks(digest.links, nodeIds, fail)
  checkProvenance(digest.provenance, nodeIds, fail)
  if (!Array.isArray(digest.warnings)) fail("warnings", "expected an array")
  if (!Array.isArray(digest.unsupported)) fail("unsupported", "expected an array")

  if (errors.length) throw new DigestValidationError(errors)
}

function checkCapture(capture: unknown, fail: (path: string, message: string) => void) {
  if (!isObj(capture)) {
    fail("capture", "expected an object")
    return
  }
  for (const key of ["captureId", "url", "state"]) {
    if (typeof capture[key] !== "string" || !String(capture[key]).length) fail(`capture.${key}`, "missing required identity")
  }
  if (!isObj(capture.viewport) || !Number.isFinite(capture.viewport.width) || !Number.isFinite(capture.viewport.height)) {
    fail("capture.viewport", "width and height are required numbers")
  }
  for (const key of ["finalUrl", "language", "timestamp"]) {
    if (!measurement(capture[key])) fail(`capture.${key}`, "expected a value or an explicit missing measurement")
    else if (capture[key] && isObj(capture[key]) && capture[key].status === "value" && !String(capture[key].value).length) {
      fail(`capture.${key}`, "empty value")
    }
  }
  if (!isObj(capture.config)) fail("capture.config", "expected an object")
}

function checkGeometry(geometry: unknown, path: string, fail: (path: string, message: string) => void) {
  if (!isObj(geometry)) {
    fail(path, "missing required geometry")
    return
  }
  if (geometry.status === "missing") {
    fail(path, "missing required geometry")
    return
  }
  if (geometry.status !== "value") {
    fail(path, "expected measured geometry")
    return
  }
  for (const key of ["x", "y", "width", "height"]) {
    if (!Number.isFinite(geometry[key])) fail(`${path}.${key}`, "missing required measured number")
  }
}

function checkLayout(layout: unknown, path: string, fail: (path: string, message: string) => void) {
  if (!isObj(layout)) {
    fail(path, "missing layout")
    return
  }
  for (const key of ["display", "visibility", "position"]) {
    if (typeof layout[key] !== "string" || !String(layout[key]).length) fail(`${path}.${key}`, "missing required measured layout")
  }
  if (typeof layout.siblingOrder !== "number" || !Number.isFinite(layout.siblingOrder)) fail(`${path}.siblingOrder`, "missing order")
  if (!measurementPresent(layout.opacity)) fail(`${path}.opacity`, "missing required opacity")
  if (!measurement(layout.zIndex)) fail(`${path}.zIndex`, "expected a measurement")
  else if (isObj(layout.zIndex) && layout.zIndex.status === "missing") fail(`${path}.zIndex`, "z-index was flagged but the value is missing")
}

function checkStyles(
  styles: unknown,
  path: string,
  fail: (path: string, message: string) => void,
  ref: (path: string, id: unknown) => void,
) {
  if (!isObj(styles) || styles.status === "missing") {
    fail(path, "missing required computed style")
    return
  }
  const typography = styles.typography
  if (!isObj(typography)) fail(`${path}.typography`, "missing typography")
  else {
    ref(`${path}.typography.ref`, typography.ref)
    ref(`${path}.typography.colourRef`, typography.colourRef)
    requireFields(typography.value, TYPOGRAPHY, `${path}.typography.value`, fail)
  }
  const fill = styles.fill
  if (!isObj(fill)) fail(`${path}.fill`, "missing fill")
  else {
    ref(`${path}.fill.ref`, fill.ref)
    if (!measurementPresent(fill.backgroundColor)) fail(`${path}.fill.backgroundColor`, "missing required fill")
    if (!measurementPresent(fill.backgroundImage)) fail(`${path}.fill.backgroundImage`, "missing required background image")
  }
  if (!measurementPresent(styles.shadow)) fail(`${path}.shadow`, "missing required shadow")
  const border = styles.border
  if (!isObj(border)) fail(`${path}.border`, "missing border")
  else {
    ref(`${path}.border.ref`, border.ref)
    requireFields(border.value, BORDER, `${path}.border.value`, fail)
    if (!isObj(border.colourRefs)) fail(`${path}.border.colourRefs`, "expected colour references")
    else for (const [key, id] of Object.entries(border.colourRefs)) ref(`${path}.border.colourRefs.${key}`, id)
  }
  const spacing = styles.spacing
  if (!isObj(spacing)) fail(`${path}.spacing`, "missing spacing")
  else {
    ref(`${path}.spacing.ref`, spacing.ref)
    requireFields(spacing.value, SPACING, `${path}.spacing.value`, fail)
  }
}

function requireFields(value: unknown, keys: string[], path: string, fail: (path: string, message: string) => void) {
  if (!isObj(value)) {
    fail(path, "missing measured fields")
    return
  }
  for (const key of keys) {
    if (!measurementPresent(value[key])) fail(`${path}.${key}`, "missing required measured field")
  }
}

function checkText(
  text: unknown,
  path: string,
  fail: (path: string, message: string) => void,
  nodeRef: (path: string, id: unknown) => void,
  ref: (path: string, id: unknown) => void,
) {
  if (!isObj(text) || !measurement(text.exact) || !Array.isArray(text.runs)) {
    fail(path, "expected exact text and runs")
    return
  }
  if (text.exact.status === "missing") fail(`${path}.exact`, "missing required text")
  const joined = text.runs.map((run) => (isObj(run) && typeof run.text === "string" ? run.text : "")).join("")
  if (text.exact.status === "empty" && text.runs.length) fail(`${path}.runs`, "empty text has runs")
  if (text.exact.status === "value" && joined !== text.exact.value) fail(`${path}.runs`, "runs do not match exact text")
  text.runs.forEach((run, index) => {
    if (!isObj(run)) {
      fail(`${path}.runs[${index}]`, "expected an object")
      return
    }
    nodeRef(`${path}.runs[${index}].nodeId`, run.nodeId)
    ref(`${path}.runs[${index}].typographyRef`, run.typographyRef)
  })
}

function checkLabels(
  labels: unknown,
  path: string,
  fail: (path: string, message: string) => void,
  nodeRef: (path: string, id: unknown) => void,
  ref: (path: string, id: unknown) => void,
) {
  if (!Array.isArray(labels) || !labels.length) {
    fail(path, "button and field controls need an explicit label node")
    return
  }
  labels.forEach((label, index) => {
    if (!isObj(label)) {
      fail(`${path}[${index}]`, "expected an object")
      return
    }
    nodeRef(`${path}[${index}].nodeId`, label.nodeId)
    ref(`${path}[${index}].typographyRef`, label.typographyRef)
    if (!measurementPresent(label.text)) fail(`${path}[${index}].text`, "missing label text")
  })
}

function checkPseudos(pseudos: unknown, path: string, fail: (path: string, message: string) => void) {
  if (!isObj(pseudos) || (pseudos.status !== "empty" && pseudos.status !== "missing" && pseudos.status !== "value")) {
    fail(path, "expected empty, missing, or value")
    return
  }
  if (pseudos.status === "missing") fail(path, "a pseudo-element was flagged but not measured")
  if (pseudos.status !== "value") return
  if (!isObj(pseudos.elements)) {
    fail(`${path}.elements`, "missing pseudo elements")
    return
  }
  for (const [name, element] of Object.entries(pseudos.elements)) {
    const elementPath = `${path}.elements.${name}`
    if (!isObj(element)) {
      fail(elementPath, "expected an object")
      continue
    }
    if (!measurementPresent(element.content)) fail(`${elementPath}.content`, "missing content")
    requireFields(element, [...TYPOGRAPHY, ...SPACING, ...BORDER, "backgroundColor", "backgroundImage", "opacity", "width", "height"], elementPath, fail)
  }
}

function checkEffects(effects: unknown, path: string, fail: (path: string, message: string) => void) {
  if (!isObj(effects)) {
    fail(path, "expected empty or measured effects")
    return
  }
  if (effects.status === "empty") return
  if (effects.status !== "value") {
    fail(path, "expected empty or measured effects")
    return
  }
  for (const key of ["transform", "clipping", "filter"]) {
    if (effects[key] !== undefined && (!isObj(effects[key]) || !measurementPresent(effects[key]))) {
      fail(`${path}.${key}`, "missing required measured field")
    }
  }
}

function checkGroups(
  groups: unknown,
  nodes: Obj | null,
  fail: (path: string, message: string) => void,
  nodeRef: (path: string, id: unknown) => void,
  ref: (path: string, id: unknown) => void,
) {
  if (!Array.isArray(groups)) {
    fail("groups", "expected an array")
    return
  }
  groups.forEach((group, index) => {
    const path = `groups[${index}]`
    if (!isObj(group) || !isObj(group.styleRefs) || !Array.isArray(group.occurrences)) {
      fail(path, "expected style refs and occurrences")
      return
    }
    const refs = group.styleRefs
    if (Array.isArray(refs.typography)) refs.typography.forEach((id, i) => ref(`${path}.styleRefs.typography[${i}]`, id))
    else fail(`${path}.styleRefs.typography`, "expected token references")
    ref(`${path}.styleRefs.fill`, refs.fill)
    ref(`${path}.styleRefs.border`, refs.border)
    ref(`${path}.styleRefs.controlTypography`, refs.controlTypography)
    if (Array.isArray(refs.textColours)) refs.textColours.forEach((id, i) => ref(`${path}.styleRefs.textColours[${i}]`, id))
    else fail(`${path}.styleRefs.textColours`, "expected token references")
    group.occurrences.forEach((occurrence, occurrenceIndex) => {
      if (!isObj(occurrence)) {
        fail(`${path}.occurrences[${occurrenceIndex}]`, "expected an object")
        return
      }
      nodeRef(`${path}.occurrences[${occurrenceIndex}].nodeId`, occurrence.nodeId)
      ref(`${path}.occurrences[${occurrenceIndex}].spacingRef`, occurrence.spacingRef)
      if (nodes && typeof occurrence.nodeId === "string" && isObj(nodes[occurrence.nodeId]) && !Array.isArray(nodes[occurrence.nodeId].labelNodes)) {
        fail(`${path}.occurrences[${occurrenceIndex}].nodeId`, "missing explicit label node")
      }
    })
  })
}

function checkHierarchy(
  hierarchy: unknown,
  nodeIds: Set<string>,
  nodes: Obj | null,
  fail: (path: string, message: string) => void,
) {
  if (!Array.isArray(hierarchy)) {
    fail("hierarchy", "expected an array")
    return
  }
  const seen = new Set<string>()
  hierarchy.forEach((entry, index) => {
    if (!isObj(entry) || typeof entry.id !== "string") {
      fail(`hierarchy[${index}]`, "missing id")
      return
    }
    seen.add(entry.id)
    if (!nodeIds.has(entry.id)) fail(`hierarchy[${index}].id`, "dangling node reference")
    if (typeof entry.order !== "number") fail(`hierarchy[${index}].order`, "missing order")
  })
  for (const id of nodeIds) if (!seen.has(id)) fail("hierarchy", `missing node ${id}`)
  if (nodes) {
    for (const id of nodeIds) {
      const node = nodes[id]
      if (!isObj(node) || node.parentId === null || typeof node.parentId !== "string") continue
      if (!nodeIds.has(node.parentId)) fail(`nodes.${id}.parentId`, "dangling node reference")
    }
  }
}

function checkComponent(
  component: unknown,
  nodeIds: Set<string>,
  nodes: Obj | null,
  fail: (path: string, message: string) => void,
) {
  if (!isObj(component) || typeof component.id !== "string" || typeof component.type !== "string" || !Array.isArray(component.rootIds)) {
    fail("component", "id, type, and rootIds are required")
    return
  }
  if (!component.rootIds.length) fail("component.rootIds", "a component needs a source root")
  component.rootIds.forEach((id, index) => {
    if (typeof id !== "string" || !nodeIds.has(id)) fail(`component.rootIds[${index}]`, "dangling node reference")
    else if (nodes && isObj(nodes[id]) && (component.type === "button" || component.type === "field") && !Array.isArray(nodes[id].labelNodes)) {
      fail(`nodes.${id}.labelNodes`, "missing explicit label node")
    }
  })
}

function checkTokens(tokens: Obj | null, tokenIds: Set<string>, fail: (path: string, message: string) => void) {
  if (!tokens) return
  for (const [id, token] of Object.entries(tokens)) {
    if (!isObj(token) || token.id !== id) fail(`tokens.${id}`, "key and id differ")
    else if (!isObj(token.proposal) || typeof token.proposal.name !== "string" || !Array.isArray(token.proposal.roles)) {
      fail(`tokens.${id}.proposal`, "name and roles are required proposals")
    }
    if (tokenIds.has(id) && isObj(token) && !isObj(token.value) && typeof token.value !== "object") {
      fail(`tokens.${id}.value`, "missing resolved value")
    }
    if (isObj(token) && token.kind === "colour") {
      if (!isObj(token.value) || !measurementPresent((token.value as Obj).color)) fail(`tokens.${id}.value.color`, "missing measured colour")
    }
  }
}

function checkEvidence(evidence: unknown, nodeIds: Set<string>, fail: (path: string, message: string) => void) {
  if (!isObj(evidence)) {
    fail("evidence", "expected an object")
    return
  }
  const shot = evidence.screenshot
  if (!isObj(shot)) fail("evidence.screenshot", "expected a measurement")
  else if (shot.status === "value" && (typeof shot.path !== "string" || !shot.path)) fail("evidence.screenshot.path", "missing path")
  else if (shot.status !== "value" && shot.status !== "missing") fail("evidence.screenshot", "expected value or missing")
  const crops = evidence.crops
  if (!isObj(crops) || !Array.isArray(crops.items)) fail("evidence.crops", "expected a status and items")
  else if (crops.status === "value") {
    crops.items.forEach((crop, index) => {
      if (!isObj(crop) || typeof crop.nodeId !== "string" || !nodeIds.has(crop.nodeId)) fail(`evidence.crops.items[${index}].nodeId`, "dangling node reference")
      if (!isObj(crop) || typeof crop.path !== "string" || !crop.path) fail(`evidence.crops.items[${index}].path`, "missing path")
    })
  }
}

function checkFonts(fonts: unknown, fail: (path: string, message: string) => void) {
  if (!Array.isArray(fonts)) {
    fail("fonts", "expected an array")
    return
  }
  fonts.forEach((font, index) => {
    if (!isObj(font) || typeof font.family !== "string") fail(`fonts[${index}]`, "missing family")
    if (!isObj(font) || !measurement(font.availability)) fail(`fonts[${index}].availability`, "expected a measurement")
    if (!isObj(font) || !measurement(font.source)) fail(`fonts[${index}].source`, "expected a measurement")
  })
}

function checkLinks(links: unknown, nodeIds: Set<string>, fail: (path: string, message: string) => void) {
  if (!Array.isArray(links)) {
    fail("links", "expected an array")
    return
  }
  links.forEach((link, index) => {
    if (!isObj(link)) {
      fail(`links[${index}]`, "expected an object")
      return
    }
    if (typeof link.nodeId !== "string" || !nodeIds.has(link.nodeId)) fail(`links[${index}].nodeId`, "dangling node reference")
    if (typeof link.label !== "string") fail(`links[${index}].label`, "missing visible label")
    if (!isObj(link.destination) || link.destination.status !== "unsupported") fail(`links[${index}].destination`, "destinations stay unsupported")
    if ("href" in link) fail(`links[${index}].href`, "link destinations are not digest fields")
  })
}

function checkProvenance(provenance: unknown, nodeIds: Set<string>, fail: (path: string, message: string) => void) {
  if (!isObj(provenance) || !Array.isArray(provenance.roots) || !Array.isArray(provenance.folded) || !Array.isArray(provenance.omitted)) {
    fail("provenance", "roots, folded, and omitted are required")
    return
  }
  provenance.roots.forEach((root, index) => {
    if (!isObj(root) || typeof root.nodeId !== "string" || !nodeIds.has(root.nodeId)) fail(`provenance.roots[${index}].nodeId`, "dangling node reference")
    if (!isObj(root) || !Array.isArray(root.sourceIds)) fail(`provenance.roots[${index}].sourceIds`, "missing source ids")
  })
  provenance.folded.forEach((entry, index) => {
    if (!isObj(entry) || typeof entry.sourceId !== "string") fail(`provenance.folded[${index}]`, "missing source id")
    else if (nodeIds.has(entry.sourceId)) fail(`provenance.folded[${index}].sourceId`, "folded wrapper is still in the tree")
    if (isObj(entry) && Array.isArray(entry.childSourceIds)) {
      entry.childSourceIds.forEach((id, childIndex) => {
        if (typeof id !== "string" || !nodeIds.has(id)) fail(`provenance.folded[${index}].childSourceIds[${childIndex}]`, "dangling node reference")
      })
    }
  })
  provenance.omitted.forEach((entry, index) => {
    if (!isObj(entry) || typeof entry.sourceId !== "string") fail(`provenance.omitted[${index}]`, "missing source id")
    else if (nodeIds.has(entry.sourceId)) fail(`provenance.omitted[${index}].sourceId`, "omitted node is still in the tree")
  })
}
