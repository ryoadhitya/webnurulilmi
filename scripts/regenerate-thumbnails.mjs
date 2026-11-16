/* ==========================================================================
   REGENERASI THUMBNAIL VIDEO YANG SUDAH ADA
   --------------------------------------------------------------------------
   Video yang lebih lama belum punya thumbnail (poster). Skrip ini membuat
   thumbnail-nya tanpa menghapus data apa pun:

     1. Mencari baris article_media bertipe video yang poster_path-nya kosong.
     2. Mengunduh video dari bucket Storage (dibaca lewat browser supaya
        canvas bisa menggambar frame-nya).
     3. Mengambil satu frame representatif (HTMLVideoElement + canvas).
     4. Mengunggah hasilnya sebagai JPEG ke folder unit yang sama.
     5. Menyimpan path-nya di article_media.poster_path.

   Yang berubah hanya kolom poster_path. Video, artikel, dan data lain
   tidak tersentuh.

   Jalankan:
     node scripts/regenerate-thumbnails.mjs            # semua video tanpa thumbnail
     node scripts/regenerate-thumbnails.mjs --id 12    # hanya satu media
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
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

function serviceHeaders(extra) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  return Object.assign({
    apikey: key,
    Authorization: 'Bearer ' + key
  }, extra || {});
}

async function apiGet(resource) {
  const response = await fetch(process.env.SUPABASE_URL + '/rest/v1/' + resource, {
    headers: serviceHeaders()
  });

  return response.json();
}

function argValue(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return null;

  return process.argv[index + 1] || null;
}

async function main() {
  const { chromium } = loadPlaywright();

  const mediaId = argValue('--id');

  const rows = await apiGet(
    'article_media?select=id,article_id,path,poster_path,articles(unit_id,units(slug))' +
    (mediaId ? '&id=eq.' + mediaId : '') +
    '&type=eq.video' +
    (mediaId ? '' : '&poster_path=is.null')
  );

  const targets = (Array.isArray(rows) ? rows : []).filter((row) => !row.poster_path);

  console.log('Video tanpa thumbnail : ' + targets.length);
  console.log('');

  if (!targets.length) {
    console.log('Tidak ada yang perlu diregenerasi.');
    return;
  }

  const executablePath = findInstalledChromium();
  const browser = await chromium.launch(executablePath ? { executablePath } : {});
  const page = await browser.newPage();

  await page.setContent('<!doctype html><html><body></body></html>');
  await page.addScriptTag({ content: fs.readFileSync(path.join(ROOT, 'js', 'video-thumbnail.js'), 'utf8') });

  let berhasil = 0;
  let gagal = 0;

  for (const row of targets) {
    const unitSlug = (row.articles && row.articles.units && row.articles.units.slug) || 'umum';
    const url = process.env.SUPABASE_URL + '/storage/v1/object/public/media/' + row.path;

    const dataUrl = await page.evaluate(async (source) => {
      const response = await fetch(source);

      if (!response.ok) throw new Error('HTTP ' + response.status);

      const blob = await response.blob();
      const thumb = await window.NIVideoThumb.extract(blob);

      if (!thumb) return null;

      return await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(thumb);
      });
    }, url).catch((error) => {
      console.log('  GAGAL  media ' + row.id + ': ' + error.message);
      return null;
    });

    if (!dataUrl) {
      console.log('  GAGAL  media ' + row.id + ': frame tidak terbaca');
      gagal += 1;
      continue;
    }

    const base64 = dataUrl.split(',')[1];
    const buffer = Buffer.from(base64, 'base64');
    const folder = unitSlug + '/artikel/';
    const filePath = folder + 'thumb-' + crypto.randomUUID() + '.jpg';

    const uploaded = await fetch(
      process.env.SUPABASE_URL + '/storage/v1/object/media/' + filePath,
      {
        method: 'POST',
        headers: serviceHeaders({ 'Content-Type': 'image/jpeg' }),
        body: buffer
      }
    );

    if (!uploaded.ok) {
      console.log('  GAGAL  media ' + row.id + ': unggah gagal (HTTP ' + uploaded.status + ')');
      gagal += 1;
      continue;
    }

    const updated = await fetch(
      process.env.SUPABASE_URL + '/rest/v1/article_media?id=eq.' + row.id,
      {
        method: 'PATCH',
        headers: serviceHeaders({
          'Content-Type': 'application/json',
          Prefer: 'return=representation'
        }),
        body: JSON.stringify({
          poster_path: filePath,
          updated_at: new Date().toISOString()
        })
      }
    );

    if (!updated.ok) {
      console.log('  GAGAL  media ' + row.id + ': penyimpanan path gagal');
      gagal += 1;
      continue;
    }

    console.log('  OK    media ' + row.id + ' -> ' + filePath);
    berhasil += 1;
  }

  await browser.close();

  console.log('');
  console.log('Selesai. Berhasil ' + berhasil + ', gagal ' + gagal + '.');
}

main().catch((error) => {
  console.error('Gagal: ' + error.message);
  process.exit(1);
});
