-- Provenance for a copy saved from another library (or the guest sample).
-- No foreign key: guest ids are not rows, and the original may be deleted.
alter table artifacts
  add column if not exists source_artifact_id text;

create index if not exists artifacts_source_artifact_id_idx
  on artifacts (source_artifact_id);

create unique index if not exists artifacts_user_source_idx
  on artifacts (user_id, source_artifact_id)
  where source_artifact_id is not null;
