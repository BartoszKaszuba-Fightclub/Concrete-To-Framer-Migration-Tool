/**
 * Collects the design tokens that appear on one captured page.
 * Equal computed values become one entry. Consent UI is ignored.
 */

import { SCHEMA_VERSION } from "./schema.ts"

const SIDES = ["top", "right", "bottom", "left"] as const
const SIDE_PROP = { top: "Top", right: "Right", bottom: "Bottom", left: "Left" } as const
const CORNERS = ["topLeft", "topRight", "bottomRight", "bottomLeft"] as const
const CORNER_PROP = {
  topLeft: "borderTopLeftRadius",
  topRight: "borderTopRightRadius",
  bottomRight: "borderBottomRightRadius",
  bottomLeft: "borderBottomLeftRadius",
} as const
const ROLE_ORDER = ["h1", "h2", "h3", "h4", "h5", "h6", "button", "link", "body"] as const
const GENERIC_FAMILIES = new Set([
  "serif", "sans-serif", "monospace", "cursive", "fantasy", "system-ui", "emoji", "math", "fangsong",
  "ui-serif", "ui-sans-serif", "ui-monospace", "ui-rounded", "inherit", "initial", "unset",
])
const CONSENT_REASON = new Set(["consent-ui", "cookiebot"])
const CONSENT_MARK = /cookiebot|cybot|onetrust|cookie-consent|gdpr/i
const WEIGHTS = new Set([100, 200, 300, 400, 500, 600, 700, 800, 900])

export type StructureNode = {
  tag?: string
  domId?: string
  classes?: string[]
  role?: string
  selector?: string
  parentId?: string | null
  children?: string[]
  content?: (string | { id: string })[]
  field?: { type?: string }
}

export type ComputedStyle = Record<string, unknown> & {
  pseudos?: Record<string, Record<string, unknown>>
}

export type CollectInput = {
  structure: {
    url?: string
    slug?: string
    state?: string
    viewport?: { width?: number; height?: number } | null
    nodes?: Record<string, StructureNode>
  }
  computed: {
    url?: string
    slug?: string
    width?: number | null
    state?: string
    nodes?: Record<string, ComputedStyle>
    skipped?: { nodeId?: string; reason?: string }[]
  }
  language: string
}

type Role = (typeof ROLE_ORDER)[number]
type ColourUse = { alpha: number; light: string }
type TextUse = {
  fontFamily: string
  fontSize: string
  fontWeight: string
  lineHeight: string
  letterSpacing: string
  textTransform: string
  color: string
  roles: Set<Role>
}
type BorderSide = { width: string; style: string; css: string }

