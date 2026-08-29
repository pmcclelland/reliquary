---
name: create-relic
description: >
  File a living HTML artifact into Reliquary (Paul's wiki of relics).
  Use when the user runs /create-relic, says "file this as a relic",
  "file this as relic", "create a relic", "save this to Reliquary",
  or "publish to Reliquary" — including picking the latest HTML, React,
  canvas, or essay out of the current conversation and publishing it.
  If they also ask to explain it, include optional explainer HTML with
  data-line citations.
---

# Create relic

Turn the named work (or “this”) into a self-contained HTML relic and file it in Reliquary via MCP. Do not dump a chat transcript.

Origin: `https://reliquary.pmcclel.land`

## Source

Resolve what to file, in this order:

1. **Text after `/create-relic`.** A brief (“two oscillators, slow phase”) → generate a complete relic. Already HTML or a React `App` module → use it.
2. **“File this as a relic” / `/create-relic` with no args.** “This” is the latest substantial *artifact* in the conversation: runnable HTML/JSX, a canvas/study, an illustrated page — not the surrounding explanation. Prefer the user’s selection or an attached file when present.
3. If nothing fileable exists, ask what the relic should be. Do not invent a demo.

## Shape

Relics are one self-contained `.html` document.

- Prefer a full document (`<!DOCTYPE html>`). Fragments and a module that defines `function App()` are wrapped automatically.
- No local file paths. CDNs are allowed.
- Title: short, wiki-like. Description: one sentence. Tags: a few lowercase words.
- Do not put secrets, tokens, or private env in the HTML.

## Explainer (only when asked)

Do **not** write an explainer for a plain “file this as a relic” / `/create-relic`. Add one only if they ask to explain it, include notes, or say how it works.

The explainer is HTML shown beside Source on the wiki page. Keep it short: what the relic is, how it runs, which lines matter. Do not dump the whole source. Cite the **stored** relic HTML (a complete document, so line numbers match) with:

```html
<p>The <a data-line="42">animation loop</a> advances phase.</p>
<p><a data-line="12-28">Canvas setup</a> sizes the drawing surface.</p>
```

Lines are 1-based. Prefer a full HTML document for the relic when filing with an explainer so wrap does not shift lines. If you must wrap, `get_artifact` after create and cite that `html`, then `update_artifact` with `explainer`.

If you change a relic’s `html` and an explainer already exists, refresh the explainer in the same update.

## File

Prefer Reliquary MCP tools when they are connected. Otherwise REST to the origin with `Authorization: Bearer rly_…`.

Mint a named token in Reliquary → **API & MCP** (one per agent). Never invent a token. If the call is unauthorized, stop and tell the user to connect MCP (or paste a token) from that page.

```
{
  "mcpServers": {
    "reliquary": {
      "url": "https://reliquary.pmcclel.land/api/mcp",
      "headers": { "Authorization": "Bearer rly_YOUR_TOKEN" }
    }
  }
}
```

1. `list_collections` and `list_artifacts` first — reuse a collection slug when it fits; do not duplicate an existing relic; never invent ids.
2. `create_artifact` with `title`, `html`, `description`, optional `collection` (id or slug), `tags`, and `explainer` only when notes were requested. Create a collection only when a new folder is clearly warranted.
3. If they asked to update an existing relic, `get_artifact` then `update_artifact` by id or slug instead.

Reply with both URLs:

- Wiki: `https://reliquary.pmcclel.land/a/{slug}`
- Live: `https://reliquary.pmcclel.land/s/{slug}`
