import { describe, it, expect, beforeEach } from "vitest";
import { setDriver } from "../db/client";
import { createTestDatabase } from "../db/testing";
import { createCustomer } from "../db/repositories/customer.repo";
import {
  createOpportunity,
  getOpportunities,
  getOpportunityById,
  updateOpportunityStage,
  updateOpportunity,
  deleteOpportunity,
} from "../db/repositories/opportunity.repo";

describe("Sales Pipeline & Opportunities (Phase 5)", () => {
  const WS_ID = "ws_test_pipeline";
  let customerId: string;

  beforeEach(async () => {
    const testDb = await createTestDatabase();
    setDriver(testDb);
    await testDb.query("INSERT INTO workspaces (id, name) VALUES ($1, $2)", [
      WS_ID,
      "Usaha Penjualan",
    ]);

    const cust = await createCustomer(WS_ID, { name: "PT Sumber Rejeki" });
    customerId = cust.id;
  });

  it("creates, transitions stages, updates, and deletes an opportunity", async () => {
    // 1. Create opportunity in 'baru' stage
    const opp = await createOpportunity(WS_ID, {
      customerId,
      title: "Pengadaan Server Kantor",
      stage: "baru",
      estimatedValue: 25000000,
      expectedCloseDate: "2026-11-30",
    });

    expect(opp.id).toBeDefined();
    expect(opp.stage).toBe("baru");
    expect(opp.estimated_value).toBe(25000000);
    expect(opp.outcome_at).toBeNull();

    // 2. Fetch by ID
    const fetched = await getOpportunityById(WS_ID, opp.id);
    expect(fetched).not.toBeNull();
    expect(fetched?.customer_name).toBe("PT Sumber Rejeki");

    // 3. Move stage to 'dihubungi'
    const movedToContacted = await updateOpportunityStage(WS_ID, opp.id, "dihubungi");
    expect(movedToContacted).toBe(true);
    expect((await getOpportunityById(WS_ID, opp.id))?.stage).toBe("dihubungi");

    // 4. Move stage to 'negosiasi'
    await updateOpportunityStage(WS_ID, opp.id, "negosiasi");
    expect((await getOpportunityById(WS_ID, opp.id))?.stage).toBe("negosiasi");

    // 5. Move stage to 'berhasil' (outcome_at should be set)
    await updateOpportunityStage(WS_ID, opp.id, "berhasil");
    const wonOpp = await getOpportunityById(WS_ID, opp.id);
    expect(wonOpp?.stage).toBe("berhasil");
    expect(wonOpp?.outcome_at).not.toBeNull();

    // 6. Update opportunity details
    const updated = await updateOpportunity(WS_ID, opp.id, {
      title: "Pengadaan Server & Jaringan",
      estimatedValue: 30000000,
    });
    expect(updated?.title).toBe("Pengadaan Server & Jaringan");
    expect(updated?.estimated_value).toBe(30000000);

    // 7. Delete opportunity
    const deleted = await deleteOpportunity(WS_ID, opp.id);
    expect(deleted).toBe(true);
    expect(await getOpportunityById(WS_ID, opp.id)).toBeNull();
  });
});
