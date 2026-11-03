/* Noa Dehan · Pédicure-Podologue — scripts du site */

// ——— Configuration à compléter avant la mise en ligne ———
const CONFIG = {
  // Lien exact de la page Doctolib de Noa Dehan (à copier depuis la barre d'adresse sur Doctolib)
  doctolibUrl: "https://www.doctolib.fr/pedicure-podologue/paris/noa-dehan",
};

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ——— Tous les boutons de rendez-vous ouvrent l'agenda Doctolib ———
document.querySelectorAll("[data-doctolib]").forEach((link) => {
  link.href = CONFIG.doctolibUrl;
  link.target = "_blank";
  link.rel = "noopener";
  link.insertAdjacentHTML("beforeend", '<span class="sr"> (Doctolib, nouvel onglet)</span>');
});

document.querySelectorAll("[data-year]").forEach((el) => {
  el.textContent = new Date().getFullYear();
});

// ——— Navigation ———
const nav = document.getElementById("nav");
const hero = document.getElementById("top");
const mbar = document.getElementById("mbar");
const burger = document.querySelector(".nav__burger");
const menu = document.getElementById("menu-mobile");

function onScroll() {
  const y = window.scrollY;
  nav?.classList.toggle("is-scrolled", y > 12);
  if (mbar && hero) mbar.classList.toggle("is-visible", y > hero.offsetHeight * 0.6);
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

function setMenu(open) {
  burger.setAttribute("aria-expanded", String(open));
  burger.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
  menu.hidden = !open;
  nav.classList.toggle("is-open", open);
}
if (burger && menu) {
  burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !menu.hidden) {
      setMenu(false);
      burger.focus();
    }
  });
}

// ——— Apparition des blocs au défilement ———
const revealer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add("is-in");
      setTimeout(() => el.classList.add("is-done"), 1400);
      revealer.unobserve(el);
    });
  },
  { rootMargin: "0px 0px -8% 0px" }
);
document.querySelectorAll(".reveal").forEach((el) => revealer.observe(el));

