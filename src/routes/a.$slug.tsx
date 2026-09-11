import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { z } from "zod";
import {
  Clock,
  Code2,
  Link2,
  Maximize2,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArtifactFrame } from "@/components/artifact/frame";
import { FollowNote } from "@/components/artifact/follow-note";
import { HistorySheet } from "@/components/artifact/history-sheet";
import { SourceView } from "@/components/artifact/source-view";
import { ShareLinkDialog } from "@/components/artifact/share-dialog";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  addArtifactCollaboratorFn,
  deleteArtifactFn,
  getArtifact,
  getLibrary,
  removeArtifactCollaboratorFn,
  setCollaboratorsEnabledFn,
} from "@/lib/reliquary/functions";
import { parseHistorySearch } from "@/lib/reliquary/revisions";
import type { Artifact, Library } from "@/lib/reliquary/types";
import { artifactShareUrl, copyText, formatBytes, formatRelative } from "@/lib/utils";

export const Route = createFileRoute("/a/$slug")({
  validateSearch: z.object({
    history: z.string().optional(),
  }),
  loader: async ({ params }) => {
    const [library, artifact] = await Promise.all([
      getLibrary(),
      getArtifact({ data: { slug: params.slug } }),
    ]);
    return { library, artifact };
  },
  component: ArtifactPage,
});

function ArtifactPage() {
  const { library, artifact } = Route.useLoaderData() as {
    library: Library;
    artifact: Artifact;
  };
  const router = useRouter();
  const { history: historySearch } = Route.useSearch();
  const historyPullout = parseHistorySearch(historySearch);
  const [source, setSource] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [collaboration, setCollaboration] = useState(artifact.collaboration);

  useEffect(() => {
    setCollaboration(artifact.collaboration);
  }, [artifact.collaboration]);
  const bytes = new TextEncoder().encode(artifact.html).length;

  function setHistoryOpen(open: boolean) {
    void router.navigate({
      to: "/a/$slug",
      params: { slug: artifact.slug },
      search: open ? { history: "open" } : {},
      replace: true,
    });
  }

  async function onDelete() {
    try {
      await deleteArtifactFn({ data: { slug: artifact.slug } });
      toast.success("Artifact removed");
      await router.invalidate({ sync: true });
      await router.navigate({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete");
    }
  }

  async function copyHtml() {
    const ok = await copyText(artifact.html);
    if (ok) {
      toast.success("HTML copied");
      return;
    }
    setSource(true);
    toast.message("Clipboard blocked — copy from source");
  }

  async function share() {
    const url = artifactShareUrl(artifact.id);
    setShareUrl(url);
    if (await copyText(url)) {
      toast.success("Share link copied");
    }
  }


  return (
    <AppShell library={library} activeSlug={artifact.slug}>
      <div className="flex min-h-0 flex-1 flex-col">
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-xs text-subtle">
              {artifact.collectionSlug ? (
                <Link
                  to="/c/$slug"
                  params={{ slug: artifact.collectionSlug }}
                  className="hover:text-fg"
                >
                  {artifact.collectionTitle}
                </Link>
              ) : (
                "Unfiled"
              )}
              <span className="mx-1.5">/</span>
              <span className="text-muted">{artifact.slug}</span>
            </p>
            <h1 className="mt-1 font-serif text-3xl tracking-tight">
              {artifact.title}
            </h1>
            {artifact.description ? (
              <p className="mt-1 max-w-2xl text-sm text-muted">
                {artifact.description}
              </p>
            ) : null}
            <FollowNote artifact={artifact} />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge>{artifact.kind === "react" ? "React" : "HTML"}</Badge>
              {artifact.tags.map((tag) => (
                <Badge key={tag}>{`#${tag}`}</Badge>
              ))}
              <span className="text-xs text-subtle tabular-nums">
                {formatRelative(artifact.updatedAt)} · {formatBytes(bytes)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={source ? "default" : "secondary"}
              size="sm"
              title={
                artifact.hasExplainer ? "Source and explainer" : "Source"
              }
              onClick={() => setSource((v) => !v)}
            >
              <Code2 className="size-4" />
              Source
            </Button>
            <Button asChild size="sm" variant="secondary">
              <Link to="/s/$slug" params={{ slug: artifact.slug }}>
                <Maximize2 className="size-4" />
                Open
              </Link>
            </Button>
            <Button size="sm" variant="secondary" onClick={() => void share()}>
              <Link2 className="size-4" />
              Share
            </Button>
            {library.guest ? (
              <Button asChild size="sm">
                <Link to="/login">Sign in to save</Link>
              </Button>
            ) : (
              <Button asChild size="sm" variant="secondary">
                <Link
                  to="/a/$slug/edit"
                  params={{ slug: artifact.slug }}
                >
                  <Pencil className="size-4" />
                  Edit
                </Link>
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label="More">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => void share()}>
                  <Link2 className="size-3.5" />
                  Copy share link
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => void copyHtml()}>
                  Copy HTML
                </DropdownMenuItem>
                {library.guest ? null : (
                  <>
                    <DropdownMenuItem onSelect={() => setHistoryOpen(true)}>
                      <Clock className="size-3.5" />
                      History
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-danger"
                      onSelect={() => setConfirm(true)}
                    >
                      <Trash2 className="size-3.5" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <div className="min-h-[70vh] flex-1 overflow-hidden bg-chip">
          {source ? (
            <SourceView
              html={artifact.html}
              explainerHtml={artifact.explainerHtml}
              title={artifact.title}
            />
          ) : (
            <ArtifactFrame html={artifact.html} title={artifact.title} />
          )}
        </div>
      </div>

      {library.guest ? null : (
        <HistorySheet
          open={historyPullout.open}
          slug={artifact.slug}
          revisionId={historyPullout.revisionId}
          onOpenChange={setHistoryOpen}
          onRestored={() => {
            void router.invalidate({ sync: true });
          }}
        />
      )}

      <ShareLinkDialog
        open={shareUrl !== null}
        onOpenChange={(open) => {
          if (!open) setShareUrl(null);
        }}
        url={shareUrl ?? ""}
        title={artifact.title}
        collaboration={library.guest ? null : collaboration}
        onSetEnabled={
          collaboration
            ? async (enabled) => {
                const next = await setCollaboratorsEnabledFn({
                  data: { slug: artifact.slug, enabled },
                });
                setCollaboration(next.collaboration);
                await router.invalidate({ sync: true });
              }
            : undefined
        }
        onAddCollaborator={
          collaboration
            ? async (email) => {
                const next = await addArtifactCollaboratorFn({
                  data: { slug: artifact.slug, email },
                });
                setCollaboration(next.collaboration);
                await router.invalidate({ sync: true });
              }
            : undefined
        }
        onRemoveCollaborator={
          collaboration
            ? async (userId) => {
                const next = await removeArtifactCollaboratorFn({
                  data: { slug: artifact.slug, userId },
                });
                setCollaboration(next.collaboration);
                await router.invalidate({ sync: true });
              }
            : undefined
        }
      />

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogTitle>Remove this artifact?</AlertDialogTitle>
          <AlertDialogDescription>
            {artifact.following
              ? `“${artifact.title}” will leave your library. The shared original is unchanged.`
              : `“${artifact.title}” will be deleted from the wiki. This cannot be undone.`}
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void onDelete()}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
