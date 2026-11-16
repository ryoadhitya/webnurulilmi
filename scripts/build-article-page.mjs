import fs from 'node:fs';

const src = fs.readFileSync('blog.html', 'utf8');

const headerEnd = src.indexOf('    <section class="hero-wrap hero-wrap-2"');
const header = src.slice(0, headerEnd);

const footerStart = src.indexOf('    <footer class="ftco-footer');
const footer = src.slice(footerStart);

let head = header.replace(
  '<title>Artikel - YPI Nurul Ilmi Bekasi</title>',
  '<title>Detail Artikel - YPI Nurul Ilmi Bekasi</title>'
);

const hero = [
  '    <section class="hero-wrap hero-wrap-2" style="background-image: url(\'images/bg_2.jpg\');">',
  '      <div class="overlay"></div>',
  '      <div class="container">',
  '        <div class="row no-gutters slider-text align-items-center justify-content-center">',
  '          <div class="col-md-9 ftco-animate text-center">',
  '            <h1 class="mb-2 bread" id="article-breadcrumb">Artikel</h1>',
  '            <p class="breadcrumbs"><span class="mr-2"><a href="index.html">Home <i class="fas fa-arrow-right"></i></a></span> <span class="mr-2"><a href="blog.html">Artikel <i class="fas fa-arrow-right"></i></a></span> <span>Selengkapnya <i class="fas fa-arrow-right"></i></span></p>',
  '          </div>',
  '        </div>',
  '      </div>',
  '    </section>',
  ''
].join('\n');

const body = [
  '    <section class="ftco-section">',
  '      <div class="container">',
  '        <div class="row">',
  '          <div class="col-lg-8 ftco-animate" id="article-main">',
  '            <article id="article-body">',
  '              <h2 class="mb-3" id="article-title">Memuat artikel...</h2>',
  '              <div class="meta mb-4" id="article-meta"></div>',
  '              <div class="mb-4" id="article-media"></div>',
  '              <div id="article-content"></div>',
  '            </article>',
  '',
  '            <div class="tag-widget post-tag-container mb-5 mt-5" id="article-tags" hidden>',
  '              <div class="tagcloud" id="article-tags-list"></div>',
  '            </div>',
  '',
  '            <div class="about-author d-flex p-4 bg-light" id="article-author" hidden>',
  '              <div class="desc">',
  '                <h3 id="article-author-name"></h3>',
  '                <p id="article-author-bio"></p>',
  '              </div>',
  '            </div>',
  '',
  '            <div class="pt-5 mt-5" id="article-related" hidden></div>',
  '',
  '            <div class="pt-5 mt-5" id="komentar">',
  '              <h3 class="mb-5 h4 font-weight-bold"><span id="comment-count">0</span> Komentar</h3>',
  '              <ul class="comment-list" id="comment-list"></ul>',
  '              <div id="comment-empty" class="p-4 bg-light">',
  '                <p class="mb-0">Belum ada komentar untuk artikel ini. Jadilah yang pertama berkomentar.</p>',
  '              </div>',
  '              <div class="comment-form-wrap pt-5">',
  '                <h3 class="mb-5 h4 font-weight-bold">Tinggalkan Komentar</h3>',
  '                <form id="comment-form" class="p-5 bg-light">',
  '                  <div class="form-group">',
  '                    <label for="comment-name">Nama *</label>',
  '                    <input type="text" class="form-control" id="comment-name" required>',
  '                  </div>',
  '                  <div class="form-group">',
  '                    <label for="comment-email">Email *</label>',
  '                    <input type="email" class="form-control" id="comment-email" required>',
  '                  </div>',
  '                  <div class="form-group">',
  '                    <label for="comment-message">Pesan</label>',
  '                    <textarea name="message" id="comment-message" cols="30" rows="10" class="form-control" required></textarea>',
  '                  </div>',
  '                  <div class="form-group d-none" aria-hidden="true">',
  '                    <label for="comment-hp">Website</label>',
  '                    <input type="text" class="form-control" id="comment-hp" name="hp" tabindex="-1" autocomplete="off">',
  '                  </div>',
  '                  <div id="comment-alert" class="mb-3"></div>',
  '                  <div class="form-group">',
  '                    <input type="submit" value="Kirim Komentar" class="btn py-3 px-4 btn-primary" id="comment-submit">',
  '                  </div>',
  '                </form>',
  '              </div>',
  '            </div>',
  '          </div>',
  '',
  '          <div class="col-lg-4 sidebar ftco-animate" id="article-sidebar">',
  '            <div class="sidebar-box">',
  '              <form action="blog.html" class="search-form">',
  '                <div class="form-group">',
  '                  <span class="fas fa-search"></span>',
  '                  <input type="text" class="form-control" name="q" placeholder="Cari artikel...">',
  '                </div>',
  '              </form>',
  '            </div>',
  '            <div class="sidebar-box ftco-animate">',
  '              <h3>Kategori</h3>',
  '              <ul class="categories" id="sidebar-categories"></ul>',
  '            </div>',
  '            <div class="sidebar-box ftco-animate">',
  '              <h3>Artikel Terbaru</h3>',
  '              <div id="sidebar-latest"></div>',
  '            </div>',
  '            <div class="sidebar-box ftco-animate">',
  '              <h3>Tag Cloud</h3>',
  '              <ul class="tagcloud m-0 p-0" id="sidebar-tags"></ul>',
  '            </div>',
  '            <div class="sidebar-box ftco-animate">',
  '              <h3>Tentang YPI Nurul Ilmi</h3>',
  '              <p>YPI Nurul Ilmi Bekasi meliputi TKIT, SDIT, dan SMPIT Nurul Ilmi yang terletak di Perumahan Bumi Waringin Indah 2, Waringinjaya, Kedungwaringin, Bekasi. Dengan 534 siswa dan 36 guru profesional.</p>',
  '            </div>',
  '          </div>',
  '        </div>',
  '      </div>',
  '    </section>',
  ''
].join('\n');

let out = head + hero + body + '\n' + footer;

out = out.replace(
  '    <script src="js/main.js"></script>\n',
  '    <script src="js/main.js"></script>\n    <script src="js/article.js"></script>\n'
);

out = out.replace('    <script src="js/blog-list.js"></script>\n', '');

fs.writeFileSync('article.html', out, 'utf8');
console.log('article.html ditulis,', out.length, 'byte');
