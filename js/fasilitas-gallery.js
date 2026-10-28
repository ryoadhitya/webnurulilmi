/* ==========================================================================
   NURUL ILMI - FASILITAS GALLERY + ARTIKEL ENGINE
   Shared, self-contained front-end helper used by:
     - index.html        (YPI Nurul Ilmi)
     - tk-sigma.html     (TK Sigma)
     - daycare-sigma.html(Daycare Sigma)
   No backend, no upload system - all data is static front-end data.
   ========================================================================== */
(function (window, document) {
  'use strict';

  var MODAL_ID = 'niGalleryModal';
  var LIGHTBOX_ID = 'niLightbox';

  var state = {
    data: {},
    photos: [],
    index: 0,
    lastFocused: null,
    theme: ''
  };

  /* The modal & lightbox live outside the themed section, so the theme
     custom properties have to be carried over explicitly. */
  function applyTheme(element) {
    if (!element || !state.theme) return;
    element.classList.add('ni-theme-' + state.theme);
  }

  /* ------------------------------------------------------------------ *
   * Modal
   * ------------------------------------------------------------------ */
  function hideModal() {
    var modal = document.getElementById(MODAL_ID);
    if (!modal) return;
    if (window.jQuery) window.jQuery(modal).modal('hide');

    /* Pengaman: bila transisi Bootstrap tidak selesai, modal dipaksa tutup
       agar pengunjung tidak terjebak di dalam galeri. */
    setTimeout(function () {
      if (!modal.classList.contains('show')) return;
      modal.classList.remove('show');
      modal.style.display = 'none';
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      var backdrop = document.querySelector('.modal-backdrop');
      if (backdrop && backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
    }, 500);
  }

  /* Modal markup (created once per page, shared by every card) */
  function buildModal() {
    if (document.getElementById(MODAL_ID)) return;

    var wrap = document.createElement('div');
    wrap.className = 'modal fade ni-gallery-modal';
    wrap.id = MODAL_ID;
    wrap.setAttribute('tabindex', '-1');
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-labelledby', 'niGalleryTitle');
    wrap.setAttribute('aria-hidden', 'true');
    applyTheme(wrap);
    wrap.innerHTML = [
      '<div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" role="document">',
      '  <div class="modal-content">',
      '    <div class="modal-header">',
      '      <div>',
      '        <h5 class="modal-title" id="niGalleryTitle">Galeri</h5>',
      '        <p class="ni-gallery-subtitle" id="niGallerySubtitle"></p>',
      '      </div>',
      '      <button type="button" class="close" data-dismiss="modal" data-target="#' + MODAL_ID + '" aria-label="Tutup galeri">',
      '        <span aria-hidden="true">&times;</span>',
      '      </button>',
      '    </div>',
      '    <div class="modal-body" id="niGalleryBody"></div>',
      '  </div>',
      '</div>'
    ].join('\n');
    document.body.appendChild(wrap);

    /* Bootstrap only binds its dismiss handler to [data-toggle="modal"]
       triggers, so a modal created from JS needs its own close wiring. */
    var closeButton = wrap.querySelector('.close');
    if (closeButton) {
      closeButton.addEventListener('click', function () {
        hideModal();
      });
    }
  }

  function buildLightbox() {
    if (document.getElementById(LIGHTBOX_ID)) return;

    var box = document.createElement('div');
    box.className = 'ni-lightbox';
    box.id = LIGHTBOX_ID;
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Tampilan foto');
    box.setAttribute('aria-hidden', 'true');
    applyTheme(box);
    box.innerHTML = [
      '<button type="button" class="ni-lightbox-btn ni-lightbox-close" data-ni-lb="close" aria-label="Tutup foto">&times;</button>',
      '<button type="button" class="ni-lightbox-btn ni-lightbox-prev" data-ni-lb="prev" aria-label="Foto sebelumnya"><i class="fas fa-chevron-left" aria-hidden="true"></i></button>',
      '<button type="button" class="ni-lightbox-btn ni-lightbox-next" data-ni-lb="next" aria-label="Foto berikutnya"><i class="fas fa-chevron-right" aria-hidden="true"></i></button>',
      '<div class="ni-lightbox-content">',
      '  <img src="" alt="" id="niLightboxImage">',
      '  <p class="ni-lightbox-caption" id="niLightboxCaption"></p>',
      '</div>'
    ].join('\n');
    document.body.appendChild(box);

    box.addEventListener('click', function (event) {
      var action = event.target.getAttribute && event.target.getAttribute('data-ni-lb');
      if (action === 'close') {
        closeLightbox();
      } else if (action === 'prev') {
        showPhoto(state.index - 1);
      } else if (action === 'next') {
        showPhoto(state.index + 1);
      } else if (event.target === box) {
        closeLightbox();
      }
    });
  }

  /* ------------------------------------------------------------------ *
   * Lightbox
   * ------------------------------------------------------------------ */
  function showPhoto(index) {
    if (!state.photos.length) return;
    state.index = (index + state.photos.length) % state.photos.length;

    var photo = state.photos[state.index];
    var image = document.getElementById('niLightboxImage');
    var caption = document.getElementById('niLightboxCaption');

    image.src = photo.src;
    image.alt = photo.alt || '';
    caption.textContent = photo.caption || photo.alt || '';

    var single = state.photos.length < 2;
    var box = document.getElementById(LIGHTBOX_ID);
    var prev = box.querySelector('.ni-lightbox-prev');
    var next = box.querySelector('.ni-lightbox-next');
    if (prev) prev.style.display = single ? 'none' : '';
    if (next) next.style.display = single ? 'none' : '';
  }

  function openLightbox(index) {
    var box = document.getElementById(LIGHTBOX_ID);
    if (!box) return;
    showPhoto(index);
    box.classList.add('is-active');
    box.setAttribute('aria-hidden', 'false');
    var closeBtn = box.querySelector('.ni-lightbox-close');
    if (closeBtn) closeBtn.focus();
  }

  function closeLightbox() {
    var box = document.getElementById(LIGHTBOX_ID);
    if (!box) return;
    box.classList.remove('is-active');
    box.setAttribute('aria-hidden', 'true');
    if (state.lastFocused && typeof state.lastFocused.focus === 'function') {
      state.lastFocused.focus();
    }
  }

  function isLightboxOpen() {
    var box = document.getElementById(LIGHTBOX_ID);
    return !!(box && box.classList.contains('is-active'));
  }

  /* ------------------------------------------------------------------ *
   * Gallery modal content
   * ------------------------------------------------------------------ */
  function renderGalleryBody(facility) {
    var body = document.getElementById('niGalleryBody');
    var title = document.getElementById('niGalleryTitle');
    var subtitle = document.getElementById('niGallerySubtitle');
    var photos = (facility && facility.photos) || [];

    if (title) title.textContent = facility.title || 'Galeri';
    if (subtitle) subtitle.textContent = facility.desc || '';

    if (!photos.length) {
      body.innerHTML = [
        '<div class="ni-gallery-empty">',
        '  <i class="fas fa-images" aria-hidden="true"></i>',
        '  <h5>Dokumentasi sedang disiapkan</h5>',
        '  <p>Foto untuk fasilitas ini belum tersedia. Silakan kembali lagi nanti atau hubungi kami melalui WhatsApp untuk informasi lebih lanjut.</p>',
        '</div>'
      ].join('\n');
      return;
    }

    var html = ['<div class="ni-gallery-grid">'];
    photos.forEach(function (photo, index) {
      html.push(
        '<button type="button" class="ni-gallery-item" data-ni-photo="' + index + '" aria-label="Perbesar foto: ' +
        escapeHtml(photo.alt || photo.caption || 'Foto fasilitas') + '">' +
        '<img src="' + escapeHtml(photo.src) + '" alt="' + escapeHtml(photo.alt || '') + '" loading="lazy">' +
        '<span class="ni-gallery-zoom" aria-hidden="true"><i class="fas fa-search-plus"></i></span>' +
        '</button>'
      );
    });
    html.push('</div>');
    body.innerHTML = html.join('');

    Array.prototype.forEach.call(body.querySelectorAll('.ni-gallery-item'), function (button) {
      button.addEventListener('click', function () {
        state.lastFocused = button;
        openLightbox(parseInt(button.getAttribute('data-ni-photo'), 10));
      });
    });
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ------------------------------------------------------------------ *
   * Public API
   * ------------------------------------------------------------------ */
  function initFacilities(options) {
    options = options || {};
    var cards = document.querySelectorAll(options.cardsSelector || '.ni-fas-card');
    if (!cards.length) return;

    state.data = options.data || {};
    state.theme = options.theme || '';
    buildModal();
    buildLightbox();

    Array.prototype.forEach.call(cards, function (card) {
      var key = card.getAttribute('data-ni-facility');
      var facility = state.data[key] || {};
      var photos = facility.photos || [];
      var badge = card.querySelector('.ni-fas-count');

      if (photos.length) {
        if (badge) badge.textContent = photos.length + ' foto';
      } else {
        card.classList.add('is-placeholder');
        if (badge) badge.remove();
      }

      card.addEventListener('click', function (event) {
        event.preventDefault();
        var entry = state.data[key] || { title: card.querySelector('.ni-fas-title') ? card.querySelector('.ni-fas-title').textContent : 'Fasilitas' };
        entry.photos = (entry.photos || []).slice();
        state.photos = entry.photos;
        renderGalleryBody(entry);

        var modal = document.getElementById(MODAL_ID);
        if (window.jQuery) {
          window.jQuery(modal).modal('show');
        }
      });
    });
  }

  function initArticles(options) {
    options = options || {};
    var container = typeof options.container === 'string'
      ? document.querySelector(options.container)
      : options.container;
    if (!container) return;

    var articles = options.data || [];

    if (!articles.length) {
      var emptyHtml = [
        '<div class="ni-art-empty">',
        '  <div class="ni-art-empty-icon"><i class="fas fa-newspaper" aria-hidden="true"></i></div>',
        '  <h4>' + escapeHtml(options.emptyTitle || 'Belum ada artikel') + '</h4>',
        '  <p>' + escapeHtml(options.emptyText || 'Belum ada artikel yang dipublikasikan pada section ini. Nantikan update kegiatan terbaru dari kami.') + '</p>'
      ];
      if (options.emptyLinkHref) {
        emptyHtml.push(
          '<a class="ni-art-btn" href="' + escapeHtml(options.emptyLinkHref) + '">' +
          escapeHtml(options.emptyLinkText || 'Lihat Artikel YPI Nurul Ilmi') +
          ' <i class="fas fa-arrow-right" aria-hidden="true"></i></a>'
        );
      }
      emptyHtml.push('</div>');
      container.innerHTML = emptyHtml.join('');
      return;
    }

    var html = ['<div class="ni-art-grid">'];
    articles.forEach(function (article) {
      html.push(
        '<article class="ni-art-card">',
        '  <div class="ni-art-media">',
        article.cover ? '<img src="' + escapeHtml(article.cover) + '" alt="' + escapeHtml(article.title) + '" loading="lazy">' : '',
        '    <span class="ni-art-cat">' + escapeHtml(article.category || 'Artikel') + '</span>',
        '  </div>',
        '  <div class="ni-art-body">',
        article.date ? '<div class="ni-art-date"><i class="far fa-calendar-alt mr-1" aria-hidden="true"></i>' + escapeHtml(article.date) + '</div>' : '',
        '    <h3 class="ni-art-title">' + escapeHtml(article.title) + '</h3>',
        '    <p class="ni-art-excerpt">' + escapeHtml(article.excerpt || '') + '</p>',
        '    <a class="ni-art-btn" href="' + escapeHtml(article.url || '#') + '">Baca Selengkapnya <i class="fas fa-arrow-right" aria-hidden="true"></i></a>',
        '  </div>',
        '</article>'
      );
    });
    html.push('</div>');
    container.innerHTML = html.join('');
  }

  /* ------------------------------------------------------------------ *
   * Global keyboard support (Escape closes lightbox first, then modal)
   * ------------------------------------------------------------------ */
  document.addEventListener('keydown', function (event) {
    if (isLightboxOpen()) {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        closeLightbox();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        showPhoto(state.index - 1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        showPhoto(state.index + 1);
      }
      return;
    }

    if (event.key === 'Escape') {
      var modal = document.getElementById(MODAL_ID);
      if (modal && modal.classList.contains('show')) {
        hideModal();
      }
    }
  }, true);

  window.NIGaleri = {
    initFasilitas: initFacilities,
    initArtikel: initArticles
  };
})(window, document);
