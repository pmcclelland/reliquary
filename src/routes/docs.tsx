import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { requireSession } from "@/lib/auth/protect";
import {
  getLibrary,
  getMcpTokenFn,
  issueMcpTokenFn,
} from "@/lib/reliquary/functions";
import { copyText } from "@/lib/utils";

export const Route = createFileRoute("/docs")({
  beforeLoad: ({ context }) => {
    requireSession(context);
  },
  loader: () => getLibrary(),
  component: DocsPage,
});

function DocsPage() {
  const library = Route.useLoaderData();
  const [origin, setOrigin] = useState("");
  const [tokenMeta, setTokenMeta] = useState<{
    tokenPrefix: string;
    createdAt: string;
    token?: string;
  } | null>(null);
  const [busyToken, setBusyToken] = useState(false);
  useEffect(() => {
    setOrigin(window.location.origin);
    void getMcpTokenFn().then(setTokenMeta).catch(() => setTokenMeta(null));
  }, []);
  const mcpUrl = origin ? `${origin}/api/mcp` : "/api/mcp";
  const revealed = tokenMeta?.token;

  async function mintToken() {
    setBusyToken(true);
    try {
      const next = await issueMcpTokenFn();
      setTokenMeta(next);
      if (next.token && (await copyText(next.token))) {
        toast.success("MCP token copied");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not issue token");
    } finally {
      setBusyToken(false);
    }
  }

  return (
    <AppShell library={library}>
      <article className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-[11px] font-medium tracking-[0.18em] text-subtle uppercase">
          Reference
        </p>
        <h1 className="mt-2 font-serif text-4xl tracking-tight">
          API & MCP
        </h1>
        <p className="mt-3 text-muted">
          Agents file artifacts the same way people do: a title, a
          self-contained HTML document, optional collection and tags.
        </p>

        <h2 className="mt-12 font-serif text-2xl tracking-tight">MCP</h2>
        <p className="mt-2 text-sm text-muted">
          Streamable HTTP endpoint, scoped to your library. Each account has a
          personal bearer token.
        </p>
        <Pre>{mcpUrl}</Pre>
        <div className="mt-6 rounded-lg bg-surface p-4 shadow-border">
          <p className="text-xs font-medium tracking-[0.14em] text-subtle uppercase">
            Your token
          </p>
          {revealed ? (
            <Pre>{revealed}</Pre>
          ) : tokenMeta ? (
            <p className="mt-2 font-mono text-sm text-fg">
              {tokenMeta.tokenPrefix}
              <span className="ml-2 text-xs text-subtle">
                issued {new Date(tokenMeta.createdAt).toLocaleDateString()}
              </span>
            </p>
          ) : (
            <p className="mt-2 text-sm text-muted">
              No token yet. Issue one to connect an agent.
            </p>
          )}
          {revealed ? (
            <p className="mt-2 text-xs text-muted">
              Copy it now — Reliquary will not show the full token again.
            </p>
          ) : null}
          <Button
            className="mt-4"
            type="button"
            variant={tokenMeta && !revealed ? "secondary" : "default"}
            disabled={busyToken}
            onClick={() => void mintToken()}
          >
            {tokenMeta && !revealed ? "Rotate token" : "Issue token"}
          </Button>
        </div>
        <p className="mt-4 text-sm text-muted">
          Cursor / Claude Code HTTP config:
        </p>
        <Pre>{`{
  "mcpServers": {
    "reliquary": {
      "url": "${mcpUrl}",
      "headers": {
        "Authorization": "Bearer ${revealed || "rly_YOUR_TOKEN"}"
      }
    }
  }
}`}</Pre>
        <p className="mt-4 text-sm text-muted">
          Local stdio proxy:
        </p>
        <Pre>{`RELIQUARY_URL=${origin || "https://reliquary.pmcclel.land"} \\
RELIQUARY_TOKEN=rly_YOUR_TOKEN \\
node mcp/server.mjs`}</Pre>
        <p className="mt-3 text-sm text-muted">
          Tools: <code className="font-mono text-xs">list_artifacts</code>,{" "}
          <code className="font-mono text-xs">get_artifact</code>,{" "}
          <code className="font-mono text-xs">create_artifact</code>,{" "}
          <code className="font-mono text-xs">update_artifact</code>,{" "}
          <code className="font-mono text-xs">delete_artifact</code>,{" "}
          <code className="font-mono text-xs">list_collections</code>,{" "}
          <code className="font-mono text-xs">create_collection</code>,{" "}
          <code className="font-mono text-xs">delete_collection</code>.
        </p>

        <h2 className="mt-12 font-serif text-2xl tracking-tight">REST</h2>
        <p className="mt-2 text-sm text-muted">
          Send <code className="font-mono text-xs">Authorization: Bearer rly_…</code>{" "}
          (or a signed-in session cookie). HTML is omitted from list responses.
          Public share HTML remains at <code className="font-mono text-xs">GET /api/artifacts/:id/html</code>.
        </p>
        <Pre>{`GET    /api/artifacts?collection=&tag=&q=
POST   /api/artifacts
GET    /api/artifacts/:id
PUT    /api/artifacts/:id
PATCH  /api/artifacts/:id
DELETE /api/artifacts/:id
GET    /api/artifacts/:id/html

GET    /api/collections
POST   /api/collections
GET    /api/collections/:id
PATCH  /api/collections/:id
DELETE /api/collections/:id`}</Pre>
        <p className="mt-4 text-sm text-muted">Create payload:</p>
        <Pre>{`{
  "title": "Orbital",
  "description": "A slow orbit.",
  "html": "<!DOCTYPE html>...",
  "collection": "motion",
  "tags": ["motion", "canvas"],
  "slug": "orbital"
}`}</Pre>

        <h2 className="mt-12 font-serif text-2xl tracking-tight">Share</h2>
        <p className="mt-2 text-sm text-muted">
          Every artifact has a live view — a thin Reliquary bar over the
          piece at full size. The wiki page stays at{" "}
          <code className="font-mono text-xs">/a/:slug</code>.
        </p>
        <Pre>{`${origin || ""}/s/:slug`}</Pre>

        <h2 className="mt-12 font-serif text-2xl tracking-tight">
          Artifact format
        </h2>
        <p className="mt-2 text-sm text-muted">
          Send a full HTML document when you can. Fragments are wrapped in a
          simple page. A React module that defines{" "}
          <code className="font-mono text-xs">function App()</code> is wrapped
          with React 18 and Babel standalone.
        </p>
        <Pre>{`function App() {
  const [n, setN] = React.useState(0);
  return <button onClick={() => setN(n + 1)}>{n}</button>;
}`}</Pre>
      </article>
    </AppShell>
  );
}

function Pre({ children }: { children: string }) {
  return (
    <pre className="mt-3 overflow-x-auto rounded-lg bg-surface-muted p-4 font-mono text-[12px] leading-relaxed text-fg">
      {children}
    </pre>
  );
}