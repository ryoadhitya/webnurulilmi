/* ==========================================================================
   PEMUAT ENVIRONMENT SUPABASE (Node 18+)
   --------------------------------------------------------------------------
   Membaca berkas environment di akar project:

     1. `.env`            -> konfigurasi utama (frontend + script)
     2. `.env.migration`  -> kredensial tambahan khusus migrasi

   Nilai yang sudah ada di `process.env` TIDAK ditimpa, jadi environment
   variable dari shell/CLI selalu menang.

   Kedua berkas sudah masuk .gitignore.
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, '..', '..');

const ENV_FILES = ['.env', '.env.migration'];

function parse(content) {
  const values = {};

  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    const index = trimmed.indexOf('=');
    if (index === -1) return;

    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, '');

    if (key) values[key] = value;
  });

  return values;
}

export function loadEnv() {
  ENV_FILES.forEach((name) => {
    const file = path.join(ROOT, name);
    if (!fs.existsSync(file)) return;

    const values = parse(fs.readFileSync(file, 'utf8'));

    Object.keys(values).forEach((key) => {
      if (!process.env[key]) process.env[key] = values[key];
    });
  });

  return process.env;
}

loadEnv();
