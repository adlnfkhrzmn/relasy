import { getDriver } from "../client";
import { FollowupStatus } from "@/lib/constants";
import crypto from "crypto";

export interface FollowupRecord {
  id: string;
  workspace_id: string;
  customer_id: string;
  customer_name?: string;
  customer_phone?: string | null;
  customer_company?: string | null;
  opportunity_id: string | null;
  opportunity_title?: string | null;
  title: string;
  note: string | null;
  due_at: string;
  status: FollowupStatus;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateFollowupInput {
  customerId: string;
  opportunityId?: string | null;
  title: string;
  note?: string | null;
  dueAt: string;
}

export interface UpdateFollowupInput {
  title?: string;
  note?: string | null;
  dueAt?: string;
  status?: FollowupStatus;
}

export async function createFollowup(
  workspaceId: string,
  input: CreateFollowupInput
): Promise<FollowupRecord> {
  const db = getDriver();
  const id = `flw_${crypto.randomUUID()}`;
  const now = new Date().toISOString();

  const title = input.title.trim();
  const note = input.note ? input.note.trim() : null;
  const opportunityId = input.opportunityId || null;

  await db.query(
    `INSERT INTO followups (
       id, workspace_id, customer_id, opportunity_id, title, note, due_at, status, created_at, updated_at
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8, $9)`,
    [id, workspaceId, input.customerId, opportunityId, title, note, input.dueAt, now, now]
  );

  return {
    id,
    workspace_id: workspaceId,
    customer_id: input.customerId,
    opportunity_id: opportunityId,
    title,
    note,
    due_at: input.dueAt,
    status: "pending",
    completed_at: null,
    created_at: now,
    updated_at: now,
  };
}

export async function getFollowups(
  workspaceId: string,
  options: {
    tab?: "today" | "upcoming" | "overdue" | "completed";
    customerId?: string;
    referenceDate?: string; // YYYY-MM-DD in client local time
  } = {}
): Promise<FollowupRecord[]> {
  const db = getDriver();
  const todayStr = options.referenceDate || new Date().toISOString().split("T")[0];

  let query = `
    SELECT
      f.*,
      c.name as customer_name,
      c.phone as customer_phone,
      c.company as customer_company,
      o.title as opportunity_title
    FROM followups f
    JOIN customers c ON f.customer_id = c.id
    LEFT JOIN opportunities o ON f.opportunity_id = o.id
    WHERE f.workspace_id = $1
  `;
  const params: any[] = [workspaceId];

  if (options.customerId) {
    params.push(options.customerId);
    query += ` AND f.customer_id = $${params.length}`;
  }

  if (options.tab === "today") {
    params.push(todayStr);
    query += ` AND f.status = 'pending' AND substr(f.due_at, 1, 10) = $${params.length}`;
  } else if (options.tab === "upcoming") {
    params.push(todayStr);
    query += ` AND f.status = 'pending' AND substr(f.due_at, 1, 10) > $${params.length}`;
  } else if (options.tab === "overdue") {
    params.push(todayStr);
    query += ` AND f.status = 'pending' AND substr(f.due_at, 1, 10) < $${params.length}`;
  } else if (options.tab === "completed") {
    query += " AND f.status = 'completed'";
  }

  // Sort: completed by completed_at desc, pending by due_at asc and newest created first
  if (options.tab === "completed") {
    query += " ORDER BY f.completed_at DESC";
  } else {
    query += " ORDER BY f.due_at ASC, f.created_at DESC";
  }

  return db.query<FollowupRecord>(query, params);
}

export async function getFollowupById(
  workspaceId: string,
  followupId: string
): Promise<FollowupRecord | null> {
  const db = getDriver();
  const rows = await db.query<FollowupRecord>(
    `
    SELECT
      f.*,
      c.name as customer_name,
      c.phone as customer_phone,
      c.company as customer_company,
      o.title as opportunity_title
    FROM followups f
    JOIN customers c ON f.customer_id = c.id
    LEFT JOIN opportunities o ON f.opportunity_id = o.id
    WHERE f.id = $1 AND f.workspace_id = $2
  `,
    [followupId, workspaceId]
  );
  return rows[0] || null;
}

export async function updateFollowupStatus(
  workspaceId: string,
  followupId: string,
  newStatus: FollowupStatus
): Promise<boolean> {
  const db = getDriver();
  const now = new Date().toISOString();
  const completedAt = newStatus === "completed" ? now : null;

  const affected = await db.execute(
    `UPDATE followups
     SET status = $1, completed_at = $2, updated_at = $3
     WHERE id = $4 AND workspace_id = $5`,
    [newStatus, completedAt, now, followupId, workspaceId]
  );
  return affected > 0;
}

export async function rescheduleFollowup(
  workspaceId: string,
  followupId: string,
  newDueAt: string
): Promise<boolean> {
  const db = getDriver();
  const now = new Date().toISOString();

  const affected = await db.execute(
    `UPDATE followups
     SET due_at = $1, status = 'pending', completed_at = NULL, updated_at = $2
     WHERE id = $3 AND workspace_id = $4`,
    [newDueAt, now, followupId, workspaceId]
  );
  return affected > 0;
}

export async function updateFollowup(
  workspaceId: string,
  followupId: string,
  input: UpdateFollowupInput
): Promise<FollowupRecord | null> {
  const db = getDriver();
  const existing = await getFollowupById(workspaceId, followupId);
  if (!existing) return null;

  const now = new Date().toISOString();
  const title = input.title !== undefined ? input.title.trim() : existing.title;
  const note = input.note !== undefined ? (input.note ? input.note.trim() : null) : existing.note;
  const dueAt = input.dueAt !== undefined ? input.dueAt : existing.due_at;
  const status = input.status !== undefined ? input.status : existing.status;
  const completedAt = status === "completed" ? existing.completed_at || now : null;

  await db.execute(
    `UPDATE followups
     SET title = $1, note = $2, due_at = $3, status = $4, completed_at = $5, updated_at = $6
     WHERE id = $7 AND workspace_id = $8`,
    [title, note, dueAt, status, completedAt, now, followupId, workspaceId]
  );

  return getFollowupById(workspaceId, followupId);
}

export async function deleteFollowup(workspaceId: string, followupId: string): Promise<boolean> {
  const db = getDriver();
  const affected = await db.execute(
    "DELETE FROM followups WHERE id = $1 AND workspace_id = $2",
    [followupId, workspaceId]
  );
  return affected > 0;
}
