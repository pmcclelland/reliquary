import { looksLikeDocument } from "./wrap.ts";

const BRIDGE_MARK = "reliquary-explainer";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "\u0026amp;")
    .replace(/</g, "\u0026lt;")
    .replace(/>/g, "\u0026gt;")
    .replace(/"/g, "\u0026quot;");
}

function bridgeScript(): string {
  return `<script>
(function () {
  document.addEventListener("click", function (event) {
    var el = event.target && event.target.closest
      ? event.target.closest("[data-line]")
      : null;
    if (!el) return;
    event.preventDefault();
    parent.postMessage(
      { source: "${BRIDGE_MARK}", line: el.getAttribute("data-line") || "" },
      "*"
    );
  });
})();
</script>`;
}

function injectBridge(doc: string): string {
  if (doc.includes(BRIDGE_MARK)) return doc;
  const script = bridgeScript();
  if (/<\/body>/i.test(doc)) {
    return doc.replace(/<\/body>/i, `${script}\n</body>`);
  }
  return `${doc.trimEnd()}\n${script}\n`;
}

function wrapExplainerFragment(source: string, title: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    :root { color-scheme: light dark; }
    * { box-sizing: border-box; }
    html, body { margin: 0; min-height: 100%; }
    body {
      font-family: Georgia, "Times New Roman", serif;
      color: #1a1714;
      background: #f7f1e6;
      line-height: 1.55;
      padding: 1.25rem 1.35rem 2rem;
    }
    html[data-theme="dark"] body {
      color: #f3efe6;
      background: #1e1914;
    }
    h1, h2, h3 { font-weight: 500; letter-spacing: -0.02em; }
    h1 { font-size: 1.45rem; margin: 0 0 0.75rem; }
    h2 { font-size: 1.1rem; margin: 1.4rem 0 0.4rem; }
    p { margin: 0 0 0.8rem; }
    a[data-line] {
      color: inherit;
      text-decoration: underline;
      text-decoration-color: #3d5468;
      text-underline-offset: 2px;
      cursor: pointer;
    }
    html[data-theme="dark"] a[data-line] { text-decoration-color: #8ea4b8; }
    code { font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 0.86em; }
  </style>
</head>
<body>
${source.trim()}
${bridgeScript()}
</body>
</html>
`;
}

/** Empty in, empty out. Fragments get a prose shell; documents get a click bridge. */
export function ensureExplainer(source: string, title: string): string {
  const trimmed = source.trim();
  if (!trimmed) return "";
  if (looksLikeDocument(trimmed)) return injectBridge(trimmed);
  return wrapExplainerFragment(trimmed, title);
}

export type LineRange = { start: number; end: number };

/** Parse "12" or "12-28" into a 1-based inclusive range. */
export function parseLineRange(raw: string): LineRange | null {
  const m = raw.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/);
  if (!m) return null;
  const start = Number(m[1]);
  const end = m[2] ? Number(m[2]) : start;
  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < start) {
    return null;
  }
  return { start, end };
}

export const EXPLAINER_MESSAGE_SOURCE = BRIDGE_MARK;
