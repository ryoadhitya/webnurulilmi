/* ==========================================================================
   TES PARITAS slugify() JS  vs  Str::slug() LARAVEL
   --------------------------------------------------------------------------
   Memastikan helper slugify() di js/utils.js menghasilkan nilai yang PERSIS
   sama dengan Str::slug() Laravel, supaya slug yang sudah tersimpan di MySQL
   tidak berubah setelah pindah ke Supabase.

   Butuh PHP CLI + salinan dependensi PHP di scripts/php-vendor.

     node scripts/test-slug-parity.mjs
   ========================================================================== */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

import { ROOT } from './lib/supabase-rest.mjs';

const PHP_BIN =
  process.env.PHP_BIN ||
  'C:/laragon/bin/php/php-8.1.10-Win32-vs16-x64/php.exe';

const CASES = [
  'Ruang Kelas AC',
  'Laboratorium Komputer',
  'TK Nurul Ilmi',
  'Daycare Sigma',
  'Eshtrakurikuler',
  'user@example.com',
  'a_b_c',
  'a-b-c',
  '  spasi  banyak  ',
  'PANGKASAN:參考 & Memo!',
  'Angka 123456',
  'UPPER lower MiXeD',
  'Café & Crème',
  'Naïve façade',
  'Đường Việt Nam',
  'Ærø Straße',
  'Straße Größe',
  'Ħarbour Ŀoy',
  'Đurča Þing',
  'slug--dengan--dua--strip',
  '-leading-and-trailing-',
  '___',
  '!!!',
  '',
  '   ',
  'Ösaka',
  'Ñandú',
  'Ekstrakurikuler &habilitas',
  'a.b.c',
  'a/b\\c',
  '100% guarantee',
  '2026/2027',
  'Kelas 1A & 1B',
  'emoji 🎉 test',
  'tab\tand\nnewline'
];

/** Muat js/utils.js di sandbox browser-minimal. */
function loadUtils() {
  const source = fs.readFileSync(path.join(ROOT, 'js', 'utils.js'), 'utf8');
  const sandbox = { window: {}, document: {} };

  sandbox.window.window = sandbox.window;
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox);

  return sandbox.window.NIUtils;
}

function main() {
  if (!fs.existsSync(PHP_BIN)) {
    console.error('PHP CLI tidak ditemukan: ' + PHP_BIN);
    console.error('Set PHP_BIN atau lewati tes ini.');
    process.exit(1);
  }

  const php = execFileSync(
    PHP_BIN,
    [path.join(ROOT, 'scripts', 'slug-php.php')],
    { input: JSON.stringify(CASES), encoding: 'utf8' }
  );

  const laravel = JSON.parse(php);
  const utils = loadUtils();

  let mismatch = 0;

  console.log('Kasus diuji: ' + CASES.length);
  console.log('');

  CASES.forEach(function (value, index) {
    const js = utils.slugify(value);
    const laravelSlug = laravel[index];

    if (js !== laravelSlug) {
      mismatch += 1;
      console.log('BEDA  input=' + JSON.stringify(value));
      console.log('      Laravel = ' + JSON.stringify(laravelSlug));
      console.log('      JS      = ' + JSON.stringify(js));
    }
  });

  console.log('');
  console.log('Cocok: ' + (CASES.length - mismatch) + '/' + CASES.length);

  if (mismatch) {
    console.log('slugify() harus diperbaiki agar sama dengan Str::slug().');
    process.exit(1);
  }

  console.log('slugify() identik dengan Str::slug() Laravel.');
}

main();
