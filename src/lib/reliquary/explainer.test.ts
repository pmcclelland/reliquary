import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ensureExplainer, parseLineRange } from "./explainer.ts";

describe("parseLineRange", () => {
  it("parses a single line", () => {
    assert.deepEqual(parseLineRange("42"), { start: 42, end: 42 });
  });

  it("parses a range", () => {
    assert.deepEqual(parseLineRange("12-28"), { start: 12, end: 28 });
    assert.deepEqual(parseLineRange("12 - 28"), { start: 12, end: 28 });
  });

  it("rejects inverted or invalid ranges", () => {
    assert.equal(parseLineRange(""), null);
    assert.equal(parseLineRange("0"), null);
    assert.equal(parseLineRange("9-3"), null);
    assert.equal(parseLineRange("abc"), null);
  });
});

describe("ensureExplainer", () => {
  it("returns empty for blank input", () => {
    assert.equal(ensureExplainer("  ", "Notes"), "");
  });

  it("wraps a fragment in a prose shell with the click bridge", () => {
    const out = ensureExplainer(
      `<p>See the <a data-line="12">loop</a>.</p>`,
      "Notes",
    );
    assert.match(out, /<!DOCTYPE html>/);
    assert.match(out, /reliquary-explainer/);
    assert.match(out, /data-line="12"/);
  });

  it("injects the bridge into a full document once", () => {
    const doc = `<!DOCTYPE html><html><body><p>Hi</p></body></html>`;
    const once = ensureExplainer(doc, "Notes");
    const twice = ensureExplainer(once, "Notes");
    assert.equal(
      once.split("reliquary-explainer").length,
      twice.split("reliquary-explainer").length,
    );
    assert.match(once, /<\/body>/);
  });
});
