export const SEED_COLLECTIONS = [
  {
    id: "col-guides",
    slug: "guides",
    title: "Guides",
    description: "Orientation pages and how Reliquary itself works.",
    sortOrder: 0,
  },
  {
    id: "col-motion",
    slug: "motion",
    title: "Motion",
    description: "Self-contained studies in animation and time.",
    sortOrder: 1,
  },
  {
    id: "col-interface",
    slug: "interface",
    title: "Interface",
    description: "Interactive UI pieces you can open, inspect, and remix.",
    sortOrder: 2,
  },
] as const;

export const SEED_WELCOME_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Welcome to Reliquary</title>
  <style>
    :root { color-scheme: light; }
    * { box-sizing: border-box; }
    html, body { margin: 0; }
    body {
      font-family: Georgia, "Times New Roman", serif;
      background: #f3efe6;
      color: #1a1714;
      line-height: 1.65;
    }
    .page {
      max-width: 38rem;
      margin: 0 auto;
      padding: 4.5rem 1.5rem 6rem;
    }
    .kicker {
      font-family: ui-sans-serif, system-ui, sans-serif;
      font-size: 0.72rem;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #6f675c;
      margin: 0 0 1.25rem;
    }
    h1 {
      font-size: clamp(2.1rem, 6vw, 3.15rem);
      font-weight: 500;
      letter-spacing: -0.03em;
      line-height: 1.12;
      margin: 0 0 1rem;
    }
    .lead {
      font-size: 1.15rem;
      color: #3f3a34;
      margin: 0 0 2.5rem;
    }
    h2 {
      font-size: 1.2rem;
      font-weight: 500;
      margin: 2.4rem 0 0.6rem;
    }
    p { margin: 0 0 1rem; }
    ul { margin: 0 0 1rem; padding-left: 1.15rem; }
    li { margin: 0.25rem 0; }
    code {
      font-family: ui-monospace, Menlo, Consolas, monospace;
      font-size: 0.86em;
      background: #ece6da;
      padding: 0.1em 0.35em;
      border-radius: 4px;
    }
    .rule {
      height: 1px;
      background: #d8d0c3;
      border: 0;
      margin: 2.5rem 0;
    }
    .note {
      font-family: ui-sans-serif, system-ui, sans-serif;
      font-size: 0.88rem;
      color: #6f675c;
      border-left: 2px solid #3d5468;
      padding: 0.2rem 0 0.2rem 1rem;
      margin: 1.5rem 0 0;
    }
  </style>
</head>
<body>
  <article class="page">
    <p class="kicker">Guides</p>
    <h1>A place to keep things that move.</h1>
    <p class="lead">Reliquary is a quiet wiki for self-contained HTML artifacts — pages, studies, and small interfaces that deserve a shelf rather than a tab you will lose.</p>
    <hr class="rule" />
    <h2>What is an artifact?</h2>
    <p>An artifact is a single HTML file. It can be a typographic essay, a canvas study, or a React component wrapped in a document so it runs on its own. Nothing here is a multi-file app. The file is the work.</p>
    <h2>How to file one</h2>
    <ul>
      <li>Give it a title and a short description, the way you would a wiki page.</li>
      <li>Drop it in a collection, or leave it unfiled.</li>
      <li>Tag it so it can be found later — <code>motion</code>, <code>ui</code>, <code>notes</code>.</li>
    </ul>
    <h2>Agents</h2>
    <p>Anything that can speak HTTP or MCP can publish here. Create, edit, and remove artifacts through the public API, or connect an MCP client to the Reliquary server so a coding agent can file work as it goes.</p>
    <p class="note">Open Docs in the sidebar for the exact tools, payloads, and a React shell you can paste.</p>
  </article>
