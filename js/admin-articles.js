/* ==========================================================================
   DASHBOARD ADMIN — ARTIKEL
   --------------------------------------------------------------------------
   Menggantikan App\Http\Controllers\ArticleAdminController + Blade
   resources/views/admin/articles/*.

   Alur yang dipertahankan:
     - Tambah / edit artikel (bahasa Indonesia + terjemahan bahasa Inggris).
     - Terjemahan otomatis lewat Supabase Edge Function "translate".
     - Kategori, tag, status published/draft, nama penulis.
     - Media artikel (gambar & video) di Supabase Storage, lengkap dengan
       keterangan dan urutan tampil.
     - Pencarian judul/penulis, paginasi, hapus artikel.
   ========================================================================== */
(function (window, document) {
  'use strict';

  var utils = window.NIUtils;
  var api = window.NISupabase;
  var admin = window.NIAdmin;
  var thumbs = window.NIVideoThumb;

  var PAGE_SIZE = 10;

  var mediaControlsBound = false;

  var state = {
    articles: [],
    filtered: [],
    page: 1,
    pages: 1,
    categories: [],
    tags: [],
    media: [],
    newMedia: [],
    removedMedia: [],
    article: null,
    units: []
  };

  /* ------------------------------------------------------------------ */
  /*  Unit                                                                */
  /* ------------------------------------------------------------------ */

  /** Semua unit (katalog publik). */
  function allUnits() {
    return state.units;
  }

  /** Unit yang boleh dikelola admin ini. Super_admin = semua unit. */
  function manageableUnits() {
    if (admin.isSuperAdmin()) return allUnits();
    return admin.units ? admin.units() : [];
  }

  /** True bila admin ini boleh mengelola unit tertentu. */
  function canManageUnit(unitId) {
    if (admin.isSuperAdmin()) return true;
    if (!unitId) return false;

    return manageableUnits().some(function (unit) {
      return unit.id === Number(unitId);
    });
  }

  /** Slug unit untuk prefiks folder Storage. */
  function unitSlug(unitId) {
    if (!unitId) return 'umum';

    var found = allUnits().filter(function (unit) {
      return unit.id === Number(unitId);
    })[0];

    return found ? found.slug : 'umum';
  }

  /* ------------------------------------------------------------------ */
  /*  Halaman daftar                                                      */
  /* ------------------------------------------------------------------ */

  function renderStats(rows) {
    var total = rows.length;
    var views = rows.reduce(function (sum, item) {
      return sum + Number(item.views || 0);
    }, 0);

    var totalEl = document.getElementById('stat-total');
    var viewsEl = document.getElementById('stat-views');

    if (totalEl) totalEl.textContent = utils.formatNumber(total);
    if (viewsEl) viewsEl.textContent = utils.formatNumber(views);
  }

  function statusBadge(status) {
    if (status === 'published') {
      return '<span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800">Published</span>';
    }

    return '<span class="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">Draft</span>';
  }

  function articleCover(article) {
    if (article.image) return api.mediaUrl(article.image);

    var media = article.article_media || [];

    var first = media.find(function (item) {
      return item.type === 'image';
    });

    if (first) return api.mediaUrl(first.path);

    /* Artikel yang hanya punya video memakai thumbnail-nya sebagai sampul. */
    var video = media.find(function (item) {
      return item.type === 'video' && item.poster_path;
    });

    return video ? api.mediaUrl(video.poster_path) : '';
  }

  function articleTags(article) {
    return (article.article_tags || [])
      .map(function (row) { return row.tags; })
      .filter(Boolean);
  }

  function rowTemplate(article) {
    var cover = articleCover(article);
    var tags = articleTags(article);
    var category = article.categories ? article.categories.name : 'Tanpa kategori';

    var search = utils.escapeHtml(
      [
        article.title_id || '',
        article.title_en || '',
        article.author_name || '',
        category
      ].join(' ').toLowerCase()
    );

    var thumb = cover
      ? '<img src="' + utils.escapeHtml(cover) + '" alt="" class="h-14 w-16 shrink-0 rounded-xl object-cover">'
      : '<span class="flex h-14 w-16 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">' +
        '<svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M7 3.75h7l5 5v11.5H7a2 2 0 0 1-2-2v-12.5a2 2 0 0 1 2-2ZM14 4v5h5"/></svg>' +
        '</span>';

    var tagHtml = tags.length
      ? tags.map(function (tag) {
          return '<span class="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">' +
            utils.escapeHtml(tag.name) + '</span>';
        }).join('')
      : '<span class="text-xs text-slate-400">Tanpa tag</span>';

    /* Hapus artikel hanya boleh untuk admin unit yang memiliki artikelnya
       (RLS: articles_delete_admin). */
    var deleteButton = canManageUnit(article.unit_id)
      ? [
          '      <button type="button" data-article-delete="' + article.id + '" class="inline-flex items-center gap-1.5 rounded-lg border border-rose-100 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:border-rose-200 hover:bg-rose-50" aria-label="Hapus artikel ' + utils.escapeHtml(article.title_id) + '">',
          '        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M4 7h16M10 11v6m4-6v6M5.5 7l1 13h11l1-13M9 7V4h6v3"/></svg> Hapus',
          '      </button>'
        ].join('\n')
      : '';

    /* Nama unit ditampilkan di kolom penulis supaya admin tahu cakupan data. */
    var unit = article.units || null;
    var unitText = unit ? unit.name : 'Umum (yayasan)';

    return [
      '<tr data-article-row data-search="' + search + '" class="transition hover:bg-slate-50/70">',
      '  <td class="px-6 py-4">',
      '    <div class="flex items-center gap-3">',
      '      ' + thumb,
      '      <div class="min-w-0">',
      '        <p class="max-w-sm truncate font-semibold text-slate-900">' + utils.escapeHtml(article.title_id) + '</p>',
      '        <p class="mt-1 max-w-sm truncate text-xs text-slate-500">' + utils.escapeHtml(utils.limit(article.content_id, 100)) + '</p>',
      '      </div>',
      '    </div>',
      '  </td>',
      '  <td class="px-6 py-4">',
      '    <p class="font-medium text-slate-700">' + utils.escapeHtml(category) + '</p>',
      '    <div class="mt-1 flex max-w-xs flex-wrap gap-1">' + tagHtml + '</div>',
      '  </td>',
      '  <td class="px-6 py-4 text-slate-600">' +
        '<p>' + utils.escapeHtml(article.author_name || 'Admin') + '</p>' +
        '<p class="mt-1 text-xs text-slate-400">' + utils.escapeHtml(unitText) + '</p>' +
      '</td>',
      '  <td class="px-6 py-4">' + statusBadge(article.status) + '</td>',
      '  <td class="px-6 py-4 text-slate-500">' + utils.formatDate(article.created_at) + '</td>',
      '  <td class="px-6 py-4">',
      '    <div class="flex justify-end gap-2">',
      '      <a href="article-form.html?id=' + article.id + '" class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800" aria-label="Edit artikel ' + utils.escapeHtml(article.title_id) + '">',
      '        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m15.5 5.5 3 3M4 20l4.7-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z"/></svg> Edit',
      '      </a>',
      deleteButton,
      '    </div>',
      '  </td>',
      '</tr>'
    ].join('\n');
  }

  function renderPagination() {
    var host = document.getElementById('article-pagination');
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
    var body = document.getElementById('article-rows');
    if (!body) return;

    var empty = document.getElementById('article-empty');
    var noResults = document.getElementById('article-no-results');
    var countEl = document.getElementById('article-count');

    [].slice.call(body.querySelectorAll('[data-article-row]')).forEach(function (row) {
      row.parentNode.removeChild(row);
    });

    /* Jumlah halaman dihitung dari hasil filter, jadi pagination tidak
       menampilkan sisa halaman lama ketika pencarian tidak menemukan baris. */
    state.pages = Math.max(1, Math.ceil(state.filtered.length / PAGE_SIZE));
    if (state.page > state.pages) state.page = state.pages;

    if (!state.filtered.length) {
      if (empty) empty.classList.toggle('hidden', state.articles.length > 0);
      if (noResults) noResults.classList.toggle('hidden', !state.articles.length);
      if (countEl) {
        countEl.textContent = state.articles.length
          ? state.articles.length + ' artikel tersedia'
          : '0 artikel tersedia';
      }
      renderPagination();
      return;
    }

    if (empty) empty.classList.add('hidden');
    if (noResults) noResults.classList.add('hidden');

    var start = (state.page - 1) * PAGE_SIZE;
    var slice = state.filtered.slice(start, start + PAGE_SIZE);

    body.insertAdjacentHTML('afterbegin', slice.map(rowTemplate).join('\n'));

    if (countEl) {
      countEl.textContent = state.filtered.length + ' artikel tersedia';
    }

    renderPagination();
  }

  function applySearch(query) {
    var term = String(query || '').trim().toLowerCase();

    state.filtered = !term
      ? state.articles.slice()
      : state.articles.filter(function (article) {
          var category = article.categories ? article.categories.name : '';
          var haystack = [
            article.title_id || '',
            article.title_en || '',
            article.author_name || '',
            category
          ].join(' ').toLowerCase();

          return haystack.indexOf(term) !== -1;
        });

    state.page = 1;
    renderList();
  }

  function bindSearch() {
    var search = document.getElementById('article-search');
    if (!search) return;

    search.addEventListener('input', utils.debounce(function (event) {
      applySearch(event.target.value);
    }, 150));
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
      var button = event.target.closest('[data-article-delete]');
      if (!button) return;

      if (!admin.confirmAction('Yakin ingin menghapus artikel ini?')) return;

      var id = button.getAttribute('data-article-delete');
      var db = api.getClient();
      var bucket = (window.SITE_CONFIG && window.SITE_CONFIG.storageBucket) || 'media';

      /* Kumpulkan path media dulu supaya file di Storage ikut terhapus. */
      Promise.all([
        db.from('article_media').select('path').eq('article_id', id),
        db.from('articles').select('image').eq('id', id).maybeSingle()
      ])
        .then(function (results) {
          var media = results[0];
          var article = results[1];

          if (media.error) throw media.error;

          var paths = (media.data || [])
            .map(function (row) { return row.path; })
            .filter(Boolean);

          var legacy = article && article.data && article.data.image;

          if (legacy && paths.indexOf(legacy) === -1) paths.push(legacy);

          return db.from('articles')
            .delete()
            .eq('id', id)
            .then(function (result) {
              if (result.error) throw result.error;
              if (!paths.length) return null;

              return db.storage.from(bucket).remove(paths);
            });
        })
        .then(function () {
          admin.flash('Artikel berhasil dihapus!');
          load();
        })
        .catch(function (error) {
          admin.flash('Artikel gagal dihapus: ' + error.message, 'error');
        });
    });
  }

  function load() {
    var db = api.getClient();
    if (!db) return;

    db.from('articles')
      .select(
        'id, title_id, title_en, content_id, image, author_name, author_id, status, views, ' +
          'created_at, updated_at, category_id, unit_id, ' +
          'categories(id, name, slug), ' +
          'units(id, name, slug), ' +
          'article_tags(id, tag_id, tags(id, name, slug)), ' +
          'article_media(id, type, path, mime_type, caption, sort_order, poster_path)'
      )
      .order('created_at', { ascending: false })
      .then(function (result) {
        if (result.error) {
          admin.flash('Gagal memuat artikel: ' + result.error.message, 'error');
          return;
        }

        var rows = result.data || [];

        /* Admin unit hanya melihat artikel unitnya sendiri. */
        if (!admin.isSuperAdmin()) {
          var mine = (admin.units ? admin.units() : []).map(function (unit) {
            return unit.id;
          });

          rows = rows.filter(function (article) {
            return article.unit_id !== null && mine.indexOf(Number(article.unit_id)) !== -1;
          });
        }

        state.articles = rows;
        state.filtered = state.articles.slice();

        renderStats(state.articles);
        renderList();
      });
  }

  function initList() {
    bindSearch();
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

  function setBusy(busy) {
    var button = document.getElementById('submit-article');
    if (!button) return;

    button.disabled = busy;
    button.classList.toggle('cursor-wait', busy);
    button.classList.toggle('opacity-70', busy);

    var label = document.getElementById('submit-article-label');
    if (label) label.textContent = busy ? 'Menyimpan…' : (state.article ? 'Simpan perubahan' : 'Simpan artikel');
  }

  function fillCategories(selectedId) {
    var select = document.getElementById('category_id');
    if (!select) return;

    select.innerHTML = ['<option value="">Tanpa kategori</option>'].concat(
      state.categories.map(function (category) {
        return '<option value="' + category.id + '">' + utils.escapeHtml(category.name) + '</option>';
      })
    ).join('');

    if (selectedId) select.value = String(selectedId);
  }

  /**
   * Isi pilihan unit.
   *
   * Super_admin boleh memilih unit mana pun (plus artikel umum).
   * Admin unit hanya mendapat unitnya sendiri — daftar unit lain tidak pernah
   * dikirim ke browser, dan RLS menolak unit yang dikirim manual.
   */
  function fillUnits(selectedId) {
    var select = document.getElementById('unit_id');
    if (!select) return;

    var allowed = manageableUnits();

    var options = allowed.map(function (unit) {
      return '<option value="' + unit.id + '">' + utils.escapeHtml(unit.name) + '</option>';
    });

    if (admin.isSuperAdmin()) {
      options.unshift('<option value="">Umum (yayasan)</option>');
    }

    select.innerHTML = options.join('');

    if (selectedId) {
      select.value = String(selectedId);
    } else if (allowed.length === 1) {
      select.value = String(allowed[0].id);
    }
  }

  /** Unit terpilih pada form. */
  function selectedUnitId() {
    var select = document.getElementById('unit_id');
    if (!select || !select.value) return null;

    var value = Number(select.value);

    /* Pengaman sisi klien; RLS tetap menjadi penjaga terakhir. */
    return canManageUnit(value) ? value : null;
  }

  function fillTags(selectedIds) {
    var host = document.getElementById('tag-list');
    if (!host) return;

    if (!state.tags.length) {
      host.innerHTML = '<p class="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">Belum ada tag. Kamu bisa menambahkannya dari menu Tag artikel.</p>';
      return;
    }

    host.innerHTML = '<div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">' +
      state.tags.map(function (tag) {
        var checked = selectedIds.indexOf(String(tag.id)) !== -1;

        return [
          '<label class="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm transition hover:border-emerald-200 hover:bg-emerald-50/50">',
          '  <input type="checkbox" name="tags[]" value="' + tag.id + '"' + (checked ? ' checked' : '') + ' class="h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-500">',
          '  <span class="font-medium text-slate-700">' + utils.escapeHtml(tag.name) + '</span>',
          '</label>'
        ].join('\n');
      }).join('\n') + '</div>';
  }

  function mediaItemTemplate(item) {
    var isVideo = item.type === 'video';

    var preview = isVideo
      ? '<video src="' + utils.escapeHtml(item.url) + '"' +
        (item.poster ? ' poster="' + utils.escapeHtml(item.poster) + '"' : '') +
        ' controls preload="metadata" class="h-16 w-24 rounded-lg bg-slate-900 object-cover"></video>'
      : '<img src="' + utils.escapeHtml(item.url) + '" alt="' + utils.escapeHtml(item.caption || 'Media artikel') + '" class="h-16 w-24 rounded-lg object-cover">';

    /* Video lama yang belum punya thumbnail diberi tombol regenerate,
       supaya tidak perlu mengunggah ulang videonya. */
    var thumbnailButton = isVideo && !item.poster
      ? [
          '    <button type="button" data-media-thumbnail="' + item.id + '" class="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100">',
          '      <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M4 7h3l1.5-2h7L17 7h3v12H4V7Z"/><circle cx="12" cy="13" r="3.2"/></svg> Buat thumbnail',
          '    </button>'
        ].join('\n')
      : '';

    return [
      '<li class="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3" data-media-id="' + item.id + '">',
      '  ' + preview,
      '  <div class="min-w-[200px] flex-1">',
      '    <p class="text-xs font-bold uppercase tracking-wide text-slate-400">' + (isVideo ? 'Video' : 'Gambar') + '</p>',
      '    <input type="text" data-media-caption="' + item.id + '" value="' + utils.escapeHtml(item.caption || '') + '" maxlength="255" placeholder="Keterangan (opsional)" class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10">',
      (isVideo && item.poster)
        ? '    <p class="mt-1 text-[11px] font-semibold text-emerald-700">Thumbnail otomatis tersedia</p>'
        : '',
      '  </div>',
      '  <div class="flex items-center gap-2">',
      '    <button type="button" data-media-move="up" class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700" title="Naikkan urutan" aria-label="Naikkan urutan"><svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7"/></svg></button>',
      '    <button type="button" data-media-move="down" class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700" title="Turunkan urutan" aria-label="Turunkan urutan"><svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg></button>',
      '    <label class="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100">',
      '      <input type="checkbox" data-media-remove="' + item.id + '" class="h-4 w-4 rounded border-rose-300 text-rose-700 focus:ring-rose-400">',
      '      Hapus',
      '    </label>',
      thumbnailButton,
      '  </div>',
      '</li>'
    ].join('\n');
  }

  function renderMedia() {
    var host = document.getElementById('media-list');
    if (!host) return;

    var items = state.media.filter(function (item) {
      return state.removedMedia.indexOf(item.id) === -1;
    });

    if (!items.length) {
      host.innerHTML = '';
      host.classList.add('hidden');
      return;
    }

    host.classList.remove('hidden');
    host.innerHTML = items.map(mediaItemTemplate).join('\n');
  }

  /**
   * Entri media untuk satu berkas baru.
   *
   * Entri dibuat saat berkas dipilih supaya pratinjau dan proses simpan
   * memakai frame yang sama. Berkas juga bisa masuk lewat jalur lain
   * (misalnya halaman selesai memuat setelah berkas dipilih), jadi entri
   * dibuat otomatis bila belum ada. Dengan begitu thumbnail video tetap
   * terbentuk saat menyimpan.
   */
  function findMediaEntry(file) {
    var found = state.newMedia.filter(function (row) {
      return row.file === file;
    })[0];

    if (found) return found;

    found = { file: file, posterBlob: null, posterUrl: '' };
    state.newMedia.push(found);

    return found;
  }

  /**
   * Buat thumbnail satu berkas video.
   *
   * Hasil disimpan di state.newMedia supaya pratinjau dan proses simpan
   * memakai frame yang sama (tidak diekstrak dua kali).
   */
  function makeThumbnail(entry) {
    var file = entry.file;

    if (entry.posterBlob) return Promise.resolve(entry.posterBlob);
    if (!thumbs || !thumbs.extractFromFile) return Promise.resolve(null);

    /* Satu ekstraksi dipakai bersama pratinjau dan proses simpan, supaya
       video tidak di-decode dua kali dan hasilnya tidak saling menimpa. */
    if (!entry.posterPromise) {
      entry.posterPromise = thumbs.extractFromFile(file)
        .then(function (blob) {
          if (!blob) {
            entry.posterPromise = null;
            return null;
          }

          entry.posterBlob = blob;
          entry.posterUrl = URL.createObjectURL(blob);

          return blob;
        })
        .catch(function () {
          entry.posterPromise = null;
          return null;
        });
    }

    return entry.posterPromise;
  }

  function renderPreview(files) {
    var wrap = document.getElementById('media-preview');
    var list = document.getElementById('media-preview-list');
    if (!wrap || !list) return;

    list.innerHTML = '';

    if (!files.length) {
      wrap.classList.add('hidden');
      return;
    }

    files.forEach(function (file) {
      var item = document.createElement('li');
      var url = URL.createObjectURL(file);
      var isVideo = file.type.indexOf('video/') === 0;

      item.className = 'overflow-hidden rounded-xl border border-slate-200 bg-slate-50';

      if (isVideo) {
        var video = document.createElement('video');
        video.src = url;
        video.className = 'h-24 w-full bg-slate-900 object-cover';
        video.muted = true;
        video.playsInline = true;
        video.setAttribute('playsinline', '');
        item.appendChild(video);

        var note = document.createElement('p');
        note.className = 'px-2 py-1.5 text-[11px] text-slate-500';
        note.textContent = 'Membuat thumbnail…';
        item.appendChild(note);

        var entry = findMediaEntry(file);

        if (entry) {
          makeThumbnail(entry).then(function (poster) {
            if (poster) {
              video.poster = entry.posterUrl;
              note.textContent = 'Thumbnail otomatis siap';
              note.className = 'px-2 py-1.5 text-[11px] font-semibold text-emerald-700';
            } else {
              note.textContent = 'Thumbnail tidak dibuat (frame gelap atau format tidak didukung)';
              note.className = 'px-2 py-1.5 text-[11px] font-semibold text-amber-700';
            }
          });
        }
      } else {
        var image = document.createElement('img');
        image.src = url;
        image.alt = file.name;
        image.className = 'h-24 w-full object-cover';
        item.appendChild(image);
      }

      var label = document.createElement('p');
      label.className = 'truncate px-2 py-1.5 text-[11px] text-slate-500';
      label.textContent = file.name;
      label.title = file.name;
      item.appendChild(label);

      list.appendChild(item);
    });

    wrap.classList.remove('hidden');
  }

  /**
   * Buat thumbnail untuk video lama yang belum punya poster.
   *
   * Video diunduh dari Storage, satu frame diambil, lalu diunggah lagi
   * sebagai thumbnail. Berkas video asli tidak pernah dihapus.
   */
  function regenerateThumbnail(mediaId, button) {
    var item = state.media.filter(function (row) {
      return row.id === Number(mediaId);
    })[0];

    if (!item || !thumbs || !thumbs.extractFromUrl) return;

    var original = button ? button.innerHTML : '';
    var originalClass = button ? button.className : '';

    if (button) {
      button.disabled = true;
      button.innerHTML = 'Membuat thumbnail…';
    }

    thumbs.extractFromUrl(item.url)
      .then(function (blob) {
        if (!blob) throw new Error('Frame video tidak terbaca. Coba video lain.');

        var prefix = unitSlug(selectedUnitId() || (state.article && state.article.unit_id));
        var path = prefix + '/artikel/thumb-' + utils.randomPath('jpg');

        return api.uploadFile(path, blob, 'image/jpeg')
          .then(function () {
            return api.getClient()
              .from('article_media')
              .update({ poster_path: path, updated_at: new Date().toISOString() })
              .eq('id', item.id);
          })
          .then(function (result) {
            if (result.error) throw result.error;

            item.poster_path = path;
            item.poster = api.mediaUrl(path);

            renderMedia();

            admin.flash('Thumbnail video berhasil dibuat.');
          });
      })
      .catch(function (error) {
        if (button) {
          button.disabled = false;
          button.innerHTML = original;
          button.className = originalClass;
        }

        admin.flash('Thumbnail gagal dibuat: ' + (error.message || 'terjadi kesalahan'), 'error');
      });
  }

  function bindMediaControls() {
    var list = document.getElementById('media-list');
    var input = document.getElementById('media');

    /* Listener dipasang satu kali saja: bindMediaControls dipanggil lagi
       dari initForm setelah pemeriksaan sesi selesai. */
    if (mediaControlsBound) return;

    mediaControlsBound = true;

    if (input) {
      input.addEventListener('change', function (event) {
        var files = Array.prototype.slice.call(event.target.files || []);

        /* Berkas baru disimpan sebagai entri state supaya thumbnail yang
           sudah dibuat saat pratinjau bisa dipakai lagi saat menyimpan. */
        state.newMedia = files.map(function (file) {
          return { file: file, posterBlob: null, posterUrl: '' };
        });

        renderPreview(files);
      });
    }

    if (!list) return;

    list.addEventListener('click', function (event) {
      var thumbnailButton = event.target.closest('[data-media-thumbnail]');

      if (thumbnailButton) {
        regenerateThumbnail(thumbnailButton.getAttribute('data-media-thumbnail'), thumbnailButton);
        return;
      }

      var button = event.target.closest('[data-media-move]');
      if (!button) return;

      var item = button.closest('[data-media-id]');
      if (!item) return;

      var direction = button.getAttribute('data-media-move') === 'up'
        ? 'previousElementSibling'
        : 'nextElementSibling';

      var sibling = item[direction];
      if (!sibling) return;

      if (direction === 'previousElementSibling') {
        list.insertBefore(item, sibling);
      } else {
        list.insertBefore(sibling, item);
      }
    });

    list.addEventListener('change', function (event) {
      var box = event.target.closest('[data-media-remove]');
      if (!box) return;

      var id = Number(box.getAttribute('data-media-remove'));

      if (box.checked) {
        if (state.removedMedia.indexOf(id) === -1) state.removedMedia.push(id);
      } else {
        state.removedMedia = state.removedMedia.filter(function (value) {
          return value !== id;
        });
      }
    });
  }

  function bindTranslate() {
    var button = document.getElementById('translate-article');
    if (!button) return;

    var status = document.getElementById('translate-status');

    button.addEventListener('click', function () {
      var title = document.getElementById('title_id').value.trim();
      var content = document.getElementById('content_id').value.trim();

      if (!title || !content) {
        status.textContent = 'Isi judul dan artikel bahasa Indonesia sebelum menerjemahkan.';
        status.className = 'mt-2 min-h-5 text-xs font-medium text-rose-700';
        return;
      }

      button.disabled = true;
      button.classList.add('cursor-wait', 'opacity-60');
      status.textContent = 'Sedang menerjemahkan…';
      status.className = 'mt-2 min-h-5 text-xs text-slate-500';

      var db = api.getClient();

      db.functions
        .invoke('translate', { body: { title_id: title, content_id: content } })
        .then(function (result) {
          var payload = result.data || {};

          if (!result.error && payload.title_en) {
            document.getElementById('title_en').value = payload.title_en;
            document.getElementById('content_en').value = payload.content_en || '';
            status.textContent = 'Terjemahan selesai. Silakan periksa kembali hasilnya sebelum menyimpan.';
            status.className = 'mt-2 min-h-5 text-xs font-medium text-emerald-700';
            return null;
          }

          /* supabase-js tidak mengurai body error: result.error.context adalah
             objek Response (status non-2xx), sedangkan result.data berisi JSON
             hanya kalau status 2xx. Body error perlu dibaca ulang supaya pesan
             server (mis. kuota habis) sampai ke admin. */
          var detail = result.error && result.error.context;
          var message = payload.message || '';

          if (message) return message;

          if (detail && typeof detail.json === 'function') {
            return detail
              .json()
              .then(function (body) {
                return (body && body.message) || '';
              })
              .catch(function () {
                return '';
              });
          }

          if (typeof detail === 'string') {
            try {
              var parsed = JSON.parse(detail);

              return (parsed && parsed.message) || '';
            } catch (error) {
              return '';
            }
          }

          if (detail && typeof detail.message === 'string') return detail.message;

          return '';
        })
        .then(function (serverMessage) {
          if (serverMessage === null) return;

          throw new Error(serverMessage || 'Terjemahan otomatis gagal. Isi terjemahan secara manual.');
        })
        .catch(function (error) {
          status.textContent = error.message || 'Terjadi kesalahan saat menerjemahkan.';
          status.className = 'mt-2 min-h-5 text-xs font-medium text-rose-700';
        })
        .finally(function () {
          button.disabled = false;
          button.classList.remove('cursor-wait', 'opacity-60');
        });
    });
  }

  /**
   * Unggah semua berkas baru beserta thumbnail video.
   *
   * Berkas diunggah lebih dulu supaya kegagalan unggah tidak meninggalkan
   * artikel yang tersimpan tanpa media. Kalau ada yang gagal, berkas yang
   * sudah terunggah dihapus kembali dan tidak ada artikel yang diubah.
   *
   * @param {File[]} files
   * @returns {Promise<Array>} daftar {path, type, mime, poster_path}
   */
  function prepareUploads(files) {
    var prefix = unitSlug(selectedUnitId() || (state.article && state.article.unit_id));
    var uploadedPaths = [];
    var results = [];

    function fail(error) {
      var cleanup = uploadedPaths.length
        ? api.removeFiles(uploadedPaths).catch(function () { return null; })
        : Promise.resolve(null);

      return cleanup.then(function () {
        throw error;
      });
    }

    if (!files.length) return Promise.resolve(results);

    return files.reduce(function (chain, file) {
      return chain.then(function () {
        var isVideo = String(file.type || '').toLowerCase().indexOf('video/') === 0;
        var entry = isVideo ? findMediaEntry(file) : null;

        return (isVideo ? makeThumbnail(entry) : Promise.resolve(null))
          .then(function (posterBlob) {
            var path = prefix + '/artikel/' + utils.randomPath(file.name.split('.').pop());

            return api.uploadFile(path, file, file.type || null)
              .then(function () {
                uploadedPaths.push(path);

                if (!posterBlob) return null;

                var posterPath = prefix + '/artikel/thumb-' + utils.randomPath('jpg');

                return api.uploadFile(posterPath, posterBlob, 'image/jpeg')
                  .then(function () {
                    uploadedPaths.push(posterPath);
                    return posterPath;
                  })
                  .catch(function () {
                    /* Thumbnail gagal diunggah: video tetap tersimpan dan
                       tampilan memakai gambar sampul lain sebagai pengganti. */
                    return null;
                  });
              })
              .then(function (posterPath) {
                results.push({
                  path: path,
                  type: isVideo ? 'video' : 'image',
                  mime: file.type || null,
                  poster_path: posterPath || null
                });
              });
          });
      });
    }, Promise.resolve())
      .then(function () {
        return results;
      })
      .catch(function (error) {
        return fail(error);
      });
  }

  function selectedTagIds() {
    return [].slice
      .call(document.querySelectorAll('#tag-list input[name="tags[]"]:checked'))
      .map(function (input) { return input.value; });
  }

  function saveArticle(event) {
    event.preventDefault();
    clearError();

    var titleId = document.getElementById('title_id').value.trim();
    var contentId = document.getElementById('content_id').value.trim();

    if (!titleId) {
      showError('Judul bahasa Indonesia wajib diisi.');
      return;
    }

    if (!contentId) {
      showError('Isi artikel bahasa Indonesia wajib diisi.');
      return;
    }

    if (titleId.length > 255) {
      showError('Judul maksimal 255 karakter.');
      return;
    }

    /* Validasi media: gambar maksimal 5 MB, video maksimal 25 MB, dan hanya
       format yang diizinkan (sama seperti aturan Laravel). */
    var mediaInput = document.getElementById('media');
    var mediaFiles = Array.prototype.slice.call((mediaInput && mediaInput.files) || []);
    var mediaError = null;

    for (var mediaIndex = 0; mediaIndex < mediaFiles.length; mediaIndex++) {
      var mediaFile = mediaFiles[mediaIndex];
      var mediaType = String(mediaFile.type || '').toLowerCase();
      var isVideo = mediaType.indexOf('video/') === 0;
      var allowed = isVideo
        ? ['video/mp4', 'video/webm']
        : ['image/jpeg', 'image/png', 'image/webp'];

      if (allowed.indexOf(mediaType) === -1) {
        mediaError = 'Format berkas "' + mediaFile.name + '" tidak diizinkan. Gunakan JPG, PNG, WEBP, MP4, atau WEBM.';
        break;
      }

      if (mediaFile.size > (isVideo ? 25 : 5) * 1024 * 1024) {
        mediaError = isVideo
          ? 'Ukuran video maksimal 25 MB.'
          : 'Ukuran gambar maksimal 5 MB.';
        break;
      }
    }

    if (mediaError) {
      showError(mediaError);
      return;
    }

    var status = document.getElementById('status').value;
    var categoryId = document.getElementById('category_id').value;

    /* Tanggal tayang sudah ada Once artikel pernah tayang: nilainya
       dipertahankan, sama seperti update() di ArticleAdminController. */
    var publishedAt = state.article ? state.article.published_at : null;

    if (status === 'published' && !publishedAt) {
      publishedAt = new Date().toISOString();
    }

    /* Nama penulis yang dikosongkan tidak menimpa nama yang sudah ada. */
    var authorName = document.getElementById('author_name').value.trim();

    if (!authorName) {
      authorName = (state.article && state.article.author_name) || 'Admin';
    }

    var payload = {
      title_id: titleId,
      title_en: document.getElementById('title_en').value.trim() || null,
      content_id: contentId,
      content_en: document.getElementById('content_en').value.trim() || null,
      category_id: categoryId ? Number(categoryId) : null,
      unit_id: selectedUnitId(),
      author_name: authorName,
      status: status === 'draft' ? 'draft' : 'published',
      published_at: publishedAt,
      updated_at: new Date().toISOString()
    };

    var db = api.getClient();
    var mediaInput = document.getElementById('media');
    var files = Array.prototype.slice.call((mediaInput && mediaInput.files) || []);
    var articleId = state.article ? state.article.id : null;

    if (!articleId) {
      payload.created_at = new Date().toISOString();
    }

    setBusy(true);

    var uploads = [];
    var articleSaved = false;

    function applyArticle(row) {
      var id = row.id;

      return syncTags(id)
        .then(function () { return syncMedia(id, uploads); })
        .then(function (media) {
          var oldImage = state.article ? state.article.image : null;

          /* Gambar lama yang belum punya baris media diubah menjadi baris
             media supaya tetap tampil di galeri (setara migrateLegacyCover
             di ArticleAdminController). */
          if (media.legacyImage) {
            return db.from('article_media')
              .insert({
                article_id: id,
                type: 'image',
                path: media.legacyImage,
                mime_type: null,
                caption: null,
                sort_order: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .then(function (result) {
                if (result.error) throw result.error;

                return db.from('articles')
                  .update({ image: media.legacyImage })
                  .eq('id', id);
              })
              .then(function () { return id; });
          }

          if (!media.coverPath) {
            /* Tidak ada media gambar. Gambar lama tetap dipakai, kecuali
               berkasnya ikut dihapus. */
            if (!oldImage || media.removedPaths.indexOf(oldImage) === -1) return id;

            /* Berkas sampul ikut terhapus, jadi kolom image dikosongkan. */
          }

          return db.from('articles').update({ image: media.coverPath || null }).eq('id', id)
            .then(function () {
              return id;
            });
        });
    }

    /* Berkas baru diunggah lebih dulu. Kalau unggah gagal, artikel tidak
       pernah disentuh dan berkas yang sudah terunggah dihapus kembali. */
    prepareUploads(files)
      .then(function (rows) {
        uploads = rows;

        /* author_id menyimpan pembuat artikel; hak edit ditentukan oleh unit
           pemilik artikel (RLS). */
        return window.NIAuth.currentUser().then(function (user) {
          if (!user) throw new Error('Sesi berakhir. Silakan login kembali.');

          if (!articleId || !state.article.author_id) {
            payload.author_id = user.id;
          }
          return user;
        });
      })
      .then(function () {
        return articleId
          ? db.from('articles').update(payload).eq('id', articleId).select('id').single()
          : db.from('articles').insert(payload).select('id').single();
      })
      .then(function (result) {
        if (result.error) throw result.error;

        articleSaved = true;

        return applyArticle(result.data);
      })
      .then(function (id) {
        window.location.href = 'articles.html?success=' + encodeURIComponent(
          articleId ? 'Artikel berhasil diperbarui!' : 'Artikel berhasil ditambahkan!'
        ) + '&id=' + id;
      })
      .catch(function (error) {
        /* Artikel belum tersimpan: berkas yang sudah terunggah dibersihkan
           supaya tidak ada berkas yatim di bucket Storage. */
        if (!articleSaved) {
          var paths = [];

          uploads.forEach(function (row) {
            if (row.path) paths.push(row.path);
            if (row.poster_path) paths.push(row.poster_path);
          });

          if (paths.length) api.removeFiles(paths).catch(function () { return null; });
        }

        showError(error.message || 'Artikel gagal disimpan.');
        setBusy(false);
      });
  }

  function syncTags(articleId) {
    var db = api.getClient();
    var ids = selectedTagIds();

    return db
      .from('article_tags')
      .delete()
      .eq('article_id', articleId)
      .then(function (result) {
        if (result.error) throw result.error;

        if (!ids.length) return null;

        var rows = ids.map(function (tagId) {
          return {
            article_id: articleId,
            tag_id: Number(tagId),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        });

        return db.from('article_tags').insert(rows);
      })
      .then(function (result) {
        if (result && result.error) throw result.error;
        return null;
      });
  }

  /**
   * Urutan media yang tersisa, mengikuti urutan DOM.
   * Tombol naik/turun memindahkan elemen DOM, jadi urutan simpan harus dibaca
   * dari DOM — bukan dari state.media yang urutannya tidak berubah.
   */
  function orderedMedia() {
    var list = document.getElementById('media-list');

    var kept = state.media.filter(function (item) {
      return state.removedMedia.indexOf(item.id) === -1;
    });

    if (!list) return kept;

    var byId = {};

    kept.forEach(function (item) {
      byId[String(item.id)] = item;
    });

    var ordered = [];

    [].slice.call(list.querySelectorAll('[data-media-id]')).forEach(function (node) {
      var id = String(node.getAttribute('data-media-id'));

      if (!byId[id]) return;

      ordered.push(byId[id]);
      delete byId[id];
    });

    Object.keys(byId).forEach(function (id) {
      ordered.push(byId[id]);
    });

    return ordered;
  }

  function syncMedia(articleId, uploads) {
    var db = api.getClient();
    var list = document.getElementById('media-list');
    var captionInputs = list ? list.querySelectorAll('[data-media-caption]') : [];
    var captions = {};

    [].slice.call(captionInputs).forEach(function (input) {
      captions[input.getAttribute('data-media-caption')] = input.value.trim();
    });

    // 1. Hapus baris media yang dicentang.
    var removals = state.removedMedia.slice();

    var removedPaths = state.media
      .filter(function (item) {
        return removals.indexOf(item.id) !== -1 && item.path;
      })
      .map(function (item) {
        return item.path;
      });

    /* Thumbnail video ikut dihapus supaya tidak ada berkas yatim. */
    state.media
      .filter(function (item) {
        return removals.indexOf(item.id) !== -1 && item.poster_path;
      })
      .forEach(function (item) {
        removedPaths.push(item.poster_path);
      });

    var removeStep = removals.length
      ? db.from('article_media').delete().eq('article_id', articleId).in('id', removals)
      : Promise.resolve({ error: null });

    return removeStep
      .then(function (result) {
        if (result.error) throw result.error;

        /* Berkas di bucket ikut dihapus, sama seperti perilaku Laravel. */
        if (!removedPaths.length) return null;

        var bucket = (window.SITE_CONFIG && window.SITE_CONFIG.storageBucket) || 'media';

        return db.storage.from(bucket).remove(removedPaths).then(function (storageResult) {
          if (storageResult.error) throw storageResult.error;
          return null;
        });
      })
      .then(function () {
        // 2. Perbarui keterangan + urutan media yang tersisa.
        var kept = orderedMedia();

        var order = 0;

        var updateStep = kept.reduce(function (chain, item) {
          return chain.then(function () {
            var caption = Object.prototype.hasOwnProperty.call(captions, String(item.id))
              ? captions[String(item.id)] || null
              : item.caption || null;

            var sortOrder = order;
            order += 1;

            return db
              .from('article_media')
              .update({
                caption: caption,
                sort_order: sortOrder,
                updated_at: new Date().toISOString()
              })
              .eq('id', item.id);
          });
        }, Promise.resolve());

        return updateStep.then(function () {
          /* Berkas baru sudah terunggah, jadi yang tersisa hanya membuat
             baris media-nya (lengkap dengan thumbnail video). */
          return uploads.reduce(function (chain, upload) {
            return chain.then(function () {
              var sortOrder = order;
              order += 1;

              return db
                .from('article_media')
                .insert({
                  article_id: articleId,
                  type: upload.type,
                  path: upload.path,
                  mime_type: upload.mime,
                  caption: null,
                  sort_order: sortOrder,
                  poster_path: upload.poster_path || null,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                })
                .then(function (result) {
                  if (result.error) throw result.error;
                  return upload.path;
                });
            });
          }, Promise.resolve(null));
        });
      })
      .then(function () {
        /* Kolom image adalah gambar sampul. Hanya media bertipe image yang
           boleh jadi sampul (video tidak boleh), seperti refreshCover() di
           ArticleAdminController. */
        var kept = orderedMedia();
        var images = kept.filter(function (item) {
          return item.type === 'image';
        });

        var oldImage = state.article ? state.article.image : null;
        var legacyMissing = !!(oldImage && !kept.some(function (item) {
          return item.path === oldImage;
        }));

        return {
          coverPath: images.length ? images[0].path : null,
          legacyImage: legacyMissing ? oldImage : null,
          removedPaths: removedPaths
        };
      });
  }

  function initForm() {
    var form = document.getElementById('article-form');
    if (!form) return;

    var params = new window.URLSearchParams(window.location.search);
    var id = params.get('id');

    var db = api.getClient();
    if (!db) return;

    bindTranslate();
    bindMediaControls();

    form.addEventListener('submit', saveArticle);

    Promise.all([
      db.from('categories').select('id, name, slug').order('name', { ascending: true }),
      db.from('tags').select('id, name, slug').order('name', { ascending: true }),
      db.from('units').select('id, name, slug').order('id', { ascending: true })
    ]).then(function (results) {
      if (results[0].error) throw results[0].error;
      if (results[1].error) throw results[1].error;
      if (results[2].error) throw results[2].error;

      state.categories = results[0].data || [];
      state.tags = results[1].data || [];
      state.units = results[2].data || [];

      if (!id) {
        fillCategories(null);
        fillTags([]);
        fillUnits(null);
        document.getElementById('author_name').value = 'Admin';
        document.getElementById('status').value = 'published';
        return null;
      }

      return db
        .from('articles')
        .select(
          'id, title_id, title_en, content_id, content_en, image, author_name, author_id, ' +
            'status, published_at, category_id, unit_id, created_at, updated_at, ' +
            'article_media(id, type, path, mime_type, caption, sort_order, poster_path), ' +
            'article_tags(id, tag_id, tags(id, name))'
        )
        .eq('id', id)
        .maybeSingle()
        .then(function (result) {
          if (result.error) throw result.error;
          if (!result.data) {
            admin.flash('Artikel tidak ditemukan.', 'error');
            return null;
          }

          state.article = result.data;

          document.getElementById('form-eyebrow').textContent = 'Perbarui konten';
          document.getElementById('form-title').textContent = 'Edit artikel';
          document.getElementById('form-subtitle').textContent =
            'Perbarui informasi dan isi artikel “' + state.article.title_id + '”.';
          document.getElementById('submit-article-label').textContent = 'Simpan perubahan';

          document.getElementById('title_id').value = state.article.title_id || '';
          document.getElementById('title_en').value = state.article.title_en || '';
          document.getElementById('content_id').value = state.article.content_id || '';
          document.getElementById('content_en').value = state.article.content_en || '';
          document.getElementById('author_name').value = state.article.author_name || 'Admin';
          document.getElementById('status').value = state.article.status || 'published';

          fillCategories(state.article.category_id);
          fillUnits(state.article.unit_id);

          var tagIds = (state.article.article_tags || []).map(function (row) {
            return String(row.tag_id);
          });

          fillTags(tagIds);

          state.media = (state.article.article_media || [])
            .slice()
            .sort(function (a, b) {
              return (a.sort_order || 0) - (b.sort_order || 0) || (a.id || 0) - (b.id || 0);
            })
            .map(function (item) {
              return {
                id: item.id,
                type: item.type,
                path: item.path,
                url: api.mediaUrl(item.path),
                mime: item.mime_type,
                caption: item.caption || '',
                sort_order: item.sort_order || 0,
                poster_path: item.poster_path || null,
                poster: item.poster_path ? api.mediaUrl(item.poster_path) : ''
              };
            });

          renderMedia();

          // Gambar lama yang belum punya baris media tetap ditampilkan.
          var legacy = document.getElementById('legacy-image');
          if (legacy && state.article.image && !state.media.length) {
            legacy.classList.remove('hidden');
            var img = legacy.querySelector('img');
            if (img) img.src = api.mediaUrl(state.article.image);
          }

          return null;
        });
    }).catch(function (error) {
      showError(error.message || 'Gagal memuat data artikel.');
    });
  }

  window.NIAdminArticles = {
    initList: initList,
    initForm: initForm
  };

  /* Listener berkas dan pratinjau dipasang begitu DOM siap, tanpa
     menunggu pemeriksaan sesi selesai. Kalau berkas dipilih lebih awal,
     pratinjau dan thumbnail video tetap terbentuk. */
  function bindMediaControlsEarly() {
    if (!document.getElementById('media')) return;

    bindMediaControls();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindMediaControlsEarly);
  } else {
    bindMediaControlsEarly();
  }
})(window, document);
