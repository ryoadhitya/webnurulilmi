/* ==========================================================================
   DASHBOARD ADMIN — MODERASI KOMENTAR
   --------------------------------------------------------------------------
   Menu baru sesuai keputusan rancangan migrasi §12 butir 5: komentar dari
   pembaca masuk dengan status 'pending' (RPC submit_comment) dan wajib
   dimoderasi sebelum tayang.

   Aksi: tayangkan (published), tandai spam, hapus.
   ========================================================================== */
(function (window, document) {
  'use strict';

  var utils = window.NIUtils;
  var api = window.NISupabase;
  var admin = window.NIAdmin;

  var state = {
    comments: [],
    status: ''
  };

  var STATUS_LABEL = {
    pending: 'Menunggu',
    published: 'Tayang',
    spam: 'Spam'
  };

  function statusBadge(status) {
    var label = STATUS_LABEL[status] || status;
    var style = status === 'published'
      ? 'bg-emerald-50 text-emerald-800'
      : status === 'spam'
        ? 'bg-rose-50 text-rose-700'
        : 'bg-amber-50 text-amber-800';

    return '<span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ' + style + '">' +
      utils.escapeHtml(label) + '</span>';
  }

  function renderStats(rows) {
    var counts = { pending: 0, published: 0, spam: 0 };

    rows.forEach(function (row) {
      if (counts[row.status] !== undefined) counts[row.status] += 1;
    });

    var pending = document.getElementById('stat-pending');
    var published = document.getElementById('stat-published');
    var spam = document.getElementById('stat-spam');

    if (pending) pending.textContent = utils.formatNumber(counts.pending);
    if (published) published.textContent = utils.formatNumber(counts.published);
    if (spam) spam.textContent = utils.formatNumber(counts.spam);
  }

  function rowTemplate(comment) {
    var article = comment.articles ? comment.articles.title_id : 'Artikel dihapus';

    return [
      '<tr data-comment-row class="transition hover:bg-slate-50/70">',
      '  <td class="px-6 py-4">',
      '    <p class="font-semibold text-slate-900">' + utils.escapeHtml(comment.name || 'Anonim') + '</p>',
      '    <p class="mt-0.5 text-xs text-slate-400">' + utils.escapeHtml(comment.email || 'tanpa email') + '</p>',
      '  </td>',
      '  <td class="px-6 py-4">',
      '    <p class="max-w-md text-sm leading-6 text-slate-700">' + utils.escapeHtml(utils.limit(comment.comment, 220)) + '</p>',
      '    <p class="mt-1 text-xs text-slate-400">Pada: ' + utils.escapeHtml(article) + '</p>',
      '  </td>',
      '  <td class="px-6 py-4 text-slate-500">' + utils.formatDateTime(comment.created_at) + '</td>',
      '  <td class="px-6 py-4">' + statusBadge(comment.status) + '</td>',
      '  <td class="px-6 py-4">',
      '    <div class="flex justify-end gap-2">',
      comment.status === 'published'
        ? ''
        : '      <button type="button" data-comment-publish="' + comment.id + '" class="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100" aria-label="Tayangkan komentar"><svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m5 12 4 4L19 6"/></svg> Tayangkan</button>',
      comment.status === 'spam'
        ? ''
        : '      <button type="button" data-comment-spam="' + comment.id + '" class="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 transition hover:bg-amber-100" aria-label="Tandai spam"><svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg> Spam</button>',
      '      <button type="button" data-comment-delete="' + comment.id + '" class="inline-flex items-center gap-1.5 rounded-lg border border-rose-100 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:border-rose-200 hover:bg-rose-50" aria-label="Hapus komentar"><svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M4 7h16M10 11v6m4-6v6M5.5 7l1 13h11l1-13M9 7V4h6v3"/></svg> Hapus</button>',
      '    </div>',
      '  </td>',
      '</tr>'
    ].join('\n');
  }

  function renderRows() {
    var body = document.getElementById('comment-rows');
    if (!body) return;

    var empty = document.getElementById('comment-empty');
    var countEl = document.getElementById('comment-count');

    [].slice.call(body.querySelectorAll('[data-comment-row]')).forEach(function (row) {
      row.parentNode.removeChild(row);
    });

    if (!state.comments.length) {
      if (empty) empty.classList.remove('hidden');
      if (countEl) countEl.textContent = '0 komentar';
      return;
    }

    if (empty) empty.classList.add('hidden');

    body.insertAdjacentHTML('afterbegin', state.comments.map(rowTemplate).join('\n'));

    if (countEl) countEl.textContent = state.comments.length + ' komentar';
  }

  function bindStatusFilter() {
    var select = document.getElementById('comment-status');
    if (!select) return;

    select.addEventListener('change', function (event) {
      state.status = event.target.value;
      load();
    });
  }

  function setStatus(id, status) {
    api.getClient()
      .from('comments')
      .update({ status: status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .then(function (result) {
        if (result.error) {
          admin.flash('Komentar gagal diperbarui: ' + result.error.message, 'error');
          return;
        }

        admin.flash(status === 'published' ? 'Komentar ditayangkan.' : 'Komentar ditandai sebagai spam.');
        load();
      });
  }

  function bindActions() {
    document.addEventListener('click', function (event) {
      var publish = event.target.closest('[data-comment-publish]');
      if (publish) {
        setStatus(publish.getAttribute('data-comment-publish'), 'published');
        return;
      }

      var spam = event.target.closest('[data-comment-spam]');
      if (spam) {
        setStatus(spam.getAttribute('data-comment-spam'), 'spam');
        return;
      }

      var remove = event.target.closest('[data-comment-delete]');
      if (!remove) return;

      if (!admin.confirmAction('Yakin ingin menghapus komentar ini?')) return;

      api.getClient()
        .from('comments')
        .delete()
        .eq('id', remove.getAttribute('data-comment-delete'))
        .then(function (result) {
          if (result.error) {
            admin.flash('Komentar gagal dihapus: ' + result.error.message, 'error');
            return;
          }
          admin.flash('Komentar berhasil dihapus.');
          load();
        });
    });
  }

  function load() {
    var db = api.getClient();
    if (!db) return;

    var query = db
      .from('comments')
      .select('id, article_id, name, email, comment, status, created_at, articles(id, title_id)')
      .order('created_at', { ascending: false });

    if (state.status) query = query.eq('status', state.status);

    Promise.all([
      query,
      /* Kartu statistik menghitung seluruh komentar, bukan hanya hasil filter. */
      db.from('comments').select('status')
    ]).then(function (results) {
      var result = results[0];

      if (result.error) {
        admin.flash('Gagal memuat komentar: ' + result.error.message, 'error');
        return;
      }

      state.comments = result.data || [];

      renderStats(results[1].error ? [] : (results[1].data || []));
      renderRows();
    });
  }

  function initList() {
    bindStatusFilter();
    bindActions();
    load();
  }

  window.NIAdminComments = {
    initList: initList
  };
})(window, document);
