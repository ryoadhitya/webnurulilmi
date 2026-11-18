# Revisi Laporan Audit & Rancangan Migrasi YPI Nurul Ilmi Bekasi
### Dari Laravel 12 + MySQL → Static HTML/CSS/JS + Supabase

Status: **Rancangan — belum ada implementasi.** Dokumen ini menggantikan/melengkapi
audit sebelumnya dan memuat koreksi terhadap hasil verifikasi langsung ke repository
dan ke database MySQL `web_nurul_ilmi` (dump baca-saja, tanpa perubahan).

---

## 0. Ringkasan Eksekutif & Koreksi Penting

| Aspek | Temuan Audit | Koreksi pada dokumen ini |
|---|---|---|
| Jumlah tabel | Tidak terverifikasi / belum diinventarisasi | **19 tabel** terverifikasi di MySQL, bukan estimasi |
| Role | Ada | **Tidak ada satu pun kolom role** di Laravel. Semua user login = admin penuh. Ini gap keamanan #1 yang harus dibangun dari nol |
| Halaman admin | 16 | 16 file Blade = **13 halaman + 1 layout + 2 partial**. Rincian di §7 |
| File storage | — | **18 file media** (+1 `.gitignore`), 3 orphan, 1 referensi DB ke file hilang |
| Auth | 1 tabel users | **2 akun aktif**, keduanya belum punya peran |
| Artikel | — | Hanya **2 artikel**, `id=1` dan `id=3` (id 2 sudah dihapus). 0 komentar, 0 article_tags |

**Tiga temuan yang wajib ditangani di rancangan (bukan sekadar dicatat):**

1. **Tidak ada role sama sekali.** `users` hanya punya `name/email/password`. Router `admin.*`
   dilindungi middleware `auth` saja — siapa pun yang punya akun = admin penuh. Rancangan role
   (§2) adalah fitur baru, bukan migrasi.
2. **Tidak ada FK ke user di tabel bisnis.** `articles.author_name` adalah teks bebas, bukan relasi.
   Aturan "Guru hanya mengelola artikel miliknya" **tidak mungkin** enforcing-nya tanpa kolom
   `author_id` baru. Wajib dibuat (§2.2).
3. **`articles` tidak punya `slug`.** URL sekarang `/artikel/{id}`. Halaman statis tidak punya
   router server. Wajib diputuskan: `article.html?id=` atau tambah slug (§6.3).

---

## 1. Inventaris Database (Terverifikasi)

### 1.1 Ringkasan 19 Tabel

| # | Tabel | Kelompok | Baris | Tindakan di Supabase |
|---|---|---|---|---|
| 1 | `users` | Auth | 2 | **Ganti** → `auth.users` + tabel publik `user_roles` |
| 2 | `password_reset_tokens` | Auth | 0 | **Ganti** → reset password Supabase Auth |
| 3 | `sessions` | Auth | 70 | **Ganti** → Supabase Auth (JWT) |
| 4 | `categories` | Bisnis | 5 | **Migrasi** → `public.categories` |
| 5 | `articles` | Bisnis | 2 | **Migrasi** → `public.articles` (+ kolom baru) |
| 6 | `article_media` | Bisnis | 2 | **Migrasi** → `public.article_media` |
| 7 | `article_tags` | Bisnis | 0 | **Migrasi** → `public.article_tags` |
| 8 | `tags` | Bisnis | 3 | **Migrasi** → `public.tags` |
| 9 | `comments` | Bisnis | 0 | **Migrasi** → `public.comments` (+ kolom moderasi) |
| 10 | `units` | Bisnis | 5 | **Migrasi** → `public.units` |
| 11 | `facilities` | Bisnis | 29 | **Migrasi** → `public.facilities` (17 main + 12 sigma) |
| 12 | `facility_photos` | Bisnis | 19 | **Migrasi** → `public.facility_photos` |
| 13 | `facility_unit` | Bisnis (pivot) | 60 | **Migrasi** → `public.facility_unit` |
| 14 | `cache` | Infra Laravel | 2 | **Buang** (Supabase punya cache sendiri) |
| 15 | `cache_locks` | Infra Laravel | 0 | **Buang** |
| 16 | `jobs` | Infra Laravel | 0 | **Buang** (tidak ada queue worker aktif) |
| 17 | `job_batches` | Infra Laravel | 0 | **Buang** |
| 18 | `failed_jobs` | Infra Laravel | 0 | **Buang** |
| 19 | `migrations` | Infra Laravel | 14 | **Buang** (Supabase punya `schema_migrations` sendiri) |

**Total: 10 tabel bisnis** dimigrasikan, **3 tabel auth** diganti, **6 tabel infrastruktur**
dibuang. Angka ini terverifikasi dari dump `mysqldump`, bukan dari asumsi file migrasi.

**Total baris (hasil `COUNT(*)` langsung ke MySQL, 14 Nov 2026):**

| Angka | Makna | Rincian |
|---|---|---|
| **213 baris** | Total seluruh 19 tabel | termasuk `sessions` 70, `migrations` 14, `cache` 2 |
| **125 baris** | Total **10 tabel bisnis di MySQL** (sumber) | categories 5, articles 2, article_media 2, article_tags 0, tags 3, comments 0, units 5, facilities 29, facility_photos 19, facility_unit 60 |
| **124 baris** | Total yang **benar-benar dimigrasikan** ke Supabase | 125 − 1 baris `article_media` id=5 (Butir 2, file `articles/media/aaa.jpg` hilang) |

> Selalu bedakan **sumber (125)** vs **hasil migrasi (124)**. Yang dihitung saat verifikasi
> migrasi adalah **124** (lihat §8 butir 4.5 dan §13.F).

> Catatan: ada **dua file migrasi** `create_categories_table` (2026_09_28_022800 dan
> 2026_09_28_023826). Keduanya aman karena di-guard `Schema::hasTable()`, jadi tabelnya
> tetap satu. Tidak perlu koreksi data, tapi perlu dicatat agar tidak bingung saat
> mencocokkan daftar migrasi vs daftar tabel.

### 1.2 Struktur Tabel Bisnis (detailed, ID tetap dipertahankan)

Semua kolom di bawah ini diverifikasi dari `CREATE TABLE` dump aktual, bukan dari file migrasi.

#### `categories` (5 baris)
| Kolom | Tipe MySQL | → Postgres | Catatan |
|---|---|---|---|
| id | bigint unsigned AI | `bigint GENERATED BY DEFAULT AS IDENTITY` | **ID dipertahankan** |
| name | varchar(255) | `text NOT NULL` | |
| slug | varchar(255) UNIQUE | `text NOT NULL UNIQUE` | |
| created_at / updated_at | timestamp NULL | `timestamptz` | |

Isi: `1 TK NURUL ILMI/tk-nurul-ilmi`, `2 SD/sd`, `3 SMP/smp`, `4 TK SIGMA/tk-sigma`,
`5 DAYCARE SIGMA/daycare-sigma`.

#### `articles` (2 baris)
| Kolom | Tipe | → Postgres | Catatan |
|---|---|---|---|
| id | bigint unsigned AI | `bigint ... IDENTITY` | **ID dipertahankan** (1, 3) |
| category_id | bigint unsigned NULL FK→categories ON DELETE SET NULL | `bigint NULL REFERENCES categories(id) ON DELETE SET NULL` | |
| title_id | varchar(255) NOT NULL | `text NOT NULL` | |
| content_id | text NOT NULL | `text NOT NULL` | |
| title_en | varchar(255) NULL | `text` | |
| content_en | text NULL | `text` | |
| image | varchar(255) NULL | `text` | **Kolom legacy** — path relatif, bukan URL |
| author_name | varchar(255) NOT NULL DEFAULT 'Admin' | `text NOT NULL DEFAULT 'Admin'` | **Tetap ada** (fallback tampilan) |
| **author_id** | — | **`uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL`** | **KOLOM BARU — wajib** |
| status | varchar(255) NOT NULL DEFAULT 'published' | `text NOT NULL DEFAULT 'published'` + CHECK IN ('published','draft') | |
| published_at | timestamp NULL | `timestamptz` | |
| views | bigint unsigned NOT NULL DEFAULT 0 | `bigint NOT NULL DEFAULT 0` | Diubah via RPC, bukan UPDATE langsung |
| created_at / updated_at | timestamp NULL | `timestamptz` | |

Isi aktual (dari dump): id=1 (kategori 2, judul "🏆✨ BARAKALLAH JUARA ✨🏆",
isi "Isi baru", image `articles/2HnGt...png`, author "Admin", published, views 7),
id=3 (tanpa kategori, title "x", content "y", tanpa image, published, views 1).
**Status data (uji atau produksi) belum Anda konfirmasi — lihat Butir 10 §12.**

#### `article_media` (2 baris di MySQL → **1 baris dimigrasikan**)
> Sumber: id=5 (`article_id=3`, path `articles/media/aaa.jpg` — file hilang) dan id=11
> (`article_id=1`, path `articles/2HnGt...png`). Sesuai Butir 2, **id=5 tidak dimigrasikan**,
> jadi tabel hasil migrasi berisi **1 baris (id=11)**.
| Kolom | Tipe | → Postgres |
|---|---|---|
| id | bigint AI | `bigint IDENTITY` |
| article_id | bigint FK→articles CASCADE | `bigint REFERENCES articles(id) ON DELETE CASCADE` |
| type | varchar(20) NOT NULL DEFAULT 'image' | `text NOT NULL DEFAULT 'image'` + CHECK IN ('image','video') |
| path | varchar(255) NOT NULL | `text NOT NULL` (path relatif di bucket) |
| mime_type | varchar(255) NULL | `text` |
| caption | varchar(255) NULL | `text` |
| sort_order | int unsigned NOT NULL DEFAULT 0 | `integer NOT NULL DEFAULT 0` |
| created_at / updated_at | timestamp | `timestamptz` |

#### `article_tags` (0 baris)
`id` bigint AI PK, `article_id` FK CASCADE, `tag_id` FK CASCADE. Pertahankan tabel pivot
dengan PK `id` (bukan komposit) agar konsisten dengan MySQL dan tidak merepotkan.

#### `tags` (3 baris)
`id`, `name` (semua **UPPERCASE** — `Str::upper` di TagController), `slug` (lowercase),
timestamps. Isi: `ESKTRAKURIKULER/esktrakurikuler` (memo: ejaan lama, **jangan** "diperbaiki"
otomatis karena slug mengikutinya), `KEGIATAN SEKOLAH/kegiatan-sekolah`, `DAILY/daily`.

