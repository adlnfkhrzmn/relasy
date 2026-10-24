/**
 * Server PostgreSQL lokal untuk pengujian end-to-end.
 *
 * Menjalankan PGlite sebagai server yang berbicara protokol wire PostgreSQL
 * sungguhan. Dengan begitu aplikasi memakai jalur kode produksi yang sama
 * persis (`DATABASE_URL` + driver `postgres`), tanpa pengecualian khusus.
 *
 * Pakai:
 *   node scripts/local-pg-server.cjs            -> port 55432
 *   node scripts/local-pg-server.cjs 55433      -> port lain
 */

const path = require("node:path");
const fs = require("node:fs");

async function main() {
  const { PGlite } = require("@electric-sql/pglite");
  const { PGLiteSocketServer } = require("@electric-sql/pglite-socket");

  const port = Number(process.argv[2] || 55432);
  const dataDir = path.join(process.cwd(), "data", "local-pg");

  fs.mkdirSync(dataDir, { recursive: true });

  const db = new PGlite(dataDir);
  await db.waitReady;

  const server = new PGLiteSocketServer({
    db,
    port,
    host: "127.0.0.1",
    // Beberapa koneksi sekaligus supaya alat bantu (psql, skrip inspeksi)
    // bisa terhubung bersamaan dengan aplikasi yang sedang berjalan.
    maxConnections: 10,
  });

  await server.start();
  console.log(`PostgreSQL lokal siap di 127.0.0.1:${port}`);
  console.log(`Data: ${dataDir}`);

  const shutdown = async () => {
    try {
      await server.stop();
      await db.close();
    } finally {
      process.exit(0);
    }
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((error) => {
  console.error("Gagal menjalankan server lokal:", error.message);
  process.exit(1);
});
