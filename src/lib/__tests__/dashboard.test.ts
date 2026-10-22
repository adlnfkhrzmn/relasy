import { describe, it, expect, beforeEach, vi } from "vitest";
import { createTestDatabase } from "../db/client";
import * as clientModule from "../db/client";
import { createWorkspace } from "../db/repositories/workspace.repo";
import { createCustomer } from "../db/repositories/customer.repo";
import {
  createOpportunity,
  updateOpportunityStage,
} from "../db/repositories/opportunity.repo";
import {
  createFollowup,
  updateFollowupStatus,
} from "../db/repositories/followup.repo";
import { getDashboardMetrics } from "../db/repositories/dashboard.repo";

describe("Dashboard Metrics & Aggregations (Phase 7)", () => {
  let workspaceA: string;
  let workspaceB: string;

  beforeEach(() => {
    const testDb = createTestDatabase();
    vi.spyOn(clientModule, "getDatabase").mockReturnValue(testDb);
    const wsA = createWorkspace("Bengkel Motor Maju", "bengkel-maju");
    const wsB = createWorkspace("Katering Bu Siti", "katering-siti");
    workspaceA = wsA.id;
    workspaceB = wsB.id;
  });

  it("calculates accurate live dashboard metrics reflecting customer, opportunity, and task lifecycles", () => {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    // 1. Initial state: zero metrics
    const initialMetrics = getDashboardMetrics(workspaceA, today);
    expect(initialMetrics.totalCustomers).toBe(0);
    expect(initialMetrics.openOpportunities).toBe(0);
    expect(initialMetrics.pipelineValue).toBe(0);
    expect(initialMetrics.tasksToday).toBe(0);
    expect(initialMetrics.tasksOverdue).toBe(0);
    expect(initialMetrics.tasksCompleted).toBe(0);
    expect(initialMetrics.wonOpportunitiesCount).toBe(0);
    expect(initialMetrics.wonOpportunitiesValue).toBe(0);

    // 2. Add customer in workspace A
    const cust = createCustomer(workspaceA, {
      name: "Rian Hidayat",
      phone: "0811223344",
    });
    const afterCustomer = getDashboardMetrics(workspaceA, today);
    expect(afterCustomer.totalCustomers).toBe(1);

    // 3. Add open opportunity in stage 'baru'
    const opp1 = createOpportunity(workspaceA, {
      customerId: cust.id,
      title: "Paket Servis Armada",
      stage: "baru",
      estimatedValue: 15000000,
    });
    const afterOpp1 = getDashboardMetrics(workspaceA, today);
    expect(afterOpp1.openOpportunities).toBe(1);
    expect(afterOpp1.pipelineValue).toBe(15000000);
    expect(afterOpp1.wonOpportunitiesCount).toBe(0);

    // 4. Add second opportunity and win it
    const opp2 = createOpportunity(workspaceA, {
      customerId: cust.id,
      title: "Ganti Sparepart Rutin",
      stage: "negosiasi",
      estimatedValue: 5000000,
    });
    updateOpportunityStage(workspaceA, opp2.id, "berhasil");

    const afterOpp2 = getDashboardMetrics(workspaceA, today);
    expect(afterOpp2.openOpportunities).toBe(1); // opp1 is still open
    expect(afterOpp2.pipelineValue).toBe(15000000);
    expect(afterOpp2.wonOpportunitiesCount).toBe(1);
    expect(afterOpp2.wonOpportunitiesValue).toBe(5000000);

    // 5. Add follow-up today and overdue
    const taskToday = createFollowup(workspaceA, {
      customerId: cust.id,
      title: "Konfirmasi jadwal servis",
      dueAt: `${today}T10:00:00`,
    });
    createFollowup(workspaceA, {
      customerId: cust.id,
      title: "Kirim invoice jatuh tempo",
      dueAt: `${yesterday}T14:00:00`,
    });

    const afterTasks = getDashboardMetrics(workspaceA, today);
    expect(afterTasks.tasksToday).toBe(1);
    expect(afterTasks.tasksOverdue).toBe(1);
    expect(afterTasks.tasksCompleted).toBe(0);

    // 6. Complete today's task
    updateFollowupStatus(workspaceA, taskToday.id, "completed");
    const afterComplete = getDashboardMetrics(workspaceA, today);
    expect(afterComplete.tasksToday).toBe(0);
    expect(afterComplete.tasksCompleted).toBe(1);
    expect(afterComplete.tasksOverdue).toBe(1); // overdue still pending

    // 7. Verify multi-tenant isolation: Workspace B remains strictly zero
    const metricsB = getDashboardMetrics(workspaceB, today);
    expect(metricsB.totalCustomers).toBe(0);
    expect(metricsB.openOpportunities).toBe(0);
    expect(metricsB.pipelineValue).toBe(0);
    expect(metricsB.tasksToday).toBe(0);
    expect(metricsB.tasksOverdue).toBe(0);
    expect(metricsB.tasksCompleted).toBe(0);
    expect(metricsB.wonOpportunitiesCount).toBe(0);
  });
});
