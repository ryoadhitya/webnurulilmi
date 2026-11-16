/* ==========================================================================
   UJI TERJEMAHAN OTOMATIS (MyMemory) — YPI NURUL ILMI
   --------------------------------------------------------------------------
   Skenario:

     1. Judul bahasa Indonesia diterjemahkan ke bahasa Inggris.
     2. Isi artikel diterjemahkan dan struktur paragrafnya tetap utuh.
     3. Teks panjang dipecah menjadi beberapa permintaan (tiap permintaan
        tidak boleh melebihi 500 karakter) tanpa merusak susunan paragraf.
     4. Kegagalan API (HTTP error, respons kosong, jaringan/timeout)
        menghasilkan pesan yang jelas, bukan hasil kosong.
     5. Kuota MyMemory habis menghasilkan pesan khusus kuota — HTTP 200
        dengan responseStatus gagal TIDAK boleh dianggap berhasil.
     6. Pemanggil tanpa sesi atau tanpa peran yang diizinkan ditolak.
     7. Hasil terjemahan masuk ke kolom bahasa Inggris dan tetap dapat diedit.
     8. Artikel tetap tersimpan saat terjemahan gagal.
     9. Tidak ada kunci API Google atau secret yang bocor ke frontend.

   Data uji (pengguna sekali pakai + artikel uji) dihapus di akhir.

   Jalankan:
     node scripts/test-terjemahan.mjs
   ========================================================================== */
import { createRequire } from 'node:module';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { execSync } from 'node:child_process';

import { ROOT, loadEnv } from './lib/env.mjs';
import { translateText, translateChunk, splitText, TranslateError } from '../supabase/functions/translate/mymemory.ts';
import { handleTranslate } from '../supabase/functions/translate/handler.ts';
import { authorize, ALLOWED_ROLES } from '../supabase/functions/translate/auth.ts';

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

const MARKER = 'Zzz Uji Terjemahan ' + Date.now();
const STOP_ID = ['yang', 'dan', 'untuk', 'dengan', 'pada', 'adalah', 'dari', 'kita', 'mereka', 'serta'];

let lulus = 0;
let gagal = 0;
const cek = [];

function check(label, condition, detail) {
  const ok = Boolean(condition);

  if (ok) {
    lulus += 1;
    console.log('  OK   ' + label + (detail ? '  ' + detail : ''));
  } else {
    gagal += 1;
    cek.push(label);
    console.log('  GAGAL ' + label + (detail ? '  ' + detail : ''));
  }

  return ok;
}

/* --------------------------------------------------------------------- */
/*  Helper                                                                */
/* --------------------------------------------------------------------- */

function stopIdCount(text) {
  const words = String(text).toLowerCase().match(/[a-z]+/g) || [];

  return words.filter((word) => STOP_ID.indexOf(word) !== -1).length;
}

function serviceHeaders(extra) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  return Object.assign({ apikey: key, Authorization: 'Bearer ' + key }, extra || {});
}

