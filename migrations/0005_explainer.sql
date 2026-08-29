-- Optional HTML notes shown beside Source, with data-line citations into the relic.
alter table artifacts
  add column if not exists explainer_html text not null default '';
