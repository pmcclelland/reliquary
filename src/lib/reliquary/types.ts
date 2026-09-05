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
};

export type Artifact = ArtifactSummary & {
  html: string;
  explainerHtml: string;
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
};

export type ArtifactPatch = Partial<ArtifactInput>;

export type CollectionInput = {
  title: string;
  description?: string;
  slug?: string;
};
