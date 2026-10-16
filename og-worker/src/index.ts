/**
 * reliquary-og — internal share-card renderer.
 *
 * Reachable only through the main Reliquary Worker's `OG` service binding
 * (`workers_dev: false`, no routes). It never touches the database: the main
 * Worker resolves the relic with the same public lookup as `/s/:slug`, so
 * privacy decisions stay there, and posts the already-public card fields here.
 *
 * POST /render  { title, excerpt, eyebrow?, host? }  →  image/png 1200×630
 */
import yogaWasm from "yoga-wasm-web/dist/yoga.wasm";
import resvgWasm from "@resvg/resvg-wasm/index_bg.wasm";
import { ensureOgWasm, renderRelicCardPng, type RelicCard } from "./render";

const MAX = { title: 120, excerpt: 240, eyebrow: 80, host: 120 };

function str(v: unknown, max: number): string {
  return typeof v === "string" ? v.slice(0, max) : "";
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (request.method !== "POST" || url.pathname !== "/render") {
      return new Response("Not found", { status: 404 });
    }
    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return new Response("Bad request", { status: 400 });
    }
    const card: RelicCard = {
      title: str(body.title, MAX.title) || "Untitled relic",
      excerpt: str(body.excerpt, MAX.excerpt),
      eyebrow: str(body.eyebrow, MAX.eyebrow),
      host: str(body.host, MAX.host),
    };
    try {
      await ensureOgWasm(async () => ({ yoga: yogaWasm, resvg: resvgWasm }));
      const png = await renderRelicCardPng(card);
      return new Response(png as unknown as BodyInit, { headers: { "Content-Type": "image/png" } });
    } catch (err) {
      console.error("[reliquary-og] render failed", err);
      return new Response("Render failed", { status: 500 });
    }
  },
};
