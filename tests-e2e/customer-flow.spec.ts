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

  test("imports customers from CSV with validation, duplicate detection, and exports CSV", async ({
    page,
  }) => {
    const suffix = Date.now().toString().slice(-4);
    const validName = `Pelanggan Impor ${suffix}`;
    const validPhone = `08127700${suffix}`;

    await page.goto("/pelanggan");

    // 1. Open Import Dialog
    await page.getByRole("button", { name: "Impor" }).first().click();
    const importDialog = page.getByRole("dialog");
    await expect(importDialog).toBeVisible();
    await expect(page.getByText("Impor Data Pelanggan (CSV)")).toBeVisible();

    // 2. Upload CSV containing 1 valid row, 1 invalid row (missing name), and 1 duplicate row (same phone in file)
    const csvContent = [
      "Nama Lengkap;Nomor Telepon;Email;Perusahaan;Sumber Pelanggan;Catatan",
      `${validName};${validPhone};impor.${suffix}@niaga.id;PT Impor Nusantara;CSV;Catatan impor baris 1`,
      `;081200009999;tanpanama@niaga.id;PT Tanpa Nama;CSV;Baris tidak valid`,
      `Duplikat ${suffix};${validPhone};dup.${suffix}@niaga.id;PT Duplikat;CSV;Baris duplikat telepon`,
    ].join("\r\n");

    await page.locator("#csv-file-input").setInputFiles({
      name: "pelanggan-uji.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(csvContent, "utf-8"),
    });

    // 3. Verify preview counts: 1 valid, 1 duplicate, 1 invalid
    await expect(page.getByTestId("import-valid-count")).toHaveText("1");
    await expect(page.getByTestId("import-duplicate-count")).toHaveText("1");
    await expect(page.getByTestId("import-invalid-count")).toHaveText("1");

    // 4. Confirm import
    await page.getByRole("button", { name: "Konfirmasi & Impor" }).click();

    // 5. Verify result report appears
    const reportBox = page.getByTestId("import-result-report");
    await expect(reportBox).toBeVisible();
    await expect(reportBox).toContainText("Laporan Hasil Impor Pelanggan");

    // Close dialog and verify imported customer is persisted in the customer list
    await page.getByRole("button", { name: "Tutup", exact: true }).click();
    await expect(importDialog).not.toBeVisible();
    await expect(page.getByRole("link", { name: validName }).first()).toBeVisible();

    // 6. Verify CSV Export endpoint returns valid UTF-8 CSV with preserved leading zero phone number
    const exportRes = await page.request.get(
      `/api/customers/export?scope=filtered&search=${encodeURIComponent(validName)}`
    );
    expect(exportRes.ok()).toBe(true);
    const exportedCsv = await exportRes.text();
    expect(exportedCsv).toContain(validName);
    expect(exportedCsv).toContain(validPhone);
  });
});
