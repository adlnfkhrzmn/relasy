import { getDatabase } from "../client";
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

export function createFollowup(workspaceId: string, input: CreateFollowupInput): FollowupRecord {
  const db = getDatabase();
  const id = `flw_${crypto.randomUUID()}`;
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO followups (
      id, workspace_id, customer_id, opportunity_id, title, note, due_at, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
  `);

  stmt.run(
    id,
    workspaceId,
    input.customerId,
    input.opportunityId || null,
    input.title.trim(),
    input.note ? input.note.trim() : null,
    input.dueAt,
    now,
    now
  );

  return {
    id,
    workspace_id: workspaceId,
    customer_id: input.customerId,
    opportunity_id: input.opportunityId || null,
    title: input.title.trim(),
    note: input.note ? input.note.trim() : null,
    due_at: input.dueAt,
    status: "pending",
    completed_at: null,
    created_at: now,
    updated_at: now,
  };
}

export function getFollowups(
  workspaceId: string,
  options: {
    tab?: "today" | "upcoming" | "overdue" | "completed";
    customerId?: string;
    referenceDate?: string; // YYYY-MM-DD in client local time
  } = {}
): FollowupRecord[] {
  const db = getDatabase();
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
    WHERE f.workspace_id = ?
  `;
  const params: any[] = [workspaceId];

  if (options.customerId) {
    query += " AND f.customer_id = ?";
    params.push(options.customerId);
  }

  if (options.tab === "today") {
    query += " AND f.status = 'pending' AND substr(f.due_at, 1, 10) = ?";
    params.push(todayStr);
  } else if (options.tab === "upcoming") {
    query += " AND f.status = 'pending' AND substr(f.due_at, 1, 10) > ?";
    params.push(todayStr);
  } else if (options.tab === "overdue") {
    query += " AND f.status = 'pending' AND substr(f.due_at, 1, 10) < ?";
    params.push(todayStr);
  } else if (options.tab === "completed") {
    query += " AND f.status = 'completed'";
  }

  // Sort: completed by completed_at desc, pending by due_at asc and newest created first
  if (options.tab === "completed") {
    query += " ORDER BY f.completed_at DESC";
  } else {
    query += " ORDER BY f.due_at ASC, f.created_at DESC";
  }

  return (db.prepare(query).all(...params) as unknown) as FollowupRecord[];
}

export function getFollowupById(workspaceId: string, followupId: string): FollowupRecord | null {
  const db = getDatabase();
  const row = (db
    .prepare(`
      SELECT 
        f.*,
        c.name as customer_name,
        c.phone as customer_phone,
        c.company as customer_company,
        o.title as opportunity_title
      FROM followups f
      JOIN customers c ON f.customer_id = c.id
      LEFT JOIN opportunities o ON f.opportunity_id = o.id
      WHERE f.id = ? AND f.workspace_id = ?
    `)
    .get(followupId, workspaceId) as unknown) as FollowupRecord | undefined;
  return row || null;
}

export function updateFollowupStatus(
  workspaceId: string,
  followupId: string,
  newStatus: FollowupStatus
): boolean {
  const db = getDatabase();
  const now = new Date().toISOString();
  const completedAt = newStatus === "completed" ? now : null;

  const stmt = db.prepare(`
    UPDATE followups
    SET status = ?, completed_at = ?, updated_at = ?
    WHERE id = ? AND workspace_id = ?
  `);

  const res = stmt.run(newStatus, completedAt, now, followupId, workspaceId) as any;
  return (res?.changes || 0) > 0;
}

export function rescheduleFollowup(
  workspaceId: string,
  followupId: string,
  newDueAt: string
): boolean {
  const db = getDatabase();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    UPDATE followups
    SET due_at = ?, status = 'pending', completed_at = NULL, updated_at = ?
    WHERE id = ? AND workspace_id = ?
  `);

  const res = stmt.run(newDueAt, now, followupId, workspaceId) as any;
  return (res?.changes || 0) > 0;
}

export function updateFollowup(
  workspaceId: string,
  followupId: string,
  input: UpdateFollowupInput
): FollowupRecord | null {
  const db = getDatabase();
  const existing = getFollowupById(workspaceId, followupId);
  if (!existing) return null;

  const now = new Date().toISOString();
  const title = input.title !== undefined ? input.title.trim() : existing.title;
  const note = input.note !== undefined ? (input.note ? input.note.trim() : null) : existing.note;
  const dueAt = input.dueAt !== undefined ? input.dueAt : existing.due_at;
  const status = input.status !== undefined ? input.status : existing.status;
  const completedAt =
    status === "completed" ? existing.completed_at || now : null;

  const stmt = db.prepare(`
    UPDATE followups
    SET title = ?, note = ?, due_at = ?, status = ?, completed_at = ?, updated_at = ?
    WHERE id = ? AND workspace_id = ?
  `);

  stmt.run(title, note, dueAt, status, completedAt, now, followupId, workspaceId);
  return getFollowupById(workspaceId, followupId);
}

export function deleteFollowup(workspaceId: string, followupId: string): boolean {
  const db = getDatabase();
  const stmt = db.prepare("DELETE FROM followups WHERE id = ? AND workspace_id = ?");
  const res = stmt.run(followupId, workspaceId) as any;
  return (res?.changes || 0) > 0;
}
