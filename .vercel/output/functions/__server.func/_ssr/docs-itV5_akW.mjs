import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { s as Route$11 } from "./router-Dh8IKLHP.mjs";
import { t as AppShell } from "./app-shell-CmOGSPZZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/docs-itV5_akW.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function DocsPage() {
	const library = Route$11.useLoaderData();
	const [origin, setOrigin] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		setOrigin(window.location.origin);
	}, []);
	const mcpUrl = origin ? `${origin}/api/mcp` : "/api/mcp";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		library,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
			className: "mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-14",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] font-medium tracking-[0.18em] text-subtle uppercase",
					children: "Reference"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 font-serif text-4xl tracking-tight",
					children: "API & MCP"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-muted",
					children: "Agents file artifacts the same way people do: a title, a self-contained HTML document, optional collection and tags."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-12 font-serif text-2xl tracking-tight",
					children: "MCP"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: "Streamable HTTP endpoint. Point a client at this app; no extra process required."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pre, { children: mcpUrl }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-sm text-muted",
					children: "Cursor / Claude Code HTTP config:"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pre, { children: `{
  "mcpServers": {
    "reliquary": {
      "url": "${mcpUrl}"
    }
  }
}` }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-sm text-muted",
					children: "Local stdio proxy (needs the public URL):"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pre, { children: `RELIQUARY_URL=${origin || "https://your-app.example"} node mcp/server.mjs` }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 text-sm text-muted",
					children: [
						"Tools: ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
							className: "font-mono text-xs",
							children: "list_artifacts"
						}),
						",",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
							className: "font-mono text-xs",
							children: "get_artifact"
						}),
						",",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
							className: "font-mono text-xs",
							children: "create_artifact"
						}),
						",",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
							className: "font-mono text-xs",
							children: "update_artifact"
						}),
						",",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
							className: "font-mono text-xs",
							children: "delete_artifact"
						}),
						",",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
							className: "font-mono text-xs",
							children: "list_collections"
						}),
						",",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
							className: "font-mono text-xs",
							children: "create_collection"
						}),
						",",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
							className: "font-mono text-xs",
							children: "delete_collection"
						}),
						"."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-12 font-serif text-2xl tracking-tight",
					children: "REST"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: "CORS is open. Look up records by id or slug. HTML is omitted from list responses."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pre, { children: `GET    /api/artifacts?collection=&tag=&q=
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
DELETE /api/collections/:id` }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-sm text-muted",
					children: "Create payload:"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pre, { children: `{
  "title": "Orbital",
  "description": "A slow orbit.",
  "html": "<!DOCTYPE html>...",
  "collection": "motion",
  "tags": ["motion", "canvas"],
  "slug": "orbital"
}` }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-12 font-serif text-2xl tracking-tight",
					children: "Share"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-sm text-muted",
					children: [
						"Every artifact has a live view — a thin Reliquary bar over the piece at full size. The wiki page stays at",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
							className: "font-mono text-xs",
							children: "/a/:slug"
						}),
						"."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pre, { children: `${origin || ""}/s/:slug` }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-12 font-serif text-2xl tracking-tight",
					children: "Artifact format"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-sm text-muted",
					children: [
						"Send a full HTML document when you can. Fragments are wrapped in a simple page. A React module that defines",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
							className: "font-mono text-xs",
							children: "function App()"
						}),
						" is wrapped with React 18 and Babel standalone."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pre, { children: `function App() {
  const [n, setN] = React.useState(0);
  return <button onClick={() => setN(n + 1)}>{n}</button>;
}` })
			]
		})
	});
}
function Pre({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
		className: "mt-3 overflow-x-auto rounded-lg bg-surface-muted p-4 font-mono text-[12px] leading-relaxed text-fg",
		children
	});
}
//#endregion
export { DocsPage as component };
