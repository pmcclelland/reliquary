-- Per-user Reliquary: each signed-in visitor gets an isolated wiki.
-- Previous unowned rows were development data and are dropped (auth skill).

delete from artifacts;
delete from collections;
delete from reliquary_meta where key = 'seeded';

alter table collections add column if not exists user_id text;
alter table artifacts add column if not exists user_id text;

alter table collections alter column user_id set not null;
alter table artifacts alter column user_id set not null;

alter table collections drop constraint if exists collections_slug_key;
alter table artifacts drop constraint if exists artifacts_slug_key;

create unique index if not exists collections_user_slug_idx on collections (user_id, slug);
create unique index if not exists artifacts_user_slug_idx on artifacts (user_id, slug);
create index if not exists collections_user_id_idx on collections (user_id);
create index if not exists artifacts_user_id_idx on artifacts (user_id);

create table if not exists mcp_tokens (
  user_id text primary key,
  token_hash text not null,
  token_prefix text not null,
  created_at timestamptz not null default now()
);
