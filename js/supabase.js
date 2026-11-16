/* ==========================================================================
   KLIEN SUPABASE — YPI NURUL ILMI
   --------------------------------------------------------------------------
   Satu-satunya tempat yang membuat instance klien Supabase. Semua halaman
   publik dan dashboard admin memakai instance yang sama (window.NISupabase).

   Hanya memakai anon/publishable key. Akses tulis dijaga RLS di sisi
   database, bukan oleh kode frontend.

   Berkas ini juga menyediakan:
     - mediaUrl(path)        -> URL publik objek di bucket Storage
     - fetchPublishedArticles()
     - fetchFacilities()
     - submitComment()
     - incrementViews()
   ========================================================================== */
(function (window, document) {
  'use strict';

  var config = function () {
    return window.SITE_CONFIG || {};
  };

  var client = null;
  var configError = null;

  function isPlaceholder(value) {
    return !value || /GANTI_DENGAN/i.test(String(value));
  }

  function isConfigured() {
    var cfg = config();
    return !isPlaceholder(cfg.supabaseUrl) && !isPlaceholder(cfg.supabaseAnonKey);
  }

  /** Klien tunggal; dibuat saat pertama kali dibutuhkan. */
  function getClient() {
    if (client) return client;

    var cfg = config();

    if (!isConfigured()) {
      configError = 'Supabase belum dikonfigurasi. Isi supabaseUrl dan supabaseAnonKey di js/site-config.js.';
      return null;
    }

    if (!window.supabase || typeof window.supabase.createClient !== 'function') {
      configError = 'Pustaka Supabase (js/vendor/supabase.min.js) belum termuat.';
      return null;
    }

    client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });

    return client;
  }

  /** URL publik objek di bucket Storage. Path relatif dipertahankan persis. */
  function mediaUrl(path) {
    if (!path) return '';

    var value = String(path);

    if (/^https?:\/\//i.test(value)) return value;

    var cfg = config();
    var bucket = cfg.storageBucket || 'media';

    return cfg.supabaseUrl + '/storage/v1/object/public/' + bucket + '/' +
      value.replace(/^\/+/, '');
  }

  /* ------------------------------------------------------------------ */
  /*  Query artikel                                                      */
  /* ------------------------------------------------------------------ */

  var ARTICLE_COLUMNS =
    'id, title_id, content_id, title_en, content_en, image, author_name, ' +
    'status, published_at, views, created_at, updated_at, category_id, ' +
    'categories(id, name, slug), ' +
    'article_tags(id, tag_id, tags(id, name, slug)), ' +
    'article_media(id, type, path, mime_type, caption, sort_order, poster_path), ' +
    'comments(count)';

  /**
   * Ambil artikel published beserta kategori, tag, dan media.
   *
   * @param {object} options
   * @param {number} [options.limit]
   * @param {number} [options.offset]
   * @param {number} [options.categoryId]
   * @param {number} [options.tagId]
   * @param {string} [options.search]
   * @returns {Promise<{rows: Array, count: number}>}
   */
  function fetchPublishedArticles(options) {
    options = options || {};

    var db = getClient();
    if (!db) return Promise.reject(new Error(configError));

    var limit = options.limit == null ? 9 : Math.max(1, options.limit);
    var offset = options.offset == null ? 0 : Math.max(0, options.offset);

    // `!inner` membuat PostgREST memfilter baris artikel induk, bukan hanya
    // baris tag yang ikut terbawa.
    var columns = options.tagId
      ? ARTICLE_COLUMNS.replace('article_tags(id, tag_id,', 'article_tags!inner(id, tag_id,')
      : ARTICLE_COLUMNS;

    var query = db
      .from('articles')
      .select(columns, { count: 'exact' })
      .eq('status', 'published')
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (options.categoryId) query = query.eq('category_id', options.categoryId);
    if (options.tagId) query = query.eq('article_tags.tag_id', options.tagId);
    if (options.search) {
      var term = '%' + String(options.search).replace(/[%,]/g, ' ') + '%';
      query = query.or('title_id.ilike.' + term + ',title_en.ilike.' + term);
    }

    return query.then(function (result) {
      if (result.error) throw result.error;
      return { rows: result.data || [], count: result.count || 0 };
    });
  }

  /** Jumlah artikel published (untuk pagination). */
  function countPublishedArticles(options) {
    options = options || {};

    var db = getClient();
    if (!db) return Promise.reject(new Error(configError));

    var columns = options.tagId ? 'id, article_tags!inner(tag_id)' : 'id';

    var query = db
      .from('articles')
      .select(columns, { count: 'exact', head: true })
      .eq('status', 'published');

    if (options.categoryId) query = query.eq('category_id', options.categoryId);
    if (options.tagId) query = query.eq('article_tags.tag_id', options.tagId);

    return query.then(function (result) {
      if (result.error) throw result.error;
      return result.count || 0;
    });
  }

  /**
   * Fasilitas beserta unit dan foto galeri.
   *
   * @param {object} options
   * @param {string} [options.group]  'main' | 'sigma'
   * @param {string} [options.unit]   slug unit
   * @returns {Promise<Array>}
   */
  function fetchFacilities(options) {
    options = options || {};

    var db = getClient();
    if (!db) return Promise.reject(new Error(configError));

    // `!inner` memastikan hanya fasilitas yang benar-benar terhubung ke unit
    // tersebut yang dikembalikan, bukan fasilitas lain yang ikut terbawa.
    var unitJoin = options.unit
      ? 'facility_unit!inner(unit_id, units!inner(id, name, slug, group_type))'
      : 'facility_unit(id, unit_id, units(id, name, slug, group_type))';

    var query = db
      .from('facilities')
      .select(
        'id, name, slug, description, icon, is_published, group_type, sort_order, ' +
          unitJoin + ', ' +
          'facility_photos(id, image_path, caption, alt_text, sort_order, is_cover)'
      )
      .eq('is_published', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (options.group) query = query.eq('group_type', options.group);
    if (options.unit) query = query.eq('facility_unit.units.slug', options.unit);

    return query.then(function (result) {
      if (result.error) throw result.error;
      return result.data || [];
    });
  }

  /** Daftar unit pendidikan. */
  function fetchUnits() {
    var db = getClient();
    if (!db) return Promise.reject(new Error(configError));

    return db
      .from('units')
      .select('id, name, slug, group_type, description')
      .order('group_type', { ascending: true })
      .order('name', { ascending: true })
      .then(function (result) {
        if (result.error) throw result.error;
        return result.data || [];
      });
  }

  /** Tambah 1 ke counter baca artikel lewat RPC (RLS menolak UPDATE langsung). */
  function incrementViews(articleId) {
    var db = getClient();
    if (!db) return Promise.resolve(0);

    return db
      .rpc('increment_article_views', { p_article_id: articleId })
      .then(function (result) {
        if (result.error) return 0;
        return result.data || 0;
      });
  }

  /** Kirim komentar publik lewat RPC submit_comment (validasi + anti-spam). */
  function submitComment(articleId, payload) {
    var db = getClient();
    if (!db) return Promise.reject(new Error(configError));

    return db
      .rpc('submit_comment', {
        p_article_id: articleId,
        p_name: payload.name || '',
        p_email: payload.email || null,
        p_comment: payload.comment || '',
        p_hp: payload.hp || null
      })
      .then(function (result) {
        if (result.error) throw result.error;
        return result.data;
      });
  }

  /** Komentar yang sudah tayang untuk satu artikel. */
  function fetchPublishedComments(articleId) {
    var db = getClient();
    if (!db) return Promise.reject(new Error(configError));

    return db
      .from('comments')
      .select('id, name, comment, created_at')
      .eq('article_id', articleId)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .then(function (result) {
        if (result.error) throw result.error;
        return result.data || [];
      });
  }

  /** Daftar kategori yang dipublikasikan (untuk filter di halaman artikel). */
  function fetchCategories() {
    var db = getClient();
    if (!db) return Promise.reject(new Error(configError));

    return db
      .from('categories')
      .select('id, name, slug')
      .order('name', { ascending: true })
      .then(function (result) {
        if (result.error) throw result.error;
        return result.data || [];
      });
  }

  /** Daftar tag (untuk filter di halaman artikel). */
  function fetchTags() {
    var db = getClient();
    if (!db) return Promise.reject(new Error(configError));

    return db
      .from('tags')
      .select('id, name, slug')
      .order('name', { ascending: true })
      .then(function (result) {
        if (result.error) throw result.error;
        return result.data || [];
      });
  }

  /** Satu artikel published lengkap dengan media, tag, dan kategori. */
  function fetchArticle(articleId) {
    var db = getClient();
    if (!db) return Promise.reject(new Error(configError));

    return db
      .from('articles')
      .select(
        'id, title_id, content_id, title_en, content_en, image, author_name, ' +
          'status, published_at, views, created_at, updated_at, category_id, ' +
          'categories(id, name, slug), ' +
          'article_tags(id, tag_id, tags(id, name, slug)), ' +
          'article_media(id, type, path, mime_type, caption, sort_order, poster_path), ' +
          'comments(count)'
      )
      .eq('id', articleId)
      .eq('status', 'published')
      .maybeSingle()
      .then(function (result) {
        if (result.error) throw result.error;
        return result.data || null;
      });
  }

  /** URL halaman detail artikel, relatif terhadap akar situs. */
  function articleUrl(articleId) {
    var cfg = config();
    var path = String(cfg.articlesPath || 'article.html').replace(/^\/+/, '');

    return path + '?id=' + encodeURIComponent(articleId);
  }

  /* ------------------------------------------------------------------ */
  /*  Penyimpanan media                                                   */
  /* ------------------------------------------------------------------ */

  /**
   * Unggah satu berkas ke bucket Storage.
   *
   * @param {string} path  path relatif di dalam bucket
   * @param {Blob|File} file
   * @param {string} contentType
   * @returns {Promise<string>} path yang tersimpan
   */
  function uploadFile(path, file, contentType) {
    var db = getClient();
    if (!db) return Promise.reject(new Error(configError));

    var bucket = config().storageBucket || 'media';

    return db.storage
      .from(bucket)
      .upload(path, file, {
        contentType: contentType || (file && file.type) || 'application/octet-stream',
        upsert: false
      })
      .then(function (result) {
        if (result.error) throw result.error;
        return path;
      });
  }

  /** Hapus beberapa berkas dari bucket Storage. */
  function removeFiles(paths) {
    var db = getClient();
    if (!db) return Promise.resolve(null);
    if (!paths || !paths.length) return Promise.resolve(null);

    var bucket = config().storageBucket || 'media';

    return db.storage.from(bucket).remove(paths);
  }

  /* ------------------------------------------------------------------ */
  /*  Helper bentuk objek untuk tampilan                                  */
  /* ------------------------------------------------------------------ */

  /** Media artikel siap tampil.Artikel lama tanpa baris media memakai kolom image. */
  function articleMedia(article) {
    var media = (article.article_media || [])
      .slice()
      .sort(function (a, b) {
        return (a.sort_order || 0) - (b.sort_order || 0) || (a.id || 0) - (b.id || 0);
      })
      .map(function (item) {
        return {
          id: item.id,
          type: item.type,
          url: mediaUrl(item.path),
          mime: item.mime_type,
          caption: item.caption,
          sort_order: item.sort_order,
          /* Thumbnail otomatis untuk video (kalau sudah dibuat). */
          poster: item.poster_path ? mediaUrl(item.poster_path) : ''
        };
      });

    if (!media.length && article.image) {
      media.push({
        id: null,
        type: 'image',
        url: mediaUrl(article.image),
        mime: null,
        caption: null,
        sort_order: 0,
        poster: ''
      });
    }

    return media;
  }

  /**
   * Gambar sampul artikel.
   *
   * Urutannya: kolom image, lalu media gambar pertama, lalu thumbnail
   * video pertama. Artikel yang hanya punya video tetap punya sampul.
   */
  function articleCover(article) {
    if (article.image) return mediaUrl(article.image);

    var rows = article.article_media || [];

    var firstImage = rows.find(function (item) {
      return item.type === 'image';
    });

    if (firstImage) return mediaUrl(firstImage.path);

    var firstVideo = rows.find(function (item) {
      return item.type === 'video' && item.poster_path;
    });

    return firstVideo ? mediaUrl(firstVideo.poster_path) : '';
  }

  /** Tag artikel. */
  function articleTags(article) {
    return (article.article_tags || [])
      .map(function (row) { return row.tags; })
      .filter(Boolean);
  }

  /** Nama kategori artikel. */
  function articleCategory(article) {
    return article.categories ? article.categories.name : null;
  }

  /** Fasilitas + foto siap tampil (diformat ulang dari relasi PostgREST). */
  function facilityItems(rows) {
    return (rows || []).map(function (facility) {
      var units = (facility.facility_unit || [])
        .map(function (row) { return row.units; })
        .filter(Boolean);

      var photos = (facility.facility_photos || [])
        .slice()
        .sort(function (a, b) {
          return (a.sort_order || 0) - (b.sort_order || 0) || (a.id || 0) - (b.id || 0);
        })
        .map(function (photo) {
          return {
            id: photo.id,
            url: mediaUrl(photo.image_path),
            alt: photo.alt_text || '',
            caption: photo.caption || '',
            is_cover: !!photo.is_cover
          };
        });

      var cover = photos.find(function (photo) { return photo.is_cover; }) || photos[0];

      return {
        id: facility.id,
        slug: facility.slug,
        name: facility.name,
        description: facility.description || '',
        icon: facility.icon || '',
        group_type: facility.group_type,
        cover_url: cover ? cover.url : '',
        units: units.map(function (unit) { return unit.slug; }),
        unit_names: units.map(function (unit) { return unit.name; }),
        photos: photos
      };
    });
  }

  window.NISupabase = {
    getClient: getClient,
    isConfigured: isConfigured,
    configError: function () { return configError; },
    mediaUrl: mediaUrl,
    uploadFile: uploadFile,
    removeFiles: removeFiles,
    fetchPublishedArticles: fetchPublishedArticles,
    countPublishedArticles: countPublishedArticles,
    fetchArticle: fetchArticle,
    fetchCategories: fetchCategories,
    fetchTags: fetchTags,
    articleUrl: articleUrl,
    fetchFacilities: fetchFacilities,
    fetchUnits: fetchUnits,
    incrementViews: incrementViews,
    submitComment: submitComment,
    fetchPublishedComments: fetchPublishedComments,
    articleMedia: articleMedia,
    articleCover: articleCover,
    articleTags: articleTags,
    articleCategory: articleCategory,
    facilityItems: facilityItems
  };
})(window, document);
