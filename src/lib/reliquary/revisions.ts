import { followContentChanged, type FollowContent } from "./save.ts";
import type { ArtifactKind, ArtifactSummary } from "./types.ts";

export type RevisionSnapshot = FollowContent & {
  kind: ArtifactKind;
};

/**
 * What to persist when content changes.
 * - First write on a row with no history: keep the outgoing snapshot, then
 *   the new one (covers seeded relics that never went through create).
 * - Later writes: append only the new snapshot. Never rewrite older rows.
 */
export function snapshotsToAppend(opts: {
  previous: FollowContent;
  next: FollowContent;
  existingCount: number;
}): FollowContent[] {
  if (!followContentChanged(opts.previous, opts.next)) return [];
  if (opts.existingCount === 0) return [opts.previous, opts.next];
  return [opts.next];
}

/** Followed relics inspect the live source's history; otherwise the owned row. */
export function historyTarget(artifact: Pick<
  ArtifactSummary,
  "id" | "following" | "followLive" | "sourceArtifactId"
>): { artifactId: string; fromSource: boolean } {
  if (artifact.following && artifact.followLive && artifact.sourceArtifactId) {
    return { artifactId: artifact.sourceArtifactId, fromSource: true };
  }
  return { artifactId: artifact.id, fromSource: false };
}

/** Restore writes a new tip on an owned row. Source history is read-only. */
export function canRestoreRevision(fromSource: boolean): boolean {
  return !fromSource;
}

export function pickSelectedRevisionId(
  ids: string[],
  requested: string | null | undefined,
): string | null {
  if (ids.length === 0) return null;
  if (requested && ids.includes(requested)) return requested;
  return ids[0] ?? null;
}
