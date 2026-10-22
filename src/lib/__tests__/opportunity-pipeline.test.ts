import { describe, it, expect, beforeEach, vi } from "vitest";
import { createTestDatabase } from "../db/client";
import { createCustomer } from "../db/repositories/customer.repo";
import {
  createOpportunity,
  getOpportunities,
  getOpportunityById,
  updateOpportunityStage,
  updateOpportunity,
  deleteOpportunity,
} from "../db/repositories/opportunity.repo";
import * as clientModule from "../db/client";

describe("Sales Pipeline & Opportunities (Phase 5)", () => {
  let testDb: any;
  const WS_ID = "ws_test_pipeline";
  let customerId: string;

  beforeEach(() => {
    testDb = createTestDatabase();
    vi.spyOn(clientModule, "getDatabase").mockReturnValue(testDb);
    testDb.prepare("INSERT INTO workspaces (id, name) VALUES (?, ?)").run(WS_ID, "Usaha Penjualan");

    const cust = createCustomer(WS_ID, { name: "PT Sumber Rejeki" });
    customerId = cust.id;
  });

  it("creates, transitions stages, updates, and deletes an opportunity", () => {
    // 1. Create opportunity in 'baru' stage
    const opp = createOpportunity(WS_ID, {
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
    const fetched = getOpportunityById(WS_ID, opp.id);
    expect(fetched).not.toBeNull();
    expect(fetched?.customer_name).toBe("PT Sumber Rejeki");

    // 3. Move stage to 'dihubungi'
    const movedToContacted = updateOpportunityStage(WS_ID, opp.id, "dihubungi");
    expect(movedToContacted).toBe(true);
    expect(getOpportunityById(WS_ID, opp.id)?.stage).toBe("dihubungi");

    // 4. Move stage to 'negosiasi'
    updateOpportunityStage(WS_ID, opp.id, "negosiasi");
    expect(getOpportunityById(WS_ID, opp.id)?.stage).toBe("negosiasi");

    // 5. Move stage to 'berhasil' (outcome_at should be set)
    updateOpportunityStage(WS_ID, opp.id, "berhasil");
    const wonOpp = getOpportunityById(WS_ID, opp.id);
    expect(wonOpp?.stage).toBe("berhasil");
    expect(wonOpp?.outcome_at).not.toBeNull();

    // 6. Update opportunity details
    const updated = updateOpportunity(WS_ID, opp.id, {
      title: "Pengadaan Server & Jaringan",
      estimatedValue: 30000000,
    });
    expect(updated?.title).toBe("Pengadaan Server & Jaringan");
    expect(updated?.estimated_value).toBe(30000000);

    // 7. Delete opportunity
    const deleted = deleteOpportunity(WS_ID, opp.id);
    expect(deleted).toBe(true);
    expect(getOpportunityById(WS_ID, opp.id)).toBeNull();
  });
});
