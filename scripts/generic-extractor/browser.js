// Evaluated in the page as a string by callBrowser() so tsx/esbuild never injects helpers into it.
// Styles are measured in collect(), the same traversal as structure and geometry.
({
  collect({ maxNodes }) {
    const SKIP = new Set(["head", "script", "style", "noscript", "template", "link", "meta"]);
    const BOUNDARY = { iframe: "iframe", frame: "iframe", object: "embed", embed: "embed", canvas: "canvas", video: "video", svg: "svg" };
    const STYLE_PROPS = [
      "fontFamily", "fontSize", "fontWeight", "lineHeight", "letterSpacing", "textTransform",
      "color", "backgroundColor", "backgroundImage", "opacity",
      "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
      "marginTop", "marginRight", "marginBottom", "marginLeft",
      "rowGap", "columnGap", "flexDirection", "flexWrap",
      "borderTopWidth", "borderTopStyle", "borderTopColor",
      "borderRightWidth", "borderRightStyle", "borderRightColor",
      "borderBottomWidth", "borderBottomStyle", "borderBottomColor",
      "borderLeftWidth", "borderLeftStyle", "borderLeftColor",
      "borderTopLeftRadius", "borderTopRightRadius", "borderBottomRightRadius", "borderBottomLeftRadius",
      "boxShadow",
      "zIndex", "transform", "filter", "backdropFilter", "clipPath", "maskImage", "overflowX", "overflowY",
    ];
    const sx = scrollX, sy = scrollY;
    const r2 = (v) => Math.round(v * 100) / 100;
    const urls = (value) => [...(value || "").matchAll(/url\("([^"]*)"\)/g)].map((m) => m[1]);
    const anySide = (cs, pattern, test) => ["Top", "Right", "Bottom", "Left"].some((s) => test(parseFloat(cs[pattern.replace("*", s)]) || 0));
    const nodes = {}, computed = {}, excluded = [], boundaries = [];
    let seq = 0, overflow = false;

    const traitsOf = (cs) => [
      [cs.backgroundColor !== "rgba(0, 0, 0, 0)", "background"],
      [cs.backgroundImage !== "none", "background-image"],
      [anySide(cs, "border*Width", (v) => v > 0), "border"],
      [cs.boxShadow !== "none", "shadow"],
      [cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0, "outline"],
      [anySide(cs, "padding*", (v) => v > 0), "padding"],
      [anySide(cs, "margin*", (v) => v !== 0), "margin"],
      [["rowGap", "columnGap"].some((prop) => { const value = parseFloat(cs[prop]); return Number.isFinite(value) && value !== 0; }), "gap"],
      [cs.transform !== "none", "transform"],
      [cs.opacity !== "1", "opacity"],
      [cs.filter !== "none" || (cs.backdropFilter || "none") !== "none", "filter"],
      [cs.clipPath !== "none" || (cs.maskImage || "none") !== "none", "clip"],
      [cs.overflowX !== "visible" || cs.overflowY !== "visible", "overflow"],
      [cs.position !== "static", "position"],
      [cs.zIndex !== "auto", "z-index"],
      [cs.mixBlendMode !== "normal", "blend"],
      [!["block", "inline"].includes(cs.display), `display:${cs.display}`],
    ].filter(([on]) => on).map(([, name]) => name);

    const pick = (cs) => Object.fromEntries(STYLE_PROPS.map((key) => [key, cs[key]]));
    const styleOf = (el, cs) => {
      const record = pick(cs);
      const pseudos = {};
      for (const pseudo of ["::before", "::after"]) {
        const pseudoStyle = getComputedStyle(el, pseudo);
        if (!["none", "normal"].includes(pseudoStyle.content))
          pseudos[pseudo] = { content: pseudoStyle.content, ...pick(pseudoStyle), width: pseudoStyle.width, height: pseudoStyle.height };
      }
      if (Object.keys(pseudos).length) record.pseudos = pseudos;
      return record;
    };

    const PAINT_TAGS = new Set(["path", "rect", "circle", "ellipse", "line", "polyline", "polygon", "text", "tspan", "textpath", "use"]);
    const SKIP_PAINT_SUBTREE = new Set(["defs", "clippath", "mask", "pattern", "marker", "lineargradient", "radialgradient", "filter", "metadata", "script", "style", "symbol"]);
    const paintShapesOf = (root) => {
      const list = [];
      const walk = (el) => {
        for (const child of el.children) {
          const name = child.localName;
          if (SKIP_PAINT_SUBTREE.has(name)) continue;
          if (PAINT_TAGS.has(name)) list.push(child);
          walk(child);
        }
      };
      walk(root);
      return list;
    };
    const markupHasColour = (markup, colour) => {
      const needle = (colour || "").trim().toLowerCase();
      if (!needle) return false;
      const hay = String(markup).toLowerCase();
      let from = 0;
      while (from < hay.length) {
        const at = hay.indexOf(needle, from);
        if (at < 0) return false;
        const before = at === 0 ? "" : hay[at - 1];
        const after = hay[at + needle.length] || "";
        if (!/[a-z0-9#-]/.test(before) && !/[a-z0-9-]/.test(after)) return true;
        from = at + needle.length;
      }
      return false;
    };
    const isColourToken = (value) => {
      const v = value.trim();
      if (/^(rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/i.test(v)) return true;
      if (/^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(v)) return true;
      if (!/^[a-z]+$/i.test(v)) return false;
      try { return CSS.supports("color", v); } catch { return false; }
    };
    const paintKind = (value) => {
      const v = (value || "").trim();
      if (!v || /^none$/i.test(v)) return "none";
      if (/^currentcolor$/i.test(v)) return "currentColor";
      if (/url\(/i.test(v)) return "gradient";
      if (/var\(/i.test(v)) return "custom";
      if (/^(inherit|unset)$/i.test(v)) return "inherit";
      if (/^initial$/i.test(v)) return "initial";
      if (isColourToken(v)) return "literal";
      return "other";
    };
    const isSolidComputed = (value) => {
      const v = (value || "").trim();
      if (!v || /^none$/i.test(v) || /url\(/i.test(v) || /^currentcolor$/i.test(v)) return false;
      return isColourToken(v);
    };
    const splitTopComma = (inner) => {
      const parts = [];
      let current = "", depth = 0;
      for (const ch of inner) {
        if (ch === "(") depth++;
        else if (ch === ")") depth--;
        if (ch === "," && depth === 0) { parts.push(current); current = ""; continue; }
        current += ch;
      }
      parts.push(current);
      return parts;
    };
    const readVarAt = (input, start) => {
      let depth = 0, open = -1;
      for (let i = start; i < input.length; i++) {
        if (input[i] === "(") { depth++; if (open < 0) open = i; }
        else if (input[i] === ")") {
          depth--;
          if (depth === 0) {
            const parts = splitTopComma(input.slice(open + 1, i));
            const name = parts[0].trim();
            if (!name.startsWith("--")) return null;
            return { name, fallback: parts.length > 1 ? parts.slice(1).join(",").trim() : null, end: i + 1 };
          }
        }
      }
      return null;
    };
    // An unresolved var() computes to the initial paint, which is black for fill. That black is not a used colour.
    const substituteVars = (el, value) => {
      let result = value;
      for (let guard = 0; guard < 8; guard++) {
        const start = result.toLowerCase().indexOf("var(");
        if (start < 0) return result;
        const parsed = readVarAt(result, start);
        if (!parsed) return null;
        const defined = getComputedStyle(el).getPropertyValue(parsed.name).trim();
        const replacement = defined || (parsed.fallback == null ? null : parsed.fallback);
        if (replacement == null) return null;
        result = result.slice(0, start) + replacement + result.slice(parsed.end);
      }
      return /var\(/i.test(result) ? null : result;
    };
    const selectorScore = (selector) => {
      const plain = selector
        .replace(/::[\w-]+/g, " E ")
        .replace(/:(?:[\w-]+)(?:\([^)]*\))?/g, " C ")
        .replace(/\[[^\]]+\]/g, " C ")
        .replace(/#[\w-]+/g, " I ")
        .replace(/\.[\w-]+/g, " C ");
      const ids = (plain.match(/ I /g) || []).length;
      const classes = (plain.match(/ C /g) || []).length + (plain.match(/ E /g) || []).length;
      const elements = (plain.match(/(^|[\s>+~])[a-zA-Z*][\w-]*/g) || []).length;
      return [ids, classes, elements];
    };
    const splitSelectorList = (selector) => {
      const parts = [];
      let current = "", depth = 0;
      for (const ch of selector) {
        if (ch === "(") depth++;
        else if (ch === ")") depth--;
        else if (ch === "," && depth === 0) {
          if (current.trim()) parts.push(current.trim());
          current = "";
          continue;
        }
        current += ch;
      }
      if (current.trim()) parts.push(current.trim());
      return parts;
    };
    const scoreFor = (el, selector) => {
      let best = null;
      for (const part of splitSelectorList(selector)) {
        let matches = false;
        try { matches = el.matches(part); } catch { continue; }
        if (!matches) continue;
        const score = selectorScore(part);
        if (!best || score.some((partScore, index) => partScore > best[index] && score.slice(0, index).every((item, at) => item === best[at]))) best = score;
      }
      return best;
    };
    const beats = (next, prev) => {
      if (next.important !== prev.important) return next.important;
      for (let i = 0; i < 3; i++) if (next.score[i] !== prev.score[i]) return next.score[i] > prev.score[i];
      return next.order > prev.order;
    };
    const eachStyleRule = (rules, active, visit) => {
      if (!rules) return;
      for (const rule of rules) {
        if (rule.type === CSSRule.STYLE_RULE) { if (active) visit(rule); continue; }
        if (rule.type === CSSRule.MEDIA_RULE) {
          const text = rule.conditionText || rule.media?.mediaText || "";
          let ok = false;
          try { ok = active && matchMedia(text).matches; } catch { ok = false; }
          eachStyleRule(rule.cssRules, ok, visit);
          continue;
        }
        if (rule.type === CSSRule.SUPPORTS_RULE) {
          let ok = false;
          try { ok = active && CSS.supports(rule.conditionText); } catch { ok = false; }
          eachStyleRule(rule.cssRules, ok, visit);
          continue;
        }
        if (rule.cssRules) eachStyleRule(rule.cssRules, active, visit);
      }
    };
    const stylesheetPaint = (el, prop) => {
      let best = null, order = 0;
      for (const sheet of document.styleSheets) {
        if (sheet.disabled) continue;
        let rules;
        try { rules = sheet.cssRules; } catch { continue; }
        eachStyleRule(rules, true, (rule) => {
          const value = rule.style.getPropertyValue(prop).trim();
          if (!value) return;
          const score = scoreFor(el, rule.selectorText || "");
          if (!score) return;
          const candidate = { value, important: rule.style.getPropertyPriority(prop) === "important", score, order: order++ };
          if (!best || beats(candidate, best)) best = candidate;
        });
      }
      return best;
    };
    const specifiedLocal = (el, prop) => {
      const inline = el.style.getPropertyValue(prop).trim();
      const inlineImportant = el.style.getPropertyPriority(prop) === "important";
      const sheet = stylesheetPaint(el, prop);
      if (inline && inlineImportant) return { value: inline, source: "inline", el };
      if (sheet?.important) return { value: sheet.value, source: "stylesheet", el };
      if (inline) return { value: inline, source: "inline", el };
      if (sheet) return { value: sheet.value, source: "stylesheet", el };
      const attr = el.getAttribute(prop);
      if (attr !== null && attr.trim() !== "") return { value: attr.trim(), source: "attribute", el };
      return null;
    };
    const ancestorSpecified = (el, prop) => {
      let parent = el.parentElement;
      while (parent) {
        const local = specifiedLocal(parent, prop);
        if (local && paintKind(local.value) !== "inherit") return local;
        parent = parent.parentElement;
      }
      return null;
    };
    const colourToWrite = (shape, prop, svg) => {
      const computed = (getComputedStyle(shape)[prop] || "").trim();
      const local = specifiedLocal(shape, prop);
      const localKind = local ? paintKind(local.value) : null;
      if (local && localKind !== "inherit") {
        if (localKind === "currentColor" || localKind === "none" || localKind === "gradient" || localKind === "initial" || localKind === "other") return null;
        if (localKind === "literal") {
          if (local.source !== "stylesheet") return null;
          if (markupHasColour(shape.outerHTML, local.value) || markupHasColour(shape.outerHTML, computed)) return null;
          return isSolidComputed(computed) ? computed : null;
        }
        if (localKind === "custom") {
          const substituted = substituteVars(shape, local.value);
          if (substituted == null || paintKind(substituted) !== "literal") return null;
          return isSolidComputed(computed) ? computed : null;
        }
        return null;
      }
      const inherited = ancestorSpecified(shape, prop);
      if (!inherited) return null;
      const inheritedKind = paintKind(inherited.value);
      if (inheritedKind === "currentColor" || inheritedKind === "none" || inheritedKind === "gradient" || inheritedKind === "initial" || inheritedKind === "other") return null;
      if (inheritedKind === "custom") {
        const substituted = substituteVars(inherited.el, inherited.value);
        if (substituted == null || paintKind(substituted) !== "literal") return null;
      } else if (inheritedKind === "literal" && markupHasColour(svg.outerHTML, inherited.value)) {
        return null;
      }
      if (markupHasColour(shape.outerHTML, computed)) return null;
      return isSolidComputed(computed) ? computed : null;
    };
    const writePaint = (el, prop, colour) => {
      const style = el.getAttribute("style");
      if (style && new RegExp(`(?:^|;)\\s*${prop}\\s*:`, "i").test(style)) {
        el.setAttribute("style", style.replace(new RegExp(`((?:^|;)\\s*)${prop}\\s*:\\s*[^;]*`, "i"), (_, lead) => `${lead}${prop}: ${colour}`));
      }
      el.setAttribute(prop, colour);
    };
    const svgUsedPaints = (svg) => {
      const paints = [];
      const clone = svg.cloneNode(true);
      const shapes = paintShapesOf(svg);
      const copies = paintShapesOf(clone);
      for (let i = 0; i < shapes.length; i++) {
        for (const prop of ["fill", "stroke"]) {
          const colour = colourToWrite(shapes[i], prop, svg);
          if (!colour) continue;
          writePaint(copies[i], prop, colour);
          paints.push(colour);
        }
      }
      return { markup: paints.length ? clone.outerHTML : svg.outerHTML, paints };
    };

    const selectorFor = (el, parentSel) => {
      const same = [...el.parentElement.children].filter((c) => c.localName === el.localName);
      const step = CSS.escape(el.localName) + (same.length > 1 ? `:nth-of-type(${same.indexOf(el) + 1})` : "");
      return `${parentSel} > ${step}`;
    };

    const visit = (el, parentId, order, sel) => {
      if (maxNodes && seq >= maxNodes) { overflow = true; return null; }
      const id = `n-${String(++seq).padStart(6, "0")}`;
      const tag = el.localName, cs = getComputedStyle(el), r = el.getBoundingClientRect();
      const node = {
        tag, domId: el.getAttribute("id") || "", classes: [...el.classList], role: el.getAttribute("role") || "",
        selector: sel, parentId, order, children: [],
        box: { x: r2(r.x + sx), y: r2(cs.position === "fixed" || cs.position === "sticky" ? r.y : r.y + sy), width: r2(r.width), height: r2(r.height) },
        render: { display: cs.display, visibility: cs.visibility, opacity: cs.opacity, position: cs.position },
        traits: traitsOf(cs),
      };
      nodes[id] = node;
      computed[id] = styleOf(el, cs);

      if (tag === "a") {
        const href = el.getAttribute("href");
        if (href !== null) node.href = href;
      }

      const media = [];
      const add = (kind, url) => url && media.push({ kind, url });
      if (tag === "img" || (tag === "input" && el.type === "image")) {
        const url = el.currentSrc || el.getAttribute("src") || el.getAttribute("data-src");
        if (url) {
          const item = { kind: "img", url };
          const alt = el.getAttribute("alt");
          if (alt !== null) item.alt = alt;
          media.push(item);
        }
      }
      if (tag === "video") { add("video", el.currentSrc || el.src); add("poster", el.poster); }
      for (const pseudo of ["", "::before", "::after"]) {
        const s = pseudo ? getComputedStyle(el, pseudo) : cs;
        if (pseudo && !["none", "normal"].includes(s.content)) {
          node.traits.push(pseudo);
          for (const u of urls(s.content)) add(`content${pseudo}`, u);
        }
        for (const [kind, prop] of [["background", "backgroundImage"], ["mask", "maskImage"], ["list-style", "listStyleImage"], ["border-image", "borderImageSource"]])
          for (const u of urls(s[prop])) add(kind + pseudo, u);
      }
      if (media.length) node.media = media;

      if (tag === "input" || tag === "textarea")
        node.field = { type: el.type, placeholder: el.placeholder || "", value: el.type === "password" ? "" : el.value, ...(/^(checkbox|radio)$/.test(el.type) && { checked: el.checked }) };
      if (tag === "select") node.field = { type: "select", value: el.selectedOptions[0]?.text ?? "" };

      const kind = BOUNDARY[tag] ?? (el.shadowRoot ? "open-shadow-root"
        : tag.includes("-") && !el.childElementCount && r.width * r.height > 0 && !el.textContent.trim() ? "possible-closed-shadow-root" : null);
      if (kind) { node.boundary = kind; boundaries.push(id); }
      if (tag === "svg") {
        const painted = svgUsedPaints(el);
        node.markup = painted.markup;
        computed[id].shapePaints = painted.paints;
      }
      if (BOUNDARY[tag]) {
        const hidden = el.getElementsByTagName("*").length;
        if (hidden) node.untraversedChildren = hidden;
        return id;
      }

      const pre = /^(pre|break-spaces)/.test(cs.whiteSpace);
      const content = [];
      for (const c of el.childNodes) {
        if (c.nodeType === Node.TEXT_NODE) {
          const t = pre ? c.data : c.data.replace(/\s+/g, " ");
          if (t) content.push(t);
        } else if (c.nodeType === Node.ELEMENT_NODE) {
          const childSel = selectorFor(c, sel);
          if (SKIP.has(c.localName)) { excluded.push({ selector: childSel, tag: c.localName, reason: "non-visual-tag" }); continue; }
          if (this.isConsentNode(c)) { excluded.push({ selector: childSel, tag: c.localName, reason: "consent-ui" }); continue; }
          const childId = visit(c, id, node.children.length, childSel);
          if (!childId) break;
          node.children.push(childId);
          content.push({ id: childId });
        }
      }
      if (content.some((c) => typeof c === "string" && c.trim())) node.content = content;
      return id;
    };

    const roots = [];
    for (const el of document.documentElement.children) {
      const sel = selectorFor(el, "html");
      if (SKIP.has(el.localName)) { excluded.push({ selector: sel, tag: el.localName, reason: "non-visual-tag" }); continue; }
      if (this.isConsentNode(el)) { excluded.push({ selector: sel, tag: el.localName, reason: "consent-ui" }); continue; }
      const id = visit(el, null, roots.length, sel);
      if (!id) break;
      roots.push(id);
    }

    return {
      layoutWidth: document.documentElement.clientWidth, roots, nodes, computed, excluded, boundaries,
      overflow, elementCount: document.getElementsByTagName("*").length, fingerprint: this.fingerprint(),
      title: document.title, language: document.documentElement.lang,
    };
  },

  discoverBreakpoints() {
    const discovered = [];
    const inaccessible = [];
    const pixelsIn = (media) => [...String(media).matchAll(/(?:min-|max-)?width\s*:\s*([0-9.]+)px/gi)].map((match) => Number(match[1]));
    const walk = (rules) => {
      for (const rule of rules) {
        if (rule.type === CSSRule.MEDIA_RULE) {
          const media = rule.conditionText || rule.media?.mediaText || "";
          discovered.push({ media, pixels: pixelsIn(media) });
          if (rule.cssRules) walk(rule.cssRules);
        } else if (rule.cssRules) {
          walk(rule.cssRules);
        }
      }
    };
    for (const sheet of document.styleSheets) {
      const owner = sheet.ownerNode;
      const href = sheet.href || "";
      if ((owner instanceof Element && this.isConsentNode(owner)) || /cookiebot|cookie-?consent|onetrust|cybot|gdpr/i.test(href)) continue;
      let rules;
      try {
        rules = sheet.cssRules;
      } catch (error) {
        inaccessible.push({ href: sheet.href || null, reason: String(error && error.message ? error.message : error) });
        continue;
      }
      if (!rules) {
        inaccessible.push({ href: sheet.href || null, reason: "cssRules unavailable" });
        continue;
      }
      try {
        walk(rules);
      } catch (error) {
        inaccessible.push({ href: sheet.href || null, reason: String(error && error.message ? error.message : error) });
      }
    }
    return { discovered, inaccessible };
  },

  isConsentNode(el) {
    if (!(el instanceof Element)) return false;
    const selector = "[role='dialog'], [aria-modal='true'], [id*='cookie' i], [class*='cookie' i], [id*='consent' i], [class*='consent' i], [id*='onetrust' i], [id*='cookiebot' i], [id*='cybot' i], [id*='gdpr' i]";
    return !!el.closest(selector);
  },

  visibleElement(el) {
    if (!(el instanceof Element)) return false;
    const style = getComputedStyle(el);
    // A fading consent scrim sits just above zero for a frame. That is not a blocking overlay.
    if (style.display === "none" || style.visibility === "hidden" || style.visibility === "collapse" || Number(style.opacity) < 0.05) return false;
    const box = el.getBoundingClientRect();
    return box.width > 0 && box.height > 0;
  },

  coverRatio(el) {
    const box = el.getBoundingClientRect();
    const viewportWidth = window.innerWidth || 1;
    const viewportHeight = window.innerHeight || 1;
    const width = Math.max(0, Math.min(box.right, viewportWidth) - Math.max(box.left, 0));
    const height = Math.max(0, Math.min(box.bottom, viewportHeight) - Math.max(box.top, 0));
    return (width * height) / (viewportWidth * viewportHeight);
  },

  consentRoots() {
    const roots = new Set();
    const selectors = ["[role='dialog']", "[aria-modal='true']", "[id*='cookie' i]", "[class*='cookie' i]", "[id*='consent' i]", "[class*='consent' i]", "[id*='onetrust' i]", "[id*='cookiebot' i]", "[id*='gdpr' i]"];
    for (const selector of selectors) {
      for (const el of document.querySelectorAll(selector)) if (this.visibleElement(el)) roots.add(el);
    }
    if (document.body) {
      for (const el of document.body.querySelectorAll("*")) {
        const style = getComputedStyle(el);
        if ((style.position === "fixed" || style.position === "sticky") && this.visibleElement(el) && this.coverRatio(el) >= 0.4) roots.add(el);
      }
    }
    return [...roots];
  },

  overlayState() {
    const covering = this.consentRoots().filter((el) => this.coverRatio(el) >= 0.4);
    return { blocked: covering.length > 0, count: covering.length };
  },

  consentRecord() {
    const r2 = (v) => Math.round(v * 100) / 100;
    const boxOf = (el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return {
        x: r2(r.x + scrollX),
        y: r2(cs.position === "fixed" || cs.position === "sticky" ? r.y : r.y + scrollY),
        width: r2(r.width),
        height: r2(r.height),
      };
    };
    const selectorOf = (el) => {
      if (el.id) return `#${CSS.escape(el.id)}`;
      const parent = el.parentElement;
      if (!parent) return el.localName;
      const same = [...parent.children].filter((c) => c.localName === el.localName);
      const nth = same.length > 1 ? `:nth-of-type(${same.indexOf(el) + 1})` : "";
      return `${CSS.escape(el.localName)}${nth}`;
    };
    const describe = (el) => ({ selector: selectorOf(el), box: boxOf(el) });
    const outermost = (list) => list.filter((el) => !list.some((other) => other !== el && other.contains(el)));
    const largest = (list) => outermost(list).sort((a, b) => this.coverRatio(b) - this.coverRatio(a))[0] || null;
    const roots = this.consentRoots();
    const marked = roots.filter((el) => el.getAttribute("role") === "dialog" || el.getAttribute("aria-modal") === "true");
    const dialog = largest(marked.length ? marked : roots.filter((el) => this.coverRatio(el) >= 0.4));
    const outside = roots.filter((el) => el !== dialog && this.coverRatio(el) < 0.4 && !(dialog && (dialog.contains(el) || el.contains(dialog))));
    const widget = (el) => /widget/i.test(`${el.id} ${el.getAttribute("class") || ""}`);
    const widgets = outside.filter(widget);
    const clickable = "button, [role='button'], input[type='button'], input[type='submit'], a";
    const pool = widgets.length ? widgets : outside.filter((el) => el.matches(clickable));
    const button = outermost(pool).sort((a, b) => {
      const ab = a.getBoundingClientRect();
      const bb = b.getBoundingClientRect();
      return ab.width * ab.height - bb.width * bb.height;
    })[0] || null;
    const described = button ? describe(button) : null;
    if (described) {
      const logo = document.querySelector("button.CookiebotWidget-logo svg");
      if (logo) described.logo = logo.outerHTML;
    }
    return { dialog: dialog ? describe(dialog) : null, button: described };
  },

  async dismissConsent() {
    const record = this.consentRecord();
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const nameOf = (el) => (el.innerText || el.value || el.getAttribute("aria-label") || el.getAttribute("title") || "").replace(/\s+/g, " ").trim();
    const reject = /reject|decline|deny|dismiss|refuse|disagree|necessary|weiger|afwijzen|alleen noodzak|opt-?out|no thanks|nee bedankt|sluiten/i;
    const roots = this.consentRoots();
    const covering = roots.filter((el) => this.coverRatio(el) >= 0.4);
    if (!roots.length) return { dismissed: false, blocked: false, reason: "no-overlay", record };
    const controls = [];
    const clickable = "button, [role='button'], input[type='button'], input[type='submit'], a";
    for (const root of roots) {
      const candidates = [...root.querySelectorAll(clickable)];
      if (root.matches(clickable)) candidates.unshift(root);
      for (const el of candidates) if (this.visibleElement(el) && reject.test(nameOf(el))) controls.push(el);
    }
    if (!controls.length) {
      if (covering.length) return { dismissed: false, blocked: true, reason: "blocking-overlay-without-dismiss-control", record };
      return { dismissed: false, blocked: false, reason: "no-dismiss-control", record };
    }
    const controlName = nameOf(controls[0]);
    controls[0].click();
    const end = Date.now() + 2000;
    while (Date.now() < end) {
      if (!this.consentRoots().some((el) => this.coverRatio(el) >= 0.4)) {
        const logoEnd = Date.now() + 2000;
        while (Date.now() < logoEnd && !document.querySelector("button.CookiebotWidget-logo")) await sleep(50);
        return { dismissed: true, blocked: false, reason: "dismissed", control: controlName, record: this.consentRecord() };
      }
      await sleep(50);
    }
    return { dismissed: false, blocked: true, reason: "overlay-remained", control: controlName, record };
  },

  async waitUntilUncovered(timeoutMs) {
    const end = Date.now() + (timeoutMs || 0);
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    let state = this.overlayState();
    while (state.blocked && Date.now() < end) {
      await wait(50);
      state = this.overlayState();
    }
    return state;
  },

  fingerprint() {
    const skip = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE"]);
    const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => {
        if (skip.has(n.nodeName)) return NodeFilter.FILTER_REJECT;
        const el = n.nodeType === 1 ? n : n.parentElement;
        if (el && this.isConsentNode(el)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    let h = 2166136261;
    for (let n = walker.currentNode; n; n = walker.nextNode()) {
      const s = n.nodeType === 1 ? `<${n.localName}.${n.getAttribute("class") || ""}#${n.childElementCount}` : n.data;
      for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
    }
    return (h >>> 0).toString(16);
  },

  async settle(timeoutMs) {
    const end = Date.now() + timeoutMs;
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    // Smooth scrolling makes each scrollTo return before the page arrives, so the capture is taken mid-page.
    document.documentElement.style.scrollBehavior = "auto";
    let scrolled = true;
    for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight) {
      if (Date.now() >= end) { scrolled = false; break; }
      scrollTo(0, y);
      await wait(150);
    }
    scrollTo(0, 0);
    const images = [...document.images].filter((i) => !i.complete).map((i) => new Promise((r) => {
      i.addEventListener("load", r, { once: true });
      i.addEventListener("error", r, { once: true });
    }));
    const ready = await Promise.race([
      Promise.all([document.fonts.ready, ...images]).then(() => true),
      wait(Math.max(0, end - Date.now())).then(() => false),
    ]);
    return { timedOut: !scrolled || !ready, pendingImages: [...document.images].filter((i) => !i.complete).length };
  },

  async measureAssetSizes(urls) {
    const load = (url) => new Promise((resolve) => {
      const img = new Image();
      let settled = false;
      const finish = (size) => {
        if (settled) return;
        settled = true;
        resolve(size);
      };
      const timer = setTimeout(() => finish({ url }), 10000);
      img.onload = () => {
        clearTimeout(timer);
        finish({ url, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight });
      };
      img.onerror = () => {
        clearTimeout(timer);
        finish({ url });
      };
      img.src = url;
      if (img.complete) {
        clearTimeout(timer);
        finish({ url, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight });
      }
    });
    const results = [];
    for (const url of urls || []) results.push(await load(url));
    return results;
  },

  overlay(sections) {
    const root = document.createElement("div");
    root.id = "__generic_extractor_overlay";
    root.style.cssText = "position:absolute;left:0;top:0;width:0;height:0;z-index:2147483647;pointer-events:none";
    sections.forEach(({ label, boxes }, i) => {
      const color = `hsl(${(i * 67) % 360} 90% 45%)`;
      for (const b of boxes) {
        const frame = document.createElement("div");
        frame.style.cssText = `position:absolute;left:${b.x}px;top:${b.y}px;width:${b.width}px;height:${b.height}px;outline:3px solid ${color};outline-offset:-3px`;
        const tag = document.createElement("span");
        tag.textContent = `${i + 1} · ${label}`;
        tag.style.cssText = `background:${color};color:#fff;font:600 14px/1 sans-serif;padding:4px 6px`;
        frame.append(tag);
        root.append(frame);
      }
    });
    document.documentElement.append(root);
  },

  removeOverlay() {
    document.getElementById("__generic_extractor_overlay")?.remove();
  },
})
