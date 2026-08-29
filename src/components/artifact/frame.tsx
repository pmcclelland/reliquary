import { useEffect, useState } from "react";
import { EXPLAINER_MESSAGE_SOURCE } from "@/lib/reliquary/explainer";
import { cn } from "@/lib/utils";

export function ArtifactFrame({
  html,
  title,
  className,
  onLineRef,
}: {
  html: string;
  title: string;
  className?: string;
  onLineRef?: (line: string) => void;
}) {
  const [src, setSrc] = useState<string>();

  useEffect(() => {
    const theme =
      typeof document !== "undefined"
        ? document.documentElement.dataset.theme
        : "";
    const themed = theme
      ? html.replace(/<html\b([^>]*)>/i, (_, attrs: string) => {
          const cleaned = attrs.replace(/\sdata-theme="[^"]*"/i, "");
          return `<html${cleaned} data-theme="${theme}">`;
        })
      : html;
    const blob = new Blob([themed], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [html]);

  useEffect(() => {
    if (!onLineRef) return;
    const notify = onLineRef;
    function onMessage(event: MessageEvent) {
      const data = event.data;
      if (!data || typeof data !== "object") return;
      if (data.source !== EXPLAINER_MESSAGE_SOURCE) return;
      notify(String(data.line ?? ""));
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [onLineRef]);

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
