import { mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname, join, relative, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"
import type { Page } from "@playwright/test"

export type AssetEvidence = {
  nodeId: string
  originalUrl: string
  usablePath: string
  naturalWidth?: number
  naturalHeight?: number
}

export type AssetBytes = { ok: boolean; bytes: Buffer; contentType?: string }

type MediaNode = { media?: { url?: string }[] }
type Size = { naturalWidth?: number; naturalHeight?: number }

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "image/svg+xml": ".svg",
  "image/avif": ".avif",
  "image/x-icon": ".ico",
  "image/vnd.microsoft.icon": ".ico",
}

export function mediaReferences(nodes: Record<string, MediaNode>): { nodeId: string; originalUrl: string }[] {
  const refs: { nodeId: string; originalUrl: string }[] = []
  for (const [nodeId, node] of Object.entries(nodes)) {
    for (const media of node.media ?? []) {
      if (media.url) refs.push({ nodeId, originalUrl: media.url })
    }
  }
  return refs
}

export function imageSize(bytes: Buffer): { naturalWidth: number; naturalHeight: number } | null {
  return pngSize(bytes) ?? gifSize(bytes) ?? jpegSize(bytes) ?? svgSize(bytes)
}

export async function fetchPageAsset(page: Page, url: string): Promise<AssetBytes | null> {
  if (url.startsWith("data:")) {
    const decoded = decodeDataUrl(url)
    return decoded ? { ok: decoded.bytes.length > 0, bytes: decoded.bytes, contentType: decoded.contentType } : null
  }
  if (url.startsWith("file:")) {
    try {
      const bytes = await readFile(fileURLToPath(url))
      return { ok: bytes.length > 0, bytes }
    } catch {
      return null
    }
  }
  let protocol = ""
  try {
    protocol = new URL(url).protocol
  } catch {
    return null
  }
  if (protocol !== "http:" && protocol !== "https:") return null
  const response = await page.request.get(url, { timeout: 30_000 })
  if (!response.ok()) return { ok: false, bytes: Buffer.alloc(0) }
  return { ok: true, bytes: Buffer.from(await response.body()), contentType: response.headers()["content-type"] }
}

export async function saveCaptureAssets(options: {
  nodes: Record<string, MediaNode>
  directory: string
  pathRoot: string
  baseUrl: string
  fetchAsset: (url: string) => Promise<AssetBytes | null>
  sizes?: Map<string, Size>
}): Promise<{ assets: AssetEvidence[]; warnings: { code: string; message: string; nodeIds: string[] }[] }> {
  const refs = mediaReferences(options.nodes)
  const nodeIdsByUrl = new Map<string, string[]>()
  for (const ref of refs) {
    const ids = nodeIdsByUrl.get(ref.originalUrl) ?? []
    ids.push(ref.nodeId)
    nodeIdsByUrl.set(ref.originalUrl, ids)
  }

  const directory = resolve(options.directory)
  const pathRoot = resolve(options.pathRoot)
  await mkdir(directory, { recursive: true })
  const taken = new Set<string>()
  const saved = new Map<string, { usablePath: string; naturalWidth?: number; naturalHeight?: number }>()
  const warnings: { code: string; message: string; nodeIds: string[] }[] = []

  for (const [originalUrl, nodeIds] of nodeIdsByUrl) {
    const resolved = resolveAssetUrl(originalUrl, options.baseUrl)
    let fetched: AssetBytes | null = null
    try {
      fetched = await options.fetchAsset(resolved)
    } catch {
      fetched = null
    }
    const type = fetched?.contentType?.split(";")[0]?.trim().toLowerCase()
    if (!fetched?.ok || fetched.bytes.length === 0 || type === "text/html") {
      warnings.push({ code: "asset-download-failed", message: `Could not save a local file for ${originalUrl}.`, nodeIds })
      continue
    }
    const name = fileNameFor(originalUrl, type, taken)
    const file = join(directory, name)
    await writeFile(file, fetched.bytes)
    const size = chosenSize(options.sizes?.get(originalUrl), imageSize(fetched.bytes))
    saved.set(originalUrl, { usablePath: relative(pathRoot, file).split(sep).join("/"), ...size })
  }

  const assets: AssetEvidence[] = []
  for (const ref of refs) {
    const local = saved.get(ref.originalUrl)
    if (local) assets.push({ nodeId: ref.nodeId, originalUrl: ref.originalUrl, ...local })
  }
  return { assets, warnings }
}

export async function readAssetEvidence(structurePath: string): Promise<AssetEvidence[] | undefined> {
  const path = join(dirname(structurePath), "assets.json")
  let raw: unknown
  try {
    raw = JSON.parse(await readFile(path, "utf8"))
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined
    throw error
  }
  if (!Array.isArray(raw)) return undefined
  return raw.flatMap((item) => {
    if (!item || typeof item !== "object") return []
    const record = item as Record<string, unknown>
    if (typeof record.nodeId !== "string" || typeof record.originalUrl !== "string" || typeof record.usablePath !== "string") return []
    if (!record.usablePath || /^(https?:|data:|blob:)/i.test(record.usablePath)) return []
    const asset: AssetEvidence = { nodeId: record.nodeId, originalUrl: record.originalUrl, usablePath: record.usablePath }
    if (typeof record.naturalWidth === "number" && Number.isFinite(record.naturalWidth)) asset.naturalWidth = record.naturalWidth
    if (typeof record.naturalHeight === "number" && Number.isFinite(record.naturalHeight)) asset.naturalHeight = record.naturalHeight
    return [asset]
  })
}

