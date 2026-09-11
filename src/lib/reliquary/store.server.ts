import { getSql } from "@/lib/db";
import { MAX_HTML_BYTES } from "./constants";
import { ReliquaryError, notFound } from "./errors";
import { inferKind } from "./kind";
import { getGuestArtifact } from "./guest";
import { SEED_ARTIFACTS, SEED_COLLECTIONS } from "./seed";
import { slugify } from "./slug";
import type {
  Artifact,
  ArtifactCollaboration,
  ArtifactCollaborator,
  ArtifactHistory,
  ArtifactInput,
  ArtifactKind,
  ArtifactPatch,
  ArtifactRevision,
  ArtifactRevisionSummary,
  ArtifactSummary,
  Collection,
  CollectionInput,
  Library,
} from "./types";
import {
  artifactCopyInput,
  canonicalFollowSourceId,
  followContentChanged,
  followMeta,
  libraryCopyLookupIds,
  resolveFollowedArtifact,
  type FollowContent,
  type FollowSourceFields,
} from "./save";
import {
  canRestoreRevision,
  historyTarget,
  pickSelectedRevisionId,
  snapshotsToAppend,
} from "./revisions";
import {
  canWriteSourceTip,
  collaboratorInviteMessage,
  decideFollowContentWrite,
  normalizeCollaboratorEmail,
  resolveCollaboratorInvite,
  revisionAuthorLabel,
} from "./collaborators";
import { ensureDocument } from "./wrap";

type ArtifactRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  html?: string;
  explainer_html?: string;
  has_explainer?: boolean;
  collection_id: string | null;
  collection_slug: string | null;
  collection_title: string | null;
  tags: string;
  kind: string;
  created_at: unknown;
  updated_at: unknown;
  user_id?: string;
  source_artifact_id?: string | null;
  collaborators_enabled?: boolean;
};

type RevisionRow = {
  id: string;
  artifact_id: string;
  user_id: string;
  title: string;
  description: string;
  html?: string;
  explainer_html?: string;
  tags: string;
  kind: string;
  html_bytes?: number;
  created_at: unknown;
  author_name?: string | null;
  author_email?: string | null;
};

type CollectionRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  sort_order: number;
  created_at: unknown;
  updated_at: unknown;
  count?: number;
};

function flag(value: unknown): boolean {
  return value === true || value === 1 || value === "t" || value === "true";
}

function iso(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? value : d.toISOString();
  }
  return new Date().toISOString();
}

function parseTags(raw: unknown): string[] {
  if (Array.isArray(raw)) return normalizeTags(raw.map(String));
  if (typeof raw === "string") {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) return normalizeTags(parsed.map(String));
    } catch {
      return [];
    }
  }
  return [];
}

function normalizeTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const tag of tags) {
    const t = tag.trim().toLowerCase().slice(0, 32);
    if (!t || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
    if (out.length >= 24) break;
  }
  return out;
}

function mapSummary(row: ArtifactRow): ArtifactSummary {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    collectionId: row.collection_id,
    collectionSlug: row.collection_slug,
    collectionTitle: row.collection_title,
    tags: parseTags(row.tags),
    kind: row.kind === "react" ? "react" : "html",
    hasExplainer:
      row.has_explainer === true || Boolean(row.explainer_html?.trim()),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
    ...followMeta(row.source_artifact_id ?? null),
  };
}

function mapArtifact(row: ArtifactRow): Artifact {
  return {
    ...mapSummary(row),
    html: row.html ?? "",
    explainerHtml: row.explainer_html ?? "",
    collaboration: null,
  };
}

function prepareExplainer(source: string | undefined): string {
  const html = (source ?? "").trim();
  if (new TextEncoder().encode(html).length > MAX_HTML_BYTES) {
    throw new ReliquaryError("Explainer is too large", 413, "TOO_LARGE");
  }
  return html;
}

function mapCollection(row: CollectionRow): Collection {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    sortOrder: row.sort_order,
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
    count: Number(row.count ?? 0),
  };
}

function mapFollowSource(row: ArtifactRow): FollowSourceFields {
  const explainerHtml = row.explainer_html ?? "";
  return {
    title: row.title,
    description: row.description,
    html: row.html ?? "",
    explainerHtml,
    tags: parseTags(row.tags),
    kind: row.kind === "react" ? "react" : "html",
    hasExplainer:
      row.has_explainer === true || Boolean(explainerHtml.trim()),
    updatedAt: iso(row.updated_at),
  };
}

