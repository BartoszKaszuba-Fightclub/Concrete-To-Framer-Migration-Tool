/**
 * Injected into the page via Playwright addScriptTag.
 * Exposes window.__cocaHeroPoc helpers. Keep as plain browser JS.
 */
;(() => {
  function toRgba(str) {
    const m = String(str).match(/rgba?\(([^)]+)\)/)
    if (!m) {
      const d = document.createElement("div")
      d.style.color = str
      document.body.appendChild(d)
      const c = getComputedStyle(d).color
      d.remove()
      return toRgba(c)
    }
    const p = m[1].split(",").map((s) => parseFloat(s.trim()))
    const a = p[3] === undefined ? 1 : p[3]
    return `rgba(${Math.round(p[0])}, ${Math.round(p[1])}, ${Math.round(p[2])}, ${a})`
  }

  function rectOf(el) {
    const r = el.getBoundingClientRect()
    return {
      x: Math.round(r.x),
      y: Math.round(r.y),
      w: Math.round(r.width),
      h: Math.round(r.height),
    }
  }

  function sampleImageBands(img) {
    const fallback = {
      top: "rgba(20, 20, 20, 1)",
      bottom: "rgba(255, 102, 0, 1)",
      average: "rgba(138, 90, 57, 1)",
    }
    if (!img || !img.complete || !img.naturalWidth) return fallback
    try {
      const c = document.createElement("canvas")
      c.width = 32
      c.height = 32
      const ctx = c.getContext("2d")
      if (!ctx) return fallback
      ctx.drawImage(img, 0, 0, 32, 32)
      const data = ctx.getImageData(0, 0, 32, 32).data
      const avg = (y0, y1) => {
        let r = 0,
          g = 0,
          b = 0,
          n = 0
        for (let y = y0; y < y1; y++) {
          for (let x = 0; x < 32; x++) {
            const i = (y * 32 + x) * 4
            r += data[i]
            g += data[i + 1]
            b += data[i + 2]
            n++
          }
        }
        return `rgba(${Math.round(r / n)}, ${Math.round(g / n)}, ${Math.round(b / n)}, 1)`
      }
      return {
        top: avg(0, 14),
        bottom: avg(18, 32),
        average: avg(0, 32),
      }
    } catch {
      return fallback
    }
  }

  async function dismissCookies() {
    const clickText = (re) => {
      const el = [...document.querySelectorAll("button, a")].find((b) =>
        re.test((b.textContent || "").trim()),
      )
      if (el) {
        el.click()
        return true
      }
      return false
    }
    clickText(/enkel noodzakelijk/i) ||
      clickText(/alles weigeren|reject all|decline/i) ||
      clickText(/alles toestaan|accept all/i)
    await new Promise((r) => setTimeout(r, 800))
    document
      .querySelectorAll(
        "#onetrust-consent-sdk, .onetrust-pc-dark-filter, #onetrust-banner-sdk",
      )
      .forEach((n) => n.remove())
  }

  function scrapeHeroLayout() {
    const vw = window.innerWidth
    const vh = window.innerHeight
    const layers = []
    const notes = []

    const pageBg = toRgba(getComputedStyle(document.body).backgroundColor)
    layers.push({
      kind: "frame",
      name: "page",
      rect: { x: 0, y: 0, w: vw, h: vh },
      backgroundColor: pageBg,
    })

    const header =
      document.querySelector("header") ||
      document.querySelector(".header-wrapper")
    if (header) {
      const headerInner = header.querySelector(".header-wrapper") || header
      layers.push({
        kind: "frame",
        name: "header",
        rect: rectOf(header),
        backgroundColor: toRgba(getComputedStyle(headerInner).backgroundColor),
      })
    }

    const logo = document.querySelector("header img, .header-wrapper img")
    if (logo) {
      layers.push({
        kind: "frame",
        name: "logoPlaceholder",
        rect: rectOf(logo),
        backgroundColor: "rgba(220, 10, 30, 1)",
      })
      const logoRect = rectOf(logo)
      layers.push({
        kind: "text",
        name: "brandSuffix",
        rect: {
          x: logoRect.x + logoRect.w + 8,
          y: logoRect.y,
          w: 90,
          h: logoRect.h,
        },
        text: "Nederland",
        color: "rgba(0, 0, 0, 1)",
        fontSize: "12px",
        fontWeight: "400",
        fontFamily: "Inter",
        lineHeight: "20px",
        textAlign: "left",
        tag: "p",
      })
    }

    const navLinks = [
      ...document.querySelectorAll("header a, .header-wrapper a"),
    ].filter((a) => {
      const r = a.getBoundingClientRect()
      const text = (a.textContent || "").trim().replace(/\s+/g, " ")
      return (
        r.width > 20 &&
        r.height > 20 &&
        r.y < 100 &&
        r.x > 150 &&
        text.length > 0 &&
        !/skip/i.test(text)
      )
    })

    for (const [index, a] of navLinks.entries()) {
      const s = getComputedStyle(a)
      const text = (a.textContent || "").trim().replace(/\s+/g, " ")
      layers.push({
        kind: "text",
        name: `navLink-${index}-${text}`,
        rect: rectOf(a),
        text,
        color: toRgba(s.color),
        fontSize: s.fontSize,
        fontWeight: s.fontWeight,
        fontFamily: "Inter",
        lineHeight: s.lineHeight === "normal" ? s.fontSize : s.lineHeight,
        textAlign: "center",
        tag: "p",
      })
    }

    const cta = [
      ...document.querySelectorAll("header button, .header-wrapper button"),
    ].find((b) => /aanmelden|sign/i.test(b.textContent || ""))
    if (cta) {
      const s = getComputedStyle(cta)
      const r = rectOf(cta)
      if (r.w > 0 && r.h > 0) {
        layers.push({
          kind: "frame",
          name: "headerCta",
          rect: r,
          backgroundColor: toRgba(s.backgroundColor),
          borderRadius: s.borderRadius.includes("px")
            ? `${Math.min(999, parseFloat(s.borderRadius))}px`
            : "40px",
        })
        layers.push({
          kind: "text",
          name: "headerCtaLabel",
          rect: r,
          text: (cta.textContent || "").trim(),
          color: toRgba(s.color),
          fontSize: s.fontSize,
          fontWeight: s.fontWeight,
          fontFamily: "Inter",
          lineHeight: s.lineHeight === "normal" ? s.fontSize : s.lineHeight,
          textAlign: "center",
          tag: "p",
        })
      }
    }

    const visibleSlides = [
      ...document.querySelectorAll(".splide__slide"),
    ].filter((el) => {
      const r = el.getBoundingClientRect()
      return r.width > 0 && r.right > 0 && r.left < vw
    })

    for (const slide of visibleSlides) {
      const img = slide.querySelector("img")
      const bands = sampleImageBands(img)
      const r = rectOf(slide)
      const isActive = slide.classList.contains("is-active")
      const name = isActive
        ? "heroActive"
        : slide.classList.contains("is-prev") || r.x < 0
          ? "heroPeekPrev"
          : "heroPeekNext"
      const radius = getComputedStyle(
        slide.querySelector(".teaser.hero") || slide,
      ).borderRadius

      layers.push({
        kind: "frame",
        name,
        rect: r,
        backgroundColor: bands.bottom,
        borderRadius: radius,
        opacity: isActive ? 1 : 0.85,
      })

      layers.push({
        kind: "frame",
        name: `${name}-topBand`,
        rect: {
          x: r.x,
          y: r.y,
          w: r.w,
          h: Math.round(r.h * 0.42),
        },
        backgroundColor: bands.top,
        borderRadius:
          radius.split(" ").length === 1
            ? `${radius} ${radius} 0px 0px`
            : radius,
      })

      if (isActive) {
        const alt = img?.alt || ""
        const quoted =
          alt.match(/[“"]([^”"]+)[”"]/)?.[1]?.trim() ||
          alt.split(".")[0]?.trim() ||
          "Hero"
        notes.push(
          "Hero marketing art is image-baked on the source site; overlay title is taken from the image alt quote. Images are replaced by sampled color bands.",
        )
        layers.push({
          kind: "text",
          name: "heroTitleFromAlt",
          rect: {
            x: r.x + 48,
            y: r.y + 36,
            w: Math.round(r.w * 0.55),
            h: 120,
          },
          text: quoted.toUpperCase(),
          color: "rgba(255, 255, 255, 1)",
          fontSize: "28px",
          fontWeight: "700",
          fontFamily: "Inter",
          lineHeight: "34px",
          textAlign: "left",
          tag: "h2",
        })
      }
    }

    const dots = [
      ...document.querySelectorAll(
        ".splide__pagination button, .cmp-carousel__indicators button",
      ),
    ].filter((el) => {
      const r = el.getBoundingClientRect()
      return r.width > 0 && r.top < vh && r.bottom > 0
    })

    for (const [index, el] of dots.entries()) {
      const s = getComputedStyle(el)
      const active =
        el.classList.contains("is-active") ||
        el.getAttribute("aria-selected") === "true"
      const bg = toRgba(s.backgroundColor)
      layers.push({
        kind: "frame",
        name: `dot-${index}`,
        rect: rectOf(el),
        backgroundColor: active
          ? "rgba(0, 0, 0, 1)"
          : bg === "rgba(0, 0, 0, 0)"
            ? "rgba(108, 108, 108, 1)"
            : bg,
        borderRadius: "999px",
      })
    }

    return {
      sourceUrl: location.href,
      scrapedAt: new Date().toISOString(),
      viewport: { width: vw, height: vh },
      notes,
      layers,
    }
  }

  window.__cocaHeroPoc = { dismissCookies, scrapeHeroLayout }
})()
