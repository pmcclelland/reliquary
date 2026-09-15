# Live share

Live share (`/s/:slug`) is a thin Reliquary bar over a full-bleed iframe of the
same public/guest artifact. Guests can copy the share link or follow Save to
`/login`. The walk’s last step lands here from wiki **Open**.

## Sub-features

- `share-open` loads `/s/welcome` or `/s/art-welcome` with the Welcome title.
- `share-iframe` shows the same lead **A place to keep things that move.**
- `share-back` returns to the library via **Back to Reliquary**.
- `share-copy` copies the share link from the bar button.
- `share-save-guest` keeps Save as a login link (`/login?next=/s/welcome`).

## How to get to it (user POV)

- Choose **Open** on `/a/welcome`.
- Open `/s/welcome` or `/s/art-welcome` directly.
- Open a share URL copied from the wiki Share dialog (id form `/s/art-welcome`).

## Driving it with Playwright

Preconditions:

- Reliquary is healthy at `http://127.0.0.1:8080` with `DATABASE_URL` unset.
- The browser has no Reliquary session cookie.
- `verify-reliquary.mjs doctor` has passed.
- Prefer arriving via wiki **Open** so the first proof stays one walk. Direct
  `goto('/s/welcome')` is a valid second entry point, not a substitute when the
  recipe asked for **Open**.

- **From wiki Open.** On `/a/welcome`, choose **Open**. Run
  `page.getByRole('link', { name: 'Open' }).click()`. URL matches
  `/s/welcome` or `/s/art-welcome`.
- **Thin bar.** Expect `getByRole('link', { name: 'Back to Reliquary' })`,
  visible title text `Welcome to Reliquary`,
  `getByRole('button', { name: 'Copy share link' })`, and
  `getByRole('link', { name: /Save to library|Save/ })`.
- **Iframe.** Wait for `iframe[title="Welcome to Reliquary"]`. Frame text
  includes **A place to keep things that move.**
- **Save is not a write.** Read the Save href. It is `/login` with
  `next=/s/welcome` (or the current share path). Do not click through to create
  an account.
- **Back.** Choose **Back to Reliquary**. Run
  `page.getByRole('link', { name: 'Back to Reliquary' }).click()`. URL is `/`
  and the library heading returns.
- **Direct entry.** `page.goto('http://127.0.0.1:8080/s/welcome')` yields the
  same bar and iframe. Use this only when the recipe names the address bar.
- **HTTP.** `GET /s/welcome` is `200`. `GET /api/artifacts/welcome/html` contains
  the welcome lead (SQL then guest fallback).
- **Proof.** Screenshot the share bar + iframe at
  `artifacts/verify-reliquary/<run-id>/share.png`. Record URL, iframe lead, and
  Save href in `verdict.json`.

## Gotchas

- `/s/:slug` queries SQL first, then falls back to the guest seed. With
  `DATABASE_URL` unset that fallback is this process. With a shared Neon URL,
  `/s/welcome` can be someone else’s relic — fail doctor instead of driving.
- Share-copy uses the artifact **id** (`/s/art-welcome`). The slug form
  `/s/welcome` also works. Either URL is a pass.
- On a narrow viewport the Save label is **Save**; on desktop it is **Save to
  library**. Match `/Save to library|Save/`.
- **Copy share link** may toast `Share link copied` or fall back if the
  clipboard is blocked. A toast is supporting evidence, not the whole proof.
- Do not treat a successful save mutation as guest proof. Guest Save must remain
  a link to login.