function guestFollowSource(id: string): FollowSourceFields | null {
  const guest = getGuestArtifact(id);
  if (!guest || guest.id !== id) return null;
  return {
    title: guest.title,
    description: guest.description,
    html: guest.html,
    explainerHtml: guest.explainerHtml,
    tags: [...guest.tags],
    kind: guest.kind,
    hasExplainer: guest.hasExplainer,
    updatedAt: guest.updatedAt,
  };
}

async function loadSourcesByIds(
  ids: string[],
): Promise<Map<string, FollowSourceFields>> {
  const unique = [...new Set(ids.filter(Boolean))];
  const found = new Map<string, FollowSourceFields>();
  if (unique.length === 0) return found;
  const sql = await getSql();
  for (const id of unique) {
    const rows = await sql<ArtifactRow>`
      select id, title, description, html, explainer_html, tags, kind, updated_at
      from artifacts
      where id = ${id}
      limit 1
    `;
    if (rows[0]) {
      found.set(id, mapFollowSource(rows[0]));
      continue;
    }
    const guest = guestFollowSource(id);
    if (guest) found.set(id, guest);
  }
  return found;
}

function hydrateFromSources<T extends ArtifactSummary>(
  items: T[],
  sources: Map<string, FollowSourceFields>,
): T[] {
  return items.map((item) =>
    resolveFollowedArtifact(
      item,
      item.sourceArtifactId
        ? (sources.get(item.sourceArtifactId) ?? null)
        : null,
    ),
  );
}

function mapRevisionSummary(row: RevisionRow): ArtifactRevisionSummary {
  const explainerHtml = row.explainer_html ?? "";
  const htmlBytes = Number(row.html_bytes ?? 0) ||
    new TextEncoder().encode(row.html ?? "").length;
  return {
    id: row.id,
    artifactId: row.artifact_id,
    title: row.title,
    description: row.description,
    tags: parseTags(row.tags),
    kind: row.kind === "react" ? "react" : "html",
    hasExplainer: Boolean(explainerHtml.trim()),
    htmlBytes,
    createdAt: iso(row.created_at),
    authorUserId: row.user_id,
    authorLabel: revisionAuthorLabel({
      name: row.author_name,
      email: row.author_email,
    }),
  };
}

function mapRevision(row: RevisionRow): ArtifactRevision {
  return {
    ...mapRevisionSummary(row),
    html: row.html ?? "",
    explainerHtml: row.explainer_html ?? "",
  };
}

async function countRevisions(artifactId: string): Promise<number> {
  const sql = await getSql();
  const rows = await sql<{ n: number }>`
    select count(*)::int as n from artifact_revisions
    where artifact_id = ${artifactId}
  `;
  return Number(rows[0]?.n ?? 0);
}

async function insertRevision(
  userId: string,
  artifactId: string,
  snapshot: FollowContent & { kind: ArtifactKind },
): Promise<void> {
  const sql = await getSql();
  await sql`
    insert into artifact_revisions (
      id, artifact_id, user_id, title, description, html, explainer_html, tags, kind
    )
    values (
      ${crypto.randomUUID()}, ${artifactId}, ${userId}, ${snapshot.title},
      ${snapshot.description}, ${snapshot.html}, ${snapshot.explainerHtml},
      ${JSON.stringify(snapshot.tags)}, ${snapshot.kind}
    )
  `;
}

async function listRevisionRows(
  artifactId: string,
): Promise<ArtifactRevisionSummary[]> {
  const sql = await getSql();
  const rows = await sql<RevisionRow>`
    select r.id, r.artifact_id, r.user_id, r.title, r.description, r.explainer_html,
      r.tags, r.kind, octet_length(r.html) as html_bytes, r.created_at,
      u.name as author_name, u.email as author_email
    from artifact_revisions r
    left join "user" u on u.id = r.user_id
    where r.artifact_id = ${artifactId}
    order by r.created_at desc
  `;
  return rows.map(mapRevisionSummary);
}

async function loadRevision(
  artifactId: string,
  revisionId: string,
): Promise<ArtifactRevision | null> {
  const sql = await getSql();
  const rows = await sql<RevisionRow>`
    select r.id, r.artifact_id, r.user_id, r.title, r.description, r.html,
      r.explainer_html, r.tags, r.kind, r.created_at,
      u.name as author_name, u.email as author_email
    from artifact_revisions r
    left join "user" u on u.id = r.user_id
    where r.artifact_id = ${artifactId} and r.id = ${revisionId}
    limit 1
  `;
  if (rows.length === 0) return null;
  return mapRevision(rows[0]!);
}

