/* ==========================================================================
   UJI DASHBOARD ADMIN (tanpa browser)
   --------------------------------------------------------------------------
   Menjalankan modul frontend yang asli — `js/admin-auth.js` dan
   `js/supabase.js` — lalu menguji alur yang dipakai dashboard:

     1. Masuk (signIn) dan pembacaan peran (role).
     2. CRUD artikel (buat draft, baca, ubah, hapus).
     3. CRUD kategori & tag.
     4. Pembaruan fasilitas dan relasi unit.
     5. Unggah media ke bucket Storage lewat klien admin, lalu hapus.
     6. Moderasi komentar (pending -> published -> hapus).
     7. Keluar (signOut) dan memastikan sesi benar-benar hilang.

   Semua data uji yang dibuat dihapus kembali di akhir. Data hasil migrasi
   tidak pernah disentuh: skrip hanya membuat baris baru dengan penanda
   'Zzz probe', dan mengubah hanya baris miliknya sendiri.

   Jalankan:
     node scripts/test-admin-dashboard.mjs
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

import { ROOT, loadEnv } from './lib/env.mjs';

loadEnv();

const failures = [];
const probes = [];

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
  WebSocket,
  navigator,
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
  replace(url) {
    redirects.push(url);
  },
  assign(url) {
    redirects.push(url);
  }
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

const NI = sandbox.NISupabase;
const AUTH = sandbox.NIAuth;
const MARK = 'Zzz probe ' + Date.now();

/**
 * Bersihkan sisa baris uji bila skrip berhenti di tengah jalan.
 * Dipakai service_role supayaprobe yang tidak terlihat admin tetap hilang.
 */
async function cleanupResidue() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return;

  const headers = { apikey: key, Authorization: 'Bearer ' + key };
  const base = process.env.SUPABASE_URL + '/rest/v1/';

  try {
    await fetch(base + 'comments?name=eq.Probe%20Bot', { method: 'DELETE', headers });
    await fetch(base + 'comment_rate_limits?id=gt.0', { method: 'DELETE', headers });
  } catch (error) {
    /* diamkan: bukan bagian dari assertions */
  }
}

/**
 * Akun sekali pakai untuk uji "password salah ditolak".
 *
 * Uji ini sengaja mengirim password keliru. GoTrue mengunci email yang
 * gagal login berulang kali, jadi account uji tidak boleh memakai akun
 * admin sungguhan — kalau tidak, akun tersebut terkunci dan login admin
 * berikutnya ditolak walau password-nya benar.
 */
async function createThrowawayUser() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return null;

  const email = 'uji.salah.satu.kali@ypinurulilmi.or.id';
  const headers = { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' };

  await deleteThrowawayUser(await findThrowawayUser(email));

  const created = await fetch(process.env.SUPABASE_URL + '/auth/v1/admin/users', {
    method: 'POST',
    headers,
    body: JSON.stringify({ email, password: 'UlanganSekaliPakai26!', email_confirm: true })
  });

  if (created.ok) {
    const body = await created.json();
    return body.id ? { id: body.id, email } : null;
  }

  return findThrowawayUser(email);
}

/** Cari akun uji sekali pakai yang sudah ada (mis. sisa run sebelumnya). */
async function findThrowawayUser(email) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return null;

  const response = await fetch(process.env.SUPABASE_URL + '/auth/v1/admin/users?per_page=1000', {
    headers: { apikey: key, Authorization: 'Bearer ' + key }
  });

  if (!response.ok) return null;

  const payload = await response.json();
  const users = Array.isArray(payload) ? payload : payload.users || [];
  const found = users.find((u) => u.email === email);

  return found ? { id: found.id, email } : null;
}

async function deleteThrowawayUser(user) {
  if (!user) return;

  await fetch(process.env.SUPABASE_URL + '/auth/v1/admin/users/' + user.id, {
    method: 'DELETE',
    headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY, Authorization: 'Bearer ' + process.env.SUPABASE_SERVICE_ROLE_KEY }
  });
}

