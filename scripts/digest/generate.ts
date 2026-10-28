/**
 * Deterministic component digest generator.
 * Same structure and computed records produce the same semantic digest.
 * Grouping uses measured colour, border, and type. It does not read labels or selectors.
 */

import { ID_STABILITY, SCHEMA_VERSION, type Measurement } from "./schema.ts"

const BOX_TOLERANCE_PX = 0.5
const SIDES = ["Top", "Right", "Bottom", "Left"] as const

export type Box = { x: number; y: number; width: number; height: number }
export type StructureNode = {
  tag: string
  domId?: string
  classes?: string[]
  selector?: string
  parentId?: string | null
  order?: number
  children?: string[]
  box?: Box
  render?: { display?: string; visibility?: string; opacity?: string; position?: string }
  traits?: string[]
  content?: (string | { id: string })[]
  field?: Record<string, string | boolean>
  media?: { kind?: string; url?: string }[]
  boundary?: string
  untraversedChildren?: number
  markup?: string
}
export type ComputedStyle = Record<string, string | undefined> & {
  pseudos?: Record<string, Record<string, string | undefined>>
}
export type Warning = { code: string; message: string; nodeIds?: string[] }

export type DigestInput = {
  capture?: {
    captureId?: string
    url?: string
    finalUrl?: string
    language?: string
    timestamp?: string
    viewport?: { width: number; height: number }
    state?: string
    config?: Record<string, string | number | boolean>
  }
  structure: {
    url?: string
    slug?: string
    viewport?: { width: number; height: number } | null
    state?: string
    nodes: Record<string, StructureNode>
    warnings?: Warning[]
  }
  computed: {
    nodes?: Record<string, ComputedStyle>
    skipped?: { nodeId?: string; reason?: string }[]
    unresolved?: { nodeId?: string; selector?: string; matches?: number }[]
  }
  component: { id: string; type: string; rootIds: string[] }
  evidence?: {
    screenshot?: { path: string; width?: number; height?: number }
    crops?: { nodeId: string; path: string }[]
    assets?: { nodeId: string; originalUrl: string; usablePath?: string; naturalWidth?: number; naturalHeight?: number }[]
    fonts?: { family: string; availability: "available" | "unavailable"; source?: string; weights?: string[] }[]
  }
}

const PAINT_TRAITS = new Set(["background", "background-image", "border", "shadow", "outline", "opacity", "filter", "blend", "::before", "::after"])
const LAYOUT_TRAITS = new Set(["padding", "margin", "transform", "clip", "overflow", "position", "z-index"])

