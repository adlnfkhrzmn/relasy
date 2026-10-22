import { getDatabase } from "../client";
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

export function createUser(data: {
  workspaceId: string;
  name: string;
  email: string;
  passwordHash: string;
}): UserRecord {
  const db = getDatabase();
  const id = `usr_${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  const normalizedEmail = data.email.trim().toLowerCase();

  const stmt = db.prepare(`
    INSERT INTO users (id, workspace_id, name, email, password_hash, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(id, data.workspaceId, data.name.trim(), normalizedEmail, data.passwordHash, now, now);

  return {
    id,
    workspace_id: data.workspaceId,
    name: data.name.trim(),
    email: normalizedEmail,
    password_hash: data.passwordHash,
    created_at: now,
    updated_at: now,
  };
}

export function getUserByEmail(email: string): UserRecord | null {
  const db = getDatabase();
  const normalizedEmail = email.trim().toLowerCase();
  const row = (db.prepare("SELECT * FROM users WHERE email = ?").get(normalizedEmail) as unknown) as
    | UserRecord
    | undefined;
  return row || null;
}

export function getUserById(id: string): UserRecord | null {
  const db = getDatabase();
  const row = (db.prepare("SELECT * FROM users WHERE id = ?").get(id) as unknown) as UserRecord | undefined;
  return row || null;
}

export function updateUser(id: string, data: { name?: string; email?: string }): boolean {
  const db = getDatabase();
  const now = new Date().toISOString();
  const updates: string[] = ["updated_at = ?"];
  const params: any[] = [now];

  if (data.name) {
    updates.push("name = ?");
    params.push(data.name.trim());
  }

  if (data.email) {
    updates.push("email = ?");
    params.push(data.email.trim().toLowerCase());
  }

  params.push(id);
  const stmt = db.prepare(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`);
  const result = stmt.run(...params) as any;
  return (result?.changes || 0) > 0;
}
