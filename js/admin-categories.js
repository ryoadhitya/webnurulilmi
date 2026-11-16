/* ==========================================================================
   DASHBOARD ADMIN — KATEGORI ARTIKEL
   --------------------------------------------------------------------------
   Menggantikan App\Http\Controllers\CategoryController + Blade
   resources/views/admin/categories/*.

   Perilaku yang dipertahankan:
     - Nama kategori wajib, maksimal 255 karakter, unik.
     - Slug dibuat otomatis dari nama (Laravel Str::slug -> NIUtils.slugify).
     - Jumlah artikel per kategori ditampilkan.
     - Hapus kategori -> artikel terkait menjadi "Tanpa kategori" (ON DELETE SET NULL).
   ========================================================================== */
(function (window, document) {
  'use strict';

  var utils = window.NIUtils;
  var api = window.NISupabase;
  var admin = window.NIAdmin;

  /* ------------------------------------------------------------------ */
  /*  Halaman daftar                                                      */
  /* ------------------------------------------------------------------ */

  /** PostgREST mengembalikan `articles(count)` sebagai array [{count: n}]. */
  function articleCount(category) {
    var rows = category.articles || [];

    if (!rows.length) return 0;

    return Number(rows[0].count || 0);
  }

  function renderStats(categories) {
    var total = categories.length;
    var linked = categories.reduce(function (sum, item) {
      return sum + articleCount(item);
    }, 0);

    var totalEl = document.getElementById('stat-total');
    var linkedEl = document.getElementById('stat-linked');

    if (totalEl) totalEl.textContent = utils.formatNumber(total);
    if (linkedEl) linkedEl.textContent = utils.formatNumber(linked);
  }

  function rowTemplate(category) {
    var initials = utils.escapeHtml(
      (category.name || '?').trim().charAt(0).toUpperCase()
    );
    var search = utils.escapeHtml(
      ((category.name || '') + ' ' + (category.slug || '')).toLowerCase()
    );

    /* Kategori dipakai bersama antar unit: hanya administrator yayasan
       (super_admin) yang boleh menambah, mengubah, atau menghapus. */
    var manageButtons = admin.canManageTaxonomy()
      ? [
          '      <a href="category-form.html?id=' + category.id + '" class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800" aria-label="Edit kategori ' + utils.escapeHtml(category.name) + '">',
          '        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m15.5 5.5 3 3M4 20l4.7-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z"/></svg> Edit',
          '      </a>',
          '      <button type="button" data-category-delete="' + category.id + '" class="inline-flex items-center gap-1.5 rounded-lg border border-rose-100 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:border-rose-200 hover:bg-rose-50" aria-label="Hapus kategori ' + utils.escapeHtml(category.name) + '">',
          '        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M4 7h16M10 11v6m4-6v6M5.5 7l1 13h11l1-13M9 7V4h6v3"/></svg> Hapus',
          '      </button>'
        ].join('\n')
      : '';

    return [
      '<tr data-category-row data-search="' + search + '" class="transition hover:bg-slate-50/70">',
      '  <td class="px-6 py-4">',
      '    <div class="flex items-center gap-3">',
      '      <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 font-display text-sm font-extrabold text-emerald-800">' + initials + '</span>',
      '      <span class="font-semibold text-slate-900">' + utils.escapeHtml(category.name) + '</span>',
      '    </div>',
      '  </td>',
      '  <td class="px-6 py-4"><span class="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-600">' + utils.escapeHtml(category.slug) + '</span></td>',
      '  <td class="px-6 py-4"><span class="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800">' + articleCount(category) + ' artikel</span></td>',
      '  <td class="px-6 py-4 text-slate-500">' + utils.formatDate(category.created_at) + '</td>',
      '  <td class="px-6 py-4">',
      '    <div class="flex justify-end gap-2">',
      manageButtons,
      '    </div>',
      '  </td>',
      '</tr>'
    ].join('\n');
  }

  function renderRows(categories) {
    var body = document.getElementById('category-rows');
    if (!body) return;

    var empty = document.getElementById('category-empty');
    var countEl = document.getElementById('category-count');

    // Buang baris data sebelumnya supaya tidak menumpuk saat reload.
    [].slice.call(body.querySelectorAll('[data-category-row]')).forEach(function (row) {
      row.parentNode.removeChild(row);
    });

    if (!categories.length) {
      if (empty) empty.classList.remove('hidden');
      renderStats(categories);
      if (countEl) countEl.textContent = '0 kategori tersedia';
      return;
    }

    if (empty) empty.classList.add('hidden');

    body.insertAdjacentHTML('afterbegin', categories.map(rowTemplate).join('\n'));

    renderStats(categories);

    if (countEl) countEl.textContent = categories.length + ' kategori tersedia';
  }

  function bindSearch() {
    var search = document.getElementById('category-search');
    if (!search) return;

    search.addEventListener('input', utils.debounce(function (event) {
      var query = event.target.value.trim().toLowerCase();
      var rows = [].slice.call(document.querySelectorAll('[data-category-row]'));
      var visible = 0;

      rows.forEach(function (row) {
        var matches = row.dataset.search.indexOf(query) !== -1;
        row.classList.toggle('hidden', !matches);
        if (matches) visible++;
      });

      var noResults = document.getElementById('category-no-results');
      if (noResults) {
        noResults.classList.toggle('hidden', !rows.length || visible > 0);
      }
    }, 150));
  }

  function bindDelete() {
    document.addEventListener('click', function (event) {
      var button = event.target.closest('[data-category-delete]');
      if (!button) return;

      if (!admin.confirmAction('Yakin ingin menghapus kategori ini?')) return;

      var id = button.getAttribute('data-category-delete');

      api.getClient()
        .from('categories')
        .delete()
        .eq('id', id)
        .then(function (result) {
          if (result.error) {
            admin.flash('Kategori gagal dihapus: ' + result.error.message, 'error');
            return;
          }
          admin.flash('Kategori berhasil dihapus!');
          load();
        });
    });
  }

  function load() {
    var db = api.getClient();
    if (!db) return;

    db.from('categories')
      .select('id, name, slug, created_at, updated_at, articles(count)')
      .order('created_at', { ascending: false })
      .then(function (result) {
        if (result.error) {
          admin.flash('Gagal memuat kategori: ' + result.error.message, 'error');
          return;
        }
        renderRows(result.data || []);
      });
  }

  function initList() {
    bindSearch();
    bindDelete();
    load();

    /* Admin unit hanya boleh melihat kategori. */
    if (!admin.canManageTaxonomy()) {
      [].slice.call(document.querySelectorAll('a[href="category-form.html"]')).forEach(function (link) {
        link.classList.add('hidden');
      });
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Halaman form                                                       */
  /* ------------------------------------------------------------------ */

  function showError(message) {
    var box = document.getElementById('form-error');
    if (!box) return;

    box.classList.remove('hidden');
    box.innerHTML = [
      '<p class="font-bold">Periksa kembali isian berikut:</p>',
      '<ul class="mt-1 list-inside list-disc space-y-1">',
      '<li>' + utils.escapeHtml(message) + '</li>',
      '</ul>'
    ].join('\n');
  }

  function clearError() {
    var box = document.getElementById('form-error');
    if (box) {
      box.classList.add('hidden');
      box.innerHTML = '';
    }
  }

  function initForm() {
    var form = document.getElementById('category-form');
    if (!form) return;

    /* Kategori dipakai bersama antar unit, jadi hanya administrator yayasan
       yang boleh mengubahnya. */
    if (!admin.canManageTaxonomy()) {
      showError('Kategori hanya dapat diubah oleh administrator yayasan.');
      var submit = form.querySelector('button[type="submit"]');
      if (submit) submit.disabled = true;
      return;
    }

    var params = new window.URLSearchParams(window.location.search);
    var id = params.get('id');

    var nameInput = document.getElementById('name');
    var slugBox = document.getElementById('current-slug');
    var slugBlock = document.getElementById('slug-block');
    var hintBox = document.getElementById('form-hint');
    var eyebrow = document.getElementById('form-eyebrow');

    if (id) {
      document.getElementById('form-title').textContent = 'Edit kategori';
      document.getElementById('form-subtitle').textContent =
        'Ubah nama kategori. Slug akan diperbarui otomatis.';
      document.getElementById('submit-label').textContent = 'Simpan perubahan';

      if (eyebrow) eyebrow.textContent = 'Perbarui informasi';
      if (slugBlock) slugBlock.classList.remove('hidden');

      api.getClient()
        .from('categories')
        .select('id, name, slug, updated_at')
        .eq('id', id)
        .maybeSingle()
        .then(function (result) {
          if (result.error || !result.data) {
            admin.flash('Kategori tidak ditemukan.', 'error');
            return;
          }

          nameInput.value = result.data.name || '';

          if (slugBox) slugBox.textContent = result.data.slug || '—';
          if (hintBox) {
            hintBox.textContent = 'Terakhir diperbarui ' + utils.formatDateTime(result.data.updated_at) + '.';
          }
        });
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      clearError();

      var name = String(nameInput.value || '').trim();

      if (!name) {
        showError('Nama kategori wajib diisi.');
        return;
      }

      if (name.length > 255) {
        showError('Nama kategori maksimal 255 karakter.');
        return;
      }

      var payload = {
        name: name,
        slug: utils.slugify(name)
      };

      var db = api.getClient();
      var request = id
        ? db.from('categories').update(payload).eq('id', id)
        : db.from('categories').insert(payload);

      request.then(function (result) {
        if (result.error) {
          var message = result.error.message || '';

          if (/duplicate key|unique/i.test(message)) {
            message = 'Nama kategori sudah dipakai kategori lain.';
          }

          showError(message || 'Kategori gagal disimpan.');
          return;
        }

        window.location.href = 'categories.html?success=' +
          encodeURIComponent(id ? 'Kategori berhasil diperbarui!' : 'Kategori berhasil ditambahkan!');
      });
    });
  }

  window.NIAdminCategories = {
    initList: initList,
    initForm: initForm
  };
})(window, document);