// ——— Halo qui suit la souris sur les cartes ———
document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("pointermove", (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - r.left}px`);
    card.style.setProperty("--my", `${e.clientY - r.top}px`);
  });
});

// ——— Onglets « Vous avez mal où ? » ———
const tabs = [...document.querySelectorAll('.finder [role="tab"]')];

function selectTab(tab, focus) {
  tabs.forEach((t) => {
    const active = t === tab;
    t.setAttribute("aria-selected", String(active));
    t.tabIndex = active ? 0 : -1;
    document.getElementById(t.getAttribute("aria-controls"))?.classList.toggle("is-active", active);
  });
  if (focus) tab.focus();
  tab.scrollIntoView({ block: "nearest", inline: "nearest", behavior: reduceMotion ? "auto" : "smooth" });
}

tabs.forEach((tab, i) => {
  tab.addEventListener("click", () => selectTab(tab));
  tab.addEventListener("keydown", (e) => {
    const keys = {
      ArrowDown: i + 1,
      ArrowRight: i + 1,
      ArrowUp: i - 1,
      ArrowLeft: i - 1,
      Home: 0,
      End: tabs.length - 1,
    };
    if (!(e.key in keys)) return;
    e.preventDefault();
    selectTab(tabs[(keys[e.key] + tabs.length) % tabs.length], true);
  });
});

// ——— Visualisation animée des pressions plantaires ———
function initScan() {
  const canvas = document.getElementById("scan");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const out = {
    left: document.getElementById("m-left"),
    right: document.getElementById("m-right"),
    ratio: document.getElementById("m-ratio"),
  };

  // Zones d'appui d'un pied droit vu de dessous :
  // x va de l'intérieur (0) vers l'extérieur (1), y des orteils (0) au talon (1), w = pression relative
  const ZONES = [
    { x: 0.5, y: 0.84, rx: 0.2, ry: 0.13, w: 1, part: "heel" },
    { x: 0.66, y: 0.6, rx: 0.12, ry: 0.19, w: 0.42, part: "mid" },
    { x: 0.5, y: 0.37, rx: 0.28, ry: 0.115, w: 0.78, part: "fore" },
    { x: 0.37, y: 0.37, rx: 0.11, ry: 0.075, w: 0.95, part: "fore" },
    { x: 0.56, y: 0.35, rx: 0.11, ry: 0.075, w: 1, part: "fore" },
    { x: 0.3, y: 0.15, rx: 0.09, ry: 0.08, w: 0.82, part: "toes" },
    { x: 0.47, y: 0.13, rx: 0.052, ry: 0.048, w: 0.55, part: "toes" },
    { x: 0.58, y: 0.15, rx: 0.047, ry: 0.043, w: 0.5, part: "toes" },
    { x: 0.68, y: 0.18, rx: 0.042, ry: 0.039, w: 0.45, part: "toes" },
    { x: 0.77, y: 0.23, rx: 0.037, ry: 0.034, w: 0.4, part: "toes" },
  ];

  // Échelle de couleur : faible → élevée
  const STOPS = [
    [0, [30, 70, 110]],
    [0.25, [52, 224, 200]],
    [0.55, [91, 124, 255]],
    [0.8, [167, 139, 250]],
    [1, [255, 122, 198]],
  ];
  const COLORS = Array.from({ length: 101 }, (_, i) => {
    const v = i / 100;
    let k = 0;
    while (k < STOPS.length - 2 && v > STOPS[k + 1][0]) k++;
    const [a, ca] = STOPS[k];
    const [b, cb] = STOPS[k + 1];
    const t = (v - a) / (b - a);
    const [r, g, bl] = ca.map((c, j) => Math.round(c + (cb[j] - c) * t));
    return `rgb(${r},${g},${bl})`;
  });

  const bg = document.createElement("canvas");
  const bgCtx = bg.getContext("2d");
  let cells = [];
  let W = 0;
  let H = 0;
  let cell = 8;

  function build() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = rect.width;
    H = rect.height;
    canvas.width = bg.width = Math.round(W * dpr);
    canvas.height = bg.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cell = Math.max(6, Math.round(W / 58));

    // Grille de capteurs en fond
    bgCtx.clearRect(0, 0, W, H);
    bgCtx.fillStyle = "rgba(255,255,255,0.07)";
    for (let y = 0; y < H; y += cell) {
      for (let x = 0; x < W; x += cell) bgCtx.fillRect(x + cell / 2 - 0.5, y + cell / 2 - 0.5, 1, 1);
    }

    const footH = H * 0.78;
    const footW = footH * 0.4;
    const gap = W * 0.07;
    const top = (H - footH) / 2 - H * 0.01;
    cells = [];

    for (const side of ["L", "R"]) {
      const cx0 = side === "L" ? W / 2 - gap / 2 - footW / 2 : W / 2 + gap / 2 + footW / 2;
      const cy0 = top + footH / 2;
      const angle = side === "L" ? -0.09 : 0.09; // pointes de pieds légèrement ouvertes
      const cos = Math.cos(-angle);
      const sin = Math.sin(-angle);
      const x0 = Math.floor((cx0 - footW * 0.7) / cell) * cell;
      const y0 = Math.floor((cy0 - footH * 0.55) / cell) * cell;

      for (let py = y0; py < cy0 + footH * 0.55; py += cell) {
        for (let px = x0; px < cx0 + footW * 0.7; px += cell) {
          const dx = px + cell / 2 - cx0;
          const dy = py + cell / 2 - cy0;
          let u = (dx * cos - dy * sin) / footW + 0.5;
          const v = (dx * sin + dy * cos) / footH + 0.5;
          if (side === "L") u = 1 - u;

          let base = 0;
          let part = null;
          for (const z of ZONES) {
            const ex = (u - z.x) / z.rx;
            const ey = (v - z.y) / z.ry;
            const f = 1 - ex * ex - ey * ey;
            if (f > 0) {
              const val = z.w * Math.sqrt(f);
              if (val > base) {
                base = val;
                part = z.part;
              }
            }
          }
          if (part) cells.push({ x: px, y: py, base, part, side, seed: Math.random() * Math.PI * 2 });
        }
      }
    }
  }

  let running = false;
  let visible = false;
  let raf = 0;
  let lastMetrics = 0;
  const t0 = performance.now();

  function draw(now) {
    if (!cells.length) return;
    const t = reduceMotion ? 2 : (now - t0) / 1000;
    const sway = Math.sin(t * 0.55) * 0.07; // transfert du poids gauche ↔ droite
    const roll = Math.sin(t * 0.8 + 1.2) * 0.1; // transfert talon ↔ avant-pied
    const scanY = reduceMotion ? -999 : (((t * 0.2) % 1.25) - 0.12) * H;
    const size = cell - 1.5;

    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(bg, 0, 0, W, H);

    for (const c of cells) {
      let v = c.base * (c.side === "L" ? 1 - sway : 1 + sway);
      if (c.part === "heel") v *= 1 + roll;
      else if (c.part !== "mid") v *= 1 - roll;
      v += Math.sin(c.seed + t * 2.2) * 0.035;
      const near = Math.abs(c.y - scanY);
      if (near < 20) v += (1 - near / 20) * 0.3;
      const k = Math.max(0, Math.min(1, v));
      ctx.globalAlpha = 0.3 + 0.7 * k;
      ctx.fillStyle = COLORS[Math.round(k * 100)];
      ctx.fillRect(c.x + 0.75, c.y + 0.75, size, size);
    }
    ctx.globalAlpha = 1;

    if (!reduceMotion) {
      const glow = ctx.createLinearGradient(0, scanY - 46, 0, scanY);
      glow.addColorStop(0, "rgba(52,224,200,0)");
      glow.addColorStop(1, "rgba(52,224,200,0.13)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, scanY - 46, W, 46);
      ctx.fillStyle = "rgba(52,224,200,0.75)";
      ctx.fillRect(0, scanY, W, 1);
    }

    if (now - lastMetrics > 450 || reduceMotion) {
      lastMetrics = now;
      const left = Math.round(50 * (1 - sway));
      const heel = Math.round(57 + roll * 30);
      out.left.textContent = `${left} %`;
      out.right.textContent = `${100 - left} %`;
      out.ratio.textContent = `${heel} / ${100 - heel}`;
    }
  }

  function loop(now) {
    draw(now);
    if (running) raf = requestAnimationFrame(loop);
  }
  function start() {
    if (running || reduceMotion || !visible || document.hidden) return;
    running = true;
    raf = requestAnimationFrame(loop);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  new ResizeObserver(() => {
    build();
    draw(performance.now());
  }).observe(canvas);

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    visible ? start() : stop();
  }).observe(canvas);

  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
}

initScan();
