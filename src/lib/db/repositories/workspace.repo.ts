import { getDriver } from "../client";
import crypto from "crypto";

export interface WorkspaceRecord {
  id: string;
  name: string;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
}

export async function createWorkspace(name: string, ownerId?: string): Promise<WorkspaceRecord> {
  const db = getDriver();
  const id = `ws_${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  const owner = ownerId || null;

  await db.query(
    `INSERT INTO workspaces (id, name, owner_id, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [id, name, owner, now, now]
  );

  return {
    id,
    name,
    owner_id: owner,
    created_at: now,
    updated_at: now,
  };
}

export async function getWorkspaceById(id: string): Promise<WorkspaceRecord | null> {
  const db = getDriver();
  const rows = await db.query<WorkspaceRecord>("SELECT * FROM workspaces WHERE id = $1", [id]);
  return rows[0] || null;
}

export async function updateWorkspaceName(id: string, name: string): Promise<boolean> {
  const db = getDriver();
  const now = new Date().toISOString();
  const affected = await db.execute(
    "UPDATE workspaces SET name = $1, updated_at = $2 WHERE id = $3",
    [name, now, id]
  );
  return affected > 0;
}

export async function setWorkspaceOwner(workspaceId: string, ownerId: string): Promise<void> {
  const db = getDriver();
  await db.execute("UPDATE workspaces SET owner_id = $1 WHERE id = $2", [ownerId, workspaceId]);
}
