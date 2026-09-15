# Collection shelf

A collection page (`/c/:slug`) is one shelf of the guest library: a title, an
optional description, and member cards. Guests do not see **Remove collection**.

## Sub-features

- `shelf-guides` opens `/c/guides` with heading Guides and Welcome / Display
  heading cards.
- `shelf-motion` opens `/c/motion` with Harmonic and Solstice.
- `shelf-interface` opens `/c/interface` with Tessera.
- `shelf-card` opens a member wiki page from a card.
- `shelf-guest` hides **Remove collection**.

## How to get to it (user POV)

- Choose **Guides**, **Motion**, or **Interface** in the sidebar.
- Open `/c/guides`, `/c/motion`, or `/c/interface` directly.
- Choose the collection crumb (`Guides / welcome`) on a wiki page.

## Driving it with Playwright

Preconditions:

- Reliquary is healthy at `http://127.0.0.1:8080` with `DATABASE_URL` unset.
- The browser has no Reliquary session cookie.
- `verify-reliquary.mjs doctor` has passed.

- **Sidebar entry.** From `/` on desktop, choose **Guides**. Run
  `page.getByRole('link', { name: 'Guides' }).click()`. On mobile, open
  `getByRole('button', { name: 'Open menu' })` first. URL is `/c/guides`.
- **Address bar.** `page.goto('http://127.0.0.1:8080/c/guides')` is the same
  shelf. Use this when the recipe names the URL.
- **Shelf contents.** Heading is `Guides`. Cards include
  `getByRole('link', { name: /Welcome to Reliquary/ })` and
  `getByRole('link', { name: /Display heading/ })`. Harmonic is absent.
- **Guest chrome.** There is no button or link named `Remove collection`.
- **Open member.** Choose Welcome. Run
  `page.getByRole('link', { name: /Welcome to Reliquary/ }).click()`. URL is
  `/a/welcome`.
- **Other shelves.** `/c/motion` heading `Motion` with Harmonic and Solstice.
  `/c/interface` heading `Interface` with Tessera.
- **Proof.** Screenshot `/c/guides` at
  `artifacts/verify-reliquary/<run-id>/collection-guides.png`. The shot shows
  heading Guides plus Welcome.

## Gotchas

- Collection titles are sidebar links, not a separate “Collections” control.
  Collapsed desktop sidebar hides titles behind tooltips — expand
  (`aria-label="Expand sidebar"`) or use the URL.
- Guest libraries never show **New collection**. That control is signed-in only.
- Empty-shelf copy (`This shelf is empty.`) does not apply to the seeded
  Guides / Motion / Interface shelves. If you see it, the instance is not the
  guest seed — stop and re-doctor.
- Do not delete a collection to “prove” guest isolation. There is no guest
  remove control; forcing a delete API would need a session.
