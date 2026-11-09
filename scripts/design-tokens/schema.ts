/**
 * Design-token document 1.0.0.
 * A rebuild instruction for Framer color and text styles, plus the spacing,
 * borders, radii, and shadows measured on one captured page.
 * docs/poc-v2/design-tokens.schema.json mirrors these rules.
 */

export const SCHEMA_VERSION = "1.0.0"

export class TokenValidationError extends Error {
  readonly errors: string[]
  constructor(errors: string[]) {
    super(errors.join("\n"))
    this.name = "TokenValidationError"
    this.errors = errors
  }
}

type Obj = Record<string, unknown>

const ROLES = ["h1", "h2", "h3", "h4", "h5", "h6", "body", "link", "button"] as const
const TAGS = ["h1", "h2", "h3", "h4", "h5", "h6", "p"] as const

function isObj(value: unknown): value is Obj {
  return !!value && typeof value === "object" && !Array.isArray(value)
}

function isZeroLength(value: string): boolean {
  const n = Number.parseFloat(value)
  return Number.isFinite(n) && n === 0
}

export function validateTokens(document: unknown): void {
  const errors: string[] = []
  const fail = (path: string, message: string) => errors.push(`${path}: ${message}`)

  if (!isObj(document)) throw new TokenValidationError(["document: expected an object"])
  if (document.schemaVersion !== SCHEMA_VERSION) fail("schemaVersion", `expected ${SCHEMA_VERSION}`)

  const source = document.source
  if (!isObj(source)) fail("source", "expected an object")
  else {
    for (const key of ["url", "slug", "state", "language"]) {
      if (typeof source[key] !== "string" || !String(source[key]).length) fail(`source.${key}`, "missing string")
    }
    const viewport = source.viewport
    if (!isObj(viewport) || !Number.isFinite(viewport.width) || !Number.isFinite(viewport.height)) {
      fail("source.viewport", "width and height are required numbers")
    }
  }

  const colours = Array.isArray(document.colours) ? document.colours : null
  const textStyles = Array.isArray(document.textStyles) ? document.textStyles : null
  const spacing = Array.isArray(document.spacing) ? document.spacing : null
  const borders = Array.isArray(document.borders) ? document.borders : null
  const radii = Array.isArray(document.radii) ? document.radii : null
  const shadows = Array.isArray(document.shadows) ? document.shadows : null
  if (!colours) fail("colours", "expected an array")
  if (!textStyles) fail("textStyles", "expected an array")
  if (!spacing) fail("spacing", "expected an array")
  if (!borders) fail("borders", "expected an array")
  if (!radii) fail("radii", "expected an array")
  if (!shadows) fail("shadows", "expected an array")

  const colourNames = new Set<string>()
  const colourValues = new Set<string>()
  if (colours) {
    colours.forEach((entry, index) => {
      const path = `colours[${index}]`
      if (!isObj(entry)) return fail(path, "expected an object")
      if (typeof entry.name !== "string" || !entry.name) fail(`${path}.name`, "missing name")
      else if (colourNames.has(entry.name)) fail(`${path}.name`, "duplicate name")
      else colourNames.add(entry.name)
      if (typeof entry.css !== "string" || !entry.css) fail(`${path}.css`, "missing exact colour")
      else if (colourValues.has(entry.css)) fail(`${path}.css`, "duplicate colour value")
      else colourValues.add(entry.css)
      if (typeof entry.alpha !== "number" || entry.alpha < 0 || entry.alpha > 1) fail(`${path}.alpha`, "expected a number from 0 to 1")
      const framer = entry.framer
      if (!isObj(framer) || framer.action !== "createColorStyle") fail(`${path}.framer.action`, "expected createColorStyle")
      else {
        if (framer.name !== entry.name) fail(`${path}.framer.name`, "must match the token name")
        if (typeof framer.light !== "string" || !framer.light.startsWith("rgba(")) fail(`${path}.framer.light`, "expected an rgba() colour")
      }
    })
  }

  const textNames = new Set<string>()
  const textKeys = new Set<string>()
  if (textStyles) {
    textStyles.forEach((entry, index) => {
      const path = `textStyles[${index}]`
      if (!isObj(entry)) return fail(path, "expected an object")
      if (typeof entry.name !== "string" || !entry.name) fail(`${path}.name`, "missing name")
      else if (textNames.has(entry.name)) fail(`${path}.name`, "duplicate name")
      else textNames.add(entry.name)
      const roles = Array.isArray(entry.roles) ? entry.roles.filter((role): role is string => typeof role === "string") : []
      if (!roles.length || roles.some((role) => !ROLES.includes(role as (typeof ROLES)[number]))) {
        fail(`${path}.roles`, "expected measured roles")
      }
      for (const key of ["fontFamily", "fontSize", "fontWeight", "lineHeight", "letterSpacing", "textTransform", "colorStyle"]) {
        if (typeof entry[key] !== "string" || !String(entry[key]).length) fail(`${path}.${key}`, "missing string")
      }
      if (typeof entry.colorStyle === "string" && !colourNames.has(entry.colorStyle)) fail(`${path}.colorStyle`, "unknown colour style")
      const key = ["fontFamily", "fontSize", "fontWeight", "lineHeight", "letterSpacing", "textTransform", "colorStyle"].map((name) => String(entry[name])).join("|")
      if (textKeys.has(key)) fail(path, "duplicate typography combination")
      else textKeys.add(key)
      const framer = entry.framer
      if (!isObj(framer) || framer.action !== "createTextStyle") fail(`${path}.framer.action`, "expected createTextStyle")
      else {
        if (framer.name !== entry.name) fail(`${path}.framer.name`, "must match the token name")
        if (!TAGS.includes(framer.tag as (typeof TAGS)[number])) fail(`${path}.framer.tag`, "expected a Framer text tag")
        if (framer.colorStyle !== entry.colorStyle) fail(`${path}.framer.colorStyle`, "must match colorStyle")
        if (typeof framer.fontFamily !== "string" || !framer.fontFamily) fail(`${path}.framer.fontFamily`, "missing family to request")
        if (typeof framer.fontWeight !== "number") fail(`${path}.framer.fontWeight`, "expected a numeric weight")
        if (framer.letterSpacing !== entry.letterSpacing) fail(`${path}.framer.letterSpacing`, "must keep the measured letter-spacing")
        if (typeof framer.tag === "string" && /^h[1-6]$/.test(framer.tag) && !roles.includes(framer.tag)) {
          fail(`${path}.framer.tag`, "heading tag was not measured")
        }
      }
    })
  }

  const spacingKeys = new Set<string>()
  if (spacing) {
    spacing.forEach((entry, index) => {
      const path = `spacing[${index}]`
      if (!isObj(entry)) return fail(path, "expected an object")
      if (entry.kind !== "padding" && entry.kind !== "margin" && entry.kind !== "gap") fail(`${path}.kind`, "expected padding, margin, or gap")
      const signature = JSON.stringify(entry.kind === "gap" ? entry.axes : entry.sides)
      if (spacingKeys.has(`${entry.kind}:${signature}`)) fail(path, "duplicate spacing value")
      else spacingKeys.add(`${entry.kind}:${signature}`)
      const record = entry.kind === "gap" ? entry.axes : entry.sides
      if (!isObj(record) || !Object.keys(record).length) fail(path, "missing sides or axes")
      else {
        for (const value of Object.values(record)) {
          if (typeof value !== "string" || !value) fail(path, "missing length")
          else if (isZeroLength(value)) fail(path, "zero lengths are omitted")
        }
      }
    })
  }

  const borderKeys = new Set<string>()
  if (borders) {
    borders.forEach((entry, index) => {
      const path = `borders[${index}]`
      if (!isObj(entry) || !isObj(entry.sides) || !Object.keys(entry.sides).length) return fail(path, "expected painted sides")
      const signature = JSON.stringify(entry.sides)
      if (borderKeys.has(signature)) fail(path, "duplicate border")
      else borderKeys.add(signature)
      for (const [side, raw] of Object.entries(entry.sides)) {
        if (!isObj(raw)) {
          fail(`${path}.sides.${side}`, "expected a side")
          continue
        }
        if (typeof raw.width !== "string" || isZeroLength(raw.width)) fail(`${path}.sides.${side}.width`, "expected a painted width")
        if (typeof raw.style !== "string" || raw.style === "none" || raw.style === "hidden") fail(`${path}.sides.${side}.style`, "expected a visible style")
        if (typeof raw.css !== "string" || !raw.css) fail(`${path}.sides.${side}.css`, "missing colour")
        if (typeof raw.colorStyle !== "string" || !colourNames.has(raw.colorStyle)) fail(`${path}.sides.${side}.colorStyle`, "unknown colour style")
      }
    })
  }

  const radiusKeys = new Set<string>()
  if (radii) {
    radii.forEach((entry, index) => {
      const path = `radii[${index}]`
      if (!isObj(entry) || !isObj(entry.corners) || !Object.keys(entry.corners).length) return fail(path, "expected corners")
      const signature = JSON.stringify(entry.corners)
      if (radiusKeys.has(signature)) fail(path, "duplicate radius")
      else radiusKeys.add(signature)
      for (const value of Object.values(entry.corners)) {
        if (typeof value !== "string" || isZeroLength(value)) fail(path, "zero radii are omitted")
      }
    })
  }

  const shadowValues = new Set<string>()
  if (shadows) {
    shadows.forEach((entry, index) => {
      const path = `shadows[${index}]`
      if (!isObj(entry) || typeof entry.css !== "string" || !entry.css || entry.css === "none") return fail(path, "expected a shadow")
      if (shadowValues.has(entry.css)) fail(path, "duplicate shadow")
      else shadowValues.add(entry.css)
    })
  }

  if (errors.length) throw new TokenValidationError(errors)
}
