/* ==========================================================================
   PEMUAT DATA BISNIS KE SUPABASE
   --------------------------------------------------------------------------
   Membaca supabase/data.sql (hasil ekspor MySQL) lalu memuatnya ke Supabase
   lewat PostgREST memakai service_role. Jalankan SETELAH supabase/schema.sql.

   Urutan tabel dijaga sesuai urutan foreign key di schema.sql.

   Contoh:
     SUPABASE_URL=https://xxx.supabase.co \
     SUPABASE_SERVICE_ROLE_KEY=<service_role> \
     node scripts/migrate-data.mjs

   Ukur tanpa menyentuh jaringan:
     node scripts/migrate-data.mjs --dry-run
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';

import { ROOT, insertRows, callRpc } from './lib/supabase-rest.mjs';
import { parseDataSql } from './lib/sql-inserts.mjs';

const DATA_FILE = path.join(ROOT, 'supabase', 'data.sql');

/* Urutan muat: tabel induk lebih dulu. */
const TABLE_ORDER = [
  'categories',
  'units',
  'tags',
  'articles',
  'article_media',
  'article_tags',
  'comments',
  'facilities',
  'facility_photos',
  'facility_unit'
];

/* Kolom numerik per tabel. Nilai di data.sql ditulis sebagai string ('1');
   dikonversi di sini agar tipe data PostgREST tepat. */
const NUMERIC_COLUMNS = {
  categories: ['id'],
  units: ['id'],
  tags: ['id'],
  articles: ['id', 'category_id', 'views'],
  article_media: ['id', 'article_id', 'sort_order'],
  article_tags: ['id', 'article_id', 'tag_id'],
  comments: ['id', 'article_id'],
  facilities: ['id', 'sort_order'],
  facility_photos: ['id', 'facility_id', 'sort_order'],
  facility_unit: ['id', 'facility_id', 'unit_id']
};

function coerce(table, row) {
  const numeric = NUMERIC_COLUMNS[table] || [];
  const out = {};

  Object.keys(row).forEach((column) => {
    const value = row[column];

    if (numeric.indexOf(column) !== -1 && typeof value === 'string' && /^-?\d+$/.test(value)) {
      out[column] = Number(value);
      return;
    }

    out[column] = value;
  });

  return out;
}

async function main() {
  if (!fs.existsSync(DATA_FILE)) {
    console.error('Berkas tidak ditemukan: ' + DATA_FILE);
    process.exit(1);
  }

  const dryRun = process.argv.includes('--dry-run');

  const sql = fs.readFileSync(DATA_FILE, 'utf8');
  const blocks = parseDataSql(sql);

  const byTable = {};

  blocks.forEach((block) => {
    byTable[block.table] = block.rows.map((row) => coerce(block.table, row));
  });

  console.log('Membaca ' + path.relative(ROOT, DATA_FILE) + ' — ' + blocks.length + ' blok INSERT');
  console.log('');

  let total = 0;

  for (const table of TABLE_ORDER) {
    const rows = byTable[table];

    if (!rows) {
      console.log('  - ' + table.padEnd(16) + ' (tidak ada di data.sql)');
      continue;
    }

    if (!rows.length) {
      console.log('  - ' + table.padEnd(16) + '0 baris');
      continue;
    }

    if (!dryRun) await insertRows(table, rows);
    total += rows.length;

    console.log('  + ' + table.padEnd(16) + rows.length + ' baris');

    if (dryRun) console.log('      contoh: ' + JSON.stringify(rows[0]));
  }

  const unknown = Object.keys(byTable).filter((table) => !TABLE_ORDER.includes(table));

  if (unknown.length) {
    console.log('');
    console.log('Tabel di luar daftar (dilewati): ' + unknown.join(', '));
  }

  console.log('');
  console.log('Total baris: ' + total);

  if (dryRun) {
    console.log('');
    console.log('Mode dry-run: tidak ada data yang dikirim ke Supabase.');
    return;
  }

  try {
    await callRpc('reset_sequences', {});
    console.log('Sequence id disetel ulang (reset_sequences).');
  } catch (error) {
    console.log('Peringatan: reset_sequences gagal - ' + error.message);
    console.log('Jalankan select setval(...) yang ada di supabase/data.sql secara manual.');
  }

  console.log('');
  console.log('Selesai. Data di MySQL tidak dihapus.');
}

main().catch(function (error) {
  console.error('Gagal: ' + error.message);
  process.exit(1);
});
