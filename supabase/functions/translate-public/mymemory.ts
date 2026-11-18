/* ==========================================================================
   TERJEMAHAN OTOMATIS — MyMemory Translation API
   --------------------------------------------------------------------------
   Dipakai oleh Edge Function "translate". Modul ini sengaja ditulis tanpa
   API khusus Deno supaya bisa diuji langsung dengan Node.

   MyMemory tidak memakai API key. Endpoint:
     https://api.mymemory.translated.net/get?q=<teks>&langpair=id|en

   Catatan penting dari MyMemory:
     - Panjang maksimal satu query adalah 500 karakter, jadi teks panjang
       harus dipecah menjadi beberapa bagian.
     - HTTP 200 belum tentu berarti berhasil: MyMemory mengembalikan
       responseStatus 403 dengan responseDetails seperti
       "QUERY LENGTH LIMIT EXCEEDED" atau "MEMORY LIMIT REACHED".
     - Kuota harian terbatas (anon jauh lebih kecil daripada pengguna
       yang menyertakan alamat email lewat parameter "de").
   ========================================================================== */

export const MYMEMORY_ENDPOINT = 'https://api.mymemory.translated.net/get';

/* Batas aman per request (dijaga di bawah 500 karakter). */
export const DEFAULT_MAX_CHARS = 450;

/* Waktu tunggu satu request (ms). */
export const DEFAULT_TIMEOUT_MS = 15000;

export interface TranslateOptions {
  /** Alamat email opsional untuk menaikkan kuota harian MyMemory. */
  email?: string;
  /** Pasangan bahasa, default id|en. */
  langpair?: string;
  /** Batas panjang satu bagian (karakter). */
  maxChars?: number;
  /** Waktu tunggu satu request (ms). */
  timeoutMs?: number;
  /** Fungsi fetch (untuk pengujian). */
  fetchImpl?: typeof fetch;
}

export interface TextPart {
  /** Isi bagian teks. */
  text: string;
  /** Pemisah sebelum bagian ini: pemisah paragraf atau spasi. */
  sep: string;
}

/** Kesalahan terjemahan dengan pesan yang siap ditampilkan ke admin. */
export class TranslateError extends Error {
  code: string;

  constructor(message: string, code = 'gagal') {
    super(message);
    this.name = 'TranslateError';
    this.code = code;
  }
}

/** Baca environment variable di Deno maupun Node. */
export function readEnv(name: string): string {
  const deno = (globalThis as any).Deno;

  if (deno && deno.env && typeof deno.env.get === 'function') {
    return String(deno.env.get(name) || '').trim();
  }

  const proc = (globalThis as any).process;

  if (proc && proc.env) return String(proc.env[name] || '').trim();

  return '';
}

/**
 * Pecah teks panjang menjadi bagian-bagian yang aman dikirim ke MyMemory.
 *
 * Paragraf tidak pernah dipecah di tengah kalimat. Paragraf yang terlalu
 * panjang dipecah per kalimat, lalu kalimat yang lebih panjang dari batas
 * dipotong keras. Pemisah paragraf ("\n\n") dan spasi ikut dipertahankan
 * agar susunan teks hasil terjemahan tetap rapi.
 */
export function splitText(text: string, maxChars = DEFAULT_MAX_CHARS): TextPart[] {
  const source = String(text == null ? '' : text).trim();

  if (!source) return [];

  const limit = Math.max(50, maxChars);
  const parts: TextPart[] = [];

  function push(chunk: string, sep: string) {
    const value = chunk.trim();

    if (!value) return;

    parts.push({ text: value, sep });
  }

  function splitLongParagraph(paragraph: string): void {
    const sentences = paragraph.split(/(?<=[.!?])\s+/).filter(Boolean);

    let buffer = '';

    sentences.forEach((sentence) => {
      if (sentence.length > limit) {
        if (buffer) {
          push(buffer, ' ');
          buffer = '';
        }

        for (let start = 0; start < sentence.length; start += limit) {
          push(sentence.slice(start, start + limit), ' ');
        }

        return;
      }

      if (!buffer) {
        buffer = sentence;
      } else if (buffer.length + 1 + sentence.length <= limit) {
        buffer += ' ' + sentence;
      } else {
        push(buffer, ' ');
        buffer = sentence;
      }
    });

    if (buffer) push(buffer, ' ');
  }

  const paragraphs = source.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean);

  paragraphs.forEach((paragraph, index) => {
    const sep = index === 0 ? '' : '\n\n';

    if (paragraph.length <= limit) {
      push(paragraph, sep);
      return;
    }

    /* Paragraf panjang: pecah per kalimat, bagian pertama memakai pemisah
       paragraf asalnya. */
    const before = parts.length;

    splitLongParagraph(paragraph);

    if (parts.length > before) parts[before].sep = sep;
  });

  return parts;
}

