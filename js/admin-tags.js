/* ==========================================================================
   DASHBOARD ADMIN — TAG ARTIKEL
   --------------------------------------------------------------------------
   Menggantikan App\Http\Controllers\TagController + Blade admin/tag/*.

   Perilaku yang dipertahankan:
     - Nama tag disimpan dalam huruf kapital (Laravel Str::upper).
     - Slug dibuat otomatis dari nama (Laravel Str::slug).
     - Jumlah artikel per tag ditampilkan.
   ========================================================================== */
(function (window, document) {
  'use strict';

  var utils = window.NIUtils;
  var api = window.NISupabase;
  var admin = window.NIAdmin;

  /* ------------------------------------------------------------------ */
  /*  Halaman daftar                                                      */
  /* ------------------------------------------------------------------ */

  /** PostgREST mengembalikan `article_tags(count)` sebagai array [{count: n}]. */
  function articleCount(tag) {
    var rows = tag.article_tags || [];

    if (!rows.length) return 0;

    return Number(rows[0].count || 0);
  }

  function renderStats(tags) {
    var total = tags.length;
    var linked = tags.reduce(function (sum, item) {
      return sum + articleCount(item);
    }, 0);

    var totalEl = document.getElementById('stat-total');
    var linkedEl = document.getElementById('stat-linked');

    if (totalEl) totalEl.textContent = utils.formatNumber(total);
    if (linkedEl) linkedEl.textContent = utils.formatNumber(linked);
  }

  function rowTemplate(tag) {
    var search = utils.escapeHtml(
      ((tag.name || '') + ' ' + (tag.slug || '')).toLowerCase()
    );

    /* Tag dipakai bersama antar unit: hanya administrator yayasan
       (super_admin) yang boleh menambah, mengubah, atau menghapus. */
    var manageButtons = admin.canManageTaxonomy()
      ? [
          '      <a href="tag-form.html?id=' + tag.id + '" class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800" aria-label="Edit tag ' + utils.escapeHtml(tag.name) + '">',
          '        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m15.5 5.5 3 3M4 20l4.7-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z"/></svg> Edit',
          '      </a>',
          '      <button type="button" data-tag-delete="' + tag.id + '" class="inline-flex items-center gap-1.5 rounded-lg border border-rose-100 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:border-rose-200 hover:bg-rose-50" aria-label="Hapus tag ' + utils.escapeHtml(tag.name) + '">',
          '        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M4 7h16M10 11v6m4-6v6M5.5 7l1 13h11l1-13M9 7V4h6v3"/></svg> Hapus',
          '      </button>'
        ].join('\n')
      : '';

    return [
      '<tr data-tag-row data-search="' + search + '" class="transition hover:bg-slate-50/70">',
      '  <td class="px-6 py-4">',
      '    <div class="flex items-center gap-3">',
      '      <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 font-display text-lg font-extrabold text-emerald-800">#</span>',
      '      <span class="font-semibold text-slate-900">' + utils.escapeHtml(tag.name) + '</span>',
      '    </div>',
      '  </td>',
      '  <td class="px-6 py-4"><span class="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-600">' + utils.escapeHtml(tag.slug) + '</span></td>',
      '  <td class="px-6 py-4"><span class="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800">' + articleCount(tag) + ' artikel</span></td>',
      '  <td class="px-6 py-4 text-slate-500">' + utils.formatDate(tag.created_at) + '</td>',
      '  <td class="px-6 py-4">',
      '    <div class="flex justify-end gap-2">',
      manageButtons,
      '    </div>',
      '  </td>',
      '</tr>'
    ].join('\n');
  }

  function renderRows(tags) {
    var body = document.getElementById('tag-rows');
    if (!body) return;

    var empty = document.getElementById('tag-empty');
    var countEl = document.getElementById('tag-count');

    [].slice.call(body.querySelectorAll('[data-tag-row]')).forEach(function (row) {
      row.parentNode.removeChild(row);
    });

    if (!tags.length) {
      if (empty) empty.classList.remove('hidden');
      renderStats(tags);
      if (countEl) countEl.textContent = '0 tag tersedia';
      return;
    }

    if (empty) empty.classList.add('hidden');

    body.insertAdjacentHTML('afterbegin', tags.map(rowTemplate).join('\n'));

    renderStats(tags);

    if (countEl) countEl.textContent = tags.length + ' tag tersedia';
  }

  function bindSearch() {
    var search = document.getElementById('tag-search');
    if (!search) return;

    search.addEventListener('input', utils.debounce(function (event) {
      var query = event.target.value.trim().toLowerCase();
      var rows = [].slice.call(document.querySelectorAll('[data-tag-row]'));
      var visible = 0;

      rows.forEach(function (row) {
        var matches = row.dataset.search.indexOf(query) !== -1;
        row.classList.toggle('hidden', !matches);
        if (matches) visible++;
      });

      var noResults = document.getElementById('tag-no-results');
      if (noResults) {
        noResults.classList.toggle('hidden', !rows.length || visible > 0);
      }
    }, 150));
  }

  function bindDelete() {
    document.addEventListener('click', function (event) {
      var button = event.target.closest('[data-tag-delete]');
      if (!button) return;

      if (!admin.confirmAction('Yakin ingin menghapus tag ini?')) return;

      var id = button.getAttribute('data-tag-delete');

      api.getClient()
        .from('tags')
        .delete()
        .eq('id', id)
        .then(function (result) {
          if (result.error) {
            admin.flash('Tag gagal dihapus: ' + result.error.message, 'error');
            return;
          }
          admin.flash('Tag berhasil dihapus!');
          load();
        });
    });
  }

  function load() {
    var db = api.getClient();
    if (!db) return;

    db.from('tags')
      .select('id, name, slug, created_at, updated_at, article_tags(count)')
      .order('created_at', { ascending: false })
      .then(function (result) {
        if (result.error) {
          admin.flash('Gagal memuat tag: ' + result.error.message, 'error');
          return;
        }
        renderRows(result.data || []);
      });
  }

  function initList() {
    bindSearch();
    bindDelete();
    load();

    /* Admin unit hanya boleh melihat tag. */
    if (!admin.canManageTaxonomy()) {
      [].slice.call(document.querySelectorAll('a[href="tag-form.html"]')).forEach(function (link) {
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
    var form = document.getElementById('tag-form');
    if (!form) return;

    /* Tag dipakai bersama antar unit, jadi hanya administrator yayasan
       yang boleh mengubahnya. */
    if (!admin.canManageTaxonomy()) {
      showError('Tag hanya dapat diubah oleh administrator yayasan.');
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
      document.getElementById('form-title').textContent = 'Edit tag';
      document.getElementById('form-subtitle').textContent =
        'Perbarui kata kunci. Slug akan dibuat ulang dari nama tag.';
      document.getElementById('submit-label').textContent = 'Simpan perubahan';

      if (eyebrow) eyebrow.textContent = 'Perbarui informasi';
      if (slugBlock) slugBlock.classList.remove('hidden');

      api.getClient()
        .from('tags')
        .select('id, name, slug, updated_at')
        .eq('id', id)
        .maybeSingle()
        .then(function (result) {
          if (result.error || !result.data) {
            admin.flash('Tag tidak ditemukan.', 'error');
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

      var name = utils.upperTag(nameInput.value);

      if (!name) {
        showError('Nama tag wajib diisi.');
        return;
      }

      if (name.length > 255) {
        showError('Nama tag maksimal 255 karakter.');
        return;
      }

      var payload = {
        name: name,
        slug: utils.slugify(name)
      };

      var db = api.getClient();
      var request = id
        ? db.from('tags').update(payload).eq('id', id)
        : db.from('tags').insert(payload);

      request.then(function (result) {
        if (result.error) {
          var message = result.error.message || '';

          if (/duplicate key|unique/i.test(message)) {
            message = 'Nama tag sudah dipakai tag lain.';
          }

          showError(message || 'Tag gagal disimpan.');
          return;
        }

        window.location.href = 'tags.html?success=' +
          encodeURIComponent(id ? 'Tag berhasil diperbarui!' : 'Tag berhasil ditambahkan!');
      });
    });
  }

  window.NIAdminTags = {
    initList: initList,
    initForm: initForm
  };
})(window, document);
