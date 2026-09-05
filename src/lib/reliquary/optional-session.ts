import { createMiddleware } from "@tanstack/react-start";

/**
 * Same bearer/cookie resolution as `authMiddleware`, but signed-out callers
 * get `userId: null` instead of a 401. Browse loaders use this so guests can
 * see the seeded demo library. Mutations stay on `authMiddleware`.
 */
export const optionalSessionMiddleware = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    const { getBearerToken } = await import("@/lib/auth/client");
    return next({ sendContext: { bearerToken: getBearerToken() ?? undefined } });
  })
  .server(async ({ next, context }) => {
    const { assertSameSiteRequest } = await import(
      "@/lib/auth/isolation.server"
    );
    const { getSessionUser } = await import("@/lib/auth/verify.server");
    assertSameSiteRequest();
    const user = await getSessionUser(context.bearerToken);
    return next({ context: { userId: user?.id ?? null } });
  });
