import { describe, it, expect } from "vitest";
import { createSessionToken, verifySessionToken } from "../auth/session";
import { hashPassword, verifyPassword } from "../auth/password";

describe("Auth & Session Security", () => {
  it("hashes and verifies passwords securely", async () => {
    const raw = "SuperSecretPassword123";
    const hash = await hashPassword(raw);
    expect(hash).not.toBe(raw);
    expect(await verifyPassword(raw, hash)).toBe(true);
    expect(await verifyPassword("WrongPassword", hash)).toBe(false);
  });

  it("creates and verifies a valid signed session token", () => {
    const payload = {
      userId: "usr_123",
      workspaceId: "ws_123",
      email: "test@relasy.id",
      name: "Budi Santoso",
    };

    const token = createSessionToken(payload);
    expect(token).toContain(".");

    const verified = verifySessionToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.userId).toBe(payload.userId);
    expect(verified?.workspaceId).toBe(payload.workspaceId);
    expect(verified?.email).toBe(payload.email);
  });

  it("rejects tampered session tokens", () => {
    const token = createSessionToken({
      userId: "usr_123",
      workspaceId: "ws_123",
      email: "test@relasy.id",
      name: "Budi",
    });

    const [payloadBase64, sig] = token.split(".");
    // Tamper payload
    const tamperedPayload = Buffer.from(
      JSON.stringify({ userId: "hacked", workspaceId: "ws_other", expiresAt: Date.now() + 10000 })
    ).toString("base64url");
    const tamperedToken = `${tamperedPayload}.${sig}`;

    expect(verifySessionToken(tamperedToken)).toBeNull();
  });

  it("rejects malformed and empty tokens", () => {
    expect(verifySessionToken("")).toBeNull();
    expect(verifySessionToken("invalid-token-without-dot")).toBeNull();
    expect(verifySessionToken(null)).toBeNull();
    expect(verifySessionToken(undefined)).toBeNull();
  });
});
