import fs from 'node:fs';

const src = fs.readFileSync('blog.html', 'utf8');

const headerEnd = src.indexOf('    <section class="hero-wrap hero-wrap-2"');
const header = src.slice(0, headerEnd);

const footerStart = src.indexOf('    <footer class="ftco-footer');
const footer = src.slice(footerStart);

let head = header
  .replace(
    '<title>Artikel - YPI Nurul Ilmi Bekasi</title>',
    '<title>Artikel - YPI Nurul Ilmi Bekasi</title>'
  )
  .replace(
    '    <script src="js/vendor/supabase.min.js"></script>\n    <script src="js/utils.js"></script>\n    <script src="js/supabase.js"></script>\n',
    ''
  );

const body = [
  '    <section class="hero-wrap hero-wrap-2" style="background-image: url(\'images/bg_2.jpg\');">',
  '      <div class="overlay"></div>',
  '      <div class="container">',
  '        <div class="row no-gutters slider-text align-items-center justify-content-center">',
  '          <div class="col-md-9 ftco-animate text-center">',
  '            <h1 class="mb-2 bread">Artikel</h1>',
  '            <p class="breadcrumbs"><span class="mr-2"><a href="index.html">Home <i class="fas fa-arrow-right"></i></a></span> <span class="mr-2"><a href="blog.html">Artikel <i class="fas fa-arrow-right"></i></a></span> <span>Selengkapnya <i class="fas fa-arrow-right"></i></span></p>',
  '          </div>',
  '        </div>',
  '      </div>',
  '    </section>',
  '',
  '    <section class="ftco-section">',
  '      <div class="container">',
  '        <div class="row justify-content-center">',
  '          <div class="col-md-8 text-center ftco-animate">',
  '            <h2 class="mb-4">Artikel dipindahkan</h2>',
  '            <p>Detail artikel kini berada di halaman <strong>article.html</strong>. Anda sedang diarahkan secara otomatis.</p>',
  '            <p class="mt-4"><a href="blog.html" class="btn btn-secondary">Lihat semua artikel</a></p>',
  '          </div>',
  '        </div>',
  '      </div>',
  '    </section>',
  ''
].join('\n');

const script = [
  '',
  '    <script>',
  '      (function () {',
  '        var params = new window.URLSearchParams(window.location.search);',
  '        var id = params.get(\'id\');',
  '        var target = id ? \'article.html?id=\' + encodeURIComponent(id) : \'blog.html\';',
  '',
  '        window.location.replace(target);',
  '      })();',
  '    </script>',
  ''
].join('\n');

let out = head + body + script + '\n' + footer;

out = out.replace(
  '    <script src="js/main.js"></script>\n',
  '    <script src="js/main.js"></script>\n'
);

out = out.replace('    <script src="js/blog-list.js"></script>\n', '');

fs.writeFileSync('blog-single.html', out, 'utf8');
console.log('blog-single.html ditulis,', out.length, 'byte');
