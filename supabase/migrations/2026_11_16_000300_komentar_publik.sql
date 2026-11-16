/* ==========================================================================
   MIGRASI 000300 — KOMENTAR PUBLIK
   --------------------------------------------------------------------------
   Tujuan:
     1. comments.created_at dan comments.updated_at sebelumnya tidak punya
        default dan RPC submit_comment tidak mengisinya, sehingga komentar
        yang dikirim pengunjung tidak pernah punya tanggal tampil. Kolom
        diberi default now() dan baris lama yang kosong diisi dengan waktu
        sekarang (perubahan ini tidak menghapus data).
     2. RPC submit_comment diperbarui: created_at/updated_at diisi eksplisit
        dan batas panjang nama (100 karakter) serta pesan (2000 karakter)
        disamakan dengan validasi di frontend.

   Yang TIDAK diubah:
     - Struktur tabel (tidak ada tabel baru, tidak ada kolom baru).
     - Policy RLS yang sudah ada. Penulisan komentar publik tetap hanya
       lewat RPC SECURITY DEFINER, jadi anon tidak punya akses INSERT
       langsung ke tabel comments (paling ketat).
     - Mekanisme moderasi (status 'pending' -> 'published' oleh admin).

   Semua pernyataan aman dijalankan berulang kali.
   ========================================================================== */

-- 1. Default tanggal untuk komentar baru.
alter table public.comments
  alter column created_at set default now();

alter table public.comments
  alter column updated_at set default now();

-- 2. Lengkapi komentar lama yang tanggalnya kosong.
update public.comments
   set created_at = now()
 where created_at is null;

update public.comments
   set updated_at = now()
 where updated_at is null;

-- 3. RPC submit_comment: tanggal diisi eksplisit + batas panjang diseragamkan.
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
    trim(p_comment), 'pending', v_hash, v_now, v_now
  )
  returning id into v_id;

  insert into public.comment_rate_limits (ip_hash, created_at) values (v_hash, now());

  return v_id;
end;
$$;

-- 4. Pastikan policy RLS komentar tetap utuh dan mengizinkan select untuk
--    pengunjung (hanya komentar yang sudah tayang).
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
