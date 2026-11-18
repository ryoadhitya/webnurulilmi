/* ==========================================================================
   UJI BROWSER — ARTIKEL TERBARU DI FOOTER
   --------------------------------------------------------------------------
   Memeriksa widget "Artikel Terbaru" di footer memakai data backend yang
   sama dengan halaman Artikel:

     1. Tiap halaman publik menampilkan maksimal 3 artikel published yang
        benar-benar ada di database (judul, tanggal, penulis, jumlah
        komentar), dengan tautan ke article.html?id=<id>.
     2. Urutan mengikuti tanggal tayang terbaru.
     3. Artikel berstatus draft tidak pernah tampil di footer.
     4. Artikel yang baru dipublikasikan lewat dashboard admin langsung
        muncul di footer tanpa perlu mengubah kode frontend.
     5. Tampilan kosong memuat pesan "Belum ada artikel terbaru."
     6. Fitur Berlangganan sudah hilang (tidak ada form, input, atau teks).
     7. Tata letak footer rapi di desktop (1440) dan ponsel (390).

   Semua data uji yang dibuat dihapus kembali di akhir.

   Jalankan:
     node scripts/test-footer-latest.mjs
   ========================================================================== */
import { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execSync } from 'node:child_process';

import { ROOT, loadEnv } from './lib/env.mjs';
import { request, selectRows } from './lib/supabase-rest.mjs';

loadEnv();

const require = createRequire(import.meta.url);
const BASE = process.env.BASE_URL || 'http://127.0.0.1:8123';

const PAGES = [
  'index.html', 'about.html', 'article.html', 'blog.html', 'blog-single.html',
  'contact.html', 'courses.html', 'pricing.html', 'teacher.html', '404.html'
];

const MARK = 'QC Footer Uji ' + Date.now();

let passed = 0;
let failed = 0;

function check(name, condition, detail) {
  if (condition) {
    passed += 1;
    console.log('  OK   ' + name);
    return true;
  }

  failed += 1;
  console.log('  GAGAL ' + name + (detail ? ' -> ' + detail : ''));
  return false;
}

function loadPlaywright() {
  const globalRoot = execSync('npm root -g').toString().trim();

  return require(path.join(globalRoot, 'playwright'));
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

/** Ambil state widget footer dari halaman yang sedang dibuka. */
function readFooter(page) {
  return page.evaluate(() => {
    const container = document.querySelector('[data-footer-latest]');
    const items = container
      ? Array.prototype.slice.call(container.querySelectorAll('.block-21'))
      : [];

    const text = (node) => (node ? node.textContent.replace(/\s+/g, ' ').trim() : '');

    return {
      hasContainer: !!container,
      count: items.length,
      titles: items.map((item) => text(item.querySelector('.heading a'))),
      hrefs: items.map((item) => {
        const link = item.querySelector('.heading a');
        return link ? link.getAttribute('href') : '';
      }),
      imageHrefs: items.map((item) => {
        const link = item.querySelector('.blog-img');
        return link ? link.getAttribute('href') : '';
      }),
      dates: items.map((item) => text(item.querySelector('.meta > div:nth-child(1) a'))),
      authors: items.map((item) => text(item.querySelector('.meta > div:nth-child(2) a'))),
      comments: items.map((item) => text(item.querySelector('.meta > div:nth-child(3) a'))),
      containerText: container ? container.textContent.replace(/\s+/g, ' ').trim() : '',
      subscribeForms: document.querySelectorAll('.subscribe-form').length,
      subscribeInputs: document.querySelectorAll('.subscribe-form input').length,
      subscribeText: /Berlangganan|Masukkan email Anda/.test(document.body.innerText),
      footerColumns: Array.prototype.slice
        .call(document.querySelectorAll('.ftco-footer .row > div'))
        .filter((col) => col.classList.contains('col-md-6'))
        .map((col) => col.textContent.replace(/\s+/g, ' ').trim().length),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
    };
  });
}

/** Data artikel published terbaru, diambil dari API yang dipakai frontend. */
async function readExpected(page) {
  return page.evaluate(async () => {
    const result = await window.NISupabase.fetchPublishedArticles({ limit: 3 });

    return result.rows.map((row) => ({
      id: row.id,
      title: row.title_id || row.title_en || '',
      author: row.author_name || 'Admin',
      publishedAt: row.published_at,
      comments: Number((row.comments && row.comments[0] && row.comments[0].count) || 0),
      url: window.NISupabase.articleUrl(row.id)
    }));
  });
}

function formatDateId(value) {
  if (!value) return '—';

  const date = new Date(value);
  if (isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Jakarta'
  }).format(date);
}

