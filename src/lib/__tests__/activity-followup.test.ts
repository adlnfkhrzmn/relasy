import { describe, it, expect, beforeEach, vi } from "vitest";
import { createTestDatabase } from "../db/client";
import { createCustomer } from "../db/repositories/customer.repo";
import {
  createActivity,
  getActivities,
  getActivityById,
} from "../db/repositories/activity.repo";
import {
  createFollowup,
  getFollowups,
  getFollowupById,
  updateFollowupStatus,
  rescheduleFollowup,
  deleteFollowup,
} from "../db/repositories/followup.repo";
import * as clientModule from "../db/client";

describe("Activity Timeline & Follow-up Workflow (Phase 6)", () => {
  let testDb: any;
  const WS_ID = "ws_test_act_flw";
  let customerId: string;

  beforeEach(() => {
    testDb = createTestDatabase();
    vi.spyOn(clientModule, "getDatabase").mockReturnValue(testDb);
    testDb.prepare("INSERT INTO workspaces (id, name) VALUES (?, ?)").run(WS_ID, "Usaha Layanan");

    const cust = createCustomer(WS_ID, { name: "Bapak Hendra" });
    customerId = cust.id;
  });

  describe("Activity Timeline", () => {
    it("creates activities and orders them chronologically", () => {
      const act1 = createActivity(WS_ID, {
        customerId,
        type: "telepon",
        title: "Panggilan telepon pertama",
        happenedAt: "2026-10-20T10:00:00Z",
      });

      const act2 = createActivity(WS_ID, {
        customerId,
        type: "pertemuan",
        title: "Pertemuan di kantor klien",
        happenedAt: "2026-10-22T14:30:00Z",
      });

      const list = getActivities(WS_ID, { customerId });
      expect(list.length).toBe(2);
      // Newest first
      expect(list[0].id).toBe(act2.id);
      expect(list[1].id).toBe(act1.id);
      expect(list[0].customer_name).toBe("Bapak Hendra");
    });
  });

  describe("Follow-up Tasks", () => {
    const today = "2026-10-23";
    const past = "2026-10-20";
    const future = "2026-10-28";

    it("filters tasks correctly into today, upcoming, overdue, and completed tabs", () => {
      // 1. Create overdue task
      createFollowup(WS_ID, {
        customerId,
        title: "Kirim draft proposal",
        dueAt: `${past}T09:00:00`,
      });

      // 2. Create today task
      const todayTask = createFollowup(WS_ID, {
        customerId,
        title: "Hubungi kembali untuk follow-up harga",
        dueAt: `${today}T10:00:00`,
      });

      // 3. Create upcoming task
      createFollowup(WS_ID, {
        customerId,
        title: "Jadwalkan demo sistem",
        dueAt: `${future}T14:00:00`,
      });

      // Check overdue tab
      const overdue = getFollowups(WS_ID, { tab: "overdue", referenceDate: today });
      expect(overdue.length).toBe(1);
      expect(overdue[0].title).toBe("Kirim draft proposal");

      // Check today tab
      const dueToday = getFollowups(WS_ID, { tab: "today", referenceDate: today });
      expect(dueToday.length).toBe(1);
      expect(dueToday[0].id).toBe(todayTask.id);

      // Check upcoming tab
      const upcoming = getFollowups(WS_ID, { tab: "upcoming", referenceDate: today });
      expect(upcoming.length).toBe(1);
      expect(upcoming[0].title).toBe("Jadwalkan demo sistem");

      // Complete today task
      const completed = updateFollowupStatus(WS_ID, todayTask.id, "completed");
      expect(completed).toBe(true);

      // Verify it leaves today tab and enters completed tab
      expect(getFollowups(WS_ID, { tab: "today", referenceDate: today }).length).toBe(0);
      const completedList = getFollowups(WS_ID, { tab: "completed" });
      expect(completedList.length).toBe(1);
      expect(completedList[0].id).toBe(todayTask.id);
      expect(completedList[0].completed_at).not.toBeNull();

      // Reopen task
      updateFollowupStatus(WS_ID, todayTask.id, "pending");
      expect(getFollowups(WS_ID, { tab: "completed" }).length).toBe(0);
      expect(getFollowups(WS_ID, { tab: "today", referenceDate: today }).length).toBe(1);

      // Reschedule task to next week
      const nextWeek = "2026-10-30";
      rescheduleFollowup(WS_ID, todayTask.id, `${nextWeek}T09:00:00`);
      expect(getFollowups(WS_ID, { tab: "today", referenceDate: today }).length).toBe(0);
      expect(getFollowups(WS_ID, { tab: "upcoming", referenceDate: today }).length).toBe(2);
    });
  });
});
