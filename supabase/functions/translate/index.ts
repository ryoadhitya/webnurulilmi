/* ==========================================================================
   EDGE FUNCTION "translate" — terjemahan otomatis ID -> EN
   --------------------------------------------------------------------------
   Memakai MyMemory Translation API (gratis, tanpa kunci API dan tanpa
   aktivasi billing Google Cloud):

     https://api.mymemory.translated.net/get?q=<teks>&langpair=id|en

   Tidak ada secret yang wajib diisi. Secret opsional:
     MYMEMORY_EMAIL = alamat email (menaikkan kuota harian MyMemory)

   Semua secret hanya dibaca di dalam Edge Function dan tidak pernah
   menyentuh frontend.

   Autentikasi: JWT wajib (verify_jwt bawaan Supabase). Selain itu peran
   pemanggil diperiksa terhadap public.user_roles; hanya admin yayasan
   (super_admin) dan empat admin unit yang boleh memakai fungsi ini.

   Format permintaan dan jawaban tetap sama seperti versi sebelumnya
   supaya tombol terjemahan di dashboard admin tidak berubah:

     POST  { "title_id": "...", "content_id": "..." }
     200   { "title_en": "...", "content_en": "..." }
   ========================================================================== */
/* Impor URL Deno tidak bisa diresolve oleh server TypeScript bawaan editor
   (bukan Deno-aware), sehingga muncul galat "Cannot find module". Deno
   sendiri tetap mengimpor modul std ini dengan benar. */
// @ts-ignore
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

import { handleTranslate } from './handler.ts';
import { readEnv } from './mymemory.ts';

serve(async (request: Request): Promise<Response> => {
  /* Email opsional untuk menaikkan kuota harian MyMemory. */
  const email = readEnv('MYMEMORY_EMAIL');

  return handleTranslate(request, { email });
});