#### `comments` (0 baris)
| Kolom | Tipe | → Postgres | Catatan |
|---|---|---|---|
| id | bigint AI | `bigint IDENTITY` | |
| article_id | bigint FK CASCADE | `bigint REFERENCES articles(id) ON DELETE CASCADE` | |
| name | varchar(255) NOT NULL | `text NOT NULL` | |
| comment | text NOT NULL | `text NOT NULL` | |
| email | varchar(255) NULL | `text` | |
| **status** | — | **`text NOT NULL DEFAULT 'published'`** CHECK IN ('published','pending','spam') | **KOLOM BARU — moderasi** |
| **ip_hash** | — | **`text`** | **KOLOM BARU — anti-spam** |
| created_at / updated_at | timestamp | `timestamptz` | |

Tidak ada kolom moderasi di MySQL → semua komentar tayang instan. Karena tabel kosong,
penambahan status tidak merusak data apa pun.

#### `units` (5 baris)
`id`, `name`, `slug` UNIQUE, `group_type` varchar(20) NOT NULL DEFAULT 'main'
(main|sigma), `description` text NULL, timestamps.
Isi: `1 TK Nurul Ilmi/tk-nurul-ilmi/main`, `2 TK Sigma/tk-sigma/sigma`,
`3 Daycare Sigma/daycare-sigma/sigma`, `4 SD Nurul Ilmi/sd-nurul-ilmi/main`,
`5 SMP Nurul Ilmi/smp-nurul-ilmi/main`.

#### `facilities` (29 baris)
Sebaran terverifikasi: 17 baris `group_type='main'`, 12 baris `group_type='sigma'`,
semua `is_published = 1`.
`id`, `name`, `slug` UNIQUE, `description` text, `icon` varchar(255) NULL,
`is_published` tinyint(1) NOT NULL DEFAULT 0, `group_type` varchar(20) NOT NULL DEFAULT 'main',
`sort_order` int unsigned NOT NULL DEFAULT 0, timestamps.
Index: `(group_type,is_published)`, `(sort_order)`.
Semua 29fasilitas hasil `FacilitySeeder` → `is_published = true`.

#### `facility_photos` (19 baris)
Ke-19 baris memakai `image_path` yang **sama** dengan baris lain (file fisik dipakai bersama), 
sehingga 19 baris hanya menunjuk **14 path unik**.
`id`, `facility_id` FK CASCADE, `image_path` varchar(255) NOT NULL, `caption` varchar(255) NULL,
`alt_text` varchar(255) NULL, `sort_order` int unsigned, `is_cover` tinyint(1), timestamps.
Index `(facility_id, sort_order)`.

#### `facility_unit` (60 baris)
`id` bigint AI PK, `facility_id` FK CASCADE, `unit_id` FK CASCADE,
UNIQUE(facility_id, unit_id), timestamps.

### 1.3 Aturan Pelestarian ID
- Semua `bigint` ID **dipertahankan nilainya** saat migrasi (INSERT eksplisit dengan ID lama),
  lalu `setval(pg_get_serial_sequence(...))` disetel ulang ke `max(id)+1`.
- Konsekuensi: URL lama `/artikel/3` tetap valid secara logika.
- **Pengecualian**: `users.id` (1 dan 4) → `auth.users.id` adalah UUID. Relasi
  `author_id` baru harus dipetakan lewat **email**, bukan ID. Kunci email:
  - id 1 → `admin@ypinurulilmi.or.id` (nama "Admin Test")
  - id 4 → `admin@test.local` (nama "Admin")
  - Email `admin@test.local` terindikasi akun uji lokal — **kandidat tidak dimigrasikan**
    (lihat §5.3, perlu keputusan Anda).

### 1.4 Tabel Pendukung Baru (Dibuat di Supabase, tidak ada di MySQL)

| Tabel | Guna | Baris awal |
|---|---|---|
| `public.user_roles` | Sumber kebenaran peran. **Nol policy INSERT/UPDATE/DELETE untuk anon & authenticated** | 2 (dari 2 akun lama) |
| `public.comment_rate_limits` | Anti-spam komentar (sliding window per IP-hash) | 0 |
| `public.comment_honeypot` *(opsional)* | Alternatif: deteksi lewat trigger, tabel tidak wajib | 0 |

### 1.5 Verifikasi Checksum per Tabel

Semua tabel InnoDB. Nilai diambil dari `CHECKSUM TABLE <nama>` langsung ke MySQL
(14 Nov 2026) — ini **baseline** untuk membandingkan dump ↔ DB uji restore ↔ hasil migrasi.
Nilai `0` pada tabel kosong adalah normal (tidak ada baris untuk di-hash).

**Sudah diverifikasi checksum — tabel yang akan dimigrasikan (11):**

| Tabel | Baris | Checksum | Status |
|---|---|---|---|
| `users` | 2 | `688923024` | ✅ migrasi (identitas saja, bukan password) |
| `categories` | 5 | `2827130056` | ✅ migrasi |
| `articles` | 2 | `3948245749` | ✅ migrasi |
| `article_media` | 2 → 1 | `3447653669` | ✅ migrasi 1 baris (id=11), Butir 2 |
| `tags` | 3 | `1620319335` | ✅ migrasi |
| `units` | 5 | `11671541` | ✅ migrasi |
| `facilities` | 29 | `49114842` | ✅ migrasi |
| `facility_photos` | 19 | `2803401774` | ✅ migrasi |
| `facility_unit` | 60 | `3228352064` | ✅ migrasi |
| `article_tags` | 0 | `0` | ✅ migrasi (kosong) |
| `comments` | 0 | `0` | ✅ migrasi (kosong) |

**Tidak diverifikasi checksum / tidak relevan — tabel dibuang atau diganti (8):**

| Tabel | Baris | Checksum | Alasan tidak dipakai sebagai gate |
|---|---|---|---|
| `sessions` | 70 | `3203400743` | Diganti Supabase Auth (JWT) — sesi lama otomatis invalid |
| `password_reset_tokens` | 0 | `0` | Diganti reset password Supabase |
| `cache` | 2 | `1287719118` | Dibuang (Supabase punya cache sendiri) |
| `cache_locks` | 0 | `0` | Dibuang |
| `jobs` | 0 | `0` | Dibuang (tidak ada queue worker aktif) |
| `job_batches` | 0 | `0` | Dibuang |
| `failed_jobs` | 0 | `0` | Dibuang |
| `migrations` | 14 | `3840379648` | Dibuang (Supabase punya `schema_migrations` sendiri) |

> **Catatan cara pakai.** Checksum adalah **pembanding integritas**, bukan gate kelulusan
> per-isidata. Saat restore dump ke `web_nurul_ilmi_restore_test`, cukup jalankan
> `CHECKSUM TABLE` untuk 11 tabel di atas dan bandingkan dengan nilai baseline di tabel ini;
> yang **wajib cocok** adalah 10 tabel bisnis. `users` boleh berbeda bila dump dibuat
> disnapshot berbeda (tetap 2 baris, `admin@ypinurulilmi.or.id` + `admin@test.local`).
> Tabel kosong (checksum 0) otomatis cocok.

---

## 2. Sistem Role & RLS

### 2.1 Prinsip Dasar (non-negotiable)

1. **Role tidak pernah berada di `auth.users.raw_user_metadata`.** Metadata bisa diubah
   sendiri oleh user lewat `supabase.auth.updateUser()` → eskalasi roletrivial.
2. **Role tidak pernah bisa diubah oleh pemiliknya.** Role hanya diubah oleh Admin
   melalui kanal `service_role` (script admin), bukan oleh UI biasa.
3. **Frontend tidak pernah memegang `service_role` key.** Kunci publik (`anon` /
   `publishable`) aman untuk dipublikasikan; RLS adalah penjaga sebenarnya.
4. **Route guard di JavaScript hanya kosmetik.** Karena dashboard jadi HTML statis
   publik, " proteksi dashboard" berarti: (a) halaman memang publik secara kode,
   (b) seluruh data di dalamnya dilindungi RLS, (c) UI mencerminkan role dari session. Tanpa
   (b), dashboard tetap terbuka. RLS adalah satu-satunya pintu masuk yang sesungguhnya.

### 2.2 Model Peran

| Peran | articles | categories / tags | facilities | comments | user_roles |
|---|---|---|---|---|---|
| **admin** | CRUD semua | CRUD semua | CRUD semua | moderasi semua | kelola semua |
| **editor** | CRUD semua | CRUD semua | CRUD semua | moderasi semua | ✗ |
| **guru** | CRUD **milik sendiri saja** | ✗ | ✗ | ✗ | ✗ |
| *(anon/publik)* | SELECT published | SELECT | SELECT published | INSERT (via fungsi) | ✗ |

Enforcement "milik sendiri" bergantung pada kolom **`articles.author_id`** (§1.2) yang
belum ada. Selama `author_id` NULL, Guru tidak boleh mengedit baris itu —tetapi
`author_id` untuk 2 artikel lama akan di-backfill ke akun admin (§5).

### 2.3 Struktur Penyimpanan Peran

```sql
-- Tabel peran: TIDAK ADA policy INSERT/UPDATE/DELETE untuk anon/authenticated.
create table public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role    text not null check (role in ('admin','editor','guru')),
  granted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.user_roles enable row level security;

-- Hanya boleh membaca peran milik sendiri (UI), perubahan lewat service_role.
create policy "user_roles_select_own" on public.user_roles
  for select to authenticated using (user_id = auth.uid());

-- Helper: peranEfektif user. SECURITY DEFINER supaya RLS lain bisa memanggilnya.
create or replace function public.current_role()
returns text language sql stable security definer set search_path = public as $$
  select role from public.user_roles where user_id = auth.uid();
$$;
revoke all on function public.current_role() from public;
grant execute on function public.current_role() to authenticated;
```

> Alternatif bila Anda ingin UI "ubah peran" tanpa menyentuh SQL per permintaan:
> buat Edge Function `set-user-role` yang memverifikasi JWT pemanggil sebagai admin
> lalu menulis memakai `service_role` **di server**. Kunci `service_role` hanya ada
> di environment Edge Function, tidak pernah di repo maupun browser.

### 2.4 Matriks RLS (policies yang akan dibuat)

**`articles`**
| Operasi | anon | authenticated |
|---|---|---|
| SELECT | `status = 'published'` | semua baris |
| INSERT | ✗ | `current_role() in ('admin','editor','guru')` **dan** `author_id = auth.uid()` |
| UPDATE | ✗ | admin/editor: semua · guru: `author_id = auth.uid()` |
| DELETE | ✗ | `current_role() = 'admin'` |

