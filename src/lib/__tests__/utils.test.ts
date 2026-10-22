import { describe, it, expect } from "vitest";
import { formatCurrency, formatDate, formatRelativeDueDate } from "../utils";

describe("Utility functions", () => {
  describe("formatCurrency", () => {
    it("formats IDR amounts correctly", () => {
      expect(formatCurrency(1500000)).toMatch(/Rp\s*1\.500\.000/);
      expect(formatCurrency(0)).toMatch(/Rp\s*0/);
      expect(formatCurrency(null)).toBe("Rp 0");
      expect(formatCurrency(undefined)).toBe("Rp 0");
    });
  });

  describe("formatDate", () => {
    it("formats ISO date strings to Indonesian locale format", () => {
      const formatted = formatDate("2026-10-23T10:00:00Z");
      expect(formatted).toContain("23");
      expect(formatted).toContain("2026");
      expect(formatDate(null)).toBe("-");
    });
  });

  describe("formatRelativeDueDate", () => {
    it("identifies today correctly", () => {
      const now = new Date();
      const res = formatRelativeDueDate(now);
      expect(res.isToday).toBe(true);
      expect(res.label).toBe("Hari ini");
      expect(res.isOverdue).toBe(false);
    });

    it("identifies overdue correctly", () => {
      const past = new Date();
      past.setDate(past.getDate() - 3);
      const res = formatRelativeDueDate(past);
      expect(res.isOverdue).toBe(true);
      expect(res.label).toBe("Terlambat 3 hari");
    });

    it("identifies upcoming correctly", () => {
      const future = new Date();
      future.setDate(future.getDate() + 2);
      const res = formatRelativeDueDate(future);
      expect(res.isOverdue).toBe(false);
      expect(res.label).toBe("2 hari lagi");
    });
  });
});
