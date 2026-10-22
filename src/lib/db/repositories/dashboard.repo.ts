import { getDatabase } from "../client";

export interface DashboardMetrics {
  totalCustomers: number;
  openOpportunities: number;
  pipelineValue: number;
  tasksToday: number;
  tasksOverdue: number;
  tasksCompleted: number;
  wonOpportunitiesCount: number;
  wonOpportunitiesValue: number;
}

export function getDashboardMetrics(
  workspaceId: string,
  referenceDate?: string
): DashboardMetrics {
  const db = getDatabase();
  const todayStr = referenceDate || new Date().toISOString().split("T")[0];

  // Total active customers
  const custRow = (db
    .prepare("SELECT COUNT(*) as count FROM customers WHERE workspace_id = ? AND archived_at IS NULL")
    .get(workspaceId) as unknown) as { count: number } | undefined;

  // Open opportunities (stages: baru, dihubungi, negosiasi)
  const openOppRow = (db
    .prepare(
      `SELECT COUNT(*) as count, COALESCE(SUM(estimated_value), 0) as total_val 
       FROM opportunities 
       WHERE workspace_id = ? AND stage IN ('baru', 'dihubungi', 'negosiasi')`
    )
    .get(workspaceId) as unknown) as { count: number; total_val: number } | undefined;

  // Won opportunities
  const wonOppRow = (db
    .prepare(
      `SELECT COUNT(*) as count, COALESCE(SUM(estimated_value), 0) as total_val 
       FROM opportunities 
       WHERE workspace_id = ? AND stage = 'berhasil'`
    )
    .get(workspaceId) as unknown) as { count: number; total_val: number } | undefined;

  // Follow-ups today
  const tasksTodayRow = (db
    .prepare(
      `SELECT COUNT(*) as count 
       FROM followups 
       WHERE workspace_id = ? AND status = 'pending' AND substr(due_at, 1, 10) = ?`
    )
    .get(workspaceId, todayStr) as unknown) as { count: number } | undefined;

  // Follow-ups overdue
  const tasksOverdueRow = (db
    .prepare(
      `SELECT COUNT(*) as count 
       FROM followups 
       WHERE workspace_id = ? AND status = 'pending' AND substr(due_at, 1, 10) < ?`
    )
    .get(workspaceId, todayStr) as unknown) as { count: number } | undefined;

  // Follow-ups completed
  const tasksCompletedRow = (db
    .prepare(
      `SELECT COUNT(*) as count 
       FROM followups 
       WHERE workspace_id = ? AND status = 'completed'`
    )
    .get(workspaceId) as unknown) as { count: number } | undefined;

  return {
    totalCustomers: custRow?.count || 0,
    openOpportunities: openOppRow?.count || 0,
    pipelineValue: openOppRow?.total_val || 0,
    tasksToday: tasksTodayRow?.count || 0,
    tasksOverdue: tasksOverdueRow?.count || 0,
    tasksCompleted: tasksCompletedRow?.count || 0,
    wonOpportunitiesCount: wonOppRow?.count || 0,
    wonOpportunitiesValue: wonOppRow?.total_val || 0,
  };
}
