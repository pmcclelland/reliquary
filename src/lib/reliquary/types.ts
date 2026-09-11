export type ArtifactKind = "html" | "react";

export type ArtifactSummary = {
  id: string;
  slug: string;
  title: string;
  description: string;
  collectionId: string | null;
  collectionSlug: string | null;
  collectionTitle: string | null;
  tags: string[];
  kind: ArtifactKind;
  hasExplainer: boolean;
  createdAt: string;
  updatedAt: string;
  /** Set when this row was saved from another relic and still follows it. */
  sourceArtifactId: string | null;
  /** True while `sourceArtifactId` is set — the row is a live follow. */
  following: boolean;
  /** True when this read resolved title/HTML/etc. from the live source. */
  followLive: boolean;
  /**
   * True when this actor may write the live tip: they own this row, or they
   * follow a source whose owner has enabled collaborators and allowlisted them.
   */
  canEditSource: boolean;
};

export type ArtifactCollaborator = {
  userId: string;
  email: string;
  name: string;
  createdAt: string;
};

export type ArtifactCollaboration = {
  enabled: boolean;
  people: ArtifactCollaborator[];
};

export type Artifact = ArtifactSummary & {
  html: string;
  explainerHtml: string;
  /** Owner-only allowlist. Null for follows, guests, and public reads. */
  collaboration: ArtifactCollaboration | null;
};

export type Collection = {
  id: string;
  slug: string;
  title: string;
  description: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  count: number;
};

export type Library = {
  collections: Collection[];
  artifacts: ArtifactSummary[];
  /** True when this is the in-memory sample library for signed-out visitors. */
  guest?: boolean;
};

export type ArtifactInput = {
  title: string;
  html: string;
  description?: string;
  explainer?: string;
  collectionId?: string | null;
  collection?: string | null;
  tags?: string[];
  slug?: string;
  /** Original artifact id when this row is a saved copy. */
  sourceArtifactId?: string | null;
};

export type ShareView = {
  artifact: Artifact;
  inLibrarySlug: string | null;
  signedIn: boolean;
  /** The library row is a follow (not the original or a seed snapshot). */
  following: boolean;
};

export type SaveToLibraryResult = {
  artifact: Artifact;
  created: boolean;
};

export type ArtifactRevisionSummary = {
  id: string;
  artifactId: string;
  title: string;
  description: string;
  tags: string[];
  kind: ArtifactKind;
  hasExplainer: boolean;
  htmlBytes: number;
  createdAt: string;
  authorUserId: string;
  authorLabel: string | null;
};

export type ArtifactRevision = ArtifactRevisionSummary & {
  html: string;
  explainerHtml: string;
};

export type ArtifactHistory = {
  artifact: Artifact;
  revisions: ArtifactRevisionSummary[];
  selected: ArtifactRevision | null;
  /** True when this list is the live source's history, not the follow row. */
  fromSource: boolean;
  canRestore: boolean;
};

export type ArtifactPatch = Partial<ArtifactInput>;

export type CollectionInput = {
  title: string;
  description?: string;
  slug?: string;
};
