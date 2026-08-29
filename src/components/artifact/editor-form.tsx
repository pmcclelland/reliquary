import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ArtifactFrame } from "@/components/artifact/frame";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Artifact, Collection } from "@/lib/reliquary/types";
import { cn, formatBytes } from "@/lib/utils";

export type EditorValues = {
  title: string;
  description: string;
  html: string;
  explainer: string;
  collectionId: string;
  tags: string;
  slug: string;
};

export function EditorForm({
  collections,
  initial,
  submitLabel,
  busy,
  onSubmit,
  onCancel,
}: {
  collections: Collection[];
  initial?: Partial<Artifact>;
  submitLabel: string;
  busy?: boolean;
  onSubmit: (values: EditorValues) => Promise<void> | void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [html, setHtml] = useState(initial?.html ?? "");
  const [explainer, setExplainer] = useState(initial?.explainerHtml ?? "");
  const [collectionId, setCollectionId] = useState(initial?.collectionId ?? "");
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "));
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [previewHtml, setPreviewHtml] = useState(initial?.html ?? "");
  const [tab, setTab] = useState<"split" | "source" | "preview">("split");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setPreviewHtml(html), 400);
    return () => window.clearTimeout(t);
  }, [html]);

  const valuesRef = useRef({
    title,
    description,
    html,
    explainer,
    collectionId,
    tags,
    slug,
  });
  valuesRef.current = {
    title,
    description,
    html,
    explainer,
    collectionId,
    tags,
    slug,
  };
  const onSubmitRef = useRef(onSubmit);
  onSubmitRef.current = onSubmit;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        const v = valuesRef.current;
        void onSubmitRef.current(v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const bytes = useMemo(() => new TextEncoder().encode(html).length, [html]);

  async function handleSubmit(e?: FormEvent) {
    e?.preventDefault();
    await onSubmit({
      title,
      description,
      html,
      explainer,
      collectionId,
      tags,
      slug,
    });
  }

  function onFile(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      setHtml(text);
      if (!title.trim()) {
        setTitle(file.name.replace(/\.html?$/i, ""));
      }
    };
    reader.readAsText(file);
  }

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
      <div className="grid gap-3 border-b border-border px-4 py-4 md:grid-cols-2 lg:grid-cols-3">
        <Field label="Title" htmlFor="title">
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Harmonic"
          />
        </Field>
        <Field label="Description" htmlFor="desc">
          <Input
            id="desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A short note for the wiki"
          />
        </Field>
        <Field label="Collection" htmlFor="col">
          <select
            id="col"
            value={collectionId}
            onChange={(e) => setCollectionId(e.target.value)}
            className="h-10 w-full rounded-md bg-field px-3 text-sm text-fg shadow-border"
          >
            <option value="">Unfiled</option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Tags" htmlFor="tags">
          <Input
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="motion, canvas"
          />
        </Field>
        <Field label="Slug" htmlFor="slug">
          <Input
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="generated from title"
          />
        </Field>
        <div className="md:col-span-2">
          <Field label="Explainer" htmlFor="explainer">
            <Textarea
              id="explainer"
              value={explainer}
              onChange={(e) => setExplainer(e.target.value)}
              placeholder='Optional notes beside Source. Cite lines with <a data-line="12">'
              className="min-h-20"
            />
          </Field>
        </div>
        <div className="flex items-end gap-2">
          <input
            ref={fileRef}
            type="file"
            accept=".html,text/html"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => fileRef.current?.click()}
          >
            Upload .html
          </Button>
          <p className="text-xs text-subtle tabular-nums">{formatBytes(bytes)}</p>
        </div>
      </div>

      <div className="flex items-center gap-1 border-b border-border px-3 py-2">
        {(["split", "source", "preview"] as const).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "h-8 rounded-sm px-3 text-xs font-medium capitalize",
              tab === id ? "bg-surface-muted text-fg" : "text-muted hover:text-fg",
            )}
          >
            {id}
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={busy || !title.trim() || !html.trim()}>
            {submitLabel}
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "grid min-h-0 flex-1",
          tab === "split" ? "md:grid-cols-2" : "grid-cols-1",
        )}
      >
        {(tab === "split" || tab === "source") && (
          <Textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Tab") {
                e.preventDefault();
                const el = e.currentTarget;
                const start = el.selectionStart;
                const end = el.selectionEnd;
                const next = html.slice(0, start) + "  " + html.slice(end);
                setHtml(next);
                requestAnimationFrame(() => {
                  el.selectionStart = el.selectionEnd = start + 2;
                });
              }
            }}
            spellCheck={false}
            className="min-h-80 flex-1 resize-none rounded-none border-0 font-mono text-[13px] leading-relaxed shadow-none md:min-h-0"
            placeholder="Paste a self-contained HTML document, a fragment, or a React module that defines App."
          />
        )}
        {(tab === "split" || tab === "preview") && (
          <div className="min-h-80 border-t border-border bg-chip md:min-h-0 md:border-t-0 md:border-l">
            {previewHtml.trim() ? (
              <ArtifactFrame html={previewHtml} title={title || "Preview"} />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted">
                Preview appears as you type.
              </div>
            )}
          </div>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
