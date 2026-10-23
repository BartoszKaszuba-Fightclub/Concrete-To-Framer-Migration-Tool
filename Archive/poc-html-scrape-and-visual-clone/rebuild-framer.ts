/**
 * Rebuilds data/hero-layout.json into a Framer design page via framer-api.
 * Uses colored placeholders only (no CMS, no image uploads).
 */
import "dotenv/config"
import { connect } from "framer-api"
import fs from "node:fs/promises"
import path from "node:path"

const PROJECT_URL =
  process.env.FRAMER_PROJECT_URL ??
  "https://framer.com/projects/Spinning-Messages--kJ2Ihks3y2NZGTuibZtV-1e8vR?node=DEFOFkw0C"

const API_KEY = process.env.FRAMER_TOKEN ?? process.env.FRAMER_API_KEY
const LAYOUT_PATH = path.join(process.cwd(), "data", "hero-layout.json")
const DESIGN_PAGE_NAME = "Coca-Cola NL Hero POC"

type Rect = { x: number; y: number; w: number; h: number }

type Layer =
  | {
      kind: "frame"
      name: string
      rect: Rect
      backgroundColor: string
      borderRadius?: string
      opacity?: number
    }
  | {
      kind: "text"
      name: string
      rect: Rect
      text: string
      color: string
      fontSize: string
      fontWeight: string
      fontFamily: string
      lineHeight: string
      textAlign: "left" | "center" | "right" | "justify"
      tag: "h1" | "h2" | "h3" | "p"
    }

type HeroLayout = {
  sourceUrl: string
  scrapedAt: string
  viewport: { width: number; height: number }
  notes: string[]
  layers: Layer[]
}

function px(n: number): `${number}px` {
  return `${Math.round(n)}px`
}

function normalizeBorderRadius(value?: string): string | undefined {
  if (!value || value === "0px") return undefined
  // Framer accepts single or 4-value radii; clamp absurd pill values.
  if (value.includes(" ")) return value
  const n = parseFloat(value)
  if (!Number.isFinite(n)) return undefined
  if (n >= 1000) return "999px"
  return `${n}px`
}

async function main() {
  if (!API_KEY) {
    throw new Error(
      "Missing FRAMER_TOKEN (or FRAMER_API_KEY) in environment / .env",
    )
  }

  const raw = await fs.readFile(LAYOUT_PATH, "utf8")
  const layout = JSON.parse(raw) as HeroLayout

  const framer = await connect(PROJECT_URL, API_KEY)
  try {
    const info = await framer.getProjectInfo()
    console.log(`Connected to project: ${info.name}`)

    const existing = (await framer.getNodesWithType("DesignPageNode")).find(
      (page) => page.name === DESIGN_PAGE_NAME,
    )

    const designPage =
      existing ?? (await framer.createDesignPage(DESIGN_PAGE_NAME))

    // Server API mode does not allow navigateTo(); parent all nodes to the design page id.
    const existingChildren = await designPage.getChildren()
    if (existingChildren.length > 0) {
      await framer.removeNodes(existingChildren.map((node) => node.id))
    }

    const pageLayer = layout.layers.find(
      (layer) => layer.kind === "frame" && layer.name === "page",
    )
    if (!pageLayer || pageLayer.kind !== "frame") {
      throw new Error('Layout JSON missing required frame layer "page"')
    }

    const pageFrame = await framer.createFrameNode(
      {
        name: "HeroViewport",
        width: px(pageLayer.rect.w),
        height: px(pageLayer.rect.h),
        backgroundColor: pageLayer.backgroundColor,
        layout: null,
        overflow: "hidden",
      },
      designPage.id,
    )
    if (!pageFrame) throw new Error("Failed to create page frame")

    // Text styles keyed by a compact signature so we reuse styles.
    const textStyles = new Map<
      string,
      Awaited<ReturnType<typeof framer.createTextStyle>>
    >()
    let textStyleCounter = 0

    const getTextStyle = async (layer: Extract<Layer, { kind: "text" }>) => {
      const key = [
        layer.tag,
        layer.fontSize,
        layer.lineHeight,
        layer.color,
        layer.fontWeight,
        layer.textAlign,
      ].join("|")
      const cached = textStyles.get(key)
      if (cached) return cached

      const weight = Number.parseInt(layer.fontWeight, 10)
      const font =
        (await framer.getFont("Inter", {
          weight: Number.isFinite(weight) && weight >= 600 ? 700 : 400,
        })) ?? (await framer.getFont("Inter"))

      textStyleCounter += 1
      const style = await framer.createTextStyle({
        name: `POC/${textStyleCounter}-${layer.name}`,
        tag: layer.tag,
        fontSize: layer.fontSize as `${number}px`,
        lineHeight: layer.lineHeight.includes("px")
          ? (layer.lineHeight as `${number}px`)
          : ("1.2em" as const),
        color: layer.color,
        alignment: layer.textAlign,
        ...(font ? { font } : {}),
      })
      textStyles.set(key, style)
      return style
    }

    for (const layer of layout.layers) {
      if (layer.name === "page") continue
      // Skip zero-size leftovers from scrape edge cases.
      if (layer.rect.w <= 0 || layer.rect.h <= 0) continue

      if (layer.kind === "frame") {
        const created = await framer.createFrameNode(
          {
            name: layer.name,
            position: "absolute",
            left: px(layer.rect.x),
            top: px(layer.rect.y),
            width: px(layer.rect.w),
            height: px(layer.rect.h),
            backgroundColor: layer.backgroundColor,
            borderRadius: normalizeBorderRadius(layer.borderRadius),
            opacity: layer.opacity ?? 1,
          },
          pageFrame.id,
        )
        if (!created) {
          console.warn(`Skipped frame: ${layer.name}`)
        }
        continue
      }

      const style = await getTextStyle(layer)
      const textNode = await framer.createTextNode(
        {
          name: layer.name,
          position: "absolute",
          left: px(layer.rect.x),
          top: px(layer.rect.y),
          width: px(layer.rect.w),
          height: px(Math.max(layer.rect.h, 20)),
          inlineTextStyle: style,
        },
        pageFrame.id,
      )
      if (!textNode) {
        console.warn(`Skipped text: ${layer.name}`)
        continue
      }
      await textNode.setText(layer.text)
    }

    console.log(`Rebuilt design page "${DESIGN_PAGE_NAME}"`)
    console.log(`Source: ${layout.sourceUrl}`)
    console.log(`Scraped: ${layout.scrapedAt}`)
    if (layout.notes?.length) {
      for (const note of layout.notes) console.log(`Note: ${note}`)
    }
  } finally {
    await framer.disconnect()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
