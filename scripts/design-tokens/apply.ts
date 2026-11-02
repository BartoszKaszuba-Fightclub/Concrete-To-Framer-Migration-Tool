/**
 * Creates the color styles and text styles named in a token document.
 * Does not add layers, change breakpoints, or publish.
 */
import "dotenv/config"
import { readFile, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { parseArgs } from "node:util"
import { connect } from "framer-api"
import { validateTokens } from "./schema.ts"

const EXPECTED_PROJECT = "Enchanting Whoever"
const TRANSFORMS = new Set(["none", "inherit", "capitalize", "uppercase", "lowercase"])
const FONT_WEIGHTS = [100, 200, 300, 400, 500, 600, 700, 800, 900] as const
type FontWeight = (typeof FONT_WEIGHTS)[number]

type ColourEntry = { name: string; framer: { name: string; light: string } }
type TextEntry = {
  name: string
  fontFamily: string
  fontWeight: string
  letterSpacing: string
  framer: {
    name: string
    tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p"
    fontFamily: string
    fontWeight: number
    fontSize: string
    lineHeight: string
    letterSpacing: string
    transform: string
    colorStyle: string
  }
}
type Skipped = { name: string; reason: string; fontFamily?: string; requestedFamily?: string; fontWeight?: string }

const { values } = parseArgs({
  options: {
    tokens: { type: "string" },
    project: { type: "string" },
    result: { type: "string" },
  },
})

if (!values.tokens || !values.project) {
  console.error("Usage: node --import tsx scripts/design-tokens/apply.ts --tokens <tokens.json> --project <projectUrlOrId>")
  process.exit(1)
}

await apply(values.tokens, values.project, values.result)

async function apply(tokensPath: string, project: string, result: string | undefined) {
  const document = JSON.parse(await readFile(tokensPath, "utf8")) as { colours: ColourEntry[]; textStyles: TextEntry[] }
  validateTokens(document)
  const token = process.env.FRAMER_TOKEN
  if (!token) {
    console.error("FRAMER_TOKEN is missing from the environment")
    process.exit(1)
  }

  const framer = await connect(project, token)
  const resultPath = result ?? join(dirname(tokensPath), "framer-apply.json")
  try {
    const info = await framer.getProjectInfo()
    if (info.name !== EXPECTED_PROJECT) {
      await writeFile(resultPath, `${JSON.stringify({ projectName: info.name, accepted: false, createdColorStyles: 0, createdTextStyles: 0, missingFonts: [] }, null, 2)}\n`)
      console.error(`Connected project is "${info.name}". Expected "${EXPECTED_PROJECT}". No styles were written.`)
      process.exitCode = 2
      return
    }

    const colourByName = new Map<string, Awaited<ReturnType<typeof framer.getColorStyles>>[number]>()
    for (const style of await framer.getColorStyles()) indexStyle(colourByName, style.name, style.path, style)

    let createdColorStyles = 0
    let existingColorStyles = 0
    for (const entry of document.colours) {
      if (colourByName.has(entry.framer.name) || colourByName.has(entry.name)) {
        existingColorStyles += 1
        continue
      }
      const created = await framer.createColorStyle({ name: entry.framer.name, light: entry.framer.light })
      indexStyle(colourByName, created.name, created.path, created)
      colourByName.set(entry.name, created)
      createdColorStyles += 1
    }

    const textNames = new Set<string>()
    for (const style of await framer.getTextStyles()) {
      textNames.add(style.name)
      if (style.path) textNames.add(style.path)
      if (style.path && style.name) textNames.add(`${style.path}/${style.name}`)
    }

    let createdTextStyles = 0
    let existingTextStyles = 0
    const missingFonts: Skipped[] = []
    const skippedTextStyles: Skipped[] = []
    const letterSpacingKeptAsNormal: string[] = []

    for (const entry of document.textStyles) {
      if (textNames.has(entry.framer.name) || textNames.has(entry.name)) {
        existingTextStyles += 1
        continue
      }
      const weight = asWeight(entry.framer.fontWeight)
      if (!weight) {
        missingFonts.push({ name: entry.name, reason: "missing-font", fontFamily: entry.fontFamily, requestedFamily: entry.framer.fontFamily, fontWeight: entry.fontWeight })
        continue
      }
      const font = await framer.getFont(entry.framer.fontFamily, { weight })
      if (!font) {
        missingFonts.push({ name: entry.name, reason: "missing-font", fontFamily: entry.fontFamily, requestedFamily: entry.framer.fontFamily, fontWeight: entry.fontWeight })
        continue
      }
      const color = colourByName.get(entry.framer.colorStyle) ?? colourByName.get(entry.colorStyle)
      if (!color) {
        skippedTextStyles.push({ name: entry.name, reason: "missing-color-style" })
        continue
      }
      const fontSize = cssLength(entry.framer.fontSize)
      const lineHeight = entry.framer.lineHeight === "normal" ? undefined : cssLength(entry.framer.lineHeight)
      const letterSpacing = entry.letterSpacing === "normal" ? undefined : cssLength(entry.letterSpacing)
      if (!fontSize || (entry.framer.lineHeight !== "normal" && !lineHeight) || (entry.letterSpacing !== "normal" && !letterSpacing)) {
        skippedTextStyles.push({ name: entry.name, reason: "unsupported-length" })
        continue
      }
      if (entry.letterSpacing === "normal") letterSpacingKeptAsNormal.push(entry.name)
      const created = await framer.createTextStyle({
        name: entry.framer.name,
        tag: entry.framer.tag,
        font,
        fontSize,
        ...(lineHeight ? { lineHeight } : {}),
        ...(letterSpacing ? { letterSpacing } : {}),
        ...(TRANSFORMS.has(entry.framer.transform) ? { transform: entry.framer.transform as "none" } : {}),
        color,
      })
      textNames.add(created.name)
      if (created.path) textNames.add(`${created.path}/${created.name}`)
      createdTextStyles += 1
    }

    const report = {
      projectName: info.name,
      accepted: true,
      createdColorStyles,
      existingColorStyles,
      createdTextStyles,
      existingTextStyles,
      missingFonts,
      skippedTextStyles,
      letterSpacingKeptAsNormal,
    }
    await writeFile(resultPath, `${JSON.stringify(report, null, 2)}\n`)
    console.log(JSON.stringify({
      projectName: report.projectName,
      accepted: true,
      createdColorStyles,
      createdTextStyles,
      existingColorStyles,
      existingTextStyles,
      missingFonts: missingFonts.length,
      result: resultPath,
    }))
  } finally {
    await framer.disconnect()
  }
}

function indexStyle<T>(map: Map<string, T>, name: string, path: string, style: T) {
  map.set(name, style)
  if (path) map.set(path, style)
  if (path && name) map.set(`${path}/${name}`, style)
}

function asWeight(value: number): FontWeight | null {
  return FONT_WEIGHTS.find((weight) => weight === value) ?? null
}

function cssLength(value: string): `${number}px` | null {
  return /^-?[0-9.]+(px|em|%)$/.test(value) ? value as `${number}px` : null
}
