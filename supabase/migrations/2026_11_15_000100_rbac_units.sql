-- ===========================================================================
--  MIGRASI RBAC — YPI NURUL ILMI
--  File : supabase/migrations/2026_11_15_000100_rbac_units.sql
--  Date : 2026-11-15
--
--  TUJUAN
--  Mengganti model role lama (admin / editor / guru) menjadi 5 role unit:
--
--    super_admin      -> seluruh unit
--    tk_nurul_ilmi    -> unit TK Nurul Ilmi
--    sd_nurul_ilmi    -> unit SD Nurul Ilmi
--    smp_nurul_ilmi   -> unit SMP Nurul Ilmi
--    sigma_nurul_ilmi -> unit TK Sigma + Daycare Sigma
--
--  PERUBAHAN STRUKTUR (tidak menghapus tabel lama, tidak menghapus data)
--    1. public.user_roles : constraint role diganti ke 5 role baru.
--       Baris yang(role lama) 'admin' NAH menjadi 'super_admin',
--       user_id dan seluruh data akun tidak berubah.
--    2. public.user_units (BARU) : pemetaan user -> unit yang boleh dikelola.
--       Admin unit punya >= 1 baris. Super_admin tidak punya baris (artinya
--       seluruh unit).
--    3. public.articles : ditambah kolom unit_id (FK ke units, nullable).
--       Artikel lama (dari MySQL) tidak punya unit -> unit_id NULL =
--       artikel yayasan/umum, hanya dikelola super_admin. Tidak ada data lama
--       yang diubah atau dihapus.
--
--  KEAMANAN
--    - Semua pembatasan ditegakkan di level database (RLS), bukan menu.
--    - Role dibaca dari tabel user_roles, bukan localStorage.
--    - Admin unit tidak bisa mengubah role sendiri maupun-naik ke super_admin
--      (policy user_roles & user_units melarang baris dengan user_id sendiri).
--    - Media Storage mengikuti unit: admin unit hanya boleh menulis/menghapus
--      berkas di folder prefixed slug unitnya.
--
--  CARA PENERAPAN
--    node scripts/apply-rbac.mjs
--
--  Skrip ini idempoten (safe to run ulang).
-- ===========================================================================

-- ---------------------------------------------------------------------------
--  1. ROLE BARU DI public.user_roles
-- ---------------------------------------------------------------------------

-- Buka constraint lama supaya role bisa ditulis ulang ke nilai baru.
alter table public.user_roles drop constraint if exists user_roles_role_check;

-- Akun yayasan yang sebelumnya ber-role 'admin' menjadi 'super_admin'.
-- user_id, granted_by, dan created_at tidak disentuh.
update public.user_roles set role = 'super_admin' where role = 'admin';

alter table public.user_roles
  drop constraint if exists user_roles_role_check;

alter table public.user_roles
  add constraint user_roles_role_check
  check (role in ('super_admin', 'tk_nurul_ilmi', 'sd_nurul_ilmi', 'smp_nurul_ilmi', 'sigma_nurul_ilmi'));

-- ---------------------------------------------------------------------------
--  2. TABEL PEMETAAN USER -> UNIT
-- ---------------------------------------------------------------------------

create table if not exists public.user_units (
  user_id    uuid not null references auth.users(id) on delete cascade,
  unit_id    bigint not null references public.units(id) on delete cascade,
  granted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (user_id, unit_id)
);

create index if not exists user_units_unit_id_idx on public.user_units(unit_id);

alter table public.user_units enable row level security;

comment on table public.user_units is
  'Unit yang boleh dikelola oleh seorang admin unit. Super_admin tidak punya baris di sini (= seluruh unit).';

-- ---------------------------------------------------------------------------
--  3. ARTIKEL DIPERLUAS DENGAN UNIT
-- ---------------------------------------------------------------------------

alter table public.articles
  add column if not exists unit_id bigint references public.units(id) on delete set null;

create index if not exists articles_unit_id_idx on public.articles(unit_id);

comment on column public.articles.unit_id is
  'Unit pemilik artikel. NULL = artikel umum (khusus super_admin).';

-- ---------------------------------------------------------------------------
--  4. FUNGSI BANTUAN (SECURITY DEFINER agar bisa dipakai di dalam policy RLS)
-- ---------------------------------------------------------------------------

