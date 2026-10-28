// Visual signature keys. browser.js records the same computed properties in one traversal.
export const SIGNATURE_KEYS = [
  "fontFamily",
  "fontSize",
  "fontWeight",
  "lineHeight",
  "letterSpacing",
  "color",
  "backgroundColor",
  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "borderTopStyle",
  "borderRightStyle",
  "borderBottomStyle",
  "borderLeftStyle",
  "borderTopColor",
  "borderRightColor",
  "borderBottomColor",
  "borderLeftColor",
  "borderTopLeftRadius",
  "borderTopRightRadius",
  "borderBottomRightRadius",
  "borderBottomLeftRadius",
] as const

export type VisualSignature = Record<(typeof SIGNATURE_KEYS)[number], string>

export function visualSignature(style: Record<string, unknown> | undefined): VisualSignature {
  const signature = {} as VisualSignature
  for (const key of SIGNATURE_KEYS) {
    const value = style?.[key]
    signature[key] = value == null ? "" : String(value)
  }
  return signature
}

export type SignatureDefinition = {
  id: string
  kind: string
  signature: VisualSignature
  instanceIds: string[]
}

// Group by observed colours, borders, and typography. Label text is not part of the key.
export function groupBySignature(items: { nodeId: string; kind: string; signature: VisualSignature }[]): SignatureDefinition[] {
  const groups = new Map<string, { kind: string; signature: VisualSignature; instanceIds: string[] }>()
  for (const item of items) {
    const key = `${item.kind}\n${JSON.stringify(item.signature)}`
    const existing = groups.get(key)
    if (existing) existing.instanceIds.push(item.nodeId)
    else groups.set(key, { kind: item.kind, signature: item.signature, instanceIds: [item.nodeId] })
  }
  return [...groups.values()].map((group, index) => ({
    id: `sig-${String(index + 1).padStart(3, "0")}`,
    kind: group.kind,
    signature: group.signature,
    instanceIds: group.instanceIds,
  }))
}
