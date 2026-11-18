/* ==========================================================================
   PATCH NAVBAR PUBLIK — TANPA IKON LOGIN ADMIN
   --------------------------------------------------------------------------
   Menghapus ikon profil/login dari navbar halaman publik. Admin tetap
   bisa masuk lewat alamat admin/login.html; proteksi route admin tidak
   tersentuh.

   Yang dikerjakan berkas ini:
     1. Menghapus baris <li class="nav-item navbar-admin-item"> dari navbar
        publik (13 halaman).
     2. Menghapus pemuatan js/navbar-admin.js dari halaman publik.
     3. Menambah blok logo Smart School ke contact.html supaya semua
        halaman publik punya komposisi header yang sama.

   Semua perubahan pakai pola yang sama persis, jadi skrip ini aman
   dijalankan berulang kali.
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
  'daycare-sigma.html',
  'galeri-fasilitas.html',
  'index.html',
  'pricing.html',
  'teacher.html',
  'tk-sigma.html'
];

const ADMIN_ITEM = /^[ \t]*<li class="nav-item navbar-admin-item">.*<\/li>\r?\n/m;
const ADMIN_SCRIPT = /^[ \t]*<script src="js\/navbar-admin\.js"><\/script>\r?\n/m;

const SMART_SCHOOL_BLOCK = [
  '        <!-- Smart School Logo -->',
  '        <div class="navbar-smartschool-logo">',
  '          <img src="images/smartschool.png" alt="Smart School" title="Smart School">',
  '        </div>'
].join('\n');

function main() {
  let totalItem = 0;
  let totalScript = 0;
  let totalLogo = 0;

  PAGES.forEach(function (name) {
    const file = path.join(ROOT, name);

    if (!fs.existsSync(file)) {
      console.error('Halaman tidak ditemukan: ' + name);
      process.exit(1);
    }

    let html = fs.readFileSync(file, 'utf8');

    const before = html;

    html = html.replace(ADMIN_ITEM, '');
    html = html.replace(ADMIN_SCRIPT, '');

    /* contact.html belum punya logo Smart School. */
    if (name === 'contact.html' && html.indexOf('navbar-smartschool-logo') === -1) {
      html = html.replace(
        '        </div>\n      </div>\n    </nav>',
        '        </div>\n' + SMART_SCHOOL_BLOCK + '\n      </div>\n    </nav>'
      );

      if (html.indexOf('navbar-smartschool-logo') === -1) {
        console.error('Blok logo Smart School gagal ditambahkan ke ' + name);
        process.exit(1);
      }

      totalLogo += 1;
    }

    if (html !== before) {
      fs.writeFileSync(file, html, 'utf8');
    }

    const itemCount = (before.match(ADMIN_ITEM) || []).length;
    const scriptCount = (before.match(ADMIN_SCRIPT) || []).length;

    totalItem += itemCount;
    totalScript += scriptCount;

    console.log(
      name.padEnd(22) +
        ' ikon admin: ' + itemCount +
        '  script navbar-admin: ' + scriptCount
    );
  });

  console.log('');
  console.log('Total ikon admin dihapus : ' + totalItem);
  console.log('Total script dihapus     : ' + totalScript);
  console.log('Logo Smart School ditambah: ' + totalLogo + ' halaman');
}

main();