</body>
</html>
`;

export const SEED_HARMONIC_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Harmonic</title>
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; height: 100%; background: #0e1116; color: #e7e4dc; font-family: ui-sans-serif, system-ui, sans-serif; }
    canvas { display: block; width: 100%; height: 100%; }
    .dock {
      position: absolute; left: 16px; right: 16px; bottom: 16px;
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
      padding: 12px 14px; border-radius: 16px;
      background: rgba(18, 22, 28, 0.78);
      border: 1px solid rgba(231, 228, 220, 0.1);
      backdrop-filter: blur(10px);
    }
    label { display: flex; flex-direction: column; gap: 6px; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: #9a958a; }
    input[type=range] { width: 100%; accent-color: #c8c3b4; }
    @media (max-width: 640px) { .dock { grid-template-columns: 1fr 1fr; } }
  </style>
</head>
<body>
  <canvas id="c"></canvas>
  <form class="dock" id="dock">
    <label>Ratio A <input id="a" type="range" min="1" max="8" step="1" value="3" /></label>
    <label>Ratio B <input id="b" type="range" min="1" max="8" step="1" value="4" /></label>
    <label>Phase <input id="p" type="range" min="0" max="6.283" step="0.01" value="1.2" /></label>
    <label>Speed <input id="s" type="range" min="0.2" max="2.4" step="0.01" value="0.7" /></label>
  </form>
  <script>
    const canvas = document.getElementById("c");
    const ctx = canvas.getContext("2d");
    const a = document.getElementById("a");
    const b = document.getElementById("b");
    const p = document.getElementById("p");
    const s = document.getElementById("s");
    let w = 0, h = 0, t = 0, last = performance.now();
    function resize() {
      w = canvas.width = innerWidth * devicePixelRatio;
      h = canvas.height = innerHeight * devicePixelRatio;
    }
    addEventListener("resize", resize);
    resize();
    function frame(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt * Number(s.value);
      ctx.fillStyle = "rgba(14, 17, 22, 0.18)";
      ctx.fillRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2;
      const r = Math.min(w, h) * 0.32;
      const aa = Number(a.value), bb = Number(b.value), ph = Number(p.value);
      ctx.beginPath();
      for (let i = 0; i <= 1400; i++) {
        const u = (i / 1400) * Math.PI * 2;
        const x = cx + r * Math.sin(aa * u + t);
        const y = cy + r * Math.sin(bb * u + ph + t * 0.7);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      const g = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
      g.addColorStop(0, "#8aa0b3");
      g.addColorStop(1, "#e7e4dc");
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.25 * devicePixelRatio;
      ctx.stroke();
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  </script>
</body>
</html>
`;

