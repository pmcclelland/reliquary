import { createFileRoute } from "@tanstack/react-router";
import { ReliquaryError } from "@/lib/reliquary/errors";
import { errorResponse, handleOptions, json, readJson } from "@/lib/reliquary/http";
import { artifactPatchSchema } from "@/lib/reliquary/schema";
import {
  deleteArtifact,
  getArtifact,
  updateArtifact,
} from "@/lib/reliquary/store.server";

export const Route = createFileRoute("/api/artifacts/$id")({
  server: {
    handlers: {
      OPTIONS: () => handleOptions(),
      GET: async ({ params }) => {
        try {
          return json(await getArtifact(params.id));
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
      },
    },
  },
});

async function update(id: string, request: Request) {
  try {
    const body = await readJson(request);
    const parsed = artifactPatchSchema.parse(body);
    return json(await updateArtifact(id, parsed));
  } catch (err) {
    if (err && typeof err === "object" && "issues" in err) {
      return errorResponse(
        new ReliquaryError("Invalid artifact payload", 400, "INVALID"),
      );
    }
    return errorResponse(err);
  }
}
