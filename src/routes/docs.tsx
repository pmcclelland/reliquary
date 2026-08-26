import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requireSession } from "@/lib/auth/protect";
import {
  createMcpTokenFn,
  getLibrary,
  listMcpTokensFn,
  revokeMcpTokenFn,
  rotateMcpTokenFn,
} from "@/lib/reliquary/functions";
import { copyText } from "@/lib/utils";

type TokenRow = {
  id: string;
  name: string;
  tokenPrefix: string;
  createdAt: string;
  token?: string;
};

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
  const [tokens, setTokens] = useState<TokenRow[]>([]);
  const [name, setName] = useState("");
  const [revealed, setRevealed] = useState<TokenRow | null>(null);
  const [busy, setBusy] = useState(false);
  const [revokeId, setRevokeId] = useState<string | null>(null);
  useEffect(() => {
    setOrigin(window.location.origin);
    void listMcpTokensFn()
      .then(setTokens)
      .catch(() => setTokens([]));
  }, []);
  const mcpUrl = origin ? `${origin}/api/mcp` : "/api/mcp";
  const revealedSecret = revealed?.token;
  const revokeTarget = tokens.find((row) => row.id === revokeId);

  async function remember(next: TokenRow) {
    setTokens((rows) => {
      const rest = rows.filter((row) => row.id !== next.id);
      return [{ ...next, token: undefined }, ...rest];
    });
    setRevealed(next);
    if (next.token && (await copyText(next.token))) {
      toast.success("MCP token copied");
    }
  }

  async function onCreate(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const next = await createMcpTokenFn({ data: { name } });
      setName("");
      await remember(next);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not issue token");
    } finally {
      setBusy(false);
    }
  }

  async function onRotate(id: string) {
    setBusy(true);
    try {
      await remember(await rotateMcpTokenFn({ data: { id } }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not rotate token");
    } finally {
      setBusy(false);
    }
  }

  async function onRevoke() {
    if (!revokeId) return;
    setBusy(true);
    try {
      await revokeMcpTokenFn({ data: { id: revokeId } });
      setTokens((rows) => rows.filter((row) => row.id !== revokeId));
      setRevealed((row) => (row?.id === revokeId ? null : row));
      setRevokeId(null);
      toast.success("Token revoked");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not revoke token");
    } finally {
      setBusy(false);
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
          Streamable HTTP endpoint, scoped to your library. Issue a named token
          per agent so you can revoke one without disconnecting the others.
        </p>
        <Pre>{mcpUrl}</Pre>
        <form
          className="mt-6 space-y-3 rounded-lg bg-surface p-4 shadow-border"
          onSubmit={(event) => void onCreate(event)}
        >
          <p className="text-xs font-medium tracking-[0.14em] text-subtle uppercase">
            New token
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="token-name">Name</Label>
            <Input
              id="token-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Cursor, Claude, Grok…"
              maxLength={40}
              autoComplete="off"
            />
          </div>
          <Button type="submit" disabled={busy}>
            Add token
          </Button>
        </form>
        {revealedSecret ? (
          <div className="mt-4 rounded-lg bg-surface p-4 shadow-border">
            <p className="text-xs font-medium tracking-[0.14em] text-subtle uppercase">
              {revealed?.name} — copy now
            </p>
            <Pre>{revealedSecret}</Pre>
            <p className="mt-2 text-xs text-muted">
              Reliquary will not show the full token again.
            </p>
          </div>
        ) : null}
        <ul className="mt-4 space-y-2">
          {tokens.length === 0 ? (
            <li className="text-sm text-muted">
              No tokens yet. Add one for each agent you want to connect.
            </li>
          ) : (
            tokens.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-surface px-4 py-3 shadow-border"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-fg">{row.name}</p>
                  <p className="mt-0.5 font-mono text-xs text-subtle">
                    {row.tokenPrefix}
                    <span className="ml-2 font-sans">
                      {new Date(row.createdAt).toLocaleDateString()}
                    </span>
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={busy}
                    onClick={() => void onRotate(row.id)}
                  >
                    Rotate
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={busy}
                    onClick={() => setRevokeId(row.id)}
                  >
                    Revoke
                  </Button>
                </div>
              </li>
            ))
          )}
        </ul>
        <p className="mt-4 text-sm text-muted">
          Cursor / Claude Code HTTP config:
        </p>
        <Pre>{`{
  "mcpServers": {
    "reliquary": {
      "url": "${mcpUrl}",
      "headers": {
        "Authorization": "Bearer ${revealedSecret || "rly_YOUR_TOKEN"}"
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
        <p className="mt-4 text-sm text-muted">
          Agent skill:{" "}
          <code className="font-mono text-xs">skills/create-relic/SKILL.md</code>
          . Slash <code className="font-mono text-xs">/create-relic</code> or
          say “file this as a relic.”
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
      <AlertDialog
        open={Boolean(revokeId)}
        onOpenChange={(open) => {
          if (!open) setRevokeId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogTitle>Revoke this token?</AlertDialogTitle>
          <AlertDialogDescription>
            {revokeTarget
              ? `${revokeTarget.name} will stop working immediately. Other tokens stay connected.`
              : "This token will stop working immediately."}
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
            <AlertDialogAction
              type="button"
              onClick={(event) => {
                event.preventDefault();
                void onRevoke();
              }}
            >
              Revoke
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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