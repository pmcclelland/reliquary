#!/usr/bin/env node
/**
 * Reliquary MCP stdio server.
 * Forwards JSON-RPC tools to the Reliquary REST API.
 *
 *   RELIQUARY_URL=https://your-app.example node mcp/server.mjs
 */
import { stdin, stdout, stderr } from "node:process";

const BASE = (process.env.RELIQUARY_URL || "").replace(/\/$/, "");
const TOKEN = (process.env.RELIQUARY_TOKEN || "").trim();
if (!BASE) {
  stderr.write(
    "Reliquary MCP: set RELIQUARY_URL to the app origin, e.g. https://reliquary.pmcclel.land\n",
  );
  process.exit(1);
}
if (!TOKEN) {
  stderr.write(
    "Reliquary MCP: set RELIQUARY_TOKEN to your personal token from /docs\n",
  );
  process.exit(1);
}

const TOOLS = [
  {
    name: "list_artifacts",
    description:
      "List artifact summaries (no HTML body). Filter by collection, tag, or query.",
    inputSchema: {
      type: "object",
      properties: {
        collection: { type: "string" },
        tag: { type: "string" },
        q: { type: "string" },
      },
    },
  },
  {
    name: "get_artifact",
    description: "Get a single artifact including HTML. Lookup by id or slug.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"],
    },
  },
  {
    name: "create_artifact",
    description: "Publish a new HTML artifact.",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string" },
        html: { type: "string" },
        description: { type: "string" },
        explainer: { type: "string" },
        collection: { type: "string" },
        tags: { type: "array", items: { type: "string" } },
        slug: { type: "string" },
      },
      required: ["title", "html"],
    },
  },
  {
    name: "update_artifact",
    description: "Update an artifact by id or slug.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string" },
        title: { type: "string" },
        html: { type: "string" },
        description: { type: "string" },
        explainer: { type: "string" },
        collection: { type: "string" },
        tags: { type: "array", items: { type: "string" } },
        slug: { type: "string" },
      },
      required: ["id"],
    },
  },
  {
    name: "delete_artifact",
    description: "Delete one artifact by id or slug.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"],
    },
  },
  {
    name: "list_collections",
    description: "List collections with artifact counts.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "create_collection",
    description: "Create a collection.",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string" },
        description: { type: "string" },
        slug: { type: "string" },
      },
      required: ["title"],
    },
  },
  {
    name: "delete_collection",
    description: "Delete a collection. Artifacts are unfiled, not deleted.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"],
    },
  },
];

function write(msg) {
  const json = JSON.stringify(msg);
  const payload = Buffer.from(json, "utf8");
  stdout.write(`Content-Length: ${payload.length}\r\n\r\n`);
  stdout.write(payload);
}

function ok(id, result) {
  write({ jsonrpc: "2.0", id, result });
}

function fail(id, code, message) {
  write({ jsonrpc: "2.0", id, error: { code, message } });
}

function textResult(data, isError = false) {
  const text = typeof data === "string" ? data : JSON.stringify(data, null, 2);
  return { content: [{ type: "text", text }], isError };
}

async function api(path, init = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
      ...(init.headers || {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      (body && typeof body === "object" && "error" in body && body.error) ||
      res.statusText;
    throw new Error(String(message));
  }
  return body;
}

async function callTool(name, args) {
  switch (name) {
    case "list_artifacts": {
      const q = new URLSearchParams();
      if (args.collection) q.set("collection", String(args.collection));
      if (args.tag) q.set("tag", String(args.tag));
      if (args.q) q.set("q", String(args.q));
      const qs = q.toString();
      return textResult(await api(`/api/artifacts${qs ? `?${qs}` : ""}`));
    }
    case "get_artifact":
      return textResult(await api(`/api/artifacts/${encodeURIComponent(args.id)}`));
    case "create_artifact":
      return textResult(
        await api("/api/artifacts", {
          method: "POST",
          body: JSON.stringify(args),
        }),
      );
    case "update_artifact": {
      const { id, ...rest } = args;
      return textResult(
        await api(`/api/artifacts/${encodeURIComponent(id)}`, {
          method: "PATCH",
          body: JSON.stringify(rest),
        }),
      );
    }
    case "delete_artifact":
      return textResult(
        await api(`/api/artifacts/${encodeURIComponent(args.id)}`, {
          method: "DELETE",
        }),
      );
    case "list_collections":
      return textResult(await api("/api/collections"));
    case "create_collection":
      return textResult(
        await api("/api/collections", {
          method: "POST",
          body: JSON.stringify(args),
        }),
      );
    case "delete_collection":
      return textResult(
        await api(`/api/collections/${encodeURIComponent(args.id)}`, {
          method: "DELETE",
        }),
      );
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function handle(msg) {
  if (!msg || typeof msg !== "object") return;
  const { id, method, params } = msg;
  const isNotification = id === undefined;
  try {
    switch (method) {
      case "initialize":
        ok(id, {
          protocolVersion: params?.protocolVersion || "2025-03-26",
          capabilities: { tools: {} },
          serverInfo: { name: "reliquary", version: "1.0.0" },
          instructions:
            "Reliquary stores self-contained HTML artifacts. Create with title + html; collection may be an id or slug. explainer is optional HTML notes — only send when the user asked for an explanation.",
        });
        return;
      case "notifications/initialized":
      case "notifications/cancelled":
        return;
      case "ping":
        if (!isNotification) ok(id, {});
        return;
      case "tools/list":
        ok(id, { tools: TOOLS });
        return;
      case "tools/call": {
        const name = params?.name;
        const args = params?.arguments || {};
        try {
          ok(id, await callTool(name, args));
        } catch (err) {
          ok(id, textResult({ error: err instanceof Error ? err.message : String(err) }, true));
        }
        return;
      }
      default:
        if (!isNotification) fail(id ?? null, -32601, `Method not found: ${method}`);
    }
  } catch (err) {
    if (!isNotification) fail(id ?? null, -32603, err instanceof Error ? err.message : String(err));
  }
}

let buffer = Buffer.alloc(0);

stdin.on("data", (chunk) => {
  buffer = Buffer.concat([buffer, chunk]);
  while (true) {
    const headerEnd = buffer.indexOf("\r\n\r\n");
    if (headerEnd === -1) return;
    const header = buffer.slice(0, headerEnd).toString("utf8");
    const match = header.match(/Content-Length:\s*(\d+)/i);
    if (!match) {
      buffer = buffer.slice(headerEnd + 4);
      continue;
    }
    const length = Number(match[1]);
    const start = headerEnd + 4;
    if (buffer.length < start + length) return;
    const json = buffer.slice(start, start + length).toString("utf8");
    buffer = buffer.slice(start + length);
    try {
      void handle(JSON.parse(json));
    } catch (err) {
      stderr.write(`Reliquary MCP parse error: ${err}\n`);
    }
  }
});

stderr.write(`Reliquary MCP proxy → ${BASE}\n`);
