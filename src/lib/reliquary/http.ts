import { ReliquaryError } from "./errors";

export function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Accept, Authorization, MCP-Session-Id, MCP-Protocol-Version",
    "Access-Control-Expose-Headers": "MCP-Session-Id, MCP-Protocol-Version",
    "Access-Control-Max-Age": "86400",
  };
}

export function handleOptions(): Response {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export function json(data: unknown, status = 200, extra?: HeadersInit): Response {
  return Response.json(data, {
    status,
    headers: { ...corsHeaders(), ...extra },
  });
}

export function errorResponse(err: unknown): Response {
  if (err instanceof ReliquaryError) {
    return json({ error: err.message, code: err.code }, err.status);
  }
  const message = err instanceof Error ? err.message : "Internal error";
  return json({ error: message, code: "INTERNAL" }, 500);
}

export async function readJson(request: Request): Promise<unknown> {
  const text = await request.text();
  if (!text.trim()) return {};
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new ReliquaryError("Request body must be JSON", 400, "INVALID");
  }
}
