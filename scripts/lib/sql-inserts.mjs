/* ==========================================================================
   PARSER INSERT SQL (Postgres) — dipakai script migrasi data & storage
   ========================================================================== */

/**
 * Pecah satu literal Postgres menjadi nilai JavaScript.
 * Menangani: 'teks' (dengan '' sebagai escape), null, true/false, angka,
 * dan sufiks ::timestamptz.
 */
export function parseValue(raw) {
  const token = String(raw).trim();

  if (token === '' || token.toLowerCase() === 'null') return null;
  if (token.toLowerCase() === 'true') return true;
  if (token.toLowerCase() === 'false') return false;

  if (token[0] === "'") {
    let out = '';
    let i = 1;

    while (i < token.length) {
      const char = token[i];

      if (char === "'") {
        if (token[i + 1] === "'") {
          out += "'";
          i += 2;
          continue;
        }
        break;
      }

      out += char;
      i += 1;
    }

    return out.replace(/::[a-zA-Z_ ]+$/, '');
  }

  const cast = token.replace(/::[a-zA-Z_ ]+$/, '');

  if (/^-?\d+(\.\d+)?$/.test(cast)) return Number(cast);

  return cast;
}

/** Pisah daftar field satu baris menjadi nilai-nilai. */
export function splitRows(values) {
  const rows = [];
  let current = '';
  let inString = false;
  let i = 0;

  while (i < values.length) {
    const char = values[i];

    if (inString) {
      current += char;

      if (char === "'") {
        if (values[i + 1] === "'") {
          current += values[i + 1];
          i += 2;
          continue;
        }
        inString = false;
      }

      i += 1;
      continue;
    }

    if (char === "'") {
      inString = true;
      current += char;
      i += 1;
      continue;
    }

    if (char === ',') {
      rows.push(current);
      current = '';
      i += 1;
      continue;
    }

    current += char;
    i += 1;
  }

  if (current.trim()) rows.push(current);

  return rows;
}

/** Pisah badan VALUES menjadi daftar tuple. */
export function splitTuples(body) {
  const tuples = [];
  let current = null;
  let inString = false;
  let depth = 0;
  let i = 0;

  while (i < body.length) {
    const char = body[i];

    if (inString) {
      if (current !== null) current += char;

      if (char === "'") {
        if (body[i + 1] === "'") {
          if (current !== null) current += body[i + 1];
          i += 2;
          continue;
        }
        inString = false;
      }

      i += 1;
      continue;
    }

    if (char === "'") {
      inString = true;
      if (current !== null) current += char;
      i += 1;
      continue;
    }

    if (char === '(') {
      depth += 1;

      if (depth === 1) current = '';
      else if (current !== null) current += char;

      i += 1;
      continue;
    }

    if (char === ')') {
      depth -= 1;

      if (depth === 0) {
        tuples.push(current);
        current = null;
      } else if (current !== null) {
        current += char;
      }

      i += 1;
      continue;
    }

    if (current !== null) current += char;
    i += 1;
  }

  return tuples;
}

/** Ambil daftar blok INSERT dari isi data.sql. */
export function parseDataSql(sql) {
  const blocks = [];
  const pattern = /insert\s+into\s+public\.(\w+)\s*\(([^)]*)\)\s*values\s*([\s\S]*?);/gi;

  let match;

  while ((match = pattern.exec(sql)) !== null) {
    const table = match[1];
    const columns = match[2].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
    const body = match[3].trim();

    if (!body) {
      blocks.push({ table, columns, rows: [] });
      continue;
    }

    const tuples = splitTuples(body);

    const rows = tuples.map((tuple) => {
      const fields = splitRows(tuple);
      const row = {};

      columns.forEach((column, index) => {
        row[column] = parseValue(fields[index] === undefined ? '' : fields[index]);
      });

      return row;
    });

    blocks.push({ table, columns, rows });
  }

  return blocks;
}
