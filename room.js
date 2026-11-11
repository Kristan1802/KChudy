/*
 * The room: hotspots, the camera that zooms into things, and the three pages.
 * Content lives in content.js. Plain JavaScript, no build step.
 */
(() => {
  "use strict";

  const D = window.ROOM || {};
  const IMG_W = 2000;

  /* ---------------- Helpers ---------------- */

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const panMQ = matchMedia("(max-aspect-ratio: 5/4)");
  const fineMQ = matchMedia("(hover: hover) and (pointer: fine)");
  const slow = () => !reduce.matches;

  const app = $("#app");
  const room = $("#room");
  const cam = $("#cam");
  const stage = $("#stage");
  const fx = $("#fx");
  const spotsEl = $("#spots");
  const pageEls = { about: $("#page-about"), work: $("#page-work"), contact: $("#page-contact") };

  const name = D.name || "Me";
  const spots = D.spots || [];
  const spotMap = Object.fromEntries(spots.map((s) => [s.id, s]));
  const projects = D.projects || [];
  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p]));
  const PAGES = ["about", "work", "contact"];
  const TITLES = { about: "About", work: "Work", contact: "Contact" };
  const baseTitle = `${name} · ${(D.motto || "Design what excites").replace(/\.$/, "")}`;

  const G = {
    back: '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M12 7H2.6M6.4 2.8 2.2 7l4.2 4.2" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    ping: pixelArt(["ooooooooo", "oXXXXXXXo", ".oXXXXXo.", "..oXXXo..", "...oXo...", "....o...."], { o: "#3a2416", X: "#ffd08a" }),
    heart: pixelArt([".XX.XX.", "XXXXXXX", "XXXXXXX", ".XXXXX.", "..XXX..", "...X..."], { X: "currentColor" }),
  };

  /* ---------------- Heads-up ---------------- */

  $("#hudName").textContent = name;
  $("#hudRole").textContent = `${D.role || ""}${D.city ? `, ${D.city}` : ""}`;
  $("#clockTz").textContent = D.tz || "";

  const timeFmt = (opts) => {
    try {
      return new Intl.DateTimeFormat("en-US", { timeZone: D.timezone || undefined, ...opts });
    } catch (e) {
      return new Intl.DateTimeFormat("en-US", opts);
    }
  };
  const clockFmt = timeFmt({ hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
  const shortFmt = timeFmt({ hour: "numeric", minute: "2-digit", hour12: true });
  function tickClock() {
    const now = new Date();
    $("#clockTime").textContent = clockFmt.format(now);
    $$("[data-localtime]").forEach((el) => (el.textContent = shortFmt.format(now)));
  }
  tickClock();
  setInterval(tickClock, 1000);

  /* ---------------- Room effects ---------------- */

  const at = (x, y, w, h, cls, inner = "") =>
    `<div class="at ${cls}" style="--x:${x};--y:${y};--w:${w};--h:${h}">${inner}</div>`;

  function rng(seed) {
    return () => {
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const R = rng(1802);
  const inBox = (x, y, [bx, by, bw, bh]) => x >= bx && x <= bx + bw && y >= by && y <= by + bh;

  // Picture-pixel boxes, from assets/room.webp
  const SKY = [
    [716, 8, 456, 128],
    [1222, 8, 494, 162],
  ];
  const SKY_AVOID = [
    [826, 120, 58, 70], // bridge tower tip
    [1505, 36, 96, 90], // moon
    [1340, 150, 60, 40],
  ];
  const CITY = [
    [1226, 262, 210, 110],
    [1648, 250, 66, 130],
    [1236, 430, 200, 110],
    [1652, 440, 66, 100],
    [722, 508, 440, 40],
  ];

  function stars(n) {
    let out = "";
    let made = 0;
    let guard = 0;
    while (made < n && guard++ < 500) {
      const box = SKY[R() < 0.45 ? 0 : 1];
      const x = box[0] + R() * box[2];
      const y = box[1] + R() * box[3];
      if (SKY_AVOID.some((a) => inBox(x, y, a))) continue;
      const s = (2 + R() * 2.4).toFixed(1);
      out += `<i class="fx-star" style="left:calc(${x.toFixed(0)} * var(--u));top:calc(${y.toFixed(0)} * var(--u));--s:${s};--d:${(2.6 + R() * 4).toFixed(2)}s;--delay:-${(R() * 6).toFixed(2)}s"></i>`;
      made++;
    }
    return out;
  }
  function cityLights(n) {
    let out = "";
    for (let i = 0; i < n; i++) {
      const box = CITY[i % CITY.length];
      const x = box[0] + R() * box[2];
      const y = box[1] + R() * box[3];
      out += `<i class="fx-light" style="left:calc(${x.toFixed(0)} * var(--u));top:calc(${y.toFixed(0)} * var(--u));--d:${(6 + R() * 9).toFixed(2)}s;--delay:-${(R() * 12).toFixed(2)}s"></i>`;
    }
    return out;
  }

  fx.innerHTML = [
    at(708, 128, 472, 248, "crop fx-bridge"),
    at(708, 372, 472, 132, "crop feather-rect fx-water"),
    at(1470, -10, 170, 170, "fx-moon"),
    stars(30),
    cityLights(16),
    at(716, 0, 460, 150, "fx-sky", ""),
    at(1218, 0, 500, 214, "fx-sky", ""),
    at(140, 128, 470, 330, "crop feather fx-neon-off"),
    at(150, 140, 450, 300, "fx-neon-glow"),
    at(310, 388, 370, 350, "crop feather fx-lamp-off"),
    at(392, 372, 240, 240, "fx-lamp-glow"),
    at(322, 470, 118, 118, "fx-lantern"),
    at(436, 506, 54, 80, "fx-steam", "<i></i><i></i><i></i>"),
    at(28, 926, 296, 156, "crop feather fx-cat"),
    at(290, 950, 1, 1, "fx-zzz", "<b>z</b><b>z</b><b>Z</b>"),
  ].join("");

  const skies = $$(".fx-sky", fx);
  const zzz = $(".fx-zzz", fx);

  // Shooting stars
  let meteorTimer = 0;
  function shoot(which) {
    if (reduce.matches || document.hidden) return;
    const sky = skies[which ?? (R() < 0.35 ? 0 : 1)];
    if (!sky) return;
    const u = cam.offsetWidth / IMG_W;
    const w = sky.offsetWidth / u;
    const h = sky.offsetHeight / u;
    const len = 120 + R() * 90;
    const sx = (0.45 + R() * 0.5) * w;
    const sy = R() * 0.3 * h;
    const dist = 260 + R() * 160;
    const ang = -22 - R() * 10; // the tail points up and to the right
    const rad = (ang * Math.PI) / 180;
    const dx = -Math.cos(rad) * dist;
    const dy = -Math.sin(rad) * dist;
    const m = document.createElement("i");
    m.className = "fx-meteor";
    m.style.setProperty("--len", len.toFixed(0));
    sky.appendChild(m);
    const p = (x, y, s) => `translate(${(x * u).toFixed(1)}px, ${(y * u).toFixed(1)}px) rotate(${ang}deg) scaleX(${s})`;
    const anim = m.animate(
      [
        { transform: p(sx, sy, 0.2), opacity: 0 },
        { transform: p(sx + dx * 0.15, sy + dy * 0.15, 0.9), opacity: 1, offset: 0.18 },
        { transform: p(sx + dx, sy + dy, 0.5), opacity: 0 },
      ],
      { duration: 1000 + R() * 400, easing: "cubic-bezier(.3,.1,.6,1)" }
    );
    anim.onfinish = () => m.remove();
  }
  function scheduleMeteor() {
    clearTimeout(meteorTimer);
    meteorTimer = setTimeout(() => {
      if (!state.page) shoot();
      scheduleMeteor();
    }, 7000 + R() * 9000);
  }

  /* ---------------- Hotspots ---------------- */

  spotsEl.innerHTML = spots
    .map((s) => {
      const label = `${s.tip}${s.go ? `. Opens ${TITLES[s.go] || s.go}.` : ""}`;
      return `<button class="spot at${s.primary ? " primary" : ""}${s.place === "below" ? " tip-below" : ""}" type="button" data-spot="${esc(s.id)}"
        style="--x:${s.x};--y:${s.y};--w:${s.w};--h:${s.h}" aria-label="${esc(label)}">
        <span class="spot-frame" aria-hidden="true"></span>
        ${s.primary ? `<span class="spot-ping" aria-hidden="true">${G.ping}</span>` : ""}
        <span class="spot-tip" aria-hidden="true">${tipHTML(s.tip, s.go)}</span>
      </button>`;
    })
    .join("");

  function tipHTML(text, go) {
    return `${esc(text)}${go ? " <i>→</i>" : ""}`;
  }
  function setTip(btn, text) {
    const s = spotMap[btn.dataset.spot];
    $(".spot-tip", btn).innerHTML = tipHTML(text, s && s.go);
    btn.setAttribute("aria-label", text);
    placeTip(btn);
  }

  // Keep labels on screen and clear of the name and clock at the top.
  function placeTip(btn) {
    const tip = $(".spot-tip", btn);
    if (!tip) return;
    const r = btn.getBoundingClientRect();
    const vw = innerWidth;
    const left = Math.max(r.left, 0);
    const right = Math.min(r.right, vw);
    const visibleMid = (left + right) / 2;
    const tw = tip.offsetWidth;
    const want = visibleMid - tw / 2;
    const shift = clamp(want, 12, vw - 12 - tw) - want + (visibleMid - (r.left + r.width / 2));
    tip.style.setProperty("--nudge", `${shift.toFixed(1)}px`);
    const s = spotMap[btn.dataset.spot] || {};
    const th = tip.offsetHeight + 20;
    let below = s.place === "below";
    if (!below && r.top - th < 64) below = true;
    if (below && r.bottom + th > innerHeight - 80) below = false;
    btn.classList.toggle("tip-below", below);
  }

  let tipTimer = 0;
  function flashTip(btn, ms = 2400) {
    $$(".spot.is-tipped", spotsEl).forEach((b) => b !== btn && b.classList.remove("is-tipped"));
    placeTip(btn);
    btn.classList.add("is-tipped");
    clearTimeout(tipTimer);
    tipTimer = setTimeout(() => btn.classList.remove("is-tipped"), ms);
  }

  spotsEl.addEventListener("pointerover", (e) => {
    const btn = e.target.closest(".spot");
    if (btn && e.pointerType === "mouse") placeTip(btn);
  });
  spotsEl.addEventListener("focusin", (e) => {
    const btn = e.target.closest(".spot");
    if (btn) placeTip(btn);
  });

  let lastSpot = null;
  let lastPointer = "mouse";
  spotsEl.addEventListener("pointerdown", (e) => (lastPointer = e.pointerType));
  spotsEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".spot");
    if (!btn) return;
    const s = spotMap[btn.dataset.spot];
    if (!s) return;
    hideHint();
    lastSpot = btn;
    if (s.go) {
      go(s.go, s.id);
      return;
    }
    const act = ACTIONS[s.action];
    if (act) act(btn, s);
    if (lastPointer !== "mouse" || e.detail === 0 || act) flashTip(btn);
  });

  const ACTIONS = {
    neon(btn, s) {
      const off = app.classList.toggle("neon-off");
      setTip(btn, off ? "Okay, okay. Switch it back on" : s.tip);
    },
    lamp(btn, s) {
      const off = app.classList.toggle("lamp-off");
      setTip(btn, off ? "Lights back on?" : s.tip);
    },
    cat(btn) {
      const h = document.createElement("span");
      h.className = "fx-heart";
      h.innerHTML = G.heart;
      zzz.appendChild(h);
      setTimeout(() => h.remove(), 1700);
      setTip(btn, ["Prrr… still asleep", "One ear moved. That's a yes", "Do not disturb. Seriously"][catPets++ % 3]);
    },
    moon(btn) {
      shoot(1);
      setTimeout(() => shoot(1), 500);
      setTip(btn, "Make a wish ✦");
      setTimeout(() => setTip(btn, spotMap.moon.tip), 3000);
    },
  };
  let catPets = 0;

  /* ---------------- Camera ---------------- */

  // Drift: the camera leans towards the pointer, which also lets wide pictures be looked around.
  const drift = { tx: 0, ty: 0, x: 0, y: 0, px: 0, py: 0, raf: 0, on: true };
  const curve = (n) => Math.sign(n) * Math.pow(Math.abs(n), 1.4);
  function driftRange() {
    return [Math.max(0, (cam.offsetWidth - innerWidth) / 2), Math.max(0, (cam.offsetHeight - innerHeight) / 2)];
  }
  function driftTick() {
    drift.x += (drift.tx - drift.x) * 0.055;
    drift.y += (drift.ty - drift.y) * 0.055;
    const [mx, my] = driftRange();
    drift.px = drift.x * mx;
    drift.py = drift.y * my;
    stage.style.transform = `translate3d(${drift.px.toFixed(2)}px, ${drift.py.toFixed(2)}px, 0)`;
    if (Math.abs(drift.tx - drift.x) + Math.abs(drift.ty - drift.y) > 0.0005) drift.raf = requestAnimationFrame(driftTick);
    else drift.raf = 0;
  }
  function driftTo(tx, ty) {
    if (!drift.on || panMQ.matches || reduce.matches) return;
    drift.tx = tx;
    drift.ty = ty;
    if (!drift.raf) drift.raf = requestAnimationFrame(driftTick);
  }
  function resetDrift() {
    cancelAnimationFrame(drift.raf);
    drift.raf = 0;
    Object.assign(drift, { tx: 0, ty: 0, x: 0, y: 0, px: 0, py: 0 });
    stage.style.transform = "";
  }
  room.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    driftTo(-curve((e.clientX / innerWidth) * 2 - 1), -curve((e.clientY / innerHeight) * 2 - 1));
  });
  document.addEventListener("pointerleave", () => driftTo(0, 0));

  // Narrow screens: the room scrolls sideways. Start with the desk in view.
  const PAN_FOCUS = 600;
  function centerPan() {
    if (!panMQ.matches) return;
    const u = cam.offsetWidth / IMG_W;
    room.scrollLeft = PAN_FOCUS * u - innerWidth / 2;
  }
  room.addEventListener(
    "wheel",
    (e) => {
      if (!panMQ.matches || state.page) return;
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        room.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    },
    { passive: false }
  );

  function zoomTransform(s) {
    const u = cam.offsetWidth / IMG_W;
    const vw = innerWidth;
    const vh = innerHeight;
    const camLeft = cam.offsetLeft - room.scrollLeft;
    const camTop = cam.offsetTop - room.scrollTop;
    const cx = (s.x + s.w / 2) * u + drift.px;
    const cy = (s.y + s.h / 2) * u + drift.py;
    const k = clamp(Math.min((vw * 0.42) / (s.w * u), (vh * 0.42) / (s.h * u)), 1.8, 5);
    return `translate3d(${(vw / 2 - camLeft - k * cx).toFixed(1)}px, ${(vh / 2 - camTop - k * cy).toFixed(1)}px, 0) scale(${k.toFixed(3)})`;
  }
  let zoomSpot = null;
  function zoomInto(s, instant) {
    zoomSpot = s;
    if (instant) cam.style.transition = "none";
    cam.style.transform = zoomTransform(s);
    if (instant) {
      void cam.offsetWidth;
      cam.style.transition = "";
    }
  }
  function zoomOut() {
    zoomSpot = null;
    cam.style.transform = "";
  }

  /* ---------------- Pages: About ---------------- */

  const ARROW_R = '<svg class="arrow arrow-r" viewBox="0 0 170 74" aria-hidden="true"><path d="M6 10c14 30 44 50 86 50 22 0 40-6 62-18"/><path d="M134 30l22 11-18 17"/></svg>';
  const ARROW_D = '<svg class="arrow arrow-d" viewBox="0 0 92 104" aria-hidden="true"><path d="M10 6c40 8 62 34 54 86"/><path d="M48 78l16 18 14-20"/></svg>';
  const ROAD =
    '<svg class="road-svg" viewBox="0 0 40 100" preserveAspectRatio="none" aria-hidden="true">' +
    '<path d="M20 0C32 8 32 17 20 25S8 42 20 50S32 67 20 75S8 92 20 100" fill="none" stroke="#3d3631" stroke-width="13" stroke-linecap="round" vector-effect="non-scaling-stroke"/>' +
    '<path d="M20 0C32 8 32 17 20 25S8 42 20 50S32 67 20 75S8 92 20 100" fill="none" stroke="#f3e9d8" stroke-width="1.6" stroke-dasharray="7 7" vector-effect="non-scaling-stroke"/></svg>';

  function roomCrop(c) {
    if (!c) return "";
    const W = 2000;
    const H = 1125;
    const size = `${((W / c.w) * 100).toFixed(3)}% auto`;
    const pos = `${((c.x / (W - c.w)) * 100).toFixed(3)}% ${((c.y / (H - c.h)) * 100).toFixed(3)}%`;
    return `<figure class="me-crop" style="aspect-ratio:${c.w}/${c.h};background-size:${size};background-position:${pos}" role="img" aria-label="${esc(c.caption || "")}"></figure>
      ${c.caption ? `<p class="me-cap">${esc(c.caption)}</p>` : ""}`;
  }

  function renderAbout() {
    const A = D.about || {};
    let i = 0;
    const pin = (c = "") => `<span class="pin ${c}" aria-hidden="true"></span>`;
    const tape = (c = "") => `<span class="tape ${c}" aria-hidden="true"></span>`;
    const item = (cls, r, inner, tag = "div", extra = "") =>
      `<${tag} class="pinned drag ${cls}" style="--r:${r}deg;--i:${i++}" ${extra}>${inner}</${tag}>`;
    const exp = (A.experience || [])
      .map(
        (e) => `<li>
          <span class="road-years">${esc(e.years)}${/now/i.test(e.years) ? "<em>now</em>" : ""}</span>
          <strong>${esc(e.company)}</strong>
          <span class="road-role">${esc(e.role)}${e.where ? ` · ${esc(e.where)}` : ""}</span>
          ${e.note ? `<span class="road-note">${esc(e.note)}</span>` : ""}
        </li>`
      )
      .join("");
    const noteColors = ["yellow", "pink", "blue", "orange"];
    const notes = (A.interests || [])
      .map((n, k) =>
        item(`sticky ${noteColors[k % 4]}`, [-3, 2.5, 1.5, -2][k % 4], `${pin(["blue", "", "yellow", "green"][k % 4])}<h3>${esc(n.title)}</h3><p>${esc(n.text)}</p>`)
      )
      .join("");
    const stickerColors = ["#ffd08a", "#b9f15e", "#a6d8f5", "#ec9fe0", "#ffb27a", "#fffaf0"];
    const stickers = (A.toolkit || [])
      .map((t, k) => `<span class="sticker" style="--bg:${stickerColors[k % stickerColors.length]};--r:${[-4, 3, -2, 5, -3, 2][k % 6]}deg">${esc(t)}</span>`)
      .join("");
    const pinColors = ["", "blue", "yellow", "green"];
    const polas = (A.polaroids || [])
      .map((p, k) =>
        item(
          "paper polaroid",
          [3, -4, 2.5, -2][k % 4],
          `${pin(pinColors[k % 4])}<img src="${esc(p.src)}" alt="${esc(p.alt || "")}" loading="lazy" decoding="async"><figcaption>${esc(p.caption || "")}</figcaption>`,
          "figure"
        )
      )
      .join("");
    const now = (A.currently || []).map((c) => `<dt>${esc(c.label)}</dt><dd>${esc(c.value)}</dd>`).join("");

    pageEls.about.innerHTML = `
      <button class="back" type="button" data-back>${G.back}back to the room</button>
      <div class="board">
        <div class="board-frame">
          <h1 class="sr-only" id="aboutTitle" tabindex="-1">About ${esc(name)}</h1>
          <div class="board-grid">
            <div class="col col-a">
              ${item(
                "paper strip",
                -0.6,
                `${pin()}<h2>I've worked with…</h2><ol class="road">${ROAD}${exp}</ol>`,
                "article"
              )}
            </div>
            <div class="col col-b">
              <p class="chalk" style="rotate:-2deg">This is the official way<br>to explain myself.</p>
              ${ARROW_R}
              ${item("sticky green sticky-hello", -4, `${tape()}${tape("r")}<p>${esc(A.hello || `Hi, I'm ${name}!`)}</p>`)}
              <p class="chalk" style="rotate:1.5deg">And this is how<br>I'd explain myself.</p>
              ${ARROW_D}
              <div class="notes">${notes}</div>
            </div>
            <div class="col col-c">
              ${item("paper card", 1.2, `${pin("green")}<p class="typed">${esc(A.intro || "")}</p>${roomCrop(A.roomCrop)}`, "article")}
              ${(A.canDo || []).length ? item("index", -1.5, `${pin("blue")}<h3>Things I can do</h3><ul>${A.canDo.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>`, "article") : ""}
              ${stickers ? `<div class="stickers" aria-label="Toolkit">${stickers}</div>` : ""}
            </div>
            <div class="col col-d">
              ${polas}
              ${now ? item("paper currently", -2, `${pin("yellow")}<h3>Currently</h3><dl>${now}</dl>`, "article") : ""}
              ${D.resume ? item("paper resume", 3, `${pin()}Download my CV ↓`, "a", `href="${esc(D.resume)}" download`) : ""}
            </div>
          </div>
        </div>
      </div>`;
  }

  // Notes on the corkboard can be moved around with a mouse.
  function enableBoardDrag() {
    const board = $(".board-grid", pageEls.about);
    if (!board) return;
    let drag = null;
    board.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse" || e.button !== 0 || innerWidth < 1180) return;
      const el = e.target.closest(".pinned.drag");
      if (!el || e.target.closest("a, button")) return;
      const dx = parseFloat(el.style.getPropertyValue("--dx")) || 0;
      const dy = parseFloat(el.style.getPropertyValue("--dy")) || 0;
      drag = { el, sx: e.clientX - dx, sy: e.clientY - dy };
      el.classList.add("is-dragging");
      el.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    board.addEventListener("pointermove", (e) => {
      if (!drag) return;
      drag.el.style.setProperty("--dx", `${e.clientX - drag.sx}px`);
      drag.el.style.setProperty("--dy", `${e.clientY - drag.sy}px`);
    });
    const end = () => {
      if (!drag) return;
      drag.el.classList.remove("is-dragging");
      drag = null;
    };
    board.addEventListener("pointerup", end);
    board.addEventListener("pointercancel", end);
  }

  /* ---------------- Pages: Work ---------------- */

  const C = { sun: "#f2a03d", ox: "#5a2722", blue: "#93b6d6", cream: "#f3ece2", ink: "#1c1613" };
  let uid = 0;
  function art(kind, bg, label, decorative) {
    const k = ++uid;
    const a11y = decorative ? 'aria-hidden="true" focusable="false"' : `role="img" aria-label="${esc(label)}"`;
    const wrap = (inner) =>
      `<svg viewBox="0 0 100 75" preserveAspectRatio="xMidYMid slice" ${a11y}><rect x="-20" y="-20" width="140" height="140" fill="${bg}"/><g transform="translate(0 -12.5)">${inner}</g></svg>`;
    switch (kind) {
      case "phone":
        return wrap(`
          <circle cx="81" cy="27" r="12" fill="${C.sun}"/>
          <rect x="29" y="15" width="42" height="83" rx="7" fill="${C.cream}"/>
          <rect x="44" y="18.5" width="12" height="2.4" rx="1.2" fill="${bg}" opacity=".25"/>
          <text x="35" y="31" class="cv-type" font-size="6.2" font-weight="700" fill="${bg}">Verify ID</text>
          <rect x="35" y="35" width="30" height="20" rx="3" fill="none" stroke="${bg}" stroke-width="1.4" stroke-dasharray="3 2"/>
          <circle cx="42" cy="45" r="3.8" fill="${bg}" opacity=".35"/>
          <rect x="48" y="42" width="13" height="2.2" rx="1.1" fill="${bg}" opacity=".45"/>
          <rect x="48" y="46.5" width="9" height="2.2" rx="1.1" fill="${bg}" opacity=".3"/>
          <circle cx="50" cy="67" r="6.5" fill="${C.sun}"/>
          <path d="M46.8 67.2l2.2 2.2 4.2-4.6" stroke="#fff" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          <rect x="35" y="79" width="30" height="2.6" rx="1.3" fill="${bg}" opacity=".15"/>
          <rect x="35" y="79" width="21" height="2.6" rx="1.3" fill="${bg}"/>`);
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
        const cards = [26, 47, 68]
          .map(
            (y, i) => `<rect x="33" y="${y}" width="34" height="17" rx="3" fill="#fff"/>
              <circle cx="40.5" cy="${y + 8.5}" r="4.8" fill="${dots[i]}"/>
              <rect x="48" y="${y + 4.5}" width="15" height="2.4" rx="1.2" fill="${C.ink}" opacity=".7"/>
              <rect x="48" y="${y + 9.5}" width="10" height="2" rx="1" fill="${C.ink}" opacity=".3"/>
              ${i === 1 ? `<rect x="56" y="${y + 9}" width="9" height="4.4" rx="2.2" fill="${bg}"/>` : ""}`
          )
          .join("");
        return wrap(`
          <rect x="28" y="12" width="44" height="85" rx="7" fill="${C.cream}"/>
          <text x="33" y="22" class="cv-type" font-size="5.6" font-weight="700" fill="${C.ink}">This week</text>
          ${cards}`);
      }
      case "nets": {
        const booked = new Set([1, 4, 6, 9, 10, 13, 17]);
        let cells = "";
        for (let r = 0; r < 5; r++)
          for (let c = 0; c < 4; c++) {
            const i = r * 4 + c;
            cells += `<rect x="${12 + c * 15}" y="${22 + r * 12}" width="12" height="9" rx="1.6" fill="${booked.has(i) ? C.sun : C.cream}" opacity="${booked.has(i) ? 1 : 0.28}"/>`;
          }
        return wrap(`
          ${cells}
          <circle cx="78" cy="66" r="15" fill="${C.ox}"/>
          <path d="M68.5 54.5c6.5 6.5 6.5 16.5 0 23M87.5 54.5c-6.5 6.5-6.5 16.5 0 23" stroke="${C.cream}" stroke-width="1.1" fill="none" stroke-dasharray="1.6 1.6"/>`);
      }
      case "stripes": {
        let y = -10;
        let bands = "";
        const seq = [
          [C.ox, 8],
          [C.cream, 3],
          [C.blue, 5],
          [C.cream, 3],
        ];
        while (y < 110) for (const [col, h] of seq) (bands += `<rect x="-20" y="${y}" width="140" height="${h}" fill="${col}"/>`), (y += h);
        return wrap(`${bands}
          <text x="50" y="84" text-anchor="middle" class="cv-type" font-size="80" font-weight="700" fill="${C.cream}" stroke="${C.ox}" stroke-width="3" paint-order="stroke">${esc(name[0] || "K")}</text>`);
      }
      case "chai":
        return wrap(`
          <circle cx="50" cy="50" r="33" fill="${C.cream}"/>
          <circle cx="50" cy="50" r="29" fill="none" stroke="${C.ox}" stroke-width=".9"/>
          <path id="cp${k}" d="M50 50m-23 0a23 23 0 1 1 46 0a23 23 0 1 1-46 0" fill="none"/>
          <text class="cv-mono" font-size="5.4" letter-spacing="1" fill="${C.ox}"><textPath href="#cp${k}">CHAI CLUB · ${esc((D.city || "").toUpperCase())} · EST. 2025 ·</textPath></text>
          <path d="M40.5 45h19v6.5a9.5 9.5 0 0 1-19 0z" fill="${C.ox}"/>
          <path d="M59.5 47.2h2.3a3.6 3.6 0 0 1 0 7.2h-3" stroke="${C.ox}" stroke-width="2" fill="none"/>
          <path d="M45 41c-1.6-2.2 1.6-3.2 0-5.4M50 41c-1.6-2.2 1.6-3.2 0-5.4M55 41c-1.6-2.2 1.6-3.2 0-5.4" stroke="${C.ox}" stroke-width="1.3" fill="none" stroke-linecap="round"/>`);
      case "monsoon": {
        let rain = "";
        for (let i = 0; i < 18; i++) {
          const x = -20 + i * 8;
          rain += `<line x1="${x}" y1="0" x2="${x + 26}" y2="110" stroke="${C.blue}" stroke-width=".9" stroke-opacity="${0.25 + (i % 3) * 0.17}" stroke-dasharray="${7 + (i % 4) * 2} ${5 + (i % 3) * 3}" stroke-dashoffset="${i * 3}"/>`;
        }
        return wrap(`${rain}
          <circle cx="80" cy="30" r="10" fill="${C.sun}" opacity=".18"/><circle cx="80" cy="30" r="3.2" fill="${C.sun}"/>
          <text x="9" y="78" class="cv-type" font-style="italic" font-size="19" font-weight="500" fill="${C.cream}">Monsoon</text>
          <text x="10" y="86" class="cv-mono" font-size="4.4" letter-spacing=".8" fill="${C.blue}">IRA MENON · EP · 4 TRACKS</text>`);
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

  const GROUPS = [
    ["all", "All"],
    ["product", "Product"],
    ["visual", "Visual"],
    ["personal", "Personal"],
  ];

  function renderWork() {
    const count = (g) => (g === "all" ? projects.length : projects.filter((p) => p.group === g).length);
    const chips = GROUPS.filter(([g]) => count(g))
      .map(([g, label]) => `<button class="chip" type="button" data-group="${g}" aria-pressed="${g === "all"}">${label}<span>${count(g)}</span></button>`)
      .join("");
    const cards = projects
      .map(
        (p) => `<li data-group="${esc(p.group || "")}">
          <a class="pcard" href="#work/${esc(p.id)}">
            <div class="pcard-cover">${cover(p, true)}</div>
            <p class="pcard-meta"><span>${esc(p.kind)}</span><span>${esc(p.year)}</span></p>
            <h2>${esc(p.name)}</h2>
            <p>${esc(p.summary)}</p>
          </a>
        </li>`
      )
      .join("");
    pageEls.work.innerHTML = `
      <button class="back" type="button" data-back>${G.back}close the laptop</button>
      <div class="screen">
        <p class="screen-path" aria-hidden="true">~/${esc(name.toLowerCase())}/work</p>
        <div class="work-list" id="workList">
          <header class="work-head">
            <p class="eyebrow">On the laptop · ${projects.length} projects</p>
            <h1 id="workTitle" tabindex="-1">Work that <em>excites</em> me.</h1>
            <p class="lede">Product work for fintech, field teams and food startups, plus the identity, cover and photo projects I make on the side. Open any one for the full story.</p>
            <div class="chips" role="group" aria-label="Filter projects">${chips}</div>
          </header>
          <ul class="cards">${cards}</ul>
        </div>
        <article class="case" id="workCase" hidden></article>
      </div>`;

    $(".chips", pageEls.work).addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      const g = chip.dataset.group;
      $$(".chip", pageEls.work).forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
      $$(".cards li", pageEls.work).forEach((li) => (li.hidden = g !== "all" && li.dataset.group !== g));
    });
  }

  function caseHTML(p) {
    const n = projects.length;
    const idx = projects.indexOf(p);
    const prev = projects[(idx - 1 + n) % n];
    const next = projects[(idx + 1) % n];
    const facts = [
      ["Role", p.role],
      ["Team", p.team],
      ["Timeline", p.timeline],
      ["Type", (p.type || []).join(", ")],
    ].filter(([, v]) => v);
    return `
      <a class="case-back" href="#work">← All work</a>
      <p class="eyebrow">${[p.client, p.kind, p.year].filter(Boolean).map(esc).join(" · ")}</p>
      <h1 id="caseTitle" tabindex="-1">${esc(p.name)}</h1>
      <p class="case-lede">${esc(p.summary)}</p>
      <div class="case-cover">${cover(p, false)}</div>
      ${facts.length ? `<dl class="facts">${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>` : ""}
      ${p.problem ? `<section class="case-sec"><h2>The problem</h2><p class="case-big">${esc(p.problem)}</p></section>` : ""}
      ${
        (p.steps || []).length
          ? `<section class="case-sec"><h2>What I did</h2><ol class="steps">${p.steps
              .map((s, i) => `<li><span class="step-n">${String(i + 1).padStart(2, "0")}</span><div><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></div></li>`)
              .join("")}</ol></section>`
          : ""
      }
      ${
        (p.results || []).length
          ? `<section class="case-sec"><h2>What changed</h2><ul class="results">${p.results.map((r) => `<li><b>${esc(r.value)}</b><span>${esc(r.label)}</span></li>`).join("")}</ul></section>`
          : ""
      }
      ${
        (p.gallery || []).length
          ? `<section class="case-sec"><h2>From the series</h2><div class="gallery">${p.gallery
              .map((g) => `<img src="${esc(g.src)}" alt="${esc(g.alt || "")}" loading="lazy" decoding="async">`)
              .join("")}</div></section>`
          : ""
      }
      ${
        (p.links || []).length
          ? `<p class="case-links">${p.links.map((l) => `<a class="link-btn" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join("")}</p>`
          : ""
      }
      ${
        n > 1
          ? `<nav class="case-nav" aria-label="More projects">
              <a href="#work/${esc(prev.id)}"><span>← Previous</span>${esc(prev.name)}</a>
              <a href="#work/${esc(next.id)}"><span>Next →</span>${esc(next.name)}</a>
            </nav>`
          : ""
      }`;
  }

  let listScroll = 0;
  function setCase(id, focus) {
    const list = $("#workList");
    const box = $("#workCase");
    const p = projectMap[id];
    if (p) {
      if (!list.hidden) listScroll = pageEls.work.scrollTop;
      box.innerHTML = caseHTML(p);
      box.hidden = false;
      list.hidden = true;
      pageEls.work.scrollTop = 0;
      if (focus) $("#caseTitle").focus({ preventScroll: true });
    } else {
      const wasCase = !box.hidden;
      box.hidden = true;
      box.innerHTML = "";
      list.hidden = false;
      pageEls.work.scrollTop = wasCase ? listScroll : 0;
      if (focus && wasCase) $("#workTitle").focus({ preventScroll: true });
    }
    state.sub = p ? id : null;
    setTitle();
  }

  /* ---------------- Pages: Contact ---------------- */

  function pixelArt(rows, colors) {
    let rects = "";
    rows.forEach((row, y) => {
      let x = 0;
      while (x < row.length) {
        const ch = row[x];
        let run = 1;
        while (row[x + run] === ch) run++;
        if (colors[ch]) rects += `<rect x="${x}" y="${y}" width="${run}" height="1" fill="${colors[ch]}"/>`;
        x += run;
      }
    });
    return `<svg viewBox="0 0 ${rows[0].length} ${rows.length}" aria-hidden="true">${rects}</svg>`;
  }
  const MUG = pixelArt(
    [
      "...ooooooooooooooo......",
      "..occcccccccccccccco....",
      "..obbbbbbbbbbbbbbbbo....",
      "..owwwwwwwwwwwwwwwwoooo.",
      "..owwwwwwwwwwwwwwwwo..oo",
      "..orrrrrrrrrrrrrrrro...o",
      "..owwwwwwwwwwwwwwwwo...o",
      "..owwwwwwwwwwwwwwwwo...o",
      "..orrrrrrrrrrrrrrrro..oo",
      "..owwwwwwwwwwwwwwwwoooo.",
      "..owwwwwwwwwwwwwwwwo....",
      "..osswwwwwwwwwwwwsso....",
      "...ossssssssssssso......",
      "oooooooooooooooooooooo..",
      ".odddddddddddddddddddo..",
      "..oooooooooooooooooo....",
    ],
    { o: "#3a2416", c: "#fff6e6", b: "#9a5a2a", w: "#f1e6d2", r: "#c0582f", s: "#d8c7ab", d: "#e9dcc4" }
  );

  function renderContact() {
    const K = D.contact || {};
    const socials = (D.socials || [])
      .map(
        (s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener"><span>${esc(s.label)}</span><span>${esc(s.handle)} ↗</span></a></li>`
      )
      .join("");
    pageEls.contact.innerHTML = `
      <button class="back" type="button" data-back>${G.back}back to the room</button>
      <div class="desk">
        <div class="desk-inner">
          <article class="letter">
            <span class="tape" aria-hidden="true"></span>
            <div class="mug" aria-hidden="true">${MUG}<span class="mug-steam"><i></i><i></i><i></i></span></div>
            <h1 id="contactTitle" tabindex="-1">${esc(K.heading || "Say hi.")}</h1>
            <p class="letter-text">${esc(K.text || "")}</p>
            ${D.availability ? `<p class="status"><i aria-hidden="true"></i>${esc(D.availability)}</p>` : ""}
            ${D.email ? `<a class="mail" href="mailto:${esc(D.email)}">${esc(D.email)}</a>` : ""}
            <div class="btn-row">
              ${D.email ? `<a class="btn" href="mailto:${esc(D.email)}">Write to me</a>` : ""}
              ${D.email ? `<button class="btn ghost" type="button" data-copy="${esc(D.email)}">Copy address</button>` : ""}
              ${D.resume ? `<a class="btn ghost" href="${esc(D.resume)}" download>Download CV</a>` : ""}
            </div>
            <p class="letter-foot">It's <span data-localtime></span> in ${esc(D.city || "my city")}. ${esc(K.reply || "")}</p>
            <p class="sign">— ${esc(name)}</p>
          </article>
          <div class="receipt-wrap">
            <aside class="receipt" aria-label="Where else to find me">
              <p class="r-head">${esc(name)}'s chai stall<small>${esc(D.city || "")} · table 1</small></p>
              <p class="r-sep" aria-hidden="true"></p>
              <p class="r-row"><span>1 × cutting chai</span><span>on me</span></p>
              <p class="r-row"><span>1 × good chat</span><span>free</span></p>
              <p class="r-sep" aria-hidden="true"></p>
              ${socials ? `<p class="r-label">Find me at</p><ul class="r-links">${socials}</ul><p class="r-sep" aria-hidden="true"></p>` : ""}
              <p class="r-row r-total"><span>Total</span><span>₹0.00</span></p>
              <p class="r-thanks">Thank you. Visit again!</p>
              <div class="r-barcode" aria-hidden="true"></div>
            </aside>
          </div>
        </div>
      </div>`;
    tickClock();
  }

  /* ---------------- Router and transitions ---------------- */

  const state = { page: null, sub: null };
  let busy = false;
  let queued = null;

  function parse(hash = location.hash) {
    let r = hash.replace(/^#\/?/, "");
    try {
      r = decodeURIComponent(r);
    } catch (e) {}
    const [page, sub] = r.split("/");
    if (!PAGES.includes(page)) return { page: null, sub: null };
    return { page, sub: page === "work" && projectMap[sub] ? sub : null };
  }

  function setTitle() {
    if (!state.page) document.title = baseTitle;
    else if (state.sub) document.title = `${projectMap[state.sub].name} · ${name}`;
    else document.title = `${TITLES[state.page]} · ${name}`;
  }
  function setNav(page) {
    $$(".dock a").forEach((a) => {
      if (a.dataset.nav === page) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  async function openPage(page, sub, spotId, instant) {
    const s = spotMap[spotId] || spotMap[(D.zoomTo || {})[page]];
    state.page = page;
    setNav(page);
    app.classList.add("page-open", "is-zooming");
    room.inert = true;
    drift.on = false;
    cancelAnimationFrame(drift.raf);
    drift.raf = 0;
    hideHint();
    $$(".spot.is-tipped").forEach((b) => b.classList.remove("is-tipped"));
    const primary = spotMap[(D.zoomTo || {})[page]];
    if (primary) $(`.spot[data-spot="${primary.id}"]`)?.classList.add("is-seen");

    const fast = instant || !slow();
    if (s && slow()) zoomInto(s, instant);
    if (!fast) {
      await wait(560);
      app.classList.add("is-blurred");
      await wait(330);
    } else app.classList.add("is-blurred");

    const el = pageEls[page];
    if (page === "work") setCase(sub, false);
    el.hidden = false;
    el.scrollTop = 0;
    void el.offsetWidth;
    el.classList.add("is-in");
    setTitle();
    const heading = page === "work" && sub ? $("#caseTitle") : $(`#${page}Title`);
    heading?.focus({ preventScroll: true });
    await wait(fast ? 60 : 500);
    app.classList.add("page-shown");
  }

  async function closePage(goingTo) {
    const el = pageEls[state.page];
    app.classList.remove("page-shown");
    el.classList.remove("is-in");
    el.classList.add("is-out");
    await wait(slow() ? 240 : 0);
    app.classList.remove("is-blurred");
    zoomOut();
    await wait(slow() ? 140 : 0);
    el.hidden = true;
    el.classList.remove("is-out");
    state.page = null;
    state.sub = null;
    setTitle();
    if (goingTo) {
      await wait(slow() ? 520 : 0);
      return;
    }
    setNav(null);
    room.inert = false;
    app.classList.remove("page-open");
    if (lastSpot && document.body.contains(lastSpot)) lastSpot.focus({ preventScroll: true });
    lastSpot = null;
    await wait(slow() ? 900 : 0);
    if (!state.page) {
      app.classList.remove("is-zooming");
      drift.on = true;
    }
  }

  async function show(target, spotId, instant) {
    if (busy) {
      queued = [target, spotId];
      return;
    }
    busy = true;
    try {
      if (target.page === state.page) {
        if (target.page === "work" && target.sub !== state.sub) setCase(target.sub, true);
      } else {
        if (state.page) await closePage(target.page);
        if (target.page) await openPage(target.page, target.sub, spotId, instant);
      }
    } finally {
      busy = false;
    }
    if (queued) {
      const [t, s] = queued;
      queued = null;
      const cur = state;
      if (t.page !== cur.page || t.sub !== cur.sub) show(t, s);
    }
  }

  function go(route, spotId) {
    const hash = route ? `#${route}` : "";
    if (hash !== location.hash) history.pushState(null, "", hash || location.pathname + location.search);
    show(parse(hash), spotId);
  }

  addEventListener("popstate", () => show(parse()));
  addEventListener("hashchange", () => show(parse()));

  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (a && !e.defaultPrevented && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
      e.preventDefault();
      if (a.closest(".dock") && state.page === a.dataset.nav && !state.sub) return;
      go(a.getAttribute("href").slice(1));
      return;
    }
    if (e.target.closest("[data-back]")) {
      go("");
      return;
    }
    const copy = e.target.closest("[data-copy]");
    if (copy) copyText(copy.dataset.copy);
  });

  addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (state.page === "work" && state.sub) go("work");
    else if (state.page) go("");
  });

  let resizeRaf = 0;
  addEventListener("resize", () => {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => {
      if (zoomSpot) zoomInto(zoomSpot, true);
      else if (!state.page) centerPan();
    });
  });
  panMQ.addEventListener?.("change", () => {
    resetDrift();
    centerPan();
  });

  /* ---------------- Little things ---------------- */

  let toastTimer = 0;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("glass", "is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("is-on"), 2200);
  }
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      toast("Copied. Talk soon!");
    } catch (e) {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        toast("Copied. Talk soon!");
      } catch (err) {
        toast(text);
      }
      ta.remove();
    }
  }

  const hint = $("#hint");
  let hintTimer = 0;
  function showHint() {
    if (state.page) return;
    hint.textContent = panMQ.matches || !fineMQ.matches ? "Swipe to look around. Tap things in the room." : "Hover around the room. The ones with a ▾ open up.";
    hint.classList.add("glass", "is-on");
    hintTimer = setTimeout(hideHint, 6000);
  }
  function hideHint() {
    clearTimeout(hintTimer);
    hint.classList.remove("is-on");
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clearTimeout(meteorTimer);
    else scheduleMeteor();
  });

  /* ---------------- Start ---------------- */

  renderAbout();
  renderWork();
  renderContact();
  enableBoardDrag();

  const img = $("#roomImg");
  const loaded = img.complete && img.naturalWidth ? Promise.resolve() : new Promise((r) => img.addEventListener("load", r, { once: true }));
  const fontsReady = document.fonts ? document.fonts.ready.catch(() => {}) : Promise.resolve();
  Promise.race([Promise.all([loaded.then(() => img.decode?.().catch(() => {})), fontsReady]), wait(5000)]).then(boot);

  function boot() {
    centerPan();
    const first = parse();
    app.classList.remove("is-loading");
    if (first.page) {
      app.classList.add("lit");
      show(first, null, true);
    } else {
      setTimeout(() => app.classList.add("lit"), slow() ? 700 : 0);
      setTimeout(showHint, slow() ? 2600 : 400);
    }
    scheduleMeteor();
    setTimeout(() => shoot(1), 3200);
  }
})();