async function actorCanWriteSource(
  userId: string,
  sourceId: string,
): Promise<boolean> {
  const sql = await getSql();
  const rows = await sql<{
    user_id: string;
    collaborators_enabled: boolean;
    on_allowlist: boolean;
  }>`
    select a.user_id, a.collaborators_enabled,
      exists(
        select 1 from artifact_collaborators c
        where c.artifact_id = a.id and c.user_id = ${userId}
      ) as on_allowlist
    from artifacts a
    where a.id = ${sourceId}
    limit 1
  `;
  const row = rows[0];
  if (!row) return false;
  return canWriteSourceTip({
    actorIsSourceOwner: row.user_id === userId,
    collaboratorsEnabled: flag(row.collaborators_enabled),
    actorOnAllowlist: flag(row.on_allowlist),
  });
}

async function hydrateCanEditSource<T extends ArtifactSummary>(
  userId: string,
  items: T[],
): Promise<T[]> {
  const followIds = [
    ...new Set(
      items
        .filter((item) => item.following && item.sourceArtifactId)
        .map((item) => item.sourceArtifactId as string),
    ),
  ];
  const writable = new Set<string>();
  for (const id of followIds) {
    if (await actorCanWriteSource(userId, id)) writable.add(id);
  }
  return items.map((item) => ({
    ...item,
    canEditSource: item.following
      ? Boolean(item.sourceArtifactId && writable.has(item.sourceArtifactId))
      : true,
  }));
}

function asPublicArtifact(artifact: Artifact): Artifact {
  return { ...artifact, canEditSource: false, collaboration: null };
}

async function loadCollaborationPanel(
  artifactId: string,
): Promise<ArtifactCollaboration> {
  const sql = await getSql();
  const flags = await sql<{ collaborators_enabled: boolean }>`
    select collaborators_enabled from artifacts where id = ${artifactId} limit 1
  `;
  const people = await sql<{
    user_id: string;
    created_at: unknown;
    email: string | null;
    name: string | null;
  }>`
    select c.user_id, c.created_at, u.email, u.name
    from artifact_collaborators c
    left join "user" u on u.id = c.user_id
    where c.artifact_id = ${artifactId}
    order by c.created_at asc
  `;
  return {
    enabled: flag(flags[0]?.collaborators_enabled),
    people: people.map(
      (row): ArtifactCollaborator => ({
        userId: row.user_id,
        email: row.email ?? "",
        name: row.name?.trim() || row.email || "Someone",
        createdAt: iso(row.created_at),
      }),
    ),
  };
}

async function requireOwnedOriginal(
  userId: string,
  idOrSlug: string,
): Promise<Artifact> {
  const artifact = await getArtifact(userId, idOrSlug);
  if (artifact.following) {
    throw new ReliquaryError(
      "Only the original owner can manage collaborators",
      403,
      "FORBIDDEN",
    );
  }
  return artifact;
}

async function loadRawArtifact(id: string): Promise<ArtifactRow | null> {
  const sql = await getSql();
  const rows = await sql<ArtifactRow>`
    select id, slug, title, description, html, explainer_html, collection_id,
      tags, kind, created_at, updated_at, user_id, source_artifact_id
    from artifacts
    where id = ${id}
    limit 1
  `;
  return rows[0] ?? null;
}

async function writeSourceContent(
  actorId: string,
  sourceId: string,
  next: FollowContent & { kind: ArtifactKind },
): Promise<boolean> {
  const row = await loadRawArtifact(sourceId);
  if (!row) return false;
  const previous: FollowContent = {
    title: row.title,
    html: row.html ?? "",
    description: row.description,
    explainerHtml: row.explainer_html ?? "",
    tags: parseTags(row.tags),
  };
  const existingCount = await countRevisions(sourceId);
  const snapshots = snapshotsToAppend({
    previous,
    next,
    existingCount,
  });
  for (const snapshot of snapshots) {
    await insertRevision(actorId, sourceId, {
      ...snapshot,
      kind: inferKind(snapshot.html),
    });
  }
  const sql = await getSql();
  await sql`
    update artifacts set
      title = ${next.title},
      description = ${next.description},
      html = ${next.html},
      explainer_html = ${next.explainerHtml},
      tags = ${JSON.stringify(next.tags)},
      kind = ${next.kind},
      updated_at = now()
    where id = ${sourceId}
  `;
  return true;
}

