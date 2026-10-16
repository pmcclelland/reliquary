import { Link, createFileRoute } from "@tanstack/react-router";
import { Link2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ArtifactFrame } from "@/components/artifact/frame";
import { SaveToLibraryButton } from "@/components/artifact/save-to-library";
import { ShareLinkDialog } from "@/components/artifact/share-dialog";
import { Wordmark } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/reliquary/constants";
import { getRequestOrigin, getShareView } from "@/lib/reliquary/functions";
import { relicShareMeta } from "@/lib/reliquary/og";
import { artifactShareUrl, copyText } from "@/lib/utils";

export const Route = createFileRoute("/s/$slug")({
  loader: async ({ params }) => {
    const [view, origin] = await Promise.all([
      getShareView({ data: { slug: params.slug } }),
      typeof window === "undefined"
        ? getRequestOrigin()
        : Promise.resolve(window.location.origin),
    ]);
    return { ...view, origin };
  },
  head: ({ loaderData, params }) => {
    const artifact = loaderData?.artifact;
    if (!artifact) return { meta: [{ title: APP_NAME }] };
    return {
      meta: [
        { title: `${artifact.title} · ${APP_NAME}` },
        // Per-relic Open Graph / Twitter card. Only reached when the public
        // share lookup succeeded; otherwise the site-wide card applies.
        ...relicShareMeta({
          origin: loaderData.origin,
          relic: artifact,
          appName: APP_NAME,
          sharePath: `/s/${params.slug}`,
        }),
      ],
    };
  },
  component: SharePage,
});

function SharePage() {
  const { artifact, inLibrarySlug, signedIn, following } = Route.useLoaderData();
  const { slug } = Route.useParams();
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  async function share() {
    const url = artifactShareUrl(artifact.id);
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
          <Wordmark className="gap-2 text-sm" markClassName="size-5" />
        </Link>
        <span className="h-4 w-px shrink-0 bg-border" aria-hidden="true" />
        <p className="min-w-0 flex-1 truncate text-sm text-muted">
          {artifact.title}
        </p>
        <SaveToLibraryButton
          sourceKey={slug}
          sharePath={`/s/${slug}`}
          inLibrarySlug={inLibrarySlug}
          signedIn={signedIn}
          following={following}
        />
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
      <div className="min-h-0 min-w-0 flex-1 bg-chip">
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
