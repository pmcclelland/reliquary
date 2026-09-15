# Wiki page

A wiki page (`/a/:slug`) shows the artifact title, tags, a sandboxed iframe of
the living HTML, and guest chrome: Source, Open, Share, Sign in to save. Guests
do not see Edit, History, or Delete. This file is the **first proof recipe**:
the Guest seeded Welcome walk.

## Sub-features

- `wiki-open` opens Welcome from the library card or `/a/welcome` (also
  `/a/art-welcome`).
- `wiki-iframe` renders the Welcome lead **A place to keep things that move.**
- `wiki-source` toggles Source and shows a listing with the lead or
  `<title>Welcome to Reliquary</title>`.
- `wiki-open-live` follows **Open** to `/s/welcome`.
- `wiki-share` opens the Share dialog titled `Share Welcome to Reliquary`.
- `wiki-guest-chrome` shows **Sign in to save** and hides Edit / History / Delete.

## How to get to it (user POV)

- Choose the **Welcome to Reliquary** card on `/`.
- Open `/a/welcome` or `/a/art-welcome` directly.
- Choose Welcome from the command palette (`Ctrl/Cmd+K`).
- From a collection shelf, choose the Welcome card.

## Driving it with Playwright

Preconditions:

- Reliquary is healthy at `http://127.0.0.1:8080` with `DATABASE_URL` unset.
- The browser has no Reliquary session cookie.
- `verify-reliquary.mjs doctor` has passed.
- This is the first mapped proof. Prefer the helper:
  `node .cursor/skills/verify-reliquary/scripts/verify-reliquary.mjs drive guest-welcome --run-id <run-id>`.

Guest seeded Welcome walk (`/` → `/a/welcome` → Source → Open `/s/welcome`):

- **Library.** Open `/` signed out. Run `page.goto('http://127.0.0.1:8080/')`.
  Expect heading `A wiki of living artifacts` and
  `getByRole('link', { name: /Welcome to Reliquary/ })`.
- **Open wiki.** Choose that card. Run
  `page.getByRole('link', { name: /Welcome to Reliquary/ }).click()`. URL is
  `/a/welcome`. Heading is `Welcome to Reliquary`. Tags include `#guide` and
  `#wiki`. Guest control `getByRole('link', { name: 'Sign in to save' })` is
  visible. There is no Edit or History control.
- **Iframe render.** Wait for `iframe[title="Welcome to Reliquary"]`. Inside the
  frame, the lead **A place to keep things that move.** is visible.
- **Source.** Choose **Source**. Run
  `page.getByRole('button', { name: 'Source' }).click()`. A
  `pre.source-listing` is visible and its text contains
  `A place to keep things that move` or `<title>Welcome to Reliquary</title>`.
  Line ids `L1`, `L2`, … exist. Guest seeds have no explainer pane.
- **Open live.** Choose **Open**. Run
  `page.getByRole('link', { name: 'Open' }).click()`. URL is `/s/welcome` (or
  `/s/art-welcome`). Thin bar shows the title. Same iframe lead. Save is
  `getByRole('link', { name: /Save to library|Save/ })` pointing at `/login`,
  not a write.
- **Proof.** Write screenshots and a verdict under
  `artifacts/verify-reliquary/<run-id>/` for library, wiki, Source, and share.
  `verdict.json` records each URL, the iframe lead, a source excerpt, the save
  href, and zero uncaught page errors.

Optional on the same wiki page (not required for the first proof):

- **Share dialog.** Run `page.getByRole('button', { name: 'Share' }).click()`.
  Dialog title is `Share Welcome to Reliquary`; input
  `getByRole('textbox', { name: 'Share link' })` holds a `/s/art-welcome` URL.
- **More menu.** Run `page.getByRole('button', { name: 'More' }).click()`. Items
  are Copy share link and Copy HTML. History and Delete are absent.

## Gotchas

- Iframe `src` is a blob URL. Assert `iframe[title="Welcome to Reliquary"]` and
  frame text, not the blob string.
- Source highlight is async. The listing is readable immediately as plain text;
  wait for `pre.source-listing` rather than Shiki tokens.
- **Open** is a link (`getByRole('link', { name: 'Open' })`), not a button.
  **Source** and **Share** are buttons.
- Guest **Sign in to save** is a login link. Following it is not “Save to
  library” proof.
- `/a/:slug/history` and `?history=open` exist for signed-in owners. The guest
  More menu hides History — do not treat a forced history URL as guest chrome.
- Do not complete sign-in from this page. That is a later PGLite-only pass.