async function hydrateFollows<T extends ArtifactSummary>(
  items: T[],
): Promise<T[]> {
  const ids = items
    .filter((item) => item.following && item.sourceArtifactId)
    .map((item) => item.sourceArtifactId as string);
  if (ids.length === 0) {
    return items.map((item) => ({ ...item, followLive: false }));
  }
  return hydrateFromSources(items, await loadSourcesByIds(ids));
}

async function hydrateArtifacts<T extends ArtifactSummary>(
  userId: string,
  items: T[],
): Promise<T[]> {
  return hydrateCanEditSource(userId, await hydrateFollows(items));
}

const seedByUser = new Map<string, Promise<void>>();

function scopedId(userId: string, id: string): string {
  return `${userId}:${id}`;
}

async function ensureSeeded(userId: string): Promise<void> {
  let pending = seedByUser.get(userId);
  if (!pending) {
    pending = (async () => {
      const sql = await getSql();
      const key = `seeded:${userId}`;
      const flags = await sql<{ value: string }>`
        select value from reliquary_meta where key = ${key}
      `;
      if (flags.length > 0) return;
      for (const col of SEED_COLLECTIONS) {
        await sql`
          insert into collections (id, user_id, slug, title, description, sort_order)
          values (
            ${scopedId(userId, col.id)}, ${userId}, ${col.slug}, ${col.title},
            ${col.description}, ${col.sortOrder}
          )
          on conflict (id) do nothing
        `;
      }
      for (const art of SEED_ARTIFACTS) {
        await sql`
          insert into artifacts (
            id, user_id, slug, title, description, html, collection_id, tags, kind
          ) values (
            ${scopedId(userId, art.id)}, ${userId}, ${art.slug}, ${art.title},
            ${art.description}, ${art.html}, ${scopedId(userId, art.collectionId)},
            ${JSON.stringify(art.tags)}, ${art.kind}
          )
          on conflict (id) do nothing
        `;
      }
      await sql`
        insert into reliquary_meta (key, value) values (${key}, '1')
        on conflict (key) do nothing
      `;
    })().catch((err) => {
      seedByUser.delete(userId);
      throw err;
    });
    seedByUser.set(userId, pending);
  }
  return pending;
}

async function uniqueSlug(
  table: "artifacts" | "collections",
  userId: string,
  base: string,
  excludeId?: string,
): Promise<string> {
  const sql = await getSql();
  let slug = slugify(base);
  for (let i = 0; i < 50; i += 1) {
    const candidate = i === 0 ? slug : `${slug}-${i + 1}`;
    const rows =
      table === "artifacts"
        ? excludeId
          ? await sql<{ id: string }>`
              select id from artifacts
              where user_id = ${userId} and slug = ${candidate} and id != ${excludeId}
            `
          : await sql<{ id: string }>`
              select id from artifacts where user_id = ${userId} and slug = ${candidate}
            `
        : excludeId
          ? await sql<{ id: string }>`
              select id from collections
              where user_id = ${userId} and slug = ${candidate} and id != ${excludeId}
            `
          : await sql<{ id: string }>`
              select id from collections where user_id = ${userId} and slug = ${candidate}
            `;
    if (rows.length === 0) return candidate;
  }
  return `${slug}-${crypto.randomUUID().slice(0, 8)}`;
}

async function resolveCollectionId(
  userId: string,
  collectionId?: string | null,
  collection?: string | null,
): Promise<string | null> {
  if (collectionId === null) return null;
  const sql = await getSql();
  const key = collectionId || collection || null;
  if (!key) return null;
  const rows = await sql<{ id: string }>`
    select id from collections
    where user_id = ${userId} and (id = ${key} or slug = ${key})
    limit 1
  `;
  if (rows.length === 0) {
    throw new ReliquaryError("Collection not found", 404, "NOT_FOUND");
  }
  return rows[0]!.id;
}

export async function listCollections(userId: string): Promise<Collection[]> {
  await ensureSeeded(userId);
  const sql = await getSql();
  const rows = await sql<CollectionRow>`
    select c.*, (
      select count(*)::int from artifacts a
      where a.collection_id = c.id and a.user_id = ${userId}
    ) as count
    from collections c
    where c.user_id = ${userId}
    order by c.sort_order asc, c.title asc
  `;
  return rows.map(mapCollection);
}

