import type { HighlighterCore } from "@shikijs/core";

/** One token in a Source listing line. Dual-theme colors live on `style`. */
export type SourceToken = {
  text: string;
  style?: Record<string, string>;
};

export type SourceLine = SourceToken[];

const LIGHT_THEME = "vitesse-light";
const DARK_THEME = "vitesse-dark";

let highlighterPromise: Promise<HighlighterCore> | null = null;

function getHighlighter(): Promise<HighlighterCore> {
  if (!highlighterPromise) {
    highlighterPromise = (async () => {
      const [
        { createHighlighterCore },
        { createJavaScriptRegexEngine },
        html,
        css,
        javascript,
        vitesseLight,
        vitesseDark,
      ] = await Promise.all([
        import("shiki/core"),
        import("shiki/engine/javascript"),
        import("@shikijs/langs/html"),
        import("@shikijs/langs/css"),
        import("@shikijs/langs/javascript"),
        import("@shikijs/themes/vitesse-light"),
        import("@shikijs/themes/vitesse-dark"),
      ]);
      return createHighlighterCore({
        langs: [html.default, css.default, javascript.default],
        themes: [vitesseLight.default, vitesseDark.default],
        engine: createJavaScriptRegexEngine(),
      });
    })();
  }
  return highlighterPromise;
}

/** Plain lines so SSR / first paint match before the highlighter chunk loads. */
export function plainSourceLines(html: string): SourceLine[] {
  return html.split("\n").map((line) => [{ text: line }]);
}

/**
 * Tokenize artifact HTML for the Source listing.
 * `html` language plus embedded CSS/JS grammars. Themes are Shiki
 * vitesse-light / vitesse-dark; the listing paints both via CSS variables
 * keyed off `html[data-theme]`.
 */
export async function highlightHtmlSource(html: string): Promise<SourceLine[]> {
  try {
    const highlighter = await getHighlighter();
    const { tokens } = highlighter.codeToTokens(html, {
      lang: "html",
      themes: { light: LIGHT_THEME, dark: DARK_THEME },
      defaultColor: false,
    });
    return tokens.map((line) =>
      line.map((token) => ({
        text: token.content,
        style: token.htmlStyle,
      })),
    );
  } catch {
    return plainSourceLines(html);
  }
}
