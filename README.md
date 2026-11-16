# YPI Nurul Ilmi — Website Yayasan Pendidikan Islam Nurul Ilmi Bekasi

Repo ini berisi website **statis** yang datanya dilayani **Supabase**
(PostgreSQL + Auth + Storage + RLS). Tidak ada PHP, tidak ada MySQL, tidak ada
server aplikasi: GitHub Pages cukup untuk menyajikan halaman statisnya.

| Bagian | Lokasi | Cara deploy |
|---|---|---|
| **Frontend statis** | Root repo (`*.html`, `css/`, `js/`, `images/`, `fonts/`, `scss/`, `audio/`) | GitHub Pages (branch `main`, root) |
| **Data & autentikasi** | Supabase project (Postgres + Auth + Storage) | Dikelola lewat Management API |
| **Dashboard admin** | `admin/` (HTML statis + Supabase Auth) | GitHub Pages, sama seperti halaman publik |

> **Status:** migrasi dari Laravel 12 + MySQL ke Supabase **selesai**.
> Source Laravel sudah diarsipkan di `backup/` lalu dihapus dari repo.
> Rancangan lengkap: [RANCANGAN-MIGRASI-SUPABASE.md](RANCANGAN-MIGRASI-SUPABASE.md).

---

## 1. Struktur folder

```
webnurulilmi-main/
├── index.html, about.html, blog.html, article.html, contact.html,
│   courses.html, pricing.html, teacher.html, galeri-fasilitas.html,
│   tk-sigma.html, daycare-sigma.html, 404.html   ← halaman statis publik
├── admin/                   ← dashboard admin (HTML statis + Supabase Auth)
│   ├── login.html  articles.html  article-form.html
│   ├── categories.html  category-form.html
│   ├── tags.html  tag-form.html
│   ├── facilities.html  facility-form.html  comments.html
│   └── password.html     ← ganti password mandiri (semua peran)
├── css/  js/  images/  fonts/  scss/  audio/      ← aset frontend
│   └── scss/ + prepros-6.config                   ← sumber CSS (compile via Prepros ke css/)
├── supabase/                ← skema, data, migration, Edge Function
│   ├── schema.sql           ← DDL + RLS + fungsi (sumber kebenaran)
│   ├── data.sql             ← 124 baris data bisnis
│   ├── migrations/          ← migration SQL yang sudah diterapkan
│   └── functions/translate/ ← Edge Function terjemahan ID → EN
├── scripts/                 ← skrip migrasi, seeding, dan pengujian
├── docs/                    ← bukti migrasi (orphan-files.csv)
├── backup/                  ← arsip sebelum source Laravel dihapus
│   ├── legacy-media/        ← 19 media asli (sumber upload bucket media)
│   ├── laravel-database/    ← 13 migration MySQL + seeder (arsip)
│   └── laravel-env/         ← kredensial MySQL lama (TIDAK di-commit)
└── CNAME  prepros-6.config  README.md  RANCANGAN-MIGRASI-SUPABASE.md
```

---

## 2. Menjalankan secara lokal

Frontend statis tidak butuh proses build. Buka `index.html` lewat Live Server
(port 5502 sudah dikonfigurasi di `.vscode/settings.json`) atau server statis
bawaan repo:

```bash
node scripts/serve-static.mjs
```

Dashboard admin memakai Supabase Auth, jadi login hanya bisa dicoba bila
`js/site-config.js` sudah berisi Project URL dan kunci publishable yang benar.

Supabase mengunci email yang gagal login berulang kali. Gejalanya pesan
"Email atau password salah" muncul padahal password-nya benar. Waitulah
beberapa menit sebelum mencoba lagi, dan jangan mengulang-ulang percobaan
salah pada akun yang sama.

---

## 3. Konfigurasi environment

Semua kredensial tinggal di berkas **`.env`** dan **`.env.migration`** di akar
repo (keduanya sudah masuk `.gitignore`). Salin `.env.migration.example` bila
butuh referensi nama variabel.

| Variabel | Dipakai oleh | Boleh masuk frontend? |
|---|---|---|
| `SUPABASE_URL` | semua | Ya |
| `SUPABASE_PROJECT_REF` | skrip Management API | Tidak |
| `SUPABASE_ANON_KEY` | frontend + skrip | Ya (kunci publishable memang publik) |
| `SUPABASE_SERVICE_ROLE_KEY` | skrip migrasi saja | **TIDAK** |
| `SUPABASE_ACCESS_TOKEN` | deploy schema / Edge Function | **TIDAK** |
| `SUPABASE_STORAGE_BUCKET` | skrip storage | Tidak |
| `SUPABASE_ADMIN_PASSWORD` | seeding & pengujian admin | **TIDAK** |

