/* ==========================================================================
   UJI BROWSER — TANGGAL PUBLIKASI ARTIKEL (DASHBOARD ADMIN)
   --------------------------------------------------------------------------
   Menguji alur tanggal publikasi yang diminta:

     1. Admin membuat artikel dengan tanggal publikasi yang sudah lewat
        (backdate).
     2. Tanggal itu tersimpan sebagai tanggal kalender WIB (tengah malam
        +07:00), bukan jam sekarang.
     3. Tanggal yang sama tampil di halaman detail artikel dan di daftar
        artikel, tanpa bergeser satu hari.
     4. Mengedit isi artikel tidak mengubah tanggal publikasi.
     5. Artikel hasil uji dihapus kembali setelah selesai.

   Login memakai akun admin sungguhan dengan password yang benar, jadi
   tidak ada risiko akun terkunci.

   Jalankan:
     node scripts/test-tanggal-publikasi.mjs
   ========================================================================== */
import { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execSync } from 'node:child_process';

import { ROOT, loadEnv } from './lib/env.mjs';
import { selectRows, request } from './lib/supabase-rest.mjs';

loadEnv();

const require = createRequire(import.meta.url);
const BASE = process.env.BASE_URL || 'http://127.0.0.1:8123';
const MARK = 'Zzz uji tanggal ' + Date.now();
const BACKDATE = '2026-02-10';
const BACKDATE_TAMPER = '2026-02-10T00:00:00+07:00';

let passed = 0;
let failed = 0;

function check(name, condition, detail) {
  if (condition) {
    passed += 1;
    console.log('  OK   ' + name);
    return;
  }

  failed += 1;
  console.log('  GAGAL ' + name + (detail ? ' -> ' + detail : ''));
}

function loadPlaywright() {
  return require(path.join(execSync('npm root -g').toString().trim(), 'playwright'));
}

function findChromium() {
  const base = path.join(
    process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'),
    'ms-playwright'
  );

  if (!fs.existsSync(base)) return null;

  const candidates = [];

  fs.readdirSync(base).forEach((entry) => {
    if (!/^chromium/i.test(entry)) return;

    [
      ['chrome-headless-shell-win64', 'chrome-headless-shell.exe'],
      ['chrome-win64', 'chrome.exe'],
      ['chrome-win', 'chrome.exe']
    ].forEach((relative) => {
      const file = path.join(base, entry, relative[0], relative[1]);

      if (fs.existsSync(file)) candidates.push(file);
    });
  });

  return candidates[0] || null;
}

