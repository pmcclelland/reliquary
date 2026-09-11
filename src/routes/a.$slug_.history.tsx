import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

/**
 * History is an on-demand pullout on the artifact page, not its own surface.
 * This path only forwards old / bookmarked URLs: `/a/:slug/history` and
 * `?rev=` become `/a/:slug?history=open` (or the revision id).
 */
export const Route = createFileRoute("/a/$slug_/history")({
  validateSearch: z.object({
    rev: z.string().optional(),
  }),
  beforeLoad: ({ params, search }) => {
    throw redirect({
      to: "/a/$slug",
      params: { slug: params.slug },
      search: { history: search.rev ?? "open" },
    });
  },
});
