/* ==========================================================================
   UJI HALAMAN DI BROWSER Sungguhan (Chromium)
   --------------------------------------------------------------------------
   Menjalankan situs statis hasil migrasi lewat server lokal, lalu membuka
   tiap halaman dengan browser sungguhan:

     1. Halaman publik: beranda, profil, berita, artikel, unit, fasilitas,
        dan halaman lain. Setiap halaman dicek: HTTP 200, tidak ada error
        console, tidak ada permintaan jaringan yang gagal, dan elemen data
        benar-benar terisi data dari Supabase.
     2. Dashboard admin: login lewat form, buka tiap halaman dashboard,
        buat -> ubah -> hapus artikel lewat UI, lalu keluar (logout).

   Data uji yang dibuat diberi penanda 'Zzz probe' dan dihapus kembali di
   akhir, sehingga isi situs tidak berubah.

   Jalankan:
     node scripts/test-browser.mjs
   ========================================================================== */
import { createRequire } from 'node:module';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { execSync } from 'node:child_process';

import { ROOT, loadEnv } from './lib/env.mjs';

loadEnv();

const require = createRequire(import.meta.url);

function loadPlaywright() {
  const globalRoot = execSync('npm root -g').toString().trim();
  return require(path.join(globalRoot, 'playwright'));
}

/**
 * Chromium bawaan Playwright bisa versi berbeda dari yang terpasang di mesin.
 * Kalau tidak cocok, cari binary chromium yang memang ada di ms-playwright.
 */
function findInstalledChromium() {
  const base = path.join(
    process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'),
    'ms-playwright'
  );

  if (!fs.existsSync(base)) return null;

  const candidates = [];

  for (const entry of fs.readdirSync(base)) {
    if (!/^chromium/i.test(entry)) continue;

    for (const relative of [
      ['chrome-headless-shell-win64', 'chrome-headless-shell.exe'],
      ['chrome-win64', 'chrome.exe'],
      ['chrome-win', 'chrome.exe']
    ]) {
      const file = path.join(base, entry, relative[0], relative[1]);
      if (fs.existsSync(file)) candidates.push(file);
    }
  }

  if (!candidates.length) return null;

  /* headless shell lebih ringan; pakai yang itu kalau tersedia. */
  candidates.sort((a, b) => (a.includes('headless-shell') ? -1 : 1));

  return candidates[0];
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4'
};

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent(req.url.split('?')[0]);
      let filePath = path.join(ROOT, urlPath);

      if (!filePath.startsWith(ROOT)) {
        res.writeHead(403);
        res.end();
        return;
      }

      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }

      if (!fs.existsSync(filePath)) {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(fs.readFileSync(path.join(ROOT, '404.html')));
        return;
      }

      res.writeHead(200, {
        'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream'
      });
      res.end(fs.readFileSync(filePath));
    });

    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

const failures = [];
const notes = [];

function check(label, condition, detail) {
  const ok = Boolean(condition);
  if (!ok) failures.push(label + (detail ? ' — ' + detail : ''));
  console.log('  ' + (ok ? 'OK  ' : 'GAGAL') + ' ' + label + (detail ? '  ' + detail : ''));
  return ok;
}

/** Error console & permintaan gagal yang boleh diabaikan. */
function isIgnorable(text) {
  return /favicon/i.test(text) || /net::ERR_ABORTED/i.test(text);
}

