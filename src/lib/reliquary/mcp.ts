import { ReliquaryError } from "./errors";
import { artifactCreateSchema, artifactPatchSchema, collectionCreateSchema } from "./schema";
import {
  createArtifact,
  createCollection,
  deleteArtifact,
  deleteCollection,
  getArtifact,
  listArtifacts,
  listCollections,
  updateArtifact,
} from "./store.server";

type JsonRpcId = string | number | null;

type JsonRpcRequest = {
  jsonrpc?: string;
  id?: JsonRpcId;
  method?: string;
  params?: unknown;
};

type ToolContent = { type: "text"; text: string };

const SERVER_INFO = {
  name: "reliquary",
  version: "1.0.0",
  title: "Reliquary",
};

const INSTRUCTIONS = `Reliquary is a wiki of living HTML artifacts. Each artifact is a self-contained .html file (plain HTML/CSS/JS, or React via Babel standalone / a full HTML shell).

When creating artifacts:
- Prefer a complete HTML document (doctype + html). Fragments and JSX modules are wrapped automatically.
- For React, either send a full document that loads React + Babel, or send a module that defines function App() { ... }.
- Keep work self-contained: no local file references. CDNs are allowed.
- Set title, a short description, optional collection (id or slug), and tags.
- After publishing, the live share view is /s/{slug} (thin Reliquary bar, full-bleed artifact). The wiki page is /a/{slug}.

Use list_artifacts before editing so you target the right id or slug.`;

const TOOLS = [
  {
    name: "list_artifacts",
    description:
      "List artifact summaries (no HTML body). Filter by collection (id or slug), tag, or free-text query.",
    inputSchema: {
      type: "object",
      properties: {
        collection: { type: "string", description: "Collection id or slug" },
        tag: { type: "string" },
        q: { type: "string", description: "Search title, description, and tags" },
      },
    },
  },
  {
    name: "get_artifact",
    description: "Get a single artifact including its full HTML. Lookup by id or slug.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Artifact id or slug" },
      },
      required: ["id"],
    },
  },
  {
    name: "create_artifact",
    description:
      "Publish a new artifact. html may be a full document, an HTML fragment, or a React module defining App.",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string" },
        html: { type: "string" },
        description: { type: "string" },
        collection: {
          type: "string",
          description: "Collection id or slug to file under",
        },
        tags: { type: "array", items: { type: "string" } },
        slug: { type: "string" },
      },
      required: ["title", "html"],
    },
  },
  {
    name: "update_artifact",
    description: "Update an artifact by id or slug. Only provided fields change.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Artifact id or slug" },
        title: { type: "string" },
        html: { type: "string" },
        description: { type: "string" },
        collection: { type: "string", description: "Collection id or slug, or empty to unfile" },
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
      properties: {
        id: { type: "string" },
      },
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
    description: "Create a collection (folder) for organizing artifacts.",
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
    description:
      "Delete a collection by id or slug. Artifacts in it are unfiled, not deleted.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"],
    },
  },
];

function ok(id: JsonRpcId, result: unknown) {
  return { jsonrpc: "2.0", id, result };
}

