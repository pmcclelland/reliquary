import type { Artifact, ArtifactInput } from "./types.ts";

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
