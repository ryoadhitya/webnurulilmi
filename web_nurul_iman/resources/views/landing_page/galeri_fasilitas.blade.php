@extends('landing_page.layout')

@section('title', 'Galeri Fasilitas - YPI Nurul Ilmi Bekasi')

@section('head')
  <meta name="description" content="Galeri fasilitas pendidikan YPI Nurul Ilmi Bekasi - Lihat foto-foto fasilitas dan lingkungan belajar yang mendukung pembelajaran peserta didik.">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="{{ asset('landingPage/css/galeri-fasilitas.css') }}">
@endsection

@section('content')
  <section class="gallery-hero">
    <div class="container">
      <div class="row justify-content-center text-center">
        <div class="col-lg-10" data-aos="fade-up">
          <div class="page-header-badge">
            <i class="fas fa-camera mr-2"></i>Galeri
          </div>
          <h1>Galeri <span>Fasilitas</span> Pendidikan</h1>
          <p>Dokumentasi fasilitas dan lingkungan belajar di YPI Nurul Ilmi yang mendukung kenyamanan dan perkembangan seluruh peserta didik.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="gallery-section">
    <div class="container">
      <div class="gallery-grid">
        <div class="gallery-card" data-aos="fade-up" data-aos-delay="100">
          <div class="gallery-card-image">
            <img src="{{ asset('landingPage/images/labkomputer.jpeg') }}" alt="Laboratorium Komputer" loading="lazy">
            <div class="gallery-card-overlay"><span><i class="fas fa-search-plus"></i>Klik untuk memperbesar</span></div>
          </div>
          <div class="gallery-card-body">
            <h4>Laboratorium Komputer</h4>
            <p>Ruang komputer untuk mendukung kegiatan belajar berbasis teknologi.</p>
          </div>
        </div>

        <div class="gallery-card" data-aos="fade-up" data-aos-delay="150">
          <div class="gallery-card-image">
            <img src="{{ asset('landingPage/images/kelas.jpeg') }}" alt="Ruang Kelas AC" loading="lazy">
            <div class="gallery-card-overlay"><span><i class="fas fa-search-plus"></i>Klik untuk memperbesar</span></div>
          </div>
          <div class="gallery-card-body">
            <h4>Ruang Kelas AC</h4>
            <p>Fasilitas belajar yang nyaman dan mendukung pembelajaran optimal.</p>
          </div>
        </div>

        <div class="gallery-card" data-aos="fade-up" data-aos-delay="200">
          <div class="gallery-card-image">
            <img src="{{ asset('landingPage/images/kantin.jpeg') }}" alt="Kantin Sekolah" loading="lazy">
            <div class="gallery-card-overlay"><span><i class="fas fa-search-plus"></i>Klik untuk memperbesar</span></div>
          </div>
          <div class="gallery-card-body">
            <h4>Kantin Sekolah</h4>
            <p>Area kantin yang melayani warga sekolah.</p>
          </div>
        </div>

        <div class="gallery-card" data-aos="fade-up" data-aos-delay="250">
          <div class="gallery-card-image">
            <img src="{{ asset('landingPage/images/lab.JPG') }}" alt="Laboratorium sekolah" loading="lazy">
            <div class="gallery-card-overlay"><span><i class="fas fa-search-plus"></i>Klik untuk memperbesar</span></div>
          </div>
          <div class="gallery-card-body">
            <h4>Laboratorium</h4>
            <p>Laboratorium untuk kegiatan belajar dan eksperimen.</p>
          </div>
        </div>

        <div class="gallery-card" data-aos="fade-up" data-aos-delay="300">
          <div class="gallery-card-image">
            <img src="{{ asset('landingPage/images/lapangan.jpeg') }}" alt="Lapangan Olahraga" loading="lazy">
            <div class="gallery-card-overlay"><span><i class="fas fa-search-plus"></i>Klik untuk memperbesar</span></div>
          </div>
          <div class="gallery-card-body">
            <h4>Lapangan Olahraga</h4>
            <p>Lapangan sekolah untuk kegiatan olahraga dan aktivitas bersama.</p>
          </div>
        </div>

        <div class="gallery-card" data-aos="fade-up" data-aos-delay="350">
          <div class="gallery-card-image">
            <img src="{{ asset('landingPage/images/kolamikan.jpeg') }}" alt="Area Kolam Ikan" loading="lazy">
            <div class="gallery-card-overlay"><span><i class="fas fa-search-plus"></i>Klik untuk memperbesar</span></div>
          </div>
          <div class="gallery-card-body">
            <h4>Area Lingkungan Sekolah</h4>
            <p>Area kolam ikan yang menambah keasrian suasana di sekitar sekolah.</p>
          </div>
        </div>

        <div class="gallery-card" data-aos="fade-up" data-aos-delay="400">
          <div class="gallery-card-image">
            <img src="{{ asset('landingPage/images/parkir.jpeg') }}" alt="Area Parkir" loading="lazy">
            <div class="gallery-card-overlay"><span><i class="fas fa-search-plus"></i>Klik untuk memperbesar</span></div>
          </div>
          <div class="gallery-card-body">
            <h4>Area Parkir</h4>
            <p>Area parkir kendaraan di lingkungan sekolah.</p>
          </div>
        </div>

        <div class="gallery-card" data-aos="fade-up" data-aos-delay="450">
          <div class="gallery-card-image">
            <img src="{{ asset('landingPage/images/idcard.jpeg') }}" alt="Akses kartu di lingkungan sekolah" loading="lazy">
            <div class="gallery-card-overlay"><span><i class="fas fa-search-plus"></i>Klik untuk memperbesar</span></div>
          </div>
          <div class="gallery-card-body">
            <h4>Akses Kartu</h4>
            <p>Dokumentasi penggunaan kartu pada perangkat akses di lingkungan sekolah.</p>
          </div>
        </div>

        <div class="gallery-card" data-aos="fade-up" data-aos-delay="500">
          <div class="gallery-card-image">
            <img src="{{ asset('landingPage/images/main.jpeg') }}" alt="Area bermain sekolah" loading="lazy">
            <div class="gallery-card-overlay"><span><i class="fas fa-search-plus"></i>Klik untuk memperbesar</span></div>
          </div>
          <div class="gallery-card-body">
            <h4>Area Bermain</h4>
            <p>Sarana bermain anak yang terlihat di area sekolah.</p>
          </div>
        </div>
      </div>

      <div class="back-to-home" data-aos="fade-up">
        <a href="{{ route('home') }}" class="back-btn">
          <i class="fas fa-arrow-left"></i>Kembali ke Halaman Utama
        </a>
      </div>
    </div>
  </section>

  <div class="lightbox-modal" id="lightbox" role="dialog" aria-modal="true" aria-label="Tampilan foto fasilitas" aria-hidden="true">
    <button class="lightbox-close" id="lightbox-close" type="button" aria-label="Tutup foto">&times;</button>
    <button class="lightbox-nav lightbox-prev" id="lightbox-prev" type="button" aria-label="Foto sebelumnya"><i class="fas fa-chevron-left" aria-hidden="true"></i></button>
    <button class="lightbox-nav lightbox-next" id="lightbox-next" type="button" aria-label="Foto berikutnya"><i class="fas fa-chevron-right" aria-hidden="true"></i></button>
    <div class="lightbox-content">
      <img src="" alt="" id="lightbox-image">
      <p class="lightbox-caption" id="lightbox-caption"></p>
    </div>
  </div>
