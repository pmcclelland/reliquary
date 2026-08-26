import { createFileRoute, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  EditorForm,
  type EditorValues,
} from "@/components/artifact/editor-form";
import { AppShell } from "@/components/layout/app-shell";
import { requireSession } from "@/lib/auth/protect";
import { getArtifact, getLibrary, updateArtifactFn } from "@/lib/reliquary/functions";

export const Route = createFileRoute("/a/$slug_/edit")({
  beforeLoad: ({ context }) => {
    requireSession(context);
  },
  loader: async ({ params }) => {
    const [library, artifact] = await Promise.all([
      getLibrary(),
      getArtifact({ data: { slug: params.slug } }),
    ]);
    return { library, artifact };
  },
  component: EditPage,
});

function parseTags(value: string): string[] {
  return value
    .split(/[,]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

function EditPage() {
  const { library, artifact } = Route.useLoaderData();
  const router = useRouter();

  async function onSubmit(values: EditorValues) {
    try {
      const updated = await updateArtifactFn({
        data: {
          slug: artifact.slug,
          patch: {
            title: values.title,
            description: values.description,
            html: values.html,
            collectionId: values.collectionId || null,
            tags: parseTags(values.tags),
            slug: values.slug || undefined,
          },
        },
      });
      toast.success("Saved");
      await router.invalidate({ sync: true });
      await router.navigate({
        to: "/a/$slug",
        params: { slug: updated.slug },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    }
  }

  return (
    <AppShell library={library} activeSlug={artifact.slug}>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="border-b border-border px-4 py-3">
          <p className="text-xs tracking-[0.14em] text-subtle uppercase">
            Editing
          </p>
          <h1 className="font-serif text-2xl tracking-tight">{artifact.title}</h1>
        </div>
        <EditorForm
          collections={library.collections}
          initial={artifact}
          submitLabel="Save"
          onSubmit={onSubmit}
          onCancel={() =>
            void router.navigate({
              to: "/a/$slug",
              params: { slug: artifact.slug },
            })
          }
        />
      </div>
    </AppShell>
  );
}
