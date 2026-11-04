@extends('landing_page.layout')

@section('title', 'Murid Berprestasi - YPI Nurul Ilmi Bekasi')

@section('head')
    <style>
      .achievement-card {
        background: #fff;
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        transition: transform 0.3s, box-shadow 0.3s;
        position: relative;
        height: 100%;
      }
      .achievement-card:hover {
        transform: translateY(-10px);
        box-shadow: 0 20px 60px rgba(10,79,66,0.2);
      }
      .achievement-card .img-wrapper {
        position: relative;
        overflow: hidden;
        height: 280px;
      }
      .achievement-card .img-wrapper img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.5s;
      }
      .achievement-card:hover .img-wrapper img {
        transform: scale(1.1);
      }
      .achievement-card .badge {
        position: absolute;
        top: 15px;
        right: 15px;
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, #D4AF37, #FFD700);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 20px;
        box-shadow: 0 4px 15px rgba(212,175,55,0.5);
        z-index: 10;
      }
      .achievement-card .category-tag {
        position: absolute;
        bottom: 15px;
        left: 15px;
        padding: 6px 15px;
        background: rgba(10,79,66,0.9);
        color: #fff;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      .achievement-card .card-body {
        padding: 25px;
        text-align: center;
      }
      .achievement-card .student-name {
        font-size: 20px;
        font-weight: 700;
        color: #0A4F42;
        margin-bottom: 5px;
      }
      .achievement-card .achievement-title {
        font-size: 14px;
        color: #D4AF37;
        font-weight: 600;
        margin-bottom: 10px;
      }
      .achievement-card .achievement-desc {
        font-size: 13px;
        color: #666;
        line-height: 1.6;
        margin-bottom: 15px;
      }
      .achievement-card .social-links {
        display: flex;
        justify-content: center;
        gap: 10px;
      }
      .achievement-card .social-links a {
        width: 35px;
        height: 35px;
        border-radius: 50%;
        background: #f0f0f0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #0A4F42;
        transition: all 0.3s;
      }
      .achievement-card .social-links a:hover {
        background: #0A4F42;
        color: #fff;
      }
      .hero-section {
        background: linear-gradient(135deg, #0A4F42 0%, #0d6b5a 100%);
        padding: 80px 0;
        position: relative;
        overflow: hidden;
      }
      .hero-section::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url('{{ asset('landingPage/images/bg_2.jpg') }}') center/cover;
        opacity: 0.1;
      }
      .hero-content {
        position: relative;
        z-index: 2;
      }
      .stats-section {
        background: #f8f9fa;
        padding: 40px 0;
      }
      .stat-item {
        text-align: center;
        padding: 20px;
      }
      .stat-item .stat-number {
        font-size: 48px;
        font-weight: 700;
        color: #0A4F42;
        line-height: 1;
      }
      .stat-item .stat-label {
        font-size: 14px;
        color: #666;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-top: 10px;
      }
      .filter-tabs {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 40px;
      }
      .filter-tabs .filter-btn {
        padding: 10px 25px;
        border: 2px solid #0A4F42;
        background: transparent;
        color: #0A4F42;
        border-radius: 30px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
      }
      .filter-tabs .filter-btn:hover,
      .filter-tabs .filter-btn.active {
        background: #0A4F42;
        color: #fff;
      }
      .section-title {
        text-align: center;
        margin-bottom: 50px;
      }
      .section-title h2 {
        font-size: 36px;
        font-weight: 700;
        color: #0A4F42;
        margin-bottom: 15px;
      }
      .section-title p {
        font-size: 16px;
        color: #666;
        max-width: 600px;
        margin: 0 auto;
      }
      .quote-section {
        background: linear-gradient(135deg, #0A4F42, #0d6b5a);
        padding: 60px 0;
        color: #fff;
        text-align: center;
      }
      .quote-section blockquote {
        font-size: 24px;
        font-style: italic;
        max-width: 800px;
        margin: 0 auto 20px;
        line-height: 1.6;
      }
      .quote-section cite {
        font-size: 16px;
        font-style: normal;
        opacity: 0.8;
      }
    </style>
@endsection

@section('content')

    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container hero-content">
        <div class="row justify-content-center text-center">
          <div class="col-lg-8">
            <span class="badge-label" style="background: rgba(212,175,55,0.2); color: #D4AF37; padding: 8px 20px; border-radius: 30px; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;"><i class="fas fa-trophy mr-2"></i>Kebanggaan Kami</span>
            <h1 class="mt-4 mb-4" style="color: #fff; font-size: 48px; font-weight: 700;">Murid Berprestasi YPI Nurul Ilmi</h1>
            <p class="mb-0" style="color: rgba(255,255,255,0.9); font-size: 18px; max-width: 600px; margin: 0 auto;">Siswa-siswi YPI Nurul Ilmi dari TKIT, SDIT, dan SMPIT yang telah meraih berbagai prestasi membanggakan di tingkat lokal, regional, bahkan nasional.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="stats-section">
      <div class="container">
        <div class="row">
          <div class="col-md-3 col-6">
            <div class="stat-item">
              <div class="stat-number">150+</div>
              <div class="stat-label">Total Prestasi</div>
            </div>
          </div>
          <div class="col-md-3 col-6">
            <div class="stat-item">
              <div class="stat-number">50+</div>
              <div class="stat-label">Juara 1</div>
            </div>
          </div>
          <div class="col-md-3 col-6">
            <div class="stat-item">
              <div class="stat-number">30+</div>
              <div class="stat-label">Hafiz Al-Quran</div>
            </div>
          </div>
          <div class="col-md-3 col-6">
            <div class="stat-item">
              <div class="stat-number">10+</div>
              <div class="stat-label">Juara Nasional</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Filter Tabs -->
    <section class="ftco-section ftco-no-pb" style="padding-top: 60px;">
      <div class="container">
        <div class="section-title">
          <h2>Daftar <span style="color: #D4AF37;">Murid Berprestasi</span></h2>
          <p>Klik pada tabs di bawah untuk memfilter berdasarkan kategori prestasi</p>
        </div>

        <div class="filter-tabs">
          <button class="filter-btn active">Semua</button>
          <button class="filter-btn">Akademik</button>
          <button class="filter-btn">Tahfidz</button>
          <button class="filter-btn">Olahraga</button>
          <button class="filter-btn">Seni & Budaya</button>
        </div>

        <div class="row">
          <!-- Student 1 -->
          <div class="col-md-6 col-lg-4 mb-4 ftco-animate">
            <div class="achievement-card">
              <div class="img-wrapper">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop" alt="Muhammad Rizki">
                <span class="badge"><i class="fas fa-trophy"></i></span>
                <span class="category-tag">Akademik</span>
              </div>
              <div class="card-body">
                <h3 class="student-name">Muhammad Rizki</h3>
                <p class="achievement-title">Juara 1 OSN Matematika</p>
                <p class="achievement-desc">Juara Nasional OSN Matematika tingkat SD/MI yang diselenggarakan di Jakarta dengan skor sempurna.</p>
                <div class="social-links">
                  <a href="#"><i class="fab fa-twitter"></i></a>
                  <a href="#"><i class="fab fa-instagram"></i></a>
                  <a href="#"><i class="fab fa-linkedin-in"></i></a>
                </div>
              </div>
            </div>
          </div>

          <!-- Student 2 -->
          <div class="col-md-6 col-lg-4 mb-4 ftco-animate">
            <div class="achievement-card">
              <div class="img-wrapper">
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=300&fit=crop" alt="Putri Aisyah">
                <span class="badge"><i class="fas fa-star"></i></span>
                <span class="category-tag">Tahfidz</span>
              </div>
              <div class="card-body">
                <h3 class="student-name">Putri Aisyah</h3>
                <p class="achievement-title">Hafizah 30 Juz</p>
                <p class="achievement-desc">Peraih Hafizah termuda di SDIT Nurul Ilmi dengan usia 10 tahun. Menyelesaikan hafalan dalam 3 tahun.</p>
                <div class="social-links">
                  <a href="#"><i class="fab fa-twitter"></i></a>
                  <a href="#"><i class="fab fa-instagram"></i></a>
                  <a href="#"><i class="fab fa-linkedin-in"></i></a>
                </div>
              </div>
            </div>
          </div>

          <!-- Student 3 -->
          <div class="col-md-6 col-lg-4 mb-4 ftco-animate">
            <div class="achievement-card">
              <div class="img-wrapper">
                <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=300&fit=crop" alt="Ahmad Farhan">
                <span class="badge"><i class="fas fa-medal"></i></span>
                <span class="category-tag">Akademik</span>
              </div>
              <div class="card-body">
                <h3 class="student-name">Ahmad Farhan</h3>
                <p class="achievement-title">Juara 2 FLS2N Bahasa Inggris</p>
                <p class="achievement-desc">Peraih juara 2 Festival Lomba Seni Siswa Nasional bidang Bahasa Inggris tingkat Provinsi Jawa Barat.</p>
                <div class="social-links">
                  <a href="#"><i class="fab fa-twitter"></i></a>
                  <a href="#"><i class="fab fa-instagram"></i></a>
                  <a href="#"><i class="fab fa-linkedin-in"></i></a>
                </div>
              </div>
            </div>
          </div>

          <!-- Student 4 -->
          <div class="col-md-6 col-lg-4 mb-4 ftco-animate">
            <div class="achievement-card">
              <div class="img-wrapper">
                <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=300&fit=crop" alt="Siti Nurhaliza">
                <span class="badge"><i class="fas fa-award"></i></span>
                <span class="category-tag">Seni & Budaya</span>
              </div>
              <div class="card-body">
                <h3 class="student-name">Siti Nurhaliza</h3>
                <p class="achievement-title">Juara 1 MTQ Kecamatan</p>
                <p class="achievement-desc">Best Speaker Musabaqah Tilawatil Quran tingkat Kecamatan dengan membaca yang fasih dan penuh penghayatan.</p>
                <div class="social-links">
                  <a href="#"><i class="fab fa-twitter"></i></a>
                  <a href="#"><i class="fab fa-instagram"></i></a>
                  <a href="#"><i class="fab fa-linkedin-in"></i></a>
                </div>
              </div>
            </div>
          </div>

          <!-- Student 5 -->
          <div class="col-md-6 col-lg-4 mb-4 ftco-animate">
            <div class="achievement-card">
              <div class="img-wrapper">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop" alt="Daffa Pratama">
                <span class="badge"><i class="fas fa-trophy"></i></span>
                <span class="category-tag">Olahraga</span>
              </div>
              <div class="card-body">
                <h3 class="student-name">Daffa Pratama</h3>
                <p class="achievement-title">Juara 1 Taekwondo Provinsi</p>
                <p class="achievement-desc">Medali emas pada kejuaraan Taekwondo tingkat Provinsi dengan predikat Best Technical.</p>
                <div class="social-links">
                  <a href="#"><i class="fab fa-twitter"></i></a>
                  <a href="#"><i class="fab fa-instagram"></i></a>
                  <a href="#"><i class="fab fa-linkedin-in"></i></a>
                </div>
              </div>
            </div>
          </div>

          <!-- Student 6 -->
          <div class="col-md-6 col-lg-4 mb-4 ftco-animate">
            <div class="achievement-card">
              <div class="img-wrapper">
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=300&fit=crop" alt="Aisyah Nur">
                <span class="badge"><i class="fas fa-star"></i></span>
                <span class="category-tag">Tahfidz</span>
              </div>
              <div class="card-body">
                <h3 class="student-name">Aisyah Nur</h3>
                <p class="achievement-title">Hafizah 15 Juz</p>
                <p class="achievement-desc">Siswa teladan yang berhasil menghafal 15 juz Al-Quran sambil tetap menjaga prestasi akademik.</p>
                <div class="social-links">
                  <a href="#"><i class="fab fa-twitter"></i></a>
                  <a href="#"><i class="fab fa-instagram"></i></a>
                  <a href="#"><i class="fab fa-linkedin-in"></i></a>
                </div>
              </div>
            </div>
          </div>

          <!-- Student 7 -->
          <div class="col-md-6 col-lg-4 mb-4 ftco-animate">
            <div class="achievement-card">
              <div class="img-wrapper">
                <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=300&fit=crop" alt="Rizky Ramadhan">
                <span class="badge"><i class="fas fa-medal"></i></span>
                <span class="category-tag">Akademik</span>
              </div>
              <div class="card-body">
                <h3 class="student-name">Rizky Ramadhan</h3>
                <p class="achievement-title">Juara 1 Science Project</p>
                <p class="achievement-desc">Project penelitian tentang lingkungan yang diajukan dalam kompetisi sains tingkat kabupaten.</p>
                <div class="social-links">
                  <a href="#"><i class="fab fa-twitter"></i></a>
                  <a href="#"><i class="fab fa-instagram"></i></a>
                  <a href="#"><i class="fab fa-linkedin-in"></i></a>
                </div>
              </div>
            </div>
          </div>

          <!-- Student 8 -->
          <div class="col-md-6 col-lg-4 mb-4 ftco-animate">
            <div class="achievement-card">
              <div class="img-wrapper">
                <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=300&fit=crop" alt="Devi Lestari">
                <span class="badge"><i class="fas fa-award"></i></span>
                <span class="category-tag">Seni & Budaya</span>
              </div>
              <div class="card-body">
                <h3 class="student-name">Devi Lestari</h3>
                <p class="achievement-title">Juara 1 Kaligrafi</p>
                <p class="achievement-desc">Karya kaligrafi terbaik dalam lomba seni islam tingkat regional dengan tema \"Keindahan Al-Quran\".</p>
                <div class="social-links">
                  <a href="#"><i class="fab fa-twitter"></i></a>
                  <a href="#"><i class="fab fa-instagram"></i></a>
                  <a href="#"><i class="fab fa-linkedin-in"></i></a>
                </div>
              </div>
            </div>
          </div>

          <!-- Student 9 -->
          <div class="col-md-6 col-lg-4 mb-4 ftco-animate">
            <div class="achievement-card">
              <div class="img-wrapper">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop" alt="Fadil Ahmad">
                <span class="badge"><i class="fas fa-trophy"></i></span>
                <span class="category-tag">Olahraga</span>
              </div>
              <div class="card-body">
                <h3 class="student-name">Fadil Ahmad</h3>
                <p class="achievement-title">Kapten Tim Futsal</p>
                <p class="achievement-desc">Memimpin tim futsal sekolah meraih juara 2 tingkat kabupaten dengan spirit sportivitas tinggi.</p>
                <div class="social-links">
                  <a href="#"><i class="fab fa-twitter"></i></a>
                  <a href="#"><i class="fab fa-instagram"></i></a>
                  <a href="#"><i class="fab fa-linkedin-in"></i></a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Quote Section -->
    <section class="quote-section">
      <div class="container">
        <blockquote>"Setiap anak memiliki potensi greatness. Tugas kami adalah menemukan dan mengembangkan potensi tersebut."</blockquote>
        <cite>- Sumartono, M.T. - Kepala Yayasan YPI Nurul Ilmi</cite>
      </div>
    </section>

@endsection