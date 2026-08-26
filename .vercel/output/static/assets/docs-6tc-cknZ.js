import{N as e,gt as t,vt as n}from"./preload-helper-DLxaniGD.js";import{t as r}from"./app-shell-D72ABwuo.js";import{o as i}from"./index-4PGziyZb.js";var a=n(t()),o=e();function s(){let e=i.useLoaderData(),[t,n]=(0,a.useState)(``);(0,a.useEffect)(()=>{n(window.location.origin)},[]);let s=t?`${t}/api/mcp`:`/api/mcp`;return(0,o.jsx)(r,{library:e,children:(0,o.jsxs)(`article`,{className:`mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-14`,children:[(0,o.jsx)(`p`,{className:`text-[11px] font-medium tracking-[0.18em] text-subtle uppercase`,children:`Reference`}),(0,o.jsx)(`h1`,{className:`mt-2 font-serif text-4xl tracking-tight`,children:`API & MCP`}),(0,o.jsx)(`p`,{className:`mt-3 text-muted`,children:`Agents file artifacts the same way people do: a title, a self-contained HTML document, optional collection and tags.`}),(0,o.jsx)(`h2`,{className:`mt-12 font-serif text-2xl tracking-tight`,children:`MCP`}),(0,o.jsx)(`p`,{className:`mt-2 text-sm text-muted`,children:`Streamable HTTP endpoint. Point a client at this app; no extra process required.`}),(0,o.jsx)(c,{children:s}),(0,o.jsx)(`p`,{className:`mt-4 text-sm text-muted`,children:`Cursor / Claude Code HTTP config:`}),(0,o.jsx)(c,{children:`{
  "mcpServers": {
    "reliquary": {
      "url": "${s}"
    }
  }
}`}),(0,o.jsx)(`p`,{className:`mt-4 text-sm text-muted`,children:`Local stdio proxy (needs the public URL):`}),(0,o.jsx)(c,{children:`RELIQUARY_URL=${t||`https://your-app.example`} node mcp/server.mjs`}),(0,o.jsxs)(`p`,{className:`mt-3 text-sm text-muted`,children:[`Tools: `,(0,o.jsx)(`code`,{className:`font-mono text-xs`,children:`list_artifacts`}),`,`,` `,(0,o.jsx)(`code`,{className:`font-mono text-xs`,children:`get_artifact`}),`,`,` `,(0,o.jsx)(`code`,{className:`font-mono text-xs`,children:`create_artifact`}),`,`,` `,(0,o.jsx)(`code`,{className:`font-mono text-xs`,children:`update_artifact`}),`,`,` `,(0,o.jsx)(`code`,{className:`font-mono text-xs`,children:`delete_artifact`}),`,`,` `,(0,o.jsx)(`code`,{className:`font-mono text-xs`,children:`list_collections`}),`,`,` `,(0,o.jsx)(`code`,{className:`font-mono text-xs`,children:`create_collection`}),`,`,` `,(0,o.jsx)(`code`,{className:`font-mono text-xs`,children:`delete_collection`}),`.`]}),(0,o.jsx)(`h2`,{className:`mt-12 font-serif text-2xl tracking-tight`,children:`REST`}),(0,o.jsx)(`p`,{className:`mt-2 text-sm text-muted`,children:`CORS is open. Look up records by id or slug. HTML is omitted from list responses.`}),(0,o.jsx)(c,{children:`GET    /api/artifacts?collection=&tag=&q=
POST   /api/artifacts
GET    /api/artifacts/:id
PUT    /api/artifacts/:id
PATCH  /api/artifacts/:id
DELETE /api/artifacts/:id
GET    /api/artifacts/:id/html

GET    /api/collections
POST   /api/collections
GET    /api/collections/:id
PATCH  /api/collections/:id
DELETE /api/collections/:id`}),(0,o.jsx)(`p`,{className:`mt-4 text-sm text-muted`,children:`Create payload:`}),(0,o.jsx)(c,{children:`{
  "title": "Orbital",
  "description": "A slow orbit.",
  "html": "<!DOCTYPE html>...",
  "collection": "motion",
  "tags": ["motion", "canvas"],
  "slug": "orbital"
}`}),(0,o.jsx)(`h2`,{className:`mt-12 font-serif text-2xl tracking-tight`,children:`Share`}),(0,o.jsxs)(`p`,{className:`mt-2 text-sm text-muted`,children:[`Every artifact has a live view — a thin Reliquary bar over the piece at full size. The wiki page stays at`,` `,(0,o.jsx)(`code`,{className:`font-mono text-xs`,children:`/a/:slug`}),`.`]}),(0,o.jsx)(c,{children:`${t||``}/s/:slug`}),(0,o.jsx)(`h2`,{className:`mt-12 font-serif text-2xl tracking-tight`,children:`Artifact format`}),(0,o.jsxs)(`p`,{className:`mt-2 text-sm text-muted`,children:[`Send a full HTML document when you can. Fragments are wrapped in a simple page. A React module that defines`,` `,(0,o.jsx)(`code`,{className:`font-mono text-xs`,children:`function App()`}),` is wrapped with React 18 and Babel standalone.`]}),(0,o.jsx)(c,{children:`function App() {
  const [n, setN] = React.useState(0);
  return <button onClick={() => setN(n + 1)}>{n}</button>;
}`})]})})}function c({children:e}){return(0,o.jsx)(`pre`,{className:`mt-3 overflow-x-auto rounded-lg bg-surface-muted p-4 font-mono text-[12px] leading-relaxed text-fg`,children:e})}export{s as component};