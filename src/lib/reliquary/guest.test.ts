import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { SEED_ARTIFACTS, SEED_COLLECTIONS } from "./seed.ts";
import {
  getGuestArtifact,
  getGuestArtifacts,
  getGuestCollection,
  getGuestLibrary,
} from "./guest.ts";

describe("guest library", () => {
  it("exposes every seeded collection and artifact", () => {
    const library = getGuestLibrary();
    assert.equal(library.guest, true);
    assert.equal(library.collections.length, SEED_COLLECTIONS.length);
    assert.equal(library.artifacts.length, SEED_ARTIFACTS.length);
    assert.deepEqual(
      library.collections.map((col) => col.slug),
      SEED_COLLECTIONS.map((col) => col.slug),
    );
    assert.deepEqual(
      library.artifacts.map((art) => art.slug),
      SEED_ARTIFACTS.map((art) => art.slug),
    );
  });

  it("counts artifacts per collection", () => {
    const guides = getGuestCollection("guides");
    assert.ok(guides);
    assert.equal(
      guides.count,
      SEED_ARTIFACTS.filter((art) => art.collectionId === "col-guides").length,
    );
  });

  it("resolves a seed artifact by slug or id, including HTML", () => {
    const bySlug = getGuestArtifact("welcome");
    const byId = getGuestArtifact("art-welcome");
    assert.ok(bySlug);
    assert.equal(bySlug.id, "art-welcome");
    assert.equal(bySlug.title, "Welcome to Reliquary");
    assert.match(bySlug.html, /A place to keep things that move/);
    assert.equal(byId?.slug, "welcome");
    assert.equal(getGuestArtifact("missing"), null);
  });

  it("does not leak HTML into library summaries", () => {
    for (const art of getGuestLibrary().artifacts) {
      assert.equal("html" in art, false);
    }
    assert.ok(getGuestArtifacts()[0]?.html.startsWith("<!DOCTYPE html>"));
  });
});
