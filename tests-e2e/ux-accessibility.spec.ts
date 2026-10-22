import { test, expect } from "@playwright/test";

test.describe("UX, Responsive & Accessibility Verification (Phase 8)", () => {
  test("verifies no horizontal window overflow across key pages on mobile viewport", async ({
    page,
  }) => {
    // Set viewport to mobile standard (393px width, Pixel 5 standard)
    await page.setViewportSize({ width: 393, height: 851 });

    const routes = ["/ringkasan", "/pelanggan", "/follow-up", "/pengaturan"];

    for (const route of routes) {
      await page.goto(route);
      await page.waitForLoadState("domcontentloaded");

      // Verify page document does not horizontally overflow viewport
      const isOverflowing = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });

      expect(
        isOverflowing,
        `Page ${route} should not have horizontal document overflow on mobile width 393px`
      ).toBe(false);
    }
  });

  test("verifies keyboard dialog interaction and Escape key dismissal", async ({
    page,
  }) => {
    await page.goto("/pelanggan");

    // Open Add Customer dialog using keyboard Enter
    const addBtn = page.getByRole("button", { name: "Tambah pelanggan" }).first();
    await addBtn.focus();
    await page.keyboard.press("Enter");

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Verify first input receives focus or is focusable
    await page.keyboard.press("Tab");
    const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
    expect(["INPUT", "BUTTON"]).toContain(focusedTag);

    // Press Escape to dismiss dialog
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
  });

  test("verifies mobile navigation touch targets are at least 44px high", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 393, height: 851 });
    await page.goto("/ringkasan");

    // Inspect mobile bottom bar links
    const bottomNavLinks = page.locator("nav[aria-label='Navigasi Bawah'] a");
    const count = await bottomNavLinks.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const box = await bottomNavLinks.nth(i).boundingBox();
      expect(box).not.toBeNull();
      if (box) {
        expect(
          box.height,
          `Bottom nav link index ${i} height should be at least 44px for thumb tap ergonomics`
        ).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test("verifies zero em dashes in visible UI copy across all main routes", async ({
    page,
  }) => {
    const routes = ["/ringkasan", "/pelanggan", "/pipeline", "/follow-up", "/pengaturan"];

    for (const route of routes) {
      await page.goto(route);
      await page.waitForLoadState("networkidle");

      // Extract all visible text content on page
      const bodyText = await page.evaluate(() => document.body.innerText);

      // Verify no em dash character (U+2014) is present
      const hasEmDash = bodyText.includes("—");
      expect(
        hasEmDash,
        `Page ${route} must not contain em dashes (—) in user-facing copy`
      ).toBe(false);
    }
  });
});