export function generateDigest(input: DigestInput): Record<string, unknown> {
  const structure = input.structure.nodes
  for (const rootId of input.component.rootIds) {
    if (!structure[rootId]) throw new Error(`Component root ${rootId} is not in the structure`)
  }
  const computed = input.computed.nodes ?? {}
  const simplified = simplify(input)
  const preorder = walk(simplified.roots, simplified.children)
  const styles = new Map<string, ReturnType<typeof measureNode>>()
  for (const id of preorder) styles.set(id, measureNode(structure[id], computed[id]))

  const colourKeys = new Set<string>()
  const typographyKeys = new Map<string, Obj>()
  const borderKeys = new Map<string, Obj>()
  const spacingKeys = new Map<string, Obj>()
  for (const measured of styles.values()) {
    collectColour(colourKeys, measured.typography.color)
    collectColour(colourKeys, measured.fill.backgroundColor)
    for (const key of BORDER_COLOUR_KEYS) collectColour(colourKeys, measured.border[key])
    for (const element of Object.values(measured.pseudoElements)) {
      collectColour(colourKeys, element.color)
      collectColour(colourKeys, element.backgroundColor)
      for (const key of BORDER_COLOUR_KEYS) collectColour(colourKeys, element[key])
    }
    typographyKeys.set(canon(measured.typography), measured.typography)
    borderKeys.set(canon(measured.border), measured.border)
    spacingKeys.set(canon(measured.spacing), measured.spacing)
  }

  const colourIds = assignIds("colour", [...colourKeys].sort())
  const typographyIds = assignIds("typography", [...typographyKeys.keys()].sort())
  const borderIds = assignIds("border", [...borderKeys.keys()].sort())
  const spacingIds = assignIds("spacing", [...spacingKeys.keys()].sort())
  const colourRoles = new Map<string, Set<string>>()
  const noteRole = (measurement: Measurement, role: string) => {
    if (measurement.status !== "value") return
    const id = colourIds.get(measurement.value)
    if (!id) return
    const roles = colourRoles.get(id) ?? new Set<string>()
    roles.add(role)
    colourRoles.set(id, roles)
  }

  const nodeStyles = new Map<string, Obj>()
  for (const id of preorder) {
    const measured = styles.get(id)!
    noteRole(measured.typography.color, "text")
    noteRole(measured.fill.backgroundColor, "fill")
    for (const key of BORDER_COLOUR_KEYS) noteRole(measured.border[key], "border")
    nodeStyles.set(id, {
      typography: {
        ref: typographyIds.get(canon(measured.typography)),
        colourRef: colourRef(colourIds, measured.typography.color),
        value: measured.typography,
      },
      fill: {
        ref: colourRef(colourIds, measured.fill.backgroundColor),
        role: "fill",
        backgroundColor: measured.fill.backgroundColor,
        backgroundImage: measured.fill.backgroundImage,
      },
      border: {
        ref: borderIds.get(canon(measured.border)),
        colourRefs: Object.fromEntries(BORDER_COLOUR_KEYS.map((key) => [key, colourRef(colourIds, measured.border[key])])),
        value: measured.border,
      },
      spacing: { ref: spacingIds.get(canon(measured.spacing)), value: measured.spacing },
      shadow: measured.shadow,
    })
  }

  const runs = new Map<string, { text: string; nodeId: string }[]>()
  for (const id of preorder) runs.set(id, textRuns(id, structure, simplified.children))
  const occurrences = occurrenceIds(input, preorder, structure, computed)
  const groups = groupOccurrences(input, occurrences, structure, computed, runs, nodeStyles)

  const assets: Obj[] = []
  const assetIdsByNode = new Map<string, string[]>()
  let assetSeq = 1
  for (const id of preorder) {
    const ids: string[] = []
    for (const media of structure[id].media ?? []) {
      if (!media.url) continue
      const supplied = (input.evidence?.assets ?? []).find((asset) => asset.nodeId === id && asset.originalUrl === media.url)
      const assetId = `asset.${String(assetSeq++).padStart(4, "0")}`
      ids.push(assetId)
      assets.push({
        id: assetId,
        nodeId: id,
        kind: media.kind ?? "unknown",
        originalUrl: media.url,
        usablePath: supplied?.usablePath
          ? { status: "value", value: supplied.usablePath }
          : { status: "missing", reason: "No usable asset path was supplied for this original url." },
        naturalWidth: numberMeasurement(supplied?.naturalWidth, "Natural width was not supplied."),
        naturalHeight: numberMeasurement(supplied?.naturalHeight, "Natural height was not supplied."),
      })
    }
    assetIdsByNode.set(id, ids)
  }

  const nodes: Obj = {}
  for (const id of preorder) {
    const source = structure[id]
    const measured = styles.get(id)!
    const nodeRuns = runs.get(id) ?? []
    const exact = nodeRuns.map((run) => run.text).join("")
    const style = nodeStyles.get(id)!
    nodes[id] = {
      id,
      sourceId: id,
      role: occurrences.includes(id) ? "control" : nodeRuns.some((run) => run.nodeId === id) ? "label" : "node",
      tag: source.tag,
      domId: source.domId ? { status: "value", value: source.domId } : { status: "empty", value: "" },
      classes: source.classes?.length ? { status: "value", items: [...source.classes] } : { status: "empty" },
      selector: source.selector ? { status: "value", value: source.selector } : { status: "missing", reason: "Structure node has no selector." },
      parentId: parentOf(id, simplified.children, simplified.roots),
      children: simplified.children.get(id) ?? [],
      geometry: geometryOf(source.box),
      layout: layoutOf(source, computed[id], measured.opacity, siblingIndex(id, simplified.children, simplified.roots)),
      effects: effectsOf(source, computed[id]),
      text: {
        exact: exact ? { status: "value", value: exact } : { status: "empty", value: "" },
        runs: nodeRuns.map((run) => ({ ...run, typographyRef: (nodeStyles.get(run.nodeId)!.typography as Obj).ref })),
      },
      ...(occurrences.includes(id) ? { labelNodes: labelNodes(nodeRuns, style, nodeStyles, id) } : {}),
      styles: style,
      pseudos: pseudoStatus(source, measured.pseudoElements),
      assetIds: assetIdsByNode.get(id) ?? [],
      ...(source.field ? { field: source.field } : {}),
      ...(source.boundary ? { boundary: boundaryOf(source) } : {}),
    }
  }

  const fonts = fontRecords(preorder, styles, input.evidence?.fonts ?? [])
  const links = linkRecords(preorder, structure, runs)
  const warnings = warningRecords(input, preorder, styles, assets, fonts)
  const unsupported = unsupportedRecords(preorder, structure, links, styles)
  const capture = captureOf(input)

  return sortValue({
    schemaVersion: SCHEMA_VERSION,
    idStability: ID_STABILITY,
    capture,
    component: { id: input.component.id, type: input.component.type, rootIds: [...input.component.rootIds] },
    hierarchy: preorder.map((id) => ({
      id,
      parentId: (nodes[id] as Obj).parentId,
      order: ((nodes[id] as Obj).layout as Obj).siblingOrder,
      childIds: (nodes[id] as Obj).children,
    })),
    nodes,
    groups,
    tokens: tokenRecords(colourIds, colourRoles, typographyIds, typographyKeys, borderIds, borderKeys, spacingIds, spacingKeys),
    assets,
    fonts,
    links,
    evidence: {
      screenshot: input.evidence?.screenshot
        ? { status: "value", path: input.evidence.screenshot.path, ...(input.evidence.screenshot.width !== undefined ? { width: input.evidence.screenshot.width } : {}), ...(input.evidence.screenshot.height !== undefined ? { height: input.evidence.screenshot.height } : {}) }
        : { status: "missing", reason: "No screenshot path was supplied." },
      crops: input.evidence?.crops
        ? input.evidence.crops.length
          ? { status: "value", items: input.evidence.crops.map((crop) => ({ nodeId: crop.nodeId, path: crop.path })) }
          : { status: "empty", items: [] }
        : { status: "missing", reason: "No per-component crop was supplied.", items: [] },
    },
    warnings,
    unsupported,
    provenance: {
      roots: simplified.roots.map((id) => ({ nodeId: id, sourceIds: [id] })),
      folded: simplified.folded,
      omitted: simplified.omitted,
    },
  }) as Record<string, unknown>
}

