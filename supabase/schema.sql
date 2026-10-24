-- ============================================================
-- Relasy: skema database untuk Supabase
-- ============================================================
--
-- Cara pakai:
--   1. Buka project Supabase, pilih menu SQL Editor.
--   2. Klik "New query", tempel seluruh isi file ini.
--   3. Klik "Run". Semua tabel langsung terbentuk.
--
-- Skrip ini idempoten: aman dijalankan berulang kali.
--
-- Catatan: kolom waktu memakai TEXT berformat ISO-8601 UTC, bukan
-- timestamptz. Ini disengaja agar perilakunya sama persis dengan versi
-- sebelumnya dan tidak ada tanggal yang bergeser karena zona waktu.
--
-- File ini dihasilkan otomatis dari src/lib/db/schema.ts.
-- Jangan diubah manual; ubah sumbernya lalu jalankan: npm run db:sql
-- ============================================================

-- ============================================================
-- Relasy: skema PostgreSQL
-- ============================================================

-- Workspaces (batas tenant)
CREATE TABLE IF NOT EXISTS workspaces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id TEXT,
  created_at TEXT NOT NULL DEFAULT (to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')),
  updated_at TEXT NOT NULL DEFAULT (to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'))
);

-- Users (akun yang bisa masuk)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')),
  updated_at TEXT NOT NULL DEFAULT (to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')),
  CONSTRAINT users_workspace_fk FOREIGN KEY (workspace_id)
    REFERENCES workspaces(id) ON DELETE CASCADE
);

-- Customers (data pelanggan)
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  company TEXT,
  source TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')),
  updated_at TEXT NOT NULL DEFAULT (to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')),
  archived_at TEXT,
  CONSTRAINT customers_workspace_fk FOREIGN KEY (workspace_id)
    REFERENCES workspaces(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_customers_workspace ON customers(workspace_id);
CREATE INDEX IF NOT EXISTS idx_customers_archived ON customers(workspace_id, archived_at);

-- Opportunities (peluang penjualan)
CREATE TABLE IF NOT EXISTS opportunities (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  title TEXT NOT NULL,
  stage TEXT NOT NULL CHECK (stage IN ('baru', 'dihubungi', 'negosiasi', 'berhasil', 'tidak_berhasil')),
  estimated_value BIGINT DEFAULT 0,
  expected_close_date TEXT,
  created_at TEXT NOT NULL DEFAULT (to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')),
  updated_at TEXT NOT NULL DEFAULT (to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')),
  outcome_at TEXT,
  CONSTRAINT opportunities_workspace_fk FOREIGN KEY (workspace_id)
    REFERENCES workspaces(id) ON DELETE CASCADE,
  CONSTRAINT opportunities_customer_fk FOREIGN KEY (customer_id)
    REFERENCES customers(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_opportunities_workspace ON opportunities(workspace_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON opportunities(workspace_id, stage);
CREATE INDEX IF NOT EXISTS idx_opportunities_customer ON opportunities(customer_id);

-- Activities (riwayat interaksi)
CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  opportunity_id TEXT,
  type TEXT NOT NULL CHECK (type IN ('catatan', 'telepon', 'pertemuan', 'pesan_manual', 'lainnya')),
  title TEXT NOT NULL,
  body TEXT,
  happened_at TEXT NOT NULL DEFAULT (to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')),
  created_at TEXT NOT NULL DEFAULT (to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')),
  CONSTRAINT activities_workspace_fk FOREIGN KEY (workspace_id)
    REFERENCES workspaces(id) ON DELETE CASCADE,
  CONSTRAINT activities_customer_fk FOREIGN KEY (customer_id)
    REFERENCES customers(id) ON DELETE CASCADE,
  CONSTRAINT activities_opportunity_fk FOREIGN KEY (opportunity_id)
    REFERENCES opportunities(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_activities_customer ON activities(customer_id, happened_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_workspace ON activities(workspace_id, happened_at DESC);

-- Follow-up Tasks (tugas pengingat)
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
  created_at TEXT NOT NULL DEFAULT (to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')),
  updated_at TEXT NOT NULL DEFAULT (to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')),
  CONSTRAINT followups_workspace_fk FOREIGN KEY (workspace_id)
    REFERENCES workspaces(id) ON DELETE CASCADE,
  CONSTRAINT followups_customer_fk FOREIGN KEY (customer_id)
    REFERENCES customers(id) ON DELETE CASCADE,
  CONSTRAINT followups_opportunity_fk FOREIGN KEY (opportunity_id)
    REFERENCES opportunities(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_followups_workspace_status ON followups(workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_followups_due ON followups(workspace_id, due_at);
CREATE INDEX IF NOT EXISTS idx_followups_customer ON followups(customer_id);

-- Follow-up Templates (pengaturan teks follow-up per workspace)
CREATE TABLE IF NOT EXISTS followup_templates (
  workspace_id TEXT PRIMARY KEY,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  active_preset TEXT NOT NULL DEFAULT 'eksekutif_ramah',
  template_text TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')),
  CONSTRAINT followup_templates_workspace_fk FOREIGN KEY (workspace_id)
    REFERENCES workspaces(id) ON DELETE CASCADE
);
