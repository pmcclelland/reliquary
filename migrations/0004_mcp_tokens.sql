-- Multiple named MCP tokens per user (one per agent).
-- Existing single-token rows keep working; they become a named token.

alter table mcp_tokens add column if not exists id text;
alter table mcp_tokens add column if not exists name text;

update mcp_tokens
set id = 'tok_' || substr(md5(user_id || token_hash), 1, 22)
where id is null or id = '';

update mcp_tokens
set name = 'Grok'
where name is null or name = '';

alter table mcp_tokens alter column id set not null;
alter table mcp_tokens alter column name set not null;

alter table mcp_tokens drop constraint if exists mcp_tokens_pkey;
alter table mcp_tokens add primary key (id);

create unique index if not exists mcp_tokens_token_hash_idx on mcp_tokens (token_hash);
create index if not exists mcp_tokens_user_id_idx on mcp_tokens (user_id);
