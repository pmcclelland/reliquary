import { redirect } from "@tanstack/react-router";
import { safeReturnPath } from "@/lib/reliquary/save";

export type SessionUser = { id: string; email: string | null };

export function requireSession(context: { sessionUser?: SessionUser | null }) {
  if (!context.sessionUser) {
    throw redirect({ to: "/login" });
  }
  return context.sessionUser;
}

export function redirectIfSignedIn(
  context: { sessionUser?: SessionUser | null },
  next?: string,
) {
  if (context.sessionUser) {
    const dest = safeReturnPath(next);
    throw dest === "/" ? redirect({ to: "/" }) : redirect({ href: dest });
  }
}