function fail(id: JsonRpcId, code: number, message: string) {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

function withShare<T extends { id: string; slug: string }>(artifact: T) {
  return { ...artifact, sharePath: `/s/${artifact.id}` };
}

function asArgs(params: unknown): Record<string, unknown> {
  if (!params || typeof params !== "object") return {};
  const rec = params as Record<string, unknown>;
  if (rec.arguments && typeof rec.arguments === "object") {
    return rec.arguments as Record<string, unknown>;
  }
  return rec;
}

function toolName(params: unknown): string {
  if (!params || typeof params !== "object") return "";
  const rec = params as Record<string, unknown>;
  return typeof rec.name === "string" ? rec.name : "";
}

function textResult(data: unknown, isError = false) {
  const text = typeof data === "string" ? data : JSON.stringify(data, null, 2);
  return {
    content: [{ type: "text", text } satisfies ToolContent],
    structuredContent: typeof data === "object" ? data : { result: data },
    isError,
  };
}

async function callTool(
  userId: string,
  name: string,
  args: Record<string, unknown>,
) {
  switch (name) {
    case "list_artifacts": {
      const items = await listArtifacts(userId, {
        collection: typeof args.collection === "string" ? args.collection : undefined,
        tag: typeof args.tag === "string" ? args.tag : undefined,
        q: typeof args.q === "string" ? args.q : undefined,
      });
      return textResult({ artifacts: items, count: items.length });
    }
    case "get_artifact": {
      const id = String(args.id ?? "");
      if (!id) throw new ReliquaryError("id is required");
      return textResult(withShare(await getArtifact(userId, id)));
    }
    case "create_artifact": {
      const parsed = artifactCreateSchema.parse(args);
      return textResult(withShare(await createArtifact(userId, parsed)));
    }
    case "update_artifact": {
      const id = String(args.id ?? "");
      if (!id) throw new ReliquaryError("id is required");
      const { id: _id, collection, ...rest } = args;
      const patch = artifactPatchSchema.parse({
        ...rest,
        collection:
          collection === "" || collection === null ? null : collection,
        collectionId:
          collection === "" || collection === null ? null : undefined,
      });
      return textResult(withShare(await updateArtifact(userId, id, patch)));
    }
    case "delete_artifact": {
      const id = String(args.id ?? "");
      if (!id) throw new ReliquaryError("id is required");
      return textResult(await deleteArtifact(userId, id));
    }
    case "list_collections":
      return textResult({ collections: await listCollections(userId) });
    case "create_collection": {
      const parsed = collectionCreateSchema.parse(args);
      return textResult(await createCollection(userId, parsed));
    }
    case "delete_collection": {
      const id = String(args.id ?? "");
      if (!id) throw new ReliquaryError("id is required");
      return textResult(await deleteCollection(userId, id));
    }
    default:
      throw new ReliquaryError(`Unknown tool: ${name}`, 404, "NOT_FOUND");
  }
}

export async function handleJsonRpc(
  userId: string,
  body: unknown,
): Promise<{
  payload: unknown | null;
  notification: boolean;
}> {
  if (Array.isArray(body)) {
    const responses = [];
    let notifications = 0;
    for (const item of body) {
      const r = await handleOne(userId, item);
      if (r === null) notifications += 1;
      else responses.push(r);
    }
    if (responses.length === 0) return { payload: null, notification: true };
    return { payload: responses, notification: notifications === body.length };
  }
  const one = await handleOne(userId, body);
  return { payload: one, notification: one === null };
}

async function handleOne(userId: string, raw: unknown): Promise<unknown | null> {
  if (!raw || typeof raw !== "object") {
    return fail(null, -32600, "Invalid request");
  }
  const req = raw as JsonRpcRequest;
  const id = (req.id ?? null) as JsonRpcId;
  const method = req.method ?? "";
  const isNotification = !("id" in req) || req.id === undefined;

  try {
    switch (method) {
      case "initialize": {
        const params = (req.params ?? {}) as { protocolVersion?: string };
        const version =
          params.protocolVersion === "2025-03-26" ||
          params.protocolVersion === "2024-11-05" ||
          params.protocolVersion === "2025-06-18"
            ? params.protocolVersion
            : "2025-03-26";
        return ok(id, {
          protocolVersion: version,
          capabilities: { tools: { listChanged: false } },
          serverInfo: SERVER_INFO,
          instructions: INSTRUCTIONS,
        });
      }
      case "notifications/initialized":
      case "notifications/cancelled":
        return null;
      case "ping":
        return ok(id, {});
      case "tools/list":
        return ok(id, { tools: TOOLS });
      case "tools/call": {
        const name = toolName(req.params);
        const args = asArgs(req.params);
        try {
          const result = await callTool(userId, name, args);
          return ok(id, result);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Tool failed";
          return ok(id, textResult({ error: message }, true));
        }
      }
      case "resources/list":
        return ok(id, { resources: [] });
      case "prompts/list":
        return ok(id, { prompts: [] });
      default:
        if (isNotification) return null;
        return fail(id, -32601, `Method not found: ${method}`);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return fail(id, -32603, message);
  }
}
