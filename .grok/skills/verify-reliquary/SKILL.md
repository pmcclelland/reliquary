---
name: verify-reliquary
description: >
  Drive the Reliquary web UI (guest library, wiki page, live share, collection
  shelves, API & MCP docs) the way a signed-out visitor does. Use when verifying
  Reliquary UI, proving guest browse/share, or running /verify-reliquary.
---

# Verify Reliquary

This skill is invoked as `.cursor/skills/verify-reliquary/` (this repo stores
Cursor skills under `.grok/skills/`; `.cursor/skills` is a symlink there).

Drive the **local** Reliquary web app — a wiki of living HTML artifacts — as a
signed-out guest. Guest mode is first-class: visitors see an in-memory seeded
sample library. Do **not** drive production (`https://reliquary.pmcclel.land`).

Read [`features/`](features/) before claiming a feature is verified. The first
mapped proof is the **Guest seeded Welcome walk** in
[`features/wiki-page.md`](features/wiki-page.md).

Keep the map honest with `/maintain-verification-skill` as the app changes.

## Launch

From the repo root, with **`DATABASE_URL` unset** (embedded in-memory PGLite).
Do not start Vite directly.

```bash
# refuse if a shared DB is wired — guest proofs must stay in-process
test -z "${DATABASE_URL:-}" || { echo "DATABASE_URL must be unset"; exit 1; }

npm install          # if node_modules is missing
npm run db:migrate   # no-op-safe; only needed when DATABASE_URL is Postgres
npm run dev          # binds 0.0.0.0:8080 via scripts/with-app-env.mjs
```

Or through this skill’s helper (records the pid this run owns):

```bash
node .cursor/skills/verify-reliquary/scripts/verify-reliquary.mjs launch
# returns after :8080 answers; the dev server stays in its own process group
```

Revive contract in this sandbox: `sh /workspace/startup.sh` — if
`http://127.0.0.1:8080/` already answers, it exits 0; otherwise it backgrounds
`npm run dev`.

| Role | Bind | Port |
| --- | --- | --- |
| Dev / live preview (drive target) | `0.0.0.0` | **8080** |
| Built QA only | `127.0.0.1` | **8081** (`npm run preview:restart` / `preview:stop`) |

**Ready:** `curl -sf -o /dev/null --max-time 2 http://127.0.0.1:8080/`. Stronger
signal: GET `/` body contains `A wiki of living artifacts`; GET `/api/mcp` JSON
has `"name":"reliquary"`.

**Two `npm run dev` instances: no.** `strictPort: true` on 8080. Dev + built
preview on 8081 is a different job — do not treat `:8081` as a second writable
session.

**Env (names only — no values):**

| Name | Guest verify | Notes |
| --- | --- | --- |
| `DATABASE_URL` | **leave unset** | Unset → PGLite (in-memory, per process). Set → Neon/`pg`. Shared Neon can serve someone else’s `/s/welcome`. |
| `BETTER_AUTH_SECRET` / `BETTER_AUTH_URL` | optional | Fallbacks exist. Not needed for guest. |
| `VITE_AUTH_ENABLED` | unset | Auth is ON. `"false"` invents a `dev-user` and breaks the guest/session split. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | unset for first proof | Google button only when both set. Do not complete OAuth. |
| `GROK_AUTH_*` | optional | Not needed for guest. |
| `RELIQUARY_URL` / `RELIQUARY_TOKEN` | MCP stdio only | Token issued on `/docs` after sign-in. Never mint against a shared DB. |

Auth-gated paths (`/new`, `/a/:slug/edit`, History, collaborators, Save to
library writes, MCP token CRUD) stay **out of scope** until a later PGLite-only
auth pass. `/new` redirects to `/login`.

## Doctor

Read-only. Run first whenever anything looks off. Pass only when every check
below holds.

```bash
node .cursor/skills/verify-reliquary/scripts/verify-reliquary.mjs doctor
```

Manual equivalent:

```bash
test -z "${DATABASE_URL:-}"
curl -sf --max-time 2 http://127.0.0.1:8080/ | grep -q "A wiki of living artifacts"
curl -sf --max-time 2 http://127.0.0.1:8080/api/mcp | grep -q '"name":"reliquary"'
curl -sf --max-time 2 http://127.0.0.1:8080/a/welcome | grep -q "Welcome to Reliquary"
# guest is not a fake actor — list API stays unauthorized
code=$(curl -s -o /tmp/rly-artifacts.json -w "%{http_code}" http://127.0.0.1:8080/api/artifacts)
test "$code" = "401"
grep -q '"code":"UNAUTHORIZED"' /tmp/rly-artifacts.json
```

