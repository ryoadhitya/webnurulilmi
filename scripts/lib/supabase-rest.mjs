/* ==========================================================================
   PEMBANTU REST SUPABASE UNTUK SCRIPT MIGRASI (Node 18+)
   --------------------------------------------------------------------------
   Script migrasi memakai fetch langsung ke REST API Supabase supaya tidak
   perlu dependensi npm tambahan.

   Kredensial dibaca dari environment variable:
     SUPABASE_URL              -> https://xxxx.supabase.co
     SUPABASE_SERVICE_ROLE_KEY -> kunci service_role (JANGAN disimpan di repo)

   Alternatif: simpan di berkas .env atau .env.migration (sudah masuk
   .gitignore) dengan format KEY=NILAI satu baris per key.
   ========================================================================== */
import { ROOT, loadEnv } from './env.mjs';

loadEnv();

export function config() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error('');
    console.error('Kredensial Supabase belum ada.');
    console.error('Isi environment variable berikut lalu jalankan ulang:');
    console.error('  SUPABASE_URL=https://xxxx.supabase.co');
    console.error('  SUPABASE_SERVICE_ROLE_KEY=<service_role key>');
    console.error('');
    console.error('Alternatif: buat berkas .env di akar project dengan isi:');
    console.error('  SUPABASE_URL=https://xxxx.supabase.co');
    console.error('  SUPABASE_SERVICE_ROLE_KEY=<service_role key>');
    console.error('');
    process.exit(1);
  }

  return {
    url: String(url).replace(/\/+$/, ''),
    key,
    bucket: process.env.SUPABASE_STORAGE_BUCKET || 'media'
  };
}

export function headers(extra) {
  return Object.assign(
    {
      apikey: config().key,
      Authorization: 'Bearer ' + config().key,
      'Content-Type': 'application/json'
    },
    extra || {}
  );
}

export async function request(pathname, options) {
  const cfg = config();
  const opts = options || {};

  const response = await fetch(cfg.url + pathname, {
    method: opts.method || 'GET',
    headers: headers(opts.headers),
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body)
  });

  const text = await response.text();
  let payload = null;

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    const message = payload && payload.message ? payload.message : text || response.statusText;
    throw new Error(
      (opts.label ? opts.label + ': ' : pathname + ' gagal: ') +
      'HTTP ' + response.status + ' - ' + message
    );
  }

  return payload;
}

export async function insertRows(table, rows) {
  if (!rows.length) return [];

  return request('/rest/v1/' + table, {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: rows,
    label: 'insert ' + table
  });
}

export async function selectRows(table, query, options) {
  const opts = options || {};
  const params = new URLSearchParams(query || {});

  if (opts.count) params.set('select', '*');
  else params.set('select', opts.select || '*');

  if (opts.count) params.append('count', 'exact');

  const result = await request('/rest/v1/' + table + '?' + params.toString(), {
    method: 'GET',
    label: 'select ' + table
  });

  return { rows: result || [], count: opts.count ? Number(result.length) : null };
}

export async function callRpc(name, payload) {
  return request('/rest/v1/rpc/' + name, {
    method: 'POST',
    body: payload || {},
    label: 'rpc ' + name
  });
}

export async function uploadFile(bucket, objectPath, body, contentType) {
  const cfg = config();

  const response = await fetch(
    cfg.url + '/storage/v1/object/' + bucket + '/' + objectPath.split('/').map(encodeURIComponent).join('/'),
    {
      method: 'POST',
      headers: {
        apikey: cfg.key,
        Authorization: 'Bearer ' + cfg.key,
        'Content-Type': contentType || 'application/octet-stream',
        'x-upsert': 'true'
      },
      body
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error('upload ' + objectPath + ' gagal: HTTP ' + response.status + ' - ' + text);
  }

  return { path: objectPath };
}

export function publicUrl(objectPath, bucket) {
  const cfg = config();
  const name = bucket || cfg.bucket;

  return cfg.url + '/storage/v1/object/public/' + name + '/' +
    objectPath.split('/').map(encodeURIComponent).join('/');
}

export { ROOT };