/**
 * Waktu tayang sebagai kalender WIB (tengah malam +07:00), sama seperti
 * yang disimpan admin dari form tanggal publikasi.
 */
function publicationStamp(daysAgo) {
  const now = new Date();
  const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const day = Date.UTC(wib.getUTCFullYear(), wib.getUTCMonth(), wib.getUTCDate() - daysAgo);

  return new Date(day - 7 * 60 * 60 * 1000).toISOString();
}

/** Buat artikel uji (published) dengan tanggal tayang bertingkat. */
async function seedProbes() {
  const now = Date.now();

  const rows = await request('/rest/v1/articles', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: [
      {
        title_id: MARK + ' LAMA',
        content_id: MARK + ' LAMA',
        status: 'published',
        author_name: 'QC Penulis Lama',
        published_at: publicationStamp(1),
        created_at: new Date(now - 3 * 60000).toISOString()
      },
      {
        title_id: MARK + ' TENGAH',
        content_id: MARK + ' TENGAH',
        status: 'published',
        author_name: 'QC Penulis Tengah',
        published_at: publicationStamp(0),
        created_at: new Date(now - 2 * 60000).toISOString()
      },
      {
        title_id: MARK + ' BARU',
        content_id: MARK + ' BARU',
        status: 'published',
        author_name: 'QC Penulis Baru',
        published_at: publicationStamp(0),
        created_at: new Date(now - 60000).toISOString()
      },
      {
        title_id: MARK + ' DRAFT',
        content_id: MARK + ' DRAFT',
        status: 'draft',
        author_name: 'QC Penulis Draft',
        published_at: null,
        created_at: new Date(now).toISOString()
      }
    ],
    label: 'insert probe artikel'
  });

  const byTitle = {};
  rows.forEach((row) => { byTitle[row.title_id] = row; });

  /* Dua komentar pada artikel terlama, satu pada artikel tengah. */
  await request('/rest/v1/comments', {
    method: 'POST',
    body: [
      {
        article_id: byTitle[MARK + ' LAMA'].id,
        name: 'QC Penguji 1',
        comment: 'Komentar uji satu.',
        status: 'published'
      },
      {
        article_id: byTitle[MARK + ' LAMA'].id,
        name: 'QC Penguji 2',
        comment: 'Komentar uji dua.',
        status: 'published'
      },
      {
        article_id: byTitle[MARK + ' TENGAH'].id,
        name: 'QC Penguji 3',
        comment: 'Komentar uji tiga.',
        status: 'published'
      }
    ],
    label: 'insert komentar uji'
  });

  return byTitle;
}