**`categories`, `tags`** — SELECT untuk anon & authenticated; INSERT/UPDATE/DELETE
hanya `current_role() in ('admin','editor')`.

**`article_media`** — SELECT bila artikel induknya published (atau user staf);
INSERT/UPDATE/DELETE mengikuti aturan induk artikel yang sama. Penambahan media
membuat artikel berubah menjadi published? → **kebijakan**: guru boleh men-upload media
ke artikelnya sendiri, termasuk draft.

**`facilities`** — SELECT anon: `is_published = true`; authenticated: semua.
INSERT/UPDATE/DELETE: `current_role() in ('admin','editor')`.

**`facility_photos`** — SELECT mengikuti fasilitas induknya; write: admin/editor.

**`facility_unit`** — SELECT semua; write: admin/editor.

**`units`** — SELECT semua; write: admin.

**`comments`** — SELECT anon: hanya `status='published'`; authenticated: semua.
INSERT anon: **hanya lewat fungsi RPC** (§4.6), bukan policy INSERT langsung, agar
validasi + rate limit + honeypot bisa dipaksa. UPDATE/DELETE: admin/editor.

**`user_roles`** — lihat §2.3.

**`storage.objects`** — lihat §3.4.

### 2.5 Anti-Eskalasi Role — Ringkasan Bukti
- Tidak ada policy yang mengizinkan `authenticated` menulis kolom `role`.
- `user_roles` tidak punya INSERT/UPDATE/DELETE policy sama sekali → default DENY.
- Tidak ada trigger/function yang menerima `new.role` dari payload user.
- Role change hanya lewat: (a) script admin berkunci `service_role` di luar repo,
  atau (b) Edge Function yang memeriksa JWT admin.

---

## 3. Migrasi File & Storage

### 3.1 Inventaris File `storage/app/public/` (18 file media + 1 `.gitignore`, terverifikasi)

**Folder `facilities/` — 14 file JPG**, seluruhnya terpakai:
`area-bermain.jpg`, `area-bermain-2.jpg`, `id-card.jpg`, `kantin.jpg`, `kelas-ac.jpg`,
`laboratorium.jpg`, `laboratorium-komputer.jpg`, `lapangan.jpg`, `lingkungan-kolam.jpg`,
`lingkungan-suasana.jpg`, `masjid.jpg`, `musik-tari.jpg`, `olahraga-2.jpg`, `parkir.jpg`

**Folder `articles/` — 4 file:**
| File | Status |
|---|---|
| `articles/2HnGtGommHpKsiHYgiGw8aUTeE7sLp53KPf90Lfs.png` | **Dipakai** — `articles.image` (artikel 1) + `article_media` id 11 |
| `articles/IAFLYMm8iICVMJBkSyosFqdQbJDbLdayZBkPUcps.jpg` | **ORPHAN** — tidak dirujuk DB mana pun |
| `articles/la6sYyJxpbhXxiiZ186WjhSHbFYSX3GLIVFuEgOa.jpg` | **ORPHAN** |
| `articles/OIv2AvycVTFAGNkdDZ07Tiu6lONOfZCMgf9Nj9Un.jpg` | **ORPHAN** |

Folder `articles/media/` **ada tapi kosong**. Catatan: 14 file `facilities/` dipakai bersama
oleh 19 baris `facility_photos` (beberapa file dipakai >1 fasilitas, mis.
`area-bermain.jpg` dipakai 3 fasilitas, `id-card.jpg` dipakai 2). **File harus di-upload
satu kali, dipakai banyak baris** — jangan duplikasi saat migrasi.

### 3.2 referensi Bermasalah (perlu keputusan)
| ID | Jenis | Detail | Rekomendasi |
|---|---|---|---|
| B1 | **DB → file hilang** | `article_media` id=5 menunjuk `articles/media/aaa.jpg`; file ini **tidak ada** di disk | **Sudah diputuskan (Butir 2): hapus baris + catat.** Baris id=5 tidak dimigrasikan; dicatat di laporan migrasi final |
| B2 | 3 file orphan di `articles/` | tidak dirujuk `articles.image` maupun `article_media.path` | Pindahkan ke folder `_orphan/` di bucket, jangan dihapus. Dicatat di §10 |

### 3.3 Bucket & Strategi Path

**Keputusan: satu bucket publik `media`, path relatif dipertahankan persis.**

```
media/
  articles/2HnGtGommHpKsiHYgiGw8aUTeE7sLp53KPf90Lfs.png
  articles/media/<uuid>.jpg        ← upload baru
  facilities/kelas-ac.jpg
  facilities/<uuid>.jpg            ← upload baru
  _orphan/IAFLYMm8iICVMJBkSyosFqdQbJDbLdayZBkPUcps.jpg   ← file orphan, tidak dihapus
```

Konsekuensi penting:
- **Kolom `path` / `image_path` / `image` di database TIDAK PERLU diubah nilainya.**
  Yang berubah hanya cara membentuk URL:
  ```
  SEBELUM : {LARAVEL_HOST}/storage/facilities/kelas-ac.jpg
  SESUDAH: {SUPABASE_URL}/storage/v1/object/public/media/facilities/kelas-ac.jpg
  ```
  Ini memenuhi permintaan "path pada database diperbarui" dengan cara yang **paling aman**
  (nilai path tetap valid sebagai kunci file) — dan membuat migrasi file idempoten.
- Path upload baru wajib **random** (UUID) supaya tidak menimpa file lama dan tidak
  membocorkan nama asli.
- Query untuk URL dibuat di satu helper JS (`js/supabase.js` → `mediaUrl(path)`),
  dipakai bersama oleh frontend dan dashboard.

**Alternatif bila Anda ingin URL shorter:** bucket privat + signed URL (TTL 1 jam).
Konsekuensinya: URL tidak bisa di-cache lama, dan thumbnail media artikel di halaman
publik akan re-request tiap jam. **Saya rekomendasikan bucket publik** untuk
kebutuhan situs sekolah ini; Controls lain (RLS storage, rate limit) tetap berlaku.

### 3.4 Supabase Storage Policies

```sql
insert into storage.buckets (id, name, public)
values ('media','media', true) on conflict do nothing;

-- Baca: publik (bucket public) — SELECT untuk semua.
create policy "media_public_read" on storage.objects for select
  using (bucket_id = 'media');

-- Tulis: hanya staf, hanya ke path milik sendiri (prefix folder sesuai bucket path).
create policy "media_staff_insert" on storage.objects for insert
  to authenticated with check (
    bucket_id = 'media'
    and public.current_role() in ('admin','editor','guru')
  );

create policy "media_staff_update" on storage.objects for update
  to authenticated using (bucket_id = 'media' and public.current_role() in ('admin','editor','guru'))
  with check (bucket_id = 'media' and public.current_role() in ('admin','editor','guru'));

create policy "media_staff_delete" on storage.objects for delete
  to authenticated using (bucket_id = 'media' and public.current_role() in ('admin','editor','guru'));
```

Catatan: policy di atas **tidak membedakan siapa pemilik file**. Bila Anda mau Guru
hanya boleh mengunggah ke folder miliknya, tambahkan kondisi path
`(storage.foldername(name))[1] = auth.uid()::text` dan upload ke prefix
`articles/{user_id}/…`.

### 3.5 Kompatibilitas URL Lama
URL lama `{LARAVEL_HOST}/storage/...` akan mati setelah backend dimatikan. Mitigasi:
- Buat file peta `redirect-storage.csv` (path → URL Supabase) hasil migrasi.
- Taruh **redirect permanen** di hosting PHP lama (`.htaccess` / aturan nginx) selama
  masa transisi, atau pertahankan hosting PHP hanya sebagai pengalih (1–2 bulan).
- Semua referensi internal di repo sudah pakai path relatif (`storage/...` via
  `asset()`), jadi tidak ada hardcode domain di halaman statis — **kecuali** `SITE_CONFIG.backendUrl`
  di `js/site-config.js` yang saat ini **kosong** (backend belum ditunjuk). Ini kabar baik:
  tidak ada URL backend yang tertanam di HTML statis.

---

## 4. Keamanan

### 4.1 RLS
Semua policy §2.4. Plus: `alter table ... enable row level security` untuk **semua**
tabel publik — termasuk tabel yang hanya dibaca server.

### 4.2 Supabase Auth
- Email + password, **email confirmation aktif** untuk akun baru (admin/editor/guru).
- **MFA wajib untuk akun admin** (TOTP) —atim Opsional, tapi sangat disarankan.
- **Leaked password protection** ON.
- Rate limit bawaan Supabase untuk signup/reset/login sudah aktif; pertahankan.
- **Session**: access token default 1 jam, refresh token 30 hari. Setel
  `SESSION` idle timeout di sisi dashboard untuk 30 menit.
- Akun **dikonfirmasi manual oleh admin** (invite), bukan self-signup — karena
  dashboard bukan layanan publik.

### 4.3 Proteksi Dashboard
Dashboard admin menjadi HTML statis di path `/admin/` (atau subdomain `admin.`).
- Kode HTML/CSS/JS **publik terlihat** — tidak ada rahasia di dalamnya. Ini konsekuensi
  alami dari permintaan "dashboard statis", dan harus disadari.
- Yang melindungi data adalah **RLS + session**, bukan frontend.
- Guard JS (`if (!session) redirect('/admin/login')`) hanya untuk UX.
- **Penting:** jangan pernah menulis `supabase_url` + `service_role` di file JS/HTML mana pun.
  Hanya `supabase_url` + `anon/publishable` key. Terapkan juga **secret scanning** di CI
  (pola `service_role`, `eyJhbGciOi...`).

### 4.4 Hak Akses CRUD (ringkasan)
| Resource | admin | editor | guru | anon |
|---|---|---|---|---|
| Artikel | C R U D | C R U D | C R U (milik) | R (published) |
| Kategori | C R U D | C R U D | — | R |
| Tag | C R U D | C R U D | — | R |
| Fasilitas + foto + unit | C R U D | C R U D | — | R (published) |
| Unit pendidikan | C R U D | — | — | R |
| Komentar | moderasi | moderasi | — | create |
| Peran pengguna | C R U D | — | — | — |
| Media | C R U D | C R U D | C R U | R |

### 4.5 Fungsi Increment Views
`articles.views` saat ini di-`increment()` server-side. Di Supabase, `UPDATE` dari client
publik akan ditolak RLS → harus lewat RPC:

