import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { v as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { m as updateArtifactFn, n as Route$3 } from "./router-Dh8IKLHP.mjs";
import { t as AppShell } from "./app-shell-CmOGSPZZ.mjs";
import { t as EditorForm } from "./editor-form-v21QvG7a.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/a._slug.edit-Cog-rhKr.js
var import_jsx_runtime = require_jsx_runtime();
function parseTags(value) {
	return value.split(/[,]+/).map((t) => t.trim()).filter(Boolean);
}
function EditPage() {
	const { library, artifact } = Route$3.useLoaderData();
	const router = useRouter();
	async function onSubmit(values) {
		try {
			const updated = await updateArtifactFn({ data: {
				slug: artifact.slug,
				patch: {
					title: values.title,
					description: values.description,
					html: values.html,
					collectionId: values.collectionId || null,
					tags: parseTags(values.tags),
					slug: values.slug || void 0
				}
			} });
			toast.success("Saved");
			await router.invalidate({ sync: true });
			await router.navigate({
				to: "/a/$slug",
				params: { slug: updated.slug }
			});
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not save");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		library,
		activeSlug: artifact.slug,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-h-0 flex-1 flex-col",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-b border-border px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs tracking-[0.14em] text-subtle uppercase",
					children: "Editing"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-serif text-2xl tracking-tight",
					children: artifact.title
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditorForm, {
				collections: library.collections,
				initial: artifact,
				submitLabel: "Save",
				onSubmit,
				onCancel: () => void router.navigate({
					to: "/a/$slug",
					params: { slug: artifact.slug }
				})
			})]
		})
	});
}
//#endregion
export { EditPage as component };
