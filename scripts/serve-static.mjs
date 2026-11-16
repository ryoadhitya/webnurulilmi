#!/usr/bin/env node
/**
 * Server statis sederhana untuk menguji situs secara lokal.
 *
 * Jalankan:
 *   node scripts/serve-static.mjs        # port 8080
 *   PORT=3000 node scripts/serve-static.mjs
 *
 * Buka: http://127.0.0.1:8080/
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, dirname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT || 8080);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
  '.csv': 'text/csv; charset=utf-8'
};

createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let pathname = decodeURIComponent(url.pathname);

  if (pathname.endsWith('/')) pathname += 'index.html';

  const safe = normalize(pathname).replace(/^([/\\])+/, '');
  const file = join(ROOT, safe);

  if (!file.startsWith(ROOT) || !existsSync(file) || !statSync(file).isFile()) {
    const notFound = join(ROOT, '404.html');
    if (existsSync(notFound)) {
      const html = readFileSync(notFound);
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
      return;
    }
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('not found');
    return;
  }

  const data = readFileSync(file);
  res.writeHead(200, {
    'Content-Type': TYPES[extname(file).toLowerCase()] || 'application/octet-stream',
    'Content-Length': data.length,
    'Cache-Control': 'no-cache'
  });
  res.end(data);
}).listen(PORT, '127.0.0.1', () => {
  console.log('Situs statis aktif di http://127.0.0.1:' + PORT + '/');
});
