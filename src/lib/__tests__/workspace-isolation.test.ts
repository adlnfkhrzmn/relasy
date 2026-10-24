import { describe, it, expect, beforeEach } from "vitest";
import { setDriver } from "../db/client";
import { createTestDatabase } from "../db/testing";
import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from "../db/repositories/customer.repo";
import {
  createOpportunity,
  getOpportunities,
  getOpportunityById,
  updateOpportunityStage,
} from "../db/repositories/opportunity.repo";
import {
  createFollowup,
  getFollowups,
  getFollowupById,
  updateFollowupStatus,
} from "../db/repositories/followup.repo";
import { getDashboardMetrics } from "../db/repositories/dashboard.repo";

describe("Workspace Tenancy & Cross-Account Isolation (Gate F)", () => {
  const WS_A = "ws_tenant_alpha";
  const WS_B = "ws_tenant_beta";

  beforeEach(async () => {
    const testDb = await createTestDatabase();
    setDriver(testDb);

    // Insert two distinct workspaces
    await testDb.query("INSERT INTO workspaces (id, name) VALUES ($1, $2)", [WS_A, "Usaha Alpha"]);
    await testDb.query("INSERT INTO workspaces (id, name) VALUES ($1, $2)", [WS_B, "Usaha Beta"]);
  });

  it("prevents Workspace B from reading or modifying Workspace A's customers", async () => {
    // 1. Create customer in Workspace A
    const custA = await createCustomer(WS_A, {
      name: "Pelanggan Rahasia A",
      phone: "0811111111",
      email: "rahasia@alpha.com",
    });

    // 2. Workspace A can see it
    const listA = await getCustomers(WS_A);
    expect(listA.length).toBe(1);
    expect(listA[0].id).toBe(custA.id);

    // 3. Workspace B MUST NOT see it in customer list
    const listB = await getCustomers(WS_B);
    expect(listB.length).toBe(0);

    // 4. Workspace B MUST NOT get it by direct ID
    const directGet = await getCustomerById(WS_B, custA.id);
    expect(directGet).toBeNull();

    // 5. Workspace B cannot update Workspace A's customer
    const updateResult = await updateCustomer(WS_B, custA.id, { name: "Diubah Oleh Beta" });
    expect(updateResult).toBeNull();
    // Confirm unchanged in A
    expect((await getCustomerById(WS_A, custA.id))?.name).toBe("Pelanggan Rahasia A");

    // 6. Workspace B cannot delete Workspace A's customer
    const deleteResult = await deleteCustomer(WS_B, custA.id);
    expect(deleteResult).toBe(false);
    expect(await getCustomerById(WS_A, custA.id)).not.toBeNull();
  });

  it("prevents Workspace B from accessing Workspace A's opportunities", async () => {
    const custA = await createCustomer(WS_A, { name: "Pelanggan A" });
    const oppA = await createOpportunity(WS_A, {
      customerId: custA.id,
      title: "Proyek Besar Alpha",
      stage: "negosiasi",
      estimatedValue: 50000000,
    });

    // Workspace B cannot query or fetch Workspace A's opportunity
    expect((await getOpportunities(WS_B)).length).toBe(0);
    expect(await getOpportunityById(WS_B, oppA.id)).toBeNull();

    // Workspace B cannot update Workspace A's opportunity stage
    const updated = await updateOpportunityStage(WS_B, oppA.id, "berhasil");
    expect(updated).toBe(false);
    expect((await getOpportunityById(WS_A, oppA.id))?.stage).toBe("negosiasi");
  });

  it("prevents Workspace B from accessing Workspace A's follow-up tasks", async () => {
    const custA = await createCustomer(WS_A, { name: "Pelanggan A" });
    const taskA = await createFollowup(WS_A, {
      customerId: custA.id,
      title: "Telepon konfirmasi pesanan",
      dueAt: "2026-10-23",
    });

    // Workspace B cannot see or manipulate task
    expect((await getFollowups(WS_B, { tab: "today", referenceDate: "2026-10-23" })).length).toBe(0);
    expect(await getFollowupById(WS_B, taskA.id)).toBeNull();

    const completed = await updateFollowupStatus(WS_B, taskA.id, "completed");
    expect(completed).toBe(false);
    expect((await getFollowupById(WS_A, taskA.id))?.status).toBe("pending");
  });

  it("calculates dashboard metrics strictly per workspace", async () => {
    const custA = await createCustomer(WS_A, { name: "Pelanggan A" });
    await createOpportunity(WS_A, {
      customerId: custA.id,
      title: "Peluang Alpha",
      stage: "baru",
      estimatedValue: 10000000,
    });
    await createFollowup(WS_A, {
      customerId: custA.id,
      title: "Followup Alpha",
      dueAt: "2026-10-23",
    });

    const metricsA = await getDashboardMetrics(WS_A, "2026-10-23");
    expect(metricsA.totalCustomers).toBe(1);
    expect(metricsA.openOpportunities).toBe(1);
    expect(metricsA.pipelineValue).toBe(10000000);
    expect(metricsA.tasksToday).toBe(1);

    // Workspace B metrics must remain zero
    const metricsB = await getDashboardMetrics(WS_B, "2026-10-23");
    expect(metricsB.totalCustomers).toBe(0);
    expect(metricsB.openOpportunities).toBe(0);
    expect(metricsB.pipelineValue).toBe(0);
    expect(metricsB.tasksToday).toBe(0);
  });
});
