import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { A as Slot, F as require_jsx_runtime, d as DialogContent$1, f as DialogDescription$1, h as DialogTitle$1, l as Dialog$1, m as DialogPortal, p as DialogOverlay, u as DialogClose } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as X } from "../_libs/lucide-react.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dialog-Ch96cBIK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function formatBytes(n) {
	if (n < 1024) return `${n} B`;
	if (n < 1048576) return `${(n / 1024).toFixed(1)} KB`;
	return `${(n / 1048576).toFixed(1)} MB`;
}
function formatStamp(iso) {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return "";
	return d.toLocaleDateString(void 0, {
		month: "short",
		day: "numeric",
		year: "numeric"
	});
}
function formatRelative(iso) {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return "";
	const diff = Date.now() - d.getTime();
	const min = Math.round(diff / 6e4);
	if (min < 1) return "just now";
	if (min < 60) return `${min}m ago`;
	const hr = Math.round(min / 60);
	if (hr < 24) return `${hr}h ago`;
	const day = Math.round(hr / 24);
	if (day < 14) return `${day}d ago`;
	return formatStamp(iso);
}
function isEmbeddedFrame() {
	try {
		return window.self !== window.top;
	} catch {
		return true;
	}
}
function copyWithExecCommand(text) {
	const el = document.createElement("textarea");
	el.value = text;
	el.setAttribute("readonly", "");
	el.setAttribute("aria-hidden", "true");
	el.style.cssText = "position:fixed;top:0;left:0;width:1px;height:1px;padding:0;border:0;outline:none;box-shadow:none;background:transparent;opacity:0;";
	document.body.appendChild(el);
	const selection = document.getSelection();
	const previous = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
	el.focus();
	el.select();
	el.setSelectionRange(0, el.value.length);
	let ok = false;
	try {
		ok = document.execCommand("copy");
	} catch {
		ok = false;
	}
	document.body.removeChild(el);
	if (previous && selection) {
		selection.removeAllRanges();
		selection.addRange(previous);
	}
	return ok;
}
/** Copy text. Returns false if the OS clipboard is unavailable (common in embeds). */
async function copyText(text) {
	if (typeof window === "undefined" || text.length === 0) return false;
	if (window.isSecureContext && navigator.clipboard?.writeText) try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch {}
	if (!isEmbeddedFrame() && copyWithExecCommand(text)) return true;
	return false;
}
function artifactShareUrl(slug) {
	return new URL(`/s/${slug}`, window.location.origin).href;
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 disabled:pointer-events-none disabled:opacity-40 active:not-disabled:scale-[0.96] transition-[scale,background-color,color,box-shadow,opacity] duration-150 ease-out", {
	variants: {
		variant: {
			default: "bg-accent text-accent-foreground hover:bg-accent/90 shadow-border",
			secondary: "bg-surface text-fg shadow-border hover:shadow-border-hover hover:bg-surface-muted",
			ghost: "text-fg hover:bg-surface-muted",
			outline: "bg-transparent text-fg shadow-border hover:bg-surface-muted",
			danger: "bg-danger text-danger-foreground hover:bg-danger/90"
		},
		size: {
			sm: "h-8 rounded-sm px-3 text-sm",
			md: "h-10 rounded-md px-4 text-sm",
			lg: "h-11 rounded-md px-5 text-sm",
			icon: "size-10 rounded-md",
			"icon-sm": "size-8 rounded-sm"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "md"
	}
});
var Button = (0, import_react.forwardRef)(function Button({ className, variant, size, asChild = false, ...props }, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		ref,
		...props
	});
});
var Input = (0, import_react.forwardRef)(function Input({ className, ...props }, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		ref,
		className: cn("h-10 w-full rounded-md bg-surface px-3 text-sm text-fg shadow-border", "placeholder:text-subtle", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70", "disabled:opacity-40", className),
		...props
	});
});
function Mark({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 32 32",
		className: cn("size-7", className),
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "3.25",
				y: "3.25",
				width: "25.5",
				height: "25.5",
				rx: "4",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "8.5",
				y: "8.5",
				width: "15",
				height: "15",
				rx: "2",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.25",
				opacity: "0.65"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "16",
				cy: "16",
				r: "2.4",
				fill: "currentColor"
			})
		]
	});
}
function Wordmark({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("flex items-center gap-2.5 text-fg", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mark, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-serif text-lg tracking-tight",
			children: "Reliquary"
		})]
	});
}
var Dialog = Dialog$1;
function DialogContent({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, { className: "fixed inset-0 z-50 bg-scrim" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
		className: cn("fixed top-1/2 left-1/2 z-50 w-[min(28rem,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2", "rounded-xl bg-surface p-5 shadow-border", "focus:outline-none", className),
		...props,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogClose, {
			className: "absolute top-3 right-3 size-8 rounded-sm text-muted hover:bg-surface-muted hover:text-fg",
			"aria-label": "Close",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "mx-auto size-4" })
		})]
	})] });
}
function DialogTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
		className: cn("font-serif text-xl font-medium tracking-tight", className),
		...props
	});
}
function DialogDescription({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
		className: cn("mt-1 text-sm text-muted", className),
		...props
	});
}
//#endregion
export { DialogTitle as a, Wordmark as c, cn as d, copyText as f, DialogDescription as i, artifactShareUrl as l, formatRelative as m, Dialog as n, Input as o, formatBytes as p, DialogContent as r, Mark as s, Button as t, buttonVariants as u };
