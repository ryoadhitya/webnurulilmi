/* ==========================================================================
   UJI KOMENTAR PUBLIK — YPI NURUL ILMI
   --------------------------------------------------------------------------
   Menguji alur komentar untuk pengunjung yang TIDAK login:

     1. Pengunjung tanpa login dapat membuka artikel published
     2. Pengunjung dapat mengirim komentar
     3. Komentar tersimpan di Supabase
     4. Komentar yang diizinkan tampil di artikel yang benar
     5. Komentar tidak muncul pada artikel lain
     6. Pengunjung tidak bisa mengomentari artikel draft
     7. Pengunjung tidak bisa mengubah atau menghapus komentar
     8. Validasi input berjalan
     9. Perlindungan XSS dan honeypot (spam) berjalan
    10. Jumlah komentar diperbarui dengan benar

   Semua komentar uji dihapus di akhir.

   Catatan: sejak migrasi 000400 komentar publik langsung berstatus
   'published' (moderasi tetap bisa dipakai dari dashboard). Jadi email
   tidak lagi menjadi field wajib di form.

   Jalankan:
     node scripts/test-komentar-publik.mjs
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

const ANON_KEY = 'sb_publishable_o5OtfzuAfhwHvbwPGwSx3A_cAFE6Tab';
const ART_UTAMA = 98;
const ART_LAIN = 1;
const ART_DRAFT = 3;
const MARKER = 'Uji Pengunjung Komentar';

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

/* Chromium lokal (headless shell) supaya tidak perlu mengunduh browser. */
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
      ['chrome-win64', 'chrome.exe']
    ]) {
      const file = path.join(base, entry, relative[0], relative[1]);

      if (fs.existsSync(file)) candidates.push(file);
    }
  }

  if (!candidates.length) return null;

  candidates.sort((a, b) => (a.includes('headless-shell') ? -1 : 1));

  return candidates[0];
}