/** Ubah entitas HTML yang dikembalikan MyMemory menjadi karakter asli. */
export function decodeEntities(text: string): string {
  const named: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&apos;': "'",
    '&#39;': "'",
    '&#039;': "'",
    '&nbsp;': ' '
  };

  return String(text == null ? '' : text)
    .replace(/&#x([0-9a-f]+);/gi, (_match, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_match, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&(amp|lt|gt|quot|apos|nbsp|#39|#039);/g, (match) => named[match] || match);
}

/**
 * Terjemahkan satu bagian teks lewat MyMemory.
 */
export async function translateChunk(chunk: string, options: TranslateOptions = {}): Promise<string> {
  const fetchImpl = options.fetchImpl || fetch;
  const langpair = options.langpair || 'id|en';
  const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;

  const url = new URL(MYMEMORY_ENDPOINT);
  url.searchParams.set('q', chunk);
  url.searchParams.set('langpair', langpair);

  /* Email hanya dipakai kalau memang diatur (-kuota harian lebih besar). */
  const email = (options.email || '').trim();

  if (email) url.searchParams.set('de', email);

  let response: Response;

  try {
    response = await fetchImpl(url.toString(), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(timeoutMs)
    });
  } catch (error) {
    const reason = error && (error as Error).name === 'TimeoutError'
      ? 'waktu tunggu habis'
      : ((error && (error as Error).message) || 'tidak dapat menghubungi MyMemory');

    throw new TranslateError(
      'Tidak dapat menghubungi layanan terjemahan MyMemory (' + reason + '). Isi terjemahan secara manual.',
      'jaringan'
    );
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new TranslateError(
      'MyMemory menolak permintaan (HTTP ' + response.status + '). Isi terjemahan secara manual.',
      'http'
    );
  }

  if (!payload || typeof payload !== 'object') {
    throw new TranslateError('MyMemory tidak mengembalikan data yang bisa dibaca.', 'respons_kosong');
  }

  const status = String(payload.responseStatus == null ? '' : payload.responseStatus);
  const details = String(payload.responseDetails || '').trim();

  if (status && status !== '200') {
    const lower = details.toLowerCase();

    if (lower.includes('memory limit') || lower.includes('quota')) {
      throw new TranslateError(
        'Kuota harian MyMemory sudah habis untuk alamat ini. Tunggu kuota berikutnya atau isi terjemahan secara manual.',
        'kuota'
      );
    }

    if (lower.includes('query length')) {
      throw new TranslateError(
        'MyMemory menolak teks yang terlalu panjang (' + details + '). Isi terjemahan secara manual.',
        'terlalu_panjang'
      );
    }

    if (lower.includes('language')) {
      throw new TranslateError(
        'Pasangan bahasa id|en tidak dikenali MyMemory (' + details + '). Isi terjemahan secara manual.',
        'bahasa'
      );
    }

    throw new TranslateError(
      'MyMemory gagal menerjemahkan (' + (details || 'status ' + status) + '). Isi terjemahan secara manual.',
      'api'
    );
  }

  const translated = payload.responseData && payload.responseData.translatedText;

  if (typeof translated !== 'string' || !translated.trim()) {
    throw new TranslateError('MyMemory tidak mengembalikan hasil terjemahan.', 'respons_kosong');
  }

  return decodeEntities(translated);
}

/**
 * Terjemahkan teks utuh: pecah menjadi bagian aman, terjahkan tiap bagian,
 * lalu gabungkan kembali dengan pemisah aslinya.
 */
export async function translateText(text: string, options: TranslateOptions = {}): Promise<string> {
  const parts = splitText(text, options.maxChars || DEFAULT_MAX_CHARS);

  if (!parts.length) {
    throw new TranslateError('Teks yang akan diterjemahkan kosong.', 'kosong');
  }

  const results: string[] = [];

  for (const part of parts) {
    const translated = await translateChunk(part.text, options);

    results.push((results.length ? part.sep : '') + translated.trim());

    /* MyMemory membatasi permintaan per detik; jeda pendek antar bagian. */
    if (parts.length > 1) await new Promise((resolve) => setTimeout(resolve, 250));
  }

  return results.join('');
}
