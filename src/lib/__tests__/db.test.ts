import { describe, it, expect, beforeEach } from "vitest";
import { setDriver, DbDriver } from "../db/client";
import { createTestDatabase } from "../db/testing";

describe("Database client & schema", () => {
  let db: DbDriver;

  beforeEach(async () => {
    db = await createTestDatabase();
    setDriver(db);
  });

  it("initializes tables and handles customer insertion with workspace scope", async () => {
    await db.query("INSERT INTO workspaces (id, name) VALUES ($1, $2)", ["ws-1", "Toko Maju"]);

    await db.query(
      "INSERT INTO customers (id, workspace_id, name, phone, email) VALUES ($1, $2, $3, $4, $5)",
      ["cust-1", "ws-1", "Budi Santoso", "081234567890", "budi@example.com"]
    );

    const customers = await db.query<any>("SELECT * FROM customers WHERE workspace_id = $1", [
      "ws-1",
    ]);
    expect(customers.length).toBe(1);
    expect(customers[0].name).toBe("Budi Santoso");
    expect(customers[0].workspace_id).toBe("ws-1");
  });

  it("enforces foreign key constraints", async () => {
    await expect(
      db.query("INSERT INTO customers (id, workspace_id, name) VALUES ($1, $2, $3)", [
        "cust-2",
        "non-existent-ws",
        "Dewi",
      ])
    ).rejects.toThrow();
  });

  it("enforces pipeline stage check constraints", async () => {
    await db.query("INSERT INTO workspaces (id, name) VALUES ($1, $2)", ["ws-1", "Toko Maju"]);
    await db.query("INSERT INTO customers (id, workspace_id, name) VALUES ($1, $2, $3)", [
      "cust-1",
      "ws-1",
      "Budi",
    ]);

    // Valid stage
    await expect(
      db.query(
        "INSERT INTO opportunities (id, workspace_id, customer_id, title, stage) VALUES ($1, $2, $3, $4, $5)",
        ["opp-1", "ws-1", "cust-1", "Peluang Baru", "baru"]
      )
    ).resolves.toBeDefined();

    // Invalid stage must throw check constraint error
    await expect(
      db.query(
        "INSERT INTO opportunities (id, workspace_id, customer_id, title, stage) VALUES ($1, $2, $3, $4, $5)",
        ["opp-2", "ws-1", "cust-1", "Peluang Invalid", "invalid_stage"]
      )
    ).rejects.toThrow();
  });
});
