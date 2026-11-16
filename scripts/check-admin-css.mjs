import fs from 'node:fs';
import path from 'node:path';

const root = process.argv[2] || process.cwd();
const css = fs.readFileSync(path.join(root, 'admin/assets/admin.css'), 'utf8');

// Tailwind v4 menulis selector kelas dengan karakter khusus di-escape,
// contoh `sm:px-8` -> `.sm\:px-8`.
function escapeSel(name) {
  return name.replace(/([:[\]%.#()/])/g, '\\$1');
}

function collectClasses(file) {
  const html = fs.readFileSync(file, 'utf8');
  const classes = new Set();
  for (const m of html.matchAll(/class="([^"]*)"/g)) {
    for (const c of m[1].split(/\s+/)) if (c) classes.add(c);
  }
  for (const m of html.matchAll(/classList\.(?:add|toggle|remove)\('([^']*)'/g)) {
    for (const c of m[1].split(/\s+/)) if (c) classes.add(c);
  }
  for (const m of html.matchAll(/'(?:hover|focus|group-hover):[a-z0-9\-\[\]\/\.]+'/g)) {
    classes.add(m[0].slice(1, -1));
  }
  return classes;
}

const all = new Set();
for (const f of fs.readdirSync(path.join(root, 'admin')).filter((f) => f.endsWith('.html'))) {
  for (const c of collectClasses(path.join(root, 'admin', f))) all.add(c);
}
for (const f of fs.readdirSync(path.join(root, 'js')).filter((f) => /^admin-.*\.js$/.test(f))) {
  for (const c of collectClasses(path.join(root, 'js', f))) all.add(c);
}

// Kelas FontAwesome dimuat dari CDN, bukan dari Tailwind.
const FA = /^(fa[srlbd]?|fa-[\w-]+)$/;
// Token yang bukan nama kelas Tailwind (cuplikan string JS, baris template).
const VALID = /^[A-Za-z][A-Za-z0-9_:\-\[\]\/\.%#]*$/;
const STOPWORDS = new Set(['style', 'class', 'id', 'type', 'name']);

const missing = [];
for (const c of all) {
  if (FA.test(c)) continue;
  if (!VALID.test(c)) continue;
  if (STOPWORDS.has(c)) continue;
  if (!css.includes('.' + escapeSel(c))) missing.push(c);
}

console.log('css bytes :', css.length);
console.log('classes   :', all.size);
console.log('missing   :', missing.length);
if (missing.length) console.log(missing.join('\n'));