```sql
create or replace function public.increment_article_views(p_article_id bigint)
returns bigint language plpgsql security definer set search_path = public as $$
declare v bigint;
begin
  update public.articles set views = views + 1
  where id = p_article_id and status = 'published'
  returning views into v;
  return coalesce(v, 0);
end $$;
revoke all on function public.increment_article_views(bigint) from public;
grant execute on function public.increment_article_views(bigint) to anon, authenticated;
```

Tambahkan anti-spam: batasi 1 penambahan per artikel per sesi/pelajar (cookie
`viewed_<id>` di sisi klien) — pendekatan sisi-klien, wajib dicatat sebagai
"best-effort", bukan keamanan.

### 4.6 Proteksi Komentar Publik (anti-spam)
Komentar dibuat lewat fungsi RPC, **bukan** INSERT langsung:

```sql
create or replace function public.submit_comment(
  p_article_id bigint, p_name text, p_email text, p_comment text, p_hp text default null
) returns bigint language plpgsql security definer set search_path = public as $$
declare
  v_ip text := public.client_ip();
  v_hash text := encode(digest(coalesce(v_ip,'unknown') || salt, 'sha256'), 'hex');
  v_id bigint;
begin
  -- honeypot: field tersembunyi harus kosong
  if p_hp is not null and length(trim(p_hp)) > 0 then
    return -1; -- diam-diam accepts untuk tidak membocorkan proteksi
  end if;
  if length(coalesce(p_name,'')) < 2 or length(coalesce(p_comment,'')) < 3 then
    raise exception 'validasi gagal';
  end if;
  -- rate limit: max 1 komentar / 60 detik per artikel, max 5 / jam per IP
  if exists (select 1 from public.comment_rate_limits
             where ip_hash = v_hash and created_at > now() - interval '1 hour'
             and count(*) >= 5) then
    raise exception 'terlalu sering';
  end if;
  insert into public.comments (article_id, name, email, comment, status, ip_hash)
  values (p_article_id, p_name, p_email, p_comment, 'pending', v_hash)
  returning id into v_id;
  insert into public.comment_rate_limits (ip_hash, created_at) values (v_hash, now());
  return v_id;
end $$;
```

Tambahan wajib:
- **Status default `pending`** → komentar baru tidak langsung tayang. Butuh layar
  moderasi di dashboard (tab baru, ~1 halaman) — **tambahan cakupan vs Laravel**,
 IZIN PERSETUJUAN Anda (§12 Butir 5).
- Honeypot field tersembunyi (`<input name="hp">`) + validasi `clientIp()` dari
  `x-forwarded-for`.
- **Captcha (Turnstile)** opsional bila spam masih sering — tapi menambah
  ketergantungan eksternal; rekomendasikan honeypot + rate limit dulu.

### 4.7 CORS & Header
- Konfigurasi CORS Laravel (`config/cors.php`) **tidak lagi relevan** — REST API
  Supabase memakai CORS global project. Pastikan origin frontend
  (`https://www.ypinurulilmi.or.id`) masuk daftar allowed origins di Supabase.
- Halaman statis butuh header CSP dan `X-Content-Type-Options`; pasang lewat
  `_headers` (Netlify) / `vercel.json` / konfigurasi GitHub Pages.

### 4.8 Fitur yang Hilang / Perlu Diganti
| Fitur Laravel | Status pasca-migrasi |
|---|---|
| Terjemahan otomatis Google Translate (`Stichoza\GoogleTranslate`, endpoint `admin/articles.translate`) | **Perlu diganti** — butuh Edge Function atau dibuang. GraphQL/Google Cloud Translation API butuh API key. **Rekomendasi: porting ke Supabase Edge Function** dengan `@google-cloud/translate` |
| Rate limit `throttle:60,1` pada API publik | Diganti oleh rate limit Supabase / Edge Function |
| `throttle:5,1` pada login | Diganti rate limit bawaan Supabase Auth |
| `Str::slug()` untuk slug kategori/tag/fasilitas | Porting ke helper JS `slugify()`; **perhatikan**: `Str::slug` menghapus spasi→`-`, lowercase. Harus identik hasilnya agar slug tidak berubah |
| `Str::upper()` untuk nama tag | Porting ke helper JS (sederhana) |

---

## 5. Migrasi Password & Akun

### 5.1 Prinsip
- **Dilarang** melakukan `UPDATE`/`INSERT` langsung ke `auth.users` / `auth.identities`.
  Tabel internal Supabase tidak punya kontrak stabil, dan salah pasang hash = akun
  terkunci permanen.
- **Dilarang** menyalin hash bcrypt MySQL ke Supabase lewat SQL mentah.
  Pendekatan yang dipakai: **invite / reset password**, sesuai instruksi Anda.

### 5.2 Prosedur yang Disarankan (undangan)
1. Di Supabase Dashboard → Authentication → Users → **Invite user** (atau via Admin API
   `auth.admin.inviteUserByEmail` dari script Node di mesin admin).
2. Kirim email undangan ke 2 alamat lama.
3. Setiap penerima menetapkan password baru sendiri (magic link / reset password).
4. Setelah login pertama, skrip admin menetapkan `user_roles`:
   `admin@ypinurulilmi.or.id` → `admin`.
5. Verifikasi: 2 akun masuk, RLS berperilaku sesuai peran.

### 5.3 Dua Akun Lama
| ID | Nama | Email | `email_verified_at` | Catatan |
|---|---|---|---|---|
| 1 | Admin Test | `admin@ypinurulilmi.or.id` | NULL (belum diverifikasi) | **Akun produksi** → role `admin`, wajib diundang |
| 4 | Admin | `admin@test.local` | NULL (belum diverifikasi) | **Akun uji lokal** (domain `.local`, tidak deliverable) → **tidak diundang**, tapi tetap dicatat di laporan |

Keduanya belum pernah diverifikasi emailnya (`email_verified_at` NULL), sehingga belum ada
satu pun akun yang bisa diklaim "sudah pernah login sah" di sistem lama.

> Rekomendasi saya: **undang hanya `admin@ypinurulilmi.or.id`**. Akun `admin@test.local`
> dicatat di tabel users lama (backup) tetapi **tidak** dibuat di Supabase, agar tidak
> menjadi pintu masuk dengan kredensial uji yang rotatorinya lemah.
> **Sudah disetujui (Butir 1)** — tidak ada yang saya hapus.

### 5.4 Pemetaan `author_id`
Setelah kedua akun ada di Supabase:
```sql
update public.articles a
set author_id = u.id
from auth.users u
where u.email = 'admin@ypinurulilmi.or.id'
  and a.id in (1,3);   -- hanya bila Anda memutuskan authoring lama milik admin
```
`author_name` tetap diisi `'Admin'` agar tampilan tidak berubah.

### 5.5 Strategi Mempertahankan Akun Admin (ringkas)

**Prinsip: identitas dipertahankan, kredensial tidak dimigrasi.**

| Yang | Bagaimana |
|---|---|
| Identitas akun | Email `admin@ypinurulmi.or.id` **tetap sama** — email adalah kunci pemetaan, bukan `users.id` (UUID ≠ bigint) |
| Password | **Tidak dimigrasi.** Hash bcrypt (60 char) tidak dipindah ke `auth.users` (larangan §5.1). Password baru ditetapkan pemilik lewat magic link/invite |
| Role | Diberikan oleh **skrip admin** (`service_role`) menulis `user_roles.role='admin'` — bukan oleh user, bukan lewat `raw_user_metadata` (§2.1) |
| Kepemilikan artikel | `articles.author_id` di-backfill lewat **email → `auth.users.id`** (SQL di §5.4); `author_name` tetap `'Admin'` |
| Sesi lama | 70 baris `sessions` dibuang → **semua login lama invalid**, admin wajib login ulang. Ini konsekuensi wajar, bukan kehilangan akses |
| Akun `admin@test.local` | Tidak diundang (Butir 1). Tetap ada di dump/backup, tidak dihapus |

**Urutan eksekusi (wajib berurutan):**
1. Invite `admin@ypinurulilmi.or.id` (Dashboard → Authentication → Invite user, atau
   `auth.admin.inviteUserByEmail`).
2. **Sebelum** akun dipakai: skrip admin (Node, `service_role`) insert
   `public.user_roles (user_id, role)` = `'admin'`.
3. Backfill `articles.author_id` (id 1 & 3) → UUID akun tersebut (§5.4).
4. Uji login + RLS: akun admin melihat & mengubah semua artikel; token anon tetap ditolak.

**Fallback anti-lockout (kalau email invite gagal / ditolak):**
- Skrip admin memakai `auth.admin.createUser` dengan **password sementara yang Anda tentukan**,
  lalu user menggantinya setelah login pertama. Tidak ada akun yang hilang.
- Alternatif: akun lama di MySQL tetap hidup dalam mode maintenance 30 hari
  (§13.J) sebagai jalur pulang.
- **Perhatikan:** email confirmation tetap ON. Akun yang dibuat via `createUser` dengan
  `email_confirm: true` langsung aktif; akun via invite menunggu konfirmasi.

---

## 6. Struktur Website

### 6.1 11 Halaman HTML Publik — **Dipertahankan Entirely**
`index.html`, `about.html`, `blog.html`, `blog-single.html`, `contact.html`,
`courses.html`, `pricing.html`, `teacher.html`, `galeri-fasilitas.html`,
`tk-sigma.html`, `daycare-sigma.html`

Semua 11 memuat `js/site-config.js`. Empat halaman sudah
terhubung ke API (`index.html` → home-blog.js; `index/tk-sigma/daycare-sigma/
galeri-fasilitas` → facilities.js). Navbar publik tidak lagi menampilkan ikon
login admin; halaman login tetap di `admin/login.html`.

**Catatan:** `blog.html` dan `blog-single.html` saat ini **konten hardcoded**
(6 artikel contoh, 4 komentar contoh, form komentar `action="#"`). Keduanya **wajib**
diubah agar membaca dari Supabase (§6.3). Itulah bagian dari "Blog listing, detail
artikel, dan komentar harus menggunakan data Supabase".

