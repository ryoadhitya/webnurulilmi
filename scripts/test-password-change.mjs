/* ==========================================================================
   UJI HALAMAN GANTI PASSWORD
   --------------------------------------------------------------------------
   Memverifikasi mekanisme ganti password yang dipakai admin/password.html:

     1. Halaman admin/password.html terbuka tanpa error console.
     2. Password lama yang salah ditolak.
     3. Password baru berhasil dipasang (updateUser) lalu bisa dipakai login.
     4. Password lama tidak lagi berlaku.
     5. Akun uji dibuat khusus untuk pengujian ini dan dihapus lagi di akhir,
     sehingga lima akun admin yang dipakai manual tidak tersentuh.

   Jalankan:
     node scripts/test-password-change.mjs
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

const failures = [];

function check(label, condition, detail) {
  const ok = Boolean(condition);
  if (!ok) failures.push(label + (detail ? ' — ' + detail : ''));
  console.log('  ' + (ok ? 'OK  ' : 'GAGAL') + ' ' + label + (detail ? '  ' + detail : ''));
}

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
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent(req.url.split('?')[0]);
      let filePath = path.join(ROOT, urlPath);

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

/* ------------------------------------------------------------------------ */
/*  Helper Admin API                                                         */
/* ------------------------------------------------------------------------ */

const URL_BASE = (process.env.SUPABASE_URL || '').trim();
const SERVICE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

const ADMIN_HEADERS = {
  apikey: SERVICE_KEY,
  Authorization: 'Bearer ' + SERVICE_KEY,
  'Content-Type': 'application/json'
};

