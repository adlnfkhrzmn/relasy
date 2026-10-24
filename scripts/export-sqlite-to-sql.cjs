/**
 * Mengubah backup SQLite menjadi file SQL yang bisa ditempel ke SQL Editor
 * Supabase. Ini opsional: aplikasi tetap berjalan normal dengan database
 * kosong. Gunakan skrip ini bila ingin membawa data lama ke Supabase.
 *
 * Pakai:
 *   npm run db:seed              -> semua baris
 *   npm run db:seed -- --clean   -> buang pelanggan yang namanya duplikat
 *
 * Keluaran: supabase/seed.sql
 */

const { DatabaseSync } = require("node:sqlite");
const fs = require("node:fs");
const path = require("node:path");

const CLEAN = process.argv.includes("--clean");

/* ------------------------------------------------------------------ */
/* Cari folder backup terbaru                                          */
/* ------------------------------------------------------------------ */

const backupRoot = path.join(process.cwd(), "backup");
if (!fs.existsSync(backupRoot)) {
  console.error("Folder backup/ tidak ditemukan.");
  process.exit(1);
}

const dirs = fs
  .readdirSync(backupRoot)
  .filter((d) => fs.statSync(path.join(backupRoot, d)).isDirectory())
  .sort();

if (dirs.length === 0) {
  console.error("Tidak ada folder backup di dalam backup/.");
  process.exit(1);
}

const latest = dirs[dirs.length - 1];
const dbPath = path.join(backupRoot, latest, "relasy.db");

if (!fs.existsSync(dbPath)) {
  console.error(`File database tidak ditemukan: ${dbPath}`);
  process.exit(1);
}

const db = new DatabaseSync(dbPath, { readOnly: true });

/* ------------------------------------------------------------------ */
/* Utilitas                                                            */
/* ------------------------------------------------------------------ */

/** Mengubah nilai JavaScript menjadi literal SQL yang aman. */
function sqlValue(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "NULL";
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  // Escape kutip tunggal dengan menggandakannya, cara standar SQL.
  return `'${String(value).replace(/'/g, "''")}'`;
}

function insertStatements(table, columns, rows) {
  if (rows.length === 0) return [];
  const columnList = columns.join(", ");
  // Satu INSERT per baris: lebih mudah dibaca dan lebih tahan terhadap
  // satu baris bermasalah dibanding INSERT multi-VALUES raksasa.
  return rows.map((row) => {
    const values = columns.map((col) => sqlValue(row[col])).join(", ");
    return `INSERT INTO ${table} (${columnList}) VALUES (${values}) ON CONFLICT DO NOTHING;`;
  });
}

/* ------------------------------------------------------------------ */
/* Ambil data                                                          */
/* ------------------------------------------------------------------ */

const workspaces = db.prepare("SELECT * FROM workspaces").all();
const users = db.prepare("SELECT * FROM users").all();

let customers = db.prepare("SELECT * FROM customers ORDER BY created_at").all();

if (CLEAN) {
  // Buang baris dengan nama persis sama, sisakan yang paling awal dibuat.
  // Ini menghilangkan sisa data uji berulang tanpa menyentuh data asli.
  const seen = new Set();
  const before = customers.length;
  customers = customers.filter((c) => {
    if (seen.has(c.name)) return false;
    seen.add(c.name);
    return true;
  });
  console.log(`--clean: pelanggan ${before} -> ${customers.length}`);
}

const keptIds = new Set(customers.map((c) => c.id));

const opportunities = db
  .prepare("SELECT * FROM opportunities ORDER BY created_at")
  .all()
  .filter((o) => keptIds.has(o.customer_id));

const keptOppIds = new Set(opportunities.map((o) => o.id));

const activities = db
  .prepare("SELECT * FROM activities ORDER BY created_at")
  .all()
  .filter((a) => keptIds.has(a.customer_id))
  .map((a) => (a.opportunity_id && !keptOppIds.has(a.opportunity_id) ? { ...a, opportunity_id: null } : a));

const followups = db
  .prepare("SELECT * FROM followups ORDER BY created_at")
  .all()
  .filter((f) => keptIds.has(f.customer_id))
  .map((f) => (f.opportunity_id && !keptOppIds.has(f.opportunity_id) ? { ...f, opportunity_id: null } : f));

const templates = db.prepare("SELECT * FROM followup_templates").all();

db.close();

/* ------------------------------------------------------------------ */
/* Susun SQL                                                           */
/* ------------------------------------------------------------------ */

const lines = [];
lines.push("-- ============================================================");
lines.push("-- Relasy: data awal (opsional)");
lines.push("-- ============================================================");
lines.push("--");
lines.push(`-- Sumber: backup/${latest}/relasy.db`);
lines.push(`-- Mode  : ${CLEAN ? "bersih (nama duplikat dibuang)" : "lengkap"}`);
lines.push("--");
lines.push("-- Cara pakai: jalankan supabase/schema.sql lebih dulu, lalu tempel");
lines.push("-- seluruh isi file ini ke SQL Editor Supabase dan klik Run.");
lines.push("--");
lines.push("-- File ini dihasilkan otomatis oleh scripts/export-sqlite-to-sql.mjs");
lines.push("-- ============================================================");
lines.push("");

lines.push(...insertStatements("workspaces", ["id", "name", "owner_id", "created_at", "updated_at"], workspaces));
lines.push(
  ...insertStatements(
    "users",
    ["id", "workspace_id", "name", "email", "password_hash", "created_at", "updated_at"],
    users
  )
);
lines.push(
  ...insertStatements(
    "customers",
    [
      "id",
      "workspace_id",
      "name",
      "phone",
      "email",
      "company",
      "source",
      "notes",
      "created_at",
      "updated_at",
      "archived_at",
    ],
    customers
  )
);
lines.push(
  ...insertStatements(
    "opportunities",
    [
      "id",
      "workspace_id",
      "customer_id",
      "title",
      "stage",
      "estimated_value",
      "expected_close_date",
      "created_at",
      "updated_at",
      "outcome_at",
    ],
    opportunities
  )
);
lines.push(
  ...insertStatements(
    "activities",
    ["id", "workspace_id", "customer_id", "opportunity_id", "type", "title", "body", "happened_at", "created_at"],
    activities
  )
);
lines.push(
  ...insertStatements(
    "followups",
    [
      "id",
      "workspace_id",
      "customer_id",
      "opportunity_id",
      "title",
      "note",
      "due_at",
      "status",
      "completed_at",
      "created_at",
      "updated_at",
    ],
    followups
  )
);
lines.push(
  ...insertStatements(
    "followup_templates",
    ["workspace_id", "is_enabled", "active_preset", "template_text", "updated_at"],
    templates.map((t) => ({ ...t, is_enabled: Boolean(t.is_enabled) }))
  )
);

const outPath = path.join(process.cwd(), "supabase", "seed.sql");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, lines.join("\n") + "\n", "utf8");

console.log(`Ditulis: supabase/seed.sql`);
console.log(
  `  workspace=${workspaces.length} user=${users.length} pelanggan=${customers.length} ` +
    `peluang=${opportunities.length} aktivitas=${activities.length} followup=${followups.length}`
);
