/**
 * Memverifikasi supabase/schema.sql terhadap PostgreSQL in-process (PGlite).
 *
 * Memastikan skrip SQL Editor Supabase benar-benar berjalan: idempoten,
 * constraint aktif, cascade delete bekerja, dan default waktu berformat
 * ISO-8601 UTC.
 *
 * Pakai: node scripts/verify-schema.cjs
 */

// Memastikan supabase/schema.sql benar-benar bisa dijalankan di PostgreSQL.
const fs = require("fs");
const { PGlite } = require("@electric-sql/pglite");

(async () => {
  const sql = fs.readFileSync("supabase/schema.sql", "utf8");
  const db = new PGlite();

  // Jalankan dua kali untuk membuktikan skripnya idempoten.
  await db.exec(sql);
  console.log("Run #1: OK");
  await db.exec(sql);
  console.log("Run #2 (idempoten): OK");

  const tables = await db.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name"
  );
  console.log("Tabel terbentuk:", tables.rows.map((r) => r.table_name).join(", "));

  // Uji bahwa default waktu berformat ISO-8601 UTC dengan milidetik.
  await db.query("INSERT INTO workspaces (id, name) VALUES ($1, $2)", ["ws_x", "Toko"]);
  const ws = await db.query("SELECT created_at FROM workspaces WHERE id='ws_x'");
  const createdAt = ws.rows[0].created_at;
  const isoPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
  console.log("created_at default:", createdAt, "-> format ISO valid:", isoPattern.test(createdAt));

  // Uji constraint stage.
  await db.query("INSERT INTO customers (id, workspace_id, name) VALUES ($1,$2,$3)", [
    "c1",
    "ws_x",
    "Budi",
  ]);
  try {
    await db.query(
      "INSERT INTO opportunities (id, workspace_id, customer_id, title, stage) VALUES ($1,$2,$3,$4,$5)",
      ["o1", "ws_x", "c1", "X", "stage_ngawur"]
    );
    console.log("CHECK constraint: GAGAL (seharusnya menolak)");
  } catch {
    console.log("CHECK constraint stage: OK (menolak nilai tidak valid)");
  }

  // Uji cascade delete.
  await db.query("DELETE FROM workspaces WHERE id='ws_x'");
  const left = await db.query("SELECT COUNT(*)::int AS c FROM customers");
  console.log("Cascade delete customers:", left.rows[0].c === 0 ? "OK" : "GAGAL");

  await db.close();
})().catch((e) => {
  console.error("GAGAL:", e.message);
  process.exit(1);
});
