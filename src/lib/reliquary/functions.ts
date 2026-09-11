import { createServerFn } from "@tanstack/react-start";
import { notFound } from "@tanstack/react-router";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { ReliquaryError } from "./errors";
import { getGuestArtifact, getGuestCollection, getGuestLibrary } from "./guest";
import { optionalSessionMiddleware } from "./optional-session";
import { artifactCreateSchema, artifactPatchSchema, collectionCreateSchema } from "./schema";
import type {
  Artifact,
  ArtifactHistory,
  Collection,
  Library,
  SaveToLibraryResult,
  ShareView,
} from "./types";
import type { McpTokenMeta } from "./mcp-token.server";

type AuthOptions = { google: boolean; email: boolean };

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
  .middleware([optionalSessionMiddleware])
  .handler(async ({ context }): Promise<Library> => {
    if (!context.userId) return getGuestLibrary();
    const { getLibrary: load } = await import("./store.server");
    return load(context.userId);
  });

export const getArtifact = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().min(1) }))
  .middleware([optionalSessionMiddleware])
  .handler(async ({ context, data }): Promise<Artifact> => {
    try {
      if (!context.userId) {
        const artifact = getGuestArtifact(data.slug);
        if (!artifact) throw notFound();
        return artifact;
      }
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

export const getShareView = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().min(1) }))
  .middleware([optionalSessionMiddleware])
  .handler(async ({ context, data }): Promise<ShareView> => {
    try {
      const { getShareView: load } = await import("./store.server");
      return await load(context.userId, data.slug);
    } catch (err) {
      rethrow(err);
    }
  });

export const saveToLibraryFn = createServerFn({ method: "POST" })
  .validator(z.object({ slug: z.string().min(1) }))
  .middleware([authMiddleware])
  .handler(async ({ context, data }): Promise<SaveToLibraryResult> => {
    try {
      const { saveSharedArtifact } = await import("./store.server");
      return await saveSharedArtifact(context.userId, data.slug);
    } catch (err) {
      rethrow(err);
    }
  });

export const getCollectionPage = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().min(1) }))
  .middleware([optionalSessionMiddleware])
  .handler(async ({ context, data }) => {
    try {
      if (!context.userId) {
        const collection = getGuestCollection(data.slug);
        if (!collection) throw notFound();
        return { collection, library: getGuestLibrary() } as {
          collection: Collection;
          library: Library;
        };
      }
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

export const getArtifactHistoryFn = createServerFn({ method: "GET" })
  .validator(
    z.object({
      slug: z.string().min(1),
      revisionId: z.string().min(1).optional(),
    }),
  )
  .middleware([authMiddleware])
  .handler(async ({ context, data }): Promise<ArtifactHistory> => {
    try {
      const { getArtifactHistory } = await import("./store.server");
      return await getArtifactHistory(
        context.userId,
        data.slug,
        data.revisionId,
      );
    } catch (err) {
      rethrow(err);
    }
  });

export const restoreRevisionFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      slug: z.string().min(1),
      revisionId: z.string().min(1),
    }),
  )
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    try {
      const { restoreRevision } = await import("./store.server");
      return await restoreRevision(
        context.userId,
        data.slug,
        data.revisionId,
      );
    } catch (err) {
      rethrow(err);
    }
  });

export const setCollaboratorsEnabledFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      slug: z.string().min(1),
      enabled: z.boolean(),
    }),
  )
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    try {
      const { setCollaboratorsEnabled } = await import("./store.server");
      return await setCollaboratorsEnabled(
        context.userId,
        data.slug,
        data.enabled,
      );
    } catch (err) {
      rethrow(err);
    }
  });

export const addArtifactCollaboratorFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      slug: z.string().min(1),
      email: z.string().trim().min(1).max(320),
    }),
  )
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    try {
      const { addArtifactCollaborator } = await import("./store.server");
      return await addArtifactCollaborator(
        context.userId,
        data.slug,
        data.email,
      );
    } catch (err) {
      rethrow(err);
    }
  });

export const removeArtifactCollaboratorFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      slug: z.string().min(1),
      userId: z.string().min(1),
    }),
  )
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    try {
      const { removeArtifactCollaborator } = await import("./store.server");
      return await removeArtifactCollaborator(
        context.userId,
        data.slug,
        data.userId,
      );
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

export const listMcpTokensFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<McpTokenMeta[]> => {
    const { listMcpTokens } = await import("./mcp-token.server");
    return listMcpTokens(context.userId);
  });

export const createMcpTokenFn = createServerFn({ method: "POST" })
  .validator(z.object({ name: z.string().max(40) }))
  .middleware([authMiddleware])
  .handler(async ({ context, data }): Promise<McpTokenMeta> => {
    const { createMcpToken } = await import("./mcp-token.server");
    return createMcpToken(context.userId, data.name);
  });

export const rotateMcpTokenFn = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().min(1) }))
  .middleware([authMiddleware])
  .handler(async ({ context, data }): Promise<McpTokenMeta> => {
    const { rotateMcpToken } = await import("./mcp-token.server");
    return rotateMcpToken(context.userId, data.id);
  });

export const revokeMcpTokenFn = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().min(1) }))
  .middleware([authMiddleware])
  .handler(async ({ context, data }): Promise<void> => {
    const { revokeMcpToken } = await import("./mcp-token.server");
    await revokeMcpToken(context.userId, data.id);
  });
