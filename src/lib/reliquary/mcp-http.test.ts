import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { corsHeaders } from "./http.ts";
import { handleMcpGet } from "./mcp-http.ts";

function get(accept?: string) {
  return handleMcpGet(
    new Request("http://localhost/api/mcp", {
      headers: accept ? { Accept: accept } : undefined,
    }),
  );
}

describe("handleMcpGet", () => {
  it("returns 405 with an empty body when Accept includes text/event-stream", async () => {
    const accepts = [
      "text/event-stream",
      "text/event-stream, application/json",
      "application/json, text/event-stream;q=0.9",
      "TEXT/EVENT-STREAM",
    ];
    for (const accept of accepts) {
      const res = get(accept);
      assert.equal(res.status, 405, accept);
      assert.equal(await res.text(), "", accept);
      assert.equal(res.headers.get("Allow"), "POST, OPTIONS", accept);
      for (const [key, value] of Object.entries(corsHeaders())) {
        assert.equal(res.headers.get(key), value, `${accept} ${key}`);
      }
    }
  });

  it("returns discovery JSON for GETs that do not ask for SSE", async () => {
    const accepts = [undefined, "*/*", "application/json"];
    for (const accept of accepts) {
      const res = get(accept);
      assert.equal(res.status, 200, accept ?? "(no Accept)");
      const body = (await res.json()) as {
        name: string;
        endpoint: string;
        tools: string[];
      };
      assert.equal(body.name, "reliquary");
      assert.equal(body.endpoint, "/api/mcp");
      assert.ok(body.tools.includes("list_artifacts"));
    }
  });
});