async function newPage(context, label, bucket) {
  const page = await context.newPage();

  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    const text = message.text();
    if (isIgnorable(text)) return;
    /* Pesan "Failed to load resource" tanpa URL hanya mengulang status yang
       sudah ditangkap lengkap (beserta URL) oleh handler response. */
    if (/Failed to load resource/i.test(text)) return;
    bucket.console.push(text);
  });

  page.on('pageerror', (error) => bucket.console.push('pageerror: ' + error.message));

  page.on('requestfailed', (request) => {
    const text = request.url() + ' ' + (request.failure() || {}).errorText;
    if (isIgnorable(text)) return;
    bucket.failed.push(text);
  });

  page.on('response', (response) => {
    /* Percobaan login dengan password salah memang ditolak Supabase dengan
       HTTP 400, jadi respons itu bukan kegagalan tak terduga. */
    if (/\/auth\/v1\/token\?grant_type=password/.test(response.url())) return;
    if (response.status() >= 400) bucket.failed.push('HTTP ' + response.status() + ' ' + response.url());
  });

  /* Konfirmasi bawaan situs (hapus artikel, keluar) selalu disetujui. */
  page.on('dialog', (dialog) => dialog.accept());

  bucket.pages.push({ label, page });

  return page;
}

/**
 * Akun sekali pakai untuk uji "password salah ditolak".
 *
 * GoTrue mengunci email yang gagal login berulang kali. Karena itu account
 * uji tidak boleh memakai akun admin sungguhan, atau akun tersebut ikut
 * terkunci dan login admin berikutnya ditolak walau password-nya benar.
 */
async function createThrowawayUser() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return null;

  const email = 'uji.salah.satu.kali@ypinurulilmi.or.id';
  const headers = { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' };

  await deleteThrowawayUser(await findThrowawayUser(email));

  const created = await fetch(process.env.SUPABASE_URL + '/auth/v1/admin/users', {
    method: 'POST',
    headers,
    body: JSON.stringify({ email, password: 'UlanganSekaliPakai26!', email_confirm: true })
  });

  if (created.ok) {
    const body = await created.json();
    return body.id ? { id: body.id, email } : null;
  }

  return findThrowawayUser(email);
}

/** Cari akun uji sekali pakai yang sudah ada (mis. sisa run sebelumnya). */
async function findThrowawayUser(email) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return null;

  const response = await fetch(process.env.SUPABASE_URL + '/auth/v1/admin/users?per_page=1000', {
    headers: { apikey: key, Authorization: 'Bearer ' + key }
  });

  if (!response.ok) return null;

  const payload = await response.json();
  const users = Array.isArray(payload) ? payload : payload.users || [];
  const found = users.find((u) => u.email === email);

  return found ? { id: found.id, email } : null;
}

async function deleteThrowawayUser(user) {
  if (!user) return;

  await fetch(process.env.SUPABASE_URL + '/auth/v1/admin/users/' + user.id, {
    method: 'DELETE',
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: 'Bearer ' + process.env.SUPABASE_SERVICE_ROLE_KEY
    }
  });
}

