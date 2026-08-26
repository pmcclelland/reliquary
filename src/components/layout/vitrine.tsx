import { cn } from "@/lib/utils";

export function Vitrine({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 148"
      className={cn("text-fg", className)}
      aria-hidden="true"
    >
      <rect
        x="18"
        y="6"
        width="44"
        height="118"
        rx="3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <rect
        x="24"
        y="14"
        width="32"
        height="102"
        rx="2"
        fill="currentColor"
        opacity="0.04"
      />
      <rect
        x="24"
        y="14"
        width="32"
        height="102"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
        opacity="0.45"
      />
      <path
        d="M24 96h32"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.28"
      />
      <circle
        className="reliquary-orb"
        cx="40"
        cy="78"
        r="7.2"
        fill="currentColor"
      />
      <rect
        x="14"
        y="126"
        width="52"
        height="6"
        rx="1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <rect
        x="22"
        y="134"
        width="36"
        height="5"
        rx="1.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
        opacity="0.55"
      />
    </svg>
  );
}
