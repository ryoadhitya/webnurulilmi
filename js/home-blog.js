/* ==========================================================================
   RECENT BLOG — YPI NURUL ILMI
   --------------------------------------------------------------------------
   Mengisi section "Recent Blog" di homepage statis dengan artikel terbaru
   dari Supabase. Data yang sama dipakai oleh halaman Artikel, jadi tidak ada
   sumber data ganda.

   Sumber data: js/supabase.js (window.NISupabase).
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

  function formatDate(value) {
    return utils.formatDateParts(value);
  }

  function commentCount(article) {
    return utils.commentCount(article);
  }

  function buildCard(article) {
    var column = el('div', 'col-md-6 col-lg-4 fadeInUp');
    var card = el('div', 'blog-entry article-card');
    var imageLink = el('a', 'block-20 d-flex align-items-end');
    var meta = el('div', 'meta-date text-center p-2');
    var date = formatDate(article.published_at);
    var text = el('div', 'text bg-white p-4');
    var heading = el('h3', 'heading');
    var titleLink = el('a');
    var excerpt = el('p');
    var footer = el('div', 'd-flex align-items-center mt-4');
    var readWrap = el('p', 'mb-0');
    var readLink = el('a', 'btn btn-secondary');
    var readIcon = el('span', 'fas fa-arrow-right');
    var metaWrap = el('p', 'ml-auto mb-0');
    var author = el('a', 'mr-2');
    var authorIcon = el('span', 'fas fa-user');
    var comments = el('a', 'meta-chat');
    var commentIcon = el('span', 'fas fa-comment');

    var url = api.articleUrl(article.id);
    var cover = api.articleCover(article) || FALLBACK_IMAGE;

    imageLink.setAttribute('href', url);
    imageLink.style.backgroundImage = "url('" + cover + "')";

    var day = el('span', 'day');
    day.textContent = date.day;
    var month = el('span', 'mos');
    month.textContent = date.month;
    var year = el('span', 'yr');
    year.textContent = date.year;

    meta.appendChild(day);
    meta.appendChild(month);
    meta.appendChild(year);
    imageLink.appendChild(meta);

    titleLink.setAttribute('href', url);
    titleLink.textContent = article.title_id || article.title_en || '';
    heading.appendChild(titleLink);

    excerpt.textContent = utils.limit(article.content_id || article.content_en || '', 130);

    readLink.setAttribute('href', url);
    readLink.appendChild(document.createTextNode('Selengkapnya '));
    readLink.appendChild(readIcon);
    readWrap.appendChild(readLink);

    author.setAttribute('href', '#');
    author.appendChild(authorIcon);
    author.appendChild(document.createTextNode(' ' + (article.author_name || 'Admin')));
    comments.setAttribute('href', url + '#komentar');
    comments.appendChild(commentIcon);
    comments.appendChild(document.createTextNode(' ' + commentCount(article)));
    metaWrap.appendChild(author);
    metaWrap.appendChild(comments);

    footer.appendChild(readWrap);
    footer.appendChild(metaWrap);

    text.appendChild(heading);
    text.appendChild(excerpt);
    text.appendChild(footer);

    card.appendChild(imageLink);
    card.appendChild(text);
    column.appendChild(card);

    return column;
  }

  function renderEmpty(container, title, message) {
    var column = el('div', 'col-12 py-5 text-center');

    var heading = el('h3');
    heading.textContent = title;
    var paragraph = el('p');
    paragraph.textContent = message;

    column.appendChild(heading);
    column.appendChild(paragraph);
    container.appendChild(column);
  }

  function render(container, articles) {
    container.innerHTML = '';

    if (!articles.length) {
      renderEmpty(container, 'Belum ada artikel', 'Artikel terbaru akan tampil di halaman ini.');
      return;
    }

    for (var i = 0; i < articles.length; i++) {
      container.appendChild(buildCard(articles[i]));
    }
  }

  function load() {
    var container = document.querySelector('[data-recent-blog]');
    if (!container) return;

    if (!api || !api.isConfigured()) {
      renderEmpty(container, 'Belum ada artikel', 'Artikel terbaru akan tampil di halaman ini.');
      return;
    }

    api.fetchPublishedArticles({ limit: LIMIT })
      .then(function (result) {
        render(container, result.rows);
      })
      .catch(function () {
        renderEmpty(container, 'Artikel belum dapat dimuat',
          'Tidak dapat terhubung ke server. Silakan muat ulang halaman beberapa saat lagi.');
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
})(window, document);
