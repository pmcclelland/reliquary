import { Link } from "@tanstack/react-router";
import type { ArtifactSummary } from "@/lib/reliquary/types";

export function FollowNote({
  artifact,
  editHint = false,
}: {
  artifact: Pick<
    ArtifactSummary,
    "following" | "followLive" | "sourceArtifactId"
  >;
  editHint?: boolean;
}) {
  if (!artifact.following) return null;

  return (
    <p className="mt-2 max-w-2xl text-xs text-subtle">
      {artifact.followLive ? (
        <>
          Updates with the{" "}
          {artifact.sourceArtifactId ? (
            <Link
              to="/s/$slug"
              params={{ slug: artifact.sourceArtifactId }}
              className="underline decoration-border underline-offset-2 hover:text-muted"
            >
              shared original
            </Link>
          ) : (
            "shared original"
          )}
          {editHint
            ? ". Saving your own title, HTML, notes, or tags stops following."
            : "."}
        </>
      ) : (
        <>
          The original is no longer available. Showing the last saved copy
          {editHint ? " — editing keeps this as your own relic." : "."}
        </>
      )}
    </p>
  );
}
