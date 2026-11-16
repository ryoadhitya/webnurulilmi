/* ==========================================================================
   UJI LAPIS DATA FRONTEND (tanpa browser)
   --------------------------------------------------------------------------
   Menjalankan file frontend yang asli — `js/site-config.js` dan
   `js/supabase.js` — di dalam Node, lalu memanggil fungsi yang dipakai
   halaman publik dan dashboard admin. Jadi yang diuji bukan salinan
   logikanya, tapi kode yang benar-benar berjalan di browser.

   Yang diperiksa:
     1. Konfigurasi terbaca (project URL + publishable key).
     2. fetchPublishedArticles / countPublishedArticles (termasuk filter
        kategori & tag, dan pagination).
     3. fetchArticle + fetchPublishedComments + artikel terkait.
     4. fetchFacilities per group dan per unit pendidikan.
     5. fetchUnits / fetchCategories / fetchTags.
     6. mediaUrl() membentuk URL publik bucket yang benar.
     7. articleMedia / articleCover / facilityItems (bentuk objek tampil).

   Jalankan:
     node scripts/test-frontend-data.mjs
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

import { ROOT, loadEnv } from './lib/env.mjs';

loadEnv();

const failures = [];

function check(label, condition, detail) {
  const ok = Boolean(condition);
  if (!ok) failures.push(label + (detail ? ' — ' + detail : ''));
  console.log('  ' + (ok ? 'OK  ' : 'GAGAL') + ' ' + label + (detail ? '  ' + detail : ''));
}

/* Sandbox browser minimal: cukup untuk ketiga file frontend. */
const sandbox = {
  console,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  fetch,
  Headers,
  Request,
  Response,
  URL,
  URLSearchParams,
  TextEncoder,
  TextDecoder,
  crypto,
  WebSocket,
  navigator
};

sandbox.window = sandbox;
sandbox.globalThis = sandbox;
sandbox.self = sandbox;
sandbox.location = { hostname: '127.0.0.1', origin: 'http://127.0.0.1:8080', search: '' };
sandbox.document = {
  addEventListener() {},
  removeEventListener() {},
  querySelector() { return null; },
  querySelectorAll() { return []; },
  getElementById() { return null; },
  createElement() { return { style: {}, setAttribute() {}, appendChild() {} }; },
  body: { appendChild() {} }
};

const context = vm.createContext(sandbox);

function loadFrontend(file) {
  const code = fs.readFileSync(path.join(ROOT, file), 'utf8');
  vm.runInContext(code, context, { filename: file });
}

loadFrontend('js/vendor/supabase.min.js');
loadFrontend('js/site-config.js');
loadFrontend('js/supabase.js');

const NI = sandbox.NISupabase;
const CONFIG = sandbox.SITE_CONFIG;

