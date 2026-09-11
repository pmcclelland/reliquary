/**
 * Collaborator writes on a live-followed relic.
 *
 * The owner may turn on editing and allowlist Reliquary users by account.
 * Those people write the **source tip** (same append-only history as owner
 * edits). Everyone else keeps the #7 rule: shelf/slug stay local; a content
 * edit forks (clears `source_artifact_id`).
 *
 * A public share URL and Save to library never grant write by themselves.
 */

export const MAX_COLLABORATORS = 40;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeCollaboratorEmail(
  raw: string | null | undefined,
): string | null {
  const email = (raw ?? "").trim().toLowerCase();
  if (!email || email.length > 320 || !EMAIL_RE.test(email)) return null;
  return email;
}

/** Owner always writes the tip. Allowlist writes only while the feature is on. */
export function canWriteSourceTip(opts: {
  actorIsSourceOwner: boolean;
  collaboratorsEnabled: boolean;
  actorOnAllowlist: boolean;
}): boolean {
  if (opts.actorIsSourceOwner) return true;
  return opts.collaboratorsEnabled && opts.actorOnAllowlist;
}

export type FollowContentWrite = "shelf" | "write-source" | "fork" | "write-local";

/**
 * Where a content/shelf save lands.
 * - shelf: collection/slug only; follow stays attached
 * - write-source: collaborator (or owner via a follow, rare) updates the tip
 * - fork: content diverged and the actor cannot write the tip
 * - write-local: the actor owns this row (it is the tip)
 */
export function decideFollowContentWrite(opts: {
  following: boolean;
  contentChanged: boolean;
  canWriteSource: boolean;
}): FollowContentWrite {
  if (!opts.contentChanged) return "shelf";
  if (opts.following && opts.canWriteSource) return "write-source";
  if (opts.following) return "fork";
  return "write-local";
}

export type CollaboratorInviteResult =
  | { ok: true; userId: string }
  | {
      ok: false;
      reason: "invalid" | "not-found" | "self" | "duplicate" | "full";
    };

export function resolveCollaboratorInvite(opts: {
  ownerUserId: string;
  email: string;
  existingUser: { id: string } | null;
  alreadyOnList: boolean;
  listCount: number;
}): CollaboratorInviteResult {
  const email = normalizeCollaboratorEmail(opts.email);
  if (!email) return { ok: false, reason: "invalid" };
  if (!opts.existingUser) return { ok: false, reason: "not-found" };
  if (opts.existingUser.id === opts.ownerUserId) {
    return { ok: false, reason: "self" };
  }
  if (opts.alreadyOnList) return { ok: false, reason: "duplicate" };
  if (opts.listCount >= MAX_COLLABORATORS) return { ok: false, reason: "full" };
  return { ok: true, userId: opts.existingUser.id };
}

export function collaboratorInviteMessage(
  reason: Exclude<CollaboratorInviteResult, { ok: true }>["reason"],
): string {
  switch (reason) {
    case "invalid":
      return "Enter a valid email";
    case "not-found":
      return "No Reliquary account for that email";
    case "self":
      return "You already own this relic";
    case "duplicate":
      return "Already added";
    case "full":
      return "Collaborator list is full";
  }
}

export function revisionAuthorLabel(
  user: { name?: string | null; email?: string | null } | null,
): string | null {
  const name = user?.name?.trim();
  if (name) return name;
  const email = user?.email?.trim();
  if (email) return email;
  return null;
}
