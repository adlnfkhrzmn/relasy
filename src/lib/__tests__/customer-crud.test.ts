import { describe, it, expect, beforeEach } from "vitest";
import { setDriver } from "../db/client";
import { createTestDatabase } from "../db/testing";
import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  archiveCustomer,
  restoreCustomer,
  deleteCustomer,
} from "../db/repositories/customer.repo";

describe("Customer Management CRUD & Archive (Phase 4)", () => {
  const WS_ID = "ws_test_customer";

  beforeEach(async () => {
    const testDb = await createTestDatabase();
    setDriver(testDb);
    await testDb.query("INSERT INTO workspaces (id, name) VALUES ($1, $2)", [WS_ID, "Toko Uji"]);
  });

  it("creates, reads, updates, archives, restores, and deletes a customer", async () => {
    // 1. Create
    const created = await createCustomer(WS_ID, {
      name: "Siti Rahma",
      phone: "081298765432",
      email: "siti@toko.id",
      company: "PT Siti Abadi",
      source: "Rekomendasi",
      notes: "Sangat potensial",
    });

    expect(created.id).toBeDefined();
    expect(created.name).toBe("Siti Rahma");
    expect(created.archived_at).toBeNull();

    // 2. Read by ID
    const fetched = await getCustomerById(WS_ID, created.id);
    expect(fetched).not.toBeNull();
    expect(fetched?.email).toBe("siti@toko.id");

    // 3. Search
    const searchByName = await getCustomers(WS_ID, { search: "Rahma" });
    expect(searchByName.length).toBe(1);
    expect(searchByName[0].id).toBe(created.id);

    const searchByPhone = await getCustomers(WS_ID, { search: "98765" });
    expect(searchByPhone.length).toBe(1);

    const searchNonExistent = await getCustomers(WS_ID, { search: "Zebra" });
    expect(searchNonExistent.length).toBe(0);

    // 4. Update
    const updated = await updateCustomer(WS_ID, created.id, {
      name: "Siti Rahmawati",
      company: "PT Siti Sukses Bersama",
    });
    expect(updated?.name).toBe("Siti Rahmawati");
    expect(updated?.company).toBe("PT Siti Sukses Bersama");
    expect(updated?.phone).toBe("081298765432"); // phone preserved

    // 5. Archive
    const archiveResult = await archiveCustomer(WS_ID, created.id);
    expect(archiveResult).toBe(true);

    // Must NOT be in active list
    const activeList = await getCustomers(WS_ID, { filterArchived: false });
    expect(activeList.length).toBe(0);

    // Must be in archived list
    const archivedList = await getCustomers(WS_ID, { filterArchived: true });
    expect(archivedList.length).toBe(1);
    expect(archivedList[0].name).toBe("Siti Rahmawati");

    // 6. Restore
    const restoreResult = await restoreCustomer(WS_ID, created.id);
    expect(restoreResult).toBe(true);
    expect((await getCustomers(WS_ID, { filterArchived: false })).length).toBe(1);
    expect((await getCustomers(WS_ID, { filterArchived: true })).length).toBe(0);

    // 7. Delete
    const deleteResult = await deleteCustomer(WS_ID, created.id);
    expect(deleteResult).toBe(true);
    expect(await getCustomerById(WS_ID, created.id)).toBeNull();
  });
});
