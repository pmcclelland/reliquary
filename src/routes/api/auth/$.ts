import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@/lib/auth/server";

async function handleAuth(request: Request): Promise<Response> {
  try {
    return await auth.handler(request);
  } catch (err) {
    const message = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    console.error("[auth] handler failed", message, err instanceof Error ? err.stack : err);
    return new Response(
      [
        "Sign-in hit a server error after Google redirected back.",
        message,
        "The session was not created. Try /login again.",
      ].join("\n\n"),
      {
        status: 500,
        headers: { "content-type": "text/plain; charset=utf-8" },
      },
    );
  }
}

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => handleAuth(request),
      POST: ({ request }) => handleAuth(request),
    },
  },
});
