/* =========================================================
   main.js — theme, nav, scroll-reveal, hero canvas, gallery
   ========================================================= */

/* ---------- THEME ---------- */
(function theme() {
  const root = document.documentElement;
  const toggle = document.getElementById("themeToggle");
  const saved = localStorage.getItem("theme");
  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  root.setAttribute("data-theme", saved || (prefersLight ? "light" : "dark"));
  toggle?.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  });
})();

/* ---------- NAV: shadow on scroll + active link ---------- */
(function nav() {
  const nav = document.getElementById("nav");
  const links = Array.from(document.querySelectorAll(".nav__links a"));
  const sections = links.map(a => document.querySelector(a.getAttribute("href"))).filter(Boolean);

  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 12);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if ("IntersectionObserver" in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          links.forEach(l => l.classList.toggle("is-active", l.getAttribute("href") === "#" + e.target.id));
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(s => obs.observe(s));
  }
})();

/* ---------- SCROLL REVEAL ---------- */
(function reveal() {
  const els = document.querySelectorAll(".section, .hero__text, .hero__portrait");
  els.forEach(el => el.classList.add("reveal"));
  if (!("IntersectionObserver" in window)) { els.forEach(el => el.classList.add("is-in")); return; }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("is-in"); obs.unobserve(e.target); } });
  }, { threshold: 0.12 });
  els.forEach(el => obs.observe(el));
})();

/* ---------- GALLERY: load photos, hide missing ---------- */
(function gallery() {
  document.querySelectorAll(".gphoto").forEach(fig => {
    const src = fig.dataset.src;
    if (!src) return;
    const img = new Image();
    img.alt = "Photo of Jiyeon Yang";
    img.onload = () => fig.appendChild(img);
    img.onerror = () => fig.classList.add("is-empty");
    img.src = src;
  });
})();

/* ---------- FOOTER YEAR ---------- */
document.getElementById("year").textContent = new Date().getFullYear();

/* ---------- HERO NEURAL CANVAS ---------- */
(function heroCanvas() {
  const canvas = document.getElementById("neuralCanvas");
  if (!canvas) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ctx = canvas.getContext("2d");
  let W, H, dpr, nodes, links;

  function css(v) { return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
  }
  function build() {
    const count = Math.min(90, Math.round((W * H) / 16000));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25,
      r: 1 + Math.random() * 2,
      fire: Math.random() * 1
    }));
  }

  function step(t) {
    ctx.clearRect(0, 0, W, H);
    const accent = css("--accent") || "#37e0d8";
    const accent2 = css("--accent-2") || "#8b6cff";
    const link = 130;

    for (const p of nodes) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    }
    // edges
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < link) {
          ctx.globalAlpha = (1 - d / link) * 0.18;
          ctx.strokeStyle = accent2; ctx.lineWidth = 0.7;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    // nodes + occasional firing pulse
    for (const p of nodes) {
      const fire = reduce ? 0.4 : (0.5 + 0.5 * Math.sin(t / 900 + p.fire * 7));
      ctx.globalAlpha = 0.5 + 0.4 * fire;
      ctx.fillStyle = accent;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r + fire * 1.4, 0, Math.PI * 2); ctx.fill();
      if (fire > 0.92) {
        ctx.globalAlpha = (fire - 0.92) * 4;
        ctx.beginPath(); ctx.arc(p.x, p.y, 8 + fire * 10, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    if (!reduce) requestAnimationFrame(step);
  }

  resize();
  window.addEventListener("resize", resize);
  requestAnimationFrame(step);
  if (reduce) step(0);
})();
