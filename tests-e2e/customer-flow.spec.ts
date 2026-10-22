import { test, expect } from "@playwright/test";

test.describe("Customer Management User Flows (Phase 4)", () => {
  test("creates a new customer and displays it in list and detail view", async ({ page }) => {
    const uniqueSuffix = Date.now().toString().slice(-4);
    const initialName = `Andi Pratama ${uniqueSuffix}`;
    const updatedName = `Andi Pratama S.T. ${uniqueSuffix}`;

    await page.goto("/pelanggan");

    // Click Tambah pelanggan
    await page.getByRole("button", { name: "Tambah pelanggan" }).first().click();

    // Fill form
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await page.getByLabel("Nama Lengkap").fill(initialName);
    await page.getByLabel("Nomor Telepon / WhatsApp").fill("081234567890");
    await page.getByLabel("Email").fill(`andi.${uniqueSuffix}@sukses.id`);
    await page.getByLabel("Perusahaan / Usaha (Opsional)").fill("CV Sukses Mandiri");

    // Submit
    await page.getByRole("button", { name: "Simpan pelanggan" }).click();

    // Verify dialog closes and customer is in list
    await expect(dialog).not.toBeVisible();
    await expect(page.getByRole("link", { name: initialName }).first()).toBeVisible();

    // Click customer link to open detail
    await page.getByRole("link", { name: initialName }).first().click();
    await expect(page).toHaveURL(/.*\/pelanggan\/cust_.*/);

    // Verify detail page
    await expect(page.locator("h1")).toHaveText(initialName);
    await expect(page.getByText("CV Sukses Mandiri").first()).toBeVisible();
    await expect(page.getByText("081234567890")).toBeVisible();
    await expect(page.getByRole("link", { name: /WhatsApp/i })).toBeVisible();

    // Edit customer
    await page.getByRole("button", { name: /Ubah data/i }).click();
    const editDialog = page.getByRole("dialog");
    await expect(editDialog).toBeVisible();

    await page.getByLabel("Nama Lengkap").fill(updatedName);
    await page.getByRole("button", { name: "Simpan perubahan" }).click();
    await expect(editDialog).not.toBeVisible();
    await expect(page.locator("h1")).toHaveText(updatedName);

    // Archive customer
    await page.getByRole("button", { name: "Arsipkan" }).click();
    await expect(page.getByText("Diarsipkan").first()).toBeVisible();

    // Return to list and check tabs
    await page.getByRole("link", { name: /Kembali ke daftar pelanggan/i }).click();
    await expect(page).toHaveURL(/.*\/pelanggan/);

    // Should not be in active tab
    await expect(page.getByRole("link", { name: updatedName })).not.toBeVisible();

    // Click "Diarsipkan" tab
    await page.getByRole("button", { name: "Diarsipkan" }).click();
    await expect(page.getByRole("link", { name: updatedName }).first()).toBeVisible();

    // Restore customer
    await page.getByTitle("Pulihkan dari arsip").first().click();

    // Check active tab again
    await page.getByRole("button", { name: "Aktif" }).click();
    await expect(page.getByRole("link", { name: updatedName }).first()).toBeVisible();
  });
});
