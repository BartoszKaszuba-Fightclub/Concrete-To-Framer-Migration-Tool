import { readFileSync, writeFileSync, mkdirSync } from "node:fs"

const root = new URL("..", import.meta.url)
const digestDir = new URL("./Database/digest/nesting/home/1200/default/digests/", root)
const tokens = JSON.parse(readFileSync(new URL("./Database/digest/tokens/home/1200/tokens.json", root), "utf8"))

const textCatalog = tokens.textStyles.map((style) => ({
  name: style.framer.name,
  fontFamily: style.framer.fontFamily,
  fontWeight: Number(style.framer.fontWeight),
  fontSize: style.framer.fontSize,
  lineHeight: style.framer.lineHeight,
  letterSpacing: style.framer.letterSpacing === "normal" ? "0em" : style.framer.letterSpacing,
  colorStyle: style.framer.colorStyle,
}))

const organisms = [
  { key: "hero", name: "Kenniscentrum en distributeur van premium trekhaken en draagsystemen", role: "hero", host: "clip-02", band: { y: 94, height: 911 } },
  { key: "waarom", name: "Waarom kiest u voor TowMotive?", role: "feature", host: "cmp-036", band: { y: 1005, height: 790 } },
  { key: "producten", name: "Alle TowMotive producten", role: "card group", host: "cmp-039", band: { y: 1795, height: 1172 } },
  { key: "logos", name: "Altijd een trekhaak beschikbaar", role: "logo group", hosts: ["cmp-049", "cmp-050", "cmp-051"], band: { y: 2967, height: 900, width: 1200 } },
  { key: "modellen", name: "Deze nieuwe modellen hebben nu een trekhaak beschikbaar", role: "card group", host: "cmp-040", band: { y: 3867, height: 923 } },
  { key: "binnenkort", name: "Deze trekhaken zijn binnenkort beschikbaar", role: "card group", host: "cmp-041", band: { y: 4790, height: 1001 } },
  { key: "portal", name: "Het klant- en productportal van TowMotive", role: "feature", host: "cmp-037", band: { y: 5791, height: 790 } },
  { key: "stats", name: "Uw partner in Trekhaken", role: "stats", host: "cmp-038", band: { y: 6581, height: 617 } },
  { key: "cta", name: "Maak direct een account aan. Of neem contact op", role: "call to action", host: "cmp-042", band: { y: 7198, height: 316 } },
  { key: "footer", name: "Producten, Automerken, Handig", role: "footer", host: "clip-04", band: { y: 7514, height: 602 } },
  { key: "header", name: "Producten, Automerken, Contact, Adviesgesprek", role: "overlay", host: "clip-01", band: { y: 0, height: 94 } },
]

function loadDigest(id) {
  return JSON.parse(readFileSync(new URL(`./${id}.json`, digestDir), "utf8"))
}

function cssChannels(css) {
  if (typeof css !== "string") return null
  const match = css.trim().match(/^rgba?\(([^)]+)\)$/i)
  if (!match) return null
  const parts = match[1].split(",").map((part) => Number(part.trim()))
  return [parts[0], parts[1], parts[2], parts.length === 4 ? parts[3] : 1]
}

function colorNameForCss(css) {
  const wanted = cssChannels(css)
  if (!wanted) return null
  const found = tokens.colours.find((entry) => {
    const got = cssChannels(entry.framer.light)
    return got && got.every((part, index) => Math.abs(part - wanted[index]) < 0.02)
  })
  return found?.framer.name || null
}

function alphaOf(css) {
  if (typeof css !== "string") return 0
  const match = css.trim().match(/^rgba?\(([^)]+)\)$/i)
  if (!match) return 1
  const parts = match[1].split(",").map((part) => part.trim())
  return parts.length === 4 ? Number(parts[3]) : 1
}