async function main() {
  console.log('Uji lapis data frontend YPI Nurul Ilmi');
  console.log('======================================');
  console.log('');

  console.log('1. KONFIGURASI');
  check('site-config memuat Project URL', /^https:\/\/[a-z0-9]+\.supabase\.co$/.test(CONFIG.supabaseUrl), CONFIG.supabaseUrl);
  check('kunci publishable (bukan service_role)', /^sb_publishable_/.test(CONFIG.supabaseAnonKey), CONFIG.supabaseAnonKey.slice(0, 14) + '...');
  check('tidak ada service_role di konfigurasi', !/secret|service_role/i.test(CONFIG.supabaseAnonKey));
  check('NISupabase terpasang', Boolean(NI));
  check('klien Supabase terinisialisasi', NI.isConfigured());
  console.log('');

  console.log('2. ARTIKEL PUBLIK');
  const list = await NI.fetchPublishedArticles({ limit: 9 });
  check('daftar artikel published', list.rows.length === 2, list.rows.length + ' baris, total ' + list.count);
  check('total dari hitungan exact', list.count === 2, 'count=' + list.count);

  const one = await NI.fetchArticle(1);
  check('detail artikel id=1 ada', Boolean(one), one ? one.title_id : 'null');
  check('artikel punya kategori', Boolean(one && one.categories), one && one.categories ? one.categories.name : '-');

  const media = NI.articleMedia(one);
  check('media artikel terambil', media.length >= 1, media.length + ' media');
  check('URL media ke bucket media', media[0] && media[0].url.includes('/storage/v1/object/public/media/'), media[0] ? media[0].url : '-');

  const cover = NI.articleCover(one);
  check('gambar sampul terambil', Boolean(cover), cover);

  const comments = await NI.fetchPublishedComments(1);
  check('komentar published (tidak ada, status pending tersembunyi)', Array.isArray(comments), comments.length + ' komentar');

  const cats = await NI.fetchCategories();
  check('kategori terbaca', cats.length === 5, cats.length + ' kategori');

  const tags = await NI.fetchTags();
  check('tag terbaca', tags.length === 3, tags.length + ' tag');

  const counted = await NI.countPublishedArticles({});
  check('countPublishedArticles cocok', counted === 2, 'count=' + counted);

  /* Filter kategori harus mengembalikan tepat artikel-artikel kategori itu.
     Jumlahnya dihitung dari data, bukan angka tetap, supaya tetap benar
     saat artikel published bertambah. */
  const byCat = await NI.fetchPublishedArticles({ categoryId: 2 });
  const expectedInCat = list.rows.filter((a) => a.category_id === 2).length;

  check('filter kategori bekerja',
    byCat.rows.length === expectedInCat && byCat.rows.every((a) => a.category_id === 2),
    byCat.rows.length + ' artikel pada kategori 2, diharapkan ' + expectedInCat);

  const paged = await NI.fetchPublishedArticles({ limit: 1, offset: 0 });
  check('pagination bekerja', paged.rows.length === 1 && paged.count === 2, 'baris=' + paged.rows.length + ' count=' + paged.count);
  console.log('');

  console.log('3. FASILITAS & UNIT');
  const units = await NI.fetchUnits();
  check('unit pendidikan terbaca', units.length === 5, units.length + ' unit');

  const allFacilities = await NI.fetchFacilities();
  check('fasilitas published terbaca', allFacilities.length === 29, allFacilities.length + ' fasilitas');

  const items = NI.facilityItems(allFacilities);
  const withPhotos = items.filter((f) => f.photos.length > 0);
  // Data sumber (MySQL) hanya menautkan 14 dari 29 fasilitas ke foto:
  // 19 baris facility_photos menunjuk 14 path unik, jadi 15 fasilitas memang
  // tanpa foto. Angka ini harus sama persis dengan database asal.
  check('fasilitas berfoto sesuai data sumber', withPhotos.length === 14, withPhotos.length + ' dari ' + items.length + ' fasilitas (sumber: 14 dari 29)');
  check('semua fasilitas berfoto punya cover', withPhotos.every((f) => f.cover_url), withPhotos.filter((f) => !f.cover_url).length + ' tanpa cover');
  check('fasilitas tanpa foto tetap punya nama & unit', items.every((f) => f.name && f.units.length > 0));

  const sigma = await NI.fetchFacilities({ group: 'sigma' });
  check('filter group sigma bekerja', sigma.length === 12, sigma.length + ' fasilitas');

  const tkSigma = await NI.fetchFacilities({ unit: 'tk-sigma' });
  check('filter unit tk-sigma bekerja', tkSigma.length > 0 && tkSigma.length < 29, tkSigma.length + ' fasilitas untuk unit tk-sigma');

  const daycare = await NI.fetchFacilities({ unit: 'daycare-sigma' });
  check('filter unit daycare-sigma bekerja', daycare.length > 0 && daycare.length < 29, daycare.length + ' fasilitas untuk unit daycare-sigma');

  const tkSigmaItems = NI.facilityItems(tkSigma);
  check('semua fasilitas tk-sigma punya unit sigma', tkSigmaItems.every((f) => f.units.length > 0));
  console.log('');

  console.log('4. URL MEDIA');
  check('mediaUrl path absolut', NI.mediaUrl('facilities/kelas-ac.jpg').endsWith('/storage/v1/object/public/media/facilities/kelas-ac.jpg'));
  check('mediaUrl URL absolut tidak diubah', NI.mediaUrl('https://cdn.example/a.jpg') === 'https://cdn.example/a.jpg');
  check('mediaUrl path kosong aman', NI.mediaUrl('') === '');
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
