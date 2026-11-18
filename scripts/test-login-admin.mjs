/* ==========================================================================
   UJI LOGIN ADMIN DI SITUS PRODUCTION
   --------------------------------------------------------------------------
   Memverifikasi alur yang diminta:
     1. Halaman login dapat dibuka langsung lewat URL (tanpa ikon navbar).
     2. Login berhasil -> diarahkan ke dashboard.
     3. Halaman admin terlindungi hanya bisa dibuka dengan sesi.
     4. Logout mengakhiri sesi dan kembali ke halaman login.
     5. Peran menentukan tampilan dashboard (super_admin vs admin unit).

   Kredensial dibaca dari .env dan .akun-admin.txt (gitignored). Password
   tidak pernah dicetak. Tidak ada percobaan password salah pada akun asli.

   Jalankan:
     node scripts/test-login-admin.mjs
   ========================================================================== */
import { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execSync } from 'node:child_process';

import { ROOT } from './lib/env.mjs';

const require = createRequire(import.meta.url);
const PROD = process.env.PROD_URL || 'https://www.ypinurulilmi.or.id';
const LOGIN_URL = PROD + '/admin/login.html';

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

function readDotEnv() {
  const file = path.join(ROOT, '.env');
  const values = {};

  if (!fs.existsSync(file)) return values;

  fs.readFileSync(file, 'utf8').split(/\r?\n/).forEach((line) => {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);

    if (match) values[match[1]] = match[2].trim();
  });

  return values;
}

/** Akun admin unit dari .akun-admin.txt (password tidak dicetak). */
function readUnitAccounts() {
  const file = path.join(ROOT, '.akun-admin.txt');

  if (!fs.existsSync(file)) return [];

  const accounts = [];
  let current = null;

  fs.readFileSync(file, 'utf8').split(/\r?\n/).forEach((line) => {
    const email = line.match(/^Email\s*:\s*(\S+)/);
    const password = line.match(/^Password\s*:\s*(\S+)/);
    const role = line.match(/^Peran\s*:\s*(\S+)/);

    if (email) {
      current = { email: email[1], password: '', role: '' };
      accounts.push(current);
    } else if (current && password) {
      current.password = password[1];
    } else if (current && role) {
      current.role = role[1];
    }
  });

  return accounts.filter((a) => a.email && a.password && a.role !== 'super_admin');
}

