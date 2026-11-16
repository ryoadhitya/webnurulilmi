/* ==========================================================================
   VERIFIKASI HASIL MIGRASI
   --------------------------------------------------------------------------
   Memeriksa:
     1. Jumlah baris tiap tabel bisnis di Supabase
     2. Apakah akses baca publik lewat anon key (RLS) berhasil
     3. URL publik 15 berkas media di bucket Storage (HTTP 200)

   Contoh:
     SUPABASE_URL=https://xxx.supabase.co \
     SUPABASE_SERVICE_ROLE_KEY=<service_role> \
     node scripts/verify-migration.mjs
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';

import { ROOT, config, request } from './lib/supabase-rest.mjs';

/* Jumlah baris yang diharapkan dari supabase/data.sql.
   Artikel, article_media, dan article_tags bertambah dari data awal:
   satu artikel published beserta medianya dan satu tag (ditambahkan
   2026-11-15), serta satu artikel draft lama yang sengaja disimpan
   sebagai draft supaya tidak tampil di halaman publik. */
const EXPECTED = {
  categories: 5,
  units: 5,
  tags: 3,
  articles: 3,
  article_media: 3,
  article_tags: 1,
  comments: 0,
  facilities: 29,
  facility_photos: 19,
  facility_unit: 60
};

/* Path media yang harus bisa diakses publik. */
const MEDIA_PATHS = [
  'facilities/area-bermain-2.jpg',
  'facilities/area-bermain.jpg',
  'facilities/id-card.jpg',
  'facilities/kantin.jpg',
  'facilities/kelas-ac.jpg',
  'facilities/laboratorium-komputer.jpg',
  'facilities/laboratorium.jpg',
  'facilities/lapangan.jpg',
  'facilities/lingkungan-kolam.jpg',
  'facilities/lingkungan-suasana.jpg',
  'facilities/masjid.jpg',
  'facilities/musik-tari.jpg',
  'facilities/olahraga-2.jpg',
  'facilities/parkir.jpg',
  'articles/2HnGtGommHpKsiHYgiGw8aUTeE7sLp53KPf90Lfs.png'
];

/** Kunci publik dibaca dari js/site-config.js bila tersedia. */
function anonKeyFromSiteConfig() {
  const file = path.join(ROOT, 'js', 'site-config.js');

  if (!fs.existsSync(file)) return null;

  const content = fs.readFileSync(file, 'utf8');
  const match = content.match(/supabaseAnonKey:\s*'([^']*)'/);

  if (!match) return null;

  const value = match[1];
  if (!value || /GANTI_DENGAN/i.test(value)) return null;

  return value;
}

async function checkCounts() {
  console.log('1. JUMLAH BARIS');
  console.log('');

  let failed = 0;

  for (const table of Object.keys(EXPECTED)) {
    const rows = await request('/rest/v1/' + table + '?select=id', {
      method: 'GET',
      label: 'count ' + table
    });

    const actual = (rows || []).length;
    const expected = EXPECTED[table];
    const ok = actual === expected;

    if (!ok) failed += 1;

    console.log('  ' + (ok ? 'OK  ' : 'SELISIH ') + table.padEnd(18) +
      String(actual).padStart(4) + ' / ' + String(expected).padStart(4));
  }

  console.log('');
  return failed;
}

async function checkPublicRead(anonKey) {
  console.log('2. AKSES BACA PUBLIK (anon key / RLS)');
  console.log('');

  if (!anonKey) {
    console.log('  LEWATI  anon key belum diisi (js/site-config.js atau env SUPABASE_ANON_KEY)');
    console.log('');
    return 0;
  }

  const cfg = config();
  const checks = [
    ['articles published', '/rest/v1/articles?status=eq.published&select=id,title_id'],
    ['categories', '/rest/v1/categories?select=id,name'],
    ['facilities published', '/rest/v1/facilities?is_published=eq.true&select=id,name'],
    ['unit', '/rest/v1/units?select=id,slug']
  ];

  let failed = 0;

  for (const [label, pathname] of checks) {
    const response = await fetch(cfg.url + pathname, {
      headers: { apikey: anonKey, Authorization: 'Bearer ' + anonKey }
    });

    const ok = response.ok;
    if (!ok) failed += 1;

    let count = 0;
    if (ok) {
      const payload = await response.json();
      count = Array.isArray(payload) ? payload.length : 0;
    }

    console.log('  ' + (ok ? 'OK  ' : 'GAGAL') + ' ' + label.padEnd(22) + count + ' baris');
  }

  console.log('');
  return failed;
}

