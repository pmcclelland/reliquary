import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as TriangleAlert } from "../_libs/lucide-react.mjs";
import { f as createRouter, g as createRootRoute, h as createFileRoute, l as Scripts, m as lazyRouteComponent, p as Outlet, u as HeadContent, v as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { a as string, i as object, n as literal, o as union, r as number } from "../_libs/zod.mjs";
import { a as artifactPatchSchema, c as listQuerySchema, i as artifactCreateSchema, n as APP_TAGLINE, o as collectionCreateSchema, r as ReliquaryError, s as collectionPatchSchema, t as APP_NAME } from "./schema-C6xkN7Ue.mjs";
import { a as getArtifact$1, c as listCollections, d as updateCollection, f as __exportAll, i as deleteCollection, n as createCollection, o as getCollection, r as deleteArtifact, s as listArtifacts, t as createArtifact, u as updateArtifact } from "./store.server-TFqfTTKj.mjs";
import { t as Provider } from "../_libs/radix-ui__react-tooltip.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/functions-BcKK1dqY.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var getLibrary = createServerFn({ method: "GET" }).handler(createSsrRpc("d22772c5969eed592ed64d140faf059bf6f35c39417a7ef01443b1749375fc9b"));
var getArtifact = createServerFn({ method: "GET" }).validator(object({ slug: string().min(1) })).handler(createSsrRpc("72df42b4b4b5e5d20247473461df7647fe7777cb80733e2fde101c8bc0a860b6"));
var getCollectionPage = createServerFn({ method: "GET" }).validator(object({ slug: string().min(1) })).handler(createSsrRpc("bee767d67d0a2dddf36772f4c2860c9d399a52f163f52dc9c7b1a8ebc4c75d10"));
var createArtifactFn = createServerFn({ method: "POST" }).validator(artifactCreateSchema).handler(createSsrRpc("770f8f99f3756a232c0d40ef56da56593332b8f8e5c846c9c23b96f9b905ec9a"));
var updateArtifactFn = createServerFn({ method: "POST" }).validator(object({
	slug: string().min(1),
	patch: artifactPatchSchema
})).handler(createSsrRpc("d5eef2e20312908252ce85206f7c449c26186bb509511c333ba906f3f7704d9b"));
var deleteArtifactFn = createServerFn({ method: "POST" }).validator(object({ slug: string().min(1) })).handler(createSsrRpc("80ec0cf9b72d8a305ca92a6549e8a261fede2bed6c0653b4e15582ea81b3c6c5"));
var createCollectionFn = createServerFn({ method: "POST" }).validator(collectionCreateSchema).handler(createSsrRpc("77d76f866871f654ae2ae30a5981e468dcad1a5e1517a6b949c7bb5951254405"));
var deleteCollectionFn = createServerFn({ method: "POST" }).validator(object({ slug: string().min(1) })).handler(createSsrRpc("4f0d1aca84508396ebd99e54eb84be6a6b4b2cf00ed2d6b96d053ea269d1fad8"));
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/router-Dh8IKLHP.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: error.message || "An unexpected error occurred. Try reloading the page."
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	if (typeof window === "undefined") return () => {};
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	const parentOrigin = resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		if (envelope.data.type === "hello") {
			if (!HelloSchema.safeParse(event.data).success) return;
			announce();
			return;
		}
		if (envelope.data.type === "navigate") {
			const parsed = NavigateSchema.safeParse(event.data);
			if (!parsed.success) return;
			navigate(parsed.data.path);
			queueMicrotask(reportLocation);
			return;
		}
		if (envelope.data.type === "history") {
			const parsed = HistorySchema.safeParse(event.data);
			if (!parsed.success) return;
			if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
			window.history.go(parsed.data.delta);
		}
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
function TooltipProvider({ children, delayDuration = 250 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Provider, {
		delayDuration,
		children
	});
}
var STORAGE_KEY = "reliquary-theme";
var THEME_COLORS = {
	light: "#f3efe6",
	dark: "#14110e"
};
var themeBootstrapScript = `(function(){try{var s=localStorage.getItem(${JSON.stringify(STORAGE_KEY)});var d=s==="dark"||(s!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);var r=d?"dark":"light";var e=document.documentElement;e.dataset.theme=r;e.classList.toggle("dark",d);e.style.colorScheme=r;var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",d?"${THEME_COLORS.dark}":"${THEME_COLORS.light}");}catch(t){}})();`;
var ThemeContext = (0, import_react.createContext)(null);
function useTheme() {
	const ctx = (0, import_react.useContext)(ThemeContext);
	if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
	return ctx;
}
function readStoredTheme() {
	try {
		const value = window.localStorage.getItem(STORAGE_KEY);
		if (value === "light" || value === "dark" || value === "system") return value;
	} catch {}
	return "system";
}
function resolveTheme(theme) {
	if (theme !== "system") return theme;
	return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function applyResolved(resolved) {
	const root = document.documentElement;
	root.dataset.theme = resolved;
	root.classList.toggle("dark", resolved === "dark");
	root.style.colorScheme = resolved;
	const meta = document.querySelector("meta[name=\"theme-color\"]");
	if (meta) meta.setAttribute("content", THEME_COLORS[resolved]);
}
function ThemeProvider({ children }) {
	const [theme, setThemeState] = (0, import_react.useState)("system");
	const [resolved, setResolved] = (0, import_react.useState)("light");
	const hydrated = (0, import_react.useRef)(false);
	(0, import_react.useLayoutEffect)(() => {
		if (!hydrated.current) {
			hydrated.current = true;
			const stored = readStoredTheme();
			if (stored !== theme) {
				setThemeState(stored);
				const next = resolveTheme(stored);
				setResolved(next);
				applyResolved(next);
				return;
			}
		}
		const apply = () => {
			const next = resolveTheme(theme);
			setResolved(next);
			applyResolved(next);
		};
		apply();
		if (theme !== "system") return;
		const mq = window.matchMedia("(prefers-color-scheme: dark)");
		mq.addEventListener("change", apply);
		return () => mq.removeEventListener("change", apply);
	}, [theme]);
	const setTheme = (0, import_react.useCallback)((next) => {
		setThemeState(next);
		try {
			window.localStorage.setItem(STORAGE_KEY, next);
		} catch {}
	}, []);
	const value = (0, import_react.useMemo)(() => ({
		theme,
		resolved,
		setTheme
	}), [
		theme,
		resolved,
		setTheme
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeContext.Provider, {
		value,
		children
	});
}
var styles_default = "/assets/styles-DSrtIE8Q.css";
function NotFound() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-dvh flex-col items-center justify-center gap-3 bg-bg px-6 text-center text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] font-medium tracking-[0.16em] text-subtle uppercase",
				children: "Reliquary"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-serif text-3xl tracking-tight",
				children: "Not in the library"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-sm text-sm text-muted",
				children: "That page or artifact does not exist. It may have been moved or removed."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href: "/",
				className: "mt-2 text-sm text-accent underline-offset-4 hover:underline",
				children: "Back to the shelves"
			})
		]
	});
}
function ThemedToaster() {
	const { resolved } = useTheme();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		theme: resolved,
		position: "bottom-right",
		toastOptions: { style: {
			background: "var(--color-surface)",
			color: "var(--color-fg)",
			border: "1px solid var(--color-border)",
			fontFamily: "var(--font-sans)"
		} }
	});
}
var Route$13 = createRootRoute({
	notFoundComponent: NotFound,
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: APP_NAME },
			{
				name: "description",
				content: APP_TAGLINE
			},
			{
				name: "theme-color",
				content: "#f3efe6"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,400;0,500;0,600;1,400&family=IBM+Plex+Mono:wght@400;500&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&display=swap"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		className: "antialiased",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("head", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("script", { dangerouslySetInnerHTML: { __html: themeBootstrapScript } })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TooltipProvider, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemedToaster, {})] }) }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	})
});
var $$splitComponentImporter$6 = () => import("./routes-D_gmVbQG.mjs");
var searchSchema = object({
	q: string().optional(),
	tag: string().optional()
});
var Route$12 = createFileRoute("/")({
	validateSearch: searchSchema,
	loader: () => getLibrary(),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./docs-itV5_akW.mjs");
var Route$11 = createFileRoute("/docs")({
	loader: () => getLibrary(),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./new-BS6jBady.mjs");
var Route$10 = createFileRoute("/new")({
	loader: () => getLibrary(),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./a._slug-ULEPlb-S.mjs");
var Route$9 = createFileRoute("/a/$slug")({
	loader: async ({ params }) => {
		const [library, artifact] = await Promise.all([getLibrary(), getArtifact({ data: { slug: params.slug } })]);
		return {
			library,
			artifact
		};
	},
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
function corsHeaders() {
	return {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type, Accept, Authorization, MCP-Session-Id, MCP-Protocol-Version",
		"Access-Control-Expose-Headers": "MCP-Session-Id, MCP-Protocol-Version",
		"Access-Control-Max-Age": "86400"
	};
}
function handleOptions() {
	return new Response(null, {
		status: 204,
		headers: corsHeaders()
	});
}
function json(data, status = 200, extra) {
	return Response.json(data, {
		status,
		headers: {
			...corsHeaders(),
			...extra
		}
	});
}
function errorResponse(err) {
	if (err instanceof ReliquaryError) return json({
		error: err.message,
		code: err.code
	}, err.status);
	return json({
		error: err instanceof Error ? err.message : "Internal error",
		code: "INTERNAL"
	}, 500);
}
async function readJson(request) {
	const text = await request.text();
	if (!text.trim()) return {};
	try {
		return JSON.parse(text);
	} catch {
		throw new ReliquaryError("Request body must be JSON", 400, "INVALID");
	}
}
var Route$8 = createFileRoute("/api/artifacts")({ server: { handlers: {
	OPTIONS: () => handleOptions(),
	GET: async ({ request }) => {
		try {
			const url = new URL(request.url);
			const parsed = listQuerySchema.parse({
				collection: url.searchParams.get("collection") ?? void 0,
				tag: url.searchParams.get("tag") ?? void 0,
				q: url.searchParams.get("q") ?? void 0
			});
			const artifacts = await listArtifacts(parsed);
			return json({
				artifacts,
				count: artifacts.length
			});
		} catch (err) {
			return errorResponse(err);
		}
	},
	POST: async ({ request }) => {
		try {
			const body = await readJson(request);
			const parsed = artifactCreateSchema.parse(body);
			return json(await createArtifact(parsed), 201);
		} catch (err) {
			if (err && typeof err === "object" && "issues" in err) return errorResponse(new ReliquaryError("Invalid artifact payload", 400, "INVALID"));
			return errorResponse(err);
		}
	}
} } });
var Route$7 = createFileRoute("/api/collections")({ server: { handlers: {
	OPTIONS: () => handleOptions(),
	GET: async () => {
		try {
			return json({ collections: await listCollections() });
		} catch (err) {
			return errorResponse(err);
		}
	},
	POST: async ({ request }) => {
		try {
			const body = await readJson(request);
			const parsed = collectionCreateSchema.parse(body);
			return json(await createCollection(parsed), 201);
		} catch (err) {
			if (err && typeof err === "object" && "issues" in err) return errorResponse(new ReliquaryError("Invalid collection payload", 400, "INVALID"));
			return errorResponse(err);
		}
	}
} } });
var SERVER_INFO = {
	name: "reliquary",
	version: "1.0.0",
	title: "Reliquary"
};
var INSTRUCTIONS = `Reliquary is a wiki of living HTML artifacts. Each artifact is a self-contained .html file (plain HTML/CSS/JS, or React via Babel standalone / a full HTML shell).

When creating artifacts:
- Prefer a complete HTML document (doctype + html). Fragments and JSX modules are wrapped automatically.
- For React, either send a full document that loads React + Babel, or send a module that defines function App() { ... }.
- Keep work self-contained: no local file references. CDNs are allowed.
- Set title, a short description, optional collection (id or slug), and tags.
- After publishing, the live share view is /s/{slug} (thin Reliquary bar, full-bleed artifact). The wiki page is /a/{slug}.

Use list_artifacts before editing so you target the right id or slug.`;
var TOOLS = [
	{
		name: "list_artifacts",
		description: "List artifact summaries (no HTML body). Filter by collection (id or slug), tag, or free-text query.",
		inputSchema: {
			type: "object",
			properties: {
				collection: {
					type: "string",
					description: "Collection id or slug"
				},
				tag: { type: "string" },
				q: {
					type: "string",
					description: "Search title, description, and tags"
				}
			}
		}
	},
	{
		name: "get_artifact",
		description: "Get a single artifact including its full HTML. Lookup by id or slug.",
		inputSchema: {
			type: "object",
			properties: { id: {
				type: "string",
				description: "Artifact id or slug"
			} },
			required: ["id"]
		}
	},
	{
		name: "create_artifact",
		description: "Publish a new artifact. html may be a full document, an HTML fragment, or a React module defining App.",
		inputSchema: {
			type: "object",
			properties: {
				title: { type: "string" },
				html: { type: "string" },
				description: { type: "string" },
				collection: {
					type: "string",
					description: "Collection id or slug to file under"
				},
				tags: {
					type: "array",
					items: { type: "string" }
				},
				slug: { type: "string" }
			},
			required: ["title", "html"]
		}
	},
	{
		name: "update_artifact",
		description: "Update an artifact by id or slug. Only provided fields change.",
		inputSchema: {
			type: "object",
			properties: {
				id: {
					type: "string",
					description: "Artifact id or slug"
				},
				title: { type: "string" },
				html: { type: "string" },
				description: { type: "string" },
				collection: {
					type: "string",
					description: "Collection id or slug, or empty to unfile"
				},
				tags: {
					type: "array",
					items: { type: "string" }
				},
				slug: { type: "string" }
			},
			required: ["id"]
		}
	},
	{
		name: "delete_artifact",
		description: "Delete one artifact by id or slug.",
		inputSchema: {
			type: "object",
			properties: { id: { type: "string" } },
			required: ["id"]
		}
	},
	{
		name: "list_collections",
		description: "List collections with artifact counts.",
		inputSchema: {
			type: "object",
			properties: {}
		}
	},
	{
		name: "create_collection",
		description: "Create a collection (folder) for organizing artifacts.",
		inputSchema: {
			type: "object",
			properties: {
				title: { type: "string" },
				description: { type: "string" },
				slug: { type: "string" }
			},
			required: ["title"]
		}
	},
	{
		name: "delete_collection",
		description: "Delete a collection by id or slug. Artifacts in it are unfiled, not deleted.",
		inputSchema: {
			type: "object",
			properties: { id: { type: "string" } },
			required: ["id"]
		}
	}
];
function ok(id, result) {
	return {
		jsonrpc: "2.0",
		id,
		result
	};
}
function fail(id, code, message) {
	return {
		jsonrpc: "2.0",
		id,
		error: {
			code,
			message
		}
	};
}
function withShare(artifact) {
	return {
		...artifact,
		sharePath: `/s/${artifact.slug}`
	};
}
function asArgs(params) {
	if (!params || typeof params !== "object") return {};
	const rec = params;
	if (rec.arguments && typeof rec.arguments === "object") return rec.arguments;
	return rec;
}
function toolName(params) {
	if (!params || typeof params !== "object") return "";
	const rec = params;
	return typeof rec.name === "string" ? rec.name : "";
}
function textResult(data, isError = false) {
	return {
		content: [{
			type: "text",
			text: typeof data === "string" ? data : JSON.stringify(data, null, 2)
		}],
		structuredContent: typeof data === "object" ? data : { result: data },
		isError
	};
}
async function callTool(name, args) {
	switch (name) {
		case "list_artifacts": {
			const items = await listArtifacts({
				collection: typeof args.collection === "string" ? args.collection : void 0,
				tag: typeof args.tag === "string" ? args.tag : void 0,
				q: typeof args.q === "string" ? args.q : void 0
			});
			return textResult({
				artifacts: items,
				count: items.length
			});
		}
		case "get_artifact": {
			const id = String(args.id ?? "");
			if (!id) throw new ReliquaryError("id is required");
			return textResult(withShare(await getArtifact$1(id)));
		}
		case "create_artifact": {
			const parsed = artifactCreateSchema.parse(args);
			return textResult(withShare(await createArtifact(parsed)));
		}
		case "update_artifact": {
			const id = String(args.id ?? "");
			if (!id) throw new ReliquaryError("id is required");
			const { id: _id, collection, ...rest } = args;
			const patch = artifactPatchSchema.parse({
				...rest,
				collection: collection === "" || collection === null ? null : collection,
				collectionId: collection === "" || collection === null ? null : void 0
			});
			return textResult(withShare(await updateArtifact(id, patch)));
		}
		case "delete_artifact": {
			const id = String(args.id ?? "");
			if (!id) throw new ReliquaryError("id is required");
			return textResult(await deleteArtifact(id));
		}
		case "list_collections": return textResult({ collections: await listCollections() });
		case "create_collection": {
			const parsed = collectionCreateSchema.parse(args);
			return textResult(await createCollection(parsed));
		}
		case "delete_collection": {
			const id = String(args.id ?? "");
			if (!id) throw new ReliquaryError("id is required");
			return textResult(await deleteCollection(id));
		}
		default: throw new ReliquaryError(`Unknown tool: ${name}`, 404, "NOT_FOUND");
	}
}
async function handleJsonRpc(body) {
	if (Array.isArray(body)) {
		const responses = [];
		let notifications = 0;
		for (const item of body) {
			const r = await handleOne(item);
			if (r === null) notifications += 1;
			else responses.push(r);
		}
		if (responses.length === 0) return {
			payload: null,
			notification: true
		};
		return {
			payload: responses,
			notification: notifications === body.length
		};
	}
	const one = await handleOne(body);
	return {
		payload: one,
		notification: one === null
	};
}
async function handleOne(raw) {
	if (!raw || typeof raw !== "object") return fail(null, -32600, "Invalid request");
	const req = raw;
	const id = req.id ?? null;
	const method = req.method ?? "";
	const isNotification = !("id" in req) || req.id === void 0;
	try {
		switch (method) {
			case "initialize": {
				const params = req.params ?? {};
				return ok(id, {
					protocolVersion: params.protocolVersion === "2025-03-26" || params.protocolVersion === "2024-11-05" || params.protocolVersion === "2025-06-18" ? params.protocolVersion : "2025-03-26",
					capabilities: { tools: { listChanged: false } },
					serverInfo: SERVER_INFO,
					instructions: INSTRUCTIONS
				});
			}
			case "notifications/initialized":
			case "notifications/cancelled": return null;
			case "ping": return ok(id, {});
			case "tools/list": return ok(id, { tools: TOOLS });
			case "tools/call": {
				const name = toolName(req.params);
				const args = asArgs(req.params);
				try {
					return ok(id, await callTool(name, args));
				} catch (err) {
					return ok(id, textResult({ error: err instanceof Error ? err.message : "Tool failed" }, true));
				}
			}
			case "resources/list": return ok(id, { resources: [] });
			case "prompts/list": return ok(id, { prompts: [] });
			default:
				if (isNotification) return null;
				return fail(id, -32601, `Method not found: ${method}`);
		}
	} catch (err) {
		return fail(id, -32603, err instanceof Error ? err.message : "Internal error");
	}
}
var Route$6 = createFileRoute("/api/mcp")({ server: { handlers: {
	OPTIONS: () => handleOptions(),
	GET: async () => {
		return json({
			name: "reliquary",
			version: "1.0.0",
			transport: "streamable-http",
			protocol: "MCP",
			endpoint: "/api/mcp",
			tools: [
				"list_artifacts",
				"get_artifact",
				"create_artifact",
				"update_artifact",
				"delete_artifact",
				"list_collections",
				"create_collection",
				"delete_collection"
			]
		});
	},
	POST: async ({ request }) => {
		let body = {};
		try {
			body = await request.json();
		} catch {
			return json({
				jsonrpc: "2.0",
				id: null,
				error: {
					code: -32700,
					message: "Parse error"
				}
			}, 400);
		}
		const { payload, notification } = await handleJsonRpc(body);
		if (notification || payload === null) return new Response(null, {
			status: 202,
			headers: corsHeaders()
		});
		return json(payload, 200, { "MCP-Protocol-Version": "2025-03-26" });
	},
	DELETE: () => new Response(null, {
		status: 204,
		headers: corsHeaders()
	})
} } });
var $$splitComponentImporter$2 = () => import("./c._slug-B3yMUsF1.mjs");
var Route$5 = createFileRoute("/c/$slug")({
	loader: ({ params }) => getCollectionPage({ data: { slug: params.slug } }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./s._slug-6kHqOfRT.mjs");
var Route$4 = createFileRoute("/s/$slug")({
	loader: ({ params }) => getArtifact({ data: { slug: params.slug } }),
	head: ({ loaderData }) => ({ meta: [{ title: loaderData ? `${loaderData.title} · ${APP_NAME}` : APP_NAME }, ...loaderData?.description ? [{
		name: "description",
		content: loaderData.description
	}] : []] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./a._slug.edit-Cog-rhKr.mjs");
var Route$3 = createFileRoute("/a/$slug/edit")({
	loader: async ({ params }) => {
		const [library, artifact] = await Promise.all([getLibrary(), getArtifact({ data: { slug: params.slug } })]);
		return {
			library,
			artifact
		};
	},
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var Route$2 = createFileRoute("/api/artifacts/$id")({ server: { handlers: {
	OPTIONS: () => handleOptions(),
	GET: async ({ params }) => {
		try {
			return json(await getArtifact$1(params.id));
		} catch (err) {
			return errorResponse(err);
		}
	},
	PUT: async ({ params, request }) => update(params.id, request),
	PATCH: async ({ params, request }) => update(params.id, request),
	DELETE: async ({ params }) => {
		try {
			await deleteArtifact(params.id);
			return json({ ok: true });
		} catch (err) {
			return errorResponse(err);
		}
	}
} } });
async function update(id, request) {
	try {
		const body = await readJson(request);
		const parsed = artifactPatchSchema.parse(body);
		return json(await updateArtifact(id, parsed));
	} catch (err) {
		if (err && typeof err === "object" && "issues" in err) return errorResponse(new ReliquaryError("Invalid artifact payload", 400, "INVALID"));
		return errorResponse(err);
	}
}
var Route$1 = createFileRoute("/api/collections/$id")({ server: { handlers: {
	OPTIONS: () => handleOptions(),
	GET: async ({ params }) => {
		try {
			return json(await getCollection(params.id));
		} catch (err) {
			return errorResponse(err);
		}
	},
	PUT: async ({ params, request }) => patch(params.id, request),
	PATCH: async ({ params, request }) => patch(params.id, request),
	DELETE: async ({ params }) => {
		try {
			await deleteCollection(params.id);
			return json({ ok: true });
		} catch (err) {
			return errorResponse(err);
		}
	}
} } });
async function patch(id, request) {
	try {
		const body = await readJson(request);
		const parsed = collectionPatchSchema.parse(body);
		return json(await updateCollection(id, parsed));
	} catch (err) {
		if (err && typeof err === "object" && "issues" in err) return errorResponse(new ReliquaryError("Invalid collection payload", 400, "INVALID"));
		return errorResponse(err);
	}
}
var Route = createFileRoute("/api/artifacts/$id/html")({ server: { handlers: {
	OPTIONS: () => handleOptions(),
	GET: async ({ params }) => {
		try {
			const artifact = await getArtifact$1(params.id);
			return new Response(artifact.html, { headers: {
				...corsHeaders(),
				"Content-Type": "text/html; charset=utf-8",
				"Cache-Control": "no-store",
				"X-Content-Type-Options": "nosniff"
			} });
		} catch (err) {
			return errorResponse(err);
		}
	}
} } });
var IndexRoute = Route$12.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$13
});
var DocsRoute = Route$11.update({
	id: "/docs",
	path: "/docs",
	getParentRoute: () => Route$13
});
var NewRoute = Route$10.update({
	id: "/new",
	path: "/new",
	getParentRoute: () => Route$13
});
var ASlugRoute = Route$9.update({
	id: "/a/$slug",
	path: "/a/$slug",
	getParentRoute: () => Route$13
});
var ApiArtifactsRoute = Route$8.update({
	id: "/api/artifacts",
	path: "/api/artifacts",
	getParentRoute: () => Route$13
});
var ApiCollectionsRoute = Route$7.update({
	id: "/api/collections",
	path: "/api/collections",
	getParentRoute: () => Route$13
});
var ApiMcpRoute = Route$6.update({
	id: "/api/mcp",
	path: "/api/mcp",
	getParentRoute: () => Route$13
});
var CSlugRoute = Route$5.update({
	id: "/c/$slug",
	path: "/c/$slug",
	getParentRoute: () => Route$13
});
var SSlugRoute = Route$4.update({
	id: "/s/$slug",
	path: "/s/$slug",
	getParentRoute: () => Route$13
});
var ASlugEditRoute = Route$3.update({
	id: "/edit",
	path: "/edit",
	getParentRoute: () => ASlugRoute
});
var ApiArtifactsIdRoute = Route$2.update({
	id: "/$id",
	path: "/$id",
	getParentRoute: () => ApiArtifactsRoute
});
var ApiCollectionsIdRoute = Route$1.update({
	id: "/$id",
	path: "/$id",
	getParentRoute: () => ApiCollectionsRoute
});
var ApiArtifactsIdHtmlRoute = Route.update({
	id: "/html",
	path: "/html",
	getParentRoute: () => ApiArtifactsIdRoute
});
var ASlugRouteChildren = { ASlugEditRoute };
var ASlugRouteWithChildren = ASlugRoute._addFileChildren(ASlugRouteChildren);
var ApiArtifactsIdRouteChildren = { ApiArtifactsIdHtmlRoute };
var ApiArtifactsRouteChildren = { ApiArtifactsIdRoute: ApiArtifactsIdRoute._addFileChildren(ApiArtifactsIdRouteChildren) };
var ApiArtifactsRouteWithChildren = ApiArtifactsRoute._addFileChildren(ApiArtifactsRouteChildren);
var ApiCollectionsRouteChildren = { ApiCollectionsIdRoute };
var rootRouteChildren = {
	IndexRoute,
	DocsRoute,
	NewRoute,
	ASlugRoute: ASlugRouteWithChildren,
	ApiArtifactsRoute: ApiArtifactsRouteWithChildren,
	ApiCollectionsRoute: ApiCollectionsRoute._addFileChildren(ApiCollectionsRouteChildren),
	ApiMcpRoute,
	CSlugRoute,
	SSlugRoute
};
var routeTree = Route$13._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { Route$9 as a, Route$12 as c, createCollectionFn as d, deleteArtifactFn as f, Route$5 as i, useTheme as l, updateArtifactFn as m, Route$3 as n, Route$10 as o, deleteCollectionFn as p, Route$4 as r, Route$11 as s, router_exports as t, createArtifactFn as u };