async function main() {
  const playwright = loadPlaywright();
  const browser = await playwright.chromium.launch({
    headless: true,
    executablePath: findChromium() || undefined
  });

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('Uji artikel terbaru di footer: ' + BASE);
  console.log('');

  console.log('0. Menyiapkan data uji di database');
  const probes = await seedProbes();
  check('data uji dibuat (3 published + 1 draft)', Object.keys(probes).length === 4);

  /* ---------- 1. DATA NYATA DI SETIAP HALAMAN ---------- */
  console.log('');
  console.log('1. Widget footer memakai data backend');

  for (const name of PAGES) {
    await page.goto(BASE + '/' + name, { waitUntil: 'networkidle' });
    await page.waitForTimeout(700);

    const footer = await readFooter(page);
    const expected = await readExpected(page);
    const ok = expected.length > 0;

    check(name + ': container ada', footer.hasContainer);
    check(name + ': jumlah item = jumlah artikel published terbaru (' + expected.length + ')',
      footer.count === expected.length, 'footer ' + footer.count + ' item');

    if (!ok) continue;

    check(name + ': judul sama dengan database',
      JSON.stringify(footer.titles) === JSON.stringify(expected.map((row) => row.title)),
      JSON.stringify(footer.titles));

    check(name + ': tautan ke halaman detail artikel yang benar',
      JSON.stringify(footer.hrefs) === JSON.stringify(expected.map((row) => row.url)),
      JSON.stringify(footer.hrefs));

    check(name + ': tautan gambar sama dengan tautan judul',
      JSON.stringify(footer.imageHrefs) === JSON.stringify(footer.hrefs),
      JSON.stringify(footer.imageHrefs));

    check(name + ': tanggal sesuai tanggal tayang',
      JSON.stringify(footer.dates) === JSON.stringify(expected.map((row) => formatDateId(row.publishedAt))),
      JSON.stringify(footer.dates));

    check(name + ': nama penulis sesuai database',
      JSON.stringify(footer.authors) === JSON.stringify(expected.map((row) => row.author)),
      JSON.stringify(footer.authors));

    check(name + ': jumlah komentar sesuai database',
      JSON.stringify(footer.comments) === JSON.stringify(expected.map((row) => String(row.comments))),
      JSON.stringify(footer.comments));
  }

  /* ---------- 2. URUTAN DAN MAKSIMAL TIGA ARTIKEL ---------- */
  console.log('');
  console.log('2. Urutan terbaru dan maksimal tiga artikel');

  await page.goto(BASE + '/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  const ordered = await readFooter(page);

  check('footer menampilkan tepat 3 artikel', ordered.count === 3, String(ordered.count));
  check('artikel terbaru tampil paling atas',
    ordered.titles[0] === MARK + ' BARU', ordered.titles[0]);
  check('urutan lama -> baru tidak tertukar',
    ordered.titles[1] === MARK + ' TENGAH' && ordered.titles[2] === MARK + ' LAMA',
    JSON.stringify(ordered.titles));
  check('jumlah komentar nyata (0, 1, 2)',
    JSON.stringify(ordered.comments) === JSON.stringify(['0', '1', '2']),
    JSON.stringify(ordered.comments));

  /* ---------- 3. TAUTAN FOOTER MEMBUKA ARTIKEL YANG BENAR ---------- */
  console.log('');
  console.log('3. Tautan footer membuka artikel yang benar');

  const firstHref = ordered.hrefs[0];

  if (firstHref) {
    await page.goto(new URL(firstHref, BASE + '/index.html').href, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    const detail = await page.evaluate(() => ({
      url: location.pathname + location.search,
      title: (document.querySelector('h1') || { textContent: '' }).textContent.trim()
    }));

    check('tautan membuka article.html dengan param id', /article\.html\?id=\d+/.test(detail.url), detail.url);
    check('halaman detail memuat judul artikel',
      detail.title.indexOf(MARK + ' BARU') !== -1, detail.title);
  } else {
    check('ada tautan pertama di footer', false);
  }

  /* ---------- 4. ARTIKEL DRAFT TIDAK TAMPIL ---------- */
  console.log('');
  console.log('4. Artikel draft tidak tampil di footer');

  await page.goto(BASE + '/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);

  const withDraft = await readFooter(page);
  check('judul artikel draft tidak muncul di footer',
    withDraft.containerText.indexOf(MARK + ' DRAFT') === -1, withDraft.containerText.slice(0, 120));

  /* ---------- 5. ARTIKEL BARU DARI DASHBOARD ADMIN MUNCUL ---------- */
  console.log('');
  console.log('5. Artikel yang dipublikasikan lewat dashboard admin langsung tampil');

  const email = 'admin@ypinurulilmi.or.id';
  const password = process.env.SUPABASE_ADMIN_PASSWORD;

  if (!password) {
    check('SUPABASE_ADMIN_PASSWORD tersedia di .env', false, 'variabel tidak ada');
  } else {
    await page.goto(BASE + '/admin/login.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(700);
    await page.fill('#email', email);
    await page.fill('#password', password);
    await page.click('#login-submit');
    await page.waitForTimeout(3500);

    const loggedIn = await page.evaluate(() => location.pathname + location.search);
    check('login admin berhasil', /\/admin\/articles\.html/.test(loggedIn), loggedIn);

    await page.goto(BASE + '/admin/article-form.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);

    await page.fill('#title_id', MARK + ' DASHBOARD');
    await page.fill('#content_id', MARK + ' — artikel uji untuk footer.');
    await page.fill('#author_name', 'QC Penulis Dashboard');
    await page.selectOption('#status', 'published');
    await page.click('#submit-article');
    await page.waitForTimeout(4500);

    const saved = await page.evaluate(() => ({
      url: location.pathname + location.search,
      error: document.getElementById('form-error')
        ? document.getElementById('form-error').textContent.trim()
        : ''
    }));

    check('artikel baru tersimpan tanpa galat', !saved.error, saved.error);

    const publishedRows = await selectRows('articles', {
      title_id: 'like.*' + MARK + '*',
      select: 'id,title_id,status,published_at'
    });

    const dashboardArticle = publishedRows.rows.find((row) => row.title_id === MARK + ' DASHBOARD');

    check('artikel baru ada di database dengan status published',
      Boolean(dashboardArticle) && dashboardArticle.status === 'published',
      dashboardArticle ? dashboardArticle.status : 'tidak ditemukan');

    if (dashboardArticle) {
      await page.goto(BASE + '/index.html', { waitUntil: 'networkidle' });
      await page.waitForTimeout(900);

      const afterPublish = await readFooter(page);
      check('artikel baru langsung muncul di footer tanpa edit frontend',
        afterPublish.titles.indexOf(MARK + ' DASHBOARD') !== -1,
        JSON.stringify(afterPublish.titles));

      check('artikel baru menjadi yang paling atas',
        afterPublish.titles[0] === MARK + ' DASHBOARD', afterPublish.titles[0]);

      check('tautan artikel baru menuju id yang benar',
        afterPublish.hrefs.indexOf('article.html?id=' + dashboardArticle.id) !== -1,
        JSON.stringify(afterPublish.hrefs));
    }
  }

  /* ---------- 6. TAMPILAN KOSONG ---------- */
  console.log('');
  console.log('6. Pesan saat belum ada artikel');

  const emptyContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const emptyPage = await emptyContext.newPage();

  await emptyPage.route('**/rest/v1/articles*', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'content-range': '0-2/*' },
      body: '[]'
    });
  });

  await emptyPage.goto(BASE + '/index.html', { waitUntil: 'networkidle' });
  await emptyPage.waitForTimeout(900);

  const emptyFooter = await readFooter(emptyPage);
  check('footer menampilkan "Belum ada artikel terbaru."',
    emptyFooter.containerText.indexOf('Belum ada artikel terbaru.') !== -1,
    emptyFooter.containerText);

  await emptyContext.close();

  /* ---------- 7. FITUR BERLANGGANAN HILANG ---------- */
  console.log('');
  console.log('7. Fitur Berlangganan sudah dihapus');

  for (const name of PAGES) {
    await page.goto(BASE + '/' + name, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    const footer = await readFooter(page);

    check(name + ': tidak ada form langganan',
      footer.subscribeForms === 0 && footer.subscribeInputs === 0,
      'form ' + footer.subscribeForms);

    check(name + ': tidak ada teks Berlangganan/Masukkan email',
      !footer.subscribeText);
  }

  /* ---------- 8. TATA LETAK DESKTOP DAN PONSEL ---------- */
  console.log('');
  console.log('8. Tata letak footer desktop dan ponsel');

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BASE + '/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  const desktop = await readFooter(page);
  check('desktop: tidak ada overflow horizontal', desktop.overflow <= 1, String(desktop.overflow));
  check('desktop: keempat kolom footer terisi',
    desktop.footerColumns.length === 4 && desktop.footerColumns.every((len) => len > 0),
    JSON.stringify(desktop.footerColumns));

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE + '/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  const mobile = await readFooter(page);
  check('ponsel: tidak ada overflow horizontal', mobile.overflow <= 1, String(mobile.overflow));
  check('ponsel: artikel tetap tampil', mobile.count > 0, String(mobile.count));
  check('ponsel: kolom footer tetap terisi',
    mobile.footerColumns.length === 4 && mobile.footerColumns.every((len) => len > 0),
    JSON.stringify(mobile.footerColumns));

  await page.goto(BASE + '/contact.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  const mobileContact = await readFooter(page);
  check('ponsel (contact): tidak ada overflow horizontal',
    mobileContact.overflow <= 1, String(mobileContact.overflow));

  /* ---------- 9. BERSIHKAN DATA UJI ---------- */
  console.log('');
  console.log('9. Membersihkan data uji');

  const cleanup = await request('/rest/v1/articles?title_id=like.*' + encodeURIComponent(MARK) +
    '*&select=id', {
    method: 'DELETE',
    headers: { Prefer: 'return=representation' },
    label: 'delete probe'
  });

  check('artikel uji dihapus dari database', Array.isArray(cleanup), String(cleanup && cleanup.length));

  const left = await selectRows('articles', {
    title_id: 'like.*' + encodeURIComponent(MARK) + '*',
    select: 'id,title_id'
  });

  check('tidak ada sisa artikel uji', left.rows.length === 0, left.rows.length + ' baris');

  await browser.close();

  console.log('');
  console.log('Lolos: ' + passed + ', gagal: ' + failed);

  if (failed) process.exit(1);
}

main().catch(function (error) {
  console.error('Gagal: ' + error.message);
  process.exit(1);
});
