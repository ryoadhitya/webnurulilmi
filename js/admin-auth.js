/* ==========================================================================
   AUTENTIKASI DASHBOARD ADMIN — YPI NURUL ILMI
   --------------------------------------------------------------------------
   Memakai Supabase Auth (email + password). Peran diambil dari tabel
   public.user_roles, yang hanya bisa dibaca oleh pemiliknya sendiri.

   RULES:
     - Guard di file ini hanya untuk UX. Pengaman sesungguhnya ada di RLS.
     - Tidak pernah ada service_role key di frontend.
   ========================================================================== */
(function (window, document) {
  'use strict';

  var USER_KEY = 'ni_admin_user';

  function api() {
    return window.NISupabase || null;
  }

  function client() {
    if (!api()) return null;
    return api().getClient();
  }

  function storage() {
    try {
      return window.localStorage;
    } catch (error) {
      return null;
    }
  }

  function cacheUser(user) {
    var store = storage();
    if (!store) return;

    try {
      if (user) store.setItem(USER_KEY, JSON.stringify(user));
      else store.removeItem(USER_KEY);
    } catch (error) {
      /* penyimpanan tidak tersedia (mode privat) */
    }
  }

  function cachedUser() {
    var store = storage();
    if (!store) return null;

    try {
      var raw = store.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  /** Sesi Supabase yang sedang aktif, atau null. */
  function session() {
    var db = client();
    if (!db) return Promise.resolve(null);

    return db.auth.getSession().then(function (result) {
      return result && result.data ? result.data.session : null;
    });
  }

  /** Pengguna yang sedang login. */
  function currentUser() {
    var db = client();
    if (!db) return Promise.resolve(null);

    return db.auth.getUser().then(function (result) {
      var user = result && result.data ? result.data.user : null;
      cacheUser(user);
      return user;
    });
  }

  /**
   * Peran efektif user. Lima peran hasil migrasi RBAC:
   * 'super_admin' | 'tk_nurul_ilmi' | 'sd_nurul_ilmi' | 'smp_nurul_ilmi'
   * | 'sigma_nurul_ilmi'.
   * Hanya akun dengan baris di public.user_roles yang punya peran.
   */
  function role() {
    var db = client();
    if (!db) return Promise.resolve(null);

    return db.auth.getUser().then(function (result) {
      var user = result && result.data ? result.data.user : null;
      if (!user) return null;

      return db
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(function (roleResult) {
          if (roleResult.error) return null;
          return roleResult.data ? roleResult.data.role : null;
        });
    });
  }

  /**
   * Unit yang boleh dikelola oleh user ini.
   * Super_admin tidak punya baris di user_units (artinya seluruh unit).
   *
   * @returns {Promise<Array<{id: number, slug: string, name: string}>>}
   */
  function units() {
    var db = client();
    if (!db) return Promise.resolve([]);

    return db.auth.getUser().then(function (result) {
      var user = result && result.data ? result.data.user : null;
      if (!user) return [];

      return db
        .from('user_units')
        .select('unit_id, units(id, slug, name)')
        .eq('user_id', user.id)
        .then(function (unitResult) {
          if (unitResult.error) return [];

          return (unitResult.data || [])
            .map(function (row) {
              return row.units;
            })
            .filter(Boolean);
        });
    });
  }

  /** Masuk dengan email + password. */
  function signIn(email, password) {
    var db = client();
    if (!db) {
      return Promise.resolve({
        ok: false,
        message: 'Supabase belum dikonfigurasi. Isi js/site-config.js lebih dulu.'
      });
    }

    return db.auth
      .signInWithPassword({
        email: String(email || '').trim().toLowerCase(),
        password: String(password || '')
      })
      .then(function (result) {
        if (result.error) {
          var message = 'Email atau password salah.';

          if (/invalid login credentials/i.test(result.error.message)) {
            message = 'Email atau password salah.';
          } else if (/email not confirmed/i.test(result.error.message)) {
            message = 'Email belum dikonfirmasi. Periksa kotak masuk email Anda.';
          } else if (/rate limit/i.test(result.error.message)) {
            message = 'Terlalu banyak percobaan masuk. Coba lagi beberapa saat lagi.';
          }

          return { ok: false, message: message };
        }

        cacheUser(result.data.user);

        return { ok: true, user: result.data.user };
      })
      .catch(function (error) {
        return { ok: false, message: error.message || 'Gagal masuk.' };
      });
  }

  /** Keluar dari dashboard. */
  function signOut() {
    var db = client();
    cacheUser(null);

    if (!db) return Promise.resolve();

    return db.auth.signOut();
  }

  /** Path absolut halaman login dari path saat ini. */
  function loginPath() {
    var cfg = window.SITE_CONFIG || {};
    var file = String(cfg.adminLoginPath || 'admin/login.html').replace(/^.*\//, '');

    // Akar situs: everything sebelum segmen "/admin/".
    var path = window.location.pathname;
    var match = path.match(/^(.*)\/admin\/[^/]*$/);

    return (match ? match[1] : '') + '/admin/' + file;
  }

  /**
   * Path absolut dari lokasi sekarang relatif terhadap akar server.
   * Segmen /admin/ sengaja disertakan supaya halaman login bisa mengembalikan
   * pengguna ke halaman yang sama setelah login.
   */
  function siteRelativePath() {
    return window.location.pathname;
  }

  /**
   * Penjaga halaman admin.
   *
   * @param {object} [options]
   * @param {string[]} [options.roles] Peran yang boleh akses. Kosong = semua
   *                                    peran yang punya di user_roles.
   * @returns {Promise<{ok: boolean, user: object|null, role: string|null}>}
   */
  function guard(options) {
    options = options || {};

    var db = client();

    if (!db) {
      window.location.replace(loginPath());
      return Promise.resolve({ ok: false, user: null, role: null });
    }

    return db.auth.getSession().then(function (result) {
      var active = result && result.data ? result.data.session : null;

      if (!active) {
        var next = siteRelativePath() + window.location.search;
        window.location.replace(loginPath() + '?next=' + encodeURIComponent(next));
        return { ok: false, user: null, role: null };
      }

      return currentUser().then(function (user) {
        return role().then(function (userRole) {
          if (!userRole) {
            window.location.replace(loginPath() + '?error=' + encodeURIComponent(
              'Akun ini belum memiliki peran pada dashboard.'
            ));
            return { ok: false, user: user, role: null };
          }

          if (options.roles && options.roles.indexOf(userRole) === -1) {
            window.location.replace(
              window.location.pathname.replace(/[^/]*$/, 'articles.html') + '?error=' +
              encodeURIComponent('Peran Anda tidak memiliki akses ke halaman tersebut.')
            );
            return { ok: false, user: user, role: userRole };
          }

          return { ok: true, user: user, role: userRole };
        });
      });
    });
  }

  /** Beri tahu pemanggil saat status auth berubah. */
  function onChange(callback) {
    var db = client();
    if (!db) return;

    db.auth.onAuthStateChange(function (event, active) {
      callback(event, active && active.user ? active.user : null);
    });
  }

  window.NIAuth = {
    client: client,
    session: session,
    currentUser: currentUser,
    cachedUser: cachedUser,
    role: role,
    units: units,
    signIn: signIn,
    signOut: signOut,
    guard: guard,
    onChange: onChange,
    loginPath: loginPath
  };
})(window, document);
