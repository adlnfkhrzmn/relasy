import { test, expect } from "@playwright/test";

test.describe("Activity History & Follow-up Tasks User Flows (Phase 6)", () => {
  test("creates follow-up task, completes it, reschedules, and logs activity in customer timeline", async ({
    page,
  }) => {
    const uniqueSuffix = Date.now().toString().slice(-4);
    const customerName = `Budi Raharja ${uniqueSuffix}`;
    const followUpTitle = `Telepon penawaran final ${uniqueSuffix}`;
    const activityTitle = `Diskusi via telepon paket langganan ${uniqueSuffix}`;

    // 1. Ensure customer exists
    await page.goto("/pelanggan");
    await page.getByRole("button", { name: "Tambah pelanggan" }).first().click();
    await page.getByLabel("Nama Lengkap").fill(customerName);
    await page.getByLabel("Nomor Telepon / WhatsApp").fill("081299887766");
    await page.getByRole("button", { name: "Simpan pelanggan" }).click();
    await page.waitForTimeout(500);

    // 2. Schedule a follow-up task from /follow-up
    await page.goto("/follow-up");
    await expect(page.locator("h1")).toHaveText("Tugas Follow-up");

    await page.getByRole("button", { name: "Jadwalkan follow-up" }).first().click();
    const taskDialog = page.getByRole("dialog");
    await expect(taskDialog).toBeVisible();

    await page.getByLabel("Judul Tugas").fill(followUpTitle);
    await page.locator("#task-customer").selectOption({ label: customerName });
    await page.getByLabel("Catatan Follow-up").fill("Konfirmasi kebutuhan spesifikasi teknis");

    await page.getByRole("button", { name: "Simpan jadwal" }).click();
    await expect(taskDialog).not.toBeVisible();

    // Verify task is visible in today's tab
    await expect(page.getByText(followUpTitle).first()).toBeVisible();

    // 3. Mark task as completed
    const completeButton = page.getByRole("button", {
      name: `Tandai status tugas ${followUpTitle}`,
    });
    await completeButton.click();
    await page.waitForTimeout(800);

    // Click "Selesai" tab and verify it's there
    await page.locator("div.border-b button", { hasText: "Selesai" }).click();
    await expect(page.getByText(followUpTitle).first()).toBeVisible();

    // Reopen task
    const reopenButton = page.getByRole("button", {
      name: `Tandai status tugas ${followUpTitle}`,
    });
    await reopenButton.click();
    await page.waitForTimeout(800);

    // Switch back to "Hari ini" tab
    await page.locator("div.border-b button", { hasText: "Hari ini" }).click();
    await expect(page.getByText(followUpTitle).first()).toBeVisible();

    // 4. Reschedule task to next week
    await page.getByRole("button", { name: `Jadwalkan ulang tugas ${followUpTitle}` }).click();
    const rescheduleDialog = page.getByRole("dialog");
    await expect(rescheduleDialog).toBeVisible();

    // Set new date 7 days later
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const futureIso = futureDate.toISOString().split("T")[0];
    await page.getByLabel("Tanggal Tenggat Baru").fill(futureIso);
    await page.getByRole("button", { name: "Perbarui tanggal" }).click();
    await expect(rescheduleDialog).not.toBeVisible();

    // Check "Mendatang" tab
    await page.locator("div.border-b button", { hasText: "Mendatang" }).click();
    await expect(page.getByText(followUpTitle).first()).toBeVisible();

    // 5. Open Customer detail page and log an activity
    await page.goto("/pelanggan");
    await page.getByRole("link", { name: customerName }).first().click();
    await expect(page.locator("h1")).toHaveText(customerName);

    // Click "Catat aktivitas baru"
    await page.getByRole("button", { name: "Catat aktivitas baru" }).click();
    const actDialog = page.getByRole("dialog");
    await expect(actDialog).toBeVisible();

    await page.locator("#activity-type").selectOption("telepon");
    await page.getByLabel("Ringkasan Aktivitas").fill(activityTitle);
    await page.getByLabel("Rincian Pembahasan").fill("Pelanggan setuju dengan draft penawaran.");
    await page.getByRole("button", { name: "Simpan aktivitas" }).click();
    await expect(actDialog).not.toBeVisible();

    // Verify activity appears in timeline
    await expect(page.getByText(activityTitle).first()).toBeVisible();
    await expect(page.getByText("Pelanggan setuju dengan draft penawaran.").first()).toBeVisible();
  });
});
