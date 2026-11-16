/* ==========================================================================
   Terapkan MIGRASI RBAC KE PROJECT SUPABASE
   --------------------------------------------------------------------------
   Mengirim supabase/migrations/2026_11_15_000100_rbac_units.sql ke
   Management API Supabase, lalu memverifikasi hasil terpasang.

     POST https://api.supabase.com/v1/projects/<ref>/database/query
     Authorization: Bearer <SUPABASE_ACCESS_TOKEN>

   Environment variable:
     SUPABASE_ACCESS_TOKEN -> Personal Access Token Supabase
     SUPABASE_PROJECT_REF  -> ref project (bagian dari project URL)

   Skrip ini idempoten: migration boleh dijalankan berulang kali.
   Nilai kredensial tidak pernah dicetak.
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';

import { ROOT, loadEnv } from './lib/env.mjs';

const MIGRATION_FILE = path.join(
  ROOT,
  'supabase',
  'migrations',
  '2026_11_15_000100_rbac_units.sql'
);

function projectRef() {
  if (process.env.SUPABASE_PROJECT_REF) return process.env.SUPABASE_PROJECT_REF;

  const url = process.env.SUPABASE_URL || '';
  const match = url.match(/https?:\/\/([a-z0-9]+)\.supabase\./i);

  if (!match) {
    console.error('SUPABASE_PROJECT_REF belum diisi dan tidak bisa dibaca dari SUPABASE_URL.');
    process.exit(1);
  }

  return match[1];
}

async function sql(ref, token, query) {
  const response = await fetch(
    'https://api.supabase.com/v1/projects/' + ref + '/database/query',
    {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    }
  );

  const text = await response.text();

  if (!response.ok) {
    throw new Error('HTTP ' + response.status + ' — ' + text.slice(0, 600));
  }

  return text;
}

/** Ambil baris lewat REST API memakai service role (bukan untuk ditampilkan). */
async function rest(pathname) {
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const url = (process.env.SUPABASE_URL || '').trim();

  if (!key || !url) return [];

  const response = await fetch(url + '/rest/v1/' + pathname, {
    headers: { apikey: key, Authorization: 'Bearer ' + key }
  });

  if (!response.ok) return [];

  return response.json();
}

async function main() {
  loadEnv();

  const token = (process.env.SUPABASE_ACCESS_TOKEN || '').trim();
  const ref = projectRef();

  if (!token) {
    console.error('SUPABASE_ACCESS_TOKEN belum diisi.');
    process.exit(1);
  }

  if (!fs.existsSync(MIGRATION_FILE)) {
    console.error('Berkas migrasi tidak ditemukan: ' + MIGRATION_FILE);
    process.exit(1);
  }

  const statement = fs.readFileSync(MIGRATION_FILE, 'utf8');

  console.log('Project ref : ' + ref);
  console.log('Migrasi     : ' + path.relative(ROOT, MIGRATION_FILE));
  console.log('');

  await sql(ref, token, statement);
  console.log('Migrasi RBAC berhasil diterapkan.');
  console.log('');

  /* ---- verifikasi cepat ---- */

  const roles = await rest('user_roles?select=user_id,role');
  const units = await rest('units?select=id,name,slug&order=id');
  const mapping = await rest('user_units?select=user_id,unit_id');

  console.log('TABEL units (tidak diubah oleh migrasi):');
  units.forEach((u) => console.log('  #' + u.id + '  ' + u.slug + '  — ' + u.name));

  console.log('');
  console.log('TABEL user_roles:');
  roles.forEach((r) => console.log('  ' + r.user_id + '  ->  ' + r.role));

  console.log('');
  console.log('TABEL user_units (pemetaan unit per admin): ' + mapping.length + ' baris');
  mapping.forEach((m) => console.log('  ' + m.user_id + '  ->  unit #' + m.unit_id));

  console.log('');
  console.log('Selesai. Lanjutkan: node scripts/seed-unit-admins.mjs');
}

main().catch(function (error) {
  console.error('Gagal: ' + error.message);
  process.exit(1);
});
