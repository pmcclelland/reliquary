import { Link, useRouter } from "@tanstack/react-router";
import {
  BookOpen,
  FolderPlus,
  Library,
  LogIn,
  PanelLeft,
  PanelLeftClose,
  Plus,
} from "lucide-react";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tooltip } from "@/components/ui/tooltip";
import { createCollectionFn } from "@/lib/reliquary/functions";
import type { Library as LibraryData } from "@/lib/reliquary/types";
import { SIDEBAR_ID } from "@/lib/sidebar-preference";
import { cn } from "@/lib/utils";
import { UserButton } from "@/lib/auth/gates";
import { Mark, Wordmark } from "./logo";
import { ThemeToggle } from "./theme-toggle";

export function Sidebar({
  library,
  activeSlug,
  collectionSlug,
  collapsed = false,
  onToggleCollapsed,
  onNavigate,
}: {
  library: LibraryData;
  activeSlug?: string;
  collectionSlug?: string;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  const tags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const a of library.artifacts) {
      for (const tag of a.tags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);
  }, [library.artifacts]);

  async function onCreateCollection(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    try {
      const col = await createCollectionFn({
        data: { title: title.trim(), description: description.trim() },
      });
      setOpen(false);
      setTitle("");
      setDescription("");
      await router.invalidate({ sync: true });
      await router.navigate({
        to: "/c/$slug",
        params: { slug: col.slug },
      });
      onNavigate?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create collection");
    } finally {
      setBusy(false);
    }
  }

  const newLabel = library.guest ? "Sign in to save" : "New artifact";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        className={cn(
          "flex items-center",
          collapsed ? "flex-col gap-2 px-2 pt-4 pb-3" : "justify-between gap-2 pr-2 pl-4 pt-5 pb-4",
        )}
      >
        {collapsed && onToggleCollapsed ? (
          <CollapseButton collapsed={collapsed} onToggle={onToggleCollapsed} />
        ) : null}
        <Link
          to="/"
          onClick={onNavigate}
          className={cn("min-w-0", collapsed && "grid place-items-center")}
        >
          {collapsed ? (
            <>
              <Mark className="size-7" />
              <span className="sr-only">Reliquary</span>
            </>
          ) : (
            <Wordmark />
          )}
        </Link>
        {!collapsed && onToggleCollapsed ? (
          <CollapseButton collapsed={collapsed} onToggle={onToggleCollapsed} />
        ) : null}
      </div>
      <div className={cn("pb-3", collapsed ? "flex justify-center px-2" : "px-3")}>
        <RailTip label={newLabel} enabled={collapsed}>
          <Button
            asChild
            className={collapsed ? undefined : "w-full"}
            size={collapsed ? "icon" : "md"}
          >
            <Link to={library.guest ? "/login" : "/new"} onClick={onNavigate}>
              <Plus className="size-4" />
              <span className={collapsed ? "sr-only" : undefined}>{newLabel}</span>
            </Link>
          </Button>
        </RailTip>
      </div>
      <nav className={cn("min-h-0 flex-1 overflow-y-auto pb-6", collapsed ? "px-1.5" : "px-2")}>
        {collapsed ? null : (
          <p className="px-2 pt-2 pb-1 text-[11px] font-medium tracking-[0.16em] text-subtle uppercase">
            Library
          </p>
        )}
        <SideLink
          to="/"
          active={!activeSlug && !collectionSlug}
          onClick={onNavigate}
          collapsed={collapsed}
          tip="All artifacts"
        >
          <Library className="size-3.5" />
          <span className={collapsed ? "sr-only" : undefined}>All artifacts</span>
          {collapsed ? null : (
            <span className="ml-auto tabular-nums text-subtle">{library.artifacts.length}</span>
          )}
        </SideLink>
        {collapsed ? null : (
          <>
            <div className="mt-4 px-2 pb-1">
              <div className="relative text-[11px] font-medium tracking-[0.16em] text-subtle uppercase">
                Collections
                {library.guest ? null : (
                  <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="absolute top-1/2 right-0 flex size-6 -translate-y-1/2 items-center justify-center rounded-sm text-muted hover:bg-surface-muted hover:text-fg after:absolute after:-inset-1 after:content-['']"
                    aria-label="New collection"
                  >
                    <FolderPlus className="size-3.5" />
                  </button>
                )}
              </div>
            </div>
            {library.collections.map((col) => (
              <Link
                key={col.id}
                to="/c/$slug"
                params={{ slug: col.slug }}
                onClick={onNavigate}
                className={sideClass(collectionSlug === col.slug)}
              >
                <span className="min-w-0 truncate">{col.title}</span>
                <span className="ml-auto tabular-nums text-subtle">{col.count}</span>
              </Link>
            ))}
            {tags.length > 0 && (
              <>
                <p className="mt-4 px-2 pb-1 text-[11px] font-medium tracking-[0.16em] text-subtle uppercase">
                  Tags
                </p>
                <div className="flex flex-wrap gap-1 px-2 pt-1">
                  {tags.map(([tag, n]) => (
                    <Link
                      key={tag}
                      to="/"
                      search={{ tag }}
                      onClick={onNavigate}
                      className="rounded-sm bg-chip px-2 py-1 text-xs text-muted hover:text-fg"
                    >
                      {tag}
                      <span className="ml-1 tabular-nums text-subtle">{n}</span>
                    </Link>
                  ))}
                </div>
              </>
            )}
            <Separator className="my-4" />
          </>
        )}
        {collapsed ? (
          <SideLink to="/docs" active={false} onClick={onNavigate} collapsed tip="API & MCP">
            <BookOpen className="size-3.5" />
            <span className="sr-only">API & MCP</span>
          </SideLink>
        ) : (
          <Link to="/docs" onClick={onNavigate} className={sideClass(false)}>
            API & MCP
          </Link>
        )}
      </nav>

      <div
        className={cn(
          "shrink-0 space-y-1 border-t border-border py-2",
          collapsed ? "flex flex-col items-center px-1.5" : "px-2",
        )}
      >
        {library.guest ? (
          <RailTip label="Sign in" enabled={collapsed}>
            <Button
              asChild
              variant="secondary"
              className={collapsed ? undefined : "w-full"}
              size={collapsed ? "icon" : "md"}
            >
              <Link to="/login" onClick={onNavigate}>
                {collapsed ? <LogIn className="size-4" /> : null}
                <span className={collapsed ? "sr-only" : undefined}>Sign in</span>
              </Link>
            </Button>
          </RailTip>
        ) : (
          <RailTip label="Account" enabled={collapsed}>
            <div>
              <UserButton compact={collapsed} />
            </div>
          </RailTip>
        )}
        <ThemeToggle
          variant={collapsed ? "icon" : "row"}
          side={collapsed ? "right" : "top"}
          align={collapsed ? "center" : "start"}
        />
      </div>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            setTitle("");
            setDescription("");
          }
        }}
      >
        <DialogContent>
          <DialogTitle>New collection</DialogTitle>
          <DialogDescription>
            A shelf for related artifacts. You can move pieces later.
          </DialogDescription>
          <form className="mt-4 space-y-3" onSubmit={onCreateCollection}>
            <div className="space-y-2.5">
              <Label htmlFor="col-title">Title</Label>
              <Input
                id="col-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Motion studies"
                autoFocus
              />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="col-desc">Description</Label>
              <Input
                id="col-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Self-contained studies in animation and time."
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy || !title.trim()}>
                Create
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CollapseButton({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const label = collapsed ? "Expand sidebar" : "Collapse sidebar";
  const Icon = collapsed ? PanelLeft : PanelLeftClose;
  return (
    <RailTip label={label} enabled>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={label}
        aria-expanded={!collapsed}
        aria-controls={SIDEBAR_ID}
        className="text-muted hover:text-fg"
        onClick={onToggle}
      >
        <Icon className="size-4" />
      </Button>
    </RailTip>
  );
}

function RailTip({
  label,
  enabled,
  children,
}: {
  label: string;
  enabled: boolean;
  children: ReactNode;
}) {
  if (!enabled) return children;
  return (
    <Tooltip content={label} side="right">
      {children}
    </Tooltip>
  );
}

function SideLink({
  to,
  active,
  onClick,
  children,
  collapsed,
  tip,
}: {
  to: "/" | "/docs";
  active: boolean;
  onClick?: () => void;
  children: ReactNode;
  collapsed?: boolean;
  tip?: string;
}) {
  const link = (
    <Link to={to} onClick={onClick} className={sideClass(active, collapsed)}>
      {children}
    </Link>
  );
  if (!collapsed || !tip) return link;
  return (
    <Tooltip content={tip} side="right">
      {link}
    </Tooltip>
  );
}

function sideClass(active: boolean, collapsed = false) {
  return cn(
    "flex h-9 items-center gap-2 rounded-md px-2 text-sm",
    collapsed && "justify-center px-0",
    active ? "bg-surface-muted text-fg" : "text-muted hover:bg-surface-muted/70 hover:text-fg",
  );
}
