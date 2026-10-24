/**
 * Lapisan koneksi database Relasy.
 *
 * Produksi memakai PostgreSQL (Supabase) lewat driver `postgres`. Unit test
 * memakai PGlite, yaitu PostgreSQL yang berjalan in-process, sehingga query
 * yang diuji benar-benar query dialek PostgreSQL yang sama seperti produksi.
 *
 * Semua fungsi repository bersifat async karena kedua backend di atas async.
 */

import postgres from "postgres";

export type SqlRow = Record<string, any>;

export interface DbDriver {
  /**
   * Menjalankan query dan mengembalikan seluruh baris.
   * `params` memakai placeholder `$1`, `$2`, ... (gaya PostgreSQL).
   */
  query<T = SqlRow>(sql: string, params?: any[]): Promise<T[]>;
  /**
   * Menjalankan statement tulis (UPDATE/DELETE) dan mengembalikan jumlah
   * baris yang benar-benar terpengaruh. Dipakai untuk menentukan berhasil
   * atau tidaknya sebuah operasi.
   */
  execute(sql: string, params?: any[]): Promise<number>;
  /**
   * Menjalankan satu atau beberapa statement tanpa parameter.
   * Dipakai untuk inisialisasi skema.
   */
  exec(sql: string): Promise<void>;
}

/* ------------------------------------------------------------------ */
/* Driver PostgreSQL                                                   */
/* ------------------------------------------------------------------ */

function createPostgresDriver(connectionString: string): DbDriver {
  const sql = postgres(connectionString, {
    // Supabase memakai connection pooler (PgBouncer/Supavisor). Prepared
    // statement bernama tidak didukung di mode transaction pooling, jadi
    // dimatikan. Ini juga syarat resmi Supabase untuk port 6543.
    prepare: false,
    // Satu koneksi per instance serverless. Vercel menjalankan banyak
    // instance kecil, jadi jumlah koneksi harus ditekan.
    max: 1,
    idle_timeout: 20,
    connect_timeout: 15,
    // Inisialisasi skema memakai CREATE TABLE IF NOT EXISTS, yang selalu
    // memunculkan NOTICE "already exists" saat tabelnya memang sudah ada.
    // Di Vercel itu terjadi pada setiap cold start, jadi NOTICE-nya dibuang
    // agar log tidak penuh pesan yang bukan masalah.
    onnotice: () => {},
    // Paksa BIGINT dan NUMERIC kembali sebagai number. Tanpa ini keduanya
    // dikembalikan sebagai string dan nilai Rupiah akan tampil rusak.
    types: {
      bigint: {
        to: 20,
        from: [20],
        serialize: (x: number | bigint) => String(x),
        parse: (x: string) => Number(x),
      },
      numeric: {
        to: 1700,
        from: [1700],
        serialize: (x: number) => String(x),
        parse: (x: string) => Number(x),
      },
    },
  });

  return {
    async query<T = SqlRow>(queryText: string, params: any[] = []): Promise<T[]> {
      const result = await sql.unsafe(queryText, params);
      return result as unknown as T[];
    },
    async execute(executeText: string, params: any[] = []): Promise<number> {
      const result = await sql.unsafe(executeText, params);
      return Number((result as any).count ?? 0);
    },
    async exec(execText: string): Promise<void> {
      await sql.unsafe(execText);
    },
  };
}

/* ------------------------------------------------------------------ */
/* Singleton                                                           */
/* ------------------------------------------------------------------ */

let driverInstance: DbDriver | null = null;
let schemaReady: Promise<void> | null = null;

/**
 * Mengembalikan driver aktif. Di produksi memakai PostgreSQL dari
 * `DATABASE_URL`. Unit test memasang driver PGlite lewat `setDriver`.
 */
export function getDriver(): DbDriver {
  if (driverInstance) return driverInstance;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL belum diatur. Tambahkan connection string Supabase " +
        "(gunakan host pooler port 6543) ke environment variables."
    );
  }

  driverInstance = createPostgresDriver(url);
  return driverInstance;
}

/**
 * Kode error PostgreSQL yang berarti "objek ini sudah ada". Ini bisa terjadi
 * ketika dua instance serverless menjalankan inisialisasi skema hampir
 * bersamaan: keduanya melihat tabel belum ada, lalu salah satunya kalah
 * balapan. Kondisi itu bukan kegagalan nyata, jadi diabaikan.
 */
const ALREADY_EXISTS_CODES = new Set([
  "42P07", // duplicate_table
  "42710", // duplicate_object (index, constraint)
  "23505", // unique_violation (race pada katalog internal PostgreSQL)
]);

function isAlreadyExistsError(error: unknown): boolean {
  const code = (error as { code?: string } | null)?.code;
  return typeof code === "string" && ALREADY_EXISTS_CODES.has(code);
}

/**
 * Memastikan skema sudah dibuat. Aman dipanggil berkali-kali dan dari
 * beberapa request sekaligus karena hasilnya di-cache dalam Promise.
 *
 * Set `RELASY_SKIP_SCHEMA_INIT=1` bila tabel sudah dibuat manual lewat SQL
 * Editor Supabase. Pada mode itu aplikasi tidak menyentuh DDL sama sekali.
 */
export async function ensureSchema(): Promise<void> {
  if (process.env.RELASY_SKIP_SCHEMA_INIT === "1") return;

  if (!schemaReady) {
    const { SCHEMA_SQL } = await import("./schema");
    schemaReady = getDriver()
      .exec(SCHEMA_SQL)
      .catch((error: unknown) => {
        if (isAlreadyExistsError(error)) return;
        // Jangan simpan kegagalan, supaya request berikutnya bisa mencoba lagi.
        schemaReady = null;
        throw error;
      });
  }
  return schemaReady;
}

/** Mengganti driver secara manual. Dipakai unit test. */
export function setDriver(driver: DbDriver | null): void {
  driverInstance = driver;
  schemaReady = null;
}
