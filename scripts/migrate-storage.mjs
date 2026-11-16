/* ==========================================================================
   MIGRASI MEDIA KE SUPABASE STORAGE
   --------------------------------------------------------------------------
   Mengunggah seluruh berkas media asli (arsip di backup/legacy-media) ke
   bucket Supabase Storage dengan path relatif yang PERSIS sama dengan nilai
   di kolom DB (facility_photos.image_path, articles.image, article_media.path).

   Berkas yang tidak dipakai database tidak dihapus: diunggah ke folder
   `_orphan/` dan dicatat di docs/orphan-files.csv.

   Berkas lokal TIDAK PERNAH dihapus.

   Contoh:
     SUPABASE_URL=https://xxx.supabase.co \
     SUPABASE_SERVICE_ROLE_KEY=<service_role> \
     node scripts/migrate-storage.mjs

   Ukur tanpa menyentuh jaringan:
     node scripts/migrate-storage.mjs --dry-run
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

import { ROOT, config, uploadFile, publicUrl } from './lib/supabase-rest.mjs';
import { parseDataSql } from './lib/sql-inserts.mjs';

/* Sumber media asli sudah diarsipkan ke backup/legacy-media saat folder
   source Laravel dihapus. Folder arsip itu tidak pernah dihapus. */
const SOURCE_ROOT = path.join(ROOT, 'backup', 'legacy-media');
const DATA_FILE = path.join(ROOT, 'supabase', 'data.sql');
const ORPHAN_DIR = path.join(ROOT, 'docs');

const MIME_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm'
};

function mimeType(file) {
  return MIME_TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream';
}

/** Semua berkas di bawah SOURCE_ROOT, sebagai path relatif dengan '/'. */
function listFiles(dir, prefix) {
  const results = [];

  if (!fs.existsSync(dir)) return results;

  fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    const relative = prefix ? prefix + '/' + entry.name : entry.name;

    if (entry.isDirectory()) {
      results.push(...listFiles(path.join(dir, entry.name), relative));
      return;
    }

    if (entry.isFile() && !entry.name.startsWith('.')) results.push(relative);
  });

  return results.sort();
}

/** Path media yang dipakai database, diambil dari supabase/data.sql. */
function referencedPaths() {
  const sql = fs.readFileSync(DATA_FILE, 'utf8');
  const blocks = parseDataSql(sql);
  const refs = new Set();

  blocks.forEach((block) => {
    block.rows.forEach((row) => {
      if (block.table === 'facility_photos' && row.image_path) refs.add(row.image_path);
      if (block.table === 'articles' && row.image) refs.add(row.image);
      if (block.table === 'article_media' && row.path) refs.add(row.path);
    });
  });

  return refs;
}

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');

  if (!fs.existsSync(SOURCE_ROOT)) {
    console.error('Folder sumber tidak ditemukan: ' + SOURCE_ROOT);
    process.exit(1);
  }

  const cfg = dryRun ? { bucket: 'media', url: '' } : config();
  const localFiles = listFiles(SOURCE_ROOT, '');
  const refs = referencedPaths();

  console.log('Sumber    : ' + path.relative(ROOT, SOURCE_ROOT));
  console.log('Bucket    : ' + cfg.bucket);
  console.log('Berkas    : ' + localFiles.length + ' lokal, ' + refs.size + ' dirujuk database');
  console.log('');

  const orphans = [];
  const missing = [];
  let uploaded = 0;

  for (const relative of localFiles) {
    const absolute = path.join(SOURCE_ROOT, relative);
    const isReferenced = refs.has(relative);
    const target = isReferenced ? relative : '_orphan/' + relative;

    if (!isReferenced) {
      orphans.push({
        source: relative,
        orphan: target,
        size: fs.statSync(absolute).size,
        sha256: sha256(absolute)
      });
    }

    if (dryRun) {
      console.log('  (dry-run) ' + relative + ' -> ' + target);
      continue;
    }

    await uploadFile(cfg.bucket, target, fs.readFileSync(absolute), mimeType(absolute));
    uploaded += 1;

    console.log('  + ' + target + (isReferenced ? '' : '   [orphan]'));
  }

  refs.forEach((ref) => {
    if (!localFiles.includes(ref)) missing.push(ref);
  });

  // Catatan orphan (selalu ditulis, termasuk saat dry-run).
  fs.mkdirSync(ORPHAN_DIR, { recursive: true });

  const csv = [
    'source_path,orphan_path,size_bytes,sha256,reason',
    ...orphans.map((row) => [
      row.source,
      row.orphan,
      row.size,
      row.sha256,
      'tidak dirujuk tabel facility_photos / articles / article_media'
    ].join(','))
  ].join('\n') + '\n';

  fs.writeFileSync(path.join(ORPHAN_DIR, 'orphan-files.csv'), csv, 'utf8');

  console.log('');
  console.log('Berkas diunggah   : ' + uploaded + (dryRun ? ' (dry-run, sebenarnya 0)' : ''));
  console.log('Berkas orphan     : ' + orphans.length + ' -> media/_orphan/');
  console.log('Catatan orphan    : docs/orphan-files.csv');

  if (missing.length) {
    console.log('');
    console.log('Path dirujuk database tetapi berkas lokal tidak ada (' + missing.length + '):');
    missing.forEach((row) => console.log('  ! ' + row));
    console.log('Path ini akan tetap tersimpan di database; unggah manual bila berkas ditemukan.');
  }

  if (!dryRun) {
    console.log('');
    console.log('Verifikasi URL publik:');

    for (const relative of localFiles) {
      const target = refs.has(relative) ? relative : '_orphan/' + relative;
      console.log('  ' + publicUrl(target, cfg.bucket));
    }
  }

  console.log('');
  console.log('Berkas lokal tidak dihapus. Data MySQL tidak disentuh.');
}

main().catch(function (error) {
  console.error('Gagal: ' + error.message);
  process.exit(1);
});
