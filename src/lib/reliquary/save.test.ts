import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Artifact, ArtifactSummary } from "./types.ts";
import {
  artifactCopyInput,
  canonicalFollowSourceId,
  followMeta,
  libraryCopyLookupIds,
  resolveFollowedArtifact,
  resolveShareSaveAction,
  safeReturnPath,
  sharePathFor,
  shouldDetachFollow,
} from "./save.ts";

function localFollow(overrides: Partial<Artifact> = {}): Artifact {
  return {
    id: "copy-1",
    slug: "harmonic-copy",
    title: "Harmonic",
    description: "A motion study",
    collectionId: "col-mine",
    collectionSlug: "mine",
    collectionTitle: "Mine",
    tags: ["motion"],
    kind: "html",
    hasExplainer: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
    sourceArtifactId: "src-1",
    following: true,
    followLive: false,
    html: "<!DOCTYPE html><html><body>wave</body></html>",
    explainerHtml: "<p>old notes</p>",
    ...overrides,
  };
}

describe("artifactCopyInput", () => {
  it("copies title, html, description, explainer, tags, and slug", () => {
    const input = artifactCopyInput({
      title: "Harmonic",
      html: "<!DOCTYPE html><html><body>wave</body></html>",
      description: "A motion study",
      explainerHtml: "<p>See <a data-line=\"1\">line 1</a></p>",
      tags: ["motion", "canvas"],
      slug: "harmonic",
    });
    assert.equal(input.title, "Harmonic");
    assert.match(input.html ?? "", /wave/);
    assert.equal(input.description, "A motion study");
    assert.equal(input.explainer, "<p>See <a data-line=\"1\">line 1</a></p>");
    assert.deepEqual(input.tags, ["motion", "canvas"]);
    assert.equal(input.slug, "harmonic");
    assert.equal(input.collectionId, undefined);
    assert.equal(input.collection, undefined);
  });

  it("omits an empty explainer so create treats it as absent", () => {
    const input = artifactCopyInput({
      title: "Welcome",
      html: "<p>hi</p>",
      description: "",
      explainerHtml: "",
      tags: [],
      slug: "welcome",
    });
    assert.equal(input.explainer, undefined);
    assert.deepEqual(input.tags, []);
  });

  it("does not alias the source tags array", () => {
    const tags = ["guide"];
    const input = artifactCopyInput({
      title: "Welcome",
      html: "<p>hi</p>",
      description: "",
      explainerHtml: "",
      tags,
      slug: "welcome",
    });
    tags.push("mutated");
    assert.deepEqual(input.tags, ["guide"]);
  });
});

describe("libraryCopyLookupIds", () => {
  it("includes the source id and the per-user seed id", () => {
    const lookup = libraryCopyLookupIds("user-1", "art-welcome");
    assert.deepEqual(lookup.ids, ["art-welcome", "user-1:art-welcome"]);
    assert.equal(lookup.sourceArtifactId, "art-welcome");
  });
});

describe("resolveShareSaveAction", () => {
  it("sends signed-out viewers to sign-in with a return path", () => {
    assert.deepEqual(
      resolveShareSaveAction({
        signedIn: false,
        sharePath: "/s/abc",
        inLibrarySlug: null,
      }),
      { kind: "sign-in", next: "/s/abc" },
    );
  });

  it("does not offer save when the relic is already in the library", () => {
    assert.deepEqual(
      resolveShareSaveAction({
        signedIn: true,
        sharePath: "/s/abc",
        inLibrarySlug: "harmonic",
      }),
      { kind: "in-library", slug: "harmonic" },
    );
    assert.deepEqual(
      resolveShareSaveAction({
        signedIn: false,
        sharePath: "/s/abc",
        inLibrarySlug: "harmonic",
      }),
      { kind: "in-library", slug: "harmonic" },
    );
  });

  it("offers save to a signed-in visitor without a copy", () => {
    assert.deepEqual(
      resolveShareSaveAction({
        signedIn: true,
        sharePath: "/s/abc",
        inLibrarySlug: null,
      }),
      { kind: "save" },
    );
  });
});

describe("safeReturnPath", () => {
  it("keeps same-origin relative paths", () => {
    assert.equal(safeReturnPath("/s/welcome"), "/s/welcome");
    assert.equal(safeReturnPath("/a/harmonic?tab=source"), "/a/harmonic?tab=source");
    assert.equal(safeReturnPath("/"), "/");
  });

  it("rejects off-site and protocol-relative targets", () => {
    assert.equal(safeReturnPath("https://evil.example/phish"), "/");
    assert.equal(safeReturnPath("//evil.example/phish"), "/");
    assert.equal(safeReturnPath("\\\\evil.example"), "/");
    assert.equal(safeReturnPath("s/welcome"), "/");
    assert.equal(safeReturnPath(""), "/");
    assert.equal(safeReturnPath(undefined), "/");
  });
});

describe("sharePathFor", () => {
  it("prefers the artifact id so share URLs stay unique across libraries", () => {
    assert.equal(
      sharePathFor({ id: "art-welcome", slug: "welcome" }),
      "/s/art-welcome",
    );
  });
});

describe("canonicalFollowSourceId", () => {
  it("follows the original when the shared row is itself a follow", () => {
    assert.equal(
      canonicalFollowSourceId({ id: "copy-1", sourceArtifactId: "src-1" }),
      "src-1",
    );
    assert.equal(
      canonicalFollowSourceId({ id: "src-1", sourceArtifactId: null }),
      "src-1",
    );
  });
});

