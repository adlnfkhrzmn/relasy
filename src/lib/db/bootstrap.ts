import crypto from "crypto";
import { ensureSchema, getDriver } from "./client";
import { getUserByEmail } from "./repositories/user.repo";
import { hashPassword } from "../auth/password";

const DEFAULT_EMAIL = "pemilik@usaha.id";
const DEFAULT_PASSWORD = "relasy123";
const DEFAULT_WORKSPACE_NAME = "Usaha Saya";
const DEFAULT_OWNER_NAME = "Pemilik Usaha";

/** Kode error PostgreSQL untuk pelanggaran unique constraint. */
const UNIQUE_VIOLATION = "23505";

/**
 * Memastikan akun bawaan tersedia.
 *
 * Fungsi ini dipanggil di awal hampir setiap request, jadi harus aman
 * terhadap kondisi paling rawan: database masih kosong dan beberapa request
 * datang bersamaan. Di Vercel itu terjadi saat beberapa instance serverless
 * menyala hampir serentak.
 *
 * Pembuatan workspace dan akun sengaja dilakukan dalam SATU statement SQL
 * memakai CTE. Alasannya: kalau dipecah menjadi dua perintah terpisah, dua
 * request yang berlomba bisa sama-sama membuat workspace lebih dulu, lalu
 * hanya satu yang berhasil membuat akun. Workspace milik yang kalah akan
 * tertinggal sebagai data yatim setiap kali itu terjadi.
 *
 * Dengan satu statement, keduanya berhasil atau keduanya batal. Yang kalah
 * balapan mendapat unique violation, lalu cukup membaca akun yang sudah
 * dibuat pemenang.
 *
 * Catatan penting: owner_id diisi langsung saat INSERT workspace, bukan
 * lewat UPDATE sesudahnya. PostgreSQL tidak mengizinkan UPDATE melihat baris
 * yang baru disisipkan pada statement yang sama, sehingga UPDATE seperti itu
 * akan mengenai nol baris dan owner_id tertinggal kosong.
 */
export async function ensureDefaultAccount(): Promise<{
  workspaceId: string;
  userId: string;
  email: string;
}> {
  await ensureSchema();

  const existingUser = await getUserByEmail(DEFAULT_EMAIL);
  if (existingUser) {
    return {
      workspaceId: existingUser.workspace_id,
      userId: existingUser.id,
      email: existingUser.email,
    };
  }

  const workspaceId = `ws_${crypto.randomUUID()}`;
  const userId = `usr_${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  const passwordHash = await hashPassword(DEFAULT_PASSWORD);

  try {
    await getDriver().query(
      `
      WITH new_workspace AS (
        INSERT INTO workspaces (id, name, owner_id, created_at, updated_at)
        VALUES ($1, $2, $3, $7, $7)
        RETURNING id
      ), new_user AS (
        INSERT INTO users (id, workspace_id, name, email, password_hash, created_at, updated_at)
        SELECT $3, new_workspace.id, $4, $5, $6, $7, $7
        FROM new_workspace
        RETURNING id
      )
      SELECT id FROM new_user
      `,
      [workspaceId, DEFAULT_WORKSPACE_NAME, userId, DEFAULT_OWNER_NAME, DEFAULT_EMAIL, passwordHash, now]
    );

    return {
      workspaceId,
      userId,
      email: DEFAULT_EMAIL,
    };
  } catch (error) {
    if ((error as { code?: string } | null)?.code !== UNIQUE_VIOLATION) {
      throw error;
    }

    // Kalah balapan: akun sudah dibuat oleh request lain.
    const racedUser = await getUserByEmail(DEFAULT_EMAIL);
    if (!racedUser) throw error;

    return {
      workspaceId: racedUser.workspace_id,
      userId: racedUser.id,
      email: racedUser.email,
    };
  }
}
