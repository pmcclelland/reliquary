import type { ArtifactKind } from "./types";

/*
 * Signals that the source actually *runs* React, rather than merely mentioning
 * it. Prose is the trap: a plain HTML page about React ("React 18",
 * "react-i18next") is not a React artifact, and misreading one routes a
 * fragment through the JSX harness in ensureDocument, which renders it as
 * broken JSX.
 */
const REACT_SIGNALS = [
  // Script tags loading React or a JSX transform.
  /<script\b[^>]*\bsrc=["'][^"']*\b(?:react(?:-dom)?|babel)\b[^"']*["']/i,
  // Babel/JSX script blocks.
  /<script\b[^>]*\btype=["']text\/(?:babel|jsx)["']/i,
  // Module imports and requires of React itself.
  /\bimport\b[^;]*\bfrom\s*["']react(?:-dom)?(?:\/[\w./-]+)?["']/,
  /\brequire\(\s*["']react(?:-dom)?(?:\/[\w./-]+)?["']\s*\)/,
  // Direct use of the React or ReactDOM globals as code.
  /\bReactDOM\s*\.\s*(?:createRoot|render|hydrate|hydrateRoot)\b/,
  /\bReact\s*\.\s*(?:createElement|Fragment|Component|useState|useEffect)\b/,
  /\bcreateRoot\s*\(/,
];

export function inferKind(html: string): ArtifactKind {
  return REACT_SIGNALS.some((signal) => signal.test(html)) ? "react" : "html";
}
