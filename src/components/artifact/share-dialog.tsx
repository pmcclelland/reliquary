import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ArtifactCollaboration } from "@/lib/reliquary/types";
import { cn, copyText } from "@/lib/utils";

export function ShareLinkDialog({
  open,
  onOpenChange,
  url,
  title,
  collaboration,
  onSetEnabled,
  onAddCollaborator,
  onRemoveCollaborator,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  title: string;
  collaboration?: ArtifactCollaboration | null;
  onSetEnabled?: (enabled: boolean) => Promise<void>;
  onAddCollaborator?: (email: string) => Promise<void>;
  onRemoveCollaborator?: (userId: string) => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const manage = Boolean(collaboration && onSetEnabled && onAddCollaborator && onRemoveCollaborator);

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
    return () => window.clearTimeout(id);
  }, [open, url]);

  async function onCopy() {
    const ok = await copyText(url);
    if (ok) {
      toast.success("Share link copied");
      if (!manage) onOpenChange(false);
      return;
    }
    inputRef.current?.focus();
    inputRef.current?.select();
    toast.message("Select the link and copy it");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          manage &&
            "max-h-[min(40rem,calc(100dvh-2rem))] overflow-y-auto",
        )}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          inputRef.current?.focus();
          inputRef.current?.select();
        }}
      >
        <DialogTitle>Share {title}</DialogTitle>
        <DialogDescription>
          Anyone with this link can view the live artifact.
          {manage
            ? " Editing stays with you, unless you add someone below."
            : null}
        </DialogDescription>
        <div className="mt-4 flex items-center gap-2">
          <Input
            ref={inputRef}
            readOnly
            value={url}
            aria-label="Share link"
            className="min-w-0 w-auto flex-1 font-mono text-xs"
            onFocus={(event) => event.currentTarget.select()}
          />
          <Button
            size="sm"
            type="button"
            className="shrink-0"
            onClick={() => void onCopy()}
          >
            Copy
          </Button>
        </div>
        {manage && collaboration && onSetEnabled && onAddCollaborator && onRemoveCollaborator ? (
          <CollaboratorsPanel
            collaboration={collaboration}
            onSetEnabled={onSetEnabled}
            onAdd={onAddCollaborator}
            onRemove={onRemoveCollaborator}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function CollaboratorsPanel({
  collaboration,
  onSetEnabled,
  onAdd,
  onRemove,
}: {
  collaboration: ArtifactCollaboration;
  onSetEnabled: (enabled: boolean) => Promise<void>;
  onAdd: (email: string) => Promise<void>;
  onRemove: (userId: string) => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    try {
      await action();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-5 border-t border-border pt-4">
      <p className="text-xs tracking-[0.14em] text-subtle uppercase">
        Collaborators
      </p>
      <p className="mt-1 text-sm text-muted">
        People you add can edit the original. A share link or a saved copy is
        not enough.
      </p>
      <div className="mt-3">
        <Button
          type="button"
          size="sm"
          variant={collaboration.enabled ? "default" : "secondary"}
          disabled={busy}
          aria-pressed={collaboration.enabled}
          onClick={() =>
            void run(() => onSetEnabled(!collaboration.enabled))
          }
        >
          {collaboration.enabled ? "Editing on" : "Editing off"}
        </Button>
      </div>
      <form
        className="mt-4"
        onSubmit={(event) => {
          event.preventDefault();
          const next = email.trim();
          if (!next) return;
          void run(async () => {
            await onAdd(next);
            setEmail("");
          });
        }}
      >
        <Label htmlFor="collaborator-email">Add by Reliquary email</Label>
        <div className="mt-1.5 flex items-center gap-2">
          <Input
            id="collaborator-email"
            type="email"
            autoComplete="off"
            placeholder="name@example.com"
            value={email}
            disabled={busy}
            onChange={(event) => setEmail(event.target.value)}
            className="min-w-0 flex-1"
          />
          <Button
            type="submit"
            size="sm"
            variant="secondary"
            className="shrink-0"
            disabled={busy || !email.trim()}
          >
            Add
          </Button>
        </div>
      </form>
      {collaboration.people.length === 0 ? (
        <p className="mt-3 text-xs text-subtle">No one added yet.</p>
      ) : (
        <ul className="mt-3 divide-y divide-border">
          {collaboration.people.map((person) => (
            <li
              key={person.userId}
              className="flex items-center justify-between gap-3 py-2"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm text-fg">
                  {person.name}
                </span>
                {person.email && person.email !== person.name ? (
                  <span className="block truncate text-xs text-subtle">
                    {person.email}
                  </span>
                ) : null}
              </span>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="shrink-0 text-muted"
                disabled={busy}
                onClick={() => void run(() => onRemove(person.userId))}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
