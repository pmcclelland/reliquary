import { createFileRoute } from "@tanstack/react-router";
import { ReliquaryError } from "@/lib/reliquary/errors";
import { requireActor } from "@/lib/reliquary/actor.server";
import { errorResponse, handleOptions, json, readJson } from "@/lib/reliquary/http";
import { collectionCreateSchema } from "@/lib/reliquary/schema";
import { createCollection, listCollections } from "@/lib/reliquary/store.server";

export const Route = createFileRoute("/api/collections")({
  server: {
    handlers: {
      OPTIONS: () => handleOptions(),
      GET: async ({ request }) => {
        try {
          const userId = await requireActor(request);
          const collections = await listCollections(userId);
          return json({ collections });
        } catch (err) {
          return errorResponse(err);
        }
      },
      POST: async ({ request }) => {
        try {
          const userId = await requireActor(request);
          const body = await readJson(request);
          const parsed = collectionCreateSchema.parse(body);
          return json(await createCollection(userId, parsed), 201);
        } catch (err) {
          if (err && typeof err === "object" && "issues" in err) {
            return errorResponse(
              new ReliquaryError("Invalid collection payload", 400, "INVALID"),
            );
          }
          return errorResponse(err);
        }
      },
    },
  },
});
