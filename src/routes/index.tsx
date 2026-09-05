import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ArtifactCard } from "@/components/artifact/card";
import { AppShell } from "@/components/layout/app-shell";
import { Input } from "@/components/ui/input";
import { getLibrary } from "@/lib/reliquary/functions";
import type { ArtifactSummary, Collection } from "@/lib/reliquary/types";

const searchSchema = z.object({
  q: z.string().optional(),
  tag: z.string().optional(),
});

export const Route = createFileRoute("/")({
  validateSearch: searchSchema,
  loader: async () => getLibrary(),
  component: Home,
});

function Home() {
  const library = Route.useLoaderData() as {
    collections: Collection[];
    artifacts: ArtifactSummary[];
  };
  const { q, tag } = Route.useSearch();
  const navigate = Route.useNavigate();

  const filtered = filterArtifacts(library.artifacts, q, tag);
  const grouped = groupByCollection(filtered, library.collections);
  const searching = Boolean(q?.trim() || tag);

  return (
    <AppShell library={library}>
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8 sm:py-12">
        <p className="reliquary-enter text-[11px] font-medium tracking-[0.18em] text-subtle uppercase">
          Library
        </p>
        <h1 className="reliquary-enter-2 mt-2 font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
          A wiki of living artifacts
        </h1>
        <p className="reliquary-enter-3 mt-3 max-w-xl text-muted">
          Self-contained HTML — pages, motion studies, and small interfaces —
          filed like notes in a quiet archive.
        </p>
        <div className="mt-8 max-w-md">
          <Input
            defaultValue={q ?? ""}
            placeholder="Search the shelves"
            onChange={(e) => {
              const value = e.target.value;
              void navigate({
                search: (prev: { q?: string; tag?: string }) => ({
                  ...prev,
                  q: value.trim() ? value : undefined,
                }),
                replace: true,
              });
            }}
            aria-label="Search artifacts"
          />
        </div>
        {tag && (
          <p className="mt-4 text-sm text-muted">
            Tagged{" "}
            <button
              type="button"
              className="underline decoration-border underline-offset-4"
              onClick={() =>
                void navigate({
                  search: (prev: { q?: string; tag?: string }) => ({
                    ...prev,
                    tag: undefined,
                  }),
                })
              }
            >
              #{tag}
            </button>
          </p>
        )}

        {filtered.length === 0 ? (
          <p className="mt-16 text-muted">
            Nothing filed here yet. Create an artifact, or ask an agent to
            publish through MCP.
          </p>
        ) : searching ? (
          <section className="mt-10 grid gap-3 sm:grid-cols-2">
            {filtered.map((a) => (
              <ArtifactCard key={a.id} artifact={a} />
            ))}
          </section>
        ) : (
          grouped.map((group) => (
            <section key={group.id} className="mt-12">
              <h2 className="font-serif text-2xl tracking-tight">{group.title}</h2>
              {group.description ? (
                <p className="mt-1 text-sm text-muted">{group.description}</p>
              ) : null}
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {group.artifacts.map((a) => (
                  <ArtifactCard key={a.id} artifact={a} />
                ))}
              </div>
            </section>
          ))
        )}
      </main>
    </AppShell>
  );
}

function filterArtifacts(
  artifacts: ArtifactSummary[],
  q?: string,
  tag?: string,
) {
  let items = artifacts;
  if (tag) items = items.filter((a) => a.tags.includes(tag));
  const query = q?.trim().toLowerCase();
  if (query) {
    items = items.filter((a) =>
      `${a.title} ${a.description} ${a.tags.join(" ")}`.toLowerCase().includes(
        query,
      ),
    );
  }
  return items;
}

function groupByCollection(
  artifacts: ArtifactSummary[],
  collections: Collection[],
) {
  const groups: {
    id: string;
    title: string;
    description: string;
    artifacts: ArtifactSummary[];
  }[] = collections.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    artifacts: artifacts.filter((a) => a.collectionId === c.id),
  }));
  const unfiled = artifacts.filter((a) => !a.collectionId);
  if (unfiled.length > 0) {
    groups.push({
      id: "unfiled",
      title: "Unfiled",
      description: "Not yet placed in a collection.",
      artifacts: unfiled,
    });
  }
  return groups.filter((g) => g.artifacts.length > 0);
}
