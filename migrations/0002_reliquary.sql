-- Reliquary: wiki of living HTML artifacts (unowned, world-readable)
create table if not exists reliquary_meta (
  key   text primary key,
  value text not null
);

create table if not exists collections (
  id          text primary key,
  slug        text not null unique,
  title       text not null,
  description text not null default '',
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists artifacts (
  id             text primary key,
  slug           text not null unique,
  title          text not null,
  description    text not null default '',
  html           text not null,
  collection_id  text references collections(id) on delete set null,
  tags           text not null default '[]',
  kind           text not null default 'html',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists artifacts_collection_id_idx on artifacts (collection_id);
create index if not exists artifacts_updated_at_idx on artifacts (updated_at desc);
create index if not exists artifacts_slug_idx on artifacts (slug);
create index if not exists collections_slug_idx on collections (slug);