function resolveAssetUrl(url: string, baseUrl: string): string {
  try {
    return new URL(url, baseUrl).href
  } catch {
    return url
  }
}

function decodeDataUrl(url: string): { bytes: Buffer; contentType?: string } | null {
  const match = /^data:([^,]*),(.*)$/s.exec(url)
  if (!match) return null
  const meta = match[1]
  const payload = match[2]
  const contentType = meta.split(";")[0] || undefined
  try {
    const bytes = /;base64/i.test(meta) ? Buffer.from(payload, "base64") : Buffer.from(decodeURIComponent(payload))
    return { bytes, contentType }
  } catch {
    return null
  }
}

function fileNameFor(url: string, contentType: string | undefined, taken: Set<string>): string {
  const extension = contentType ? EXTENSIONS[contentType] : undefined
  let base = ""
  if (!url.startsWith("data:")) {
    try {
      base = decodeURIComponent(new URL(url).pathname.split("/").filter(Boolean).pop() ?? "")
    } catch {
      base = ""
    }
  }
  base = base.replace(/[^A-Za-z0-9._-]+/g, "_").replace(/^[._]+/, "").slice(0, 180)
  if (!base) base = `asset${extension ?? ""}`
  else if (extension && !/\.[A-Za-z0-9]{1,8}$/.test(base)) base += extension
  return uniqueName(base, taken)
}

function uniqueName(base: string, taken: Set<string>): string {
  const key = (name: string) => name.toLowerCase()
  if (!taken.has(key(base))) {
    taken.add(key(base))
    return base
  }
  const dot = base.lastIndexOf(".")
  const stem = dot > 0 ? base.slice(0, dot) : base
  const extension = dot > 0 ? base.slice(dot) : ""
  let index = 2
  while (taken.has(key(`${stem}-${index}${extension}`))) index += 1
  const name = `${stem}-${index}${extension}`
  taken.add(key(name))
  return name
}

function chosenSize(measured: Size | undefined, parsed: { naturalWidth: number; naturalHeight: number } | null): Size {
  const naturalWidth = positive(measured?.naturalWidth)
  const naturalHeight = positive(measured?.naturalHeight)
  if (naturalWidth !== undefined || naturalHeight !== undefined) {
    return { ...(naturalWidth !== undefined ? { naturalWidth } : {}), ...(naturalHeight !== undefined ? { naturalHeight } : {}) }
  }
  return parsed ?? {}
}

function positive(value: number | undefined): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return undefined
  return value
}

function pngSize(bytes: Buffer): { naturalWidth: number; naturalHeight: number } | null {
  if (bytes.length < 24 || bytes.toString("ascii", 1, 4) !== "PNG") return null
  const naturalWidth = bytes.readUInt32BE(16)
  const naturalHeight = bytes.readUInt32BE(20)
  if (!naturalWidth || !naturalHeight) return null
  return { naturalWidth, naturalHeight }
}

function gifSize(bytes: Buffer): { naturalWidth: number; naturalHeight: number } | null {
  if (bytes.length < 10 || bytes.toString("ascii", 0, 3) !== "GIF") return null
  const naturalWidth = bytes.readUInt16LE(6)
  const naturalHeight = bytes.readUInt16LE(8)
  if (!naturalWidth || !naturalHeight) return null
  return { naturalWidth, naturalHeight }
}

function jpegSize(bytes: Buffer): { naturalWidth: number; naturalHeight: number } | null {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null
  let offset = 2
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) return null
    const marker = bytes[offset + 1]
    if (marker === 0xd9 || marker === 0xda) return null
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd8)) {
      offset += 2
      continue
    }
    const length = bytes.readUInt16BE(offset + 2)
    if (length < 2 || offset + 2 + length > bytes.length) return null
    const frame = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc
    if (frame) return { naturalHeight: bytes.readUInt16BE(offset + 5), naturalWidth: bytes.readUInt16BE(offset + 7) }
    offset += 2 + length
  }
  return null
}

function svgSize(bytes: Buffer): { naturalWidth: number; naturalHeight: number } | null {
  const tag = bytes.toString("utf8").match(/<svg\b[^>]*>/i)?.[0]
  if (!tag) return null
  const width = lengthAttr(tag, "width")
  const height = lengthAttr(tag, "height")
  if (width && height) return { naturalWidth: width, naturalHeight: height }
  const viewBox = tag.match(/\bviewBox\s*=\s*["']([^"']+)["']/i)?.[1]
  if (!viewBox) return null
  const parts = viewBox.trim().split(/[\s,]+/).map(Number)
  if (parts.length !== 4 || parts.some((part) => !Number.isFinite(part)) || parts[2] <= 0 || parts[3] <= 0) return null
  return { naturalWidth: parts[2], naturalHeight: parts[3] }
}

function lengthAttr(tag: string, name: string): number | undefined {
  const raw = tag.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']+)["']`, "i"))?.[1]
  if (!raw || raw.trim().endsWith("%")) return undefined
  const value = Number.parseFloat(raw)
  return Number.isFinite(value) && value > 0 ? value : undefined
}
