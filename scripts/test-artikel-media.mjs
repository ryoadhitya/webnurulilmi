/* ==========================================================================
   UJI SISTEM ARTIKEL (MEDIA + HALAMAN PUBLIK) — YPI NURUL ILMI
   --------------------------------------------------------------------------
   Menguji perbaikan sistem artikel lewat browser sungguhan:

     A. Matriks media
        1. Satu foto
        2. Beberapa foto
        3. Video saja (thumbnail otomatis harus terbentuk)
        4. Foto + video (urutan media harus terjaga)
        5. Mengganti video (thumbnail ikut diperbarui)
        6. Edit tanpa mengganti media (media lama tidak boleh hilang)

     B. Halaman publik
        - Daftar artikel menampilkan semua artikel published
        - Setiap kartu membuka detail yang benar
        - Pencarian, filter kategori, dan filter tag bekerja
        - Artikel draft tidak terlihat
        - Tidak ada data dummy di halaman publik
        - Recent Blog di beranda memakai sumber yang sama
        - Halaman detail memuat judul, tanggal, penulis, kategori/tag, isi,
          media, dan navigasi kembali

     C. Teknis
        - Tidak ada error console
        - Tidak ada permintaan jaringan gagal
        - Tidak ada berkas uji yang tertinggal di database atau Storage

   Semua artikel uji dan berkas medianya dihapus di akhir.

   Jalankan:
     node scripts/test-artikel-media.mjs
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
  '.mp4': 'video/mp4',
  '.webm': 'video/webm'
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
const created = { articles: [], files: [] };

function check(label, condition, detail) {
  const ok = Boolean(condition);
  if (!ok) failures.push(label + (detail ? ' — ' + detail : ''));
  console.log('  ' + (ok ? 'OK  ' : 'GAGAL') + ' ' + label + (detail ? '  ' + detail : ''));
  return ok;
}

function isIgnorable(text) {
  return /favicon/i.test(text) || /net::ERR_ABORTED/i.test(text);
}

/* ------------------------------------------------------------------------ */
/*  Akses database (service role, hanya untuk verifikasi & pembersihan)     */
/* ------------------------------------------------------------------------ */

function serviceHeaders(extra) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  return Object.assign({
    apikey: key,
    Authorization: 'Bearer ' + key
  }, extra || {});
}

async function apiGet(path) {
  const response = await fetch(process.env.SUPABASE_URL + '/rest/v1/' + path, {
    headers: serviceHeaders()
  });

  return response.json();
}

async function apiDelete(path) {
  const response = await fetch(process.env.SUPABASE_URL + '/rest/v1/' + path, {
    method: 'DELETE',
    headers: serviceHeaders()
  });

  return response.ok;
}

async function apiPatch(path, body) {
  const response = await fetch(process.env.SUPABASE_URL + '/rest/v1/' + path, {
    method: 'PATCH',
    headers: serviceHeaders({
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    }),
    body: JSON.stringify(body)
  });

  return response.json();
}

async function mediaRows(articleId) {
  const rows = await apiGet(
    'article_media?select=id,article_id,type,path,poster_path,sort_order&article_id=eq.' +
    articleId + '&order=sort_order,id'
  );

  return Array.isArray(rows) ? rows : [];
}

async function publishedArticles() {
  const rows = await apiGet(
    'articles?select=id,title_id,status,published_at&status=eq.published&order=published_at.desc'
  );

  return Array.isArray(rows) ? rows : [];
}

/** Hapus berkas uji dari bucket Storage (lewat service role). */
async function removeStorageFiles(paths) {
  if (!paths.length) return;

  const headers = serviceHeaders({ 'Content-Type': 'application/json' });

  for (let attempt = 0; attempt < 3; attempt++) {
    await fetch(process.env.SUPABASE_URL + '/storage/v1/object/media', {
      method: 'DELETE',
      headers,
      body: JSON.stringify({ prefixes: paths })
    });

    const remaining = [];

    for (const file of paths) {
      const folder = file.split('/').slice(0, -1).join('/') + '/';

      const listed = await fetch(
        process.env.SUPABASE_URL + '/storage/v1/object/list/media',
        { method: 'POST', headers, body: JSON.stringify({ prefix: folder, limit: 1000 }) }
      );

      const rows = await listed.json();

      if (Array.isArray(rows) && rows.some((row) => folder + row.name === file)) {
        remaining.push(file);
      }
    }

    if (!remaining.length) return;
  }
}

