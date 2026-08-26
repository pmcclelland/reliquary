import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function TooltipProvider({
  children,
  delayDuration = 250,
}: {
  children: ReactNode;
  delayDuration?: number;
}) {
  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      {children}
    </TooltipPrimitive.Provider>
  );
}

export function Tooltip({
  content,
  children,
  side = "bottom",
}: {
  content: ReactNode;
  children: ReactNode;
  side?: ComponentProps<typeof TooltipPrimitive.Content>["side"];
}) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={6}
          className={cn(
            "z-50 rounded-sm bg-fg px-2 py-1 text-xs text-bg",
          )}
        >
          {content}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
