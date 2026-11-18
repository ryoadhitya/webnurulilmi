/* ==========================================================================
   PATCH SOSIAL MEDIA — HALAMAN UNIT
   --------------------------------------------------------------------------
   Halaman unit (TK Sigma, Daycare Sigma, Galeri Fasilitas) memakai footer
   dengan empat widget sendiri: Hubungi Kami, Tautan, Unit Pendidikan, dan
   YPI Nurul Ilmi. Footer itu belum memuat daftar ikon sosial media.

   Yang dikerjakan:
     1. Widget "Sosial Media" ditambahkan di bawah deskripsi YPI Nurul Ilmi
        pada kolom terakhir, memakai placeholder yang sama dengan halaman
        lain: <ul ... data-footer-social></ul>. Isinya diisi oleh
        js/footer-social.js, jadi lima akun resmi tetap punya satu sumber
        data dan tidak ada kumpulan ikon duplikat.
     2. js/footer-social.js dimuat sebelum script utama halaman.

   Skrip ini aman dijalankan berulang kali (idempoten).

   Jalankan:
     node scripts/patch-sosial-media-unit.mjs
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';

import { ROOT } from './lib/env.mjs';

const PAGES = ['tk-sigma.html', 'daycare-sigma.html', 'galeri-fasilitas.html'];

const DESCRIPTION =
  '<p style="color: rgba(255,255,255,0.7); line-height: 1.8;">Yayasan Pendidikan Islam Nurul Ilmi Bekasi - Membangun generasi Islam yang beriman, berilmu, dan berakhlak mulia.</p>';

const SOCIAL_WIDGET =
  DESCRIPTION +
  '\n            <h2 class="ftco-heading-2 mt-4">Sosial Media</h2>' +
  '\n            <ul class="ftco-footer-social list-unstyled float-md-left float-lft mt-3" data-footer-social></ul>';

const SOCIAL_SCRIPT = '<script src="js/footer-social.js"></script>';

let changed = 0;

PAGES.forEach((name) => {
  const file = path.join(ROOT, name);

  if (!fs.existsSync(file)) {
    console.log('  Lewati (tidak ada): ' + name);
    return;
  }

  let content = fs.readFileSync(file, 'utf8');
  const before = content;

  if (!content.includes('data-footer-social')) {
    if (!content.includes(DESCRIPTION)) {
      console.log('  PERINGATAN: deskripsi footer tidak ditemukan di ' + name);
    } else {
      content = content.replace(DESCRIPTION, SOCIAL_WIDGET);
    }
  }

  if (!content.includes(SOCIAL_SCRIPT)) {
    const anchors = [
      '<script src="js/main.js"></script>',
      '<script src="js/facilities.js"></script>',
      '<script src="js/utils.js"></script>'
    ];

    const anchor = anchors.find((candidate) => content.includes(candidate));

    if (anchor) {
      content = content.replace(anchor, SOCIAL_SCRIPT + '\n  ' + anchor);
    } else {
      console.log('  PERINGATAN: titik sisip script tidak ditemukan di ' + name);
    }
  }

  if (content !== before) {
    fs.writeFileSync(file, content, 'utf8');
    changed += 1;
    console.log('  Diperbarui: ' + name);
  } else {
    console.log('  Tidak berubah: ' + name);
  }
});

console.log('\nSelesai. ' + changed + ' berkas diperbarui.');