async function serviceGet(pathname) {
  const response = await fetch(process.env.SUPABASE_URL + '/rest/v1/' + pathname, {
    headers: serviceHeaders()
  });

  return response.json();
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

/** fetch tiruan yang mencatat panjang setiap query MyMemory. */
function stubFetch(responder) {
  const calls = [];

  const impl = async (url) => {
    const parsed = new URL(String(url));
    const q = parsed.searchParams.get('q') || '';

    calls.push({ q, langpair: parsed.searchParams.get('langpair'), url: String(url) });

    return responder(q, parsed);
  };

  impl.calls = calls;

  return impl;
}

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

/* --------------------------------------------------------------------- */
/*  Pengguna uji sekali pakai                                             */
/* --------------------------------------------------------------------- */

const usersUji = [];

async function hapusPengguna(user) {
  if (!user) return;

  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  await fetch(process.env.SUPABASE_URL + '/auth/v1/admin/users/' + user.id, {
    method: 'DELETE',
    headers: { apikey: key, Authorization: 'Bearer ' + key }
  });
}

async function buatPenggunaUji(email, password, role) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const headers = { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' };

  const created = await fetch(process.env.SUPABASE_URL + '/auth/v1/admin/users', {
    method: 'POST',
    headers,
    body: JSON.stringify({ email, password, email_confirm: true })
  });

  if (!created.ok) {
    console.log('  (gagal membuat akun uji: HTTP ' + created.status + ')');
    return null;
  }

  const body = await created.json();

  if (role) {
    const insert = await fetch(process.env.SUPABASE_URL + '/rest/v1/user_roles', {
      method: 'POST',
      headers,
      body: JSON.stringify({ user_id: body.id, role })
    });

    if (!insert.ok) {
      console.log('  (gagal memberi peran: HTTP ' + insert.status + ')');
    }
  }

  const user = { id: body.id, email, password, role: role || null };

  usersUji.push(user);

  return user;
}

async function login(email, password) {
  const response = await fetch(process.env.SUPABASE_URL + '/auth/v1/token?grant_type=password', {
    method: 'POST',
    headers: {
      apikey: process.env.SUPABASE_ANON_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) return null;

  const body = await response.json();

  return body.access_token || null;
}

/* --------------------------------------------------------------------- */
/*  Pengembersihan                                                         */
/* --------------------------------------------------------------------- */

async function bersihkan() {
  for (const user of usersUji) await hapusPengguna(user);

  const articles = await serviceGet(
    'articles?select=id,title_id&title_id=eq.' + encodeURIComponent(MARKER)
  );

  if (Array.isArray(articles) && articles.length) {
    const ids = articles.map((row) => row.id).join(',');

    await fetch(process.env.SUPABASE_URL + '/rest/v1/article_media?article_id=in.(' + ids + ')', {
      method: 'DELETE',
      headers: serviceHeaders()
    });

    await fetch(process.env.SUPABASE_URL + '/rest/v1/article_tags?article_id=in.(' + ids + ')', {
      method: 'DELETE',
      headers: serviceHeaders()
    });

    await fetch(process.env.SUPABASE_URL + '/rest/v1/articles?id=in.(' + ids + ')', {
      method: 'DELETE',
      headers: serviceHeaders()
    });
  }
}

/* --------------------------------------------------------------------- */
/*  BAGIAN A — modul terjemahan (MyMemory)                                */
/* --------------------------------------------------------------------- */

async function bagianA() {
  console.log('A. MODUL TERJEMAHAN (MyMemory)');
  console.log('');

  /* --- Skenario 1: judul ID -> EN (panggilan sungguhan) --- */
  const judulId = 'Kegiatan belajar bersama untuk siswa kelas satu di sekolah kami';

  try {
    const judulEn = await translateChunk(judulId);

    check('1. judul bahasa Indonesia diterjemahkan ke bahasa Inggris',
      judulEn.trim().length > 5 && judulEn.trim() !== judulId,
      '"' + judulEn.trim() + '"');

    check('1b. kata berbahasa Indonesia berkurang pada hasil terjemahan',
      stopIdCount(judulEn) < stopIdCount(judulId),
      'sebelum=' + stopIdCount(judulId) + ', sesudah=' + stopIdCount(judulEn));
  } catch (error) {
    check('1. judul bahasa Indonesia diterjemahkan ke bahasa Inggris', false, error.message);
  }

  /* --- Skenario 2: isi artikel + struktur paragraf --- */
  const isiId =
    'Setiap pagi anak-anak berlatih membaca Al-Quran bersama-sama dengan guru tahfidz kami.\n\n' +
    'Kami percaya bahwa kebiasaan baik yang dibangun sejak dini akan membawa manfaat besar bagi masa depan mereka.';

  try {
    const isiEn = await translateText(isiId);

    check('2. isi artikel diterjemahkan ke bahasa Inggris',
      isiEn.trim().length > 20 && isiEn.indexOf('Setiap pagi') === -1,
      isiEn.replace(/\n+/g, ' / ').slice(0, 120));

    check('2b. struktur paragraf isi tetap utuh (dua paragraf)',
      isiEn.split('\n\n').length === 2,
      'paragraf=' + isiEn.split('\n\n').length);
  } catch (error) {
    check('2. isi artikel diterjemahkan ke bahasa Inggris', false, error.message);
  }

  /* --- Skenario 3: teks panjang dipecah --- */
  const panjang =
    'Paragraf pertama untuk uji panjang. ' +
    'Anak-anak belajar mengaji dengan cara yang menyenangkan dan bertahap. ' +
    'Kami percaya bahwa kebiasaan baik yang dibangun sejak dini akan membawa manfaat besar bagi masa depan mereka.\n\n' +
    'Paragraf kedua untuk uji panjang. ' +
    'Setiap pagi anak-anak berlatih membaca Al-Quran bersama-sama dengan guru tahfidz yang kami percaya. ' +
    'Latihan rutin ini membentuk karakter dan disiplin yang baik bagi para siswa di sekolah kami.\n\n' +
    'Paragraf ketiga untuk uji panjang. ' +
    'Kegiatan tahfidz di sekolah kami berjalan setiap hari dengan jadwal yang konsisten. ' +
    'Hasilnya terlihat dari meningkatnya kemampuan baca Al-Quran para siswa dari waktu ke waktu.';

  const stubPanjang = stubFetch((q) =>
    jsonResponse({ responseStatus: 200, responseData: { translatedText: '[EN] ' + q } })
  );

  const hasilPanjang = await translateText(panjang, { fetchImpl: stubPanjang, maxChars: 450 });
  const panjangQuery = stubPanjang.calls.map((call) => call.q.length);

  check('3. teks panjang dipecah menjadi beberapa permintaan',
    stubPanjang.calls.length >= 3,
    'permintaan=' + stubPanjang.calls.length);

  check('3b. tiap permintaan tidak melebihi 500 karakter (batas MyMemory)',
    panjangQuery.every((nilai) => nilai <= 500),
    'terpanjang=' + Math.max.apply(null, panjangQuery));

  check('3c. setiap permintaan memakai pasangan bahasa id|en',
    stubPanjang.calls.every((call) => call.langpair === 'id|en'));

  check('3d. struktur paragraf teks panjang tetap utuh',
    hasilPanjang.split('\n\n').length === panjang.split('\n\n').length,
    'paragraf=' + hasilPanjang.split('\n\n').length);

  /* --- Skenario 4: kegagalan API --- */
  const kasusGagal = [
    {
      nama: 'HTTP error',
      fetch: stubFetch(() => new Response('server error', { status: 500 })),
      kode: 'http'
    },
    {
      nama: 'respons kosong',
      fetch: stubFetch(() => jsonResponse({ responseStatus: 200, responseData: { translatedText: '   ' } })),
      kode: 'respons_kosong'
    },
    {
      nama: 'jaringan/timeout',
      fetch: stubFetch(() => { throw new Error('waktu tunggu habis'); }),
      kode: 'jaringan'
    }
  ];

  for (const kasus of kasusGagal) {
    let error = null;

    try {
      await translateChunk('Teks uji', { fetchImpl: kasus.fetch });
    } catch (caught) {
      error = caught;
    }

    check('4. kegagalan API (' + kasus.nama + ') menghasilkan pesan yang jelas',
      error instanceof TranslateError && error.code === kasus.kode && error.message.length > 20,
      error ? error.code + ': ' + error.message : 'tidak ada error');
  }

  /* --- Skenario 5: kuota habis (HTTP 200 tapi gagal) --- */
  const stubKuota = stubFetch(() =>
    jsonResponse({
      responseStatus: 403,
      responseDetails: 'MEMORY LIMIT REACHED',
      responseData: { translatedText: '' }
    })
  );

  let errorKuota = null;

  try {
    await translateChunk('Teks uji kuota', { fetchImpl: stubKuota });
  } catch (caught) {
    errorKuota = caught;
  }

  check('5. kuota MyMemory habis terdeteksi walau HTTP 200',
    errorKuota instanceof TranslateError && errorKuota.code === 'kuota',
    errorKuota ? errorKuota.code : 'tidak ada error');

  check('5b. pesan kuota menjelaskan langkah manual',
    Boolean(errorKuota && /kuota/i.test(errorKuota.message) && /manual/i.test(errorKuota.message)),
    errorKuota ? errorKuota.message : '');

  /* Handler harus meneruskan pesan tersebut sebagai 502. */
  const respons502 = await handleTranslate(
    new Request('https://fungsi.test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title_id: 'Judul', content_id: 'Isi' })
    }),
    {
      authorizeFn: async () => ({ ok: true, userId: 'u1', role: 'super_admin' }),
      translateFn: async () => {
        throw new TranslateError('Kuota harian MyMemory sudah habis untuk alamat ini.', 'kuota');
      }
    }
  );

  const body502 = await respons502.json();

  check('5c. handler mengembalikan 502 dengan pesan kuota',
    respons502.status === 502 && /kuota/i.test(body502.message || ''),
    'HTTP ' + respons502.status + ' — ' + (body502.message || ''));

  /* --- Kontrak handler --- */
  const methodSalah = await handleTranslate(
    new Request('https://fungsi.test', { method: 'GET' }),
    { authorizeFn: async () => ({ ok: true }) }
  );

  check('4b. metode selain POST ditolak (405)', methodSalah.status === 405, 'HTTP ' + methodSalah.status);

  const bodyRusak = await handleTranslate(
    new Request('https://fungsi.test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{bukan json'
    }),
    { authorizeFn: async () => ({ ok: true }) }
  );

  check('4c. badan permintaan rusak ditolak (400)', bodyRusak.status === 400, 'HTTP ' + bodyRusak.status);

  const bodyKosong = await handleTranslate(
    new Request('https://fungsi.test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title_id: '', content_id: '' })
    }),
    { authorizeFn: async () => ({ ok: true }) }
  );

  check('4d. judul/isi kosong ditolak (400)', bodyKosong.status === 400, 'HTTP ' + bodyKosong.status);

  console.log('');
}