`js/site-config.js` **dihasilkan** dari `.env` — jangan diedit manual:

```bash
node scripts/set-site-config.mjs
```

Skrip menolak mengisi `site-config.js` bila kuncinya terdeteksi sebagai
`service_role`.

---

## 4. Deployment

### 4.1 GitHub Pages

- Source: branch `main`, folder `/ (root)`
- Custom domain dibaca dari `CNAME` di root repo
- Tidak ada workflow otomatis; Pages mem-build langsung dari isi repo
- **Jangan** memindahkan `*.html`, `css/`, `js/`, `images/` keluar dari root

### 4.2 Supabase

- Skema & RLS: `supabase/schema.sql` (sumber kebenaran), sudah diterapkan
- Data: `supabase/data.sql`
- Media: bucket `media` (public, 25 MB, jpeg/png/webp/mp4/webm)
- Edge Function `translate`: deploy lewat `scripts/deploy-edge-function.mjs`

### 4.3 Aset artikel

Gambar artikel dan fasilitas berada di bucket Supabase `media`. Folder path-nya
mengikuti prefix unit, misalnya `tk-nurul-ilmi/artikel/…` dan
`sd-nurul-ilmi/fasilitas/…`, supaya policy Storage bisa membatasi admin unit
hanya pada foldernya sendiri. Salinan media asli ada di `backup/legacy-media/`.

---

## 5. Testing

Semua pengujian berjalan di Node (tanpa instalasi dependency tambahan),
kecuali `test-browser.mjs` dan `test-password-change.mjs` yang memakai
Playwright + Chromium.

```bash
node scripts/test-frontend-data.mjs    # alur data halaman publik
node scripts/test-admin-dashboard.mjs  # login + CRUD dashboard
node scripts/test-rbac.mjs             # batas hak akses 5 peran
node scripts/test-browser.mjs          # halaman nyata di Chromium
node scripts/test-password-change.mjs  # ganti password lewat UI (akun uji sementara)
node scripts/test-slug-parity.mjs      # slugify() JS == Str::slug() (butuh PHP CLI)
node scripts/verify-migration.mjs      # jumlah baris, RLS, URL media
```

Data uji yang dibuat selalu dihapus kembali di akhir. Tidak ada skrip yang
menyentuh MySQL.

---

## 6. Supabase

### 6.1 Menjalankan migrasi

```bash
node scripts/run-migration.mjs            # schema -> rbac -> data -> storage -> admin -> unit-admins -> verifikasi
node scripts/run-migration.mjs --only rbac
node scripts/migrate-data.mjs --dry-run   # cek payload tanpa menyentuh jaringan
```

| Skrip | Isi |
|---|---|
| `scripts/deploy-schema.mjs` | Terapkan `supabase/schema.sql` (DDL + RLS + fungsi) |
| `scripts/apply-rbac.mjs` | Terapkan `supabase/migrations/2026_11_15_000100_rbac_units.sql` (5 peran + `user_units`) |
| `scripts/migrate-data.mjs` | Muat 124 baris data bisnis dari `supabase/data.sql` |
| `scripts/migrate-storage.mjs` | Unggah media dari `backup/legacy-media/` ke bucket `media` (+ `_orphan/`) |
| `scripts/seed-admin.mjs` | Buat akun admin yayasan + `user_roles` + backfill `author_id` |
| `scripts/seed-unit-admins.mjs` | Buat 4 akun admin unit + `user_roles` + `user_units` |
| `scripts/deploy-edge-function.mjs` | Deploy Edge Function `translate` |
| `scripts/set-admin-password.mjs` | Salin password baru dari `.env` ke akun admin Supabase Auth (nilainya tidak dicetak) |
| `scripts/verify-migration.mjs` | Cek jumlah baris, akses baca publik, **penolakan tulis anon**, URL media |
| `scripts/test-frontend-data.mjs` | Jalankan `js/supabase.js` asli di Node, uji alur data halaman publik |
| `scripts/test-admin-dashboard.mjs` | Uji login, CRUD artikel/kategori/tag/fasilitas, Storage, moderasi komentar |
| `scripts/test-rbac.mjs` | Uji 5 peran: login, scoping unit, manipulasi request, Storage, logout |
| `scripts/test-browser.mjs` | Buka tiap halaman di Chromium sungguhan: halaman publik, dashboard admin, tampilan ponsel |
| `scripts/test-password-change.mjs` | Uji `admin/password.html`: password lama salah ditolak, password baru terpasang, akun uji dihapus lagi |

Semua skrip idempoten dan aman diulang. Tidak ada yang menyentuh MySQL.

