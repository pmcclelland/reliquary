import { ReliquaryError } from "./errors";
import { userIdFromMcpToken } from "./mcp-token.server";

function bearer(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (!scheme || !token) return null;
  if (scheme.toLowerCase() !== "bearer") return null;
  return token;
}

/** Session cookie or Reliquary MCP token (`rly_…`). */
export async function requireActor(request: Request): Promise<string> {
  const token = bearer(request);
  if (token?.startsWith("rly_")) {
    const userId = await userIdFromMcpToken(token);
    if (userId) return userId;
    throw new ReliquaryError("Unauthorized", 401, "UNAUTHORIZED");
  }

  const { getSessionUser } = await import("@/lib/auth/verify.server");
  const user = await getSessionUser(token ?? undefined);
  if (!user) throw new ReliquaryError("Unauthorized", 401, "UNAUTHORIZED");
  return user.id;
}