/* --------------------------------------------------------------------- */
/*  BAGIAN B — otorisasi (JWT + peran)                                     */
/* --------------------------------------------------------------------- */

async function bagianB() {
  console.log('B. OTORISASI (JWT + PERAN)');
  console.log('');

  const tanpaToken = await handleTranslate(
    new Request('https://fungsi.test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title_id: 'Judul', content_id: 'Isi' })
    }),
    { authorizeFn: authorize }
  );

  const bodyTanpaToken = await tanpaToken.json();

  check('6a. pemanggil tanpa token ditolak (403)',
    tanpaToken.status === 403 && /token/i.test(bodyTanpaToken.message || ''),
    'HTTP ' + tanpaToken.status + ' — ' + (bodyTanpaToken.message || ''));

  /* Pengguna uji: satu tanpa peran, satu dengan peran super_admin. */
  const emailTanpaPeran = 'uji.terjemahan.noperole@ypinurulilmi.or.id';
  const emailAdmin = 'uji.terjemahan.admin@ypinurulilmi.or.id';
  const sandiUji = 'UjiTerjemahanSekali26!';

  const tanpaPeran = await buatPenggunaUji(emailTanpaPeran, sandiUji, null);
  const denganPeran = await buatPenggunaUji(emailAdmin, sandiUji, 'super_admin');

  if (tanpaPeran) {
    const token = await login(emailTanpaPeran, sandiUji);

    if (token) {
      const hasil = await authorize(
        new Request('https://fungsi.test', {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
          body: JSON.stringify({ title_id: 'Judul', content_id: 'Isi' })
        })
      );

      check('6b. pengguna login tanpa peran ditolak',
        hasil.ok === false && /peran/i.test(hasil.reason || ''),
        hasil.reason || '');

      const responsTanpaPeran = await handleTranslate(
        new Request('https://fungsi.test', {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
          body: JSON.stringify({ title_id: 'Judul', content_id: 'Isi' })
        }),
        { authorizeFn: authorize }
      );

      check('6c. handler menolak pengguna tanpa peran (403)',
        responsTanpaPeran.status === 403,
        'HTTP ' + responsTanpaPeran.status);
    } else {
      check('6b. pengguna login tanpa peran ditolak', false, 'gagal login akun uji');
    }
  } else {
    check('6b. pengguna login tanpa peran ditolak', false, 'gagal membuat akun uji');
  }

  if (denganPeran) {
    const token = await login(emailAdmin, sandiUji);

    if (token) {
      const hasil = await authorize(
        new Request('https://fungsi.test', {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
          body: JSON.stringify({ title_id: 'Judul', content_id: 'Isi' })
        })
      );

      check('6d. pengguna dengan peran super_admin diizinkan',
        hasil.ok === true && hasil.role === 'super_admin',
        'peran=' + (hasil.role || hasil.reason));

      const responsBoleh = await handleTranslate(
        new Request('https://fungsi.test', {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
          body: JSON.stringify({ title_id: 'Judul', content_id: 'Isi' })
        }),
        {
          authorizeFn: authorize,
          translateFn: async (teks) => 'EN: ' + teks
        }
      );

      const bodyBoleh = await responsBoleh.json();

      check('6e. permintaan dari peran yang diizinkan diteruskan',
        responsBoleh.status === 200 && bodyBoleh.title_en === 'EN: Judul',
        'HTTP ' + responsBoleh.status + ' — ' + (bodyBoleh.title_en || bodyBoleh.message || ''));
    } else {
      check('6d. pengguna dengan peran super_admin diizinkan', false, 'gagal login akun uji');
    }
  } else {
    check('6d. pengguna dengan peran super_admin diizinkan', false, 'gagal membuat akun uji');
  }

  check('6f. lima peran yang diizinkan sesuai daftar RBAC',
    ALLOWED_ROLES.length === 5 &&
    ALLOWED_ROLES.indexOf('super_admin') !== -1 &&
    ALLOWED_ROLES.indexOf('sigma_nurul_ilmi') !== -1,
    ALLOWED_ROLES.join(', '));

  console.log('');
}