-- True bila pemanggil adalah super_admin.
create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'super_admin'
  );
$$;

revoke all on function public.is_super_admin() from public;
grant execute on function public.is_super_admin() to authenticated;

-- Daftar unit yang boleh dikelola pemanggil.
create or replace function public.user_unit_ids()
returns bigint[]
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(array_agg(unit_id), '{}'::bigint[])
  from public.user_units
  where user_id = auth.uid();
$$;

revoke all on function public.user_unit_ids() from public;
grant execute on function public.user_unit_ids() to authenticated;

-- True bila pemanggil adalah staf: super_admin atau admin unit yang punya unit.
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_super_admin() or cardinality(public.user_unit_ids()) > 0;
$$;

revoke all on function public.is_staff() from public;
grant execute on function public.is_staff() to authenticated;

-- True bila pemanggil boleh mengelola unit tertentu.
create or replace function public.can_manage_unit(p_unit_id bigint)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_super_admin()
      or (p_unit_id is not null and p_unit_id = any(public.user_unit_ids()));
$$;

revoke all on function public.can_manage_unit(bigint) from public;
grant execute on function public.can_manage_unit(bigint) to authenticated;

-- True bila pemanggil boleh mengelola sebuah artikel.
create or replace function public.can_manage_article(p_article_id bigint)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_super_admin()
      or exists (
        select 1 from public.articles a
        where a.id = p_article_id
          and a.unit_id = any(public.user_unit_ids())
      );
$$;

revoke all on function public.can_manage_article(bigint) from public;
grant execute on function public.can_manage_article(bigint) to authenticated;

-- True bila pemanggil boleh mengelola sebuah fasilitas.
-- Fasilitas tidak punya unit_id; kepemilikan unit dibaca dari facility_unit.
create or replace function public.can_manage_facility(p_facility_id bigint)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_super_admin()
      or exists (
        select 1 from public.facility_unit fu
        where fu.facility_id = p_facility_id
          and fu.unit_id = any(public.user_unit_ids())
      );
$$;

revoke all on function public.can_manage_facility(bigint) from public;
grant execute on function public.can_manage_facility(bigint) to authenticated;

-- Folder (segmen pertama path) yang boleh ditulis admin unit.
create or replace function public.user_unit_slugs()
returns text[]
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(array_agg(u.slug), '{}'::text[])
  from public.user_units uu
  join public.units u on u.id = uu.unit_id
  where uu.user_id = auth.uid();
$$;

revoke all on function public.user_unit_slugs() from public;
grant execute on function public.user_unit_slugs() to authenticated;

-- ---------------------------------------------------------------------------
--  5. POLICY RLS
-- ---------------------------------------------------------------------------

-- ---- categories & tags: baca semua, tulis hanya super_admin -------------
-- Kategori dan tag adalah taksonomi bersama antar unit, jadi tidak boleh
-- diubah admin satu unit (bisa memengaruhi unit lain).

drop policy if exists "categories_insert_staff" on public.categories;
create policy "categories_insert_staff" on public.categories
  for insert to authenticated with check (public.is_super_admin());

drop policy if exists "categories_update_staff" on public.categories;
create policy "categories_update_staff" on public.categories
  for update to authenticated using (public.is_super_admin())
  with check (public.is_super_admin());

drop policy if exists "categories_delete_staff" on public.categories;
create policy "categories_delete_staff" on public.categories
  for delete to authenticated using (public.is_super_admin());

drop policy if exists "tags_insert_staff" on public.tags;
create policy "tags_insert_staff" on public.tags
  for insert to authenticated with check (public.is_super_admin());

drop policy if exists "tags_update_staff" on public.tags;
create policy "tags_update_staff" on public.tags
  for update to authenticated using (public.is_super_admin())
  with check (public.is_super_admin());

drop policy if exists "tags_delete_staff" on public.tags;
create policy "tags_delete_staff" on public.tags
  for delete to authenticated using (public.is_super_admin());

-- ---- units: tulis hanya super_admin --------------------------------------
drop policy if exists "units_insert_admin" on public.units;
create policy "units_insert_admin" on public.units
  for insert to authenticated with check (public.is_super_admin());

drop policy if exists "units_update_admin" on public.units;
create policy "units_update_admin" on public.units
  for update to authenticated using (public.is_super_admin())
  with check (public.is_super_admin());

