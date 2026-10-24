import { getDriver } from "../client";
import crypto from "crypto";

export interface UserRecord {
  id: string;
  workspace_id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export async function createUser(data: {
  workspaceId: string;
  name: string;
  email: string;
  passwordHash: string;
}): Promise<UserRecord> {
  const db = getDriver();
  const id = `usr_${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  const normalizedEmail = data.email.trim().toLowerCase();
  const name = data.name.trim();

  await db.query(
    `INSERT INTO users (id, workspace_id, name, email, password_hash, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [id, data.workspaceId, name, normalizedEmail, data.passwordHash, now, now]
  );

  return {
    id,
    workspace_id: data.workspaceId,
    name,
    email: normalizedEmail,
    password_hash: data.passwordHash,
    created_at: now,
    updated_at: now,
  };
}

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  const db = getDriver();
  const normalizedEmail = email.trim().toLowerCase();
  const rows = await db.query<UserRecord>("SELECT * FROM users WHERE email = $1", [normalizedEmail]);
  return rows[0] || null;
}

export async function getUserById(id: string): Promise<UserRecord | null> {
  const db = getDriver();
  const rows = await db.query<UserRecord>("SELECT * FROM users WHERE id = $1", [id]);
  return rows[0] || null;
}

export async function updateUser(
  id: string,
  data: { name?: string; email?: string }
): Promise<boolean> {
  const db = getDriver();
  const now = new Date().toISOString();
  const updates: string[] = ["updated_at = $1"];
  const params: any[] = [now];

  if (data.name) {
    params.push(data.name.trim());
    updates.push(`name = $${params.length}`);
  }

  if (data.email) {
    params.push(data.email.trim().toLowerCase());
    updates.push(`email = $${params.length}`);
  }

  params.push(id);
  const affected = await db.execute(
    `UPDATE users SET ${updates.join(", ")} WHERE id = $${params.length}`,
    params
  );
  return affected > 0;
}
