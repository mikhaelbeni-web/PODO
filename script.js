/* Noha Dehhan · Pédicure-Podologue — scripts du site */

// ——— Configuration du site ———
const CONFIG = {
  // Page Doctolib de Noha Dehhan (lien validé)
  doctolibUrl: "https://www.doctolib.fr/pedicure-podologue/paris/noha-dehhan",
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
      setTimeout(() => el.classList.add("is-done"), 1300);
      revealer.unobserve(el);
    });
  },
  { rootMargin: "0px 0px -8% 0px" }
);
document.querySelectorAll(".reveal").forEach((el) => revealer.observe(el));

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
