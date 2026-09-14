/**
 * Self-hosted Better Auth for THIS app (server-only).
 *
 * Pre-wired for live preview + deploy — do not rewrite this file. To enable
 * local email/password, flip the flag in `./email-password` only (see auth skill).
 *
 * The app runs its own Better Auth at `/api/auth/*`, so the session cookie stays
 * on this app's own origin. Sign-in federates to the shared **Grok auth broker**
 * (`GROK_AUTH_ISSUER`) via the `genericOAuth` plugin — the broker brokers the
 * upstream sign-in methods (Google, X, …) and holds their shared secrets; this
 * app only holds its own client id/secret and names the upstream it wants via
 * each provider's `idp` hint.
 *
 * Tri-mode:
 *   - Deployed: the deployer injects a per-app `GROK_AUTH_*` + `BETTER_AUTH_URL`
 *     + `DATABASE_URL`, so real federated auth is persisted in Postgres.
 *   - Sandbox live preview: no injection -> falls back to the shared **preview
 *     client** (`./preview`) and derives the preview's `https://*.grok-sandbox.com`
 *     origin from the request, so real sign-in works (no demo users). Sessions
 *     and identities persist in the embedded PGLite DB (same DB as app data);
 *     the process restart wipes both. Live-preview iframe clients use a bearer
 *     token (partitioned cookies) — see `client.ts`.
 *   - Off (`VITE_AUTH_ENABLED=false`, the shipped default): no providers;
 *     `requireUserId` resolves a dev user with no database configured, and
 *     throws fail-closed once `DATABASE_URL` is set (see `verify.server.ts`).
 *
 * NEVER import this from client code — it pulls in the DB driver + the preview
 * secret + server-only Better Auth internals. The client uses `@/lib/auth/client`;
 * components read the user via `@/lib/auth/use-current-user`; server functions get
 * a verified id via `@/lib/auth/middleware`.
 */
import { betterAuth } from "better-auth";
import { bearer, genericOAuth } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { getCookie, getRequest } from "@tanstack/react-start/server";
import { randomBytes } from "node:crypto";
import { neonConfig, Pool } from "@neondatabase/serverless";
import { ensureDbReady, getPglite } from "../db";
import { isCloudflareWorker, readEnv } from "../runtime.server";
import { emailAndPasswordEnabled } from "./email-password";
import { GATE_PROVIDER_ID, gateIdentitySessions } from "./gate-session.server";
import { GROK_PROVIDERS } from "./providers";
import { pgliteDialect } from "./pglite-dialect";
import {
  GROK_ISSUER_DEFAULT,
  PREVIEW_ALLOWED_HOSTS,
  PREVIEW_CLIENT_ID,
  PREVIEW_CLIENT_SECRET,
} from "./preview";

// Kick (and share) PGLite bootstrap as soon as the auth server module loads.
void ensureDbReady();

/**
 * Preview secret must outlive module reloads: PGLite (and its session rows) is
 * stored on `globalThis`, so an HMR re-eval of this file must NOT mint a new
 * signing secret or every existing session becomes invalid mid-dev. Process
 * restart clears both the secret and PGLite together.
 */
const globalAuthRef = globalThis as typeof globalThis & {
  __grokAuthPreviewSecret__?: string;
};
function previewAuthSecret(): string {
  globalAuthRef.__grokAuthPreviewSecret__ ??= randomBytes(32).toString("hex");
  return globalAuthRef.__grokAuthPreviewSecret__;
}

const env = readEnv;

if (typeof WebSocket !== "undefined") {
  neonConfig.webSocketConstructor = WebSocket;
}
// Pool.query over HTTP fetch so Better Auth does not hold a WebSocket across
// Worker requests (Neon forbids that). Transactions still upgrade to WebSockets.
neonConfig.poolQueryViaFetch = true;

