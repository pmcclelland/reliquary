import { getSql } from "@/lib/db";
import { MAX_HTML_BYTES } from "./constants";
import { ReliquaryError, notFound } from "./errors";
import { inferKind } from "./kind";
import { SEED_ARTIFACTS, SEED_COLLECTIONS } from "./seed";
import { slugify } from "./slug";
import type {
  Artifact,
  ArtifactInput,
  ArtifactKind,
  ArtifactPatch,
  ArtifactSummary,
  Collection,
  CollectionInput,
  Library,
} from "./types";
import { ensureDocument } from "./wrap";

type ArtifactRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  html?: string;
  collection_id: string | null;
  collection_slug: string | null;
  collection_title: string | null;
  tags: string;
  kind: string;
  created_at: unknown;
  updated_at: unknown;
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
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

function mapArtifact(row: ArtifactRow): Artifact {
  return { ...mapSummary(row), html: row.html ?? "" };
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

let seedPromise: Promise<void> | null = null;

async function ensureSeeded(): Promise<void> {
  seedPromise ??= (async () => {
    const sql = await getSql();
    const flags = await sql<{ value: string }>`
      select value from reliquary_meta where key = 'seeded'
    `;
    if (flags.length > 0) return;
    for (const col of SEED_COLLECTIONS) {
      await sql`
        insert into collections (id, slug, title, description, sort_order)
        values (${col.id}, ${col.slug}, ${col.title}, ${col.description}, ${col.sortOrder})
        on conflict (id) do nothing
      `;
    }
    for (const art of SEED_ARTIFACTS) {
      await sql`
        insert into artifacts (
          id, slug, title, description, html, collection_id, tags, kind
        ) values (
          ${art.id}, ${art.slug}, ${art.title}, ${art.description}, ${art.html},
          ${art.collectionId}, ${JSON.stringify(art.tags)}, ${art.kind}
        )
        on conflict (id) do nothing
      `;
    }
    await sql`
      insert into reliquary_meta (key, value) values ('seeded', '1')
      on conflict (key) do nothing
    `;
  })().catch((err) => {
    seedPromise = null;
    throw err;
  });
  return seedPromise;
}

async function uniqueSlug(
  table: "artifacts" | "collections",
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
              select id from artifacts where slug = ${candidate} and id != ${excludeId}
            `
          : await sql<{ id: string }>`select id from artifacts where slug = ${candidate}`
        : excludeId
          ? await sql<{ id: string }>`
              select id from collections where slug = ${candidate} and id != ${excludeId}
            `
          : await sql<{ id: string }>`select id from collections where slug = ${candidate}`;
    if (rows.length === 0) return candidate;
  }
  return `${slug}-${crypto.randomUUID().slice(0, 8)}`;
}

async function resolveCollectionId(
  collectionId?: string | null,
  collection?: string | null,
): Promise<string | null> {
  if (collectionId === null) return null;
  const sql = await getSql();
  const key = collectionId || collection || null;
  if (!key) return null;
  const rows = await sql<{ id: string }>`
    select id from collections where id = ${key} or slug = ${key} limit 1
  `;
  if (rows.length === 0) {
    throw new ReliquaryError("Collection not found", 404, "NOT_FOUND");
  }
  return rows[0]!.id;
}

export async function listCollections(): Promise<Collection[]> {
  await ensureSeeded();
  const sql = await getSql();
  const rows = await sql<CollectionRow>`
    select c.*, (
      select count(*)::int from artifacts a where a.collection_id = c.id
    ) as count
    from collections c
    order by c.sort_order asc, c.title asc
  `;
  return rows.map(mapCollection);
}

export async function listArtifacts(opts?: {
  collection?: string;
  tag?: string;
  q?: string;
}): Promise<ArtifactSummary[]> {
  await ensureSeeded();
  const sql = await getSql();
  const rows = await sql<ArtifactRow>`
    select a.id, a.slug, a.title, a.description, a.collection_id, a.tags, a.kind,
      a.created_at, a.updated_at,
      c.slug as collection_slug, c.title as collection_title
    from artifacts a
    left join collections c on c.id = a.collection_id
    order by a.updated_at desc
  `;
  let items = rows.map(mapSummary);
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

export async function getLibrary(): Promise<Library> {
  const [collections, artifacts] = await Promise.all([
    listCollections(),
    listArtifacts(),
  ]);
  return { collections, artifacts };
}

export async function getArtifact(idOrSlug: string): Promise<Artifact> {
  await ensureSeeded();
  const sql = await getSql();
  const rows = await sql<ArtifactRow>`
    select a.id, a.slug, a.title, a.description, a.html, a.collection_id, a.tags, a.kind,
      a.created_at, a.updated_at,
      c.slug as collection_slug, c.title as collection_title
    from artifacts a
    left join collections c on c.id = a.collection_id
    where a.id = ${idOrSlug} or a.slug = ${idOrSlug}
    limit 1
  `;
  if (rows.length === 0) notFound("Artifact");
  return mapArtifact(rows[0]!);
}

export async function getCollection(idOrSlug: string): Promise<Collection> {
  await ensureSeeded();
  const sql = await getSql();
  const rows = await sql<CollectionRow>`
    select c.*, (
      select count(*)::int from artifacts a where a.collection_id = c.id
    ) as count
    from collections c
    where c.id = ${idOrSlug} or c.slug = ${idOrSlug}
    limit 1
  `;
  if (rows.length === 0) notFound("Collection");
  return mapCollection(rows[0]!);
}

export async function createArtifact(input: ArtifactInput): Promise<Artifact> {
  await ensureSeeded();
  const title = input.title.trim();
  if (!title) throw new ReliquaryError("Title is required");
  const html = ensureDocument(input.html, title);
  if (new TextEncoder().encode(html).length > MAX_HTML_BYTES) {
    throw new ReliquaryError("HTML is too large", 413, "TOO_LARGE");
  }
  const collectionId = await resolveCollectionId(
    input.collectionId,
    input.collection,
  );
  const id = crypto.randomUUID();
  const slug = await uniqueSlug("artifacts", input.slug || title);
  const tags = normalizeTags(input.tags ?? []);
  const kind: ArtifactKind = inferKind(html);
  const sql = await getSql();
  await sql`
    insert into artifacts (id, slug, title, description, html, collection_id, tags, kind)
    values (
      ${id}, ${slug}, ${title}, ${input.description?.trim() ?? ""}, ${html},
      ${collectionId}, ${JSON.stringify(tags)}, ${kind}
    )
  `;
  return getArtifact(id);
}

export async function updateArtifact(
  idOrSlug: string,
  patch: ArtifactPatch,
): Promise<Artifact> {
  const current = await getArtifact(idOrSlug);
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
    ? await resolveCollectionId(patch.collectionId, patch.collection)
    : current.collectionId;
  const slug =
    patch.slug !== undefined
      ? await uniqueSlug("artifacts", patch.slug || title, current.id)
      : current.slug;
  const tags =
    patch.tags !== undefined ? normalizeTags(patch.tags) : current.tags;
  const description =
    patch.description !== undefined
      ? patch.description.trim()
      : current.description;
  const kind = inferKind(html);
  const sql = await getSql();
  await sql`
    update artifacts set
      slug = ${slug},
      title = ${title},
      description = ${description},
      html = ${html},
      collection_id = ${collectionId},
      tags = ${JSON.stringify(tags)},
      kind = ${kind},
      updated_at = now()
    where id = ${current.id}
  `;
  return getArtifact(current.id);
}

export async function deleteArtifact(idOrSlug: string): Promise<{ ok: true }> {
  const current = await getArtifact(idOrSlug);
  const sql = await getSql();
  await sql`delete from artifacts where id = ${current.id}`;
  return { ok: true };
}

export async function createCollection(
  input: CollectionInput,
): Promise<Collection> {
  await ensureSeeded();
  const title = input.title.trim();
  if (!title) throw new ReliquaryError("Title is required");
  const id = crypto.randomUUID();
  const slug = await uniqueSlug("collections", input.slug || title);
  const sql = await getSql();
  const maxRows = await sql<{ n: number }>`
    select coalesce(max(sort_order), -1)::int as n from collections
  `;
  const sortOrder = (maxRows[0]?.n ?? -1) + 1;
  await sql`
    insert into collections (id, slug, title, description, sort_order)
    values (${id}, ${slug}, ${title}, ${input.description?.trim() ?? ""}, ${sortOrder})
  `;
  return getCollection(id);
}

export async function updateCollection(
  idOrSlug: string,
  patch: Partial<CollectionInput>,
): Promise<Collection> {
  const current = await getCollection(idOrSlug);
  const title = patch.title?.trim() ?? current.title;
  if (!title) throw new ReliquaryError("Title is required");
  const slug =
    patch.slug !== undefined
      ? await uniqueSlug("collections", patch.slug || title, current.id)
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
    where id = ${current.id}
  `;
  return getCollection(current.id);
}

export async function deleteCollection(
  idOrSlug: string,
): Promise<{ ok: true }> {
  const current = await getCollection(idOrSlug);
  const sql = await getSql();
  await sql`update artifacts set collection_id = null where collection_id = ${current.id}`;
  await sql`delete from collections where id = ${current.id}`;
  return { ok: true };
}
