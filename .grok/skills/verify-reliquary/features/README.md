# Reliquary verification map

This directory is the maintained source for verifying the user-facing Reliquary
web UI. Read the index before driving the app, then use the matching feature
file as the recipe.

## Baseline preconditions

- Launch Reliquary with `npm run dev` on `http://127.0.0.1:8080` (`0.0.0.0:8080`).
- Keep `DATABASE_URL` unset so the process uses in-memory PGLite, not Neon.
- Drive as a signed-out guest. Do not complete Google OAuth or email signup.
- Do not mint MCP tokens or call authenticated REST/MCP writes.
- Run `node .cursor/skills/verify-reliquary/scripts/verify-reliquary.mjs doctor`
  and require the library heading, MCP discovery name `reliquary`, guest
  `/a/welcome`, and `GET /api/artifacts` → `401 UNAUTHORIZED`.
- Never drive production (`https://reliquary.pmcclel.land`) or an instance this
  run did not doctor.
- Never start a second `npm run dev` on 8080 (`strictPort: true`).

## Driving conventions

- Start every recipe from the signed-out guest library unless its preconditions
  say otherwise.
- Prefer ARIA roles and accessible names. This repo has no `data-testid`.
- Treat titles, slugs, and routes as literal (`Welcome to Reliquary`,
  `/a/welcome`, `/s/welcome`).
- Run browser actions through Playwright (or the `verify-reliquary.mjs` helper).
- Smoke of `/` (`scripts/browser-smoke.mjs`) is not a feature proof.
- Cleanup stops only the server this run started. Do not remove proof artifacts.

## Proof and skip reporting

- Capture the user action and the resulting state, not only the final screen.
- UI proof includes a screenshot with Reliquary identity visible and either an
  ARIA dump or a `verdict.json` of headings, URL, and iframe/source text.
- HTTP proof includes status and a distinctive body fragment (`name`, `code`,
  welcome lead).
- Mutation proof is out of scope for guest recipes. A Save / Sign in control
  must stay a login link.
- Record the feature ID and entry point used with every artifact under
  `artifacts/verify-reliquary/<run-id>/`.
- Report an unreachable path with the attempted command and the unmet
  precondition.
- Do not report a skipped entry point as verified through a different path.

## Feature entry contract

Each feature file starts with an H1 title and one paragraph describing the
user-visible behavior. It then uses exactly four H2 sections in this order.

1. `Sub-features` lists short IDs with one line for each behavior.
2. `How to get to it (user POV)` lists every user entry point.
3. `Driving it with Playwright` starts with `Preconditions:` and uses labeled
   bullets that pair each user action with an exact command and observable result.
4. `Gotchas` lists traps that can waste or invalidate a verification run.

Keep implementation details out of the map. Name only user paths, stable
handles, required state, commands, and observable proof.

## Features

- [Guest library browse](./guest-library-browse.md) covers the seeded shelves,
  search, tags, and card links on `/`.
- [Wiki page](./wiki-page.md) covers `/a/welcome`, Source, Share, Open, and the
  first proof: Guest seeded Welcome walk.
- [Live share](./live-share.md) covers `/s/welcome` (or wiki **Open**): thin bar,
  full-bleed iframe, copy share, Save → login.
- [Collection shelf](./collection-shelf.md) covers `/c/guides` (sidebar **Guides**)
  and guest-hidden Remove collection.
- [API & MCP docs](./api-mcp-docs.md) covers `/docs` as a signed-out reference
  with no token minting.
