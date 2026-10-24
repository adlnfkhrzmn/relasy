// Menghasilkan supabase/schema.sql dari src/lib/db/schema.ts supaya file
// yang ditempel ke SQL Editor Supabase selalu identik dengan skema yang
// dipakai aplikasi.
const fs = require("node:fs");
const path = require("node:path");
const { SCHEMA_SQL } = require("../src/lib/db/schema.ts");

const header = `-- ============================================================
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

`;

const outPath = path.join(process.cwd(), "supabase", "schema.sql");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, header + SCHEMA_SQL + "\n", "utf8");

console.log(`Ditulis: supabase/schema.sql (${SCHEMA_SQL.length} karakter)`);
