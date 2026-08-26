import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { v as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { o as Route$10, u as createArtifactFn } from "./router-Dh8IKLHP.mjs";
import { t as AppShell } from "./app-shell-CmOGSPZZ.mjs";
import { t as EditorForm } from "./editor-form-v21QvG7a.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/new-BS6jBady.js
var import_jsx_runtime = require_jsx_runtime();
function parseTags(value) {
	return value.split(/[,]+/).map((t) => t.trim()).filter(Boolean);
}
function NewPage() {
	const library = Route$10.useLoaderData();
	const router = useRouter();
	async function onSubmit(values) {
		try {
			const created = await createArtifactFn({ data: {
				title: values.title,
				description: values.description,
				html: values.html,
				collectionId: values.collectionId || null,
				tags: parseTags(values.tags),
				slug: values.slug || void 0
			} });
			toast.success("Filed");
			await router.invalidate({ sync: true });
			await router.navigate({
				to: "/a/$slug",
				params: { slug: created.slug }
			});
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not create");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		library,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-h-0 flex-1 flex-col",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-b border-border px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs tracking-[0.14em] text-subtle uppercase",
					children: "New artifact"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-serif text-2xl tracking-tight",
					children: "File something living"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditorForm, {
				collections: library.collections,
				submitLabel: "Publish",
				onSubmit,
				onCancel: () => void router.navigate({ to: "/" })
			})]
		})
	});
}
//#endregion
export { NewPage as component };
