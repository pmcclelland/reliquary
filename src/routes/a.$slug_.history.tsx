import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { z } from "zod";
import { useState } from "react";
import { toast } from "sonner";
import { ArtifactFrame } from "@/components/artifact/frame";
import { SourceView } from "@/components/artifact/source-view";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireSession } from "@/lib/auth/protect";
import {
  getArtifactHistoryFn,
  getLibrary,
  restoreRevisionFn,
} from "@/lib/reliquary/functions";
import { revisionOrdinal } from "@/lib/reliquary/revisions";
import type { ArtifactRevisionSummary } from "@/lib/reliquary/types";
import { cn, formatBytes, formatRelative } from "@/lib/utils";

export const Route = createFileRoute("/a/$slug_/history")({
  validateSearch: z.object({
    rev: z.string().optional(),
  }),
  loaderDeps: ({ search }) => ({ rev: search.rev }),
  beforeLoad: ({ context }) => {
    requireSession(context);
  },
  loader: async ({ params, deps }) => {
    const [library, history] = await Promise.all([
      getLibrary(),
      getArtifactHistoryFn({
        data: { slug: params.slug, revisionId: deps.rev },
      }),
    ]);
    return { library, history };
  },
  component: HistoryPage,
});

function HistoryPage() {
  const { library, history } = Route.useLoaderData();
  const { slug } = Route.useParams();
  const router = useRouter();
  const [source, setSource] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const { artifact, revisions, selected, fromSource, canRestore } = history;
  const selectedIsTip = selected?.id === revisions[0]?.id;

  async function onRestore() {
    if (!selected) return;
    try {
      await restoreRevisionFn({
        data: { slug: artifact.slug, revisionId: selected.id },
      });
      toast.success("Restored as the current version");
      await router.invalidate({ sync: true });
      await router.navigate({
        to: "/a/$slug",
        params: { slug: artifact.slug },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not restore");
    }
  }

  return (
    <AppShell library={library} activeSlug={artifact.slug}>
      <div className="flex min-h-0 flex-1 flex-col">
        <header className="border-b border-border px-4 py-4 sm:px-6">
          <p className="text-xs tracking-[0.14em] text-subtle uppercase">
            History
          </p>
          <h1 className="mt-1 font-serif text-2xl tracking-tight">
            {artifact.title}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            {fromSource
              ? "Revisions on the shared original. Your library still follows the current tip."
              : "Earlier versions of this relic, newest first."}
          </p>
        </header>

        {revisions.length === 0 || !selected ? (
          <div className="flex flex-1 items-center justify-center px-4 py-16 text-sm text-muted">
            No revisions yet. History starts when this relic is first saved.
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
            <ol className="max-h-72 shrink-0 overflow-y-auto border-b border-border lg:max-h-none lg:w-80 lg:border-r lg:border-b-0">
              {revisions.map((row, index) => (
                <RevisionRow
                  key={row.id}
                  row={row}
                  slug={slug}
                  selected={row.id === selected.id}
                  tip={index === 0}
                  ordinal={revisionOrdinal(revisions.length, index)}
                />
              ))}
            </ol>
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-serif text-sm tracking-tight">
                    {formatRelative(selected.createdAt)}
                  </p>
                  <p className="text-xs text-subtle tabular-nums">
                    #{revisionOrdinal(
                      revisions.length,
                      revisions.findIndex((row) => row.id === selected.id),
                    )}{" "}
                    · {formatHistoryWhen(selected.createdAt)} ·{" "}
                    {formatBytes(selected.htmlBytes)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={source ? "default" : "secondary"}
                    size="sm"
                    onClick={() => setSource((v) => !v)}
                  >
                    Source
                  </Button>
                  {canRestore && !selectedIsTip ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setConfirm(true)}
                    >
                      Restore
                    </Button>
                  ) : null}
                  <Button asChild size="sm" variant="ghost">
                    <Link to="/a/$slug" params={{ slug: artifact.slug }}>
                      Back
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="min-h-[50vh] flex-1 overflow-hidden bg-chip">
                {source ? (
                  <SourceView
                    html={selected.html}
                    explainerHtml={selected.explainerHtml}
                    title={selected.title}
                  />
                ) : (
                  <ArtifactFrame html={selected.html} title={selected.title} />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogTitle>Restore this revision?</AlertDialogTitle>
          <AlertDialogDescription>
            The current relic becomes this version. A new revision is added —
            earlier history stays as it is.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void onRestore()}>
              Restore
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}

function formatHistoryWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  const sameYear = d.getFullYear() === now.getFullYear();
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: sameYear ? undefined : "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function RevisionRow({
  row,
  slug,
  selected,
  tip,
  ordinal,
}: {
  row: ArtifactRevisionSummary;
  slug: string;
  selected: boolean;
  tip: boolean;
  ordinal: number;
}) {
  return (
    <li>
      <Link
        to="/a/$slug/history"
        params={{ slug }}
        search={{ rev: row.id }}
        className={cn(
          "block px-4 py-3",
          selected
            ? "bg-surface-muted text-fg"
            : "text-muted hover:bg-surface-muted/70 hover:text-fg",
        )}
        aria-current={selected ? "true" : undefined}
      >
        <span className="flex items-baseline gap-2">
          <span className="shrink-0 font-serif text-xs tabular-nums text-subtle">
            #{ordinal}
          </span>
          <span className="min-w-0 flex-1 font-serif text-sm tracking-tight">
            {formatRelative(row.createdAt)}
          </span>
          {tip ? <Badge className="shrink-0">Latest</Badge> : null}
        </span>
        <span className="mt-1 block truncate text-xs text-subtle tabular-nums">
          {formatHistoryWhen(row.createdAt)}
          {row.title ? ` · ${row.title}` : ""}
        </span>
      </Link>
    </li>
  );
}
