import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "h-10 w-full rounded-md bg-surface px-3 text-sm text-fg shadow-border",
          "placeholder:text-subtle",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70",
          "disabled:opacity-40",
          className,
        )}
        {...props}
      />
    );
  },
);
