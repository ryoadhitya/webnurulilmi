/* ==========================================================================
   HANDLER EDGE FUNCTION "translate"
   --------------------------------------------------------------------------
   Semua logika permintaan ada di berkas ini supaya bisa diuji dengan Node
   tanpa Deno. index.ts hanya memanggil serve(handleTranslate).

   Aturan main:
     - Hanya POST.
     - JWT wajib, lalu dicek peran pemanggil terhadap lima peran yang
       diizinkan (super_admin + empat admin unit).
     - Balasan sukses: { title_en, content_en }.
     - Balasan gagal:  { message } dengan teks yang bisa dibaca admin.
   ========================================================================== */
import { authorize } from './auth.ts';
import type { AuthorizeResult } from './auth.ts';
import { translateText, TranslateError } from './mymemory.ts';
import type { TranslateOptions } from './mymemory.ts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

export interface HandlerDeps {
  /** Pemeriksa JWT + peran (bisa diganti saat pengujian). */
  authorizeFn?: (request: Request) => Promise<AuthorizeResult>;
  /** Penerjemah teks (bisa diganti saat pengujian). */
  translateFn?: (text: string, options: TranslateOptions) => Promise<string>;
  /** Alamat email opsional untuk kuota MyMemory. */
  email?: string;
  /** Opsi tambahan untuk penerjemah. */
  translateOptions?: TranslateOptions;
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
  });
}

export async function handleTranslate(request: Request, deps: HandlerDeps = {}): Promise<Response> {
  const check = deps.authorizeFn || authorize;
  const translate = deps.translateFn || translateText;

  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  if (request.method !== 'POST') {
    return json({ message: 'Metode harus POST.' }, 405);
  }

  /* Otorisasi dicek lebih dulu: hanya pemanggil dengan peran yang boleh yang
     bisa menjangkau fungsi, bukan sekadar mengetes apakah fitur aktif. */
  const auth = await check(request);

  if (!auth.ok) {
    return json({ message: auth.reason }, 403);
  }

  let payload: { title_id?: string; content_id?: string };

  try {
    payload = await request.json();
  } catch {
    return json({ message: 'Badan permintaan bukan JSON yang valid.' }, 400);
  }

  const titleId = String(payload.title_id || '').trim();
  const contentId = String(payload.content_id || '').trim();

  if (!titleId || !contentId) {
    return json({ message: 'Judul dan isi bahasa Indonesia wajib diisi.' }, 400);
  }

  const options: TranslateOptions = { ...(deps.translateOptions || {}) };

  if (deps.email) options.email = deps.email;

  try {
    const titleEn = await translate(titleId, options);
    const contentEn = await translate(contentId, options);

    return json({ title_en: titleEn, content_en: contentEn });
  } catch (error) {
    const message =
      error instanceof TranslateError
        ? error.message
        : (error && (error as Error).message) ||
          'Terjemahan otomatis gagal. Isi terjemahan secara manual.';

    return json({ message }, 502);
  }
}
