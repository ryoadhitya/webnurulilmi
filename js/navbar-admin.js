/* Resolver link Dashboard Admin pada navbar.
   Membaca window.SITE_CONFIG dari js/site-config.js lalu memasang URL login
   admin pada seluruh elemen ber-atribut data-site-admin-login.
   File ini TIDAK melakukan autentikasi apa pun - hanya pengarahan URL.

   Dashboard admin kini berupa halaman statis (admin/login.html) di dalam
   situs yang sama, sehingga tidak lagi memakai URL backend Laravel. */
(function (window, document) {
  'use strict';

  function adminLoginUrl() {
    var config = window.SITE_CONFIG || {};
    var path = String(config.adminLoginPath || 'admin/login.html').replace(/^\/+/, '');

    // Halaman publik berada di akar situs, halaman admin berada di /admin/.
    // Kalau blogcrumb ini sendiri berada di /admin/, path relatif harus
    // dihitung dari akar situs agar tidak menjadi /admin/admin/login.html.
    var match = window.location.pathname.match(/^(.*)\/admin\/[^/]*$/);
    var root = match ? match[1].replace(/\/+$/, '') : '';

    return root + '/' + path;
  }

  function apply() {
    var links = document.querySelectorAll('[data-site-admin-login]');

    if (!links.length) return;

    var url = adminLoginUrl();

    for (var i = 0; i < links.length; i++) {
      links[i].setAttribute('href', url);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply);
  } else {
    apply();
  }
})(window, document);
