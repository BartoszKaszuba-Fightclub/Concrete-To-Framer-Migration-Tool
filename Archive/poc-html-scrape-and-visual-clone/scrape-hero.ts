/**
 * Deterministic scrape of the Coca-Cola NL homepage first viewport.
 * Output: data/hero-layout.json (no images downloaded — color placeholders only).
 */
import { chromium } from "@playwright/test"
import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const SOURCE_URL = "https://www.coca-cola.com/nl/nl"
const VIEWPORT = { width: 1440, height: 900 }
const OUT_PATH = path.join(process.cwd(), "data", "hero-layout.json")
const BROWSER_HELPER = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "browser-scrape-hero.js",
)

type HeroLayout = {
  sourceUrl: string
  scrapedAt: string
  viewport: { width: number; height: number }
  notes: string[]
  layers: unknown[]
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: VIEWPORT })
  await page.goto(SOURCE_URL, { waitUntil: "domcontentloaded", timeout: 60_000 })
  await page.waitForTimeout(1500)

  await page.addScriptTag({ path: BROWSER_HELPER })
  // Use string evaluate so TSX cannot inject __name helpers into the browser realm.
  await page.evaluate("window.__cocaHeroPoc.dismissCookies()")
  await page.waitForTimeout(500)
  const layout = (await page.evaluate(
    "window.__cocaHeroPoc.scrapeHeroLayout()",
  )) as HeroLayout

  await fs.mkdir(path.dirname(OUT_PATH), { recursive: true })
  await fs.writeFile(OUT_PATH, JSON.stringify(layout, null, 2), "utf8")
  console.log(`Wrote ${OUT_PATH}`)
  console.log(`Layers: ${layout.layers.length}`)

  await browser.close()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
