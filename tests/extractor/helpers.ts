import { spawn } from "node:child_process"
import { mkdtemp, readdir, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join, dirname } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const here = dirname(fileURLToPath(import.meta.url))
export const repoRoot = join(here, "../..")
export const fixtures = join(here, "fixtures")

export function fixtureUrl(name: string): string {
  return pathToFileURL(join(fixtures, name)).href
}

export function runExtractor(args: string[]): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ["--import", "tsx", "scripts/generic-extractor/cli.ts", ...args], { cwd: repoRoot })
    let stdout = ""
    let stderr = ""
    child.stdout.on("data", (chunk) => { stdout += String(chunk) })
    child.stderr.on("data", (chunk) => { stderr += String(chunk) })
    child.on("close", (code) => resolve({ code: code ?? 1, stdout, stderr }))
  })
}

export async function tempOut(): Promise<string> {
  return mkdtemp(join(tmpdir(), "ctf-extract-"))
}

export async function removeOut(dir: string): Promise<void> {
  await rm(dir, { recursive: true, force: true })
}

export async function filesUnder(dir: string): Promise<string[]> {
  const found: string[] = []
  const walk = async (current: string) => {
    let entries
    try {
      entries = await readdir(current, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      const path = join(current, entry.name)
      if (entry.isDirectory()) await walk(path)
      else found.push(path)
    }
  }
  await walk(dir)
  return found
}

export const REMOVED_ARTIFACTS = [
  "elements.json",
  "report.json",
  "matches.proposed.json",
  "sections.approved.json",
  "pending-decision.json",
  "sections-preview.png",
]
