#!/usr/bin/env node
/**
 * MOCK SUPABASE — untuk pengujian lokal tanpa kredensial Supabase sungguhan.
 *
 * Menyediakan subset API Supabase yang dipakai situs ini:
 *   - GET/POST/PATCH/DELETE /rest/v1/<tabel>   (PostgREST-lite)
 *   - POST /rest/v1/rpc/<fungsi>
 *   - POST /auth/v1/token, GET /auth/v1/user
 *   - GET  /storage/v1/object/public/media/<path>
 *
 * Data dimuat dari supabase/data.sql (hasil migrasi dari MySQL) sehingga
 * angka dan isi identik dengan yang akan masuk ke Supabase asli.
 *
 * Jalankan:
 *   node scripts/mock-supabase.mjs            # port 54321
 *   MOCK_PORT=5555 node scripts/mock-supabase.mjs
 *
 * Lalu buka situs dengan:
 *   http://127.0.0.1:54321/index.html?supabase_url=http://127.0.0.1:54321&supabase_key=test-anon-key
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.MOCK_PORT || 54321);
const STORAGE_ROOT = join(ROOT, 'backup', 'legacy-media');
const ANON_KEY = 'test-anon-key';
const ADMIN_KEY = 'test-service-role-key';

/* ------------------------------------------------------------------ */
/*  Pemuat data                                                        */
/* ------------------------------------------------------------------ */

const CAST_SUFFIX = /::[a-z ]+(?=\)|,|$)/gi;

