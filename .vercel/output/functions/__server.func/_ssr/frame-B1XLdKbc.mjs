import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { d as cn } from "./dialog-Ch96cBIK.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/frame-B1XLdKbc.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ArtifactFrame({ html, title, className }) {
	const [src, setSrc] = (0, import_react.useState)();
	(0, import_react.useEffect)(() => {
		const blob = new Blob([html], { type: "text/html;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		setSrc(url);
		return () => URL.revokeObjectURL(url);
	}, [html]);
	if (!src) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("bg-surface-muted", className),
		"aria-hidden": "true"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
		title,
		src,
		sandbox: "allow-scripts allow-forms allow-modals allow-pointer-lock",
		referrerPolicy: "no-referrer",
		className: cn("h-full w-full border-0 bg-surface", className)
	});
}
//#endregion
export { ArtifactFrame as t };
