import { createServerFn } from "@tanstack/react-start";
import { notFound } from "@tanstack/react-router";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { ReliquaryError } from "./errors";
import { artifactCreateSchema, artifactPatchSchema, collectionCreateSchema } from "./schema";
import type { Artifact, Collection, Library } from "./types";

type AuthOptions = { google: boolean; email: boolean };
type McpTokenMeta = {
  tokenPrefix: string;
  createdAt: string;
  token?: string;
};

function rethrow(err: unknown): never {
  if (err instanceof ReliquaryError && err.code === "NOT_FOUND") {
    throw notFound();
  }
  throw err;
}

export const getAuthOptions = createServerFn({ method: "GET" }).handler(
  async (): Promise<AuthOptions> => ({
    google: Boolean(
      process.env.GOOGLE_CLIENT_ID?.trim() &&
        process.env.GOOGLE_CLIENT_SECRET?.trim(),
    ),
    email: true,
  }),
);

export const getLibrary = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Library> => {
    const { getLibrary: load } = await import("./store.server");
    return load(context.userId);
  });

export const getArtifact = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().min(1) }))
  .middleware([authMiddleware])
  .handler(async ({ context, data }): Promise<Artifact> => {
    try {
      const { getArtifact: load } = await import("./store.server");
      return await load(context.userId, data.slug);
    } catch (err) {
      rethrow(err);
    }
  });

export const getPublicArtifact = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().min(1) }))
  .handler(async ({ data }): Promise<Artifact> => {
    try {
      const { getPublicArtifact: load } = await import("./store.server");
      return await load(data.slug);
    } catch (err) {
      rethrow(err);
    }
  });

export const getCollectionPage = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().min(1) }))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    try {
      const store = await import("./store.server");
      const collection = await store.getCollection(context.userId, data.slug);
      const library = await store.getLibrary(context.userId);
      return { collection, library } as {
        collection: Collection;
        library: Library;
      };
    } catch (err) {
      rethrow(err);
    }
  });

export const createArtifactFn = createServerFn({ method: "POST" })
  .validator(artifactCreateSchema)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { createArtifact } = await import("./store.server");
    return createArtifact(context.userId, data);
  });

export const updateArtifactFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      slug: z.string().min(1),
      patch: artifactPatchSchema,
    }),
  )
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    try {
      const { updateArtifact } = await import("./store.server");
      return await updateArtifact(context.userId, data.slug, data.patch);
    } catch (err) {
      rethrow(err);
    }
  });

export const deleteArtifactFn = createServerFn({ method: "POST" })
  .validator(z.object({ slug: z.string().min(1) }))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    try {
      const { deleteArtifact } = await import("./store.server");
      return await deleteArtifact(context.userId, data.slug);
    } catch (err) {
      rethrow(err);
    }
  });

export const createCollectionFn = createServerFn({ method: "POST" })
  .validator(collectionCreateSchema)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { createCollection } = await import("./store.server");
    return createCollection(context.userId, data);
  });

export const deleteCollectionFn = createServerFn({ method: "POST" })
  .validator(z.object({ slug: z.string().min(1) }))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    try {
      const { deleteCollection } = await import("./store.server");
      return await deleteCollection(context.userId, data.slug);
    } catch (err) {
      rethrow(err);
    }
  });

export const getMcpTokenFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<McpTokenMeta | null> => {
    const { getMcpTokenMeta } = await import("./mcp-token.server");
    return getMcpTokenMeta(context.userId);
  });

export const issueMcpTokenFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<McpTokenMeta> => {
    const { issueMcpToken } = await import("./mcp-token.server");
    return issueMcpToken(context.userId);
  });
