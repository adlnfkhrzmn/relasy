import { describe, it, expect } from "vitest";
import { createTestDatabase } from "../db/client";

describe("Database client & schema", () => {
  it("initializes tables and handles customer insertion with workspace scope", () => {
    const db = createTestDatabase();

    // Insert workspace
    const insertWs = db.prepare(
      "INSERT INTO workspaces (id, name) VALUES (?, ?)"
    );
    insertWs.run("ws-1", "Toko Maju");

    // Insert customer
    const insertCust = db.prepare(
      "INSERT INTO customers (id, workspace_id, name, phone, email) VALUES (?, ?, ?, ?, ?)"
    );
    insertCust.run("cust-1", "ws-1", "Budi Santoso", "081234567890", "budi@example.com");

    const customers = db.prepare("SELECT * FROM customers WHERE workspace_id = ?").all("ws-1") as any[];
    expect(customers.length).toBe(1);
    expect(customers[0].name).toBe("Budi Santoso");
    expect(customers[0].workspace_id).toBe("ws-1");
  });

  it("enforces foreign key constraints", () => {
    const db = createTestDatabase();

    // Trying to insert a customer with non-existent workspace must throw foreign key error
    const insertCust = db.prepare(
      "INSERT INTO customers (id, workspace_id, name) VALUES (?, ?, ?)"
    );
    expect(() => {
      insertCust.run("cust-2", "non-existent-ws", "Dewi");
    }).toThrow();
  });

  it("enforces pipeline stage check constraints", () => {
    const db = createTestDatabase();
    db.prepare("INSERT INTO workspaces (id, name) VALUES (?, ?)").run("ws-1", "Toko Maju");
    db.prepare("INSERT INTO customers (id, workspace_id, name) VALUES (?, ?, ?)").run("cust-1", "ws-1", "Budi");

    const insertOpp = db.prepare(
      "INSERT INTO opportunities (id, workspace_id, customer_id, title, stage) VALUES (?, ?, ?, ?, ?)"
    );

    // Valid stage
    expect(() => {
      insertOpp.run("opp-1", "ws-1", "cust-1", "Peluang Baru", "baru");
    }).not.toThrow();

    // Invalid stage must throw check constraint error
    expect(() => {
      insertOpp.run("opp-2", "ws-1", "cust-1", "Peluang Invalid", "invalid_stage");
    }).toThrow();
  });
});
