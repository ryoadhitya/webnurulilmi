/* ==========================================================================
   GANTI PASSWORD ADMIN DI SUPABASE AUTH
   --------------------------------------------------------------------------
   Password baru dibaca dari .env (variabel SUPABASE_ADMIN_PASSWORD), lalu
   disalin ke akun Supabase Auth. Nilai password tidak pernah dicetak ke
   terminal, log, atau source code.

   Urutan yang disarankan:
     1. Buka .env, ganti nilai SUPABASE_ADMIN_PASSWORD dengan password baru.
     2. Jalankan: node scripts/set-admin-password.mjs
     3. Uji masuk: node scripts/test-admin-dashboard.mjs

   Berkas .env tidak pernah masuk git (sudah di-ignore), jadi password baru
   tidak ikut ter-commit.
   ========================================================================== */
import { ROOT, loadEnv } from './lib/env.mjs';

loadEnv();

function adminEmail() {
  return (process.env.SUPABASE_ADMIN_EMAIL || 'admin@ypinurulilmi.or.id').trim().toLowerCase();
}

async function main() {
  const url = (process.env.SUPABASE_URL || '').trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const password = process.env.SUPABASE_ADMIN_PASSWORD || '';

  if (!url || !serviceKey) {
    console.error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY belum diisi di .env.');
    process.exit(1);
  }

  if (!password) {
    console.error('SUPABASE_ADMIN_PASSWORD masih kosong di .env.');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('Password minimal 8 karakter.');
    process.exit(1);
  }

  const headers = { apikey: serviceKey, Authorization: 'Bearer ' + serviceKey };
  const email = adminEmail();

  const list = await (await fetch(url + '/auth/v1/admin/users', { headers })).json();
  const user = (list.users || []).find((item) => item.email === email);

  if (!user) {
    console.error('Akun ' + email + ' tidak ditemukan di Supabase Auth.');
    console.error('Jalankan dulu: node scripts/seed-admin.mjs');
    process.exit(1);
  }

  const response = await fetch(url + '/auth/v1/admin/users/' + user.id, {
    method: 'PUT',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });

  if (!response.ok) {
    console.error('Gagal mengganti password: HTTP ' + response.status);
    console.error((await response.text()).slice(0, 300));
    process.exit(1);
  }

  console.log('Password akun ' + email + ' berhasil diperbarui.');
  console.log('Panjang password baru: ' + password.length + ' karakter (nilainya tidak ditampilkan).');
  console.log('');
  console.log('Langkah berikutnya:');
  console.log('  node scripts/test-admin-dashboard.mjs');
}

main().catch((error) => {
  console.error('Gagal: ' + error.message);
  process.exit(1);
});
