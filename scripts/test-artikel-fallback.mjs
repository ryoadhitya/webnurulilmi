/* ==========================================================================
   UJI BROWSER — GAMBAR UTAMA ARTIKEL (DAN FALLBACK)
   --------------------------------------------------------------------------
   Menguji tampilan gambar utama pada halaman artikel:

     1. Artikel yang punya gambar tetap menampilkan gambar utama seperti
        sebelumnya (tidak berubah karena penambahan fallback).
     2. Artikel yang memakai kolom image tetap menampilkan gambar utama.
     3. Artikel tanpa gambar sama sekali tidak menampilkan kotak kosong:
        tampil plakat YPI Nurul Ilmi yang rapi.
     4. Plakat fallback memuat logo resmi dan teks yang jelas.
     5. Halaman tetap rapi di ponsel.

   Artikel uji dibuat dan dihapus kembali setelah selesai.

   Jalankan:
     node scripts/test-artikel-fallback.mjs
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
const globalRoot = execSync('npm root -g').toString().trim();
const { chromium } = require(path.join(globalRoot, 'playwright'));

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8', '.jpg': 'image/jpeg',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.webm': 'video/webm',
  '.mp4': 'video/mp4', '.ico': 'image/x-icon'
};

const ARTIKEL_LAMA = 98;
const PATH_GAMBAR = 'sd-nurul-ilmi/artikel/e1c91183-de6e-4d57-9ab7-e569e6ccc038.png';

let lulus = 0;
let gagal = 0;

function check(label, condition, detail) {
  if (condition) {
    lulus += 1;
    console.log('  OK   ' + label + (detail ? '  ' + detail : ''));
  } else {
    gagal += 1;
    console.log('  GAGAL ' + label + (detail ? '  ' + detail : ''));
  }
}

function findInstalledChromium() {
  const base = path.join(
    process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'),
    'ms-playwright'
  );

  if (!fs.existsSync(base)) return null;

  const candidates = [];

  fs.readdirSync(base).forEach((entry) => {
    if (!/^chromium/i.test(entry)) return;

    for (const relative of [
      ['chrome-headless-shell-win64', 'chrome-headless-shell.exe'],
      ['chrome-win64', 'chrome.exe']
    ]) {
      const file = path.join(base, entry, relative[0], relative[1]);

      if (fs.existsSync(file)) candidates.push(file);
    }
  });

  if (!candidates.length) return null;

  candidates.sort((a, b) => (a.includes('headless-shell') ? -1 : 1));

  return candidates[0];
}

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent(req.url.split('?')[0]);
      let filePath = path.join(ROOT, urlPath);

      if (filePath.startsWith(ROOT) && fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }

      if (!filePath.startsWith(ROOT) || !fs.existsSync(filePath)) {
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

function serviceHeaders(extra) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  return Object.assign({ apikey: key, Authorization: 'Bearer ' + key }, extra || {});
}

async function buatArtikel(data) {
  const response = await fetch(process.env.SUPABASE_URL + '/rest/v1/articles', {
    method: 'POST',
    headers: serviceHeaders({
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    }),
    body: JSON.stringify(data)
  });

  const rows = await response.json();

  return Array.isArray(rows) ? rows[0].id : null;
}

async function hapusArtikel(id) {
  if (!id) return;

  await fetch(process.env.SUPABASE_URL + '/rest/v1/articles?id=eq.' + id, {
    method: 'DELETE',
    headers: serviceHeaders()
  });
}

async function main() {
  const server = await startServer();
  const base = 'http://127.0.0.1:' + server.address().port;

  console.log('Uji gambar utama artikel — YPI Nurul Ilmi');
  console.log('========================================');
  console.log('');

  const executablePath = findInstalledChromium();

  const browser = await chromium.launch(executablePath ? { executablePath } : {});
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const consoleErrors = [];

  page.on('pageerror', (error) => consoleErrors.push(error.message));

  let idTanpaGambar = null;
  let idDenganGambar = null;

  try {
    /* ---------------------------------------------------------------- */
    /*  1. Artikel lama (punya media) tetap normal                     */
    /* ---------------------------------------------------------------- */
    console.log('== Artikel yang sudah punya gambar ==');

    await page.goto(base + '/article.html?id=' + ARTIKEL_LAMA, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);

    const lama = await page.evaluate(() => {
      const figure = document.getElementById('article-featured');

      return {
        tersembunyi: figure ? figure.hidden : true,
        adaGambar: Boolean(document.querySelector('#article-featured .article-featured-image')),
        adaPlakat: Boolean(document.querySelector('#article-featured .article-featured-placeholder'))
      };
    });

    check('1. gambar utama artikel lama tetap tampil',
      !lama.tersembunyi && lama.adaGambar && !lama.adaPlakat,
      JSON.stringify(lama));

    /* ---------------------------------------------------------------- */
    /*  2. Artikel dengan kolom image                                   */
    /* ---------------------------------------------------------------- */
    console.log('');
    console.log('== Artikel dengan kolom image ==');

    idDenganGambar = await buatArtikel({
      title_id: 'Uji Gambar Utama Kolom Image',
      content_id: 'Artikel uji untuk memeriksa gambar utama dari kolom image.',
      image: PATH_GAMBAR,
      status: 'published',
      published_at: new Date().toISOString()
    });

    await page.goto(base + '/article.html?id=' + idDenganGambar, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);

    const denganGambar = await page.evaluate(() => {
      const figure = document.getElementById('article-featured');
      const img = document.querySelector('#article-featured .article-featured-image');

      return {
        tersembunyi: figure ? figure.hidden : true,
        adaGambar: Boolean(img),
        adaPlakat: Boolean(document.querySelector('#article-featured .article-featured-placeholder')),
        src: img ? img.getAttribute('src') : ''
      };
    });

    check('2. kolom image tetap dipakai sebagai gambar utama',
      !denganGambar.tersembunyi && denganGambar.adaGambar && !denganGambar.adaPlakat,
      denganGambar.src.slice(-46));

    /* ---------------------------------------------------------------- */
    /*  3. Artikel tanpa gambar -> plakat fallback                     */
    /* ---------------------------------------------------------------- */
    console.log('');
    console.log('== Artikel tanpa gambar ==');

    idTanpaGambar = await buatArtikel({
      title_id: 'Uji Artikel Tanpa Gambar',
      content_id: 'Artikel uji tanpa gambar untuk memeriksa tampilan cadangan.',
      status: 'published',
      published_at: new Date().toISOString()
    });

    await page.goto(base + '/article.html?id=' + idTanpaGambar, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);

    const tanpaGambar = await page.evaluate(() => {
      const figure = document.getElementById('article-featured');
      const plakat = document.querySelector('#article-featured .article-featured-placeholder');
      const logo = document.querySelector('#article-featured .article-featured-placeholder-logo');
      const judul = document.querySelector('#article-featured .article-featured-placeholder-title');
      const teks = document.querySelector('#article-featured .article-featured-placeholder-text');

      return {
        tersembunyi: figure ? figure.hidden : true,
        adaPlakat: Boolean(plakat),
        adaLogo: Boolean(logo),
        adaLogoYgMemuat: Boolean(logo && logo.getAttribute('src')),
        judul: judul ? judul.textContent.trim() : '',
        teks: teks ? teks.textContent.trim() : '',
        adaGambarUtama: Boolean(document.querySelector('#article-featured .article-featured-image')),
        lebar: plakat ? Math.round(plakat.getBoundingClientRect().width) : 0,
        tinggi: plakat ? Math.round(plakat.getBoundingClientRect().height) : 0
      };
    });

    check('3. artikel tanpa gambar tidak lagi kosong',
      !tanpaGambar.tersembunyi && tanpaGambar.adaPlakat && !tanpaGambar.adaGambarUtama,
      JSON.stringify({ plakat: tanpaGambar.adaPlakat, kosong: tanpaGambar.tersembunyi }));

    check('3b. plakat memuat logo resmi', tanpaGambar.adaLogo && tanpaGambar.adaLogoYgMemuat);

    check('3c. plakat punya judul dan teks yang jelas',
      tanpaGambar.judul === 'YPI Nurul Ilmi' && /gambar utama/i.test(tanpaGambar.teks),
      tanpaGambar.judul + ' / ' + tanpaGambar.teks);

    check('3d. plakat punya proporsi yang wajar',
      tanpaGambar.lebar > 200 && tanpaGambar.tinggi > 100,
      tanpaGambar.lebar + 'x' + tanpaGambar.tinggi);

    /* ---------------------------------------------------------------- */
    /*  4. Tampilan di ponsel                                           */
    /* ---------------------------------------------------------------- */
    console.log('');
    console.log('== Tampilan di ponsel ==');

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(base + '/article.html?id=' + idTanpaGambar, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const ponsel = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      adaPlakat: Boolean(document.querySelector('#article-featured .article-featured-placeholder'))
    }));

    check('4. plaket tetap tampil di ponsel', ponsel.adaPlakat);
    check('4b. tidak ada overflow horizontal di ponsel', !ponsel.overflow);

    /* Tangkapan layar untuk pemeriksaan visual. */
    const shots = path.join(ROOT, 'docs', 'qc');

    if (!fs.existsSync(shots)) fs.mkdirSync(shots, { recursive: true });

    await page.locator('#article-featured').first()
      .screenshot({ path: path.join(shots, 'artikel-fallback-mobile.png') });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(base + '/article.html?id=' + idTanpaGambar, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    await page.locator('#article-featured').first()
      .screenshot({ path: path.join(shots, 'artikel-fallback-desktop.png') });
  } finally {
    console.log('');
    console.log('== Pembersihan ==');

    await hapusArtikel(idTanpaGambar);
    await hapusArtikel(idDenganGambar);

    console.log('  Artikel uji dihapus: ' + [idTanpaGambar, idDenganGambar].filter(Boolean).length);

    const errors = consoleErrors.filter((text) => !/Failed to load resource/i.test(text));

    check('5. tidak ada error JavaScript di konsol', errors.length === 0, errors.join(' | '));

    await browser.close();
    server.close();
  }

  console.log('');
  console.log('RINGKASAN');
  console.log('---------');
  console.log('  lulus: ' + lulus + ', gagal: ' + gagal);

  if (gagal) process.exitCode = 1;
}

main().catch((error) => {
  console.error('Gagal menjalankan tes: ' + error.message);
  process.exitCode = 1;
});
