#!/usr/bin/env node
/**
 * Ekspor 10 tabel bisnis MySQL -> supabase/data.sql (sintaks PostgreSQL).
 *
 * Sumber : MySQL `web_nurul_ilmi` (dibaca saja, tidak ada perubahan).
 * Keluaran: INSERT dengan ID lama dipertahankan + setval sequence.
 *
 * Jalankan:
 *   node scripts/export-data.mjs
 *
 * Env (opsional, default sesuai mesin lokal Laragon):
 *   MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE
 */
import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const MYSQL_BIN =
  process.env.MYSQL_BIN ||
  'C:/laragon/bin/mysql/mysql-8.0.30-winx64/bin/mysql.exe';

const HOST = process.env.MYSQL_HOST || '127.0.0.1';
const PORT = process.env.MYSQL_PORT || '3306';
const USER = process.env.MYSQL_USER || 'root';
const PASSWORD = process.env.MYSQL_PASSWORD || '';
const DATABASE = process.env.MYSQL_DATABASE || 'web_nurul_ilmi';

/** Kolom yang dimigrasikan per tabel, urut sama seperti definisi tabel. */
const TABLES = [
  {
    name: 'categories',
    columns: ['id', 'name', 'slug', 'created_at', 'updated_at'],
  },
  {
    name: 'units',
    columns: ['id', 'name', 'slug', 'group_type', 'description', 'created_at', 'updated_at'],
  },
  {
    name: 'tags',
    columns: ['id', 'name', 'slug', 'created_at', 'updated_at'],
  },
  {
    name: 'articles',
    columns: [
      'id', 'category_id', 'title_id', 'content_id', 'title_en', 'content_en',
      'image', 'author_name', 'status', 'published_at', 'views', 'created_at', 'updated_at',
    ],
  },
  {
    name: 'article_media',
    columns: [
      'id', 'article_id', 'type', 'path', 'mime_type', 'caption',
      'sort_order', 'created_at', 'updated_at',
    ],
    // Butir 2 (disetujui): file `articles/media/aaa.jpg` hilang dari disk,
    // baris tidak dimigrasikan. Dicatat di laporan migrasi.
    skipIds: [5],
  },
  {
    name: 'article_tags',
    columns: ['id', 'article_id', 'tag_id'],
  },
  {
    name: 'comments',
    columns: [
      'id', 'article_id', 'name', 'comment', 'email',
      'created_at', 'updated_at',
    ],
    defaults: { status: "'published'", ip_hash: 'null' },
  },
  {
    name: 'facilities',
    columns: [
      'id', 'name', 'slug', 'description', 'icon', 'is_published',
      'group_type', 'sort_order', 'created_at', 'updated_at',
    ],
  },
  {
    name: 'facility_photos',
    columns: [
      'id', 'facility_id', 'image_path', 'caption', 'alt_text',
      'sort_order', 'is_cover', 'created_at', 'updated_at',
    ],
  },
  {
    name: 'facility_unit',
    columns: ['id', 'facility_id', 'unit_id', 'created_at', 'updated_at'],
  },
];

/** Kolom bertipe timestamp. */
const TIMESTAMP_COLUMNS = new Set([
  'created_at', 'updated_at', 'published_at',
]);

/** Kolom bertipe boolean (tinyint di MySQL). */
const BOOLEAN_COLUMNS = new Set(['is_published', 'is_cover']);

