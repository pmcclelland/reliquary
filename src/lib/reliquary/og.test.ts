import assert from "node:assert/strict";
import { test } from "node:test";
import { clip, htmlToText, ogVersion, relicExcerpt, relicOgImagePath, relicShareMeta } from "./og.ts";

test("htmlToText drops scripts, styles and tags", () => {
  const html = `<html><head><title>T</title><style>p{}</style></head><body><h1>Hi</h1><script>evil()</script><p>a &amp; b&nbsp;c</p></body></html>`;
  assert.equal(htmlToText(html), "Hi a & b c");
});

test("clip respects word boundaries", () => {
  assert.equal(clip("short", 10), "short");
  const out = clip("the quick brown fox jumps over the lazy dog", 20);
  assert.ok(out.length <= 20);
  assert.ok(out.endsWith("…"));
  assert.equal(out, "the quick brown fox…");
});

test("relicExcerpt prefers description, else body without repeated title", () => {
  assert.equal(relicExcerpt({ description: "Desc", html: "<p>Body</p>" }), "Desc");
  assert.equal(relicExcerpt({ title: "Hello", html: "<h1>Hello</h1><p>World here</p>" }), "World here");
});

test("ogVersion and image path", () => {
  assert.equal(ogVersion("bad"), "0");
  assert.equal(relicOgImagePath("art welcome", "2026-01-01T00:00:00Z"), `/api/og/art%20welcome?v=${ogVersion("2026-01-01T00:00:00Z")}`);
});

test("relicShareMeta emits absolute og/twitter tags and the page marker", () => {
  const tags = relicShareMeta({
    origin: "https://x.test/",
    appName: "Reliquary",
    sharePath: "/s/abc",
    relic: { id: "abc", title: "My relic", description: "", html: "<p>Snippet</p>", updatedAt: "2026-01-01T00:00:00Z" },
  });
  const get = (k: string) => tags.find((t) => t.property === k || t.name === k)?.content;
  assert.equal(get("reliquary:og"), "page");
  assert.equal(get("og:title"), "My relic");
  assert.equal(get("og:description"), "Snippet");
  assert.match(get("og:image")!, /^https:\/\/x\.test\/api\/og\/abc\?v=/);
  assert.equal(get("twitter:card"), "summary_large_image");
  assert.equal(get("og:url"), "https://x.test/s/abc");
});
