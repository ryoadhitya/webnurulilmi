/* ==========================================================================
   MENULIS KONFIGURASI SUPABASE KE js/site-config.js
   --------------------------------------------------------------------------
   Mengganti placeholder GANTI_DENGAN_* dengan Project URL dan anon/publishable
   key. Kunci ini PUBLIK dan memang dimaksudkan ada di frontend; RLS yang
   menjaga akses tulis, bukan menyembunyikan kunci.

   Environment variable:
     SUPABASE_URL       -> https://xxxx.supabase.co
     SUPABASE_ANON_KEY  -> anon / publishable key

   Sumber kebenaran adalah berkas .env di akar project (sudah masuk
   .gitignore). Nilai di shell selalu menang.
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';

import { ROOT, loadEnv } from './lib/env.mjs';

const CONFIG_FILE = path.join(ROOT, 'js', 'site-config.js');

function escapeSingleQuote(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function main() {
  loadEnv();

  const url = (process.env.SUPABASE_URL || '').trim();
  const anonKey = (process.env.SUPABASE_ANON_KEY || '').trim();

  if (!url || !anonKey) {
    console.error('SUPABASE_URL dan SUPABASE_ANON_KEY wajib diisi.');
    console.error('Isi keduanya di berkas .env di akar project.');
    process.exit(1);
  }

  if (/service_role/i.test(anonKey)) {
    console.error('service_role key terdeteksi. Hentikan — kunci itu tidak boleh di frontend.');
    process.exit(1);
  }

  let content = fs.readFileSync(CONFIG_FILE, 'utf8');

  content = content.replace(
    /supabaseUrl:\s*'[^']*'/,
    "supabaseUrl: '" + escapeSingleQuote(url) + "'"
  );

  content = content.replace(
    /supabaseAnonKey:\s*'[^']*'/,
    "supabaseAnonKey: '" + escapeSingleQuote(anonKey) + "'"
  );

  fs.writeFileSync(CONFIG_FILE, content, 'utf8');

  console.log('js/site-config.js diperbarui.');
  console.log('  supabaseUrl     : ' + url);
  console.log('  supabaseAnonKey : ' + anonKey.slice(0, 12) + '... (' + anonKey.length + ' karakter)');
}

main();
