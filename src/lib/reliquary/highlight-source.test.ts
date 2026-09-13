import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { highlightHtmlSource, plainSourceLines } from "./highlight-source.ts";
import { SEED_WELCOME_HTML } from "./seed.ts";

const SAMPLE = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { color: #111; }
  </style>
</head>
<body>
  <!-- note -->
  <div class="page" id="main">Hello</div>
  <script>
    const x = "hi";
  </script>
</body>
</html>`;

function lineText(line: { text: string }[]): string {
  return line.map((token) => token.text).join("");
}

describe("plainSourceLines", () => {
  it("keeps line count and empty lines", () => {
    const lines = plainSourceLines("a\n\nb");
    assert.equal(lines.length, 3);
    assert.equal(lineText(lines[1]!), "");
  });
});

describe("highlightHtmlSource", () => {
  it("preserves line count and source text", async () => {
    const lines = await highlightHtmlSource(SAMPLE);
    assert.equal(lines.length, SAMPLE.split("\n").length);
    assert.equal(lines.map(lineText).join("\n"), SAMPLE);
  });

  it("colors tags, attributes, strings, and comments differently", async () => {
    const lines = await highlightHtmlSource(SAMPLE);
    const tokens = lines.flat();
    const comment = tokens.find((token) => token.text.includes("<!--"));
    const tag = tokens.find((token) => token.text === "div");
    const attr = tokens.find((token) => token.text === "class");
    const str = tokens.find((token) => token.text === "page");
    const colors = [comment, tag, attr, str].map((token) => token?.style?.["--shiki-light"]);
    assert.ok(colors.every((color) => typeof color === "string" && color.length > 0));
    assert.equal(new Set(colors).size, 4);
    assert.equal(comment?.comment, true);
    assert.equal(tag?.comment, false);
  });

  it("highlights embedded CSS and JavaScript", async () => {
    const lines = await highlightHtmlSource(SAMPLE);
    const colorProp = lines[4]!.find((token) => token.text === "color");
    const jsKeyword = lines[11]!.find((token) => token.text === "const");
    const jsString = lines[11]!.find((token) => token.text.includes("hi"));
    assert.ok(colorProp?.style?.["--shiki-light"]);
    assert.ok(jsKeyword?.style?.["--shiki-light"]);
    assert.ok(jsString?.style?.["--shiki-light"]);
    assert.notEqual(jsKeyword?.style?.["--shiki-light"], jsString?.style?.["--shiki-light"]);
  });

  it("paints both light and dark token colors", async () => {
    const lines = await highlightHtmlSource("<div></div>");
    const tag = lines[0]!.find((token) => token.text === "div");
    assert.ok(tag?.style?.["--shiki-light"]);
    assert.ok(tag?.style?.["--shiki-dark"]);
    assert.notEqual(tag?.style?.["--shiki-light"], tag?.style?.["--shiki-dark"]);
  });

  it("marks HTML, CSS, and JS comments", async () => {
    const lines = await highlightHtmlSource(`<!-- h -->
<style>/* c */</style>
<script>// j
const x = 1;</script>`);
    const comments = lines.flat().filter((token) => token.comment);
    assert.ok(comments.some((token) => token.text.includes("<!--")));
    assert.ok(comments.some((token) => token.text.includes("/*")));
    assert.ok(comments.some((token) => token.text.includes("//")));
    assert.equal(lines.flat().find((token) => token.text === "const")?.comment, false);
  });

  it("round-trips a seed artifact", async () => {
    const lines = await highlightHtmlSource(SEED_WELCOME_HTML);
    assert.equal(lines.map(lineText).join("\n"), SEED_WELCOME_HTML);
  });
});
