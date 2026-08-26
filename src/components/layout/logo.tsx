import { cn } from "@/lib/utils";

export function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-7", className)}
      aria-hidden="true"
    >
      <rect
        x="3.25"
        y="3.25"
        width="25.5"
        height="25.5"
        rx="4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="8.5"
        y="8.5"
        width="15"
        height="15"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        opacity="0.65"
      />
      <circle cx="16" cy="16" r="2.4" fill="currentColor" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5 text-fg", className)}>
      <Mark />
      <span className="font-serif text-lg tracking-tight">Reliquary</span>
    </span>
  );
}
