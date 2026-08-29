import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { inferKind } from "./kind.ts";
import { ensureDocument, looksLikeDocument } from "./wrap.ts";

const TITLE = "Test Artifact";

describe("inferKind", () => {
  it("does not call a page react because its prose mentions react", () => {
    const html = `<!doctype html><html><body>
      <p>Built on React 18 with react-i18next, rendered into React context.</p>
      <p>The reactivity contract is what makes a component re-render.</p>
    </body></html>`;
    assert.equal(inferKind(html), "html");
  });

  it("detects a script tag loading react", () => {
    const html = `<!doctype html><html><head>
      <script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.development.js"></script>
    </head><body></body></html>`;
    assert.equal(inferKind(html), "react");
  });

  it("detects a babel script block", () => {
    const html = `<script type="text/babel" data-presets="react">const x = 1;</script>`;
    assert.equal(inferKind(html), "react");
  });

  it("detects react imports, requires and globals", () => {
    assert.equal(inferKind(`import React from "react";`), "react");
    assert.equal(inferKind(`import { useState } from 'react/jsx-runtime';`), "react");
    assert.equal(inferKind(`const React = require("react");`), "react");
    assert.equal(inferKind(`ReactDOM.createRoot(el).render(x);`), "react");
    assert.equal(inferKind(`createRoot(document.body);`), "react");
  });

  it("leaves plain html alone", () => {
    assert.equal(inferKind(`<div><p>Hello</p></div>`), "html");
    assert.equal(inferKind(``), "html");
  });
});

describe("looksLikeDocument", () => {
  it("recognises a full document and leaves it untouched", () => {
    const html = `<!doctype html>\n<html lang="en"><body>hi</body></html>`;
    assert.equal(looksLikeDocument(html), true);
    assert.equal(ensureDocument(html, TITLE), html.trim());
  });
});

describe("ensureDocument", () => {
  it("wraps a fragment with a reset and no opinionated styling", () => {
    const out = ensureDocument(`<h1>Hello</h1>`, TITLE);
    assert.match(out, /<h1>Hello<\/h1>/);
    assert.match(out, /box-sizing: border-box/);
    // The old wrapper imposed a serif face, a cream ground and a reading width.
    assert.doesNotMatch(out, /Georgia/);
    assert.doesNotMatch(out, /#faf7f1/);
    assert.doesNotMatch(out, /max-width: 720px/);
  });

  it("escapes the title it injects", () => {
    const out = ensureDocument(`<p>x</p>`, `Trouble & <script>alert(1)</script>`);
    assert.match(out, /<title>Trouble &amp; &lt;script&gt;/);
  });

  it("does not route a fragment mentioning react through the jsx harness", () => {
    const fragment = `<article>
      <p>React 18 powers this. See ReactDOM in the docs.</p>
      <script>function App() { return; }</script>
    </article>`;
    const out = ensureDocument(fragment, TITLE);
    assert.doesNotMatch(out, /text\/babel/);
    assert.match(out, /<article>/);
  });

  it("still wraps a real jsx module in the harness", () => {
    const module = `function App() {
      return (
        <div className="app">Hello</div>
      );
    }`;
    const out = ensureDocument(module, TITLE);
    assert.match(out, /type="text\/babel"/);
    assert.match(out, /ReactDOM\.createRoot/);
  });

  it("does not double-mount a jsx module that mounts itself", () => {
    const module = `const App = () => <p>hi</p>;
      ReactDOM.createRoot(document.getElementById("root")).render(<App />);`;
    const out = ensureDocument(module, TITLE);
    assert.match(out, /type="text\/babel"/);
    assert.equal(out.match(/ReactDOM\.createRoot/g)?.length, 1);
  });

  it("wraps an empty source as a fragment", () => {
    const out = ensureDocument("   ", TITLE);
    assert.match(out, /<!DOCTYPE html>/);
    assert.doesNotMatch(out, /text\/babel/);
  });
});