/** True when federated / local sign-in is active (real auth is enforced). */
export function isAuthConfigured(): boolean {
  const authDisabled = env("VITE_AUTH_ENABLED") === "false";
  const grokClientId = env("GROK_AUTH_CLIENT_ID") ?? PREVIEW_CLIENT_ID;
  const grokClientSecret = env("GROK_AUTH_CLIENT_SECRET") ?? PREVIEW_CLIENT_SECRET;
  return !authDisabled && Boolean(grokClientId && grokClientSecret);
}

// Local `npm run dev` (port 8080 contract). Browsers may send Origin as any of
// these for the same server — trusting only `localhost` rejects `127.0.0.1` and
// breaks email/password with "Invalid origin".
const LOCAL_DEV_ORIGINS: string[] = [
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "http://[::1]:8080",
];
const PRODUCTION_HOST = "reliquary.pmcclel.land";
const WORKERS_DEV_HOST = "reliquary.pmcclelland.workers.dev";
const WORKERS_DEV_PREVIEW_HOST = "*.pmcclelland.workers.dev";

const PUBLIC_ORIGINS: string[] = [
  `https://${PRODUCTION_HOST}`,
  `https://${WORKERS_DEV_HOST}`,
  `https://${WORKERS_DEV_PREVIEW_HOST}`,
  "https://*.workers.dev",
  "https://reliquary-cyan.vercel.app",
  "https://*.vercel.app",
];

/** Session token cookie name — also read by the live-preview popup completion page. */
export const SESSION_TOKEN_COOKIE = "__Host-grok-auth.session_token";

function createAuth() {
  // Explicit off-switch. The deployer sets `VITE_AUTH_ENABLED=true` when it
  // provisions auth; set it to "false" to force auth off everywhere (dev user).
  const grokIssuer = env("GROK_AUTH_ISSUER") ?? GROK_ISSUER_DEFAULT;
  const grokClientId = env("GROK_AUTH_CLIENT_ID") ?? PREVIEW_CLIENT_ID;
  const grokClientSecret = env("GROK_AUTH_CLIENT_SECRET") ?? PREVIEW_CLIENT_SECRET;
  const authConfigured = isAuthConfigured();

  // Derive origin from the request host so Google `redirect_uri` matches
  // production, workers.dev, or a PR preview (`pr-N-reliquary.pmcclelland.workers.dev`).
  const explicitBaseURL = env("BETTER_AUTH_URL");
  const previewAllowedHosts: string[] = [...PREVIEW_ALLOWED_HOSTS];
  const googleClientId = env("GOOGLE_CLIENT_ID");
  const googleClientSecret = env("GOOGLE_CLIENT_SECRET");
  const googleEnabled = Boolean(googleClientId && googleClientSecret);
  const baseURL = {
    allowedHosts: [
      PRODUCTION_HOST,
      WORKERS_DEV_HOST,
      WORKERS_DEV_PREVIEW_HOST,
      ...previewAllowedHosts,
      "localhost",
      "127.0.0.1",
      "[::1]",
    ],
    protocol: "auto" as const,
    fallback: explicitBaseURL ?? `https://${PRODUCTION_HOST}`,
  };

  const trustedOrigins: string[] = [
    ...previewAllowedHosts,
    ...previewAllowedHosts.flatMap((host) => [`https://${host}`, `http://${host}`]),
    ...LOCAL_DEV_ORIGINS,
    ...PUBLIC_ORIGINS,
  ];

  const databaseUrl = env("DATABASE_URL");

  // Static broker OAuth endpoints (skip OIDC discovery on every sign-in / callback).
  const issuerBase = grokIssuer.replace(/\/+$/, "");
  const grokAuthorizationUrl = `${issuerBase}/api/auth/oauth2/authorize`;
  const grokTokenUrl = `${issuerBase}/api/auth/oauth2/token`;
  const grokUserInfoUrl = `${issuerBase}/api/auth/oauth2/userinfo`;

  // Real Postgres when `DATABASE_URL` is set (deployed apps), else the app's
  // embedded PGLite (preview) via a Kysely dialect — so Better Auth persists to the
  // SAME DB as app data, including email/password users.
  const database = databaseUrl
    ? new Pool({
        connectionString: databaseUrl,
        // Workers: one connection per request. Neon WebSockets cannot be
        // reused across isolates/requests (that 1101s after OAuth).
        max: isCloudflareWorker() ? 1 : 5,
      })
    : { dialect: pgliteDialect(() => getPglite()), type: "postgres" as const };

  const grokOAuthPlugin = authConfigured
    ? genericOAuth({
        config: GROK_PROVIDERS.map(({ providerId, idp }) => ({
          providerId,
          clientId: grokClientId as string,
          clientSecret: grokClientSecret as string,
          authorizationUrl: grokAuthorizationUrl,
          tokenUrl: grokTokenUrl,
          userInfoUrl: grokUserInfoUrl,
          scopes: ["openid", "profile", "email"],
          authorizationUrlParams: { idp, prompt: "login" },
        })),
      })
    : null;

  return betterAuth({
    baseURL,
    secret: env("BETTER_AUTH_SECRET") ?? previewAuthSecret(),
    database,
    trustedOrigins,
    account: {
      encryptOAuthTokens: true,
      accountLinking: {
        enabled: true,
        trustedProviders: [
          ...GROK_PROVIDERS.map((p) => p.providerId),
          GATE_PROVIDER_ID,
          ...(googleEnabled ? ["google"] : []),
        ],
        requireLocalEmailVerified: false,
      },
    },
    session: { cookieCache: { enabled: true, maxAge: 300 } },
    ...(emailAndPasswordEnabled ? { emailAndPassword: { enabled: true } } : {}),
    ...(googleEnabled
      ? {
          socialProviders: {
            google: {
              clientId: googleClientId as string,
              clientSecret: googleClientSecret as string,
              prompt: "select_account",
            },
          },
        }
      : {}),
    advanced: {
      useSecureCookies: false,
      defaultCookieAttributes: { secure: true, sameSite: "lax", path: "/" },
      cookies: {
        session_token: { name: SESSION_TOKEN_COOKIE },
        session_data: { name: "__Host-grok-auth.session_data" },
        account_data: { name: "__Host-grok-auth.account_data" },
        dont_remember: { name: "__Host-grok-auth.dont_remember" },
      },
    },
    plugins: [
      gateIdentitySessions(),
      ...(grokOAuthPlugin ? [grokOAuthPlugin] : []),
      bearer(),
      tanstackStartCookies(),
    ],
  });
}

