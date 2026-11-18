/* ==========================================================================
   HANDLER EDGE FUNCTION "translate-public"
   --------------------------------------------------------------------------
   Versi publik dari fungsi terjemahan: dipakai pengunjung situs untuk
   menerjemahkan artikel ke bahasa Inggris. Tidak memerlukan JWT (deploy
   memakai verify_jwt = false) karena pemanggil bukan admin.

   Perbedaan penting dari Edge Function "translate" (khusus admin):
     - Tidak ada pemeriksaan peran; pengunjung tidak punya akun.
     - Ada rate limit per IP supaya kuota harian MyMemory tidak dipakai
       oleh satu orang untuk membanjiri permintaan.
     - Batas panjang teks per permintaan.

   Aturan main:
     - Hanya POST (OPTIONS menjawab preflight CORS).
     - Badan: { "text": "..." } atau { "title": "...", "content": "..." }.
     - Balasan sukses: { "text": "..." } atau { "title": "...", "content": "..." }.
     - Balasan gagal: { "message": "..." } dengan bahasa yang bisa dibaca pengunjung.
   ========================================================================== */
import { translateText, TranslateError } from './mymemory.ts';
import type { TranslateOptions } from './mymemory.ts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

/* Batas permintaan: 20 permintaan per jam per IP. */
const WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS_PER_HOUR = 20;

/* Batas panjang teks per permintaan (judul + isi). */
const MAX_CHARS_PER_REQUEST = 6000;

/* Penyimpanan rate limit per isolate Edge Function. */
const buckets = new Map<string, { count: number; resetAt: number }>();

export interface HandlerDeps {
  /** Penerjemah teks (bisa diganti saat pengujian). */
  translateFn?: (text: string, options: TranslateOptions) => Promise<string>;
  /** Alamat email opsional untuk menaikkan kuota MyMemory. */
  email?: string;
  /** Opsi tambahan untuk penerjemah. */
  translateOptions?: TranslateOptions;
  /** Sumber alamat IP pemanggil (bisa diganti saat pengujian). */
  ipFn?: (request: Request) => string;
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
  });
}

/** Ambil alamat IP pemanggil dari header yang dipasang platform. */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for') || '';
  const first = forwarded.split(',')[0].trim();

  return (
    first ||
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

/**
 * Rate limit sederhana per IP: maksimal MAX_REQUESTS_PER_HOUR permintaan
 * dalam satu jam. Bucket yang kedaluwarsa dibersihkan saat dicek.
 */
export function checkRateLimit(ip: string, now = Date.now()): { allowed: boolean; retryAfter: number } {
  const existing = buckets.get(ip);

  if (!existing || existing.resetAt <= now) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfter: 0 };
  }

  if (existing.count >= MAX_REQUESTS_PER_HOUR) {
    return { allowed: false, retryAfter: Math.ceil((existing.resetAt - now) / 1000) };
  }

  existing.count += 1;

  return { allowed: true, retryAfter: 0 };
}

/** Buang bucket yang sudah kedaluwarsa agar memori tidak menumpuk. */
function pruneBuckets(now: number): void {
  buckets.forEach((bucket, key) => {
    if (bucket.resetAt <= now) buckets.delete(key);
  });
}

export async function handleTranslatePublic(request: Request, deps: HandlerDeps = {}): Promise<Response> {
  const translate = deps.translateFn || translateText;

  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  if (request.method !== 'POST') {
    return json({ message: 'Metode harus POST.' }, 405);
  }

  const ip = (deps.ipFn || clientIp)(request);

  pruneBuckets(Date.now());

  const limit = checkRateLimit(ip);

  if (!limit.allowed) {
    return json(
      {
        message:
          'Terlalu banyak permintaan terjemahan dari perangkat ini. Coba lagi dalam ' +
          Math.ceil(limit.retryAfter / 60) +
          ' menit.'
      },
      429
    );
  }

  let payload: { text?: string; title?: string; content?: string; target?: string };

  try {
    payload = await request.json();
  } catch {
    return json({ message: 'Permintaan tidak valid.' }, 400);
  }

  const target = String(payload.target || 'en').trim().toLowerCase();

  if (target !== 'en') {
    return json({ message: 'Hanya terjemahan ke bahasa Inggris yang tersedia.' }, 400);
  }

  const title = String(payload.title == null ? '' : payload.title).trim();
  const content = String(payload.content == null ? '' : payload.content).trim();
  const text = String(payload.text == null ? '' : payload.text).trim();

  const hasTitle = title.length > 0;
  const hasContent = content.length > 0;
  const hasText = text.length > 0;

  if (!hasTitle && !hasContent && !hasText) {
    return json({ message: 'Teks yang akan diterjemahkan kosong.' }, 400);
  }

  if (title.length + content.length + text.length > MAX_CHARS_PER_REQUEST) {
    return json(
      { message: 'Teks terlalu panjang untuk diterjemahkan sekaligus. Coba lagi dengan teks yang lebih pendek.' },
      400
    );
  }

  const options: TranslateOptions = { ...(deps.translateOptions || {}) };

  if (deps.email) options.email = deps.email;

  try {
    if (hasText) {
      const translated = await translate(text, options);

      return json({ text: translated, target });
    }

    const result: { title?: string; content?: string; target: string } = { target };

    if (hasTitle) result.title = await translate(title, options);
    if (hasContent) result.content = await translate(content, options);

    return json(result);
  } catch (error) {
    const message =
      error instanceof TranslateError
        ? error.message
        : (error && (error as Error).message) ||
          'Layanan terjemahan sedang tidak tersedia. Coba lagi sebentar lagi.';

    return json({ message }, 502);
  }
}
