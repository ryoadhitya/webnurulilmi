/* ==========================================================================
   BUAT AKUN ADMIN UNIT (5 PERAN BARU)
   --------------------------------------------------------------------------
   Membuat (atau menyegarkan) empat akun admin unit di Supabase Auth lalu
   menautkannya ke tabel user_roles dan user_units:

     admin.tk@ypinurulilmi.or.id     -> tk_nurul_ilmi    -> TK Nurul Ilmi
     admin.sd@ypinurulilmi.or.id     -> sd_nurul_ilmi    -> SD Nurul Ilmi
     admin.smp@ypinurulilmi.or.id    -> smp_nurul_ilmi   -> SMP Nurul Ilmi
     admin.sigma@ypinurulilmi.or.id  -> sigma_nurul_ilmi -> TK Sigma + Daycare Sigma

   Aturan:
     - Password dibuat acak & kuat (crypto.randomBytes), TIDAK dicetak ke
       terminal. Nilainya ditulis ke berkas lokal `.akun-admin.txt` yang
       sudah masuk .gitignore, supaya bisa dipakai untuk uji login manual.
     - Tidak ada password hardcoded di source code, Git, atau database.
     - Akun langsung confirmed (email_confirm = true), tidak ada email
       undangan karena SMTP belum dikonfigurasi.
     - Akun yang sudah ada diperbarui, bukan diduplikasi.
     - Peran super_admin untuk admin@ypinurulilmi.or.id tidak diubah oleh
       skrip ini (sudah diatur oleh migrasi RBAC).

   Jalankan:
     node scripts/seed-unit-admins.mjs
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

import { ROOT, loadEnv } from './lib/env.mjs';

loadEnv();

const REPORT_FILE = path.join(ROOT, '.akun-admin.txt');

const ACCOUNTS = [
  {
    email: 'admin.tk@ypinurulilmi.or.id',
    role: 'tk_nurul_ilmi',
    label: 'Admin TK Nurul Ilmi',
    unitSlugs: ['tk-nurul-ilmi']
  },
  {
    email: 'admin.sd@ypinurulilmi.or.id',
    role: 'sd_nurul_ilmi',
    label: 'Admin SD Nurul Ilmi',
    unitSlugs: ['sd-nurul-ilmi']
  },
  {
    email: 'admin.smp@ypinurulilmi.or.id',
    role: 'smp_nurul_ilmi',
    label: 'Admin SMP Nurul Ilmi',
    unitSlugs: ['smp-nurul-ilmi']
  },
  {
    email: 'admin.sigma@ypinurulilmi.or.id',
    role: 'sigma_nurul_ilmi',
    label: 'Admin Unit Sigma (TK Sigma + Daycare Sigma)',
    unitSlugs: ['tk-sigma', 'daycare-sigma']
  }
];

/* Alfabet tanpa karakter yang sering bermasalah di form/konfigurasi. */
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*-_=+';

function makePassword(length) {
  const bytes = crypto.randomBytes(length);
  let out = '';

  for (let i = 0; i < length; i += 1) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }

  return out;
}

