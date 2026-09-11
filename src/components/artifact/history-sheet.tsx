import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArtifactFrame } from "@/components/artifact/frame";
import { SourceView } from "@/components/artifact/source-view";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  getArtifactHistoryFn,
  restoreRevisionFn,
} from "@/lib/reliquary/functions";
import { revisionOrdinal } from "@/lib/reliquary/revisions";
import type {
  ArtifactHistory,
  ArtifactRevisionSummary,
} from "@/lib/reliquary/types";
import { cn, formatBytes, formatRelative } from "@/lib/utils";

export function HistorySheet({
  open,
  slug,
  revisionId,
  onOpenChange,
  onRestored,
}: {
  open: boolean;
  slug: string;
  revisionId?: string;
  onOpenChange: (open: boolean) => void;
  onRestored?: () => void;
}) {
  const [history, setHistory] = useState<ArtifactHistory | null>(null);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState(false);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    if (!open) {
      setHistory(null);
      setSource(false);
      setConfirm(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void getArtifactHistoryFn({
      data: { slug, revisionId },
    })
      .then((next) => {
        if (!cancelled) setHistory(next);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : "Could not load history");
          onOpenChange(false);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, slug, revisionId, onOpenChange]);

  const revisions = history?.revisions ?? [];
  const selected = history?.selected ?? null;
  const selectedIsTip = Boolean(selected && selected.id === revisions[0]?.id);

  async function selectRevision(id: string) {
    try {
      setHistory(
        await getArtifactHistoryFn({
          data: { slug, revisionId: id },
        }),
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not open revision");
    }
  }

  async function onRestore() {
    if (!selected || !history) return;
    try {
      await restoreRevisionFn({
        data: { slug: history.artifact.slug, revisionId: selected.id },
      });
      toast.success("Restored as the current version");
      onOpenChange(false);
      onRestored?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not restore");
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent aria-describedby={undefined} size="wide">
        <div className="border-b border-border px-4 py-4 pr-12">
          <SheetTitle>History</SheetTitle>
          <SheetDescription>
            {history?.fromSource
              ? "Revisions on the shared original. Your library still follows the current tip."
              : "Earlier versions of this relic, newest first."}
          </SheetDescription>
        </div>

        {loading && !history ? (
          <p className="px-4 py-10 text-sm text-muted">Loading revisions…</p>
        ) : !history || revisions.length === 0 || !selected ? (
          <p className="px-4 py-10 text-sm text-muted">
            No revisions yet. History starts when this relic is first saved.
          </p>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
            <ol className="max-h-44 shrink-0 overflow-y-auto border-b border-border sm:max-h-none sm:min-h-0 sm:w-72 sm:border-r sm:border-b-0">
              {revisions.map((row, index) => (
                <RevisionRow
                  key={row.id}
                  row={row}
                  selected={row.id === selected.id}
                  tip={index === 0}
                  ordinal={revisionOrdinal(revisions.length, index)}
                  onSelect={() => void selectRevision(row.id)}
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
                    #
                    {revisionOrdinal(
                      revisions.length,
                      revisions.findIndex((row) => row.id === selected.id),
                    )}{" "}
                    · {formatHistoryWhen(selected.createdAt)}
                    {selected.authorLabel ? ` · ${selected.authorLabel}` : ""}{" "}
                    · {formatBytes(selected.htmlBytes)}
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
                  {history.canRestore && !selectedIsTip ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setConfirm(true)}
                    >
                      Restore
                    </Button>
                  ) : null}
                </div>
              </div>
              <div className="min-h-40 min-w-0 flex-1 overflow-hidden bg-chip">
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
      </SheetContent>

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
    </Sheet>
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
  selected,
  tip,
  ordinal,
  onSelect,
}: {
  row: ArtifactRevisionSummary;
  selected: boolean;
  tip: boolean;
  ordinal: number;
  onSelect: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "block w-full px-4 py-3 text-left",
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
          {row.authorLabel ? ` · ${row.authorLabel}` : ""}
          {row.title ? ` · ${row.title}` : ""}
        </span>
      </button>
    </li>
  );
}
