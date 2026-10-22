# Relasy — CRM Web Application untuk Bisnis Mandiri

Relasy adalah aplikasi web Customer Relationship Management (CRM) mandiri yang dirancang khusus untuk pemilik usaha kecil dan menengah (UMKM) di Indonesia. Aplikasi ini fokus pada efisiensi pencatatan pelanggan, pengelolaan pipeline penjualan bertahap, dan pengingat follow-up tepat waktu tanpa beban integrasi eksternal yang rumit.

Aplikasi ini dibangun 100% menggunakan bahasa Indonesia yang natural, kontemporer, dan ramah pengguna sesuai dengan standar panduan gaya bahasa `docs/content-style-guide.md`.

---

## Fitur Utama Relasy

1. **Ringkasan Bisnis (Dashboard Live)**:
   - Metrik agregat waktu-nyata: Pelanggan aktif, peluang terbuka, total estimasi nilai pipeline, follow-up hari ini, tugas terlambat, dan peluang yang berhasil dimenangkan.
   - Daftar follow-up hari ini dengan aksi penyelesaian langsung dari dashboard.
   - Riwayat interaksi dan aktivitas pelanggan terkini.
   - Pintasan langsung dari kartu metrik ke daftar data terkait.

2. **Pengelolaan Data Pelanggan**:
   - Pencatatan lengkap: Nama lengkap, telepon/WhatsApp, email, nama usaha/perusahaan, sumber kontak, dan catatan kebutuhan.
   - Pencarian instan dan penyaringan status (Aktif vs. Diarsipkan).
   - Tautan langsung `wa.me` (eksternal, tanpa sinkronisasi otomatis).
   - Halaman rincian pelanggan dengan tab timeline aktivitas interaksi, peluang penjualan, dan jadwal follow-up.
   - Fitur arsip, pemulihan dari arsip, dan penghapusan data dengan konfirmasi aman.

3. **Pipeline Penjualan & Peluang Transaksi**:
   - 5 tahapan penjualan terstruktur: **Baru**, **Dihubungi**, **Negosiasi**, **Berhasil**, dan **Tidak berhasil**.
   - Tampilan Papan Kanban interaktif dan Tampilan Tabel ringkas.
   - Penghitungan otomatis total nilai transaksi per tahap (format Rupiah Indonesia).
   - Transisi tahapan yang aksesibel dengan dukungan navigasi keyboard dan pemilih dropdown.

4. **Riwayat Aktivitas & Jadwal Follow-up**:
   - 5 jenis interaksi: **Catatan**, **Telepon**, **Pertemuan**, **Pesan manual**, dan **Lainnya**.
   - Manajemen follow-up dengan 4 tab filter: **Hari ini**, **Mendatang**, **Terlambat**, dan **Selesai**.
   - Penjadwalan ulang tanggal tenggat dan pembaruan status tugas.
   - Penanganan zona waktu lokal yang konsisten.

5. **Pengaturan Akun & Workspace**:
   - Konfigurasi nama bisnis/workspace mandiri.
   - Profil pengguna dan kontak akun pemilik usaha.
   - Status database lokal dan isolasi keamanan data multi-tenant.

---

## Teknologi yang Digunakan

- **Framework**: Next.js 15 (App Router, React 19, TypeScript).
- **Styling**: Tailwind CSS dengan palet warna slate/blue bernilai kontras tinggi (WCAG AA).
- **Database**: SQLite lokal mandiri menggunakan native `node:sqlite` (`DatabaseSync` dengan WAL mode dan foreign keys).
- **Keamanan**: Autentikasi sesi HMAC-SHA256, enkripsi kata sandi `bcryptjs`, validasi skema server-side dengan `zod`, dan isolasi boundary multi-tenant per workspace.
- **Pengujian**: Vitest (Unit & Integration) dan Playwright (End-to-End browser testing untuk Desktop dan Mobile Chrome viewports).

---

## Panduan Instalasi dan Menjalankan Aplikasi

### Persyaratan Sistem
- Node.js versi 20+ (Direkomendasikan Node.js v24.15.0 atau lebih baru).
- npm versi 10+ (Di Windows PowerShell, selalu jalankan `npm.cmd` dan `npx.cmd`).

### Langkah-langkah
1. **Clone atau buka repositori Relasy**:
   ```powershell
   cd c:\Website\Relasy
   ```

2. **Konfigurasi Environment Variables**:
   Salin berkas `.env.example` menjadi `.env.local`:
   ```powershell
   Copy-Item .env.example .env.local
   ```
   *Catatan*: Port aplikasi disetel secara eksplisit ke **port 3005** (`http://localhost:3005`).

3. **Install Dependensi**:
   ```powershell
   npm.cmd install
   ```

4. **Menjalankan Server Pengembangan (Dev Mode)**:
   ```powershell
   npm.cmd run dev
   ```
   Aplikasi dapat diakses di browser melalui: `http://localhost:3005`

5. **Membangun Versi Produksi (Production Build)**:
   ```powershell
   npm.cmd run build
   ```

6. **Menjalankan Server Produksi**:
   ```powershell
   npm.cmd start
   ```

---

## Menjalankan Pengujian (Testing)

- **Unit & Integration Tests (Vitest)**:
  ```powershell
  npm.cmd test
  ```
  Menjalankan 21 unit & integration tests yang mencakup operasi database, otentikasi sesi, CRUD pelanggan, pipeline peluang, follow-up, metrik dashboard, dan isolasi tenant.

- **End-to-End Browser Tests (Playwright)**:
  ```powershell
  npm.cmd run test:e2e
  ```
  Menjalankan 22 browser tests komprehensif pada browser Desktop Chromium dan Mobile Chrome viewport (Pixel 5, lebar 393px).

- **TypeScript Typecheck**:
  ```powershell
  npx.cmd tsc --noEmit
  ```

---

## Akun Demo Bawaan

Saat pertama kali aplikasi dijalankan, database SQLite lokal di `./data/relasy.db` akan membuat akun admin bawaan secara otomatis:
- **Email**: `pemilik@usaha.id`
- **Kata Sandi**: `relasy123`
- **Workspace**: `Usaha Saya`

---

## Struktur Direktori

```text
├── src/
│   ├── app/                      # Next.js App Router (pages & API routes)
│   │   ├── api/                  # REST API endpoints (auth, customers, opportunities, followups, dashboard)
│   │   ├── follow-up/            # Halaman manajemen tugas follow-up
│   │   ├── login/                # Halaman autentikasi login
│   │   ├── pelanggan/            # Halaman daftar dan rincian pelanggan (/pelanggan/[id])
│   │   ├── pengaturan/           # Halaman pengaturan profil dan workspace
│   │   ├── pipeline/             # Halaman pipeline penjualan (Kanban & tabel)
│   │   └── ringkasan/            # Halaman dashboard ikhtisar bisnis
│   ├── components/               # Komponen UI modular
│   │   ├── layout/               # AppShell, NavLinks, header, drawer & bottom navigation
│   │   └── ui/                   # Button, Input, Select, Dialog, Card, Badge, EmptyState, StatCard
│   └── lib/                      # Utilitas & logika inti
│       ├── auth/                 # Manajemen sesi, token HMAC, dan hash password
│       ├── db/                   # Koneksi node:sqlite, skema tabel, dan repositories
│       └── utils.ts              # Format Rupiah (IDR), format tanggal Indonesia, kalkulasi relative date
├── tests-e2e/                    # Pengujian browser Playwright
├── docs/                         # Dokumentasi arsitektur, PRD, dan panduan gaya bahasa
└── ops/                          # Log status operasional (working-state.md)
```
