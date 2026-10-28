export const DEFAULT_CAPTURE_WIDTH = 1200
export const DEFAULT_CAPTURE_HEIGHT = 900
export const DEFAULT_CAPTURE_STATE = "default"

export type WidthSelection = {
  selectedWidth: number
  ignoredWidths: number[]
  warning?: string
}

// One capture per run. Discovery still records other breakpoints; it does not write them.
export function selectCaptureWidth(raw: string | undefined): WidthSelection {
  if (raw == null || raw.trim() === "") return { selectedWidth: DEFAULT_CAPTURE_WIDTH, ignoredWidths: [] }
  const widths = raw
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((width) => Number.isFinite(width) && width > 0)
  if (widths.length === 0) return { selectedWidth: DEFAULT_CAPTURE_WIDTH, ignoredWidths: [] }
  if (widths.length === 1) return { selectedWidth: widths[0], ignoredWidths: [] }
  const ignoredWidths = widths.slice(1)
  return {
    selectedWidth: widths[0],
    ignoredWidths,
    warning: `Multiple widths were requested (${widths.join(", ")}). Capturing ${widths[0]} only; ignoring ${ignoredWidths.join(", ")}.`,
  }
}
