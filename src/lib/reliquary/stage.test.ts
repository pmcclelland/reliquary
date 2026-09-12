import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  DISPLAY_HEADING_FIXTURE_HTML,
  STAGE_STYLE_MARK,
  injectStageSafety,
} from "./stage.ts";

describe("injectStageSafety", () => {
  it("injects heading overflow rules into a full document once", () => {
    const doc = `<!DOCTYPE html><html><head><title>x</title></head><body><h1>Hello</h1></body></html>`;
    const once = injectStageSafety(doc);
    assert.match(once, new RegExp(STAGE_STYLE_MARK));
    assert.match(once, /overflow-wrap:\s*break-word/);
    assert.match(once, /max-width:\s*100%/);
    assert.match(once, /<head>\s*<style data-reliquary-stage>/);
    assert.equal(injectStageSafety(once), once);
  });

  it("does not rewrite the document body", () => {
    const doc = `<!DOCTYPE html><html><head></head><body><h1>Leo routes. Specialists do the work.</h1></body></html>`;
    const out = injectStageSafety(doc);
    assert.match(out, /<h1>Leo routes\. Specialists do the work\.<\/h1>/);
  });

  it("prepends a style tag onto a fragment", () => {
    const out = injectStageSafety(`<h1>Hello</h1>`);
    assert.match(out, new RegExp(`^<style ${STAGE_STYLE_MARK}>`));
    assert.match(out, /<h1>Hello<\/h1>/);
  });

  it("opens a head when a document has html but no head", () => {
    const out = injectStageSafety(`<html><body><h1>Hi</h1></body></html>`);
    assert.match(out, /<html>\s*<head><style data-reliquary-stage>/);
  });

  it("keeps the display-heading fixture's nowrap hero intact", () => {
    const out = injectStageSafety(DISPLAY_HEADING_FIXTURE_HTML);
    assert.match(out, /white-space:\s*nowrap/);
    assert.match(out, /Things that move\./);
    assert.match(out, new RegExp(STAGE_STYLE_MARK));
    assert.match(out, /overflow-wrap:\s*break-word/);
  });
});