export const SEED_SOLSTICE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Solstice</title>
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; height: 100%; overflow: hidden; font-family: ui-sans-serif, system-ui, sans-serif; }
    #sky { position: absolute; inset: 0; }
    svg { position: absolute; inset: 0; width: 100%; height: 100%; }
    .panel {
      position: absolute; left: 50%; bottom: 28px; transform: translateX(-50%);
      width: min(420px, calc(100% - 32px));
      padding: 14px 16px 16px; border-radius: 16px;
      background: rgba(250, 247, 241, 0.88);
      color: #1a1714;
      box-shadow: 0 0 0 1px rgba(26,23,20,0.08), 0 10px 30px rgba(16,18,24,0.18);
    }
    .row { display: flex; justify-content: space-between; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: #6f675c; margin-bottom: 8px; }
    input[type=range] { width: 100%; accent-color: #3d5468; }
    #stamp { font-variant-numeric: tabular-nums; }
  </style>
</head>
<body>
  <div id="sky"></div>
  <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <radialGradient id="sunG" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#fff6d8" />
        <stop offset="55%" stop-color="#f0c27a" />
        <stop offset="100%" stop-color="rgba(240,194,122,0)" />
      </radialGradient>
    </defs>
    <circle id="sun" cx="200" cy="420" r="90" fill="url(#sunG)" />
    <path d="M0 520 C 180 470, 280 560, 460 510 C 620 470, 740 560, 920 500 C 1040 464, 1120 520, 1200 490 L 1200 800 L 0 800 Z" fill="#2c3a3a" />
    <path d="M0 590 C 220 540, 360 640, 560 580 C 740 530, 880 640, 1200 570 L 1200 800 L 0 800 Z" fill="#1b2728" />
  </svg>
  <div class="panel">
    <div class="row"><span>Hour</span><span id="stamp">06:00</span></div>
    <input id="hour" type="range" min="0" max="24" step="0.05" value="6.4" />
  </div>
  <script>
    const sky = document.getElementById("sky");
    const sun = document.getElementById("sun");
    const hour = document.getElementById("hour");
    const stamp = document.getElementById("stamp");
    function lerp(a, b, t) { return a + (b - a) * t; }
    function mix(c1, c2, t) {
      return c1.map((v, i) => Math.round(lerp(v, c2[i], t)));
    }
    function css(c) { return "rgb(" + c.join(",") + ")"; }
    const night = [12, 16, 28], dawn = [232, 141, 92], day = [164, 198, 214], dusk = [176, 86, 74];
    function skyColor(h) {
      if (h < 5) return css(night);
      if (h < 7) return css(mix(night, dawn, (h - 5) / 2));
      if (h < 9) return css(mix(dawn, day, (h - 7) / 2));
      if (h < 17) return css(day);
      if (h < 19) return css(mix(day, dusk, (h - 17) / 2));
      if (h < 21) return css(mix(dusk, night, (h - 19) / 2));
      return css(night);
    }
    function pad(n) { return String(n).padStart(2, "0"); }
    function render() {
      const h = Number(hour.value);
      const hh = Math.floor(h) % 24;
      const mm = Math.floor((h % 1) * 60);
      stamp.textContent = pad(hh) + ":" + pad(mm);
      sky.style.background = skyColor(h);
      const ang = ((h - 6) / 12) * Math.PI;
      const cx = 600 + Math.cos(Math.PI - ang) * 420;
      const cy = 430 - Math.sin(ang) * 280;
      sun.setAttribute("cx", String(cx));
      sun.setAttribute("cy", String(cy));
      sun.style.opacity = h > 5.2 && h < 20.5 ? "1" : "0.15";
    }
    hour.addEventListener("input", render);
    render();
  </script>
</body>
</html>
`;

export const SEED_TESSERA_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tessera</title>
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; min-height: 100%; }
    body {
      font-family: ui-sans-serif, system-ui, sans-serif;
      background: #faf7f1;
      color: #1a1714;
      padding: 28px 20px 48px;
    }
    .wrap { max-width: 720px; margin: 0 auto; }
    h1 { font-family: Georgia, serif; font-weight: 500; letter-spacing: -0.03em; font-size: 2rem; margin: 0 0 0.35rem; }
    p.sub { margin: 0 0 1.5rem; color: #6f675c; }
    .toolbar { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-bottom: 18px; }
    button, select {
      font: inherit; height: 40px; padding: 0 14px; border-radius: 10px;
      border: 1px solid #d8d0c3; background: #fff; color: inherit; cursor: pointer;
    }
    button.primary { background: #3d5468; color: #faf7f1; border-color: #3d5468; }
    button:active { transform: scale(0.96); }
    .grid {
      display: grid; gap: 6px;
      grid-template-columns: repeat(var(--n), 1fr);
      padding: 10px; border-radius: 24px; background: #f3efe6;
    }
    .cell {
      aspect-ratio: 1; border: 0; border-radius: 8px; padding: 0; cursor: pointer;
      box-shadow: inset 0 0 0 1px rgba(26,23,20,0.08);
    }
    .cell.locked { outline: 2px solid #1a1714; outline-offset: 1px; }
    .hint { margin-top: 14px; font-size: 0.85rem; color: #8f877c; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>Tessera</h1>
    <p class="sub">A small tiling tool. Click a cell to pin it; shuffle the rest.</p>
    <div class="toolbar">
      <label>Size
        <select id="n">
          <option>6</option>
          <option selected>8</option>
          <option>10</option>
          <option>12</option>
        </select>
      </label>
      <button id="shuffle" class="primary" type="button">Shuffle</button>
      <button id="clear" type="button">Clear pins</button>
    </div>
    <div class="grid" id="grid"></div>
    <p class="hint">Pinned cells keep their color across shuffles.</p>
  </div>
  <script>
    const PALETTE = ["#1a1714","#3d5468","#8a3b32","#c3baab","#d8d0c3","#f3efe6","#7a8f7a","#c4a574"];
    const grid = document.getElementById("grid");
    const nSel = document.getElementById("n");
    let cells = [];
    function hash(i, salt) {
      return ((i * 9301 + 49297 + salt * 193) % 233280) / 233280;
    }
    function render() {
      const n = Number(nSel.value);
      grid.style.setProperty("--n", n);
      const prev = new Map(cells.map((c) => [c.key, c]));
      cells = [];
      grid.replaceChildren();
      for (let y = 0; y < n; y++) {
        for (let x = 0; x < n; x++) {
          const key = x + ":" + y;
          const old = prev.get(key);
          const cell = {
            key,
            locked: old ? old.locked : false,
            color: old && old.locked ? old.color : PALETTE[Math.floor(hash(x + y * n, Date.now() % 999) * PALETTE.length)],
          };
          cells.push(cell);
          const btn = document.createElement("button");
          btn.className = "cell" + (cell.locked ? " locked" : "");
          btn.style.background = cell.color;
          btn.type = "button";
          btn.addEventListener("click", () => {
            cell.locked = !cell.locked;
            btn.classList.toggle("locked", cell.locked);
          });
          grid.appendChild(btn);
        }
      }
    }
    document.getElementById("shuffle").onclick = render;
    document.getElementById("clear").onclick = () => { cells.forEach((c) => { c.locked = false; }); render(); };
    nSel.onchange = render;
    render();
  </script>
</body>
</html>
`;

export const SEED_ARTIFACTS = [
  {
    id: "art-welcome",
    slug: "welcome",
    title: "Welcome to Reliquary",
    description:
      "What an artifact is, how to file one, and how agents publish through the API and MCP.",
    collectionId: "col-guides",
    tags: ["guide", "wiki"],
    kind: "html" as const,
    html: SEED_WELCOME_HTML,
  },
  {
    id: "art-harmonic",
    slug: "harmonic",
    title: "Harmonic",
    description: "A Lissajous study. Ratio, phase, and speed are live.",
    collectionId: "col-motion",
    tags: ["motion", "canvas"],
    kind: "html" as const,
    html: SEED_HARMONIC_HTML,
  },
  {
    id: "art-solstice",
    slug: "solstice",
    title: "Solstice",
    description: "Drag the hour. The sky, sun, and hills follow.",
    collectionId: "col-motion",
    tags: ["motion", "study"],
    kind: "html" as const,
    html: SEED_SOLSTICE_HTML,
  },
  {
    id: "art-tessera",
    slug: "tessera",
    title: "Tessera",
    description: "Pin tiles, shuffle the rest. A small interface you can open in place.",
    collectionId: "col-interface",
    tags: ["ui", "tool"],
    kind: "html" as const,
    html: SEED_TESSERA_HTML,
  },
];
