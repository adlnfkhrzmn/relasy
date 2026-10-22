import crypto from "crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "relasy_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface SessionPayload {
  userId: string;
  workspaceId: string;
  email: string;
  name: string;
  expiresAt: number;
}

function getSecretKey(): string {
  return process.env.SESSION_SECRET || "development-secret-key-for-relasy-local-min32chars";
}

/**
 * Sign session payload to a secure base64 token with HMAC-SHA256 signature.
 */
export function createSessionToken(payload: Omit<SessionPayload, "expiresAt">): string {
  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const fullPayload: SessionPayload = { ...payload, expiresAt };
  const payloadStr = JSON.stringify(fullPayload);
  const payloadBase64 = Buffer.from(payloadStr).toString("base64url");

  const signature = crypto
    .createHmac("sha256", getSecretKey())
    .update(payloadBase64)
    .digest("base64url");

  return `${payloadBase64}.${signature}`;
}

/**
 * Verify and decode session token. Returns null if invalid or expired.
 */
export function verifySessionToken(token: string | null | undefined): SessionPayload | null {
  if (!token || !token.includes(".")) {
    return null;
  }

  const [payloadBase64, providedSignature] = token.split(".");
  if (!payloadBase64 || !providedSignature) {
    return null;
  }

  const expectedSignature = crypto
    .createHmac("sha256", getSecretKey())
    .update(payloadBase64)
    .digest("base64url");

  if (!crypto.timingSafeEqual(Buffer.from(providedSignature), Buffer.from(expectedSignature))) {
    return null;
  }

  try {
    const payloadStr = Buffer.from(payloadBase64, "base64url").toString("utf-8");
    const payload: SessionPayload = JSON.parse(payloadStr);

    if (Date.now() > payload.expiresAt) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Server-side helper to read and verify current user session.
 */
export async function getCurrentSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  if (!sessionCookie) return null;
  return verifySessionToken(sessionCookie.value);
}
