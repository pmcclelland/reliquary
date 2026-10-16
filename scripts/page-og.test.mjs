import assert from "node:assert/strict";
import { test } from "node:test";
import { injectGrokPwaHead } from "./grok-pwa-shared.mjs";

test("page-owned share card survives the head injector", () => {
  const html = `<html><head><meta name="reliquary:og" content="page"><meta property="og:image" content="https://x.test/api/og/abc?v=1"><meta property="og:title" content="Relic"><title>Relic</title></head><body></body></html>`;
  const out = injectGrokPwaHead(html, { host: "x.test", site: { title: "Reliquary", card: "custom" } });
  assert.match(out, /og:image" content="https:\/\/x\.test\/api\/og\/abc\?v=1"/);
  assert.equal((out.match(/property="og:image"/g) || []).length, 1);
  assert.equal((out.match(/property="og:title"/g) || []).length, 1);
});

test("pages without the marker still get the site card", () => {
  const html = `<html><head><meta property="og:image" content="https://evil/x.png"><title>T</title></head><body></body></html>`;
  const out = injectGrokPwaHead(html, { host: "x.test", site: { title: "Reliquary", card: "custom", image: "/og.jpg" } });
  assert.doesNotMatch(out, /evil/);
  assert.match(out, /og:image" content="https:\/\/x\.test\/og\.jpg"/);
});
