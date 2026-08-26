import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { a as DialogTitle, f as copyText, i as DialogDescription, n as Dialog, o as Input, r as DialogContent, t as Button } from "./dialog-Ch96cBIK.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/share-dialog-B1rg6XB2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ShareLinkDialog({ open, onOpenChange, url, title }) {
	const inputRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		const id = window.setTimeout(() => {
			inputRef.current?.focus();
			inputRef.current?.select();
		}, 0);
		return () => window.clearTimeout(id);
	}, [open, url]);
	async function onCopy() {
		if (await copyText(url)) {
			toast.success("Share link copied");
			onOpenChange(false);
			return;
		}
		inputRef.current?.focus();
		inputRef.current?.select();
		toast.message("Select the link and copy it");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			onOpenAutoFocus: (event) => {
				event.preventDefault();
				inputRef.current?.focus();
				inputRef.current?.select();
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, { children: ["Share ", title] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Anyone with this link can view the live artifact." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						ref: inputRef,
						readOnly: true,
						value: url,
						"aria-label": "Share link",
						className: "min-w-0 w-auto flex-1 font-mono text-xs",
						onFocus: (event) => event.currentTarget.select()
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						type: "button",
						className: "shrink-0",
						onClick: () => void onCopy(),
						children: "Copy"
					})]
				})
			]
		})
	});
}
//#endregion
export { ShareLinkDialog as t };