/* --------------------------------------------------------------------- */
/*  BAGIAN C — dashboard admin di browser                                  */
/* --------------------------------------------------------------------- */

async function bagianC(base) {
  console.log('C. DASHBOARD ADMIN (browser)');
  console.log('');

  const executablePath = findInstalledChromium();
  const browser = await chromium.launch(executablePath ? { executablePath } : {});
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleErrors = [];

  page.on('pageerror', (error) => consoleErrors.push(error.message));

  const email = 'uji.terjemahan.browser@ypinurulilmi.or.id';
  const sandi = 'UjiTerjemahanBrowser26!';
  const akun = await buatPenggunaUji(email, sandi, 'super_admin');

  try {
    if (!akun) {
      check('7. dashboard menerima hasil terjemahan', false, 'gagal membuat akun uji');
      return;
    }

    await page.goto(base + '/admin/article-form.html', { waitUntil: 'domcontentloaded' });

    /* Masuk lewat modul auth asli yang dipakai dashboard. */
    const hasilLogin = await page.evaluate(async (kredensial) => {
      if (!window.NIAuth) return { ok: false, message: 'NIAuth tidak tersedia' };

      const result = await window.NIAuth.signIn(kredensial.email, kredensial.password);

      return { ok: Boolean(result && result.ok), message: result && result.message };
    }, { email, password: sandi });

    check('7a. login ke dashboard berhasil', hasilLogin.ok, hasilLogin.message || '');

    await page.goto(base + '/admin/article-form.html', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#title_id', { timeout: 15000 });

    /* Tunggu form selesai diinisialisasi (kategori terisi) supaya tombol
       terjemahan sudah terpasang handler-nya. */
    await page.waitForFunction(
      () => {
        const select = document.getElementById('category_id');

        return Boolean(select && select.options.length > 0);
      },
      null,
      { timeout: 20000 }
    ).catch(() => {});

    /* Skenario 7: hasil terjemahan mengisi kolom Inggris dan dapat diedit. */
    await page.route('**/functions/v1/translate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          title_en: 'Students Join the Reading Habit Program',
          content_en: 'Every morning the students practice reading the Quran with our teachers.'
        })
      });
    });

    await page.fill('#title_id', 'Program membaca Al-Quran untuk siswa kelas satu');
    await page.fill('#content_id', 'Setiap pagi siswa berlatih membaca Al-Quran bersama guru tahfidz.');
    await page.click('#translate-article');
    await page.waitForFunction(
      () => (document.getElementById('title_en') || {}).value &&
        (document.getElementById('title_en').value || '').length > 0,
      null,
      { timeout: 15000 }
    ).catch(() => {});

    const judulEn = await page.inputValue('#title_en');
    const isiEn = await page.inputValue('#content_en');

    check('7b. hasil terjemahan mengisi kolom bahasa Inggris',
      judulEn.length > 0 && isiEn.length > 0,
      'title_en="' + judulEn.slice(0, 50) + '"');

    const statusSukses = (await page.textContent('#translate-status')) || '';

    check('7c. status menjelaskan hasil sudah dapat diperiksa',
      /selesai/i.test(statusSukses),
      statusSukses.trim());

    await page.fill('#title_en', 'Students Join the Reading Habit Program (revisi admin)');

    const judulRevisi = await page.inputValue('#title_en');

    check('7d. hasil terjemahan tetap dapat diedit admin',
      /revisi admin/.test(judulRevisi),
      judulRevisi);

    /* Skenario 8: terjemahan gagal, artikel tetap tersimpan. */
    await page.unroute('**/functions/v1/translate');

    await page.route('**/functions/v1/translate', async (route) => {
      await route.fulfill({
        status: 502,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Kuota harian MyMemory sudah habis untuk alamat ini. Isi terjemahan secara manual.'
        })
      });
    });

    await page.fill('#title_id', MARKER);
    await page.fill('#content_id', MARKER + ' — isi artikel untuk uji.');
    await page.click('#translate-article');
    await page.waitForFunction(
      () => {
        const status = document.getElementById('translate-status');

        return status && /kuota|gagal|tidak/i.test(status.textContent || '');
      },
      null,
      { timeout: 15000 }
    ).catch(() => {});

    const statusGagal = (await page.textContent('#translate-status')) || '';

    check('8a. pesan kegagalan terjemahan ditampilkan ke admin',
      /kuota/i.test(statusGagal),
      statusGagal.trim());

    /* Artikel harus tetap bisa disimpan meski terjemahan gagal. */
    await page.click('#submit-article');
    await page.waitForURL((url) => url.href.includes('articles.html'), { timeout: 30000 }).catch(() => {});

    const tersimpan = await serviceGet(
      'articles?select=id,title_id,status&title_id=eq.' + encodeURIComponent(MARKER)
    );

    check('8b. artikel tetap tersimpan meski terjemahan gagal',
      Array.isArray(tersimpan) && tersimpan.length === 1,
      Array.isArray(tersimpan) && tersimpan.length ? 'id=' + tersimpan[0].id : 'tidak ditemukan');

    /* Teks status bawaan tidak boleh menyebut layanan lama. */
    await page.goto(base + '/admin/article-form.html', { waitUntil: 'domcontentloaded' });
    const html = await page.content();

    check('8c. teks antarmuka tidak lagi menyebut Google Translate',
      !/Google Translate/i.test(html),
      '');

    check('8d. tidak ada error JavaScript di halaman dashboard',
      consoleErrors.length === 0,
      consoleErrors.slice(0, 2).join(' | '));
  } finally {
    await browser.close();
  }

  console.log('');
}

