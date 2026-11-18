/* ==========================================================================
   UJI BROWSER — IKON SOSIAL MEDIA DI FOOTER
   --------------------------------------------------------------------------
   Memeriksa semua halaman publik:

     1. Footer memuat tepat lima akun resmi YPI Nurul Ilmi.
     2. URL tiap ikon sesuai sumber resmi (tidak ada "#" atau URL palsu).
     3. Tiap ikon membuka tab baru (target="_blank") dengan rel
        "noopener noreferrer".
     4. Ukuran, warna, dan jarak ikon konsisten antar halaman.
     5. Tidak ada kumpulan ikon sosial media duplikat di luar footer.
     6. Halaman tetap rapi di ponsel (tanpa overflow horizontal).

   Jalankan:
     node scripts/test-sosial-media.mjs
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

const PAGES = [
  'index.html',
  'about.html',
  'blog.html',
  'blog-single.html',
  'article.html?id=98',
  'contact.html',
  'courses.html',
  'pricing.html',
  'teacher.html',
  '404.html',
  'tk-sigma.html',
  'daycare-sigma.html',
  'galeri-fasilitas.html'
];

const EXPECTED = [
  { name: 'X (Twitter)', url: 'https://x.com/YPINurulIlmi', icon: 'fa-x-twitter' },
  {
    name: 'TikTok',
    url: 'https://www.tiktok.com/@ypinurulilmibekasi?_r=1&_t=ZS-9BV1zn7ZS6u',
    icon: 'fa-tiktok'
  },
  {
    name: 'YouTube',
    url: 'https://youtube.com/@ypinurulilmibekasinew?si=vawu11YIMzGWkNC7',
    icon: 'fa-youtube'
  },
  { name: 'Facebook', url: 'https://www.facebook.com/share/1HXtPToTWg/', icon: 'fa-facebook-f' },
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/ypi_nurulilmi?gwpx=c3plbjZrOWtuZXQ5',
    icon: 'fa-instagram'
  }
];

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
  if (!fs.existsSync(SHOTS)) fs.mkdirSync(SHOTS, { recursive: true });

  const playwright = loadPlaywright();
  const executablePath = findChromium();

  const browser = await playwright.chromium.launch({
    headless: true,
    executablePath: executablePath || undefined
  });

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  for (const target of PAGES) {
    console.log('');
    console.log('== ' + target + ' ==');

    await page.goto(BASE + '/' + target, { waitUntil: 'networkidle' });
    await page.waitForTimeout(700);

    const social = await page.evaluate(() => {
      const lists = Array.from(document.querySelectorAll('[data-footer-social]'));

      const items = lists.map((list) => {
        return Array.from(list.querySelectorAll('a')).map((anchor) => {
          const icon = anchor.querySelector('span');
          const style = icon ? window.getComputedStyle(icon) : null;
          const itemStyle = window.getComputedStyle(anchor.parentElement);
          const glyph = icon ? window.getComputedStyle(icon, '::before') : null;
          const box = icon ? icon.getBoundingClientRect() : null;

          return {
            href: anchor.getAttribute('href'),
            target: anchor.getAttribute('target'),
            rel: anchor.getAttribute('rel'),
            label: anchor.getAttribute('aria-label') || '',
            icon: icon ? icon.className : '',
            fontSize: style ? style.fontSize : '',
            color: style ? style.color : '',
            /* Ikon harus benar-benar terlihat, bukan hanya ada di DOM. */
            visibility: itemStyle.visibility,
            opacity: itemStyle.opacity,
            glyph: glyph ? glyph.content : '',
            width: box ? box.width : 0,
            height: box ? box.height : 0
          };
        });
      });

      /* Judul kolom ikon di footer harus sama di semua halaman. */
      const heading = lists.length
        ? (lists[0].previousElementSibling
          ? lists[0].previousElementSibling.textContent.trim()
          : '')
        : '';

      /* Ikon sosial media di luar footer (navbar, halaman kontak, dll). */
      const outside = Array.from(
        document.querySelectorAll('a[href*="instagram.com"], a[href*="facebook.com"], a[href*="tiktok.com"], a[href*="youtube.com"], a[href*="x.com/"], a[href*="twitter.com"]')
      )
        .filter((anchor) => !anchor.closest('.ftco-footer'))
        .map((anchor) => anchor.getAttribute('href'));

      return {
        listCount: lists.length,
        items: items,
        heading: heading,
        outside: outside,
        overflow: document.documentElement.scrollWidth > window.innerWidth + 1
      };
    });

    check('footer punya satu daftar ikon sosial media', social.listCount === 1,
      String(social.listCount));

    check('judul kolom ikon = "Sosial Media Kami"', social.heading === 'Sosial Media Kami',
      social.heading);

    const items = social.items[0] || [];

    check('lima ikon sosial media tampil', items.length === EXPECTED.length,
      items.length + ' ikon');

    EXPECTED.forEach((expected, index) => {
      const item = items[index];

      if (!item) {
        check(expected.name + ' ada di footer', false, 'ikon tidak ditemukan');
        return;
      }

      check(expected.name + ': URL sesuai sumber resmi',
        item.href === expected.url, item.href);

      check(expected.name + ': ikon yang benar (' + expected.icon + ')',
        item.icon.indexOf(expected.icon) !== -1, item.icon);

      check(expected.name + ': membuka tab baru dengan rel aman',
        item.target === '_blank' &&
        /noopener/.test(item.rel || '') &&
        /noreferrer/.test(item.rel || ''),
        item.target + ' / ' + item.rel);

      check(expected.name + ': punya aria-label',
        item.label.toLowerCase().indexOf(expected.name.split(' ')[0].toLowerCase()) !== -1,
        item.label);

      check(expected.name + ': ikon terlihat di layar',
        item.visibility === 'visible' &&
        Number(item.opacity) > 0.9 &&
        item.width > 0 &&
        item.height > 0,
        item.visibility + ' / opacity ' + item.opacity + ' / ' + item.width + 'x' + item.height);

      check(expected.name + ': glyph Font Awesome benar-benar dirender',
        item.glyph && item.glyph !== 'none' && item.glyph !== 'normal',
        item.glyph);
    });

    check('tidak ada URL sosial media palsu ("#")',
      items.every((item) => item.href && item.href !== '#' && item.href.indexOf('http') === 0),
      items.map((item) => item.href).join(' | '));

    check('tidak ada kumpulan ikon sosial media di luar footer',
      social.outside.length === 0, social.outside.join(' | '));

    /* Ukuran dan jarak ikon harus sama antar halaman. */
    const sizes = items.map((item) => item.fontSize);
    const colors = items.map((item) => item.color);

    check('ukuran ikon konsisten', new Set(sizes).size === 1, sizes.join(', '));
    check('warna ikon konsisten', new Set(colors).size === 1, colors.join(', '));

    check('tidak ada overflow horizontal', !social.overflow);
  }

  /* Tangkapan layar untuk pemeriksaan visual. */
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE + '/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  const footer = await page.locator('.ftco-footer').first();

  await footer.screenshot({ path: path.join(SHOTS, 'sosial-media-mobile.png') });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BASE + '/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await page.locator('.ftco-footer').first()
    .screenshot({ path: path.join(SHOTS, 'sosial-media-desktop.png') });

  await browser.close();

  console.log('');
  console.log('Total: ' + (passed + failed) + ' pemeriksaan, ' + passed + ' lulus, ' + failed + ' gagal.');

  if (failed) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
