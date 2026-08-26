import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { d as cn, o as Input, p as formatBytes, t as Button } from "./dialog-Ch96cBIK.mjs";
import { t as ArtifactFrame } from "./frame-B1XLdKbc.mjs";
import { s as Label } from "./app-shell-CmOGSPZZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/editor-form-v21QvG7a.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Textarea = (0, import_react.forwardRef)(function Textarea({ className, ...props }, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		ref,
		className: cn("min-h-32 w-full rounded-md bg-surface px-3 py-2 text-sm text-fg shadow-border", "placeholder:text-subtle", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70", "disabled:opacity-40", className),
		...props
	});
});
function EditorForm({ collections, initial, submitLabel, busy, onSubmit, onCancel }) {
	const [title, setTitle] = (0, import_react.useState)(initial?.title ?? "");
	const [description, setDescription] = (0, import_react.useState)(initial?.description ?? "");
	const [html, setHtml] = (0, import_react.useState)(initial?.html ?? "");
	const [collectionId, setCollectionId] = (0, import_react.useState)(initial?.collectionId ?? "");
	const [tags, setTags] = (0, import_react.useState)((initial?.tags ?? []).join(", "));
	const [slug, setSlug] = (0, import_react.useState)(initial?.slug ?? "");
	const [previewHtml, setPreviewHtml] = (0, import_react.useState)(initial?.html ?? "");
	const [tab, setTab] = (0, import_react.useState)("split");
	const fileRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const t = window.setTimeout(() => setPreviewHtml(html), 400);
		return () => window.clearTimeout(t);
	}, [html]);
	const valuesRef = (0, import_react.useRef)({
		title,
		description,
		html,
		collectionId,
		tags,
		slug
	});
	valuesRef.current = {
		title,
		description,
		html,
		collectionId,
		tags,
		slug
	};
	const onSubmitRef = (0, import_react.useRef)(onSubmit);
	onSubmitRef.current = onSubmit;
	(0, import_react.useEffect)(() => {
		function onKey(e) {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
				e.preventDefault();
				const v = valuesRef.current;
				onSubmitRef.current(v);
			}
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);
	const bytes = (0, import_react.useMemo)(() => new TextEncoder().encode(html).length, [html]);
	async function handleSubmit(e) {
		e?.preventDefault();
		await onSubmit({
			title,
			description,
			html,
			collectionId,
			tags,
			slug
		});
	}
	function onFile(file) {
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			const text = String(reader.result ?? "");
			setHtml(text);
			if (!title.trim()) setTitle(file.name.replace(/\.html?$/i, ""));
		};
		reader.readAsText(file);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: handleSubmit,
		className: "flex min-h-0 flex-1 flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 border-b border-border px-4 py-4 md:grid-cols-2 lg:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Title",
						htmlFor: "title",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "title",
							value: title,
							onChange: (e) => setTitle(e.target.value),
							required: true,
							placeholder: "Harmonic"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Description",
						htmlFor: "desc",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "desc",
							value: description,
							onChange: (e) => setDescription(e.target.value),
							placeholder: "A short note for the wiki"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Collection",
						htmlFor: "col",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							id: "col",
							value: collectionId,
							onChange: (e) => setCollectionId(e.target.value),
							className: "h-10 w-full rounded-md bg-surface px-3 text-sm shadow-border",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Unfiled"
							}), collections.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: c.id,
								children: c.title
							}, c.id))]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Tags",
						htmlFor: "tags",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "tags",
							value: tags,
							onChange: (e) => setTags(e.target.value),
							placeholder: "motion, canvas"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Slug",
						htmlFor: "slug",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "slug",
							value: slug,
							onChange: (e) => setSlug(e.target.value),
							placeholder: "generated from title"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-end gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								ref: fileRef,
								type: "file",
								accept: ".html,text/html",
								className: "hidden",
								onChange: (e) => onFile(e.target.files?.[0])
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "secondary",
								onClick: () => fileRef.current?.click(),
								children: "Upload .html"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-subtle tabular-nums",
								children: formatBytes(bytes)
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-1 border-b border-border px-3 py-2",
				children: [[
					"split",
					"source",
					"preview"
				].map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setTab(id),
					className: cn("h-8 rounded-sm px-3 text-xs font-medium capitalize", tab === id ? "bg-surface-muted text-fg" : "text-muted hover:text-fg"),
					children: id
				}, id)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "ml-auto flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						onClick: onCancel,
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: busy || !title.trim() || !html.trim(),
						children: submitLabel
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("grid min-h-0 flex-1", tab === "split" ? "md:grid-cols-2" : "grid-cols-1"),
				children: [(tab === "split" || tab === "source") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					value: html,
					onChange: (e) => setHtml(e.target.value),
					onKeyDown: (e) => {
						if (e.key === "Tab") {
							e.preventDefault();
							const el = e.currentTarget;
							const start = el.selectionStart;
							const end = el.selectionEnd;
							const next = html.slice(0, start) + "  " + html.slice(end);
							setHtml(next);
							requestAnimationFrame(() => {
								el.selectionStart = el.selectionEnd = start + 2;
							});
						}
					},
					spellCheck: false,
					className: "min-h-80 flex-1 resize-none rounded-none border-0 font-mono text-[13px] leading-relaxed shadow-none md:min-h-0",
					placeholder: "Paste a self-contained HTML document, a fragment, or a React module that defines App."
				}), (tab === "split" || tab === "preview") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "min-h-80 border-t border-border bg-chip md:min-h-0 md:border-t-0 md:border-l",
					children: previewHtml.trim() ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArtifactFrame, {
						html: previewHtml,
						title: title || "Preview"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-full items-center justify-center text-sm text-muted",
						children: "Preview appears as you type."
					})
				})]
			})
		]
	});
}
function Field({ label, htmlFor, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
			htmlFor,
			children: label
		}), children]
	});
}
//#endregion
export { EditorForm as t };
