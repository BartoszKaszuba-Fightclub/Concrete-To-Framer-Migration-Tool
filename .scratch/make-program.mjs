import { readFileSync, writeFileSync } from "node:fs"

const plan = JSON.parse(readFileSync(process.argv[2], "utf8"))
const allUrls = JSON.parse(readFileSync(process.argv[3], "utf8"))
const usedPaths = new Set()
JSON.stringify(plan).replace(/Database\/digest\/[^"]+/g, (filePath) => usedPaths.add(filePath))
const assetUrls = Object.fromEntries([...usedPaths].filter((filePath) => allUrls[filePath]).map((filePath) => [filePath, allUrls[filePath]]))
const program = `const plan = ${JSON.stringify(plan)};
const assetUrls = ${JSON.stringify(assetUrls)};
const { tree } = api;
let active = tree.getActiveBranch();
if (active.id !== "wzbtrwl5n") {
  await tree.switchBranch("wzbtrwl5n");
  active = tree.getActiveBranch();
}
if (active.id !== "wzbtrwl5n") throw new Error("wrong branch " + active.id);
const colors = Object.fromEntries(tree.getNodesOfTypes("ColorStyleTokenNode").map((node) => [node.name, node]));
const presets = Object.fromEntries(tree.getNodesOfTypes("TextStylePresetNode").map((node) => [node.name, node.id]));
const organisms = tree.getNodesOfTypes("VirtualFolderNode").find((node) => node.name === "Organisms" && node.$parentId === "assetsEntityRoot");
if (!organisms) throw new Error("Organisms folder missing");
const component = plan.componentId ? await tree.get(plan.componentId) : tree.insert("ComponentNode", "org-" + plan.key, { name: plan.name });
if (!component) throw new Error("component missing");
if (!plan.componentId) tree.insert("VirtualReferenceNode", "org-ref-" + plan.key, { parent: organisms.id, reference: component.id });
const used = new Map();
function uniqueName(base) {
  const clean = String(base || "Item").replace(/\\s+/g, " ").trim().slice(0, 70) || "Item";
  const count = used.get(clean) || 0;
  used.set(clean, count + 1);
  return count === 0 ? clean : clean + " " + (count + 1);
}
const assetCache = new Map();
async function imageAsset(filePath) {
  if (!filePath) return null;
  if (assetCache.has(filePath)) return assetCache.get(filePath);
  const url = assetUrls[filePath];
  if (!url) return null;
  const asset = await tree.assetReference(url);
  assetCache.set(filePath, asset);
  return asset;
}
function paint(name) {
  if (!name) return null;
  if (colors[name]) return tree.token(colors[name]);
  if (typeof name === "string" && name.startsWith("rgb")) return name;
  return null;
}
function bindLink(nodeId, label, href) {
  const variable = tree.var(component, { type: "link", name: uniqueName(label || "Link") });
  tree.patch(nodeId, { link: { href: tree.ref(variable, component) } });
  tree.patch(component.id, { ["$control__" + variable.id]: href });
}
let made = 0;
async function build(spec, parentId, inGrid) {
  const nodeId = plan.key + "-" + spec.id;
  if (spec.kind === "text") {
    const fullText = (spec.runs || []).map((run) => run.text).join("");
    const variable = tree.var(component, { type: "string", name: uniqueName(spec.name), initialValue: fullText });
    const linked = (spec.runs || []).some((run) => run.href);
    const attrs = {
      parent: parentId,
      name: uniqueName(spec.name),
      width: inGrid ? "1fr" : (spec.width || "1fr"),
      tag: spec.tag || "p",
    };
    if (spec.preset) attrs.textStylePreset = presets[spec.preset];
    else {
      if (spec.fontName) attrs.fontName = spec.fontName;
      if (spec.fontWeight) attrs.fontWeight = spec.fontWeight;
      if (spec.fontSize) attrs.fontSize = spec.fontSize;
      if (spec.lineHeight) attrs.lineHeight = spec.lineHeight;
      if (spec.letterSpacing) attrs.letterSpacing = spec.letterSpacing;
      const color = paint(spec.colorStyle);
      if (color) attrs.textColor = color;
    }
    if (!linked) attrs.text = tree.ref(variable, component);
    const node = tree.insert("RichTextNode", nodeId, attrs);
    if (linked) {
      const block = tree.insert("TextBlock", nodeId + "b", { parent: node.id, tag: spec.tag || "p" });
      spec.runs.forEach((run, index) => {
        const runAttrs = { parent: block.id, text: run.text };
        if (run.href) runAttrs.link = { href: run.href };
        tree.insert("TextRun", nodeId + "r" + index, runAttrs);
      });
    }
    tree.patch(node.id, { tag: spec.tag || "p" });
    made += 1;
    return node.id;
  }
  if (spec.kind === "svg") {
    const node = tree.insert("SVGNode", nodeId, {
      parent: parentId,
      name: uniqueName(spec.name),
      svg: spec.svg,
      width: spec.width,
      height: spec.height,
    });
    if (spec.link?.href) bindLink(node.id, spec.link.label, spec.link.href);
    made += 1;
    return node.id;
  }
  if (spec.kind === "image") {
    const asset = await imageAsset(spec.image);
    const attrs = {
      parent: parentId,
      name: uniqueName(spec.alt || spec.name),
      width: spec.width,
      height: spec.height,
    };
    if (spec.alt) attrs.altText = spec.alt;
    if (asset) {
      const variable = tree.var(component, { type: "image", name: uniqueName(spec.alt || spec.name), initialValue: asset });
      attrs.fill = tree.ref(variable, component);
    } else {
      const color = paint(spec.fill);
      if (color) attrs.fill = color;
    }
    if (spec.position === "absolute") {
      attrs.position = "absolute";
      attrs.left = spec.left || "0px";
      attrs.top = spec.top || "0px";
      attrs.right = null;
      attrs.bottom = null;
    }
    if (spec.translateY) attrs.translateY = spec.translateY;
    const node = tree.insert("FrameNode", nodeId, attrs);
    if (spec.link?.href) bindLink(node.id, spec.link.label, spec.link.href);
    made += 1;
    return node.id;
  }
  const attrs = {
    parent: parentId,
    name: uniqueName(spec.name),
    width: inGrid ? "1fr" : spec.width,
    height: spec.layout === "grid" ? "auto" : (spec.height || "auto"),
    layout: spec.layout === "grid" ? "grid" : "stack",
    stackDirection: spec.direction === "horizontal" ? "horizontal" : "vertical",
    stackDistribution: spec.link ? "center" : "start",
    stackAlignment: spec.align === "center" || spec.link ? "center" : "start",
    stackWrapEnabled: spec.wrap === true,
  };
  if (spec.layout === "grid") {
    attrs.gridColumnCount = spec.columns;
    attrs.gridColumnWidth = spec.columnWidth;
    attrs.gridRowHeightType = "fit";
    attrs.gridAlignment = "start";
  }
  if (spec.gap != null) attrs.gap = spec.gap;
  if (spec.padding) attrs.padding = spec.padding;
  const fill = paint(spec.fill);
  if (fill) attrs.fill = fill;
  if (spec.radius) attrs.radius = spec.radius;
  if (spec.border?.width && spec.border.color) {
    const borderColor = paint(spec.border.color);
    if (borderColor) {
      attrs.borderWidth = spec.border.width;
      attrs.borderStyle = spec.border.style || "solid";
      attrs.borderColor = borderColor;
    }
  }
  if (spec.overflow) attrs.overflow = spec.overflow;
  if (spec.opacity != null) attrs.opacity = spec.opacity;
  if (spec.htmlTag) attrs.htmlTag = spec.htmlTag;
  if (spec.position === "absolute") {
    attrs.position = "absolute";
    attrs.left = spec.left || "0px";
    attrs.top = spec.top || "0px";
    attrs.right = null;
    attrs.bottom = null;
  }
  const node = tree.insert("FrameNode", nodeId, attrs);
  if (spec.link?.href && spec.link.href !== "#") bindLink(node.id, spec.link.label, spec.link.href);
  made += 1;
  for (const child of spec.children || []) await build(child, node.id, spec.layout === "grid");
  return node.id;
}
const rootId = plan.attachParent ? plan.attachParent : (await build(plan.spec, component.id));
if (plan.attachParent) {
  for (const child of plan.spec.children || []) await build(child, plan.attachParent);
}
return { key: plan.key, name: plan.name, componentId: component.id, rootId, made, branch: tree.getActiveBranch().id };
`
writeFileSync(process.argv[4], program)
console.log(plan.key, program.length)
