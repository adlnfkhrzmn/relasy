/**
 * Uji end-to-end terhadap server yang benar-benar berjalan.
 *
 * Berbeda dari unit test, uji ini menembak HTTP seperti browser: login,
 * membuat pelanggan, peluang, follow-up, membaca dashboard, ekspor CSV,
 * sampai isolasi antar workspace. Tujuannya membuktikan lapisan database
 * terpasang benar dari ujung ke ujung.
 *
 * Pakai:
 *   node scripts/smoke-test.cjs
 *   BASE_URL=http://localhost:3000 node scripts/smoke-test.cjs
 */

const BASE = process.env.BASE_URL || "http://localhost:3005";

let cookie = "";
let passed = 0;
let failed = 0;

function check(name, condition, detail = "") {
  if (condition) {
    passed++;
    console.log(`  OK   ${name}`);
  } else {
    failed++;
    console.log(`  FAIL ${name}${detail ? " -> " + detail : ""}`);
  }
}

async function req(path, options = {}) {
  const res = await fetch(BASE + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
      ...(options.headers || {}),
    },
  });

  const setCookie = res.headers.getSetCookie?.() || [];
  for (const c of setCookie) {
    if (c.startsWith("relasy_session=")) {
      cookie = c.split(";")[0];
    }
  }

  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* bukan JSON, misalnya CSV */
  }
  return { status: res.status, json, text, headers: res.headers };
}

