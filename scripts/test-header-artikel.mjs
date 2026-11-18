/* ==========================================================================
   UJI BROWSER — HEADER, KOMENTAR, TERJEMAHAN
   --------------------------------------------------------------------------
   Menjalankan situs lewat server lokal dan membukanya di Chromium sungguhan:

     1. Header desktop pada beberapa lebar layar: cek tidak ada ikon login
        admin, logo Smart School memakai warna asli (tanpa filter), menu
        tidak menabrak logo, dan tidak ada overflow horizontal.
     2. Halaman artikel: form komentar hanya minta nama + komentar, dan
        komentar yang dikirim langsung muncul tanpa refresh.
     3. Terjemahan: pilih English -> judul & isi berubah, pilih Indonesia ->
        naskah asli kembali utuh.
     4. Tampilan mobile: hamburger, logo, dan form komentar.

   Jalankan:
     node scripts/test-header-artikel.mjs
   ========================================================================== */
import { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execSync } from 'node:child_process';

import { ROOT } from './lib/env.mjs';

const require = createRequire(import.meta.url);
const BASE = process.env.BASE_URL || 'http://127.0.0.1:8123';
const SHOTS = path.join(ROOT, 'docs', 'qc');

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

  /* ---------------- 1. HEADER DESKTOP ---------------- */
  console.log('');
  console.log('== Header desktop ==');

  const widths = [1920, 1440, 1280, 1024];

  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(BASE + '/index.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);

    await page.screenshot({
      path: path.join(SHOTS, 'header-' + width + '.png'),
      clip: { x: 0, y: 0, width, height: 220 }
    });

    const report = await page.evaluate(() => {
      const nav = document.querySelector('#ftco-navbar');
      const links = Array.from(document.querySelectorAll('#ftco-navbar .nav-link'));
      const logo = document.querySelector('.navbar-smartschool-logo img');
      const brand = document.querySelector('.navbar-brand-container');
      const navBox = nav.getBoundingClientRect();
      const logoBox = logo.getBoundingClientRect();
      const brandBox = brand.getBoundingClientRect();
      const linkBoxes = links.map((link) => {
        const box = link.getBoundingClientRect();
        return { text: link.textContent.trim(), left: box.left, right: box.right };
      });

      const style = window.getComputedStyle(logo);

      return {
        adminIcon: document.querySelectorAll('#ftco-navbar .navbar-admin-item').length,
        overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        navWidth: navBox.width,
        logoFilter: style.filter,
        logoHeight: logoBox.height,
        logoWidth: logoBox.width,
        logoRight: logoBox.right,
        brandRight: brandBox.right,
        firstLinkLeft: linkBoxes.length ? linkBoxes[0].left : 0,
        lastLinkRight: linkBoxes.length ? linkBoxes[linkBoxes.length - 1].right : 0,
        linkCount: linkBoxes.length,
        logoNaturalWidth: logo.naturalWidth,
        logoNaturalHeight: logo.naturalHeight,
        navHeight: navBox.height
      };
    });

    check(
      width + 'px: tidak ada ikon login admin',
      report.adminIcon === 0,
      'masih ' + report.adminIcon + ' ikon'
    );

    check(
      width + 'px: logo Smart School tanpa filter warna',
      report.logoFilter === 'none',
      'filter = ' + report.logoFilter
    );

    check(
      width + 'px: tidak ada overflow horizontal',
      !report.overflow
    );

    check(
      width + 'px: menu tidak menabrak logo Smart School',
      report.lastLinkRight <= report.logoRight && report.firstLinkLeft >= report.brandRight,
      'menu ' + Math.round(report.firstLinkLeft) + '-' + Math.round(report.lastLinkRight) +
        ', brand ends ' + Math.round(report.brandRight) +
        ', logo starts ' + Math.round(report.logoRight - report.logoWidth)
    );

    check(
      width + 'px: logo Smart School lebih besar dari 40px',
      report.logoHeight >= 40,
      'tinggi ' + Math.round(report.logoHeight)
    );

    check(
      width + 'px: rasio logo Smart School terjaga',
      Math.abs(report.logoWidth / report.logoHeight - report.logoNaturalWidth / report.logoNaturalHeight) < 0.02,
      'rasio tampil ' + (report.logoWidth / report.logoHeight).toFixed(3) +
        ' vs asli ' + (report.logoNaturalWidth / report.logoNaturalHeight).toFixed(3)
    );
  }

  /* ---------------- 2. KOMENTAR ---------------- */
  console.log('');
  console.log('== Form dan pengiriman komentar ==');

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BASE + '/article.html?id=98', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  const formReport = await page.evaluate(() => {
    const form = document.getElementById('comment-form');

    return {
      hasName: !!document.getElementById('comment-name'),
      hasEmail: !!document.getElementById('comment-email'),
      nameRequired: document.getElementById('comment-name') ? document.getElementById('comment-name').required : false,
      emailRequired: document.getElementById('comment-email') ? document.getElementById('comment-email').required : false,
      hasMessage: !!document.getElementById('comment-message'),
      formFound: !!form
    };
  });

  check('form komentar ada', formReport.formFound);
  check('input nama ada', formReport.hasName);
  check('input email sudah dihapus', !formReport.hasEmail);
  check('input komentar ada', formReport.hasMessage);
  check('nama tetap wajib diisi', formReport.nameRequired);

  const marker = 'Uji QC ' + Date.now();

  await page.fill('#comment-name', 'Pengunjung Uji');
  await page.fill('#comment-message', marker);
  await page.click('#comment-submit');

  await page.waitForTimeout(3500);

  const afterSubmit = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('#comment-list .comment'));

    return {
      count: document.getElementById('comment-count') ? document.getElementById('comment-count').textContent : '0',
      texts: items.map((item) => item.textContent),
      alert: document.getElementById('comment-alert') ? document.getElementById('comment-alert').textContent.trim() : ''
    };
  });

  check(
    'komentar langsung muncul tanpa refresh',
    afterSubmit.texts.some((text) => text.indexOf(marker) !== -1),
    afterSubmit.texts.length + ' komentar tampil'
  );

  check('counter komentar bertambah', Number(afterSubmit.count) > 0, 'counter = ' + afterSubmit.count);
  check('pesan sukses tampil', afterSubmit.alert.indexOf('Terima kasih') !== -1, afterSubmit.alert);

  /* Refresh: komentar harus tetap ada. */
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const afterReload = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('#comment-list .comment'));

    return {
      texts: items.map((item) => item.textContent),
      count: document.getElementById('comment-count') ? document.getElementById('comment-count').textContent : '0'
    };
  });

  check(
    'komentar tetap ada setelah refresh',
    afterReload.texts.some((text) => text.indexOf(marker) !== -1)
  );

  await page.screenshot({ path: path.join(SHOTS, 'artikel-komentar.png'), fullPage: false });

  /* Komentar harus terikat artikel yang benar: cek artikel lain. */
  await page.goto(BASE + '/article.html?id=1', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  const otherArticle = await page.evaluate((text) => {
    const items = Array.from(document.querySelectorAll('#comment-list .comment'));

    return items.some((item) => item.textContent.indexOf(text) !== -1);
  }, marker);

  check('komentar tidak muncul di artikel lain', !otherArticle);

  /* ---------------- 3. TERJEMAHAN ---------------- */
  console.log('');
  console.log('== Terjemahan artikel ==');

  await page.goto(BASE + '/article.html?id=98', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const before = await page.evaluate(() => ({
    title: document.getElementById('article-title').textContent.trim(),
    content: document.getElementById('article-content').textContent.trim().slice(0, 120),
    barVisible: !document.getElementById('article-translate-bar').hidden,
    label: document.getElementById('article-language-label').textContent.trim()
  }));

  check('kontrol terjemahan tampil', before.barVisible);
  check('bahasa default Indonesia', before.label === 'Indonesia', before.label);

  await page.click('#article-language-toggle');
  await page.waitForTimeout(400);
  await page.click('.article-language-option[data-article-lang="en"]');

  await page.waitForFunction(
    () => {
      const status = document.getElementById('article-translate-status');

      return status && status.textContent.indexOf('Menerjemahkan') === -1 && status.textContent.length > 0;
    },
    { timeout: 90000 }
  ).catch(() => {});

  await page.waitForTimeout(1000);

  const afterEn = await page.evaluate(() => ({
    title: document.getElementById('article-title').textContent.trim(),
    content: document.getElementById('article-content').textContent.trim().slice(0, 160),
    label: document.getElementById('article-language-label').textContent.trim(),
    status: document.getElementById('article-translate-status').textContent.trim()
  }));

  check('judul berubah ke bahasa Inggris', afterEn.title !== before.title, afterEn.title);
  check('isi berubah ke bahasa Inggris', afterEn.content !== before.content, afterEn.content.slice(0, 60));
  check('label dropdown = English', afterEn.label === 'English', afterEn.label);

  await page.screenshot({ path: path.join(SHOTS, 'artikel-terjemahan.png') });

  await page.click('#article-language-toggle');
  await page.waitForTimeout(400);
  await page.click('.article-language-option[data-article-lang="id"]');
  await page.waitForTimeout(800);

  const afterId = await page.evaluate(() => ({
    title: document.getElementById('article-title').textContent.trim(),
    content: document.getElementById('article-content').textContent.trim().slice(0, 120),
    label: document.getElementById('article-language-label').textContent.trim()
  }));

  check('kembali ke bahasa Indonesia', afterId.label === 'Indonesia', afterId.label);
  check('judul asli kembali utuh', afterId.title === before.title, afterId.title);
  check('isi asli kembali utuh', afterId.content === before.content, afterId.content.slice(0, 60));

  /* ---------------- 4. MOBILE ---------------- */
  console.log('');
  console.log('== Tampilan mobile ==');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE + '/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  await page.screenshot({ path: path.join(SHOTS, 'mobile-beranda.png') });

  const mobile = await page.evaluate(() => {
    const toggler = document.querySelector('.navbar-toggler');
    const logo = document.querySelector('.navbar-smartschool-logo');
    const brand = document.querySelector('.navbar-brand-container img');

    return {
      togglerVisible: toggler ? getComputedStyle(toggler).display !== 'none' : false,
      smartschoolDisplay: logo ? getComputedStyle(logo).display : 'none',
      brandWidth: brand ? brand.getBoundingClientRect().width : 0,
      overflow: document.documentElement.scrollWidth > window.innerWidth + 1
    };
  });

  check('hamburger tampil di mobile', mobile.togglerVisible);
  check('tidak ada overflow horizontal di mobile', !mobile.overflow);
  check('logo sekolah tidak terpotong', mobile.brandWidth >= 38, 'lebar ' + mobile.brandWidth);

  await page.click('.navbar-toggler');
  await page.waitForTimeout(800);

  const menu = await page.evaluate(() => {
    const nav = document.getElementById('ftco-nav');
    const box = nav.getBoundingClientRect();

    return {
      open: box.height > 0 && getComputedStyle(nav).display !== 'none',
      adminIcon: document.querySelectorAll('#ftco-nav .navbar-admin-item').length,
      linkCount: document.querySelectorAll('#ftco-nav .nav-link').length
    };
  });

  check('menu hamburger terbuka', menu.open);
  check('menu mobile tanpa ikon admin', menu.adminIcon === 0);
  check('menu mobile punya 7 tautan', menu.linkCount >= 7, menu.linkCount + ' tautan');

  await page.screenshot({ path: path.join(SHOTS, 'mobile-menu.png') });

  await page.goto(BASE + '/article.html?id=98', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const mobileArticle = await page.evaluate(() => {
    const form = document.getElementById('comment-form');
    const box = form.getBoundingClientRect();

    return {
      overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      formWidth: box.width,
      viewport: window.innerWidth
    };
  });

  check('halaman artikel mobile tidak overflow', !mobileArticle.overflow);
  check('form komentar muat di layar mobile', mobileArticle.formWidth <= mobileArticle.viewport,
    mobileArticle.formWidth + ' > ' + mobileArticle.viewport);

  await page.screenshot({ path: path.join(SHOTS, 'mobile-artikel.png') });

  console.log('');
  console.log('Error console: ' + (consoleErrors.length ? consoleErrors.join(' | ') : 'tidak ada'));

  await browser.close();

  console.log('');
  console.log('Lolos: ' + passed + ', gagal: ' + failed);
  console.log('Screenshot: ' + SHOTS);

  if (failed) process.exit(1);
}

main().catch(function (error) {
  console.error('Gagal: ' + error.message);
  process.exit(1);
});
