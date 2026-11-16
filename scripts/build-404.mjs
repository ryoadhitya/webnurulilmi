import fs from 'node:fs';

const src = fs.readFileSync('blog.html', 'utf8');

const headerEnd = src.indexOf('    <section class="hero-wrap hero-wrap-2"');
const header = src.slice(0, headerEnd);

const footerStart = src.indexOf('    <footer class="ftco-footer');
const footer = src.slice(footerStart);

let head = header.replace(
  '    <script src="js/vendor/supabase.min.js"></script>\n    <script src="js/utils.js"></script>\n    <script src="js/supabase.js"></script>\n',
  ''
);

head = head.replace(
  '<title>Artikel - YPI Nurul Ilmi Bekasi</title>',
  '<title>Halaman tidak ditemukan - YPI Nurul Ilmi Bekasi</title>'
);

const body = [
  '    <section class="hero-wrap hero-wrap-2" style="background-image: url(\'images/bg_2.jpg\');">',
  '      <div class="overlay"></div>',
  '      <div class="container">',
  '        <div class="row no-gutters slider-text align-items-center justify-content-center">',
  '          <div class="col-md-9 ftco-animate text-center">',
  '            <h1 class="mb-2 bread">404</h1>',
  '            <p class="breadcrumbs"><span class="mr-2"><a href="index.html">Home <i class="fas fa-arrow-right"></i></a></span> <span>Halaman tidak ditemukan</span></p>',
  '          </div>',
  '        </div>',
  '      </div>',
  '    </section>',
  '',
  '    <section class="ftco-section">',
  '      <div class="container">',
  '        <div class="row justify-content-center">',
  '          <div class="col-md-8 text-center ftco-animate">',
  '            <h2 class="mb-4">Halaman tidak ditemukan</h2>',
  '            <p class="mb-4">Alamat yang Anda tuju tidak tersedia atau sudah dipindahkan.</p>',
  '            <p class="mt-4">',
  '              <a href="index.html" class="btn btn-secondary">Kembali ke beranda</a>',
  '              <a href="blog.html" class="btn btn-primary">Baca artikel</a>',
  '            </p>',
  '          </div>',
  '        </div>',
  '      </div>',
  '    </section>',
  ''
].join('\n');

fs.writeFileSync('404.html', head + body + '\n' + footer, 'utf8');
console.log('404.html ditulis');
