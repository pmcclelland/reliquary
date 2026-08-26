import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { d as Link2 } from "../_libs/lucide-react.mjs";
import { f as copyText, l as artifactShareUrl, s as Mark, t as Button } from "./dialog-Ch96cBIK.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { r as Route$4 } from "./router-Dh8IKLHP.mjs";
import { t as ArtifactFrame } from "./frame-B1XLdKbc.mjs";
import { t as ShareLinkDialog } from "./share-dialog-B1rg6XB2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/s._slug-6kHqOfRT.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SharePage() {
	const artifact = Route$4.useLoaderData();
	const [shareUrl, setShareUrl] = (0, import_react.useState)(null);
	async function share() {
		const url = artifactShareUrl(artifact.slug);
		setShareUrl(url);
		if (await copyText(url)) toast.success("Share link copied");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-dvh flex-col bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex h-11 shrink-0 items-center gap-3 border-b border-border px-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						"aria-label": "Back to Reliquary",
						className: "flex h-11 shrink-0 items-center gap-2 text-fg hover:text-accent",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mark, { className: "size-5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-serif text-sm tracking-tight",
							children: "Reliquary"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "h-4 w-px shrink-0 bg-border",
						"aria-hidden": "true"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "min-w-0 flex-1 truncate text-sm text-muted",
						children: artifact.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						size: "icon-sm",
						"aria-label": "Copy share link",
						className: "shrink-0 text-muted hover:text-fg",
						onClick: () => void share(),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, { className: "size-4" })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "min-h-0 flex-1 bg-chip",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArtifactFrame, {
					html: artifact.html,
					title: artifact.title
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShareLinkDialog, {
				open: shareUrl !== null,
				onOpenChange: (open) => {
					if (!open) setShareUrl(null);
				},
				url: shareUrl ?? "",
				title: artifact.title
			})
		]
	});
}
//#endregion
export { SharePage as component };