Also healthy (not required to pass doctor, useful when debugging):

- `GET /s/welcome` `200` (SQL then guest fallback)
- `GET /api/artifacts/welcome/html` HTML contains `A place to keep things that move`
- `GET /docs` `200`, `GET /login` `200`

Fail closed if `DATABASE_URL` is set. Do not “doctor” by writing to Neon, creating
accounts, or issuing MCP tokens.

## Drive

**Harness:** Playwright as a library (`playwright` is a devDependency; there is
no `playwright.config.*` and no e2e suite). `scripts/browser-smoke.mjs` only
loads `/` — necessary but not sufficient. There are **no `data-testid`s**. Prefer
ARIA roles, accessible names, visible text, and routes.

Repo root helper (implements the first proof):

```bash
node .cursor/skills/verify-reliquary/scripts/verify-reliquary.mjs drive guest-welcome
```

Ad-hoc Playwright (Chromium, signed-out, `http://127.0.0.1:8080`):

| Control | Handle |
| --- | --- |
| Library search | `getByRole('textbox', { name: 'Search artifacts' })` |
| Welcome card | `getByRole('link', { name: /Welcome to Reliquary/ })` → `/a/welcome` |
| Source | `getByRole('button', { name: 'Source' })` |
| Open (live) | `getByRole('link', { name: 'Open' })` → `/s/welcome` |
| Share | `getByRole('button', { name: 'Share' })` → dialog `Share Welcome to Reliquary`, input `aria-label="Share link"` |
| Sign in to save (wiki, guest) | `getByRole('banner').getByRole('link', { name: 'Sign in to save' })` → `/login` (sidebar has a second copy) |
| More menu | `getByRole('button', { name: 'More' })` — guest: Copy share link, Copy HTML; no History/Delete |
| Live bar back | `getByRole('link', { name: 'Back to Reliquary' })` |
| Copy share (live) | `getByRole('button', { name: 'Copy share link' })` |
| Save (guest, live) | `getByRole('link', { name: /Save to library\|Save/ })` → `/login?next=/s/welcome` |
| Sidebar / mobile | `aria-label="Open menu"` / `Close menu`; `Collapse sidebar` / `Expand sidebar`; `aria-controls="reliquary-sidebar"` |
| Sidebar nav | `All artifacts`, `Guides`, `Motion`, `Interface`, `API & MCP`, `Sign in`; guest CTA `Sign in to save` |
| Command palette | `Ctrl/Cmd+K`, `aria-label="Search Reliquary"` |
| Theme | `aria-label="Appearance"` |
| Artifact iframe | `iframe[title="Welcome to Reliquary"]` (title = artifact title). Guest Welcome body: **A place to keep things that move.** |
| Source pane | `pre.source-listing`; line ids `L1`, `L2`, … |
| Login | headings `Open your library` / `Create a library`; link **Browse the sample library** → `/` |
| Docs | `h1` `API & MCP`; guest copy “Sign in to issue MCP tokens” |
| 404 | `Not in the library` |

Guest catalog (in-memory; stamps `2026-01-01T00:00:00.000Z`; `library.guest === true`):

| Slug | Title | Collection | Tags |
| --- | --- | --- | --- |
| `welcome` | Welcome to Reliquary | Guides | guide, wiki |
| `display-heading` | Display heading | Guides | guide, type |
| `harmonic` | Harmonic | Motion | motion, canvas |
| `solstice` | Solstice | Motion | motion, study |
| `tessera` | Tessera | Interface | ui, tool |

IDs (`art-welcome`, …) also resolve. Share-copy uses the id (`/s/art-welcome`).

**First proof (no Google / no auth) — Guest seeded Welcome walk:**

1. Launch with `DATABASE_URL` unset; wait until `:8080` answers.
2. Open `/` signed out. Expect `A wiki of living artifacts` and **Welcome to Reliquary**.
3. Click that card (or goto `/a/welcome`). Expect wiki chrome + iframe lead **A place to keep things that move.**
4. Click **Source**. Expect a listing with that phrase / `<title>Welcome to Reliquary</title>`.
5. Click **Open**. Expect `/s/welcome` (or `/s/art-welcome`), thin bar, same iframe, **Save to library** as a login link — not a write.

