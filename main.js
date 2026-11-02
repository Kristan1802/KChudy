/* Kristan OS: a portfolio laid out as a desktop. Content lives in content.js. */
(() => {
  "use strict";

  const D = window.PORTFOLIO || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const mqPhone = matchMedia("(max-width: 719px)");
  const mqReduce = matchMedia("(prefers-reduced-motion: reduce)");
  const mqFine = matchMedia("(hover: hover) and (pointer: fine)");
  const mqDark = matchMedia("(prefers-color-scheme: dark)");
  const store = {
    get(k, f) {
      try {
        const v = localStorage.getItem(k);
        return v == null ? f : JSON.parse(v);
      } catch (e) {
        return f;
      }
    },
    set(k, v) {
      try {
        localStorage.setItem(k, JSON.stringify(v));
      } catch (e) {}
    },
  };

  const os = $("#os");
  const desktop = $("#desktop");
  const iconsEl = $("#icons");
  const winLayer = $("#windows");
  const dock = $("#dock");
  const dockRow = $("#dockRow");
  const menubar = $("#menubar");
  const barH = () => menubar.offsetHeight;
  const projects = D.projects || [];
  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p]));
  const files = D.files || [];
  const fileMap = Object.fromEntries(files.map((f) => [f.id, f]));

  /* ---------------- Glyphs ---------------- */

  const G = {
    logo: '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="4.2" fill="currentColor"/><path d="M10 1.8v2.2M10 16v2.2M1.8 10h2.2M16 10h2.2M4.2 4.2l1.6 1.6M14.2 14.2l1.6 1.6M4.2 15.8l1.6-1.6M14.2 5.8l1.6-1.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    sunset: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.6 11.2a4.4 4.4 0 0 1 8.8 0z" fill="currentColor"/><path d="M1.2 13.2h13.6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M8 2.4v1.8M2.9 5.2l1.2 1.2M13.1 5.2l-1.2 1.2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
    sun: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="3.1" fill="currentColor"/><path d="M8 1.2v1.6M8 13.2v1.6M1.2 8h1.6M13.2 8h1.6M3.2 3.2l1.1 1.1M11.7 11.7l1.1 1.1M3.2 12.8l1.1-1.1M11.7 4.3l1.1-1.1" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
    moon: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13.4 10.2A5.8 5.8 0 0 1 5.8 2.6a5.8 5.8 0 1 0 7.6 7.6z" fill="currentColor"/></svg>',
    close: '<svg viewBox="0 0 8 8" aria-hidden="true"><path d="M1.5 1.5l5 5M6.5 1.5l-5 5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
    min: '<svg viewBox="0 0 8 8" aria-hidden="true"><path d="M1.2 4h5.6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
    zoom: '<svg viewBox="0 0 8 8" aria-hidden="true"><path d="M4 1.2v5.6M1.2 4h5.6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
    x: '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 2.5l7 7M9.5 2.5l-7 7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    copy: '<svg viewBox="0 0 14 14" aria-hidden="true"><rect x="4.5" y="4.5" width="8" height="8" rx="1.8" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M9.5 2.6V2.4a1.4 1.4 0 0 0-1.4-1.4H2.9a1.4 1.4 0 0 0-1.4 1.4v5.2a1.4 1.4 0 0 0 1.4 1.4h.2" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>',
    out: '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3.5 8.5l5-5M4.5 3.5h4v4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    left: '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M8.8 2.8 4.6 7l4.2 4.2" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    right: '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M5.2 2.8 9.4 7l-4.2 4.2" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    grid: '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M2 2h4v4H2zM8 2h4v4H8zM2 8h4v4H2zM8 8h4v4H8z" fill="currentColor"/></svg>',
  };

  /* ---------------- Cover art ---------------- */

  const C = { sun: "#f2a03d", ox: "#5a2722", blue: "#93b6d6", cream: "#f3ece2", ink: "#1c1613" };
  let uid = 0;

  function art(kind, bg, label, decorative) {
    const k = ++uid;
    const a11y = decorative ? 'aria-hidden="true" focusable="false"' : `role="img" aria-label="${esc(label)}"`;
    const wrap = (inner) =>
      `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" ${a11y}><rect width="100" height="100" fill="${bg}"/>${inner}</svg>`;
    switch (kind) {
      case "phone":
        return wrap(`
          <circle cx="81" cy="19" r="12" fill="${C.sun}"/>
          <rect x="29" y="11" width="42" height="83" rx="7" fill="${C.cream}"/>
          <rect x="44" y="14.5" width="12" height="2.4" rx="1.2" fill="${bg}" opacity=".25"/>
          <text x="35" y="27" class="cv-type" font-size="6.2" font-weight="700" fill="${bg}">Verify ID</text>
          <rect x="35" y="31" width="30" height="20" rx="3" fill="none" stroke="${bg}" stroke-width="1.4" stroke-dasharray="3 2"/>
          <circle cx="42" cy="41" r="3.8" fill="${bg}" opacity=".35"/>
          <rect x="48" y="38" width="13" height="2.2" rx="1.1" fill="${bg}" opacity=".45"/>
          <rect x="48" y="42.5" width="9" height="2.2" rx="1.1" fill="${bg}" opacity=".3"/>
          <circle cx="50" cy="63" r="6.5" fill="${C.sun}"/>
          <path d="M46.8 63.2l2.2 2.2 4.2-4.6" stroke="#fff" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          <rect x="35" y="75" width="30" height="2.6" rx="1.3" fill="${bg}" opacity=".15"/>
          <rect x="35" y="75" width="21" height="2.6" rx="1.3" fill="${bg}"/>
          <rect x="35" y="82" width="30" height="6.5" rx="3.25" fill="${bg}"/>`);
      case "dashboard": {
        const bars = [18, 26, 14, 32, 22, 38]
          .map((h, i) => `<rect x="${34 + i * 8}" y="${78 - h}" width="5.5" height="${h}" rx="1" fill="${i === 5 ? C.sun : bg}"/>`)
          .join("");
        return wrap(`
          <rect x="9" y="17" width="82" height="66" rx="4" fill="${C.cream}"/>
          <path d="M9 21a4 4 0 0 1 4-4h74a4 4 0 0 1 4 4v3H9z" fill="${C.ink}" opacity=".08"/>
          <circle cx="14" cy="20.5" r="1.3" fill="${C.ox}"/><circle cx="18" cy="20.5" r="1.3" fill="${C.sun}"/><circle cx="22" cy="20.5" r="1.3" fill="${bg}"/>
          <rect x="9" y="24" width="18" height="59" fill="${bg}" opacity=".13"/>
          ${[30, 36, 42, 48].map((y, i) => `<rect x="12.5" y="${y}" width="${i ? 10 : 11}" height="2.2" rx="1.1" fill="${bg}" opacity="${i ? 0.45 : 0.9}"/>`).join("")}
          <rect x="32" y="28" width="26" height="14" rx="2" fill="#fff"/><rect x="62" y="28" width="26" height="14" rx="2" fill="#fff"/>
          <rect x="35" y="31" width="9" height="2" rx="1" fill="${bg}" opacity=".5"/><text x="35" y="39.5" class="cv-type" font-size="6" font-weight="700" fill="${C.ink}">9 min</text>
          <rect x="65" y="31" width="9" height="2" rx="1" fill="${bg}" opacity=".5"/><text x="65" y="39.5" class="cv-type" font-size="6" font-weight="700" fill="${C.ink}">3×</text>
          <line x1="32" y1="78.5" x2="88" y2="78.5" stroke="${C.ink}" stroke-opacity=".15" stroke-width=".6"/>
          ${bars}`);
      }
      case "meals": {
        const dots = [C.sun, C.ox, C.blue];
        const cards = [24, 45, 66]
          .map(
            (y, i) => `<rect x="33" y="${y}" width="34" height="17" rx="3" fill="#fff"/>
              <circle cx="40.5" cy="${y + 8.5}" r="4.8" fill="${dots[i]}"/>
              <rect x="48" y="${y + 4.5}" width="15" height="2.4" rx="1.2" fill="${C.ink}" opacity=".7"/>
              <rect x="48" y="${y + 9.5}" width="10" height="2" rx="1" fill="${C.ink}" opacity=".3"/>
              ${i === 1 ? `<rect x="56" y="${y + 9}" width="9" height="4.4" rx="2.2" fill="${bg}"/>` : ""}`
          )
          .join("");
        return wrap(`
          <rect x="28" y="10" width="44" height="85" rx="7" fill="${C.cream}"/>
          <text x="33" y="20" class="cv-type" font-size="5.6" font-weight="700" fill="${C.ink}">This week</text>
          ${cards}
          <rect x="33" y="86" width="34" height="4.5" rx="2.25" fill="${C.ink}" opacity=".85"/>`);
      }
      case "nets": {
        const booked = new Set([1, 4, 6, 9, 10, 13, 17]);
        let cells = "";
        for (let r = 0; r < 6; r++)
          for (let c = 0; c < 4; c++) {
            const i = r * 4 + c;
            cells += `<rect x="${12 + c * 15}" y="${12 + r * 12}" width="12" height="9" rx="1.6" fill="${booked.has(i) ? C.sun : C.cream}" opacity="${booked.has(i) ? 1 : 0.28}"/>`;
          }
        return wrap(`
          ${cells}
          <circle cx="76" cy="75" r="15" fill="${C.ox}"/>
          <path d="M66.5 63.5c6.5 6.5 6.5 16.5 0 23M85.5 63.5c-6.5 6.5-6.5 16.5 0 23" stroke="${C.cream}" stroke-width="1.1" fill="none" stroke-dasharray="1.6 1.6"/>
          <circle cx="71" cy="69" r="3" fill="#fff" opacity=".2"/>`);
      }
      case "stripes": {
        let y = 0;
        let bands = "";
        const seq = [
          [C.ox, 8],
          [C.cream, 3],
          [C.blue, 5],
          [C.cream, 3],
        ];
        while (y < 100) for (const [col, h] of seq) (bands += `<rect y="${y}" width="100" height="${h}" fill="${col}"/>`), (y += h);
        return wrap(`${bands}
          <text x="50" y="82" text-anchor="middle" class="cv-type" font-size="86" font-weight="800" fill="${C.cream}" stroke="${C.ox}" stroke-width="3" paint-order="stroke">${esc((D.name || "K")[0])}</text>`);
      }
      case "chai":
        return wrap(`
          <circle cx="50" cy="50" r="35" fill="${C.cream}"/>
          <circle cx="50" cy="50" r="31" fill="none" stroke="${C.ox}" stroke-width=".9"/>
          <path id="cp${k}" d="M50 50m-24.5 0a24.5 24.5 0 1 1 49 0a24.5 24.5 0 1 1-49 0" fill="none"/>
          <text class="cv-mono" font-size="5.6" font-weight="600" letter-spacing="1.55" fill="${C.ox}"><textPath href="#cp${k}">CHAI CLUB · INDIRANAGAR · SINCE 2025 ·</textPath></text>
          <path d="M40.5 45h19v6.5a9.5 9.5 0 0 1-19 0z" fill="${C.ox}"/>
          <path d="M59.5 47.2h2.3a3.6 3.6 0 0 1 0 7.2h-3" stroke="${C.ox}" stroke-width="2" fill="none"/>
          <path d="M45 41c-1.6-2.2 1.6-3.2 0-5.4M50 41c-1.6-2.2 1.6-3.2 0-5.4M55 41c-1.6-2.2 1.6-3.2 0-5.4" stroke="${C.ox}" stroke-width="1.3" fill="none" stroke-linecap="round"/>
          <rect x="38" y="62" width="24" height="2.4" rx="1.2" fill="${C.ox}"/>`);
      case "monsoon": {
        let rain = "";
        for (let i = 0; i < 16; i++) {
          const x = -12 + i * 8;
          rain += `<line x1="${x}" y1="-4" x2="${x + 26}" y2="104" stroke="${C.blue}" stroke-width=".9" stroke-opacity="${0.25 + (i % 3) * 0.17}" stroke-dasharray="${7 + (i % 4) * 2} ${5 + (i % 3) * 3}" stroke-dashoffset="${i * 3}"/>`;
        }
        return wrap(`${rain}
          <circle cx="78" cy="22" r="10" fill="${C.sun}" opacity=".18"/><circle cx="78" cy="22" r="3.2" fill="${C.sun}"/>
          <text x="9" y="83" class="cv-type" font-style="italic" font-size="20" font-weight="500" fill="${C.cream}">Monsoon</text>
          <text x="10" y="92" class="cv-mono" font-size="4.4" letter-spacing=".8" fill="${C.blue}">IRA MENON · EP · 4 TRACKS</text>`);
      }
      default:
        return wrap("");
    }
  }

  function cover(p, decorative) {
    const c = p.cover || {};
    if (c.image) return `<img src="${esc(c.image)}" alt="${decorative ? "" : esc(p.name)}" loading="lazy" decoding="async">`;
    return art(c.art, c.bg || C.ox, `${p.name} cover`, decorative);
  }

  const FILE_ART = {
    text: `<svg viewBox="0 0 52 62" aria-hidden="true"><path d="M5 2h30l13 13v43a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" fill="#fffdf8" stroke="rgba(40,20,10,.15)"/><path d="M35 2v11a2 2 0 0 0 2 2h11" fill="#ebe3d8"/><g fill="#c9bdb0">${[24, 30, 36, 42, 48].map((y, i) => `<rect x="10" y="${y}" width="${i % 2 ? 24 : 32}" height="2.2" rx="1.1"/>`).join("")}</g></svg>`,
    pdf: `<svg viewBox="0 0 52 62" aria-hidden="true"><path d="M5 2h30l13 13v43a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" fill="#fffdf8" stroke="rgba(40,20,10,.15)"/><path d="M35 2v11a2 2 0 0 0 2 2h11" fill="#ebe3d8"/><g fill="#c9bdb0"><rect x="10" y="20" width="22" height="2.2" rx="1.1"/><rect x="10" y="26" width="30" height="2.2" rx="1.1"/></g><rect x="1" y="36" width="34" height="13" rx="2.5" fill="${C.ox}"/><text x="18" y="45.6" text-anchor="middle" class="cv-mono" font-size="8" font-weight="600" fill="#fff">PDF</text></svg>`,
    folder: `<svg viewBox="0 0 52 62" aria-hidden="true"><path d="M3 17a3 3 0 0 1 3-3h13.5l4 4H46a3 3 0 0 1 3 3v4H3z" fill="#5d7fa3"/><rect x="3" y="21" width="46" height="33" rx="3.5" fill="#86a7c9"/><rect x="3" y="21" width="46" height="1.6" fill="#fff" opacity=".35"/></svg>`,
  };

  /* ---------------- Dock art ---------------- */

  function dockArt(kind) {
    const k = ++uid;
    const base = (fill, inner) =>
      `<svg viewBox="0 0 60 60" aria-hidden="true"><defs><clipPath id="dc${k}"><rect x="2" y="2" width="56" height="56" rx="13"/></clipPath></defs><g clip-path="url(#dc${k})"><rect width="60" height="60" fill="${fill}"/>${inner}</g></svg>`;
    switch (kind) {
      case "about": {
        let y = 0;
        let s = "";
        while (y < 60) {
          s += `<rect y="${y}" width="60" height="5" fill="${C.ox}"/><rect y="${y + 5}" width="60" height="2" fill="${C.cream}"/><rect y="${y + 7}" width="60" height="3.5" fill="${C.blue}"/><rect y="${y + 10.5}" width="60" height="2" fill="${C.cream}"/>`;
          y += 12.5;
        }
        return base(C.ox, `${s}<circle cx="30" cy="30" r="15.5" fill="${C.cream}"/><text x="30" y="38.6" text-anchor="middle" class="cv-type" font-size="24" font-weight="800" fill="${C.ox}">${esc((D.name || "K")[0])}</text>`);
      }
      case "work":
        return base(
          "url(#wg" + k + ")",
          `<defs><linearGradient id="wg${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbf6ef"/><stop offset="1" stop-color="#e6dccf"/></linearGradient></defs><rect width="60" height="60" fill="url(#wg${k})"/><path d="M11 20a3 3 0 0 1 3-3h10l3.5 3.5H46a3 3 0 0 1 3 3V27H11z" fill="#5d7fa3"/><rect x="11" y="24" width="38" height="22" rx="3" fill="#86a7c9"/><rect x="11" y="24" width="38" height="1.4" fill="#fff" opacity=".4"/>`
        );
      case "photos":
        return base(
          "#cfc6bf",
          `<defs><linearGradient id="sk${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cdc5c0"/><stop offset="1" stop-color="#f3b66c"/></linearGradient><linearGradient id="lk${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9aaab6"/><stop offset="1" stop-color="#5f707e"/></linearGradient><radialGradient id="sn${k}"><stop offset="0" stop-color="#fff3c8"/><stop offset=".45" stop-color="#ffc766"/><stop offset="1" stop-color="#f2a03d" stop-opacity="0"/></radialGradient></defs>
           <rect width="60" height="36" fill="url(#sk${k})"/><circle cx="30" cy="30" r="15" fill="url(#sn${k})"/><circle cx="30" cy="31" r="6" fill="#fff4d6"/>
           <rect y="35" width="60" height="25" fill="url(#lk${k})"/><rect x="26" y="37" width="8" height="1.6" rx=".8" fill="#ffd18a" opacity=".9"/><rect x="24" y="41" width="12" height="1.4" rx=".7" fill="#ffd18a" opacity=".55"/><rect x="27" y="45" width="6" height="1.2" rx=".6" fill="#ffd18a" opacity=".35"/>`
        );
      case "mail":
        return base(
          "url(#mg" + k + ")",
          `<defs><linearGradient id="mg${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b3cfe7"/><stop offset="1" stop-color="#6c98c3"/></linearGradient></defs><rect width="60" height="60" fill="url(#mg${k})"/><rect x="12" y="18" width="36" height="25" rx="3.5" fill="#fffdf8"/><path d="M13 20l17 12.5L47 20" stroke="#6c98c3" stroke-width="2.2" fill="none" stroke-linejoin="round"/>`
        );
      case "links":
        return base(
          C.ink,
          `<circle cx="30" cy="30" r="15" fill="none" stroke="${C.cream}" stroke-width="2"/><ellipse cx="30" cy="30" rx="6.5" ry="15" fill="none" stroke="${C.cream}" stroke-width="1.8"/><path d="M15.5 25h29M15.5 35h29" stroke="${C.cream}" stroke-width="1.6"/><circle cx="44" cy="17" r="4.5" fill="${C.sun}"/>`
        );
      case "trash":
        return `<svg viewBox="0 0 60 60" aria-hidden="true"><rect x="13" y="12" width="34" height="5" rx="2" fill="rgba(255,255,255,.85)" stroke="rgba(40,20,10,.25)"/><path d="M15 19h30l-2.6 31a3 3 0 0 1-3 2.8H20.6a3 3 0 0 1-3-2.8z" fill="rgba(255,255,255,.55)" stroke="rgba(255,255,255,.9)" stroke-width="1.2"/><path d="M23 24l1 23M30 24v23M37 24l-1 23" stroke="rgba(40,20,10,.25)" stroke-width="1.6" stroke-linecap="round"/></svg>`;
      default:
        return "";
    }
  }

  /* ---------------- Wallpaper and masthead ---------------- */

  // Where the head sits in the 1200 × 1600 photo, measured from the cut-out.
  const WP = D.wallpaper || {};
  const WH = WP.head || {};
  const SRC = {
    w: (WP.size && WP.size[0]) || 1200,
    h: (WP.size && WP.size[1]) || 1600,
    headX: WH.x ?? 552,
    headTop: WH.top ?? 506,
    headH: WH.height ?? 205,
    headL: WH.left ?? 445,
    headR: WH.right ?? 660,
  };
  const wallBg = $("#wallBg");
  const wallFg = $("#wallFg");
  if (WP.background && !wallBg.src.endsWith(WP.background)) wallBg.src = WP.background;
  if (WP.person === "") wallFg.hidden = true;
  else if (WP.person && !wallFg.src.endsWith(WP.person)) wallFg.src = WP.person;
  const mast = $("#masthead");
  const mhWord = $("#mhWord");
  const mhProbe = $("#mhProbe");
  let geo = null;

  function capAscent(fs) {
    try {
      const ctx = document.createElement("canvas").getContext("2d");
      ctx.font = `800 ${fs}px Fraunces, Georgia, serif`;
      const m = ctx.measureText(mhWord.textContent.toUpperCase());
      if (m.actualBoundingBoxAscent > 0) return m.actualBoundingBoxAscent;
    } catch (e) {}
    return fs * 0.7;
  }

  function layoutWall() {
    const W = os.clientWidth;
    const H = os.clientHeight;
    if (!W || !H) return;
    const phone = mqPhone.matches;
    const top0 = barH();
    const gutter = phone ? 14 : Math.max(24, W * 0.028);

    // Fit the name to the width.
    mast.style.fontSize = "100px";
    const w100 = mhWord.getBoundingClientRect().width || 500;
    const fs = Math.min((100 * (W - gutter * 2)) / w100, H * (phone ? 0.15 : 0.32));
    mast.style.fontSize = fs + "px";
    const wordW = mhWord.getBoundingClientRect().width;
    const left = (W - wordW) / 2;
    mast.style.left = left + "px";
    mast.style.top = "0px";
    const probeY = mhProbe.getBoundingClientRect().top - mast.getBoundingClientRect().top;
    const capA = capAscent(fs);
    const mastTop = top0 + (phone ? 22 : Math.max(16, H * 0.04));
    let baseline = mastTop + capA;

    // Scale and place the photo so the top of the cap tucks under the letters.
    const overlap = phone ? 0.26 : 0.32;
    const headPx = H * (phone ? 0.17 : 0.3);
    const s = Math.max(W / SRC.w, H / SRC.h, headPx / SRC.headH);
    let x = W * (phone ? 0.5 : 0.5) - SRC.headX * s;
    let y = baseline - capA * overlap - SRC.headTop * s;
    x = clamp(x, W - SRC.w * s, 0);
    y = clamp(y, H - SRC.h * s, 0);
    baseline = y + SRC.headTop * s + capA * overlap;
    mast.style.top = baseline - probeY + "px";
    for (const img of [wallBg, wallFg]) {
      img.style.width = SRC.w * s + "px";
      img.style.height = SRC.h * s + "px";
      img.style.left = x + "px";
      img.style.top = y + "px";
    }

    geo = {
      W,
      H,
      fs,
      baseline,
      left,
      right: left + wordW,
      headL: x + SRC.headL * s,
      headR: x + SRC.headR * s,
      chin: y + (SRC.headTop + SRC.headH) * s,
    };

    // Lines either side of the head.
    const cl = $("#coverL");
    const cr = $("#coverR");
    const lineTop = baseline + Math.max(10, fs * 0.075);
    const leftRoom = geo.headL - geo.left - (phone ? 10 : 28);
    const rightRoom = geo.right - geo.headR - (phone ? 10 : 28);
    cl.style.top = cr.style.top = lineTop + "px";
    cl.style.left = Math.max(gutter, geo.left + (phone ? 0 : fs * 0.02)) + "px";
    cr.style.right = Math.max(gutter, W - geo.right + (phone ? 0 : fs * 0.02)) + "px";
    cl.style.maxWidth = Math.max(90, leftRoom) + "px";
    cr.style.maxWidth = Math.max(90, rightRoom) + "px";
  }

  /* ---------------- Desktop icons ---------------- */

  const items = [
    ...projects.map((p) => ({ kind: "project", id: p.id, name: p.name, desk: p.desk, p })),
    ...files.map((f) => ({ kind: "file", ...f })),
  ];
  const itemMap = Object.fromEntries(items.map((it) => [it.id, it]));
  let saved = store.get("kos-pos", {});
  const sel = new Set();

  function iconThumb(it) {
    if (it.kind === "project") return `<span class="icon-art">${cover(it.p, true)}</span>`;
    if (it.icon === "image") return `<span class="icon-art icon-photo"><img src="${esc(it.src)}" alt="" decoding="async"></span>`;
    return `<span class="icon-art icon-doc">${FILE_ART[it.icon] || FILE_ART.text}</span>`;
  }

  function renderIcons() {
    iconsEl.innerHTML = items
      .map(
        (it, i) => `<li class="icon-li" data-id="${esc(it.id)}" data-phone="${it.phone === false ? "false" : "true"}" style="--i:${i}">
          <button class="icon icon-${it.kind}" type="button" data-id="${esc(it.id)}" title="${esc(
            it.kind === "project" ? `${it.p.name}, ${it.p.kind}, ${it.p.year}` : it.name
          )}"><span class="icon-thumb">${iconThumb(it)}</span><span class="icon-label">${esc(it.name)}</span></button>
        </li>`
      )
      .join("");
  }

  function dockRect() {
    const r = dock.getBoundingClientRect();
    const o = os.getBoundingClientRect();
    return { left: r.left - o.left, right: r.right - o.left, top: r.top - o.top };
  }

  function placeIcons() {
    const W = os.clientWidth;
    const H = os.clientHeight;
    const lis = $$(".icon-li", iconsEl);
    const dr = dockRect();
    if (mqPhone.matches) {
      const vis = lis.filter((li) => li.dataset.phone !== "false");
      lis.forEach((li) => (li.hidden = li.dataset.phone === "false"));
      const cols = 4;
      const gut = 12;
      const cellW = (W - gut * 2) / cols;
      const cellH = 98;
      const rows = Math.ceil(vis.length / cols);
      const y0 = Math.max(geo ? geo.chin + 24 : barH() + 200, dr.top - 10 - rows * cellH);
      vis.forEach((li, i) => {
        li.style.width = cellW + "px";
        li.style.left = gut + (i % cols) * cellW + "px";
        li.style.top = y0 + Math.floor(i / cols) * cellH + "px";
      });
      return;
    }
    lis.forEach((li) => {
      li.hidden = false;
      li.style.width = "";
      const it = itemMap[li.dataset.id];
      const p = saved[it.id] || it.desk || { x: 50, y: 50 };
      let left = clamp((p.x / 100) * W - 54, 6, W - 114);
      let top = clamp((p.y / 100) * H, barH() + 4, H - 110);
      if (left + 108 > dr.left - 12 && left < dr.right + 12) top = Math.min(top, dr.top - 116);
      li.style.left = left + "px";
      li.style.top = top + "px";
    });
  }

  function setSel(ids) {
    sel.clear();
    ids.forEach((id) => sel.add(id));
    $$(".icon", iconsEl).forEach((b) => b.classList.toggle("is-selected", sel.has(b.dataset.id)));
  }

  function openItem(id, from) {
    const it = itemMap[id];
    if (!it) return;
    hideHint();
    if (it.kind === "project") return openWin("project", it.id, from);
    if (it.opens === "preview") return openWin("preview", it.id, from);
    if (it.opens === "resume") {
      if (D.resume) {
        const a = document.createElement("a");
        a.href = D.resume;
        a.target = "_blank";
        a.rel = "noopener";
        a.click();
        return;
      }
      return openWin("about", "cv", from);
    }
    const [kind, arg] = String(it.opens || "about").split(":");
    return openWin(kind, arg, from);
  }

  let lastPointer = "mouse";
  let suppressClick = false;
  let hintTimer = 0;
  let hintsShown = 0;
  const hint = $("#hint");

  function hideHint() {
    clearTimeout(hintTimer);
    hint.classList.remove("show");
  }

  function maybeHint(btn) {
    if (hintsShown >= 2) return;
    clearTimeout(hintTimer);
    hintTimer = setTimeout(() => {
      hintsShown++;
      const r = btn.getBoundingClientRect();
      const o = os.getBoundingClientRect();
      hint.textContent = "Double-click to open";
      hint.style.left = clamp(r.left - o.left + r.width / 2 - 70, 8, o.width - 160) + "px";
      hint.style.top = r.top - o.top - 34 + "px";
      hint.classList.add("show");
      hintTimer = setTimeout(hideHint, 1800);
    }, 380);
  }

  iconsEl.addEventListener("pointerdown", (e) => {
    lastPointer = e.pointerType || "mouse";
    const btn = e.target.closest(".icon");
    if (!btn || e.button !== 0) return;
    const id = btn.dataset.id;
    if (e.shiftKey || e.metaKey || e.ctrlKey) {
      sel.has(id) ? sel.delete(id) : sel.add(id);
      setSel([...sel]);
    } else if (!sel.has(id)) setSel([id]);
    if (mqPhone.matches) return;

    const W = os.clientWidth;
    const H = os.clientHeight;
    const group = [...sel].map((sid) => {
      const li = iconsEl.querySelector(`.icon-li[data-id="${CSS.escape(sid)}"]`);
      return { li, l: li.offsetLeft, t: li.offsetTop };
    });
    const sx = e.clientX;
    const sy = e.clientY;
    let moved = false;
    btn.setPointerCapture(e.pointerId);
    const move = (ev) => {
      const dx = ev.clientX - sx;
      const dy = ev.clientY - sy;
      if (!moved && Math.hypot(dx, dy) < 5) return;
      if (!moved) {
        moved = true;
        hideHint();
        group.forEach((g) => g.li.classList.add("is-dragging"));
      }
      group.forEach((g) => {
        g.li.style.left = clamp(g.l + dx, -30, W - 80) + "px";
        g.li.style.top = clamp(g.t + dy, barH(), H - 96) + "px";
      });
    };
    const up = () => {
      btn.removeEventListener("pointermove", move);
      btn.removeEventListener("pointerup", up);
      btn.removeEventListener("pointercancel", up);
      if (!moved) return;
      group.forEach((g) => {
        g.li.classList.remove("is-dragging");
        saved[g.li.dataset.id] = {
          x: +(((g.li.offsetLeft + 54) / W) * 100).toFixed(2),
          y: +((g.li.offsetTop / H) * 100).toFixed(2),
        };
      });
      store.set("kos-pos", saved);
      suppressClick = true;
      setTimeout(() => (suppressClick = false), 60);
    };
    btn.addEventListener("pointermove", move);
    btn.addEventListener("pointerup", up);
    btn.addEventListener("pointercancel", up);
  });

  iconsEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".icon");
    if (!btn) return;
    if (suppressClick) return;
    if (e.detail === 0 || lastPointer !== "mouse" || mqPhone.matches) openItem(btn.dataset.id, btn);
    else if (e.detail === 1) maybeHint(btn);
  });
  iconsEl.addEventListener("dblclick", (e) => {
    const btn = e.target.closest(".icon");
    if (!btn || suppressClick || lastPointer !== "mouse" || mqPhone.matches) return;
    openItem(btn.dataset.id, btn);
  });

  // Rubber-band selection on the empty desktop.
  const band = $("#band");
  desktop.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".icon, .sticky") || e.button !== 0) return;
    closeMenu();
    hideHint();
    setSel([]);
    if (mqPhone.matches || e.pointerType !== "mouse") return;
    const o = os.getBoundingClientRect();
    const sx = e.clientX - o.left;
    const sy = e.clientY - o.top;
    const rects = $$(".icon", iconsEl).map((b) => [b.dataset.id, $(".icon-thumb", b).getBoundingClientRect()]);
    desktop.setPointerCapture(e.pointerId);
    let on = false;
    const move = (ev) => {
      const x = ev.clientX - o.left;
      const y = ev.clientY - o.top;
      if (!on && Math.hypot(x - sx, y - sy) < 4) return;
      on = true;
      band.hidden = false;
      const l = Math.min(sx, x);
      const t = Math.min(sy, y);
      const w = Math.abs(x - sx);
      const h = Math.abs(y - sy);
      Object.assign(band.style, { left: l + "px", top: t + "px", width: w + "px", height: h + "px" });
      const hit = rects
        .filter(([, r]) => r.right - o.left > l && r.left - o.left < l + w && r.bottom - o.top > t && r.top - o.top < t + h)
        .map(([id]) => id);
      setSel(hit);
    };
    const up = () => {
      band.hidden = true;
      desktop.removeEventListener("pointermove", move);
      desktop.removeEventListener("pointerup", up);
      desktop.removeEventListener("pointercancel", up);
    };
    desktop.addEventListener("pointermove", move);
    desktop.addEventListener("pointerup", up);
    desktop.addEventListener("pointercancel", up);
  });

  /* ---------------- Windows ---------------- */

  const wins = new Map();
  let zTop = 100;
  const allWins = () => Array.from(wins.values());

  function frontWin() {
    return allWins()
      .filter((w) => !w.min)
      .sort((a, b) => b.z - a.z)[0];
  }

  function setHash(route) {
    try {
      const base = location.pathname + location.search;
      history.replaceState(null, "", route ? `#${route}` : base);
    } catch (e) {}
  }

  function focusWin(w) {
    w.z = ++zTop;
    w.el.style.zIndex = w.z;
    allWins().forEach((o) => o.el.classList.toggle("is-front", o === w));
    setHash(w.route);
    syncDock();
  }

  function placeWin(w, def) {
    if (mqPhone.matches) return;
    const W = os.clientWidth;
    const H = os.clientHeight;
    const top0 = barH() + 12;
    const room = H - top0 - 96;
    const width = Math.min(def.w || 520, W - 24);
    const height = Math.min(def.h || 480, room);
    const others = allWins().filter((o) => o !== w && !o.min).length;
    let x;
    let y;
    if (def.at === "right") {
      x = W - width - Math.max(24, W * 0.045);
      y = top0 + Math.max(0, (room - height) * 0.55);
    } else if (def.at === "left") {
      x = Math.max(24, W * 0.06);
      y = top0 + Math.max(0, (room - height) * 0.45);
    } else {
      x = (W - width) / 2 + (def.dx || 0) * W;
      y = top0 + Math.max(0, (room - height) * 0.4);
    }
    x += (others % 6) * 28;
    y += (others % 6) * 24;
    x = clamp(x, 8, W - width - 8);
    y = clamp(y, top0, Math.max(top0, H - height - 90));
    Object.assign(w.el.style, { left: x + "px", top: y + "px", width: width + "px", height: height + "px" });
  }

  function animateWin(el, from, closing) {
    if (mqReduce.matches || !el.animate) return Promise.resolve();
    let frames;
    if (mqPhone.matches) {
      frames = [
        { transform: "translateY(36px) scale(.96)", opacity: 0 },
        { transform: "none", opacity: 1 },
      ];
    } else {
      const r = el.getBoundingClientRect();
      let o = from && document.contains(from) ? from.getBoundingClientRect() : null;
      if (!o || !o.width) o = { left: r.left + r.width / 2 - 30, top: r.top + r.height / 2 - 30, width: 60, height: 60 };
      const dx = o.left + o.width / 2 - (r.left + r.width / 2);
      const dy = o.top + o.height / 2 - (r.top + r.height / 2);
      frames = [
        { transform: `translate(${dx}px, ${dy}px) scale(${o.width / r.width}, ${o.height / r.height})`, opacity: 0.15 },
        { transform: "none", opacity: 1 },
      ];
    }
    if (closing) frames.reverse();
    const a = el.animate(frames, {
      duration: closing ? 220 : 340,
      easing: closing ? "cubic-bezier(.5,0,.75,0)" : "cubic-bezier(.2,.85,.25,1)",
      fill: closing ? "forwards" : "none",
    });
    return a.finished.catch(() => {});
  }

  function openWin(kind, arg, from) {
    const app = APPS[kind];
    if (!app) return null;
    const key = app.single ? kind : `${kind}:${arg}`;
    let w = wins.get(key);
    if (w) {
      if (w.min) restoreWin(w, from);
      if (arg && w.api && w.api.tab) w.api.tab(arg);
      focusWin(w);
      w.el.focus({ preventScroll: true });
      return w;
    }
    const def = app.make(arg);
    if (!def) return null;
    const n = ++uid;
    const el = document.createElement("section");
    el.className = `win win-${kind}`;
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-labelledby", `wt${n}`);
    el.tabIndex = -1;
    el.innerHTML = `<div class="win-bar">
        <div class="win-lights">
          <button class="light l-close" type="button" aria-label="Close window">${G.close}</button>
          <button class="light l-min" type="button" aria-label="Minimise window">${G.min}</button>
          <button class="light l-zoom" type="button" aria-label="Zoom window">${G.zoom}</button>
        </div>
        <h2 class="win-title" id="wt${n}">${esc(def.title)}</h2><span></span>
      </div>
      <div class="win-body">${def.html}</div>`;
    winLayer.appendChild(el);
    w = {
      key,
      kind,
      el,
      route: def.route || "",
      from,
      opener: document.activeElement,
      z: 0,
      min: false,
      api: {},
    };
    wins.set(key, w);
    placeWin(w, def);
    if (def.mount) def.mount(el, w, arg);
    focusWin(w);
    el.focus({ preventScroll: true });
    animateWin(el, from, false);
    bounce(dockKeyFor(kind));
    return w;
  }

  async function closeWin(w) {
    if (!wins.has(w.key)) return;
    wins.delete(w.key);
    const back = w.opener;
    await animateWin(w.el, w.from, true);
    w.el.remove();
    const f = frontWin();
    if (f) focusWin(f);
    else setHash("");
    syncDock();
    if (back && document.contains(back) && back !== document.body) back.focus({ preventScroll: true });
    else if (f) f.el.focus({ preventScroll: true });
  }

  async function minimiseWin(w) {
    const target = dockBtn(dockKeyFor(w.kind));
    await animateWin(w.el, target, true);
    w.el.getAnimations().forEach((a) => a.cancel());
    w.el.hidden = true;
    w.min = true;
    w.el.classList.remove("is-front");
    const f = frontWin();
    if (f) focusWin(f);
    else setHash("");
    syncDock();
  }

  function restoreWin(w, from) {
    w.el.hidden = false;
    w.min = false;
    animateWin(w.el, from || dockBtn(dockKeyFor(w.kind)), false);
  }

  function zoomWin(w) {
    if (mqPhone.matches) return;
    const el = w.el;
    if (w.zoomed) {
      Object.assign(el.style, w.zoomed);
      w.zoomed = null;
      el.classList.remove("is-zoomed");
      return;
    }
    w.zoomed = { left: el.style.left, top: el.style.top, width: el.style.width, height: el.style.height };
    const top0 = barH() + 8;
    Object.assign(el.style, {
      left: "8px",
      top: top0 + "px",
      width: os.clientWidth - 16 + "px",
      height: os.clientHeight - top0 - 92 + "px",
    });
    el.classList.add("is-zoomed");
  }

  const winOf = (el) => allWins().find((w) => w.el === el);

  winLayer.addEventListener("pointerdown", (e) => {
    const el = e.target.closest(".win");
    if (!el) return;
    const w = winOf(el);
    if (!w) return;
    if (!el.classList.contains("is-front")) focusWin(w);
    const bar = e.target.closest(".win-bar");
    if (!bar || e.target.closest(".light") || e.button !== 0 || mqPhone.matches || w.zoomed) return;
    e.preventDefault();
    const sx = e.clientX;
    const sy = e.clientY;
    const l = el.offsetLeft;
    const t = el.offsetTop;
    bar.setPointerCapture(e.pointerId);
    const move = (ev) => {
      el.style.left = clamp(l + ev.clientX - sx, 90 - el.offsetWidth, os.clientWidth - 90) + "px";
      el.style.top = clamp(t + ev.clientY - sy, barH(), os.clientHeight - 50) + "px";
    };
    const up = () => {
      bar.removeEventListener("pointermove", move);
      bar.removeEventListener("pointerup", up);
      bar.removeEventListener("pointercancel", up);
    };
    bar.addEventListener("pointermove", move);
    bar.addEventListener("pointerup", up);
    bar.addEventListener("pointercancel", up);
  });

  winLayer.addEventListener("click", (e) => {
    const el = e.target.closest(".win");
    const w = el && winOf(el);
    if (!w) return;
    if (e.target.closest(".l-close")) closeWin(w);
    else if (e.target.closest(".l-min")) minimiseWin(w);
    else if (e.target.closest(".l-zoom")) zoomWin(w);
  });
  winLayer.addEventListener("dblclick", (e) => {
    if (!e.target.closest(".win-bar") || e.target.closest(".light")) return;
    const w = winOf(e.target.closest(".win"));
    if (w) zoomWin(w);
  });

  /* ---------------- Apps ---------------- */

  const firstName = D.name || "Kristan";

  function projectHTML(p) {
    const meta = [p.kind, p.client, p.year].filter(Boolean).map(esc).join(" · ");
    const kv = [
      ["Type", p.type && p.type.length ? `<span class="path">${p.type.map((t) => `<span>${esc(t)}</span>`).join("")}</span>` : ""],
      ["Role", esc(p.role)],
      ["Team", esc(p.team)],
      ["Timeline", esc(p.timeline)],
      ["Year", esc(p.year)],
    ].filter(([, v]) => v);
    const preview = p.gallery
      ? `<div class="preview-gallery">${p.gallery.map((g) => `<img src="${esc(g.src)}" alt="${esc(g.alt)}" loading="lazy">`).join("")}</div>`
      : `<div class="preview" style="background:${esc((p.cover && p.cover.bg) || C.ox)}">${cover(p, false)}</div>`;
    return `<article class="info">
      <header class="info-head">
        <span class="info-thumb">${cover(p, true)}</span>
        <div><h3 class="info-name">${esc(p.name)}</h3><p class="info-sub">${meta}</p></div>
      </header>
      <div class="panel"><p>${esc(p.summary)}</p>${p.problem ? `<p class="muted">${esc(p.problem)}</p>` : ""}</div>
      <details class="sec" open><summary>Details</summary><div class="sec-body"><dl class="kv">${kv.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("")}</dl></div></details>
      ${
        p.results && p.results.length
          ? `<details class="sec" open><summary>Results</summary><div class="sec-body"><div class="stats">${p.results
              .map((r) => `<div class="stat"><span class="stat-v">${esc(r.value)}</span><span class="stat-l">${esc(r.label)}</span></div>`)
              .join("")}</div></div></details>`
          : ""
      }
      ${
        p.steps && p.steps.length
          ? `<details class="sec"><summary>Process</summary><div class="sec-body"><ol class="steps">${p.steps
              .map((s) => `<li><b>${esc(s.title)}</b><span>${esc(s.text)}</span></li>`)
              .join("")}</ol></div></details>`
          : ""
      }
      <details class="sec" open><summary>Preview</summary><div class="sec-body">${preview}</div></details>
      ${
        p.links && p.links.length
          ? `<div class="links">${p.links
              .map((l) => `<a class="btn" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ${G.out}</a>`)
              .join("")}</div>`
          : ""
      }
    </article>`;
  }

  function copyBlock(text) {
    return `<div class="copyline"><span class="addr">${esc(text)}</span><button class="btn" type="button" data-copy="${esc(text)}">${G.copy} Copy</button></div>`;
  }

  const A = D.about || {};
  const APPS = {
    project: {
      make(id) {
        const p = projectMap[id];
        if (!p) return null;
        return { title: `Info: ${p.name}`, w: 540, h: 640, at: "center", dx: 0.06, route: p.id, html: projectHTML(p) };
      },
    },

    about: {
      single: true,
      make(tab) {
        const tabs = [
          ["about", "About me", ""],
          ["cv", "CV", A.experience ? `${A.experience.length}` : ""],
          ["interests", "Interests", A.interests ? `${A.interests.length}` : ""],
          ["contact", "Contact", ""],
        ];
        const rows = (list) =>
          `<ul class="rows">${(list || [])
            .map((r) => `<li><span class="yr">${esc(r.years)}</span><div><b>${esc(r.role)}</b><span>${esc(r.company)}</span></div></li>`)
            .join("")}</ul>`;
        const panes = {
          about: `<div class="who"><img src="${esc(D.photo && D.photo.face)}" alt="" width="60" height="60"><div><h3>${esc(firstName)}</h3><p>${esc(D.role)} · ${esc(D.location)}</p></div></div>
            <p class="lede">${esc(A.intro)}</p>
            <h4 class="pane-h">I can do…</h4>
            <ul class="cando">${(A.canDo || []).map((c) => `<li>${esc(c)}</li>`).join("")}</ul>`,
          cv: `<h4 class="pane-h">Experience</h4>${rows(A.experience)}
            <h4 class="pane-h">Education</h4>${rows(A.education)}
            <h4 class="pane-h">Toolkit</h4><ul class="chips">${(A.toolkit || []).map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
            ${D.resume ? `<p style="margin-top:16px"><a class="btn" href="${esc(D.resume)}" target="_blank" rel="noopener">Open résumé (PDF) ${G.out}</a></p>` : ""}`,
          interests: `<h4 class="pane-h">Outside work</h4><div class="cards">${(A.interests || [])
            .map((i) => `<div class="card"><b>${esc(i.title)}</b><p>${esc(i.text)}</p></div>`)
            .join("")}</div>
            <h4 class="pane-h">Right now</h4><dl class="kv">${(A.currently || [])
              .map((c) => `<dt>${esc(c.label)}</dt><dd>${esc(c.value)}</dd>`)
              .join("")}</dl>`,
          contact: `<h4 class="pane-h">Email</h4>${copyBlock(D.email)}
            ${D.availability ? `<p class="muted" style="margin:10px 0 0">${esc(D.availability)}. I reply within one working day.</p>` : ""}
            <h4 class="pane-h">Elsewhere</h4>${linksHTML()}`,
        };
        const current = panes[tab] ? tab : "about";
        return {
          title: `Info: ${firstName}, ${D.role || ""}`.replace(/, $/, ""),
          w: 620,
          h: 500,
          at: "right",
          route: current === "about" ? "about" : current,
          html: `<div class="split">
            <div class="side" role="tablist" aria-label="About ${esc(firstName)}">
              <p class="side-h">${esc(firstName)}</p>
              ${tabs
                .map(
                  ([k, label, count]) =>
                    `<button class="tab" type="button" role="tab" id="tab-${k}" aria-controls="pane-${k}" aria-selected="${k === current}" tabindex="${k === current ? 0 : -1}" data-tab="${k}">${label}${count ? `<small>${count}</small>` : ""}</button>`
                )
                .join("")}
            </div>
            ${Object.entries(panes)
              .map(([k, html]) => `<div class="pane" role="tabpanel" id="pane-${k}" aria-labelledby="tab-${k}" ${k === current ? "" : "hidden"}>${html}</div>`)
              .join("")}
          </div>`,
          mount(el, w) {
            const show = (k) => {
              $$(".tab", el).forEach((t) => {
                const on = t.dataset.tab === k;
                t.setAttribute("aria-selected", on);
                t.tabIndex = on ? 0 : -1;
              });
              $$(".pane", el).forEach((p) => (p.hidden = p.id !== `pane-${k}`));
              w.route = k === "about" ? "about" : k;
              if (el.classList.contains("is-front")) setHash(w.route);
            };
            w.api.tab = (k) => panes[k] && show(k);
            $(".side", el).addEventListener("click", (e) => {
              const t = e.target.closest(".tab");
              if (t) show(t.dataset.tab);
            });
            $(".side", el).addEventListener("keydown", (e) => {
              if (!["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(e.key)) return;
              const ts = $$(".tab", el);
              const i = ts.indexOf(document.activeElement);
              if (i < 0) return;
              e.preventDefault();
              const n = ts[(i + (e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : ts.length - 1)) % ts.length];
              n.focus();
              show(n.dataset.tab);
            });
          },
        };
      },
    },

    work: {
      single: true,
      make() {
        return {
          title: `Work`,
          w: 600,
          h: 470,
          at: "left",
          route: "work",
          html: `<div class="finder">
            <div class="finder-head"><span>Name</span><span class="finder-kind">Kind</span><span>Year</span></div>
            <ul>${projects
              .map(
                (p) => `<li><button class="finder-row" type="button" data-project="${esc(p.id)}">
                  <span class="finder-name"><span class="finder-thumb">${cover(p, true)}</span><span>${esc(p.name)}</span></span>
                  <span class="finder-kind muted">${esc(p.kind)}</span><span class="muted">${esc(p.year)}</span></button></li>`
              )
              .join("")}</ul>
            <p class="finder-foot">${projects.length} projects</p>
          </div>`,
          mount(el) {
            el.addEventListener("click", (e) => {
              const r = e.target.closest("[data-project]");
              if (r) openWin("project", r.dataset.project, $(".finder-thumb", r));
            });
          },
        };
      },
    },

    photos: {
      single: true,
      make() {
        const list = D.photos || [];
        return {
          title: "Photos",
          w: 660,
          h: 540,
          dx: -0.08,
          route: "photos",
          html: `<div class="photos"><div class="photo-grid">${list
            .map(
              (ph, i) =>
                `<button class="photo-cell" type="button" data-i="${i}" aria-label="Open photo: ${esc(ph.alt)}"><img src="${esc(ph.thumb || ph.src)}" alt="" loading="lazy" decoding="async"></button>`
            )
            .join("")}</div></div>`,
          mount(el, w) {
            const body = $(".win-body", el);
            const grid = body.innerHTML;
            let i = -1;
            const view = (n) => {
              i = (n + list.length) % list.length;
              const ph = list[i];
              body.innerHTML = `<div class="viewer">
                <div class="viewer-stage"><img src="${esc(ph.src)}" alt="${esc(ph.alt)}"></div>
                <div class="viewer-bar">
                  <button class="icon-btn" type="button" data-v="grid" aria-label="Back to all photos">${G.grid}</button>
                  <p>${esc(ph.caption || "")}</p>
                  <span class="count">${i + 1} / ${list.length}</span>
                  <button class="icon-btn" type="button" data-v="prev" aria-label="Previous photo">${G.left}</button>
                  <button class="icon-btn" type="button" data-v="next" aria-label="Next photo">${G.right}</button>
                </div></div>`;
              el.focus({ preventScroll: true });
            };
            const back = () => {
              const was = i;
              i = -1;
              body.innerHTML = grid;
              const cell = $(`[data-i="${was}"]`, body);
              if (cell) cell.focus({ preventScroll: true });
            };
            body.addEventListener("click", (e) => {
              const c = e.target.closest(".photo-cell");
              if (c) return view(+c.dataset.i);
              const v = e.target.closest("[data-v]");
              if (!v) return;
              if (v.dataset.v === "grid") back();
              if (v.dataset.v === "prev") view(i - 1);
              if (v.dataset.v === "next") view(i + 1);
            });
            el.addEventListener("keydown", (e) => {
              if (i < 0) return;
              if (e.key === "ArrowLeft") view(i - 1);
              else if (e.key === "ArrowRight") view(i + 1);
              else if (e.key === "Escape") {
                e.stopPropagation();
                back();
              }
            });
            w.api.tab = () => i >= 0 && back();
          },
        };
      },
    },

    preview: {
      make(id) {
        const f = fileMap[id];
        if (!f) return null;
        const big = id === "portrait" ? (D.photo && D.photo.src) || f.src : f.src;
        return {
          title: f.name,
          w: 440,
          h: 640,
          dx: 0.18,
          route: id,
          html: `<div class="pv"><div class="pv-stage"><img src="${esc(big)}" alt="${esc((D.photo && D.photo.alt) || f.name)}"></div>
            <div class="pv-meta"><span>1200 × 1600</span><span>Golden hour, ${esc(D.city || "")}</span></div></div>`,
        };
      },
    },

    mail: {
      single: true,
      make() {
        return {
          title: "New Message",
          w: 520,
          h: 440,
          dx: -0.04,
          route: "contact",
          html: `<form class="mail" id="mailForm" novalidate>
            <div class="mail-row"><span class="lbl">To:</span><span class="addr" style="font-family:var(--font-mono);font-size:13px;user-select:all">${esc(D.email)}</span><button class="btn" type="button" data-copy="${esc(D.email)}">${G.copy} Copy</button></div>
            <div class="mail-row"><label for="mailSubject">Subject:</label><input id="mailSubject" name="subject" type="text" autocomplete="off" value="Hello from your portfolio"><span></span></div>
            <label class="sr-only" for="mailBody">Message</label>
            <textarea id="mailBody" name="body" placeholder="Hi ${esc(firstName)}, I'd like to talk about…"></textarea>
            <div class="mail-foot"><p>Opens your email app with this message.</p><a class="btn btn-primary" id="mailSend" href="#">Write in email app</a></div>
          </form>`,
          mount(el) {
            const subj = $("#mailSubject", el);
            const body = $("#mailBody", el);
            const send = $("#mailSend", el);
            const sync = () => {
              send.href = `mailto:${D.email}?subject=${encodeURIComponent(subj.value)}&body=${encodeURIComponent(body.value)}`;
            };
            sync();
            el.addEventListener("input", sync);
            $("#mailForm", el).addEventListener("submit", (e) => e.preventDefault());
          },
        };
      },
    },

    links: {
      single: true,
      make() {
        return { title: "Links", w: 380, h: 330, dx: 0.12, route: "links", html: `<div class="list-pad">${linksHTML()}</div>` };
      },
    },

    trash: {
      single: true,
      make() {
        const list = D.trash || [];
        return {
          title: "Trash",
          w: 400,
          h: 300,
          dx: 0.22,
          route: "trash",
          html: `<div class="list-pad" id="trashList">${list
            .map((t) => `<div class="trash-row"><span class="fi">${FILE_ART.text}</span><div><b>${esc(t.name)}</b><span class="muted">${esc(t.note)}</span></div></div>`)
            .join("")}</div>
            <div class="mail-foot"><p>${list.length} items</p><button class="btn" type="button" data-empty>Empty Trash</button></div>`,
          mount(el) {
            el.addEventListener("click", (e) => {
              const b = e.target.closest("[data-empty]");
              if (!b) return;
              $("#trashList", el).innerHTML = `<p class="trash-empty">Trash is empty. Some ideas are better gone.</p>`;
              b.disabled = true;
              b.closest(".mail-foot").querySelector("p").textContent = "0 items";
              toast("Trash emptied");
            });
          },
        };
      },
    },

    system: {
      single: true,
      make() {
        return {
          title: "About this desktop",
          w: 380,
          h: 440,
          route: "system",
          html: `<div class="sys">
            <span class="sys-logo">${dockArt("photos")}</span>
            <h3>${esc(firstName)} OS</h3>
            <p>Version 2026.11 · Golden Hour</p>
            <dl class="kv">
              <dt>Designer</dt><dd>${esc(firstName)}, ${esc(D.role)}</dd>
              <dt>Location</dt><dd>${esc(D.location)}</dd>
              <dt>Wallpaper</dt><dd>A lake at sunset, shot on a phone</dd>
              <dt>Type</dt><dd>Fraunces, Instrument Sans, Geist Mono</dd>
              <dt>Built with</dt><dd>HTML, CSS and JavaScript</dd>
              <dt>Projects</dt><dd>${projects.length}</dd>
            </dl>
          </div>`,
        };
      },
    },
  };

  function linksHTML() {
    return (D.socials || [])
      .map(
        (s) =>
          `<a class="linkrow" href="${esc(s.url)}" target="_blank" rel="noopener"><b>${esc(s.label)}</b><span class="muted">${esc(s.handle || "")}</span>${G.out}</a>`
      )
      .join("");
  }

  // Copy buttons anywhere.
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-copy]");
    if (!b) return;
    const text = b.dataset.copy;
    const fallback = () => {
      const addr = b.parentElement.querySelector(".addr");
      if (addr) {
        const r = document.createRange();
        r.selectNodeContents(addr);
        const s = getSelection();
        s.removeAllRanges();
        s.addRange(r);
      }
      toast("Selected. Press Ctrl+C or ⌘C to copy.");
    };
    try {
      navigator.clipboard.writeText(text).then(() => toast("Email address copied"), fallback);
    } catch (err) {
      fallback();
    }
  });

  /* ---------------- Dock ---------------- */

  const DOCK = [
    { key: "about", label: `About ${firstName}` },
    { key: "work", label: "Work" },
    { key: "photos", label: "Photos" },
    { key: "mail", label: "Mail" },
    { key: "links", label: "Links" },
    "sep",
    { key: "trash", label: "Trash" },
  ];
  const dockKeyFor = (kind) => ({ project: "work", preview: "photos", system: "" })[kind] ?? kind;
  const dockBtn = (key) => (key ? $(`.dock-btn[data-app="${key}"]`, dockRow) : null);

  function renderDock() {
    dockRow.innerHTML = DOCK.map((d) =>
      d === "sep"
        ? `<li class="dock-sep" aria-hidden="true"></li>`
        : `<li class="dock-item dock-${d.key}" data-app="${d.key}"><button class="dock-btn" type="button" data-app="${d.key}" aria-label="${esc(d.label)}">${dockArt(d.key)}</button><span class="dock-tip" aria-hidden="true">${esc(d.label)}</span><i class="dock-dot" aria-hidden="true"></i></li>`
    ).join("");
  }

  function syncDock() {
    os.classList.toggle("has-sheet", allWins().some((w) => !w.min));
    const open = new Set(allWins().map((w) => dockKeyFor(w.kind)));
    $$(".dock-item", dockRow).forEach((li) => li.classList.toggle("is-open", open.has(li.dataset.app)));
  }

  function bounce(key) {
    const li = key && $(`.dock-item[data-app="${key}"]`, dockRow);
    if (!li || mqReduce.matches) return;
    li.classList.remove("is-bouncing");
    void li.offsetWidth;
    li.classList.add("is-bouncing");
    setTimeout(() => li.classList.remove("is-bouncing"), 650);
  }

  dockRow.addEventListener("click", (e) => {
    const b = e.target.closest(".dock-btn");
    if (!b) return;
    const key = b.dataset.app;
    // Restore minimised windows of this app first.
    const mins = allWins().filter((w) => w.min && dockKeyFor(w.kind) === key);
    if (mins.length) {
      mins.forEach((w) => restoreWin(w, b));
      focusWin(mins[mins.length - 1]);
      return;
    }
    openWin(key, null, b);
  });

  let dockCenters = null;
  dock.addEventListener("pointerenter", (e) => {
    if (e.pointerType !== "mouse" || mqReduce.matches || mqPhone.matches) return;
    dockCenters = $$(".dock-item", dockRow).map((li) => {
      const r = li.getBoundingClientRect();
      return [li, r.left + r.width / 2];
    });
  });
  dock.addEventListener("pointermove", (e) => {
    if (!dockCenters) return;
    dock.classList.add("is-tracking");
    dockCenters.forEach(([li, c]) => {
      const d = Math.abs(e.clientX - c);
      const s = 1 + 0.42 * Math.max(0, Math.cos(Math.min(d / 150, 1) * (Math.PI / 2)));
      li.style.setProperty("--s", s.toFixed(3));
    });
  });
  dock.addEventListener("pointerleave", () => {
    dockCenters = null;
    dock.classList.remove("is-tracking");
    $$(".dock-item", dockRow).forEach((li) => li.style.setProperty("--s", 1));
  });

  /* ---------------- Menu bar ---------------- */

  const logoBtn = $("#logoBtn");
  const logoMenu = $("#logoMenu");
  logoBtn.innerHTML = G.logo;

  function openMenu() {
    logoMenu.hidden = false;
    logoBtn.setAttribute("aria-expanded", "true");
    const first = $("button", logoMenu);
    if (first) first.focus();
  }
  function closeMenu(refocus) {
    if (logoMenu.hidden) return;
    logoMenu.hidden = true;
    logoBtn.setAttribute("aria-expanded", "false");
    if (refocus) logoBtn.focus();
  }
  logoBtn.addEventListener("click", () => (logoMenu.hidden ? openMenu() : closeMenu()));
  logoMenu.addEventListener("keydown", (e) => {
    const list = $$("button", logoMenu);
    const i = list.indexOf(document.activeElement);
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      list[(i + (e.key === "ArrowDown" ? 1 : list.length - 1)) % list.length].focus();
    }
  });
  document.addEventListener("pointerdown", (e) => {
    if (!logoMenu.hidden && !e.target.closest("#logoMenu, #logoBtn")) closeMenu();
  });

  menubar.addEventListener("click", (e) => {
    const b = e.target.closest("[data-open], [data-action]");
    if (!b) return;
    if (b.closest("#logoMenu")) closeMenu();
    if (b.dataset.open) return openWin(b.dataset.open, null, b);
    const act = b.dataset.action;
    if (act === "cleanup") {
      saved = {};
      store.set("kos-pos", saved);
      placeIcons();
      toast("Icons put back");
    } else if (act === "closeall") allWins().forEach(closeWin);
    else if (act === "theme") toggleTheme();
  });

  // Theme
  const themeBtn = $("#themeBtn");
  const isDark = () => {
    const t = document.documentElement.getAttribute("data-theme");
    return t ? t === "dark" : mqDark.matches;
  };
  function paintThemeBtn() {
    const dark = isDark();
    themeBtn.innerHTML = dark ? G.sun : G.moon;
    themeBtn.setAttribute("aria-label", dark ? "Switch to light appearance" : "Switch to dark appearance");
    themeBtn.title = themeBtn.getAttribute("aria-label");
  }
  function toggleTheme() {
    const next = isDark() ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    store.set("kos-theme", next);
    try {
      localStorage.setItem("kos-theme", next);
    } catch (e) {}
    paintThemeBtn();
  }
  themeBtn.addEventListener("click", toggleTheme);
  mqDark.addEventListener("change", paintThemeBtn);
  new MutationObserver(paintThemeBtn).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  paintThemeBtn();

  // Clock, sunset and status
  function zoneParts(date) {
    try {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: D.timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }).formatToParts(date);
      const get = (t) => Number(parts.find((p) => p.type === t).value);
      return { y: get("year"), mo: get("month"), d: get("day"), h: get("hour") % 24, m: get("minute") };
    } catch (e) {
      return { y: date.getFullYear(), mo: date.getMonth() + 1, d: date.getDate(), h: date.getHours(), m: date.getMinutes() };
    }
  }
  const hm = (h, m) => `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;

  function sunsetToday(z) {
    const c = D.coords;
    if (!c || typeof c.lat !== "number" || typeof c.lon !== "number") return null;
    const rad = Math.PI / 180;
    const n = Date.UTC(z.y, z.mo - 1, z.d, 12) / 86400000 + 2440587.5 - 2451545;
    const jStar = n - c.lon / 360;
    const M = (357.5291 + 0.98560028 * jStar) % 360;
    const Cc = 1.9148 * Math.sin(M * rad) + 0.02 * Math.sin(2 * M * rad) + 0.0003 * Math.sin(3 * M * rad);
    const lambda = (M + Cc + 180 + 102.9372) % 360;
    const transit = 2451545 + jStar + 0.0053 * Math.sin(M * rad) - 0.0069 * Math.sin(2 * lambda * rad);
    const sinDec = Math.sin(lambda * rad) * Math.sin(23.4397 * rad);
    const cosDec = Math.cos(Math.asin(sinDec));
    const cosW = (Math.sin(-0.833 * rad) - Math.sin(c.lat * rad) * sinDec) / (Math.cos(c.lat * rad) * cosDec);
    if (cosW < -1 || cosW > 1) return null;
    return new Date((transit + Math.acos(cosW) / rad / 360 - 2440587.5) * 86400000);
  }

  const clockEl = $("#mbClock");
  const sunsetEl = $("#mbSunset");
  function tick() {
    const now = new Date();
    const z = zoneParts(now);
    let day = "";
    try {
      day = new Intl.DateTimeFormat("en-GB", { timeZone: D.timezone, weekday: "short", day: "numeric", month: "short" }).format(now);
    } catch (e) {}
    clockEl.textContent = mqPhone.matches ? hm(z.h, z.m) : `${day.replace(",", "")}  ${hm(z.h, z.m)}`;
    clockEl.title = `Time in ${D.city || "my city"}`;
    const set = sunsetToday(z);
    if (set) {
      const sz = zoneParts(set);
      sunsetEl.innerHTML = `${G.sunset}<span>Sunset ${hm(sz.h, sz.m)}</span>`;
      sunsetEl.title = `Sunset today in ${D.city || "my city"}`;
      sunsetEl.hidden = false;
    }
  }

  const statusEl = $("#mbStatus");
  if (D.availability) {
    $("span", statusEl).textContent = D.availability;
    statusEl.title = D.availability;
    statusEl.hidden = false;
  }
  $("#mbName").textContent = firstName;

  /* ---------------- Toast ---------------- */

  const toastEl = $("#toast");
  let toastTimer = 0;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2200);
  }

  /* ---------------- Keyboard ---------------- */

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (!logoMenu.hidden) return closeMenu(true);
    const f = frontWin();
    const a = document.activeElement;
    if (f && (f.el.contains(a) || a === document.body || desktop.contains(a))) closeWin(f);
  });

  /* ---------------- Routing ---------------- */

  const ROUTES = {
    about: ["about", "about"],
    cv: ["about", "cv"],
    interests: ["about", "interests"],
    contact: ["mail"],
    mail: ["mail"],
    work: ["work"],
    photos: ["photos"],
    links: ["links"],
    trash: ["trash"],
    system: ["system"],
  };
  function route(hash) {
    const r = decodeURIComponent((hash || "").replace(/^#/, ""));
    if (!r) return false;
    if (projectMap[r]) return !!openWin("project", r, null);
    if (fileMap[r]) return !!openItem(r, null);
    const m = ROUTES[r];
    return m ? !!openWin(m[0], m[1], null) : false;
  }
  window.addEventListener("hashchange", () => route(location.hash));

  /* ---------------- Sample note ---------------- */

  const sticky = $("#sticky");
  if (D.sample && !store.get("kos-sticky-off", false)) {
    sticky.innerHTML = `<b>Note to self</b>These projects are samples. Swap them in <code>content.js</code>, then set <code>sample: false</code>.<button type="button" aria-label="Hide note">${G.x}</button>`;
    sticky.hidden = false;
    $("button", sticky).addEventListener("click", () => {
      sticky.hidden = true;
      store.set("kos-sticky-off", true);
    });
  }

  /* ---------------- Boot ---------------- */

  mhWord.textContent = firstName;
  const lines = (v) => (Array.isArray(v) ? v : v ? [v] : []).map((l) => `<span>${esc(l)}</span>`).join("");
  $("#coverL").innerHTML = lines(D.coverlines && D.coverlines.left);
  $("#coverR").innerHTML = lines(D.coverlines && D.coverlines.right);
  renderIcons();
  renderDock();

  let raf = 0;
  function relayout() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      layoutWall();
      placeIcons();
      tick();
      // Keep open windows on screen.
      if (!mqPhone.matches) {
        allWins().forEach((w) => {
          const el = w.el;
          if (w.zoomed) {
            w.zoomed = null;
            el.classList.remove("is-zoomed");
            placeWin(w, { w: el.offsetWidth, h: el.offsetHeight });
          }
          el.style.left = clamp(el.offsetLeft, 8 - el.offsetWidth + 120, os.clientWidth - 120) + "px";
          el.style.top = clamp(el.offsetTop, barH(), os.clientHeight - 60) + "px";
        });
      }
    });
  }

  layoutWall();
  placeIcons();
  tick();
  setInterval(tick, 15000);
  window.addEventListener("resize", relayout);
  mqPhone.addEventListener("change", relayout);
  if (document.fonts) {
    document.fonts.ready.then(relayout);
    document.fonts.load('800 100px "Fraunces"').then(relayout, () => {});
  }
  [wallBg, wallFg].forEach((img) => img.complete || img.addEventListener("load", relayout, { once: true }));

  if (!route(location.hash) && !mqPhone.matches && os.clientWidth >= 1100) {
    setTimeout(() => {
      if (!wins.size) openWin("about", "about", $('.dock-btn[data-app="about"]'));
    }, mqReduce.matches ? 0 : 900);
  }
  os.classList.remove("booting");
})();
