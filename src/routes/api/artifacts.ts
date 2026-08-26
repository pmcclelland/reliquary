import { createFileRoute } from "@tanstack/react-router";
import { ReliquaryError } from "@/lib/reliquary/errors";
import { requireActor } from "@/lib/reliquary/actor.server";
import { errorResponse, handleOptions, json, readJson } from "@/lib/reliquary/http";
import { artifactCreateSchema, listQuerySchema } from "@/lib/reliquary/schema";
import { createArtifact, listArtifacts } from "@/lib/reliquary/store.server";

export const Route = createFileRoute("/api/artifacts")({
  server: {
    handlers: {
      OPTIONS: () => handleOptions(),
      GET: async ({ request }) => {
        try {
          const userId = await requireActor(request);
          const url = new URL(request.url);
          const parsed = listQuerySchema.parse({
            collection: url.searchParams.get("collection") ?? undefined,
            tag: url.searchParams.get("tag") ?? undefined,
            q: url.searchParams.get("q") ?? undefined,
          });
          const artifacts = await listArtifacts(userId, parsed);
          return json({ artifacts, count: artifacts.length });
        } catch (err) {
          return errorResponse(err);
        }
      },
      POST: async ({ request }) => {
        try {
          const userId = await requireActor(request);
          const body = await readJson(request);
          const parsed = artifactCreateSchema.parse(body);
          const artifact = await createArtifact(userId, parsed);
          return json(artifact, 201);
        } catch (err) {
          if (err && typeof err === "object" && "issues" in err) {
            return errorResponse(
              new ReliquaryError("Invalid artifact payload", 400, "INVALID"),
            );
          }
          return errorResponse(err);
        }
      },
    },
  },
});
