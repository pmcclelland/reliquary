# API & MCP docs

`/docs` is the signed-out API and MCP reference. Guests can read it and see a
Sign in CTA. The token form is hidden. Discovery `GET /api/mcp` works without
auth; list/mutate APIs do not.

## Sub-features

- `docs-open` shows heading `API & MCP` at `/docs`.
- `docs-guest-cta` tells the visitor to Sign in to issue MCP tokens.
- `docs-no-token-form` hides Name / New token while `library.guest`.
- `docs-mcp-discovery` returns `{ name: "reliquary", tools: [...] }` from
  `GET /api/mcp` without a session.
- `docs-rest-guest` keeps `GET /api/artifacts` at `401 UNAUTHORIZED`.

## How to get to it (user POV)

- Choose sidebar **API & MCP**.
- Open `/docs` directly.
- Choose **API & MCP** in the command palette (`Ctrl/Cmd+K`).

## Driving it with Playwright

Preconditions:

- Reliquary is healthy at `http://127.0.0.1:8080` with `DATABASE_URL` unset.
- The browser has no Reliquary session cookie.
- `verify-reliquary.mjs doctor` has passed.
- Do not submit the token form, call `createMcpToken`, or send
  `Authorization: Bearer rly_…`.

- **Sidebar entry.** From `/`, choose **API & MCP**. Run
  `page.getByRole('link', { name: 'API & MCP' }).click()` (mobile: Open menu
  first). URL is `/docs`.
- **Address bar.** `page.goto('http://127.0.0.1:8080/docs')`. Heading `API & MCP`
  is visible. Copy includes **Sign in** and “to issue MCP tokens for your own
  library.”
- **No token form.** There is no `Name` field / `#token-name` and no **New
  token** submit. A visible token form means the session is not guest — stop.
- **MCP discovery.** `GET http://127.0.0.1:8080/api/mcp` (no cookie) is JSON
  with `"name":"reliquary"` and a `tools` array that includes `list_artifacts`,
  `get_artifact`, `create_artifact`, `update_artifact`, `delete_artifact`,
  `list_collections`, `create_collection`, `delete_collection`.
- **REST stays closed.** `GET /api/artifacts` is `401` with
  `"code":"UNAUTHORIZED"`. That is proof the guest library is not a fake actor.
- **Public HTML.** `GET /api/artifacts/welcome/html` (no auth) returns HTML
  containing `A place to keep things that move`.
- **Proof.** Screenshot `/docs` at
  `artifacts/verify-reliquary/<run-id>/docs.png`. Record the MCP JSON and the
  401 body in `verdict.json`.

## Gotchas

- `GET /api/mcp` is unauthenticated discovery. `POST /api/mcp` and REST
  mutations need a session cookie or `Authorization: Bearer rly_…`. A 401 on
  POST is expected for guests and is not a docs failure.
- Never mint a token against a `DATABASE_URL` that might be shared or
  production. Guest docs must not reveal a token.
- The stdio proxy `node mcp/server.mjs` needs `RELIQUARY_URL` and
  `RELIQUARY_TOKEN`. It is out of scope for this guest map.
- In-app docs at `/docs` are readable signed out. Do not skip `/docs` and call
  the page verified from `GET /api/mcp` alone.
