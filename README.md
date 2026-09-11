# Reliquary

A wiki of living artifacts.

[![Reliquary](public/og.jpg)](https://reliquary.pmcclel.land)

Self-contained HTML — pages, motion studies, and small interfaces — filed like notes in a quiet archive. Visitors can browse a seeded sample library without signing in. Sign in with Google or email for a private library, with its own MCP tokens.

**[reliquary.pmcclel.land](https://reliquary.pmcclel.land)**

## Artifacts

An artifact is a single HTML file. It can be a typographic essay, a canvas study, or a React module that Reliquary wraps so it runs on its own. Nothing here is a multi-file app. The file is the work.

Send a full document when you can. Fragments are wrapped in a simple page. A module that defines `function App()` is wrapped with React 18 and Babel standalone. CDNs are allowed; local file paths are not.

An optional explainer (HTML notes with `data-line` citations) can sit beside Source when someone asks for one. Lists and the live share view omit it.

## Collections

A collection is a shelf. Give it a title and an optional description — the line under the name, the way Guides, Motion, and Interface are filed. Artifacts can sit on a shelf, move later, or stay unfiled.

| View | URL |
| --- | --- |
| Sign in | `/login` — or browse the sample library on `/` without an account |
| Library | `/` — sample shelves when signed out; your shelves when signed in |
| Wiki page | `/a/:slug` |
| Live share | `/s/:slug` — thin Reliquary bar; Save to library follows the original |
| Collection | `/c/:slug` |
| New / edit | `/new`, `/a/:slug/edit` — two-column metadata; Upload at the bottom; Choose .html to pick a file |
| History | `/a/:slug?history=open` — More → History; `/a/:slug/history` redirects here |
| API & MCP | `/docs` |

## Sharing & collaboration

Every relic has a public live view at `/s/:slug` — a thin Reliquary bar over the piece at full size. Anyone with the link can watch. The wiki page stays at `/a/:slug`.

**Save to library** on a share view files a row you own. Signed-out visitors go through sign-in and return. Shelf and slug stay yours. Title, HTML, notes, tags, and kind resolve from the original’s current tip while that source is still shareable. The HTML stored on your row is a fallback if the original is gone.

A content edit you are not allowed to write on the original becomes your own copy and stops following. Changing only the shelf or slug does not.

**History** lives on the source, append-only. More → History opens a sheet (it is not always on the page). Restore is owner-only: it writes that snapshot as a new tip. Followers, including collaborators, can browse the same list. `/a/:slug/history` opens the sheet (`?history=open`).

**Collaborators** are an owner allowlist, not a property of the link. Share → Collaborators: turn Editing on, then add someone by their Reliquary email. They write the live tip; revisions are attributed to them. A share link or Save to library never grants edit. Listed people cannot write while Editing is off.

## Agents

Agents file artifacts the same way people do: a title, a self-contained HTML document, optional collection and tags. Issue a named token per agent on **API & MCP** so you can revoke one without disconnecting the others.

Streamable HTTP:

```json
{
  "mcpServers": {
    "reliquary": {
      "url": "https://reliquary.pmcclel.land/api/mcp",
      "headers": {
        "Authorization": "Bearer rly_YOUR_TOKEN"
      }
    }
  }
}
```

Local stdio proxy:

```bash
RELIQUARY_URL=https://reliquary.pmcclel.land \
RELIQUARY_TOKEN=rly_YOUR_TOKEN \
node mcp/server.mjs
```

Tools: `list_artifacts`, `get_artifact`, `create_artifact`, `update_artifact`, `delete_artifact`, `list_collections`, `create_collection`, `delete_collection`.

On a followed relic, `update_artifact` keeps collection and slug local. Allowlisted collaborators write the shared original; other content edits fork.

The agent skill lives at [`skills/create-relic/SKILL.md`](skills/create-relic/SKILL.md). Slash `/create-relic`, or say “file this as a relic.”

REST uses the same bearer token (or a signed-in session cookie). Endpoints and payload shape are documented in-app at `/docs`.

## Stack

TanStack Start, React 19, Tailwind v4, Postgres, Better Auth. Deployed on Vercel.

## Develop

Node 22. Postgres via `DATABASE_URL`. Auth is Better Auth (`BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`): email and password, plus Google when `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set.

```bash
npm install
npm run db:migrate
npm run dev
```

`npm run dev` binds `0.0.0.0:8080`. Typecheck with `npm run typecheck`; production build with `npm run build`.
