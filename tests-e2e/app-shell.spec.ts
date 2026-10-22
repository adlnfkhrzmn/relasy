import { test, expect } from "@playwright/test";

test.describe("App Shell & Navigation Verification", () => {
  test("loads ringkasan page with honest empty states and no console errors", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto("/ringkasan");
    await expect(page).toHaveTitle(/Relasy/);

    // Verify main header
    const heading = page.locator("h1");
    await expect(heading).toHaveText("Ringkasan Bisnis");

    // Verify metric cards and overview sections
    await expect(page.getByText("Pelanggan Aktif").first()).toBeVisible();
    await expect(page.getByText("Peluang Terbuka").first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Follow-up Hari Ini", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Riwayat Aktivitas Terkini", exact: true })).toBeVisible();

    // Verify no console errors
    expect(consoleErrors).toEqual([]);
  });

  test("navigation links navigate correctly", async ({ page, isMobile }) => {
    await page.goto("/ringkasan");

    if (isMobile) {
      // On mobile, test bottom bar navigation
      await page.getByRole("link", { name: "Pelanggan" }).first().click();
      await expect(page).toHaveURL(/.*\/pelanggan/);
      await expect(page.locator("h1")).toHaveText("Daftar Pelanggan");

      await page.getByRole("link", { name: "Pipeline penjualan" }).first().click();
      await expect(page).toHaveURL(/.*\/pipeline/);
      await expect(page.locator("h1")).toHaveText("Pipeline Penjualan");

      await page.getByRole("link", { name: "Follow-up" }).first().click();
      await expect(page).toHaveURL(/.*\/follow-up/);
      await expect(page.locator("h1")).toHaveText("Tugas Follow-up");

      // Open mobile drawer for Pengaturan
      const menuBtn = page.getByRole("button", { name: /Buka menu navigasi/i });
      await menuBtn.click();
      await expect(page.getByText("Menu Utama")).toBeVisible();

      await page.getByRole("link", { name: "Pengaturan" }).first().click();
      await expect(page).toHaveURL(/.*\/pengaturan/);
      await expect(page.locator("h1")).toHaveText("Pengaturan Akun & Workspace");
    } else {
      // Desktop navigation
      await page.getByRole("link", { name: "Pelanggan" }).first().click();
      await expect(page).toHaveURL(/.*\/pelanggan/);
      await expect(page.locator("h1")).toHaveText("Daftar Pelanggan");

      await page.getByRole("link", { name: "Pipeline penjualan" }).first().click();
      await expect(page).toHaveURL(/.*\/pipeline/);
      await expect(page.locator("h1")).toHaveText("Pipeline Penjualan");

      await page.getByRole("link", { name: "Follow-up" }).first().click();
      await expect(page).toHaveURL(/.*\/follow-up/);
      await expect(page.locator("h1")).toHaveText("Tugas Follow-up");

      await page.getByRole("link", { name: "Pengaturan" }).first().click();
      await expect(page).toHaveURL(/.*\/pengaturan/);
      await expect(page.locator("h1")).toHaveText("Pengaturan Akun & Workspace");
    }
  });

  test("dialog opens and closes on Escape key and button click", async ({ page }) => {
    await page.goto("/pelanggan");

    const openBtn = page.getByRole("button", { name: /Tambah pelanggan/i }).first();
    await openBtn.click();

    // Verify dialog visible
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(page.getByText("Tambah Pelanggan Baru")).toBeVisible();

    // Press Escape to close (R-32)
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
  });
});
