import { createFileRoute } from "@tanstack/react-router";
import { ReliquaryError } from "@/lib/reliquary/errors";
import { requireActor } from "@/lib/reliquary/actor.server";
import { corsHeaders, errorResponse, handleOptions, json } from "@/lib/reliquary/http";
import { handleJsonRpc } from "@/lib/reliquary/mcp";
import { handleMcpGet } from "@/lib/reliquary/mcp-http";

export const Route = createFileRoute("/api/mcp")({
  server: {
    handlers: {
      OPTIONS: () => handleOptions(),
      GET: ({ request }) => handleMcpGet(request),
      POST: async ({ request }) => {
        let userId: string;
        try {
          userId = await requireActor(request);
        } catch (err) {
          return errorResponse(
            err instanceof ReliquaryError
              ? err
              : new ReliquaryError("Unauthorized", 401, "UNAUTHORIZED"),
          );
        }
        let body: unknown = {};
        try {
          body = await request.json();
        } catch {
          return json(
            {
              jsonrpc: "2.0",
              id: null,
              error: { code: -32700, message: "Parse error" },
            },
            400,
          );
        }
        const { payload, notification } = await handleJsonRpc(userId, body);
        if (notification || payload === null) {
          return new Response(null, {
            status: 202,
            headers: corsHeaders(),
          });
        }
        return json(payload, 200, {
          "MCP-Protocol-Version": "2025-03-26",
        });
      },
      DELETE: () => new Response(null, { status: 204, headers: corsHeaders() }),
    },
  },
});
