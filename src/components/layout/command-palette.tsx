import { useRouter } from "@tanstack/react-router";
import { Command } from "cmdk";
import { FileCode2, Folder, Monitor, Moon, Plus, Sun } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useTheme, type ThemePreference } from "@/lib/theme";
import type { Library } from "@/lib/reliquary/types";

export function CommandPalette({ library }: { library: Library }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { setTheme } = useTheme();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function go(path: string) {
    setOpen(false);
    router.history.push(path);
  }

  function appearance(next: ThemePreference) {
    setTheme(next);
    setOpen(false);
  }

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Search Reliquary"
      className="fixed top-[18%] left-1/2 z-50 w-[min(32rem,calc(100%-1.5rem))] -translate-x-1/2 overflow-hidden rounded-xl bg-surface shadow-border"
    >
      <Command.Input
        placeholder="Search artifacts and collections"
        className="h-12 w-full border-b border-border bg-transparent px-4 text-sm outline-none placeholder:text-subtle"
      />
      <Command.List className="max-h-80 overflow-y-auto p-1">
        <Command.Empty className="px-3 py-8 text-center text-sm text-muted">
          Nothing matches.
        </Command.Empty>
        <Command.Group
          heading="Actions"
          className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:tracking-[0.14em] [&_[cmdk-group-heading]]:text-subtle [&_[cmdk-group-heading]]:uppercase"
        >
          <Item onSelect={() => go(library.guest ? "/login" : "/new")}>
            <Plus className="size-3.5" />
            {library.guest ? "Sign in to save" : "New artifact"}
          </Item>
          <Item onSelect={() => go("/docs")}>
            <FileCode2 className="size-3.5" /> API & MCP
          </Item>
        </Command.Group>
        <Command.Group
          heading="Appearance"
          className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:tracking-[0.14em] [&_[cmdk-group-heading]]:text-subtle [&_[cmdk-group-heading]]:uppercase"
        >
          <Item onSelect={() => appearance("light")}>
            <Sun className="size-3.5" /> Light
          </Item>
          <Item onSelect={() => appearance("dark")}>
            <Moon className="size-3.5" /> Dark
          </Item>
          <Item onSelect={() => appearance("system")}>
            <Monitor className="size-3.5" /> System
          </Item>
        </Command.Group>
        <Command.Group
          heading="Artifacts"
          className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:tracking-[0.14em] [&_[cmdk-group-heading]]:text-subtle [&_[cmdk-group-heading]]:uppercase"
        >
          {library.artifacts.map((a) => (
            <Item key={a.id} onSelect={() => go(`/a/${a.slug}`)}>
              <FileCode2 className="size-3.5" />
              <span className="truncate">{a.title}</span>
            </Item>
          ))}
        </Command.Group>
        <Command.Group
          heading="Collections"
          className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:tracking-[0.14em] [&_[cmdk-group-heading]]:text-subtle [&_[cmdk-group-heading]]:uppercase"
        >
          {library.collections.map((c) => (
            <Item key={c.id} onSelect={() => go(`/c/${c.slug}`)}>
              <Folder className="size-3.5" />
              <span className="truncate">{c.title}</span>
            </Item>
          ))}
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}

function Item({
  children,
  onSelect,
}: {
  children: ReactNode;
  onSelect: () => void;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm data-[selected=true]:bg-surface-muted"
    >
      {children}
    </Command.Item>
  );
}
