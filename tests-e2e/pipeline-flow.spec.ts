import { test, expect } from "@playwright/test";

test.describe("Sales Pipeline & Opportunities User Flows (Phase 5)", () => {
  test("creates an opportunity and advances it across pipeline stages", async ({ page }) => {
    const uniqueSuffix = Date.now().toString().slice(-4);
    const oppTitle = `Proyek Instalasi Listrik ${uniqueSuffix}`;

    // First ensure we have a customer by visiting pelanggan
    await page.goto("/pelanggan");
    const existingCust = page.getByRole("link", { name: /Rincian/i }).first();
    const hasCustomer = await existingCust.isVisible().catch(() => false);

    if (!hasCustomer) {
      await page.getByRole("button", { name: "Tambah pelanggan" }).first().click();
      await page.getByLabel("Nama Lengkap").fill(`Klien Proyek ${uniqueSuffix}`);
      await page.getByRole("button", { name: "Simpan pelanggan" }).click();
      await page.waitForTimeout(500);
    }

    // Navigate to pipeline
    await page.goto("/pipeline");
    await expect(page.locator("h1")).toHaveText("Pipeline Penjualan");

    // Click Tambah peluang
    await page.getByRole("button", { name: "Tambah peluang" }).first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await page.getByLabel("Judul Peluang").fill(oppTitle);
    await page.locator("#opp-customer").selectOption({ index: 1 });
    await page.getByLabel("Estimasi Nilai (Rp)").fill("12500000");

    await page.getByRole("button", { name: "Simpan peluang" }).click();
    await expect(dialog).not.toBeVisible();

    // Verify opportunity appears in board
    await expect(page.getByText(oppTitle).first()).toBeVisible();
    await expect(page.getByText("Rp 12.500.000").first()).toBeVisible();

    // Move to 'Dihubungi' using the accessible select
    const stageSelect = page.getByLabel(`Ubah tahapan peluang ${oppTitle}`);
    await stageSelect.selectOption("dihubungi");

    // Wait for update
    await page.waitForTimeout(800);
    await expect(page.getByLabel(`Ubah tahapan peluang ${oppTitle}`)).toHaveValue("dihubungi");

    // Switch to Table view
    await page.getByTitle("Tampilan Tabel").click();
    await expect(page.getByText(oppTitle).first()).toBeVisible();
    await expect(page.getByText("Dihubungi").first()).toBeVisible();

    // Switch back to Board view
    await page.getByTitle("Tampilan Pipeline").click();
    await expect(page.getByText(oppTitle).first()).toBeVisible();
  });
});
