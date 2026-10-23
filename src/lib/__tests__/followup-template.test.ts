import { describe, it, expect } from "vitest";
import {
  DEFAULT_FOLLOWUP_TEMPLATE,
  FOLLOWUP_TEMPLATE_PRESETS,
  generateFollowupText,
  buildManualWhatsAppHref,
} from "../followup-template";

describe("Follow-up Text Template Engine", () => {
  it("interpolates customer name, company, task title, and date accurately", () => {
    const result = generateFollowupText(DEFAULT_FOLLOWUP_TEMPLATE, {
      customerName: "Budi Santoso",
      company: "PT Maju Bersama",
      taskTitle: "Review Proposal Kontrak",
      dueAt: "2026-10-25",
    });

    expect(result).toContain("Budi Santoso");
    expect(result).toContain("PT Maju Bersama");
    expect(result).toContain("Review Proposal Kontrak");
    expect(result).toContain("2026");
  });

  it("provides sensible Indonesian fallbacks when variables are empty", () => {
    const result = generateFollowupText(DEFAULT_FOLLOWUP_TEMPLATE, {});
    expect(result).toContain("Bapak/Ibu");
    expect(result).toContain("perusahaan Anda");
    expect(result).not.toContain("{nama}");
    expect(result).not.toContain("{perusahaan}");
  });

  it("builds manual wa.me links with encoded template text when active", () => {
    const hrefWithText = buildManualWhatsAppHref("0812-3456-7890", "Halo Budi, apa kabar?");
    expect(hrefWithText).toBe(
      "https://wa.me/6281234567890?text=Halo%20Budi%2C%20apa%20kabar%3F"
    );

    const hrefPlain = buildManualWhatsAppHref("0812-3456-7890", null);
    expect(hrefPlain).toBe("https://wa.me/6281234567890");
  });

  it("contains zero em dashes across all preset templates and descriptions", () => {
    for (const preset of FOLLOWUP_TEMPLATE_PRESETS) {
      expect(preset.name.includes("—")).toBe(false);
      expect(preset.description.includes("—")).toBe(false);
      expect(preset.template.includes("—")).toBe(false);
    }
  });
});
