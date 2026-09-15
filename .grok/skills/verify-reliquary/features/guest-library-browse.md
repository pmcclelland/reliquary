# Guest library browse

The signed-out home lists the in-memory sample library: collection shelves, a
search box, tag chips, and cards that open wiki pages. Guests see **Sign in to
save**, not a writable New artifact flow.

## Sub-features

- `library-heading` shows `A wiki of living artifacts` and at least one seed title.
- `library-shelves` groups cards under Guides, Motion, and Interface.
- `library-search` filters by `/?q=…` from the Search artifacts box.
- `library-tag` filters by `/?tag=guide` from a tag chip or URL.
- `library-card` opens a wiki page from a card link.
- `library-nav` reaches All artifacts, collection titles, API & MCP, and Sign in.

## How to get to it (user POV)

- Open `/` while signed out.
- Choose **Browse the sample library** on `/login`.
- Choose sidebar **All artifacts** (or the Reliquary wordmark) from any guest page.
- Open `/?q=welcome` or `/?tag=guide` directly.
- Press `Ctrl/Cmd+K` and pick a listed artifact or All artifacts.

## Driving it with Playwright

Preconditions:

- Reliquary is healthy at `http://127.0.0.1:8080` with `DATABASE_URL` unset.
- The browser has no Reliquary session cookie.
- `verify-reliquary.mjs doctor` reports the library heading, MCP name
  `reliquary`, guest `/a/welcome`, and `GET /api/artifacts` → `401`.

- **Open library.** Go to `/`. Run `page.goto('http://127.0.0.1:8080/')`. The
  heading `A wiki of living artifacts` is visible and a link named
  `/Welcome to Reliquary/` is present. Also expect **Harmonic**, **Solstice**,
  **Tessera**, and **Display heading**.
- **Search.** Type in the search box. Run
  `page.getByRole('textbox', { name: 'Search artifacts' }).fill('welcome')`.
  The URL becomes `/?q=welcome` (or contains `q=welcome`) and **Welcome to
  Reliquary** remains while **Harmonic** is gone.
- **Tag filter.** Open `/?tag=guide`. Run
  `page.goto('http://127.0.0.1:8080/?tag=guide')`. A “Tagged #guide” state
  appears and the visible cards include Welcome and Display heading, not
  Harmonic.
- **Sidebar collection.** Choose **Guides**. Run
  `page.getByRole('link', { name: 'Guides' }).click()` (desktop; on mobile open
  `getByRole('button', { name: 'Open menu' })` first). The URL is `/c/guides`.
- **Open wiki from card.** Choose the Welcome card. Run
  `page.getByRole('link', { name: /Welcome to Reliquary/ }).click()`. The URL is
  `/a/welcome` and the heading reads `Welcome to Reliquary`.
- **Command palette.** From `/`, press Control+K (Meta+K on macOS). Run
  `page.keyboard.press('Control+k')`. A dialog labeled `Search Reliquary`
  appears. This is an entry point, not a substitute for the card click.
- **Proof.** Capture the populated library before leaving `/`.
  `page.screenshot` → `artifacts/verify-reliquary/<run-id>/library.png`. The
  shot and dump show the heading plus **Welcome to Reliquary**.

## Gotchas

- `scripts/browser-smoke.mjs` only loads `/`. It does not prove search, tags, or
  card navigation.
- Search updates the URL as you type (`replace: true`). Wait for the filtered
  list or the query string, not a fixed sleep.
- Mobile hides the sidebar. Use **Open menu** before clicking **Guides** or
  **All artifacts**.
- Guest CTA is **Sign in to save**, not **New artifact**. Choosing it goes to
  `/login` and is not a library mutation.
- Do not treat `localStorage` `reliquary-sidebar-collapsed` as proof.