async function checkWriteDenied(anonKey) {
  console.log('3. AKSES TULIS PUBLIK HARUS DITOLAK (RLS)');
  console.log('');

  if (!anonKey) {
    console.log('  LEWASI  anon key belum diisi (js/site-config.js atau env SUPABASE_ANON_KEY)');
    console.log('');
    return 0;
  }

  const cfg = config();
  const marker = 'rls-probe-' + Date.now();

  /* Setiap percobaan adalah payload yang HARUS ditolak RLS.
     Bila policy ternyata membocorkan, baris yang tersisip langsung dihapus
     lagi memakai service_role supaya database tidak tercemar. */
  const attempts = [
    {
      label: 'insert articles',
      method: 'POST',
      pathname: '/rest/v1/articles',
      body: { title_id: marker, content_id: marker },
      cleanup: () => request('/rest/v1/articles?title_id=eq.' + encodeURIComponent(marker), {
        method: 'DELETE',
        label: 'cleanup articles'
      })
    },
    {
      label: 'update articles',
      method: 'PATCH',
      pathname: '/rest/v1/articles?id=eq.1',
      body: { views: 999 },
      cleanup: null
    },
    {
      label: 'insert user_roles',
      method: 'POST',
      pathname: '/rest/v1/user_roles',
      body: { user_id: '00000000-0000-0000-0000-000000000000', role: 'super_admin' },
      cleanup: () => request('/rest/v1/user_roles?user_id=eq.00000000-0000-0000-0000-000000000000', {
        method: 'DELETE',
        label: 'cleanup user_roles'
      })
    },
    {
      label: 'insert comments',
      method: 'POST',
      pathname: '/rest/v1/comments',
      body: { article_id: 1, name: marker, comment: marker, status: 'published' },
      cleanup: () => request('/rest/v1/comments?name=eq.' + encodeURIComponent(marker), {
        method: 'DELETE',
        label: 'cleanup comments'
      })
    },
    {
      label: 'delete facilities',
      method: 'DELETE',
      pathname: '/rest/v1/facilities?id=eq.1',
      body: null,
      cleanup: null
    }
  ];

  let failed = 0;

  /* Penolakan RLS punya dua bentuk:
     - INSERT   -> HTTP 4xx (policy menolak baris).
     - UPDATE/DELETE -> PostgREST mencocokkan 0 baris yang terlihat, jadi
       membalas HTTP 204/200 dengan body KOSONG. Baris yang benar-benar
       berubah akan mengembalikan barisnya lewat Prefer: return=representation.
     Jadi kebocoran dideteksi dari isi body, bukan dari kode status saja. */
  for (const attempt of attempts) {
    const response = await fetch(cfg.url + attempt.pathname, {
      method: attempt.method,
      headers: {
        apikey: anonKey,
        Authorization: 'Bearer ' + anonKey,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      body: attempt.body ? JSON.stringify(attempt.body) : undefined
    });

    const text = await response.text();
    let rows = null;

    try {
      rows = JSON.parse(text);
    } catch {
      rows = null;
    }

    const touched = Array.isArray(rows) ? rows.length > 0 : Boolean(rows && Object.keys(rows).length);
    const denied = response.status >= 400 || !touched;

    if (!denied) {
      failed += 1;

      if (attempt.cleanup) {
        try {
          await attempt.cleanup();
        } catch (error) {
          console.log('  PERINGATAN pembersihan gagal untuk ' + attempt.label + ': ' + error.message);
        }
      }
    }

    /* Body error dari PostgREST juga punya kunci, jadi yang menentukan
       "terpengaruh" adalah status 2xx, bukan isi body. */
    const note = denied
      ? (response.status >= 400 ? ' (ditolak policy)' : ' (0 baris terpengaruh)')
      : ' (baris terpengaruh!)';

    console.log('  ' + (denied ? 'OK  ' : 'BOCOR') + ' ditolak: ' +
      attempt.label.padEnd(18) + 'HTTP ' + response.status + note);
  }

  console.log('');
  return failed;
}

async function checkMedia(anonKey) {
  console.log('4. MEDIA STORAGE (URL publik)');
  console.log('');

  const cfg = config();
  let failed = 0;

  for (const objectPath of MEDIA_PATHS) {
    const url = cfg.url + '/storage/v1/object/public/' + cfg.bucket + '/' +
      objectPath.split('/').map(encodeURIComponent).join('/');

    let status = 0;

    try {
      const response = await fetch(url, { method: 'GET' });
      status = response.status;
    } catch (error) {
      status = 0;
    }

    const ok = status === 200;
    if (!ok) failed += 1;

    console.log('  ' + (ok ? 'OK  ' : 'GAGAL') + ' ' + String(status).padEnd(4) + objectPath);
  }

  console.log('');
  return failed;
}

async function main() {
  config();

  const anonKey = process.env.SUPABASE_ANON_KEY || anonKeyFromSiteConfig();

  console.log('Verifikasi migrasi YPI Nurul Ilmi');
  console.log('==================================');
  console.log('');

  const failedCounts = await checkCounts();
  const failedRead = await checkPublicRead(anonKey);
  const failedWrite = await checkWriteDenied(anonKey);
  const failedMedia = await checkMedia(anonKey);

  const total = failedCounts + failedRead + failedWrite + failedMedia;

  console.log('RINGKASAN');
  console.log('');

  if (total === 0) {
    console.log('  Semua pemeriksaan lulus.');
  } else {
    console.log('  ' + total + ' pemeriksaan gagal:');
    console.log('    jumlah baris : ' + failedCounts);
    console.log('    akses baca   : ' + failedRead);
    console.log('    tolak tulis  : ' + failedWrite);
    console.log('    media        : ' + failedMedia);
  }

  console.log('');

  if (total > 0) process.exitCode = 1;
}

main().catch(function (error) {
  console.error('Gagal: ' + error.message);
  process.exit(1);
});
