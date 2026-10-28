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
      "rowGap", "columnGap",
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
        box: { x: r2(r.x + sx), y: r2(r.y + sy), width: r2(r.width), height: r2(r.height) },
        render: { display: cs.display, visibility: cs.visibility, opacity: cs.opacity, position: cs.position },
        traits: traitsOf(cs),
      };
      nodes[id] = node;
      computed[id] = styleOf(el, cs);

      const media = [];
      const add = (kind, url) => url && media.push({ kind, url });
      if (tag === "img" || (tag === "input" && el.type === "image")) add("img", el.currentSrc || el.src);
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
      if (tag === "svg") node.markup = el.outerHTML;
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
      const id = visit(el, null, roots.length, sel);
      if (!id) break;
      roots.push(id);
    }

    return {
      layoutWidth: document.documentElement.clientWidth, roots, nodes, computed, excluded, boundaries,
      overflow, elementCount: document.getElementsByTagName("*").length, fingerprint: this.fingerprint(),
    };
  },

  discoverBreakpoints() {
    const discovered = [];
    const inaccessible = [];
    const pixelsIn = (media) => [...String(media).matchAll(/(?:min-|max-)?width\s*:\s*([0-9.]+)px/gi)].map((match) => Number(match[1]));
    const walk = (rules, href) => {
      for (const rule of rules) {
        if (rule.type === CSSRule.MEDIA_RULE) {
          const media = rule.conditionText || rule.media?.mediaText || "";
          discovered.push({ media, pixels: pixelsIn(media), href: href || null });
          if (rule.cssRules) walk(rule.cssRules, href);
        } else if (rule.cssRules) {
          walk(rule.cssRules, href);
        }
      }
    };
    for (const sheet of document.styleSheets) {
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
        walk(rules, sheet.href || null);
      } catch (error) {
        inaccessible.push({ href: sheet.href || null, reason: String(error && error.message ? error.message : error) });
      }
    }
    return { discovered, inaccessible };
  },

  visibleElement(el) {
    if (!(el instanceof Element)) return false;
    const style = getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden" || style.visibility === "collapse" || Number(style.opacity) === 0) return false;
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

  async dismissConsent() {
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const nameOf = (el) => (el.innerText || el.value || el.getAttribute("aria-label") || el.getAttribute("title") || "").replace(/\s+/g, " ").trim();
    const reject = /reject|decline|deny|dismiss|refuse|disagree|necessary|weiger|afwijzen|alleen noodzak|opt-?out|no thanks|nee bedankt|sluiten/i;
    const roots = this.consentRoots();
    const covering = roots.filter((el) => this.coverRatio(el) >= 0.4);
    if (!roots.length) return { dismissed: false, blocked: false, reason: "no-overlay" };
    const controls = [];
    const clickable = "button, [role='button'], input[type='button'], input[type='submit'], a";
    for (const root of roots) {
      const candidates = [...root.querySelectorAll(clickable)];
      if (root.matches(clickable)) candidates.unshift(root);
      for (const el of candidates) if (this.visibleElement(el) && reject.test(nameOf(el))) controls.push(el);
    }
    if (!controls.length) {
      if (covering.length) return { dismissed: false, blocked: true, reason: "blocking-overlay-without-dismiss-control" };
      return { dismissed: false, blocked: false, reason: "no-dismiss-control" };
    }
    const controlName = nameOf(controls[0]);
    controls[0].click();
    const end = Date.now() + 2000;
    while (Date.now() < end) {
      if (!this.consentRoots().some((el) => this.coverRatio(el) >= 0.4))
        return { dismissed: true, blocked: false, reason: "dismissed", control: controlName };
      await sleep(50);
    }
    return { dismissed: false, blocked: true, reason: "overlay-remained", control: controlName };
  },

  fingerprint() {
    const skip = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE"]);
    const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (skip.has(n.nodeName) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
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