/* --------------------------------------------------------------------- */
/*  BAGIAN D — jejak provider & secret                                     */
/* --------------------------------------------------------------------- */

async function bagianD() {
  console.log('D. JEJAK PROVIDER & SECRET');
  console.log('');

  const server = fs.readFileSync(path.join(ROOT, 'supabase', 'functions', 'translate', 'index.ts'), 'utf8');
  const handler = fs.readFileSync(path.join(ROOT, 'supabase', 'functions', 'translate', 'handler.ts'), 'utf8');
  const modul = fs.readFileSync(path.join(ROOT, 'supabase', 'functions', 'translate', 'mymemory.ts'), 'utf8');
  const fungsi = server + handler + modul;

  check('9a. Edge Function tidak memakai kunci API Google',
    !/GOOGLE_TRANSLATE_API_KEY|translate\.googleapis|@google-cloud/i.test(fungsi));

  check('9b. Edge Function memanggil MyMemory',
    /api\.mymemory\.translated\.net/.test(modul));

  check('9c. Edge Function tidak memuat kunci/secret hard-coded',
    !/service_role/i.test(fungsi) && !/eyJhbGciOi/.test(fungsi));

  /* Frontend tidak boleh memuat secret apa pun. */
  const folderDokumen = ['js', 'admin'];
  const berkasDokumen = [];

  folderDokumen.forEach((folder) => {
    const full = path.join(ROOT, folder);

    if (!fs.existsSync(full)) return;

    fs.readdirSync(full, { withFileTypes: true }).forEach((entry) => {
      if (entry.isDirectory()) return;
      if (!/\.(js|html)$/i.test(entry.name)) return;

      berkasDokumen.push(path.join(full, entry.name));
    });
  });

  const bocor = [];

  /* Yang dicari adalah nilai secret sungguhan, bukan penyebutan kata
     "service_role" di komentar. */
  const nilaiRahasia = [
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    process.env.SUPABASE_ACCESS_TOKEN
  ].filter(Boolean);

  berkasDokumen.forEach((file) => {
    const isi = fs.readFileSync(file, 'utf8');

    const adaNilai = nilaiRahasia.some((nilai) => nilai.length > 20 && isi.indexOf(nilai) !== -1);
    const adaJwt = /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/.test(isi);
    const adaKunciRahasia = /sb_secret_[A-Za-z0-9_-]+/.test(isi);

    if (adaNilai || adaJwt || adaKunciRahasia) bocor.push(path.relative(ROOT, file));
  });

  check('9d. tidak ada secret Supabase di frontend',
    bocor.length === 0,
    bocor.join(', '));

  const jejakGoogle = [];

  berkasDokumen.forEach((file) => {
    const isi = fs.readFileSync(file, 'utf8');

    if (/GOOGLE_TRANSLATE_API_KEY|translate\.googleapis|@google-cloud/i.test(isi)) {
      jejakGoogle.push(path.relative(ROOT, file));
    }
  });

  check('9e. tidak ada rujukan Google Cloud Translation di frontend',
    jejakGoogle.length === 0,
    jejakGoogle.join(', '));

  console.log('');
}

/* --------------------------------------------------------------------- */

async function main() {
  console.log('Uji terjemahan otomatis (MyMemory) — YPI Nurul Ilmi');
  console.log('===============================================');
  console.log('');

  const server = await startServer();
  const base = 'http://127.0.0.1:' + server.address().port;

  console.log('Server statis lokal : ' + base);
  console.log('');

  try {
    await bagianA();
    await bagianB();
    await bagianC(base);
    await bagianD();
  } finally {
    await bersihkan();
    server.close();
  }

  console.log('RINGKASAN');
  console.log('---------');
  console.log('  lulus: ' + lulus + ', gagal: ' + gagal);

  if (gagal) {
    console.log('');
    console.log('  Pemeriksaan yang gagal:');
    cek.forEach((label) => console.log('   - ' + label));
    console.log('');
    console.log('  Ada pengujian yang gagal.');
    process.exit(1);
  }

  console.log('');
  console.log('  Semua pemeriksaan lulus.');
}

main().catch(async (error) => {
  console.error('Gagal menjalankan uji: ' + error.message);
  await bersihkan();
  process.exit(1);
});