async function main() {
  const playwright = loadPlaywright();
  const executablePath = findChromium();

  const browser = await playwright.chromium.launch({
    headless: true,
    executablePath: executablePath || undefined
  });

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const consoleErrors = [];

  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  let articleId = null;

  try {
    /* ---------------- 1. LOGIN ADMIN ---------------- */
    console.log('');
    console.log('== Login admin ==');

    await page.goto(BASE + '/admin/login.html', { waitUntil: 'networkidle' });
    await page.fill('#email', 'admin@ypinurulilmi.or.id');
    await page.fill('#password', process.env.SUPABASE_ADMIN_PASSWORD || '');
    await page.click('#login-submit');

    await page.waitForURL(/\/admin\//, { timeout: 20000 });

    /* Sesi Supabase baru tersimpan setelah halaman dashboard selesai memuat,
       jadi tunggu dulu tokennya di localStorage. */
    await page.waitForFunction(() => {
      return Object.keys(window.localStorage).some((key) => key.indexOf('auth-token') !== -1);
    }, null, { timeout: 20000 });

    await page.waitForTimeout(1500);

    check('login admin berhasil', /\/admin\//.test(page.url()), page.url());

    /* ---------------- 2. BUAT ARTIKEL DENGAN BACKDATE ---------------- */
    console.log('');
    console.log('== Simpan artikel dengan tanggal yang sudah lewat ==');

    await page.goto(BASE + '/admin/article-form.html', { waitUntil: 'networkidle' });
    await page.waitForSelector('#title_id', { timeout: 20000 });
    await page.waitForTimeout(1500);

    await page.fill('#title_id', MARK);
    await page.fill('#content_id', 'Isi artikel uji tanggal publikasi.');
    await page.selectOption('#status', 'published');

    await page.fill('#published_at', BACKDATE);
    await page.dispatchEvent('#published_at', 'change');
    await page.waitForTimeout(300);

    const hint = (await page.textContent('#published_at-hint')).trim();

    check('pratinjau tanggal publikasi tampil', hint.includes('10 Feb 2026'), hint);

    await page.click('#submit-article');
    await page.waitForTimeout(3000);

    const rows = await selectRows('articles', {
      title_id: 'eq.' + MARK,
      select: 'id,title_id,published_at,created_at,status'
    });

    articleId = rows.rows.length ? rows.rows[0].id : null;

    check('artikel uji tersimpan', Boolean(articleId), 'id=' + articleId);

    if (articleId) {
      const row = rows.rows[0];

      /* Postgres menyimpan kolom timestamptz dalam UTC, jadi yang dibandingkan
         adalah momen waktunya: tengah malam WIB pada tanggal yang dipilih. */
      const expected = new Date(BACKDATE_TAMPER).getTime();
      const stored = new Date(row.published_at).getTime();

      check('tanggal publikasi tersimpan sebagai kalender WIB',
        stored === expected, row.published_at + ' (harus ' + BACKDATE_TAMPER + ')');
      check('tanggal publikasi boleh lebih dulu dari hari ini',
        new Date(row.published_at).getTime() < Date.now(), row.published_at);
      check('tanggal dibuat (created_at) terpisah dari tanggal publikasi',
        row.created_at && row.created_at !== row.published_at,
        row.created_at + ' vs ' + row.published_at);

      /* ------------- 3. TAMPIL DI HALAMAN PUBLIK ------------- */
      console.log('');
      console.log('== Tampilan di website ==');

      await page.goto(BASE + '/article.html?id=' + articleId, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1500);

      const meta = (await page.textContent('#article-meta')).replace(/\s+/g, ' ').trim();

      check('tanggal tampil di halaman artikel tanpa bergeser',
        meta.includes('10 Feb 2026'), meta);

      await page.goto(BASE + '/blog.html', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);

      const listing = await page.evaluate((marker) => {
        const cards = Array.from(document.querySelectorAll('.blog-entry'));

        const card = cards.find((item) => item.textContent.includes(marker));

        if (!card) return { found: false };

        const date = card.querySelector('.meta-date');

        return {
          found: true,
          date: date ? date.textContent.replace(/\s+/g, ' ').trim() : ''
        };
      }, MARK);

      check('artikel muncul di daftar artikel', listing.found, JSON.stringify(listing));
      check('tanggal di daftar artikel sama (10 Feb 2026)',
        /10/.test(listing.date) && /2026/.test(listing.date), listing.date);

      /* ------------- 4. EDIT ISI TIDAK UBAH TANGGAL ------------- */
      console.log('');
      console.log('== Edit isi artikel ==');

      await page.goto(BASE + '/admin/article-form.html?id=' + articleId, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1800);

      const prefilled = await page.inputValue('#published_at');

      check('form admin memuat tanggal publikasi yang tersimpan',
        prefilled === BACKDATE, prefilled);

      await page.fill('#content_id', 'Isi artikel uji tanggal publikasi. Direvisi tanpa mengubah tanggal.');
      await page.click('#submit-article');
      await page.waitForTimeout(3000);

      const after = await selectRows('articles', {
        id: 'eq.' + articleId,
        select: 'id,published_at,created_at,content_id'
      });

      const afterRow = after.rows[0];

      check('tanggal publikasi tidak berubah setelah isi diedit',
        new Date(afterRow.published_at).getTime() === expected, afterRow.published_at);
      check('isi artikel tersimpan', /Direvisi/.test(afterRow.content_id || ''));
    }
  } finally {
    /* ---------------- 5. BERSIHKAN ---------------- */
    console.log('');
    console.log('== Pembersihan ==');

    if (articleId) {
      await request('/rest/v1/articles?id=eq.' + articleId, { method: 'DELETE' });
      console.log('  Artikel uji dihapus: ' + articleId);
    } else {
      const leftovers = await selectRows('articles', { title_id: 'eq.' + MARK, select: 'id' });

      for (const row of leftovers.rows) {
        await request('/rest/v1/articles?id=eq.' + row.id, { method: 'DELETE' });
      }

      console.log('  Artikel uji dihapus: ' + leftovers.rows.length);
    }

    const realErrors = consoleErrors.filter((text) => !/Failed to load resource/i.test(text));

    check('tidak ada error JavaScript di konsol', realErrors.length === 0, realErrors.join(' | '));

    await browser.close();
  }

  console.log('');
  console.log('Total: ' + (passed + failed) + ' pemeriksaan, ' + passed + ' lulus, ' + failed + ' gagal.');

  if (failed) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
