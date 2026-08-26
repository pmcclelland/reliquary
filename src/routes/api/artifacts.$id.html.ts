import { createFileRoute } from "@tanstack/react-router";
import { corsHeaders, errorResponse, handleOptions } from "@/lib/reliquary/http";
import { getArtifact } from "@/lib/reliquary/store.server";

export const Route = createFileRoute("/api/artifacts/$id/html")({
  server: {
    handlers: {
      OPTIONS: () => handleOptions(),
      GET: async ({ params }) => {
        try {
          const artifact = await getArtifact(params.id);
          return new Response(artifact.html, {
            headers: {
              ...corsHeaders(),
              "Content-Type": "text/html; charset=utf-8",
              "Cache-Control": "no-store",
              "X-Content-Type-Options": "nosniff",
            },
          });
        } catch (err) {
          return errorResponse(err);
        }
      },
    },
  },
});
