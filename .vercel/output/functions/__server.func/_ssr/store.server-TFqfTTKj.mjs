import { l as notFound, r as ReliquaryError } from "./schema-C6xkN7Ue.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/store.server-TFqfTTKj.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var _0002_reliquary_default = "-- Reliquary: wiki of living HTML artifacts (unowned, world-readable)\ncreate table if not exists reliquary_meta (\n  key   text primary key,\n  value text not null\n);\n\ncreate table if not exists collections (\n  id          text primary key,\n  slug        text not null unique,\n  title       text not null,\n  description text not null default '',\n  sort_order  integer not null default 0,\n  created_at  timestamptz not null default now(),\n  updated_at  timestamptz not null default now()\n);\n\ncreate table if not exists artifacts (\n  id             text primary key,\n  slug           text not null unique,\n  title          text not null,\n  description    text not null default '',\n  html           text not null,\n  collection_id  text references collections(id) on delete set null,\n  tags           text not null default '[]',\n  kind           text not null default 'html',\n  created_at     timestamptz not null default now(),\n  updated_at     timestamptz not null default now()\n);\n\ncreate index if not exists artifacts_collection_id_idx on artifacts (collection_id);\ncreate index if not exists artifacts_updated_at_idx on artifacts (updated_at desc);\ncreate index if not exists artifacts_slug_idx on artifacts (slug);\ncreate index if not exists collections_slug_idx on collections (slug);\n";
/**
* Migration bookkeeping shared by the two appliers — `scripts/migrate.mjs`
* (deploy, `readdir`) and `src/lib/db.ts` (PGLite preview, `import.meta.glob`).
*
* Applied files are keyed by BASENAME, so the same file applies once no matter
* which directory it is globbed from. That is what makes the auth schema safe to
* copy from `migrations/auth/` into `migrations/` when an app turns sign-in on:
* a database that already has `0001_auth.sql` will not re-run it.
*
* Neither applier descends into subdirectories, so `migrations/auth/*.sql` is
* out of scope for both until it is copied up.
*/
/**
* The `_migrations` key for a migration path (or bare filename).
* @param {string} path
* @returns {string}
*/
function migrationName(path) {
	return path.split("/").pop() ?? path;
}
/**
* @param {string} path
* @returns {boolean}
*/
function isMigrationFile(path) {
	return path.endsWith(".sql");
}
/**
* Migrations in `paths` that are not yet in `applied`, in apply order.
* Non-`.sql` entries (a `readdir` also yields `migrations/auth/`) are dropped.
* @param {Iterable<string>} paths
* @param {Iterable<string>} applied
* @returns {Array<{ name: string, path: string }>}
*/
function pendingMigrations(paths, applied) {
	const done = new Set(applied);
	return [...paths].filter(isMigrationFile).map((path) => ({
		name: migrationName(path),
		path
	})).sort((a, b) => a.name.localeCompare(b.name)).filter(({ name }) => !done.has(name));
}
var rawDatabaseUrl = typeof process !== "undefined" ? process.env.DATABASE_URL : void 0;
var databaseUrl = rawDatabaseUrl && rawDatabaseUrl.trim() ? rawDatabaseUrl : void 0;
/**
* Active backend: real **Neon** when `DATABASE_URL` is set (deployed / configured
* sandbox), otherwise a local embedded **PGLite** (Postgres compiled to WASM) so
* the app has a working database even with nothing configured — the live preview
* included. Swap in Neon later by just setting `DATABASE_URL`; no code changes.
*/
var dbSource = databaseUrl ? "neon" : "pglite";
/**
* Init state lives on globalThis as promises: dev HMR creates new instances of
* this module, and two instances racing module-level state would open a second
* pool or run two concurrent PGLite migration passes (whose duplicate
* `_migrations` insert rejects — and would get memoized, poisoning every later
* `getSql()`). A failed init clears its slot so the next call retries.
*/
var globalRef = globalThis;
/**
* Result-type parity: Postgres sends every value as text plus a type OID — the
* JS value is the DRIVER's parsing choice, and pg and PGLite disagree (pg:
* int8 -> string, date -> local-midnight Date; PGLite: int8 -> BigInt, which
* JSON.stringify rejects, date -> UTC Date). Normalize both so preview and
* production return identical, JSON-safe shapes:
*   int8/bigint (incl. count(*)) -> number (past 2^53 loses precision — cast
*                                   `::text` if you ever need huge integers)
*   date                         -> 'YYYY-MM-DD' string
*   interval                     -> Postgres interval text
* numeric already comes back as a string on both (arbitrary precision).
*/
var OID_INT8 = 20;
var OID_DATE = 1082;
var OID_INTERVAL = 1186;
var identity = (v) => v;
/** Wrap a query runner in the tagged-template + `.query()` `Sql` surface. */
function toSql(run) {
	const sql = (async (strings, ...values) => {
		let text = strings[0];
		for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
		return run(text, values);
	});
	sql.query = (text, params = []) => run(text, params);
	return sql;
}
function createNeonSql() {
	globalRef.__pgSqlPromise__ ??= (async () => {
		const { Pool, types } = await import("../_libs/pg.mjs").then((n) => n.t);
		types.setTypeParser(OID_INT8, Number);
		types.setTypeParser(OID_DATE, identity);
		types.setTypeParser(OID_INTERVAL, identity);
		const pool = new Pool({ connectionString: databaseUrl });
		return toSql(async (text, params) => {
			return (await pool.query(text, params)).rows;
		});
	})().catch((err) => {
		globalRef.__pgSqlPromise__ = void 0;
		throw err;
	});
	return globalRef.__pgSqlPromise__;
}
async function createPgliteSql() {
	globalRef.__pgliteInstance__ ??= (async () => {
		const { PGlite } = await import("../_libs/electric-sql__pglite.mjs").then((n) => n.t);
		const pg = new PGlite({ parsers: {
			[OID_INT8]: Number,
			[OID_DATE]: identity,
			[OID_INTERVAL]: identity
		} });
		await pg.waitReady;
		await pg.exec("create table if not exists _migrations (name text primary key, applied_at timestamptz not null default now())");
		return pg;
	})().catch((err) => {
		globalRef.__pgliteInstance__ = void 0;
		throw err;
	});
	const pg = await globalRef.__pgliteInstance__;
	const migrate = async () => {
		const migrations = /* #__PURE__ */ Object.assign({ "/migrations/0002_reliquary.sql": _0002_reliquary_default });
		const done = (await pg.query("select name from _migrations")).rows.map((r) => r.name);
		for (const { name, path } of pendingMigrations(Object.keys(migrations), done)) await pg.transaction(async (tx) => {
			await tx.exec(migrations[path]);
			await tx.query("insert into _migrations (name) values ($1)", [name]);
		});
	};
	const pass = (globalRef.__pgliteMigrateChain__ ?? Promise.resolve()).catch(() => void 0).then(migrate);
	globalRef.__pgliteMigrateChain__ = pass;
	await pass;
	return toSql(async (text, params) => {
		return (await pg.query(text, params)).rows;
	});
}
var sqlPromise = null;
async function createSql() {
	if (typeof window !== "undefined") throw new Error("@/lib/db is server-only — call getSql() from a createServerFn handler or a server route loader, never from client code.");
	return dbSource === "neon" ? createNeonSql() : createPgliteSql();
}
/**
* Get the shared, **server-only** SQL client. Neon when `DATABASE_URL` is set,
* otherwise the local PGLite fallback. Memoized — safe to call per request.
*
* Schema comes from `migrations/*.sql`, auto-applied before the first query on
* both backends — define tables there, never inline in server functions.
*/
function getSql() {
	sqlPromise ??= createSql().catch((err) => {
		sqlPromise = null;
		throw err;
	});
	return sqlPromise;
}
/**
* Finish DB bootstrap before the server handles traffic.
*
* - **PGLite** (preview / no `DATABASE_URL`): open the in-memory DB and apply
*   `migrations/*.sql`. Idempotent — concurrent callers share one promise.
* - **Neon**: no-op (pool is created lazily on first query).
*
* Vite `configureServer` awaits this at dev startup; production imports of this
* module kick it off immediately (see bottom of file).
*/
function ensureDbReady() {
	if (dbSource !== "pglite") return Promise.resolve();
	return getSql().then(() => void 0);
}
var globalBoot = globalThis;
if (typeof window === "undefined" && dbSource === "pglite") globalBoot.__pgBootstrapPromise__ ??= ensureDbReady().catch((err) => {
	globalBoot.__pgBootstrapPromise__ = void 0;
	console.error("[db] PGLite bootstrap failed:", err);
	throw err;
});
function inferKind(html) {
	if (/react(?:dom)?|text\/babel|from ['"]react['"]|@babel\/standalone|type=["']text\/jsx["']/i.test(html)) return "react";
	return "html";
}
var SEED_COLLECTIONS = [
	{
		id: "col-guides",
		slug: "guides",
		title: "Guides",
		description: "Orientation pages and how Reliquary itself works.",
		sortOrder: 0
	},
	{
		id: "col-motion",
		slug: "motion",
		title: "Motion",
		description: "Self-contained studies in animation and time.",
		sortOrder: 1
	},
	{
		id: "col-interface",
		slug: "interface",
		title: "Interface",
		description: "Interactive UI pieces you can open, inspect, and remix.",
		sortOrder: 2
	}
];
var SEED_ARTIFACTS = [
	{
		id: "art-welcome",
		slug: "welcome",
		title: "Welcome to Reliquary",
		description: "What an artifact is, how to file one, and how agents publish through the API and MCP.",
		collectionId: "col-guides",
		tags: ["guide", "wiki"],
		kind: "html",
		html: `<!DOCTYPE html>
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
`
	},
	{
		id: "art-harmonic",
		slug: "harmonic",
		title: "Harmonic",
		description: "A Lissajous study. Ratio, phase, and speed are live.",
		collectionId: "col-motion",
		tags: ["motion", "canvas"],
		kind: "html",
		html: `<!DOCTYPE html>
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
  <\/script>
</body>
</html>
`
	},
	{
		id: "art-solstice",
		slug: "solstice",
		title: "Solstice",
		description: "Drag the hour. The sky, sun, and hills follow.",
		collectionId: "col-motion",
		tags: ["motion", "study"],
		kind: "html",
		html: `<!DOCTYPE html>
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
  <\/script>
</body>
</html>
`
	},
	{
		id: "art-tessera",
		slug: "tessera",
		title: "Tessera",
		description: "Pin tiles, shuffle the rest. A small interface you can open in place.",
		collectionId: "col-interface",
		tags: ["ui", "tool"],
		kind: "html",
		html: `<!DOCTYPE html>
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
  <\/script>
</body>
</html>
`
	}
];
function slugify(input) {
	return input.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "artifact";
}
function looksLikeDocument(source) {
	const s = source.trimStart().slice(0, 240).toLowerCase();
	return s.startsWith("<!doctype") || s.startsWith("<html");
}
function escapeHtml(value) {
	return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function hasReactMount(source) {
	return /ReactDOM\.(?:createRoot|render)|createRoot\s*\(/.test(source);
}
function looksLikeJsxModule(source) {
	if (looksLikeDocument(source)) return false;
	return /(?:from\s+['"]react['"]|require\(\s*['"]react['"]\s*\))/.test(source) || /(?:function|const|let|var|class)\s+App\b/.test(source) || /return\s*\([\s\S]*<\s*[A-Za-z]/.test(source) && /(?:function|=>)/.test(source) || inferKind(source) === "react";
}
function wrapJsx(source, title) {
	const body = source.trim();
	const mount = hasReactMount(body) ? "" : `
if (typeof App === "function") {
  const rootEl = document.getElementById("root");
  const root = ReactDOM.createRoot(rootEl);
  root.render(React.createElement(App));
}
`;
	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    html, body, #root { margin: 0; min-height: 100%; }
    body { font-family: ui-sans-serif, system-ui, sans-serif; }
  </style>
  <script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.development.js"><\/script>
  <script crossorigin src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js"><\/script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel" data-presets="react">
${body}
${mount}
  <\/script>
</body>
</html>
`;
}
function wrapFragment(source, title) {
	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    html, body { margin: 0; }
    body {
      font-family: Georgia, "Times New Roman", serif;
      color: #1a1714;
      background: #faf7f1;
      line-height: 1.6;
      padding: 32px 24px 64px;
      max-width: 720px;
      margin: 0 auto;
    }
    img, video, canvas, iframe { max-width: 100%; }
  </style>
</head>
<body>
${source.trim()}
</body>
</html>
`;
}
/** Turn a fragment, JSX module, or full document into a self-contained HTML file. */
function ensureDocument(source, title) {
	const trimmed = source.trim();
	if (!trimmed) return wrapFragment("", title);
	if (looksLikeDocument(trimmed)) return trimmed;
	if (looksLikeJsxModule(trimmed)) return wrapJsx(trimmed, title);
	return wrapFragment(trimmed, title);
}
var store_server_exports = /* @__PURE__ */ __exportAll({
	createArtifact: () => createArtifact,
	createCollection: () => createCollection,
	deleteArtifact: () => deleteArtifact,
	deleteCollection: () => deleteCollection,
	getArtifact: () => getArtifact,
	getCollection: () => getCollection,
	getLibrary: () => getLibrary,
	listArtifacts: () => listArtifacts,
	listCollections: () => listCollections,
	updateArtifact: () => updateArtifact,
	updateCollection: () => updateCollection
});
function iso(value) {
	if (value instanceof Date) return value.toISOString();
	if (typeof value === "string") {
		const d = new Date(value);
		return Number.isNaN(d.getTime()) ? value : d.toISOString();
	}
	return (/* @__PURE__ */ new Date()).toISOString();
}
function parseTags(raw) {
	if (Array.isArray(raw)) return normalizeTags(raw.map(String));
	if (typeof raw === "string") try {
		const parsed = JSON.parse(raw);
		if (Array.isArray(parsed)) return normalizeTags(parsed.map(String));
	} catch {
		return [];
	}
	return [];
}
function normalizeTags(tags) {
	const seen = /* @__PURE__ */ new Set();
	const out = [];
	for (const tag of tags) {
		const t = tag.trim().toLowerCase().slice(0, 32);
		if (!t || seen.has(t)) continue;
		seen.add(t);
		out.push(t);
		if (out.length >= 24) break;
	}
	return out;
}
function mapSummary(row) {
	return {
		id: row.id,
		slug: row.slug,
		title: row.title,
		description: row.description,
		collectionId: row.collection_id,
		collectionSlug: row.collection_slug,
		collectionTitle: row.collection_title,
		tags: parseTags(row.tags),
		kind: row.kind === "react" ? "react" : "html",
		createdAt: iso(row.created_at),
		updatedAt: iso(row.updated_at)
	};
}
function mapArtifact(row) {
	return {
		...mapSummary(row),
		html: row.html ?? ""
	};
}
function mapCollection(row) {
	return {
		id: row.id,
		slug: row.slug,
		title: row.title,
		description: row.description,
		sortOrder: row.sort_order,
		createdAt: iso(row.created_at),
		updatedAt: iso(row.updated_at),
		count: Number(row.count ?? 0)
	};
}
var seedPromise = null;
async function ensureSeeded() {
	seedPromise ??= (async () => {
		const sql = await getSql();
		if ((await sql`
      select value from reliquary_meta where key = 'seeded'
    `).length > 0) return;
		for (const col of SEED_COLLECTIONS) await sql`
        insert into collections (id, slug, title, description, sort_order)
        values (${col.id}, ${col.slug}, ${col.title}, ${col.description}, ${col.sortOrder})
        on conflict (id) do nothing
      `;
		for (const art of SEED_ARTIFACTS) await sql`
        insert into artifacts (
          id, slug, title, description, html, collection_id, tags, kind
        ) values (
          ${art.id}, ${art.slug}, ${art.title}, ${art.description}, ${art.html},
          ${art.collectionId}, ${JSON.stringify(art.tags)}, ${art.kind}
        )
        on conflict (id) do nothing
      `;
		await sql`
      insert into reliquary_meta (key, value) values ('seeded', '1')
      on conflict (key) do nothing
    `;
	})().catch((err) => {
		seedPromise = null;
		throw err;
	});
	return seedPromise;
}
async function uniqueSlug(table, base, excludeId) {
	const sql = await getSql();
	let slug = slugify(base);
	for (let i = 0; i < 50; i += 1) {
		const candidate = i === 0 ? slug : `${slug}-${i + 1}`;
		if ((table === "artifacts" ? excludeId ? await sql`
              select id from artifacts where slug = ${candidate} and id != ${excludeId}
            ` : await sql`select id from artifacts where slug = ${candidate}` : excludeId ? await sql`
              select id from collections where slug = ${candidate} and id != ${excludeId}
            ` : await sql`select id from collections where slug = ${candidate}`).length === 0) return candidate;
	}
	return `${slug}-${crypto.randomUUID().slice(0, 8)}`;
}
async function resolveCollectionId(collectionId, collection) {
	if (collectionId === null) return null;
	const sql = await getSql();
	const key = collectionId || collection || null;
	if (!key) return null;
	const rows = await sql`
    select id from collections where id = ${key} or slug = ${key} limit 1
  `;
	if (rows.length === 0) throw new ReliquaryError("Collection not found", 404, "NOT_FOUND");
	return rows[0].id;
}
async function listCollections() {
	await ensureSeeded();
	return (await (await getSql())`
    select c.*, (
      select count(*)::int from artifacts a where a.collection_id = c.id
    ) as count
    from collections c
    order by c.sort_order asc, c.title asc
  `).map(mapCollection);
}
async function listArtifacts(opts) {
	await ensureSeeded();
	let items = (await (await getSql())`
    select a.id, a.slug, a.title, a.description, a.collection_id, a.tags, a.kind,
      a.created_at, a.updated_at,
      c.slug as collection_slug, c.title as collection_title
    from artifacts a
    left join collections c on c.id = a.collection_id
    order by a.updated_at desc
  `).map(mapSummary);
	if (opts?.collection) {
		const key = opts.collection;
		items = items.filter((a) => a.collectionId === key || a.collectionSlug === key);
	}
	if (opts?.tag) {
		const tag = opts.tag.toLowerCase();
		items = items.filter((a) => a.tags.includes(tag));
	}
	if (opts?.q) {
		const q = opts.q.trim().toLowerCase();
		if (q) items = items.filter((a) => {
			return `${a.title} ${a.description} ${a.tags.join(" ")} ${a.collectionTitle ?? ""}`.toLowerCase().includes(q);
		});
	}
	return items;
}
async function getLibrary() {
	const [collections, artifacts] = await Promise.all([listCollections(), listArtifacts()]);
	return {
		collections,
		artifacts
	};
}
async function getArtifact(idOrSlug) {
	await ensureSeeded();
	const rows = await (await getSql())`
    select a.id, a.slug, a.title, a.description, a.html, a.collection_id, a.tags, a.kind,
      a.created_at, a.updated_at,
      c.slug as collection_slug, c.title as collection_title
    from artifacts a
    left join collections c on c.id = a.collection_id
    where a.id = ${idOrSlug} or a.slug = ${idOrSlug}
    limit 1
  `;
	if (rows.length === 0) notFound("Artifact");
	return mapArtifact(rows[0]);
}
async function getCollection(idOrSlug) {
	await ensureSeeded();
	const rows = await (await getSql())`
    select c.*, (
      select count(*)::int from artifacts a where a.collection_id = c.id
    ) as count
    from collections c
    where c.id = ${idOrSlug} or c.slug = ${idOrSlug}
    limit 1
  `;
	if (rows.length === 0) notFound("Collection");
	return mapCollection(rows[0]);
}
async function createArtifact(input) {
	await ensureSeeded();
	const title = input.title.trim();
	if (!title) throw new ReliquaryError("Title is required");
	const html = ensureDocument(input.html, title);
	if (new TextEncoder().encode(html).length > 15e5) throw new ReliquaryError("HTML is too large", 413, "TOO_LARGE");
	const collectionId = await resolveCollectionId(input.collectionId, input.collection);
	const id = crypto.randomUUID();
	const slug = await uniqueSlug("artifacts", input.slug || title);
	const tags = normalizeTags(input.tags ?? []);
	const kind = inferKind(html);
	await (await getSql())`
    insert into artifacts (id, slug, title, description, html, collection_id, tags, kind)
    values (
      ${id}, ${slug}, ${title}, ${input.description?.trim() ?? ""}, ${html},
      ${collectionId}, ${JSON.stringify(tags)}, ${kind}
    )
  `;
	return getArtifact(id);
}
async function updateArtifact(idOrSlug, patch) {
	const current = await getArtifact(idOrSlug);
	const title = patch.title?.trim() ?? current.title;
	if (!title) throw new ReliquaryError("Title is required");
	const html = patch.html !== void 0 ? ensureDocument(patch.html, title) : current.html;
	if (new TextEncoder().encode(html).length > 15e5) throw new ReliquaryError("HTML is too large", 413, "TOO_LARGE");
	const collectionId = patch.collectionId !== void 0 || patch.collection !== void 0 ? await resolveCollectionId(patch.collectionId, patch.collection) : current.collectionId;
	const slug = patch.slug !== void 0 ? await uniqueSlug("artifacts", patch.slug || title, current.id) : current.slug;
	const tags = patch.tags !== void 0 ? normalizeTags(patch.tags) : current.tags;
	const description = patch.description !== void 0 ? patch.description.trim() : current.description;
	const kind = inferKind(html);
	await (await getSql())`
    update artifacts set
      slug = ${slug},
      title = ${title},
      description = ${description},
      html = ${html},
      collection_id = ${collectionId},
      tags = ${JSON.stringify(tags)},
      kind = ${kind},
      updated_at = now()
    where id = ${current.id}
  `;
	return getArtifact(current.id);
}
async function deleteArtifact(idOrSlug) {
	const current = await getArtifact(idOrSlug);
	await (await getSql())`delete from artifacts where id = ${current.id}`;
	return { ok: true };
}
async function createCollection(input) {
	await ensureSeeded();
	const title = input.title.trim();
	if (!title) throw new ReliquaryError("Title is required");
	const id = crypto.randomUUID();
	const slug = await uniqueSlug("collections", input.slug || title);
	const sql = await getSql();
	const sortOrder = ((await sql`
    select coalesce(max(sort_order), -1)::int as n from collections
  `)[0]?.n ?? -1) + 1;
	await sql`
    insert into collections (id, slug, title, description, sort_order)
    values (${id}, ${slug}, ${title}, ${input.description?.trim() ?? ""}, ${sortOrder})
  `;
	return getCollection(id);
}
async function updateCollection(idOrSlug, patch) {
	const current = await getCollection(idOrSlug);
	const title = patch.title?.trim() ?? current.title;
	if (!title) throw new ReliquaryError("Title is required");
	const slug = patch.slug !== void 0 ? await uniqueSlug("collections", patch.slug || title, current.id) : current.slug;
	const description = patch.description !== void 0 ? patch.description.trim() : current.description;
	await (await getSql())`
    update collections set
      slug = ${slug},
      title = ${title},
      description = ${description},
      updated_at = now()
    where id = ${current.id}
  `;
	return getCollection(current.id);
}
async function deleteCollection(idOrSlug) {
	const current = await getCollection(idOrSlug);
	const sql = await getSql();
	await sql`update artifacts set collection_id = null where collection_id = ${current.id}`;
	await sql`delete from collections where id = ${current.id}`;
	return { ok: true };
}
//#endregion
export { getArtifact as a, listCollections as c, updateCollection as d, __exportAll as f, deleteCollection as i, store_server_exports as l, createCollection as n, getCollection as o, deleteArtifact as r, listArtifacts as s, createArtifact as t, updateArtifact as u };