### 6.2 16 File Blade Admin → 13 Halaman HTML
| # | Blade | Sifat |Becomes |
|---|---|---|---|
| 1 | `admin/layouts/app.blade.php` | Layout | `admin/_layout.html` (template include via JS partial) |
| 2 | `admin/articles/_form.blade.php` | Partial | `admin/_article-form.html` |
| 3 | `admin/articles/index.blade.php` | Halaman | `admin/articles.html` |
| 4 | `admin/articles/create.blade.php` | Halaman | `admin/article-form.html` (mode create) |
| 5 | `admin/articles/edit.blade.php` | Halaman | `admin/article-form.html` (mode edit, `?id=`) |
| 6 | `admin/categories/index.blade.php` | Halaman | `admin/categories.html` |
| 7 | `admin/categories/create.blade.php` | Halaman | `admin/category-form.html` |
| 8 | `admin/categories/edit.blade.php` | Halaman | `admin/category-form.html?mode=edit&id=` |
| 9 | `admin/tag/index.blade.php` | Halaman | `admin/tags.html` |
| 10 | `admin/tag/create.blade.php` | Halaman | `admin/tag-form.html` |
| 11 | `admin/tag/edit.blade.php` | Halaman | `admin/tag-form.html?mode=edit&id=` |
| 12 | `admin/facilities/index.blade.php` | Halaman | `admin/facilities.html` |
| 13 | `admin/facilities/_form.blade.php` | Partial | `admin/_facility-form.html` |
| 14 | `admin/facilities/create.blade.php` | Halaman | `admin/facility-form.html` (mode create) |
| 15 | `admin/facilities/edit.blade.php` | Halaman | `admin/facility-form.html` (`?id=`) |
| 16 | `admin/auth/login.blade.php` | Halaman | `admin/login.html` |

**Feature yang harus dipertahankan persis** (dari audit view):

*Artikel* — daftar + statistik (total artikel, total dibaca) + pencarian klien +
filter status + pagination + tombol Edit/Hapus (konfirmasi) + form create/edit dengan:
judul ID/EN, isi ID/EN, kategori, nama penulis, status published/draft, pilih tag,
unggah banyak gambar+video, pratinjau file sebelum unggah, urutan naik/turun media,
caption per media, hapus media, tombol terjemahan otomatis, pesan error validasi.

*Kategori* — daftar + jumlah artikel per kategori + create/edit/hapus (konfirmasi).
*Tag* — daftar + jumlah artikel per tag + create/edit/hapus (konfirmasi); nama
tag otomatis jadi HURUF BESAR.
*Fasilitas* — daftar + statistik (total/published/jumlah foto) + filter (cari, group,
unit, status) + pagination + form create/edit: nama, slug, deskripsi, **ikon FA dengan
pratinjau + 23 preset**, group_type, sort_order, is_published, **pilih unit (multi,
dibatasi satu group)**, unggah banyak foto + reorder naik/turun + set cover + edit
caption/alt + hapus foto + hapus fasilitas (konfirmasi).

*Login* — email + password, pesan error, link kembali ke beranda.

*Layout* — sidebar (Artikel/Kategori/Tag/Fasilitas) dengan active state, header
(judul halaman, email user, tombol Keluar), flash message sukses, footer.

### 6.3 Routing Halaman Statis
GitHub Pages tidak punya router. Keputusan yang dibutuhkan:

| Kebutuhan | Solusi yang disarankan |
|---|---|
| Detail artikel | `article.html?id=3` (render klien dari Supabase). `blog-single.html` tetap ada sebagai alias/redirect agar URL lama `blog-single.html` tidak mati |
| Form edit artikel | `admin/article-form.html?id=3` |
| Form kategori/tag | `admin/category-form.html?id=3` / `admin/tag-form.html?id=3` |
| Halaman 404 | `404.html` |
| Filter blog | `blog.html?kategori=2` / `blog.html?tag=1` (query string, dibaca JS) |

**Alternatif** (jika Anda Adds URL bersih): tambahkan kolom `slug` ke `articles` dan
gunakan `article.html?slug=…` atau subdomain. Menambah slug berarti mengubah skema
tambahan — tidak ada di MySQL sekarang, dan bukan kebutuhan wajib.

### 6.4 Duplikasi Aset yang Harus Dibereskan
Aset ada di **dua** pohon:
- Root repo (`css/`, `js/`, `images/`, `fonts/`, `scss/`, `audio/`) → dipakai GitHub Pages ✔
- `web_nurul_iman/public/landingPage/` (148 file) → dipakai Blade ✗ (perlu setelah Blade mati)

`css/style.css` dan `js/fasilitas-gallery.js` **identik byte-per-byte** di kedua pohon
(sudah diverifikasi). Setelah migrasi, pohon `public/landingPage/` tidak lagi dipakai.
**Rekomendasi:** pertahankan di git (arsip), jangan dihapus dari repo, tapi keluarkan
dari build/deploy. Hapus hanya setelah masa retensi berakhir (§10).

### 6.5 Halaman Blade Landing yang Menjadi Redundan
`resources/views/landing_page/` berisi **16 blade** = 12 halaman konten + `layout` +
`navbar` + `footer` + `partials/article-media`. Semuanya **ikut mati** ketika Laravel
dimatikan, dan **tidak perlu dikonversi** — konversi yang diminta adalah 16 blade admin.

Pemetaan Blade → statis (hasil verifikasi silang antara `routes/web.php` dan 11 HTML):

| Route Laravel | Blade | Halaman statis |
|---|---|---|
| `/` | `front_page` | `index.html` |
| `/tentang-kami` | `tentang_kami` | `about.html` |
| `/pembiasaan-pagi` | `pembiasaan_pagi` | `teacher.html` |
| `/program` | `program` | `courses.html` |
| `/biaya` | `biaya` | `pricing.html` |
| `/hubungi-kami` | `hubungi_kami` | `contact.html` |
| `/galeri-fasilitas` | `galeri_fasilitas` | `galeri-fasilitas.html` |
| `/tk-sigma` | `tk_sigma` | `tk-sigma.html` |
| `/daycare-sigma` | `daycare_sigma` | `daycare-sigma.html` |
| `/artikel` | `article` | `blog.html` |
| `/artikel/{id}` | `detail_article` | `blog-single.html` |
| `/murid-berprestasi` | `murid_berprestasi` | **tidak punya halaman sendiri** |

**Selisih yang perlu diputuskan:** Laravel punya halaman terpisah "Murid Berprestasi",
sedangkan di situs statis **section "Murid Berprestasi" sudah ada di dalam `index.html`**
(diverifikasi: `index.html` baris 533 memuat blok `<!-- Murid Berprestasi Section -->`),
dan `teacher.html` memuat "Pembiasaan Pagi". Artinya **11 halaman statis sudah mencakup
seluruh 12 halaman Blade** — tidak ada konten yang hilang, hanya berbeda cara penempatan.

Rekomendasi: **pertahankan 11 halaman apa adanya** (sesuai instruksi), tanpa menambah
halaman baru. Konten `murid_berprestasi.blade.php` tetap hidup sebagai section di
`index.html`. Jika Anda justru ingin halaman "Murid Berprestasi" mandiri, itu menambah
halaman ke-12 dan bertentangan dengan aturan "pertahankan 11 halaman" — perlu
keputusan eksplisit Anda (§12 Butir 9).

---

## 7. Rangkuman Admin Blade (16 file)

Total file di `resources/views/admin/` = **16**, terdiri dari:
- **13 halaman** yang bisa diakses: 3 artikel + 3 kategori + 3 tag + 3 fasilitas + 1 login
- **1 layout**: `layouts/app.blade.php`
- **2 partial**: `articles/_form.blade.php`, `facilities/_form.blade.php`

Semua halaman memakai Tailwind CSS v4 (compiled via Vite dari `resources/css/app.css`),
Font Awesome 6.5.1 (CDN), dan font DM Sans + Manrope (Google Fonts). **Penting:**
file hasil Vite build (`public/build/`) adalah **artefak**, bukan sumber. Setelah
mengonversi ke HTML statis, admin harus memakai CSS statis — utility class di luar cakupan Tailwind
adalah utility class Tailwind. **Keputusan yang dibutuhkan:** pertahankan Tailwind
(melalui CDN `cdn.tailwindcss.com` untuk development, atau build CLI/CDN produksi)
atau tulis ulang utility tersebut ke CSS biasa. Rekomendasi: **pertahankan Tailwind**
via build terotomatis (CLI `tailwindcss -i ... -o admin/assets/admin.css --minify`),
supaya tampilan identik tanpa menulis ulang CSS.

Semua form admin memakai `method="POST"` + `@csrf` + `@method('PUT'|'DELETE')` → saat
diubah ke JS, ganti dengan `supabase.from(...).update()/delete()`.

---

## 8. Rencana Implementasi (10 Langkah, aman & berurutan)

> Setiap langkah punya **exit criteria** dan **rollback**. Jangan ada langkah yang
>_irreversible_ tanpa backup yang sudah diverifikasi (Langkah 1).

### Langkah 1 — Backup & Verifikasi (WAJIB, blocking)
1.1 Backup database penuh:
```bash
"/c/laragon/bin/mysql/mysql-8.0.30-winx64/bin/mysqldump.exe" \
  -h 127.0.0.1 -P 3306 -u root --single-transaction --routines --triggers \
  --default-character-set=utf8mb4 web_nurul_ilmi > backup/web_nurul_ilmi_$(date +%Y%m%d_%H%M%S).sql
```
1.2 Backup file storage:
```bash
tar -czf backup/storage_app_public_$(date +%Y%m%d_%H%M%S).tar.gz -C web_nurul_iman/storage/app public
```
1.3 Backup repo + tag git:
```bash
git add -A && git commit -m "chore: snapshot sebelum migrasi Supabase" && git tag backup/pre-supabase
```
1.4 Verifikasi: hitung baris tiap tabel dari dump (**10 tabel bisnis: 125 baris sumber →
124 baris yang dimigrasikan**), bandingkan `CHECKSUM TABLE` dengan baseline §1.5, pastikan
19 file storage terbackup, simpan salinan dump di lokasi kedua (drive/lemari).
**Exit**: dump terverifikasi bisa di-restore ke DB kosong (uji restore di DB `web_nurul_ilmi_restore_test`).
**Rollback**: tidak ada — belum ada perubahan.

### Langkah 2 — Project Supabase
2.1 Buat project di region terdekat (Singapore `ap-southeast-1` agar latency rendah).
2.2 Catat: Project URL, anon/publishable key, dan **service_role key di password manager**
(tidak di repo).
2.3 Set auth: email confirmation ON, leaked-password protection ON, redirect URL
`https://www.ypinurulilmi.or.id/**`.
2.4 Buat bucket `media` (public) — §3.3.
**Exit**: dashboard Supabase bisa dibuka, anon key bisa memanggil `/rest/v1/units`.
**Rollback**: hapus project.

