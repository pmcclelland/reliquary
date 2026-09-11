import type {
  Artifact,
  ArtifactInput,
  ArtifactKind,
  ArtifactSummary,
} from "./types.ts";

/**
 * Live-follow model (post-#6):
 * A library save is still an owned row (shelf, slug, delete are the
 * recipient's). Title, HTML, description, tags, explainer, and kind are
 * resolved from the source at read time while `source_artifact_id` is set
 * and that id is still readable on the public share path. The stored HTML
 * is a fallback snapshot from save time — not the source of truth, and not
 * periodically synced. Clearing `source_artifact_id` (a content edit that
 * diverges) stops following; collection/slug edits do not.
 */

/** Share-origin fields overlaid from the live source. */
export type FollowSourceFields = {
  title: string;
  description: string;
  html: string;
  explainerHtml: string;
  tags: string[];
  kind: ArtifactKind;
  hasExplainer: boolean;
  updatedAt: string;
};

export type FollowContent = {
  title: string;
  html: string;
  description: string;
  explainerHtml: string;
  tags: string[];
};

/** Fields copied into the recipient's library. Collection stays unfiled. */
export function artifactCopyInput(source: {
  title: string;
  html: string;
  description: string;
  explainerHtml: string;
  tags: string[];
  slug: string;
}): ArtifactInput {
  return {
    title: source.title,
    html: source.html,
    description: source.description,
    explainer: source.explainerHtml || undefined,
    tags: [...source.tags],
    slug: source.slug,
  };
}

/**
 * How we recognize an already-owned copy:
 * the source row itself, the per-user seed id (`userId:art-welcome`),
 * or a later save that recorded `source_artifact_id`.
 */
export function libraryCopyLookupIds(userId: string, sourceId: string): {
  ids: [string, string];
  sourceArtifactId: string;
} {
  return {
    ids: [sourceId, `${userId}:${sourceId}`],
    sourceArtifactId: sourceId,
  };
}

export type ShareSaveAction =
  | { kind: "sign-in"; next: string }
  | { kind: "in-library"; slug: string }
  | { kind: "save" };

export function resolveShareSaveAction(opts: {
  signedIn: boolean;
  sharePath: string;
  inLibrarySlug: string | null;
}): ShareSaveAction {
  if (opts.inLibrarySlug) {
    return { kind: "in-library", slug: opts.inLibrarySlug };
  }
  if (!opts.signedIn) {
    return { kind: "sign-in", next: opts.sharePath };
  }
  return { kind: "save" };
}

/**
 * Same-origin relative path for post-login return. Rejects protocol-relative
 * URLs and off-site hrefs so sign-in cannot be used as an open redirect.
 */
export function safeReturnPath(raw: string | undefined | null): string {
  if (!raw) return "/";
  const trimmed = raw.trim();
  if (!trimmed.startsWith("/")) return "/";
  if (trimmed.startsWith("//") || trimmed.includes("\\")) return "/";
  try {
    const url = new URL(trimmed, "https://reliquary.local");
    if (url.origin !== "https://reliquary.local") return "/";
    if (url.username || url.password) return "/";
    const path = `${url.pathname}${url.search}`;
    return path.startsWith("/") && !path.startsWith("//") ? path : "/";
  } catch {
    return "/";
  }
}

export function sharePathFor(source: Pick<Artifact, "id" | "slug">): string {
  return `/s/${source.id || source.slug}`;
}

/** Follow the original when the shared row is itself a follow. */
export function canonicalFollowSourceId(record: {
  id: string;
  sourceArtifactId: string | null;
}): string {
  return record.sourceArtifactId || record.id;
}

export function followMeta(sourceArtifactId: string | null): {
  sourceArtifactId: string | null;
  following: boolean;
  followLive: boolean;
} {
  const id = sourceArtifactId?.trim() || null;
  return { sourceArtifactId: id, following: Boolean(id), followLive: false };
}

function sameTags(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((tag, i) => tag === b[i]);
}

export function followContentChanged(
  current: FollowContent,
  next: FollowContent,
): boolean {
  return (
    current.title !== next.title ||
    current.html !== next.html ||
    current.description !== next.description ||
    current.explainerHtml !== next.explainerHtml ||
    !sameTags(current.tags, next.tags)
  );
}

/**
 * Overlay share-origin fields from a live source. Local id, slug, collection,
 * and createdAt stay on the recipient's row. Missing/unreadable source →
 * keep the save-time snapshot (`followLive: false`).
 */
export function resolveFollowedArtifact<T extends ArtifactSummary>(
  local: T,
  source: FollowSourceFields | null,
): T {
  if (!local.following) {
    return { ...local, followLive: false };
  }
  if (!source) {
    return { ...local, followLive: false };
  }
  const next: T = {
    ...local,
    title: source.title,
    description: source.description,
    tags: [...source.tags],
    kind: source.kind,
    hasExplainer: source.hasExplainer,
    updatedAt: source.updatedAt,
    followLive: true,
  };
  if ("html" in local) {
    const artifact = next as T & Artifact;
    artifact.html = source.html;
    artifact.explainerHtml = source.explainerHtml;
  }
  return next;
}

/**
 * Content edits that diverge from the (resolved) current relic become a
 * local fork. Collection and slug are recipient-owned and never detach.
 * Compare already-normalized next vs current (store wraps HTML / tags).
 */
export function shouldDetachFollow(
  following: boolean,
  current: FollowContent,
  next: FollowContent,
): boolean {
  if (!following) return false;
  return followContentChanged(current, next);
}

