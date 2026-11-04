# YPI Nurul Ilmi — Website Yayasan Pendidikan Islam Nurul Ilmi Bekasi

Repo ini berisi dua bagian website yang berjalan terpisah:

| Bagian | Lokasi | Cara deploy | Peran |
|---|---|---|---|
| **Frontend statis** | Root repo (`*.html`, `css/`, `js/`, `images/`, `fonts/`, `scss/`, `audio/`) | GitHub Pages (branch `main`, root) | Landing page publik di `www.ypinurulilmi.or.id` |
| **Backend Laravel** | `web_nurul_iman/` | Hosting PHP + MySQL | Server-rendered website + dashboard admin artikel |

> **Penting:** GitHub Pages tidak menjalankan PHP. Dua bagian di atas tidak saling terhubung —
> halaman statis di root berdiri sendiri, sedangkan backend Laravel me-render halaman dari Blade.
> Konten artikel yang dibuat lewat dashboard admin **tidak otomatis** muncul di halaman statis Pages.

---

## 1. Struktur folder

```
webnurulilmi-main/
├── index.html, about.html, blog.html, blog-single.html, contact.html,
│   courses.html, pricing.html, teacher.html, galeri-fasilitas.html,
│   tk-sigma.html, daycare-sigma.html      ← halaman statis (GitHub Pages)
├── css/  js/  images/  fonts/  scss/       ← aset frontend statis
│   └── scss/ + prepros-6.config            ← sumber CSS (dikompilasi via Prepros ke css/)
├── audio/                                  ← Mars Nurul Ilmi (dipakai teacher.html)
├── CNAME                                   ← custom domain GitHub Pages
└── web_nurul_iman/                         ← BACKEND LARAVEL 12
    ├── app/  bootstrap/  config/  database/  routes/  resources/
    ├── storage/  public/  tests/
    ├── composer.json  composer.lock  package.json  package-lock.json  artisan
    └── public/landingPage/                 ← salinan aset statis yang dipakai Blade
        └── css/ js/ images/ fonts/ scss/
```

### `public/landingPage/`

Laravel me-render halaman lewat Blade, tetapi seluruh CSS/JS/gambar tetap diambil dari folder ini.
`layout.blade.php` mengeset `<base href="{{ asset('landingPage') }}/">`, sehingga path relatif
seperti `images/logo.png` otomatis mengarah ke `public/landingPage/images/`.

---

## 2. Menjalankan secara lokal

### Prasyarat
- PHP 8.2+ (ekstensi `pdo_mysql`)
- Composer 2
- Node.js & npm
- MySQL 5.7+/8 (atau MariaDB)

### Backend

```bash
cd web_nurul_iman
composer install
npm install

cp .env.example .env        # lalu isi DB_USERNAME / DB_PASSWORD / APP_KEY
php artisan key:generate
php artisan migrate --force
php artisan storage:link    # menautkan public/storage -> storage/app/public

# buat akun admin dashboard
php artisan admin:create-user

php artisan serve           # http://127.0.0.1:8000
```

`npm run build` wajib dijalankan bila `resources/css` atau `resources/js` diubah
(keluaran ada di `public/build/`). Untuk development, `npm run dev` menyalakan Vite.

### Frontend statis

Buka `index.html` langsung di browser, atau jalankan Live Server (port 5502 sudah
dikonfigurasi di `.vscode/settings.json`).

---

## 3. Konfigurasi environment

`.env` **tidak pernah** masuk repository (sudah di-ignore oleh `web_nurul_iman/.gitignore`).
Salin `.env.example` sebagai titik awal.

| Variabel | Catatan |
|---|---|
| `APP_NAME` | `"YPI Nurul Ilmi"` |
| `APP_ENV` | `local` saat dev, `production` saat deploy |
| `APP_DEBUG` | `true` saat dev, **`false` saat produksi** |
| `APP_URL` | URL domain produksi, mis. `https://ypinurulilmi.or.id` |
| `DB_DATABASE` | `web_nurul_ilmi` |
| `SESSION_DRIVER` / `CACHE_STORE` / `QUEUE_CONNECTION` | `database` — tabelnya dibuat oleh migration standar Laravel |

---

## 4. Deployment

### 4.1 GitHub Pages (frontend statis)

- Source: branch `main`, folder `/ (root)`
- Custom domain: `www.ypinurilmi.or.id` (dibaca dari `CNAME` di root repo)
- Tidak ada workflow otomatis; Pages mem-build langsung dari isi repo.
- **Jangan** memindahkan `*.html`, `css/`, `js/`, `images/` keluar dari root repo —
  Pages hanya mempublish branch `main` dari root.

### 4.2 Hosting Laravel

1. Upload isi `web_nurul_iman/` ke hosting.
2. Document root diarahkan ke `web_nurul_iman/public`.
3. Buat database MySQL, lalu jalankan `php artisan migrate --force`.
4. `php artisan storage:link` (atau buat symlink/junction `public/storage` → `storage/app/public`).
5. Set `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL` sesuai domain.
6. `php artisan config:cache && php artisan route:cache && php artisan view:cache`.
7. `composer install --no-dev --optimize-autoloader` di server.

### 4.3 Aset artikel

Gambar artikel disimpan di `web_nurul_iman/storage/app/public/articles/`.
Folder ini **sudah ikut ter-commit** (lihat `storage/app/public/.gitignore`) supaya gambar
tidak hilang saat deploy. Kalau memakai storage disk lain, sesuaikan aturan ignore-nya.

---

## 5. Testing

```bash
cd web_nurul_iman
php artisan test
```

Test suite memakai SQLite in-memory (`phpunit.xml`), jadi **tidak** butuh MySQL.
12 test mencakup halaman sigma, galeri fasilitas, dan alur autentikasi admin.

---

## 6. Catatan pemeliharaan

- **CSS statis** diedit lewat `scss/`, lalu dikompilasi ke `css/` dengan Prepros
  (konfigurasi: `prepros-6.config`). Jangan edit hasil kompilasi secara manual.
- **Halaman statis vs Blade** menyimpan konten yang nyaris sama dalam dua tempat.
  Perubahan pada halaman statis (root) **tidak** otomatis masuk ke Blade, dan sebaliknya.
- `web_nurul_iman/bootstrap/cache/*.php` adalah cache konfigurasi — **jangan** di-commit
  (sudah di-ignore). Cache lama berisi path absolut mesin lain dan bisa membuat
  aplikasi gagal start.
- Setelah menukar `.env`, jalankan `php artisan optimize:clear`.
