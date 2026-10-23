import { test, expect } from "@playwright/test";

test.describe("Executive Luxury Features, Navigation, Theme & Template Automation", () => {
  test("renders standalone front showcase page (/) with fixed top navigation, clean module section without action links, and custom template section", async ({
    page,
  }) => {
    await page.goto("/");

    // Verify Dithering CTA Hero heading and primary call to action
    await expect(page.locator("h1")).toContainText("Data pelanggan tertata.");
    await expect(page.locator("h1")).toContainText("Langkah berikutnya jelas.");
    await expect(page.getByRole("link", { name: "Masuk ke Aplikasi" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Lihat Fitur" })).toHaveCount(0);

    // Verify top section navigation links (Beranda, Keunggulan, Modul, Template, Perbandingan, Panduan) stay fixed at top
    const sectionNav = page.locator("nav[aria-label='Navigasi Bagian Halaman']");
    await expect(sectionNav.getByRole("button", { name: "Beranda" })).toBeVisible();
    await expect(sectionNav.getByRole("button", { name: "Keunggulan" })).toBeVisible();
    await expect(sectionNav.getByRole("button", { name: "Modul" })).toBeVisible();
    await expect(sectionNav.getByRole("button", { name: "Template" })).toBeVisible();

    const headerPosition = await page
      .locator("header")
      .first()
      .evaluate((el) => window.getComputedStyle(el).position);
    expect(headerPosition).toBe("fixed");

    // Verify Login button is present in top right and unwanted claims/elements are absent
    await expect(page.getByRole("link", { name: "Masuk", exact: true }).first()).toBeVisible();
    const bodyText = await page.evaluate(() => document.body.innerText);
    expect(bodyText.includes("Halaman Muka")).toBe(false);
    expect(bodyText.includes("100% aman dari pemblokiran")).toBe(false);
    expect(bodyText.includes("—")).toBe(false);

    // Verify action links are removed from Modul Aplikasi section
    expect(bodyText.includes("Buka Pelanggan")).toBe(false);
    expect(bodyText.includes("Buka Pipeline")).toBe(false);
    expect(bodyText.includes("Buka Follow-up")).toBe(false);
    expect(bodyText.includes("Buka Dashboard")).toBe(false);

    // Verify sample customer preview is removed from Template section and custom template text is explained
    expect(bodyText.includes("Bapak Hendra Wijaya")).toBe(false);
    await expect(
      page.getByRole("heading", {
        name: /Buat custom template teks sesuai gaya bahasa bisnis Anda/i,
      })
    ).toBeVisible();

    // Verify all 6 core modules are present with natural Indonesian copy
    await expect(page.getByRole("heading", { name: "Data Pelanggan", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Pipeline Penjualan", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Jadwal Follow-up", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Template Pesan", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Riwayat Aktivitas", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Dashboard Ringkasan", exact: true })).toBeVisible();

    // Verify Google SEO JSON-LD script is present
    const jsonLdContent = await page
      .locator('script[type="application/ld+json"]')
      .textContent();
    expect(jsonLdContent).toContain("SoftwareApplication");
    expect(jsonLdContent).toContain("Relasy CRM");
  });

  test("authenticates on /login with clean centered SignInCard (no outer CRM logo, theme toggle inside card) and redirects to /dashboard", async ({
    page,
  }) => {
    await page.goto("/login");

    await expect(page.getByRole("heading", { name: "Selamat datang" })).toBeVisible();
    await expect(page.getByTestId("theme-toggle")).toBeVisible();

    // Verify CRM logo heading and boilerplate demo credentials are not displayed on /login
    await expect(page.getByRole("heading", { name: "Relasy CRM" })).toHaveCount(0);
    const loginBodyText = await page.evaluate(() => document.body.innerText);
    expect(loginBodyText.includes("Akun bawaan:")).toBe(false);

    // Submit login form to enter /dashboard
    await page.getByRole("button", { name: /Masuk ke Dashboard/i }).click();
    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(page.locator("h1")).toHaveText("Ringkasan Bisnis");
  });

  test("toggles desktop sidebar by clicking Relasy logo and toggles Dark/Light mode on /dashboard", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "Desktop sidebar logo toggle is specific to desktop viewport");

    await page.goto("/dashboard");
    const sidebar = page.locator("aside[aria-label='Menu Samping Desktop']");
    await expect(sidebar).toHaveAttribute("data-sidebar-hidden", "false");

    // Verify "Halaman Muka" is removed from sidebar menu
    await expect(sidebar.getByText("Halaman Muka")).toHaveCount(0);
    await expect(sidebar.getByRole("link", { name: "Dashboard" })).toBeVisible();

    // Click logo in sidebar header to hide sidebar
    const hideLogoBtn = page.getByRole("button", { name: /Sembunyikan menu samping/i }).first();
    await hideLogoBtn.click();
    await expect(sidebar).toHaveAttribute("data-sidebar-hidden", "true");

    // Click logo in top header to show sidebar again
    const showLogoBtn = page.getByRole("button", { name: /Tampilkan menu samping/i }).first();
    await showLogoBtn.click();
    await expect(sidebar).toHaveAttribute("data-sidebar-hidden", "false");

    // Toggle Dark / Light mode
    const themeToggle = page.locator("[data-testid='theme-toggle']:visible").first();
    await themeToggle.click();
    const isDarkAfterClick = await page.evaluate(() =>
      document.documentElement.classList.contains("dark")
    );
    expect(isDarkAfterClick).toBe(true);

    // Toggle back to Light mode
    await themeToggle.click();
    const isDarkAfterSecondClick = await page.evaluate(() =>
      document.documentElement.classList.contains("dark")
    );
    expect(isDarkAfterSecondClick).toBe(false);
  });

  test("follow-up text template toggle (Aktif vs Nonaktif) automatically generates text when active", async ({
    page,
  }) => {
    const suffix = Date.now().toString().slice(-4);
    const taskTitle = `Presentasi Kontrak Eksekutif ${suffix}`;

    // Ensure at least one customer exists via API
    await page.request.post("/api/customers", {
      data: {
        name: "PT Sinar Abadi Nusantara",
        phone: "081299887766",
        company: "Sinar Abadi Group",
      },
    });

    await page.goto("/follow-up");

    const statusBadge = page.getByTestId("template-status-badge");
    await expect(statusBadge).toBeVisible();

    // Ensure template starts in Aktif state
    const currentBadgeText = await statusBadge.textContent();
    if (currentBadgeText?.trim() === "Nonaktif") {
      await page.getByRole("switch", { name: "Status Template Teks Follow-up" }).click();
    }
    await expect(statusBadge).toHaveText("Aktif");

    // Open Add Follow-up modal when template is ACTIVE -> note should be auto-generated
    await page.getByRole("button", { name: /Jadwalkan follow-up/i }).click();
    const noteInput = page.locator("#followup-note");
    await expect(noteInput).not.toHaveValue("");
    await page.getByRole("button", { name: "Batal" }).click();

    // Toggle template to NONAKTIF
    await page.getByRole("switch", { name: "Status Template Teks Follow-up" }).click();
    await expect(statusBadge).toHaveText("Nonaktif");

    // Open Add Follow-up modal when template is INACTIVE -> note should be empty
    await page.getByRole("button", { name: /Jadwalkan follow-up/i }).click();
    await expect(noteInput).toHaveValue("");
    await page.getByRole("button", { name: "Batal" }).click();

    // Restore template back to AKTIF and schedule a task to test clicking Follow-up button
    await page.getByRole("switch", { name: "Status Template Teks Follow-up" }).click();
    await expect(statusBadge).toHaveText("Aktif");

    await page.getByRole("button", { name: /Jadwalkan follow-up/i }).click();
    await page.getByLabel("Judul Tugas").fill(taskTitle);
    await page.getByRole("button", { name: "Simpan jadwal" }).click();

    // Click Follow-up action button on the task card
    const followupActionBtn = page
      .getByRole("button", { name: new RegExp(`Follow-up tugas ${taskTitle}`, "i") })
      .first();
    await expect(followupActionBtn).toBeVisible();
    await followupActionBtn.click();

    // Verify modal opens with auto-generated text from template
    const generatedTextarea = page.locator("#generated-followup-textarea");
    await expect(generatedTextarea).toBeVisible();
    const generatedVal = await generatedTextarea.inputValue();
    expect(generatedVal).toContain(taskTitle);
  });
});