export async function listArtifacts(
  userId: string,
  opts?: {
    collection?: string;
    tag?: string;
    q?: string;
  },
): Promise<ArtifactSummary[]> {
  await ensureSeeded(userId);
  const sql = await getSql();
  const rows = await sql<ArtifactRow>`
    select a.id, a.slug, a.title, a.description, a.collection_id, a.tags, a.kind,
      (a.explainer_html <> '') as has_explainer,
      a.created_at, a.updated_at, a.source_artifact_id,
      c.slug as collection_slug, c.title as collection_title
    from artifacts a
    left join collections c on c.id = a.collection_id
    where a.user_id = ${userId}
    order by a.updated_at desc
  `;
  let items = await hydrateArtifacts(userId, rows.map(mapSummary));
  items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  if (opts?.collection) {
    const key = opts.collection;
    items = items.filter(
      (a) => a.collectionId === key || a.collectionSlug === key,
    );
  }
  if (opts?.tag) {
    const tag = opts.tag.toLowerCase();
    items = items.filter((a) => a.tags.includes(tag));
  }
  if (opts?.q) {
    const q = opts.q.trim().toLowerCase();
    if (q) {
      items = items.filter((a) => {
        const hay =
          `${a.title} ${a.description} ${a.tags.join(" ")} ${a.collectionTitle ?? ""}`.toLowerCase();
        return hay.includes(q);
      });
    }
  }
  return items;
}

export async function getLibrary(userId: string): Promise<Library> {
  const [collections, artifacts] = await Promise.all([
    listCollections(userId),
    listArtifacts(userId),
  ]);
  return { collections, artifacts };
}

export async function getArtifact(
  userId: string,
  idOrSlug: string,
): Promise<Artifact> {
  await ensureSeeded(userId);
  const sql = await getSql();
  const rows = await sql<ArtifactRow>`
    select a.id, a.slug, a.title, a.description, a.html, a.explainer_html,
      a.collection_id, a.tags, a.kind, a.source_artifact_id,
      a.created_at, a.updated_at,
      c.slug as collection_slug, c.title as collection_title
    from artifacts a
    left join collections c on c.id = a.collection_id
    where a.user_id = ${userId} and (a.id = ${idOrSlug} or a.slug = ${idOrSlug})
    order by case when a.id = ${idOrSlug} then 0 else 1 end
    limit 1
  `;
  if (rows.length === 0) notFound("Artifact");
  const [artifact] = await hydrateArtifacts(userId, [mapArtifact(rows[0]!)]);
  if (!artifact) notFound("Artifact");
  if (!artifact.following) {
    artifact.collaboration = await loadCollaborationPanel(artifact.id);
  }
  return artifact;
}

type PublicArtifactRecord = {
  artifact: Artifact;
  ownerUserId: string | null;
};

async function loadPublicRecord(idOrSlug: string): Promise<PublicArtifactRecord> {
  const sql = await getSql();
  const rows = await sql<ArtifactRow>`
    select a.id, a.user_id, a.slug, a.title, a.description, a.html, a.explainer_html,
      a.collection_id, a.tags, a.kind, a.source_artifact_id,
      a.created_at, a.updated_at,
      c.slug as collection_slug, c.title as collection_title
    from artifacts a
    left join collections c on c.id = a.collection_id
    where a.id = ${idOrSlug} or a.slug = ${idOrSlug}
    order by case when a.id = ${idOrSlug} then 0 else 1 end
    limit 1
  `;
  if (rows.length === 0) {
    const guest = getGuestArtifact(idOrSlug);
    if (guest) return { artifact: guest, ownerUserId: null };
    notFound("Artifact");
  }
  const row = rows[0]!;
  const [artifact] = await hydrateFollows([mapArtifact(row)]);
  return {
    artifact: asPublicArtifact(artifact!),
    ownerUserId: row.user_id ?? null,
  };
}

export async function getPublicArtifact(idOrSlug: string): Promise<Artifact> {
  return (await loadPublicRecord(idOrSlug)).artifact;
}

export async function findLibraryCopy(
  userId: string,
  source: { id: string; ownerUserId: string | null },
): Promise<Artifact | null> {
  await ensureSeeded(userId);
  if (source.ownerUserId === userId) {
    return getArtifact(userId, source.id);
  }
  const { ids, sourceArtifactId } = libraryCopyLookupIds(userId, source.id);
  const sql = await getSql();
  const rows = await sql<ArtifactRow>`
    select a.id, a.slug, a.title, a.description, a.html, a.explainer_html,
      a.collection_id, a.tags, a.kind, a.source_artifact_id,
      a.created_at, a.updated_at,
      c.slug as collection_slug, c.title as collection_title
    from artifacts a
    left join collections c on c.id = a.collection_id
    where a.user_id = ${userId}
      and (
        a.id = ${ids[0]}
        or a.id = ${ids[1]}
        or a.source_artifact_id = ${sourceArtifactId}
      )
    order by a.updated_at desc
    limit 1
  `;
  if (rows.length === 0) return null;
  const [artifact] = await hydrateArtifacts(userId, [mapArtifact(rows[0]!)]);
  return artifact!;
}

