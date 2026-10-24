import { getDriver } from "../client";
import { PipelineStage } from "@/lib/constants";
import crypto from "crypto";

export interface OpportunityRecord {
  id: string;
  workspace_id: string;
  customer_id: string;
  customer_name?: string;
  title: string;
  stage: PipelineStage;
  estimated_value: number;
  expected_close_date: string | null;
  created_at: string;
  updated_at: string;
  outcome_at: string | null;
}

export interface CreateOpportunityInput {
  customerId: string;
  title: string;
  stage?: PipelineStage;
  estimatedValue?: number;
  expectedCloseDate?: string | null;
}

export interface UpdateOpportunityInput {
  title?: string;
  stage?: PipelineStage;
  estimatedValue?: number;
  expectedCloseDate?: string | null;
}

export async function createOpportunity(
  workspaceId: string,
  input: CreateOpportunityInput
): Promise<OpportunityRecord> {
  const db = getDriver();
  const id = `opp_${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  const stage = input.stage || "baru";
  const estimatedValue = Math.max(0, Math.round(input.estimatedValue || 0));
  const title = input.title.trim();
  const expectedCloseDate = input.expectedCloseDate || null;

  await db.query(
    `INSERT INTO opportunities (
       id, workspace_id, customer_id, title, stage, estimated_value, expected_close_date, created_at, updated_at
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [id, workspaceId, input.customerId, title, stage, estimatedValue, expectedCloseDate, now, now]
  );

  return {
    id,
    workspace_id: workspaceId,
    customer_id: input.customerId,
    title,
    stage,
    estimated_value: estimatedValue,
    expected_close_date: expectedCloseDate,
    created_at: now,
    updated_at: now,
    outcome_at: null,
  };
}

export async function getOpportunities(
  workspaceId: string,
  options: {
    customerId?: string;
    stage?: PipelineStage;
  } = {}
): Promise<OpportunityRecord[]> {
  const db = getDriver();
  let query = `
    SELECT o.*, c.name as customer_name
    FROM opportunities o
    JOIN customers c ON o.customer_id = c.id
    WHERE o.workspace_id = $1
  `;
  const params: any[] = [workspaceId];

  if (options.customerId) {
    params.push(options.customerId);
    query += ` AND o.customer_id = $${params.length}`;
  }

  if (options.stage) {
    params.push(options.stage);
    query += ` AND o.stage = $${params.length}`;
  }

  query += " ORDER BY o.updated_at DESC";

  return db.query<OpportunityRecord>(query, params);
}

export async function getOpportunityById(
  workspaceId: string,
  opportunityId: string
): Promise<OpportunityRecord | null> {
  const db = getDriver();
  const rows = await db.query<OpportunityRecord>(
    `
    SELECT o.*, c.name as customer_name
    FROM opportunities o
    JOIN customers c ON o.customer_id = c.id
    WHERE o.id = $1 AND o.workspace_id = $2
  `,
    [opportunityId, workspaceId]
  );
  return rows[0] || null;
}

export async function updateOpportunityStage(
  workspaceId: string,
  opportunityId: string,
  newStage: PipelineStage
): Promise<boolean> {
  const db = getDriver();
  const now = new Date().toISOString();
  const isFinalOutcome = newStage === "berhasil" || newStage === "tidak_berhasil";
  const outcomeAt = isFinalOutcome ? now : null;

  const affected = await db.execute(
    `UPDATE opportunities
     SET stage = $1, outcome_at = $2, updated_at = $3
     WHERE id = $4 AND workspace_id = $5`,
    [newStage, outcomeAt, now, opportunityId, workspaceId]
  );
  return affected > 0;
}

export async function updateOpportunity(
  workspaceId: string,
  opportunityId: string,
  input: UpdateOpportunityInput
): Promise<OpportunityRecord | null> {
  const db = getDriver();
  const existing = await getOpportunityById(workspaceId, opportunityId);
  if (!existing) return null;

  const now = new Date().toISOString();
  const title = input.title !== undefined ? input.title.trim() : existing.title;
  const stage = input.stage !== undefined ? input.stage : existing.stage;
  const estimatedValue =
    input.estimatedValue !== undefined
      ? Math.max(0, Math.round(input.estimatedValue))
      : existing.estimated_value;
  const expectedCloseDate =
    input.expectedCloseDate !== undefined ? input.expectedCloseDate : existing.expected_close_date;

  const isFinalOutcome = stage === "berhasil" || stage === "tidak_berhasil";
  const outcomeAt = isFinalOutcome ? existing.outcome_at || now : null;

  await db.execute(
    `UPDATE opportunities
     SET title = $1, stage = $2, estimated_value = $3, expected_close_date = $4, outcome_at = $5, updated_at = $6
     WHERE id = $7 AND workspace_id = $8`,
    [title, stage, estimatedValue, expectedCloseDate, outcomeAt, now, opportunityId, workspaceId]
  );

  return getOpportunityById(workspaceId, opportunityId);
}

export async function deleteOpportunity(
  workspaceId: string,
  opportunityId: string
): Promise<boolean> {
  const db = getDriver();
  const affected = await db.execute(
    "DELETE FROM opportunities WHERE id = $1 AND workspace_id = $2",
    [opportunityId, workspaceId]
  );
  return affected > 0;
}
