import { describe, it, expect, beforeEach, vi } from "vitest";
import { createTestDatabase } from "../db/client";
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
import * as clientModule from "../db/client";

describe("Workspace Tenancy & Cross-Account Isolation (Gate F)", () => {
  let testDb: any;
  const WS_A = "ws_tenant_alpha";
  const WS_B = "ws_tenant_beta";

  beforeEach(() => {
    testDb = createTestDatabase();
    // Spy on getDatabase to return our testDb
    vi.spyOn(clientModule, "getDatabase").mockReturnValue(testDb);

    // Insert two distinct workspaces
    testDb.prepare("INSERT INTO workspaces (id, name) VALUES (?, ?)").run(WS_A, "Usaha Alpha");
    testDb.prepare("INSERT INTO workspaces (id, name) VALUES (?, ?)").run(WS_B, "Usaha Beta");
  });

  it("prevents Workspace B from reading or modifying Workspace A's customers", () => {
    // 1. Create customer in Workspace A
    const custA = createCustomer(WS_A, {
      name: "Pelanggan Rahasia A",
      phone: "0811111111",
      email: "rahasia@alpha.com",
    });

    // 2. Workspace A can see it
    const listA = getCustomers(WS_A);
    expect(listA.length).toBe(1);
    expect(listA[0].id).toBe(custA.id);

    // 3. Workspace B MUST NOT see it in customer list
    const listB = getCustomers(WS_B);
    expect(listB.length).toBe(0);

    // 4. Workspace B MUST NOT get it by direct ID
    const directGet = getCustomerById(WS_B, custA.id);
    expect(directGet).toBeNull();

    // 5. Workspace B cannot update Workspace A's customer
    const updateResult = updateCustomer(WS_B, custA.id, { name: "Diubah Oleh Beta" });
    expect(updateResult).toBeNull();
    // Confirm unchanged in A
    expect(getCustomerById(WS_A, custA.id)?.name).toBe("Pelanggan Rahasia A");

    // 6. Workspace B cannot delete Workspace A's customer
    const deleteResult = deleteCustomer(WS_B, custA.id);
    expect(deleteResult).toBe(false);
    expect(getCustomerById(WS_A, custA.id)).not.toBeNull();
  });

  it("prevents Workspace B from accessing Workspace A's opportunities", () => {
    const custA = createCustomer(WS_A, { name: "Pelanggan A" });
    const oppA = createOpportunity(WS_A, {
      customerId: custA.id,
      title: "Proyek Besar Alpha",
      stage: "negosiasi",
      estimatedValue: 50000000,
    });

    // Workspace B cannot query or fetch Workspace A's opportunity
    expect(getOpportunities(WS_B).length).toBe(0);
    expect(getOpportunityById(WS_B, oppA.id)).toBeNull();

    // Workspace B cannot update Workspace A's opportunity stage
    const updated = updateOpportunityStage(WS_B, oppA.id, "berhasil");
    expect(updated).toBe(false);
    expect(getOpportunityById(WS_A, oppA.id)?.stage).toBe("negosiasi");
  });

  it("prevents Workspace B from accessing Workspace A's follow-up tasks", () => {
    const custA = createCustomer(WS_A, { name: "Pelanggan A" });
    const taskA = createFollowup(WS_A, {
      customerId: custA.id,
      title: "Telepon konfirmasi pesanan",
      dueAt: "2026-10-23",
    });

    // Workspace B cannot see or manipulate task
    expect(getFollowups(WS_B, { tab: "today", referenceDate: "2026-10-23" }).length).toBe(0);
    expect(getFollowupById(WS_B, taskA.id)).toBeNull();

    const completed = updateFollowupStatus(WS_B, taskA.id, "completed");
    expect(completed).toBe(false);
    expect(getFollowupById(WS_A, taskA.id)?.status).toBe("pending");
  });

  it("calculates dashboard metrics strictly per workspace", () => {
    const custA = createCustomer(WS_A, { name: "Pelanggan A" });
    createOpportunity(WS_A, {
      customerId: custA.id,
      title: "Peluang Alpha",
      stage: "baru",
      estimatedValue: 10000000,
    });
    createFollowup(WS_A, {
      customerId: custA.id,
      title: "Followup Alpha",
      dueAt: "2026-10-23",
    });

    const metricsA = getDashboardMetrics(WS_A, "2026-10-23");
    expect(metricsA.totalCustomers).toBe(1);
    expect(metricsA.openOpportunities).toBe(1);
    expect(metricsA.pipelineValue).toBe(10000000);
    expect(metricsA.tasksToday).toBe(1);

    // Workspace B metrics must remain zero
    const metricsB = getDashboardMetrics(WS_B, "2026-10-23");
    expect(metricsB.totalCustomers).toBe(0);
    expect(metricsB.openOpportunities).toBe(0);
    expect(metricsB.pipelineValue).toBe(0);
    expect(metricsB.tasksToday).toBe(0);
  });
});