export async function getShareView(
  userId: string | null,
  idOrSlug: string,
): Promise<{
  artifact: Artifact;
  inLibrarySlug: string | null;
  signedIn: boolean;
  following: boolean;
}> {
  const record = await loadPublicRecord(idOrSlug);
  if (!userId) {
    return {
      artifact: record.artifact,
      inLibrarySlug: null,
      signedIn: false,
      following: false,
    };
  }
  if (record.ownerUserId === userId) {
    return {
      artifact: record.artifact,
      inLibrarySlug: record.artifact.slug,
      signedIn: true,
      following: record.artifact.following,
    };
  }
  const copy = await findLibraryCopy(userId, {
    id: canonicalFollowSourceId(record.artifact),
    ownerUserId: null,
  });
  return {
    artifact: record.artifact,
    inLibrarySlug: copy?.slug ?? null,
    signedIn: true,
    following: Boolean(copy?.following),
  };
}

export async function saveSharedArtifact(
  userId: string,
  idOrSlug: string,
): Promise<{ artifact: Artifact; created: boolean }> {
  const record = await loadPublicRecord(idOrSlug);
  if (record.ownerUserId === userId) {
    return { artifact: record.artifact, created: false };
  }
  const sourceId = canonicalFollowSourceId(record.artifact);
  const existing = await findLibraryCopy(userId, {
    id: sourceId,
    ownerUserId: null,
  });
  if (existing) return { artifact: existing, created: false };

  try {
    const artifact = await createArtifact(userId, {
      ...artifactCopyInput(record.artifact),
      sourceArtifactId: sourceId,
    });
    return { artifact, created: true };
  } catch (err) {
    const raced = await findLibraryCopy(userId, {
      id: sourceId,
      ownerUserId: null,
    });
    if (raced) return { artifact: raced, created: false };
    throw err;
  }
}

export async function getCollection(
  userId: string,
  idOrSlug: string,
): Promise<Collection> {
  await ensureSeeded(userId);
  const sql = await getSql();
  const rows = await sql<CollectionRow>`
    select c.*, (
      select count(*)::int from artifacts a
      where a.collection_id = c.id and a.user_id = ${userId}
    ) as count
    from collections c
    where c.user_id = ${userId} and (c.id = ${idOrSlug} or c.slug = ${idOrSlug})
    limit 1
  `;
  if (rows.length === 0) notFound("Collection");
  return mapCollection(rows[0]!);
}

export async function createArtifact(
  userId: string,
  input: ArtifactInput,
): Promise<Artifact> {
  await ensureSeeded(userId);
  const title = input.title.trim();
  if (!title) throw new ReliquaryError("Title is required");
  const html = ensureDocument(input.html, title);
  if (new TextEncoder().encode(html).length > MAX_HTML_BYTES) {
    throw new ReliquaryError("HTML is too large", 413, "TOO_LARGE");
  }
  const collectionId = await resolveCollectionId(
    userId,
    input.collectionId,
    input.collection,
  );
  const id = crypto.randomUUID();
  const slug = await uniqueSlug("artifacts", userId, input.slug || title);
  const tags = normalizeTags(input.tags ?? []);
  const kind: ArtifactKind = inferKind(html);
  const sourceArtifactId = input.sourceArtifactId?.trim() || null;
  const sql = await getSql();
  await sql`
    insert into artifacts (
      id, user_id, slug, title, description, html, explainer_html,
      collection_id, tags, kind, source_artifact_id
    )
    values (
      ${id}, ${userId}, ${slug}, ${title}, ${input.description?.trim() ?? ""}, ${html},
      ${prepareExplainer(input.explainer)},
      ${collectionId}, ${JSON.stringify(tags)}, ${kind}, ${sourceArtifactId}
    )
  `;
  await insertRevision(userId, id, {
    title,
    html,
    description: input.description?.trim() ?? "",
    explainerHtml: prepareExplainer(input.explainer),
    tags,
    kind,
  });
  return getArtifact(userId, id);
}

async function updateLocalShelf(
  userId: string,
  artifactId: string,
  slug: string,
  collectionId: string | null,
): Promise<Artifact> {
  const sql = await getSql();
  await sql`
    update artifacts set
      slug = ${slug},
      collection_id = ${collectionId},
      updated_at = now()
    where id = ${artifactId} and user_id = ${userId}
  `;
  return getArtifact(userId, artifactId);
}

