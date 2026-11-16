/* ==========================================================================
   MIGRASI — THUMBNAIL VIDEO ARTIKEL
   --------------------------------------------------------------------------
   Tujuan:
     Menyimpan path file thumbnail (poster) untuk media bertipe video.
     Thumbnail dibuat otomatis di sisi browser (HTMLVideoElement + canvas)
     ketika admin mengunggah video, lalu diunggah ke bucket Storage dan
     dicatat di baris article_media.

   Sifat migrasi:
     - Menambah satu kolom nullable. Tidak menghapus, tidak mengubah, dan
       tidak memindahkan data yang sudah ada.
     - Kolom lama (artikel tanpa video, atau video tanpa thumbnail) tetap
       apa adanya: nilainya NULL dan tampilan publik memakai fallback.

   Cara menjalankan:
     Tempel di SQL Editor Supabase, atau lewat Management API.
   ========================================================================== */

alter table public.article_media
  add column if not exists poster_path text;

comment on column public.article_media.poster_path is
  'Path objek di bucket Storage berisi thumbnail (poster) untuk media video. Nullable: NULL berarti video belum punya thumbnail dan tampilan memakai fallback.';
