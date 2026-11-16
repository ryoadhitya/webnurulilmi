import fs from 'node:fs';

const file = process.argv[2];
let html = fs.readFileSync(file, 'utf8');

const startMarker = '        <div class="row">\n          <div class="col-md-6 col-lg-4 ftco-animate">';
const endMarker = '        <div class="row no-gutters my-5">';

const start = html.indexOf(startMarker);
const end = html.indexOf(endMarker);

if (start === -1 || end === -1 || end < start) {
  console.error('marker tidak ditemukan', { start, end });
  process.exit(1);
}

const replacement = [
  '        <div class="row mb-4">',
  '          <div class="col-12">',
  '            <div class="row no-gutters align-items-center">',
  '              <div class="col-md-4 mb-2 mb-md-0">',
  '                <label class="sr-only" for="article-search">Cari artikel</label>',
  '                <input type="search" id="article-search" class="form-control" placeholder="Cari artikel...">',
  '              </div>',
  '              <div class="col-md-3 mb-2 mb-md-0">',
  '                <label class="sr-only" for="article-category">Kategori</label>',
  '                <select id="article-category" class="form-control">',
  '                  <option value="">Semua kategori</option>',
  '                </select>',
  '              </div>',
  '              <div class="col-md-3 mb-2 mb-md-0">',
  '                <label class="sr-only" for="article-tag">Tag</label>',
  '                <select id="article-tag" class="form-control">',
  '                  <option value="">Semua tag</option>',
  '                </select>',
  '              </div>',
  '            </div>',
  '          </div>',
  '        </div>',
  '        <div class="row" id="article-list">',
  '          <div class="col-12 py-5 text-center">',
  '            <p>Memuat artikel...</p>',
  '          </div>',
  '        </div>',
  ''
].join('\n');

html = html.slice(0, start) + replacement + html.slice(end);

html = html.replace(
  '        <div class="row no-gutters my-5">\n          <div class="col text-center">\n            <div class="block-27">\n              <ul>\n                <li><a href="#"><i class="fas fa-chevron-left"></i></a></li>\n                <li class="active"><span>1</span></li>\n                <li><a href="#">2</a></li>\n                <li><a href="#">3</a></li>\n                <li><a href="#">4</a></li>\n                <li><a href="#">5</a></li>\n                <li><a href="#"><i class="fas fa-chevron-right"></i></a></li>\n              </ul>\n            </div>\n          </div>\n        </div>\n',
  '        <div id="article-pagination"></div>\n'
);

html = html.replace(
  '    <script src="js/main.js"></script>\n',
  '    <script src="js/main.js"></script>\n    <script src="js/blog-list.js"></script>\n'
);

fs.writeFileSync(file, html, 'utf8');
console.log('selesai:', file);
