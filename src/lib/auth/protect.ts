import { redirect } from "@tanstack/react-router";

export type SessionUser = { id: string; email: string | null };

export function requireSession(context: { sessionUser?: SessionUser | null }) {
  if (!context.sessionUser) {
    throw redirect({ to: "/login" });
  }
  return context.sessionUser;
}

export function redirectIfSignedIn(context: { sessionUser?: SessionUser | null }) {
  if (context.sessionUser) {
    throw redirect({ to: "/" });
  }
}
