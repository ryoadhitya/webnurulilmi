/* ==========================================================================
   PENERAPAN SKEMA SQL KE PROJECT SUPABASE (lewat Management API)
   --------------------------------------------------------------------------
   Mengirim supabase/schema.sql ke endpoint SQL Management API Supabase:

     POST https://api.supabase.com/v1/projects/<ref>/database/query
     Authorization: Bearer <SUPABASE_ACCESS_TOKEN>

   Environment variable:
     SUPABASE_ACCESS_TOKEN -> Personal Access Token Supabase
     SUPABASE_PROJECT_REF  -> ref project (bagian dari project URL)

   Sumber kebenaran environment adalah berkas .env di akar project (sudah
   masuk .gitignore). Nilai dari shell selalu menang.
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';

import { ROOT, loadEnv } from './lib/env.mjs';

const SCHEMA_FILE = path.join(ROOT, 'supabase', 'schema.sql');

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

  const token = (process.env.SUPABASE_ACCESS_TOKEN || '').trim();
  const ref = projectRef();

  if (!token) {
    console.error('SUPABASE_ACCESS_TOKEN belum diisi.');
    console.error('Buat PAT di https://supabase.com/dashboard/account/tokens');
    console.error('Isi di berkas .env (baris SUPABASE_ACCESS_TOKEN=...).');
    process.exit(1);
  }

  if (!fs.existsSync(SCHEMA_FILE)) {
    console.error('Berkas schema tidak ditemukan: ' + SCHEMA_FILE);
    process.exit(1);
  }

  const sql = fs.readFileSync(SCHEMA_FILE, 'utf8');

  console.log('Project ref : ' + ref);
  console.log('Schema      : ' + path.relative(ROOT, SCHEMA_FILE) + ' (' + sql.length + ' byte)');
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
    console.error('Gagal menerapkan schema: HTTP ' + response.status);
    console.error(text);
    process.exit(1);
  }

  console.log('Schema berhasil diterapkan.');
  console.log(text.slice(0, 2000));
}

main().catch(function (error) {
  console.error('Gagal: ' + error.message);
  process.exit(1);
});
