/* ==========================================================================
   PEMERIKSAAN JWT + PERAN UNTUK EDGE FUNCTION "translate"
   --------------------------------------------------------------------------
   Dua lapis pemeriksaan:

     1. JWT: token pemanggil diverifikasi oleh Supabase (verify_jwt bawaan
        pada saat deploy) dan di sini diperiksa ulang lewat endpoint
        /auth/v1/user.
     2. Peran: hanya lima peran berikut yang boleh memakai terjemahan
        otomatis (admin yayasan dan empat admin unit).

   Modul memakai fetch biasa (bukan SDK) supaya bisa diuji dengan Node dan
   tidak menambah dependensi di dalam bundle Edge Function.
   ========================================================================== */

import { readEnv } from './mymemory.ts';

/* Lima peran hasil migrasi RBAC. */
export const ALLOWED_ROLES = [
  'super_admin',
  'tk_nurul_ilmi',
  'sd_nurul_ilmi',
  'smp_nurul_ilmi',
  'sigma_nurul_ilmi'
];

export interface AuthorizeResult {
  ok: boolean;
  reason?: string;
  userId?: string;
  role?: string;
}

/**
 * Periksa token dan peran pemanggil.
 */
export async function authorize(request: Request): Promise<AuthorizeResult> {
  const supabaseUrl = readEnv('SUPABASE_URL');
  const anonKey = readEnv('SUPABASE_ANON_KEY');
  const authorization = request.headers.get('Authorization') || '';

  if (!supabaseUrl || !anonKey) {
    return { ok: false, reason: 'Konfigurasi Supabase Edge Function belum lengkap.' };
  }

  if (!authorization) {
    return { ok: false, reason: 'Tidak ada token autentikasi.' };
  }

  const token = authorization.replace(/^Bearer\s+/i, '').trim();

  if (!token) {
    return { ok: false, reason: 'Token autentikasi tidak valid.' };
  }

  /* 1. Verifikasi JWT: uid dari session yang sah. */
  let user: { id?: string } | null = null;

  try {
    const response = await fetch(supabaseUrl + '/auth/v1/user', {
      headers: {
        apikey: anonKey,
        Authorization: 'Bearer ' + token
      }
    });

    if (!response.ok) {
      return { ok: false, reason: 'Sesi tidak valid atau sudah berakhir.' };
    }

    user = await response.json();
  } catch {
    return { ok: false, reason: 'Tidak dapat memverifikasi sesi pengguna.' };
  }

  if (!user || !user.id) {
    return { ok: false, reason: 'Sesi tidak valid atau sudah berakhir.' };
  }

  /* 2. Periksa peran dari tabel user_roles. */
  let role: string | null = null;

  try {
    const response = await fetch(
      supabaseUrl +
        '/rest/v1/user_roles?select=role&user_id=eq.' +
        encodeURIComponent(user.id) +
        '&limit=1',
      {
        headers: {
          apikey: anonKey,
          Authorization: 'Bearer ' + token
        }
      }
    );

    if (!response.ok) {
      return { ok: false, reason: 'Peran pengguna tidak dapat dibaca.' };
    }

    const rows = await response.json();

    if (Array.isArray(rows) && rows.length) role = rows[0].role || null;
  } catch {
    return { ok: false, reason: 'Peran pengguna tidak dapat dibaca.' };
  }

  if (!role || ALLOWED_ROLES.indexOf(role) === -1) {
    return { ok: false, reason: 'Peran tidak diizinkan memakai terjemahan otomatis.' };
  }

  return { ok: true, userId: user.id, role };
}
