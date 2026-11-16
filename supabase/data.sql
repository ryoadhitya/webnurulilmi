-- ============================================================================
--  YPI NURUL ILMI BEKASI — DATA BISNIS (MIGRASI DARI MYSQL)
--
--  Sumber : MySQL `web_nurul_ilmi`
--  ID lama dipertahankan seluruhnya. Jalankan SETELAH supabase/schema.sql.
--
---  Total baris sumber (10 tabel bisnis) : 125
---  Total baris dimigrasikan              : 124
---  Selisih 1 baris = article_media id=5 (file `articles/media/aaa.jpg` hilang)
-- ============================================================================

begin;

-- ---- categories (5 baris)
insert into public.categories ("id", "name", "slug", "created_at", "updated_at") values
  ('1', 'TK NURUL ILMI', 'tk-nurul-ilmi', '2026-11-05T03:40:32Z'::timestamptz, '2026-11-05T03:40:32Z'::timestamptz),
  ('2', 'SD', 'sd', '2026-11-05T03:40:53Z'::timestamptz, '2026-11-05T03:40:53Z'::timestamptz),
  ('3', 'SMP', 'smp', '2026-11-05T03:41:06Z'::timestamptz, '2026-11-05T03:41:06Z'::timestamptz),
  ('4', 'TK SIGMA', 'tk-sigma', '2026-11-05T03:41:16Z'::timestamptz, '2026-11-05T03:41:16Z'::timestamptz),
  ('5', 'DAYCARE SIGMA', 'daycare-sigma', '2026-11-05T03:41:26Z'::timestamptz, '2026-11-05T03:41:26Z'::timestamptz);

-- ---- units (5 baris)
insert into public.units ("id", "name", "slug", "group_type", "description", "created_at", "updated_at") values
  ('1', 'TK Nurul Ilmi', 'tk-nurul-ilmi', 'main', null, '2026-11-05T10:17:47Z'::timestamptz, '2026-11-06T05:49:05Z'::timestamptz),
  ('2', 'TK Sigma', 'tk-sigma', 'sigma', null, '2026-11-05T10:17:47Z'::timestamptz, '2026-11-05T10:17:47Z'::timestamptz),
  ('3', 'Daycare Sigma', 'daycare-sigma', 'sigma', null, '2026-11-05T10:17:47Z'::timestamptz, '2026-11-05T10:17:47Z'::timestamptz),
  ('4', 'SD Nurul Ilmi', 'sd-nurul-ilmi', 'main', null, '2026-11-06T05:49:05Z'::timestamptz, '2026-11-06T05:49:05Z'::timestamptz),
  ('5', 'SMP Nurul Ilmi', 'smp-nurul-ilmi', 'main', null, '2026-11-06T05:49:05Z'::timestamptz, '2026-11-06T05:49:05Z'::timestamptz);

-- ---- tags (3 baris)
insert into public.tags ("id", "name", "slug", "created_at", "updated_at") values
  ('1', 'ESKTRAKURIKULER', 'esktrakurikuler', '2026-11-05T03:42:28Z'::timestamptz, '2026-11-05T03:42:28Z'::timestamptz),
  ('2', 'KEGIATAN SEKOLAH', 'kegiatan-sekolah', '2026-11-05T03:42:47Z'::timestamptz, '2026-11-05T03:42:47Z'::timestamptz),
  ('3', 'DAILY', 'daily', '2026-11-05T03:43:15Z'::timestamptz, '2026-11-05T03:43:15Z'::timestamptz);

-- ---- articles (2 baris)
insert into public.articles ("id", "category_id", "title_id", "content_id", "title_en", "content_en", "image", "author_name", "status", "published_at", "views", "created_at", "updated_at") values
  ('1', '2', '🏆✨ BARAKALLAH JUARA ✨🏆', 'Isi baru', null, null, 'articles/2HnGtGommHpKsiHYgiGw8aUTeE7sLp53KPf90Lfs.png', 'Admin', 'published', '2026-11-05T03:47:27Z'::timestamptz, '7', '2026-11-05T03:47:27Z'::timestamptz, '2026-11-10T02:57:25Z'::timestamptz),
  ('3', null, 'x', 'y', null, null, null, 'Admin', 'published', '2026-11-09T02:30:26Z'::timestamptz, '1', '2026-11-09T02:30:26Z'::timestamptz, '2026-11-10T02:42:01Z'::timestamptz);

