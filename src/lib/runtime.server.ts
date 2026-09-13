/**
 * Server-only runtime helpers. Cloudflare Workers only populate `process.env`
 * (from wrangler vars/secrets) during a request — never read DATABASE_URL at
 * module load, or the Worker would fall through to PGLite.
 */

/** Read an env var, treating empty/whitespace as unset. */
export function readEnv(key: string): string | undefined {
  if (typeof process === "undefined") return undefined;
  const value = process.env[key]?.trim();
  return value ? value : undefined;
}

/** True inside the Cloudflare Workers runtime (workerd). */
export function isCloudflareWorker(): boolean {
  return (
    typeof navigator !== "undefined" &&
    navigator.userAgent === "Cloudflare-Workers"
  );
}

export function readDatabaseUrl(): string | undefined {
  return readEnv("DATABASE_URL");
}
