import { corsHeaders, json } from "./http.ts";

const DISCOVERY = {
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
};

function acceptsEventStream(request: Request): boolean {
  const accept = request.headers.get("accept");
  if (!accept) return false;
  return accept.toLowerCase().includes("text/event-stream");
}

/**
 * Streamable HTTP servers that do not offer a GET SSE stream must 405 when
 * Accept includes text/event-stream. Other GETs stay discovery JSON.
 */
export function handleMcpGet(request: Request): Response {
  if (acceptsEventStream(request)) {
    return new Response(null, {
      status: 405,
      headers: {
        ...corsHeaders(),
        Allow: "POST, OPTIONS",
      },
    });
  }
  return json(DISCOVERY);
}