function startServer() {  return new Promise((resolve) => {
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

async function commentRows(articleId) {
  const rows = await serviceGet(
    'comments?select=id,article_id,name,email,comment,status,created_at&article_id=eq.' +
    articleId + '&order=id'
  );

  return Array.isArray(rows) ? rows : [];
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

/* Row rate limit yang sudah ada sebelum tes (dibandingkan saat pembersihan). */
let rateLimitAwal = [];

/* Komentar yang sudah ada sebelum tes. Situs ini boleh sudah punya komentar
   asli dari pengunjung, jadi pemeriksaan jumlah memakai selisih dari kondisi
   awal, bukan menganggap tabel komentar kosong. */
let komentarAwal = [];
let komentarAwalPerArtikel = {};

async function main() {
  const server = await startServer();
  const base = 'http://127.0.0.1:' + server.address().port;

  console.log('Uji komentar publik — YPI Nurul Ilmi');
  console.log('====================================');
  console.log('Server statis lokal : ' + base);
  console.log('');

  const executablePath = findInstalledChromium();

  const existing = await serviceGet('comment_rate_limits?select=id');
  rateLimitAwal = Array.isArray(existing) ? existing.map((row) => row.id) : [];

  /* Rekam kondisi awal komentar supaya jumlah yang diuji bisa dihitung
     sebagai selisih (komentar asli pengunjung tidak boleh dianggap sisa uji). */
  const awal = await serviceGet('comments?select=id,article_id&order=id');
  komentarAwal = Array.isArray(awal) ? awal.map((row) => row.id) : [];

  komentarAwalPerArtikel = (Array.isArray(awal) ? awal : []).reduce(function (acc, row) {
    acc[row.article_id] = (acc[row.article_id] || 0) + 1;
    return acc;
  }, {});

  /* Bersihkan sisa probe sebelumnya. */
  const sisa = await serviceGet('comments?select=id&name=eq.' + encodeURIComponent('Pengunjung Uji'));
  if (Array.isArray(sisa) && sisa.length) {
    await fetch(process.env.SUPABASE_URL + '/rest/v1/comments?id=in.(' + sisa.map((r) => r.id).join(',') + ')', {
      method: 'DELETE',
      headers: serviceHeaders()
    });
  }

  const browser = await chromium.launch(
    executablePath ? { executablePath } : {}
  );
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleErrors = [];

  page.on('pageerror', (error) => consoleErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  /* ---------------------------------------------------------------- */
  /*  1. Pengunjung tanpa login dapat membuka artikel published        */
  /* ---------------------------------------------------------------- */
  await page.goto(base + '/article.html?id=' + ART_UTAMA, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  const judul = await page.locator('#article-title').innerText().catch(() => '');
  const adaForm = await page.locator('#comment-form').count();

  check('1. pengunjung tanpa login dapat membuka artikel published',
    judul.trim().length > 0 && adaForm === 1,
    'judul="' + judul.trim().slice(0, 40) + '", form=' + adaForm);

  const sesi = await page.evaluate(() => window.NISupabase && window.NISupabase.currentUser
    ? window.NISupabase.currentUser().then((user) => (user ? 'ada' : 'tidak ada'))
    : 'tidak ada');

  check('1b. pengunjung memang tanpa sesi login', sesi === 'tidak ada', 'sesi=' + sesi);

  /* ---------------------------------------------------------------- */
  /*  2. Pengunjung dapat mengirim komentar                          */
  /* ---------------------------------------------------------------- */
  const isiKomentar = MARKER + ' ' + Date.now();

  await page.fill('#comment-name', 'Uji Pengunjung Komentar');
  await page.fill('#comment-message', isiKomentar);
  await page.click('#comment-submit');
  await page.waitForTimeout(2500);

  const alert = await page.locator('#comment-alert').innerText().catch(() => '');

  check('2. pengunjung dapat mengirim komentar tanpa login',
    /tayang|berhasil|moderasi/i.test(alert),
    alert.replace(/\s+/g, ' ').trim().slice(0, 80));

  /* ---------------------------------------------------------------- */
  /*  3. Komentar tersimpan di Supabase                              */
  /* ---------------------------------------------------------------- */
  const tersimpan = (await commentRows(ART_UTAMA)).filter((row) => row.comment === isiKomentar);

  check('3. komentar tersimpan di Supabase',
    tersimpan.length === 1,
    tersimpan.length ? 'id=' + tersimpan[0].id + ', status=' + tersimpan[0].status : 'tidak ditemukan');

  check('3b. komentar baru langsung tayang (published)',
    tersimpan.length === 1 && tersimpan[0].status === 'published',
    tersimpan.length ? 'status=' + tersimpan[0].status : '-');

  check('3c. komentar punya tanggal kirim',
    tersimpan.length === 1 && Boolean(tersimpan[0].created_at),
    tersimpan.length ? 'created_at=' + tersimpan[0].created_at : '-');

  check('3d. komentar terikat ke artikel yang benar',
    tersimpan.length === 1 && tersimpan[0].article_id === ART_UTAMA,
    tersimpan.length ? 'article_id=' + tersimpan[0].article_id : '-');

  /* ---------------------------------------------------------------- */
  /*  4. Komentar yang diizinkan tampil di artikel yang benar        */
  /* ---------------------------------------------------------------- */
  if (tersimpan.length) {
    await fetch(
      process.env.SUPABASE_URL + '/rest/v1/comments?id=eq.' + tersimpan[0].id,
      { method: 'PATCH', headers: serviceHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ status: 'published' }) }
    );
  }

  await page.goto(base + '/article.html?id=' + ART_UTAMA, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  const tampilUtama = await page.locator('#comment-list li').count();
  const teksTampil = await page.locator('#comment-list').innerText().catch(() => '');

  const harapan = (komentarAwalPerArtikel[ART_UTAMA] || 0) + 1;

  check('4. komentar yang disetujui tampil di artikel yang benar',
    tampilUtama === harapan && teksTampil.includes(isiKomentar),
    'jumlah=' + tampilUtama + ' (harapan=' + harapan + ')');

  /* ---------------------------------------------------------------- */
  /*  5. Komentar tidak muncul pada artikel lain                     */
  /* ---------------------------------------------------------------- */
  await page.goto(base + '/article.html?id=' + ART_LAIN, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  const tampilLain = await page.locator('#comment-list li').count();
  const teksLain = await page.locator('#comment-list').innerText().catch(() => '');

  check('5. komentar tidak muncul pada artikel lain',
    tampilLain === (komentarAwalPerArtikel[ART_LAIN] || 0) && !teksLain.includes(isiKomentar),
    'jumlah=' + tampilLain);

  /* ---------------------------------------------------------------- */
  /*  6. Pengunjung tidak bisa mengomentari artikel draft            */
  /* ---------------------------------------------------------------- */
  const draft = await rpcAsAnon({
    p_article_id: ART_DRAFT,
    p_name: 'Uji Pengunjung Komentar',
    p_email: 'pengunjung@example.com',
    p_comment: 'Percobaan mengomentari artikel draft.',
    p_hp: '',
    p_parent_id: null
  });

  check('6. pengunjung tidak bisa mengomentari artikel draft',
    !draft.ok && /tidak ditemukan/i.test(draft.body),
    'HTTP ' + draft.status + ' ' + draft.body.replace(/\s+/g, ' ').slice(0, 70));

  /* ---------------------------------------------------------------- */
  /*  7. Pengunjung tidak bisa mengubah atau menghapus komentar      */
  /* ---------------------------------------------------------------- */
  const patched = await fetch(
    process.env.SUPABASE_URL + '/rest/v1/comments?id=eq.' + (tersimpan.length ? tersimpan[0].id : 0),
    { method: 'PATCH', headers: anonHeaders({ 'Content-Type': 'application/json', Prefer: 'return=representation' }),
      body: JSON.stringify({ comment: 'dirubah Oleh pengunjung' }) }
  );

  const patchedBody = await patched.json().catch(() => null);

  const deleted = await fetch(
    process.env.SUPABASE_URL + '/rest/v1/comments?id=eq.' + (tersimpan.length ? tersimpan[0].id : 0),
    { method: 'DELETE', headers: anonHeaders({ Prefer: 'return=representation' }) }
  );

  const deletedBody = await deleted.json().catch(() => null);

  const inserted = await fetch(process.env.SUPABASE_URL + '/rest/v1/comments', {
    method: 'POST',
    headers: anonHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      article_id: ART_UTAMA,
      name: 'Uji Pengunjung Komentar',
      comment: 'Disisipkan langsung tanpa RPC.',
      status: 'published'
    })
  });

  /* RLS menutup akses: permintaan ditolak atau tidak menyentuh baris apa pun. */
  const patchDitolak = !patched.ok || (Array.isArray(patchedBody) && patchedBody.length === 0);
  const deleteDitolak = !deleted.ok || (Array.isArray(deletedBody) && deletedBody.length === 0);

  check('7. pengunjung tidak bisa mengubah komentar', patchDitolak,
    'HTTP ' + patched.status + ', baris terpengaruh=' + (Array.isArray(patchedBody) ? patchedBody.length : '-'));
  check('7b. pengunjung tidak bisa menghapus komentar', deleteDitolak,
    'HTTP ' + deleted.status + ', baris terpengaruh=' + (Array.isArray(deletedBody) ? deletedBody.length : '-'));
  check('7c. pengunjung tidak bisa menyisipkan komentar langsung', !inserted.ok, 'HTTP ' + inserted.status);

  /* PostgREST menjawab 204 walau tidak ada baris yang terpengaruh, jadi
     yang menentukan benar/tidaknya penulisan adalah isi baris di server. */
  const setelahUpaya = (await commentRows(ART_UTAMA)).filter((row) =>
    tersimpan.length && row.id === tersimpan[0].id
  );

  check('7d. isi komentar asli utuh setelah percobaan diubah',
    setelahUpaya.length === 1 && setelahUpaya[0].comment === isiKomentar,
    setelahUpaya.length ? 'comment="' + String(setelahUpaya[0].comment).slice(0, 40) + '"' : 'baris hilang');

  check('7e. status komentar asli tidak diubah anonim',
    setelahUpaya.length === 1 && setelahUpaya[0].status === 'published',
    setelahUpaya.length ? 'status=' + setelahUpaya[0].status : '-');

  /* ---------------------------------------------------------------- */
  /*  8. Validasi input                                              */
  /* ---------------------------------------------------------------- */
  await page.goto(base + '/article.html?id=' + ART_UTAMA, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  await page.fill('#comment-name', 'A');
  await page.fill('#comment-message', 'ok');
  await page.click('#comment-submit');
  await page.waitForTimeout(800);

  const alertValidasi = await page.locator('#comment-alert').innerText().catch(() => '');

  check('8. validasi input di halaman berjalan',
    /minimal 2 karakter|komentar minimal/i.test(alertValidasi),
    alertValidasi.replace(/\s+/g, ' ').trim().slice(0, 80));

  const namaPendek = await rpcAsAnon({
    p_article_id: ART_UTAMA,
    p_name: 'A',
    p_email: 'pengunjung@example.com',
    p_comment: 'Komentar yang cukup panjang.',
    p_hp: '',
    p_parent_id: null
  });

  check('8b. server menolak nama terlalu pendek', !namaPendek.ok, 'HTTP ' + namaPendek.status);

  /* ---------------------------------------------------------------- */
  /*  9. XSS dan spam (honeypot)                                     */
  /* ---------------------------------------------------------------- */
  let dialogMuncul = false;

  page.on('dialog', async (dialog) => {
    dialogMuncul = true;
    await dialog.dismiss();
  });

  const xssPayload = '<script>window.__xss=1</script><img src=x onerror="window.__xss=2">';

  await page.fill('#comment-name', 'Uji XSS');
  await page.fill('#comment-message', xssPayload);
  await page.click('#comment-submit');
  await page.waitForTimeout(2500);

  const flagXss = await page.evaluate(() => Boolean(window.__xss));

  const barisXss = (await commentRows(ART_UTAMA)).filter((row) => row.comment === xssPayload);

  check('9. script pada komentar tidak dijalankan',
    !flagXss && !dialogMuncul,
    'flag=' + flagXss);

  check('9b. payload berbahaya disimpan apa adanya (escaping saat tampil)',
    barisXss.length === 1, 'baris=' + barisXss.length);

  await page.goto(base + '/article.html?id=' + ART_UTAMA, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  /* Diperiksa lewat DOM, bukan kemunculan teks mentah. Payload yang sudah
     di-escape tetap memuat tulisan "onerror=" sebagai teks biasa, jadi
     pencarian substring tidak bisa membedakan aman atau tidak. */
  const cekses = await page.evaluate(() => {
    const list = document.getElementById('comment-list');

    if (!list) return { adaScript: true, adaHandler: true, teks: '' };

    const adaScript = Boolean(list.querySelector('script'));

    const adaHandler = Array.prototype.some.call(list.querySelectorAll('*'), function (node) {
      return Array.prototype.some.call(node.attributes || [], function (attr) {
        return attr.name.toLowerCase().indexOf('on') === 0;
      });
    });

    return { adaScript: adaScript, adaHandler: adaHandler, teks: list.innerText };
  });

  check('9c. payload ditampilkan sebagai teks, bukan HTML',
    !cekses.adaScript && !cekses.adaHandler && cekses.teks.indexOf('<script>') !== -1,
    'script=' + cekses.adaScript + ', handler=' + cekses.adaHandler);

  /* Honeypot: field Website terisi -> bot tidak boleh membuat baris. */
  const sebelumHoney = (await commentRows(ART_UTAMA)).length;

  await page.evaluate(() => {
    const field = document.getElementById('comment-hp');
    if (field) field.value = 'https://spam.example.com';
  });

  await page.fill('#comment-name', 'Bot Spam');
  await page.fill('#comment-message', 'Komentar dari bot yang mengisi honeypot.');
  await page.click('#comment-submit');
  await page.waitForTimeout(2000);

  const sesudahHoney = (await commentRows(ART_UTAMA)).length;

  check('9d. honeypot menahan spam (tidak ada baris baru)',
    sesudahHoney === sebelumHoney, sebelumHoney + ' -> ' + sesudahHoney);

  /* ---------------------------------------------------------------- */
  /* 10. Jumlah komentar diperbarui                                 */
  /* ---------------------------------------------------------------- */
  const counter = await page.locator('#comment-count').innerText().catch(() => '');
  const jumlahTayang = (await commentRows(ART_UTAMA)).filter((row) => row.status === 'published').length;

  check('10. jumlah komentar di halaman detail sesuai',
    Number(counter) === jumlahTayang, 'counter=' + counter + ', tayang=' + jumlahTayang);

  await page.goto(base + '/blog.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  const kartu = await page.evaluate((marker) => {
    const cards = Array.from(document.querySelectorAll('#article-list .blog-entry'));
    const target = cards.find((node) => (node.textContent || '').includes(marker));

    if (!target) return null;

    const chat = target.querySelector('.meta-chat');

    return chat ? chat.textContent.trim() : '(tanpa meta-chat)';
  }, 'Upacara Bendera');

  check('10b. jumlah komentar pada kartu artikel ikut terupdate',
    kartu !== null && /\d/.test(kartu || ''), 'kartu="' + (kartu || '(tidak ada)') + '"');

  check('11. tidak ada error console di halaman komentar',
    consoleErrors.length === 0, consoleErrors.join(' | ').slice(0, 120));

  /* ---------------------------------------------------------------- */
  /*  Pembersihan                                                      */
  /* ---------------------------------------------------------------- */
  const uji = await serviceGet('comments?select=id&or=(name.eq.' + encodeURIComponent('Uji Pengunjung Komentar') +
    ',name.eq.Uji XSS,name.eq.Bot Spam,comment.like.' + encodeURIComponent(MARKER) + '%)');

  if (Array.isArray(uji) && uji.length) {
    await fetch(process.env.SUPABASE_URL + '/rest/v1/comments?id=in.(' + uji.map((row) => row.id).join(',') + ')', {
      method: 'DELETE',
      headers: serviceHeaders()
    });
  }

  const rateAkhir = await serviceGet('comment_rate_limits?select=id');
  const baru = (Array.isArray(rateAkhir) ? rateAkhir : [])
    .filter((row) => rateLimitAwal.indexOf(row.id) === -1);

  if (baru.length) {
    await fetch(process.env.SUPABASE_URL + '/rest/v1/comment_rate_limits?id=in.(' + baru.map((row) => row.id).join(',') + ')', {
      method: 'DELETE',
      headers: serviceHeaders()
    });
  }

  const sisaKomentar = await serviceGet('comments?select=id&order=id');

  /* Komentar asli pengunjung boleh tetap ada; yang dicek adalah tidak ada
     komentar baru yang dibuat tes ini yang tertinggal. */
  const sisaBaru = (Array.isArray(sisaKomentar) ? sisaKomentar : [])
    .filter((row) => komentarAwal.indexOf(row.id) === -1);

  check('C1. tidak ada komentar uji yang tertinggal',
    sisaBaru.length === 0,
    'sisa=' + sisaBaru.length + (sisaBaru.length ? ' id=' + sisaBaru.map((r) => r.id).join(',') : ''));

  await browser.close();
  server.close();

  console.log('');
  console.log('RINGKASAN');
  console.log('---------');
  console.log('  lulus: ' + lulus + ', gagal: ' + gagal);

  if (gagal) {
    console.log('');
    console.log('  Ada pemeriksaan yang gagal.');
    process.exitCode = 1;
  } else {
    console.log('');
    console.log('  Semua pemeriksaan lulus.');
  }
}

main().catch((error) => {
  console.error('Gagal menjalankan tes: ' + error.message);
  process.exitCode = 1;
});
