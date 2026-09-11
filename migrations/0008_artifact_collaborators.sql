-- Owner-managed allowlist for writing the source tip.
-- Presence on the list is not enough; collaborators_enabled must also be on.
-- A share URL or a library save does not grant write.
alter table artifacts
  add column if not exists collaborators_enabled boolean not null default false;

create table if not exists artifact_collaborators (
  artifact_id text not null references artifacts(id) on delete cascade,
  user_id text not null,
  created_at timestamptz not null default now(),
  primary key (artifact_id, user_id)
);

create index if not exists artifact_collaborators_user_idx
  on artifact_collaborators (user_id);