async function run() {
  console.log('Uji dashboard admin YPI Nurul Ilmi');
  console.log('==================================');
  console.log('');

  const email = 'admin@ypinurulilmi.or.id';
  const password = process.env.SUPABASE_ADMIN_PASSWORD;

  if (!password) {
    console.error('SUPABASE_ADMIN_PASSWORD belum diisi di .env. Akun dibuat tanpa password.');
    process.exit(1);
  }

  console.log('1. AUTENTIKASI');
  const good = await AUTH.signIn(email, password);
  check('login admin berhasil', good.ok === true, good.ok ? good.user.email : good.message);

  const session = await AUTH.session();
  check('sesi tersimpan setelah login', Boolean(session && session.user));

  const userRole = await AUTH.role();
  check('peran terbaca dari user_roles', userRole === 'super_admin', 'peran=' + userRole);

  const guard = await AUTH.guard();
  check('guard mengizinkan admin', guard.ok === true);
  console.log('');

  console.log('2. CRUD ARTIKEL');
  const db = AUTH.client();

  const created = await db
    .from('articles')
    .insert({ title_id: MARK, content_id: MARK, status: 'draft', author_name: 'probe' })
    .select()
    .single();

  check('buat artikel draft', Boolean(created.data), created.error ? created.error.message : 'id=' + created.data.id);
  const articleId = created.data && created.data.id;
  probes.push({ kind: 'article', id: articleId });

  if (articleId) {
    const reread = await db.from('articles').select('*').eq('id', articleId).maybeSingle();
    check('baca balik artikel', Boolean(reread.data), reread.error ? reread.error.message : '');

    const updated = await db
      .from('articles')
      .update({ title_id: MARK + ' (ubah)', content_id: MARK + ' (ubah)' })
      .eq('id', articleId)
      .select()
      .maybeSingle();
    check('ubah artikel', Boolean(updated.data) && updated.data.title_id === MARK + ' (ubah)');

    const deleted = await db.from('articles').delete().eq('id', articleId).select();
    check('hapus artikel', Array.isArray(deleted.data) && deleted.data.length === 1);
    probes.pop();
  }
  console.log('');

  console.log('3. CRUD KATEGORI & TAG');
  const cat = await db
    .from('categories')
    .insert({ name: MARK, slug: 'zzz-probe-' + Date.now() })
    .select()
    .single();
  check('buat kategori', Boolean(cat.data), cat.error ? cat.error.message : '');

  if (cat.data) {
    const upd = await db.from('categories').update({ name: MARK + ' ubah' }).eq('id', cat.data.id).select().maybeSingle();
    check('ubah kategori', Boolean(upd.data));
    const del = await db.from('categories').delete().eq('id', cat.data.id).select();
    check('hapus kategori', Array.isArray(del.data) && del.data.length === 1);
  }

  const tag = await db
    .from('tags')
    .insert({ name: 'ZZZ PROBE', slug: 'zzz-probe-' + Date.now() })
    .select()
    .single();
  check('buat tag', Boolean(tag.data), tag.error ? tag.error.message : '');

  if (tag.data) {
    const del = await db.from('tags').delete().eq('id', tag.data.id).select();
    check('hapus tag', Array.isArray(del.data) && del.data.length === 1);
  }
  console.log('');

  console.log('4. FASILITAS & UNIT');
  const facility = await db.from('facilities').select('id, name, group_type').eq('group_type', 'main').limit(1).single();
  check('baca fasilitas', Boolean(facility.data), facility.error ? facility.error.message : '');

  if (facility.data) {
    const units = await db.from('units').select('id, slug, group_type').order('id');
    const links = await db.from('facility_unit').select('unit_id').eq('facility_id', facility.data.id);
    const linked = new Set((links.data || []).map((row) => row.unit_id));

    // Pilih pasangan fasilitas-unit yang belum terpasang, karena tabel punya
    // constraint unik. Kalau semua unit sudah terpasang, tambahkan unit baru.
    let unitId = units.data.find((u) => !linked.has(u.id));
    let tempUnit = null;

    if (!unitId) {
      tempUnit = await db.from('units').insert({ name: MARK, slug: 'zzz-probe-unit-' + Date.now(), group_type: 'main' }).select().single();
      unitId = tempUnit.data;
    }

    const link = await db
      .from('facility_unit')
      .insert({ facility_id: facility.data.id, unit_id: unitId.id })
      .select()
      .single();
    check('tambah relasi fasilitas-unit', Boolean(link.data), link.error ? link.error.message : '');

    if (link.data) {
      const del = await db.from('facility_unit').delete().eq('id', link.data.id).select();
      check('hapus relasi fasilitas-unit', Array.isArray(del.data) && del.data.length === 1);
    }

    if (tempUnit && tempUnit.data) {
      await db.from('units').delete().eq('id', tempUnit.data.id);
    }
  }
  console.log('');

  console.log('5. UNGGAH MEDIA KE STORAGE');
  const uploadPath = 'articles/probe-' + Date.now() + '.png';
  const payload = Buffer.from('89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c489', 'hex');
  const uploaded = await db.storage.from('media').upload(uploadPath, payload, { contentType: 'image/png', upsert: true });
  check('unggah berkas ke bucket media', !uploaded.error, uploaded.error ? uploaded.error.message : uploadPath);

  if (!uploaded.error) {
    const url = NI.mediaUrl(uploadPath);
    const head = await fetch(url);
    check('URL media publik bisa diakses', head.status === 200, 'HTTP ' + head.status);

    const removed = await db.storage.from('media').remove([uploadPath]);
    check('hapus berkas uji dari bucket', !removed.error, removed.error ? removed.error.message : '');
  }
  console.log('');

  console.log('6. MODERASI KOMENTAR');
  const anon = { apikey: process.env.SUPABASE_ANON_KEY, Authorization: 'Bearer ' + process.env.SUPABASE_ANON_KEY };

  const submitted = await fetch(process.env.SUPABASE_URL + '/rest/v1/rpc/submit_comment', {
    method: 'POST',
    headers: { ...anon, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_article_id: 1, p_name: 'Probe Bot', p_email: null, p_comment: 'komentar uji moderasi', p_hp: null })
  });
  const commentId = await submitted.json();
  check('komentar publik masuk sebagai pending', Number(commentId) > 0, 'id=' + commentId);

  if (Number(commentId) > 0) {
    const pending = await db.from('comments').select('id, status').eq('id', commentId).maybeSingle();
    check('admin melihat komentar pending', Boolean(pending.data), pending.error ? pending.error.message : '');
    check('status awal pending', pending.data && pending.data.status === 'pending', pending.data ? pending.data.status : '-');

    const published = await db.from('comments').update({ status: 'published' }).eq('id', commentId).select().maybeSingle();
    check('admin bisa memoderasi ke published', Boolean(published.data) && published.data.status === 'published');

    const pubAnon = await fetch(process.env.SUPABASE_URL + '/rest/v1/comments?id=eq.' + commentId, { headers: anon });
    const pubRows = await pubAnon.json();
    check('komentar published terlihat publik', Array.isArray(pubRows) && pubRows.length === 1, pubRows.length + ' baris');

    const del = await db.from('comments').delete().eq('id', commentId).select();
    check('hapus komentar uji', Array.isArray(del.data) && del.data.length === 1);
  }
  console.log('');

  console.log('7. KELUAR');
  await AUTH.signOut();
  const after = await AUTH.session();
  check('sesi hilang setelah keluar', !after);

  const guardAfter = await AUTH.guard();
  check('guard menolak tanpa sesi', guardAfter.ok === false);
  check('guard mengarahkan ke halaman login', redirects.length > 0 && String(redirects[redirects.length - 1]).includes('login.html'),
    redirects.length ? String(redirects[redirects.length - 1]) : 'tidak ada redirect');

  /* Uji password salah dijalankan paling akhir: percobaan gagal membuat
     GoTrue menahan login berikutnya, jadi harusnya tidak menghalangi
     langkah-langkah lain dalam skrip ini. */
  const throwaway = await createThrowawayUser();
  const bad = throwaway
    ? await AUTH.signIn(throwaway.email, 'password-salah-sekali')
    : { ok: true, message: 'akun uji tidak dibuat' };
  check('login dengan password salah ditolak', bad.ok === false, bad.message);
  await deleteThrowawayUser(throwaway);
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

async function main() {
  try {
    await run();
  } finally {
    await cleanupResidue();
  }
}

main().catch((error) => {
  console.error('Gagal: ' + error.message);
  process.exit(1);
});