/** Bersihkan artikel uji + berkas medianya. */
async function cleanup() {
  for (const id of created.articles) {
    const rows = await mediaRows(id);

    rows.forEach((row) => {
      if (row.path) created.files.push(row.path);
      if (row.poster_path) created.files.push(row.poster_path);
    });

    await apiDelete('article_media?article_id=eq.' + id);
    await apiDelete('articles?id=eq.' + id);
  }

  await removeStorageFiles(created.files);
}

/* ------------------------------------------------------------------------ */
/*  Bantuannya di dalam browser                                              */
/* ------------------------------------------------------------------------ */

/** Hasil base64 dari browser -> payload setInputFiles. */
function toUploadFile(file) {
  return {
    name: file.name,
    mimeType: file.mimeType,
    buffer: Buffer.from(file.base64, 'base64')
  };
}

/** Beberapa gambar PNG dummy yang berbeda warna. */
async function makeImages(page, count) {
  return page.evaluate(async (total) => {
    const files = [];

    for (let i = 0; i < total; i++) {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;

      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'rgb(' + (40 + i * 60) + ',120,200)';
      ctx.fillRect(0, 0, 640, 480);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(40 + i * 30, 120, 180, 180);

      const dataUrl = canvas.toDataURL('image/png');

      files.push({
        name: 'foto-uji-' + (i + 1) + '.png',
        mimeType: 'image/png',
        base64: dataUrl.split(',')[1]
      });
    }

    return files;
  }, count);
}