function parseLiteral(raw) {
  const value = raw.trim();

  if (value === 'null') return null;
  if (value === 'true') return true;
  if (value === 'false') return false;

  if (value.startsWith("'")) {
    const end = value.lastIndexOf("'");
    let text = value.slice(1, end);
    text = text.replace(/''/g, "'");
    text = text.replace(/\\'/g, "'").replace(/\\\\/g, '\\');
    text = text.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
    return text;
  }

  const number = Number(value);
  return Number.isNaN(number) ? value : number;
}

function splitTuple(text) {
  const cells = [];
  let current = '';
  let inString = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inString) {
      if (char === "'") {
        if (text[i + 1] === "'") {
          current += "''";
          i++;
          continue;
        }
        inString = false;
      }
      current += char;
      continue;
    }

    if (char === "'") {
      inString = true;
      current += char;
      continue;
    }

    if (char === ',') {
      cells.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  cells.push(current);
  return cells.map((cell) => parseLiteral(cell.replace(CAST_SUFFIX, '')));
}

function loadData() {
  const file = join(ROOT, 'supabase', 'data.sql');
  const sql = readFileSync(file, 'utf8');
  const tables = {};
  const pattern = /insert into public\.(\w+) \(([^)]*)\) values([\s\S]*?);\n/g;
  let match;

  while ((match = pattern.exec(sql))) {
    const [, name, columnList, body] = match;
    const columns = columnList.split(',').map((c) => c.trim().replace(/"/g, ''));
    const rows = [];

    const tuples = body.match(/\(([^()]*(?:\([^()]*\)[^()]*)*)\)/g) || [];

    for (const tuple of tuples) {
      const cells = splitTuple(tuple.slice(1, -1));
      const row = {};

      columns.forEach((column, index) => {
        row[column] = cells[index] === undefined ? null : cells[index];
      });

      rows.push(row);
    }

    tables[name] = rows;
  }

  return tables;
}

const TABLES = loadData();

/* Data tambahan untuk pengujian admin (belum ada di data.sql). */
TABLES.user_roles = [
  { user_id: '11111111-1111-1111-1111-111111111111', role: 'super_admin', created_at: '2026-11-05T00:00:00Z' }
];

const AUTH_USERS = {
  'admin@ypinurulilmi.or.id': {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'admin@ypinurulilmi.or.id',
    role: 'super_admin'
  }
};

/* ------------------------------------------------------------------ */
/*  Relasi (untuk embedding PostgREST)                                 */
/* ------------------------------------------------------------------ */

/* parentKey = kolom pada tabel induk, childKey = kolom pada tabel anak. */
const RELATIONS = {
  articles: [
    { table: 'categories', parentKey: 'category_id', childKey: 'id', type: 'many-to-one' },
    { table: 'article_tags', parentKey: 'id', childKey: 'article_id', type: 'one-to-many' },
    { table: 'article_media', parentKey: 'id', childKey: 'article_id', type: 'one-to-many' },
    { table: 'comments', parentKey: 'id', childKey: 'article_id', type: 'one-to-many' }
  ],
  article_tags: [{ table: 'tags', parentKey: 'tag_id', childKey: 'id', type: 'many-to-one' }],
  facilities: [
    { table: 'facility_unit', parentKey: 'id', childKey: 'facility_id', type: 'one-to-many' },
    { table: 'facility_photos', parentKey: 'id', childKey: 'facility_id', type: 'one-to-many' }
  ],
  facility_unit: [{ table: 'units', parentKey: 'unit_id', childKey: 'id', type: 'many-to-one' }]
};

/* ------------------------------------------------------------------ */
/*  Parser select PostgREST                                           */
/* ------------------------------------------------------------------ */

/**
 * Parse string select PostgREST menjadi daftar kolom + embed.
 * Contoh: "id, name, categories(id, name), comments(count)"
 */
function parseSelect(select) {
  const parts = [];
  let depth = 0;
  let buffer = '';

  for (const char of select || '*') {
    if (char === '(') {
      depth++;
      buffer += char;
      continue;
    }
    if (char === ')') {
      depth--;
      buffer += char;
      continue;
    }
    if (char === ',' && depth === 0) {
      parts.push(buffer.trim());
      buffer = '';
      continue;
    }
    buffer += char;
  }

  if (buffer.trim()) parts.push(buffer.trim());

  const columns = [];
  const embeds = [];

  for (const part of parts) {
    const open = part.indexOf('(');

    if (open === -1) {
      columns.push(part);
      continue;
    }

    const alias = part.slice(0, open).trim().replace(/^!/, '');
    const inner = part.slice(open + 1, part.lastIndexOf(')'));
    const countOnly = /^\s*count\s*$/i.test(inner);

    embeds.push({ alias, inner, countOnly });
  }

  return { columns, embeds };
}

function selectFields(table, columnList) {
  if (!columnList || columnList === '*') {
    const rows = TABLES[table] || [];
    const first = rows[0] || {};
    return Object.keys(first);
  }

  return columnList.split(',').map((c) => c.trim()).filter(Boolean);
}

/* ------------------------------------------------------------------ */
/*  Query                                                              */
/* ------------------------------------------------------------------ */

function applyFilters(rows, params) {
  let result = rows;

  for (const [key, value] of params.entries()) {
    if (['select', 'order', 'limit', 'offset', 'on_conflict', 'columns', 'apikey'].includes(key)) continue;

    if (key === 'or') {
      const clauses = String(value).split(',');
      result = result.filter((row) =>
        clauses.some((clause) => {
          const [field, ...rest] = clause.split('.');
          const op = rest[0];
          const expected = rest.slice(1).join('.');
          const actual = row[field];
          if (op === 'ilike') {
            return String(actual ?? '').toLowerCase().includes(expected.replace(/%/g, '').toLowerCase());
          }
          return String(actual) === expected;
        })
      );
      continue;
    }

    const match = key.match(/^(\w+)\.(eq|neq|gt|gte|lt|lte|like|ilike|is)$/);

    if (!match) continue;

    const [, field, op] = match;
    const expected = value === 'null' ? null : decodeURIComponent(String(value));

    result = result.filter((row) => {
      const actual = row[field];
      switch (op) {
        case 'eq': return actual === expected;
        case 'neq': return actual !== expected;
        case 'gt': return actual > expected;
        case 'gte': return actual >= expected;
        case 'lt': return actual < expected;
        case 'lte': return actual <= expected;
        case 'is': return expected === null ? actual === null : true;
        case 'like': return String(actual ?? '').includes(expected.replace(/%/g, ''));
        case 'ilike': return String(actual ?? '').toLowerCase().includes(expected.replace(/%/g, '').toLowerCase());
        default: return true;
      }
    });
  }

  return result;
}

function applyOrder(rows, order) {
  if (!order) return rows;

  const clauses = String(order).split(',').map((clause) => {
    const [field, direction] = clause.trim().split('.');
    return { field, desc: direction === 'desc' };
  });

  return rows.slice().sort((a, b) => {
    for (const { field, desc } of clauses) {
      const left = a[field];
      const right = b[field];
      if (left === right) continue;
      if (left === null || left === undefined) return desc ? -1 : 1;
      if (right === null || right === undefined) return desc ? 1 : -1;
      return (left > right ? 1 : -1) * (desc ? -1 : 1);
    }
    return 0;
  });
}

function embedRows(parentTable, parentRow, embed) {
  const relations = RELATIONS[parentTable] || [];
  const relation = relations.find((rel) => rel.table === embed.alias);

  if (!relation) return null;

  const childRows = TABLES[relation.table] || [];
  const matched = childRows.filter(
    (child) => child[relation.childKey] === parentRow[relation.parentKey]
  );

  if (embed.countOnly) {
    return [{ count: matched.length }];
  }

  const nested = parseSelect(embed.inner);
  const childFields = selectFields(relation.table, nested.columns.join(','));

  const shaped = matched.map((child) => {
    const row = {};

    for (const field of childFields) {
      row[field] = child[field];
    }

    for (const childEmbed of nested.embeds) {
      const value = embedRows(relation.table, child, childEmbed);
      if (value !== null) row[childEmbed.alias] = value;
    }

    return row;
  });

  if (relation.type === 'many-to-one') return shaped[0] || null;

  return shaped;
}

function queryTable(table, params, url) {
  const { columns, embeds } = parseSelect(params.get('select'));
  const fields = selectFields(table, columns.join(','));

  let rows = (TABLES[table] || []).slice();
  rows = applyFilters(rows, params);
  rows = applyOrder(rows, params.get('order'));

  const total = rows.length;

  const limit = Number(params.get('limit') || 0);
  const offset = Number(params.get('offset') || 0);

  const rangeHeader = url?.headers?.range;

  if (rangeHeader) {
    const [from, to] = rangeHeader.replace('bytes=', '').split('-');
    if (to) {
      const start = Number(from);
      const end = Number(to);
      rows = rows.slice(start, end + 1);
    }
  } else if (limit) {
    rows = rows.slice(offset, offset + limit);
  } else if (offset) {
    rows = rows.slice(offset);
  }

  const shaped = rows.map((row) => {
    const result = {};

    for (const field of fields) {
      result[field] = row[field];
    }

    for (const embed of embeds) {
      const value = embedRows(table, row, embed);
      if (value !== null) result[embed.alias] = value;
    }

    return result;
  });

  return { rows: shaped, total };
}

/* ------------------------------------------------------------------ */
/*  RPC                                                                */
/* ------------------------------------------------------------------ */

function handleRpc(name, body, auth) {
  const payload = body || {};

  if (name === 'increment_article_views') {
    const articleId = Number(payload.p_article_id);
    const article = (TABLES.articles || []).find((row) => row.id === articleId);
    if (!article) return { error: 'artikel tidak ditemukan' };
    article.views = Number(article.views || 0) + 1;
    return article.views;
  }

  if (name === 'submit_comment') {
    if (!payload.p_name || !String(payload.p_name).trim()) {
      return { error: 'nama wajib diisi' };
    }
    if (!payload.p_comment || !String(payload.p_comment).trim()) {
      return { error: 'komentar wajib diisi' };
    }
    if (payload.p_hp) {
      return { error: 'komentar ditolak' };
    }

    const articleId = Number(payload.p_article_id);
    const article = (TABLES.articles || []).find((row) => row.id === articleId);
    if (!article) return { error: 'artikel tidak ditemukan' };

    const comment = {
      id: (TABLES.comments || []).length + 1,
      article_id: articleId,
      name: String(payload.p_name).trim(),
      comment: String(payload.p_comment).trim(),
      email: payload.p_email || null,
      status: 'published',
      ip_hash: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    TABLES.comments = TABLES.comments || [];
    TABLES.comments.push(comment);

    return { ok: true, id: comment.id };
  }

  if (name === 'current_role') {
    return { role: auth.role || 'anon' };
  }

  return { error: 'fungsi tidak dikenal: ' + name };
}

/* ------------------------------------------------------------------ */
/*  Auth                                                                */
/* ------------------------------------------------------------------ */

function parseBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 5e6) req.destroy();
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve({ __raw: raw });
      }
    });
  });
}

