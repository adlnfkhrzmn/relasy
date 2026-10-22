import { getDatabase } from "../client";
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

export function createOpportunity(
  workspaceId: string,
  input: CreateOpportunityInput
): OpportunityRecord {
  const db = getDatabase();
  const id = `opp_${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  const stage = input.stage || "baru";
  const estimatedValue = Math.max(0, Math.round(input.estimatedValue || 0));

  const stmt = db.prepare(`
    INSERT INTO opportunities (
      id, workspace_id, customer_id, title, stage, estimated_value, expected_close_date, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    workspaceId,
    input.customerId,
    input.title.trim(),
    stage,
    estimatedValue,
    input.expectedCloseDate || null,
    now,
    now
  );

  return {
    id,
    workspace_id: workspaceId,
    customer_id: input.customerId,
    title: input.title.trim(),
    stage,
    estimated_value: estimatedValue,
    expected_close_date: input.expectedCloseDate || null,
    created_at: now,
    updated_at: now,
    outcome_at: null,
  };
}

export function getOpportunities(
  workspaceId: string,
  options: {
    customerId?: string;
    stage?: PipelineStage;
  } = {}
): OpportunityRecord[] {
  const db = getDatabase();
  let query = `
    SELECT o.*, c.name as customer_name
    FROM opportunities o
    JOIN customers c ON o.customer_id = c.id
    WHERE o.workspace_id = ?
  `;
  const params: any[] = [workspaceId];

  if (options.customerId) {
    query += " AND o.customer_id = ?";
    params.push(options.customerId);
  }

  if (options.stage) {
    query += " AND o.stage = ?";
    params.push(options.stage);
  }

  query += " ORDER BY o.updated_at DESC";

  return (db.prepare(query).all(...params) as unknown) as OpportunityRecord[];
}

export function getOpportunityById(
  workspaceId: string,
  opportunityId: string
): OpportunityRecord | null {
  const db = getDatabase();
  const row = (db
    .prepare(`
      SELECT o.*, c.name as customer_name
      FROM opportunities o
      JOIN customers c ON o.customer_id = c.id
      WHERE o.id = ? AND o.workspace_id = ?
    `)
    .get(opportunityId, workspaceId) as unknown) as OpportunityRecord | undefined;
  return row || null;
}

export function updateOpportunityStage(
  workspaceId: string,
  opportunityId: string,
  newStage: PipelineStage
): boolean {
  const db = getDatabase();
  const now = new Date().toISOString();
  const isFinalOutcome = newStage === "berhasil" || newStage === "tidak_berhasil";
  const outcomeAt = isFinalOutcome ? now : null;

  const stmt = db.prepare(`
    UPDATE opportunities
    SET stage = ?, outcome_at = ?, updated_at = ?
    WHERE id = ? AND workspace_id = ?
  `);

  const res = stmt.run(newStage, outcomeAt, now, opportunityId, workspaceId) as any;
  return (res?.changes || 0) > 0;
}

export function updateOpportunity(
  workspaceId: string,
  opportunityId: string,
  input: UpdateOpportunityInput
): OpportunityRecord | null {
  const db = getDatabase();
  const existing = getOpportunityById(workspaceId, opportunityId);
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

  const stmt = db.prepare(`
    UPDATE opportunities
    SET title = ?, stage = ?, estimated_value = ?, expected_close_date = ?, outcome_at = ?, updated_at = ?
    WHERE id = ? AND workspace_id = ?
  `);

  stmt.run(title, stage, estimatedValue, expectedCloseDate, outcomeAt, now, opportunityId, workspaceId);
  return getOpportunityById(workspaceId, opportunityId);
}

export function deleteOpportunity(workspaceId: string, opportunityId: string): boolean {
  const db = getDatabase();
  const stmt = db.prepare("DELETE FROM opportunities WHERE id = ? AND workspace_id = ?");
  const res = stmt.run(opportunityId, workspaceId) as any;
  return (res?.changes || 0) > 0;
}
