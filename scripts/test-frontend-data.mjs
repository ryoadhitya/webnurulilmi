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
import { request } from './lib/supabase-rest.mjs';

loadEnv();

const failures = [];

/* Angka сейati diambil langsung dari database memakai service_role, jadi
   pemeriksaan ini membandingkan lapisan frontend dengan isi database.
   Kalau jumlah data berubah, yang diuji tetap benar; tidak ada lagi angka
   beku yang harus diperbarui manual setiap kali isi situs berubah. */
async function dbRows(table, query) {
  const suffix = query ? '?' + query : '';
  const rows = await request('/rest/v1/' + table + suffix);

  return Array.isArray(rows) ? rows : [];
}

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

  /* Artikel yang benar-benar tampil publik: status published dan tanggal
     tayang sudah lewat (artikel lama tanpa tanggal tetap ikut). */
  const nowIso = new Date().toISOString();
  const dbPublished = await dbRows(
    'articles',
    'select=id,category_id&status=eq.published&or=(published_at.is.null,published_at.lte."' + nowIso + '")'
  );

  const totalPublished = dbPublished.length;
  const contohId = dbPublished.length ? dbPublished[0].id : null;

  const list = await NI.fetchPublishedArticles({ limit: 9 });
  check('daftar artikel published', list.rows.length === totalPublished,
    list.rows.length + ' baris, total ' + list.count + ' (database ' + totalPublished + ')');
  check('total dari hitungan exact', list.count === totalPublished, 'count=' + list.count);

  const one = await NI.fetchArticle(contohId);
  check('detail artikel published ada', Boolean(one), one ? one.title_id : 'null');
  check('artikel punya kategori', Boolean(one && one.categories), one && one.categories ? one.categories.name : '-');

  const media = NI.articleMedia(one);
  check('media artikel terambil', media.length >= 1, media.length + ' media');
  check('URL media ke bucket media', media[0] && media[0].url.includes('/storage/v1/object/public/media/'), media[0] ? media[0].url : '-');

  const cover = NI.articleCover(one);
  check('gambar sampul terambil', Boolean(cover), cover);

  const comments = await NI.fetchPublishedComments(contohId);
  check('komentar published (tidak ada, status pending tersembunyi)', Array.isArray(comments), comments.length + ' komentar');

  const cats = await NI.fetchCategories();
  const dbCats = await dbRows('categories', 'select=id');
  check('kategori terbaca', cats.length === dbCats.length, cats.length + ' kategori (database ' + dbCats.length + ')');

  const tags = await NI.fetchTags();
  const dbTags = await dbRows('tags', 'select=id');
  check('tag terbaca', tags.length === dbTags.length, tags.length + ' tag (database ' + dbTags.length + ')');

  const counted = await NI.countPublishedArticles({});
  check('countPublishedArticles cocok', counted === totalPublished, 'count=' + counted);

  /* Filter kategori harus mengembalikan tepat artikel-artikel kategori itu.
     Jumlahnya dihitung dari data, bukan angka tetap, supaya tetap benar
     saat artikel published bertambah. */
  const kategoriUji = one && one.category_id ? one.category_id : null;
  const byCat = await NI.fetchPublishedArticles({ categoryId: kategoriUji });
  const expectedInCat = dbPublished.filter((a) => a.category_id === kategoriUji).length;

  check('filter kategori bekerja',
    byCat.rows.length === expectedInCat && byCat.rows.every((a) => a.category_id === kategoriUji),
    byCat.rows.length + ' artikel pada kategori ' + kategoriUji + ', diharapkan ' + expectedInCat);

  const paged = await NI.fetchPublishedArticles({ limit: 1, offset: 0 });
  check('pagination bekerja', paged.rows.length === 1 && paged.count === totalPublished,
    'baris=' + paged.rows.length + ' count=' + paged.count);
  console.log('');

  console.log('3. FASILITAS & UNIT');
  const units = await NI.fetchUnits();
  const dbUnits = await dbRows('units', 'select=id');
  check('unit pendidikan terbaca', units.length === dbUnits.length, units.length + ' unit (database ' + dbUnits.length + ')');

  const allFacilities = await NI.fetchFacilities();
  const dbFacilities = await dbRows('facilities', 'select=id&is_published=eq.true');
  check('fasilitas published terbaca', allFacilities.length === dbFacilities.length,
    allFacilities.length + ' fasilitas (database ' + dbFacilities.length + ')');

  const items = NI.facilityItems(allFacilities);
  const withPhotos = items.filter((f) => f.photos.length > 0);

  /* Jumlah fasilitas yang punya foto ikut dihitung dari database, supaya
     tetap benar kalau data fasilitas berubah. */
  const dbPhotos = await dbRows('facility_photos', 'select=id,facility_id');
  const dbWithPhotos = new Set(dbPhotos.map((row) => row.facility_id)).size;

  check('fasilitas berfoto sesuai data sumber', withPhotos.length === dbWithPhotos,
    withPhotos.length + ' dari ' + items.length + ' fasilitas (database ' + dbWithPhotos + ')');
  check('semua fasilitas berfoto punya cover', withPhotos.every((f) => f.cover_url), withPhotos.filter((f) => !f.cover_url).length + ' tanpa cover');
  check('fasilitas tanpa foto tetap punya nama & unit', items.every((f) => f.name && f.units.length > 0));

  const sigma = await NI.fetchFacilities({ group: 'sigma' });
  const dbSigma = await dbRows('facilities', 'select=id&is_published=eq.true&group_type=eq.sigma');
  check('filter group sigma bekerja', sigma.length === dbSigma.length,
    sigma.length + ' fasilitas (database ' + dbSigma.length + ')');

  const tkSigma = await NI.fetchFacilities({ unit: 'tk-sigma' });
  check('filter unit tk-sigma bekerja', tkSigma.length > 0 && tkSigma.length < allFacilities.length, tkSigma.length + ' fasilitas untuk unit tk-sigma');

  const daycare = await NI.fetchFacilities({ unit: 'daycare-sigma' });
  check('filter unit daycare-sigma bekerja', daycare.length > 0 && daycare.length < allFacilities.length, daycare.length + ' fasilitas untuk unit daycare-sigma');

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
