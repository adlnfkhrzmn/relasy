import { getDriver } from "../client";
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

export async function createActivity(
  workspaceId: string,
  input: CreateActivityInput
): Promise<ActivityRecord> {
  const db = getDriver();
  const id = `act_${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  const happenedAt = input.happenedAt || now;

  const title = input.title.trim();
  const body = input.body ? input.body.trim() : null;
  const opportunityId = input.opportunityId || null;

  await db.query(
    `INSERT INTO activities (
       id, workspace_id, customer_id, opportunity_id, type, title, body, happened_at, created_at
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [id, workspaceId, input.customerId, opportunityId, input.type, title, body, happenedAt, now]
  );

  return {
    id,
    workspace_id: workspaceId,
    customer_id: input.customerId,
    opportunity_id: opportunityId,
    type: input.type,
    title,
    body,
    happened_at: happenedAt,
    created_at: now,
  };
}

export async function getActivities(
  workspaceId: string,
  options: {
    customerId?: string;
    opportunityId?: string;
    limit?: number;
  } = {}
): Promise<ActivityRecord[]> {
  const db = getDriver();
  let query = `
    SELECT
      a.*,
      c.name as customer_name,
      o.title as opportunity_title
    FROM activities a
    JOIN customers c ON a.customer_id = c.id
    LEFT JOIN opportunities o ON a.opportunity_id = o.id
    WHERE a.workspace_id = $1
  `;
  const params: any[] = [workspaceId];

  if (options.customerId) {
    params.push(options.customerId);
    query += ` AND a.customer_id = $${params.length}`;
  }

  if (options.opportunityId) {
    params.push(options.opportunityId);
    query += ` AND a.opportunity_id = $${params.length}`;
  }

  query += " ORDER BY a.happened_at DESC, a.created_at DESC";

  if (options.limit) {
    params.push(options.limit);
    query += ` LIMIT $${params.length}`;
  }

  return db.query<ActivityRecord>(query, params);
}

export async function getActivityById(
  workspaceId: string,
  activityId: string
): Promise<ActivityRecord | null> {
  const db = getDriver();
  const rows = await db.query<ActivityRecord>(
    `
    SELECT
      a.*,
      c.name as customer_name,
      o.title as opportunity_title
    FROM activities a
    JOIN customers c ON a.customer_id = c.id
    LEFT JOIN opportunities o ON a.opportunity_id = o.id
    WHERE a.id = $1 AND a.workspace_id = $2
  `,
    [activityId, workspaceId]
  );
  return rows[0] || null;
}