-- ---- article_media (1 baris, 1 baris dilewati)
insert into public.article_media ("id", "article_id", "type", "path", "mime_type", "caption", "sort_order", "created_at", "updated_at") values
  ('11', '1', 'image', 'articles/2HnGtGommHpKsiHYgiGw8aUTeE7sLp53KPf90Lfs.png', null, null, '0', '2026-11-10T02:40:25Z'::timestamptz, '2026-11-10T02:40:25Z'::timestamptz);

-- ---- article_tags (0 baris)
insert into public.article_tags ("id", "article_id", "tag_id") values
;

-- ---- comments (0 baris)
insert into public.comments ("id", "article_id", "name", "comment", "email", "created_at", "updated_at") values
;

-- ---- facilities (29 baris)
insert into public.facilities ("id", "name", "slug", "description", "icon", "is_published", "group_type", "sort_order", "created_at", "updated_at") values
  ('1', 'Ruang Kelas AC', 'kelas-ac', 'Ruang kelas ber-AC yang nyaman, terang, dan mendukung fokus belajar peserta didik.', 'fas fa-snowflake', true, 'main', '0', '2026-11-05T10:17:47Z'::timestamptz, '2026-11-05T10:17:47Z'::timestamptz),
  ('2', 'One Gate System', 'one-gate', 'Satu pintu masuk terkendali untuk keamanan dan keteraturan area sekolah.', 'fas fa-shield-alt', true, 'main', '0', '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('3', 'Masjid Nurul Ilmi', 'masjid', 'Masjid di lingkungan sekolah sebagai tempat ibadah dan kegiatan keagamaan peserta didik.', 'fas fa-mosque', true, 'main', '0', '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('4', 'Kantin Sekolah', 'kantin', 'Area kantin yang melayani warga sekolah dengan menu bergizi.', 'fas fa-utensils', true, 'main', '0', '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('5', 'Sarana Olahraga', 'sarana-ol-shop', 'Lapangan sekolah untuk kegiatan olahraga, latihan, dan aktivitas bersama.', 'fas fa-football-ball', true, 'main', '0', '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('6', 'Sarana Musik & Tari', 'musik-tari', 'Instrumen dan ruang latihan untuk mengembangkan bakat seni peserta didik.', 'fas fa-music', true, 'main', '0', '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('7', 'Aula Serba Guna', 'aula', 'Ruang serbaguna untuk berbagai kegiatan sekolah.', 'fas fa-home', true, 'main', '0', '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('8', 'Area Parkir', 'parkir', 'Area parkir kendaraan di lingkungan sekolah.', 'fas fa-parking', true, 'main', '0', '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('9', 'Digital Learning App', 'digital-app', 'Aplikasi pembelajaran digital untuk SDIT dan SMPIT, didukung laboratorium komputer.', 'fas fa-laptop', true, 'main', '0', '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('10', 'Perpustakaan Digital', 'perpustakaan', 'Koleksi buku dan sumber belajar digital bagi peserta didik.', 'fas fa-book-open', true, 'main', '0', '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('11', 'ID Card & Access Control', 'id-card', 'Kartu identitas dan sistem kontrol akses untuk menjaga keamanan area sekolah.', 'fas fa-id-card', true, 'main', '0', '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('12', 'Laboratorium', 'laboratorium', 'Laboratorium Fisika, Kimia, dan Biologi untuk kegiatan eksperimen.', 'fas fa-flask', true, 'main', '0', '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('13', 'Wifi / Internet', 'wifi', 'Jaringan internet untuk mendukung pembelajaran digital peserta didik.', 'fas fa-wifi', true, 'main', '0', '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('14', 'Audio Visual Art (AVA)', 'ava', 'Ruang praktik seni audio visual bagi peserta didik.', 'fas fa-tv', true, 'main', '0', '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('15', 'Aula Theater', 'aula-theater', 'Ruang pertunjukan untuk kegiatan seni dan acara sekolah.', 'fas fa-theater-masks', true, 'main', '0', '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('16', 'Area Bermain', 'area-bermain', 'Sarana bermain anak yang aman di lingkungan sekolah.', 'fas fa-gamepad', true, 'main', '0', '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('17', 'Lingkungan Ramah Sekolah', 'lingkungan', 'Area hijau, kolam ikan, dan suasana bersih yang nyaman untuk seluruh warga sekolah.', 'fas fa-tree', true, 'main', '0', '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('18', 'Playground Indoor', 'playground', 'Area bermain yang aman untuk eksplorasi dan kegiatan motorik anak.', 'fas fa-gamepad', true, 'sigma', '0', '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('19', 'Perpustakaan Mini', 'perpustakaan-mini', 'Pojok baca buku untuk memperkaya kelas dan minat baca Ananda.', 'fas fa-book-reader', true, 'sigma', '0', '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('20', 'UKS', 'uks', 'Ruang konsultasi tumbuh kembang dan penanganan kesehatan awal.', 'fas fa-first-aid', true, 'sigma', '0', '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('21', 'CCTV 24 Jam', 'cctv', 'Pemantauan area sekolah 24 jam agar akses keamanan terjaga.', 'fas fa-video', true, 'sigma', '0', '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('22', 'Sistem Keamanan', 'keamanan', 'Akses kontrol ketat menggunakan kartu identitas di pintu masuk area sekolah.', 'fas fa-shield-alt', true, 'sigma', '0', '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('23', 'Toilet Bersih', 'toilet', 'Toilet bersih dan ramah anak dengan kebersihan terjaga.', 'fas fa-restroom', true, 'sigma', '0', '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('24', 'Ruang Tidur Anak Laki-laki', 'tidur-laki', 'Ruang tidur terpisah, bersih, dan nyaman untuk anak laki-laki.', 'fas fa-bed', true, 'sigma', '0', '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('25', 'Ruang Tidur Anak Perempuan', 'tidur-perempuan', 'Ruang tidur terpisah, bersih, dan nyaman untuk anak perempuan.', 'fas fa-bed', true, 'sigma', '0', '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('26', 'Ruang Bermain Indoor', 'bermain', 'Ruang bermain steril dan aman dengan area bermain anak.', 'fas fa-gamepad', true, 'sigma', '0', '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('27', 'Dapur Sehat', 'dapur', 'Dapur dengan standar higienis dan bersih untuk menyiapkan makanan anak.', 'fas fa-utensils', true, 'sigma', '0', '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('28', 'Kamar Mandi', 'kamar-mandi', 'Kamar mandi bersih dan layak dengan sanitasi terjadwal.', 'fas fa-restroom', true, 'sigma', '0', '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('29', 'Pendamping Ramah', 'pendamping', 'Pendamping dengan rasio 1:5 sehingga setiap anak mendapat perhatian penuh.', 'fas fa-user-friends', true, 'sigma', '0', '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz);

-- ---- facility_photos (19 baris)
insert into public.facility_photos ("id", "facility_id", "image_path", "caption", "alt_text", "sort_order", "is_cover", "created_at", "updated_at") values
  ('1', '1', 'facilities/kelas-ac.jpg', 'Ruang kelas ber-AC', 'Ruang Kelas AC', '0', true, '2026-11-05T10:17:48Z'::timestamptz, '2026-11-06T05:49:06Z'::timestamptz),
  ('2', '3', 'facilities/masjid.jpg', 'Masjid Nurul Ilmi', 'Masjid Nurul Ilmi', '0', true, '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('3', '4', 'facilities/kantin.jpg', 'Kantin Sekolah', 'Kantin Sekolah', '0', true, '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('4', '5', 'facilities/lapangan.jpg', 'Lapangan Olahraga', 'Lapangan Olahraga', '0', true, '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('5', '5', 'facilities/olahraga-2.jpg', 'Kegiatan Olahraga', 'Kegiatan Olahraga', '1', false, '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('6', '6', 'facilities/musik-tari.jpg', 'Instrumen Musik', 'Sarana Musik & Tari', '0', true, '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('7', '8', 'facilities/parkir.jpg', 'Area Parkir Sekolah', 'Area Parkir', '0', true, '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('8', '9', 'facilities/laboratorium-komputer.jpg', 'Laboratorium Komputer', 'Laboratorium Komputer', '0', true, '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('9', '11', 'facilities/id-card.jpg', 'ID Card & Access Control', 'Kartu Identitas', '0', true, '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('10', '12', 'facilities/laboratorium.jpg', 'Laboratorium', 'Laboratorium', '0', true, '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('11', '16', 'facilities/area-bermain.jpg', 'Area Bermain', 'Area Bermain', '0', true, '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('12', '16', 'facilities/area-bermain-2.jpg', 'Taman Bermain Anak', 'Taman Bermain', '1', false, '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('13', '17', 'facilities/lingkungan-kolam.jpg', 'Kolam Ikan', 'Kolam Ikan', '0', true, '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('14', '17', 'facilities/lingkungan-suasana.jpg', 'Suasana Sekolah', 'Suasana Sekolah', '1', false, '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('15', '18', 'facilities/area-bermain.jpg', 'Playground Indoor', 'Playground Indoor', '0', true, '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('16', '18', 'facilities/area-bermain-2.jpg', 'Taman Bermain Anak', 'Taman Bermain', '1', false, '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('17', '22', 'facilities/id-card.jpg', 'Sistem Keamanan', 'Kartu Identitas', '0', true, '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('18', '26', 'facilities/area-bermain.jpg', 'Ruang Bermain', 'Ruang Bermain Indoor', '0', true, '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('19', '26', 'facilities/area-bermain-2.jpg', 'Taman Bermain Anak', 'Taman Bermain', '1', false, '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz);

-- ---- facility_unit (60 baris)
insert into public.facility_unit ("id", "facility_id", "unit_id", "created_at", "updated_at") values
  ('1', '1', '1', '2026-11-05T10:17:47Z'::timestamptz, '2026-11-05T10:17:47Z'::timestamptz),
  ('3', '2', '1', '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('4', '3', '1', '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('5', '4', '1', '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('6', '5', '1', '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('7', '6', '1', '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('8', '7', '1', '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('10', '8', '1', '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('13', '11', '1', '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('15', '13', '1', '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('16', '14', '1', '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('17', '15', '1', '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('18', '16', '1', '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('19', '17', '1', '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('20', '18', '2', '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('21', '19', '2', '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('22', '20', '2', '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('23', '21', '2', '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('24', '21', '3', '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('25', '22', '2', '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('26', '23', '2', '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('27', '24', '3', '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('28', '25', '3', '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('29', '26', '3', '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('30', '27', '3', '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('31', '28', '3', '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('32', '29', '3', '2026-11-05T10:17:48Z'::timestamptz, '2026-11-05T10:17:48Z'::timestamptz),
  ('33', '1', '4', '2026-11-06T05:49:05Z'::timestamptz, '2026-11-06T05:49:05Z'::timestamptz),
  ('34', '2', '4', '2026-11-06T05:49:05Z'::timestamptz, '2026-11-06T05:49:05Z'::timestamptz),
  ('35', '3', '4', '2026-11-06T05:49:05Z'::timestamptz, '2026-11-06T05:49:05Z'::timestamptz),
  ('36', '4', '4', '2026-11-06T05:49:05Z'::timestamptz, '2026-11-06T05:49:05Z'::timestamptz),
  ('37', '5', '4', '2026-11-06T05:49:05Z'::timestamptz, '2026-11-06T05:49:05Z'::timestamptz),
  ('38', '6', '4', '2026-11-06T05:49:05Z'::timestamptz, '2026-11-06T05:49:05Z'::timestamptz),
  ('39', '7', '4', '2026-11-06T05:49:05Z'::timestamptz, '2026-11-06T05:49:05Z'::timestamptz),
  ('40', '8', '4', '2026-11-06T05:49:05Z'::timestamptz, '2026-11-06T05:49:05Z'::timestamptz),
  ('41', '9', '4', '2026-11-06T05:49:05Z'::timestamptz, '2026-11-06T05:49:05Z'::timestamptz),
  ('42', '10', '4', '2026-11-06T05:49:05Z'::timestamptz, '2026-11-06T05:49:05Z'::timestamptz),
  ('43', '11', '4', '2026-11-06T05:49:05Z'::timestamptz, '2026-11-06T05:49:05Z'::timestamptz),
  ('45', '13', '4', '2026-11-06T05:49:05Z'::timestamptz, '2026-11-06T05:49:05Z'::timestamptz),
  ('46', '14', '4', '2026-11-06T05:49:05Z'::timestamptz, '2026-11-06T05:49:05Z'::timestamptz),
  ('47', '15', '4', '2026-11-06T05:49:05Z'::timestamptz, '2026-11-06T05:49:05Z'::timestamptz),
  ('48', '16', '4', '2026-11-06T05:49:05Z'::timestamptz, '2026-11-06T05:49:05Z'::timestamptz),
  ('49', '17', '4', '2026-11-06T05:49:05Z'::timestamptz, '2026-11-06T05:49:05Z'::timestamptz),
  ('50', '1', '5', '2026-11-06T05:49:05Z'::timestamptz, '2026-11-06T05:49:05Z'::timestamptz),
  ('51', '2', '5', '2026-11-06T05:49:05Z'::timestamptz, '2026-11-06T05:49:05Z'::timestamptz),
  ('52', '3', '5', '2026-11-06T05:49:05Z'::timestamptz, '2026-11-06T05:49:05Z'::timestamptz),
  ('53', '4', '5', '2026-11-06T05:49:05Z'::timestamptz, '2026-11-06T05:49:05Z'::timestamptz),
  ('54', '5', '5', '2026-11-06T05:49:05Z'::timestamptz, '2026-11-06T05:49:05Z'::timestamptz),
  ('55', '6', '5', '2026-11-06T05:49:05Z'::timestamptz, '2026-11-06T05:49:05Z'::timestamptz),
  ('56', '7', '5', '2026-11-06T05:49:05Z'::timestamptz, '2026-11-06T05:49:05Z'::timestamptz),
  ('57', '8', '5', '2026-11-06T05:49:05Z'::timestamptz, '2026-11-06T05:49:05Z'::timestamptz),
  ('58', '9', '5', '2026-11-06T05:49:05Z'::timestamptz, '2026-11-06T05:49:05Z'::timestamptz),
  ('59', '10', '5', '2026-11-06T05:49:05Z'::timestamptz, '2026-11-06T05:49:05Z'::timestamptz),
  ('60', '11', '5', '2026-11-06T05:49:05Z'::timestamptz, '2026-11-06T05:49:05Z'::timestamptz),
  ('61', '12', '5', '2026-11-06T05:49:05Z'::timestamptz, '2026-11-06T05:49:05Z'::timestamptz),
  ('62', '13', '5', '2026-11-06T05:49:05Z'::timestamptz, '2026-11-06T05:49:05Z'::timestamptz),
  ('63', '14', '5', '2026-11-06T05:49:05Z'::timestamptz, '2026-11-06T05:49:05Z'::timestamptz),
  ('64', '15', '5', '2026-11-06T05:49:05Z'::timestamptz, '2026-11-06T05:49:05Z'::timestamptz),
  ('65', '16', '5', '2026-11-06T05:49:05Z'::timestamptz, '2026-11-06T05:49:05Z'::timestamptz),
  ('66', '17', '5', '2026-11-06T05:49:05Z'::timestamptz, '2026-11-06T05:49:05Z'::timestamptz);

-- ---- Reset sequence ke max(id)+1 -------------------------------------------
select setval(pg_get_serial_sequence('public.categories', 'id'), coalesce((select max(id) from public.categories), 0) + 1, false);
select setval(pg_get_serial_sequence('public.units', 'id'), coalesce((select max(id) from public.units), 0) + 1, false);
select setval(pg_get_serial_sequence('public.tags', 'id'), coalesce((select max(id) from public.tags), 0) + 1, false);
select setval(pg_get_serial_sequence('public.articles', 'id'), coalesce((select max(id) from public.articles), 0) + 1, false);
select setval(pg_get_serial_sequence('public.article_media', 'id'), coalesce((select max(id) from public.article_media), 0) + 1, false);
select setval(pg_get_serial_sequence('public.article_tags', 'id'), coalesce((select max(id) from public.article_tags), 0) + 1, false);
select setval(pg_get_serial_sequence('public.comments', 'id'), coalesce((select max(id) from public.comments), 0) + 1, false);
select setval(pg_get_serial_sequence('public.facilities', 'id'), coalesce((select max(id) from public.facilities), 0) + 1, false);
select setval(pg_get_serial_sequence('public.facility_photos', 'id'), coalesce((select max(id) from public.facility_photos), 0) + 1, false);
select setval(pg_get_serial_sequence('public.facility_unit', 'id'), coalesce((select max(id) from public.facility_unit), 0) + 1, false);

commit;