export async function updateArtifact(
  userId: string,
  idOrSlug: string,
  patch: ArtifactPatch,
): Promise<Artifact> {
  const current = await getArtifact(userId, idOrSlug);
  const title = patch.title?.trim() ?? current.title;
  if (!title) throw new ReliquaryError("Title is required");
  const html =
    patch.html !== undefined ? ensureDocument(patch.html, title) : current.html;
  if (new TextEncoder().encode(html).length > MAX_HTML_BYTES) {
    throw new ReliquaryError("HTML is too large", 413, "TOO_LARGE");
  }
  const hasCollectionField =
    patch.collectionId !== undefined || patch.collection !== undefined;
  const collectionId = hasCollectionField
    ? await resolveCollectionId(userId, patch.collectionId, patch.collection)
    : current.collectionId;
  const slug =
    patch.slug !== undefined
      ? await uniqueSlug("artifacts", userId, patch.slug || title, current.id)
      : current.slug;
  const tags =
    patch.tags !== undefined ? normalizeTags(patch.tags) : current.tags;
  const description =
    patch.description !== undefined
      ? patch.description.trim()
      : current.description;
  const explainerHtml =
    patch.explainer !== undefined
      ? prepareExplainer(patch.explainer)
      : current.explainerHtml;
  const kind = inferKind(html);
  const nextContent: FollowContent = {
    title,
    html,
    description,
    explainerHtml,
    tags,
  };
  const currentContent: FollowContent = {
    title: current.title,
    html: current.html,
    description: current.description,
    explainerHtml: current.explainerHtml,
    tags: current.tags,
  };
  const contentChanged = followContentChanged(currentContent, nextContent);
  const write = decideFollowContentWrite({
    following: current.following,
    contentChanged,
    canWriteSource: current.canEditSource,
  });
  const sql = await getSql();

  if (write === "shelf") {
    return updateLocalShelf(userId, current.id, slug, collectionId);
  }

  if (write === "write-source" && current.sourceArtifactId) {
    const wrote = await writeSourceContent(userId, current.sourceArtifactId, {
      ...nextContent,
      kind,
    });
    if (wrote) {
      return updateLocalShelf(userId, current.id, slug, collectionId);
    }
  }

  if (contentChanged) {
    const existingCount = await countRevisions(current.id);
    const snapshots = snapshotsToAppend({
      previous: currentContent,
      next: nextContent,
      existingCount,
    });
    for (const snapshot of snapshots) {
      await insertRevision(userId, current.id, {
        ...snapshot,
        kind: inferKind(snapshot.html),
      });
    }
  }
  const detach = write === "fork" || write === "write-source";
  await sql`
    update artifacts set
      slug = ${slug},
      title = ${title},
      description = ${description},
      html = ${html},
      explainer_html = ${explainerHtml},
      collection_id = ${collectionId},
      tags = ${JSON.stringify(tags)},
      kind = ${kind},
      source_artifact_id = ${detach ? null : current.sourceArtifactId},
      updated_at = now()
    where id = ${current.id} and user_id = ${userId}
  `;
  return getArtifact(userId, current.id);
}

export async function setCollaboratorsEnabled(
  userId: string,
  idOrSlug: string,
  enabled: boolean,
): Promise<Artifact> {
  const current = await requireOwnedOriginal(userId, idOrSlug);
  const sql = await getSql();
  await sql`
    update artifacts set collaborators_enabled = ${enabled}, updated_at = now()
    where id = ${current.id} and user_id = ${userId}
  `;
  return getArtifact(userId, current.id);
}

export async function addArtifactCollaborator(
  userId: string,
  idOrSlug: string,
  rawEmail: string,
): Promise<Artifact> {
  const current = await requireOwnedOriginal(userId, idOrSlug);
  const email = normalizeCollaboratorEmail(rawEmail);
  const sql = await getSql();
  const users = email
    ? await sql<{ id: string }>`
        select id from "user" where lower(email) = ${email} limit 1
      `
    : [];
  const panel = current.collaboration;
  const decision = resolveCollaboratorInvite({
    ownerUserId: userId,
    email: rawEmail,
    existingUser: users[0] ?? null,
    alreadyOnList: Boolean(
      users[0] && panel?.people.some((person) => person.userId === users[0]!.id),
    ),
    listCount: panel?.people.length ?? 0,
  });
  if (!decision.ok) {
    throw new ReliquaryError(
      collaboratorInviteMessage(decision.reason),
      decision.reason === "not-found" ? 404 : 400,
      decision.reason === "not-found" ? "NOT_FOUND" : "INVALID",
    );
  }
  await sql`
    insert into artifact_collaborators (artifact_id, user_id)
    values (${current.id}, ${decision.userId})
    on conflict (artifact_id, user_id) do nothing
  `;
  return getArtifact(userId, current.id);
}

