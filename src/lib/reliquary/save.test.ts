import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  artifactCopyInput,
  libraryCopyLookupIds,
  resolveShareSaveAction,
  safeReturnPath,
  sharePathFor,
} from "./save.ts";

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
