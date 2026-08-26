import { createServerFn } from "@tanstack/react-start";
import { notFound } from "@tanstack/react-router";
import { z } from "zod";
import { ReliquaryError } from "./errors";
import { artifactCreateSchema, artifactPatchSchema, collectionCreateSchema } from "./schema";

function rethrow(err: unknown): never {
  if (err instanceof ReliquaryError && err.code === "NOT_FOUND") {
    throw notFound();
  }
  throw err;
}

export const getLibrary = createServerFn({ method: "GET" }).handler(async () => {
  const { getLibrary: load } = await import("./store.server");
  return load();
});

export const getArtifact = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().min(1) }))
  .handler(async ({ data }) => {
    try {
      const { getArtifact: load } = await import("./store.server");
      return await load(data.slug);
    } catch (err) {
      rethrow(err);
    }
  });

export const getCollectionPage = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().min(1) }))
  .handler(async ({ data }) => {
    try {
      const store = await import("./store.server");
      const collection = await store.getCollection(data.slug);
      const library = await store.getLibrary();
      return { collection, library };
    } catch (err) {
      rethrow(err);
    }
  });

export const createArtifactFn = createServerFn({ method: "POST" })
  .validator(artifactCreateSchema)
  .handler(async ({ data }) => {
    const { createArtifact } = await import("./store.server");
    return createArtifact(data);
  });

export const updateArtifactFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      slug: z.string().min(1),
      patch: artifactPatchSchema,
    }),
  )
  .handler(async ({ data }) => {
    try {
      const { updateArtifact } = await import("./store.server");
      return await updateArtifact(data.slug, data.patch);
    } catch (err) {
      rethrow(err);
    }
  });

export const deleteArtifactFn = createServerFn({ method: "POST" })
  .validator(z.object({ slug: z.string().min(1) }))
  .handler(async ({ data }) => {
    try {
      const { deleteArtifact } = await import("./store.server");
      return await deleteArtifact(data.slug);
    } catch (err) {
      rethrow(err);
    }
  });

export const createCollectionFn = createServerFn({ method: "POST" })
  .validator(collectionCreateSchema)
  .handler(async ({ data }) => {
    const { createCollection } = await import("./store.server");
    return createCollection(data);
  });

export const deleteCollectionFn = createServerFn({ method: "POST" })
  .validator(z.object({ slug: z.string().min(1) }))
  .handler(async ({ data }) => {
    try {
      const { deleteCollection } = await import("./store.server");
      return await deleteCollection(data.slug);
    } catch (err) {
      rethrow(err);
    }
  });
