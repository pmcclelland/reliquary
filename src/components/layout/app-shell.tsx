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
      <aside className="hidden h-full w-64 shrink-0 border-r border-border bg-bg md:flex md:flex-col">
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
          <aside className="relative h-full w-72 max-w-[85vw] bg-bg shadow-border">
            <Sidebar
              library={library}
              activeSlug={activeSlug}
              collectionSlug={collectionSlug}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
        <header className="flex h-14 items-center gap-2 border-b border-border px-3 md:hidden">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-5" />
          </Button>
          <Link to="/" className="text-fg">
            <Wordmark className="gap-2 text-base" markClassName="size-6" />
          </Link>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>
        {children}
      </div>
      <CommandPalette library={library} />
    </div>
  );
}