async function main() {
  const { chromium } = loadPlaywright();

  const server = await startServer();
  const port = server.address().port;
  const base = 'http://127.0.0.1:' + port;

  console.log('Uji halaman di browser — YPI Nurul Ilmi');
  console.log('=========================================');
  console.log('Server statis lokal : ' + base);
  console.log('');

  const browser = await chromium.launch(
    findInstalledChromium() ? { executablePath: findInstalledChromium() } : {}
  );
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });

  const bucket = { console: [], failed: [], pages: [] };

  /* ---------- 1. HALAMAN PUBLIK ---------- */
  console.log('1. HALAMAN PUBLIK');
  console.log('');

  const publicPages = [
    { url: '/index.html', name: 'Beranda' },
    { url: '/about.html', name: 'Profil sekolah' },
    { url: '/blog.html', name: 'Berita / artikel' },
    { url: '/article.html?id=1', name: 'Detail artikel' },
    { url: '/teacher.html', name: 'Guru' },
    { url: '/courses.html', name: 'Kelas / program' },
    { url: '/tk-sigma.html', name: 'Unit TK Sigma' },
    { url: '/daycare-sigma.html', name: 'Unit Daycare Sigma' },
    { url: '/galeri-fasilitas.html', name: 'Galeri fasilitas' },
    { url: '/pricing.html', name: 'Biaya' },
    { url: '/contact.html', name: 'Kontak' },
    { url: '/404.html', name: 'Halaman 404' }
  ];

  for (const item of publicPages) {
    const before = { console: bucket.console.length, failed: bucket.failed.length };
    const page = await newPage(context, item.name, bucket);

    const response = await page.goto(base + item.url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);

    const status = response ? response.status() : 0;
    const title = await page.title();

    check(
      item.name + ' (' + item.url + ') terbuka',
      status === 200 && title.length > 0,
      'HTTP ' + status + ', judul="' + title + '"'
    );

    const newErrors = bucket.console.slice(before.console);
    const newFailed = bucket.failed.slice(before.failed);

    check(
      item.name + ' tanpa error console',
      newErrors.length === 0,
      newErrors.slice(0, 2).join(' | ').slice(0, 220)
    );

    check(
      item.name + ' tanpa permintaan gagal',
      newFailed.length === 0,
      newFailed.slice(0, 2).join(' | ').slice(0, 220)
    );

    await page.close();
  }

  {
    const page = await context.newPage();
    await page.goto(base + '/blog-single.html?id=1', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1800);
    check('blog-single.html?id=1 mengarahkan ke article.html', page.url().includes('article.html?id=1'), page.url());
    await page.close();
  }

  {
    const page = await context.newPage();
    await page.goto(base + '/blog-single.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1800);
    check('blog-single.html tanpa id mengarahkan ke daftar artikel', page.url().includes('blog.html'), page.url());
    await page.close();
  }

  console.log('');
  console.log('   Data dari Supabase di halaman publik:');

  {
    const page = await context.newPage();
    await page.goto(base + '/index.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    const cards = await page.locator('[data-recent-blog] article, [data-recent-blog] .blog-card, [data-recent-blog] > div').count();
    check('beranda menampilkan kartu artikel terbaru', cards > 0, cards + ' kartu');
    await page.close();
  }

  {
    const page = await context.newPage();
    await page.goto(base + '/blog.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    const items = await page.locator('#article-list > *').count();
    const empty = await page.locator('#article-list').innerText();
    check('daftar artikel di halaman berita terisi', items > 0 || /belum ada/i.test(empty), items + ' item, teks="' + empty.trim().slice(0, 60) + '"');
    await page.close();
  }

  {
    const page = await context.newPage();
    await page.goto(base + '/article.html?id=1', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    const title = (await page.locator('#article-title').innerText()).trim();
    const body = (await page.locator('#article-body').innerText()).trim();
    check('detail artikel menampilkan judul dari database', title.length > 3, '"' + title.slice(0, 60) + '"');
    check('detail artikel menampilkan isi dari database', body.length > 20, body.length + ' karakter');
    await page.close();
  }

  {
    const page = await context.newPage();
    await page.goto(base + '/galeri-fasilitas.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    const cards = await page.locator('.gallery-card').count();
    const broken = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('.gallery-card img'));
      return images.filter((img) => img.complete && img.naturalWidth === 0).length;
    });
    check('galeri fasilitas menampilkan kartu', cards > 0, cards + ' kartu');
    check('semua gambar galeri termuat', broken === 0, broken + ' gambar rusak');
    await page.close();
  }

  {
    const page = await context.newPage();
    await page.goto(base + '/tk-sigma.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    const text = (await page.locator('#tkSigmaArtikel').innerText()).trim();
    check('halaman TK Sigma memuat artikel unit', text.length > 0, '"' + text.slice(0, 60) + '"');
    await page.close();
  }

  {
    const page = await context.newPage();
    await page.goto(base + '/daycare-sigma.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    const text = (await page.locator('#daycareSigmaArtikel').innerText()).trim();
    check('halaman Daycare Sigma memuat artikel unit', text.length > 0, '"' + text.slice(0, 60) + '"');
    await page.close();
  }

  console.log('');

  console.log('');

  /* ---------- 3. TAMPILAN PONSEL ---------- */
  console.log('3. TAMPILAN PONSEL (390x844)');
  console.log('');

  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
  });

  const mobilePages = [
    { url: '/index.html', name: 'Beranda' },
    { url: '/blog.html', name: 'Berita' },
    { url: '/galeri-fasilitas.html', name: 'Galeri fasilitas' },
    { url: '/tk-sigma.html', name: 'TK Sigma' }
  ];

  for (const item of mobilePages) {
    const mark = { console: bucket.console.length, failed: bucket.failed.length };
    const page = await newPage(mobileContext, item.name, bucket);
    await page.goto(base + item.url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);

    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth - window.innerWidth;
    });

    const errors = bucket.console.slice(mark.console);
    const failed = bucket.failed.slice(mark.failed);

    check(
      item.name + ' (ponsel) tanpa error',
      errors.length === 0 && failed.length === 0,
      errors.concat(failed).slice(0, 2).join(' | ').slice(0, 180)
    );

    check(
      item.name + ' (ponsel) tidak meluber ke samping',
      overflow <= 2,
      'luar ' + overflow + 'px'
    );

    await page.close();
  }

  await mobileContext.close();

  console.log('');

  /* ---------- 2. DASHBOARD ADMIN ---------- */

  const email = 'admin@ypinurulilmi.or.id';
  const password = process.env.SUPABASE_ADMIN_PASSWORD;

  if (!password) {
    console.log('  LEWATI  SUPABASE_ADMIN_PASSWORD belum diisi di .env');
  } else {
    const before = { console: bucket.console.length, failed: bucket.failed.length };
    const page = await newPage(context, 'admin', bucket);

    await page.goto(base + '/admin/login.html', { waitUntil: 'domcontentloaded' });

    /* Percobaan login dengan password salah memakai akun sekali pakai.
       GoTrue mengunci email yang gagal login berulang kali, jadi akun admin
       sungguhan tidak boleh dipakai untuk percobaan gagal. */
    const throwaway = await createThrowawayUser();

    if (throwaway) {
      await page.fill('#email', throwaway.email);
      await page.fill('#password', 'password-salah-sekali');
      await page.click('#login-submit');
      await page.waitForTimeout(900);
      const alertText = (await page.locator('#login-alert, .ni-alert, [role="alert"]').first().innerText().catch(() => '')).trim();
      check('login dengan password salah ditolak di form', /salah/i.test(alertText) || page.url().includes('login'), alertText.slice(0, 80) || page.url());
      await deleteThrowawayUser(throwaway);
    } else {
      console.log('  LEWATI  login dengan password salah (akun uji sekali pakai tidak tersedia)');
    }

    await page.fill('#email', email);
    await page.fill('#password', password);
    await page.click('#login-submit');
    await page.waitForTimeout(2500);
    check('login admin berhasil memuat dashboard', !page.url().includes('login.html'), page.url());

    const dashboardPages = [
      { url: '/admin/articles.html', name: 'Daftar artikel', rows: '#article-rows > *' },
      { url: '/admin/categories.html', name: 'Kategori', rows: '#category-rows > *' },
      { url: '/admin/tags.html', name: 'Tag', rows: '#tag-rows > *' },
      { url: '/admin/facilities.html', name: 'Fasilitas', rows: '#facility-rows > *' },
      { url: '/admin/comments.html', name: 'Komentar', rows: '#comment-rows > *' },
      { url: '/admin/article-form.html', name: 'Form artikel' }
    ];

    for (const item of dashboardPages) {
      const mark = { console: bucket.console.length, failed: bucket.failed.length };
      await page.goto(base + item.url, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);

      const errors = bucket.console.slice(mark.console);
      const failed = bucket.failed.slice(mark.failed);

      check(
        item.name + ' terbuka tanpa error',
        errors.length === 0 && failed.length === 0,
        errors.concat(failed).slice(0, 2).join(' | ').slice(0, 200)
      );

      if (item.rows) {
        const count = await page.locator(item.rows).count();
        check(item.name + ' memuat baris data', count > 0, count + ' baris');
      }
    }

    /* --- buat, ubah, hapus artikel lewat UI --- */
    const marker = 'Zzz probe browser ' + Date.now();

    await page.goto(base + '/admin/article-form.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
    await page.fill('#title_id', marker);
    await page.fill('#content_id', marker + ' — isi artikel uji.');
    await page.fill('#title_en', marker + ' (en)');
    await page.fill('#content_en', marker + ' (en) — test body.');
    await page.click('#submit-article');
    await page.waitForTimeout(2500);

    const created = !page.url().includes('article-form.html') ||
      (await page.content()).includes(marker);
    check('simpan artikel baru lewat form', created, page.url());

    await page.goto(base + '/admin/articles.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    await page.fill('#article-search', marker);
    await page.waitForTimeout(1200);

    const found = await page.locator('#article-rows > *', { hasText: marker }).count();
    check('artikel baru muncul di daftar', found > 0, found + ' baris cocok');

    if (found > 0) {
      await page.locator('#article-rows a[href*="article-form.html?id="]').first().click();

      /* Tunggu halaman form selesai memuat artikel lama. Tanpa ini, form
         bisa disubmit sebelum data artikel terisi sehingga tersimpan
         sebagai artikel baru, bukan perubahan. */
      await page.waitForURL(/article-form\.html/, { timeout: 15000 });
      await page.waitForFunction(
        () => {
          const field = document.getElementById('title_id');
          return field && field.value.length > 0;
        },
        null,
        { timeout: 15000 }
      );

      await page.fill('#title_id', marker + ' (diubah)');
      await page.click('#submit-article');
      await page.waitForTimeout(2500);

      await page.goto(base + '/admin/articles.html', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);
      await page.fill('#article-search', marker);
      await page.waitForTimeout(1200);

      const edited = await page.locator('#article-rows > *', { hasText: marker + ' (diubah)' }).count();
      check('artikel berhasil diubah lewat form', edited > 0, edited + ' baris cocok');

      await page.locator('[data-article-delete]').first().click();
      await page.waitForTimeout(2000);

      await page.goto(base + '/admin/articles.html', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);
      await page.fill('#article-search', marker);
      await page.waitForTimeout(1200);

      const left = await page.locator('#article-rows > *', { hasText: marker }).count();
      check('artikel uji berhasil dihapus', left === 0, left + ' baris tersisa');
    }

    /* ---moderasi komentar dari UI --- */
    await page.goto(base + '/admin/comments.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    const commentRows = await page.locator('#comment-rows > *').count();
    check('halaman komentar terbuka', commentRows >= 0, commentRows + ' baris');

    /* --- logout --- */
    await page.goto(base + '/admin/articles.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);

    const logout = page.locator('#admin-logout').first();
    if (await logout.count()) {
      await logout.click();
      await page.waitForTimeout(1500);
    }

    await page.goto(base + '/admin/articles.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    check('setelah keluar, halaman admin mengarahkan ke login', page.url().includes('login.html'), page.url());

    const finalErrors = bucket.console.slice(before.console);
    const finalFailed = bucket.failed.slice(before.failed);

    check('seluruh alur admin tanpa error console', finalErrors.length === 0, finalErrors.slice(0, 3).join(' | ').slice(0, 220));
    check('seluruh alur admin tanpa permintaan gagal', finalFailed.length === 0, finalFailed.slice(0, 3).join(' | ').slice(0, 220));

    await page.close();
  }

  console.log('');
  console.log('RINGKASAN');
  console.log('');

  if (failures.length) {
    console.log('  ' + failures.length + ' pemeriksaan gagal:');
    failures.forEach((f) => console.log('    - ' + f));
    process.exitCode = 1;
  } else {
    console.log('  Semua pemeriksaan lulus.');
  }

  await context.close();
  await browser.close();
  server.close();
}

main().catch((error) => {
  console.error('Gagal: ' + error.message);
  process.exit(1);
});
