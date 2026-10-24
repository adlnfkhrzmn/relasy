import { getDriver } from "../client";

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

interface CountRow {
  count: number;
}

interface CountValueRow {
  count: number;
  total_val: number;
}

export async function getDashboardMetrics(
  workspaceId: string,
  referenceDate?: string
): Promise<DashboardMetrics> {
  const db = getDriver();
  const todayStr = referenceDate || new Date().toISOString().split("T")[0];

  // Cast ::int dan ::bigint dipakai supaya PostgreSQL mengembalikan angka
  // biasa, bukan string. Tanpa cast, SUM/COUNT bertipe BIGINT dikirim
  // sebagai string dan nilai Rupiah akan tampil salah.
  const [custRows, openOppRows, wonOppRows, todayRows, overdueRows, completedRows] =
    await Promise.all([
      db.query<CountRow>(
        "SELECT COUNT(*)::int as count FROM customers WHERE workspace_id = $1 AND archived_at IS NULL",
        [workspaceId]
      ),
      db.query<CountValueRow>(
        `SELECT COUNT(*)::int as count, COALESCE(SUM(estimated_value), 0)::bigint as total_val
         FROM opportunities
         WHERE workspace_id = $1 AND stage IN ('baru', 'dihubungi', 'negosiasi')`,
        [workspaceId]
      ),
      db.query<CountValueRow>(
        `SELECT COUNT(*)::int as count, COALESCE(SUM(estimated_value), 0)::bigint as total_val
         FROM opportunities
         WHERE workspace_id = $1 AND stage = 'berhasil'`,
        [workspaceId]
      ),
      db.query<CountRow>(
        `SELECT COUNT(*)::int as count
         FROM followups
         WHERE workspace_id = $1 AND status = 'pending' AND substr(due_at, 1, 10) = $2`,
        [workspaceId, todayStr]
      ),
      db.query<CountRow>(
        `SELECT COUNT(*)::int as count
         FROM followups
         WHERE workspace_id = $1 AND status = 'pending' AND substr(due_at, 1, 10) < $2`,
        [workspaceId, todayStr]
      ),
      db.query<CountRow>(
        `SELECT COUNT(*)::int as count
         FROM followups
         WHERE workspace_id = $1 AND status = 'completed'`,
        [workspaceId]
      ),
    ]);

  const custRow = custRows[0];
  const openOppRow = openOppRows[0];
  const wonOppRow = wonOppRows[0];
  const tasksTodayRow = todayRows[0];
  const tasksOverdueRow = overdueRows[0];
  const tasksCompletedRow = completedRows[0];

  return {
    totalCustomers: Number(custRow?.count ?? 0),
    openOpportunities: Number(openOppRow?.count ?? 0),
    pipelineValue: Number(openOppRow?.total_val ?? 0),
    tasksToday: Number(tasksTodayRow?.count ?? 0),
    tasksOverdue: Number(tasksOverdueRow?.count ?? 0),
    tasksCompleted: Number(tasksCompletedRow?.count ?? 0),
    wonOpportunitiesCount: Number(wonOppRow?.count ?? 0),
    wonOpportunitiesValue: Number(wonOppRow?.total_val ?? 0),
  };
}
