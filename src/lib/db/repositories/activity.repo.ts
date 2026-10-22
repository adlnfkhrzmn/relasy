import { getDatabase } from "../client";
import { ActivityType } from "@/lib/constants";
import crypto from "crypto";

export interface ActivityRecord {
  id: string;
  workspace_id: string;
  customer_id: string;
  customer_name?: string;
  opportunity_id: string | null;
  opportunity_title?: string | null;
  type: ActivityType;
  title: string;
  body: string | null;
  happened_at: string;
  created_at: string;
}

export interface CreateActivityInput {
  customerId: string;
  opportunityId?: string | null;
  type: ActivityType;
  title: string;
  body?: string | null;
  happenedAt?: string;
}

export function createActivity(workspaceId: string, input: CreateActivityInput): ActivityRecord {
  const db = getDatabase();
  const id = `act_${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  const happenedAt = input.happenedAt || now;

  const stmt = db.prepare(`
    INSERT INTO activities (
      id, workspace_id, customer_id, opportunity_id, type, title, body, happened_at, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    workspaceId,
    input.customerId,
    input.opportunityId || null,
    input.type,
    input.title.trim(),
    input.body ? input.body.trim() : null,
    happenedAt,
    now
  );

  return {
    id,
    workspace_id: workspaceId,
    customer_id: input.customerId,
    opportunity_id: input.opportunityId || null,
    type: input.type,
    title: input.title.trim(),
    body: input.body ? input.body.trim() : null,
    happened_at: happenedAt,
    created_at: now,
  };
}

export function getActivities(
  workspaceId: string,
  options: {
    customerId?: string;
    opportunityId?: string;
    limit?: number;
  } = {}
): ActivityRecord[] {
  const db = getDatabase();
  let query = `
    SELECT 
      a.*,
      c.name as customer_name,
      o.title as opportunity_title
    FROM activities a
    JOIN customers c ON a.customer_id = c.id
    LEFT JOIN opportunities o ON a.opportunity_id = o.id
    WHERE a.workspace_id = ?
  `;
  const params: any[] = [workspaceId];

  if (options.customerId) {
    query += " AND a.customer_id = ?";
    params.push(options.customerId);
  }

  if (options.opportunityId) {
    query += " AND a.opportunity_id = ?";
    params.push(options.opportunityId);
  }

  query += " ORDER BY a.happened_at DESC, a.created_at DESC";

  if (options.limit) {
    query += " LIMIT ?";
    params.push(options.limit);
  }

  return (db.prepare(query).all(...params) as unknown) as ActivityRecord[];
}

export function getActivityById(workspaceId: string, activityId: string): ActivityRecord | null {
  const db = getDatabase();
  const row = (db
    .prepare(`
      SELECT 
        a.*,
        c.name as customer_name,
        o.title as opportunity_title
      FROM activities a
      JOIN customers c ON a.customer_id = c.id
      LEFT JOIN opportunities o ON a.opportunity_id = o.id
      WHERE a.id = ? AND a.workspace_id = ?
    `)
    .get(activityId, workspaceId) as unknown) as ActivityRecord | undefined;
  return row || null;
}
