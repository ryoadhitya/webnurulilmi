/* ==========================================================================
   UJI BROWSER — BALASAN KOMENTAR
   --------------------------------------------------------------------------
   Menguji fitur balas (reply) pada halaman artikel:

     1. Balasan tersimpan di database lewat RPC submit_comment dengan
        p_parent_id.
     2. Balasan ditolak kalau induknya tidak ada.
     3. Hanya satu tingkat balasan (balasan tidak bisa dibalas lagi).
     4. Balasan tampil di bawah induknya di halaman artikel.
     5. Tombol "Balas" hanya ada pada komentar utama.
     6. Mengklik "Balas" memunculkan info balasan dan mengarahkan kursor
        ke kolom komentar.
     7. Balasan yang dikirim dari form tersimpan dan langsung tampil.
     8. Moderasi tetap bekerja: ketika induknya disembunyikan admin,
        balasannya ikut disembunyikan.
     9. Pengunjung tetap tidak bisa menulis kolom komentar secara langsung.

   Semua komentar uji dihapus di akhir.

   Jalankan:
     node scripts/test-komentar-balasan.mjs
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

const ANON_KEY = process.env.SUPABASE_ANON_KEY;
const ART = 98;
const NAMA = 'Uji Balasan Otomatis';

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

function anonHeaders(extra) {
  return Object.assign({
    apikey: ANON_KEY,
    Authorization: 'Bearer ' + ANON_KEY
  }, extra || {});
}

async function serviceGet(pathname) {
  const response = await fetch(process.env.SUPABASE_URL + '/rest/v1/' + pathname, {
    headers: serviceHeaders()
  });

  return response.json();
}

async function rpcAsAnon(payload) {
  const response = await fetch(process.env.SUPABASE_URL + '/rest/v1/rpc/submit_comment', {
    method: 'POST',
    headers: anonHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload)
  });

  const text = await response.text();

  return { status: response.status, ok: response.ok, body: text };
}

async function main() {
  const server = await startServer();
  const base = 'http://127.0.0.1:' + server.address().port;

  console.log('Uji balasan komentar — YPI Nurul Ilmi');
  console.log('====================================');
  console.log('');

  const executablePath = findInstalledChromium();

  const browser = await chromium.launch(executablePath ? { executablePath } : {});
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleErrors = [];

  page.on('pageerror', (error) => consoleErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  let indukId = null;
  let artikelLainId = null;

  /* Baris rate limit yang sudah ada sebelum tes (dibandingkan saat pembersihan). */
  let rateLimitAwal = [];

  try {
    const existing = await serviceGet('comment_rate_limits?select=id');
    rateLimitAwal = Array.isArray(existing) ? existing.map((row) => row.id) : [];

    /* ---------------------------------------------------------------- */
    /*  1. Komentar induk                                               */
    /* ---------------------------------------------------------------- */
    console.log('== Komentar induk ==');

    const induk = await rpcAsAnon({
      p_article_id: ART,
      p_name: NAMA,
      p_email: null,
      p_comment: 'Komentar induk untuk menguji fitur balasan.',
      p_hp: null,
      p_parent_id: null
    });

    indukId = Number(induk.body);

    check('1. komentar induk tersimpan', induk.ok && indukId > 0, 'id=' + induk.body);

    /* ---------------------------------------------------------------- */
    /*  2. Balasan tersimpan                                            */
    /* ---------------------------------------------------------------- */
    console.log('');
    console.log('== Balasan ==');

    const balasan = await rpcAsAnon({
      p_article_id: ART,
      p_name: NAMA,
      p_email: null,
      p_comment: 'Ini adalah balasan dari komentar induk.',
      p_hp: null,
      p_parent_id: indukId
    });

    const balasanId = Number(balasan.body);

    check('2. balasan tersimpan', balasan.ok && balasanId > 0, 'id=' + balasan.body);

    const baris = await serviceGet(
      'comments?select=id,article_id,status,parent_id&name=eq.' + encodeURIComponent(NAMA) + '&order=id'
    );

    const barisBalasan = (Array.isArray(baris) ? baris : []).filter((row) => row.id === balasanId)[0];

    check('2b. balasan menunjuk ke induknya',
      Boolean(barisBalasan) && Number(barisBalasan.parent_id) === indukId,
      barisBalasan ? 'parent_id=' + barisBalasan.parent_id : 'baris tidak ditemukan');

    check('2c. balasan terikat ke artikel yang sama',
      Boolean(barisBalasan) && barisBalasan.article_id === ART,
      barisBalasan ? 'article_id=' + barisBalasan.article_id : '-');

    check('2d. balasan ikut tayang (published)',
      Boolean(barisBalasan) && barisBalasan.status === 'published',
      barisBalasan ? 'status=' + barisBalasan.status : '-');

    /* ---------------------------------------------------------------- */
    /*  3. Validasi balasan                                             */
    /* ---------------------------------------------------------------- */
    console.log('');
    console.log('== Validasi ==');

    /* Artikel dan komentar sementara di artikel lain, untuk memastikan
       balasan dari artikel berbeda ditolak. Keduanya dihapus di akhir. */
    const artikelLain = await fetch(process.env.SUPABASE_URL + '/rest/v1/articles', {
      method: 'POST',
      headers: serviceHeaders({
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      }),
      body: JSON.stringify({
        title_id: NAMA + ' Artikel Lain',
        content_id: 'Artikel sementara untuk menguji validasi balasan.',
        status: 'published',
        published_at: new Date().toISOString()
      })
    });

    const artikelLainRows = await artikelLain.json();
    artikelLainId = Array.isArray(artikelLainRows) ? artikelLainRows[0].id : null;

    const komentarLain = await fetch(process.env.SUPABASE_URL + '/rest/v1/comments', {
      method: 'POST',
      headers: serviceHeaders({
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      }),
      body: JSON.stringify({
        article_id: artikelLainId,
        name: NAMA,
        comment: 'Komentar pada artikel lain.',
        status: 'published'
      })
    });

    const komentarLainRows = await komentarLain.json();
    const komentarLainId = Array.isArray(komentarLainRows) ? komentarLainRows[0].id : null;

    check('3a. data sementara siap', Boolean(artikelLainId && komentarLainId),
      'artikel=' + artikelLainId + ', komentar=' + komentarLainId);

    const indukHantu = await rpcAsAnon({
      p_article_id: ART,
      p_name: NAMA,
      p_email: null,
      p_comment: 'Balasan ke komentar yang tidak ada.',
      p_hp: null,
      p_parent_id: 999999999
    });

    check('3. balasan ke induk yang tidak ada ditolak',
      !indukHantu.ok && /tidak tersedia/i.test(indukHantu.body),
      'HTTP ' + indukHantu.status);

    const balasanBalasan = await rpcAsAnon({
      p_article_id: ART,
      p_name: NAMA,
      p_email: null,
      p_comment: 'Balasan terhadap balasan (tidak boleh).',
      p_hp: null,
      p_parent_id: balasanId
    });

    check('3b. balasan hanya satu tingkat',
      !balasanBalasan.ok && /tidak tersedia/i.test(balasanBalasan.body),
      'HTTP ' + balasanBalasan.status);

    const salahArtikel = await rpcAsAnon({
      p_article_id: ART,
      p_name: NAMA,
      p_email: null,
      p_comment: 'Balasan ke komentar artikel lain.',
      p_hp: null,
      p_parent_id: komentarLainId
    });

    check('3c. balasan ke komentar artikel lain ditolak',
      !salahArtikel.ok && /tidak tersedia/i.test(salahArtikel.body),
      'HTTP ' + salahArtikel.status + ' ' + salahArtikel.body.replace(/\s+/g, ' ').slice(0, 70));

    /* ---------------------------------------------------------------- */
    /*  4. Tampilan di halaman artikel                                  */
    /* ---------------------------------------------------------------- */
    console.log('');
    console.log('== Tampilan di website ==');

    await page.goto(base + '/article.html?id=' + ART, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);

    const tampilan = await page.evaluate(() => {
      const list = document.getElementById('comment-list');
      const items = Array.from(list.querySelectorAll('li.comment'));

      const balasan = items.filter((item) => item.classList.contains('comment--reply'));
      const utama = items.filter((item) => !item.classList.contains('comment--reply'));

      const indukItem = utama.find((item) =>
        (item.textContent || '').includes('Komentar induk untuk menguji fitur balasan.')
      );

      return {
        total: items.length,
        jumlahBalasan: balasan.length,
        jumlahUtama: utama.length,
        balasanDiBawahInduk: Boolean(indukItem && indukItem.nextElementSibling &&
          indukItem.nextElementSibling.classList.contains('comment--reply')),
        tombolBalasDiUtama: utama.filter((item) => item.querySelector('.comment-reply')).length,
        tombolBalasDiBalasan: balasan.filter((item) => item.querySelector('.comment-reply')).length,
        teksBalasan: (balasan[0] || {}).textContent || ''
      };
    });

    check('4. balasan tampil di halaman artikel', tampilan.jumlahBalasan >= 1,
      'balasan=' + tampilan.jumlahBalasan);

    check('4b. balasan berada tepat di bawah induknya', tampilan.balasanDiBawahInduk);

    check('4c. tombol balas hanya ada di komentar utama',
      tampilan.tombolBalasDiUtama >= 1 && tampilan.tombolBalasDiBalasan === 0,
      'utama=' + tampilan.tombolBalasDiUtama + ', balasan=' + tampilan.tombolBalasDiBalasan);

    check('4d. isi balasan sesuai', /balasan dari komentar induk/i.test(tampilan.teksBalasan));

    /* ---------------------------------------------------------------- */
    /*  5. Tombol balas di halaman                                      */
    /* ---------------------------------------------------------------- */
    console.log('');
    console.log('== Tombol balas ==');

    await page.click('#comment-list .comment-reply');
    await page.waitForTimeout(600);

    const modeBalas = await page.evaluate(() => {
      const bar = document.getElementById('comment-reply-bar');
      const name = document.getElementById('comment-reply-name');
      const pesan = document.getElementById('comment-message');

      return {
        barTerlihat: Boolean(bar) && !bar.hidden,
        nama: name ? name.textContent.trim() : '',
        fokusDiPesan: document.activeElement === pesan
      };
    });

    check('5. info balasan muncul', modeBalas.barTerlihat);
    check('5b. nama komentar induk tampil di info balasan',
      modeBalas.nama === NAMA, modeBalas.nama);
    check('5c. kursor diarahkan ke kolom komentar', modeBalas.fokusDiPesan);

    /* ---------------------------------------------------------------- */
    /*  6. Balasan dari form                                            */
    /* ---------------------------------------------------------------- */
    console.log('');
    console.log('== Balasan dari form ==');

    const isiBalasan = 'Balasan yang dikirim lewat tombol balas ' + Date.now();

    await page.fill('#comment-name', NAMA);
    await page.fill('#comment-message', isiBalasan);
    await page.click('#comment-submit');
    await page.waitForTimeout(3000);

    const alert = await page.locator('#comment-alert').innerText().catch(() => '');

    check('6. balasan dari form terkirim',
      /balasan/i.test(alert), alert.replace(/\s+/g, ' ').trim().slice(0, 80));

    const barisBaru = await serviceGet(
      'comments?select=id,parent_id,comment&comment=eq.' + encodeURIComponent(isiBalasan)
    );

    const barisBalasanBaru = (Array.isArray(barisBaru) ? barisBaru : [])[0];

    check('6b. balasan dari form tersimpan di database',
      Boolean(barisBalasanBaru), barisBalasanBaru ? 'id=' + barisBalasanBaru.id : 'tidak ditemukan');

    check('6c. balasan dari form tertaut ke induknya',
      Boolean(barisBalasanBaru) && Number(barisBalasanBaru.parent_id) === indukId,
      barisBalasanBaru ? 'parent_id=' + barisBalasanBaru.parent_id : '-');

    const setelahKirim = await page.evaluate(() => {
      const balasan = Array.from(document.querySelectorAll('#comment-list li.comment--reply'));

      return {
        jumlah: balasan.length,
        ada: balasan.some((item) => (item.textContent || '').includes('Balasan yang dikirim lewat tombol balas')),
        barTersembunyi: document.getElementById('comment-reply-bar').hidden
      };
    });

    check('6d. balasan langsung tampil tanpa refresh', setelahKirim.ada,
      'jumlah balasan=' + setelahKirim.jumlah);

    check('6e. mode balasan ditutup setelah mengirim', setelahKirim.barTersembunyi);

    /* ---------------------------------------------------------------- */
    /*  7. Moderasi tetap bekerja                                       */
    /* ---------------------------------------------------------------- */
    console.log('');
    console.log('== Moderasi ==');

    await fetch(
      process.env.SUPABASE_URL + '/rest/v1/comments?id=eq.' + indukId,
      {
        method: 'PATCH',
        headers: serviceHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ status: 'spam' })
      }
    );

    await page.goto(base + '/article.html?id=' + ART, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);

    const setelahModerasi = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('#comment-list li.comment'));

      return {
        jumlah: items.length,
        masihAdaBalasan: items.filter((item) => item.classList.contains('comment--reply')).length
      };
    });

    check('7. balasan ikut tersembunyi saat induknya disembunyikan',
      setelahModerasi.masihAdaBalasan === 0,
      'balasan yang tampil=' + setelahModerasi.masihAdaBalasan);

    /* ---------------------------------------------------------------- */
    /*  8. Pengunjung tidak bisa menulis langsung                       */
    /* ---------------------------------------------------------------- */
    console.log('');
    console.log('== Keamanan ==');

    const disisipkan = await fetch(process.env.SUPABASE_URL + '/rest/v1/comments', {
      method: 'POST',
      headers: anonHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        article_id: ART,
        name: NAMA,
        comment: 'Disisipkan langsung tanpa RPC.',
        status: 'published',
        parent_id: indukId
      })
    });

    check('8. pengunjung tidak bisa menyisipkan balasan langsung',
      !disisipkan.ok, 'HTTP ' + disisipkan.status);
  } finally {
    /* ---------------------------------------------------------------- */
    /*  Pembersihan                                                      */
    /* ---------------------------------------------------------------- */
    console.log('');
    console.log('== Pembersihan ==');

    const sisa = await serviceGet('comments?select=id&name=eq.' + encodeURIComponent(NAMA));

    if (Array.isArray(sisa) && sisa.length) {
      await fetch(
        process.env.SUPABASE_URL + '/rest/v1/comments?id=in.(' + sisa.map((row) => row.id).join(',') + ')',
        { method: 'DELETE', headers: serviceHeaders() }
      );

      console.log('  Komentar uji dihapus: ' + sisa.length);
    } else {
      console.log('  Tidak ada komentar uji yang tertinggal.');
    }

    /* Artikel dan komentar sementara juga dibersihkan. */
    if (artikelLainId) {
      await fetch(process.env.SUPABASE_URL + '/rest/v1/articles?id=eq.' + artikelLainId, {
        method: 'DELETE',
        headers: serviceHeaders()
      });

      console.log('  Artikel sementara dihapus: ' + artikelLainId);
    }

    const errors = consoleErrors.filter((text) => !/Failed to load resource/i.test(text));

    check('9. tidak ada error JavaScript di konsol', errors.length === 0, errors.join(' | '));

    /* Baris rate limit ikut dibersihkan supaya tes berikutnya tidak
       ikut terbatas oleh 5 komentar per jam per IP. */
    const rateAkhir = await serviceGet('comment_rate_limits?select=id');
    const baru = (Array.isArray(rateAkhir) ? rateAkhir : [])
      .filter((row) => rateLimitAwal.indexOf(row.id) === -1);

    if (baru.length) {
      await fetch(
        process.env.SUPABASE_URL + '/rest/v1/comment_rate_limits?id=in.(' + baru.map((row) => row.id).join(',') + ')',
        { method: 'DELETE', headers: serviceHeaders() }
      );

      console.log('  Baris rate limit uji dihapus: ' + baru.length);
    }

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
