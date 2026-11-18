/* ==========================================================================
   ARTIKEL TERBARU DI FOOTER — YPI NURUL ILMI
   --------------------------------------------------------------------------
   Mengisi widget "Artikel Terbaru" di footer dengan artikel terbaru dari
   backend yang sama dengan halaman Artikel dan dashboard admin.

   Data diambil lewat js/supabase.js (window.NISupabase), jadi:
     - hanya artikel berstatus "published" yang tampil;
     - urutannya dari yang terbaru (published_at, lalu created_at);
     - judul, tanggal, penulis, dan jumlah komentar diambil dari database.

   Elemen target: <div data-footer-latest></div>
   ========================================================================== */
(function (window, document) {
  'use strict';

  var api = window.NISupabase;
  var utils = window.NIUtils;

  var LIMIT = 3;
  var FALLBACK_IMAGE = 'images/image_1.jpg';

  function el(tag, className) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    return node;
  }

  function metaLink(url, iconClass, text) {
    var wrap = el('div');
    var link = el('a');
    var icon = el('span', iconClass);

    link.setAttribute('href', url);
    link.appendChild(icon);
    link.appendChild(document.createTextNode(' ' + text));
    wrap.appendChild(link);

    return wrap;
  }

  function buildItem(article, isLast) {
    var item = el('div', 'block-21 d-flex ' + (isLast ? 'mb-5' : 'mb-4'));
    var imageLink = el('a', 'blog-img mr-4');
    var text = el('div', 'text');
    var heading = el('h3', 'heading');
    var titleLink = el('a');
    var meta = el('div', 'meta');

    var url = api.articleUrl(article.id);
    var cover = api.articleCover(article) || FALLBACK_IMAGE;

    imageLink.setAttribute('href', url);
    imageLink.setAttribute('style', "background-image: url('" + cover + "');");

    titleLink.setAttribute('href', url);
    titleLink.textContent = article.title_id || article.title_en || '';
    heading.appendChild(titleLink);

    meta.appendChild(metaLink(url, 'far fa-calendar',
      utils.formatDate(article.published_at || article.created_at)));
    meta.appendChild(metaLink(url, 'fas fa-user', article.author_name || 'Admin'));
    meta.appendChild(metaLink(url + '#komentar', 'fas fa-comment',
      String(utils.commentCount(article))));

    text.appendChild(heading);
    text.appendChild(meta);
    item.appendChild(imageLink);
    item.appendChild(text);

    return item;
  }

  function renderEmpty(container) {
    var message = el('p', 'mb-0');

    message.textContent = 'Belum ada artikel terbaru.';
    container.appendChild(message);
  }

  function render(container, articles) {
    container.innerHTML = '';

    if (!articles.length) {
      renderEmpty(container);
      return;
    }

    for (var i = 0; i < articles.length; i++) {
      container.appendChild(buildItem(articles[i], i === articles.length - 1));
    }
  }

  function load() {
    var container = document.querySelector('[data-footer-latest]');
    if (!container) return;

    if (!api || !api.isConfigured()) {
      renderEmpty(container);
      return;
    }

    api.fetchPublishedArticles({ limit: LIMIT })
      .then(function (result) {
        render(container, result.rows);
      })
      .catch(function () {
        renderEmpty(container);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
})(window, document);