type ReliquaryAuth = ReturnType<typeof createAuth>;

const globalAuthInstance = globalThis as typeof globalThis & {
  __reliquaryAuth__?: ReliquaryAuth;
};

const authByRequest = new WeakMap<Request, ReliquaryAuth>();

function getAuth(): ReliquaryAuth {
  // Neon forbids holding a WebSocket Pool across Worker requests. Scope Better
  // Auth (and its Pool) to the current request when we can see it.
  const request = getRequest();
  if (request) {
    const cached = authByRequest.get(request);
    if (cached) return cached;
    const created = createAuth();
    authByRequest.set(request, created);
    return created;
  }
  if (isCloudflareWorker()) return createAuth();
  globalAuthInstance.__reliquaryAuth__ ??= createAuth();
  return globalAuthInstance.__reliquaryAuth__;
}

// Lazy: Cloudflare only exposes secrets during a request, so Better Auth cannot
// be constructed at module load.
export const auth: ReliquaryAuth = new Proxy({} as ReliquaryAuth, {
  get(_target, prop) {
    if (prop === "then") return undefined;
    const instance = getAuth();
    const value = Reflect.get(instance, prop, instance) as unknown;
    return typeof value === "function"
      ? (value as (...args: unknown[]) => unknown).bind(instance)
      : value;
  },
});

export function readSessionToken(): string | null {
  return getCookie(SESSION_TOKEN_COOKIE) ?? null;
}

// Re-exported for convenience; the array lives in the dependency-free
// `providers.ts` so the client can import it too.
export { GROK_PROVIDERS } from "./providers";
