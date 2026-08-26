import { createHash, randomBytes } from "node:crypto";
import { getSql } from "@/lib/db";

const PREFIX = "rly_";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function mintToken(): string {
  return `${PREFIX}${randomBytes(32).toString("base64url")}`;
}

export type McpTokenMeta = {
  tokenPrefix: string;
  createdAt: string;
  token?: string;
};

export async function userIdFromMcpToken(token: string): Promise<string | null> {
  const trimmed = token.trim();
  if (!trimmed.startsWith(PREFIX)) return null;
  const sql = await getSql();
  const rows = await sql<{ user_id: string }>`
    select user_id from mcp_tokens where token_hash = ${hashToken(trimmed)} limit 1
  `;
  return rows[0]?.user_id ?? null;
}

export async function getMcpTokenMeta(userId: string): Promise<McpTokenMeta | null> {
  const sql = await getSql();
  const rows = await sql<{ token_prefix: string; created_at: unknown }>`
    select token_prefix, created_at from mcp_tokens where user_id = ${userId} limit 1
  `;
  const row = rows[0];
  if (!row) return null;
  const created =
    row.created_at instanceof Date
      ? row.created_at.toISOString()
      : String(row.created_at);
  return { tokenPrefix: row.token_prefix, createdAt: created };
}

export async function issueMcpToken(userId: string): Promise<McpTokenMeta> {
  const token = mintToken();
  const prefix = `${token.slice(0, 10)}…`;
  const sql = await getSql();
  await sql`
    insert into mcp_tokens (user_id, token_hash, token_prefix, created_at)
    values (${userId}, ${hashToken(token)}, ${prefix}, now())
    on conflict (user_id) do update set
      token_hash = excluded.token_hash,
      token_prefix = excluded.token_prefix,
      created_at = now()
  `;
  return { tokenPrefix: prefix, createdAt: new Date().toISOString(), token };
}