drop policy if exists "units_delete_admin" on public.units;
create policy "units_delete_admin" on public.units
  for delete to authenticated using (public.is_super_admin());

-- ---- articles: dibatasi per unit -----------------------------------------
-- super_admin : semua artikel.
-- admin unit  : hanya artikel dengan unit_id milik unitnya.
-- Admin unit tidak bisa memindahkan artikel ke unit lain (with check).

-- Bacanya tetap publik: artikel 'published' terlihat oleh siapa saja (anon
-- pun staf). Hanya artikel 'draft' yang disembunyikan dari unit lain.

drop policy if exists "articles_select_authenticated" on public.articles;
create policy "articles_select_authenticated" on public.articles
  for select to authenticated using (
    status = 'published'
    or public.is_super_admin()
    or unit_id = any(public.user_unit_ids())
  );

drop policy if exists "articles_insert_staff" on public.articles;
create policy "articles_insert_staff" on public.articles
  for insert to authenticated with check (
    public.is_super_admin()
    or (unit_id is not null and unit_id = any(public.user_unit_ids()))
  );

drop policy if exists "articles_update_staff" on public.articles;
create policy "articles_update_staff" on public.articles
  for update to authenticated
  using (public.is_super_admin() or unit_id = any(public.user_unit_ids()))
  with check (
    public.is_super_admin()
    or (unit_id is not null and unit_id = any(public.user_unit_ids()))
  );

drop policy if exists "articles_delete_admin" on public.articles;
create policy "articles_delete_admin" on public.articles
  for delete to authenticated using (
    public.is_super_admin() or unit_id = any(public.user_unit_ids())
  );

-- ---- article_media: mengikuti artikel induknya ---------------------------
drop policy if exists "article_media_select_authenticated" on public.article_media;
create policy "article_media_select_authenticated" on public.article_media
  for select to authenticated using (
    public.can_manage_article(article_id)
    or exists (
      select 1 from public.articles a
      where a.id = article_media.article_id and a.status = 'published'
    )
  );

drop policy if exists "article_media_insert_staff" on public.article_media;
create policy "article_media_insert_staff" on public.article_media
  for insert to authenticated with check (public.can_manage_article(article_id));

drop policy if exists "article_media_update_staff" on public.article_media;
create policy "article_media_update_staff" on public.article_media
  for update to authenticated using (public.can_manage_article(article_id))
  with check (public.can_manage_article(article_id));

drop policy if exists "article_media_delete_staff" on public.article_media;
create policy "article_media_delete_staff" on public.article_media
  for delete to authenticated using (public.can_manage_article(article_id));

-- ---- article_tags: mengikuti artikel induknya -----------------------------
drop policy if exists "article_tags_select_authenticated" on public.article_tags;
create policy "article_tags_select_authenticated" on public.article_tags
  for select to authenticated using (
    public.can_manage_article(article_id)
    or exists (
      select 1 from public.articles a
      where a.id = article_tags.article_id and a.status = 'published'
    )
  );

drop policy if exists "article_tags_insert_staff" on public.article_tags;
create policy "article_tags_insert_staff" on public.article_tags
  for insert to authenticated with check (public.can_manage_article(article_id));

drop policy if exists "article_tags_update_staff" on public.article_tags;
create policy "article_tags_update_staff" on public.article_tags
  for update to authenticated using (public.can_manage_article(article_id))
  with check (public.can_manage_article(article_id));

drop policy if exists "article_tags_delete_staff" on public.article_tags;
create policy "article_tags_delete_staff" on public.article_tags
  for delete to authenticated using (public.can_manage_article(article_id));

-- ---- comments: moderasi mengikuti unit artikelnya -------------------------
drop policy if exists "comments_select_authenticated" on public.comments;
create policy "comments_select_authenticated" on public.comments
  for select to authenticated using (
    status = 'published'
    or public.is_super_admin()
    or exists (
      select 1 from public.articles a
      where a.id = comments.article_id
        and a.unit_id = any(public.user_unit_ids())
    )
  );

