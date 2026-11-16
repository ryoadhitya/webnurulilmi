/* ==========================================================================
   GANTI PASSWORD AKUN ADMIN — YPI NURUL ILMI
   --------------------------------------------------------------------------
   Alur:
     1. Password lama diverifikasi dengan masuk ulang (signInWithPassword).
     2. Password baru dipasang lewat supabase.auth.updateUser() memakai JWT
        sesi pengguna sendiri — bukan service_role.
     3. Password tidak pernah ditulis ke DOM, log, atau storage.

   Halaman ini hanya tersedia untuk akun yang sedang login.
   ========================================================================== */
(function (window, document) {
  'use strict';

  var api = window.NISupabase;
  var admin = window.NIAdmin;

  var MIN_LENGTH = 8;

  function showError(message) {
    var box = document.getElementById('password-error');
    if (!box) return;

    box.classList.remove('hidden');
    box.innerHTML = [
      '<p class="font-bold">Periksa kembali isian berikut:</p>',
      '<ul class="mt-1 list-inside list-disc space-y-1">',
      '<li>' + window.NIUtils.escapeHtml(message) + '</li>',
      '</ul>'
    ].join('\n');
  }

  function clearError() {
    var box = document.getElementById('password-error');
    if (!box) return;

    box.classList.add('hidden');
    box.innerHTML = '';
  }

  function init() {
    var form = document.getElementById('password-form');
    if (!form) return;

    var currentInput = document.getElementById('current_password');
    var newInput = document.getElementById('new_password');
    var confirmInput = document.getElementById('confirm_password');
    var submit = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      clearError();

      var currentPassword = currentInput.value;
      var newPassword = newInput.value;
      var confirmPassword = confirmInput.value;

      if (!currentPassword) {
        showError('Password lama wajib diisi.');
        return;
      }

      if (newPassword.length < MIN_LENGTH) {
        showError('Password baru minimal ' + MIN_LENGTH + ' karakter.');
        return;
      }

      if (newPassword === currentPassword) {
        showError('Password baru harus berbeda dari password lama.');
        return;
      }

      if (newPassword !== confirmPassword) {
        showError('Konfirmasi password tidak sama dengan password baru.');
        return;
      }

      var db = api.getClient();
      if (!db) {
        showError('Supabase belum dikonfigurasi.');
        return;
      }

      if (submit) submit.disabled = true;

      window.NIAuth.currentUser()
        .then(function (user) {
          if (!user) throw new Error('Sesi berakhir. Silakan login kembali.');

          /* Verifikasi password lama dulu. */
          return db.auth.signInWithPassword({
            email: user.email,
            password: currentPassword
          }).then(function (result) {
            if (result.error) {
              throw new Error('Password lama salah.');
            }

            return db.auth.updateUser({ password: newPassword });
          });
        })
        .then(function (result) {
          if (result && result.error) {
            throw new Error(result.error.message || 'Gagal mengganti password.');
          }

          admin.flash('Password berhasil diganti. Gunakan password baru saat login berikutnya.', 'success');

          form.reset();
        })
        .catch(function (error) {
          showError(error.message || 'Gagal mengganti password.');
        })
        .then(function () {
          if (submit) submit.disabled = false;
        });
    });
  }

  window.NIAdminPassword = {
    init: init
  };
})(window, document);