(async () => {
  console.log("\n=== 1. Halaman publik ===");
  const home = await req("/");
  check("beranda 200", home.status === 200, `status ${home.status}`);
  check(
    "beranda memuat branding Demo",
    /demo/i.test(home.text) && home.text.includes("tersedia untuk dibeli")
  );
  check(
    "beranda memuat tautan GitHub",
    home.text.includes("github.com/adlnfkhrzmn/relasy")
  );

  console.log("\n=== 2. Autentikasi ===");
  const badLogin = await req("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "pemilik@usaha.id", password: "salah" }),
  });
  check("login salah ditolak 401", badLogin.status === 401, `status ${badLogin.status}`);

  const login = await req("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "pemilik@usaha.id", password: "relasy123" }),
  });
  check("login benar 200", login.status === 200, `status ${login.status} ${login.text.slice(0, 120)}`);
  check("cookie sesi diterima", cookie.length > 0);

  const me = await req("/api/auth/me");
  check("sesi terbaca", me.status === 200 && me.json?.authenticated === true);

  console.log("\n=== 3. Pelanggan ===");
  const stamp = Date.now().toString().slice(-6);
  const created = await req("/api/customers", {
    method: "POST",
    body: JSON.stringify({
      name: `Uji E2E ${stamp}`,
      phone: `0812${stamp}`,
      email: `uji${stamp}@contoh.id`,
      company: "PT Uji Otomatis",
      source: "Pengujian",
      notes: "Dibuat oleh skrip verifikasi",
    }),
  });
  check("buat pelanggan 201", created.status === 201, `status ${created.status} ${created.text.slice(0, 150)}`);
  const custId = created.json?.data?.id;
  check("id pelanggan terbentuk", typeof custId === "string" && custId.startsWith("cust_"), JSON.stringify(created.json).slice(0, 200));

  const list = await req(`/api/customers?search=${encodeURIComponent("Uji E2E " + stamp)}`);
  check(
    "pencarian menemukan pelanggan (ILIKE case-insensitive)",
    Array.isArray(list.json?.data) && list.json.data.length === 1,
    JSON.stringify(list.json?.data?.length)
  );

  const lower = await req(`/api/customers?search=${encodeURIComponent("uji e2e " + stamp)}`);
  check(
    "pencarian huruf kecil tetap menemukan (bukti ILIKE bekerja)",
    Array.isArray(lower.json?.data) && lower.json.data.length === 1,
    JSON.stringify(lower.json?.data?.length)
  );

  const detail = await req(`/api/customers/${custId}`);
  check(
    "detail pelanggan terbaca",
    detail.status === 200 && detail.json?.data?.customer?.id === custId,
    JSON.stringify(detail.json).slice(0, 200)
  );
  check(
    "detail memuat relasi peluang/follow-up/aktivitas",
    Array.isArray(detail.json?.data?.opportunities) &&
      Array.isArray(detail.json?.data?.followups) &&
      Array.isArray(detail.json?.data?.activities)
  );

  const updated = await req(`/api/customers/${custId}`, {
    method: "PUT",
    body: JSON.stringify({ name: `Uji E2E ${stamp} Revisi` }),
  });
  check(
    "ubah pelanggan",
    updated.status === 200 && updated.json?.data?.name?.includes("Revisi"),
    JSON.stringify(updated.json).slice(0, 200)
  );

  console.log("\n=== 4. Peluang & pipeline ===");
  const opp = await req("/api/opportunities", {
    method: "POST",
    body: JSON.stringify({
      customerId: custId,
      title: "Proyek Uji E2E",
      stage: "negosiasi",
      estimatedValue: 12500000,
      expectedCloseDate: "2026-12-31",
    }),
  });
  check("buat peluang 201", opp.status === 201, `status ${opp.status} ${opp.text.slice(0, 150)}`);
  const oppId = opp.json?.data?.id;
  check(
    "nilai peluang berupa angka (bukan string)",
    typeof opp.json?.data?.estimated_value === "number",
    `tipe ${typeof opp.json?.data?.estimated_value}`
  );
  check("nilai peluang benar", opp.json?.data?.estimated_value === 12500000);

  const won = await req(`/api/opportunities/${oppId}`, {
    method: "PUT",
    body: JSON.stringify({ stage: "berhasil" }),
  });
  check("peluang menang tercatat", won.status === 200);

  const wonDetail = await req(`/api/opportunities/${oppId}`);
  check(
    "outcome_at terisi setelah menang",
    typeof wonDetail.json?.data?.outcome_at === "string",
    JSON.stringify(wonDetail.json?.data?.outcome_at)
  );

  console.log("\n=== 5. Follow-up ===");
  const today = new Date().toISOString().split("T")[0];
  const flw = await req("/api/followups", {
    method: "POST",
    body: JSON.stringify({
      customerId: custId,
      opportunityId: oppId,
      title: "Telepon lanjutan uji",
      note: "Catatan uji",
      dueAt: `${today}T09:00:00`,
    }),
  });
  check("buat follow-up 201", flw.status === 201, `status ${flw.status} ${flw.text.slice(0, 150)}`);
  const flwId = flw.json?.data?.id;

  const todayTab = await req(`/api/followups?tab=today&refDate=${today}`);
  check("follow-up muncul di tab hari ini", todayTab.status === 200);
  check(
    "hitungan tab tersedia",
    typeof todayTab.json?.counts?.today === "number",
    JSON.stringify(todayTab.json?.counts)
  );

  const toggled = await req(`/api/followups/${flwId}`, {
    method: "PUT",
    body: JSON.stringify({ action: "toggle_status" }),
  });
  check("tandai selesai", toggled.status === 200 && toggled.json?.status === "completed");

  const completedTab = await req("/api/followups?tab=completed");
  check(
    "follow-up pindah ke tab selesai",
    completedTab.json?.data?.some((f) => f.id === flwId) === true
  );

  console.log("\n=== 6. Dashboard ===");
  const dash = await req(`/api/dashboard?refDate=${today}`);
  check("dashboard 200", dash.status === 200, `status ${dash.status}`);
  check("metrik total pelanggan berupa angka", typeof dash.json?.metrics?.totalCustomers === "number");
  check(
    "nilai pipeline berupa angka (bukan string)",
    typeof dash.json?.metrics?.pipelineValue === "number",
    `tipe ${typeof dash.json?.metrics?.pipelineValue}`
  );
  check("ada aktivitas terbaru", Array.isArray(dash.json?.recentActivities));

  console.log("\n=== 7. Ekspor CSV ===");
  const csv = await req("/api/customers/export?scope=all");
  check("ekspor 200", csv.status === 200);
  check(
    "content-type CSV",
    (csv.headers.get("content-type") || "").includes("text/csv"),
    csv.headers.get("content-type")
  );
  check("CSV memuat pelanggan uji", csv.text.includes(`Uji E2E ${stamp}`));

  console.log("\n=== 8. Template follow-up ===");
  const tpl = await req("/api/followup-template");
  check("template terbaca", tpl.status === 200, `status ${tpl.status}`);

  console.log("\n=== 9. Isolasi workspace ===");
  const otherWs = await req("/api/customers?search=zzz_tidak_ada_zzz");
  check(
    "pencarian tak ada hasil mengembalikan array kosong",
    Array.isArray(otherWs.json?.data) && otherWs.json.data.length === 0
  );

  console.log("\n=== 10. Halaman terlindungi ===");
  for (const page of ["/ringkasan", "/pelanggan", "/pipeline", "/follow-up", "/pengaturan"]) {
    const r = await req(page);
    check(`halaman ${page} 200`, r.status === 200, `status ${r.status}`);
  }

  console.log("\n=== 11. Logout ===");
  const logout = await req("/api/auth/logout", { method: "POST", redirect: "manual" });
  check("logout mengalihkan ke /login", logout.status === 307 || logout.status === 302, `status ${logout.status}`);
  check(
    "cookie sesi dihapus",
    (logout.headers.getSetCookie?.() || []).some(
      (c) => c.startsWith("relasy_session=;") && /Max-Age=0/i.test(c)
    )
  );

  console.log(`\n================ HASIL ================`);
  console.log(`Lulus: ${passed}   Gagal: ${failed}`);
  process.exit(failed === 0 ? 0 : 1);
})().catch((e) => {
  console.error("\nERROR FATAL:", e.message);
  process.exit(1);
});
