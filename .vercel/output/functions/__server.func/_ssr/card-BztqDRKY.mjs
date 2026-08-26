import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { m as formatRelative } from "./dialog-Ch96cBIK.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Badge } from "./badge-DZA8DePC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/card-BztqDRKY.js
var import_jsx_runtime = require_jsx_runtime();
function ArtifactCard({ artifact }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/a/$slug",
		params: { slug: artifact.slug },
		className: "group flex flex-col rounded-xl bg-surface p-4 shadow-border transition-[box-shadow,transform] duration-150 ease-out hover:shadow-border-hover",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: artifact.kind === "react" ? "React" : "HTML" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs text-subtle tabular-nums",
					children: formatRelative(artifact.updatedAt)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-3 font-serif text-xl leading-snug tracking-tight group-hover:text-accent",
				children: artifact.title
			}),
			artifact.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 line-clamp-2 text-sm text-muted",
				children: artifact.description
			}) : null,
			artifact.tags.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex flex-wrap gap-1",
				children: artifact.tags.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-xs text-subtle",
					children: ["#", tag]
				}, tag))
			})
		]
	});
}
//#endregion
export { ArtifactCard as t };
