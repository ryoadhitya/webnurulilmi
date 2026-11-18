/* ==========================================================================
   MIGRASI 000400 — KOMENTAR TAYANG LANGSUNG
   --------------------------------------------------------------------------
   Tujuan:
     1. RPC submit_comment sebelumnya menyimpan komentar baru dengan status
        'pending'. Policy RLS hanya membuka komentar berstatus 'published'
        untuk pengunjung, jadi komentar yang baru dikirim tidak pernah
        terlihat sampai admin meny moderatorasinya. Sekarang komentar baru
        langsung disimpan sebagai 'published' sehingga muncul di halaman
        artikel tanpa perlu refresh, dan tetap ada saat halaman dibuka lagi.
     2. Email tidak lagi menjadi field wajib: kolom email tetap ada di
        tabel comments (data lama tidak berubah) dan tetap dibaca bila
        suatu saat diisi, tetapi pengunjung boleh mengirim komentar hanya
        dengan nama dan isi komentar.
     3. Mekanisme anti-spam tetap berjalan: honeypot, rate limit 5 jam per
        IP, batas panjang nama/komentar, dan syarat artikel published.
     4. Moderasi tetap tersedia: admin tetap bisa menandai komentar sebagai
        'spam' atau memindahkannya ke 'pending' dari dashboard, sehingga
        komentar yang tayang bisa ditarik kembali kapan saja.

   Yang TIDAK diubah:
     - Struktur tabel (tidak ada tabel/kolom baru).
     - Baris komentar yang sudah ada (tidak ada UPDATE/DELETE).
     - Policy RLS yang sudah ada (select untuk anon tetap 'published').

   Semua pernyataan aman dijalankan berulang kali.
   ========================================================================== */

-- 1. RPC submit_comment: email opsional, komentar langsung tayang.
create or replace function public.submit_comment(
  p_article_id bigint,
  p_name text,
  p_email text,
  p_comment text,
  p_hp text default null
)
returns bigint
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_ip   text := public.client_ip();
  v_hash text := encode(
    extensions.digest(coalesce(v_ip, 'unknown') || 'ypi-nurul-ilmi', 'sha256'), 'hex'
  );
  v_id   bigint;
  v_now  timestamptz := now();
begin
  -- Honeypot: field tersembunyi harus kosong. Kembalikan -1 tanpa pesan
  -- supaya bot tidak belajar proteksinya.
  if p_hp is not null and length(trim(p_hp)) > 0 then
    return -1;
  end if;

  if length(coalesce(trim(p_name), '')) < 2 then
    raise exception 'validasi gagal: nama minimal 2 karakter';
  end if;

  if length(coalesce(trim(p_comment), '')) < 3 then
    raise exception 'validasi gagal: komentar minimal 3 karakter';
  end if;

  if length(coalesce(p_name, '')) > 100 then
    raise exception 'validasi gagal: nama maksimal 100 karakter';
  end if;

  if length(coalesce(p_comment, '')) > 2000 then
    raise exception 'validasi gagal: komentar maksimal 2000 karakter';
  end if;

  -- Email tidak wajib. Kalau diisi, formatnya tetap diperiksa.
  if p_email is not null and p_email <> '' and p_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'validasi gagal: format email tidak valid';
  end if;

  -- Rate limit: maksimal 5 komentar per jam per IP.
  if (select count(*) from public.comment_rate_limits
        where ip_hash = v_hash
          and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'terlalu sering';
  end if;

  -- Artikel harus ada dan published. Pengunjung tidak bisa mengomentari
  -- artikel draft atau artikel yang tidak dipublikasikan.
  if not exists (select 1 from public.articles
                  where id = p_article_id and status = 'published') then
    raise exception 'artikel tidak ditemukan';
  end if;

  insert into public.comments (
    article_id, name, email, comment, status, ip_hash, created_at, updated_at
  )
  values (
    p_article_id, trim(p_name), nullif(trim(coalesce(p_email, '')), ''),
    trim(p_comment), 'published', v_hash, v_now, v_now
  )
  returning id into v_id;

  insert into public.comment_rate_limits (ip_hash, created_at) values (v_hash, now());

  return v_id;
end;
$$;

-- 2. Pastikan policy RLS komentar tetap utuh: pengunjung hanya melihat
--    komentar yang tayang ('published').
do $$
begin
  if not exists (
    select 1 from pg_policies
     where schemaname = 'public' and tablename = 'comments'
       and policyname = 'comments_select_public'
  ) then
    create policy comments_select_public
      on public.comments for select
      to anon
      using (status = 'published');
  end if;
end
$$;
