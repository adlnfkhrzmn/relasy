/**
 * Skema database Relasy untuk PostgreSQL (Supabase).
 *
 * Catatan desain:
 *
 * 1. Semua id tetap TEXT berformat `cust_<uuid>` dan seterusnya, supaya
 *    tidak ada perubahan pada kontrak API maupun kode antarmuka.
 *
 * 2. Kolom waktu memakai TEXT berformat ISO-8601 UTC, sama seperti versi
 *    SQLite sebelumnya. Alasannya praktis: seluruh kode aplikasi sudah
 *    memperlakukan waktu sebagai string, membandingkannya secara
 *    leksikografis (yang benar untuk ISO-8601), dan memotong tanggal dengan
 *    substr(). Mengubahnya menjadi timestamptz akan memaksa konversi di
 *    puluhan tempat dan berisiko menggeser tanggal karena zona waktu.
 *
 * 3. Nilai default waktu memakai ekspresi to_char(...) yang menghasilkan
 *    format identik dengan `new Date().toISOString()`, sehingga baris yang
 *    dibuat lewat SQL Editor pun konsisten dengan yang dibuat aplikasi.
 *
 * 4. `estimated_value` memakai BIGINT. Aplikasi selalu membacanya lewat
 *    driver yang mem-parse BIGINT menjadi number, jadi nilai Rupiah tetap
 *    berupa angka di JavaScript.
 */

/**
 * Ekspresi SQL yang menghasilkan waktu sekarang dalam format ISO-8601 UTC
 * dengan milidetik, misalnya `2026-10-24T05:58:20.490Z`.
 */
const NOW_ISO_UTC = `to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`;

export const SCHEMA_SQL = `
-- ============================================================
-- Relasy: skema PostgreSQL
-- ============================================================

-- Workspaces (batas tenant)
CREATE TABLE IF NOT EXISTS workspaces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id TEXT,
  created_at TEXT NOT NULL DEFAULT (${NOW_ISO_UTC}),
  updated_at TEXT NOT NULL DEFAULT (${NOW_ISO_UTC})
);

-- Users (akun yang bisa masuk)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (${NOW_ISO_UTC}),
  updated_at TEXT NOT NULL DEFAULT (${NOW_ISO_UTC}),
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
  created_at TEXT NOT NULL DEFAULT (${NOW_ISO_UTC}),
  updated_at TEXT NOT NULL DEFAULT (${NOW_ISO_UTC}),
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
  created_at TEXT NOT NULL DEFAULT (${NOW_ISO_UTC}),
  updated_at TEXT NOT NULL DEFAULT (${NOW_ISO_UTC}),
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
  happened_at TEXT NOT NULL DEFAULT (${NOW_ISO_UTC}),
  created_at TEXT NOT NULL DEFAULT (${NOW_ISO_UTC}),
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
  created_at TEXT NOT NULL DEFAULT (${NOW_ISO_UTC}),
  updated_at TEXT NOT NULL DEFAULT (${NOW_ISO_UTC}),
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
  updated_at TEXT NOT NULL DEFAULT (${NOW_ISO_UTC}),
  CONSTRAINT followup_templates_workspace_fk FOREIGN KEY (workspace_id)
    REFERENCES workspaces(id) ON DELETE CASCADE
);
`.trim();
