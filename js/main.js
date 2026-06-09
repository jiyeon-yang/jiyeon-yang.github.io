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

/* ---------- PHOTO SLIDER ----------
   Edit the `caption` text for each photo below. */
const PHOTOS = [
  { src: "assets/photo1.jpg", caption: "Coffee break during a conference" },
  { src: "assets/photo2.jpg", caption: "Exploring the city between sessions" },
  { src: "assets/photo3.jpg", caption: "BCS Brain Day" },
  { src: "assets/photo4.jpg", caption: "Presenting my poster" },
  { src: "assets/photo5.jpg", caption: "Museum visit" },
  { src: "assets/photo6.jpg", caption: "Giving a talk on visual processing in the retrosplenial cortex" },
  { src: "assets/photo7.jpg", caption: "With the lab" }
];

(function slider() {
  const root = document.getElementById("photoSlider");
  if (!root) return;
  const img = document.getElementById("slideImg");
  const cap = document.getElementById("slideCaption");
  const dotsWrap = document.getElementById("slideDots");
  const prev = document.getElementById("slidePrev");
  const next = document.getElementById("slideNext");
  let i = 0;

  // build dots
  const dots = PHOTOS.map((_, idx) => {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("role", "tab");
    b.setAttribute("aria-label", "Photo " + (idx + 1));
    b.addEventListener("click", () => show(idx));
    dotsWrap.appendChild(b);
    return b;
  });

  function show(n) {
    i = (n + PHOTOS.length) % PHOTOS.length;
    const p = PHOTOS[i];
    img.classList.remove("is-loaded");
    img.onload = () => img.classList.add("is-loaded");
    img.onerror = () => { cap.innerHTML = "Missing <code>" + p.src + "</code>"; };
    img.src = p.src;
    img.alt = p.caption;
    cap.innerHTML = p.caption + '<span class="slider__count">' + (i + 1) + " / " + PHOTOS.length + "</span>";
    dots.forEach((d, idx) => {
      d.classList.toggle("is-active", idx === i);
      d.setAttribute("aria-selected", idx === i ? "true" : "false");
    });
  }

  prev.addEventListener("click", () => show(i - 1));
  next.addEventListener("click", () => show(i + 1));

  // keyboard (when slider focused)
  root.tabIndex = 0;
  root.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") { show(i - 1); e.preventDefault(); }
    else if (e.key === "ArrowRight") { show(i + 1); e.preventDefault(); }
  });

  // swipe
  let x0 = null;
  root.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  root.addEventListener("touchend", (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) show(dx < 0 ? i + 1 : i - 1);
    x0 = null;
  });

  show(0);
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