### 6.2 Edge Function `translate`

Terjemahan otomatis ID → EN. Kodenya ada di
`supabase/functions/translate/index.ts`; satu-satunya jalan masuknya lewat
Management API:

```bash
node scripts/deploy-edge-function.mjs
```

Fungsi menolak pemanggil tanpa sesi atau tanpa peran yang dikenal (HTTP 403).
Terjemahan memakai MyMemory Translation API
(`https://api.mymemory.translated.net/get?q=...&langpair=id|en`) sehingga
**tidak memerlukan kunci API**. Kuota hariannya terbatas; bila kuota habis,
fungsi mengembalikan pesan yang jelas dan admin tetap bisa mengisi terjemahan
secara manual. Secret opsional `MYMEMORY_EMAIL` di
**Supabase Dashboard > Edge Functions > Secrets** dipakai untuk menaikkan kuota
harian (alamat email tidak pernah masuk ke frontend).

### 6.3 Peran (RBAC)

Lima peran disimpan di `public.user_roles`:

| Peran | Cakupan unit | Boleh |
|---|---|---|
| `super_admin` | semua unit | Kelola artikel, kategori, tag, fasilitas, komentar, unit, peran |
| `tk_nurul_ilmi` | `tk-nurul-ilmi` | Kelola artikel, fasilitas, komentar, media unitnya |
| `sd_nurul_ilmi` | `sd-nurul-ilmi` | idem |
| `smp_nurul_ilmi` | `smp-nurul-ilmi` | idem |
| `sigma_nurul_ilmi` | `tk-sigma` + `daycare-sigma` | idem |

Pemetaan unit → admin ada di `public.user_units`. `super_admin` **tidak** punya
baris di tabel itu, yang artinya ia menguasai seluruh unit.

Kategori dan tag dipakai bersama antar unit, jadi **hanya `super_admin`** yang
boleh menambah, mengubah, atau menghapusnya.

### 6.4 Model keamanan

- Peran disimpan di `public.user_roles`. Tabel itu **tidak punya** policy
  INSERT/UPDATE/DELETE untuk `anon`/`authenticated` — role hanya bisa diubah
  lewat `service_role`. Policy tambahan juga melarang admin mengubah peran
  dirinya sendiri.
- Penulisan artikel, kategori, tag, fasilitas, dan moderasi komentar diatur
  RLS per peran. Admin unit hanya bisa menulis baris yang `unit_id`-nya
  termasuk unitnya (`public.user_unit_ids()`); `WITH CHECK` mencegah artikel
  dipindahkan ke unit lain.
- Unggah Storage dibatasi oleh prefix path: `storage.foldername(name)[1]`
  harus sama dengan slug unit admin. Berkas di folder unit lain tidak bisa
  diunggah maupun dihapus.
- Peran **tidak pernah** dipercaya dari `localStorage`; `js/admin-auth.js`
  membacanya ulang dari `user_roles` pada setiap sesi.
- Komentar publik wajib lewat RPC `submit_comment()` (validasi + honeypot +
  rate limit), bukan INSERT langsung.
- `articles.views` hanya bisa naik lewat RPC `increment_article_views()`.
- Guard JavaScript di `admin/` hanya untuk UX; RLS penjaga sebenarnya.
- `service_role` dan `access_token` tidak pernah masuk HTML/JS mana pun.
- Ganti password dilakukan sendiri lewat `admin/password.html`: password lama
  diverifikasi dengan login ulang, lalu password baru dipasang memakai
  `updateUser()` dengan JWT sesi pengguna sendiri (bukan `service_role`).
  Password tidak pernah ditulis ke DOM, log, atau berkas mana pun.

---

## 7. Catatan pemeliharaan

- **CSS statis** diedit lewat `scss/`, lalu dikompilasi ke `css/` dengan Prepros
  (konfigurasi: `prepros-6.config`). Jangan edit hasil kompilasi secara manual.
- **Link Dashboard Admin** di navbar halaman statis diatur di `js/site-config.js`
  (`adminLoginPath`, default `admin/login.html`). `js/navbar-admin.js`
  menerapkannya ke semua elemen ber-atribut `data-site-admin-login`.
- **Unit artikel** ditentukan dari peran admin yang sedang login, bukan dari
  pilihan bebas di form. `articles.unit_id` NULL berarti artikel umum yayasan
  dan hanya bisa dikelola `super_admin`.
- **Arsip Laravel** ada di `backup/`. Isinya tidak dipakai runtime; jangan
  dihapus. Kredensial MySQL lama ada di `backup/laravel-env/` yang **tidak**
  di-commit.
