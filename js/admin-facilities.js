/* ==========================================================================
   DASHBOARD ADMIN — FASILITAS & GALERI FOTO
   --------------------------------------------------------------------------
   Menggantikan App\Http\Controllers\FacilityController + Blade
   resources/views/admin/facilities/*.

   Perilaku yang dipertahankan:
     - Filter cari nama/slug, kelompok (main|sigma), unit, status.
     - Ikon memakai class FontAwesome, divalidasi seperti
       App\Models\Facility::isValidIcon(); class tak dikenal memakai
       ICON_FALLBACK ("fas fa-building").
     - Foto galeri: unggah, keterangan, teks alternatif, urutan, sampul, hapus.
   ========================================================================== */
(function (window, document) {
  'use strict';

  var utils = window.NIUtils;
  var api = window.NISupabase;
  var admin = window.NIAdmin;

  var ICON_FALLBACK = 'fas fa-building';
  var PAGE_SIZE = 10;

  var state = {
    facilities: [],
    allFacilities: [],
    units: [],
    page: 1,
    pages: 1,
    facility: null,
    photos: []
  };

  /* ------------------------------------------------------------------ */
  /*  Halaman daftar                                                      */
  /* ------------------------------------------------------------------ */

  function unitNames(facility) {
    return (facility.facility_unit || [])
      .map(function (row) { return row.units; })
      .filter(Boolean)
      .map(function (unit) { return unit.name; });
  }

  function photoList(facility) {
    return (facility.facility_photos || [])
      .slice()
      .sort(function (a, b) {
        return (a.sort_order || 0) - (b.sort_order || 0) || (a.id || 0) - (b.id || 0);
      });
  }

  function coverUrl(facility) {
    var photos = photoList(facility);
    var cover = photos.find(function (photo) { return photo.is_cover; }) || photos[0];

    return cover ? api.mediaUrl(cover.image_path) : '';
  }

  function renderStats(rows) {
    var total = rows.length;
    var published = rows.filter(function (row) { return row.is_published; }).length;
    var photos = rows.reduce(function (sum, row) {
      return sum + photoList(row).length;
    }, 0);

    var totalEl = document.getElementById('stat-total');
    var publishedEl = document.getElementById('stat-published');
    var photosEl = document.getElementById('stat-photos');

    if (totalEl) totalEl.textContent = utils.formatNumber(total);
    if (publishedEl) publishedEl.textContent = utils.formatNumber(published);
    if (photosEl) photosEl.textContent = utils.formatNumber(photos);
  }

  function rowTemplate(facility) {
    var cover = coverUrl(facility);
    var units = unitNames(facility);
    var photos = photoList(facility);
    var icon = utils.isValidIcon(facility.icon) ? facility.icon : ICON_FALLBACK;

    var thumb = cover
      ? '<img src="' + utils.escapeHtml(cover) + '" alt="" class="h-full w-full object-cover">'
      : '<i class="' + utils.escapeHtml(icon) + ' text-lg" aria-hidden="true"></i>';

    var unitHtml = units.length
      ? units.map(function (name) {
          return '<span class="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">' +
            utils.escapeHtml(name) + '</span>';
        }).join('')
      : '<span class="text-xs text-slate-400">Tanpa unit</span>';

    var badge = facility.is_published
      ? '<span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800">Published</span>'
      : '<span class="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">Draft</span>';

    /* Admin unit hanya boleh mengelola fasilitas yang tertaut ke unitnya. */
    var manageable = admin.isSuperAdmin() || (facility.facility_unit || []).some(function (row) {
      return (admin.units ? admin.units() : []).some(function (mine) {
        return mine.id === Number(row.unit_id);
      });
    });

    var manageButtons = manageable
      ? [
          '    <a href="facility-form.html?id=' + facility.id + '#galeri" class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800" aria-label="Kelola galeri fasilitas ' + utils.escapeHtml(facility.name) + '">',
          '      <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 21h16.5M4.5 21V8.25L12 3l7.5 5.25V21M9 21v-6h6v6"/></svg> Galeri',
          '    </a>',
          '    <a href="facility-form.html?id=' + facility.id + '" class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800" aria-label="Edit fasilitas ' + utils.escapeHtml(facility.name) + '">',
          '      <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m15.5 5.5 3 3M4 20l4.7-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z"/></svg> Edit',
          '    </a>',
          '    <button type="button" data-facility-delete="' + facility.id + '" class="inline-flex items-center gap-1.5 rounded-lg border border-rose-100 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:border-rose-200 hover:bg-rose-50" aria-label="Hapus fasilitas ' + utils.escapeHtml(facility.name) + '">',
          '      <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M4 7h16M10 11v6m4-6v6M5.5 7l1 13h11l1-13M9 7V4h6v3"/></svg> Hapus',
          '    </button>'
        ].join('\n')
      : '';

    return [
      '<tr class="transition hover:bg-slate-50/70">',
      '  <td class="px-6 py-4">',
      '    <div class="flex items-center gap-3">',
      '      <span class="flex h-14 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-emerald-50 text-emerald-700">' + thumb + '</span>',
      '      <div class="min-w-0">',
      '        <p class="max-w-xs truncate font-semibold text-slate-900"><i class="' + utils.escapeHtml(icon) + ' mr-1.5 text-slate-400" aria-hidden="true"></i>' + utils.escapeHtml(facility.name) + '</p>',
      '        <p class="mt-1 max-w-xs truncate font-mono text-xs text-slate-400">' + utils.escapeHtml(facility.slug) + '</p>',
      '      </div>',
      '    </div>',
      '  </td>',
      '  <td class="px-6 py-4"><div class="flex max-w-xs flex-wrap gap-1">' + unitHtml + '</div></td>',
      '  <td class="px-6 py-4 text-slate-600">' + photos.length + ' foto</td>',
      '  <td class="px-6 py-4">' + badge + '</td>',
      '  <td class="px-6 py-4"><div class="flex justify-end gap-2">',
      manageButtons,
      '  </div></td>',
      '</tr>'
    ].join('\n');
  }

  function renderPagination() {
    var host = document.getElementById('facility-pagination');
    if (!host) return;

    if (state.pages <= 1) {
      host.innerHTML = '';
      return;
    }

    var buttons = [];

    for (var page = 1; page <= state.pages; page++) {
      var active = page === state.page;

      buttons.push(
        '<button type="button" data-page="' + page + '" ' +
        'class="min-w-9 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ' +
        (active
          ? 'border-emerald-600 bg-emerald-600 text-white'
          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50') +
        '">' + page + '</button>'
      );
    }

    host.innerHTML = [
      '<div class="flex flex-wrap items-center justify-between gap-3">',
      '  <p class="text-xs text-slate-500">Halaman <span class="font-semibold text-slate-700">' + state.page + '</span> dari ' + state.pages + '</p>',
      '  <div class="flex flex-wrap gap-2">' + buttons.join('') + '</div>',
      '</div>'
    ].join('\n');
  }

  function renderList() {
    var body = document.getElementById('facility-rows');
    if (!body) return;

    var empty = document.getElementById('facility-empty');
    var countEl = document.getElementById('facility-count');

    [].slice.call(body.querySelectorAll('[data-facility-row]')).forEach(function (row) {
      row.parentNode.removeChild(row);
    });

    if (!state.facilities.length) {
      if (empty) empty.classList.remove('hidden');
      if (countEl) countEl.textContent = '0 fasilitas tersedia';
      renderPagination();
      return;
    }

    if (empty) empty.classList.add('hidden');

    state.pages = Math.max(1, Math.ceil(state.facilities.length / PAGE_SIZE));
    if (state.page > state.pages) state.page = state.pages;

    var start = (state.page - 1) * PAGE_SIZE;
    var slice = state.facilities.slice(start, start + PAGE_SIZE);

    body.insertAdjacentHTML('afterbegin', slice.map(rowTemplate).join('\n'));

    if (countEl) countEl.textContent = state.facilities.length + ' fasilitas tersedia';

    renderPagination();
  }

  function currentFilters() {
    return {
      q: (document.getElementById('facility-search') || {}).value || '',
      group: (document.getElementById('facility-group') || {}).value || '',
      unit: (document.getElementById('facility-unit') || {}).value || '',
      status: (document.getElementById('facility-status') || {}).value || ''
    };
  }

  function applyFilters() {
    var filters = currentFilters();
    var query = String(filters.q).trim().toLowerCase();

    state.facilities = state.allFacilities.filter(function (facility) {
      if (filters.group && facility.group_type !== filters.group) return false;
      if (filters.status && String(!!facility.is_published) !== filters.status) return false;

      if (filters.unit) {
        var slugs = (facility.facility_unit || [])
          .map(function (row) { return row.units; })
          .filter(Boolean)
          .map(function (unit) { return unit.slug; });

        if (slugs.indexOf(filters.unit) === -1) return false;
      }

      if (query) {
        var haystack = (facility.name + ' ' + facility.slug).toLowerCase();
        if (haystack.indexOf(query) === -1) return false;
      }

      return true;
    });

    state.page = 1;
    renderStats(state.facilities);
    renderList();
  }

  function bindFilters() {
    ['facility-search', 'facility-group', 'facility-unit', 'facility-status'].forEach(function (id) {
      var element = document.getElementById(id);
      if (!element) return;

      var handler = function () { applyFilters(); };

      element.addEventListener('input', utils.debounce(handler, 200));
      element.addEventListener('change', handler);
    });

    var applyButton = document.getElementById('facility-apply');
    if (applyButton) applyButton.addEventListener('click', applyFilters);

    var resetButton = document.getElementById('facility-reset');
    if (resetButton) {
      resetButton.addEventListener('click', function () {
        ['facility-search', 'facility-group', 'facility-unit', 'facility-status'].forEach(function (id) {
          var element = document.getElementById(id);
          if (element) element.value = '';
        });
        applyFilters();
      });
    }
  }

  function bindPagination() {
    document.addEventListener('click', function (event) {
      var button = event.target.closest('[data-page]');
      if (!button) return;

      state.page = Number(button.getAttribute('data-page')) || 1;
      renderList();
    });
  }

  function bindDelete() {
    document.addEventListener('click', function (event) {
      var button = event.target.closest('[data-facility-delete]');
      if (!button) return;

      if (!admin.confirmAction('Yakin ingin menghapus fasilitas ini?')) return;

      var id = button.getAttribute('data-facility-delete');
      var db = api.getClient();
      var bucket = (window.SITE_CONFIG && window.SITE_CONFIG.storageBucket) || 'media';

      /* Kumpulkan path foto dulu supaya file di Storage ikut terhapus. */
      db.from('facility_photos')
        .select('image_path')
        .eq('facility_id', id)
        .then(function (photos) {
          if (photos.error) throw photos.error;

          var paths = (photos.data || [])
            .map(function (photo) { return photo.image_path; })
            .filter(Boolean);

          return db.from('facilities')
            .delete()
            .eq('id', id)
            .then(function (result) {
              if (result.error) throw result.error;
              if (!paths.length) return null;

              return db.storage.from(bucket).remove(paths);
            });
        })
        .then(function () {
          admin.flash('Fasilitas berhasil dihapus!');
          load();
        })
        .catch(function (error) {
          admin.flash('Fasilitas gagal dihapus: ' + error.message, 'error');
        });
    });
  }

  function fillUnitFilter() {
    var select = document.getElementById('facility-unit');
    if (!select) return;

    var options = ['<option value="">Semua unit</option>'];

    state.units.forEach(function (unit) {
      options.push('<option value="' + utils.escapeHtml(unit.slug) + '">' + utils.escapeHtml(unit.name) + '</option>');
    });

    select.innerHTML = options.join('');
  }

  function load() {
    var db = api.getClient();
    if (!db) return;

    Promise.all([
      db
        .from('facilities')
        .select(
          'id, name, slug, description, icon, is_published, group_type, sort_order, ' +
            'facility_unit(id, unit_id, units(id, name, slug, group_type)), ' +
            'facility_photos(id, image_path, caption, alt_text, sort_order, is_cover)'
        )
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true }),
      db.from('units').select('id, name, slug, group_type').order('name', { ascending: true })
    ]).then(function (results) {
      if (results[0].error) throw results[0].error;

      state.allFacilities = results[0].data || [];
      state.units = results[1].data || [];

      fillUnitFilter();
      applyFilters();
    }).catch(function (error) {
      admin.flash('Gagal memuat fasilitas: ' + error.message, 'error');
    });
  }

  function initList() {
    bindFilters();
    bindPagination();
    bindDelete();
    load();
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

  /**
   * Prefix folder Storage untuk unggahan.
   *
   * Folder diawali slug unit, supaya policy RLS Storage bisa membatasi
   * unggahan per unit.
   */
  function storagePrefix() {
    if (!admin.isSuperAdmin()) {
      var mine = admin.units ? admin.units() : [];
      return mine.length ? mine[0].slug : 'umum';
    }

    var linked = state.facility && state.facility.facility_unit
      ? state.facility.facility_unit
          .map(function (row) { return row.units; })
          .filter(Boolean)
      : [];

    return linked.length ? linked[0].slug : 'umum';
  }

  function fillUnits(selectedIds) {
    var host = document.getElementById('unit-list');
    if (!host) return;

    /* Admin unit hanya boleh menautkan fasilitasnya ke unitnya sendiri. */
    var units = admin.isSuperAdmin()
      ? state.units
      : state.units.filter(function (unit) {
          return (admin.units ? admin.units() : []).some(function (mine) {
            return mine.id === unit.id;
          });
        });

    if (!units.length) {
      host.innerHTML = '<p class="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">Belum ada unit.</p>';
      return;
    }

    host.innerHTML = '<div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">' +
      units.map(function (unit) {
        var checked = selectedIds.indexOf(String(unit.id)) !== -1;

        return [
          '<label class="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm transition hover:border-emerald-200 hover:bg-emerald-50/50">',
          '  <input type="checkbox" name="units[]" value="' + unit.id + '"' + (checked ? ' checked' : '') + ' class="h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-500">',
          '  <span class="font-medium text-slate-700">' + utils.escapeHtml(unit.name) + '</span>',
          '  <span class="ml-auto text-[11px] font-semibold uppercase tracking-wide text-slate-400">' + (unit.group_type === 'sigma' ? 'Sigma' : 'Induk') + '</span>',
          '</label>'
        ].join('\n');
      }).join('\n') + '</div>';
  }

  function selectedUnitIds() {
    return [].slice
      .call(document.querySelectorAll('#unit-list input[name="units[]"]:checked'))
      .map(function (input) { return Number(input.value); });
  }

  function refreshIconPreview() {
    var field = document.getElementById('icon');
    var preview = document.getElementById('icon-preview');
    var hint = document.getElementById('icon-hint');

    if (!field || !preview) return;

    var value = String(field.value || '').trim();
    var valid = utils.isValidIcon(value);

    preview.className = valid ? value : ICON_FALLBACK;

    if (hint) hint.classList.toggle('hidden', valid || value === '');
  }

  function bindIconControls() {
    var field = document.getElementById('icon');
    if (field) field.addEventListener('input', refreshIconPreview);

    [].slice.call(document.querySelectorAll('[data-icon-preset]')).forEach(function (button) {
      button.addEventListener('click', function () {
        if (!field) return;
        field.value = button.getAttribute('data-icon-preset');
        refreshIconPreview();
      });
    });

    refreshIconPreview();
  }

  /* ---- Galeri foto ---- */

  function photoTemplate(photo, index, last) {
    var url = api.mediaUrl(photo.image_path);
    var alt = photo.alt_text || photo.caption || 'Foto fasilitas';

    return [
      '<li class="overflow-hidden rounded-2xl border border-slate-200 bg-white" data-photo-id="' + photo.id + '">',
      '  <div class="relative">',
      '    <img src="' + utils.escapeHtml(url) + '" alt="' + utils.escapeHtml(alt) + '" class="h-40 w-full object-cover">',
      photo.is_cover
        ? '    <span class="absolute left-3 top-3 rounded-full bg-emerald-700 px-2.5 py-1 text-[11px] font-bold text-white">Sampul</span>'
        : '',
      '    <div class="absolute right-3 top-3 flex flex-col gap-1">',
      '      <button type="button" data-photo-move="up" ' + (index === 0 ? 'disabled' : '') + ' title="Geser ke atas" aria-label="Geser foto ke atas" class="flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 text-slate-700 shadow-sm transition hover:bg-emerald-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"><svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m6 15 6-6 6 6"/></svg></button>',
      '      <button type="button" data-photo-move="down" ' + (index === last ? 'disabled' : '') + ' title="Geser ke bawah" aria-label="Geser foto ke bawah" class="flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 text-slate-700 shadow-sm transition hover:bg-emerald-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"><svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m6 9 6 6 6-6"/></svg></button>',
      '    </div>',
      '  </div>',
      '  <div class="space-y-3 p-4">',
      '    <div>',
      '      <label class="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">Keterangan</label>',
      '      <input type="text" data-photo-caption="' + photo.id + '" maxlength="255" value="' + utils.escapeHtml(photo.caption || '') + '" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10">',
      '    </div>',
      '    <div>',
      '      <label class="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">Teks alternatif</label>',
      '      <input type="text" data-photo-alt="' + photo.id + '" maxlength="255" value="' + utils.escapeHtml(photo.alt_text || '') + '" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10">',
      '    </div>',
      '    <div class="flex flex-wrap items-center gap-2 pt-1">',
      '      <button type="button" data-photo-save="' + photo.id + '" class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800">Simpan</button>',
      photo.is_cover
        ? ''
        : '      <button type="button" data-photo-cover="' + photo.id + '" class="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100">Jadikan sampul</button>',
      '    </div>',
      '  </div>',
      '  <div class="border-t border-slate-100 px-4 py-3">',
      '    <button type="button" data-photo-delete="' + photo.id + '" class="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 transition hover:text-rose-800"><svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M4 7h16M10 11v6m4-6v6M5.5 7l1 13h11l1-13M9 7V4h6v3"/></svg> Hapus foto</button>',
      '  </div>',
      '</li>'
    ].join('\n');
  }

  function renderPhotos() {
    var host = document.getElementById('photo-list');
    var empty = document.getElementById('photo-empty');
    if (!host) return;

    if (!state.photos.length) {
      host.innerHTML = '';
      if (empty) empty.classList.remove('hidden');
      return;
    }

    if (empty) empty.classList.add('hidden');

    host.innerHTML = state.photos.map(function (photo, index) {
      return photoTemplate(photo, index, state.photos.length - 1);
    }).join('\n');
  }

  function bindGallery() {
    var host = document.getElementById('photo-list');
    if (!host) return;

    var db = api.getClient();

    host.addEventListener('click', function (event) {
      var moveButton = event.target.closest('[data-photo-move]');

      if (moveButton) {
        var item = moveButton.closest('[data-photo-id]');
        if (!item) return;

        var id = Number(item.getAttribute('data-photo-id'));
        var index = state.photos.findIndex(function (photo) { return photo.id === id; });
        var target = moveButton.getAttribute('data-photo-move') === 'up' ? index - 1 : index + 1;

        if (index < 0 || target < 0 || target >= state.photos.length) return;

        var moved = state.photos.splice(index, 1)[0];
        state.photos.splice(target, 0, moved);

        renderPhotos();
        persistOrder();
        return;
      }

      var coverButton = event.target.closest('[data-photo-cover]');
      if (coverButton) {
        var coverId = Number(coverButton.getAttribute('data-photo-cover'));
        setCover(coverId);
        return;
      }

      var saveButton = event.target.closest('[data-photo-save]');
      if (saveButton) {
        savePhoto(Number(saveButton.getAttribute('data-photo-save')));
        return;
      }

      var deleteButton = event.target.closest('[data-photo-delete]');
      if (deleteButton) {
        deletePhoto(Number(deleteButton.getAttribute('data-photo-delete')));
      }
    });
  }

  function persistOrder() {
    var db = api.getClient();

    state.photos.reduce(function (chain, photo, index) {
      return chain.then(function () {
        return db
          .from('facility_photos')
          .update({ sort_order: index + 1, updated_at: new Date().toISOString() })
          .eq('id', photo.id);
      });
    }, Promise.resolve()).catch(function (error) {
      admin.flash('Gagal menyimpan urutan foto: ' + error.message, 'error');
    });
  }

  function setCover(photoId) {
    var db = api.getClient();

    state.photos.reduce(function (chain, photo) {
      return chain.then(function () {
        return db
          .from('facility_photos')
          .update({ is_cover: photo.id === photoId, updated_at: new Date().toISOString() })
          .eq('id', photo.id);
      });
    }, Promise.resolve()).then(function () {
      state.photos.forEach(function (photo) {
        photo.is_cover = photo.id === photoId;
      });

      renderPhotos();
      admin.flash('Foto sampul berhasil diperbarui.');
    }).catch(function (error) {
      admin.flash('Gagal mengubah foto sampul: ' + error.message, 'error');
    });
  }

  function savePhoto(photoId) {
    var db = api.getClient();
    var captionInput = document.querySelector('[data-photo-caption="' + photoId + '"]');
    var altInput = document.querySelector('[data-photo-alt="' + photoId + '"]');

    db.from('facility_photos')
      .update({
        caption: captionInput ? captionInput.value.trim() : null,
        alt_text: altInput ? altInput.value.trim() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', photoId)
      .then(function (result) {
        if (result.error) {
          admin.flash('Foto gagal disimpan: ' + result.error.message, 'error');
          return;
        }

        state.photos.forEach(function (photo) {
          if (photo.id !== photoId) return;
          photo.caption = captionInput ? captionInput.value.trim() : '';
          photo.alt_text = altInput ? altInput.value.trim() : '';
        });

        admin.flash('Keterangan foto berhasil disimpan.');
      });
  }

  function deletePhoto(photoId) {
    if (!admin.confirmAction('Yakin ingin menghapus foto ini?')) return;

    var db = api.getClient();
    var bucket = (window.SITE_CONFIG && window.SITE_CONFIG.storageBucket) || 'media';

    var target = state.photos.find(function (photo) { return photo.id === photoId; });
    var path = target ? target.image_path : null;

    db.from('facility_photos')
      .delete()
      .eq('id', photoId)
      .then(function (result) {
        if (result.error) throw result.error;

        if (!path) return null;

        return db.storage.from(bucket).remove([path]);
      })
      .then(function () {
        state.photos = state.photos.filter(function (photo) {
          return photo.id !== photoId;
        });

        renderPhotos();
        admin.flash('Foto berhasil dihapus.');
      })
      .catch(function (error) {
        admin.flash('Foto gagal dihapus: ' + error.message, 'error');
      });
  }

  function bindPhotoUpload() {
    var form = document.getElementById('photo-upload-form');
    if (!form) return;

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var input = document.getElementById('photo');
      var file = input && input.files ? input.files[0] : null;

      if (!file) {
        admin.flash('Pilih foto terlebih dahulu.', 'error');
        return;
      }

      if (['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].indexOf(String(file.type || '').toLowerCase()) === -1) {
        admin.flash('Foto harus berformat JPG, PNG, atau WEBP.', 'error');
        return;
      }

      if (file.size > 4 * 1024 * 1024) {
        admin.flash('Ukuran foto maksimal 4 MB.', 'error');
        return;
      }

      var db = api.getClient();
      var bucket = (window.SITE_CONFIG && window.SITE_CONFIG.storageBucket) || 'media';
      var path = storagePrefix() + '/fasilitas/' + utils.randomPath(file.name.split('.').pop());

      db.storage
        .from(bucket)
        .upload(path, file, { contentType: file.type || 'application/octet-stream', upsert: false })
        .then(function (result) {
          if (result.error) throw result.error;

          var caption = document.getElementById('caption').value.trim();
          var altText = document.getElementById('alt_text').value.trim();

          return db
            .from('facility_photos')
            .insert({
              facility_id: state.facility.id,
              image_path: path,
              caption: caption || null,
              alt_text: altText || caption || null,
              sort_order: state.photos.length + 1,
              is_cover: state.photos.length === 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select('id, image_path, caption, alt_text, sort_order, is_cover')
            .single();
        })
        .then(function (result) {
          if (result.error) throw result.error;

          state.photos.push(result.data);
          renderPhotos();

          form.reset();
          admin.flash('Foto berhasil diunggah.');
        })
        .catch(function (error) {
          admin.flash('Foto gagal diunggah: ' + error.message, 'error');
        });
    });
  }

  function saveFacility(event) {
    event.preventDefault();
    clearError();

    var name = document.getElementById('name').value.trim();

    if (!name) {
      showError('Nama fasilitas wajib diisi.');
      return;
    }

    if (name.length > 255) {
      showError('Nama fasilitas maksimal 255 karakter.');
      return;
    }

    var slugInput = document.getElementById('slug');
    var slug = slugInput.value.trim() || utils.slugify(name);

    if (slug.length > 255) {
      showError('Slug maksimal 255 karakter.');
      return;
    }

    var description = document.getElementById('description').value.trim();

    if (description.length > 1000) {
      showError('Deskripsi maksimal 1000 karakter.');
      return;
    }

    var sortOrder = Number(document.getElementById('sort_order').value || 0);

    if (!Number.isFinite(sortOrder) || sortOrder < 0) {
      showError('Urutan tampil harus berupa angka nol atau lebih.');
      return;
    }

    var icon = document.getElementById('icon').value.trim();
    if (!utils.isValidIcon(icon)) icon = ICON_FALLBACK;

    var groupType = document.getElementById('group_type').value === 'sigma' ? 'sigma' : 'main';

    /* Minimal satu unit wajib dipilih (samakan dengan aturan Laravel). */
    var unitIds = selectedUnitIds();

    if (!unitIds.length) {
      showError('Pilih minimal satu unit pendidikan yang memakai fasilitas ini.');
      return;
    }

    /* Admin unit tidak boleh menautkan fasilitas ke unit lain. */
    if (!admin.isSuperAdmin()) {
      var allowedUnitIds = (admin.units ? admin.units() : []).map(function (unit) {
        return unit.id;
      });

      var outside = unitIds.filter(function (unitId) {
        return allowedUnitIds.indexOf(unitId) === -1;
      });

      if (outside.length) {
        showError('Fasilitas hanya dapat ditautkan ke unit yang Anda kelola.');
        return;
      }
    }

    /* Semua unit yang dipilih harus satu kelompok dengan fasilitasnya. */
    var mismatched = state.units
      .filter(function (unit) {
        return unitIds.indexOf(Number(unit.id)) !== -1 && unit.group_type !== groupType;
      })
      .map(function (unit) { return unit.name; });

    if (mismatched.length) {
      var label = groupType === 'sigma'
        ? 'Sigma (TK Sigma & Daycare Sigma)'
        : 'Sekolah induk (TK, SD, dan SMP Nurul Ilmi)';

      showError('Unit [' + mismatched.join(', ') + '] tidak sesuai kelompok section "' + label + '".');
      return;
    }

    /* Foto wajib berupa JPG/PNG/WEBP dengan ukuran maksimal 4 MB. */
    var photosInput = document.getElementById('photos');
    var files = Array.prototype.slice.call((photosInput && photosInput.files) || []);
    var photoError = null;

    for (var fileIndex = 0; fileIndex < files.length; fileIndex++) {
      var file = files[fileIndex];
      var type = String(file.type || '').toLowerCase();

      if (['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].indexOf(type) === -1) {
        photoError = 'Foto "' + file.name + '" harus berformat JPG, PNG, atau WEBP.';
        break;
      }

      if (file.size > 4 * 1024 * 1024) {
        photoError = 'Ukuran foto "' + file.name + '" maksimal 4 MB.';
        break;
      }
    }

    if (photoError) {
      showError(photoError);
      return;
    }

    var payload = {
      name: name,
      slug: slug,
      description: description || null,
      icon: icon,
      group_type: groupType,
      sort_order: sortOrder,
      is_published: document.getElementById('is_published').checked,
      updated_at: new Date().toISOString()
    };

    if (!state.facility) payload.created_at = new Date().toISOString();

    var db = api.getClient();
    var id = state.facility ? state.facility.id : null;

    var request = id
      ? db.from('facilities').update(payload).eq('id', id).select('id').single()
      : db.from('facilities').insert(payload).select('id').single();

    request
      .then(function (result) {
        if (result.error) throw result.error;

        var facilityId = result.data.id;

        return db
          .from('facility_unit')
          .delete()
          .eq('facility_id', facilityId)
          .then(function () {
            var unitIds = selectedUnitIds();

            if (!unitIds.length) return null;

            var rows = unitIds.map(function (unitId) {
              return {
                facility_id: facilityId,
                unit_id: unitId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };
            });

            return db.from('facility_unit').insert(rows);
          })
          .then(function (result) {
            if (result && result.error) throw result.error;
            return facilityId;
          });
      })
      .then(function (facilityId) {
        // Foto yang dipilih pada form ditambahkan ke galeri.
        var input = document.getElementById('photos');
        var files = Array.prototype.slice.call((input && input.files) || []);

        if (!files.length) return facilityId;

        var bucket = (window.SITE_CONFIG && window.SITE_CONFIG.storageBucket) || 'media';

        return files.reduce(function (chain, file) {
          return chain.then(function () {
            var path = storagePrefix() + '/fasilitas/' + utils.randomPath(file.name.split('.').pop());

            return db.storage
              .from(bucket)
              .upload(path, file, { contentType: file.type || 'application/octet-stream', upsert: false })
              .then(function (result) {
                if (result.error) throw result.error;

                return db.from('facility_photos').insert({
                  facility_id: facilityId,
                  image_path: path,
                  caption: null,
                  alt_text: null,
                  sort_order: state.photos.length + 1,
                  is_cover: state.photos.length === 0,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });
              });
          });
        }, Promise.resolve(facilityId));
      })
      .then(function () {
        window.location.href = 'facilities.html?success=' + encodeURIComponent(
          id ? 'Fasilitas berhasil diperbarui!' : 'Fasilitas berhasil ditambahkan!'
        );
      })
      .catch(function (error) {
        showError(error.message || 'Fasilitas gagal disimpan.');
      });
  }

  function initForm() {
    var form = document.getElementById('facility-form');
    if (!form) return;

    var params = new window.URLSearchParams(window.location.search);
    var id = params.get('id');

    var db = api.getClient();
    if (!db) return;

    bindIconControls();
    bindGallery();
    bindPhotoUpload();

    form.addEventListener('submit', saveFacility);

    db.from('units')
      .select('id, name, slug, group_type')
      .order('name', { ascending: true })
      .then(function (result) {
        if (result.error) throw result.error;

        state.units = result.data || [];

        if (!id) {
          fillUnits([]);
          document.getElementById('group_type').value = 'main';
          document.getElementById('is_published').checked = true;
          return null;
        }

        return db
          .from('facilities')
          .select(
            'id, name, slug, description, icon, is_published, group_type, sort_order, ' +
              'facility_unit(id, unit_id, units(id, name, slug, group_type)), ' +
              'facility_photos(id, image_path, caption, alt_text, sort_order, is_cover)'
          )
          .eq('id', id)
          .maybeSingle()
          .then(function (result) {
            if (result.error) throw result.error;
            if (!result.data) {
              admin.flash('Fasilitas tidak ditemukan.', 'error');
              return null;
            }

            state.facility = result.data;

            document.getElementById('form-title').textContent = state.facility.name;
            document.getElementById('form-subtitle').innerHTML =
              'Slug <span class="font-mono text-slate-700">' + utils.escapeHtml(state.facility.slug) +
              '</span> · ' + photoList(state.facility).length + ' foto';

            document.getElementById('name').value = state.facility.name || '';
            document.getElementById('slug').value = state.facility.slug || '';
            document.getElementById('description').value = state.facility.description || '';
            document.getElementById('icon').value = state.facility.icon || '';
            document.getElementById('group_type').value = state.facility.group_type || 'main';
            document.getElementById('sort_order').value = state.facility.sort_order || 0;
            document.getElementById('is_published').checked = !!state.facility.is_published;

            var unitIds = (state.facility.facility_unit || []).map(function (row) {
              return String(row.unit_id);
            });

            fillUnits(unitIds);

            state.photos = photoList(state.facility);
            renderPhotos();

            refreshIconPreview();
            return null;
          });
      })
      .catch(function (error) {
        showError(error.message || 'Gagal memuat data fasilitas.');
      });
  }

  window.NIAdminFacilities = {
    initList: initList,
    initForm: initForm
  };
})(window, document);
