/* ==========================================================================
   PEMBANGUN PETA TRANSLITERASI ASCII UNTUK js/utils.js
   --------------------------------------------------------------------------
   Mengambil peta karakter -> ASCII dari voku/portable-ascii (yang dipakai
   Illuminate\Support\Str::ascii) lalu menulisnya ke js/utils.js dalam bentuk
   string ringkas "k:v,k:v,..." agar ukuran berkas tetap kecil.

   Jalankan ulang bila tabel ascii Laravel diperbarui:
     node scripts/generate-ascii-map.mjs
   ========================================================================== */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { ROOT } from './lib/supabase-rest.mjs';

const PHP_BIN =
  process.env.PHP_BIN ||
  'C:/laragon/bin/php/php-8.1.10-Win32-vs16-x64/php.exe';

const UTILS_FILE = path.join(ROOT, 'js', 'utils.js');

function buildPairs() {
  const json = execFileSync(
    PHP_BIN,
    ['-d', 'memory_limit=512M', path.join(ROOT, 'scripts', 'generate-ascii-map.php')],
    { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 }
  );

  const map = JSON.parse(json);
  const parts = [];

  Object.keys(map).forEach((key) => {
    const value = map[key];

    if (key.indexOf(',') !== -1 || key.indexOf(':') !== -1) return;
    if (value.indexOf(',') !== -1 || value.indexOf(':') !== -1) return;

    parts.push(key + ':' + value);
  });

  return { pairs: parts.join(','), count: parts.length };
}

function main() {
  const { pairs, count } = buildPairs();

  const block = [
    "  /* Transliterasi yang PERSIS sama dengan Illuminate\\Support\\Str::ascii()",
    '     (voku/portable-ascii, bahasa "en"). Format ringkas: "k:v,k:v,...". */',
    "  var ASCII_PAIRS = '" + pairs.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "';",
    '',
    '  var ASCII_MAP = null;',
    '',
    '  /** Peta karakter -> ASCII, dibangun sekali saat pertama dipakai. */',
    '  function asciiMap() {',
    '    if (ASCII_MAP) return ASCII_MAP;',
    '',
    '    ASCII_MAP = {};',
    '',
    '    var pairs = ASCII_PAIRS.split(\',\');',
    '',
    '    for (var i = 0; i < pairs.length; i++) {',
    '      var separator = pairs[i].indexOf(\':\');',
    '',
    '      if (separator === -1) continue;',
    '',
    '      ASCII_MAP[pairs[i].slice(0, separator)] = pairs[i].slice(separator + 1);',
    '    }',
    '',
    '    return ASCII_MAP;',
    '  }'
  ].join('\n');

  let content = fs.readFileSync(UTILS_FILE, 'utf8');

  const pattern = /  \/\* Transliterasi yang tidak tertangani oleh NFD[\s\S]*?\n  \};\n/;

  if (!pattern.test(content)) {
    console.error('Blok ASCII_MAP lama tidak ditemukan di js/utils.js.');
    process.exit(1);
  }

  content = content.replace(pattern, block + '\n');

  fs.writeFileSync(UTILS_FILE, content, 'utf8');

  console.log('Peta transliterasi diperbarui: ' + count + ' karakter.');
  console.log('js/utils.js = ' + content.length + ' byte');
}

main();