type Obj = Record<string, unknown>
type MeasuredNode = ReturnType<typeof measureNode>

const BORDER_KEYS = [
  ...SIDES.flatMap((side) => [`border${side}Width`, `border${side}Style`, `border${side}Color`]),
  "borderTopLeftRadius", "borderTopRightRadius", "borderBottomRightRadius", "borderBottomLeftRadius",
]
const BORDER_COLOUR_KEYS = SIDES.map((side) => `border${side}Color`)
const SPACING_KEYS = [
  "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
  "marginTop", "marginRight", "marginBottom", "marginLeft",
  "rowGap", "columnGap",
]

function simplify(input: DigestInput) {
  const structure = input.structure.nodes
  const computed = input.computed.nodes ?? {}
  const children = new Map<string, string[]>()
  const folded: { sourceId: string; reason: string; childSourceIds: string[] }[] = []
  const omitted: { sourceId: string; reason: string }[] = []
  const roots: string[] = []

  const omitAll = (id: string) => {
    const node = structure[id]
    if (!node) throw new Error(`Structure node ${id} references a missing node while omitting a hidden subtree`)
    omitted.push({ sourceId: id, reason: "display-none" })
    for (const child of node.children ?? []) omitAll(child)
  }

  const visit = (id: string, isRoot: boolean): string[] => {
    const node = structure[id]
    if (!node) throw new Error(`Structure references missing node ${id}`)
    if (!isRoot && node.render?.display === "none") {
      omitAll(id)
      return []
    }
    const keptChildren = (node.children ?? []).flatMap((child) => visit(child, false))
    if (!isRoot && removable(node, keptChildren, structure, computed[id])) {
      folded.push({ sourceId: id, reason: "wrapper-without-effect", childSourceIds: keptChildren })
      return keptChildren
    }
    children.set(id, keptChildren)
    return [id]
  }

  for (const rootId of input.component.rootIds) roots.push(...visit(rootId, true))
  return { roots, children, folded, omitted }
}

function removable(node: StructureNode, keptChildren: string[], structure: Record<string, StructureNode>, computed: ComputedStyle | undefined) {
  if (!keptChildren.length) return false
  if (hasMeaningfulText(node) || node.media?.length || node.field || node.boundary || node.markup) return false
  if ((node.render?.visibility ?? "visible") !== "visible") return false
  if ((node.render?.opacity ?? "1") !== "1") return false
  if ((node.render?.position ?? "static") !== "static") return false
  const display = node.render?.display ?? "block"
  if (display !== "block" && display !== "inline") return false
  if ((node.traits ?? []).some((trait) => PAINT_TRAITS.has(trait) || LAYOUT_TRAITS.has(trait) || trait.startsWith("display:") || trait.startsWith("::"))) return false
  if (!computed) return false
  if (computedShowsEffect(computed)) return false
  const boxes: Box[] = []
  for (const child of keptChildren) {
    const box = structure[child]?.box
    if (!box) return false
    boxes.push(box)
  }
  const union = unionBox(boxes)
  return !!node.box && !!union && sameBox(node.box, union)
}

function computedShowsEffect(style: ComputedStyle) {
  for (const key of ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "marginTop", "marginRight", "marginBottom", "marginLeft"]) {
    if (!isZeroLength(style[key])) return true
  }
  for (const side of SIDES) if (!isZeroLength(style[`border${side}Width`])) return true
  for (const key of ["rowGap", "columnGap"]) {
    const value = style[key]
    if (value !== undefined && value !== "normal" && !isZeroLength(value)) return true
  }
  if (!isTransparent(style.backgroundColor)) return true
  if (style.backgroundImage && style.backgroundImage !== "none") return true
  if (style.boxShadow && style.boxShadow !== "none") return true
  if (style.opacity !== undefined && style.opacity !== "1") return true
  if (style.pseudos && Object.keys(style.pseudos).length) return true
  return false
}

function hasMeaningfulText(node: StructureNode) {
  return (node.content ?? []).some((part) => typeof part === "string" && part.trim().length > 0)
}

function sameBox(a: Box, b: Box) {
  return (["x", "y", "width", "height"] as const).every((key) => Math.abs(a[key] - b[key]) <= BOX_TOLERANCE_PX)
}

function unionBox(boxes: Box[]): Box {
  const x = Math.min(...boxes.map((box) => box.x))
  const y = Math.min(...boxes.map((box) => box.y))
  const right = Math.max(...boxes.map((box) => box.x + box.width))
  const bottom = Math.max(...boxes.map((box) => box.y + box.height))
  return { x, y, width: right - x, height: bottom - y }
}

