/* ==========================================================================
   UJI RBAC LIMA PERAN (tanpa browser)
   --------------------------------------------------------------------------
   Menguji batas hak akses tiap peran terhadap Supabase:

     1. Masuk dan membaca peran + unit yang dipetakan dari database.
     2. Admin unit hanya melihat artikel unitnya sendiri.
     3. Admin unit tidak bisa mengubah/menghapus artikel unit lain.
     4. Admin unit tidak bisa membuat artikel dengan unit_id unit lain
        (percobaan manipulasi request).
     5. Admin unit tidak bisa mengubah perannya sendiri di user_roles.
     6. Admin unit tidak bisa menulis kategori/tag (khusus super_admin).
     7. Unggah media hanya boleh di folder unit sendiri.
     8. Super admin tetap mastering semua unit.
     9. Keluar (signOut) mengakhiri sesi.

   Kredensial dibaca dari `.akun-admin.txt` (gitignored) sehingga tidak ada
   password yang tertanam di source code. Password tidak pernah dicetak.

   Jalankan:
     node scripts/test-rbac.mjs
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

import { ROOT, loadEnv } from './lib/env.mjs';

loadEnv();

const failures = [];
const created = { articles: [] };

function check(label, condition, detail) {
  const ok = Boolean(condition);
  if (!ok) failures.push(label + (detail ? ' — ' + detail : ''));
  console.log('  ' + (ok ? 'OK  ' : 'GAGAL') + ' ' + label + (detail ? '  ' + detail : ''));
}

const store = new Map();

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
  navigator,
  WebSocket,
  localStorage: {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear()
  }
};

sandbox.window = sandbox;
sandbox.globalThis = sandbox;
sandbox.self = sandbox;

const redirects = [];

sandbox.location = {
  hostname: '127.0.0.1',
  origin: 'http://127.0.0.1:8080',
  pathname: '/admin/articles.html',
  search: '',
  replace(url) { redirects.push(url); },
  assign(url) { redirects.push(url); }
};

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
loadFrontend('js/admin-auth.js');

const AUTH = sandbox.NIAuth;

/* ------------------------------------------------------------------------ */
/*  Pembacaan kredensial dari berkas lokal (tidak pernah dicetak)            */
/* ------------------------------------------------------------------------ */

function readAccounts() {
  const file = path.join(ROOT, '.akun-admin.txt');

  if (!fs.existsSync(file)) {
    console.error('Berkas .akun-admin.txt tidak ditemukan. Jalankan: node scripts/seed-unit-admins.mjs');
    process.exit(1);
  }

  const accounts = [];
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);

  let current = null;

  for (const line of lines) {
    const email = line.match(/^Email\s*:\s*(\S+)/);
    const password = line.match(/^Password\s*:\s*(\S+)/);
    const role = line.match(/^Peran\s*:\s*(\S+)/);
    const unit = line.match(/^Unit\s*:\s*(.+)$/);

    if (email) {
      current = { email: email[1], password: '', role: '', units: [] };
      accounts.push(current);
    } else if (current && password) {
      current.password = password[1];
    } else if (current && role) {
      current.role = role[1];
    } else if (current && unit) {
      current.units = unit[1].split(',').map((s) => s.trim()).filter(Boolean);
    }
  }

  /* Akun super_admin diuji memakai SUPABASE_ADMIN_PASSWORD di dalam skrip ini,
     jadi entri super_admin di berkas kredensial diabaikan agar tidak diuji
     dua kali. */
  return accounts.filter((a) => a.email && a.password && a.role !== 'super_admin');
}

/* ------------------------------------------------------------------------ */
/*  Helper                                                                    */
/* ------------------------------------------------------------------------ */

const MARK = 'Zzz probe rbac ' + Date.now();

/** Data uji dibersihkan dari service_role supaya tidak tertinggal di database. */
async function cleanup() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return;

  const headers = { apikey: key, Authorization: 'Bearer ' + key };
  const base = process.env.SUPABASE_URL + '/rest/v1/';

  try {
    await fetch(base + 'articles?title_id=eq.' + encodeURIComponent(MARK), {
      method: 'DELETE', headers
    });
  } catch (error) {
    /* diamkan */
  }
}

/**
 * Hapus berkas uji lewat service_role. Policy DELETE Storage hanya berlaku
 * untuk media yang menempel ke artikel/fasilitas, jadi berkas uji yang
 * berdiri sendiri harus dibersihkan lewat service_role.
 *
 * Penghapusan dicek ulang lewat listing bucket: kadang berkas baru saja
 * diunggah masih belum terhapus pada percobaan pertama.
 */
async function removeWithServiceRole(paths) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key || !paths.length) return;

  const headers = {
    apikey: key,
    Authorization: 'Bearer ' + key,
    'Content-Type': 'application/json'
  };

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

async function unitRows() {
  const db = AUTH.client();
  const result = await db.from('units').select('id, slug, name').order('id');
  return result.data || [];
}