export function collectTokens(input: CollectInput): Record<string, unknown> {
  const structure = input.structure.nodes ?? {}
  const computed = input.computed.nodes ?? {}
  const ignored = ignoredIds(structure, input.computed.skipped ?? [])
  const colours = new Map<string, ColourUse>()
  const texts = new Map<string, TextUse>()
  const spacing = new Map<string, { kind: "padding" | "margin" | "gap"; sides?: Record<string, string>; axes?: Record<string, string> }>()
  const borders = new Map<string, Record<string, BorderSide>>()
  const radii = new Map<string, Record<string, string>>()
  const shadows = new Map<string, string>()

  const rememberColour = (css: string | undefined, mode: "paint" | "text") => {
    if (!css) return
    const parsed = parseColour(css)
    if (!parsed) throw new Error(`Unparsed colour: ${css}`)
    if (mode === "paint" && parsed.alpha === 0) return
    colours.set(css, parsed)
  }

  for (const [id, node] of Object.entries(structure)) {
    if (ignored.has(id)) continue
    const style = computed[id]
    if (!style) continue
    const layers: { style: Record<string, unknown>; role: Role | null }[] = [{ style, role: roleOf(node) }]
    for (const pseudo of Object.values(style.pseudos ?? {})) {
      if (!pseudo || typeof pseudo !== "object") continue
      layers.push({ style: pseudo, role: pseudoText(pseudo) ? "body" : null })
    }
    for (const layer of layers) {
      collectBox(layer.style, rememberColour, spacing, borders, radii, shadows)
      if (!layer.role) continue
      const color = readString(layer.style.color)
      const fontFamily = readString(layer.style.fontFamily)
      const fontSize = readString(layer.style.fontSize)
      const fontWeight = readString(layer.style.fontWeight)
      const lineHeight = readString(layer.style.lineHeight)
      const letterSpacing = readString(layer.style.letterSpacing)
      const textTransform = readString(layer.style.textTransform)
      if (!color || !fontFamily || !fontSize || !fontWeight || !lineHeight || !letterSpacing || !textTransform) continue
      rememberColour(color, "text")
      const key = [fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, textTransform, color].join("\u0000")
      const existing = texts.get(key)
      if (existing) existing.roles.add(layer.role)
      else texts.set(key, { fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, textTransform, color, roles: new Set([layer.role]) })
    }
  }

  for (const sides of borders.values()) {
    for (const side of Object.values(sides)) rememberColour(side.css, "text")
  }

  const colourNames = assignNames([...colours.keys()].sort(), (css) => `color/${slug(css)}`)
  const coloursOut = [...colours.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([css, parsed]) => {
      const name = colourNames.get(css)!
      return { name, css, alpha: parsed.alpha, framer: { action: "createColorStyle", name, light: parsed.light } }
    })

  const textNames = new Set<string>()
  const textStyles = [...texts.values()]
    .flatMap((text) => {
      const roles = ROLE_ORDER.filter((role) => text.roles.has(role))
      const heading = roles.find((role) => /^h[1-6]$/.test(role))
      const prefix = heading ?? (roles.includes("button") ? "button" : roles.includes("link") ? "link" : "body")
      const family = concreteFamily(text.fontFamily)
      const weight = numericWeight(text.fontWeight)
      if (!family || weight === null) return []
      const base = `text/${prefix}/${slug([family, text.fontSize, text.fontWeight, text.lineHeight, text.letterSpacing, text.textTransform].join(" "))}`
      const name = unique(base, textNames)
      const colorStyle = colourNames.get(text.color)!
      return [{
        sort: `${ROLE_ORDER.indexOf(prefix as Role)}\u0000${Number.parseFloat(text.fontSize) || 0}\u0000${name}`,
        name,
        roles,
        fontFamily: text.fontFamily,
        fontSize: text.fontSize,
        fontWeight: text.fontWeight,
        lineHeight: text.lineHeight,
        letterSpacing: text.letterSpacing,
        textTransform: text.textTransform,
        colorStyle,
        framer: {
          action: "createTextStyle",
          name,
          tag: heading ?? "p",
          fontFamily: family,
          fontWeight: weight,
          fontSize: text.fontSize,
          lineHeight: text.lineHeight,
          letterSpacing: text.letterSpacing,
          transform: text.textTransform,
          colorStyle,
        },
      }]
    })
    .sort((a, b) => a.sort.localeCompare(b.sort))
    .map(({ sort: _sort, ...entry }) => entry)

  const viewport = input.structure.viewport
  const width = viewport?.width ?? input.computed.width
  const height = viewport?.height
  if (!Number.isFinite(width) || !Number.isFinite(height)) throw new Error("Capture viewport width and height are required")

  return {
    schemaVersion: SCHEMA_VERSION,
    source: {
      url: input.structure.url ?? input.computed.url ?? "",
      slug: input.structure.slug ?? input.computed.slug ?? "",
      state: input.structure.state ?? input.computed.state ?? "",
      language: input.language,
      viewport: { width, height },
    },
    colours: coloursOut,
    textStyles,
    spacing: nameEntries([...spacing.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, value]) => ({
      name: spacingName(value),
      ...value,
    }))),
    borders: nameEntries([...borders.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, sides]) => ({
      name: `border/${slug(JSON.stringify(sides))}`,
      sides: Object.fromEntries(Object.entries(sides).map(([side, raw]) => [side, { ...raw, colorStyle: colourNames.get(raw.css)! }])),
    }))),
    radii: nameEntries([...radii.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, corners]) => ({
      name: `radius/${slug(JSON.stringify(corners))}`,
      corners,
    }))),
    shadows: nameEntries([...shadows.values()].sort((a, b) => a.localeCompare(b)).map((css) => ({
      name: `shadow/${slug(css)}`,
      css,
    }))),
  }
}

function nameEntries<T extends { name: string }>(entries: T[]): T[] {
  const used = new Set<string>()
  return entries.map((entry) => {
    const name = unique(entry.name, used)
    return { ...entry, name }
  })
}

