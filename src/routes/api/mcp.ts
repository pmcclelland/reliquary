import { createFileRoute } from "@tanstack/react-router";
import { corsHeaders, handleOptions, json } from "@/lib/reliquary/http";
import { handleJsonRpc } from "@/lib/reliquary/mcp";

export const Route = createFileRoute("/api/mcp")({
  server: {
    handlers: {
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
            "delete_collection",
          ],
        });
      },
      POST: async ({ request }) => {
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
        const { payload, notification } = await handleJsonRpc(body);
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
