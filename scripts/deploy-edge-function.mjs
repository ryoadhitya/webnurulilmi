/* ==========================================================================
   DEPLOY EDGE FUNCTION "translate" KE SUPABASE
   --------------------------------------------------------------------------
   Mengirim berkas sumber supabase/functions/translate lewat Management API:

     POST https://api.supabase.com/v1/projects/<ref>/functions/deploy?slug=<nama>

   Environment variable:
     SUPABASE_ACCESS_TOKEN -> Personal Access Token Supabase
     SUPABASE_PROJECT_REF  -> ref project
     EDGE_FUNCTION_NAME    -> nama fungsi (default "translate")
     EDGE_FUNCTION_VERIFY_JWT -> "false" untuk fungsi yang dipanggil
                          pengunjung umum (default "true")

   Catatan: fungsi memakai verify_jwt bawaan Supabase. Fungsi terjemahan
   memakai MyMemory dan tidak memerlukan kunci API. Secret opsional
   MYMEMORY_EMAIL disetel terpisah di Dashboard > Edge Functions > Secrets
   > translate untuk menaikkan kuota harian MyMemory.
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

/** Kumpulkan seluruh berkas sumber di dalam folder fungsi. */
function collectSources(folder) {
  const files = [];

  for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      files.push(...collectSources(path.join(folder, entry.name)));
      continue;
    }

    if (!/\.(ts|js|mjs|json|txt)$/i.test(entry.name)) continue;

    files.push({
      path: entry.name,
      bytes: fs.readFileSync(path.join(folder, entry.name))
    });
  }

  return files;
}

async function main() {
  loadEnv();

  const token = (process.env.SUPABASE_ACCESS_TOKEN || '').trim();
  const ref = projectRef();
  const name = (process.env.EDGE_FUNCTION_NAME || 'translate').trim();

  /* Fungsi yang dipanggil pengunjung umum perlu verify_jwt = false;
     fungsi yang dipakai admin (translate) tetap memakai verify_jwt = true. */
  const verifyJwt = String(process.env.EDGE_FUNCTION_VERIFY_JWT || 'true').toLowerCase() !== 'false';

  if (!token) {
    console.error('SUPABASE_ACCESS_TOKEN belum diisi.');
    console.error('Buat PAT di https://supabase.com/dashboard/account/tokens');
    process.exit(1);
  }

  const folder = path.join(ROOT, 'supabase', 'functions', name);

  if (!fs.existsSync(folder)) {
    console.error('Folder fungsi tidak ditemukan: ' + folder);
    process.exit(1);
  }

  const sources = collectSources(folder);

  if (!sources.length) {
    console.error('Tidak ada berkas sumber di: ' + folder);
    process.exit(1);
  }

  console.log('Project ref : ' + ref);
  console.log('Fungsi      : ' + name);
  console.log('verify_jwt  : ' + verifyJwt);
  sources.forEach((file) => console.log('  - ' + file.path + ' (' + file.bytes.length + ' byte)'));
  console.log('');

  const form = new FormData();

  form.append(
    'metadata',
    JSON.stringify({
      entrypoint_path: 'index.ts',
      import_map_path: '',
      name: name,
      verify_jwt: verifyJwt
    })
  );

  /* Management API menerima berkas sumber apa adanya (bukan zip). Nama berkas
     pada multipart menentukan path-nya di dalam bundle fungsi. */
  sources.forEach((file) => {
    form.append('file', new Blob([file.bytes], { type: 'application/octet-stream' }), file.path);
  });

  const response = await fetch(
    'https://api.supabase.com/v1/projects/' + ref + '/functions/deploy?slug=' + encodeURIComponent(name),
    {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token
      },
      body: form
    }
  );

  const text = await response.text();

  if (!response.ok) {
    console.error('Gagal deploy fungsi: HTTP ' + response.status);
    console.error(text);
    process.exit(1);
  }

  console.log('Edge Function "' + name + '" berhasil di-deploy.');
  console.log(text.slice(0, 2000));
}

main().catch(function (error) {
  console.error('Gagal: ' + error.message);
  process.exit(1);
});
