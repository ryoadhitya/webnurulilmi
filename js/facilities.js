/* ==========================================================================
   FASILITAS — YPI NURUL ILMI
   --------------------------------------------------------------------------
   Mengambil daftar fasilitas beserta foto galerinya langsung dari Supabase
   lalu meneruskannya ke galeri kartu fasilitas di halaman statis.

   Data yang dipakai:
     - index.html         -> kelompok "main" (TK/SD/SMP Nurul Ilmi)
     - tk-sigma.html      -> unit "tk-sigma"
     - daycare-sigma.html -> unit "daycare-sigma"
     - galeri-fasilitas.html -> seluruh fasilitas yang dipublikasikan

   Sumber data: js/supabase.js (window.NISupabase).
   ========================================================================== */
(function (window, document) {
  'use strict';

  var api = window.NISupabase;

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /** Data Supabase -> bentuk map yang dipahami NIGaleri.initFasilitas (key = slug). */
  function toMap(items) {
    var map = {};

    items.forEach(function (item) {
      map[item.slug] = {
        title: item.name,
        desc: item.description || '',
        icon: item.icon || '',
        cover: item.cover_url || '',
        photos: (item.photos || []).map(function (photo) {
          return {
            src: photo.url,
            alt: photo.alt || item.name || '',
            caption: photo.caption || ''
          };
        })
      };
    });

    return map;
  }

  /** Ambil daftar fasilitas dari Supabase. Kembalikan array kosong saat gagal. */
  function fetchItems(unit, group) {
    if (!api || !api.isConfigured()) return Promise.resolve([]);

    return api
      .fetchFacilities({ unit: unit || null, group: group || null })
      .then(api.facilityItems)
      .catch(function () {
        return [];
      });
  }

  /** Ambil daftar fasilitas. Kembalikan map siap pakai, atau map kosong saat gagal. */
  function load(unit, group) {
    return fetchItems(unit, group).then(toMap);
  }

  /** Fasilitas satu kelompok section: "main" (TK/SD/SMP) atau "sigma". */
  function loadGroup(group) {
    return load(null, group);
  }

  /** Daftar facility beserta fotonya, dipakai untuk merender halaman galeri. */
  function loadList(unit, group) {
    return fetchItems(unit, group);
  }

  function galleryCard(item) {
    var html = [
      '<div class="gallery-card" data-aos="fade-up">',
      '  <div class="gallery-card-image">',
      '    <img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.alt) + '" loading="lazy">',
      '    <div class="gallery-card-overlay">',
      '      <span><i class="fas fa-search-plus"></i>Klik untuk memperbesar</span>',
      '    </div>',
      '  </div>',
      '  <div class="gallery-card-body">',
      '    <h4>' + escapeHtml(item.title) + '</h4>',
      '    <p>' + escapeHtml(item.desc) + '</p>',
      '  </div>',
      '</div>'
    ];

    return html.join('\n');
  }

  /**
   * Render halaman galeri dari data Supabase.
   * Satu kartu dibuat untuk setiap foto, jadi galeri tetap lengkap.
   */
  function renderGallery(options) {
    options = options || {};

    var container = typeof options.container === 'string'
      ? document.querySelector(options.container)
      : options.container;

    if (!container) return Promise.resolve([]);

    return loadList(options.unit, options.group).then(function (facilities) {
      var items = [];

      facilities.forEach(function (facility) {
        var photos = facility.photos || [];

        if (!photos.length) {
          if (facility.cover_url) {
            items.push({
              image: facility.cover_url,
              alt: facility.name,
              title: facility.name,
              desc: facility.description || ''
            });
          }
          return;
        }

        photos.forEach(function (photo) {
          items.push({
            image: photo.url,
            alt: photo.alt || facility.name,
            title: facility.name,
            desc: facility.description || ''
          });
        });
      });

      if (!items.length) {
        container.innerHTML = [
          '<div class="gallery-empty">',
          '  <i class="fas fa-images" aria-hidden="true"></i>',
          '  <h4>Belum ada dokumentasi</h4>',
          '  <p>Foto fasilitas akan tampil di sini setelah dimuat dari dashboard admin.</p>',
          '</div>'
        ].join('\n');
      } else {
        container.innerHTML = items.map(galleryCard).join('\n');
      }

      document.dispatchEvent(new window.CustomEvent('ni:facilities-rendered'));

      return items;
    });
  }

  window.NIFasilitas = {
    load: load,
    loadGroup: loadGroup,
    loadList: loadList,
    renderGallery: renderGallery
  };
})(window, document);
