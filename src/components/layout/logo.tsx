import { APP_NAME } from "@/lib/reliquary/constants";
import { cn } from "@/lib/utils";

export function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("block size-7 shrink-0", className)}
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

export function Wordmark({
  className,
  markClassName,
}: {
  className?: string;
  markClassName?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 font-serif text-lg leading-none tracking-tight",
        className,
      )}
    >
      <Mark className={markClassName} />
      <span className="reliquary-wordmark-name">{APP_NAME}</span>
    </span>
  );
}