### Langkah 3 — Skema PostgreSQL + RLS
3.1 Terapkan DDL untuk 10 tabel bisnis **dengan ID yang sama** (nullable identity
`OVERRIDING SYSTEM VALUE` saat insert).
3.2 Terapkan tabel pendukung `user_roles`, `comment_rate_limits`.
3.3 Terapkan seluruh policy RLS §2.4 + storage policies §3.4.
3.4 Buat fungsi: `current_role()`, `client_ip()`, `increment_article_views()`,
`submit_comment()`.
3.5 **Uji RLS** dengan dua token uji (admin & anon) via `curl` sebelum data masuk.
**Exit**: `articles` menolak INSERT dari anon; `anon` hanya melihat published.
**Rollback**: `drop schema public cascade` (aman karena belum ada data).

### Langkah 4 — Migrasi Data
4.1 Ekspor tabel bisnis ke CSV/JSON dari dump MySQL (pertahankan ID, kolom created_at/updated_at).
4.2 Load ke Supabase dengan `COPY` (via psql/dashboard SQL editor) atau `supabase db push`.
4.3 `setval` sequence ke `max(id)+1` untuk setiap tabel.
4.4 Backfill `articles.author_id` (email → auth.users) setelah akun dibuat (Langkah 5).
4.5 **Verifikasi baris per tabel cocok dengan dump.** Wajib cocok: `facility_unit` 60,
`facilities` 29, `facility_photos` 19, `categories` 5, `units` 5, `tags` 3, `articles` 2,
`article_media` **1** (id=11 saja; id=5 tidak dimigrasikan — Butir 2), `article_tags` 0,
`comments` 0 → **total 124 baris** (sumber MySQL = 125 baris, selisih 1 = baris id=5).
Bandingkan juga `CHECKSUM TABLE` dengan baseline §1.5.
**Exit**: penghitung baris identik; sample 5 relasi lintas tabel (artikel→kategori→tag,
fasilitas→foto→unit) cocok.
**Rollback**: truncate tabel publik.

### Langkah 5 — Akun & Peran
5.1 Invite `admin@ypinurulilmi.or.id` (Edge Function/Admin API).
5.2 Tetapkan `user_roles` = `admin` untuk akun tersebut.
5.3 Backfill `articles.author_id`.
5.4 Verifikasi login + RLS lewat token akun tersebut.
**Exit**: akun admin masuk, melihat & mengubah semua artikel.
**Rollback**: hapus user dari Supabase.

### Langkah 6 — Migrasi File Storage
6.1 Upload 14 file `facilities/` + 1 file artikel terpakai → bucket `media`, path **identik**.
6.2 Upload 3 file orphan ke `media/_orphan/` (tidak dihapus).
6.3 Baris `article_media` id=5 → `articles/media/aaa.jpg` (file hilang): **sudah diputuskan
   (Butir 2) = (b) hapus baris + catat**. File asli tidak ada di storage, jadi tidak ada
   yang di-upload; baris id=5 tidak masuk Supabase dan dicatat di laporan migrasi final.
6.4 Verifikasi: untuk setiap path unik di DB, `HEAD` ke URL publik Supabase → 200.
Ada **14 path unik fasilitas + 1 path artikel terpakai = 15 URL** yang harus 200
(19 baris `facility_photos` → 14 file fisik; sisanya berbagi file).
**Exit**: 15/15 URL 200.
**Rollback**: hapus objek di bucket.

### Langkah 7 — Konversi Dashboard Admin
7.1 Bangun `admin/` static: `login.html`, `articles.html`, `article-form.html`,
`categories.html`, `category-form.html`, `tags.html`, `tag-form.html`,
`facilities.html`, `facility-form.html`, `_layout.html`, `_article-form.html`,
`_facility-form.html`.
7.2 Bangun `js/supabase.js` (klien + `mediaUrl()`), `js/admin-auth.js` (session + guard),
`js/admin-articles.js`, `js/admin-categories.js`, `js/admin-tags.js`,
`js/admin-facilities.js`.
7.3 Porting helper: `slugify()` (setara `Str::slug`), `upperTag()` (setara `Str::upper`).
7.4 Formir validasi: samakan pesan & aturan dengan `ArticleAdminController::rules()`:
   - `title_id` required ≤255, `content_id` required, `category_id` harus ada,
   - `status` ∈ {published, draft}, `tags.*` harus ada, `author_name` ≤255
   - gambar ≤5 MB (jpeg/png/jpg/webp), video ≤25 MB (mp4/webm)
   - fasilitas: `units` required min 1, satu group saja, `icon` harus prefix
     fas/far/fab, `slug` unique, `description` ≤1000, `sort_order` ≥ 0, foto ≤4 MB
7.5 Upload media via `supabase.storage.from('media').upload(path, file)` dengan path
   acak UUID.
7.6 Tombol "Terjemahkan otomatis" → Edge Function (§4.8).
7.7 Layar moderasi komentar (tab baru) — menunggu persetujuan §12 Butir 5.
**Exit**: seluruh 13 alur admin berfungsi di browser (butir per butir di §9).
**Rollback**: dashboard statis bisa dimatikan lewat flag; Laravel lama masih ada sampai Langkah 10.

### Langkah 8 — Integrasi Frontend
8.1 `blog.html` → baca `articles` (published) dari Supabase, filter `?kategori=` / `?tag=`,
pagination klien.
8.2 `article.html?id=` (atau `blog-single.html?id=`) → detail artikel + media (image/video)
   + komentar published + form kirim komentar (RPC `submit_comment`) + related articles
   + counter views (RPC `increment_article_views`).
8.3 `index.html` Recent Blog → ganti sumber API Laravel dengan query Supabase.
8.4 `index/tk-sigma/daycare-sigma/galeri-fasilitas` → ganti `js/facilities.js` & `js/site-config.js`
   agar membaca Supabase langsung (hapus ketergantungan ke `backendUrl`).
8.5 Hapus `js/site-config.js`' `backendUrl`/`localBackendUrl`/`articlesApiPath`/
   `facilitiesApiPath` → ganti dengan konfigurasi Supabase (`SUPABASE_URL` + anon key).
   Halaman login admin tetap di `admin/login.html` (tanpa tombol di navbar publik).
8.6 `blog-single.html` lama → tampilkan pengalihan ke `article.html?id=` agar URL lama hidup.
**Exit**: 11 halaman statis berfungsi penuh dengan data Supabase.
**Rollback**: kembalikan `site-config.js` versi lama (path lama masih ada).

### Langkah 9 — Testing (lihat §9)
### Langkah 10 — Deployment
10.1 Deploy halaman statis → GitHub Pages (branch `main`, root) — sudah jadi boneka saat ini.
10.2 Deploy dashboard admin → path `/admin/` pada repo yang sama.
10.3 Set custom domain + header keamanan.
10.4 **Cutover**: ubah DNS/hosting agar frontend statis memakai Supabase; hosting PHP
     lama ditahan **minimal 30 hari** hanya sebagai pengalih `/storage/*` (§3.5).
10.5 Nonaktifkan Laravel: `.env` `APP_ENV=maintenance` → **jangan** hapus dulu (rollback).
10.6 Setelah stabil 30–60 hari: arsipkan `web_nurul_iman/` (lihat §10).

---

## 9. Checklist Pengujian per Fitur

### 9.1 Autentikasi & Role
- [ ] Login admin berhasil → session tersimpan, guard dashboard lolos
- [ ] Login gagal → pesan error tampil, tidak ada session
- [ ] Refresh halaman admin saat login → tetap authenticated
- [ ] Logout → session dihapus, guard aktif lagi
- [ ] **Token `anon` tidak bisa** INSERT/UPDATE/DELETE artikel → 401/403
- [ ] **Token `anon` tidak bisa** INSERT ke `user_roles` → denied
- [ ] **Token `anon` tidak bisa** UPDATE `articles.views` langsung → denied
- [ ] Akun `admin` bisa INSERT ke `user_roles` lewat kanal service_role
- [ ] Akun `editor` bisa buat artikel & fasilitas, **tidak** bisa ubah `user_roles`
- [ ] Akun `guru` bisa buat artikel dengan `author_id` = dirinya sendiri
- [ ] Akun `guru` **tidak bisa** edit artikel milik orang lain → update 0 baris
- [ ] Akun `guru` **tidak bisa** hapus artikel → denied
- [ ] Akun `guru` **tidak bisa** akses menu Kategori/Tag/Fasilitas di UI
- [ ] Tidak ada `service_role` / `eyJhbGciOi` di seluruh file frontend (grep + secret scan)

### 9.2 Artikel (CRUD)
- [ ] Buat artikel tanpa media → tersimpan, tampil di daftar admin
- [ ] Buat artikel dengan 1 gambar → thumbnail muncul
- [ ] Buat artikel dengan beberapa gambar + video → semua tampil, urut sesuai
- [ ] Edit artikel lama tanpa mengunggah ulang → media lama tetap ada
- [ ] Edit artikel yang sudah punya `article_media` → tidak error urutan
- [ ] Ubah urutan media (naik/turun) → urutan tersimpan
- [ ] Ubah caption media → tersimpan
- [ ] Hapus satu media → file terhapus dari bucket, baris terhapus
- [ ] Hapus artikel → media ikut terhapus, `article_tags` dilepas
- [ ] Status `draft` → tidak muncul di halaman publik & API
- [ ] Status `published` → muncul di listing & Recent Blog
- [ ] `published_at` terisi saat pertama kali tayang, tidak berubah saat diedit ulang
- [ ] Filter kategori & tag bekerja di listing publik
- [ ] Pagination bekerja (9 per halaman)
- [ ] Pencarian klien di daftar admin memfilter baris
- [ ] Statistik dashboard (total artikel, total dibaca) akurat

### 9.3 Kategori & Tag
- [ ] Buat kategori → slug terisi otomatis & unik
- [ ] Edit kategori → slug ikut berubah, artikel terkait tidak putus
- [ ] Hapus kategori → artikel terkait jadi "Tanpa kategori" (ON DELETE SET NULL)
- [ ] Jumlah artikel per kategori di daftar admin akurat
- [ ] Buat tag → nama otomatis HURUF BESAR, slug lowercase
- [ ] Edit / hapus tag → artikel terkait tetap utuh

### 9.4 Fasilitas & Galeri
- [ ] Buat fasilitas dengan 1 unit → tersimpan
- [ ] Buat fasilitas tanpa unit → ditolak (pesan "pilih minimal satu unit")
- [ ] Pilih unit dari group berbeda → ditolak
- [ ] Unggah banyak foto → semua tersimpan, sort_order berurutan
- [ ] Jadikan foto sebagai sampul → `is_cover` pindah, card memakai foto sampul
- [ ] Ubah urutan foto (naik/turun) → tersimpan
- [ ] Edit caption & alt text → tersimpan
- [ ] Hapus satu foto → file terhapus dari bucket
- [ ] Hapus fasilitas → foto ikut terhapus, `facility_unit` dilepas
- [ ] Ikon: ketik class valid → pratinjau berubah; ketik class invalid → pratinjau fallback + hint merah
- [ ] 23 preset ikon berfungsi
- [ ] Filter (cari/group/unit/status) + pagination bekerja
- [ ] Fasilitas `is_published=false` → tidak tampil di frontend
- [ ] Fasilitas `main` tidak muncul di section TK Sigma & Daycare Sigma, dan sebaliknya