function isZeroLength(raw: string | undefined) {
  if (raw === undefined || raw === "normal") return false
  return Number.parseFloat(raw) === 0
}

function isTransparent(raw: string | undefined) {
  if (!raw) return true
  const value = raw.replace(/\s+/g, "")
  return value === "transparent" || value === "rgba(0,0,0,0)"
}

function walk(roots: string[], children: Map<string, string[]>) {
  const order: string[] = []
  const visit = (id: string) => {
    order.push(id)
    for (const child of children.get(id) ?? []) visit(child)
  }
  for (const root of roots) visit(root)
  return order
}

function parentOf(id: string, children: Map<string, string[]>, roots: string[]) {
  if (roots.includes(id)) return null
  for (const [parent, kids] of children) if (kids.includes(id)) return parent
  return null
}

function textRuns(id: string, structure: Record<string, StructureNode>, children: Map<string, string[]>) {
  const node = structure[id]
  const runs: { text: string; nodeId: string }[] = []
  for (const part of node.content ?? []) if (typeof part === "string" && part.length) runs.push({ text: part, nodeId: id })
  for (const child of children.get(id) ?? []) runs.push(...textRuns(child, structure, children))
  return runs
}

function visibleBorder(style: ComputedStyle | undefined) {
  if (!style) return false
  return SIDES.some((side) => {
    const width = Number.parseFloat(style[`border${side}Width`] ?? "")
    const borderStyle = style[`border${side}Style`]
    return width > 0 && borderStyle !== undefined && borderStyle !== "none"
  })
}

function subtreeHasText(id: string, structure: Record<string, StructureNode>, seen = new Set<string>()): boolean {
  if (seen.has(id)) return false
  seen.add(id)
  const node = structure[id]
  if (!node) return false
  if (hasMeaningfulText(node)) return true
  return (node.children ?? []).some((child) => subtreeHasText(child, structure, seen))
}

/** Generic control classification from tag, field type, and measured paint. Selectors are not used. */
export function controlKind(node: StructureNode, style: ComputedStyle | undefined, structure: Record<string, StructureNode>, id: string) {
  const fieldType = node.field ? String(node.field.type ?? "") : ""
  if (["button", "submit", "reset", "image"].includes(fieldType)) return "button"
  if (node.field || node.tag === "textarea" || node.tag === "select") return "field"
  if (node.tag === "button") return "button"
  if (node.tag === "a") {
    const painted = !!style && (visibleBorder(style) || !isTransparent(style.backgroundColor))
    if (painted && subtreeHasText(id, structure)) return "button"
    if (subtreeHasText(id, structure)) return "link"
  }
  return "other"
}

function occurrenceIds(input: DigestInput, preorder: string[], structure: Record<string, StructureNode>, computed: Record<string, ComputedStyle>) {
  if (input.component.type === "button" || input.component.type === "field") {
    return input.component.rootIds.filter((id) => preorder.includes(id))
  }
  return preorder.filter((id) => {
    const kind = controlKind(structure[id], computed[id], structure, id)
    return kind === "button" || kind === "field"
  })
}

function groupOccurrences(
  input: DigestInput,
  occurrences: string[],
  structure: Record<string, StructureNode>,
  computed: Record<string, ComputedStyle>,
  runs: Map<string, { text: string; nodeId: string }[]>,
  nodeStyles: Map<string, Obj>,
) {
  const buckets = new Map<string, { signature: Obj; ids: string[] }>()
  for (const id of [...occurrences].sort()) {
    const node = structure[id]
    const style = computed[id] ?? {}
    const nodeRuns = runs.get(id) ?? []
    const labelIds = [...new Set(nodeRuns.map((run) => run.nodeId))]
    const signature = {
      tag: node.tag,
      kind: input.component.type === "button" || input.component.type === "field" ? input.component.type : controlKind(node, style, structure, id),
      fieldType: node.field ? String(node.field.type ?? "") : "",
      controlTypography: pick(style, ["fontFamily", "fontSize", "fontWeight", "lineHeight", "letterSpacing", "textTransform", "color"]),
      labelTypography: (labelIds.length ? labelIds : [id]).map((labelId) => pick(computed[labelId] ?? {}, ["fontFamily", "fontSize", "fontWeight", "lineHeight", "letterSpacing", "textTransform", "color"])),
      fill: style.backgroundColor ?? "",
      backgroundImage: style.backgroundImage ?? "",
      border: pick(style, BORDER_KEYS),
      shadow: style.boxShadow ?? "",
      pseudos: pseudoSignature(style.pseudos),
    }
    const key = canon(signature)
    const bucket = buckets.get(key) ?? { signature, ids: [] }
    bucket.ids.push(id)
    buckets.set(key, bucket)
  }
  return [...buckets.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, bucket], index) => {
    const first = bucket.ids[0]
    const firstRuns = runs.get(first) ?? []
    const labelIds = firstRuns.length ? [...new Set(firstRuns.map((run) => run.nodeId))] : [first]
    const labelRefs = unique(labelIds.map((labelId) => String((nodeStyles.get(labelId)!.typography as Obj).ref)))
    const textColours = unique(labelIds.map((labelId) => String((nodeStyles.get(labelId)!.typography as Obj).colourRef)))
    return {
      id: `group.${String(index + 1).padStart(4, "0")}`,
      kind: String(bucket.signature.kind),
      tag: String(bucket.signature.tag),
      fieldType: String(bucket.signature.fieldType),
      styleRefs: {
        typography: labelRefs,
        textColours,
        fill: (nodeStyles.get(first)!.fill as Obj).ref,
        border: (nodeStyles.get(first)!.border as Obj).ref,
        controlTypography: (nodeStyles.get(first)!.typography as Obj).ref,
      },
      occurrences: bucket.ids.map((id) => ({
        nodeId: id,
        labels: (runs.get(id) ?? []).map((run) => run.text),
        spacingRef: (nodeStyles.get(id)!.spacing as Obj).ref,
      })),
    }
  })
}

