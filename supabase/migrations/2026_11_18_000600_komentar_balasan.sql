/* ==========================================================================
   MIGRASI 000600 — BALASAN KOMENTAR
   --------------------------------------------------------------------------
   Tujuan:
     1. Menambahkan kolom parent_id pada tabel comments sehingga komentar
        bisa membalas komentar lain (satu tingkat balasan).
     2. RPC submit_comment menerima parameter p_parent_id. Bila diisi,
        komentar baru dianggap balasan dari komentar tersebut.
     3. Validasi balasan di server:
        - induk komentar harus ada,
        - induknya harus milik artikel yang sama,
        - induknya harus berstatus 'published' (tidak bisa membalas komentar
          yang disembunyikan atau ditandai spam),
        - hanya satu tingkat: balasan tidak bisa dibalas lagi.
     4. Moderasi tetap utuh. Balasan tetap berstatus 'published' seperti
        komentar biasa, jadi admin tetap bisa menariknya dari dashboard.
        Frontend hanya menampilkan balasan bila induknya masih terlihat,
        jadi ketika admin menyembunyikan sebuah komentar, balasannya ikut
        tersembunyi.

   Yang TIDAK diubah:
     - Baris komentar yang sudah ada tetap utuh (tidak ada UPDATE/DELETE).
     - Policy RLS yang sudah ada tidak berubah.
     - Tabel lain tidak tersentuh.

   Semua pernyataan aman dijalankan berulang kali.
   ========================================================================== */

-- 1. Kolom parent_id (dibuat nullable, jadi baris lama tidak perlu diubah).
alter table public.comments
  add column if not exists parent_id bigint references public.comments(id) on delete cascade;

create index if not exists comments_parent_id_idx on public.comments(parent_id);

-- 2. RPC submit_comment: tanpa parameter p_parent_id (supaya tidak ada
--    dua fungsi dengan nama sama) lalu dibuat ulang dengan parameternya.
drop function if exists public.submit_comment(bigint, text, text, text, text);

create function public.submit_comment(
  p_article_id bigint,
  p_name text,
  p_email text,
  p_comment text,
  p_hp text default null,
  p_parent_id bigint default null
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

  -- Balasan hanya sah kalau induknya ada, satu artikel yang sama, masih
  -- tayang, dan bukan balasan (satu tingkat saja).
  if p_parent_id is not null then
    if not exists (
      select 1 from public.comments c
       where c.id = p_parent_id
         and c.article_id = p_article_id
         and c.status = 'published'
         and c.parent_id is null
    ) then
      raise exception 'validasi gagal: komentar yang dibalas tidak tersedia';
    end if;
  end if;

  insert into public.comments (
    article_id, name, email, comment, status, ip_hash, parent_id, created_at, updated_at
  )
  values (
    p_article_id, trim(p_name), nullif(trim(coalesce(p_email, '')), ''),
    trim(p_comment), 'published', v_hash, p_parent_id, v_now, v_now
  )
  returning id into v_id;

  insert into public.comment_rate_limits (ip_hash, created_at) values (v_hash, now());

  return v_id;
end;
$$;

-- 3. Izin pakai RPC untuk pengunjung dan admin (sama seperti sebelumnya).
revoke all on function public.submit_comment(bigint, text, text, text, text, bigint) from public;
grant execute on function public.submit_comment(bigint, text, text, text, text, bigint) to anon, authenticated;

-- 4. Policy RLS komentar tetap utuh: pengunjung hanya melihat komentar
--    yang tayang ('published').
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

-- 5. Minta PostgREST memuat ulang daftar fungsi (tanda tangan RPC berubah).
notify pgrst, 'reload schema';
