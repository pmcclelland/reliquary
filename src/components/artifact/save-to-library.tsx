import { Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { saveToLibraryFn } from "@/lib/reliquary/functions";
import { resolveShareSaveAction } from "@/lib/reliquary/save";

export function SaveToLibraryButton({
  sourceKey,
  sharePath,
  inLibrarySlug,
  signedIn,
}: {
  sourceKey: string;
  sharePath: string;
  inLibrarySlug: string | null;
  signedIn: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [savedSlug, setSavedSlug] = useState(inLibrarySlug);
  const action = resolveShareSaveAction({
    signedIn,
    sharePath,
    inLibrarySlug: savedSlug,
  });

  async function onSave() {
    setBusy(true);
    try {
      const result = await saveToLibraryFn({ data: { slug: sourceKey } });
      setSavedSlug(result.artifact.slug);
      toast.success(
        result.created ? "Saved to your library" : "Already in your library",
      );
      await router.invalidate();
    } catch (err) {
      if (err instanceof Error && err.message === "Unauthorized") {
        window.location.href = `/login?next=${encodeURIComponent(sharePath)}`;
        return;
      }
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  if (action.kind === "in-library") {
    return (
      <Button asChild size="sm" variant="secondary" className="shrink-0">
        <Link to="/a/$slug" params={{ slug: action.slug }}>
          In library
        </Link>
      </Button>
    );
  }

  if (action.kind === "sign-in") {
    return (
      <Button asChild size="sm" className="shrink-0">
        <Link to="/login" search={{ next: action.next }}>
          <span className="sm:hidden">Save</span>
          <span className="hidden sm:inline">Save to library</span>
        </Link>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      size="sm"
      className="shrink-0"
      disabled={busy}
      aria-label="Save to library"
      onClick={() => void onSave()}
    >
      {busy ? (
        "Saving"
      ) : (
        <>
          <span className="sm:hidden">Save</span>
          <span className="hidden sm:inline">Save to library</span>
        </>
      )}
    </Button>
  );
}