function pick(style: ComputedStyle | Record<string, string | undefined>, keys: string[]) {
  return Object.fromEntries(keys.map((key) => [key, style[key] ?? ""]))
}

function pseudoSignature(pseudos: ComputedStyle["pseudos"]) {
  if (!pseudos) return {}
  return Object.fromEntries(Object.keys(pseudos).sort().map((name) => [name, pick(pseudos[name], ["content", "color", "backgroundColor", ...BORDER_KEYS])]))
}

function labelNodes(
  nodeRuns: { text: string; nodeId: string }[],
  style: Obj,
  nodeStyles: Map<string, Obj>,
  controlId: string,
) {
  const ids = nodeRuns.length ? [...new Set(nodeRuns.map((run) => run.nodeId))] : [controlId]
  return ids.map((id) => {
    const ownRuns = nodeRuns.filter((run) => run.nodeId === id).map((run) => run.text).join("")
    const typography = (id === controlId ? style.typography : nodeStyles.get(id)!.typography) as Obj
    return {
      nodeId: id,
      text: ownRuns ? { status: "value", value: ownRuns } : { status: "empty", value: "" },
      typographyRef: typography.ref,
    }
  })
}

function measureNode(node: StructureNode | undefined, style: ComputedStyle | undefined) {
  const reason = (property: string) => `Computed style did not include ${property}.`
  const length = (property: string): Measurement => measureLength(style?.[property], reason(property))
  const text = (property: string): Measurement => measureText(style?.[property], reason(property))
  const colour = (property: string): Measurement => measureColour(style?.[property], reason(property))
  const emptyPaint = (property: string): Measurement => measureEmpty(style?.[property], reason(property))
  const typography = {
    fontFamily: text("fontFamily"),
    fontSize: length("fontSize"),
    fontWeight: length("fontWeight"),
    lineHeight: length("lineHeight"),
    letterSpacing: length("letterSpacing"),
    textTransform: emptyPaint("textTransform"),
    color: colour("color"),
  }
  const fill = { backgroundColor: colour("backgroundColor"), backgroundImage: emptyPaint("backgroundImage") }
  const border = Object.fromEntries(BORDER_KEYS.map((key) => [key, key.endsWith("Color") ? colour(key) : key.endsWith("Style") ? emptyPaint(key) : length(key)]))
  const spacing = Object.fromEntries(SPACING_KEYS.map((key) => [key, length(key)]))
  const shadow = emptyPaint("boxShadow")
  const pseudoElements: Record<string, Obj> = {}
  for (const name of Object.keys(style?.pseudos ?? {}).sort()) {
    const pseudo = style!.pseudos![name]
    const read = (property: string) => pseudo[property]
    pseudoElements[name] = {
      content: measureContent(read("content")),
      width: measureLength(read("width"), `${name} width was not measured.`),
      height: measureLength(read("height"), `${name} height was not measured.`),
      fontFamily: measureText(read("fontFamily"), `${name} fontFamily was not measured.`),
      fontSize: measureLength(read("fontSize"), `${name} fontSize was not measured.`),
      fontWeight: measureLength(read("fontWeight"), `${name} fontWeight was not measured.`),
      lineHeight: measureLength(read("lineHeight"), `${name} lineHeight was not measured.`),
      letterSpacing: measureLength(read("letterSpacing"), `${name} letterSpacing was not measured.`),
      textTransform: measureEmpty(read("textTransform"), `${name} textTransform was not measured.`),
      color: measureColour(read("color"), `${name} color was not measured.`),
      backgroundColor: measureColour(read("backgroundColor"), `${name} backgroundColor was not measured.`),
      backgroundImage: measureEmpty(read("backgroundImage"), `${name} backgroundImage was not measured.`),
      opacity: measureLength(read("opacity"), `${name} opacity was not measured.`),
      ...Object.fromEntries(SPACING_KEYS.map((key) => [key, measureLength(read(key), `${name} ${key} was not measured.`)])),
      ...Object.fromEntries(BORDER_KEYS.map((key) => [key, key.endsWith("Color") ? measureColour(read(key), `${name} ${key} was not measured.`) : key.endsWith("Style") ? measureEmpty(read(key), `${name} ${key} was not measured.`) : measureLength(read(key), `${name} ${key} was not measured.`)])),
    }
  }
  return { typography, fill, border, spacing, shadow, opacity: length("opacity"), pseudoElements, node }
}

