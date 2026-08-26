import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import type { ArtifactSummary } from "@/lib/reliquary/types";
import { formatRelative } from "@/lib/utils";

export function ArtifactCard({ artifact }: { artifact: ArtifactSummary }) {
  return (
    <Link
      to="/a/$slug"
      params={{ slug: artifact.slug }}
      className="group flex flex-col rounded-xl bg-surface p-4 shadow-border transition-[box-shadow,transform] duration-150 ease-out hover:shadow-border-hover"
    >
      <div className="flex items-center justify-between gap-2">
        <Badge>{artifact.kind === "react" ? "React" : "HTML"}</Badge>
        <span className="text-xs text-subtle tabular-nums">
          {formatRelative(artifact.updatedAt)}
        </span>
      </div>
      <h3 className="mt-3 font-serif text-xl leading-snug tracking-tight group-hover:text-accent">
        {artifact.title}
      </h3>
      {artifact.description ? (
        <p className="mt-1 line-clamp-2 text-sm text-muted">
          {artifact.description}
        </p>
      ) : null}
      {artifact.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {artifact.tags.map((tag) => (
            <span key={tag} className="text-xs text-subtle">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
