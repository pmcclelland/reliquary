import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { _ as CodeXml, d as Link2, g as Ellipsis, o as Pencil, r as Trash2, u as Maximize2 } from "../_libs/lucide-react.mjs";
import { f as copyText, l as artifactShareUrl, m as formatRelative, p as formatBytes, t as Button } from "./dialog-Ch96cBIK.mjs";
import { _ as Link, v as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as Route$9, f as deleteArtifactFn } from "./router-Dh8IKLHP.mjs";
import { t as ArtifactFrame } from "./frame-B1XLdKbc.mjs";
import { a as DropdownMenuSeparator, i as DropdownMenuItem, n as DropdownMenu, o as DropdownMenuTrigger, r as DropdownMenuContent, t as AppShell } from "./app-shell-CmOGSPZZ.mjs";
import { t as ShareLinkDialog } from "./share-dialog-B1rg6XB2.mjs";
import { a as AlertDialogDescription, i as AlertDialogContent, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogTitle, t as AlertDialog } from "./alert-dialog-CGa1Sn8R.mjs";
import { t as Badge } from "./badge-DZA8DePC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/a._slug-ULEPlb-S.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ArtifactPage() {
	const { library, artifact } = Route$9.useLoaderData();
	const router = useRouter();
	const [source, setSource] = (0, import_react.useState)(false);
	const [confirm, setConfirm] = (0, import_react.useState)(false);
	const [shareUrl, setShareUrl] = (0, import_react.useState)(null);
	const bytes = new TextEncoder().encode(artifact.html).length;
	async function onDelete() {
		try {
			await deleteArtifactFn({ data: { slug: artifact.slug } });
			toast.success("Artifact removed");
			await router.invalidate({ sync: true });
			await router.navigate({ to: "/" });
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not delete");
		}
	}
	async function copyHtml() {
		if (await copyText(artifact.html)) {
			toast.success("HTML copied");
			return;
		}
		setSource(true);
		toast.message("Clipboard blocked — copy from source");
	}
	async function share() {
		const url = artifactShareUrl(artifact.slug);
		setShareUrl(url);
		if (await copyText(url)) toast.success("Share link copied");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		library,
		activeSlug: artifact.slug,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-h-0 flex-1 flex-col",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-4 sm:px-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-subtle",
								children: [
									artifact.collectionSlug ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/c/$slug",
										params: { slug: artifact.collectionSlug },
										className: "hover:text-fg",
										children: artifact.collectionTitle
									}) : "Unfiled",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mx-1.5",
										children: "/"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted",
										children: artifact.slug
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "mt-1 font-serif text-3xl tracking-tight",
								children: artifact.title
							}),
							artifact.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 max-w-2xl text-sm text-muted",
								children: artifact.description
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 flex flex-wrap items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: artifact.kind === "react" ? "React" : "HTML" }),
									artifact.tags.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: `#${tag}` }, tag)),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-xs text-subtle tabular-nums",
										children: [
											formatRelative(artifact.updatedAt),
											" · ",
											formatBytes(bytes)
										]
									})
								]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: source ? "default" : "secondary",
								size: "sm",
								onClick: () => setSource((v) => !v),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeXml, { className: "size-4" }), "Source"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								size: "sm",
								variant: "secondary",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/s/$slug",
									params: { slug: artifact.slug },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Maximize2, { className: "size-4" }), "Open"]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: "secondary",
								onClick: () => void share(),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, { className: "size-4" }), "Share"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								size: "sm",
								variant: "secondary",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/a/$slug/edit",
									params: { slug: artifact.slug },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" }), "Edit"]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "icon-sm",
									"aria-label": "More",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: "size-4" })
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
								align: "end",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
										onSelect: () => void share(),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, { className: "size-3.5" }), "Copy share link"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
										onSelect: () => void copyHtml(),
										children: "Copy HTML"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
										className: "text-danger",
										onSelect: () => setConfirm(true),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" }), "Delete"]
									})
								]
							})] })
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "min-h-[70vh] flex-1 bg-chip",
					children: source ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
						className: "h-full overflow-auto p-4 font-mono text-[12px] leading-relaxed text-fg",
						children: artifact.html
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArtifactFrame, {
						html: artifact.html,
						title: artifact.title
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShareLinkDialog, {
				open: shareUrl !== null,
				onOpenChange: (open) => {
					if (!open) setShareUrl(null);
				},
				url: shareUrl ?? "",
				title: artifact.title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
				open: confirm,
				onOpenChange: setConfirm,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Remove this artifact?" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogDescription, { children: [
						"“",
						artifact.title,
						"” will be deleted from the wiki. This cannot be undone."
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Cancel" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
						onClick: () => void onDelete(),
						children: "Delete"
					})] })
				] })
			})
		]
	});
}
//#endregion
export { ArtifactPage as component };
