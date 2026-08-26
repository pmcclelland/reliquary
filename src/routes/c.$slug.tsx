import { createFileRoute, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArtifactCard } from "@/components/artifact/card";
import { AppShell } from "@/components/layout/app-shell";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteCollectionFn, getCollectionPage } from "@/lib/reliquary/functions";
import { useState } from "react";

export const Route = createFileRoute("/c/$slug")({
  loader: ({ params }) => getCollectionPage({ data: { slug: params.slug } }),
  component: CollectionPage,
});

function CollectionPage() {
  const { collection, library } = Route.useLoaderData();
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const artifacts = library.artifacts.filter(
    (a) => a.collectionId === collection.id,
  );

  async function onDelete() {
    try {
      await deleteCollectionFn({ data: { slug: collection.slug } });
      toast.success("Collection removed. Artifacts were unfiled.");
      await router.invalidate({ sync: true });
      await router.navigate({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete");
    }
  }

  return (
    <AppShell library={library} collectionSlug={collection.slug}>
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8 sm:py-12">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium tracking-[0.18em] text-subtle uppercase">
              Collection
            </p>
            <h1 className="mt-2 font-serif text-4xl tracking-tight">
              {collection.title}
            </h1>
            {collection.description ? (
              <p className="mt-2 max-w-xl text-muted">{collection.description}</p>
            ) : null}
          </div>
          <Button variant="ghost" onClick={() => setConfirm(true)}>
            Remove collection
          </Button>
        </div>
        {artifacts.length === 0 ? (
          <p className="mt-16 text-muted">This shelf is empty.</p>
        ) : (
          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {artifacts.map((a) => (
              <ArtifactCard key={a.id} artifact={a} />
            ))}
          </div>
        )}
      </main>
      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogTitle>Remove this collection?</AlertDialogTitle>
          <AlertDialogDescription>
            Artifacts stay in the library; they become unfiled. The collection
            itself is deleted.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void onDelete()}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
