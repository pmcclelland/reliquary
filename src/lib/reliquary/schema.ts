import { z } from "zod";
import { MAX_DESCRIPTION, MAX_HTML_BYTES, MAX_TAGS, MAX_TITLE } from "./constants";

export const tagsSchema = z
  .array(z.string().trim().min(1).max(32))
  .max(MAX_TAGS)
  .optional();

export const artifactCreateSchema = z.object({
  title: z.string().trim().min(1).max(MAX_TITLE),
  html: z.string().min(1).max(MAX_HTML_BYTES),
  description: z.string().max(MAX_DESCRIPTION).optional().default(""),
  collectionId: z.string().nullable().optional(),
  collection: z.string().nullable().optional(),
  tags: tagsSchema,
  slug: z.string().trim().max(80).optional(),
});

export const artifactPatchSchema = z.object({
  title: z.string().trim().min(1).max(MAX_TITLE).optional(),
  html: z.string().min(1).max(MAX_HTML_BYTES).optional(),
  description: z.string().max(MAX_DESCRIPTION).optional(),
  collectionId: z.string().nullable().optional(),
  collection: z.string().nullable().optional(),
  tags: tagsSchema,
  slug: z.string().trim().max(80).optional(),
});

export const collectionCreateSchema = z.object({
  title: z.string().trim().min(1).max(MAX_TITLE),
  description: z.string().max(MAX_DESCRIPTION).optional().default(""),
  slug: z.string().trim().max(80).optional(),
});

export const collectionPatchSchema = z.object({
  title: z.string().trim().min(1).max(MAX_TITLE).optional(),
  description: z.string().max(MAX_DESCRIPTION).optional(),
  slug: z.string().trim().max(80).optional(),
});

export const listQuerySchema = z.object({
  collection: z.string().optional(),
  tag: z.string().optional(),
  q: z.string().optional(),
});
