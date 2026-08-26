import { a as string, i as object, t as array } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/schema-C6xkN7Ue.js
var ReliquaryError = class extends Error {
	status;
	code;
	constructor(message, status = 400, code = "INVALID") {
		super(message);
		this.name = "ReliquaryError";
		this.status = status;
		this.code = code;
	}
};
function notFound(entity = "Artifact") {
	throw new ReliquaryError(`${entity} not found`, 404, "NOT_FOUND");
}
var APP_NAME = "Reliquary";
var APP_TAGLINE = "A wiki of living artifacts";
var MAX_HTML_BYTES = 15e5;
var MAX_DESCRIPTION = 2e3;
var tagsSchema = array(string().trim().min(1).max(32)).max(24).optional();
var artifactCreateSchema = object({
	title: string().trim().min(1).max(200),
	html: string().min(1).max(MAX_HTML_BYTES),
	description: string().max(MAX_DESCRIPTION).optional().default(""),
	collectionId: string().nullable().optional(),
	collection: string().nullable().optional(),
	tags: tagsSchema,
	slug: string().trim().max(80).optional()
});
var artifactPatchSchema = object({
	title: string().trim().min(1).max(200).optional(),
	html: string().min(1).max(MAX_HTML_BYTES).optional(),
	description: string().max(MAX_DESCRIPTION).optional(),
	collectionId: string().nullable().optional(),
	collection: string().nullable().optional(),
	tags: tagsSchema,
	slug: string().trim().max(80).optional()
});
var collectionCreateSchema = object({
	title: string().trim().min(1).max(200),
	description: string().max(MAX_DESCRIPTION).optional().default(""),
	slug: string().trim().max(80).optional()
});
var collectionPatchSchema = object({
	title: string().trim().min(1).max(200).optional(),
	description: string().max(MAX_DESCRIPTION).optional(),
	slug: string().trim().max(80).optional()
});
var listQuerySchema = object({
	collection: string().optional(),
	tag: string().optional(),
	q: string().optional()
});
//#endregion
export { artifactPatchSchema as a, listQuerySchema as c, artifactCreateSchema as i, notFound as l, APP_TAGLINE as n, collectionCreateSchema as o, ReliquaryError as r, collectionPatchSchema as s, APP_NAME as t };