Smoke of `/` alone is not this proof:

```bash
mkdir -p /workspace/screenshots
node scripts/browser-smoke.mjs http://127.0.0.1:8080/ /workspace/screenshots/app-builder-preview.png
```

## Evidence

Capture **action + resulting state**, not a single still of `/`.

Directory (named; survives cleanup):

```text
artifacts/verify-reliquary/<run-id>/
```

The helper writes that path (default run id `guest-welcome-<timestamp>` or
`--run-id`). Include:

- Desktop (1280×800) screenshots of library, wiki, Source, and live share.
- Optional mobile (390×844) of the same steps when layout is under test.
- A text/ARIA dump or `verdict.json` with URLs, visible headings, iframe lead,
  source excerpt, save-link href, HTTP checks, and console errors.
- Feature id + entry point on every artifact (`guest-welcome` / `/` → `/a/welcome` → `/s/welcome`).

**Visible proof:** library heading + a seed title; wiki title + `#guide` / `#wiki`
+ iframe lead; Source listing contains the lead or welcome `<title>`; share thin
bar + same iframe + URL `/s/welcome` or `/s/art-welcome`; guest chrome **Sign in
to save**, no Edit / History / Delete.

**HTTP proof:** `GET /`, `/a/welcome`, `/s/welcome` are `200`; `GET /api/mcp` is
`{ name: "reliquary", tools: [...] }`; `GET /api/artifacts` without auth is `401`
`{ error, code: "UNAUTHORIZED" }`.

**Not proof:** `localStorage` sidebar key, PGLite internals, `npm test` alone,
production `reliquary.pmcclel.land`.

## Cleanup

Kill only the `npm run dev` process **this run started** (not by process name).
`npm run preview:stop` frees `:8081` if this run started a built preview.

```bash
node .cursor/skills/verify-reliquary/scripts/verify-reliquary.mjs cleanup
```

Cleanup removes the helper’s `/tmp/verify-reliquary/state.json` and stops an
**owned** dev server. It **never** deletes `artifacts/verify-reliquary/`. After
cleanup, `ls artifacts/verify-reliquary/<run-id>/` must still list the proof.

If launch reused a server this run did not start, cleanup leaves it running.

## Helpers

| Helper | Role |
| --- | --- |
| `.cursor/skills/verify-reliquary/scripts/verify-reliquary.mjs` | Launch / doctor / drive / cleanup. Executable; repo-root invocation below. Launch detaches `npm run dev` (stdio to `/tmp/verify-reliquary/dev.log`) and returns when `:8080` answers. |
| `npx playwright install chromium` | Once, if drive fails with Playwright “Executable doesn't exist”. |
| `scripts/browser-smoke.mjs` | Headless Chromium still of `/` (desktop + mobile). Not a feature walk. |
| `src/lib/reliquary/guest.test.ts` | Node tests for seed slugs/titles — catalog doctor, not a UI drive. |

```bash
node .cursor/skills/verify-reliquary/scripts/verify-reliquary.mjs --help
node .cursor/skills/verify-reliquary/scripts/verify-reliquary.mjs launch
node .cursor/skills/verify-reliquary/scripts/verify-reliquary.mjs doctor
node .cursor/skills/verify-reliquary/scripts/verify-reliquary.mjs drive guest-welcome --run-id guest-welcome-proof
node .cursor/skills/verify-reliquary/scripts/verify-reliquary.mjs cleanup
```

`--reuse` on launch adopts an already-healthy `:8080` without recording ownership.

## Isolation and later work

PGLite is per process and wiped on restart. Guest `/` and `/a/:slug` never write
it; `/s/:slug` and `GET /api/artifacts/:id/html` query SQL first, then fall back
to the guest seed.

If `DATABASE_URL` is set, Better Auth and relic rows share that Postgres.
`/s/welcome` can return another user’s `welcome`. Sign-in / `ensureSeeded`
inserts the sample library. **Unset `DATABASE_URL`**, stay guest, never issue
tokens or create accounts against a URL that might be production.

Later (auth, PGLite only): email signup, `/new`, edit, History restore,
collaborators, Save to library follow, MCP token + one `list_artifacts` call.
Not this skill’s first proof.

## Feature map

[`features/README.md`](features/README.md) is the maintained index. Each feature
file uses four H2s: `Sub-features`, `How to get to it (user POV)`,
`Driving it with Playwright`, `Gotchas`.