export async function removeArtifactCollaborator(
  userId: string,
  idOrSlug: string,
  collaboratorUserId: string,
): Promise<Artifact> {
  const current = await requireOwnedOriginal(userId, idOrSlug);
  const target = collaboratorUserId.trim();
  if (!target) throw new ReliquaryError("Collaborator is required");
  const sql = await getSql();
  await sql`
    delete from artifact_collaborators
    where artifact_id = ${current.id} and user_id = ${target}
  `;
  return getArtifact(userId, current.id);
}

export async function deleteArtifact(
  userId: string,
  idOrSlug: string,
): Promise<{ ok: true }> {
  const current = await getArtifact(userId, idOrSlug);
  const sql = await getSql();
  await sql`delete from artifacts where id = ${current.id} and user_id = ${userId}`;
  return { ok: true };
}

export async function getArtifactHistory(
  userId: string,
  idOrSlug: string,
  revisionId?: string | null,
): Promise<ArtifactHistory> {
  const artifact = await getArtifact(userId, idOrSlug);
  const target = historyTarget(artifact);
  const revisions = await listRevisionRows(target.artifactId);
  const selectedId = pickSelectedRevisionId(
    revisions.map((row) => row.id),
    revisionId,
  );
  const selected = selectedId
    ? await loadRevision(target.artifactId, selectedId)
    : null;
  return {
    artifact,
    revisions,
    selected,
    fromSource: target.fromSource,
    canRestore: canRestoreRevision(target.fromSource),
  };
}

export async function restoreRevision(
  userId: string,
  idOrSlug: string,
  revisionId: string,
): Promise<Artifact> {
  const history = await getArtifactHistory(userId, idOrSlug, revisionId);
  if (!history.canRestore) {
    throw new ReliquaryError(
      "This history belongs to the shared original",
      403,
      "FORBIDDEN",
    );
  }
  if (!history.selected) notFound("Revision");
  return updateArtifact(userId, history.artifact.id, {
    title: history.selected.title,
    html: history.selected.html,
    description: history.selected.description,
    explainer: history.selected.explainerHtml,
    tags: history.selected.tags,
  });
}

export async function createCollection(
  userId: string,
  input: CollectionInput,
): Promise<Collection> {
  await ensureSeeded(userId);
  const title = input.title.trim();
  if (!title) throw new ReliquaryError("Title is required");
  const id = crypto.randomUUID();
  const slug = await uniqueSlug("collections", userId, input.slug || title);
  const sql = await getSql();
  const maxRows = await sql<{ n: number }>`
    select coalesce(max(sort_order), -1)::int as n from collections where user_id = ${userId}
  `;
  const sortOrder = (maxRows[0]?.n ?? -1) + 1;
  await sql`
    insert into collections (id, user_id, slug, title, description, sort_order)
    values (${id}, ${userId}, ${slug}, ${title}, ${input.description?.trim() ?? ""}, ${sortOrder})
  `;
  return getCollection(userId, id);
}

export async function updateCollection(
  userId: string,
  idOrSlug: string,
  patch: Partial<CollectionInput>,
): Promise<Collection> {
  const current = await getCollection(userId, idOrSlug);
  const title = patch.title?.trim() ?? current.title;
  if (!title) throw new ReliquaryError("Title is required");
  const slug =
    patch.slug !== undefined
      ? await uniqueSlug("collections", userId, patch.slug || title, current.id)
      : current.slug;
  const description =
    patch.description !== undefined
      ? patch.description.trim()
      : current.description;
  const sql = await getSql();
  await sql`
    update collections set
      slug = ${slug},
      title = ${title},
      description = ${description},
      updated_at = now()
    where id = ${current.id} and user_id = ${userId}
  `;
  return getCollection(userId, current.id);
}

export async function deleteCollection(
  userId: string,
  idOrSlug: string,
): Promise<{ ok: true }> {
  const current = await getCollection(userId, idOrSlug);
  const sql = await getSql();
  await sql`
    update artifacts set collection_id = null
    where collection_id = ${current.id} and user_id = ${userId}
  `;
  await sql`delete from collections where id = ${current.id} and user_id = ${userId}`;
  return { ok: true };
}
