$filePath = "c:\Users\Lenovo\Documents\webnurulilmi-main\webnurulilmi-main\galeri-fasilitas.html"
$htmlContent = @"
<!DOCTYPE html>
<html lang="id">
<head>
  <title>Galeri Fasilitas - YPI Nurul Ilmi Bekasi</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <meta name="description" content="Galeri fasilitas pendidikan YPI Nurul Ilmi Bekasi - Lihat foto-foto fasilitas dan lingkungan belajar yang mendukung pembelajaran peserta didik.">

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet">

  <!-- Font Awesome -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">

  <link rel="stylesheet" href="css/bootstrap.min.css">
  <link rel="stylesheet" href="css/aos.css">
  <link rel="stylesheet" href="css/magnific-popup.css">
  <link rel="stylesheet" href="css/style.css">
  <style>
    /* ========================================
       GALLERY SPECIFIC STYLES
       ======================================== */

    /* Hero Section */
    .gallery-hero {
      background: linear-gradient(135deg, #0A4F42 0%, #0d6b5a 100%);
      padding: 100px 0 60px;
      position: relative;
      overflow: hidden;
    }

    .gallery-hero::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -20%;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%);
      border-radius: 50%;
    }

    .gallery-hero::after {
      content: '';
      position: absolute;
      bottom: -30%;
      left: -10%;
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
      border-radius: 50%;
    }

    /* Page Header */
    .page-header-badge {
      display: inline-block;
      background: rgba(255,255,255,0.2);
      color: #fff;
      padding: 8px 24px;
      border-radius: 30px;
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 15px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.3);
    }

    .gallery-hero h1 {
      font-family: 'Playfair Display', serif;
      font-size: 3rem;
      font-weight: 700;
      color: #fff;
      margin-bottom: 15px;
    }

    .gallery-hero h1 span {
      color: #D4AF37;
    }

    .gallery-hero p {
      font-size: 1.1rem;
      color: rgba(255,255,255,0.9);
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.7;
    }

    /* Gallery Section */
    .gallery-section {
      background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
      padding: 80px 0;
    }

    /* Gallery Grid */
    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 30px;
      margin-top: 40px;
    }

    /* Gallery Card */
    .gallery-card {
      background: #fff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0,0,0,0.08);
      transition: all 0.4s ease;
      position: relative;
    }

    .gallery-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 50px rgba(10,79,66,0.15);
    }

    .gallery-card-image {
      position: relative;
      height: 220px;
      overflow: hidden;
    }

    .gallery-card-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }

    .gallery-card:hover .gallery-card-image img {
      transform: scale(1.08);
    }

    .gallery-card-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(to top, rgba(10,79,66,0.8) 0%, transparent 50%);
      opacity: 0;
      transition: opacity 0.3s ease;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      padding-bottom: 20px;
    }

    .gallery-card:hover .gallery-card-overlay {
      opacity: 1;
    }

    .gallery-card-overlay span {
      color: #fff;
      font-size: 14px;
      font-weight: 500;
    }

    .gallery-card-overlay i {
      margin-right: 8px;
    }

    .gallery-card-body {
      padding: 20px 25px;
    }

    .gallery-card-body h4 {
      font-family: 'Playfair Display', serif;
      font-size: 1.2rem;
      font-weight: 600;
      color: #0A4F42;
      margin-bottom: 8px;
    }

    .gallery-card-body p {
      font-size: 14px;
      color: #666;
      line-height: 1.6;
      margin-bottom: 0;
    }

    /* Lightbox Modal */
    .lightbox-modal {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.95);
      z-index: 9999;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .lightbox-modal.active {
      display: flex;
    }

    .lightbox-content {
      max-width: 90%;
      max-height: 90vh;
      position: relative;
      text-align: center;
    }

    .lightbox-content img {
      max-width: 100%;
      max-height: 80vh;
      border-radius: 8px;
      box-shadow: 0 10px 50px rgba(0,0,0,0.5);
    }

    .lightbox-caption {
      margin-top: 20px;
      color: #fff;
      font-size: 1.1rem;
    }

    .lightbox-close {
      position: absolute;
      top: 20px;
      right: 30px;
      font-size: 40px;
      color: #fff;
      cursor: pointer;
      transition: color 0.3s;
      z-index: 10001;
    }

    .lightbox-close:hover {
      color: #D4AF37;
    }

    .lightbox-nav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      font-size: 50px;
      color: #fff;
      cursor: pointer;
      padding: 20px;
      transition: color 0.3s;
    }

    .lightbox-nav:hover {
      color: #D4AF37;
    }

    .lightbox-prev {
      left: 20px;
    }

    .lightbox-next {
      right: 20px;
    }

    /* Back Button */
    .back-to-home {
      margin-top: 30px;
      text-align: center;
    }

    .back-btn {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: #fff;
      color: #0A4F42;
      padding: 14px 35px;
      border-radius: 30px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.3s;
      box-shadow: 0 8px 25px rgba(10,79,66,0.15);
      border: 2px solid #0A4F42;
    }

    .back-btn:hover {
      background: linear-gradient(135deg, #0A4F42, #0d6b5a);
      color: #fff;
      transform: translateY(-3px);
      box-shadow: 0 12px 35px rgba(10,79,66,0.25);
      text-decoration: none;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .gallery-hero {
        padding: 80px 0 50px;
      }

      .gallery-hero h1 {
        font-size: 2rem;
      }

      .gallery-grid {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 20px;
      }

      .gallery-card-image {
        height: 180px;
      }

      .lightbox-nav {
        font-size: 30px;
        padding: 10px;
      }

      .lightbox-prev {
        left: 5px;
      }

      .lightbox-next {
        right: 5px;
      }
    }

    @media (max-width: 576px) {
      .gallery-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>

  <!-- Top Bar -->
  <div class="py-2" style="background: linear-gradient(135deg, #0F6A57, #0d5a4a);">
    <div class="container">
      <div class="row no-gutters d-flex align-items-start align-items-center px-3 px-md-0">
        <div class="col-lg-12 d-block">
          <div class="row d-flex">
            <div class="col-md-5 pr-4 d-flex topper align-items-center">
              <div class="icon mr-2 d-flex justify-content-center align-items-center" style="background: rgba(255,255,255,0.2); width: 35px; height: 35px; border-radius: 50%;"><span class="fas fa-map-marker-alt" style="color: #fff;"></span></div>
              <span class="text" style="color: rgba(255,255,255,0.9); font-size: 13px;">Perumahan Jl. Bumi Waringin Indah 2 No.1 Blok B1, Waringinjaya, Kec. Kedungwaringin, Kab. Bekasi, Jawa Barat 17540</span>
            </div>
            <div class="col-md pr-4 d-flex topper align-items-center">
              <div class="icon mr-2 d-flex justify-content-center align-items-center" style="background: rgba(255,255,255,0.2); width: 35px; height: 35px; border-radius: 50%;"><span class="fas fa-envelope" style="color: #fff;"></span></div>
              <span class="text" style="color: rgba(255,255,255,0.9); font-size: 13px;">yayasan@ypinurulilmi.or.id</span>
            </div>
            <div class="col-md pr-4 d-flex topper align-items-center">
              <div class="icon mr-2 d-flex justify-content-center align-items-center" style="background: rgba(255,255,255,0.2); width: 35px; height: 35px; border-radius: 50%;"><span class="fab fa-whatsapp" style="color: #fff;"></span></div>
              <a href="https://wa.me/6281282307424" target="_blank" style="color: #fff; font-weight: 600; font-size: 14px; text-decoration: none;">+62 812-8230-7424 (Bu Ida)</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Navbar -->
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark ftco_navbar ftco-navbar-light" id="ftco-navbar">
    <div class="container d-flex align-items-center justify-content-between">
      <a class="navbar-brand-container" href="index.html">
        <img src="images/logonurulilmi.png" alt="Logo YPI Nurul Ilmi" class="navbar-brand-logo">
        <span class="navbar-brand-text">
          <span class="navbar-brand-title">Yayasan Pendidikan Islam</span>
          <span class="navbar-brand-subtitle">NURUL ILMI</span>
        </span>
      </a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#ftco-nav" aria-controls="ftco-nav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="fas fa-bars"></span>
      </button>
      <div class="collapse navbar-collapse" id="ftco-nav">
        <ul class="navbar-nav ml-auto">
          <li class="nav-item"><a href="index.html" class="nav-link pl-0">Home</a></li>
          <li class="nav-item"><a href="about.html" class="nav-link">Tentang Kami</a></li>
          <li class="nav-item"><a href="teacher.html" class="nav-link">Pembiasaan Pagi</a></li>
          <li class="nav-item"><a href="courses.html" class="nav-link">Program</a></li>
          <li class="nav-item"><a href="pricing.html" class="nav-link">Biaya</a></li>
          <li class="nav-item"><a href="blog.html" class="nav-link">Artikel</a></li>
          <li class="nav-item dropdown">
            <a href="#" class="nav-link dropdown-toggle" id="unitDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Unit Sigma</a>
            <div class="dropdown-menu" aria-labelledby="unitDropdown">
              <a class="dropdown-item" href="tk-sigma.html"><i class="fas fa-star mr-2" style="color: #D4940A;"></i>TK Sigma</a>
              <a class="dropdown-item" href="daycare-sigma.html"><i class="fas fa-baby mr-2" style="color: #D4940A;"></i>Daycare Sigma</a>
            </div>
          </li>
        </ul>
      </div>
      <div class="navbar-smartschool-logo">
        <img src="images/smartschool.png" alt="Smart School" title="Smart School">
      </div>
    </div>
  </nav>

  <!-- Hero Section -->
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

  <!-- Gallery Section -->
  <section class="gallery-section">
    <div class="container">
      <div class="gallery-grid">

        <!-- Gallery Item: Lab Komputer -->
        <div class="gallery-card" data-aos="fade-up" data-aos-delay="100">
          <div class="gallery-card-image">
            <img src="images/labkomputer.jpeg" alt="Laboratorium Komputer" loading="lazy">
            <div class="gallery-card-overlay">
              <span><i class="fas fa-search-plus"></i>Klik untuk memperbesar</span>
            </div>
          </div>
          <div class="gallery-card-body">
            <h4>Laboratorium Komputer</h4>
            <p>Ruang komputer dengan perangkat modern untuk mendukung pembelajaran digital dan teknologi informasi.</p>
          </div>
        </div>

        <!-- Gallery Item: Ruang Kelas -->
        <div class="gallery-card" data-aos="fade-up" data-aos-delay="150">
          <div class="gallery-card-image">
            <img src="images/kelas.jpeg" alt="Ruang Kelas" loading="lazy">
            <div class="gallery-card-overlay">
              <span><i class="fas fa-search-plus"></i>Klik untuk memperbesar</span>
            </div>
          </div>
          <div class="gallery-card-body">
            <h4>Ruang Kelas</h4>
            <p>Ruang kelas ber-AC dengan desain nyaman dan conducive untuk proses belajar mengajar.</p>
          </div>
        </div>

        <!-- Gallery Item: Kantin -->
        <div class="gallery-card" data-aos="fade-up" data-aos-delay="200">
          <div class="gallery-card-image">
            <img src="images/kantin.jpeg" alt="Kantin Sekolah" loading="lazy">
            <div class="gallery-card-overlay">
              <span><i class="fas fa-search-plus"></i>Klik untuk memperbesar</span>
            </div>
          </div>
          <div class="gallery-card-body">
            <h4>Kantin Sekolah</h4>
            <p>Kantin dengan makanan sehat dan bergizi untuk mendukung energi belajar peserta didik.</p>
          </div>
        </div>

        <!-- Gallery Item: Laboratorium Sains -->
        <div class="gallery-card" data-aos="fade-up" data-aos-delay="250">
          <div class="gallery-card-image">
            <img src="images/lab.JPG" alt="Laboratorium Sains" loading="lazy">
            <div class="gallery-card-overlay">
              <span><i class="fas fa-search-plus"></i>Klik untuk memperbesar</span>
            </div>
          </div>
          <div class="gallery-card-body">
            <h4>Laboratorium Sains</h4>
            <p>Laboratorium untuk eksperimen sains yang mendukung pembelajaran praktis dan interaktif.</p>
          </div>
        </div>

        <!-- Gallery Item: Lapangan -->
        <div class="gallery-card" data-aos="fade-up" data-aos-delay="300">
          <div class="gallery-card-image">
            <img src="images/lapangan.jpeg" alt="Lapangan Olahraga" loading="lazy">
            <div class="gallery-card-overlay">
              <span><i class="fas fa-search-plus"></i>Klik untuk memperbesar</span>
            </div>
          </div>
          <div class="gallery-card-body">
            <h4>Lapangan Olahraga</h4>
            <p>Lapangan luas untuk kegiatan olahraga, upacara, dan berbagai kegiatan sekolah.</p>
          </div>
        </div>

        <!-- Gallery Item: Kolam Ikan -->
        <div class="gallery-card" data-aos="fade-up" data-aos-delay="350">
          <div class="gallery-card-image">
            <img src="images/kolamikan.jpeg" alt="Area Kolam Ikan" loading="lazy">
            <div class="gallery-card-overlay">
              <span><i class="fas fa-search-plus"></i>Klik untuk memperbesar</span>
            </div>
          </div>
          <div class="gallery-card-body">
            <h4>Area Kolam Ikan</h4>
            <p>Area pembelajaran berbasis alam dengan kolam ikan untuk pengalaman belajar yang menyenangkan.</p>
          </div>
        </div>

        <!-- Gallery Item: Area Parkir -->
        <div class="gallery-card" data-aos="fade-up" data-aos-delay="400">
          <div class="gallery-card-image">
            <img src="images/parkir.jpeg" alt="Area Parkir" loading="lazy">
            <div class="gallery-card-overlay">
              <span><i class="fas fa-search-plus"></i>Klik untuk memperbesar</span>
            </div>
          </div>
          <div class="gallery-card-body">
            <h4>Area Parkir</h4>
            <p>Area parkir yang luas dan aman untuk kendaraan guru, staff, dan pengunjung.</p>
          </div>
        </div>

        <!-- Gallery Item: ID Card -->
        <div class="gallery-card" data-aos="fade-up" data-aos-delay="450">
          <div class="gallery-card-image">
            <img src="images/idcard.jpeg" alt="ID Card & Access Control" loading="lazy">
            <div class="gallery-card-overlay">
              <span><i class="fas fa-search-plus"></i>Klik untuk memperbesar</span>
            </div>
          </div>
          <div class="gallery-card-body">
            <h4>ID Card & Access Control</h4>
            <p>Sistem keamanan dengan ID Card dan akses kontrol untuk keamanan seluruh lingkungan sekolah.</p>
          </div>
        </div>

        <!-- Gallery Item: Gedung Utama -->
        <div class="gallery-card" data-aos="fade-up" data-aos-delay="500">
          <div class="gallery-card-image">
            <img src="images/main.jpeg" alt="Gedung Utama" loading="lazy">
            <div class="gallery-card-overlay">
              <span><i class="fas fa-search-plus"></i>Klik untuk memperbesar</span>
            </div>
          </div>
          <div class="gallery-card-body">
            <h4>Gedung Utama</h4>
            <p>Gedung sekolah dengan desain modern dan fasilitas lengkap untuk mendukung pembelajaran.</p>
          </div>
        </div>

        <!-- Gallery Item: Dokumentasi 1 -->
        <div class="gallery-card" data-aos="fade-up" data-aos-delay="550">
          <div class="gallery-card-image">
            <img src="images/image_1.jpg" alt="Dokumentasi Kegiatan" loading="lazy">
            <div class="gallery-card-overlay">
              <span><i class="fas fa-search-plus"></i>Klik untuk memperbesar</span>
            </div>
          </div>
          <div class="gallery-card-body">
            <h4>Dokumentasi Fasilitas Sekolah</h4>
            <p>Dokumentasi berbagai fasilitas dan kegiatan di lingkungan YPI Nurul Ilmi.</p>
          </div>
        </div>

        <!-- Gallery Item: Dokumentasi 2 -->
        <div class="gallery-card" data-aos="fade-up" data-aos-delay="600">
          <div class="gallery-card-image">
            <img src="images/image_2.jpg" alt="Dokumentasi Kegiatan" loading="lazy">
            <div class="gallery-card-overlay">
              <span><i class="fas fa-search-plus"></i>Klik untuk memperbesar</span>
            </div>
          </div>
          <div class="gallery-card-body">
            <h4>Dokumentasi Fasilitas Sekolah</h4>
            <p>Dokumentasi berbagai fasilitas dan kegiatan di lingkungan YPI Nurul Ilmi.</p>
          </div>
        </div>

        <!-- Gallery Item: Dokumentasi 3 -->
        <div class="gallery-card" data-aos="fade-up" data-aos-delay="650">
          <div class="gallery-card-image">
            <img src="images/image_3.jpg" alt="Dokumentasi Kegiatan" loading="lazy">
            <div class="gallery-card-overlay">
              <span><i class="fas fa-search-plus"></i>Klik untuk memperbesar</span>
            </div>
          </div>
          <div class="gallery-card-body">
            <h4>Dokumentasi Fasilitas Sekolah</h4>
            <p>Dokumentasi berbagai fasilitas dan kegiatan di lingkungan YPI Nurul Ilmi.</p>
          </div>
        </div>

        <!-- Gallery Item: Dokumentasi 4 -->
        <div class="gallery-card" data-aos="fade-up" data-aos-delay="700">
          <div class="gallery-card-image">
            <img src="images/image_4.jpg" alt="Dokumentasi Kegiatan" loading="lazy">
            <div class="gallery-card-overlay">
              <span><i class="fas fa-search-plus"></i>Klik untuk memperbesar</span>
            </div>
          </div>
          <div class="gallery-card-body">
            <h4>Dokumentasi Fasilitas Sekolah</h4>
            <p>Dokumentasi berbagai fasilitas dan kegiatan di lingkungan YPI Nurul Ilmi.</p>
          </div>
        </div>

        <!-- Gallery Item: IMG_4211 -->
        <div class="gallery-card" data-aos="fade-up" data-aos-delay="750">
          <div class="gallery-card-image">
            <img src="images/IMG_4211.JPG" alt="Dokumentasi Kegiatan" loading="lazy">
            <div class="gallery-card-overlay">
              <span><i class="fas fa-search-plus"></i>Klik untuk memperbesar</span>
            </div>
          </div>
          <div class="gallery-card-body">
            <h4>Dokumentasi Fasilitas Sekolah</h4>
            <p>Dokumentasi berbagai fasilitas dan kegiatan di lingkungan YPI Nurul Ilmi.</p>
          </div>
        </div>

      </div>

      <!-- Back Button -->
      <div class="back-to-home" data-aos="fade-up">
        <a href="index.html" class="back-btn">
          <i class="fas fa-arrow-left"></i>Kembali ke Halaman Utama
        </a>
      </div>
    </div>
  </section>

  <!-- Lightbox Modal -->
  <div class="lightbox-modal" id="lightbox">
    <span class="lightbox-close" id="lightbox-close">&times;</span>
    <span class="lightbox-nav lightbox-prev" id="lightbox-prev"><i class="fas fa-chevron-left"></i></span>
    <span class="lightbox-nav lightbox-next" id="lightbox-next"><i class="fas fa-chevron-right"></i></span>
    <div class="lightbox-content">
      <img src="" alt="" id="lightbox-image">
      <p class="lightbox-caption" id="lightbox-caption"></p>
    </div>
  </div>

  <!-- Footer -->
  <footer class="ftco-footer ftco-bg-dark ftco-section">
    <div class="container">
      <div class="row mb-5">
        <div class="col-md-6 col-lg-3">
          <div class="ftco-footer-widget mb-5">
            <h2 class="ftco-heading-2">Hubungi Kami</h2>
            <div class="block-23 mb-3">
              <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="display: flex; align-items: flex-start; margin-bottom: 12px;">
                  <span class="fas fa-map-marker-alt" style="color: #fff; margin-right: 15px; margin-top: 3px; flex-shrink: 0;"></span>
                  <span class="text" style="color: rgba(255,255,255,0.7); line-height: 1.6;">Perumahan Jl. Bumi Waringin Indah 2 No.1 Blok B1, Waringinjaya, Kec. Kedungwaringin, Kab. Bekasi, Jawa Barat 17540</span>
                </li>
                <li style="margin-bottom: 12px;">
                  <a href="https://wa.me/6281282307424" target="_blank" style="display: flex; align-items: center; color: rgba(255,255,255,0.7); text-decoration: none;">
                    <span class="fab fa-whatsapp" style="color: #25D366; margin-right: 15px; font-size: 16px;"></span>
                    <span>+62 812-8230-7424 (Bu Ida)</span>
                  </a>
                </li>
                <li style="margin-bottom: 12px;">
                  <a href="https://wa.me/6281285257593" target="_blank" style="display: flex; align-items: center; color: rgba(255,255,255,0.7); text-decoration: none;">
                    <span class="fab fa-whatsapp" style="color: #25D366; margin-right: 15px; font-size: 16px;"></span>
                    <span>+62 812-8525-7593 (Bu Linda)</span>
                  </a>
                </li>
                <li>
                  <a href="mailto:yayasan@ypinurulilmi.or.id" style="display: flex; align-items: center; color: rgba(255,255,255,0.7); text-decoration: none;">
                    <span class="fas fa-envelope" style="margin-right: 15px; font-size: 16px;"></span>
                    <span>yayasan@ypinurulilmi.or.id</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="col-md-6 col-lg-3">
          <div class="ftco-footer-widget mb-5">
            <h2 class="ftco-heading-2">Tautan</h2>
            <ul class="list-unstyled">
              <li><a href="index.html"><span class="fas fa-arrow-right mr-2"></span>Home</a></li>
              <li><a href="about.html"><span class="fas fa-arrow-right mr-2"></span>Tentang Kami</a></li>
              <li><a href="pricing.html"><span class="fas fa-arrow-right mr-2"></span>Biaya</a></li>
              <li><a href="contact.html"><span class="fas fa-arrow-right mr-2"></span>Hubungi Kami</a></li>
            </ul>
          </div>
        </div>
        <div class="col-md-6 col-lg-3">
          <div class="ftco-footer-widget mb-5">
            <h2 class="ftco-heading-2">Unit Pendidikan</h2>
            <ul class="list-unstyled">
              <li><a href="tk-sigma.html"><span class="fas fa-arrow-right mr-2"></span>TK Sigma</a></li>
              <li><a href="daycare-sigma.html"><span class="fas fa-arrow-right mr-2"></span>Daycare Sigma</a></li>
              <li><a href="pricing.html"><span class="fas fa-arrow-right mr-2"></span>TKIT Nurul Ilmi</a></li>
              <li><a href="pricing.html"><span class="fas fa-arrow-right mr-2"></span>SDIT Nurul Ilmi</a></li>
              <li><a href="pricing.html"><span class="fas fa-arrow-right mr-2"></span>SMPIT Nurul Ilmi</a></li>
            </ul>
          </div>
        </div>
        <div class="col-md-6 col-lg-3">
          <div class="ftco-footer-widget mb-5">
            <h2 class="ftco-heading-2">YPI Nurul Ilmi</h2>
            <p style="color: rgba(255,255,255,0.7); line-height: 1.8;">Yayasan Pendidikan Islam Nurul Ilmi Bekasi - Membangun generasi Islam yang beriman, berilmu, dan berakhlak mulia.</p>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-md-12 text-center">
          <p style="color: rgba(255,255,255,0.7); margin: 0;">
            &copy; 2024 YPI Nurul Ilmi Bekasi. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  </footer>

  <!-- loader -->
  <div id="ftco-loader" class="show fullscreen">
    <svg class="circular" width="48px" height="48px">
      <circle class="path-bg" cx="24" cy="24" r="20" fill="none" stroke-width="4" stroke="#eeeeee"/>
      <circle class="path" cx="24" cy="24" r="20" fill="none" stroke-width="4" stroke="#0A4F42"/>
    </svg>
  </div>

  <script src="js/jquery.min.js"></script>
  <script src="js/jquery-migrate-3.0.1.min.js"></script>
  <script src="js/popper.min.js"></script>
  <script src="js/bootstrap.min.js"></script>
  <script src="js/jquery.easing.1.3.js"></script>
  <script src="js/aos.js"></script>
  <script src="js/main.js"></script>
  <script>
    // Lightbox functionality
    $(document).ready(function() {
      const galleryItems = $('.gallery-card');
      let currentIndex = 0;

      // Open lightbox
      galleryItems.on('click', function() {
        currentIndex = $(this).index();
        showImage(currentIndex);
        $('#lightbox').addClass('active');
        $('body').css('overflow', 'hidden');
      });

      // Close lightbox
      $('#lightbox-close').on('click', function() {
        $('#lightbox').removeClass('active');
        $('body').css('overflow', 'auto');
      });

      // Close on background click
      $('#lightbox').on('click', function(e) {
        if (e.target === this) {
          $('#lightbox').removeClass('active');
          $('body').css('overflow', 'auto');
        }
      });

      // Previous image
      $('#lightbox-prev').on('click', function(e) {
        e.stopPropagation();
        currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
        showImage(currentIndex);
      });

      // Next image
      $('#lightbox-next').on('click', function(e) {
        e.stopPropagation();
        currentIndex = (currentIndex + 1) % galleryItems.length;
        showImage(currentIndex);
      });

      // Keyboard navigation
      $(document).on('keydown', function(e) {
        if (!$('#lightbox').hasClass('active')) return;

        if (e.key === 'Escape') {
          $('#lightbox').removeClass('active');
          $('body').css('overflow', 'auto');
        } else if (e.key === 'ArrowLeft') {
          currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
          showImage(currentIndex);
        } else if (e.key === 'ArrowRight') {
          currentIndex = (currentIndex + 1) % galleryItems.length;
          showImage(currentIndex);
        }
      });

      function showImage(index) {
        const item = galleryItems.eq(index);
        const imgSrc = item.find('img').attr('src');
        const caption = item.find('h4').text();

        $('#lightbox-image').attr('src', imgSrc);
        $('#lightbox-caption').text(caption);
      }

      // Initialize AOS
      AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true
      });
    });
  </script>
</body>
</html>
"@

$htmlContent | Out-File -FilePath $filePath -Encoding UTF8
Write-Host "Gallery page created successfully!"
