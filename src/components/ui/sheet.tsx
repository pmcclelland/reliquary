import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const Sheet = DialogPrimitive.Root;
export const SheetClose = DialogPrimitive.Close;

export function SheetContent({
  className,
  children,
  size = "default",
  ...props
}: ComponentProps<typeof DialogPrimitive.Content> & {
  /** default: 28rem right sheet. wide: 96vw, capped at 100rem. */
  size?: "default" | "wide";
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-scrim" />
      <DialogPrimitive.Content
        className={cn(
          "fixed z-40 flex flex-col bg-surface shadow-border focus:outline-none",
          "inset-x-0 bottom-0 h-[min(90dvh,44rem)] rounded-t-xl",
          "sm:inset-y-0 sm:right-0 sm:left-auto sm:h-full sm:w-full sm:rounded-none sm:border-l sm:border-border",
          size === "wide" ? "sm:max-w-sheet-wide" : "sm:max-w-md",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className="absolute top-3 right-3 size-8 rounded-sm text-muted hover:bg-surface-muted hover:text-fg"
          aria-label="Close"
        >
          <X className="mx-auto size-4" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function SheetTitle({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn("font-serif text-xl font-medium tracking-tight", className)}
      {...props}
    />
  );
}

export function SheetDescription({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("mt-1 text-sm text-muted", className)}
      {...props}
    />
  );
}
