/* ==========================================================================
   HALAMAN ARTIKEL — YPI NURUL ILMI
   --------------------------------------------------------------------------
   article.html?id=<id>

   Memuat artikel dari Supabase: isi, media/gambar, tag, kategori, jumlah
   pembaca, komentar yang sudah tayang, dan artikel terkait.

   Pengunjung juga bisa menerjemahkan artikel ke bahasa Inggris lewat
   Edge Function publik "translate-public"; naskah asli disimpan supaya
   kembali ke bahasa Indonesia tidak mengubah isi artikel.

   Interaksi pengunjung:
     - Like artikel (RPC toggle_article_like), status_like bertahan saat
       halaman dimuat ulang karena identitas anonim disimpan di localStorage.
     - Bagikan artikel (Web Share API, atau salin tautan sebagai cadangan).
     - Komentar baru dikirim lewat RPC submit_comment() dan langsung tayang
       (status 'published'), jadi pengunjung melihat komentarnya sendiri
       tanpa perlu refresh halaman. Admin tetap bisa menandai spam lewat
       dashboard.

   Sumber data: js/supabase.js (window.NISupabase).
   ========================================================================== */
(function (window, document) {
  'use strict';

  var api = window.NISupabase;
  var utils = window.NIUtils;

  var state = {
    article: null,
    comments: [],
    commentLikes: {},
    replyTo: null,
    like: { liked: false, count: 0 },
    lang: 'id',
    translation: null,
    busy: false
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
   * Gambar utama artikel (media gambar pertama). Gambar ini ditampilkan
   * besar di atas isi artikel, proporsional dan tidak gepeng.
   *
   * Kalau artikel tidak punya gambar sama sekali, gambarnya tidak
   * dihilangkan begitu saja: dipakai sampul lain (misalnya thumbnail
   * video), dan kalau benar-benar tidak ada, tampil plakat YPI Nurul Ilmi
   * supaya halaman tidak terlihat kosong.
   */
  function renderFeatured(article, media) {
    var figure = byId('article-featured');
    if (!figure) return;

    var featured = null;
    var featuredIndex = -1;

    for (var i = 0; i < media.length; i++) {
      if (media[i].type === 'image') {
        featured = media[i];
        featuredIndex = i;
        break;
      }
    }

    if (!featured) {
      var cover = api.articleCover(article);

      if (cover) {
        figure.innerHTML = [
          '<div class="article-featured-media">',
          '  <img src="' + escapeHtml(cover) + '" alt="' +
            escapeHtml(article.title_id || 'Gambar utama artikel') +
            '" class="article-featured-image">',
          '</div>'
        ].join('\n');

        figure.hidden = false;
        return;
      }

      figure.innerHTML = [
        '<div class="article-featured-placeholder">',
        '  <img src="images/logonurulilmi.png" alt="" class="article-featured-placeholder-logo" aria-hidden="true">',
        '  <p class="article-featured-placeholder-title">YPI Nurul Ilmi</p>',
        '  <p class="article-featured-placeholder-text">Artikel ini belum memiliki gambar utama.</p>',
        '</div>'
      ].join('\n');

      figure.hidden = false;
      return;
    }

    var caption = featured.caption
      ? '<figcaption class="article-featured-caption">' + escapeHtml(featured.caption) + '</figcaption>'
      : '';

    figure.innerHTML = [
      '<a class="article-featured-media" data-index="' + featuredIndex + '" href="#">',
      '  <img src="' + escapeHtml(featured.url) + '" alt="' +
        escapeHtml(featured.caption || article.title_id || 'Gambar utama artikel') +
        '" class="article-featured-image">',
      '</a>',
      caption
    ].join('\n');

    figure.hidden = false;
  }

  /**
   * Galeri menyesuaikan diri dengan jumlah media:
   * 1 foto  -> satu kolom, tidak mendominasi
   * 2 foto  -> dua kolom
   * 3 foto  -> tiga kolom seimbang
   * 4+      -> grid tiga kolom (dua kolom di tablet, satu di ponsel)
   *
   * Gambar utama sudah ditampilkan terpisah di atas, jadi galeri hanya
   * menampilkan sisa media.
   */
  function renderMedia(article, media, featuredIndex) {
    var container = byId('article-media');
    if (!container) return;

    var rest = media.filter(function (item, index) {
      return index !== featuredIndex;
    });

    if (!rest.length) {
      container.innerHTML = '';
      return;
    }

    var count = rest.length;
    var layout = count === 1 ? '1' : count === 2 ? '2' : count === 3 ? '3' : '4';

    container.innerHTML = [
      '<div class="article-gallery article-gallery--' + layout + '" data-count="' + count + '">',
      rest.map(function (item) {
        return galleryItemHtml(article, item, media.indexOf(item));
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

  /* ------------------------------------------------------------------ */
  /*  Header artikel                                                      */
  /* ------------------------------------------------------------------ */

  function renderMeta(article) {
    var container = byId('article-meta');
    if (!container) return;

    var category = api.articleCategory(article);
    var parts = [];

    parts.push('<div class="article-meta-item"><span class="fas fa-calendar" aria-hidden="true"></span> ' +
      '<a href="blog.html">' + escapeHtml(utils.formatDate(article.published_at)) + '</a></div>');

    parts.push('<div class="article-meta-item"><span class="fas fa-user" aria-hidden="true"></span> ' +
      escapeHtml(article.author_name || 'Admin') + '</div>');

    parts.push('<div class="article-meta-item"><span class="fas fa-comment-dots" aria-hidden="true"></span> ' +
      commentCount(article) + ' komentar</div>');

    parts.push('<div class="article-meta-item"><span class="fas fa-eye" aria-hidden="true"></span> ' +
      utils.formatNumber(article.views || 0) + ' dibaca</div>');

    if (category) {
      parts.push('<div class="article-meta-item"><span class="fas fa-folder-open" aria-hidden="true"></span> ' +
        escapeHtml(category) + '</div>');
    }

    container.innerHTML = parts.join('');
  }

  function renderCategory(article) {
    var category = api.articleCategory(article);
    var wrap = byId('article-category-wrap');
    var link = byId('article-category');
    var crumb = byId('article-breadcrumb-category');
    var crumbName = byId('article-breadcrumb-category-name');

    if (!category) {
      if (wrap) wrap.hidden = true;
      if (crumb) crumb.hidden = true;
      if (crumbName) crumbName.textContent = '';

      return;
    }

    if (wrap && link) {
      link.textContent = category;
      link.setAttribute('href', 'blog.html?kategori=' + encodeURIComponent(category.toLowerCase()));
      wrap.hidden = false;
    }

    if (crumb && crumbName) {
      crumbName.textContent = category;
      crumb.hidden = false;
    }
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
  }

  function renderArticle(article) {
    document.title = (article.title_id || article.title_en || 'Artikel') + ' - YPI Nurul Ilmi Bekasi';

    byId('article-title').textContent = article.title_id || article.title_en || '';

    renderCategory(article);
    renderMeta(article);
    renderTags(article);
    renderAuthor(article);

    var media = api.articleMedia(article);
    var featuredIndex = -1;

    for (var i = 0; i < media.length; i++) {
      if (media[i].type === 'image') {
        featuredIndex = i;
        break;
      }
    }

    renderFeatured(article, media);
    renderMedia(article, media, featuredIndex);

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

    /* Kontrol terjemahan baru muncul setelah artikel benar-benar dimuat,
       supaya tombolnya tidak pernah tanpa isi. */
    var translateBar = byId('article-translate-bar');

    if (translateBar) translateBar.hidden = false;
  }

  function renderNotFound() {
    byId('article-title').textContent = 'Artikel tidak ditemukan';
    byId('article-content').innerHTML =
      '<p>Artikel yang Anda cari tidak tersedia atau belum dipublikasikan.</p>' +
      '<p><a href="blog.html" class="btn btn-secondary">Kembali ke daftar artikel</a></p>';
  }

  /* ------------------------------------------------------------------ */
  /*  Like artikel                                                        */
  /* ------------------------------------------------------------------ */

  function renderLike() {
    var button = byId('article-like');
    var count = byId('article-like-count');
    if (!button) return;

    button.classList.toggle('is-liked', !!state.like.liked);
    button.setAttribute('aria-pressed', state.like.liked ? 'true' : 'false');

    var label = button.querySelector('.article-action-text');
    if (label) label.textContent = state.like.liked ? 'Disukai' : 'Suka';

    if (count) count.textContent = utils.formatNumber(state.like.count || 0);
  }

  function loadLike(id) {
    if (!api.getArticleLike) return;

    api.getArticleLike(id)
      .then(function (result) {
        state.like = { liked: !!result.liked, count: Number(result.count || 0) };
        renderLike();
      })
      .catch(function () {
        renderLike();
      });
  }

  function bindLike(id) {
    var button = byId('article-like');
    if (!button) return;

    button.addEventListener('click', function () {
      if (button.disabled) return;

      button.disabled = true;

      api.toggleArticleLike(id)
        .then(function (result) {
          state.like = { liked: !!result.liked, count: Number(result.count || 0) };
          renderLike();

          button.classList.remove('is-pulsing');
          /* Reflow supaya animasi bisa diputar ulang tiap kali diklik. */
          void button.offsetWidth;
          button.classList.add('is-pulsing');
        })
        .catch(function (error) {
          showToast(error && error.message ? error.message : 'Like gagal disimpan.', 'error');
        })
        .then(function () {
          button.disabled = false;
        });
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Bagikan artikel                                                     */
  /* ------------------------------------------------------------------ */

  function showToast(message, type) {
    var toast = document.createElement('div');

    toast.className = 'ni-toast' + (type === 'error' ? ' is-error' : '');
    toast.setAttribute('role', 'status');
    toast.textContent = message;

    document.body.appendChild(toast);

    window.setTimeout(function () {
      toast.classList.add('is-hiding');
    }, 3200);

    window.setTimeout(function () {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 3800);
  }

  function copyToClipboard(text) {
    if (window.navigator.clipboard && window.navigator.clipboard.writeText) {
      return window.navigator.clipboard.writeText(text);
    }

    /* Cadangan untuk browser lama / konteks non-HTTPS. */
    return new Promise(function (resolve, reject) {
      var field = document.createElement('textarea');

      field.value = text;
      field.setAttribute('readonly', 'readonly');
      field.style.position = 'fixed';
      field.style.opacity = '0';

      document.body.appendChild(field);
      field.select();

      var ok = false;

      try {
        ok = document.execCommand('copy');
      } catch (error) {
        ok = false;
      }

      document.body.removeChild(field);

      if (ok) {
        resolve();
      } else {
        reject(new Error('Tidak bisa menyalin tautan secara otomatis.'));
      }
    });
  }

  function bindShare(id) {
    var button = byId('article-share');
    if (!button) return;

    button.addEventListener('click', function () {
      var url = api.articleShareUrl ? api.articleShareUrl(id) : window.location.href;
      var title = (state.article && (state.article.title_id || state.article.title_en)) || 'Artikel YPI Nurul Ilmi';

      if (typeof window.navigator.share === 'function') {
        var shared;

        try {
          shared = window.navigator.share({ title: title, text: title, url: url });
        } catch (error) {
          shared = Promise.reject(error);
        }

        Promise.resolve(shared)
          .then(function () {
            showToast('Tautan artikel sudah dibagikan.', 'ok');
          })
          .catch(function (error) {
            /* Pengg menekan tombol batal: tidak ada tindakan dan tidak ada
               pesan. Galat lain memakai cadangan salin tautan. */
            if (error && error.name === 'AbortError') return;

            copyShareUrl(url);
          });

        return;
      }

      copyShareUrl(url);
    });
  }

  /* Cadangan: salin tautan ke papan klip dan beri umpan balik visual. */
  function copyShareUrl(url) {
    copyToClipboard(url)
      .then(function () {
        showToast('Tautan artikel disalin ke papan klip.', 'ok');
      })
      .catch(function () {
        showToast('Tidak bisa menyalin tautan. Salin dari bilah alamat browser.', 'error');
      });
  }

  /* ------------------------------------------------------------------ */
  /*  Terjemahan                                                         */
  /* ------------------------------------------------------------------ */

  var LANG_LABEL = { id: 'Indonesia', en: 'English' };

  function translateStatus(message, type) {
    var box = byId('article-translate-status');
    if (!box) return;

    box.textContent = message || '';
    box.className = 'article-translate-status' + (type ? ' is-' + type : '');
  }

  /** Terapkan judul + isi artikel sesuai bahasa yang sedang aktif. */
  function applyArticleText(title, content) {
    byId('article-title').textContent = title;
    setTextContent(byId('article-content'), content);
    document.title = title + ' - YPI Nurul Ilmi Bekasi';
  }

  /**
   * Blok "English version" yang sudah tersimpan di database disembunyikan
   * saat bahasa aktif sudah Inggris, karena isinya akan kembar dengan
   * terjemahan yang ditampilkan.
   */
  function syncEnglishSection(lang) {
    var english = byId('article-english');
    if (!english || !state.article) return;

    if (lang === 'en') {
      english.hidden = true;
      return;
    }

    english.hidden = !(state.article.title_en || state.article.content_en);
  }

  /** Naskah asli artikel dalam bahasa Indonesia. */
  function originalText() {
    var article = state.article || {};

    return {
      title: article.title_id || article.title_en || '',
      content: article.content_id || article.content_en || ''
    };
  }

  function markLanguage(lang) {
    var label = byId('article-language-label');
    if (label) label.textContent = LANG_LABEL[lang] || LANG_LABEL.id;

    var options = document.querySelectorAll('.article-language-option');

    for (var i = 0; i < options.length; i++) {
      options[i].classList.toggle('is-active', options[i].getAttribute('data-article-lang') === lang);
    }
  }

  function showIndonesian() {
    var original = originalText();

    state.lang = 'id';

    applyArticleText(original.title, original.content);
    syncEnglishSection('id');
    markLanguage('id');
    translateStatus('');
  }

  function showEnglish(title, content) {
    state.lang = 'en';

    applyArticleText(title, content);
    syncEnglishSection('en');
    markLanguage('en');
    translateStatus('Menampilkan versi bahasa Inggris.', 'ok');
  }

  function requestTranslation() {
    if (state.busy) return;

    /* Hasil terjemahan disimpan supaya pindah ke Indonesia lalu kembali
       ke Inggris tidak memakai kuota MyMemory dua kali. */
    if (state.translation) {
      showEnglish(state.translation.title, state.translation.content);
      return;
    }

    var original = originalText();

    /* Artikel yang sudah punya versi Inggris tersimpan tidak perlu
       memanggil layanan terjemahan sama sekali. */
    if (!state.article || !state.article.content_id) {
      showEnglish(state.article.title_en || original.title, state.article.content_en || original.content);
      return;
    }

    if (!api || !api.translatePublic) {
      translateStatus('Layanan terjemahan sedang tidak tersedia.', 'error');
      return;
    }

    state.busy = true;
    translateStatus('Menerjemahkan ke bahasa Inggris...', 'loading');

    api.translatePublic({ title: original.title, content: original.content })
      .then(function (payload) {
        state.busy = false;

        var title = payload.title || original.title;
        var content = payload.content || original.content;

        state.translation = { title: title, content: content };

        showEnglish(title, content);
      })
      .catch(function (error) {
        state.busy = false;

        var reason = error && error.message ? error.message : 'Terjemahan gagal.';

        translateStatus(reason + ' Silakan coba lagi.', 'error');
      });
  }

  function bindTranslate() {
    var options = document.querySelectorAll('.article-language-option');
    if (!options.length) return;

    for (var i = 0; i < options.length; i++) {
      options[i].addEventListener('click', function (event) {
        event.preventDefault();

        if (this.getAttribute('data-article-lang') === 'en') {
          requestTranslation();
        } else {
          showIndonesian();
        }
      });
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Komentar                                                            */
  /* ------------------------------------------------------------------ */

  /* Warna avatar ditentukan dari nama supaya nama yang sama selalu
     mendapat warna yang sama. */
  var AVATAR_COLORS = [
    '#0A4F42', '#0d6b5a', '#1c7c6b', '#2f8f7c',
    '#4a6fa5', '#7a5ea8', '#b06a3b', '#b0445a'
  ];

  function avatarColor(name) {
    var text = String(name || '');
    var hash = 0;

    for (var i = 0; i < text.length; i++) {
      hash = (hash * 31 + text.charCodeAt(i)) % 100000;
    }

    return AVATAR_COLORS[hash % AVATAR_COLORS.length];
  }

  function initials(name) {
    var text = String(name || '').trim();

    if (!text) return '?';

    var parts = text.split(/\s+/).slice(0, 2);
    var result = parts.map(function (part) {
      return part.charAt(0);
    }).join('');

    return result.toUpperCase() || '?';
  }

  function commentLikeState(commentId) {
    var entry = state.commentLikes[String(commentId)];

    if (!entry) return { liked: false, count: 0 };

    return { liked: !!entry.liked, count: Number(entry.count || 0) };
  }

  function commentHtml(comment, isReply) {
    var like = commentLikeState(comment.id);

    var actions = [
      '<button type="button" class="comment-like' + (like.liked ? ' is-liked' : '') + '" data-comment-id="' + comment.id + '"' +
        ' aria-pressed="' + (like.liked ? 'true' : 'false') + '">',
      '  <i class="fas fa-heart" aria-hidden="true"></i>',
      '  <span class="comment-like-count">' + like.count + '</span>',
      '  <span class="comment-like-label">Suka</span>',
      '</button>'
    ];

    /* Balasan hanya satu tingkat, jadi tombolnya hanya di komentar utama. */
    if (!isReply) {
      actions.push(
        '<button type="button" class="comment-reply" data-comment-id="' + comment.id + '">',
        '  <i class="fas fa-reply" aria-hidden="true"></i>',
        '  <span class="comment-reply-label">Balas</span>',
        '</button>'
      );
    }

    return [
      '<li class="comment' + (isReply ? ' comment--reply' : '') + '" data-comment-id="' + comment.id + '">',
      '  <div class="comment-avatar" style="background-color: ' + avatarColor(comment.name) + ';" aria-hidden="true">' +
        escapeHtml(initials(comment.name)) + '</div>',
      '  <div class="comment-body">',
      '    <div class="comment-head">',
      '      <h3 class="comment-name">' + escapeHtml(comment.name || 'Anonim') + '</h3>',
      '      <span class="comment-date">' + escapeHtml(utils.formatDateTime(comment.created_at)) + '</span>',
      '    </div>',
      '    <p class="comment-text">' + escapeHtml(comment.comment) + '</p>',
      '    <div class="comment-actions">',
      actions.join('\n'),
      '    </div>',
      '  </div>',
      '</li>'
    ].join('\n');
  }

  /**
   * Komentar dirender berdasar hierarki: komentar utama lebih dulu, lalu
   * balasannya ditumpuk di bawah induknya.
   *
   * Balasan hanya ditampilkan bila induknya masih terlihat. Jadi ketika
   * admin menyembunyikan sebuah komentar, balasannya ikut hilang tanpa
   * perlu ada sesuatu yang dihapus manual.
   */
  function renderComments(comments) {
    var list = byId('comment-list');
    var empty = byId('comment-empty');
    var counter = byId('comment-count');
    var actionCounter = byId('article-comment-count');
    if (!list) return;

    var roots = [];
    var replies = {};
    var visible = {};

    comments.forEach(function (comment) {
      visible[comment.id] = true;
    });

    comments.forEach(function (comment) {
      if (comment.parent_id && visible[comment.parent_id]) {
        if (!replies[comment.parent_id]) replies[comment.parent_id] = [];
        replies[comment.parent_id].push(comment);
      } else {
        roots.push(comment);
      }
    });

    var html = [];

    roots.forEach(function (comment) {
      html.push(commentHtml(comment, false));

      (replies[comment.id] || []).forEach(function (reply) {
        html.push(commentHtml(reply, true));
      });
    });

    list.innerHTML = html.join('\n');

    if (empty) empty.hidden = comments.length > 0;
    if (counter) counter.textContent = String(comments.length);
    if (actionCounter) actionCounter.textContent = utils.formatNumber(comments.length);
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

  function loadCommentLikes(id) {
    if (!api.getCommentLikes) return Promise.resolve();

    return api.getCommentLikes(id)
      .then(function (result) {
        state.commentLikes = result || {};
        renderComments(state.comments);
      })
      .catch(function () {
        /* Like komentar tidak wajib: halaman tetap berfungsi tanpanya. */
      });
  }

  function bindCommentLikes() {
    var list = byId('comment-list');
    if (!list) return;

    list.addEventListener('click', function (event) {
      var button = event.target.closest('.comment-like');
      if (!button) return;

      var commentId = Number(button.getAttribute('data-comment-id'));
      if (!commentId || !api.toggleCommentLike) return;

      button.disabled = true;

      api.toggleCommentLike(commentId)
        .then(function (result) {
          state.commentLikes[String(commentId)] = {
            liked: !!result.liked,
            count: Number(result.count || 0)
          };

          renderComments(state.comments);
        })
        .catch(function (error) {
          showToast(error && error.message ? error.message : 'Like gagal disimpan.', 'error');
        })
        .then(function () {
          button.disabled = false;
        });
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

  /* ------------------------------------------------------------------ */
  /*  Balasan komentar                                                  */
  /* ------------------------------------------------------------------ */

  /**
   * Memasuki mode balas: form diisi untuk membalas komentar tertentu.
   * Balasan dikirim lewat RPC submit_comment dengan p_parent_id, jadi
   * hiss-nya benar-benar tersimpan di database (bukan hanya di tampilan).
   */
  function setReplyTarget(comment) {
    state.replyTo = comment;

    var bar = byId('comment-reply-bar');
    var name = byId('comment-reply-name');
    var title = byId('comment-form-title');
    var label = byId('comment-submit-label');
    var message = byId('comment-message');

    if (bar) bar.hidden = false;
    if (name) name.textContent = comment.name || 'Anonim';
    if (title) title.textContent = 'Balas Komentar';
    if (label) label.textContent = 'Kirim Balasan';

    if (message) {
      message.focus();
      message.setSelectionRange(message.value.length, message.value.length);
    }
  }

  /** Kembali ke mode komentar biasa. */
  function clearReplyTarget() {
    state.replyTo = null;

    var bar = byId('comment-reply-bar');
    var title = byId('comment-form-title');
    var label = byId('comment-submit-label');

    if (bar) bar.hidden = true;
    if (title) title.textContent = 'Tinggalkan Komentar';
    if (label) label.textContent = 'Kirim Komentar';
  }

  /** Tombol "Balas" pada tiap komentar utama. */
  function bindCommentReply() {
    var list = byId('comment-list');
    if (!list) return;

    list.addEventListener('click', function (event) {
      var button = event.target.closest('.comment-reply');
      if (!button) return;

      var commentId = Number(button.getAttribute('data-comment-id'));
      if (!commentId) return;

      var target = state.comments.filter(function (comment) {
        return comment.id === commentId;
      })[0];

      if (!target) return;

      setReplyTarget(target);

      var form = byId('comment-form');

      if (form && form.scrollIntoView) {
        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  /** Tombol "Batalkan balasan". */
  function bindReplyCancel() {
    var button = byId('comment-reply-cancel');
    if (!button) return;

    button.addEventListener('click', function () {
      clearReplyTarget();
    });
  }

  /* Avatar pratinjau pada form komentar mengikuti nama yang diketik. */
  function updateFormAvatar() {
    var input = byId('comment-name');
    var avatar = byId('comment-avatar');
    if (!input || !avatar) return;

    var name = input.value.trim();

    avatar.textContent = initials(name);
    avatar.parentNode.style.backgroundColor = avatarColor(name);
  }

  function updateCounter() {
    var textarea = byId('comment-message');
    var counter = byId('comment-counter');
    if (!textarea || !counter) return;

    counter.textContent = textarea.value.length + '/2000';
  }

  /* ------------------------------------------------------------------ */
  /*  Emoji picker                                                        */
  /* ------------------------------------------------------------------ */

  var EMOJI_GROUPS = [
    { title: 'Senyum', items: ['😀', '😄', '😁', '😊', '🙂', '😉', '😍', '🤩', '😘', '😇', '🥰', '😋'] },
    { title: 'Perasaan', items: ['👍', '👏', '🙏', '💪', '🤝', '❤️', '💚', '💛', '💙', '💜', '🔥', '✨'] },
    { title: 'Wajah', items: ['😢', '😭', '😡', '🤔', '😴', '🤗', '😱', '🥳', '🤭', '😐', '😌', '😤'] },
    { title: 'Lainnya', items: ['🎉', '🌷', '📚', '📖', '🏫', '🕌', '⭐', '💡', '✅', '💡', '🏆', '🌟'] }
  ];

  function buildEmojiPicker() {
    var picker = byId('comment-emoji-picker');
    if (!picker) return;

    picker.innerHTML = EMOJI_GROUPS.map(function (group) {
      return [
        '<p class="comment-emoji-group">' + escapeHtml(group.title) + '</p>',
        '<div class="comment-emoji-grid">',
        group.items.map(function (emoji) {
          return '<button type="button" class="comment-emoji" data-emoji="' + emoji + '" ' +
            'aria-label="Sisipkan ' + emoji + '">' + emoji + '</button>';
        }).join(''),
        '</div>'
      ].join('\n');
    }).join('\n');

    picker.addEventListener('click', function (event) {
      var button = event.target.closest('.comment-emoji');
      if (!button) return;

      insertEmoji(button.getAttribute('data-emoji'));
      closeEmojiPicker();
    });
  }

  /** Sisipkan emoji pada posisi kursor di textarea komentar. */
  function insertEmoji(emoji) {
    var textarea = byId('comment-message');
    if (!textarea) return;

    var start = textarea.selectionStart || 0;
    var end = textarea.selectionEnd || 0;
    var value = textarea.value;

    textarea.value = value.slice(0, start) + emoji + value.slice(end);
    textarea.focus();

    var position = start + emoji.length;

    textarea.setSelectionRange(position, position);

    updateCounter();
  }

  function openEmojiPicker() {
    var picker = byId('comment-emoji-picker');
    var toggle = byId('comment-emoji-toggle');
    if (!picker) return;

    picker.hidden = false;
    if (toggle) toggle.setAttribute('aria-expanded', 'true');
  }

  function closeEmojiPicker() {
    var picker = byId('comment-emoji-picker');
    var toggle = byId('comment-emoji-toggle');
    if (!picker) return;

    picker.hidden = true;
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  }

  function bindEmojiPicker() {
    var toggle = byId('comment-emoji-toggle');
    if (!toggle) return;

    buildEmojiPicker();

    toggle.addEventListener('click', function (event) {
      event.preventDefault();

      var picker = byId('comment-emoji-picker');

      if (picker && !picker.hidden) {
        closeEmojiPicker();
      } else {
        openEmojiPicker();
      }
    });

    document.addEventListener('click', function (event) {
      var picker = byId('comment-emoji-picker');

      if (!picker || picker.hidden) return;
      if (event.target.closest('#comment-emoji-picker, #comment-emoji-toggle')) return;

      closeEmojiPicker();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeEmojiPicker();
    });
  }

  function bindCommentForm(id) {
    var form = byId('comment-form');
    var submit = byId('comment-submit');
    if (!form) return;

    var nameInput = byId('comment-name');
    var messageInput = byId('comment-message');

    if (nameInput) nameInput.addEventListener('input', updateFormAvatar);
    if (messageInput) messageInput.addEventListener('input', updateCounter);

    bindEmojiPicker();
    updateFormAvatar();
    updateCounter();

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var name = nameInput ? nameInput.value.trim() : '';
      var message = messageInput ? messageInput.value.trim() : '';
      var honeypot = byId('comment-hp').value;

      if (!name || !message) {
        showCommentAlert('Nama dan komentar wajib diisi.', 'error');
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

      if (message.length < 3) {
        showCommentAlert('Komentar minimal 3 karakter.', 'error');
        return;
      }

      if (message.length > 2000) {
        showCommentAlert('Komentar maksimal 2000 karakter.', 'error');
        return;
      }

      if (submit) {
        submit.disabled = true;
        submit.classList.add('is-loading');
      }

      showCommentAlert('Mengirim komentar...');

      /* Balasan menyimpan id komentar induk; komentar biasa menyimpan null. */
      var parentId = state.replyTo ? state.replyTo.id : null;

      /* Email tidak lagi diminta. Kolom email di database tetap ada dan
         tetap dibaca bila suatu saat diisi, jadi komentar lama tetap utuh
         dan tidak ada data yang dibuang. */
      api.submitComment(id, { name: name, comment: message, hp: honeypot, parentId: parentId })
        .then(function (result) {
          if (submit) {
            submit.disabled = false;
            submit.classList.remove('is-loading');
          }

          messageInput.value = '';
          updateCounter();

          // RPC mengembalikan id komentar, atau -1 bila honeypot terisi.
          if (result === -1) {
            showCommentAlert('Komentar berhasil dikirim.', 'success');
            return;
          }

          clearReplyTarget();

          /* Daftar komentar dimuat ulang dari server supaya jumlah dan isi
             komentar ikut terbaru tanpa perlu refresh halaman manual. */
          loadComments(id).then(function () {
            loadCommentLikes(id);
          });

          showCommentAlert(
            parentId
              ? 'Balasan Anda sudah tayang di bawah komentar tersebut.'
              : 'Terima kasih! Komentar Anda sudah tayang di bawah.',
            'success'
          );
        })
        .catch(function (error) {
          if (submit) {
            submit.disabled = false;
            submit.classList.remove('is-loading');
          }

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
    }).join('\n');
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
        bindCommentLikes();
        bindCommentReply();
        bindReplyCancel();
        bindTranslate();
        bindLike(id);
        bindShare(id);
        loadSidebar(article);
        loadRelated(article);

        loadLike(id);
        loadCommentLikes(id);

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
