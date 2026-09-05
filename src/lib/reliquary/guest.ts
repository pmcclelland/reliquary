import { SEED_ARTIFACTS, SEED_COLLECTIONS } from "./seed.ts";
import type { Artifact, ArtifactSummary, Collection, Library } from "./types.ts";

/** Stable stamps so the demo library is deterministic across reloads. */
const GUEST_AT = "2026-01-01T00:00:00.000Z";

function collectionById() {
  return new Map<string, (typeof SEED_COLLECTIONS)[number]>(
    SEED_COLLECTIONS.map((col) => [col.id, col]),
  );
}

export function getGuestCollections(): Collection[] {
  return SEED_COLLECTIONS.map((col) => ({
    id: col.id,
    slug: col.slug,
    title: col.title,
    description: col.description,
    sortOrder: col.sortOrder,
    createdAt: GUEST_AT,
    updatedAt: GUEST_AT,
    count: SEED_ARTIFACTS.filter((art) => art.collectionId === col.id).length,
  }));
}

export function getGuestArtifacts(): Artifact[] {
  const cols = collectionById();
  return SEED_ARTIFACTS.map((art) => {
    const col = cols.get(art.collectionId);
    return {
      id: art.id,
      slug: art.slug,
      title: art.title,
      description: art.description,
      collectionId: art.collectionId,
      collectionSlug: col?.slug ?? null,
      collectionTitle: col?.title ?? null,
      tags: [...art.tags],
      kind: art.kind,
      hasExplainer: false,
      createdAt: GUEST_AT,
      updatedAt: GUEST_AT,
      html: art.html,
      explainerHtml: "",
    };
  });
}

export function getGuestLibrary(): Library {
  const artifacts: ArtifactSummary[] = getGuestArtifacts().map(
    ({ html: _html, explainerHtml: _explainer, ...summary }) => summary,
  );
  return {
    collections: getGuestCollections(),
    artifacts,
    guest: true,
  };
}

export function getGuestArtifact(idOrSlug: string): Artifact | null {
  return (
    getGuestArtifacts().find(
      (art) => art.id === idOrSlug || art.slug === idOrSlug,
    ) ?? null
  );
}

export function getGuestCollection(idOrSlug: string): Collection | null {
  return (
    getGuestCollections().find(
      (col) => col.id === idOrSlug || col.slug === idOrSlug,
    ) ?? null
  );
}
