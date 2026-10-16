import { createFileRoute } from "@tanstack/react-router";
import { OG_FALLBACK_PATH, OG_EXCERPT_MAX, OG_TITLE_MAX, clip, relicExcerpt } from "@/lib/reliquary/og";

/**
 * Public, unauthenticated 1200×630 PNG share card for a relic.
 *
 * Privacy: resolves the relic through `getPublicArtifact` — the exact lookup
 * the public share page `/s/:slug` uses — and never reads the session. Anything
 * that page would not render (unknown, deleted, not shared) gets a redirect to
 * the generic card, so no content can leak through this endpoint. Rendering
 * happens in the separate `reliquary-og` Worker (og-worker/) via the `OG`
 * service binding, which keeps satori/resvg wasm out of this bundle.
 */
const CARD_CACHE = "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800";
const FALLBACK_CACHE = "public, max-age=300, s-maxage=300";

function fallback(request: Request, reason: string): Response {
  return new Response(null, {
    status: 302,
    headers: {
      Location: new URL(OG_FALLBACK_PATH, request.url).href,
      "Cache-Control": FALLBACK_CACHE,
      "Access-Control-Allow-Origin": "*",
      "X-OG-Fallback": reason,
    },
  });
}

type EdgeCache = { match(r: Request): Promise<Response | undefined>; put(r: Request, res: Response): Promise<void> };
function edgeCache(): EdgeCache | null {
  const c = (globalThis as { caches?: { default?: EdgeCache } }).caches;
  return c?.default ?? null;
}

type Fetcher = { fetch(input: string, init?: RequestInit): Promise<Response> };
/** `OG` service binding to the reliquary-og Worker (og-worker/). */
function ogBinding(): Fetcher | null {
  const env = (globalThis as { __env__?: Record<string, unknown> }).__env__;
  const og = env?.OG as Fetcher | undefined;
  return og && typeof og.fetch === "function" ? og : null;
}

export const Route = createFileRoute("/api/og/$id")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const cache = edgeCache();
        const cacheKey = new Request(new URL(request.url).href, { method: "GET" });
        if (cache) {
          const hit = await cache.match(cacheKey).catch(() => undefined);
          if (hit) return hit;
        }
        let artifact;
        try {
          const { getPublicArtifact } = await import("@/lib/reliquary/store.server");
          artifact = await getPublicArtifact(params.id);
        } catch (err) {
          console.warn("[og] no public relic", params.id, String(err));
          return fallback(request, "not-public");
        }
        try {
          const seen = new Set<string>();
          const eyebrow = [artifact.collectionTitle, ...(artifact.tags ?? [])]
            .filter((t): t is string => {
              const k = String(t ?? "").trim().toLowerCase().replace(/s$/, "");
              if (!k || seen.has(k)) return false;
              seen.add(k);
              return true;
            })
            .slice(0, 3)
            .join(" · ");
          const og = ogBinding();
          if (!og) return fallback(request, "no-renderer");
          const rendered = await og.fetch("https://reliquary-og/render", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: clip(artifact.title || "Untitled relic", OG_TITLE_MAX),
              excerpt: relicExcerpt(artifact, OG_EXCERPT_MAX),
              eyebrow: clip(eyebrow, 60),
              host: new URL(request.url).host,
            }),
          });
          if (!rendered.ok || rendered.headers.get("content-type") !== "image/png") {
            throw new Error(`renderer responded ${rendered.status}`);
          }
          const png = await rendered.arrayBuffer();
          const res = new Response(png, {
            headers: {
              "Content-Type": "image/png",
              "Content-Length": String(png.byteLength),
              "Cache-Control": CARD_CACHE,
              "Access-Control-Allow-Origin": "*",
              "X-Content-Type-Options": "nosniff",
            },
          });
          if (cache) await cache.put(cacheKey, res.clone()).catch(() => {});
          return res;
        } catch (err) {
          console.error("[og] render failed", err);
          return fallback(request, "render-error");
        }
      },
    },
  },
});
