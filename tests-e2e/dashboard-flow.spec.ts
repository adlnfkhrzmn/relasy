import { test, expect } from "@playwright/test";

test.describe("Dashboard and Cross-Feature Workflows (Phase 7)", () => {
  test("creates customer, opportunity, activity, follow-up, and verifies real-time updates on dashboard", async ({
    page,
  }) => {
    const uniqueSuffix = Date.now().toString().slice(-4);
    const customerName = `PT Cahaya Gemilang ${uniqueSuffix}`;
    const oppTitle = `Instalasi Server Lokal ${uniqueSuffix}`;
    const activityTitle = `Pertemuan teknis spesifikasi ${uniqueSuffix}`;
    const followUpTitle = `Kirim penawaran formal ${uniqueSuffix}`;

    // 1. Visit dashboard first
    await page.goto("/ringkasan");
    await expect(page.locator("h1")).toHaveText("Ringkasan Bisnis");

    // 2. Create customer
    await page.goto("/pelanggan");
    await page.getByRole("button", { name: "Tambah pelanggan" }).first().click();
    await page.getByLabel("Nama Lengkap").fill(customerName);
    await page.getByLabel("Nomor Telepon / WhatsApp").fill("081234556677");
    await page.getByLabel("Perusahaan / Usaha (Opsional)").fill("PT Cahaya Gemilang");
    await page.getByRole("button", { name: "Simpan pelanggan" }).click();
    await page.waitForTimeout(500);

    // Get customer link to open detail
    await page.getByRole("link", { name: customerName }).first().click();
    await expect(page.locator("h1")).toHaveText(customerName);

    // 3. Log an activity on customer detail
    await page.getByRole("button", { name: "Catat aktivitas baru" }).click();
    const actDialog = page.getByRole("dialog");
    await expect(actDialog).toBeVisible();
    await page.locator("#activity-type").selectOption("pertemuan");
    await page.getByLabel("Ringkasan Aktivitas").fill(activityTitle);
    await page.getByLabel("Rincian Pembahasan").fill("Diskusi skema instalasi bersama tim teknis.");
    await page.getByRole("button", { name: "Simpan aktivitas" }).click();
    await expect(actDialog).not.toBeVisible();

    // 4. Create an opportunity in /pipeline
    await page.goto("/pipeline");
    await page.getByRole("button", { name: "Tambah peluang" }).first().click();
    const oppDialog = page.getByRole("dialog");
    await expect(oppDialog).toBeVisible();
    await page.getByLabel("Judul Peluang").fill(oppTitle);
    await page.locator("#opp-customer").selectOption({ label: customerName });
    await page.getByLabel("Estimasi Nilai (Rp)").fill("25000000");
    await page.getByRole("button", { name: "Simpan peluang" }).click();
    await expect(oppDialog).not.toBeVisible();

    // 5. Schedule a follow-up task for today in /follow-up
    await page.goto("/follow-up");
    await page.getByRole("button", { name: "Jadwalkan follow-up" }).first().click();
    const taskDialog = page.getByRole("dialog");
    await expect(taskDialog).toBeVisible();
    await page.getByLabel("Judul Tugas").fill(followUpTitle);
    await page.locator("#task-customer").selectOption({ label: customerName });
    await page.getByLabel("Catatan Follow-up").fill("Kirim berkas PDF penawaran via email.");
    await page.getByRole("button", { name: "Simpan jadwal" }).click();
    await expect(taskDialog).not.toBeVisible();

    // 6. Navigate back to /ringkasan and verify cross-feature reflections
    await page.goto("/ringkasan");
    await expect(page.locator("h1")).toHaveText("Ringkasan Bisnis");

    // Verify task appears in Follow-up Hari Ini section
    await expect(page.getByText(followUpTitle).first()).toBeVisible();

    // Verify activity appears in Riwayat Aktivitas Terkini section
    await expect(page.getByText(activityTitle).first()).toBeVisible();

    // 7. Complete task directly from the dashboard
    const completeBtn = page.getByRole("button", {
      name: `Tandai selesai tugas ${followUpTitle}`,
    });
    await expect(completeBtn).toBeVisible();
    await completeBtn.click();

    // Verify success banner appears
    await expect(
      page.getByText(`Tugas "${followUpTitle}" berhasil diselesaikan.`)
    ).toBeVisible();

    // 8. Test card link navigation
    // Click Pelanggan Aktif card
    await page.getByRole("link", { name: /Pelanggan Aktif/i }).click();
    await expect(page).toHaveURL(/.*\/pelanggan/);

    // Return to dashboard and click Peluang Terbuka
    await page.goto("/ringkasan");
    await page.getByRole("link", { name: /Peluang Terbuka/i }).click();
    await expect(page).toHaveURL(/.*\/pipeline/);
  });
});
