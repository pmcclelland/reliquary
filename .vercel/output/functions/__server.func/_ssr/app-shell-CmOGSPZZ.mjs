import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { a as Plus, c as Monitor, f as Library, h as FileCode2, i as Sun, l as Menu, m as FolderPlus, p as Folder, s as Moon, v as Check } from "../_libs/lucide-react.mjs";
import { a as DialogTitle, c as Wordmark, d as cn, i as DialogDescription, n as Dialog, o as Input, r as DialogContent, s as Mark, t as Button } from "./dialog-Ch96cBIK.mjs";
import { _ as Link, v as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Separator2, i as Root2, n as Item2, o as Trigger, r as Portal2, t as Content2 } from "../_libs/@radix-ui/react-dropdown-menu+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { d as createCollectionFn, l as useTheme } from "./router-Dh8IKLHP.mjs";
import { t as _e } from "../_libs/cmdk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app-shell-CmOGSPZZ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Label({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
		className: cn("text-xs font-medium tracking-wide text-muted", className),
		...props
	});
}
function CommandPalette({ library }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const router = useRouter();
	const { setTheme } = useTheme();
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
				e.preventDefault();
				setOpen((v) => !v);
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);
	function go(path) {
		setOpen(false);
		router.history.push(path);
	}
	function appearance(next) {
		setTheme(next);
		setOpen(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(_e.Dialog, {
		open,
		onOpenChange: setOpen,
		label: "Search Reliquary",
		className: "fixed top-[18%] left-1/2 z-50 w-[min(32rem,calc(100%-1.5rem))] -translate-x-1/2 overflow-hidden rounded-xl bg-surface shadow-border",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Input, {
			placeholder: "Search artifacts and collections",
			className: "h-12 w-full border-b border-border bg-transparent px-4 text-sm outline-none placeholder:text-subtle"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(_e.List, {
			className: "max-h-80 overflow-y-auto p-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Empty, {
					className: "px-3 py-8 text-center text-sm text-muted",
					children: "Nothing matches."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(_e.Group, {
					heading: "Actions",
					className: "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:tracking-[0.14em] [&_[cmdk-group-heading]]:text-subtle [&_[cmdk-group-heading]]:uppercase",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Item, {
						onSelect: () => go("/new"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" }), " New artifact"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Item, {
						onSelect: () => go("/docs"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCode2, { className: "size-3.5" }), " API & MCP"]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(_e.Group, {
					heading: "Appearance",
					className: "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:tracking-[0.14em] [&_[cmdk-group-heading]]:text-subtle [&_[cmdk-group-heading]]:uppercase",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Item, {
							onSelect: () => appearance("light"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "size-3.5" }), " Light"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Item, {
							onSelect: () => appearance("dark"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, { className: "size-3.5" }), " Dark"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Item, {
							onSelect: () => appearance("system"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Monitor, { className: "size-3.5" }), " System"]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Group, {
					heading: "Artifacts",
					className: "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:tracking-[0.14em] [&_[cmdk-group-heading]]:text-subtle [&_[cmdk-group-heading]]:uppercase",
					children: library.artifacts.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Item, {
						onSelect: () => go(`/a/${a.slug}`),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCode2, { className: "size-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate",
							children: a.title
						})]
					}, a.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Group, {
					heading: "Collections",
					className: "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:tracking-[0.14em] [&_[cmdk-group-heading]]:text-subtle [&_[cmdk-group-heading]]:uppercase",
					children: library.collections.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Item, {
						onSelect: () => go(`/c/${c.slug}`),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Folder, { className: "size-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate",
							children: c.title
						})]
					}, c.id))
				})
			]
		})]
	});
}
function Item({ children, onSelect }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Item, {
		onSelect,
		className: "flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm data-[selected=true]:bg-surface-muted",
		children
	});
}
function Separator({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		role: "separator",
		className: cn("h-px w-full bg-border", className),
		...props
	});
}
var DropdownMenu = Root2;
var DropdownMenuTrigger = Trigger;
function DropdownMenuContent({ className, sideOffset = 6, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
		sideOffset,
		className: cn("z-50 min-w-44 rounded-lg bg-surface p-1 shadow-border", className),
		...props
	}) });
}
function DropdownMenuItem({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item2, {
		className: cn("flex cursor-pointer items-center gap-2 rounded-sm px-2.5 py-2 text-sm outline-none", "data-[highlighted]:bg-surface-muted", "data-[disabled]:pointer-events-none data-[disabled]:opacity-40", className),
		...props
	});
}
function DropdownMenuSeparator({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator2, {
		className: cn("my-1 h-px bg-border", className),
		...props
	});
}
var OPTIONS = [
	{
		value: "light",
		label: "Light",
		icon: Sun
	},
	{
		value: "dark",
		label: "Dark",
		icon: Moon
	},
	{
		value: "system",
		label: "System",
		icon: Monitor
	}
];
function ThemeToggle({ variant = "icon", side = "bottom", align = "end" }) {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setMounted(true), []);
	const current = OPTIONS.find((o) => o.value === theme) ?? OPTIONS[2];
	const Icon = mounted ? current.icon : Monitor;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
		asChild: true,
		children: variant === "row" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "ghost",
			className: "h-10 w-full justify-start px-2 text-muted hover:text-fg",
			"aria-label": "Appearance",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }), mounted ? current.label : "System"]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			size: "icon",
			"aria-label": "Appearance",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" })
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuContent, {
		align,
		side,
		className: "min-w-40",
		children: OPTIONS.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
			className: "min-h-10",
			onSelect: () => setTheme(opt.value),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(opt.icon, { className: "size-3.5" }),
				opt.label,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: cn("ml-auto size-3.5", mounted && theme === opt.value ? "opacity-100" : "opacity-0") })
			]
		}, opt.value))
	})] });
}
function Sidebar({ library, activeSlug, collectionSlug, onNavigate }) {
	const router = useRouter();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [title, setTitle] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const tags = (0, import_react.useMemo)(() => {
		const counts = /* @__PURE__ */ new Map();
		for (const a of library.artifacts) for (const tag of a.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
		return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);
	}, [library.artifacts]);
	async function onCreateCollection(e) {
		e.preventDefault();
		if (!title.trim()) return;
		setBusy(true);
		try {
			const col = await createCollectionFn({ data: { title: title.trim() } });
			setOpen(false);
			setTitle("");
			await router.invalidate({ sync: true });
			await router.navigate({
				to: "/c/$slug",
				params: { slug: col.slug }
			});
			onNavigate?.();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not create collection");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-0 flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center justify-between px-4 pt-5 pb-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					onClick: onNavigate,
					className: "min-w-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wordmark, {})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-3 pb-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					className: "w-full",
					size: "md",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/new",
						onClick: onNavigate,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "New artifact"]
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				className: "min-h-0 flex-1 overflow-y-auto px-2 pb-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "px-2 pt-2 pb-1 text-[11px] font-medium tracking-[0.16em] text-subtle uppercase",
						children: "Library"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SideLink, {
						to: "/",
						active: !activeSlug && !collectionSlug,
						onClick: onNavigate,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Library, { className: "size-3.5" }),
							"All artifacts",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-auto tabular-nums text-subtle",
								children: library.artifacts.length
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex items-center justify-between px-2 pb-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] font-medium tracking-[0.16em] text-subtle uppercase",
							children: "Collections"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setOpen(true),
							className: "flex size-8 items-center justify-center rounded-sm text-muted hover:bg-surface-muted hover:text-fg",
							"aria-label": "New collection",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderPlus, { className: "size-3.5" })
						})]
					}),
					library.collections.map((col) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/c/$slug",
						params: { slug: col.slug },
						onClick: onNavigate,
						className: sideClass(collectionSlug === col.slug),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "min-w-0 truncate",
							children: col.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ml-auto tabular-nums text-subtle",
							children: col.count
						})]
					}, col.id)),
					tags.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 px-2 pb-1 text-[11px] font-medium tracking-[0.16em] text-subtle uppercase",
						children: "Tags"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-1 px-2 pt-1",
						children: tags.map(([tag, n]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/",
							search: { tag },
							onClick: onNavigate,
							className: "rounded-sm bg-chip px-2 py-1 text-xs text-muted hover:text-fg",
							children: [tag, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-1 tabular-nums text-subtle",
								children: n
							})]
						}, tag))
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, { className: "my-4" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/docs",
						onClick: onNavigate,
						className: sideClass(false),
						children: "API & MCP"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "shrink-0 border-t border-border px-2 py-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeToggle, {
					variant: "row",
					side: "top",
					align: "start"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open,
				onOpenChange: setOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "New collection" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "A shelf for related artifacts. You can move pieces later." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-4 space-y-3",
						onSubmit: onCreateCollection,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "col-title",
								children: "Title"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "col-title",
								value: title,
								onChange: (e) => setTitle(e.target.value),
								placeholder: "Motion studies",
								autoFocus: true
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-end gap-2 pt-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "secondary",
								onClick: () => setOpen(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								disabled: busy || !title.trim(),
								children: "Create"
							})]
						})]
					})
				] })
			})
		]
	});
}
function SideLink({ to, active, onClick, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to,
		onClick,
		className: sideClass(active),
		children
	});
}
function sideClass(active) {
	return cn("flex h-9 items-center gap-2 rounded-md px-2 text-sm", active ? "bg-surface-muted text-fg" : "text-muted hover:bg-surface-muted/70 hover:text-fg");
}
function AppShell({ library, activeSlug, collectionSlug, children }) {
	const [mobileOpen, setMobileOpen] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-dvh bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
				className: "hidden h-full w-64 shrink-0 border-r border-border bg-bg md:flex md:flex-col",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sidebar, {
					library,
					activeSlug,
					collectionSlug
				})
			}),
			mobileOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "fixed inset-0 z-40 md:hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "absolute inset-0 bg-scrim",
					"aria-label": "Close menu",
					onClick: () => setMobileOpen(false)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
					className: "relative h-full w-72 max-w-[85vw] bg-bg shadow-border",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sidebar, {
						library,
						activeSlug,
						collectionSlug,
						onNavigate: () => setMobileOpen(false)
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "flex h-14 items-center gap-2 border-b border-border px-3 md:hidden",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon-sm",
							"aria-label": "Open menu",
							onClick: () => setMobileOpen(true),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/",
							className: "flex items-center gap-2 font-serif text-base",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mark, { className: "size-6" }), "Reliquary"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "ml-auto",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeToggle, {})
						})
					]
				}), children]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandPalette, { library })
		]
	});
}
//#endregion
export { DropdownMenuSeparator as a, DropdownMenuItem as i, DropdownMenu as n, DropdownMenuTrigger as o, DropdownMenuContent as r, Label as s, AppShell as t };