### 9.5 Media & Storage
- [ ] Semua 15 URL media (14 fasilitas + 1 artikel) merespons 200
- [ ] Upload file >5 MB ditolak (gambar) / >25 MB ditolak (video)
- [ ] Format terlarang ditolak (mis. `.svg`, `.exe`)
- [ ] Path file baru bersifat acak (tidak menimpa file lama)
- [ ] File orphan tidak terhapus saat migrasi (terverifikasi ada di `media/_orphan/`)
- [ ] Gambar artikel lama (yang hanya ada di kolom `image`) tetap tampil sebagai media

### 9.6 Komentar Publik
- [ ] Kirim komentar valid → tersimpan dengan status `pending` (atau `published` bila moderasi nonaktif)
- [ ] Komentar `pending` tidak tampil di halaman publik
- [ ] Komentar validasi: nama <2 karakter ditolak, komentar <3 karakter ditolak
- [ ] Honeypot terisi → komentar ditolak tanpa pesan otomatis (spam tidak terkirim)
- [ ] Rate limit: 6 komentar dalam 1 jam dari IP sama → permintaan ke-6 ditolak
- [ ] Admin memoderasi: set `published` / `spam` / hapus
- [ ] Komentar pada artikel yang dihapus ikut terhapus (cascade)

### 9.7 Frontend Publik (11 halaman)
- [ ] `index.html`: Recent Blog menampilkan 3 artikel terbaru dari Supabase
- [ ] `index.html`: kartu fasilitas terisi dari Supabase
- [ ] `blog.html`: daftar artikel, filter kategori & tag, pagination
- [ ] `article.html?id=`: judul, isi, tanggal, penulis, jumlah dibaca, media, komentar, artikel terkait
- [ ] `article.html`: counter views bertambah saat dibuka
- [ ] `blog-single.html` lama → mengarahkan ke `article.html?id=`
- [ ] `galeri-fasilitas.html`: grid foto dari Supabase, lightbox berfungsi
- [ ] `tk-sigma.html`: hanya fasilitas unit `tk-sigma`
- [ ] `daycare-sigma.html`: hanya fasilitas unit `daycare-sigma`
- [ ] `about/courses/pricing/teacher/contact.html`: tidak rusak, layout utuh
- [ ] Semua 11 halaman: tidak ada error di console, tidak ada request ke backend Laravel
- [ ] Tampilan di mobile & desktop sama dengan saat ini

### 9.8 Keamanan
- [ ] `service_role` tidak ada di HTML/JS mana pun (grep repo + build output)
- [ ] Key anon hanya
- [ ] RLS aktif di **semua** tabel publik (verifikasi via dashboard → Authentication/RLS)
- [ ] Header CSP + `X-Content-Type-Options` + `Referrer-Policy` terpasang
- [ ] Form komentar: honeypot + rate limit aktif
- [ ] Halaman admin tidak membocorkan data lewat HTML statis (semua data via RLS)
- [ ] Error 500 tidak membocorkan stack trace

### 9.9 Non-Regresi
- [ ] 11 halaman statis: jumlah & nama file identik dengan sebelum
- [ ] Tampilan visual identik (Tailwind config, Font Awesome, font) — bandingkan screenshot
- [ ] Semua tautan internal antar halaman masih bekerja
- [ ] `CNAME` & custom domain tetap bekerja
- [ ] Test suite Laravel yang ada (8 file test, 76 test method) — **dipertahankan sebagai regresi**,
      dijalankan sebelum & sesudah (hasil harus identik)

---

## 10. Aturan Handling File & Data (tidak menghapus tanpa persetujuan)

| Objek | Tindakan |
|---|---|
| 3 file orphan `articles/*.jpg` | Upload ke `media/_orphan/`, **jangan** hapus. Buat `docs/orphan-files.csv` berisi path + alasan |
| `article_media` id=5 → `articles/media/aaa.jpg` | File hilang. Opsi (a)/(b) di §3.2 — **tunggu keputusan** |
| `web_nurul_iman/public/landingPage/` (148 file) | Pertahankan di git, keluarkan dari deploy. Hapus hanya setelah masa retensi 60 hari |
| `web_nurul_iman/` (seluruh backend) | Di-arsipkan, **tidak** dihapus. Tidak adaARSIP deletion sampai Anda menyatakan selesai |
| `users` lama (`admin@test.local`) | Dicatat di laporan, tidak diundang. Tidak dihapus dari backup |
| Tabel `cache`, `jobs`, `failed_jobs`, `sessions` | Tidak dimigrasikan; tetap ada di dump backup |

**Masa retensi yang saya sarankan:** pertahankan `web_nurul_iman/` dan dump SQL di
repository/arsip selama **60 hari** setelah produksi stabil. Setelah itu baru
pertimbangkan penghapusan — dan hanya atas instruksi eksplisit Anda.

> **Catatan 2026-11-15 — Source Laravel sudah dihapus.** Atas instruksi eksplisit
> pada tahap "FINAL CLEANUP, RBAC & ADMIN ACCOUNT SETUP", folder `web_nurul_iman/`
> dihapus dari working tree. Yang dipertahankan:
>
> | Asal | Sekarang ada di |
> |---|---|
> | `web_nurul_iman/storage/app/public` (19 media) | `backup/legacy-media/` |
> | `web_nurul_iman/database/{migrations,seeders}` | `backup/laravel-database/` |
> | `web_nurul_iman/.env` + `.env.example` | `backup/laravel-env/` (gitignored) |
> | `vendor/composer/ClassLoader.php` + `vendor/voku/portable-ascii` | `scripts/php-vendor/` |
>
> Database MySQL lama **tidak** disentuh dan dump SQL tetap utuh. Seluruh file
> yang terlacak di Git tetap dapat diambil dari riwayat commit. Rincian lengkap
> ada di `backup/README.md`.

---

## 11. Risiko & Mitigasi

| # | Risiko | Dampak | Mitigasi |
|---|---|---|---|
| R1 | Key `service_role` bocor ke frontend | Keb-totalan data | Kunci hanya di Edge Function/secret manager; secret scanning di CI; anon key untuk browser |
| R2 | Role bisa dinaikkan sendiri | Akun Guru jadi Admin | Role di `user_roles` tanpa policy write; ubah hanya via service_role |
| R3 | `author_id` tidak diisi → Guru terkunci | Guru tak bisa edit artikel lama | Backfill `author_id` di Langkah 4.4 |
| R4 | RLS salah → artikel draft bocor | Konten draft tayang | Uji RLS dengan token anon **sebelum** migrasi data (Langkah 3.5) |
| R5 | URL media lama mati | Gambar rusak di artikel lama yang tersebar | Hosting PHP lama bertahan 30 hari sebagai pengalih (§3.5) |
| R6 | Upload file besar ke Storage gagal | Media tidak lengkap | Validasi ukuran/tipe di klien **dan** policy storage; upload dari dashboard lewat service role |
| R7 | Spam komentar | Reputasi sekolah | Honeypot + rate limit + moderasi (status `pending`) |
| R8 | Kontrol "punya" artikel via `author_id` NULL | Guru kehilangan akses | Backfill wajib + fallback: `author_name` cocok → isi `author_id` |
| R9 | Skema Tailwind tidak bisa di-build untuk admin statis | Tampilan rusak | Build CLI Tailwind (`tailwindcss -i -o --minify`) sebagai langkah wajib, bukan CDN dev |
| R10 | Ekor URL `/artikel/{id}` (Laravel) tidak ada padanannya | Link lama mati | `article.html?id=` + alias `blog-single.html` |
| R11 | Pemetaan slug `Str::slug` berbeda dari JS | Slug berubah → URL mati | Tulis `slugify()` teruji dengan 20+ kasus (tanpa diaeresis, angka, spasi ganda, karakter khusus) |
| R12 | `comments` tanpa moderasi | Spam tayang langsung | Kolom `status` + layar moderasi (butuh persetujuan §12) |
| R13 | Status data MySQL belum dikonfirmasi | Konten asli mungkin ada di tempat lain | Konfirmasi dari Anda **sebelum** langkah migrasi data: apakah MySQL ini sudah berisi seluruh data yang harus dipindahkan |

> **R13 perlu konfirmasi Anda.** Isi database saat ini tercatat: 2 artikel, 0 komentar,
> 3 tag, 5 kategori, 29 fasilitas, 19 foto fasilitas, 2 akun. **Status data ini (uji atau
> produksi) belum ditentukan dan tidak boleh diasumsikan** — hanya Anda yang bisa
> menyatakannya. Jika ternyata ada konten yang belum masuk ke MySQL ini, lokasinya perlu
> ditemukan **sebelum** migrasi dimulai.
---

## 12. Keputusan yang Sudah Disetujui (10/10)

Status: **seluruh 10 keputusan disetujui oleh pemilik project.** Belum ada implementasi —
menunggu persetujuan final eksplisit.

