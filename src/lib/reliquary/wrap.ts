import { inferKind } from "./kind.ts";

export function looksLikeDocument(source: string): boolean {
  const s = source.trimStart().slice(0, 240).toLowerCase();
  return s.startsWith("<!doctype") || s.startsWith("<html");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "\u0026amp;")
    .replace(/</g, "\u0026lt;")
    .replace(/>/g, "\u0026gt;")
    .replace(/"/g, "\u0026quot;");
}

function hasReactMount(source: string): boolean {
  return /ReactDOM\.(?:createRoot|render)|createRoot\s*\(/.test(source);
}

/*
 * A JSX module is JavaScript source, so it cannot carry HTML plumbing. Markup
 * of this kind means we were handed a fragment, and wrapping a fragment in the
 * JSX harness renders it as broken JSX.
 */
function carriesHtmlPlumbing(source: string): boolean {
  return /<\s*(?:script|style|link|meta|head|body)\b/i.test(source);
}

function looksLikeJsxModule(source: string): boolean {
  if (looksLikeDocument(source)) return false;
  if (carriesHtmlPlumbing(source)) return false;
  return (
    /(?:from\s+['"]react['"]|require\(\s*['"]react['"]\s*\))/.test(source) ||
    /(?:function|const|let|var|class)\s+App\b/.test(source) ||
    // A JSX return opens its element immediately: `return (\n  <div>`. Allowing
    // arbitrary text in between matched any inline script that happened to be
    // followed by a tag somewhere later in the fragment.
    (/return\s*\(\s*<\s*[A-Za-z]/.test(source) &&
      /(?:function|=>)/.test(source)) ||
    inferKind(source) === "react"
  );
}

function wrapJsx(source: string, title: string): string {
  const body = source.trim();
  const mount = hasReactMount(body)
    ? ""
    : `
if (typeof App === "function") {
  const rootEl = document.getElementById("root");
  const root = ReactDOM.createRoot(rootEl);
  root.render(React.createElement(App));
}
`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    html, body, #root { margin: 0; min-height: 100%; }
    body { font-family: ui-sans-serif, system-ui, sans-serif; }
  </style>
  <script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel" data-presets="react">
${body}
${mount}
  </script>
</body>
</html>
`;
}

function wrapFragment(source: string, title: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    /*
     * A minimal reset only — deliberately the same shape claude.ai wraps a
     * fragment in, so one fragment renders alike in both hosts. Anything
     * opinionated here (a font stack, a ground colour, a max-width) silently
     * restyles pages authored against the other host.
     */
    *, *::before, *::after { box-sizing: border-box; }
    html { -webkit-text-size-adjust: 100%; }
    body { margin: 0; }
    h1, h2, h3, h4, p, dl, dd, figure, blockquote { margin: 0; }
    ul, ol { margin: 0; padding: 0; }
    img, svg, video, canvas, iframe { display: block; max-width: 100%; }
    button, input, select, textarea { font: inherit; color: inherit; }
  </style>
</head>
<body>
${source.trim()}
</body>
</html>
`;
}

/** Turn a fragment, JSX module, or full document into a self-contained HTML file. */
export function ensureDocument(source: string, title: string): string {
  const trimmed = source.trim();
  if (!trimmed) return wrapFragment("", title);
  if (looksLikeDocument(trimmed)) return trimmed;
  if (looksLikeJsxModule(trimmed)) return wrapJsx(trimmed, title);
  return wrapFragment(trimmed, title);
}
