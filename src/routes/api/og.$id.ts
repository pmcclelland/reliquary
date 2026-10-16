import { createFileRoute } from "@tanstack/react-router";
import { OG_FALLBACK_PATH, OG_EXCERPT_MAX, OG_TITLE_MAX, clip, relicExcerpt } from "@/lib/reliquary/og";

/**
 * Public, unauthenticated 1200×630 PNG share card for a relic.
 *
 * Privacy: resolves the relic through `getPublicArtifact` — the exact lookup
 * the public share page `/s/:slug` uses — and never reads the session. Anything
 * that page would not render (unknown, deleted, not shared) gets a redirect to
 * the generic card, so no content can leak through this endpoint.
 */
const CARD_CACHE = "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800";
const FALLBACK_CACHE = "public, max-age=300, s-maxage=300";

function fallback(request: Request): Response {
  return new Response(null, {
    status: 302,
    headers: {
      Location: new URL(OG_FALLBACK_PATH, request.url).href,
      "Cache-Control": FALLBACK_CACHE,
      "Access-Control-Allow-Origin": "*",
    },
  });
}

type EdgeCache = { match(r: Request): Promise<Response | undefined>; put(r: Request, res: Response): Promise<void> };
function edgeCache(): EdgeCache | null {
  const c = (globalThis as { caches?: { default?: EdgeCache } }).caches;
  return c?.default ?? null;
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
          return fallback(request);
        }
        try {
          const { ensureOgWasm, renderRelicCardPng } = await import("@/lib/og/render.server");
          await ensureOgWasm(async () => {
            // unwasm turns `?module` into a WebAssembly.Module on Workers.
            const [yoga, resvg] = await Promise.all([
              import("satori/layout.wasm?module"),
              import("@resvg/resvg-wasm/index_bg.wasm?module"),
            ]);
            return { yoga: yoga.default, resvg: resvg.default };
          });
          const eyebrow = [artifact.collectionTitle, ...(artifact.tags ?? []).slice(0, 2)]
            .filter(Boolean)
            .join(" · ");
          const png = await renderRelicCardPng({
            title: clip(artifact.title || "Untitled relic", OG_TITLE_MAX),
            excerpt: relicExcerpt(artifact, OG_EXCERPT_MAX),
            eyebrow: clip(eyebrow, 60),
            host: new URL(request.url).host,
          });
          const res = new Response(png as unknown as BodyInit, {
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
          return fallback(request);
        }
      },
    },
  },
});