function measureLength(raw: string | undefined, reason: string): Measurement {
  if (raw === undefined) return { status: "missing", reason }
  if (raw === "") return { status: "empty", value: "" }
  if (raw === "normal") return { status: "unsupported", raw, reason: "Computed value is the keyword normal, which is not a measured length." }
  if (Number.parseFloat(raw) === 0) return { status: "zero", value: raw }
  return { status: "value", value: raw }
}

function measureText(raw: string | undefined, reason: string): Measurement {
  if (raw === undefined) return { status: "missing", reason }
  if (raw === "") return { status: "empty", value: "" }
  return { status: "value", value: raw }
}

function measureColour(raw: string | undefined, reason: string): Measurement {
  if (raw === undefined) return { status: "missing", reason }
  if (raw === "") return { status: "empty", value: "" }
  return { status: "value", value: raw }
}

function measureEmpty(raw: string | undefined, reason: string): Measurement {
  if (raw === undefined) return { status: "missing", reason }
  if (raw === "" || raw === "none") return { status: "empty", value: raw === "" ? "" : "none" }
  return { status: "value", value: raw }
}

function measureContent(raw: string | undefined): Measurement {
  if (raw === undefined) return { status: "missing", reason: "Pseudo content was not measured." }
  if (raw === "" || raw === '""' || raw === "none" || raw === "normal") return { status: "empty", value: raw === '""' ? "" : raw }
  return { status: "value", value: raw }
}

function geometryOf(box: Box | undefined) {
  if (!box || !Number.isFinite(box.x) || !Number.isFinite(box.y) || !Number.isFinite(box.width) || !Number.isFinite(box.height)) {
    return { status: "missing", reason: "Structure node has no measured box." }
  }
  return { status: "value", x: box.x, y: box.y, width: box.width, height: box.height }
}

function siblingIndex(id: string, children: Map<string, string[]>, roots: string[]) {
  if (roots.includes(id)) return roots.indexOf(id)
  for (const kids of children.values()) {
    const index = kids.indexOf(id)
    if (index >= 0) return index
  }
  return 0
}

function storedEffect(style: ComputedStyle | undefined, keys: string[], missingReason: string): Measurement {
  const parts = keys.flatMap((key) => {
    const value = style?.[key]
    return typeof value === "string" ? [`${key}: ${value}`] : []
  })
  if (!parts.length) return { status: "missing", reason: missingReason }
  return { status: "value", value: parts.join("; ") }
}

function layoutOf(node: StructureNode, style: ComputedStyle | undefined, opacity: Measurement, siblingOrder: number) {
  const traits = node.traits ?? []
  const storedZ = style?.zIndex
  const zIndex: Measurement = typeof storedZ === "string"
    ? { status: "value", value: storedZ }
    : traits.includes("z-index")
      ? { status: "missing", reason: "The extractor flagged a z-index trait but did not store the computed z-index." }
      : { status: "value", value: "auto", derivation: "inferred" }
  return {
    display: node.render?.display ?? "",
    visibility: node.render?.visibility ?? "",
    position: node.render?.position ?? "",
    opacity,
    zIndex,
    siblingOrder,
    sourceOrder: node.order ?? 0,
  }
}

function effectsOf(node: StructureNode, style: ComputedStyle | undefined) {
  const traits = node.traits ?? []
  const effects: Obj = {}
  if (traits.includes("transform")) {
    effects.transform = storedEffect(style, ["transform"], "The extractor flagged a transform but did not store the computed matrix.")
  }
  if (traits.includes("clip") || traits.includes("overflow")) {
    effects.clipping = storedEffect(
      style,
      ["overflowX", "overflowY", "clipPath", "maskImage"],
      "The extractor flagged clipping or overflow but did not store the computed value.",
    )
  }
  if (traits.includes("filter")) {
    effects.filter = storedEffect(style, ["filter", "backdropFilter"], "The extractor flagged a filter but did not store the computed value.")
  }
  return Object.keys(effects).length ? { status: "value", ...effects } : { status: "empty" }
}

function pseudoStatus(node: StructureNode, elements: Record<string, Obj>) {
  const traits = node.traits ?? []
  const flagged = ["::before", "::after"].filter((name) => traits.includes(name))
  if (Object.keys(elements).length) return { status: "value", elements }
  if (flagged.length) return { status: "missing", reason: `${flagged.join(", ")} was flagged but no computed pseudo-element was stored.` }
  return { status: "empty" }
}

function boundaryOf(node: StructureNode) {
  const count = node.untraversedChildren
  return {
    kind: node.boundary,
    untraversedChildren: count === undefined
      ? { status: "missing", reason: "Boundary node did not record an untraversed child count." }
      : count === 0
        ? { status: "zero", value: "0" }
        : { status: "value", value: String(count) },
    markup: node.markup ? { status: "value", value: node.markup } : { status: "empty", value: "" },
  }
}

