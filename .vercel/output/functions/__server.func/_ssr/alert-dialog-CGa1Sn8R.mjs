import { F as require_jsx_runtime, a as Overlay2, c as Title2, i as Description2, n as Cancel, o as Portal2, r as Content2, s as Root2, t as Action } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { d as cn, u as buttonVariants } from "./dialog-Ch96cBIK.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/alert-dialog-CGa1Sn8R.js
var import_jsx_runtime = require_jsx_runtime();
var AlertDialog = Root2;
function AlertDialogContent({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Portal2, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overlay2, { className: "fixed inset-0 z-50 bg-scrim" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
		className: cn("fixed top-1/2 left-1/2 z-50 w-[min(26rem,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2", "rounded-xl bg-surface p-5 shadow-border focus:outline-none", className),
		...props
	})] });
}
function AlertDialogTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Title2, {
		className: cn("font-serif text-xl font-medium tracking-tight", className),
		...props
	});
}
function AlertDialogDescription({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Description2, {
		className: cn("mt-2 text-sm text-muted", className),
		...props
	});
}
function AlertDialogFooter({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("mt-5 flex justify-end gap-2", className),
		...props
	});
}
function AlertDialogCancel({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cancel, {
		className: cn(buttonVariants({ variant: "secondary" }), className),
		...props
	});
}
function AlertDialogAction({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Action, {
		className: cn(buttonVariants({ variant: "danger" }), className),
		...props
	});
}
//#endregion
export { AlertDialogDescription as a, AlertDialogContent as i, AlertDialogAction as n, AlertDialogFooter as o, AlertDialogCancel as r, AlertDialogTitle as s, AlertDialog as t };
