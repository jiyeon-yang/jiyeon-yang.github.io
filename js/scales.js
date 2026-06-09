/* =========================================================
   Scale Explorer — micro / meso / macro
   Data + slider interaction + per-scale visualization.
   ========================================================= */

const SCALES = [
  {
    key: "micro",
    name: "MICRO",
    unit: "~1 µm · synaptic / ultrastructural",
    color: getCSS("--micro"),
    projects: [
      {
        title: "Correlative Two-Photon & Electron Microscopy Workflow",
        when: "Yale · Aaron Kuan Lab · 2026 – Current",
        desc: "Developing a workflow to bridge in vivo two-photon functional imaging with nanometer-scale electron microscopy reconstruction in the mouse brain.",
        tags: ["EM", "2-photon", "Correlative imaging", "Connectomics"]
      }
    ]
  },
  {
    key: "meso",
    name: "MESO",
    unit: "~100 µm – 1 mm · circuits & cells",
    color: getCSS("--meso"),
    projects: [
      {
        title: "1p Calcium Imaging — Interneurons & Spatial Coding",
        when: "SNU · Jeehyun Kwag Lab · 2023 – 2025",
        desc: "In vivo one-photon calcium imaging of PV- and SST-expressing interneurons encoding environmental geometry; optogenetic and chemogenetic inhibition revealed their role in shaping spatial representation in excitatory neurons.",
        tags: ["1p Ca²⁺", "Optogenetics", "Chemogenetics", "Retrosplenial cortex"]
      },
      {
        title: "2p Calcium Imaging — Retrosplenial Visual Processing",
        when: "Yale · Michael Higley Lab · 2025",
        desc: "CTB retrograde tracing to map visual cortical regions projecting to the retrosplenial cortex, with two-photon calcium imaging characterizing visual responses in RSC neurons.",
        tags: ["2p Ca²⁺", "CTB tracing", "Visual cortex"]
      },
      {
        title: "Feedforward Spiking Neural Network Model",
        when: "SNU · Jeehyun Kwag Lab",
        desc: "A feedforward spiking network of Hodgkin–Huxley neurons with short-term synaptic plasticity, analyzing how E/I motif structures and plasticity types shape the stability and propagation of synchronous spiking.",
        tags: ["Hodgkin–Huxley", "STP", "Spike synchrony", "NEURON / NetPyNE"]
      }
    ]
  },
  {
    key: "macro",
    name: "MACRO",
    unit: "~cm · whole-brain networks",
    color: getCSS("--macro"),
    projects: [
      {
        title: "Functional Connectivity in ASD & ASD+ADHD",
        when: "Hanyang · Jong-Min Lee Lab · 2021",
        desc: "Processed large-scale resting-state human fMRI from the ABIDE database and built a Graph Neural Network to detect and interpret functional-connectivity differences between ASD and comorbid-ADHD subgroups.",
        tags: ["fMRI", "ABIDE", "GNN", "Functional connectivity"]
      }
    ]
  }
];

function getCSS(varName) {
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || "#37e0d8";
}

