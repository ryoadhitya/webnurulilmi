/* ==========================================================================
   MIGRASI AUTENTIKASI ADMIN KE SUPABASE AUTH
   --------------------------------------------------------------------------
   Strategi aman: akun admin yang ada di MySQL (tabel `users`) dibuat ulang
   sebagai pengguna Supabase Auth DENGAN EMAIL YANG SAMA. Password lama
   (hash bcrypt Laravel) tidak bisa dipindahkan, jadi:

     - bila SUPABASE_ADMIN_PASSWORD diisi, semua akun dibuat dengan password
       tersebut dan Wajib diganti saat login pertama;
     - bila tidak diisi, akun dibuat tanpa password dan pemilik akun perlu
       memakai "Reset password" di Supabase / tautan pemulihan.

   Tidak ada akun MySQL yang dihapus. Tabel `users` lama dibiarkan utuh.

   Contoh:
     SUPABASE_URL=https://xxx.supabase.co \
     SUPABASE_SERVICE_ROLE_KEY=<service_role> \
     SUPABASE_ADMIN_PASSWORD=<password sementara> \
     node scripts/seed-admin.mjs

   Daftar email bisajugadiberi langsung, tanpa membaca MySQL:
     node scripts/seed-admin.mjs --email admin@ypinurulilmi.or.id --role admin
   ========================================================================== */
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ROOT, config, request } from './lib/supabase-rest.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));

const MYSQL_BIN =
  process.env.MYSQL_BIN ||
  'C:/laragon/bin/mysql/mysql-8.0.30-winx64/bin/mysql.exe';

const MYSQL_HOST = process.env.MYSQL_HOST || '127.0.0.1';
const MYSQL_PORT = process.env.MYSQL_PORT || '3306';
const MYSQL_USER = process.env.MYSQL_USER || 'root';
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || '';
const MYSQL_DATABASE = process.env.MYSQL_DATABASE || 'web_nurul_ilmi';

/** Daftar akun admin dari MySQL (hanya baca). */
function readMysqlUsers() {
  const sql =
    "select id, name, email from users where email is not null and email <> '' order by id;";

  const args = [
    '-h', MYSQL_HOST,
    '-P', String(MYSQL_PORT),
    '-u', MYSQL_USER,
    '--batch',
    '--raw',
    '--skip-column-names',
    MYSQL_DATABASE,
    '-e', sql
  ];

  if (MYSQL_PASSWORD) args.splice(5, 0, '-p' + MYSQL_PASSWORD);

  const output = execFileSync(MYSQL_BIN, args, { encoding: 'utf8' });

  return output
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .map((line) => {
      const parts = line.split('\t');
      return { id: parts[0], name: parts[1] || '', email: parts[2] };
    });
}

/* Butir 1 (keputusan yang sudah disetujui): akun `admin@test.local` tidak
   diundang ke Supabase. Akun ini tetap utuh di MySQL dan di dump backup.
   Mode manual --email tetap dapat memakainya bila memang diperlukan. */
const EXCLUDED_EMAILS = ['admin@test.local'];

/** Semua pengguna yang sudah ada di Supabase Auth. */
async function listAuthUsers() {
  const cfg = config();

  const response = await fetch(cfg.url + '/auth/v1/admin/users?per_page=1000', {
    headers: {
      apikey: cfg.key,
      Authorization: 'Bearer ' + cfg.key
    }
  });

  if (!response.ok) {
    throw new Error('gagal membaca daftar pengguna Auth: HTTP ' + response.status);
  }

  const payload = await response.json();

  return Array.isArray(payload) ? payload : payload.users || [];
}

