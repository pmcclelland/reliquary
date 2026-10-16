/**
 * Renders a 1200×630 PNG share card for a public relic with satori (layout →
 * SVG) and resvg (SVG → PNG). Pure of request context; callers decide what is
 * safe to show (see `/api/og/$id`).
 */
import satori, { init as initSatori } from "satori/standalone";
import { initWasm, Resvg } from "@resvg/resvg-wasm";
import { OG_HEIGHT, OG_WIDTH } from "@/lib/reliquary/og";
import { figtree400, figtree600, newsreader400 } from "./fonts.generated";

// Design tokens mirrored from src/styles.css (light theme).
const C = {
  bg: "#efe8d8",
  surface: "#f7f1e6",
  fg: "#1a1714",
  muted: "#6f675c",
  subtle: "#8f877c",
  border: "#d8d0c3",
  accent: "#3d5468",
};

function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

let fontsCache: { name: string; data: ArrayBuffer; weight: 400 | 600; style: "normal" }[] | null =
  null;
function fonts() {
  fontsCache ??= [
    { name: "Newsreader", data: b64ToBytes(newsreader400).buffer as ArrayBuffer, weight: 400, style: "normal" },
    { name: "Figtree", data: b64ToBytes(figtree400).buffer as ArrayBuffer, weight: 400, style: "normal" },
    { name: "Figtree", data: b64ToBytes(figtree600).buffer as ArrayBuffer, weight: 600, style: "normal" },
  ];
  return fontsCache;
}

type WasmInput = WebAssembly.Module | BufferSource;
let wasmReady: Promise<void> | null = null;
/**
 * Workers forbid compiling wasm from bytes at runtime, so both satori's yoga
 * layout engine and resvg are handed precompiled modules (`?module` imports in
 * the route). Node callers may pass raw bytes instead.
 */
export function ensureOgWasm(load: () => Promise<{ yoga: WasmInput; resvg: WasmInput }>): Promise<void> {
  wasmReady ??= load()
    .then(({ yoga, resvg }) => Promise.all([initSatori(yoga), initWasm(resvg)]))
    .then(() => undefined)
    .catch((err) => {
      wasmReady = null;
      throw err;
    });
  return wasmReady;
}

const MARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect x="3.25" y="3.25" width="25.5" height="25.5" rx="4" fill="none" stroke="${C.fg}" stroke-width="1.5"/><rect x="8.5" y="8.5" width="15" height="15" rx="2" fill="none" stroke="${C.fg}" stroke-width="1.25" opacity="0.65"/><circle cx="16" cy="16" r="2.4" fill="${C.fg}"/></svg>`;
const MARK_URI = `data:image/svg+xml;base64,${btoa(MARK_SVG)}`;

type Node = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, children?: unknown, extra: Record<string, unknown> = {}): Node => ({
  type,
  props: { style, children, ...extra },
});

export type RelicCard = {
  title: string;
  excerpt: string;
  eyebrow?: string;
  host?: string;
};

export function relicCardTree(card: RelicCard): Node {
  const titleSize = card.title.length > 60 ? 56 : card.title.length > 32 ? 66 : 76;
  return h(
    "div",
    {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      display: "flex",
      background: C.bg,
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Figtree",
    },
    h(
      "div",
      {
        // satori sizes content-box: 1112×542 outer = 984×440 + padding + border.
        width: OG_WIDTH - 88 - 128 - 2,
        height: OG_HEIGHT - 88 - 100 - 2,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 24,
        padding: "56px 64px 44px",
        boxShadow: "0 2px 4px rgba(26,23,20,0.04)",
      },
      [
        card.eyebrow
          ? h(
              "div",
              {
                display: "flex",
                fontSize: 20,
                fontWeight: 600,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: C.subtle,
                marginBottom: 22,
              },
              card.eyebrow,
            )
          : null,
        h(
          "div",
          {
            display: "block",
            fontFamily: "Newsreader",
            fontSize: titleSize,
            lineHeight: 1.08,
            letterSpacing: -1,
            color: C.fg,
            lineClamp: 3,
          },
          card.title,
        ),
        card.excerpt
          ? h(
              "div",
              {
                display: "block",
                marginTop: 26,
                fontSize: 28,
                lineHeight: 1.45,
                color: C.muted,
                lineClamp: titleSize < 66 ? 2 : 3,
              },
              card.excerpt,
            )
          : null,
        h("div", { flex: 1, display: "flex" }),
        h(
          "div",
          {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: `1px solid ${C.border}`,
            paddingTop: 26,
          },
          [
            h("div", { display: "flex", alignItems: "center" }, [
              h("img", { width: 34, height: 34, marginRight: 14 }, undefined, {
                src: MARK_URI,
                width: 34,
                height: 34,
              }),
              h("div", { display: "flex", fontFamily: "Newsreader", fontSize: 30, color: C.fg }, "Reliquary"),
            ]),
            card.host
              ? h("div", { display: "flex", fontSize: 22, color: C.subtle }, card.host)
              : null,
          ],
        ),
      ],
    ),
  );
}

export async function renderRelicCardPng(card: RelicCard): Promise<Uint8Array> {
  const svg = await satori(relicCardTree(card) as unknown as Parameters<typeof satori>[0], {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts: fonts(),
  });
  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: OG_WIDTH } });
  const png = resvg.render().asPng();
  resvg.free();
  return png;
}
