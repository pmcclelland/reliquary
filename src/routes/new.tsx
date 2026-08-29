import { createFileRoute, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  EditorForm,
  type EditorValues,
} from "@/components/artifact/editor-form";
import { AppShell } from "@/components/layout/app-shell";
import { requireSession } from "@/lib/auth/protect";
import { createArtifactFn, getLibrary } from "@/lib/reliquary/functions";

export const Route = createFileRoute("/new")({
  beforeLoad: ({ context }) => {
    requireSession(context);
  },
  loader: () => getLibrary(),
  component: NewPage,
});

function parseTags(value: string): string[] {
  return value
    .split(/[,]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

function NewPage() {
  const library = Route.useLoaderData();
  const router = useRouter();

  async function onSubmit(values: EditorValues) {
    try {
      const created = await createArtifactFn({
        data: {
          title: values.title,
          description: values.description,
          html: values.html,
          explainer: values.explainer || undefined,
          collectionId: values.collectionId || null,
          tags: parseTags(values.tags),
          slug: values.slug || undefined,
        },
      });
      toast.success("Filed");
      await router.invalidate({ sync: true });
      await router.navigate({
        to: "/a/$slug",
        params: { slug: created.slug },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create");
    }
  }

  return (
    <AppShell library={library}>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="border-b border-border px-4 py-3">
          <p className="text-xs tracking-[0.14em] text-subtle uppercase">
            New artifact
          </p>
          <h1 className="font-serif text-2xl tracking-tight">
            File something living
          </h1>
        </div>
        <EditorForm
          collections={library.collections}
          submitLabel="Publish"
          onSubmit={onSubmit}
          onCancel={() => void router.navigate({ to: "/" })}
        />
      </div>
    </AppShell>
  );
}