function familyName(value) {
  if (!value) return ""
  return value.split(",")[0].trim().replace(/^["']|["']$/g, "")
}

function lengthStatus(entry) {
  if (!entry) return { kind: "missing" }
  if (entry.status === "value") return { kind: "value", value: entry.value }
  if (entry.status === "zero" || entry.raw === "normal" || entry.status === "unsupported") return { kind: "zero", value: "0px" }
  return { kind: "missing", reason: entry.reason || entry.status }
}

function px(number) {
  const rounded = Math.round(number * 100) / 100
  return `${rounded}px`
}

function corners(node) {
  const border = node.styles?.border?.value
  if (!border) return null
  const keys = ["borderTopLeftRadius", "borderTopRightRadius", "borderBottomRightRadius", "borderBottomLeftRadius"]
  return keys.map((key) => border[key]?.value || "0px")
}

function sides(node) {
  const border = node.styles?.border?.value
  if (!border) return null
  return ["Top", "Right", "Bottom", "Left"].map((side) => ({
    width: border[`border${side}Width`]?.value || "0px",
    style: border[`border${side}Style`]?.value || "none",
    colorRef: node.styles.border.colourRefs?.[`border${side}Color`] || null,
  }))
}

function colorName(digest, ref) {
  if (!ref) return null
  return digest.tokens?.[ref]?.proposal?.name || null
}

function clipping(node) {
  const value = node.effects?.clipping?.value || ""
  if (/hidden|clip/i.test(value)) return "hidden"
  return null
}

function isHiddenText(node) {
  const box = node.geometry
  if (!box) return false
  const tiny = box.width <= 1 && box.height <= 1
  return tiny && clipping(node) === "hidden" && node.text?.exact?.value
}

function ownRuns(node) {
  return (node.text?.runs || []).filter((run) => run.nodeId === node.id && run.text)
}

function matchPreset(digest, node) {
  const typo = node.styles?.typography?.value
  if (!typo) return null
  const family = familyName(typo.fontFamily?.value)
  const weight = Number(typo.fontWeight?.value)
  const size = typo.fontSize?.value
  const line = typo.lineHeight?.value
  const color = colorName(digest, node.styles.typography.colourRef)
  return textCatalog.find((style) => style.fontFamily === family && style.fontWeight === weight && style.fontSize === size && style.lineHeight === line && style.colorStyle === color) || null
}

function linkFor(digest, nodeId) {
  return (digest.links || []).find((link) => link.nodeId === nodeId) || null
}

function assetFor(digest, nodeId, kind) {
  return (digest.assets || []).find((asset) => asset.nodeId === nodeId && (!kind || asset.kind === kind) && asset.usablePath?.status === "value")
}

function paintingPseudo(pseudo) {
  if (!pseudo) return false
  const fill = pseudo.backgroundColor?.status === "value" && alphaOf(pseudo.backgroundColor.value) > 0
  const image = pseudo.backgroundImage?.status === "value" && pseudo.backgroundImage.value && pseudo.backgroundImage.value !== "none"
  const contentUrl = pseudo.content?.status === "value" && String(pseudo.content.value).startsWith("url(")
  return fill || image || contentUrl
}

const missing = []
const assetPaths = new Map()

function rememberAsset(asset) {
  const filePath = asset?.usablePath?.value
  if (!filePath) return null
  if (!assetPaths.has(filePath)) assetPaths.set(filePath, { alt: asset.alt || null, kind: asset.kind })
  return filePath
}

let serial = 0
function nextId(prefix) {
  serial += 1
  return `${prefix}${serial}`
}

function textSpec(digest, node, runs, links) {
  const preset = matchPreset(digest, node)
  const typo = node.styles.typography.value
  const family = familyName(typo.fontFamily?.value)
  const spec = {
    kind: "text",
    id: nextId("t"),
    name: (runs.map((run) => run.text).join(" ") || node.tag).slice(0, 48),
    width: px(node.geometry.width || 1),
    tag: ["h1", "h2", "h3", "h4", "h5", "h6", "p"].includes(node.tag) ? node.tag : ancestorHeading(digest, node) || "p",
    runs: runs.map((run) => ({ text: run.text, href: links.get(run.text) || null })),
    preset: preset?.name || null,
    fontName: preset ? null : family || null,
    fontWeight: preset ? null : Number(typo.fontWeight?.value) || null,
    fontSize: preset ? null : typo.fontSize?.value || null,
    lineHeight: preset ? null : typo.lineHeight?.value || null,
    letterSpacing: preset ? null : (typo.letterSpacing?.status === "unsupported" || typo.letterSpacing?.raw === "normal" ? "0em" : typo.letterSpacing?.value || "0em"),
    boxX: node.geometry?.x ?? null,
    colorStyle: preset ? null : colorName(digest, node.styles.typography.colourRef),
    missingFont: family === "swiper-icons" ? "swiper-icons" : null,
  }
  if (!preset && !family) missing.push(`${node.id} text has no font family`)
  if (family === "swiper-icons") missing.push(`${node.id} missing font swiper-icons`)
  return spec
}

function ancestorHeading(digest, node) {
  let parentId = node.parentId
  while (parentId) {
    const parent = digest.nodes[parentId]
    if (!parent) break
    if (/^h[1-6]$/.test(parent.tag)) return parent.tag
    parentId = parent.parentId
  }
  return null
}

function frameAttrs(digest, node) {
  const fillRef = node.styles?.fill?.ref
  const fillCss = node.styles?.fill?.backgroundColor?.value
  const fillName = alphaOf(fillCss) > 0 ? colorName(digest, fillRef) : null
  if (alphaOf(fillCss) > 0 && !fillName) missing.push(`${node.id} fill ${fillCss} has no color style`)
  const pad = node.styles?.spacing?.value || {}
  const padding = ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"].map((key) => lengthStatus(pad[key]).value || "0px")
  const radius = radiusOf(node)
  const border = borderOf(digest, node, radius.radius)
  const gapInfo = gapOf(node)
  const direction = stackDirection(node)
  return {
    kind: "frame",
    id: nextId("f"),
    name: `${node.tag} ${node.id}`,
    width: px(node.geometry.width || 0),
    height: node.tag === "img" ? px(node.geometry.height || 0) : px(node.geometry.height || 0),
    direction,
    gap: gapInfo.gap,
    padding: padding.every((value) => value === "0px") ? null : padding.join(" "),
    fill: fillName,
    radius: radius.radius,
    border,
    overflow: clipping(node),
    opacity: node.layout?.opacity?.value && node.layout.opacity.value !== "1" ? Number(node.layout.opacity.value) : null,
    htmlTag: ["header", "nav", "main", "footer", "section", "div", "button"].includes(node.tag) ? node.tag : null,
    align: "start",
    boxX: node.geometry.x,
    boxY: node.geometry.y,
    display: node.layout?.display || null,
    children: [],
    gapNote: gapInfo.note,
  }
}

function stackDirection(node) {
  const display = node.layout?.display
  const direction = node.layout?.flexDirection
  if (display === "flex" && direction === "column") return "vertical"
  if (display === "flex") return "horizontal"
  return "vertical"
}

function gapOf(node) {
  const spacing = node.styles?.spacing?.value || {}
  const row = lengthStatus(spacing.rowGap)
  const column = lengthStatus(spacing.columnGap)
  if (row.kind === "value" && column.kind === "value") {
    return { gap: row.value === column.value ? row.value : `${row.value} ${column.value}`, note: null }
  }
  const direction = stackDirection(node)
  const main = direction === "vertical" ? row : column
  if (main.kind === "missing") {
    missing.push(`${node.id} gap missing`)
    return { gap: null, note: "missing" }
  }
  return { gap: main.value, note: null }
}

function radiusOf(node) {
  const values = corners(node)
  if (!values) return { radius: null }
  const unique = [...new Set(values)]
  if (unique.length === 1 && (unique[0] === "0px" || unique[0] === "0%")) return { radius: null }
  if (unique.length === 1 && unique[0] === "50%") {
    const box = node.geometry
    return { radius: px(Math.min(box.width, box.height) / 2) }
  }
  if (unique.length === 1) return { radius: unique[0] }
  return { radius: values.join(" ") }
}

function borderOf(digest, node, radius) {
  const paint = sides(node)
  if (!paint) return null
  const widths = paint.map((side) => side.width)
  if (widths.every((width) => width === "0px")) return null
  const same = paint.every((side) => side.width === paint[0].width && side.style === paint[0].style && side.colorRef === paint[0].colorRef)
  if (!same) {
    missing.push(`${node.id} border sides differ`)
    return null
  }
  const style = paint[0].style === "none" ? "solid" : paint[0].style
  return { width: paint[0].width, style, color: colorName(digest, paint[0].colorRef) }
}

function pseudoLayers(digest, node) {
  const elements = node.pseudos?.elements || {}
  const layers = []
  for (const name of ["::before", "::after"]) {
    const pseudo = elements[name]
    if (!paintingPseudo(pseudo)) continue
    if (node.tag === "svg" && node.boundary?.markup?.value) continue
    const asset = (digest.assets || []).find((item) => item.nodeId === node.id && (item.kind === `content${name}` || item.kind === `background${name}`))
    const filePath = asset ? rememberAsset(asset) : null
    const fillCss = pseudo.backgroundColor?.value
    const fillName = alphaOf(fillCss) > 0 ? colorNameForCss(fillCss) : null
    const width = pseudo.width?.status === "value" ? pseudo.width.value : asset?.naturalWidth?.value ? `${asset.naturalWidth.value}px` : null
    const height = pseudo.height?.status === "value" ? pseudo.height.value : asset?.naturalHeight?.value ? `${asset.naturalHeight.value}px` : null
    layers.push({
      kind: filePath ? "image" : "frame",
      id: nextId("p"),
      name: `${name} ${node.id}`,
      width: width || "1px",
      height: height || "1px",
      fill: fillName || (alphaOf(fillCss) > 0 ? fillCss : null),
      fillRaw: !fillName && alphaOf(fillCss) > 0,
      image: filePath,
      alt: asset?.alt || null,
      position: "absolute",
      left: pseudo.left?.status === "value" || pseudo.left?.status === "zero" ? pseudo.left.value : null,
      top: pseudo.top?.status === "value" || pseudo.top?.status === "zero" ? pseudo.top.value : null,
      translateY: typeof pseudo.transform?.value === "string" && pseudo.transform.value.includes("matrix") ? matrixTranslateY(pseudo.transform.value) : null,
      children: [],
    })
    if (alphaOf(fillCss) > 0 && !fillName) missing.push(`${node.id} ${name} fill ${fillCss} has no color style`)
  }
  return layers
}

function matrixTranslateY(value) {
  const match = value.match(/matrix\(\s*[\d.-]+\s*,\s*[\d.-]+\s*,\s*[\d.-]+\s*,\s*[\d.-]+\s*,\s*[\d.-]+\s*,\s*([\d.-]+)\s*\)/)
  if (!match) return null
  return `${match[1]}px`
}

function svgSpec(node) {
  let markup = node.boundary.markup.value
  const color = node.styles?.typography?.value?.color?.value
  if (color && markup.includes("currentColor")) markup = markup.replaceAll("currentColor", color)
  return {
    kind: "svg",
    id: nextId("s"),
    name: `svg ${node.id}`,
    width: px(node.geometry.width || 1),
    height: px(node.geometry.height || 1),
    svg: markup,
    children: [],
  }
}

function shouldSkip(node) {
  if (!node) return true
  if (node.tag === "source" || node.tag === "br") return true
  if (node.layout?.display === "none" || node.layout?.visibility === "hidden") return true
  if (isHiddenText(node)) return true
  return false
}

function emitNode(digest, node, inlineLinks) {
  if (shouldSkip(node)) return null
  if (node.tag === "svg" && node.boundary?.markup?.status === "value") {
    const spec = svgSpec(node)
    const link = linkFor(digest, node.id)
    if (link?.destination?.status === "value") spec.link = { label: link.label, href: link.destination.href }
    return spec
  }
  if (node.tag === "img") {
    const asset = assetFor(digest, node.id, "img") || assetFor(digest, node.id)
    const filePath = rememberAsset(asset)
    if (!asset?.alt) missing.push(`${node.id} alt missing`)
    const spec = {
      kind: "image",
      id: nextId("i"),
      name: asset?.alt || `image ${node.id}`,
      width: px(node.geometry.width || 1),
      height: px(node.geometry.height || 1),
      image: filePath,
      alt: asset?.alt || null,
      boxX: node.geometry.x,
      children: [],
    }
    const link = linkFor(digest, node.id)
    if (link?.destination?.status === "value") spec.link = { label: link.label, href: link.destination.href }
    return spec
  }
  if (node.tag === "li" && node.children?.length === 1) {
    const child = digest.nodes[node.children[0]]
    if (child?.tag === "a") {
      const frame = frameAttrs(digest, node)
      frame.name = linkFor(digest, child.id)?.label || frame.name
      frame.htmlTag = null
      const link = linkFor(digest, child.id)
      if (link?.destination?.status === "value" && link.destination.href && link.destination.href !== "#") {
        frame.link = { label: link.label, href: link.destination.href }
      }
      const runs = ownRuns(child).length ? ownRuns(child) : [{ text: child.text?.exact?.value || link?.label || "", nodeId: child.id }]
      frame.children.push(textSpec(digest, child, runs, new Map()))
      frame.children.push(...pseudoLayers(digest, node))
      return frame
    }
  }
  const childNodes = (node.children || []).map((id) => digest.nodes[id]).filter(Boolean)
  const inlineAnchors = childNodes.filter((child) => child.tag === "a" && child.layout?.display === "inline" && ["p", "h1", "h2", "h3", "h4", "h5", "h6", "span"].includes(node.tag))
  if (["h1", "h2", "h3", "h4", "h5", "h6", "p"].includes(node.tag) || (node.tag === "a" && childNodes.length === 0 && node.text?.exact?.value)) {
    const runs = ownRuns(node)
    const linkMap = new Map()
    for (const anchor of inlineAnchors) {
      const link = linkFor(digest, anchor.id)
      const label = anchor.text?.exact?.value || link?.label
      if (label && link?.destination?.status === "value") linkMap.set(label, link.destination.href)
    }
    const usableRuns = runs.length ? runs : node.text?.exact?.value ? [{ text: node.text.exact.value, nodeId: node.id }] : []
    if (!usableRuns.length) return null
    const spec = textSpec(digest, node, usableRuns, linkMap)
    if (node.tag === "a") {
      const frame = frameAttrs(digest, node)
      frame.htmlTag = null
      spec.width = "1fr"
      const link = linkFor(digest, node.id)
      if (link?.destination?.status === "value" && /^(tel:|mailto:)/.test(link.destination.href || "")) frame.link = { label: link.label, href: link.destination.href }
      else if (link?.destination?.status === "value") frame.link = { label: link.label, href: link.destination.href }
      frame.children.push(spec)
      return frame
    }
    if (inlineAnchors.length === 0 && childNodes.every((child) => shouldSkip(child) || child.tag === "br")) return spec
    const frame = frameAttrs(digest, node)
    frame.height = null
    frame.children.push(spec)
    for (const child of childNodes) {
      if (inlineAnchors.includes(child) || shouldSkip(child)) continue
      const emitted = emitNode(digest, child, inlineLinks)
      if (emitted) frame.children.push(emitted)
    }
    return frame
  }
  const frame = frameAttrs(digest, node)
  if (node.layout?.flexWrap === "wrap") frame.wrap = true
  frame.children.push(...pseudoLayers(digest, node))
  const runs = ownRuns(node)
  if (runs.length) {
    const text = textSpec(digest, node, runs, new Map())
    text.width = "1fr"
    frame.children.push(text)
  }
  const ordered = [...childNodes].sort((a, b) => (a.layout?.siblingOrder || 0) - (b.layout?.siblingOrder || 0))
  for (const child of ordered) {
    if (inlineAnchors.includes(child)) continue
    const emitted = emitNode(digest, child, inlineLinks)
    if (emitted) frame.children.push(emitted)
  }
  if (node.tag === "a") {
    frame.htmlTag = null
    const link = linkFor(digest, node.id)
    if (link?.destination?.status === "value" && link.destination.href && link.destination.href !== "#") {
      frame.link = { label: link.label, href: link.destination.href }
    }
  }
  if (frame.children.length === 0 && !frame.fill && !frame.image && node.tag !== "section" && node.tag !== "footer" && node.tag !== "nav" && node.tag !== "div") return null
  return frame
}

function tuneGrid(spec) {
  if (!spec || spec.kind !== "frame") return
  for (const child of spec.children || []) tuneGrid(child)
  if (spec.display !== "grid") return
  const kids = (spec.children || []).filter((child) => child.boxX != null)
  const columns = []
  for (const child of [...kids].sort((a, b) => a.boxX - b.boxX)) {
    if (!columns.length || child.boxX - columns[columns.length - 1] > 24) columns.push(child.boxX)
  }
  if (columns.length < 2) return
  spec.layout = "grid"
  spec.columns = columns.length
  const widths = kids.map((child) => Number.parseFloat(child.width)).filter((width) => Number.isFinite(width))
  spec.columnWidth = px(widths.sort((a, b) => a - b)[Math.floor(widths.length / 2)] || 1)
  const columnIndex = (child) => columns.reduce((best, x, index) => Math.abs(child.boxX - x) < Math.abs(child.boxX - columns[best]) ? index : best, 0)
  const rows = []
  for (const child of kids) {
    const y = child.boxY || 0
    let row = rows.find((item) => Math.abs(item.y - y) < 12)
    if (!row) {
      row = { y, cells: [] }
      rows.push(row)
    }
    row.cells.push(child)
  }
  rows.sort((a, b) => a.y - b.y)
  const ordered = []
  const used = new Set()
  for (const row of rows) {
    for (let index = 0; index < columns.length; index += 1) {
      const cell = row.cells.find((child) => !used.has(child) && columnIndex(child) === index)
      if (!cell) continue
      ordered.push(cell)
      used.add(cell)
    }
  }
  for (const child of spec.children) if (!used.has(child)) ordered.push(child)
  spec.children = ordered
}

function tuneAlign(spec) {
  if (!spec || spec.kind !== "frame") return
  const parentW = Number.parseFloat(spec.width)
  const parentX = spec.boxX
  const kids = (spec.children || []).filter((child) => child.boxX != null && child.width)
  if (spec.direction === "vertical" && Number.isFinite(parentW) && Number.isFinite(parentX) && kids.length) {
    const centered = kids.every((child) => {
      const width = Number.parseFloat(child.width)
      if (!Number.isFinite(width) || Math.abs(width - parentW) < 2) return true
      return Math.abs(child.boxX - (parentX + (parentW - width) / 2)) < 2
    })
    if (centered) spec.align = "center"
  }
  for (const child of spec.children || []) tuneAlign(child)
}

function buildHost(id) {
  const digest = loadDigest(id)
  const rootId = digest.component.rootIds[0]
  const spec = emitNode(digest, digest.nodes[rootId], new Map())
  return { spec, root: digest.nodes[rootId] }
}

function buildOrganism(organism) {
  serial = 0
  if (organism.hosts) {
    const parts = organism.hosts.map((id) => buildHost(id))
    const spec = {
      kind: "frame",
      id: nextId("f"),
      name: organism.name,
      width: "1200px",
      height: px(organism.band.height),
      direction: "vertical",
      gap: "0px",
      padding: "80.2px 0px 0px 0px",
      fill: null,
      radius: null,
      border: null,
      overflow: "hidden",
      opacity: null,
      htmlTag: "section",
      align: "center",
      children: parts.map((part) => part.spec).filter(Boolean),
    }
    missing.push("Altijd een trekhaak beschikbaar has no section node; top offset 80.2px is the band y minus the first root y")
    return spec
  }
  const built = buildHost(organism.host)
  if (built.spec) {
    built.spec.name = organism.name
    if (organism.role === "overlay") built.spec.overlay = true
  }
  return built.spec
}

mkdirSync(new URL("./.scratch/plans/", root), { recursive: true })
const plans = []
for (const organism of organisms) {
  const spec = buildOrganism(organism)
  tuneAlign(spec)
  tuneGrid(spec)
  const plan = { key: organism.key, name: organism.name, role: organism.role, band: organism.band, spec }
  plans.push(plan)
  writeFileSync(new URL(`./.scratch/plans/${organism.key}.json`, root), JSON.stringify(plan))
}
writeFileSync(new URL("./.scratch/plans/assets.json", root), JSON.stringify([...assetPaths.keys()], null, 2))
writeFileSync(new URL("./.scratch/plans/missing.json", root), JSON.stringify([...new Set(missing)], null, 2))

function count(spec, acc = { frame: 0, text: 0, image: 0, svg: 0 }) {
  if (!spec) return acc
  acc[spec.kind] = (acc[spec.kind] || 0) + 1
  for (const child of spec.children || []) count(child, acc)
  return acc
}
for (const plan of plans) {
  console.log(plan.key, JSON.stringify(count(plan.spec)), "bytes", JSON.stringify(plan).length)
}
console.log("assets", assetPaths.size, "missing lines", new Set(missing).size)