drop policy if exists "comments_update_staff" on public.comments;
create policy "comments_update_staff" on public.comments
  for update to authenticated using (
    public.is_super_admin()
    or exists (
      select 1 from public.articles a
      where a.id = comments.article_id
        and a.unit_id = any(public.user_unit_ids())
    )
  )
  with check (
    public.is_super_admin()
    or exists (
      select 1 from public.articles a
      where a.id = comments.article_id
        and a.unit_id = any(public.user_unit_ids())
    )
  );

drop policy if exists "comments_delete_staff" on public.comments;
create policy "comments_delete_staff" on public.comments
  for delete to authenticated using (
    public.is_super_admin()
    or exists (
      select 1 from public.articles a
      where a.id = comments.article_id
        and a.unit_id = any(public.user_unit_ids())
    )
  );

-- ---- facilities: mengikuti facility_unit ----------------------------------
-- Fasilitas bersifat publik, jadi semua orang tetap boleh membacanya.
-- Yang dibatasi hanya perubahan datanya (lihat kebijakan di bawah).

drop policy if exists "facilities_select_authenticated" on public.facilities;
create policy "facilities_select_authenticated" on public.facilities
  for select to authenticated using (true);

drop policy if exists "facilities_insert_staff" on public.facilities;
create policy "facilities_insert_staff" on public.facilities
  for insert to authenticated with check (public.is_staff());

drop policy if exists "facilities_update_staff" on public.facilities;
create policy "facilities_update_staff" on public.facilities
  for update to authenticated using (public.can_manage_facility(id))
  with check (public.can_manage_facility(id));

drop policy if exists "facilities_delete_staff" on public.facilities;
create policy "facilities_delete_staff" on public.facilities
  for delete to authenticated using (public.can_manage_facility(id));

-- ---- facility_photos: mengikuti fasilitas induknya ------------------------
drop policy if exists "facility_photos_select_authenticated" on public.facility_photos;
create policy "facility_photos_select_authenticated" on public.facility_photos
  for select to authenticated using (true);

drop policy if exists "facility_photos_insert_staff" on public.facility_photos;
create policy "facility_photos_insert_staff" on public.facility_photos
  for insert to authenticated with check (
    public.can_manage_facility(facility_id)
    /* Fasilitas baru milik unit ini belum punya tautan unit, jadi belum
       bisa dihitung can_manage_facility(). */
    or (
      public.is_staff()
      and not exists (
        select 1 from public.facility_unit fu where fu.facility_id = facility_photos.facility_id
      )
    )
  );

drop policy if exists "facility_photos_update_staff" on public.facility_photos;
create policy "facility_photos_update_staff" on public.facility_photos
  for update to authenticated using (public.can_manage_facility(facility_id))
  with check (public.can_manage_facility(facility_id));

drop policy if exists "facility_photos_delete_staff" on public.facility_photos;
create policy "facility_photos_delete_staff" on public.facility_photos
  for delete to authenticated using (public.can_manage_facility(facility_id));

-- ---- facility_unit: admin unit hanya boleh menautkan unitnya sendiri ------
-- Pemetaanfasilitas -> unit bersifat publik (dipakai galeri), jadi POLICY SELECT
-- dibiarkan terbuka; yang dibatasi adalah penambahan/ubah/hapus tautan.

drop policy if exists "facility_unit_select_public" on public.facility_unit;
create policy "facility_unit_select_public" on public.facility_unit
  for select to anon, authenticated using (true);

drop policy if exists "facility_unit_insert_staff" on public.facility_unit;
create policy "facility_unit_insert_staff" on public.facility_unit
  for insert to authenticated with check (
    public.is_super_admin() or unit_id = any(public.user_unit_ids())
  );

drop policy if exists "facility_unit_update_staff" on public.facility_unit;
create policy "facility_unit_update_staff" on public.facility_unit
  for update to authenticated
  using (public.is_super_admin() or unit_id = any(public.user_unit_ids()))
  with check (public.is_super_admin() or unit_id = any(public.user_unit_ids()));

drop policy if exists "facility_unit_delete_staff" on public.facility_unit;
create policy "facility_unit_delete_staff" on public.facility_unit
  for delete to authenticated using (
    public.is_super_admin() or unit_id = any(public.user_unit_ids())
  );

-- ---- user_roles: super_admin mengelola, tapi tidak role sendiri ----------
drop policy if exists "user_roles_select_own" on public.user_roles;
create policy "user_roles_select_own" on public.user_roles
  for select to authenticated using (user_id = auth.uid() or public.is_super_admin());

