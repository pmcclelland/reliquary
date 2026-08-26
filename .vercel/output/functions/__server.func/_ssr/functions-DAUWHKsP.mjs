import { R as notFound } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { a as string, i as object } from "../_libs/zod.mjs";
import { a as artifactPatchSchema, i as artifactCreateSchema, o as collectionCreateSchema, r as ReliquaryError } from "./schema-C6xkN7Ue.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/functions-DAUWHKsP.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function rethrow(err) {
	if (err instanceof ReliquaryError && err.code === "NOT_FOUND") throw notFound();
	throw err;
}
var getLibrary_createServerFn_handler = createServerRpc({
	id: "d22772c5969eed592ed64d140faf059bf6f35c39417a7ef01443b1749375fc9b",
	name: "getLibrary",
	filename: "src/lib/reliquary/functions.ts"
}, (opts) => getLibrary.__executeServer(opts));
var getLibrary = createServerFn({ method: "GET" }).handler(getLibrary_createServerFn_handler, async () => {
	const { getLibrary: load } = await import("./store.server-TFqfTTKj.mjs").then((n) => n.l);
	return load();
});
var getArtifact_createServerFn_handler = createServerRpc({
	id: "72df42b4b4b5e5d20247473461df7647fe7777cb80733e2fde101c8bc0a860b6",
	name: "getArtifact",
	filename: "src/lib/reliquary/functions.ts"
}, (opts) => getArtifact.__executeServer(opts));
var getArtifact = createServerFn({ method: "GET" }).validator(object({ slug: string().min(1) })).handler(getArtifact_createServerFn_handler, async ({ data }) => {
	try {
		const { getArtifact: load } = await import("./store.server-TFqfTTKj.mjs").then((n) => n.l);
		return await load(data.slug);
	} catch (err) {
		rethrow(err);
	}
});
var getCollectionPage_createServerFn_handler = createServerRpc({
	id: "bee767d67d0a2dddf36772f4c2860c9d399a52f163f52dc9c7b1a8ebc4c75d10",
	name: "getCollectionPage",
	filename: "src/lib/reliquary/functions.ts"
}, (opts) => getCollectionPage.__executeServer(opts));
var getCollectionPage = createServerFn({ method: "GET" }).validator(object({ slug: string().min(1) })).handler(getCollectionPage_createServerFn_handler, async ({ data }) => {
	try {
		const store = await import("./store.server-TFqfTTKj.mjs").then((n) => n.l);
		return {
			collection: await store.getCollection(data.slug),
			library: await store.getLibrary()
		};
	} catch (err) {
		rethrow(err);
	}
});
var createArtifactFn_createServerFn_handler = createServerRpc({
	id: "770f8f99f3756a232c0d40ef56da56593332b8f8e5c846c9c23b96f9b905ec9a",
	name: "createArtifactFn",
	filename: "src/lib/reliquary/functions.ts"
}, (opts) => createArtifactFn.__executeServer(opts));
var createArtifactFn = createServerFn({ method: "POST" }).validator(artifactCreateSchema).handler(createArtifactFn_createServerFn_handler, async ({ data }) => {
	const { createArtifact } = await import("./store.server-TFqfTTKj.mjs").then((n) => n.l);
	return createArtifact(data);
});
var updateArtifactFn_createServerFn_handler = createServerRpc({
	id: "d5eef2e20312908252ce85206f7c449c26186bb509511c333ba906f3f7704d9b",
	name: "updateArtifactFn",
	filename: "src/lib/reliquary/functions.ts"
}, (opts) => updateArtifactFn.__executeServer(opts));
var updateArtifactFn = createServerFn({ method: "POST" }).validator(object({
	slug: string().min(1),
	patch: artifactPatchSchema
})).handler(updateArtifactFn_createServerFn_handler, async ({ data }) => {
	try {
		const { updateArtifact } = await import("./store.server-TFqfTTKj.mjs").then((n) => n.l);
		return await updateArtifact(data.slug, data.patch);
	} catch (err) {
		rethrow(err);
	}
});
var deleteArtifactFn_createServerFn_handler = createServerRpc({
	id: "80ec0cf9b72d8a305ca92a6549e8a261fede2bed6c0653b4e15582ea81b3c6c5",
	name: "deleteArtifactFn",
	filename: "src/lib/reliquary/functions.ts"
}, (opts) => deleteArtifactFn.__executeServer(opts));
var deleteArtifactFn = createServerFn({ method: "POST" }).validator(object({ slug: string().min(1) })).handler(deleteArtifactFn_createServerFn_handler, async ({ data }) => {
	try {
		const { deleteArtifact } = await import("./store.server-TFqfTTKj.mjs").then((n) => n.l);
		return await deleteArtifact(data.slug);
	} catch (err) {
		rethrow(err);
	}
});
var createCollectionFn_createServerFn_handler = createServerRpc({
	id: "77d76f866871f654ae2ae30a5981e468dcad1a5e1517a6b949c7bb5951254405",
	name: "createCollectionFn",
	filename: "src/lib/reliquary/functions.ts"
}, (opts) => createCollectionFn.__executeServer(opts));
var createCollectionFn = createServerFn({ method: "POST" }).validator(collectionCreateSchema).handler(createCollectionFn_createServerFn_handler, async ({ data }) => {
	const { createCollection } = await import("./store.server-TFqfTTKj.mjs").then((n) => n.l);
	return createCollection(data);
});
var deleteCollectionFn_createServerFn_handler = createServerRpc({
	id: "4f0d1aca84508396ebd99e54eb84be6a6b4b2cf00ed2d6b96d053ea269d1fad8",
	name: "deleteCollectionFn",
	filename: "src/lib/reliquary/functions.ts"
}, (opts) => deleteCollectionFn.__executeServer(opts));
var deleteCollectionFn = createServerFn({ method: "POST" }).validator(object({ slug: string().min(1) })).handler(deleteCollectionFn_createServerFn_handler, async ({ data }) => {
	try {
		const { deleteCollection } = await import("./store.server-TFqfTTKj.mjs").then((n) => n.l);
		return await deleteCollection(data.slug);
	} catch (err) {
		rethrow(err);
	}
});
//#endregion
export { createArtifactFn_createServerFn_handler, createCollectionFn_createServerFn_handler, deleteArtifactFn_createServerFn_handler, deleteCollectionFn_createServerFn_handler, getArtifact_createServerFn_handler, getCollectionPage_createServerFn_handler, getLibrary_createServerFn_handler, updateArtifactFn_createServerFn_handler };