async function signIn(email, password) {
  const result = await AUTH.signIn(email, password);
  if (!result.ok) return null;
  return result.user;
}

async function run() {
  console.log('Uji RBAC 5 peran — YPI Nurul Ilmi');
  console.log('==================================');
  console.log('');

  const accounts = readAccounts();

  if (accounts.length < 4) {
    console.error('Kredensial admin unit pada .akun-admin.txt belum lengkap.');
    process.exit(1);
  }

  const adminPassword = process.env.SUPABASE_ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error('SUPABASE_ADMIN_PASSWORD belum diisi di .env.');
    process.exit(1);
  }

  const units = await unitRows();
  const bySlug = new Map(units.map((u) => [u.slug, u]));

  console.log('UNIT TERSEDIA: ' + units.map((u) => u.slug).join(', '));
  console.log('');

  /* ------------------------------------------------------------------ */
  /*  1. LOGIN + PERAN + UNIT                                           */
  /* ------------------------------------------------------------------ */

  const superAccount = {
    email: 'admin@ypinurulilmi.or.id',
    password: adminPassword,
    role: 'super_admin',
    units: []
  };

  const allAccounts = [superAccount].concat(accounts);

  for (const account of allAccounts) {
    console.log('AKUN: ' + account.email + '  (peran=' + account.role + ')');

    const user = await signIn(account.email, account.password);
    check('  login berhasil', Boolean(user));

    if (!user) {
      console.log('');
      continue;
    }

    const role = await AUTH.role();
    check('  peran terbaca dari user_roles', role === account.role, 'peran=' + role);

    const myUnits = await AUTH.units();
    const mySlugs = myUnits.map((u) => u.slug).sort();

    if (account.role === 'super_admin') {
      check('  super_admin tidak punya baris user_units (menguasai semua unit)',
        myUnits.length === 0, myUnits.length + ' baris');
    } else {
      const expected = account.units.slice().sort();
      check('  unit sesuai pemetaan user_units',
        JSON.stringify(mySlugs) === JSON.stringify(expected),
        mySlugs.join(',') || '(kosong)');
    }

    /* -------------------------------------------------------------- */
    /*  2. SCOPING ARTIKEL                                             */
    /* -------------------------------------------------------------- */

    const db = AUTH.client();
    const allArticles = await db.from('articles').select('id, title_id, unit_id, status').limit(200);
    const total = (allArticles.data || []).length;

    if (account.role === 'super_admin') {
      check('  super_admin melihat seluruh artikel', total > 0, total + ' artikel');
    } else {
      const own = (allArticles.data || []).filter(
        (a) => account.units.includes((bySlug.get(unitSlugOf(a.unit_id)) || {}).slug)
      );

      /* Artikel published memang boleh dibaca pengguna mana pun (sudah
         publik di situs). Yang harus disembunyikan adalah artikel draft
         milik unit lain. */
      const leaked = (allArticles.data || []).filter(
        (a) => a.unit_id
          && a.status !== 'published'
          && !account.units.includes((bySlug.get(unitSlugOf(a.unit_id)) || {}).slug)
      );

      check('  artikel draft unit lain tidak muncul di daftar unit ini',
        leaked.length === 0,
        leaked.length ? leaked.length + ' artikel bocor' : '0 bocor');

      console.log('    (artikel milik unit ini: ' + own.length + ')');
    }

    /* -------------------------------------------------------------- */
    /*  3. MANIPULASI: BUAT ARTIKEL DENGAN unit_id UNIT LAIN          */
    /* -------------------------------------------------------------- */

    const foreignUnit = units.find((u) => !account.units.includes(u.slug) && u.slug !== 'umum');

    if (foreignUnit && account.role !== 'super_admin') {
      const attempt = await db
        .from('articles')
        .insert({
          title_id: MARK,
          content_id: MARK,
          status: 'draft',
          author_name: 'probe',
          unit_id: foreignUnit.id
        })
        .select()
        .maybeSingle();

      if (attempt.data) {
        created.articles.push(attempt.data.id);
        check('  tidak bisa membuat artikel untuk unit lain',
          false, 'berhasil membuat artikel di unit ' + foreignUnit.slug);
      } else {
        check('  tidak bisa membuat artikel untuk unit lain', true,
          attempt.error ? 'RLS menolak: ' + attempt.error.message.slice(0, 80) : '');
      }
    }

    /* -------------------------------------------------------------- */
    /*  4. MANIPULASI: UBAH / HAPUS ARTIKEL UNIT LAIN                 */
    /* -------------------------------------------------------------- */

    const foreignArticle = (allArticles.data || []).find(
      (a) => a.unit_id && !account.units.includes((bySlug.get(unitSlugOf(a.unit_id)) || {}).slug)
    );

    if (foreignArticle && account.role !== 'super_admin') {
      const upd = await db
        .from('articles')
        .update({ views: 987654 })
        .eq('id', foreignArticle.id)
        .select()
        .maybeSingle();

      check('  tidak bisa mengubah artikel unit lain', !upd.data,
        upd.error ? 'RLS menolak' : '');

      const del = await db.from('articles').delete().eq('id', foreignArticle.id).select();
      check('  tidak bisa menghapus artikel unit lain',
        !(Array.isArray(del.data) && del.data.length > 0),
        del.error ? 'RLS menolak' : '');
    }

    /* -------------------------------------------------------------- */
    /*  5. MANIPULASI: UBAH PERAN SENDIRI                             */
    /* -------------------------------------------------------------- */

    const selfRole = await db
      .from('user_roles')
      .update({ role: 'super_admin' })
      .eq('user_id', user.id)
      .select()
      .maybeSingle();

    check('  tidak bisa menaikkan peran sendiri', !selfRole.data,
      selfRole.error ? 'RLS menolak' : '');

    const selfUnit = await db
      .from('user_units')
      .insert({ user_id: user.id, unit_id: foreignUnit ? foreignUnit.id : units[0].id })
      .select()
      .maybeSingle();

    check('  tidak bisa menambah unit sendiri', !selfUnit.data,
      selfUnit.error ? 'RLS menolak' : '');

    /* -------------------------------------------------------------- */
    /*  6. KATEGORI & TAG (KHUSUS SUPER ADMIN)                       */
    /* -------------------------------------------------------------- */

    const cat = await db
      .from('categories')
      .insert({ name: MARK, slug: 'zzz-probe-rbac-' + Date.now() })
      .select()
      .maybeSingle();

    if (account.role === 'super_admin') {
      check('  super_admin boleh menulis kategori', Boolean(cat.data),
        cat.error ? cat.error.message : '');
      if (cat.data) {
        await db.from('categories').delete().eq('id', cat.data.id);
      }
    } else {
      check('  admin unit tidak boleh menulis kategori', !cat.data,
        cat.error ? 'RLS menolak' : '');
    }

    /* -------------------------------------------------------------- */
    /*  7. MEDIA STORAGE: HANYA FOLDER UNIT SENDIRI                  */
    /* -------------------------------------------------------------- */

    const prefix = account.role === 'super_admin'
      ? (account.units[0] || 'umum')
      : account.units[0];

    const ownPath = prefix + '/artikel/probe-' + Date.now() + '.png';
    const foreignPath = (foreignUnit ? foreignUnit.slug : 'sd-nurul-ilmi') +
      '/artikel/probe-' + Date.now() + '.png';

    const png = Buffer.from(
      '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c489',
      'hex'
    );

    const ownUpload = await db.storage.from('media').upload(ownPath, png, {
      contentType: 'image/png', upsert: true
    });

    check('  boleh mengunggah media di folder unit sendiri', !ownUpload.error,
      ownUpload.error ? ownUpload.error.message : ownPath);

    const foreignUpload = await db.storage.from('media').upload(foreignPath, png, {
      contentType: 'image/png', upsert: true
    });

    if (account.role === 'super_admin') {
      check('  super_admin boleh mengunggah ke folder unit mana pun',
        !foreignUpload.error, foreignUpload.error ? foreignUpload.error.message : '');
    } else {
      check('  tidak boleh mengunggah media di folder unit lain',
        Boolean(foreignUpload.error),
        foreignUpload.error ? 'storage menolak' : 'BOCOR: ' + foreignPath);
    }

    /* Berkas uji dibersihkan lewat service_role. Policy DELETE Storage
       hanya berlaku untuk media yang menempel ke artikel/fasilitas, jadi
       permintaan hapus dari admin unit bisa dijawab 200 tanpa menghapus
       apa pun — tanpa service_role berkas uji akan tertinggal. */
    const leftovers = [];

    if (!ownUpload.error) {
      await db.storage.from('media').remove([ownPath]);
      leftovers.push(ownPath);
    }

    if (!foreignUpload.error) {
      await db.storage.from('media').remove([foreignPath]);
      leftovers.push(foreignPath);
    }

    if (leftovers.length) {
      await removeWithServiceRole(leftovers);
    }

    /* -------------------------------------------------------------- */
    /*  8. KELUAR                                                      */
    /* -------------------------------------------------------------- */

    await AUTH.signOut();
    const after = await AUTH.session();
    check('  sesi hilang setelah keluar', !after);

    const guardAfter = await AUTH.guard();
    check('  guard menolak tanpa sesi', guardAfter.ok === false);

    console.log('');
  }

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

/** Slug unit dari id unit, memakai cache units yang sudah dimuat. */
function unitSlugOf(unitId) {
  if (!unitId) return 'umum';
  const found = unitCache.get(unitId);
  return found ? found.slug : 'umum';
}

const unitCache = new Map();

async function main() {
  try {
    /* Isi cache unit sekali di awal supaya helper unitSlugOf bisa dipakai. */
    const db = AUTH.client();
    const result = await db.from('units').select('id, slug, name');
    (result.data || []).forEach((u) => unitCache.set(u.id, u));

    await run();
  } finally {
    await cleanup();
  }
}

main().catch((error) => {
  console.error('Gagal: ' + error.message);
  process.exit(1);
});
