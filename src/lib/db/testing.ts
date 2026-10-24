/**
 * Helper unit test: PostgreSQL in-process lewat PGlite.
 *
 * File ini sengaja terpisah dari `client.ts` supaya dependensi WASM PGlite
 * tidak pernah ikut ter-bundel ke build produksi. Hanya file test yang
 * mengimpor modul ini.
 *
 * Catatan performa: PGlite memuat PostgreSQL versi WASM, dan proses boot
 * itu memakan waktu. Karena itu satu instance dipakai ulang untuk seluruh
 * test dalam satu file, lalu isinya dikosongkan di antara test. Setiap file
 * test berjalan di worker terpisah, jadi tidak ada state yang bocor antar
 * file.
 */

import { PGlite } from "@electric-sql/pglite";
import type { DbDriver, SqlRow } from "./client";
import { SCHEMA_SQL } from "./schema";

const TABLES = [
  "activities",
  "followups",
  "opportunities",
  "customers",
  "followup_templates",
  "users",
  "workspaces",
];

interface SharedInstance {
  pg: PGlite;
  driver: DbDriver;
}

let shared: SharedInstance | null = null;

function createPgliteDriver(pg: PGlite): DbDriver {
  return {
    async query<T = SqlRow>(queryText: string, params: any[] = []): Promise<T[]> {
      const result = await pg.query(queryText, params);
      return result.rows as unknown as T[];
    },
    async execute(executeText: string, params: any[] = []): Promise<number> {
      const result = await pg.query(executeText, params);
      return Number(result.affectedRows ?? 0);
    },
    async exec(execText: string): Promise<void> {
      await pg.exec(execText);
    },
  };
}

/**
 * Mengembalikan database test yang sudah memiliki skema dan dalam keadaan
 * kosong. Aman dipanggil di `beforeEach` karena isinya di-truncate.
 */
export async function createTestDatabase(): Promise<DbDriver> {
  if (!shared) {
    const pg = new PGlite();
    await pg.exec(SCHEMA_SQL);
    shared = { pg, driver: createPgliteDriver(pg) };
    return shared.driver;
  }

  await shared.pg.exec(
    `TRUNCATE TABLE ${TABLES.join(", ")} RESTART IDENTITY CASCADE`
  );
  return shared.driver;
}