@endsection

@section('scripts')
  <script>
    (function() {
      var galleryItems = Array.prototype.slice.call(document.querySelectorAll('.gallery-card'));
      var lightbox = document.getElementById('lightbox');
      var lightboxImage = document.getElementById('lightbox-image');
      var lightboxCaption = document.getElementById('lightbox-caption');
      var previousFocus = null;
      var currentIndex = 0;
      var previousBodyOverflow = '';

      function showImage(index) {
        currentIndex = (index + galleryItems.length) % galleryItems.length;
        var item = galleryItems[currentIndex];
        var image = item.querySelector('img');
        lightboxImage.src = image.src;
        lightboxImage.alt = image.alt;
        lightboxCaption.textContent = item.querySelector('h4').textContent;
      }

      function closeLightbox() {
        lightbox.classList.remove('active');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = previousBodyOverflow;
        if (previousFocus) previousFocus.focus();
      }

      function openLightbox(item, index) {
        previousFocus = item;
        previousBodyOverflow = document.body.style.overflow;
        showImage(index);
        lightbox.classList.add('active');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        document.getElementById('lightbox-close').focus();
      }

      galleryItems.forEach(function(item, index) {
        item.setAttribute('tabindex', '0');
        item.setAttribute('role', 'button');
        item.addEventListener('click', function() {
          openLightbox(item, index);
        });
        item.addEventListener('keydown', function(event) {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openLightbox(item, index);
          }
        });
      });

      document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
      document.getElementById('lightbox-prev').addEventListener('click', function() {
        showImage(currentIndex - 1);
      });
      document.getElementById('lightbox-next').addEventListener('click', function() {
        showImage(currentIndex + 1);
      });

      lightbox.addEventListener('click', function(event) {
        if (event.target === lightbox) closeLightbox();
      });

      document.addEventListener('keydown', function(event) {
        if (!lightbox.classList.contains('active')) return;
        if (event.key === 'Escape') {
          closeLightbox();
        } else if (event.key === 'ArrowLeft') {
          showImage(currentIndex - 1);
        } else if (event.key === 'ArrowRight') {
          showImage(currentIndex + 1);
        }
      });
    })();
  </script>
@endsection
