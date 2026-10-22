import { getDatabase } from "../client";
import crypto from "crypto";

export interface WorkspaceRecord {
  id: string;
  name: string;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
}

export function createWorkspace(name: string, ownerId?: string): WorkspaceRecord {
  const db = getDatabase();
  const id = `ws_${crypto.randomUUID()}`;
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO workspaces (id, name, owner_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
  `);
  stmt.run(id, name, ownerId || null, now, now);

  return {
    id,
    name,
    owner_id: ownerId || null,
    created_at: now,
    updated_at: now,
  };
}

export function getWorkspaceById(id: string): WorkspaceRecord | null {
  const db = getDatabase();
  const row = (db.prepare("SELECT * FROM workspaces WHERE id = ?").get(id) as unknown) as
    | WorkspaceRecord
    | undefined;
  return row || null;
}

export function updateWorkspaceName(id: string, name: string): boolean {
  const db = getDatabase();
  const now = new Date().toISOString();
  const stmt = db.prepare("UPDATE workspaces SET name = ?, updated_at = ? WHERE id = ?");
  const result = stmt.run(name, now, id) as any;
  return (result?.changes || 0) > 0;
}