function numberMeasurement(value: number | undefined, reason: string): Measurement {
  if (value === undefined) return { status: "missing", reason }
  if (value === 0) return { status: "zero", value: "0" }
  return { status: "value", value: String(value) }
}

function fontRecords(preorder: string[], styles: Map<string, MeasuredNode>, supplied: NonNullable<DigestInput["evidence"]>["fonts"]) {
  const families = new Map<string, Set<string>>()
  for (const id of preorder) {
    const family = styles.get(id)?.typography.fontFamily
    const weight = styles.get(id)?.typography.fontWeight
    if (!family || family.status !== "value") continue
    const weights = families.get(family.value) ?? new Set<string>()
    if (weight && (weight.status === "value" || weight.status === "zero")) weights.add(weight.value)
    families.set(family.value, weights)
  }
  return [...families.keys()].sort().map((family) => {
    const known = (supplied ?? []).find((font) => font.family === family)
    return {
      family,
      observedWeights: [...(families.get(family) ?? [])].sort(),
      availability: known
        ? { status: "value" as const, value: known.availability }
        : { status: "missing" as const, reason: "Font source and load status were not supplied. The family string is the computed font-family, not proof the face loaded." },
      source: known?.source
        ? { status: "value" as const, value: known.source }
        : { status: "missing" as const, reason: "No font source was supplied." },
    }
  })
}

function linkRecords(preorder: string[], structure: Record<string, StructureNode>, runs: Map<string, { text: string; nodeId: string }[]>) {
  return preorder.filter((id) => structure[id].tag === "a").map((id) => ({
    nodeId: id,
    label: (runs.get(id) ?? []).map((run) => run.text).join(""),
    destination: { status: "unsupported" as const, reason: "Visible labels are kept. Link destinations are out of scope and are not stored." },
  })).sort((a, b) => a.nodeId.localeCompare(b.nodeId))
}

function warningRecords(
  input: DigestInput,
  preorder: string[],
  styles: Map<string, MeasuredNode>,
  assets: Obj[],
  fonts: Obj[],
) {
  const subtree = collectSourceIds(input.component.rootIds, input.structure.nodes)
  const warnings: Warning[] = []
  for (const warning of input.structure.warnings ?? []) {
    if (!warning.nodeIds?.length || warning.nodeIds.some((id) => subtree.has(id))) warnings.push(warning)
  }
  for (const skipped of input.computed.skipped ?? []) {
    if (skipped.nodeId && subtree.has(skipped.nodeId)) warnings.push({ code: "computed-skipped", message: skipped.reason ?? "Computed style was skipped.", nodeIds: [skipped.nodeId] })
  }
  for (const unresolved of input.computed.unresolved ?? []) {
    if (unresolved.nodeId && subtree.has(unresolved.nodeId)) warnings.push({ code: "computed-unresolved", message: unresolved.selector ? `${unresolved.selector} matched ${unresolved.matches ?? 0}` : "Computed style did not resolve.", nodeIds: [unresolved.nodeId] })
  }
  const normalIds = preorder.filter((id) => styles.get(id)?.typography.letterSpacing.status === "unsupported")
  if (normalIds.length) warnings.push({ code: "letter-spacing-normal", message: "Computed letter-spacing is the keyword normal, so no pixel measurement is available.", nodeIds: normalIds })
  const missingStyle = preorder.filter((id) => styles.get(id)?.typography.fontFamily.status === "missing")
  if (missingStyle.length) warnings.push({ code: "computed-style-missing", message: "A kept node has no computed style record.", nodeIds: missingStyle })
  if (!input.evidence?.screenshot) warnings.push({ code: "screenshot-missing", message: "No screenshot path was supplied." })
  if (!input.evidence?.crops) warnings.push({ code: "crop-missing", message: "No per-component crop was supplied." })
  for (const font of fonts) {
    const availability = font.availability as Measurement
    if (availability.status === "missing") warnings.push({ code: "font-availability-missing", message: `Font load status was not supplied for ${String(font.family)}.` })
  }
  for (const asset of assets) {
    if ((asset.usablePath as Measurement).status === "missing") warnings.push({ code: "asset-usable-path-missing", message: `No usable path for ${String(asset.originalUrl)}.`, nodeIds: [String(asset.nodeId)] })
    if ((asset.naturalWidth as Measurement).status === "missing" || (asset.naturalHeight as Measurement).status === "missing") {
      warnings.push({ code: "asset-natural-size-missing", message: `Natural dimensions were not supplied for ${String(asset.originalUrl)}.`, nodeIds: [String(asset.nodeId)] })
    }
  }
  if (input.component.rootIds.some((id) => input.structure.nodes[id]?.render?.display === "none")) {
    warnings.push({ code: "hidden-root", message: "A requested component root is display:none.", nodeIds: input.component.rootIds.filter((id) => input.structure.nodes[id]?.render?.display === "none") })
  }
  return warnings.sort((a, b) => `${a.code}:${a.message}:${(a.nodeIds ?? []).join(",")}`.localeCompare(`${b.code}:${b.message}:${(b.nodeIds ?? []).join(",")}`))
}

