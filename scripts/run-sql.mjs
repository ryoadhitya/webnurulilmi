/* ==========================================================================
   PENERAPAN BERKAS SQL KE PROJECT SUPABASE (lewat Management API)
   --------------------------------------------------------------------------
   Mengirim isi berkas .sql ke endpoint SQL Management API Supabase:

     POST https://api.supabase.com/v1/projects/<ref>/database/query
     Authorization: Bearer <SUPABASE_ACCESS_TOKEN>

   Dipakai untuk migration kecil yang aman (menambah kolom/indeks, menambah
   policy). Semua berkas migration memakai "if not exists" supaya bisa
   dijalankan berulang kali tanpa merusak data lama.

   Environment variable:
     SUPABASE_ACCESS_TOKEN -> Personal Access Token Supabase
     SUPABASE_PROJECT_REF  -> ref project (bagian dari project URL)

   Cara pakai:
     node scripts/run-sql.mjs supabase/migrations/<nama>.sql
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';

import { ROOT, loadEnv } from './lib/env.mjs';

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

async function main() {
  loadEnv();

  const target = process.argv[2];

  if (!target) {
    console.error('Pemakaian: node scripts/run-sql.mjs <berkas.sql>');
    process.exit(1);
  }

  const file = path.isAbsolute(target) ? target : path.join(ROOT, target);

  if (!fs.existsSync(file)) {
    console.error('Berkas SQL tidak ditemukan: ' + file);
    process.exit(1);
  }

  const token = (process.env.SUPABASE_ACCESS_TOKEN || '').trim();
  const ref = projectRef();

  if (!token) {
    console.error('SUPABASE_ACCESS_TOKEN belum diisi.');
    process.exit(1);
  }

  const sql = fs.readFileSync(file, 'utf8');

  console.log('Project ref : ' + ref);
  console.log('Berkas      : ' + path.relative(ROOT, file));
  console.log('');

  const response = await fetch(
    'https://api.supabase.com/v1/projects/' + ref + '/database/query',
    {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: sql })
    }
  );

  const text = await response.text();

  if (!response.ok) {
    console.error('Gagal menerapkan SQL: HTTP ' + response.status);
    console.error(text);
    process.exit(1);
  }

  console.log('SQL berhasil diterapkan.');
  if (text.trim()) console.log(text.slice(0, 2000));
}

main().catch(function (error) {
  console.error('Gagal: ' + error.message);
  process.exit(1);
});