drop policy if exists "user_roles_insert_super" on public.user_roles;
create policy "user_roles_insert_super" on public.user_roles
  for insert to authenticated with check (
    public.is_super_admin() and user_id <> auth.uid()
  );

drop policy if exists "user_roles_update_super" on public.user_roles;
create policy "user_roles_update_super" on public.user_roles
  for update to authenticated
  using (public.is_super_admin() and user_id <> auth.uid())
  with check (public.is_super_admin() and user_id <> auth.uid());

drop policy if exists "user_roles_delete_super" on public.user_roles;
create policy "user_roles_delete_super" on public.user_roles
  for delete to authenticated using (
    public.is_super_admin() and user_id <> auth.uid()
  );

-- ---- user_units: super_admin menetapkan unit yang boleh dikelola ---------
drop policy if exists "user_units_select_own" on public.user_units;
create policy "user_units_select_own" on public.user_units
  for select to authenticated using (user_id = auth.uid() or public.is_super_admin());

drop policy if exists "user_units_insert_super" on public.user_units;
create policy "user_units_insert_super" on public.user_units
  for insert to authenticated with check (
    public.is_super_admin() and user_id <> auth.uid()
  );

drop policy if exists "user_units_update_super" on public.user_units;
create policy "user_units_update_super" on public.user_units
  for update to authenticated
  using (public.is_super_admin() and user_id <> auth.uid())
  with check (public.is_super_admin() and user_id <> auth.uid());

drop policy if exists "user_units_delete_super" on public.user_units;
create policy "user_units_delete_super" on public.user_units
  for delete to authenticated using (
    public.is_super_admin() and user_id <> auth.uid()
  );

-- ---------------------------------------------------------------------------
--  6. KEAMANAN STORAGE
-- ---------------------------------------------------------------------------
-- Unggahan baru wajib berawalan folder slug unit pemiliknya, misalnya
-- 'tk-nurul-ilmi/artikel/foto.png'. Admin unit hanya boleh menulis di folder
-- unitnya; super_admin bebas menulis di mana saja.
--
-- Penghapusan/ubah berkas mengikuti kepemilikan datanya: berkas artikel
-- (article_media) atau fasilitas (facility_photos) yang terkait unit tersebut.
-- Folder warisan ('articles/...', 'facilities/...') tetap bisa dihapus
-- super_admin, dan hanya dia, karena tidak punya prefix unit.

drop policy if exists "media_staff_insert" on storage.objects;
create policy "media_staff_insert" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'media'
    and (
      public.is_super_admin()
      or (storage.foldername(name))[1] = any(public.user_unit_slugs())
    )
  );

drop policy if exists "media_staff_update" on storage.objects;
create policy "media_staff_update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'media'
    and (
      public.is_super_admin()
      or exists (
        select 1 from public.article_media am
        where am.path = name and public.can_manage_article(am.article_id)
      )
      or exists (
        select 1 from public.facility_photos fp
        where fp.image_path = name and public.can_manage_facility(fp.facility_id)
      )
    )
  )
  with check (
    bucket_id = 'media'
    and (
      public.is_super_admin()
      or (storage.foldername(name))[1] = any(public.user_unit_slugs())
    )
  );

drop policy if exists "media_staff_delete" on storage.objects;
create policy "media_staff_delete" on storage.objects
  for delete to authenticated using (
    bucket_id = 'media'
    and (
      public.is_super_admin()
      or exists (
        select 1 from public.article_media am
        where am.path = name and public.can_manage_article(am.article_id)
      )
      or exists (
        select 1 from public.facility_photos fp
        where fp.image_path = name and public.can_manage_facility(fp.facility_id)
      )
    )
  );

-- ---------------------------------------------------------------------------
--  7. CATATAN
-- ---------------------------------------------------------------------------

comment on table public.user_roles is
  'Sumber kebenaran peran: super_admin, tk_nurul_ilmi, sd_nurul_ilmi, smp_nurul_ilmi, sigma_nurul_ilmi. Hanya super_admin yang boleh menulis, dan tidak boleh mengubah baris miliknya sendiri.';

comment on function public.is_super_admin() is
  'True bila pemanggil adalah super_admin. Dipakai seluruh policy RLS.';