async function adminCreateUser(email, password) {
  const response = await fetch(URL_BASE + '/auth/v1/admin/users', {
    method: 'POST',
    headers: ADMIN_HEADERS,
    body: JSON.stringify({ email, password, email_confirm: true })
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) throw new Error('gagal membuat akun uji: HTTP ' + response.status);

  return body.id;
}

async function adminDeleteUser(id) {
  const response = await fetch(URL_BASE + '/auth/v1/admin/users/' + id, {
    method: 'DELETE',
    headers: ADMIN_HEADERS
  });

  return response.ok;
}

/**
 * Beri akun uji peran + unit paling sempit (TK) supaya bisa masuk dashboard,
 * lalu dibersihkan lagi di akhir.
 */
async function grantRole(userId) {
  const headers = {
    apikey: SERVICE_KEY,
    Authorization: 'Bearer ' + SERVICE_KEY,
    'Content-Type': 'application/json'
  };

  const role = await fetch(URL_BASE + '/rest/v1/user_roles', {
    method: 'POST',
    headers: { ...headers, Prefer: 'return=representation' },
    body: JSON.stringify({ user_id: userId, role: 'tk_nurul_ilmi' })
  });

  if (!role.ok) throw new Error('gagal memberi peran ke akun uji');

  const units = await fetch(URL_BASE + '/rest/v1/units?slug=eq.tk-nurul-ilmi&select=id', {
    headers
  });

  const rows = await units.json();

  if (!rows.length) throw new Error('unit tk-nurul-ilmi tidak ditemukan');

  const link = await fetch(URL_BASE + '/rest/v1/user_units', {
    method: 'POST',
    headers: { ...headers, Prefer: 'return=representation' },
    body: JSON.stringify({ user_id: userId, unit_id: rows[0].id })
  });

  if (!link.ok) throw new Error('gagal memetakan unit ke akun uji');
}

async function revokeRole(userId) {
  const headers = {
    apikey: SERVICE_KEY,
    Authorization: 'Bearer ' + SERVICE_KEY
  };

  await fetch(URL_BASE + '/rest/v1/user_units?user_id=eq.' + userId, {
    method: 'DELETE', headers
  });

  await fetch(URL_BASE + '/rest/v1/user_roles?user_id=eq.' + userId, {
    method: 'DELETE', headers
  });
}

async function signIn(email, password) {
  const response = await fetch(URL_BASE + '/auth/v1/token?grant_type=password', {
    method: 'POST',
    headers: { apikey: process.env.SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const body = await response.json().catch(() => ({}));

  return { ok: response.ok, body };
}

async function updatePassword(accessToken, password) {
  const response = await fetch(URL_BASE + '/auth/v1/user', {
    method: 'PUT',
    headers: {
      apikey: process.env.SUPABASE_ANON_KEY,
      Authorization: 'Bearer ' + accessToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ password })
  });

  return { ok: response.ok, body: await response.json().catch(() => ({})) };
}

async function main() {
  console.log('Uji halaman ganti password — YPI Nurul Ilmi');
  console.log('============================================');
  console.log('');

  if (!URL_BASE || !SERVICE_KEY || !process.env.SUPABASE_ANON_KEY) {
    console.error('Kredensial Supabase belum lengkap di .env.');
    process.exit(1);
  }

  const email = 'probe.password.' + Date.now() + '@ypinurulilmi.or.id';
  const passwordA = 'Aa1!probe-' + Date.now();
  const passwordB = 'Bb2!probe-' + Date.now();

  let userId = null;

  try {
    userId = await adminCreateUser(email, passwordA);
    check('akun uji dibuat', Boolean(userId));

    await grantRole(userId);
    check('peran & unit akun uji dibuat', true);

    /* --- 1. Halaman terbuka di browser --- */

    const { chromium } = loadPlaywright();
    const server = await startServer();
    const base = 'http://127.0.0.1:' + server.address().port;

    const browser = await chromium.launch(
      findInstalledChromium() ? { executablePath: findInstalledChromium() } : {}
    );

    const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
    const page = await context.newPage();

    const consoleErrors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => consoleErrors.push('pageerror: ' + error.message));

    await page.goto(base + '/admin/login.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);

    await page.fill('#email', email);
    await page.fill('#password', passwordA);
    await page.click('#login-submit');

    let loggedIn = true;
    try {
      await page.waitForURL(/admin\/(?!login)/, { timeout: 15000 });
    } catch {
      loggedIn = false;
    }

    check('login akun uji berhasil', loggedIn, page.url());

    await page.goto(base + '/admin/password.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    check('admin/password.html terbuka', page.url().includes('password.html'), page.url());
    check('halaman ganti password tanpa error console',
      consoleErrors.length === 0, consoleErrors.slice(0, 2).join(' | ').slice(0, 180));

    /* --- 2. Password lama yang salah ditolak --- */

    await page.fill('#current_password', 'password-salah-sekali');
    await page.fill('#new_password', passwordB);
    await page.fill('#confirm_password', passwordB);
    await page.click('#password-form button[type="submit"]');

    /* Tunggu kotak error muncul; teksnya baru ada setelah verifikasi
       password lama selesai. */
    await page.waitForSelector('#password-error:not(.hidden)', { timeout: 15000 }).catch(() => {});
    const errorText = await page.locator('#password-error').innerText().catch(() => '');
    check('password lama yang salah ditolak', /salah/i.test(errorText), errorText.slice(0, 60));

    /* --- 3. Password baru berhasil dipasang --- */

    await page.fill('#current_password', passwordA);
    await page.fill('#new_password', passwordB);
    await page.fill('#confirm_password', passwordB);
    await page.click('#password-form button[type="submit"]');
    await page.waitForSelector('#admin-flash:not(.hidden)', { timeout: 15000 }).catch(() => {});

    const flashText = await page.locator('#admin-flash').innerText().catch(() => '');
    check('password baru berhasil dipasang', /berhasil/i.test(flashText), flashText.slice(0, 80));

    await context.close();
    await browser.close();
    server.close();

    /* --- 4. Login dengan password baru, lama tidak berlaku --- */

    const withNew = await signIn(email, passwordB);
    check('login memakai password baru berhasil', withNew.ok);

    const withOld = await signIn(email, passwordA);
    check('password lama tidak lagi berlaku', !withOld.ok);

    /* --- 5. Verifikasi langsung lewat updateUser (jalur yang dipakai halaman) --- */

    const token = withNew.body && withNew.body.access_token;
    const changed = await updatePassword(token, passwordA);
    check('updateUser dengan sesi pengguna sendiri berhasil', changed.ok);

    const back = await signIn(email, passwordA);
    check('akun uji kembali ke password awal', back.ok);
  } finally {
    if (userId) {
      await revokeRole(userId);
      const removed = await adminDeleteUser(userId);
      check('akun uji dihapus kembali', removed);
    }
  }

  console.log('');
  console.log('RINGKASAN');
  console.log('');

  if (failures.length) {
    console.log('  ' + failures.length + ' pemeriksaan gagal:');
    failures.forEach((f) => console.log('    - ' + f));
    process.exitCode = 1;
  } else {
    console.log('  Semua pemeriksaan lulus.');
  }
}

main().catch((error) => {
  console.error('Gagal: ' + error.message);
  process.exit(1);
});
