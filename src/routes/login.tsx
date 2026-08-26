import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Vitrine } from "@/components/layout/vitrine";
import { Wordmark } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { authClient, authEnabled, signInWithGoogle } from "@/lib/auth/client";
import { redirectIfSignedIn } from "@/lib/auth/protect";
import { getAuthOptions } from "@/lib/reliquary/functions";
import { APP_TAGLINE } from "@/lib/reliquary/constants";

export const Route = createFileRoute("/login")({
  beforeLoad: ({ context }) => redirectIfSignedIn(context),
  loader: () => getAuthOptions(),
  component: Login,
});

function Login() {
  const options = Route.useLoaderData();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [emailOpen, setEmailOpen] = useState(!options.google);

  async function onGoogle() {
    setBusy(true);
    try {
      await signInWithGoogle({
        callbackURL: "/",
        errorCallbackURL: "/login",
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
      setBusy(false);
    }
  }

  async function onEmail(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await authClient.signUp.email({
          email,
          password,
          name: name.trim() || email.split("@")[0] || "Member",
          callbackURL: "/",
        });
        if (error) throw new Error(error.message ?? "Could not create account");
      } else {
        const { error } = await authClient.signIn.email({
          email,
          password,
          callbackURL: "/",
        });
        if (error) throw new Error(error.message ?? "Could not sign in");
      }
      window.location.href = "/";
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not sign in");
      setBusy(false);
    }
  }

  const heading = mode === "signup" ? "Create a library" : "Open your library";

  return (
    <main className="login-stage relative min-h-dvh text-fg">
      <div className="absolute top-3 right-3 z-10 sm:top-4 sm:right-4">
        <ThemeToggle />
      </div>

      <div className="mx-auto grid min-h-dvh max-w-6xl md:grid-cols-2">
        <section className="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-surface px-12 py-16 lg:px-16 md:flex">
          <p className="reliquary-enter text-[11px] font-medium tracking-[0.18em] text-subtle uppercase">
            Reliquary
          </p>
          <div className="flex flex-1 items-center justify-center py-10">
            <Vitrine className="reliquary-enter-2 h-72 w-auto" />
          </div>
          <div className="reliquary-enter-3 max-w-md">
            <h1 className="font-serif text-4xl leading-tight tracking-tight lg:text-5xl">
              A place to keep things that move.
            </h1>
            <p className="mt-4 max-w-sm text-muted">
              Self-contained HTML — pages, studies, and small interfaces —
              filed like notes in a quiet archive.
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-16 sm:px-10">
          <div className="w-full max-w-sm">
            <div className="md:hidden">
              <Vitrine className="reliquary-enter mx-auto h-28 w-auto" />
            </div>
            <div className="reliquary-enter-2 mt-6 md:mt-0">
              <Wordmark className="text-2xl" markClassName="size-8" />
              <p className="mt-3 text-sm text-muted">{APP_TAGLINE}</p>
            </div>

            <h2 className="reliquary-enter-3 mt-10 font-serif text-3xl tracking-tight md:text-4xl">
              {heading}
            </h2>
            <p className="mt-2 text-sm text-muted">
              Each account is a private library, with its own MCP token.
            </p>

            {!authEnabled ? (
              <p className="mt-8 text-sm text-muted">Sign-in is disabled.</p>
            ) : (
              <div className="mt-8 space-y-4">
                {options.google ? (
                  <Button
                    type="button"
                    className="w-full"
                    size="lg"
                    disabled={busy}
                    onClick={() => void onGoogle()}
                  >
                    <GoogleMark />
                    Continue with Google
                  </Button>
                ) : null}

                {options.google ? (
                  <div className="flex items-center gap-3">
                    <Separator className="w-auto flex-1" />
                    <button
                      type="button"
                      className="shrink-0 py-2 text-sm text-muted hover:text-fg"
                      onClick={() => setEmailOpen((v) => !v)}
                    >
                      {emailOpen ? "Hide email" : "Use email"}
                    </button>
                    <Separator className="w-auto flex-1" />
                  </div>
                ) : null}

                {emailOpen && (
                  <form className="space-y-4" onSubmit={onEmail}>
                    {mode === "signup" && (
                      <div className="space-y-2.5">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Ada"
                          autoComplete="name"
                        />
                      </div>
                    )}
                    <div className="space-y-2.5">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        autoComplete="email"
                      />
                    </div>
                    <div className="space-y-2.5">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        required
                        minLength={8}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete={
                          mode === "signup" ? "new-password" : "current-password"
                        }
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={busy}
                      variant={options.google ? "secondary" : "default"}
                    >
                      {mode === "signup" ? "Create account" : "Sign in with email"}
                    </Button>
                    <button
                      type="button"
                      className="w-full py-1 text-center text-sm text-muted hover:text-fg"
                      onClick={() =>
                        setMode((m) => (m === "signin" ? "signup" : "signin"))
                      }
                    >
                      {mode === "signup"
                        ? "Already have an account? Sign in"
                        : "Need an account? Create one"}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