(function initExplorer() {
  const handle   = document.getElementById("scaleHandle");
  const track    = document.getElementById("scaleTrack");
  const fill      = document.getElementById("scaleFill");
  const label    = document.getElementById("scaleLabel");
  const unit      = document.getElementById("scaleUnit");
  const panel    = document.getElementById("projectPanel");
  const stops    = Array.from(document.querySelectorAll(".stop"));
  const canvas   = document.getElementById("vizCanvas");
  if (!handle || !track) return;

  let current = 0;
  const last = SCALES.length - 1;

  function setScale(i, { focus = false } = {}) {
    current = Math.max(0, Math.min(last, i));
    const s = SCALES[current];
    const color = getCSS("--" + s.key);
    const pct = (current / last) * 100;

    handle.style.left = pct + "%";
    fill.style.width = pct + "%";
    handle.style.borderColor = color;
    handle.setAttribute("aria-valuenow", current);
    handle.setAttribute("aria-valuetext", s.name + " — " + s.unit);

    label.textContent = s.name;
    label.style.color = color;
    unit.textContent = s.unit;

    document.documentElement.style.setProperty("--accent", color);

    stops.forEach((st, idx) => st.classList.toggle("is-active", idx === current));
    renderPanel(s, color);
    if (focus) handle.focus();
  }

  function renderPanel(s, color) {
    const cards = s.projects.map(p => `
      <article class="pcard" style="--scale-color:${color}">
        <h4>${p.title}</h4>
        <span class="pcard__when">${p.when}</span>
        <p>${p.desc}</p>
        <div class="pcard__tags">${p.tags.map(t => `<span>${t}</span>`).join("")}</div>
      </article>`).join("");
    panel.innerHTML = `
      <div class="panel-head">
        <h3>${s.name} scale</h3>
        <span class="scale-pill" style="color:${color}">${s.unit}</span>
      </div>
      <p class="panel-meta">${s.projects.length} project${s.projects.length > 1 ? "s" : ""} at this scale</p>
      <div class="panel-grid">${cards}</div>`;
  }

  /* ---- pointer drag on track ---- */
  function scaleFromClientX(clientX) {
    const r = track.getBoundingClientRect();
    const ratio = (clientX - r.left) / r.width;
    return Math.round(ratio * last);
  }
  let dragging = false;
  function startDrag(e) { dragging = true; handle.style.transition = "none"; fill.style.transition = "none"; moveDrag(e); }
  function moveDrag(e) {
    if (!dragging) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    setScale(scaleFromClientX(x));
  }
  function endDrag() { dragging = false; handle.style.transition = ""; fill.style.transition = ""; }

  track.addEventListener("pointerdown", startDrag);
  window.addEventListener("pointermove", moveDrag);
  window.addEventListener("pointerup", endDrag);

  /* ---- keyboard ---- */
  handle.addEventListener("keydown", (e) => {
    if (["ArrowRight", "ArrowUp"].includes(e.key)) { setScale(current + 1); e.preventDefault(); }
    else if (["ArrowLeft", "ArrowDown"].includes(e.key)) { setScale(current - 1); e.preventDefault(); }
    else if (e.key === "Home") { setScale(0); e.preventDefault(); }
    else if (e.key === "End") { setScale(last); e.preventDefault(); }
  });

  /* ---- clickable stops ---- */
  stops.forEach(st => st.addEventListener("click", () => setScale(+st.dataset.scale)));

  /* ---- visualization canvas ---- */
  startViz(canvas, () => SCALES[current].key);

  setScale(0);
})();

/* -------- per-scale animated visualization --------
   micro: dense packed synaptic blobs
   meso : a small network of firing nodes + edges
   macro: sparse hub-and-spoke brain-network graph        */
function startViz(canvas, getKey) {
  if (!canvas) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ctx = canvas.getContext("2d");
  let W, H, dpr;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  // build node sets per scale
  function makeNodes(n, opts = {}) {
    const arr = [];
    for (let i = 0; i < n; i++) {
      arr.push({
        x: Math.random() * W, y: Math.random() * H,
        r: opts.r ? opts.r() : 2 + Math.random() * 3,
        vx: (Math.random() - .5) * (opts.v || .15),
        vy: (Math.random() - .5) * (opts.v || .15),
        ph: Math.random() * Math.PI * 2
      });
    }
    return arr;
  }
  const sets = {
    micro: makeNodes(70, { r: () => 5 + Math.random() * 14, v: .12 }),
    meso:  makeNodes(26, { r: () => 3 + Math.random() * 4, v: .25 }),
    macro: makeNodes(12, { r: () => 4 + Math.random() * 6, v: .18 })
  };

  function color(key) { return getCSS("--" + key); }

  function frame(t) {
    ctx.clearRect(0, 0, W, H);
    const key = getKey();
    const c = color(key);
    const nodes = sets[key];
    // keep node coords in range after resize
    nodes.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      p.x = Math.max(0, Math.min(W, p.x));
      p.y = Math.max(0, Math.min(H, p.y));
    });

    const linkDist = key === "micro" ? 60 : key === "meso" ? 150 : 320;
    const showLinks = key !== "micro";
    if (showLinks) {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
          const d = Math.hypot(dx, dy);
          if (d < linkDist) {
            ctx.globalAlpha = (1 - d / linkDist) * 0.5;
            ctx.strokeStyle = c; ctx.lineWidth = key === "macro" ? 1.2 : 0.8;
            ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke();
          }
        }
      }
    }
    ctx.globalAlpha = 1;
    nodes.forEach(p => {
      const pulse = reduce ? 0.6 : 0.5 + 0.5 * Math.sin(t / 700 + p.ph);
      ctx.beginPath();
      ctx.fillStyle = c;
      ctx.globalAlpha = key === "micro" ? 0.22 + 0.25 * pulse : 0.55 + 0.45 * pulse;
      ctx.arc(p.x, p.y, p.r * (key === "micro" ? 1 : 1 + 0.25 * pulse), 0, Math.PI * 2);
      ctx.fill();
      if (key !== "micro") {
        ctx.globalAlpha = 0.25 * pulse;
        ctx.arc(p.x, p.y, p.r * 2.4, 0, Math.PI * 2); ctx.fill();
      }
    });
    ctx.globalAlpha = 1;
    if (!reduce) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  if (reduce) frame(0);
}
