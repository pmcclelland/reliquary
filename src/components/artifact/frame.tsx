import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ArtifactFrame({
  html,
  title,
  className,
}: {
  html: string;
  title: string;
  className?: string;
}) {
  const [src, setSrc] = useState<string>();

  useEffect(() => {
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [html]);

  if (!src) {
    return (
      <div
        className={cn("bg-surface-muted", className)}
        aria-hidden="true"
      />
    );
  }

  return (
    <iframe
      title={title}
      src={src}
      sandbox="allow-scripts allow-forms allow-modals allow-pointer-lock"
      referrerPolicy="no-referrer"
      className={cn("h-full w-full border-0 bg-surface", className)}
    />
  );
}
