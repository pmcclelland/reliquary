-- Append-only snapshots of relic content. History lives on the source
-- artifact; live-follow still reads the current tip.
create table if not exists artifact_revisions (
  id text primary key,
  artifact_id text not null references artifacts(id) on delete cascade,
  user_id text not null,
  title text not null,
  description text not null default '',
  html text not null,
  explainer_html text not null default '',
  tags text not null default '[]',
  kind text not null default 'html',
  created_at timestamptz not null default now()
);

create index if not exists artifact_revisions_artifact_created_idx
  on artifact_revisions (artifact_id, created_at desc);
