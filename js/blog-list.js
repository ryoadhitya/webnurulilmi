/* ==========================================================================
   DAFTAR ARTIKEL — YPI NURUL ILMI
   --------------------------------------------------------------------------
   Mengisi halaman Artikel (blog.html) dengan data dari Supabase:
     - pencarian judul
     - filter kategori dan tag
     - pagination

   Markup kartu memakai class yang sama dengan desain asli blog.html
   (blog-entry / block-20 / meta-date / block-27) agar tampilan tidak berubah.
   ========================================================================== */
(function (window, document) {
  'use strict';

  var api = window.NISupabase;
  var utils = window.NIUtils;

  /* Samakan dengan paginate(9) di PublicArticleController Laravel. */
  var PAGE_SIZE = 9;

  var state = {
    page: 1,
    pages: 1,
    search: '',
    category: '',
    tag: '',
    total: 0
  };

  function escapeHtml(value) {
    return utils ? utils.escapeHtml(value) : String(value == null ? '' : value);
  }

  /**
   * Tanggal SPLIT menjadi hari / bulan / tahun ala meta-date.
   *
   * memakai zona WIB (sama seperti utils.formatDateParts) supaya tanggal
   * yang tampil sama persis dengan tanggal publikasi yang dipilih admin
   * dan tidak bergeser satu hari.
   */
  function dateParts(value) {
    if (!value) return { day: '', month: '', year: '' };

    if (utils && utils.formatDateParts) return utils.formatDateParts(value);

    var date = new Date(value);
    if (isNaN(date.getTime())) return { day: '', month: '', year: '' };

    var options = { timeZone: 'Asia/Jakarta' };

    return {
      day: new Intl.DateTimeFormat('id-ID', Object.assign({ day: '2-digit' }, options)).format(date),
      month: new Intl.DateTimeFormat('id-ID', Object.assign({ month: 'short' }, options)).format(date),
      year: new Intl.DateTimeFormat('id-ID', Object.assign({ year: 'numeric' }, options)).format(date)
    };
  }

  function commentCount(article) {
    var rows = article.comments || [];
    return rows.length ? Number(rows[0].count || 0) : 0;
  }

  /** Nama kategori + tag artikel, ditampilkan di kartu. */
  function metaLine(article) {
    var parts = [];

    var category = article.categories ? article.categories.name : '';
    if (category) parts.push(escapeHtml(category));

    var tags = (article.article_tags || [])
      .map(function (row) { return row.tags; })
      .filter(Boolean);

    tags.forEach(function (tag) {
      parts.push('#' + escapeHtml(tag.name));
    });

    if (!parts.length) return '';

    return '<p class="article-card-meta">' + parts.join(' &middot; ') + '</p>';
  }

  /** Satu kartu artikel, sama seperti markup blog.html asli. */
  function cardHtml(article) {
    var url = api.articleUrl(article.id);
    var cover = api.articleCover(article) || 'images/image_1.jpg';
    var date = dateParts(article.published_at);
    var title = article.title_id || article.title_en || '';
    var excerpt = utils ? utils.limit(article.content_id || article.content_en || '', 140) : '';

    return [
      '<div class="col-md-6 col-lg-4 ftco-animate">',
      '  <div class="blog-entry">',
      '    <a href="' + escapeHtml(url) + '" class="block-20 d-flex align-items-end" style="background-image: url(\'' + escapeHtml(cover) + '\');">',
      '      <div class="meta-date text-center p-2">',
      '        <span class="day">' + escapeHtml(date.day) + '</span>',
      '        <span class="mos">' + escapeHtml(date.month) + '</span>',
      '        <span class="yr">' + escapeHtml(date.year) + '</span>',
      '      </div>',
      '    </a>',
      '    <div class="text bg-white p-4">',
      '      <h3 class="heading"><a href="' + escapeHtml(url) + '">' + escapeHtml(title) + '</a></h3>',
      metaLine(article),
      '      <p>' + escapeHtml(excerpt) + '</p>',
      '      <div class="d-flex align-items-center mt-4">',
      '        <p class="mb-0"><a href="' + escapeHtml(url) + '" class="btn btn-secondary">Selengkapnya <span class="fas fa-arrow-right"></span></a></p>',
      '        <p class="ml-auto mb-0">',
      '          <a href="#" class="mr-2"><span class="fas fa-user"></span> ' + escapeHtml(article.author_name || 'Admin') + '</a>',
      '          <a href="' + escapeHtml(url) + '#komentar" class="meta-chat"><span class="fas fa-comment"></span> ' + commentCount(article) + '</a>',
      '        </p>',
      '      </div>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('\n');
  }

  /**
   * Tampilkan kartu artikel.
   *
   * Satu artikel yang gagal dirender tidak boleh membuat seluruh halaman
   * kosong, jadi setiap kartu dibungkus try/catch.
   */
  function renderCards(container, articles) {
    var html = '';
    var failed = 0;

    articles.forEach(function (article) {
      try {
        html += cardHtml(article);
      } catch (error) {
        failed += 1;
      }
    });

    if (!html) {
      renderState(container, 'kosong');
      return;
    }

    container.innerHTML = html;

    revealCards(container);

    if (failed) {
      console.warn('Sebagian kartu artikel tidak dapat dirender: ' + failed);
    }
  }

  /**
   * Tampilkan animasi masuk untuk kartu yang baru disisipkan.
   *
   * Elemen `.ftco-animate` disembunyikan CSS (opacity 0, visibility hidden)
   * sampai kelas `fadeInUp ftco-animated` ditambahkan. Mekanisme waypoint
   * milik situs hanya terpasang pada elemen yang sudah ada saat halaman
   * dimuat, jadi kartu dari database perlu dikenai sendiri supaya tidak
   * tetap tersembunyi.
   */
  function revealCards(container) {
    var nodes = container.querySelectorAll('.ftco-animate');

    if (!nodes.length) return;

    var jq = window.jQuery;

    function show(node) {
      node.classList.add('fadeInUp', 'ftco-animated');
    }

    if (!jq || !jq.fn || !jq.fn.waypoint) {
      Array.prototype.forEach.call(nodes, show);
      return;
    }

    jq(nodes).waypoint(function (direction) {
      var el = jq(this.element);

      /* addClass jQuery menerima satu nama kelas (dipisah spasi). */
      if (direction === 'down' && !el.hasClass('ftco-animated')) {
        el.addClass('fadeInUp ftco-animated');
      }
    }, { offset: '95%' });

    /* Kartu yang sudah terlewat di atas layar (arah 'up') langsung tampil. */
    window.setTimeout(function () {
      Array.prototype.forEach.call(
        container.querySelectorAll('.ftco-animate:not(.ftco-animated)'),
        function (node) {
          if (node.getBoundingClientRect().bottom < 0) show(node);
        }
      );
    }, 1200);
  }

  /**
   * Pesan keadaan halaman: belum ada artikel, tidak ada hasil filter, atau
   * gagal memuat dari server.
   */
  function renderState(container, type) {
    var title = '';
    var message = '';
    var extra = '';

    if (type === 'gagal') {
      title = 'Artikel belum dapat dimuat';
      message = 'Tidak dapat terhubung ke server. Periksa koneksi lalu muat ulang.';
      extra = '<p class="mb-0"><button type="button" class="btn btn-secondary btn-sm" data-article-retry>Muat ulang</button></p>';
    } else if (type === 'filter' && hasActiveFilter()) {
      title = 'Artikel tidak ditemukan';
      message = 'Tidak ada artikel yang cocok dengan pencarian atau filter yang dipilih.';
      extra = '<p class="mb-0"><a href="blog.html" class="btn btn-secondary btn-sm">Hapus semua filter</a></p>';
    } else {
      title = 'Belum ada artikel';
      message = 'Artikel yang dipublikasikan akan tampil di halaman ini.';
    }

    container.innerHTML = [
      '<div class="col-12 py-5 text-center">',
      '  <h3>' + title + '</h3>',
      '  <p>' + message + '</p>',
      extra,
      '</div>'
    ].join('\n');
  }

  /** True bila pencarian atau filter sedang aktif. */
  function hasActiveFilter() {
    return Boolean(state.search || state.category || state.tag);
  }

  function renderPagination(container) {
    if (!container) return;

    if (state.pages <= 1) {
      container.innerHTML = '';
      return;
    }

    var items = [];

    function item(page, label, options) {
      options = options || {};

      if (options.active) {
        return '<li class="active"><span>' + label + '</span></li>';
      }

      return '<li><a href="#" data-page="' + page + '">' + label + '</a></li>';
    }

    items.push(state.page > 1
      ? item(state.page - 1, '<i class="fas fa-chevron-left"></i>')
      : '<li class="disabled"><span><i class="fas fa-chevron-left"></i></span></li>');

    var start = Math.max(1, state.page - 2);
    var end = Math.min(state.pages, start + 4);
    start = Math.max(1, end - 4);

    for (var i = start; i <= end; i++) {
      items.push(item(i, String(i), { active: i === state.page }));
    }

    items.push(state.page < state.pages
      ? item(state.page + 1, '<i class="fas fa-chevron-right"></i>')
      : '<li class="disabled"><span><i class="fas fa-chevron-right"></i></span></li>');

    container.innerHTML = [
      '<div class="row no-gutters my-5">',
      '  <div class="col text-center">',
      '    <div class="block-27">',
      '      <ul>' + items.join('') + '</ul>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('\n');
  }

  function load() {
    var container = document.getElementById('article-list');
    if (!container) return;

    if (!api || !api.isConfigured()) {
      renderState(container, 'gagal');
      return;
    }

    var options = {
      limit: PAGE_SIZE,
      offset: (state.page - 1) * PAGE_SIZE,
      search: state.search || null,
      categoryId: state.category || null,
      tagId: state.tag || null
    };

    api.fetchPublishedArticles(options)
      .then(function (result) {
        state.total = result.count || 0;
        state.pages = Math.max(1, Math.ceil(state.total / PAGE_SIZE));

        if (state.page > state.pages) {
          state.page = state.pages;
          return load();
        }

        if (!result.rows.length) {
          renderState(container, hasActiveFilter() ? 'filter' : 'kosong');
        } else {
          renderCards(container, result.rows);
        }

        renderPagination(document.getElementById('article-pagination'));
      })
      .catch(function (error) {
        console.warn('Gagal memuat daftar artikel: ' + (error && error.message ? error.message : 'tidak diketahui'));

        renderState(container, 'gagal');
      });
  }

  function fillFilters() {
    var categorySelect = document.getElementById('article-category');
    var tagSelect = document.getElementById('article-tag');

    if (!api || !api.isConfigured()) return Promise.resolve();

    var categories = api.fetchCategories().catch(function () { return []; });
    var tags = api.fetchTags().catch(function () { return []; });

    categories.then(function (rows) {
      if (!categorySelect) return;

      rows.forEach(function (row) {
        var option = document.createElement('option');
        option.value = String(row.id);
        option.textContent = row.name;
        categorySelect.appendChild(option);
      });
    });

    tags.then(function (rows) {
      if (!tagSelect) return;

      rows.forEach(function (row) {
        var option = document.createElement('option');
        option.value = String(row.id);
        option.textContent = row.name;
        tagSelect.appendChild(option);
      });
    });

    return Promise.all([categories, tags]).then(function (lists) {
      applyUrlFilters(lists[0], lists[1]);
    });
  }

  /** Terapkan ?kategori=<slug> dan ?tag=<slug> ke filter aktif. */
  function applyUrlFilters(categories, tags) {
    var params = new window.URLSearchParams(window.location.search);
    var categorySlug = params.get('kategori');
    var tagSlug = params.get('tag');
    var query = params.get('q');

    if (query) {
      state.search = query;

      var search = document.getElementById('article-search');
      if (search) search.value = query;
    }

    if (categorySlug) {
      var category = (categories || []).find(function (row) {
        return row.slug === categorySlug;
      });

      if (category) {
        state.category = String(category.id);

        var select = document.getElementById('article-category');
        if (select) select.value = state.category;
      }
    }

    if (tagSlug) {
      var tag = (tags || []).find(function (row) {
        return row.slug === tagSlug;
      });

      if (tag) {
        state.tag = String(tag.id);

        var select = document.getElementById('article-tag');
        if (select) select.value = state.tag;
      }
    }
  }

  function bindEvents() {
    var search = document.getElementById('article-search');
    var category = document.getElementById('article-category');
    var tag = document.getElementById('article-tag');
    var pagination = document.getElementById('article-pagination');
    var list = document.getElementById('article-list');

    if (search) {
      search.addEventListener('input', utils ? utils.debounce(function () {
        state.search = search.value.trim();
        state.page = 1;
        load();
      }, 350) : function () {});
    }

    if (category) {
      category.addEventListener('change', function () {
        state.category = category.value;
        state.page = 1;
        load();
      });
    }

    if (tag) {
      tag.addEventListener('change', function () {
        state.tag = tag.value;
        state.page = 1;
        load();
      });
    }

    if (pagination) {
      pagination.addEventListener('click', function (event) {
        var link = event.target.closest('[data-page]');
        if (!link) return;

        event.preventDefault();

        state.page = Number(link.getAttribute('data-page')) || 1;
        load();
      });
    }

    /* Tombol "Muat ulang" pada pesan gagal memuat. */
    if (list) {
      list.addEventListener('click', function (event) {
        if (!event.target.closest('[data-article-retry]')) return;

        load();
      });
    }
  }

  function initList() {
    bindEvents();

    fillFilters().then(function () {
      load();
    });
  }

  window.NIArticles = {
    initList: initList,
    cardHtml: cardHtml,
    dateParts: dateParts
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initList);
  } else {
    initList();
  }
})(window, document);
