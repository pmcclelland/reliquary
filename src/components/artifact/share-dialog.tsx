import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { copyText } from "@/lib/utils";

export function ShareLinkDialog({
  open,
  onOpenChange,
  url,
  title,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  title: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

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
      onOpenChange(false);
      return;
    }
    inputRef.current?.focus();
    inputRef.current?.select();
    toast.message("Select the link and copy it");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          inputRef.current?.focus();
          inputRef.current?.select();
        }}
      >
        <DialogTitle>Share {title}</DialogTitle>
        <DialogDescription>
          Anyone with this link can view the live artifact.
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

      </DialogContent>
    </Dialog>
  );
}
