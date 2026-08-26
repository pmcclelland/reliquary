import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { o as Input } from "./dialog-Ch96cBIK.mjs";
import { c as Route$12 } from "./router-Dh8IKLHP.mjs";
import { t as AppShell } from "./app-shell-CmOGSPZZ.mjs";
import { t as ArtifactCard } from "./card-BztqDRKY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-D_gmVbQG.js
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	const library = Route$12.useLoaderData();
	const { q, tag } = Route$12.useSearch();
	const navigate = Route$12.useNavigate();
	const filtered = filterArtifacts(library.artifacts, q, tag);
	const grouped = groupByCollection(filtered, library.collections);
	const searching = Boolean(q?.trim() || tag);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		library,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "mx-auto w-full max-w-5xl px-4 py-8 sm:px-8 sm:py-12",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "reliquary-enter text-[11px] font-medium tracking-[0.18em] text-subtle uppercase",
					children: "Library"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "reliquary-enter-2 mt-2 font-serif text-4xl leading-tight tracking-tight sm:text-5xl",
					children: "A wiki of living artifacts"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "reliquary-enter-3 mt-3 max-w-xl text-muted",
					children: "Self-contained HTML — pages, motion studies, and small interfaces — filed like notes in a quiet archive."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-8 max-w-md",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						defaultValue: q ?? "",
						placeholder: "Search the shelves",
						onChange: (e) => {
							const value = e.target.value;
							navigate({
								search: (prev) => ({
									...prev,
									q: value.trim() ? value : void 0
								}),
								replace: true
							});
						},
						"aria-label": "Search artifacts"
					})
				}),
				tag && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-4 text-sm text-muted",
					children: [
						"Tagged",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "underline decoration-border underline-offset-4",
							onClick: () => void navigate({ search: (prev) => ({
								...prev,
								tag: void 0
							}) }),
							children: ["#", tag]
						})
					]
				}),
				filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-16 text-muted",
					children: "Nothing filed here yet. Create an artifact, or ask an agent to publish through MCP."
				}) : searching ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					className: "mt-10 grid gap-3 sm:grid-cols-2",
					children: filtered.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArtifactCard, { artifact: a }, a.id))
				}) : grouped.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-12",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-serif text-2xl tracking-tight",
							children: group.title
						}),
						group.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: group.description
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 grid gap-3 sm:grid-cols-2",
							children: group.artifacts.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArtifactCard, { artifact: a }, a.id))
						})
					]
				}, group.id))
			]
		})
	});
}
function filterArtifacts(artifacts, q, tag) {
	let items = artifacts;
	if (tag) items = items.filter((a) => a.tags.includes(tag));
	const query = q?.trim().toLowerCase();
	if (query) items = items.filter((a) => `${a.title} ${a.description} ${a.tags.join(" ")}`.toLowerCase().includes(query));
	return items;
}
function groupByCollection(artifacts, collections) {
	const groups = collections.map((c) => ({
		id: c.id,
		title: c.title,
		description: c.description,
		artifacts: artifacts.filter((a) => a.collectionId === c.id)
	}));
	const unfiled = artifacts.filter((a) => !a.collectionId);
	if (unfiled.length > 0) groups.push({
		id: "unfiled",
		title: "Unfiled",
		description: "Not yet placed in a collection.",
		artifacts: unfiled
	});
	return groups.filter((g) => g.artifacts.length > 0);
}
//#endregion
export { Home as component };
