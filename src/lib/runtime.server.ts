/**
 * Server-only runtime helpers. Cloudflare Workers only populate `process.env`
 * (from wrangler vars/secrets) during a request — never read DATABASE_URL at
 * module load, or the Worker would fall through to PGLite.
 */

/** Read an env var, treating empty/whitespace as unset. */
export function readEnv(key: string): string | undefined {
  const fromProcess =
    typeof process !== "undefined" ? process.env[key]?.trim() : undefined;
  if (fromProcess) return fromProcess;
  // Nitro's Cloudflare preset assigns the Worker env (including wrangler
  // secrets) here on every request. process.env only sees wrangler `vars`.
  const cfEnv = (globalThis as typeof globalThis & {
    __env__?: Record<string, unknown>;
  }).__env__;
  const raw = cfEnv?.[key];
  if (typeof raw !== "string") return undefined;
  const value = raw.trim();
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