function fakeJwt(payload) {
  const encode = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  return encode({ alg: 'HS256', typ: 'JWT' }) + '.' + encode(payload) + '.mock-signature';
}

function authFromRequest(req) {
  const key = req.headers.apikey || '';
  const auth = req.headers.authorization || '';
  const token = auth.replace(/^Bearer\s+/i, '');

  if (key === ADMIN_KEY || token === ADMIN_KEY) {
    return { role: 'super_admin', user: AUTH_USERS['admin@ypinurulilmi.or.id'], service: true };
  }

  if (token && token !== ANON_KEY) {
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
      const user = Object.values(AUTH_USERS).find((u) => u.id === payload.sub);
      if (user) return { role: user.role, user };
    } catch {
      /* abaikan token rusak */
    }
  }

  return { role: 'anon', user: null };
}

function send(res, status, body, headers = {}) {
  const text = typeof body === 'string' ? body : JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': '*',
    ...headers
  });
  res.end(text);
}

/* ------------------------------------------------------------------ */
/*  Server                                                              */
/* ------------------------------------------------------------------ */

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const path = url.pathname;
  const params = url.searchParams;
  const auth = authFromRequest(req);

  if (req.method === 'OPTIONS') {
    send(res, 200, {});
    return;
  }

  /* Storage publik */
  if (path.startsWith('/storage/v1/object/public/media/')) {
    const relative = decodeURIComponent(path.replace('/storage/v1/object/public/media/', ''));
    const file = join(STORAGE_ROOT, relative);

    if (!existsSync(file)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('not found');
      return;
    }

    const data = readFileSync(file);
    res.writeHead(200, { 'Content-Type': 'application/octet-stream', 'Content-Length': data.length });
    res.end(data);
    return;
  }

  /* Auth */
  if (path === '/auth/v1/token') {
    const body = await parseBody(req);
    const email = body.email;
    const user = AUTH_USERS[email];

    if (!user || body.password !== 'password123') {
      send(res, 400, { error: 'invalid_grant', error_description: 'Email atau password salah' });
      return;
    }

    const accessToken = fakeJwt({ sub: user.id, email: user.email, role: 'authenticated' });

    send(res, 200, {
      access_token: accessToken,
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: fakeJwt({ sub: user.id, type: 'refresh' }),
      user: { id: user.id, email: user.email, aud: 'authenticated', role: 'authenticated' }
    });
    return;
  }

  if (path === '/auth/v1/user') {
    if (!auth.user) {
      send(res, 401, { message: 'invalid claim: missing sub claim' });
      return;
    }
    send(res, 200, { id: auth.user.id, email: auth.user.email, aud: 'authenticated' });
    return;
  }

  if (path === '/auth/v1/logout') {
    send(res, 204, {});
    return;
  }

  /* RPC */
  if (path.startsWith('/rest/v1/rpc/')) {
    const name = path.replace('/rest/v1/rpc/', '');
    const body = await parseBody(req);
    const result = handleRpc(name, body, auth);

    if (result && result.error) {
      send(res, 400, { message: result.error, code: 'P0001', details: result.error });
      return;
    }

    send(res, 200, result);
    return;
  }

  /* Tabel */
  if (path.startsWith('/rest/v1/')) {
    const table = path.replace('/rest/v1/', '');
    const body = req.method === 'GET' ? {} : await parseBody(req);

    if (req.method === 'GET') {
      const { rows, total } = queryTable(table, params, url);
      const head = params.get('count') === 'exact' || req.headers.prefer?.includes('count=exact');

      send(res, 200, rows, {
        'Content-Range': `0-${Math.max(rows.length - 1, 0)}/${total}`
      });
      return;
    }

    if (req.method === 'POST') {
      const payload = Array.isArray(body) ? body : [body];
      const inserted = payload.map((row) => {
        const copy = { ...row };
        if (copy.id === undefined || copy.id === null) {
          copy.id = (TABLES[table] || []).length + 1;
        }
        return copy;
      });

      TABLES[table] = (TABLES[table] || []).concat(inserted);

      send(res, 201, inserted, { Prefer: 'return=representation' });
      return;
    }

    if (req.method === 'PATCH' || req.method === 'PUT') {
      const id = params.get('id');
      const target = (TABLES[table] || []).find((row) => String(row.id) === String(id));

      if (target) Object.assign(target, body);

      send(res, 200, target || [], { Prefer: 'return=representation' });
      return;
    }

    if (req.method === 'DELETE') {
      const id = params.get('id');
      TABLES[table] = (TABLES[table] || []).filter((row) => String(row.id) !== String(id));
      send(res, 204, {});
      return;
    }
  }

  send(res, 404, { message: 'not found: ' + path });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('Mock Supabase aktif di http://127.0.0.1:' + PORT);
  console.log('Anon key  : ' + ANON_KEY);
  console.log('Admin key : ' + ADMIN_KEY);
  console.log('Tabel     : ' + Object.keys(TABLES).join(', '));

  for (const [name, rows] of Object.entries(TABLES)) {
    console.log('  ' + name.padEnd(16) + rows.length + ' baris');
  }
});