export function concreteFamily(fontFamily: string): string | null {
  for (const part of fontFamily.split(",")) {
    const family = part.trim().replace(/^["']|["']$/g, "")
    if (family && !GENERIC_FAMILIES.has(family.toLowerCase())) return family
  }
  return null
}

export function numericWeight(fontWeight: string): number | null {
  const named = fontWeight.toLowerCase() === "bold" ? 700 : fontWeight.toLowerCase() === "normal" ? 400 : Number(fontWeight)
  return WEIGHTS.has(named) ? named : null
}

function collectBox(
  style: Record<string, unknown>,
  rememberColour: (css: string | undefined, mode: "paint" | "text") => void,
  spacing: Map<string, { kind: "padding" | "margin" | "gap"; sides?: Record<string, string>; axes?: Record<string, string> }>,
  borders: Map<string, Record<string, BorderSide>>,
  radii: Map<string, Record<string, string>>,
  shadows: Map<string, string>,
) {
  for (const kind of ["padding", "margin"] as const) {
    const sides: Record<string, string> = {}
    for (const side of SIDES) {
      const value = readString(style[`${kind}${SIDE_PROP[side]}`])
      if (value && !isZeroLength(value)) sides[side] = value
    }
    if (Object.keys(sides).length) spacing.set(JSON.stringify({ kind, sides }), { kind, sides })
  }

  const axes: Record<string, string> = {}
  for (const [axis, prop] of [["row", "rowGap"], ["column", "columnGap"]] as const) {
    const value = readString(style[prop])
    if (value && Number.isFinite(Number.parseFloat(value)) && !isZeroLength(value)) axes[axis] = value
  }
  if (Object.keys(axes).length) spacing.set(JSON.stringify({ kind: "gap", axes }), { kind: "gap", axes })

  const painted: Record<string, BorderSide> = {}
  for (const side of SIDES) {
    const width = readString(style[`border${SIDE_PROP[side]}Width`])
    const borderStyle = readString(style[`border${SIDE_PROP[side]}Style`])
    const css = readString(style[`border${SIDE_PROP[side]}Color`])
    if (!width || !borderStyle || !css || isZeroLength(width) || borderStyle === "none" || borderStyle === "hidden") continue
    painted[side] = { width, style: borderStyle, css }
  }
  if (Object.keys(painted).length) borders.set(JSON.stringify(painted), painted)

  const corners: Record<string, string> = {}
  for (const corner of CORNERS) {
    const value = readString(style[CORNER_PROP[corner]])
    if (value && !isZeroLength(value)) corners[corner] = value
  }
  if (Object.keys(corners).length) radii.set(JSON.stringify(corners), corners)

  const shadow = readString(style.boxShadow)
  if (shadow && shadow !== "none") shadows.set(shadow, shadow)
  rememberColour(readString(style.backgroundColor), "paint")
}

function ignoredIds(structure: Record<string, StructureNode>, skipped: { nodeId?: string; reason?: string }[]) {
  const ignored = new Set<string>()
  for (const entry of skipped) {
    if (entry.nodeId && entry.reason && CONSENT_REASON.has(entry.reason)) ignored.add(entry.nodeId)
  }
  for (const [id, node] of Object.entries(structure)) {
    const haystack = [node.domId, node.selector, ...(node.classes ?? [])].filter(Boolean).join(" ")
    if (CONSENT_MARK.test(haystack)) ignored.add(id)
  }
  let grew = true
  while (grew) {
    grew = false
    for (const [id, node] of Object.entries(structure)) {
      if (!ignored.has(id) && node.parentId && ignored.has(node.parentId)) {
        ignored.add(id)
        grew = true
      }
    }
  }
  return ignored
}

function roleOf(node: StructureNode): Role | null {
  const tag = (node.tag ?? "").toLowerCase()
  if (/^h[1-6]$/.test(tag)) return tag as Role
  if (tag === "a") return "link"
  if (tag === "button" || node.role === "button") return "button"
  if (tag === "input" && /^(button|submit|reset)$/.test(node.field?.type ?? "")) return "button"
  if ((node.content ?? []).some((part) => typeof part === "string" && part.trim())) return "body"
  return null
}

function pseudoText(style: Record<string, unknown>): boolean {
  const content = readString(style.content)
  if (!content || content === "none" || content === "normal") return false
  const visible = content.replace(/^["']|["']$/g, "").trim()
  return visible.length > 0 && !/^url\(/i.test(visible)
}

function parseColour(css: string): ColourUse | null {
  const match = css.trim().match(/^rgba?\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)\s*(?:,\s*([0-9.]+)\s*)?\)$/i)
  if (!match) return null
  const alpha = match[4] === undefined ? 1 : Number(match[4])
  if (!Number.isFinite(alpha) || alpha < 0 || alpha > 1) return null
  return { alpha, light: `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${alpha})` }
}

function spacingName(value: { kind: string; sides?: Record<string, string>; axes?: Record<string, string> }) {
  const record = value.kind === "gap" ? value.axes ?? {} : value.sides ?? {}
  const body = Object.entries(record).map(([key, length]) => `${key}-${length}`).join("-")
  return `spacing/${value.kind}/${slug(body)}`
}

function assignNames(values: string[], nameFor: (value: string) => string) {
  const used = new Set<string>()
  const names = new Map<string, string>()
  for (const value of values) names.set(value, unique(nameFor(value), used))
  return names
}

function unique(base: string, used: Set<string>) {
  let name = base || "token"
  let n = 2
  while (used.has(name)) name = `${base}-${n++}`
  used.add(name)
  return name
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 96) || "value"
}

function readString(value: unknown): string | undefined {
  if (typeof value === "string" && value.length) return value
  if (typeof value === "number" && Number.isFinite(value)) return String(value)
  return undefined
}

function isZeroLength(value: string) {
  const n = Number.parseFloat(value)
  return Number.isFinite(n) && n === 0
}
