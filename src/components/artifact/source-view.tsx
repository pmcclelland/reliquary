import { useCallback, useEffect, useRef, useState } from "react";
import { Group, Panel, Separator as ResizeSeparator } from "react-resizable-panels";
import {
  ensureExplainer,
  parseLineRange,
  type LineRange,
} from "@/lib/reliquary/explainer";
import { cn } from "@/lib/utils";
import { ArtifactFrame } from "./frame";

export function SourceView({
  html,
  explainerHtml,
  title,
}: {
  html: string;
  explainerHtml: string;
  title: string;
}) {
  const [range, setRange] = useState<LineRange | null>(null);
  const notes = explainerHtml.trim();
  const hasExplainer = Boolean(notes);
  const explainerDoc = hasExplainer
    ? ensureExplainer(notes, `${title} — notes`)
    : "";

  const onLineRef = useCallback((raw: string) => {
    setRange(parseLineRange(raw));
  }, []);

  if (!hasExplainer) {
    return <SourceListing html={html} highlight={range} />;
  }

  return (
    <div className="h-full min-h-0">
      <div className="grid h-full min-h-0 grid-rows-2 md:hidden">
        <SourceListing html={html} highlight={range} />
        <div className="min-h-0 border-t border-border">
          <ArtifactFrame
            html={explainerDoc}
            title={`${title} notes`}
            onLineRef={onLineRef}
          />
        </div>
      </div>
      <div className="hidden h-full min-h-0 md:block">
        <Group orientation="horizontal" className="h-full">
          <Panel id="source" defaultSize="58%" minSize="28%" className="min-h-0">
            <SourceListing html={html} highlight={range} />
          </Panel>
          <ResizeSeparator className="w-1 bg-border hover:bg-border-strong" />
          <Panel
            id="explainer"
            defaultSize="42%"
            minSize="22%"
            className="min-h-0"
          >
            <ArtifactFrame
              html={explainerDoc}
              title={`${title} notes`}
              onLineRef={onLineRef}
            />
          </Panel>
        </Group>
      </div>
    </div>
  );
}

function SourceListing({
  html,
  highlight,
}: {
  html: string;
  highlight: LineRange | null;
}) {
  const lines = html.split("\n");
  const startRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    startRef.current?.scrollIntoView({ block: "center" });
  }, [highlight?.start, highlight?.end]);

  return (
    <pre className="h-full overflow-auto p-4 font-mono text-[12px] leading-relaxed text-fg">
      <code>
        {lines.map((line, index) => {
          const n = index + 1;
          const on =
            highlight !== null && n >= highlight.start && n <= highlight.end;
          return (
            <div
              key={n}
              id={`L${n}`}
              ref={n === highlight?.start ? startRef : undefined}
              className={cn(
                "flex gap-3",
                on && "bg-accent/15 text-fg",
              )}
            >
              <span className="w-10 shrink-0 select-none text-right text-subtle tabular-nums">
                {n}
              </span>
              <span className="min-w-0 whitespace-pre-wrap break-all">
                {line || " "}
              </span>
            </div>
          );
        })}
      </code>
    </pre>
  );
}
