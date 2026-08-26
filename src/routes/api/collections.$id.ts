import { createFileRoute } from "@tanstack/react-router";
import { ReliquaryError } from "@/lib/reliquary/errors";
import { errorResponse, handleOptions, json, readJson } from "@/lib/reliquary/http";
import { collectionPatchSchema } from "@/lib/reliquary/schema";
import {
  deleteCollection,
  getCollection,
  updateCollection,
} from "@/lib/reliquary/store.server";

export const Route = createFileRoute("/api/collections/$id")({
  server: {
    handlers: {
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
      },
    },
  },
});

async function patch(id: string, request: Request) {
  try {
    const body = await readJson(request);
    const parsed = collectionPatchSchema.parse(body);
    return json(await updateCollection(id, parsed));
  } catch (err) {
    if (err && typeof err === "object" && "issues" in err) {
      return errorResponse(
        new ReliquaryError("Invalid collection payload", 400, "INVALID"),
      );
    }
    return errorResponse(err);
  }
}
