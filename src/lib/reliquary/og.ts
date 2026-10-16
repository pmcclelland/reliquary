/**
 * Per-relic share-card helpers (pure; safe on server and client).
 *
 * Only relics that the public share route (`/s/:slug`) would render get a
 * per-relic card. Everything else falls back to the generic `/og.jpg`.
 */

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;
export const OG_FALLBACK_PATH = "/og.jpg";
export const OG_TITLE_MAX = 90;
export const OG_EXCERPT_MAX = 180;

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  mdash: "—",
  ndash: "–",
  hellip: "…",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
  middot: "·",
};

function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, body: string) => {
    if (body[0] === "#") {
      const code =
        body[1] === "x" || body[1] === "X"
          ? parseInt(body.slice(2), 16)
          : parseInt(body.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code < 0x110000
        ? String.fromCodePoint(code)
        : "";
    }
    return ENTITIES[body.toLowerCase()] ?? m;
  });
}

/** Visible text of an HTML document, whitespace-collapsed. */
export function htmlToText(html: string): string {
  return decodeEntities(
    String(html ?? "")
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<(script|style|noscript|template|svg|head|title)\b[\s\S]*?<\/\1\s*>/gi, " ")
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<\/(p|div|h[1-6]|li|section|article|header|footer|tr)>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
}

/** Trim to `max` chars on a word boundary, adding an ellipsis when cut. */
export function clip(text: string, max: number): string {
  const t = String(text ?? "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const wholeWords = t[max - 1] === " ";
  const space = cut.lastIndexOf(" ");
  return `${(wholeWords || space <= max * 0.6 ? cut : cut.slice(0, space)).replace(/[\s,.;:–—-]+$/, "")}…`;
}

/** Description for share cards: the relic's description, else its body text. */
export function relicExcerpt(
  relic: { description?: string | null; html?: string | null; title?: string | null },
  max = OG_EXCERPT_MAX,
): string {
  const desc = String(relic.description ?? "").trim();
  if (desc) return clip(desc, max);
  let body = htmlToText(relic.html ?? "");
  const title = String(relic.title ?? "").trim();
  if (title && body.startsWith(title)) body = body.slice(title.length).trim();
  return clip(body, max);
}

/** Cache-busting version token from `updatedAt`. */
export function ogVersion(updatedAt: string | null | undefined): string {
  const ms = Date.parse(String(updatedAt ?? ""));
  return Number.isFinite(ms) ? Math.floor(ms / 1000).toString(36) : "0";
}

export function relicOgImagePath(id: string, updatedAt?: string | null): string {
  return `/api/og/${encodeURIComponent(id)}?v=${ogVersion(updatedAt)}`;
}

type MetaTag = { title?: string; name?: string; property?: string; content?: string };

/**
 * Head meta for a shared relic. `origin` must be absolute (scrapers need an
 * absolute og:image). The `reliquary:og=page` marker tells the platform head
 * injector to keep these page-owned tags instead of the site-wide card.
 */
export function relicShareMeta(opts: {
  origin: string;
  relic: { id: string; title: string; description?: string; html?: string; updatedAt?: string };
  appName: string;
  sharePath: string;
}): MetaTag[] {
  const origin = opts.origin.replace(/\/+$/, "");
  const title = clip(opts.relic.title || opts.appName, OG_TITLE_MAX);
  const description = relicExcerpt(opts.relic);
  const image = `${origin}${relicOgImagePath(opts.relic.id, opts.relic.updatedAt)}`;
  const url = `${origin}${opts.sharePath}`;
  const tags: MetaTag[] = [
    { name: "reliquary:og", content: "page" },
    { property: "og:type", content: "article" },
    { property: "og:site_name", content: opts.appName },
    { property: "og:title", content: title },
    { property: "og:url", content: url },
    { property: "og:image", content: image },
    { property: "og:image:type", content: "image/png" },
    { property: "og:image:width", content: String(OG_WIDTH) },
    { property: "og:image:height", content: String(OG_HEIGHT) },
    { property: "og:image:alt", content: `${title} — ${opts.appName}` },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:image", content: image },
  ];
  if (description) {
    tags.push(
      { name: "description", content: description },
      { property: "og:description", content: description },
      { name: "twitter:description", content: description },
    );
  }
  return tags;
}
