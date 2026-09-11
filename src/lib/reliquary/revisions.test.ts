import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  canRestoreRevision,
  historyTarget,
  pickSelectedRevisionId,
  snapshotsToAppend,
} from "./revisions.ts";
import type { FollowContent } from "./save.ts";

const v1: FollowContent = {
  title: "Harmonic",
  html: "<p>wave</p>",
  description: "A motion study",
  explainerHtml: "",
  tags: ["motion"],
};

const v2: FollowContent = {
  ...v1,
  html: "<p>tide</p>",
  title: "Harmonic II",
};

describe("snapshotsToAppend", () => {
  it("appends nothing when content is unchanged", () => {
    assert.deepEqual(
      snapshotsToAppend({ previous: v1, next: { ...v1 }, existingCount: 1 }),
      [],
    );
  });

  it("backfills the outgoing snapshot on a first content update", () => {
    assert.deepEqual(
      snapshotsToAppend({ previous: v1, next: v2, existingCount: 0 }),
      [v1, v2],
    );
  });

  it("appends only the new snapshot once history exists", () => {
    assert.deepEqual(
      snapshotsToAppend({ previous: v1, next: v2, existingCount: 1 }),
      [v2],
    );
  });

  it("does not rewrite earlier snapshots", () => {
    const first = snapshotsToAppend({
      previous: v1,
      next: v2,
      existingCount: 0,
    });
    const second = snapshotsToAppend({
      previous: v2,
      next: { ...v2, description: "Revised" },
      existingCount: first.length,
    });
    assert.deepEqual(first, [v1, v2]);
    assert.deepEqual(second, [{ ...v2, description: "Revised" }]);
    assert.equal(first[0]?.html, "<p>wave</p>");
  });
});

describe("historyTarget", () => {
  it("reads the live source while following", () => {
    assert.deepEqual(
      historyTarget({
        id: "copy-1",
        following: true,
        followLive: true,
        sourceArtifactId: "src-1",
      }),
      { artifactId: "src-1", fromSource: true },
    );
  });

  it("falls back to the owned row when the source is gone", () => {
    assert.deepEqual(
      historyTarget({
        id: "copy-1",
        following: true,
        followLive: false,
        sourceArtifactId: "src-1",
      }),
      { artifactId: "copy-1", fromSource: false },
    );
  });

  it("uses the owned artifact for originals", () => {
    assert.deepEqual(
      historyTarget({
        id: "src-1",
        following: false,
        followLive: false,
        sourceArtifactId: null,
      }),
      { artifactId: "src-1", fromSource: false },
    );
  });
});

describe("canRestoreRevision", () => {
  it("allows restore only on owned history", () => {
    assert.equal(canRestoreRevision(false), true);
    assert.equal(canRestoreRevision(true), false);
  });
});

describe("pickSelectedRevisionId", () => {
  it("lists newest-first and defaults to the first id", () => {
    const ids = ["rev-new", "rev-old"];
    assert.equal(pickSelectedRevisionId(ids, undefined), "rev-new");
    assert.equal(pickSelectedRevisionId(ids, "rev-old"), "rev-old");
    assert.equal(pickSelectedRevisionId(ids, "missing"), "rev-new");
    assert.equal(pickSelectedRevisionId([], "rev-new"), null);
  });
});
