# Deploy Relasy ke Vercel + Supabase

Panduan ini mengikuti urutan yang paling kecil risikonya: database disiapkan
dulu, baru aplikasi di-deploy. Semua langkah di bawah memakai paket gratis
kedua layanan.

Perkiraan waktu: 15 sampai 20 menit.

---

## Bagian 1: Menyiapkan Supabase

### 1.1 Buat project

1. Buka [supabase.com](https://supabase.com) lalu masuk.
2. Klik **New project**.
3. Isi:
   - **Name**: `relasy`
   - **Database Password**: klik **Generate a password**, lalu **simpan
     password ini**. Password hanya ditampilkan sekali dan dibutuhkan pada
     langkah 1.3.
   - **Region**: pilih yang paling dekat dengan pengguna, misalnya
     **Southeast Asia (Singapore)**.
4. Klik **Create new project** dan tunggu sekitar 2 menit sampai status
   project menjadi hijau.

### 1.2 Buat tabel lewat SQL Editor

1. Di sidebar kiri, klik **SQL Editor**.
2. Klik **New query**.
3. Buka file [`supabase/schema.sql`](../supabase/schema.sql) di repo ini,
   salin **seluruh isinya**, tempel ke editor.
4. Klik **Run** (atau tekan `Ctrl+Enter`).

Hasil yang benar: muncul pesan `Success. No rows returned`, dan di menu
**Table Editor** sekarang ada 7 tabel: `workspaces`, `users`, `customers`,
`opportunities`, `activities`, `followups`, `followup_templates`.

Skrip ini idempoten. Kalau tidak sengaja dijalankan dua kali, tidak terjadi
apa-apa dan tidak ada data yang hilang.

> Ingin membawa data lama? Setelah langkah ini, jalankan
> `npm run db:seed`, lalu tempel isi `supabase/seed.sql` ke SQL Editor dan
> klik **Run**. Data contoh berisi 193 pelanggan, 75 peluang, dan 86
> follow-up. Langkah ini opsional.

### 1.3 Ambil connection string

1. Klik ikon **gear** di sidebar kiri, pilih **Database**.
2. Gulir ke bagian **Connection string**.
3. Pilih tab **Transaction pooler** (bukan **Direct connection**).

   Ini penting. Host **Direct connection** hanya mendukung IPv6 dan tidak
   bisa dihubungi dari Vercel. Host **Transaction pooler** memakai IPv4 dan
   mendukung penyatuan koneksi, jadi cocok untuk serverless.

4. Salin string yang tampil. Bentuknya seperti ini:

   ```
   postgresql://postgres.abcdefghijklm:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
   ```

5. Ganti `[YOUR-PASSWORD]` dengan password dari langkah 1.1.

   Bila password mengandung karakter khusus seperti `@`, `#`, atau `/`,
   ubah dulu dengan *percent-encoding*. Contoh: `@` menjadi `%40`.
   Cara paling mudah: di halaman yang sama, klik tombol **Copy** pada
   connection string; Supabase biasanya sudah meng-encode-nya otomatis.

Simpan string ini. Sebentar lagi dipakai sebagai `DATABASE_URL`.

---

## Bagian 2: Deploy ke Vercel

### 2.1 Impor repo

1. Buka [vercel.com/new](https://vercel.com/new).
2. Pilih **Import Git Repository**, lalu pilih `adlnfkhrzmn/relasy`.

   Bila repo belum muncul, klik **Adjust GitHub App Permissions** dan beri
   akses ke repo tersebut.

3. Pada bagian **Configure Project**:
   - **Framework Preset**: sudah terdeteksi otomatis sebagai **Next.js**.
   - **Root Directory**: biarkan kosong.
   - **Build and Output Settings**: biarkan bawaan.

### 2.2 Isi environment variables

Buka bagian **Environment Variables**, lalu tambahkan dua variabel berikut.

| Name | Value |
| --- | --- |
| `DATABASE_URL` | Connection string Transaction pooler dari langkah 1.3 |
| `SESSION_SECRET` | String acak minimal 32 karakter |

Untuk membuat `SESSION_SECRET`, jalankan salah satu perintah berikut:

```bash
# macOS / Linux
openssl rand -base64 48

# Windows PowerShell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Max 256 }))
```

Tempel hasilnya sebagai nilai `SESSION_SECRET`. Jangan pakai contoh di
`.env.example`.

> `NEXT_PUBLIC_APP_URL` tidak wajib. Kalau diisi, gunakan domain Vercel
> Anda, misalnya `https://relasy.vercel.app`.

### 2.3 Deploy

1. Klik **Deploy**.
2. Tunggu sekitar 2 sampai 3 menit.
3. Setelah selesai, klik **Visit** untuk membuka situs.

Halaman pertama yang muncul adalah landing page. Klik **Masuk** dan gunakan
akun bawaan:

| Email | Password |
| --- | --- |
| `pemilik@usaha.id` | `relasy123` |

Akun ini dibuat otomatis pada request pertama bila tabel `users` masih
kosong. **Segera ganti kata sandinya** lewat menu **Pengaturan** setelah
berhasil masuk.

---

## Bagian 3: Verifikasi

### 3.1 Cek cepat di browser

Buka beranda, lalu masuk. Yang seharusnya terlihat:

- Dashboard menampilkan angka, bukan `NaN` atau `0` semua.
- Menu **Pelanggan** bisa menampilkan daftar.
- Menambah pelanggan berhasil dan langsung muncul di daftar.
- Menu **Pipeline** menampilkan peluang dengan nilai Rupiah yang wajar.

### 3.2 Cek menyeluruh lewat terminal

Bila ingin memastikan seluruh alur API bekerja, jalankan skrip smoke test
terhadap domain Vercel:

```bash
BASE_URL=https://relasy.vercel.app node scripts/smoke-test.cjs
```

Di PowerShell:

```powershell
$env:BASE_URL="https://relasy.vercel.app"; node scripts/smoke-test.cjs
```

Hasil yang benar diakhiri dengan:

```
================ HASIL ================
Lulus: 40   Gagal: 0
```

---

## Bagian 4: Bila ada masalah

### Build gagal: `DATABASE_URL belum diatur`

Environment variable belum terbaca saat build. Buka
**Settings > Environment Variables**, pastikan `DATABASE_URL` terisi untuk
ketiga lingkungan (**Production**, **Preview**, **Development**), lalu
**Redeploy** dari tab **Deployments**.

### Halaman error: `ECONNREFUSED` atau `ENOTFOUND`

Hampir selalu karena memakai host **Direct connection**. Kembali ke langkah
1.3 dan pastikan memakai host yang mengandung `.pooler.supabase.com` dengan
port `6543`.

### Error: `prepared statement "s0" already exists`

Terjadi bila `prepare` tidak dimatikan pada driver. Kode di repo ini sudah
menanganinya (`prepare: false` di `src/lib/db/client.ts`). Bila error ini
muncul, pastikan file tersebut tidak diubah.

### Data hilang setelah beberapa hari

Project Supabase gratis akan **di-pause otomatis setelah 7 hari tanpa
aktivitas**. Saat di-pause, situs akan error sampai project dibuka kembali
lewat dashboard Supabase. Untuk situs yang dipakai sehari-hari ini biasanya
tidak terjadi. Bila ingin bebas dari risiko ini, buka dashboard Supabase
sekali seminggu, atau pindah ke paket berbayar.

### Ingin mengganti kata sandi akun bawaan

Masuk sebagai `pemilik@usaha.id`, buka **Pengaturan**, lalu ubah nama akun
dan nama usaha. Untuk mengganti kata sandi, jalankan di SQL Editor Supabase:

```sql
-- Ganti dengan hash baru. Jangan menulis kata sandi asli di sini.
-- Buat hash dengan: node -e "console.log(require('bcryptjs').hashSync('SANDI_BARU', 10))"
UPDATE users
SET password_hash = '$2b$10$...'
WHERE email = 'pemilik@usaha.id';
```

---

## Ringkasan variabel yang dibutuhkan

| Variabel | Wajib | Keterangan |
| --- | --- | --- |
| `DATABASE_URL` | Ya | Connection string Transaction pooler Supabase |
| `SESSION_SECRET` | Ya | String acak minimal 32 karakter |
| `NEXT_PUBLIC_APP_URL` | Tidak | Domain publik situs |