| # | Butir | Pilihan disetujui | Konsekuensi untuk implementasi |
|---|---|---|---|
| 1 | Akun `admin@test.local` | **(a) tidak diundang** | Hanya `admin@ypinurulilmi.or.id` dibuat di Supabase (role `admin`). Akun ID 4 tetap ada di dump SQL & backup, tidak dihapus dari arsip. |
| 2 | `article_media` id=5 → `articles/media/aaa.jpg` (file hilang) | **(b) hapus baris + catat** | Baris id=5 tidak dimigrasikan. Dicatat di laporan migrasi final. `article_media` hasil migrasi = 1 baris (id=11). Konsekuensi jumlah baris: **10 tabel bisnis = 124 baris** hasil migrasi (sumber 125 baris). |
| 3 | 3 file orphan `articles/*.jpg` | **(a) simpan di `_orphan/`, jangan hapus** | Upload ke `media/_orphan/` + `docs/orphan-files.csv` berisi path & alasan. File utuh, tidak dirujuk DB, tidak tampil di situs. |
| 4 | URL detail artikel | **(a) `article.html?id=`** | Tanpa kolom `slug` baru. `blog-single.html` lama jadi pengalih ke `article.html?id=`. |
| 5 | Komentar publik | **(a) moderasi `pending` + tab baru** | Kolom `status` & `ip_hash` di `comments`. RPC `submit_comment` always writes `pending`. Dashboard dapat 1 tab baru: **Moderasi Komentar**. |
| 6 | Terjemahan otomatis ID→EN | **(a) Supabase Edge Function** | Butuh Google Cloud Translation API key → disimpan di Supabase **secrets** (Edge Function), tidak pernah di frontend. Kalau key belum tersedia, Edge Function dibuat dengan toggle dan fitur nonaktif sampai key diisi. |
| 7 | Bucket media | **(a) bucket publik `media`** | `public=true`. Tulis tetap dibatasi RLS storage policy ke `admin`/`editor`/`guru`. Path relatif dipertahankan persis. |
| 8 | CSS dashboard admin | **(a) Tailwind build via CLI** | `admin/assets/admin.css` di-generate dari class Tailwind yang sama → tampilan dijamin identik. Node.js wajib ada di mesin build. |
| 9 | Struktur halaman publik | **(a) pertahankan 11 halaman** | Tidak ada halaman ke-12. "Pembiasaan Pagi" = `teacher.html`; "Murid Berprestasi" tetap section di `index.html`. |
| 10 | Status data MySQL | **MySQL `web_nurul_ilmi` sudah berisi seluruh data yang perlu dimigrasikan** | Tidak ada tahap penggabungan dari sumber lain. R13 ditutup: risiko konten tertinggal di sumber lain = tidak berlaku. Migrasi data bisa langsung dijalankan pada Langkah 4. |

> **Catatan R13 (sudah ditutup):** pemilik project mengonfirmasi bahwa MySQL `web_nurul_ilmi`
> berisi seluruh data yang perlu dimigrasikan. Dokumen ini **tidak lagi mengasumsikan**
> status uji/produksi pada isi tabel — yang dimigrasikan apa adanya, apa pun statusnya.


## 13. Checklist Persiapan Implementasi (sebelum mulai)

Semua butir WAJIB tercentang sebelum eksekusi Langkah 1. Yang bertanda **BLOCKER**
menhaltakan implementasi sampai tuntas.

### A. Backup & Keamanan Data (BLOCKER — tidak boleh dilewati)
- [ ] `backup/` dibuat di luar repo ATAU di repo dengan `.gitignore` yang benar
- [ ] Dump MySQL penuh: `mysqldump --single-transaction --routines --triggers --column-statistics=0 web_nurul_ilmi`
- [ ] **Uji restore dump** ke database baru `web_nurul_ilmi_restore_test` → bandingkan jumlah baris **10 tabel bisnis** (sumber 125 baris) dan `CHECKSUM TABLE` dengan baseline §1.5 → **hapus DB uji**
- [ ] Backup file: `tar -czf backup/storage_app_public_<tgl>.tar.gz -C web_nurul_iman/storage/app public`
- [ ] Verifikasi jumlah file terbackup = **19** (18 media + 1 `.gitignore`)
- [ ] **Salinan kedua dump** disimpan di lokasi terpisah (drive/lemari), bukan hanya di repo
- [ ] Snapshot git: `git add -A && git commit` + `git tag backup/pre-supabase` (hanya setelah Anda instruksikan)
- [ ] Verifikasi `web_nurul_iman/` utuh: `git status` bersih, 16 blade admin + 16 blade landing + 148 file `public/landingPage/` ada

### B. Kredensial & Akun
- [ ] Project Supabase dibuat (region `ap-southeast-1`)
- [ ] **anon/publishable key** dicatat → destined ke `js/site-config.js` (publik, aman)
- [ ] **service_role key** dicatat → **hanya** ke password manager + Supabase secrets. **Tidak** di repo, **tidak** di HTML/JS
- [ ] Akun `admin@ypinurulilmi.or.id` diundang → set password baru oleh penerima
- [ ] `user_roles` diisi `admin` untuk akun tersebut
- [ ] Akun `admin@test.local` **tidak** diundang (Butir 1)
- [ ] Email confirmation ON, leaked-password protection ON, redirect URL `https://www.ypinurulilmi.or.id/**`

### C. Prasyarat Tooling
- [ ] Node.js + npm terpasang (untuk Tailwind CLI — Butir 8)
- [ ] `mysqldump` & `psql` (atau Supabase CLI) terpasang
- [ ] Git terpasang & repo remote siap (untuk backup tag)
- [ ] Node.js 20+ (Tailwind v4 butuh)

### D. Prasyarat Layanan (opsional, tapi最好 disiapkan sebelum Langkah 7)
- [ ] Google Cloud Translation API key tersedia → disimpan di Supabase **secrets** (Butir 6). Jika belum ada: Edge Function dibuat dengan fitur nonaktif, tombol "Terjemahkan" di dashboard disembunyikan sampai key tersedia
- [ ] Domain `www.ypinurulilmi.or.id` + CNAME sudah diarahkan / siap diarahkan
- [ ] Hosting PHP lama **tahan** minimal 30 hari sebagai pengalih `/storage/*` (§3.5)

### E. Verifikasi Skema Postgres (BLOCKER)
- [ ] 10 tabel bisnis dibuat dengan `bigint ... GENERATED BY DEFAULT AS IDENTITY` (bukan `ALWAYS`) → ID lama bisa di-insert eksplisit
- [ ] `user_roles`, `comment_rate_limits` dibuat
- [ ] Semua policy RLS §2.4 terpasang & RLS aktif di **seluruh** tabel publik
- [ ] Fungsi terpasang: `current_role()`, `client_ip()`, `increment_article_views()`, `submit_comment()`
- [ ] Bucket `media` dibuat (public) + storage policies terpasang
- [ ] **Uji RLS dengan token anon SEBELUM data dimigrasikan** (Langkah 3.5) → anon tidak boleh INSERT artikel, tidak boleh UPDATE `views`, tidak boleh INSERT `user_roles`

### F. Migrasi Data
- [ ] Ekspor **10 tabel bisnis** (ID dipertahankan) → load ke Supabase
- [ ] `setval` sequence ke `max(id)+1` per tabel
- [ ] Verifikasi jumlah baris identik dengan dump **hasil migrasi = 124 baris**:
  articles 2, categories 5, tags 3, comments 0, article_media **1** (id=11 saja — id=5
  tidak dimigrasikan, Butir 2), article_tags 0, facilities 29, facility_photos 19,
  facility_unit 60, units 5 → **total 124** (sumber MySQL 125, selisih 1 = id=5)
- [ ] Bandingkan `CHECKSUM TABLE` dengan baseline §1.5 untuk 10 tabel bisnis (wajib cocok;
  `article_media` expected 1 baris karena id=5 tidak dimigrasikan)
- [ ] Backfill `articles.author_id` untuk artikel id 1 & 3 → `admin@ypinurulilmi.or.id`
- [ ] Sample 5 relasi lintas tabel dicocokkan (artikel→kategori→tag, fasilitas→foto→unit)

### G. Migrasi File
- [ ] Upload 14 file `facilities/` → path identik
- [ ] Upload 1 file artikel terpakai → `articles/2HnGt...png`
- [ ] Upload 3 file orphan → `media/_orphan/` (**tidak dihapus**, Butir 3)
- [ ] `docs/orphan-files.csv` dibuat berisi path + alasan
- [ ] Verifikasi **15 URL** media (14 fasilitas + 1 artikel) merespons HTTP 200

### H. Konversi Dashboard
- [ ] 13 halaman admin HTML dibuat + `_layout.html` + 2 partial
- [ ] `js/supabase.js` (klien + `mediaUrl()`), `js/admin-auth.js` (session + guard)
- [ ] `admin-articles.js`, `admin-categories.js`, `admin-tags.js`, `admin-facilities.js`
- [ ] Helper `slugify()` & `upperTag()` diuji dengan 20+ kasus (match `Str::slug` / `Str::upper`)
- [ ] `tailwindcss` CLI build → `admin/assets/admin.css`
- [ ] Tab **Moderasi Komentar** baru dibuat (Butir 5)
- [ ] **Cek grep seluruh repo: tidak ada `service_role`, `eyJhbGciOi`, API key Google Translate**

### I. Integrasi Frontend
- [ ] `js/site-config.js` diganti: hapus `backendUrl`/`localBackendUrl`/`articlesApiPath`/`facilitiesApiPath` → `SUPABASE_URL` + anon key + `mediaUrl()`
- [ ] `blog.html` → query Supabase (published) + filter kategori/tag + pagination
- [ ] `article.html?id=` dibuat; `blog-single.html` lama → pengalih
- [ ] `js/home-blog.js` → sumber Supabase
- [ ] `js/facilities.js` → sumber Supabase (hapus fetch ke `/api/facilities`)
- [x] Halaman login admin tetap di `admin/login.html` (tanpa tombol di navbar publik)
- [ ] Verifikasi: **tidak ada request ke backend Laravel** dari 11 halaman (cek Network tab)

### J. Cutover
- [ ] Seluruh checklist §9 (uji per fitur) hijau
- [ ] Hosting PHP lama **dinyalakan** (maintenance only) minimal 30 hari
- [ ] `.env` `APP_ENV=maintenance` — **jangan** hapus `web_nurul_iman/`
- [ ] Retensi: dump SQL + `web_nurul_iman/` + `public/landingPage/` disimpan **60 hari** sebelum考虑 penghapusan (dan hanya atas instruksi eksplisit Anda)

---

---

## 14. Lampiran — Daftar Perintah Audit yang Digunakan (Read-Only)

```bash
# Dump baca-saja (tidak mengubah apa pun)
mysqldump -h 127.0.0.1 -P 3306 -u root --single-transaction --no-tablespaces \
  --skip-dump-date --skip-add-locks --column-statistics=0 web_nurul_ilmi > dump.sql

# Verifikasi
grep -c "" dump.sql                       # ukuran dump
awk '/^INSERT INTO/ {...}' dump.sql        # hitung baris per tabel

# Baseline checksum (baseline §1.5 — jalankan di DB sumber & DB uji restore)
CHECKSUM TABLE users, categories, articles, article_media, tags, units,
               facilities, facility_photos, facility_unit, article_tags, comments;
```

Tidak ada `INSERT`/`UPDATE`/`DELETE`/`ALTER`/`DROP` yang dieksekusi terhadap MySQL
maupun terhadap proyek mana pun pada tahap audit dan pengambilan keputusan ini.
Tidak ada file kode, konfigurasi, atau aset yang dibuat, diubah, atau dihapus —
dokumen `RANCANGAN-MIGRASI-SUPABASE.md` ini adalah satu-satunya artefak yang dibuat.
