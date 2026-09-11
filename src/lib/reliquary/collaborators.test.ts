import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  MAX_COLLABORATORS,
  canWriteSourceTip,
  collaboratorInviteMessage,
  decideFollowContentWrite,
  normalizeCollaboratorEmail,
  resolveCollaboratorInvite,
  revisionAuthorLabel,
} from "./collaborators.ts";

describe("canWriteSourceTip", () => {
  it("lets the owner write even when the feature is off", () => {
    assert.equal(
      canWriteSourceTip({
        actorIsSourceOwner: true,
        collaboratorsEnabled: false,
        actorOnAllowlist: false,
      }),
      true,
    );
  });

  it("lets an allowlisted user write only while editing is on", () => {
    assert.equal(
      canWriteSourceTip({
        actorIsSourceOwner: false,
        collaboratorsEnabled: true,
        actorOnAllowlist: true,
      }),
      true,
    );
    assert.equal(
      canWriteSourceTip({
        actorIsSourceOwner: false,
        collaboratorsEnabled: false,
        actorOnAllowlist: true,
      }),
      false,
    );
  });

  it("does not grant write from a share link or a library save", () => {
    const savedFromShare = canWriteSourceTip({
      actorIsSourceOwner: false,
      collaboratorsEnabled: false,
      actorOnAllowlist: false,
    });
    assert.equal(savedFromShare, false);
    assert.equal(
      canWriteSourceTip({
        actorIsSourceOwner: false,
        collaboratorsEnabled: true,
        actorOnAllowlist: false,
      }),
      false,
    );
  });
});

describe("decideFollowContentWrite", () => {
  it("writes the source tip when a collaborator changes content", () => {
    assert.equal(
      decideFollowContentWrite({
        following: true,
        contentChanged: true,
        canWriteSource: true,
      }),
      "write-source",
    );
  });

  it("forks when a follower who is not a collaborator changes content", () => {
    assert.equal(
      decideFollowContentWrite({
        following: true,
        contentChanged: true,
        canWriteSource: false,
      }),
      "fork",
    );
  });

  it("keeps a shelf/slug save on the follow row", () => {
    assert.equal(
      decideFollowContentWrite({
        following: true,
        contentChanged: false,
        canWriteSource: true,
      }),
      "shelf",
    );
    assert.equal(
      decideFollowContentWrite({
        following: true,
        contentChanged: false,
        canWriteSource: false,
      }),
      "shelf",
    );
  });

  it("writes the owned row when the actor is not following", () => {
    assert.equal(
      decideFollowContentWrite({
        following: false,
        contentChanged: true,
        canWriteSource: true,
      }),
      "write-local",
    );
  });
});

describe("owner revoke", () => {
  it("stops tip writes after the feature is turned off", () => {
    const before = canWriteSourceTip({
      actorIsSourceOwner: false,
      collaboratorsEnabled: true,
      actorOnAllowlist: true,
    });
    const after = canWriteSourceTip({
      actorIsSourceOwner: false,
      collaboratorsEnabled: false,
      actorOnAllowlist: true,
    });
    assert.equal(before, true);
    assert.equal(after, false);
    assert.equal(
      decideFollowContentWrite({
        following: true,
        contentChanged: true,
        canWriteSource: after,
      }),
      "fork",
    );
  });

  it("stops tip writes after the user is removed from the allowlist", () => {
    const after = canWriteSourceTip({
      actorIsSourceOwner: false,
      collaboratorsEnabled: true,
      actorOnAllowlist: false,
    });
    assert.equal(after, false);
    assert.equal(
      decideFollowContentWrite({
        following: true,
        contentChanged: true,
        canWriteSource: after,
      }),
      "fork",
    );
  });
});

describe("normalizeCollaboratorEmail", () => {
  it("trims and lowercases a valid address", () => {
    assert.equal(normalizeCollaboratorEmail("  Ada@Example.com "), "ada@example.com");
  });

  it("rejects empty or malformed input", () => {
    assert.equal(normalizeCollaboratorEmail(""), null);
    assert.equal(normalizeCollaboratorEmail("not-an-email"), null);
    assert.equal(normalizeCollaboratorEmail("ada@"), null);
  });
});

describe("resolveCollaboratorInvite", () => {
  const owner = "owner-1";
  const ada = { id: "user-ada" };

  it("accepts an existing Reliquary user", () => {
    assert.deepEqual(
      resolveCollaboratorInvite({
        ownerUserId: owner,
        email: "ada@example.com",
        existingUser: ada,
        alreadyOnList: false,
        listCount: 0,
      }),
      { ok: true, userId: "user-ada" },
    );
  });

  it("does not create a free-text collaborator", () => {
    assert.deepEqual(
      resolveCollaboratorInvite({
        ownerUserId: owner,
        email: "missing@example.com",
        existingUser: null,
        alreadyOnList: false,
        listCount: 0,
      }),
      { ok: false, reason: "not-found" },
    );
    assert.equal(
      collaboratorInviteMessage("not-found"),
      "No Reliquary account for that email",
    );
  });

  it("rejects the owner, duplicates, and a full list", () => {
    assert.equal(
      resolveCollaboratorInvite({
        ownerUserId: owner,
        email: "owner@example.com",
        existingUser: { id: owner },
        alreadyOnList: false,
        listCount: 0,
      }).ok,
      false,
    );
    assert.deepEqual(
      resolveCollaboratorInvite({
        ownerUserId: owner,
        email: "ada@example.com",
        existingUser: ada,
        alreadyOnList: true,
        listCount: 1,
      }),
      { ok: false, reason: "duplicate" },
    );
    assert.deepEqual(
      resolveCollaboratorInvite({
        ownerUserId: owner,
        email: "ada@example.com",
        existingUser: ada,
        alreadyOnList: false,
        listCount: MAX_COLLABORATORS,
      }),
      { ok: false, reason: "full" },
    );
  });
});

describe("revisionAuthorLabel", () => {
  it("prefers a name, then email", () => {
    assert.equal(
      revisionAuthorLabel({ name: "Ada", email: "ada@example.com" }),
      "Ada",
    );
    assert.equal(revisionAuthorLabel({ name: "", email: "ada@example.com" }), "ada@example.com");
    assert.equal(revisionAuthorLabel(null), null);
  });
});
