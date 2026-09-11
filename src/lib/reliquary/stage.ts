/**
 * Host stage for relic iframes.
 *
 * Share (`/s/:slug`) and the edit split preview size the iframe to the pane,
 * not to a laptop. Full-bleed relics with large titles, `vw` type, or nowrap
 * heroes then collide or wrap into a crushed stack. The stage keeps a laptop
 * floor and scrolls sideways instead of compressing the document.
 *
 * Safety CSS is injected at preview time only — stored HTML is unchanged.
 */

export const ARTIFACT_STAGE_MIN_WIDTH_PX = 768;

export const STAGE_STYLE_MARK = "data-reliquary-stage";

const STAGE_SAFETY_CSS = `
html { overflow-x: auto; }
h1, h2, h3, h4, h5, h6 {
  overflow-wrap: break-word;
  max-width: 100%;
}
`.trim();

export function stageSafetyStyleTag(): string {
  return `<style ${STAGE_STYLE_MARK}>\n${STAGE_SAFETY_CSS}\n</style>`;
}

/** Idempotent. Prefers `<head>`; otherwise prepends. Never rewrites stored relics. */
export function injectStageSafety(html: string): string {
  if (html.includes(STAGE_STYLE_MARK)) return html;
  const tag = stageSafetyStyleTag();
  if (/<head\b/i.test(html)) {
    return html.replace(/<head\b[^>]*>/i, (open) => `${open}\n${tag}`);
  }
  if (/<html\b/i.test(html)) {
    return html.replace(/<html\b[^>]*>/i, (open) => `${open}\n<head>${tag}</head>`);
  }
  return `${tag}\n${html}`;
}

/** Fixture: a nowrap display title that collides in a narrow pane. */
export const DISPLAY_HEADING_FIXTURE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Display heading</title>
  <style>
    html, body { margin: 0; background: #f3efe6; color: #1a1714; }
    body { font-family: Georgia, "Times New Roman", serif; padding: 3rem 1.5rem 4rem; }
    .kicker {
      font-family: ui-sans-serif, system-ui, sans-serif;
      font-size: 0.72rem;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #6f675c;
      margin: 0 0 1rem;
    }
    .hero {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 1.25rem;
    }
    h1 {
      font-size: clamp(2.6rem, 8vw, 5.75rem);
      font-weight: 500;
      letter-spacing: -0.045em;
      line-height: 0.92;
      margin: 0;
      white-space: nowrap;
    }
    .year {
      font-family: ui-sans-serif, system-ui, sans-serif;
      font-size: 0.85rem;
      color: #6f675c;
      white-space: nowrap;
    }
    p { max-width: 36rem; color: #3f3a34; line-height: 1.55; }
  </style>
</head>
<body>
  <p class="kicker">Guides</p>
  <div class="hero">
    <h1>Things that move.</h1>
    <span class="year">2026</span>
  </div>
  <p>A full-bleed title. In a narrow host pane the words used to collide; the stage should keep them on one readable line.</p>
</body>
</html>
`;
