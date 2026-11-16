/* ==========================================================================
   ORKESTRATOR MIGRASI LENGKAP KE SUPABASE
   --------------------------------------------------------------------------
   Menjalankan seluruh rangkaian dalam urutan yang benar:

     1. deploy-schema.mjs        -> terapkan supabase/schema.sql
     2. apply-rbac.mjs           -> terapkan migration RBAC (5 peran + unit)
     3. migrate-data.mjs         -> muat 124 baris data bisnis
     4. migrate-storage.mjs      -> unggah 18 berkas media (+ _orphan/)
     5. seed-admin.mjs           -> buat akun admin yayasan + user_roles
     6. seed-unit-admins.mjs     -> buat 4 akun admin unit + user_units
     7. verify-migration.mjs     -> verifikasi jumlah baris, RLS, URL media

   Semua langkah aman diulang: schema memakai `if not exists` / `drop policy
   if exists`, data ditulis dengan `upsert`, storage memakai `upsert`.

   Cara pakai:
     node scripts/run-migration.mjs
     node scripts/run-migration.mjs --from data      # lewati schema
     node scripts/run-migration.mjs --only storage   # jalankan satu langkah
   ========================================================================== */
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

const STEPS = [
  { name: 'schema', script: 'deploy-schema.mjs' },
  { name: 'rbac', script: 'apply-rbac.mjs' },
  { name: 'data', script: 'migrate-data.mjs' },
  { name: 'storage', script: 'migrate-storage.mjs' },
  { name: 'admin', script: 'seed-admin.mjs' },
  { name: 'unit-admins', script: 'seed-unit-admins.mjs' },
  { name: 'verify', script: 'verify-migration.mjs' }
];

function argValue(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return null;
  return process.argv[index + 1] || null;
}

function main() {
  const only = argValue('--only');
  const from = argValue('--from');

  let steps = STEPS;

  if (only) {
    steps = STEPS.filter((step) => step.name === only);

    if (!steps.length) {
      console.error('Langkah tidak dikenal: ' + only);
      console.error('Pilihan: ' + STEPS.map((step) => step.name).join(', '));
      process.exit(1);
    }
  } else if (from) {
    const index = STEPS.findIndex((step) => step.name === from);

    if (index === -1) {
      console.error('Langkah tidak dikenal: ' + from);
      process.exit(1);
    }

    steps = STEPS.slice(index);
  }

  console.log('Langkah yang dijalankan: ' + steps.map((step) => step.name).join(' -> '));
  console.log('');

  for (const step of steps) {
    console.log('==================================================================');
    console.log(' LANGKAH: ' + step.name);
    console.log('==================================================================');

    execFileSync(process.execPath, [path.join(HERE, step.script)], {
      stdio: 'inherit',
      env: process.env
    });

    console.log('');
  }

  console.log('Rangkaian selesai.');
  console.log('Catatan: MySQL dan berkas lokal tidak diubah oleh langkah mana pun.');
}

main();
