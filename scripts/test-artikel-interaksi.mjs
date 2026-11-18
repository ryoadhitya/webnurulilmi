/* ==========================================================================
   UJI BROWSER — INTERAKSI HALAMAN ARTIKEL
   --------------------------------------------------------------------------
   Menguji halaman artikel.html?id=<id> di Chromium sungguhan:

     1. Header artikel: breadcrumb, kategori, judul (tidak terpotong),
        meta tanggal/penulis, dan featured image + galeri.
     2. Like artikel: klik -> jumlah naik, status bertahan setelah reload,
        klik lagi -> batal, dan data like dibersihkan setelah uji.
     3. Share: tautan yang disalin harus URL artikel, bukan localhost.
     4. Komentar: avatar, konter karakter, emoji picker, kirim komentar
        -> langsung tayang tanpa refresh, jumlah komentar ikut berubah.
     5. Responsif: desktop, tablet, ponsel, tanpa overflow horizontal.

   Jalankan:
     node scripts/test-artikel-interaksi.mjs
   ========================================================================== */
import { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execSync } from 'node:child_process';

import { ROOT } from './lib/env.mjs';
import { selectRows, request } from './lib/supabase-rest.mjs';

const require = createRequire(import.meta.url);
const BASE = process.env.BASE_URL || 'http://127.0.0.1:8123';
const ARTICLE_ID = Number(process.env.ARTICLE_ID || 98);
const SHOTS = path.join(ROOT, 'docs', 'qc');
const TEST_NAME = 'Uji Otomatis QCA';

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

