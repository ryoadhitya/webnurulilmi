/* ==========================================================================
   EDGE FUNCTION "translate-public" — terjemahan artikel untuk pengunjung
   --------------------------------------------------------------------------
   Memakai MyMemory Translation API (gratis, tanpa kunci API dan tanpa
   aktivasi billing Google Cloud):

     https://api.mymemory.translated.net/get?q=<teks>&langpair=id|en

   Fungsi ini dipasang dengan verify_jwt = false karena pemanggilnya
   pengunjung situs, bukan admin yang sudah login. Keamanan minimum
   dijaga lewat rate limit per IP di handler.ts.

   Secret opsional:
     MYMEMORY_EMAIL = alamat email (menaikkan kuota harian MyMemory)

   Format permintaan dan jawaban:

     POST  { "title": "...", "content": "..." }
     200   { "title": "...", "content": "...", "target": "en" }
   ========================================================================== */
/* Impor URL Deno tidak bisa diresolve oleh server TypeScript bawaan editor
   (bukan Deno-aware), sehingga muncul galat "Cannot find module". Deno
   sendiri tetap mengimpor modul std ini dengan benar. */
// @ts-ignore
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

import { handleTranslatePublic } from './handler.ts';
import { readEnv } from './mymemory.ts';

serve(async (request: Request): Promise<Response> => {
  /* Email opsional untuk menaikkan kuota harian MyMemory. */
  const email = readEnv('MYMEMORY_EMAIL');

  return handleTranslatePublic(request, { email });
});
