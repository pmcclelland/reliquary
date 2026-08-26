import { Link, createFileRoute } from "@tanstack/react-router";
import { Link2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ArtifactFrame } from "@/components/artifact/frame";
import { ShareLinkDialog } from "@/components/artifact/share-dialog";
import { Mark } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/reliquary/constants";
import { getArtifact } from "@/lib/reliquary/functions";
import { artifactShareUrl, copyText } from "@/lib/utils";

export const Route = createFileRoute("/s/$slug")({
  loader: ({ params }) => getArtifact({ data: { slug: params.slug } }),
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.title} · ${APP_NAME}`
          : APP_NAME,
      },
      ...(loaderData?.description
        ? [{ name: "description", content: loaderData.description }]
        : []),
    ],
  }),
  component: SharePage,
});

function SharePage() {
  const artifact = Route.useLoaderData();
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  async function share() {
    const url = artifactShareUrl(artifact.slug);
    setShareUrl(url);
    if (await copyText(url)) {
      toast.success("Share link copied");
    }
  }


  return (
    <div className="flex h-dvh flex-col bg-bg text-fg">
      <header className="flex h-11 shrink-0 items-center gap-3 border-b border-border px-3">
        <Link
          to="/"
          aria-label="Back to Reliquary"
          className="flex h-11 shrink-0 items-center gap-2 text-fg hover:text-accent"
        >
          <Mark className="size-5" />
          <span className="font-serif text-sm tracking-tight">Reliquary</span>
        </Link>
        <span className="h-4 w-px shrink-0 bg-border" aria-hidden="true" />
        <p className="min-w-0 flex-1 truncate text-sm text-muted">
          {artifact.title}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Copy share link"
          className="shrink-0 text-muted hover:text-fg"
          onClick={() => void share()}
        >
          <Link2 className="size-4" />
        </Button>
      </header>
      <div className="min-h-0 flex-1 bg-chip">
        <ArtifactFrame html={artifact.html} title={artifact.title} />
      </div>
      <ShareLinkDialog
        open={shareUrl !== null}
        onOpenChange={(open) => {
          if (!open) setShareUrl(null);
        }}
        url={shareUrl ?? ""}
        title={artifact.title}
      />
    </div>
  );
}
