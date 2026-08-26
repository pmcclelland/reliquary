import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState, type ReactNode } from "react";
import type { Library } from "@/lib/reliquary/types";
import { Button } from "@/components/ui/button";
import { CommandPalette } from "./command-palette";
import { Wordmark } from "./logo";
import { Sidebar } from "./sidebar";
import { ThemeToggle } from "./theme-toggle";

export function AppShell({
  library,
  activeSlug,
  collectionSlug,
  children,
}: {
  library: Library;
  activeSlug?: string;
  collectionSlug?: string;
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-dvh bg-bg text-fg">
      <aside className="hidden h-full w-64 shrink-0 border-r border-border bg-surface md:flex md:flex-col">
        <Sidebar
          library={library}
          activeSlug={activeSlug}
          collectionSlug={collectionSlug}
        />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-scrim"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative h-full w-72 max-w-[85vw] bg-surface shadow-border">
            <Sidebar
              library={library}
              activeSlug={activeSlug}
              collectionSlug={collectionSlug}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      <div className="reliquary-stage flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
        <header className="relative grid h-14 shrink-0 grid-cols-[minmax(2.5rem,1fr)_auto_minmax(2.5rem,1fr)] items-center border-b border-border bg-surface px-3 md:hidden">
          <div className="flex items-center justify-start">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="size-5" />
            </Button>
          </div>
          <Link
            to="/"
            className="flex items-center justify-center leading-none whitespace-nowrap text-fg"
          >
            <Wordmark
              className="shrink-0 gap-2 text-base [translate:0_0.14cap]"
              markClassName="size-6"
            />
          </Link>
          <div className="flex items-center justify-end">
            <ThemeToggle />
          </div>
        </header>
        {children}
      </div>
      <CommandPalette library={library} />
    </div>
  );
}