function mysql(query) {
  const args = [
    `-h${HOST}`,
    `-P${PORT}`,
    `-u${USER}`,
    '--default-character-set=utf8mb4',
    '--batch',
    '--skip-column-names',
    DATABASE,
    '-e',
    query,
  ];

  if (PASSWORD) args.splice(3, 0, `-p${PASSWORD}`);

  return execFileSync(MYSQL_BIN, args, {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
}

/**
 * Lepas escape keluaran mode batch MySQL/MariaDB.
 * MariaDB >= 10.5 tidak punya JSON_ARRAYAGG, jadi data diambil sebagai TSV.
 */
function unescapeMysql(value) {
  return value.replace(/\\(.)/g, (_, char) => {
    switch (char) {
      case 'n': return '\n';
      case 't': return '\t';
      case 'r': return '\r';
      case '0': return '\0';
      case 'b': return '\b';
      case 'Z': return '\u001a';
      case '\\': return '\\';
      default: return char;
    }
  });
}

function fetchRows(table) {
  const cols = table.columns.map((c) => `\`${c}\``).join(', ');
  const raw = mysql(`SELECT ${cols} FROM \`${table.name}\`;`).replace(/\r\n/g, '\n');

  const lines = raw.split('\n').filter((line) => line.length > 0);

  return lines.map((line) => {
    const fields = line.split('\t').map((field) =>
      field === 'NULL' ? null : unescapeMysql(field)
    );
    const row = {};
    table.columns.forEach((column, index) => {
      row[column] = fields[index] ?? null;
    });
    return row;
  });
}

/** Escape literal Postgres untuk text. */
function quoteText(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

/** Escape literal Postgres untuk angka. */
function quoteNumber(value) {
  return String(value);
}

function literal(column, value) {
  if (value === null || value === undefined) return 'null';

  if (TIMESTAMP_COLUMNS.has(column)) {
    // MySQL menyimpan dalam UTC (Laravel timezone = UTC).
    return `'${String(value).replace(' ', 'T')}Z'::timestamptz`;
  }

  if (BOOLEAN_COLUMNS.has(column)) {
    return Number(value) ? 'true' : 'false';
  }

  if (typeof value === 'number') return quoteNumber(value);

  if (typeof value === 'boolean') return value ? 'true' : 'false';

  return quoteText(value);
}

function main() {
  const out = [];
  const summary = [];

  out.push('-- ============================================================================');
  out.push('--  YPI NURUL ILMI BEKASI — DATA BISNIS (MIGRASI DARI MYSQL)');
  out.push('--');
  out.push(`--  Sumber : MySQL \`${DATABASE}\``);
  out.push('--  ID lama dipertahankan seluruhnya. Jalankan SETELAH supabase/schema.sql.');
  out.push('--');
  out.push('---  Total baris sumber (10 tabel bisnis) : 125');
  out.push('---  Total baris dimigrasikan              : 124');
  out.push('---  Selisih 1 baris = article_media id=5 (file `articles/media/aaa.jpg` hilang)');
  out.push('-- ============================================================================');
  out.push('');
  out.push('begin;');
  out.push('');

  let total = 0;

  for (const table of TABLES) {
    const rows = fetchRows(table);
    const skipped = new Set(table.skipIds || []);
    const kept = rows.filter((row) => !skipped.has(Number(row.id)));
    const dropped = rows.length - kept.length;

    total += kept.length;

    const cols = table.columns.map((c) => `"${c}"`).join(', ');

    out.push(`-- ---- ${table.name} (${kept.length} baris${dropped ? `, ${dropped} baris dilewati` : ''})`);
    out.push(`insert into public.${table.name} (${cols}) values`);

    const values = kept.map((row) => {
      const cells = table.columns.map((column) => {
        if (row[column] === null || row[column] === undefined) {
          if (table.defaults && column in table.defaults) {
            return table.defaults[column];
          }
          return 'null';
        }
        return literal(column, row[column]);
      });
      return `  (${cells.join(', ')})`;
    });

    out.push(values.join(',\n') + ';');
    out.push('');

    summary.push({ table: table.name, source: rows.length, migrated: kept.length, dropped });
  }

  out.push('-- ---- Reset sequence ke max(id)+1 -------------------------------------------');

  for (const table of TABLES) {
    out.push(
      `select setval(pg_get_serial_sequence('public.${table.name}', 'id'), ` +
        `coalesce((select max(id) from public.${table.name}), 0) + 1, false);`
    );
  }

  out.push('');
  out.push('commit;');
  out.push('');

  mkdirSync(join(ROOT, 'supabase'), { recursive: true });
  writeFileSync(join(ROOT, 'supabase', 'data.sql'), out.join('\n'), 'utf8');

  console.log('supabase/data.sql ditulis.\n');
  console.log('Tabel                          Sumber  Migrasi  Dilewati');
  console.log('--------------------------------------------------------');
  for (const row of summary) {
    console.log(
      row.table.padEnd(30) +
        String(row.source).padStart(6) +
        String(row.migrated).padStart(9) +
        String(row.dropped).padStart(10)
    );
  }
  console.log('--------------------------------------------------------');
  console.log('TOTAL'.padEnd(30) + String(summary.reduce((a, r) => a + r.source, 0)).padStart(6));
  console.log('TOTAL dimigrasikan'.padEnd(30) + String(total).padStart(16));
}

main();
