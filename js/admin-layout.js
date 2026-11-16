/* ==========================================================================
   LAYOUT & KOMPONEN BERSAMA DASHBOARD ADMIN — YPI NURUL ILMI
   --------------------------------------------------------------------------
   Sidebar dan header dirender oleh JavaScript supaya 13 halaman admin tidak
   mengulang markup yang sama. Tampilan mengikuti Blade admin yang lama
   (Tailwind, sidebar hijau emerald, header putih).

   Pemakaian:
     <body data-admin-page="articles"> ... </body>
   Nilai data-admin-page menentukan menu aktif dan judul header.
   ========================================================================== */
(function (window, document) {
  'use strict';

  /* Lima peran hasil migrasi RBAC. */
  var SUPER_ADMIN = 'super_admin';
  var ALL_ROLES = [
    'super_admin',
    'tk_nurul_ilmi',
    'sd_nurul_ilmi',
    'smp_nurul_ilmi',
    'sigma_nurul_ilmi'
  ];

  var ROLE_LABELS = {
    super_admin: 'Administrator',
    tk_nurul_ilmi: 'Admin TK Nurul Ilmi',
    sd_nurul_ilmi: 'Admin SD Nurul Ilmi',
    smp_nurul_ilmi: 'Admin SMP Nurul Ilmi',
    sigma_nurul_ilmi: 'Admin Unit Sigma'
  };

  var MENU = [
    {
      key: 'articles',
      label: 'Artikel',
      href: 'articles.html',
      roles: ALL_ROLES,
      icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M7 3.75h7l5 5v11.5H7a2 2 0 0 1-2-2v-12.5a2 2 0 0 1 2-2ZM14 4v5h5M9 13h6M9 16.5h6"/>'
    },
    {
      key: 'categories',
      label: 'Kategori artikel',
      href: 'categories.html',
      roles: ALL_ROLES,
      icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-11ZM8 8h8M8 12h8M8 16h4"/>'
    },
    {
      key: 'tags',
      label: 'Tag artikel',
      href: 'tags.html',
      roles: ALL_ROLES,
      icon: '<path stroke-linecap="round" stroke-linejoin="round" d="m20 13-7 7-10-10V3h7l10 10ZM7.5 7.5h.01"/>'
    },
    {
      key: 'facilities',
      label: 'Fasilitas',
      href: 'facilities.html',
      roles: ALL_ROLES,
      icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 21h16.5M4.5 21V8.25L12 3l7.5 5.25V21M9 21v-6h6v6"/>'
    },
    {
      key: 'comments',
      label: 'Moderasi Komentar',
      href: 'comments.html',
      roles: ALL_ROLES,
      icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M8 10.5h8M8 14h5m-9 6 1-3H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-3l1 3Z"/>'
    },
    {
      key: 'password',
      label: 'Ganti Password',
      href: 'password.html',
      roles: ALL_ROLES,
      icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75M6 10.5h12a1.5 1.5 0 0 1 1.5 1.5v7.5A1.5 1.5 0 0 1 18 21H6a1.5 1.5 0 0 1-1.5-1.5v-7.5A1.5 1.5 0 0 1 6 10.5Z"/>'
    }
  ];

  var TITLES = {
    articles: 'Manajemen artikel',
    'article-form': 'Manajemen artikel',
    categories: 'Manajemen kategori',
    'category-form': 'Manajemen kategori',
    tags: 'Manajemen tag',
    'tag-form': 'Manajemen tag',
    facilities: 'Manajemen fasilitas',
    'facility-form': 'Manajemen fasilitas',
    comments: 'Moderasi komentar',
    password: 'Ganti password'
  };

  /* Halaman form memakai menu list sebagai item aktif. */
  var ACTIVE_OF = {
    'article-form': 'articles',
    'category-form': 'categories',
    'tag-form': 'tags',
    'facility-form': 'facilities'
  };

  /* Peran yang boleh membuka halaman tertentu (RLS tetap penjaga akhirnya). */
  var PAGE_ROLES = {
    articles: ALL_ROLES,
    'article-form': ALL_ROLES,
    categories: ALL_ROLES,
    'category-form': ALL_ROLES,
    tags: ALL_ROLES,
    'tag-form': ALL_ROLES,
    facilities: ALL_ROLES,
    'facility-form': ALL_ROLES,
    comments: ALL_ROLES,
    password: ALL_ROLES
  };

  var currentRole = null;
  var currentUnits = [];

  function icon(path) {
    return '<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">' + path + '</svg>';
  }

  function escapeHtml(value) {
    return window.NIUtils ? window.NIUtils.escapeHtml(value) : String(value || '');
  }

  function currentPage() {
    return document.body.getAttribute('data-admin-page') || 'articles';
  }

  function renderSidebar(activeKey, role) {
    var host = document.getElementById('admin-sidebar');
    if (!host) return;

    var items = MENU.filter(function (item) {
      return !role || item.roles.indexOf(role) !== -1;
    }).map(function (item) {
      var active = item.key === activeKey;

      return [
        '<a href="' + item.href + '"',
        '   class="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ' +
          (active
            ? 'bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-100'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900') + '">',
        '  ' + icon(item.icon),
        '  ' + item.label,
        '</a>'
      ].join('\n');
    }).join('\n');

    host.innerHTML = [
      '<a href="articles.html" class="flex h-20 items-center gap-3 border-b border-slate-100 px-7">',
      '  <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-lg font-bold text-white">N</span>',
      '  <span>',
      '    <span class="block font-display text-sm font-extrabold tracking-tight text-slate-900">NURUL ILMI BEKASI</span>',
      '    <span class="block text-xs text-slate-400">Panel pengelola</span>',
      '  </span>',
      '</a>',
      '<div class="px-5 py-7">',
      '  <p class="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">Menu utama</p>',
      items,
      '</div>',
      '<div class="mt-auto border-t border-slate-100 p-6">',
      '  <div class="rounded-2xl bg-slate-50 p-4">',
      '    <p class="text-xs font-semibold text-slate-700">Ruang kerja konten</p>',
      '    <p class="mt-1 text-xs leading-5 text-slate-500">Kelola topik agar artikel tetap tertata.</p>',
      '  </div>',
      '</div>'
    ].join('\n');
  }

  function renderHeader(title, user, role) {
    var host = document.getElementById('admin-header');
    if (!host) return;

    var email = user && user.email ? user.email : '';
    var roleLabel = ROLE_LABELS[role] || '';

    host.innerHTML = [
      '<div class="flex items-center gap-3">',
      '  <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 font-display font-extrabold text-white lg:hidden">N</span>',
      '  <div>',
      '    <p class="text-xs font-medium text-slate-400">Admin / Konten</p>',
      '    <p class="text-sm font-bold text-slate-800">' + escapeHtml(title) + '</p>',
      '  </div>',
      '</div>',
      '<div class="flex items-center gap-3">',
      '  <span class="hidden text-xs font-medium text-slate-500 sm:inline">' + escapeHtml(email) + '</span>',
      roleLabel
        ? '<span class="hidden rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800 sm:inline-flex">' + escapeHtml(roleLabel) + '</span>'
        : '',
      '  <a href="password.html" class="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800">Ganti password</a>',
      '  <button type="button" id="admin-logout" class="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700">Keluar</button>',
      '</div>'
    ].join('\n');

    var logout = document.getElementById('admin-logout');

    if (logout) {
      logout.addEventListener('click', function () {
        if (!window.confirm('Keluar dari dashboard admin?')) return;

        window.NIAuth.signOut().then(function () {
          window.location.href = window.NIAuth.loginPath();
        });
      });
    }
  }

  /**
   * Pasang sidebar + header, lalu jalankan callback setelah sesi & peran
   * diketahui. Memastikan halaman tidak menampilkan data sebelum RLS siap.
   */
  function mount(callback) {
    var page = currentPage();
    var activeKey = ACTIVE_OF[page] || page;

    renderSidebar(activeKey, null);

    window.NIAuth.guard({ roles: PAGE_ROLES[page] }).then(function (result) {
      currentRole = result.role;

      renderSidebar(activeKey, result.role);
      renderHeader(TITLES[page] || 'Panel Admin', result.user, result.role);

      /* Unit milik admin unit (kosong untuk super_admin = seluruh unit). */
      return window.NIAuth.units().then(function (units) {
        currentUnits = units || [];
        if (callback) callback(result);
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Pesan & dialog                                                     */
  /* ------------------------------------------------------------------ */

  /** Tampilkan pesan sukses/gagal di bagian atas konten. */
  function flash(message, type) {
    var host = document.getElementById('admin-flash');
    if (!host || !message) return;

    var success = type !== 'error';

    host.className = 'mb-6 flex items-start gap-3 rounded-2xl border px-4 py-3.5 text-sm shadow-sm ' +
      (success
        ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
        : 'border-rose-200 bg-rose-50 text-rose-900');

    host.innerHTML = [
      '<svg class="mt-0.5 h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">',
      success
        ? '<path stroke-linecap="round" stroke-linejoin="round" d="m5 12 4 4L19 6"/>'
        : '<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/>',
      '</svg>',
      '<span>' + escapeHtml(message) + '</span>'
    ].join('\n');

    host.classList.remove('hidden');
  }

  /** Hapus pesan dari parameter ?error= / ?success=. */
  function readQueryMessage() {
    var params = new window.URLSearchParams(window.location.search);
    var error = params.get('error');
    var success = params.get('success');

    if (error) {
      flash(error, 'error');
      return true;
    }

    if (success) {
      flash(success, 'success');
      return true;
    }

    return false;
  }

  /** Konfirmasi hapus. */
  function confirmAction(message) {
    return window.confirm(message);
  }

  window.NIAdmin = {
    mount: mount,
    flash: flash,
    readQueryMessage: readQueryMessage,
    confirmAction: confirmAction,
    role: function () { return currentRole; },
    units: function () { return currentUnits; },
    isSuperAdmin: function () { return currentRole === SUPER_ADMIN; },
    /* Kategori & tag dipakai bersama antar unit, jadi hanya super_admin
       yang boleh menambah atau mengubahnya. */
    canManageTaxonomy: function () { return currentRole === SUPER_ADMIN; },
    roleLabel: function (role) { return ROLE_LABELS[role] || ''; },
    menu: MENU
  };
})(window, document);