async function main() {
  if (!fs.existsSync(SHOTS)) fs.mkdirSync(SHOTS, { recursive: true });

  /* Baris rate limit yang sudah ada sebelum tes, supaya Cleanup tahu
     baris mana yang dibuat oleh tes ini. */
  const rateLimitAwal = (await selectRows('comment_rate_limits', {})).rows.map((row) => row.id);
  const likeRateAwal = (await selectRows('like_rate_limits', {})).rows.map((row) => row.id);

  const playwright = loadPlaywright();
  const executablePath = findChromium();

  const browser = await playwright.chromium.launch({
    headless: true,
    executablePath: executablePath || undefined
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    permissions: ['clipboard-read', 'clipboard-write']
  });

  const page = await context.newPage();
  const consoleErrors = [];
  const failedRequests = [];

  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  page.on('response', (response) => {
    if (response.status() >= 400) {
      failedRequests.push(response.status() + ' ' + response.url());
    }
  });

  const url = BASE + '/article.html?id=' + ARTICLE_ID;

  /* ---------------- 1. HEADER ARTIKEL ---------------- */
  console.log('');
  console.log('== Header artikel ==');

  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  const header = await page.evaluate(() => {
    const title = document.querySelector('#article-title');
    const meta = document.querySelector('#article-meta');
    const style = window.getComputedStyle(title);

    return {
      title: title.textContent.trim(),
      titleLoading: title.textContent.trim() === 'Memuat artikel...',
      titleClipped: title.scrollHeight > title.clientHeight + 1,
      titleOverflow: style.overflow,
      titleClamp: style.webkitLineClamp || style.lineClamp || 'none',
      titleHeight: title.clientHeight,
      metaItems: meta.querySelectorAll('.article-meta-item').length,
      metaText: meta.textContent.replace(/\s+/g, ' ').trim(),
      breadcrumb: document.querySelector('.article-breadcrumb').textContent.replace(/\s+/g, ' ').trim(),
      categoryVisible: !document.querySelector('#article-category-wrap').hidden,
      category: document.querySelector('#article-category').textContent.trim(),
      featuredHidden: document.querySelector('#article-featured').hidden,
      featuredImage: (() => {
        const img = document.querySelector('#article-featured .article-featured-image');
        if (!img) return null;
        return { w: img.naturalWidth, h: img.naturalHeight, ratio: img.clientWidth / img.clientHeight };
      })(),
      galleryItems: document.querySelectorAll('#article-media .article-gallery-item').length,
      contentLength: document.querySelector('#article-content').textContent.trim().length
    };
  });

  check('judul artikel terisi', header.title.length > 5 && !header.titleLoading, header.title);
  check('judul tidak terpotong (tidak ada tinggi tetap/clip)', !header.titleClipped,
    'overflow=' + header.titleOverflow + ', clamp=' + header.titleClamp);
  check('meta artikel terisi (tanggal, penulis, komentar, dibaca)',
    header.metaItems >= 4 && /dibaca/.test(header.metaText), header.metaText);
  check('breadcrumb memuat kategori', header.breadcrumb.length > 10, header.breadcrumb);
  check('kategori artikel tampil', header.categoryVisible, header.category);
  check('isi artikel terisi', header.contentLength > 20, String(header.contentLength));
  check('featured image tampil dan proporsional',
    header.featuredHidden === false &&
    header.featuredImage &&
    header.featuredImage.w > 0 &&
    header.featuredImage.ratio > 0.5 && header.featuredImage.ratio < 2.5,
    JSON.stringify(header.featuredImage));
  check('galeri menampilkan sisa media', header.galleryItems >= 1, String(header.galleryItems));

  await page.screenshot({ path: path.join(SHOTS, 'artikel-header-desktop.png'), fullPage: false });

  /* ---------------- 2. LIKE ARTIKEL ---------------- */
  console.log('');
  console.log('== Like artikel ==');

  await page.waitForFunction(() => {
    const el = document.querySelector('#article-like-count');
    return el && el.textContent.trim() !== '';
  }, null, { timeout: 10000 });

  const before = await page.textContent('#article-like-count');

  await page.click('#article-like');
  await page.waitForTimeout(900);

  const afterLike = await page.evaluate(() => {
    const button = document.querySelector('#article-like');

    return {
      count: document.querySelector('#article-like-count').textContent.trim(),
      liked: button.classList.contains('is-liked'),
      pressed: button.getAttribute('aria-pressed')
    };
  });

  check('klik like menambah jumlah', Number(afterLike.count) === Number(before) + 1,
    before + ' -> ' + afterLike.count);
  check('tombol like ditandai aktif', afterLike.liked && afterLike.pressed === 'true',
    JSON.stringify(afterLike));

  /* Status_like harus bertahan setelah halaman dimuat ulang. */
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1400);

  const afterReload = await page.evaluate(() => {
    const button = document.querySelector('#article-like');

    return {
      count: document.querySelector('#article-like-count').textContent.trim(),
      liked: button.classList.contains('is-liked')
    };
  });

  check('status like bertahan setelah reload',
    afterReload.liked && Number(afterReload.count) === Number(afterLike.count),
    JSON.stringify(afterReload));

  const visitorId = await page.evaluate(() => window.localStorage.getItem('ni-visitor-id'));

  check('identitas anonim pengunjung tersimpan', !!visitorId, String(visitorId));

  /* Klik lagi untuk membatalkan like. */
  await page.click('#article-like');
  await page.waitForTimeout(900);

  const afterUnlike = await page.evaluate(() => ({
    count: document.querySelector('#article-like-count').textContent.trim(),
    liked: document.querySelector('#article-like').classList.contains('is-liked')
  }));

  check('klik kedua membatalkan like',
    !afterUnlike.liked && Number(afterUnlike.count) === Number(before),
    JSON.stringify(afterUnlike));

  /* ---------------- 3. SHARE ---------------- */
  console.log('');
  console.log('== Share ==');

  /* Jalur 1: Web Share API. navigator.share diganti supaya payload-nya
     bisa diperiksa tanpa membuka sheet share sistem. */
  const nativeShare = await page.evaluate(async () => {
    let captured = null;

    navigator.share = (data) => {
      captured = data;
      return Promise.resolve();
    };

    document.querySelector('#article-share').click();

    await new Promise((resolve) => setTimeout(resolve, 400));

    return captured;
  });

  check('Web Share API menerima judul dan tautan artikel',
    nativeShare &&
    nativeShare.url.includes('article.html?id=' + ARTICLE_ID) &&
    !nativeShare.url.includes('localhost') &&
    !nativeShare.url.includes('127.0.0.1'),
    JSON.stringify(nativeShare));

  const shareToast = await page.evaluate(() => {
    const toast = document.querySelector('.ni-toast');

    return toast ? toast.textContent.trim() : '';
  });

  check('umpan balik setelah share tampil', shareToast.length > 0, shareToast);

  /* Jalur 2: cadangan salin tautan (Web Share API tidak tersedia). */
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'share', {
      value: undefined,
      configurable: true
    });

    document.querySelectorAll('.ni-toast').forEach((el) => el.remove());
  });

  await page.click('#article-share');
  await page.waitForTimeout(1000);

  const copy = await page.evaluate(() => {
    const toast = document.querySelector('.ni-toast');

    return {
      toast: toast ? toast.textContent.trim() : '',
      toastError: toast ? toast.classList.contains('is-error') : false
    };
  });

  const clipboard = await page.evaluate(() => navigator.clipboard.readText().catch(() => ''));

  check('cadangan salin tautan menampilkan umpan balik',
    /disalin/i.test(copy.toast), copy.toast);
  check('cadangan salin tautan tidak error', !copy.toastError, copy.toast);
  check('tautan yang disalin adalah URL artikel',
    clipboard.includes('article.html?id=' + ARTICLE_ID) &&
    !clipboard.includes('127.0.0.1'),
    clipboard);

  /* ---------------- 4. KOMENTAR ---------------- */
  console.log('');
  console.log('== Komentar ==');

  const commentBefore = Number(await page.textContent('#comment-count')) || 0;

  await page.fill('#comment-name', TEST_NAME);
  await page.waitForTimeout(200);

  const avatarText = await page.textContent('#comment-avatar');

  check('avatar mengikuti nama yang diketik', avatarText.trim() === 'UO', avatarText.trim());

  await page.fill('#comment-message', 'Komentar dari uji otomatis: '
    + 'membuka artikel, menguji like, share, dan form komentar.');
  await page.waitForTimeout(200);

  const counter = await page.textContent('#comment-counter');

  check('penghitung karakter berjalan', /\/\s*2000$/.test(counter.trim()), counter);

  /* Emoji picker. */
  await page.click('#comment-emoji-toggle');
  await page.waitForTimeout(300);

  const pickerOpen = await page.evaluate(() => {
    const picker = document.querySelector('#comment-emoji-picker');

    return {
      visible: !picker.hidden,
      buttons: picker.querySelectorAll('.comment-emoji').length
    };
  });

  check('emoji picker terbuka', pickerOpen.visible, JSON.stringify(pickerOpen));
  check('emoji picker berisi pilihan', pickerOpen.buttons >= 12, String(pickerOpen.buttons));

  if (pickerOpen.visible) {
    await page.click('#comment-emoji-picker .comment-emoji');
    await page.waitForTimeout(300);

    const value = await page.inputValue('#comment-message');

    check('emoji tersisip di textarea', value.length > 10 && /[😀-🙏]/u.test(value), value);
  }

  /* Kirim komentar. */
  await page.click('#comment-submit');
  await page.waitForTimeout(2500);

  const afterComment = await page.evaluate(() => ({
    count: document.querySelector('#comment-count').textContent.trim(),
    alert: document.querySelector('#comment-alert').textContent.trim(),
    hasMine: Array.from(document.querySelectorAll('.comment-name'))
      .some((el) => el.textContent.trim() === 'Uji Otomatis QCA'),
    textLength: document.querySelector('#comment-message').value.length
  }));

  check('komentar baru langsung tayang tanpa refresh', afterComment.hasMine, JSON.stringify(afterComment));
  check('jumlah komentar bertambah',
    Number(afterComment.count) === commentBefore + 1,
    commentBefore + ' -> ' + afterComment.count);
  check('pesan sukses tampil', /terima kasih|tayang/i.test(afterComment.alert), afterComment.alert);
  check('textarea dikosongkan setelah kirim', afterComment.textLength === 0, String(afterComment.textLength));

  /* Like pada komentar. */
  const commentLike = await page.evaluate(() => {
    const button = document.querySelector('.comment-like');
    if (!button) return null;

    button.click();

    return { existed: true };
  });

  if (commentLike) {
    await page.waitForTimeout(1200);

    const likeState = await page.evaluate(() => {
      const button = document.querySelector('.comment-like');

      return {
        liked: button.classList.contains('is-liked'),
        count: button.querySelector('.comment-like-count').textContent.trim()
      };
    });

    check('like komentar tersimpan', likeState.liked && Number(likeState.count) >= 1,
      JSON.stringify(likeState));
  }

  await page.screenshot({ path: path.join(SHOTS, 'artikel-komentar-desktop.png'), fullPage: false });

  /* ---------------- 5. RESPONSIF ---------------- */
  console.log('');
  console.log('== Responsif ==');

  for (const width of [1920, 1280, 1024, 768, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.waitForTimeout(500);

    const layout = await page.evaluate(() => {
      const title = document.querySelector('#article-title');
      const form = document.querySelector('#comment-form');
      const formBox = form.getBoundingClientRect();

      return {
        overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        titleClipped: title.scrollHeight > title.clientHeight + 1,
        formVisible: formBox.width > 0 && formBox.height > 0,
        commentsWidth: document.querySelector('.comments-section').getBoundingClientRect().width
      };
    });

    check(width + 'px: tidak ada overflow horizontal', !layout.overflow,
      layout.scrollWidth + ' > ' + layout.innerWidth);
    check(width + 'px: judul tidak terpotong', !layout.titleClipped);
    check(width + 'px: form komentar tetap terlihat', layout.formVisible);
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SHOTS, 'artikel-mobile-390.png'), fullPage: false });

  /* ---------------- 6. KEBERSIHAN DATA ---------------- */
  console.log('');
  console.log('== Pembersihan data uji ==');

  const likes = await selectRows('article_likes', { article_id: 'eq.' + ARTICLE_ID });
  const mine = likes.rows.filter((row) => row.visitor_id === visitorId);

  for (const row of mine) {
    await request('/rest/v1/article_likes?id=eq.' + row.id, { method: 'DELETE' });
  }

  const commentLikes = await selectRows('comment_likes', {});
  const commentIds = (await selectRows('comments', {
    article_id: 'eq.' + ARTICLE_ID,
    name: 'eq.' + TEST_NAME
  })).rows.map((row) => row.id);

  /* Like komentar diuji pada komentar yang pertama tampil di halaman, yang
     belum tentu komentar milik tes ini. Karena itu baris like dihapus
     berdasarkan identitas pengunjung tes, bukan hanya berdasarkan komentar
     uji — supaya tidak ada like tertinggal pada komentar asli. */
  const commentLikesMine = commentLikes.rows.filter((row) => row.visitor_id === visitorId);

  for (const row of commentLikesMine) {
    await request('/rest/v1/comment_likes?id=eq.' + row.id, { method: 'DELETE' });
  }

  for (const id of commentIds) {
    await request('/rest/v1/comments?id=eq.' + id, { method: 'DELETE' });
  }

  /* Baris rate limit komentar ikut dibersihkan. Kalau tertinggal, tes
     berikutnya kehabisan jatah (maksimal 5 komentar per jam per IP) lalu
     gagal bukan karena ada masalah di situs. */
  const rateAkhir = await selectRows('comment_rate_limits', {});
  const rateBaru = rateAkhir.rows.filter((row) => rateLimitAwal.indexOf(row.id) === -1);

  for (const row of rateBaru) {
    await request('/rest/v1/comment_rate_limits?id=eq.' + row.id, { method: 'DELETE' });
  }

  /* Rate limit like juga dibersihkan. Kalau tertinggal, kuota 60 aksi like
     per jam per IP habis dipakai tes dan menggagalkan like asli pengunjung. */
  const likeRateAkhir = await selectRows('like_rate_limits', {});
  const likeRateBaru = likeRateAkhir.rows.filter((row) => likeRateAwal.indexOf(row.id) === -1);

  for (const row of likeRateBaru) {
    await request('/rest/v1/like_rate_limits?id=eq.' + row.id, { method: 'DELETE' });
  }

  console.log('  Like uji dihapus: ' + mine.length + ', like komentar dihapus: ' + commentLikesMine.length +
    ', komentar uji dihapus: ' + commentIds.length +
    ', baris rate limit dihapus: ' + rateBaru.length +
    ', baris rate limit like dihapus: ' + likeRateBaru.length);

  /* ---------------- 7. ERROR KONSOL ---------------- */
  console.log('');
  console.log('== Error konsol ==');

  /* Pesan "Failed to load resource" tidak menyebut URL-nya, jadi kegagalan
     sumber daya diperiksa lewat daftar respons (di atas). */
  const realErrors = consoleErrors.filter((text) => !/Failed to load resource/i.test(text));

  check('tidak ada error JavaScript di konsol', realErrors.length === 0, realErrors.join(' | '));

  const localFailures = failedRequests.filter((text) => text.indexOf(BASE) === 0);

  check('tidak ada sumber daya lokal yang gagal dimuat', localFailures.length === 0,
    localFailures.join(' | '));

  const externalFailures = failedRequests.filter((text) => text.indexOf(BASE) !== 0);

  if (externalFailures.length) {
    console.log('  Permintaan gagal dari luar proyek: ' + externalFailures.join(' | '));
  }

  await browser.close();

  console.log('');
  console.log('Total: ' + (passed + failed) + ' pemeriksaan, ' + passed + ' lulus, ' + failed + ' gagal.');

  if (failed) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