function unsupportedRecords(preorder: string[], structure: Record<string, StructureNode>, links: { nodeId: string }[], styles: Map<string, MeasuredNode>) {
  const records: { feature: string; message: string; nodeIds?: string[] }[] = [{
    feature: "interaction-state",
    message: "Only the captured static state is represented. Hover, focus, validation, and other interaction states were not measured.",
  }]
  if (links.length) records.push({ feature: "link-destination", message: "Visible link labels are in this digest. Destinations are out of scope.", nodeIds: links.map((link) => link.nodeId) })
  const fields = preorder.filter((id) => structure[id].field || structure[id].tag === "textarea" || structure[id].tag === "select")
  if (fields.length) records.push({ feature: "form-behaviour", message: "Field values are static observations. Submission and validation are not represented.", nodeIds: fields })
  for (const id of preorder) {
    const kind = structure[id].boundary
    if (kind) records.push({ feature: "untraversed-boundary", message: `${kind} content was not traversed. Static contents inside the boundary are unsupported.`, nodeIds: [id] })
  }
  if ([...styles.values()].some((style) => style.typography.letterSpacing.status === "unsupported")) {
    records.push({ feature: "letter-spacing-normal", message: "letter-spacing resolved to the keyword normal and has no pixel measurement." })
  }
  return records.sort((a, b) => `${a.feature}:${a.message}`.localeCompare(`${b.feature}:${b.message}`))
}

function collectSourceIds(roots: string[], structure: Record<string, StructureNode>) {
  const ids = new Set<string>()
  const visit = (id: string) => {
    if (ids.has(id) || !structure[id]) return
    ids.add(id)
    for (const child of structure[id].children ?? []) visit(child)
  }
  for (const root of roots) visit(root)
  return ids
}

function captureOf(input: DigestInput) {
  const structure = input.structure
  const requested = input.capture ?? {}
  const viewport = requested.viewport ?? structure.viewport ?? undefined
  const state = requested.state ?? structure.state ?? ""
  const url = requested.url ?? structure.url ?? ""
  const captureId = requested.captureId ?? [structure.slug || "capture", viewport?.width ?? "unknown", state || "unknown"].join("-")
  const config: Record<string, string | number | boolean> = {
    ...(structure.slug ? { slug: structure.slug } : {}),
    ...(requested.captureId ? {} : { captureIdDerived: true }),
    ...(requested.config ?? {}),
  }
  return {
    captureId,
    url,
    finalUrl: requested.finalUrl ? { status: "value", value: requested.finalUrl } : structure.url ? { status: "value", value: structure.url } : { status: "missing", reason: "No final URL was supplied and the structure has no url." },
    language: requested.language ? { status: "value", value: requested.language } : { status: "missing", reason: "Language was not supplied. The structure file does not record it." },
    timestamp: requested.timestamp ? { status: "value", value: requested.timestamp } : { status: "missing", reason: "Capture timestamp was not supplied. The extractor does not record one." },
    viewport: { width: viewport?.width ?? Number.NaN, height: viewport?.height ?? Number.NaN },
    state,
    config,
  }
}

function collectColour(keys: Set<string>, measurement: Measurement) {
  if (measurement.status === "value") keys.add(measurement.value)
}

function colourRef(ids: Map<string, string>, measurement: Measurement) {
  return measurement.status === "value" ? ids.get(measurement.value) : undefined
}

function assignIds(prefix: string, keys: string[]) {
  return new Map(keys.map((key, index) => [key, `${prefix}.${String(index + 1).padStart(4, "0")}`]))
}

function tokenRecords(
  colourIds: Map<string, string>,
  colourRoles: Map<string, Set<string>>,
  typographyIds: Map<string, string>,
  typographyKeys: Map<string, Obj>,
  borderIds: Map<string, string>,
  borderKeys: Map<string, Obj>,
  spacingIds: Map<string, string>,
  spacingKeys: Map<string, Obj>,
) {
  const tokens: Obj = {}
  for (const [value, id] of colourIds) {
    tokens[id] = { id, kind: "colour", proposal: { name: id.replace("colour.", "colour-"), roles: [...(colourRoles.get(id) ?? [])].sort() }, value: { color: { status: "value", value } } }
  }
  for (const [key, id] of typographyIds) tokens[id] = { id, kind: "typography", proposal: { name: id.replace("typography.", "typography-"), roles: ["typography"] }, value: typographyKeys.get(key) }
  for (const [key, id] of borderIds) tokens[id] = { id, kind: "border", proposal: { name: id.replace("border.", "border-"), roles: ["border"] }, value: borderKeys.get(key) }
  for (const [key, id] of spacingIds) tokens[id] = { id, kind: "spacing", proposal: { name: id.replace("spacing.", "spacing-"), roles: ["spacing"] }, value: spacingKeys.get(key) }
  return tokens
}

function canon(value: unknown): string {
  return JSON.stringify(sortValue(value))
}

function unique(values: string[]) {
  return [...new Set(values)]
}

export function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortValue)
  if (value && typeof value === "object") {
    const source = value as Record<string, unknown>
    const sorted: Record<string, unknown> = {}
    for (const key of Object.keys(source).sort()) {
      if (source[key] !== undefined) sorted[key] = sortValue(source[key])
    }
    return sorted
  }
  return value
}
