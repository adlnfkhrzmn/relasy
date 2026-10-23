export const SCHEMA_SQL = `
-- Workspaces (tenant boundary)
CREATE TABLE IF NOT EXISTS workspaces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Users (authenticated accounts)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
);

-- Customers (contact records)
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  company TEXT,
  source TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  archived_at TEXT,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_customers_workspace ON customers(workspace_id);
CREATE INDEX IF NOT EXISTS idx_customers_archived ON customers(workspace_id, archived_at);

-- Opportunities (sales pipeline)
CREATE TABLE IF NOT EXISTS opportunities (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  title TEXT NOT NULL,
  stage TEXT NOT NULL CHECK (stage IN ('baru', 'dihubungi', 'negosiasi', 'berhasil', 'tidak_berhasil')),
  estimated_value INTEGER DEFAULT 0,
  expected_close_date TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  outcome_at TEXT,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_opportunities_workspace ON opportunities(workspace_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON opportunities(workspace_id, stage);
CREATE INDEX IF NOT EXISTS idx_opportunities_customer ON opportunities(customer_id);

-- Activities (interaction history notes)
CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  opportunity_id TEXT,
  type TEXT NOT NULL CHECK (type IN ('catatan', 'telepon', 'pertemuan', 'pesan_manual', 'lainnya')),
  title TEXT NOT NULL,
  body TEXT,
  happened_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_activities_customer ON activities(customer_id, happened_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_workspace ON activities(workspace_id, happened_at DESC);

-- Follow-up Tasks (reminders and to-dos)
CREATE TABLE IF NOT EXISTS followups (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  opportunity_id TEXT,
  title TEXT NOT NULL,
  note TEXT,
  due_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_followups_workspace_status ON followups(workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_followups_due ON followups(workspace_id, due_at);
CREATE INDEX IF NOT EXISTS idx_followups_customer ON followups(customer_id);

-- Follow-up Text Templates (per workspace configuration)
CREATE TABLE IF NOT EXISTS followup_templates (
  workspace_id TEXT PRIMARY KEY,
  is_enabled INTEGER NOT NULL DEFAULT 1,
  active_preset TEXT NOT NULL DEFAULT 'eksekutif_ramah',
  template_text TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
);
`;