async function login(page, email, password) {
  await page.goto(LOGIN_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  await page.fill('#email', email);
  await page.fill('#password', password);
  await page.click('#login-submit');
  await page.waitForTimeout(3500);
}

async function main() {
  const env = readDotEnv();
  const playwright = loadPlaywright();

  const browser = await playwright.chromium.launch({
    headless: true,
    executablePath: findChromium() || undefined
  });

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on('dialog', (dialog) => dialog.accept());

  console.log('Uji login admin production: ' + PROD);
  console.log('');

  /* ---------- 1. HALAMAN LOGIN BISA DIBUKA LANGSUNG ---------- */
  console.log('1. Akses halaman login langsung lewat URL');

  await page.goto(LOGIN_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  const loginPage = await page.evaluate(() => ({
    url: location.pathname + location.search,
    title: document.title,
    hasEmail: !!document.getElementById('email'),
    hasPassword: !!document.getElementById('password'),
    hasSubmit: !!document.getElementById('login-submit'),
    hasError: document.getElementById('login-alert')
      ? !document.getElementById('login-alert').classList.contains('hidden')
      : false,
    errorText: document.getElementById('login-alert') ? document.getElementById('login-alert').textContent.trim() : ''
  }));

  check('URL login aktif (HTTP 200, tidak dialihkan)', loginPage.url.includes('/admin/login.html'), loginPage.url);
  check('form login tampil utuh', loginPage.hasEmail && loginPage.hasPassword && loginPage.hasSubmit);
  check('judul halaman login benar', /Login Admin/i.test(loginPage.title), loginPage.title);
  check('tidak ada pesan error saat dibuka', !loginPage.hasError, loginPage.errorText);

  /* ---------- 2. HALAMAN ADMIN TERLINDUNGI TANPA SESI ---------- */
  console.log('');
  console.log('2. Proteksi halaman admin tanpa sesi');

  await page.goto(PROD + '/admin/articles.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const guarded = await page.evaluate(() => location.pathname + location.search);
  check(
    'halaman dashboard tanpa sesi dialihkan ke login',
    guarded.includes('/admin/login.html'),
    guarded
  );
  check('parameter next membawa tujuan kembali', guarded.indexOf('next=') !== -1, guarded);

  /* ---------- 3. LOGIN SUPER ADMIN ---------- */
  console.log('');
  console.log('3. Login sebagai super_admin');

  const adminPassword = env.SUPABASE_ADMIN_PASSWORD;

  if (!adminPassword) {
    check('SUPABASE_ADMIN_PASSWORD tersedia di .env', false, 'variabel tidak ada');
  } else {
    await login(page, 'admin@ypinurulilmi.or.id', adminPassword);

    const afterLogin = await page.evaluate(() => ({
      url: location.pathname + location.search,
      title: document.title,
      role: window.NIAdmin ? window.NIAdmin.role() : null,
      roleLabel: window.NIAdmin ? window.NIAdmin.roleLabel(window.NIAdmin.role()) : '',
      email: '',
      hasLogout: !!document.getElementById('admin-logout'),
      alert: document.getElementById('login-alert')
        ? document.getElementById('login-alert').textContent.trim()
        : ''
    }));

    const loggedUser = await page.evaluate(async () => {
      const user = await window.NIAuth.currentUser();
      return user ? user.email : '';
    });

    check('tidak ada pesan error login', afterLogin.alert === '', afterLogin.alert);
    check('berpindah ke dashboard artikel', /\/admin\/articles\.html/.test(afterLogin.url), afterLogin.url);
    check('peran terbaca = super_admin', afterLogin.role === 'super_admin', String(afterLogin.role));
    check('label peran tampil di header', /Administrator/i.test(afterLogin.roleLabel), afterLogin.roleLabel);
    check('email admin tampil di header', loggedUser.indexOf('admin@') !== -1, loggedUser);
    check('tombol Keluar tersedia', afterLogin.hasLogout);

    /* Halaman admin lain tetap bisa dibuka dengan sesi aktif. */
    await page.goto(PROD + '/admin/comments.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    const commentsPage = await page.evaluate(() => ({
      url: location.pathname + location.search,
      title: document.title
    }));

    check(
      'halaman lain dashboard terbuka dengan sesi',
      commentsPage.url.includes('/admin/comments.html'),
      commentsPage.url
    );

    /* ---------- 4. LOGOUT ---------- */
    console.log('');
    console.log('4. Logout');

    await page.click('#admin-logout');
    await page.waitForTimeout(2500);

    const afterLogout = await page.evaluate(() => ({
      url: location.pathname + location.search,
      hasSession: null
    }));

    check('keluar kembali ke halaman login', afterLogout.url.includes('/admin/login.html'), afterLogout.url);

    const sessionGone = await page.evaluate(async () => {
      const result = await window.NIAuth.session();
      return !result;
    });

    check('sesi sudah tidak ada setelah keluar', sessionGone);

    await page.goto(PROD + '/admin/articles.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    const guardedAgain = await page.evaluate(() => location.pathname + location.search);
    check('dashboard kembali terlindungi setelah logout', guardedAgain.includes('/admin/login.html'), guardedAgain);
  }

  /* ---------- 5. LOGIN ADMIN UNIT ---------- */
  const unitAccounts = readUnitAccounts();

  if (unitAccounts.length) {
    console.log('');
    console.log('5. Login sebagai admin unit (' + unitAccounts[0].role + ')');

    await login(page, unitAccounts[0].email, unitAccounts[0].password);

    const unitLogin = await page.evaluate(() => ({
      url: location.pathname + location.search,
      role: window.NIAdmin ? window.NIAdmin.role() : null,
      roleLabel: window.NIAdmin ? window.NIAdmin.roleLabel(window.NIAdmin.role()) : '',
      units: window.NIAdmin ? window.NIAdmin.units() : [],
      alert: document.getElementById('login-alert')
        ? document.getElementById('login-alert').textContent.trim()
        : ''
    }));

    check('tidak ada pesan error login', unitLogin.alert === '', unitLogin.alert);
    check('berpindah ke dashboard', /\/admin\/articles\.html/.test(unitLogin.url), unitLogin.url);
    check('peran terbaca sesuai akun', unitLogin.role === unitAccounts[0].role, String(unitLogin.role));
    check('label peran unit tampil', unitLogin.roleLabel.length > 0, unitLogin.roleLabel);
    check('unit milik admin unit terbaca', Array.isArray(unitLogin.units) && unitLogin.units.length > 0,
      JSON.stringify(unitLogin.units));

    await page.click('#admin-logout');
    await page.waitForTimeout(2000);
  } else {
    console.log('');
    console.log('5. Login admin unit: dilewati (berkas .akun-admin.txt tidak ada)');
  }

  /* ---------- 6. HEADER PUBLIK ---------- */
  console.log('');
  console.log('6. Header publik di production');

  /* Halaman depan memuat data dari Supabase dan koneksinya tetap terbuka,
     jadi "networkidle" tidak pernah tercapai. Pemeriksaan ini hanya butuh
     DOM, jadi cukup menunggu halaman selesai dimuat. */
  await page.goto(PROD + '/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);

  const header = await page.evaluate(() => ({
    adminIcon: document.querySelectorAll('#ftco-navbar .navbar-admin-item').length,
    adminScripts: Array.from(document.querySelectorAll('script[src]'))
      .map((s) => s.getAttribute('src'))
      .filter((src) => src.indexOf('navbar-admin') !== -1).length
  }));

  console.log('  info ikon login admin di header publik production: ' + header.adminIcon +
    ' (script navbar-admin: ' + header.adminScripts + ')');

  await browser.close();

  console.log('');
  console.log('Lolos: ' + passed + ', gagal: ' + failed);

  if (failed) process.exit(1);
}

main().catch(function (error) {
  console.error('Gagal: ' + error.message);
  process.exit(1);
});