describe("save follow", () => {
  it("records provenance so a second save is In library, not a new row", () => {
    const source = {
      title: "Harmonic",
      html: "<p>wave</p>",
      description: "A motion study",
      explainerHtml: "",
      tags: ["motion"],
      slug: "harmonic",
    };
    const input = {
      ...artifactCopyInput(source),
      sourceArtifactId: "src-1",
    };
    assert.equal(input.sourceArtifactId, "src-1");
    const lookup = libraryCopyLookupIds("user-2", "src-1");
    assert.equal(lookup.sourceArtifactId, "src-1");
    assert.deepEqual(
      resolveShareSaveAction({
        signedIn: true,
        sharePath: "/s/src-1",
        inLibrarySlug: "harmonic",
      }),
      { kind: "in-library", slug: "harmonic" },
    );
  });
});

describe("resolveFollowedArtifact", () => {
  it("shows a later source edit on the follower's row", () => {
    const local = localFollow();
    const viewed = resolveFollowedArtifact(local, {
      title: "Harmonic II",
      description: "Revised",
      html: "<!DOCTYPE html><html><body>tide</body></html>",
      explainerHtml: "<p>new notes</p>",
      tags: ["motion", "study"],
      kind: "html",
      hasExplainer: true,
      updatedAt: "2026-03-01T00:00:00.000Z",
    });
    assert.equal(viewed.followLive, true);
    assert.equal(viewed.following, true);
    assert.equal(viewed.title, "Harmonic II");
    assert.match(viewed.html, /tide/);
    assert.equal(viewed.description, "Revised");
    assert.equal(viewed.explainerHtml, "<p>new notes</p>");
    assert.deepEqual(viewed.tags, ["motion", "study"]);
    assert.equal(viewed.updatedAt, "2026-03-01T00:00:00.000Z");
    assert.equal(viewed.id, "copy-1");
    assert.equal(viewed.slug, "harmonic-copy");
    assert.equal(viewed.collectionId, "col-mine");
    assert.equal(viewed.collectionSlug, "mine");
    assert.equal(viewed.createdAt, local.createdAt);
    assert.equal(viewed.sourceArtifactId, "src-1");
  });

  it("falls back to the save-time snapshot when the source is gone", () => {
    const local = localFollow({ html: "<p>snapshot</p>", title: "Harmonic" });
    const viewed = resolveFollowedArtifact(local, null);
    assert.equal(viewed.followLive, false);
    assert.equal(viewed.following, true);
    assert.equal(viewed.title, "Harmonic");
    assert.equal(viewed.html, "<p>snapshot</p>");
    assert.equal(viewed.slug, "harmonic-copy");
    assert.equal(viewed.collectionId, "col-mine");
  });

  it("does not overlay a relic that is not following", () => {
    const owned = localFollow({
      ...followMeta(null),
      title: "Mine",
      html: "<p>mine</p>",
    });
    const viewed = resolveFollowedArtifact(owned, {
      title: "Other",
      description: "",
      html: "<p>other</p>",
      explainerHtml: "",
      tags: [],
      kind: "html",
      hasExplainer: false,
      updatedAt: "2026-04-01T00:00:00.000Z",
    });
    assert.equal(viewed.followLive, false);
    assert.equal(viewed.title, "Mine");
    assert.equal(viewed.html, "<p>mine</p>");
  });

  it("overlays summary fields without requiring HTML", () => {
    const local: ArtifactSummary = {
      id: "copy-1",
      slug: "harmonic-copy",
      title: "Harmonic",
      description: "old",
      collectionId: null,
      collectionSlug: null,
      collectionTitle: null,
      tags: ["motion"],
      kind: "html",
      hasExplainer: false,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-02T00:00:00.000Z",
      ...followMeta("src-1"),
    };
    const viewed = resolveFollowedArtifact(local, {
      title: "Live title",
      description: "live",
      html: "<p>secret</p>",
      explainerHtml: "<p>notes</p>",
      tags: ["live"],
      kind: "react",
      hasExplainer: true,
      updatedAt: "2026-05-01T00:00:00.000Z",
    });
    assert.equal(viewed.title, "Live title");
    assert.equal(viewed.hasExplainer, true);
    assert.equal(viewed.kind, "react");
    assert.equal("html" in viewed, false);
  });
});

describe("shouldDetachFollow", () => {
  const current = {
    title: "Harmonic",
    html: "<p>wave</p>",
    description: "A motion study",
    explainerHtml: "",
    tags: ["motion"],
  };

  it("keeps following when content is unchanged (collection/slug only)", () => {
    assert.equal(shouldDetachFollow(true, current, { ...current }), false);
  });

  it("detaches when HTML or title diverges", () => {
    assert.equal(
      shouldDetachFollow(true, current, { ...current, html: "<p>tide</p>" }),
      true,
    );
    assert.equal(
      shouldDetachFollow(true, current, { ...current, title: "Fork" }),
      true,
    );
    assert.equal(
      shouldDetachFollow(true, current, { ...current, tags: ["motion", "x"] }),
      true,
    );
  });

  it("never detaches a relic that is not following", () => {
    assert.equal(
      shouldDetachFollow(false, current, { ...current, html: "<p>x</p>" }),
      false,
    );
  });
});
