import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./dialog-Ch96cBIK.mjs";
import { v as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as Route$5, p as deleteCollectionFn } from "./router-Dh8IKLHP.mjs";
import { t as AppShell } from "./app-shell-CmOGSPZZ.mjs";
import { a as AlertDialogDescription, i as AlertDialogContent, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogTitle, t as AlertDialog } from "./alert-dialog-CGa1Sn8R.mjs";
import { t as ArtifactCard } from "./card-BztqDRKY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/c._slug-B3yMUsF1.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CollectionPage() {
	const { collection, library } = Route$5.useLoaderData();
	const router = useRouter();
	const [confirm, setConfirm] = (0, import_react.useState)(false);
	const artifacts = library.artifacts.filter((a) => a.collectionId === collection.id);
	async function onDelete() {
		try {
			await deleteCollectionFn({ data: { slug: collection.slug } });
			toast.success("Collection removed. Artifacts were unfiled.");
			await router.invalidate({ sync: true });
			await router.navigate({ to: "/" });
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not delete");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		library,
		collectionSlug: collection.slug,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "mx-auto w-full max-w-5xl px-4 py-8 sm:px-8 sm:py-12",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] font-medium tracking-[0.18em] text-subtle uppercase",
						children: "Collection"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-2 font-serif text-4xl tracking-tight",
						children: collection.title
					}),
					collection.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-xl text-muted",
						children: collection.description
					}) : null
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					onClick: () => setConfirm(true),
					children: "Remove collection"
				})]
			}), artifacts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-16 text-muted",
				children: "This shelf is empty."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-10 grid gap-3 sm:grid-cols-2",
				children: artifacts.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArtifactCard, { artifact: a }, a.id))
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
			open: confirm,
			onOpenChange: setConfirm,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Remove this collection?" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: "Artifacts stay in the library; they become unfiled. The collection itself is deleted." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Cancel" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
					onClick: () => void onDelete(),
					children: "Remove"
				})] })
			] })
		})]
	});
}
//#endregion
export { CollectionPage as component };
