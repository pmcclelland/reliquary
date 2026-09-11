import { Link } from "@tanstack/react-router";
import type { ArtifactSummary } from "@/lib/reliquary/types";

export function FollowNote({
  artifact,
  editHint = false,
}: {
  artifact: Pick<
    ArtifactSummary,
    "following" | "followLive" | "sourceArtifactId" | "canEditSource"
  >;
  editHint?: boolean;
}) {
  if (!artifact.following) return null;

  const originalLink = artifact.sourceArtifactId ? (
    <Link
      to="/s/$slug"
      params={{ slug: artifact.sourceArtifactId }}
      className="underline decoration-border underline-offset-2 hover:text-muted"
    >
      shared original
    </Link>
  ) : (
    "shared original"
  );

  return (
    <p className="mt-2 max-w-2xl text-xs text-subtle">
      {artifact.followLive ? (
        artifact.canEditSource ? (
          <>
            Updates with the {originalLink}
            {editHint
              ? ". Saving title, HTML, notes, or tags writes the original. Your shelf and slug stay yours."
              : ". You can edit the original."}
          </>
        ) : (
          <>
            Updates with the {originalLink}
            {editHint
              ? ". Saving your own title, HTML, notes, or tags stops following."
              : "."}
          </>
        )
      ) : (
        <>
          The original is no longer available. Showing the last saved copy
          {editHint ? " — editing keeps this as your own relic." : "."}
        </>
      )}
    </p>
  );
}
