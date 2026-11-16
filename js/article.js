/* ==========================================================================
   HALAMAN ARTIKEL — YPI NURUL ILMI
   --------------------------------------------------------------------------
   article.html?id=<id>

   Memuat artikel dari Supabase: isi, media/gambar, tag, kategori, jumlah
   pembaca, komentar yang sudah tayang, dan artikel terkait.

   Komentar baru dikirim lewat RPC submit_comment() dan masuk dengan status
   'pending', jadi hanya tayang setelah dimoderasi di dashboard admin.

   Sumber data: js/supabase.js (window.NISupabase).
   ========================================================================== */
(function (window, document) {
  'use strict';

  var api = window.NISupabase;
  var utils = window.NIUtils;

  var state = {
    article: null,
    comments: []
  };

  function byId(id) {
    return document.getElementById(id);
  }

  function escapeHtml(value) {
    return utils ? utils.escapeHtml(value) : String(value == null ? '' : value);
  }

  function articleId() {
    var params = new window.URLSearchParams(window.location.search);
    var id = Number(params.get('id'));

    return isFinite(id) && id > 0 ? id : null;
  }

  function commentCount(article) {
    var rows = article.comments || [];
    return rows.length ? Number(rows[0].count || 0) : 0;
  }

  /* ------------------------------------------------------------------ */
  /*  Isi artikel                                                       */
  /* ------------------------------------------------------------------ */

  /* ------------------------------------------------------------------ */
  /*  Galeri media                                                        */
  /* ------------------------------------------------------------------ */

  var lightbox = null;

  /** Satu sel galeri: foto atau video, sesuai urutan simpan. */
  function galleryItemHtml(article, item, index) {
    var caption = item.caption
      ? '<figcaption class="article-gallery-caption">' + escapeHtml(item.caption) + '</figcaption>'
      : '';

    if (item.type === 'video') {
      return [
        '<figure class="article-gallery-item article-gallery-video" data-index="' + index + '">',
        '  <video src="' + escapeHtml(item.url) + '"' +
          (item.poster ? ' poster="' + escapeHtml(item.poster) + '"' : '') +
          ' class="article-gallery-media" controls preload="metadata" playsinline></video>',
        '  <span class="article-gallery-badge">Video</span>',
        caption,
        '</figure>'
      ].join('\n');
    }

    return [
      '<figure class="article-gallery-item" data-index="' + index + '">',
      '  <img src="' + escapeHtml(item.url) + '" alt="' +
        escapeHtml(item.caption || article.title_id || '') +
        '" class="article-gallery-media" loading="lazy">',
      caption,
      '</figure>'
    ].join('\n');
  }

  /**
   * Galeri menyesuaikan diri dengan jumlah media:
   * 1 foto  -> satu kolom, tidak mendominasi
   * 2 foto  -> dua kolom
   * 3 foto  -> tiga kolom seimbang
   * 4+      -> grid tiga kolom (dua kolom di tablet, satu di ponsel)
   */
  function renderMedia(article) {
    var container = byId('article-media');
    if (!container) return;

    var media = api.articleMedia(article);

    if (!media.length) {
      container.innerHTML = '';
      return;
    }

    var count = media.length;
    var layout = count === 1 ? '1' : count === 2 ? '2' : count === 3 ? '3' : '4';

    container.innerHTML = [
      '<div class="article-gallery article-gallery--' + layout + '" data-count="' + count + '">',
      media.map(function (item, index) {
        return galleryItemHtml(article, item, index);
      }).join('\n'),
      '</div>'
    ].join('\n');

    bindGallery(container, media);
  }

  /** Klik sel galeri membuka tampilan lebih besar. */
  function bindGallery(container, media) {
    var grid = container.querySelector('.article-gallery');
    if (!grid) return;

    grid.addEventListener('click', function (event) {
      /* Tombol pemutar video dikecualikan — video tetap diputar di tempat. */
      if (event.target.closest('video, button, a')) return;

      var item = event.target.closest('[data-index]');
      if (!item) return;

      openLightbox(media, Number(item.getAttribute('data-index')));
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Lightbox                                                            */
  /* ------------------------------------------------------------------ */

  function lightboxHtml() {
    return [
      '<div class="ni-lightbox" role="dialog" aria-modal="true" aria-label="Pratinjau media">',
      '  <button type="button" class="ni-lightbox-close" aria-label="Tutup">&times;</button>',
      '  <button type="button" class="ni-lightbox-prev" aria-label="Sebelumnya">&#8249;</button>',
      '  <button type="button" class="ni-lightbox-next" aria-label="Berikutnya">&#8250;</button>',
      '  <div class="ni-lightbox-stage"></div>',
      '  <p class="ni-lightbox-caption"></p>',
      '</div>'
    ].join('\n');
  }

  function openLightbox(media, index) {
    if (!lightbox) {
      var host = document.createElement('div');
      host.innerHTML = lightboxHtml();

      lightbox = host.firstChild;
      document.body.appendChild(lightbox);
      document.body.classList.add('ni-lightbox-open');

      lightbox.addEventListener('click', function (event) {
        if (event.target === lightbox) closeLightbox();

        if (event.target.closest('.ni-lightbox-close')) closeLightbox();
        if (event.target.closest('.ni-lightbox-prev')) stepLightbox(-1);
        if (event.target.closest('.ni-lightbox-next')) stepLightbox(1);
      });

      document.addEventListener('keydown', function (event) {
        if (!lightbox) return;

        if (event.key === 'Escape') closeLightbox();
        if (event.key === 'ArrowLeft') stepLightbox(-1);
        if (event.key === 'ArrowRight') stepLightbox(1);
      });
    }

    lightbox.dataset.media = JSON.stringify(media);
    lightbox.dataset.index = String(index);

    showLightboxItem();
  }

  function showLightboxItem() {
    if (!lightbox) return;

    var media = [];

    try {
      media = JSON.parse(lightbox.dataset.media || '[]');
    } catch (error) {
      media = [];
    }

    var index = Number(lightbox.dataset.index || 0);

    if (!media.length) return;

    if (index < 0) index = media.length - 1;
    if (index >= media.length) index = 0;

    lightbox.dataset.index = String(index);

    var item = media[index];
    var stage = lightbox.querySelector('.ni-lightbox-stage');
    var caption = lightbox.querySelector('.ni-lightbox-caption');

    if (item.type === 'video') {
      stage.innerHTML = '<video src="' + escapeHtml(item.url) + '"' +
        (item.poster ? ' poster="' + escapeHtml(item.poster) + '"' : '') +
        ' class="ni-lightbox-media" controls autoplay playsinline></video>';
    } else {
      stage.innerHTML = '<img src="' + escapeHtml(item.url) + '" alt="' +
        escapeHtml(item.caption || '') + '" class="ni-lightbox-media">';
    }

    caption.textContent = (item.caption || '') +
      (media.length > 1 ? '  (' + (index + 1) + ' dari ' + media.length + ')' : '');

    var single = media.length < 2;

    lightbox.querySelector('.ni-lightbox-prev').hidden = single;
    lightbox.querySelector('.ni-lightbox-next').hidden = single;
  }

  function stepLightbox(direction) {
    if (!lightbox) return;

    var index = Number(lightbox.dataset.index || 0) + direction;

    lightbox.dataset.index = String(index);

    showLightboxItem();
  }

  function closeLightbox() {
    if (!lightbox) return;

    lightbox.remove();
    lightbox = null;

    document.body.classList.remove('ni-lightbox-open');
  }

  function renderMeta(article) {
    var container = byId('article-meta');
    if (!container) return;

    var category = api.articleCategory(article);
    var parts = [];

    parts.push('<div><a href="blog.html"><span class="far fa-calendar"></span> ' +
      escapeHtml(utils.formatDate(article.published_at)) + '</a></div>');

    parts.push('<div><a href="#"><span class="fas fa-user"></span> ' +
      escapeHtml(article.author_name || 'Admin') + '</a></div>');

    parts.push('<div><span class="fas fa-comment"></span> ' + commentCount(article) + '</div>');

    parts.push('<div><span class="fas fa-eye"></span> ' + utils.formatNumber(article.views || 0) + '</div>');

    if (category) {
      parts.push('<div><span class="fas fa-folder-open"></span> ' + escapeHtml(category) + '</div>');
    }

    container.innerHTML = parts.join('');
  }

  function renderTags(article) {
    var wrapper = byId('article-tags');
    var list = byId('article-tags-list');
    if (!wrapper || !list) return;

    var tags = api.articleTags(article);

    if (!tags.length) {
      wrapper.hidden = true;
      return;
    }

    list.innerHTML = tags.map(function (tag) {
      return '<a href="blog.html?tag=' + encodeURIComponent(tag.slug) +
        '" class="tag-cloud-link">' + escapeHtml(tag.name) + '</a>';
    }).join('');

    wrapper.hidden = false;
  }

  function renderAuthor(article) {
    var box = byId('article-author');
    var name = byId('article-author-name');
    var bio = byId('article-author-bio');
    if (!box || !name || !bio) return;

    name.textContent = article.author_name || 'Admin YPI Nurul Ilmi';

    var category = api.articleCategory(article);
    bio.textContent = category
      ? 'Penulis di YPI Nurul Ilmi Bekasi. Kategori artikel: ' + category + '.'
      : 'Penulis di YPI Nurul Ilmi Bekasi.';

    box.hidden = false;
  }

  /** Tampilkan isi artikel sebagai teks biasa (tidak boleh jadi HTML). */
  function setTextContent(target, value) {
    if (!target) return;

    target.textContent = value || '';
    target.style.fontSize = '17px';
    target.style.lineHeight = '1.9';
    target.style.whiteSpace = 'pre-line';
  }

  function renderArticle(article) {
    document.title = (article.title_id || article.title_en || 'Artikel') + ' - YPI Nurul Ilmi Bekasi';

    byId('article-breadcrumb').textContent = article.title_id || article.title_en || 'Artikel';
    byId('article-title').textContent = article.title_id || article.title_en || '';

    renderMeta(article);
    renderMedia(article);
    renderTags(article);
    renderAuthor(article);

    var text = article.content_id || article.content_en || '';

    setTextContent(byId('article-content'), text || 'Konten artikel belum tersedia.');

    var description = document.querySelector('meta[name="description"]');

    if (description) {
      description.setAttribute('content', text.replace(/<[^>]*>/g, '').slice(0, 155));
    }

    /* Versi bahasa Inggris, sama seperti di halaman Blade lama. */
    var english = byId('article-english');

    if (english && (article.title_en || article.content_en)) {
      byId('article-english-title').textContent = article.title_en || '';
      setTextContent(byId('article-english-content'), article.content_en || '');
      english.hidden = false;
    }
  }

  function renderNotFound() {
    byId('article-title').textContent = 'Artikel tidak ditemukan';
    byId('article-content').innerHTML =
      '<p>Artikel yang Anda cari tidak tersedia atau belum dipublikasikan.</p>' +
      '<p><a href="blog.html" class="btn btn-secondary">Kembali ke daftar artikel</a></p>';
  }

  /* ------------------------------------------------------------------ */
  /*  Komentar                                                           */
  /* ------------------------------------------------------------------ */

  function renderComments(comments) {
    var list = byId('comment-list');
    var empty = byId('comment-empty');
    var counter = byId('comment-count');
    if (!list) return;

    list.innerHTML = comments.map(function (comment) {
      return [
        '<li class="comment">',
        '  <div class="comment-body">',
        '    <h3>' + escapeHtml(comment.name || 'Anonim') + '</h3>',
        '    <div class="meta mb-2">' + escapeHtml(utils.formatDateTime(comment.created_at)) + '</div>',
        '    <p>' + escapeHtml(comment.comment) + '</p>',
        '  </div>',
        '</li>'
      ].join('\n');
    }).join('\n');

    if (empty) empty.hidden = comments.length > 0;
    if (counter) counter.textContent = String(comments.length);
  }

  function loadComments(id) {
    return api.fetchPublishedComments(id)
      .then(function (rows) {
        state.comments = rows;
        renderComments(rows);
      })
      .catch(function () {
        renderComments([]);
      });
  }

  function showCommentAlert(message, type) {
    var box = byId('comment-alert');
    if (!box) return;

    if (!message) {
      box.innerHTML = '';
      return;
    }

    box.innerHTML = '<div class="alert ' + (type === 'error' ? 'alert-danger' : 'alert-success') +
      '" role="alert">' + escapeHtml(message) + '</div>';
  }

  function bindCommentForm(id) {
    var form = byId('comment-form');
    var submit = byId('comment-submit');
    if (!form) return;

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var name = byId('comment-name').value.trim();
      var email = byId('comment-email').value.trim();
      var message = byId('comment-message').value.trim();
      var honeypot = byId('comment-hp').value;

      if (!name || !email || !message) {
        showCommentAlert('Nama, email, dan pesan wajib diisi.', 'error');
        return;
      }

      /* Validasi yang sama dengan aturan di server (RPC submit_comment),
         supaya pengunjung tahu kesalahan sebelum dikirim. */
      if (name.length < 2) {
        showCommentAlert('Nama minimal 2 karakter.', 'error');
        return;
      }

      if (name.length > 100) {
        showCommentAlert('Nama maksimal 100 karakter.', 'error');
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showCommentAlert('Format email belum benar.', 'error');
        return;
      }

      if (message.length < 3) {
        showCommentAlert('Komentar minimal 3 karakter.', 'error');
        return;
      }

      if (message.length > 2000) {
        showCommentAlert('Komentar maksimal 2000 karakter.', 'error');
        return;
      }

      if (submit) submit.disabled = true;
      showCommentAlert('Mengirim komentar...');

      api.submitComment(id, { name: name, email: email, comment: message, hp: honeypot })
        .then(function (result) {
          if (submit) submit.disabled = false;

          byId('comment-message').value = '';

          // RPC mengembalikan id komentar, atau -1 bila honeypot terisi.
          if (result === -1) {
            showCommentAlert('Komentar berhasil dikirim.', 'success');
            return;
          }

          /* Daftar komentar dimuat ulang dari server supaya jumlah dan isi
             komentar ikut terbaru tanpa perlu refresh halaman manual. */
          loadComments(id);

          showCommentAlert(
            'Terima kasih! Komentar Anda sudah masuk dan sedang dimoderasi. Komentar akan tampil di sini setelah disetujui admin.',
            'success'
          );
        })
        .catch(function (error) {
          if (submit) submit.disabled = false;
          showCommentAlert('Komentar gagal dikirim: ' + (error && error.message ? error.message : 'terjadi kesalahan'), 'error');
        });
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Sidebar                                                            */
  /* ------------------------------------------------------------------ */

  function renderSidebarCategories(categories) {
    var list = byId('sidebar-categories');
    if (!list) return;

    if (!categories.length) {
      list.innerHTML = '<li>Belum ada kategori</li>';
      return;
    }

    list.innerHTML = categories.map(function (category) {
      return '<li><a href="blog.html?kategori=' + encodeURIComponent(category.slug) + '">' +
        escapeHtml(category.name) + '</a></li>';
    }).join('');
  }

  function renderSidebarLatest(articles) {
    var container = byId('sidebar-latest');
    if (!container) return;

    if (!articles.length) {
      container.innerHTML = '<p>Belum ada artikel.</p>';
      return;
    }

    container.innerHTML = articles.map(function (article) {
      var url = api.articleUrl(article.id);
      var cover = api.articleCover(article) || 'images/image_1.jpg';

      return [
        '<div class="block-21 mb-4 d-flex">',
        '  <a class="blog-img mr-4" style="background-image: url(\'' + escapeHtml(cover) + '\');" href="' + escapeHtml(url) + '"></a>',
        '  <div class="text">',
        '    <h3 class="heading"><a href="' + escapeHtml(url) + '">' +
          escapeHtml(article.title_id || article.title_en || '') + '</a></h3>',
        '    <div class="meta">',
        '      <div><a href="' + escapeHtml(url) + '"><span class="far fa-calendar"></span> ' +
          escapeHtml(utils.formatDate(article.published_at)) + '</a></div>',
        '      <div><a href="' + escapeHtml(url) + '"><span class="fas fa-user"></span> ' +
          escapeHtml(article.author_name || 'Admin') + '</a></div>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('\n');
    }).join('\n');
  }

  function renderSidebarTags(tags) {
    var list = byId('sidebar-tags');
    if (!list) return;

    if (!tags.length) {
      list.innerHTML = '';
      return;
    }

    list.innerHTML = tags.map(function (tag) {
      return '<a href="blog.html?tag=' + encodeURIComponent(tag.slug) +
        '" class="tag-cloud-link">' + escapeHtml(tag.name) + '</a>';
    }).join('');
  }

  function loadSidebar(current) {
    api.fetchCategories()
      .then(renderSidebarCategories)
      .catch(function () {});

    api.fetchTags()
      .then(renderSidebarTags)
      .catch(function () {});

    /* Ambil satu tambahan karena artikel ini sendiri disaring keluar. */
    api.fetchPublishedArticles({ limit: 4 })
      .then(function (result) {
        renderSidebarLatest(result.rows.filter(function (row) {
          return !current || row.id !== current.id;
        }).slice(0, 3));
      })
      .catch(function () {});
  }

  /* ------------------------------------------------------------------ */
  /*  Artikel terkait                                                    */
  /* ------------------------------------------------------------------ */

  function loadRelated(article) {
    if (!article.category_id) return;

    api.fetchPublishedArticles({ limit: 4, categoryId: article.category_id })
      .then(function (result) {
        var rows = result.rows.filter(function (row) {
          return row.id !== article.id;
        });

        if (!rows.length) return;

        var container = byId('article-related');
        if (!container) return;

        container.innerHTML = [
          '<h3 class="mb-4 h5 font-weight-bold">Artikel Terkait</h3>',
          '<div class="row">',
          rows.map(function (row) {
            var url = api.articleUrl(row.id);

            return [
              '<div class="col-md-4">',
              '  <div class="blog-entry">',
              '    <a href="' + escapeHtml(url) + '" class="block-20 d-flex align-items-end" style="background-image: url(\'' +
                escapeHtml(api.articleCover(row) || 'images/image_1.jpg') + '\');"></a>',
              '    <div class="text bg-white p-3">',
              '      <h4 class="heading h5"><a href="' + escapeHtml(url) + '">' +
                escapeHtml(row.title_id || row.title_en || '') + '</a></h4>',
              '      <p class="mb-0 small text-muted">' + escapeHtml(utils.formatDate(row.published_at)) + '</p>',
              '    </div>',
              '  </div>',
              '</div>'
            ].join('\n');
          }).join('\n'),
          '</div>'
        ].join('\n');

        container.hidden = false;
      })
      .catch(function () {});
  }

  /* ------------------------------------------------------------------ */
  /*  Boot                                                               */
  /* ------------------------------------------------------------------ */

  function boot() {
    var id = articleId();

    if (!id) {
      renderNotFound();
      return;
    }

    if (!api || !api.isConfigured()) {
      renderNotFound();
      return;
    }

    api.fetchArticle(id)
      .then(function (article) {
        if (!article) {
          renderNotFound();
          return;
        }

        state.article = article;

        renderArticle(article);
        loadComments(id);
        bindCommentForm(id);
        loadSidebar(article);
        loadRelated(article);

        api.incrementViews(id);
      })
      .catch(function () {
        renderNotFound();
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window, document);
