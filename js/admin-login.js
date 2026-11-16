/* ==========================================================================
   HALAMAN LOGIN ADMIN — YPI NURUL ILMI
   --------------------------------------------------------------------------
   Menggantikan routes admin.login.store (Laravel) dengan Supabase Auth.
   Pesan error diterjemahkan ke bahasa Indonesia (lihat js/admin-auth.js).
   ========================================================================== */
(function (window, document) {
  'use strict';

  var form = document.getElementById('login-form');
  var alertBox = document.getElementById('login-alert');
  var submitButton = document.getElementById('login-submit');

  function showAlert(message) {
    if (!alertBox) return;

    alertBox.textContent = message;
    alertBox.classList.remove('hidden');
  }

  function clearAlert() {
    if (!alertBox) return;

    alertBox.textContent = '';
    alertBox.classList.add('hidden');
  }

  function setBusy(busy) {
    if (!submitButton) return;

    submitButton.disabled = busy;
    submitButton.classList.toggle('cursor-wait', busy);
    submitButton.classList.toggle('opacity-70', busy);
  }

  /** Halaman tujuan setelah login berhasil. */
  function nextPage() {
    var params = new window.URLSearchParams(window.location.search);
    var next = params.get('next');

    if (!next) return 'articles.html';

    /* Hanya terima path absolut dari server sendiri (mencegah open redirect).
       Path ini sudah berisi segmen /admin/ karena dikirim oleh guard. */
    if (next.charAt(0) === '/' && next.indexOf('//') !== 0) {
      return next;
    }

    return 'articles.html';
  }

  function boot() {
    var year = document.getElementById('login-year');
    if (year) year.textContent = new Date().getFullYear();

    // Pesan error dari halaman lain (mis. guard admin).
    var params = new window.URLSearchParams(window.location.search);
    var error = params.get('error');
    if (error) showAlert(error);

    if (!window.NISupabase || !window.NISupabase.isConfigured()) {
      showAlert(
        (window.NISupabase && window.NISupabase.configError()) ||
        'Supabase belum dikonfigurasi.'
      );
      setBusy(true);
    }

    // Sudah punya sesi -> langsung ke dashboard.
    window.NIAuth.session().then(function (session) {
      if (!session) return;

      window.NIAuth.role().then(function (role) {
        if (role) {
          window.location.replace(nextPage());
        }
      });
    });
  }

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      clearAlert();
      setBusy(true);

      var email = document.getElementById('email').value;
      var password = document.getElementById('password').value;

      window.NIAuth.signIn(email, password).then(function (result) {
        if (!result.ok) {
          showAlert(result.message);
          setBusy(false);
          return;
        }

        // Akun tanpa peran tidak boleh masuk dashboard.
        window.NIAuth.role().then(function (role) {
          if (!role) {
            showAlert('Akun ini belum memiliki peran pada dashboard.');
            window.NIAuth.signOut();
            setBusy(false);
            return;
          }

          window.location.replace(nextPage());
        });
      });
    });
  }

  boot();
})(window, document);