function serviceHeaders() {
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  return { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' };
}

async function restGet(pathname) {
  const url = (process.env.SUPABASE_URL || '').trim();
  const response = await fetch(url + '/rest/v1/' + pathname, { headers: serviceHeaders() });

  if (!response.ok) {
    throw new Error('GET ' + pathname + ' -> HTTP ' + response.status + ' ' + (await response.text()));
  }

  return response.json();
}

async function restSend(method, pathname, body, extraHeaders) {
  const url = (process.env.SUPABASE_URL || '').trim();
  const response = await fetch(url + '/rest/v1/' + pathname, {
    method,
    headers: { ...serviceHeaders(), ...(extraHeaders || {}) },
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(method + ' ' + pathname + ' -> HTTP ' + response.status + ' ' + text.slice(0, 300));
  }

  return text ? JSON.parse(text) : null;
}

async function authAdmin(method, pathname, body) {
  const url = (process.env.SUPABASE_URL || '').trim();
  const response = await fetch(url + '/auth/v1/admin/users' + pathname, {
    method,
    headers: serviceHeaders(),
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error('Auth ' + method + ' ' + pathname + ' -> HTTP ' + response.status + ' ' + text.slice(0, 300));
  }

  return JSON.parse(text);
}

/** Uji masuk dengan email + password (password grant). */
async function signIn(email, password) {
  const url = (process.env.SUPABASE_URL || '').trim();
  const anon = (process.env.SUPABASE_ANON_KEY || '').trim();

  const response = await fetch(url + '/auth/v1/token?grant_type=password', {
    method: 'POST',
    headers: { apikey: anon, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    throw new Error('Login gagal: HTTP ' + response.status);
  }

  return response.json();
}

async function main() {
  const url = (process.env.SUPABASE_URL || '').trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  if (!url || !key) {
    console.error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY belum diisi di .env.');
    process.exit(1);
  }

  const units = await restGet('units?select=id,name,slug');
  const unitBySlug = new Map(units.map((u) => [u.slug, u]));

  for (const account of ACCOUNTS) {
    for (const slug of account.unitSlugs) {
      if (!unitBySlug.has(slug)) {
        console.error('Unit "' + slug + '" tidak ada di tabel units.');
        process.exit(1);
      }
    }
  }

  const existing = await authAdmin('GET', '?page=1&per_page=200', null);
  const existingByEmail = new Map((existing.users || []).map((u) => [u.email, u]));

  const report = [];
  const results = [];

  for (const account of ACCOUNTS) {
    const password = makePassword(18);
    const found = existingByEmail.get(account.email);

    let userId;
    let action;

    if (found) {
      await authAdmin('PUT', '/' + found.id, { password });
      userId = found.id;
      action = 'password diperbarui';
    } else {
      const created = await authAdmin('POST', '', {
        email: account.email,
        password,
        email_confirm: true,
        user_metadata: { role: account.role, label: account.label }
      });
      userId = created.id;
      action = 'akun dibuat';
    }

    /* Peran di user_roles (upsert). */
    await restSend('POST', 'user_roles?on_conflict=user_id', {
      user_id: userId,
      role: account.role,
      granted_by: null,
      created_at: new Date().toISOString()
    }, { Prefer: 'resolution=merge-duplicates,return=representation' });

    /* Unit yang boleh dikelola. */
    const wantedUnitIds = account.unitSlugs.map((slug) => unitBySlug.get(slug).id);

    await restSend('DELETE', 'user_units?user_id=eq.' + userId, null);

    for (const unitId of wantedUnitIds) {
      await restSend('POST', 'user_units', {
        user_id: userId,
        unit_id: unitId,
        granted_by: null,
        created_at: new Date().toISOString()
      });
    }

    /* Verifikasi nyata: masuk, lalu baca role & unit lewat sesi tersebut. */
    const session = await signIn(account.email, password);
    const token = session.access_token;

    const roleRows = await (await fetch(url + '/rest/v1/user_roles?select=role', {
      headers: { apikey: (process.env.SUPABASE_ANON_KEY || '').trim(), Authorization: 'Bearer ' + token }
    })).json();

    const unitRows = await (await fetch(url + '/rest/v1/user_units?select=unit_id', {
      headers: { apikey: (process.env.SUPABASE_ANON_KEY || '').trim(), Authorization: 'Bearer ' + token }
    })).json();

    const roleOk = roleRows.length === 1 && roleRows[0].role === account.role;
    const unitsOk = unitRows.length === wantedUnitIds.length &&
      wantedUnitIds.every((id) => unitRows.some((row) => row.unit_id === id));

    results.push({
      email: account.email,
      ok: roleOk && unitsOk,
      detail: 'role=' + (roleRows[0] ? roleRows[0].role : 'tidak ada') +
        ', unit=' + (unitRows.length ? unitRows.map((r) => r.unit_id).join(',') : 'tidak ada')
    });

    report.push({
      email: account.email,
      password,
      role: account.role,
      units: account.unitSlugs.join(', '),
      label: account.label,
      status: roleOk && unitsOk ? 'AKTIF — login terverifikasi' : 'PERLU PERIKSA'
    });

    console.log(
      (roleOk && unitsOk ? 'OK   ' : 'GAGAL') + '  ' + account.email +
      '  (' + action + ', role=' + account.role + ', unit=' + account.unitSlugs.join('+') + ')'
    );
  }

  /* Berkas lokal untuk uji login manual (tidak masuk git). */
  const lines = [
    'AKUN ADMIN UNIT — YPI NURUL ILMI',
    'Dibuat: ' + new Date().toISOString(),
    'Password sementara. Ganti setelah login pertama.',
    '',
    ...report.map((r) =>
      [
        'Email    : ' + r.email,
        'Password : ' + r.password,
        'Peran    : ' + r.role,
        'Unit     : ' + r.units,
        'Status   : ' + r.status,
        ''
      ].join('\n')
    )
  ];

  fs.writeFileSync(REPORT_FILE, lines.join('\n'), 'utf8');

  const allOk = results.every((r) => r.ok);

  console.log('');
  console.log('Akun super_admin (sudah ada, tidak diubah): admin@ypinurulilmi.or.id');
  console.log('Berkas kredensial lokal : .akun-admin.txt (sudah di-ignore git)');
  console.log(allOk ? 'Semua akun terverifikasi.' : 'Ada akun yang perlu diperiksa.');

  if (!allOk) process.exitCode = 1;
}

main().catch((error) => {
  console.error('Gagal: ' + error.message);
  process.exit(1);
});
