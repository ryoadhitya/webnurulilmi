/* ==========================================================================
   KONFIGURASI SUPABASE — YPI NURUL ILMI
   --------------------------------------------------------------------------
   SATU-SATUNYA tempat untuk mengisi alamat project Supabase dan kunci publik.

   supabaseUrl      -> Project URL dari Supabase Dashboard > API Settings.
                       Contoh: https://abcdefghijklm.supabase.co
   supabaseAnonKey  -> Kunci publishable / anon (aman dipublikasikan).
                       JANGAN pernah memakai service_role key di file ini.
   adminLoginPath   -> Halaman login dashboard admin (relatif dari root situs).
   articlesPath     -> Halaman detail artikel.
   ========================================================================== */
window.SITE_CONFIG = {
  supabaseUrl: 'https://icsjlefzeeifgncbdgdj.supabase.co',
  supabaseAnonKey: 'sb_publishable_o5OtfzuAfhwHvbwPGwSx3A_cAFE6Tab',

  adminLoginPath: 'admin/login.html',
  articlesPath: 'article.html',

  /* Domain produksi. Dipakai untuk tautan share supaya yang dibagikan
     bukan alamat localhost saat website dibuka dari komputer lokal. */
  siteUrl: 'https://www.ypinurulilmi.or.id',

  /* Bucket Storage untuk media artikel & fasilitas. */
  storageBucket: 'media'
};

/* Key dibaca dari query string untuk pengembangan lokal, contoh:
   ?supabase=1&url=https://xxx.supabase.co&key=pub_xxx
   Query string hanya dipakai di localhost. */
(function (window, document) {
  'use strict';

  var config = window.SITE_CONFIG;
  var host = (window.location.hostname || '').toLowerCase();
  var isLocal = host === 'localhost' || host === '127.0.0.1' ||
    host === '::1' || host === '[::1]';

  if (!isLocal) return;

  var params = new window.URLSearchParams(window.location.search);
  var url = params.get('supabase_url') || params.get('url');
  var key = params.get('supabase_key') || params.get('key');

  if (url) config.supabaseUrl = url;
  if (key) config.supabaseAnonKey = key;
})(window, document);