/** Video webm dummy dengan bingkai berwarna (bisa didekode browser). */
async function makeVideo(page, tone) {
  const result = await page.evaluate(async (value) => {
    if (!window.MediaRecorder) return null;

    const canvas = document.createElement('canvas');
    canvas.width = 480;
    canvas.height = 360;

    const ctx = canvas.getContext('2d');
    const stream = canvas.captureStream(25);

    const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
      ? 'video/webm;codecs=vp8'
      : 'video/webm';

    const chunks = [];
    const recorder = new MediaRecorder(stream, { mimeType: mime });

    recorder.ondataavailable = (event) => chunks.push(event.data);
    recorder.start();

    let frame = 0;

    const timer = setInterval(() => {
      frame += 1;

      ctx.fillStyle = 'rgb(' + (200 - value * 40) + ',' + (60 + value * 70) + ',90)';
      ctx.fillRect(0, 0, 480, 360);

      ctx.fillStyle = '#ffd84d';
      ctx.beginPath();
      ctx.arc(120 + frame * 6, 180, 46, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(260, 120, 160, 120);
    }, 40);

    await new Promise((resolve) => setTimeout(resolve, 1600));

    clearInterval(timer);

    const blob = await new Promise((resolve) => {
      recorder.onstop = () => resolve(new Blob(chunks, { type: mime }));
      recorder.stop();
    });

    const buffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = '';

    for (let k = 0; k < bytes.length; k++) binary += String.fromCharCode(bytes[k]);

    return {
      name: 'video-uji-' + value + '.webm',
      mimeType: 'video/webm',
      base64: btoa(binary)
    };
  }, tone);

  return result;
}

async function loginAdmin(page, base) {
  await page.goto(base + '/admin/login.html', { waitUntil: 'domcontentloaded' });
  await page.fill('#email', 'admin@ypinurulilmi.or.id');
  await page.fill('#password', process.env.SUPABASE_ADMIN_PASSWORD);
  await page.click('#login-submit');

  /* Tunggu sampai halaman berpindah (jaringan bisa lambat). */
  await page.waitForURL((url) => !url.href.includes('login.html'), { timeout: 25000 })
    .catch(() => {});

  await page.waitForTimeout(1200);

  if (page.url().includes('login.html')) {
    const pesan = await page.locator('[data-form-error], .alert, .ni-flash').first().innerText().catch(() => '');
    throw new Error('login admin gagal: ' + (pesan || 'tetap di halaman login').trim());
  }

  return !page.url().includes('login.html');
}

/**
 * Buat artikel lewat form admin.
 *
 * @returns {Promise<number|null>} id artikel yang tersimpan
 */
async function createArticle(page, base, options) {
  await page.goto(base + '/admin/article-form.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  await page.fill('#title_id', options.title);
  await page.fill('#content_id', options.content || options.title + ' — isi artikel uji.');

  if (options.files && options.files.length) {
    await page.setInputFiles('#media', options.files);

    /* Tunggu pratinjau thumbnail video selesai dibuat. */
    await page.waitForTimeout(2500);
  }

  await page.click('#submit-article');

  /* Tunggu sampai halaman menunjukkan id artikel hasil simpan. */
  await page
    .waitForURL((url) => /[?&]id=\d+/.test(url.href), { timeout: 40000 })
    .catch(() => {});

  await page.waitForTimeout(1500);

  const url = page.url();
  const match = url.match(/[?&]id=(\d+)/);

  if (!match) return null;

  const id = Number(match[1]);
  created.articles.push(id);

  return id;
}

/** Buka form edit artikel yang sudah ada. */
async function openEditForm(page, base, id) {
  await page.goto(base + '/admin/article-form.html?id=' + id, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(
    () => {
      const field = document.getElementById('title_id');
      return field && field.value.length > 0;
    },
    null,
    { timeout: 15000 }
  );
  await page.waitForTimeout(800);
}

/* ------------------------------------------------------------------------ */

async function main() {
  const { chromium } = loadPlaywright();

  const server = await startServer();
  const port = server.address().port;
  const base = 'http://127.0.0.1:' + port;

  console.log('Uji sistem artikel (media + halaman publik) — YPI Nurul Ilmi');
  console.log('=======================================================');
  console.log('Server statis lokal : ' + base);
  console.log('');

  const executablePath = findInstalledChromium();
  const browser = await chromium.launch(executablePath ? { executablePath } : {});
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });

  const consoleErrors = [];
  const failedRequests = [];

  context.on('page', (page) => {
    page.on('console', (message) => {
      if (message.type() !== 'error') return;
      const text = message.text();
      if (isIgnorable(text)) return;
      if (/Failed to load resource/i.test(text)) return;
      consoleErrors.push(text);
    });

    page.on('pageerror', (error) => consoleErrors.push('pageerror: ' + error.message));

    page.on('requestfailed', (request) => {
      const text = request.url() + ' ' + (request.failure() || {}).errorText;
      if (isIgnorable(text)) return;
      failedRequests.push(text);
    });

    page.on('response', (response) => {
      if (/\/auth\/v1\/token\?grant_type=password/.test(response.url())) return;
      if (response.status() >= 400) {
        failedRequests.push('HTTP ' + response.status() + ' ' + response.url());
      }
    });
  });

  const page = await context.newPage();

  try {
    /* =============================================================== */
    console.log('A. MATRIKS MEDIA');
    console.log('');

    const loggedIn = await loginAdmin(page, base);
    check('A0 login admin berhasil', loggedIn, page.url());

    const images3 = (await makeImages(page, 3)).map(toUploadFile);
    const video1 = toUploadFile(await makeVideo(page, 1));
    const video2 = toUploadFile(await makeVideo(page, 2));

    if (!video1 || !video2) {
      throw new Error('Browser tidak bisa merekam video uji (MediaRecorder tidak tersedia).');
    }

    const marker = 'Uji artikel ' + Date.now();

    /* --- A1: satu foto --- */
    const id1 = await createArticle(page, base, {
      title: marker + ' — satu foto',
      files: [images3[0]]
    });

    check('A1 artikel satu foto tersimpan', Boolean(id1), 'id=' + id1);

    if (id1) {
      const rows = await mediaRows(id1);
      check('A1 tepat satu media bertipe image', rows.length === 1 && rows[0].type === 'image',
        JSON.stringify(rows.map((r) => r.type)));

      await page.goto(base + '/article.html?id=' + id1, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);

      const layout = await page.locator('#article-media .article-gallery').getAttribute('data-count');
      const items = await page.locator('#article-media .article-gallery-item').count();
      check('A1 galeri menampilkan satu foto', items === 1 && layout === '1', 'count=' + layout);
    }

    /* --- A2: beberapa foto --- */
    const id2 = await createArticle(page, base, {
      title: marker + ' — tiga foto',
      files: [images3[0], images3[1], images3[2]]
    });

    check('A2 artikel tiga foto tersimpan', Boolean(id2), 'id=' + id2);

    if (id2) {
      const rows = await mediaRows(id2);
      check('A2 tiga baris media tersimpan', rows.length === 3, rows.length + ' baris');
      check('A2 semua media bertipe image', rows.every((r) => r.type === 'image'),
        rows.map((r) => r.type).join(','));

      const order = rows.map((r) => r.sort_order).join(',');
      check('A2 urutan unggahan terjaga', order === '0,1,2', 'sort_order=' + order);

      await page.goto(base + '/article.html?id=' + id2, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);

      const items = await page.locator('#article-media .article-gallery-item').count();
      const layout = await page.locator('#article-media .article-gallery').getAttribute('data-count');
      const images = await page.locator('#article-media .article-gallery-item img').count();
      check('A2 galeri menampilkan tiga foto', items === 3 && layout === '3' && images === 3,
        items + ' sel, layout=' + layout + ', gambar=' + images);
    }

    /* --- A3: video saja --- */
    const id3 = await createArticle(page, base, {
      title: marker + ' — video saja',
      files: [video1]
    });

    check('A3 artikel video tersimpan', Boolean(id3), 'id=' + id3);

    let posterPath = null;

    if (id3) {
      const rows = await mediaRows(id3);
      check('A3 satu baris media bertipe video', rows.length === 1 && rows[0].type === 'video',
        JSON.stringify(rows.map((r) => r.type)));

      posterPath = rows[0] && rows[0].poster_path;
      check('A3 thumbnail video otomatis terbentuk', Boolean(posterPath), 'poster_path=' + posterPath);

      if (posterPath) {
        const head = await fetch(process.env.SUPABASE_URL + '/storage/v1/object/public/media/' + posterPath);
        check('A3 berkas thumbnail bisa diambil publik', head.ok, 'HTTP ' + head.status);

        const type = head.headers.get('content-type') || '';
        check('A3 berkas thumbnail berupa gambar', /^image\//.test(type), type);
      }

      await page.goto(base + '/article.html?id=' + id3, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const videos = await page.locator('#article-media video').count();
      const imgs = await page.locator('#article-media img').count();
      const poster = await page.locator('#article-media video').first().getAttribute('poster');

      check('A3 halaman detail memutar video (bukan gambar)', videos === 1 && imgs === 0,
        videos + ' video, ' + imgs + ' gambar');
      check('A3 video memakai thumbnail sebagai poster', Boolean(poster), poster || '(tidak ada)');

      /* Kartu di daftar artikel memakai thumbnail video sebagai sampul. */
      await page.goto(base + '/blog.html', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1800);

      const cardBackground = await page.evaluate((title) => {
        const cards = Array.from(document.querySelectorAll('#article-list .blog-entry'));
        const card = cards.find((node) => (node.textContent || '').includes(title));

        if (!card) return null;

        const link = card.querySelector('.block-20');

        return link ? link.style.backgroundImage : null;
      }, marker + ' — video saja');

      check('A3 kartu daftar memakai thumbnail video', Boolean(cardBackground && cardBackground.indexOf('thumb-') !== -1),
        cardBackground || '(tidak ada)');
    }

    /* --- A4: foto + video, urutan terjaga --- */
    const id4 = await createArticle(page, base, {
      title: marker + ' — foto dan video',
      files: [images3[0], video1, images3[1]]
    });

    check('A4 artikel foto dan video tersimpan', Boolean(id4), 'id=' + id4);

    if (id4) {
      const rows = await mediaRows(id4);
      const types = rows.map((r) => r.type).join(',');

      check('A4 tiga baris media (image, video, image)', rows.length === 3 && types === 'image,video,image', types);
      check('A4 thumbnail video ikut tersimpan', Boolean(rows[1] && rows[1].poster_path),
        'poster_path=' + (rows[1] && rows[1].poster_path));

      await page.goto(base + '/article.html?id=' + id4, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const order = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('#article-media .article-gallery-item'))
          .map((node) => (node.querySelector('video') ? 'video' : 'image'));
      });

      check('A4 urutan media di halaman detail terjaga',
        JSON.stringify(order) === JSON.stringify(['image', 'video', 'image']),
        order.join(','));
    }

    /* --- A5: mengganti video --- */
    if (id3) {
      await openEditForm(page, base, id3);

      const before = await mediaRows(id3);
      const beforePoster = before[0] && before[0].poster_path;

      /* Centang hapus pada video lama, lalu unggah video baru. */
      await page.locator('#media-list [data-media-remove]').first().check();
      await page.setInputFiles('#media', [video2]);
      await page.waitForTimeout(2500);

      await page.click('#submit-article');

      /* Pada mode edit URL sudah memuat ?id=, jadi tandai simpan selesai
         dengan menunggu halaman daftar artikel. */
      await page
        .waitForURL((url) => url.href.includes('articles.html'), { timeout: 40000 })
        .catch(() => {});

      await page.waitForTimeout(1500);

      const after = await mediaRows(id3);

      check('A5 video lama diganti video baru', after.length === 1 && after[0].path !== before[0].path,
        after.length + ' baris');
      check('A5 thumbnail diperbarui saat video diganti',
        Boolean(after[0] && after[0].poster_path) && after[0].poster_path !== beforePoster,
        'sebelum=' + beforePoster + ', sesudah=' + (after[0] && after[0].poster_path));

      if (after[0] && after[0].poster_path) {
        const head = await fetch(process.env.SUPABASE_URL + '/storage/v1/object/public/media/' + after[0].poster_path);
        check('A5 thumbnail baru bisa diambil publik', head.ok, 'HTTP ' + head.status);
      }
    }

    /* --- A6: edit tanpa mengganti media --- */
    if (id2) {
      await openEditForm(page, base, id2);

      const before = await mediaRows(id2);

      await page.fill('#title_id', marker + ' — tiga foto (diedit)');
      await page.click('#submit-article');
      await page.waitForURL((url) => url.href.includes('articles.html'), { timeout: 40000 }).catch(() => {});
      await page.waitForTimeout(1500);

      const after = await mediaRows(id2);

      check('A6 jumlah media tidak berubah setelah edit', after.length === before.length,
        before.length + ' -> ' + after.length);

      const sameIds = before.every((row) => after.some((now) => now.id === row.id));
      check('A6 media lama tetap ada (tidak hilang)', sameIds,
        before.map((r) => r.id).join(',') + ' -> ' + after.map((r) => r.id).join(','));

      const article = await apiGet('articles?id=eq.' + id2 + '&select=title_id');
      check('A6 perubahan judul tersimpan',
        article[0] && String(article[0].title_id).indexOf('(diedit)') !== -1,
        article[0] ? article[0].title_id : '(tidak ada)');
    }

    /* --- A7: regenerasi thumbnail untuk video lama --- */
    if (id3) {
      const videoRow = (await mediaRows(id3)).find((row) => row.type === 'video');

      if (videoRow) {
        /* Simulasikan artikel lama: video ada, thumbnail belum ada. */
        await apiPatch('article_media?id=eq.' + videoRow.id, { poster_path: null });

        const cleared = (await mediaRows(id3)).find((row) => row.id === videoRow.id);

        check('A7 video lama disimulasikan tanpa thumbnail',
          Boolean(cleared) && !cleared.poster_path,
          'media ' + videoRow.id);

        await openEditForm(page, base, id3);

        const button = '[data-media-thumbnail="' + videoRow.id + '"]';
        const buttonCount = await page.locator(button).count();

        check('A7 tombol "Buat thumbnail" muncul untuk video lama', buttonCount === 1,
          'tombol=' + buttonCount);

        if (buttonCount) {
          await page.click(button);
          await page.waitForTimeout(7000);

          const regenerated = (await mediaRows(id3)).find((row) => row.id === videoRow.id);

          check('A7 thumbnail berhasil dibuat dari video lama',
            Boolean(regenerated && regenerated.poster_path),
            'poster_path=' + (regenerated ? regenerated.poster_path : '(tidak ada)'));

          check('A7 file video lama tidak berubah saat thumbnail dibuat',
            Boolean(regenerated) && regenerated.path === videoRow.path,
            regenerated ? regenerated.path : '(tidak ada)');

          if (regenerated && regenerated.poster_path) {
            const head = await fetch(
              process.env.SUPABASE_URL + '/storage/v1/object/public/media/' + regenerated.poster_path
            );
            const type = head.headers.get('content-type') || '';

            check('A7 thumbnail hasil regenerasi bisa diambil publik',
              head.ok && /image\//.test(type),
              'HTTP ' + head.status + ' ' + type);
          }
        }
      }
    }

    /* =============================================================== */
    console.log('');
    console.log('B. HALAMAN PUBLIK');
    console.log('');

    const before2 = { console: consoleErrors.length, failed: failedRequests.length };

    await page.goto(base + '/blog.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const listed = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('#article-list .blog-entry h3')).map((node) =>
        node.textContent.trim()
      );
    });

    const published = await publishedArticles();
    const publishedTitles = published.map((row) => row.title_id);

    check('B1 daftar artikel menampilkan semua artikel published',
      publishedTitles.every((title) => listed.indexOf(title) !== -1),
      'expected=' + publishedTitles.length + ', tampil=' + listed.length);

    check('B2 tidak ada artikel dummy di daftar publik',
      listed.every((title) => title !== 'x' && title !== 'y' && title.length > 2),
      listed.join(' | ').slice(0, 160));

    check('B3 artikel draft tidak tampil di daftar publik',
      listed.indexOf('x') === -1, listed.join(' | ').slice(0, 120));

    /* Kartu harus benar-benar terlihat, bukan hanya ada di DOM.
       Elemen `.ftco-animate` disembunyikan CSS sampai animasi masuk, jadi
       daftarnya digulir seperti pengguna sebelum diperiksa. */
    await page.evaluate(() => {
      const list = document.getElementById('article-list');

      if (list) list.scrollIntoView({ block: 'start' });
    });

    await page.waitForTimeout(1200);

    for (let step = 0; step < 6; step++) {
      await page.mouse.move(640, 400);
      await page.mouse.wheel(0, 500);
      await page.waitForTimeout(500);
    }

    await page.waitForTimeout(1500);

    const visibility = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('#article-list .blog-entry'));

      return cards.map((card) => {
        const box = card.closest('.ftco-animate') || card;
        const style = window.getComputedStyle(box);

        return {
          kelas: box.className,
          opacity: style.opacity,
          visibility: style.visibility
        };
      });
    });

    const hidden = visibility.filter(
      (item) => item.visibility === 'hidden' || Number(item.opacity) < 0.9
    );

    check('B1b kartu artikel benar-benar terlihat (bukan opacity 0)',
      visibility.length > 0 && hidden.length === 0,
      hidden.length ? JSON.stringify(hidden[0]) : visibility.length + ' kartu terlihat');

    /* Setiap kartu membuka detail yang benar. */
    if (listed.length) {
      const href = await page.evaluate(() => {
        const link = document.querySelector('#article-list .blog-entry h3 a');
        return link ? link.getAttribute('href') : '';
      });

      check('B4 kartu artikel punya tautan detail', /article\.html\?id=\d+/.test(href), href);

      await page.goto(base + '/' + href, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);

      const detailTitle = (await page.locator('#article-title').innerText()).trim();
      check('B4 detail artikel sesuai dengan kartu yang diklik',
        detailTitle.length > 0 && listed.indexOf(detailTitle) !== -1, detailTitle.slice(0, 70));
    }

    /* Pencarian. */
    await page.goto(base + '/blog.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1800);

    await page.fill('#article-search', marker);
    await page.waitForTimeout(1500);

    const searched = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('#article-list .blog-entry h3')).map((node) =>
        node.textContent.trim()
      );
    });

    check('B5 pencarian menyaring daftar artikel',
      searched.length > 0 && searched.every((title) => title.indexOf(marker) !== -1),
      searched.length + ' hasil');

    /* Pencarian tanpa hasil. */
    await page.fill('#article-search', 'zzzz-tidak-ada-artikel-ini');
    await page.waitForTimeout(1500);

    const emptyText = (await page.locator('#article-list').innerText()).trim();
    check('B6 pencarian tanpa hasil menampilkan pesan yang jelas',
      /tidak ditemukan/i.test(emptyText), emptyText.slice(0, 90));

    /* Filter kategori. */
    await page.goto(base + '/blog.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1800);

    const categories = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('#article-category option')).map((node) => ({
        value: node.value,
        text: node.textContent.trim()
      })).filter((row) => row.value);
    });

    /* Pilih kategori yang memang dipakai artikel published, supaya hasil
       filter bisa dibandingkan dengan data yang diharapkan. */
    const withCategory = await apiGet(
      'articles?select=id,title_id,category_id&status=eq.published&category_id=not.is.null'
    );

    const expectedCategory = Array.isArray(withCategory) ? withCategory : [];
    const categoryId = expectedCategory.length ? String(expectedCategory[0].category_id) : '';
    const expectedTitles = expectedCategory
      .filter((row) => String(row.category_id) === categoryId)
      .map((row) => row.title_id);

    if (categories.length && categoryId) {
      await page.selectOption('#article-category', categoryId);
      await page.waitForTimeout(1500);

      const filtered = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('#article-list .blog-entry h3')).map((node) =>
          node.textContent.trim()
        );
      });

      check('B7 filter kategori berjalan dan tepat',
        filtered.length === expectedTitles.length &&
          expectedTitles.every((title) => filtered.indexOf(title) !== -1),
        'kategori id=' + categoryId + ', diharapkan ' + expectedTitles.length +
        ', tampil ' + filtered.length);

      await page.selectOption('#article-category', '');
      await page.waitForTimeout(1200);
    } else {
      notes.push('Filter kategori tidak diuji: tidak ada artikel berkategori.');
    }

    /* Filter tag. */
    const tags = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('#article-tag option')).map((node) => ({
        value: node.value,
        text: node.textContent.trim()
      })).filter((row) => row.value);
    });

    const withTag = await apiGet(
      'articles?select=id,title_id,article_tags(tag_id)&status=eq.published'
    );

    const tagged = (Array.isArray(withTag) ? withTag : []).filter((row) => {
      return (row.article_tags || []).length > 0;
    });

    const tagId = tagged.length ? String(tagged[0].article_tags[0].tag_id) : '';
    const expectedTagTitles = tagged
      .filter((row) => row.article_tags.some((t) => String(t.tag_id) === tagId))
      .map((row) => row.title_id);

    if (tags.length && tagId) {
      await page.selectOption('#article-tag', tagId);
      await page.waitForTimeout(1500);

      const filtered = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('#article-list .blog-entry h3')).map((node) =>
          node.textContent.trim()
        );
      });

      check('B8 filter tag berjalan dan tepat',
        filtered.length === expectedTagTitles.length &&
          expectedTagTitles.every((title) => filtered.indexOf(title) !== -1),
        'tag id=' + tagId + ', diharapkan ' + expectedTagTitles.length +
        ', tampil ' + filtered.length);

      await page.selectOption('#article-tag', '');
      await page.waitForTimeout(1200);
    } else {
      notes.push('Filter tag tidak diuji: tidak ada artikel bertag.');
    }

    /* Beranda memakai sumber yang sama. */
    await page.goto(base + '/index.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const homeTitles = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('[data-recent-blog] .heading a')).map((node) =>
        node.textContent.trim()
      );
    });

    check('B9 Recent Blog di beranda memakai sumber data yang sama',
      homeTitles.length > 0 && homeTitles.every((title) => publishedTitles.indexOf(title) !== -1),
      homeTitles.join(' | ').slice(0, 140));

    check('B10 tidak ada teks dummy di Recent Blog',
      homeTitles.every((title) => title !== 'x' && title !== 'y'),
      homeTitles.join(' | ').slice(0, 100));

    check('B11 tidak ada artikel duplikat di Recent Blog',
      new Set(homeTitles).size === homeTitles.length,
      homeTitles.join(' | ').slice(0, 140));

    /* Halaman detail: isi lengkap. */
    await page.goto(base + '/article.html?id=' + id2, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1800);

    const detail = await page.evaluate(() => {
      const meta = document.getElementById('article-meta');
      const back = document.querySelector('.article-back a');

      return {
        title: (document.getElementById('article-title').textContent || '').trim(),
        content: (document.getElementById('article-content').textContent || '').trim(),
        meta: (meta ? meta.textContent : '').replace(/\s+/g, ' ').trim(),
        media: document.querySelectorAll('#article-media .article-gallery-item').length,
        back: back ? back.getAttribute('href') : ''
      };
    });

    check('B12 detail menampilkan judul, isi, dan metadata',
      detail.title.length > 3 && detail.content.length > 5 && detail.meta.length > 5,
      'meta="' + detail.meta.slice(0, 90) + '"');

    check('B13 detail menampilkan media', detail.media === 3, detail.media + ' sel');
    check('B14 detail menyediakan navigasi kembali', /blog\.html/.test(detail.back), detail.back || '(tidak ada)');

    /* Lightbox. */
    await page.locator('#article-media .article-gallery-item').first().click();
    await page.waitForTimeout(800);

    const lightboxOpen = await page.locator('.ni-lightbox').count();
    check('B15 lightbox terbuka saat foto diklik', lightboxOpen === 1, lightboxOpen + ' lightbox');

    if (lightboxOpen) {
      await page.click('.ni-lightbox-next');
      await page.waitForTimeout(500);

      const caption = (await page.locator('.ni-lightbox-caption').innerText()).trim();
      check('B16 navigasi lightbox bergerak ke media berikutnya', /2 dari 3/.test(caption), caption);

      await page.click('.ni-lightbox-close');
      await page.waitForTimeout(500);

      check('B17 lightbox bisa ditutup', (await page.locator('.ni-lightbox').count()) === 0);
    }

    /* Tampilan ponsel. */
    const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

    for (const url of ['/blog.html', '/article.html?id=' + id2, '/index.html']) {
      const mobilePage = await mobile.newPage();
      await mobilePage.goto(base + url, { waitUntil: 'domcontentloaded' });
      await mobilePage.waitForTimeout(1500);

      const overflow = await mobilePage.evaluate(() => {
        return document.documentElement.scrollWidth - window.innerWidth;
      });

      check('B18 halaman ponsel tidak meluber (' + url + ')', overflow <= 2, 'luar ' + overflow + 'px');

      await mobilePage.close();
    }

    await mobile.close();

    const newConsole = consoleErrors.slice(before2.console);
    const newFailed = failedRequests.slice(before2.failed);

    check('B19 tidak ada error console di halaman publik',
      newConsole.length === 0, newConsole.slice(0, 3).join(' | ').slice(0, 220));

    check('B20 tidak ada permintaan jaringan gagal di halaman publik',
      newFailed.length === 0, newFailed.slice(0, 3).join(' | ').slice(0, 220));
  } finally {
    console.log('');
    console.log('C. PEMBERSIHAN');
    console.log('');

    await cleanup().catch((error) => {
      check('C0 pembersihan tidak gagal', false, error.message);
    });

    const leftovers = await apiGet('articles?select=id,title_id&title_id=like.Uji%20artikel%');
    check('C1 tidak ada artikel uji yang tertinggal', !leftovers.length,
      leftovers.length + ' artikel tersisa');

    const files = await fetch(
      process.env.SUPABASE_URL + '/storage/v1/object/list/media',
      {
        method: 'POST',
        headers: serviceHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ prefix: 'umum/artikel/', limit: 1000 })
      }
    ).then((response) => response.json());

    const stale = Array.isArray(files)
      ? files.filter((row) => /foto-uji|video-uji/.test(row.name))
      : [];

    check('C2 tidak ada berkas uji yang tertinggal di Storage', stale.length === 0,
      stale.length + ' berkas');

    await context.close();
    await browser.close();
    server.close();
  }

  console.log('');
  console.log('RINGKASAN');
  console.log('');

  notes.forEach((note) => console.log('  CATATAN  ' + note));

  if (failures.length) {
    console.log('  ' + failures.length + ' pemeriksaan gagal:');
    failures.forEach((failure) => console.log('    - ' + failure));
    process.exitCode = 1;
  } else {
    console.log('  Semua pemeriksaan lulus.');
  }
}

main().catch((error) => {
  console.error('Gagal: ' + error.message);
  process.exit(1);
});