async function createAuthUser(email, password, name) {
  const cfg = config();

  const body = {
    email: email,
    email_confirm: true,
    user_metadata: { name: name || email }
  };

  if (password) body.password = password;

  const response = await fetch(cfg.url + '/auth/v1/admin/users', {
    method: 'POST',
    headers: {
      apikey: cfg.key,
      Authorization: 'Bearer ' + cfg.key,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error('gagal membuat pengguna ' + email + ': HTTP ' + response.status + ' - ' + text);
  }

  return JSON.parse(text);
}

async function setPassword(userId, password) {
  const cfg = config();

  const response = await fetch(cfg.url + '/auth/v1/admin/users/' + userId, {
    method: 'PUT',
    headers: {
      apikey: cfg.key,
      Authorization: 'Bearer ' + cfg.key,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ password: password })
  });

  if (!response.ok) {
    throw new Error('gagal mengganti password ' + userId + ': HTTP ' + response.status);
  }
}

async function upsertRole(userId, role, grantedBy) {
  const existing = await request('/rest/v1/user_roles?user_id=eq.' + userId, {
    method: 'GET',
    label: 'cek user_roles'
  });

  if (Array.isArray(existing) && existing.length) {
    await request('/rest/v1/user_roles?user_id=eq.' + userId, {
      method: 'PATCH',
      body: { role: role },
      label: 'update user_roles'
    });
    return 'diperbarui';
  }

  await request('/rest/v1/user_roles', {
    method: 'POST',
    body: { user_id: userId, role: role, granted_by: grantedBy || null },
    label: 'insert user_roles'
  });

  return 'ditambahkan';
}

/** Pasang author_id artikel yang tadinya hanya|author_name| yang cocok. */
async function backfillAuthorIds(userId, authorName, role) {
  const rows = await request('/rest/v1/articles?author_id=is.null&select=id,author_name', {
    method: 'GET',
    label: 'cek articles'
  });

  // Akun admin adalah satu-satunya pengelola => semua artikel tanpa author_id
  // jatuh ke akun ini, apa pun nilai author_name lama ("Admin", "Admin Test").
  // Akun lain hanya mengambil artikel yang author_name-nya cocok.
  const targets = (rows || []).filter((row) => {
    if (role === 'super_admin') return true;
    if (!authorName) return true;
    return String(row.author_name || '').toLowerCase() === String(authorName).toLowerCase();
  });

  if (!targets.length) return 0;

  await request('/rest/v1/articles?id=in.(' + targets.map((row) => row.id).join(',') + ')', {
    method: 'PATCH',
    body: { author_id: userId },
    label: 'update articles.author_id'
  });

  return targets.length;
}

async function main() {
  const cfg = config();
  const password = process.env.SUPABASE_ADMIN_PASSWORD || '';
  const role = process.env.SUPABASE_ADMIN_ROLE || 'super_admin';

  const emailArg = argValue('--email');
  const roleArg = argValue('--role');
  const targetRole = roleArg || role;

  let users;

  if (emailArg) {
    users = [{ id: '-', name: emailArg, email: emailArg }];
    console.log('Mode manual: ' + emailArg + ' (role ' + targetRole + ')');
  } else {
    try {
      users = readMysqlUsers();
      console.log('Membaca ' + users.length + ' akun dari MySQL `users`');
    } catch (error) {
      console.error('Gagal membaca MySQL: ' + error.message);
      console.error('Jalankan dengan --email <alamat> bila ingin melewati MySQL.');
      process.exit(1);
    }

    const kept = users.filter(function (user) {
      const email = String(user.email || '').trim().toLowerCase();
      const excluded = EXCLUDED_EMAILS.indexOf(email) !== -1;

      if (excluded) {
        console.log('  - dilewati ' + user.email + ' (Butir 1: akun uji lokal tidak diundang)');
      }

      return !excluded;
    });

    users = kept;
  }

  if (!users.length) {
    console.log('Tidak ada akun untuk dimigrasikan.');
    return;
  }

  const existing = await listAuthUsers();
  const byEmail = new Map(existing.map((row) => [String(row.email || '').toLowerCase(), row]));

  console.log('');
  console.log('Pengguna Auth yang sudah ada: ' + existing.length);
  console.log('');

  const created = [];

  for (const user of users) {
    const email = String(user.email).trim();
    const key = email.toLowerCase();
    const found = byEmail.get(key);

    let authUser = found;

    if (!found) {
      authUser = await createAuthUser(email, password, user.name);
      created.push(authUser);
      console.log('  + dibuat   ' + email + '  (id ' + authUser.id + ')');
    } else {
      if (password) {
        await setPassword(authUser.id, password);
        console.log('  ~ password ' + email + ' diperbarui');
      } else {
        console.log('  = ada     ' + email + '  (id ' + authUser.id + ')');
      }
    }

    const roleState = await upsertRole(authUser.id, targetRole, created[0] ? created[0].id : null);
    console.log('      role   ' + targetRole + ' (' + roleState + ')');

    const updated = await backfillAuthorIds(authUser.id, user.name, targetRole);
    if (updated) console.log('      artikel dengan author_id diperbarui: ' + updated);
  }

  console.log('');
  console.log('Ringkasan: ' + created.length + ' akun dibuat, ' +
    (users.length - created.length) + ' akun sudah ada.');
  console.log('');

  if (!password) {
    console.log('Perhatian: akun dibuat TANPA password.');
    console.log('Gunakan "Reset password" di Supabase Dashboard, atau jalankan ulang');
    console.log('dengan SUPABASE_ADMIN_PASSWORD=<password>.');
    console.log('');
  } else {
    console.log('Password sementara dipakai. Ganti password setiap akun setelah login pertama.');
    console.log('');
  }

  console.log('Tabel `users` di MySQL tidak dihapus dan tidak diubah.');
}

function argValue(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return null;
  return process.argv[index + 1] || null;
}

main().catch(function (error) {
  console.error('Gagal: ' + error.message);
  process.exit(1);
});
