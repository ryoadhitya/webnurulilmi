/* ==========================================================================
   PATCH SOSIAL MEDIA — YPI NURUL ILMI
   --------------------------------------------------------------------------
   Mengganti daftar ikon sosial media di seluruh footer dengan komponen
   bersama (js/footer-social.js) yang memuat lima akun resmi YPI Nurul Ilmi.

   Yang dikerjakan:
     1. Blok <ul class="ftco-footer-social"> diganti menjadi placeholder
        <ul ... data-footer-social></ul> supaya ikon diisi oleh satu sumber
        data yang sama di semua halaman.
     2. js/footer-social.js dimuat sebelum js/footer-latest.js.
     3. Tautan footer yang masih menunjuk ke "#" diarahkan ke halaman yang
        benar (Home, Tentang Kami, Program, Biaya, Hubungi Kami).

   Jalankan:
     node scripts/patch-sosial-media.mjs
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';

import { ROOT } from './lib/env.mjs';

const PAGES = [
  '404.html',
  'about.html',
  'article.html',
  'blog-single.html',
  'blog.html',
  'contact.html',
  'courses.html',
  'index.html',
  'pricing.html',
  'teacher.html'
];

const SOCIAL_BLOCK = /<ul class="ftco-footer-social list-unstyled float-md-left float-lft mt-3">[\s\S]*?<\/ul>/;

const SOCIAL_PLACEHOLDER =
  '<ul class="ftco-footer-social list-unstyled float-md-left float-lft mt-3" data-footer-social></ul>';

const LINKS = [
  ['Home', 'index.html'],
  ['Tentang Kami', 'about.html'],
  ['Program', 'courses.html'],
  ['Biaya', 'pricing.html'],
  ['Hubungi Kami', 'contact.html']
];

let changed = 0;

PAGES.forEach((name) => {
  const file = path.join(ROOT, name);

  if (!fs.existsSync(file)) {
    console.log('  Lewati (tidak ada): ' + name);
    return;
  }

  let content = fs.readFileSync(file, 'utf8');
  const before = content;

  if (SOCIAL_BLOCK.test(content)) {
    content = content.replace(SOCIAL_BLOCK, SOCIAL_PLACEHOLDER);
  }

  if (!content.includes('js/footer-social.js')) {
    if (content.includes('<script src="js/footer-latest.js"></script>')) {
      content = content.replace(
        '<script src="js/footer-latest.js"></script>',
        '<script src="js/footer-social.js"></script>\n    <script src="js/footer-latest.js"></script>'
      );
    } else {
      console.log('  PERINGATAN: titik sisip script tidak ditemukan di ' + name);
    }
  }

  LINKS.forEach(([label, href]) => {
    content = content.replace(
      new RegExp('<li><a href="#"><span class="fas fa-arrow-right mr-2"></span>' + label + '</a></li>', 'g'),
      '<li><a href="' + href + '"><span class="fas fa-arrow-right mr-2"></span>' + label + '</a></li>'
    );
  });

  if (content !== before) {
    fs.writeFileSync(file, content, 'utf8');
    changed += 1;
    console.log('  Diperbarui: ' + name);
  } else {
    console.log('  Tidak berubah: ' + name);
  }
});

console.log('\nSelesai. ' + changed + ' berkas diperbarui.');
