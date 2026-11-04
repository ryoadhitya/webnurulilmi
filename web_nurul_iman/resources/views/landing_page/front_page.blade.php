@extends('landing_page.layout')

@section('title', 'YPI Nurul Ilmi Bekasi - Sekolah Islam Berakreditasi A')

@section('head')
    <link rel="stylesheet" href="{{ asset('landingPage/css/galeri-fasilitas.css') }}">
@endsection

@section('content')

    <!-- Hero Slider -->
    <section class="home-slider owl-carousel">
        <div class="slider-item" style="background-image:url(images/bg_1.jpg);">
            <div class="overlay"></div>
            <div class="container">
                <div class="row no-gutters slider-text align-items-center justify-content-center"
                    data-scrollax-parent="true">
                    <div class="col-md-8 text-center ftco-animate">
                        <h1 class="mb-4">Menumbuhkan Generasi <span>Beriman, Berilmu, dan Berakhlak</span></h1>
                        <p><a href="{{ route('home') }}#jenjang" class="btn btn-secondary px-4 py-3 mt-3">Lihat Jenjang
                                Pendidikan</a></p>
                    </div>
                </div>
            </div>
        </div>

        <div class="slider-item" style="background-image:url(images/bg_2.jpg);">
            <div class="overlay"></div>
            <div class="container">
                <div class="row no-gutters slider-text align-items-center justify-content-center"
                    data-scrollax-parent="true">
                    <div class="col-md-8 text-center ftco-animate">
                        <h1 class="mb-4">Membangun Generasi Islam <span>dari Masa Kanak-Kanak hingga Remaja</span>
                        </h1>
                        <p><a href="{{ route('home') }}#jenjang" class="btn btn-secondary px-4 py-3 mt-3">Lihat Jenjang
                                Pendidikan</a></p>
                    </div>
                </div>
            </div>
        </div>

        <div class="slider-item" style="background-image:url(images/bg_3.jpg);">
            <div class="overlay"></div>
            <div class="container">
                <div class="row no-gutters slider-text align-items-center justify-content-center"
                    data-scrollax-parent="true">
                    <div class="col-md-8 text-center ftco-animate">
                        <h1 class="mb-4">Pendidikan Islam Terpadu <span>TKIT, SDIT & SMPIT</span></h1>
                        <p><a href="{{ route('home') }}#jenjang" class="btn btn-secondary px-4 py-3 mt-3">Pelajari
                                Lebih Lanjut</a></p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="ftco-services ftco-no-pb">
        <div class="container-wrap">
            <div class="row no-gutters">
                <div class="col-md-3 d-flex services align-self-stretch pb-4 px-4 ftco-animate bg-primary">
                    <div class="media block-6 d-block text-center">
                        <div class="icon d-flex justify-content-center align-items-center">
                            <span class="flaticon-diploma"></span>
                        </div>
                        <div class="media-body p-2 mt-3">
                            <h3 class="heading">3 Jenjang Pendidikan</h3>
                            <p>TKIT, SDIT, dan SMPIT dalam satu yayasan pendidikan Islam yang terintegrasi.</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 d-flex services align-self-stretch pb-4 px-4 ftco-animate bg-fifth">
                    <div class="media block-6 d-block text-center">
                        <div class="icon d-flex justify-content-center align-items-center">
                            <span class="flaticon-reading"></span>
                        </div>
                        <div class="media-body p-2 mt-3">
                            <h3 class="heading">Digital Learning</h3>
                            <p>Pembelajaran digital dengan sistem one gate card untuk seluruh peserta didik.</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 d-flex services align-self-stretch pb-4 px-4 ftco-animate bg-fifth">
                    <div class="media block-6 d-block text-center">
                        <div class="icon d-flex justify-content-center align-items-center">
                            <span class="flaticon-books"></span>
                        </div>
                        <div class="media-body p-2 mt-3">
                            <h3 class="heading">Tahfidz Al-Quran</h3>
                            <p>Program tahfidz intensif di sore hari oleh ustadz dan ustadzah berpengalaman.</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 d-flex services align-self-stretch pb-4 px-4 ftco-animate bg-quarternary">
                    <div class="media block-6 d-block text-center">
                        <div class="icon d-flex justify-content-center align-items-center">
                            <span class="flaticon-security"></span>
                        </div>
                        <div class="media-body p-2 mt-3">
                            <h3 class="heading">One Gate System</h3>
                            <p>Keamanan satu pintu dengan ID Card & Access Control untuk seluruh lingkungan sekolah.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="ftco-section ftco-no-pt ftc-no-pb">
        <div class="container">
            <div class="row">
                <div class="col-md-5 order-md-last wrap-about py-5 wrap-about bg-light">
                    <div class="text px-4 ftco-animate">
                        <h2 class="mb-4">Selamat Datang di YPI Nurul Ilmi</h2>
                        <p>Berdiri sejak 1 Agustus 2001, <strong>Yayasan Pendidikan Islam (YPI) Nurul Ilmi
                                Bekasi</strong> merupakan lembaga pendidikan Islam yang terletak di Perumahan Bumi
                            Waringin Indah 2, Waringinjaya, Kedungwaringin, Bekasi.</p>
                        <p>YPI Nurul Ilmi menyelenggarakan pendidikan Islam pada tiga jenjang: <strong>TKIT Nurul
                                Ilmi</strong> (Taman Kanak-Kanak Islam Terpadu), <strong>SDIT Nurul Ilmi</strong>
                            (Sekolah Dasar Islam Terpadu), dan <strong>SMPIT Nurul Ilmi</strong> (Sekolah Menengah
                            Pertama Islam Terpadu).</p>
                        <p>Kami menawarkan pendidikan Islam yang berkualitas dengan pendekatan seimbang antara ilmu
                            pengetahuan, teknologi, dan pembentukan karakter Islami.</p>
                        <p><a href="{{ route('about') }}" class="btn btn-secondary px-4 py-3">Selengkapnya</a></p>
                    </div>
                </div>
                <div class="col-md-7 wrap-about py-5 pr-md-4 ftco-animate">
                    <h2 class="mb-4">Keunggulan YPI Nurul Ilmi</h2>
                    <p>Kami menawarkan pendidikan Islam yang berkualitas melalui berbagai program Unggulan dan fasilitas
                        modern untuk mendukung perkembangan peserta didik.</p>
                    <div class="row mt-5">
                        <div class="col-lg-6">
                            <div class="services-2 d-flex">
                                <div class="icon mt-2 mr-3 d-flex justify-content-center align-items-center"><span
                                        class="flaticon-security"></span></div>
                                <div class="text">
                                    <h3>One Gate System</h3>
                                    <p>Sistem keamanan satu pintu dengan ID Card & Access Control.</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-6">
                            <div class="services-2 d-flex">
                                <div class="icon mt-2 mr-3 d-flex justify-content-center align-items-center"><span
                                        class="flaticon-reading"></span></div>
                                <div class="text">
                                    <h3>Digital Learning</h3>
                                    <p>Pembelajaran digital dengan aplikasi dan perpustakaan digital.</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-6">
                            <div class="services-2 d-flex">
                                <div class="icon mt-2 mr-3 d-flex justify-content-center align-items-center"><span
                                        class="flaticon-books"></span></div>
                                <div class="text">
                                    <h3>e-Library</h3>
                                    <p>Perpustakaan digital untuk mendukung pembelajaran mandiri.</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-6">
                            <div class="services-2 d-flex">
                                <div class="icon mt-2 mr-3 d-flex justify-content-center align-items-center"><span
                                        class="flaticon-education"></span></div>
                                <div class="text">
                                    <h3>Ruang Kelas AC</h3>
                                    <p>Fasilitas belajar yang nyaman dan mendukung pembelajaran optimal.</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-6">
                            <div class="services-2 d-flex">
                                <div class="icon mt-2 mr-3 d-flex justify-content-center align-items-center"><span
                                        class="flaticon-jigsaw"></span></div>
                                <div class="text">
                                    <h3>Laboratorium</h3>
                                    <p>Laboratorium Fisika, Kimia, dan Biologi untuk eksperimen.</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-6">
                            <div class="services-2 d-flex">
                                <div class="icon mt-2 mr-3 d-flex justify-content-center align-items-center"><span
                                        class="flaticon-kids"></span></div>
                                <div class="text">
                                    <h3>Ekstrakurikuler</h3>
                                    <p>Berbagai kegiatan ekstrakurikuler untuk mengembangkan potensi dan bakat.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Jenjang Pendidikan Section -->
    <section id="jenjang" class="jenjang-section"
        style="background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%); padding: 80px 0;">
        <div class="container">
            <!-- Section Header -->
            <div class="row justify-content-center mb-5" data-aos="fade-down">
                <div class="col-md-8 text-center">
                    <span class="jenjang-badge">Pilihan Pendidikan</span>
                    <h2 class="mt-4 mb-3">Temukan Pendidikan yang Tepat untuk <span
                            style="color: #D4AF37;">Ananda</span></h2>
                    <p class="section-subtitle">Kenali pilihan pendidikan di bawah YPI Nurul Ilmi, mulai dari
                        pendidikan anak usia dini, layanan daycare, hingga jenjang sekolah dasar dan menengah.</p>
                </div>
            </div>

            <!-- Unit Cards - Row 1: 3 cards -->
            <div class="row mb-4">
                <!-- TK Sigma Card -->
                <div class="col-lg-4 col-md-6 mb-4" data-aos="fade-up" data-aos-delay="100">
                    <div class="jenjang-card"
                        style="background: #fff; border-radius: 20px; padding: 35px 30px; text-align: center; box-shadow: 0 15px 50px rgba(0,0,0,0.1); transition: all 0.4s ease; border-top: 5px solid #D4940A; height: 100%; position: relative;">
                        <span
                            style="position: absolute; top: 15px; right: 15px; background: linear-gradient(135deg, #D4940A, #E6A800); color: #fff; padding: 4px 12px; border-radius: 20px; font-size: 10px; font-weight: 700; text-transform: uppercase;">Baru</span>
                        <div class="jenjang-icon"
                            style="width: 100px; height: 100px; background: linear-gradient(135deg, #D4940A, #F5C518); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 25px; box-shadow: 0 15px 35px rgba(212, 148, 10, 0.3);">
                            <i class="fas fa-star" style="font-size: 42px; color: #fff;"></i>
                        </div>
                        <div class="jenjang-label"
                            style="display: inline-block; background: linear-gradient(135deg, #D4940A, #E6A800); color: #fff; padding: 6px 18px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px;">
                            PAUD</div>
                        <h3 class="jenjang-title"
                            style="color: #D4940A; font-weight: 700; font-size: 1.5rem; margin-bottom: 5px;">TK Sigma
                        </h3>
                        <p class="jenjang-subtitle"
                            style="color: #D4940A; font-weight: 600; font-size: 14px; margin-bottom: 15px;">Taman
                            Kanak-Kanak Islam Terpadu</p>
                        <p class="jenjang-desc"
                            style="color: #666; font-size: 13px; line-height: 1.7; margin-bottom: 20px;">TK Islam
                            Terpadu di bawah YPI Nurul Ilmi Bekasi yang berdiri sejak 2013. Belajar melalui bermain
                            dengan Kurikulum Merdeka dan nilai-nilai Islam.</p>
                        <div class="jenjang-info"
                            style="background: #FFFDE7; border-radius: 12px; padding: 15px; margin-bottom: 20px;">
                            <p style="margin: 0; font-size: 12px; color: #555;"><i class="fas fa-calendar-alt"
                                    style="color: #D4940A; margin-right: 6px;"></i> Berdiri sejak 2013</p>
                            <p style="margin: 6px 0 0; font-size: 12px; color: #555;"><i class="fas fa-child"
                                    style="color: #D4940A; margin-right: 6px;"></i> Usia 4-6 tahun</p>
                            <p style="margin: 6px 0 0; font-size: 12px; color: #555;"><i class="fas fa-book-quran"
                                    style="color: #D4940A; margin-right: 6px;"></i> Program Tahfidz & Adab</p>
                        </div>
                        <a href="{{ route('tk-sigma') }}" class="jenjang-btn"
                            style="display: inline-block; background: linear-gradient(135deg, #D4940A, #E6A800); color: #fff; padding: 14px 35px; border-radius: 30px; font-weight: 600; text-decoration: none; transition: all 0.3s; box-shadow: 0 8px 25px rgba(212, 148, 10, 0.3);">Lihat
                            Informasi TK Sigma</a>
                    </div>
                </div>

                <!-- Daycare Sigma Card -->
                <div class="col-lg-4 col-md-6 mb-4" data-aos="fade-up" data-aos-delay="150">
                    <div class="jenjang-card"
                        style="background: #fff; border-radius: 20px; padding: 35px 30px; text-align: center; box-shadow: 0 15px 50px rgba(0,0,0,0.1); transition: all 0.4s ease; border-top: 5px solid #F5C518; height: 100%; position: relative;">
                        <span
                            style="position: absolute; top: 15px; right: 15px; background: linear-gradient(135deg, #F5C518, #FFD54F); color: #fff; padding: 4px 12px; border-radius: 20px; font-size: 10px; font-weight: 700; text-transform: uppercase;">Baru</span>
                        <div class="jenjang-icon"
                            style="width: 100px; height: 100px; background: linear-gradient(135deg, #F5C518, #FFD54F); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 25px; box-shadow: 0 15px 35px rgba(245, 197, 24, 0.3);">
                            <i class="fas fa-baby" style="font-size: 42px; color: #fff;"></i>
                        </div>
                        <div class="jenjang-label"
                            style="display: inline-block; background: linear-gradient(135deg, #F5C518, #E6A800); color: #fff; padding: 6px 18px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px;">
                            Daycare</div>
                        <h3 class="jenjang-title"
                            style="color: #D4940A; font-weight: 700; font-size: 1.5rem; margin-bottom: 5px;">Daycare
                            Sigma</h3>
                        <p class="jenjang-subtitle"
                            style="color: #D4940A; font-weight: 600; font-size: 14px; margin-bottom: 15px;">Layanan
                            Penitipan Anak</p>
                        <p class="jenjang-desc"
                            style="color: #666; font-size: 13px; line-height: 1.7; margin-bottom: 20px;">Layanan
                            pengasuhan anak usia 2-6 tahun untuk Ayah/Bunda yang bekerja. Aktivitas harian, stimulasi
                            tumbuh kembang, dan laporan via WhatsApp.</p>
                        <div class="jenjang-info"
                            style="background: #FFFDE7; border-radius: 12px; padding: 15px; margin-bottom: 20px;">
                            <p style="margin: 0; font-size: 12px; color: #555;"><i class="fas fa-clock"
                                    style="color: #D4940A; margin-right: 6px;"></i> 07.00 - 17.00 WIB</p>
                            <p style="margin: 6px 0 0; font-size: 12px; color: #555;"><i class="fas fa-child"
                                    style="color: #D4940A; margin-right: 6px;"></i> Usia 2-6 tahun</p>
                            <p style="margin: 6px 0 0; font-size: 12px; color: #555;"><i
                                    class="fas fa-hand-holding-heart" style="color: #D4940A; margin-right: 6px;"></i>
                                Full/Half Day & Harian</p>
                        </div>
                        <a href="{{ route('daycare-sigma') }}" class="jenjang-btn"
                            style="display: inline-block; background: linear-gradient(135deg, #F5C518, #FFD54F); color: #fff; padding: 14px 35px; border-radius: 30px; font-weight: 600; text-decoration: none; transition: all 0.3s; box-shadow: 0 8px 25px rgba(245, 197, 24, 0.3);">Lihat
                            Informasi Daycare</a>
                    </div>
                </div>

                <!-- TKIT Nurul Ilmi Card -->
                <div class="col-lg-4 col-md-6 mb-4" data-aos="fade-up" data-aos-delay="200">
                    <div class="jenjang-card"
                        style="background: #fff; border-radius: 20px; padding: 35px 30px; text-align: center; box-shadow: 0 15px 50px rgba(0,0,0,0.1); transition: all 0.4s ease; border-top: 5px solid #FF7043; height: 100%;">
                        <div class="jenjang-icon"
                            style="width: 100px; height: 100px; background: linear-gradient(135deg, #FF7043, #FFA726); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 25px; box-shadow: 0 15px 35px rgba(255, 112, 67, 0.3);">
                            <i class="fas fa-child" style="font-size: 42px; color: #fff;"></i>
                        </div>
                        <div class="jenjang-label"
                            style="display: inline-block; background: linear-gradient(135deg, #FF7043, #FFA726); color: #fff; padding: 6px 18px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px;">
                            TKIT</div>
                        <h3 class="jenjang-title"
                            style="color: #FF7043; font-weight: 700; font-size: 1.5rem; margin-bottom: 5px;">TKIT Nurul
                            Ilmi</h3>
                        <p class="jenjang-subtitle"
                            style="color: #FF7043; font-weight: 600; font-size: 14px; margin-bottom: 15px;">Taman
                            Kanak-Kanak Islam Terpadu</p>
                        <p class="jenjang-desc"
                            style="color: #666; font-size: 13px; line-height: 1.7; margin-bottom: 20px;">Membangun
                            fondasi karakter dan kecintaan belajar sejak usia dini dengan pendekatan Islami dan
                            menyenangkan.</p>
                        <div class="jenjang-info"
                            style="background: #FFF3E0; border-radius: 12px; padding: 15px; margin-bottom: 20px;">
                            <p style="margin: 0; font-size: 12px; color: #555;"><i class="fas fa-users"
                                    style="color: #FF7043; margin-right: 6px;"></i> Usia 4-6 tahun</p>
                            <p style="margin: 6px 0 0; font-size: 12px; color: #555;"><i class="fas fa-book"
                                    style="color: #FF7043; margin-right: 6px;"></i> Kurikulum PAUD Plus</p>
                        </div>
                        <a href="pricing.html#tkit" class="jenjang-btn"
                            style="display: inline-block; background: linear-gradient(135deg, #FF7043, #FFA726); color: #fff; padding: 14px 35px; border-radius: 30px; font-weight: 600; text-decoration: none; transition: all 0.3s; box-shadow: 0 8px 25px rgba(255, 112, 67, 0.3);">Lihat
                            Informasi</a>
                    </div>
                </div>
            </div>

            <!-- Unit Cards - Row 2: 2 cards centered -->
            <div class="row justify-content-center">
                <div class="col-lg-6 mb-4" data-aos="fade-up" data-aos-delay="250">
                    <!-- SDIT Card - Bright Leaf Green -->
                    <div class="jenjang-card"
                        style="background: #fff; border-radius: 20px; padding: 35px 30px; text-align: center; box-shadow: 0 15px 50px rgba(0,0,0,0.1); transition: all 0.4s ease; border-top: 5px solid #72BE44; height: 100%;">
                        <div class="jenjang-icon"
                            style="width: 100px; height: 100px; background: linear-gradient(135deg, #0A4F42, #0d6b5a); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 25px; box-shadow: 0 15px 35px rgba(114, 190, 68, 0.3);">
                            <i class="fas fa-book-reader" style="font-size: 42px; color: #fff;"></i>
                        </div>
                        <div class="jenjang-label"
                            style="display: inline-block; background: linear-gradient(135deg, #0A4F42, #0d6b5a); color: #fff; padding: 6px 18px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px;">
                            SDIT</div>
                        <h3 class="jenjang-title"
                            style="color: #72BE44; font-weight: 700; font-size: 1.5rem; margin-bottom: 5px;">SDIT Nurul
                            Ilmi</h3>
                        <p class="jenjang-subtitle"
                            style="color: #72BE44; font-weight: 600; font-size: 14px; margin-bottom: 15px;">Sekolah
                            Dasar Islam Terpadu</p>
                        <p class="jenjang-desc"
                            style="color: #666; font-size: 13px; line-height: 1.7; margin-bottom: 20px;">Membangun
                            karakter akademik dan akhlakul karimah dengan kurikulum nasionalplus dan pengembangan
                            tahfidz yang berkelanjutan.</p>
                        <div class="jenjang-info"
                            style="background: #F1F9E9; border-radius: 12px; padding: 15px; margin-bottom: 20px;">
                            <p style="margin: 0; font-size: 12px; color: #555;"><i class="fas fa-users"
                                    style="color: #72BE44; margin-right: 6px;"></i> Usia 6-12 tahun</p>
                            <p style="margin: 6px 0 0; font-size: 12px; color: #555;"><i class="fas fa-book"
                                    style="color: #72BE44; margin-right: 6px;"></i> Kurikulum Merdeka</p>
                        </div>
                        <a href="pricing.html#sdit" class="jenjang-btn"
                            style="display: inline-block; background: linear-gradient(135deg, #0A4F42, #0d6b5a); color: #fff; padding: 14px 35px; border-radius: 30px; font-weight: 600; text-decoration: none; transition: all 0.3s; box-shadow: 0 8px 25px rgba(114, 190, 68, 0.3);">Lihat
                            Informasi</a>
                    </div>
                </div>

                <div class="col-lg-6 mb-4" data-aos="fade-up" data-aos-delay="300">
                    <!-- SMPIT Card -->
                    <div class="jenjang-card"
                        style="background: #fff; border-radius: 20px; padding: 35px 30px; text-align: center; box-shadow: 0 15px 50px rgba(0,0,0,0.1); transition: all 0.4s ease; border-top: 5px solid #1B4F72; height: 100%;">
                        <div class="jenjang-icon"
                            style="width: 100px; height: 100px; background: linear-gradient(135deg, #1B4F72, #2874A6); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 25px; box-shadow: 0 15px 35px rgba(27, 79, 114, 0.3);">
                            <i class="fas fa-graduation-cap" style="font-size: 42px; color: #fff;"></i>
                        </div>
                        <div class="jenjang-label"
                            style="display: inline-block; background: linear-gradient(135deg, #1B4F72, #2874A6); color: #fff; padding: 6px 18px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px;">
                            SMPIT</div>
                        <h3 class="jenjang-title"
                            style="color: #1B4F72; font-weight: 700; font-size: 1.5rem; margin-bottom: 5px;">SMPIT
                            Nurul Ilmi</h3>
                        <p class="jenjang-subtitle"
                            style="color: #1B4F72; font-weight: 600; font-size: 14px; margin-bottom: 15px;">Sekolah
                            Menengah Pertama Islam Terpadu</p>
                        <p class="jenjang-desc"
                            style="color: #666; font-size: 13px; line-height: 1.7; margin-bottom: 20px;">Mempersiapkan
                            generasi Islam yang siap menghadapi tantangan dengan pengetahuan mendalam dan karakter kuat.
                        </p>
                        <div class="jenjang-info"
                            style="background: #EBF5FB; border-radius: 12px; padding: 15px; margin-bottom: 20px;">
                            <p style="margin: 0; font-size: 12px; color: #555;"><i class="fas fa-users"
                                    style="color: #1B4F72; margin-right: 6px;"></i> Usia 12-15 tahun</p>
                            <p style="margin: 6px 0 0; font-size: 12px; color: #555;"><i class="fas fa-book"
                                    style="color: #1B4F72; margin-right: 6px;"></i> Kurikulum Merdeka</p>
                        </div>
                        <a href="pricing.html#smpit" class="jenjang-btn"
                            style="display: inline-block; background: linear-gradient(135deg, #1B4F72, #2874A6); color: #fff; padding: 14px 35px; border-radius: 30px; font-weight: 600; text-decoration: none; transition: all 0.3s; box-shadow: 0 8px 25px rgba(27, 79, 114, 0.3);">Lihat
                            Informasi</a>
                    </div>
                </div>
            </div>

            <!-- Education Flow -->
            <div class="row mt-5" data-aos="fade-up" data-aos-delay="400">
                <div class="col-12 text-center">
                    <div class="flow-indicator"
                        style="display: inline-flex; align-items: center; flex-wrap: wrap; justify-content: center; gap: 15px; background: #fff; padding: 20px 35px; border-radius: 50px; box-shadow: 0 5px 25px rgba(0,0,0,0.08);">
                        <span
                            style="background: #FFFDE7; color: #D4940A; padding: 8px 15px; border-radius: 15px; font-weight: 700; font-size: 13px;">Daycare</span>
                        <i class="fas fa-arrow-right" style="color: #D4AF37;"></i>
                        <span
                            style="background: #FFFDE7; color: #D4940A; padding: 8px 15px; border-radius: 15px; font-weight: 700; font-size: 13px;">TK</span>
                        <i class="fas fa-arrow-right" style="color: #D4AF37;"></i>
                        <span
                            style="background: #F1F9E9; color: #72BE44; padding: 8px 15px; border-radius: 15px; font-weight: 700; font-size: 13px;">SD</span>
                        <i class="fas fa-arrow-right" style="color: #D4AF37;"></i>
                        <span
                            style="background: #EBF5FB; color: #1B4F72; padding: 8px 15px; border-radius: 15px; font-weight: 700; font-size: 13px;">SMP</span>

                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Jenjang Section Styles -->
    <style>
        .jenjang-badge {
            display: inline-block;
            background: linear-gradient(135deg, #D4AF37, #e8c864);
            color: #fff;
            padding: 8px 24px;
            border-radius: 30px;
            font-size: 13px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 2px;
            box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
        }

        .jenjang-section h2 {
            font-family: 'Playfair Display', serif;
            font-size: 2.5rem;
            font-weight: 700;
            color: #0A4F42;
        }

        .jenjang-section .section-subtitle {
            font-size: 1.1rem;
            color: #666;
            max-width: 600px;
            margin: 0 auto;
            line-height: 1.7;
        }

        .jenjang-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 25px 60px rgba(0, 0, 0, 0.15);
        }

        .jenjang-card:hover .jenjang-icon {
            transform: scale(1.1);
        }

        .jenjang-card .jenjang-icon {
            transition: transform 0.4s ease;
        }

        .jenjang-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 35px rgba(10, 79, 66, 0.4);
        }

        @media (max-width: 768px) {
            .jenjang-section {
                padding: 60px 0;
            }

            .jenjang-section h2 {
                font-size: 2rem;
            }
        }
    </style>

    <section class="ftco-intro" style="background-image: url(images/bg_3.jpg);" data-stellar-background-ratio="0.5">
        <div class="overlay"></div>
        <div class="container">
            <div class="row">
                <div class="col-md-9">
                    <h2>Daftarkan Anak Anda di YPI Nurul Ilmi</h2>
                    <p class="mb-0">Wujudkan impian Anda untuk memiliki generasi Islam yang beriman, berilmu, dan
                        berakhlak mulia. Temukan jenjang pendidikan yang sesuai untuk putra-putri Anda bersama YPI Nurul
                        Ilmi.</p>
                </div>
                <div class="col-md-3 d-flex align-items-center">
                    <p class="mb-0"><a href="{{ route('home') }}#jenjang"
                            class="btn btn-secondary px-4 py-3">Lihat Jenjang</a></p>
                </div>
            </div>
        </div>
    </section>

    <!-- Kepala Yayasan Section -->
    <section class="kepala-yayasan-section"
        style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 80px 0;">
        <div class="container">
            <!-- Section Header -->
            <div class="row justify-content-center mb-5" data-aos="fade-down">
                <div class="col-md-8 text-center">
                    <span class="section-badge"
                        style="background: #0A4F42; color: #fff; padding: 8px 20px; border-radius: 30px; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 2px;">Yayasan</span>
                    <h2 class="mt-4 mb-3" style="color: #0A4F42; font-weight: 700;">Kepala <span
                            style="color: #D4AF37;">Yayasan</span></h2>
                    <p class="text-muted">Sosok di balik arah, nilai, dan pertumbuhan YPI Nurul Ilmi</p>
                </div>
            </div>

            <div class="row align-items-center">
                <!-- Photo Column -->
                <div class="col-lg-5 mb-5 mb-lg-0" data-aos="fade-right" data-aos-delay="100">
                    <div class="kepala-yayasan-photo">
                        <div class="photo-wrapper" style="position: relative; display: inline-block;">
                            <div class="photo-frame"
                                style="position: absolute; top: -15px; left: -15px; right: -15px; bottom: -15px; border: 4px solid #D4AF37; border-radius: 20px; transform: rotate(3deg);">
                            </div>
                            <img src="images/yayasan.jpg" alt="Kepala Yayasan YPI Nurul Ilmi"
                                style="width: 100%; max-width: 400px; border-radius: 15px; box-shadow: 0 20px 50px rgba(10, 79, 66, 0.2); position: relative; z-index: 1;">
                            <div class="photo-decoration"
                                style="position: absolute; bottom: -20px; right: -20px; width: 100px; height: 100px; background: linear-gradient(135deg, #D4AF37, #0A4F42); border-radius: 50%; z-index: -1; opacity: 0.3;">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Content Column -->
                <div class="col-lg-7" data-aos="fade-left" data-aos-delay="200">
                    <div class="kepala-info"
                        style="background: #fff; border-radius: 20px; padding: 40px; box-shadow: 0 10px 40px rgba(0,0,0,0.08); border-top: 4px solid #D4AF37;">
                        <span
                            style="color: #D4AF37; font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">Pemimpin
                            Yayasan</span>
                        <h3 class="mt-2" style="color: #0A4F42; font-weight: 700; margin-bottom: 5px;">Sumartono,
                            M.T.</h3>
                        <p style="color: #D4AF37; font-weight: 600; margin-bottom: 20px;">Kepala Yayasan YPI Nurul Ilmi
                            Bekasi</p>
                        <p class="text-muted mb-4" style="line-height: 1.8;">Dengan visi menciptakan generasi Islam
                            yang beriman, berilmu, dan berakhlak mulia,beliau memimpin YPI Nurul Ilmi yang menaungi
                            TKIT, SDIT, dan SMPIT Nurul Ilmi menuju pendidikan Islam yang berkualitas.</p>

                        <!-- Quote -->
                        <div class="quote-box"
                            style="background: linear-gradient(135deg, #0A4F42, #0d6b5a); color: #fff; padding: 25px; border-radius: 15px; position: relative; margin-bottom: 30px;">
                            <i class="fas fa-quote-left"
                                style="position: absolute; top: 15px; left: 20px; font-size: 40px; opacity: 0.2;"></i>
                            <p style="font-style: italic; margin: 0; padding-left: 30px; line-height: 1.6;">"Langkah
                                kecil yang dimulai hari ini akan menjadi awal dari mimpi-mimpi besar di masa depan.
                                Setiap proses, setiap perjuangan, dan setiap kenangan akan selalu menjadi bagian indah
                                dalam perjalanan menuju kesuksesan."</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Visi Misi Manifesto -->
            <div class="row mt-5 justify-content-center" data-aos="fade-up" data-aos-delay="300">
                <div class="col-lg-11">
                    <div class="visi-misi-card"
                        style="background: #fff; border-radius: 20px; padding: 42px; box-shadow: 0 15px 45px rgba(0,0,0,0.1); border-top: 5px solid #D4AF37; transition: transform 0.3s, box-shadow 0.3s;"
                        onmouseover="this.style.transform='translateY(-8px)'; this.style.boxShadow='0 25px 55px rgba(10,79,66,0.15)';"
                        onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 15px 45px rgba(0,0,0,0.1)';">
                        <div class="row align-items-center pb-4 mb-4"
                            style="border-bottom: 1px solid rgba(10,79,66,0.12);">
                            <div class="col-md-2 text-center mb-3 mb-md-0">
                                <div class="card-icon mx-auto"
                                    style="width: 68px; height: 68px; background: linear-gradient(135deg, #D4AF37, #e8c864); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                    <i class="fas fa-eye" style="font-size: 26px; color: #fff;"></i>
                                </div>
                            </div>
                            <div class="col-md-10 text-center text-md-left">
                                <span
                                    style="display: block; color: #D4AF37; font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px;">Arah
                                    Besar Kami</span>
                                <h4 style="color: #0A4F42; font-weight: 700; margin-bottom: 10px;">Visi</h4>
                                <p
                                    style="line-height: 1.8; color: #555; font-size: 21px; margin-bottom: 0; font-family: 'Playfair Display', serif;">
                                    Mewujudkan Generasi Beriman dan Berwawasan Ilmu Pengetahuan</p>
                            </div>
                        </div>

                        <div class="text-center mb-4">
                            <span
                                style="display: block; color: #0A4F42; font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px;">Langkah
                                Nyata</span>
                            <h4 style="color: #0A4F42; font-weight: 700; margin-bottom: 0;">Misi</h4>
                        </div>
                        <ul
                            style="list-style: none; line-height: 1.7; color: #555; padding-left: 0; margin-bottom: 0;">
                            <li style="display: flex; margin-bottom: 14px;"><span
                                    style="flex: 0 0 28px; height: 28px; margin-right: 12px; border-radius: 50%; background: #0A4F42; color: #fff; font-size: 12px; font-weight: 700; line-height: 28px; text-align: center;">01</span><span>Membentuk
                                    generasi penerus yang beriman dan memiliki aqidah yang kuat, berkarakter, cerdas dan
                                    kreatif, berbudi luhur, sehat, kuat, berpengetahuan dan terampil melalui proses
                                    pendidikan terpadu, seimbang dan berkelanjutan.</span></li>
                            <li style="display: flex; margin-bottom: 14px;"><span
                                    style="flex: 0 0 28px; height: 28px; margin-right: 12px; border-radius: 50%; background: #D4AF37; color: #fff; font-size: 12px; font-weight: 700; line-height: 28px; text-align: center;">02</span><span>Menyelenggarakan
                                    pendidikan Prasekolah, Taman Kanak-kanak dan Sekolah Menengah yang mampu memberikan
                                    stimulasi yang efektif bagi perkembangan aspek mental-kognitif, moral, fisik dan
                                    sosial kepada peserta didik agar dapat mencapai perkembangan secara optimal baik
                                    secara individu maupun kelompok.</span></li>
                            <li style="display: flex; margin-bottom: 14px;"><span
                                    style="flex: 0 0 28px; height: 28px; margin-right: 12px; border-radius: 50%; background: #0A4F42; color: #fff; font-size: 12px; font-weight: 700; line-height: 28px; text-align: center;">03</span><span>Menyelenggarakan
                                    pendidikan dasar Islam yang mampu membentuk karakter anak didik sehingga memiliki
                                    pengetahuan, sikap dan perilaku sesuai dengan tuntunan asas-asas pendidikan anak
                                    dalam Islam yang berlandaskan Al-Qur'an dan Sunnah.</span></li>
                            <li style="display: flex; margin-bottom: 14px;"><span
                                    style="flex: 0 0 28px; height: 28px; margin-right: 12px; border-radius: 50%; background: #D4AF37; color: #fff; font-size: 12px; font-weight: 700; line-height: 28px; text-align: center;">04</span><span>Menyelenggarakan
                                    pendidikan Islam yang mampu memberikan bekal pengetahuan, sikap dan keterampilan
                                    yang mengantarkan anak didik untuk menjadi kader-kader berakhlak dan siap memasuki
                                    gerbang pendidikan selanjutnya.</span></li>
                            <li style="display: flex;"><span
                                    style="flex: 0 0 28px; height: 28px; margin-right: 12px; border-radius: 50%; background: #0A4F42; color: #fff; font-size: 12px; font-weight: 700; line-height: 28px; text-align: center;">05</span><span>Menyelenggarakan
                                    kegiatan keterampilan dan pendidikan secara islamiyah melalui kegiatan yang efektif
                                    dan maslahah.</span></li>
                        </ul>
                    </div>
                </div>
            </div>

        </div>
    </section>

    <!-- Murid Berprestasi Section -->
    <section class="achievement-section">
        <div class="container">
            <!-- Section Header -->
            <div class="row justify-content-center mb-5" data-aos="fade-down">
                <div class="col-md-8 text-center">
                    <span class="section-badge">Bangga</span>
                    <h2 class="mt-4">Murid <span class="highlight">Berprestasi</span> Kami</h2>
                    <p class="section-subtitle">Siswa-siswi YPI Nurul Ilmi terus mengembangkan potensi melalui berbagai
                        prestasi akademik maupun non-akademik di berbagai kompetisi.</p>
                </div>
            </div>

            <!-- Achievement Stats -->
            <div class="row mb-5" data-aos="fade-up">
                <div class="col-12">
                    <div class="achievement-stats"
                        style="background: linear-gradient(135deg, #0A4F42, #0d6b5a); border-radius: 20px; padding: 40px; color: #fff; text-align: center;">
                        <p style="font-size: 1.1rem; margin-bottom: 20px; opacity: 0.9;">Kami bangga dengan pencapaian
                            putra-putri YPI Nurul Ilmi di berbagai bidang</p>
                        <div class="row">
                            <div class="col-md-4 mb-3 mb-md-0">
                                <i class="fas fa-trophy"
                                    style="font-size: 36px; color: #D4AF37; margin-bottom: 10px;"></i>
                                <h3 style="font-size: 2rem; font-weight: 700; margin-bottom: 5px;">150+</h3>
                                <p style="margin: 0; opacity: 0.9; font-size: 14px;">Total Prestasi</p>
                            </div>
                            <div class="col-md-4 mb-3 mb-md-0">
                                <i class="fas fa-book-quran"
                                    style="font-size: 36px; color: #D4AF37; margin-bottom: 10px;"></i>
                                <h3 style="font-size: 2rem; font-weight: 700; margin-bottom: 5px;">30+</h3>
                                <p style="margin: 0; opacity: 0.9; font-size: 14px;">Hafiz Al-Quran</p>
                            </div>
                            <div class="col-md-4">
                                <i class="fas fa-medal"
                                    style="font-size: 36px; color: #D4AF37; margin-bottom: 10px;"></i>
                                <h3 style="font-size: 2rem; font-weight: 700; margin-bottom: 5px;">10+</h3>
                                <p style="margin: 0; opacity: 0.9; font-size: 14px;">Juara Nasional</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Achievement Categories -->
            <div class="row" data-aos="fade-up" data-aos-delay="100">
                <div class="col-md-6 col-lg-3 mb-4">
                    <div class="achievement-card"
                        style="background: #fff; border-radius: 20px; padding: 30px 20px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.08); border-top: 4px solid #0A4F42;">
                        <div class="achievement-icon"
                            style="width: 70px; height: 70px; background: linear-gradient(135deg, #0A4F42, #0d6b5a); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                            <i class="fas fa-calculator" style="font-size: 28px; color: #fff;"></i>
                        </div>
                        <h4 style="color: #0A4F42; font-weight: 700; margin-bottom: 10px;">Akademik</h4>
                        <p style="color: #666; font-size: 14px; margin-bottom: 15px;">OSN, FLS2N, kompetisi sains dan
                            olimpiade</p>
                        <span class="badge"
                            style="background: #D4AF37; color: #fff; padding: 5px 15px; border-radius: 20px; font-size: 12px;">Juara
                            1-3</span>
                    </div>
                </div>
                <div class="col-md-6 col-lg-3 mb-4">
                    <div class="achievement-card"
                        style="background: #fff; border-radius: 20px; padding: 30px 20px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.08); border-top: 4px solid #D4AF37;">
                        <div class="achievement-icon"
                            style="width: 70px; height: 70px; background: linear-gradient(135deg, #D4AF37, #e8c864); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                            <i class="fas fa-book-quran" style="font-size: 28px; color: #fff;"></i>
                        </div>
                        <h4 style="color: #0A4F42; font-weight: 700; margin-bottom: 10px;">Tahfidz</h4>
                        <p style="color: #666; font-size: 14px; margin-bottom: 15px;">Hafalan Al-Quran hingga 30 juz
                        </p>
                        <span class="badge"
                            style="background: #D4AF37; color: #fff; padding: 5px 15px; border-radius: 20px; font-size: 12px;">Program
                            Unggulan</span>
                    </div>
                </div>
                <div class="col-md-6 col-lg-3 mb-4">
                    <div class="achievement-card"
                        style="background: #fff; border-radius: 20px; padding: 30px 20px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.08); border-top: 4px solid #e74c3c;">
                        <div class="achievement-icon"
                            style="width: 70px; height: 70px; background: linear-gradient(135deg, #e74c3c, #c0392b); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                            <i class="fas fa-running" style="font-size: 28px; color: #fff;"></i>
                        </div>
                        <h4 style="color: #0A4F42; font-weight: 700; margin-bottom: 10px;">Olahraga</h4>
                        <p style="color: #666; font-size: 14px; margin-bottom: 15px;">Taekwondo, Futsal, Volly, Basket
                        </p>
                        <span class="badge"
                            style="background: #D4AF37; color: #fff; padding: 5px 15px; border-radius: 20px; font-size: 12px;">Berbagai
                            Tingkat</span>
                    </div>
                </div>
                <div class="col-md-6 col-lg-3 mb-4">
                    <div class="achievement-card"
                        style="background: #fff; border-radius: 20px; padding: 30px 20px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.08); border-top: 4px solid #2874A6;">
                        <div class="achievement-icon"
                            style="width: 70px; height: 70px; background: linear-gradient(135deg, #2874A6, #1B4F72); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                            <i class="fas fa-music" style="font-size: 28px; color: #fff;"></i>
                        </div>
                        <h4 style="color: #0A4F42; font-weight: 700; margin-bottom: 10px;">Seni & Budaya</h4>
                        <p style="color: #666; font-size: 14px; margin-bottom: 15px;">MTQ, Kaligrafi, Drumband</p>
                        <span class="badge"
                            style="background: #D4AF37; color: #fff; padding: 5px 15px; border-radius: 20px; font-size: 12px;">Prestasi
                            Unggulan</span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <style>
        /* ========================================
  MURID BERPRESTASI SECTION STYLES
  ======================================== */

        .achievement-section {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            padding: 80px 0;
            position: relative;
            overflow: hidden;
        }

        .achievement-section::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -20%;
            width: 500px;
            height: 500px;
            background: radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
        }

        .achievement-section::after {
            content: '';
            position: absolute;
            bottom: -30%;
            left: -10%;
            width: 400px;
            height: 400px;
            background: radial-gradient(circle, rgba(10, 79, 66, 0.06) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
        }

        /* Section Header */
        .achievement-section .section-badge {
            display: inline-block;
            background: linear-gradient(135deg, #D4AF37, #e8c864);
            color: #fff;
            padding: 8px 24px;
            border-radius: 30px;
            font-size: 13px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 2px;
            box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
        }

        .achievement-section h2 {
            font-family: 'Playfair Display', serif;
            font-size: 2.5rem;
            font-weight: 700;
            color: #0A4F42;
            margin-bottom: 15px;
        }

        .achievement-section h2 .highlight {
            color: #D4AF37;
            position: relative;
        }

        .achievement-section h2 .highlight::after {
            content: '';
            position: absolute;
            bottom: -5px;
            left: 0;
            width: 100%;
            height: 4px;
            background: linear-gradient(90deg, #D4AF37, #FFD700);
            border-radius: 2px;
        }

        .achievement-section .section-subtitle {
            font-size: 1.1rem;
            color: #666;
            max-width: 600px;
            margin: 0 auto;
            line-height: 1.7;
        }

        /* Achievement Card */
        .achievement-card {
            background: #fff;
            border-radius: 20px;
            padding: 30px 20px;
            text-align: center;
            position: relative;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
            margin-bottom: 30px;
            overflow: hidden;
        }

        .achievement-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 5px;
            background: linear-gradient(90deg, #D4AF37, #FFD700, #D4AF37);
        }

        .achievement-card:hover {
            transform: translateY(-15px);
            box-shadow: 0 25px 60px rgba(212, 175, 55, 0.2);
        }

        .achievement-card:hover .card-glow {
            opacity: 1;
        }

        .achievement-card:hover .card-image .image-wrapper img {
            transform: scale(1.1);
        }

        /* Card Glow Effect */
        .card-glow {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 200px;
            height: 200px;
            background: radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%);
            transform: translate(-50%, -50%);
            opacity: 0;
            transition: opacity 0.4s ease;
            pointer-events: none;
        }

        /* Card Header - Achievement Rank Badge */
        .achievement-rank {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 20px;
            border-radius: 30px;
            font-size: 13px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .achievement-rank.gold {
            background: linear-gradient(135deg, #D4AF37, #FFD700);
            color: #fff;
            box-shadow: 0 4px 15px rgba(212, 175, 55, 0.4);
        }

        .achievement-rank i {
            font-size: 14px;
        }

        /* Card Image */
        .card-image {
            position: relative;
            margin: 25px 0;
        }

        .image-wrapper {
            width: 150px;
            height: 150px;
            margin: 0 auto;
            border-radius: 50%;
            overflow: hidden;
            border: 4px solid #D4AF37;
            box-shadow: 0 10px 30px rgba(212, 175, 55, 0.3);
        }

        .image-wrapper img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.4s ease;
        }

        /* Medal Ribbon */
        .medal-ribbon {
            position: absolute;
            bottom: -10px;
            left: 50%;
            transform: translateX(-50%);
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #0A4F42, #0d6b5a);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #D4AF37;
            font-size: 20px;
            box-shadow: 0 4px 15px rgba(10, 79, 66, 0.4);
            border: 3px solid #fff;
        }

        /* Card Body */
        .card-body {
            padding-top: 15px;
        }

        .student-name {
            font-family: 'Playfair Display', serif;
            font-size: 1.4rem;
            font-weight: 700;
            color: #0A4F42;
            margin-bottom: 5px;
        }

        .competition {
            font-size: 1rem;
            font-weight: 600;
            color: #333;
            margin-bottom: 8px;
        }

        .achievement-level {
            font-size: 13px;
            color: #D4AF37;
            font-weight: 600;
            margin-bottom: 15px;
        }

        /* Social Links */
        .social-links {
            display: flex;
            justify-content: center;
            gap: 12px;
        }

        .social-links a {
            width: 36px;
            height: 36px;
            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #0A4F42;
            font-size: 14px;
            transition: all 0.3s ease;
            text-decoration: none;
        }

        .social-links a:hover {
            background: linear-gradient(135deg, #D4AF37, #FFD700);
            color: #fff;
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(212, 175, 55, 0.4);
        }

        /* CTA Button */
        .btn-prestasi {
            display: inline-flex;
            align-items: center;
            gap: 12px;
            background: linear-gradient(135deg, #0A4F42, #0d6b5a);
            color: #fff;
            padding: 16px 40px;
            border-radius: 50px;
            font-size: 16px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.4s ease;
            box-shadow: 0 10px 30px rgba(10, 79, 66, 0.3);
            position: relative;
            overflow: hidden;
        }

        .btn-prestasi::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s ease;
        }

        .btn-prestasi:hover::before {
            left: 100%;
        }

        .btn-prestasi:hover {
            background: linear-gradient(135deg, #D4AF37, #FFD700);
            transform: translateY(-3px);
            box-shadow: 0 15px 40px rgba(212, 175, 55, 0.4);
            color: #fff;
        }

        .btn-prestasi i {
            transition: transform 0.3s ease;
        }

        .btn-prestasi:hover i {
            transform: translateX(5px);
        }

        /* Responsive */
        @media (max-width: 768px) {
            .achievement-section {
                padding: 60px 0;
            }

            .achievement-section h2 {
                font-size: 2rem;
            }

            .achievement-card {
                padding: 25px 15px;
            }

            .image-wrapper {
                width: 130px;
                height: 130px;
            }
        }
    </style>

    <section class="ftco-section">
        <div class="container">
            <div class="row justify-content-center mb-5 pb-2">
                <div class="col-md-8 text-center heading-section ftco-animate">
                    <h2 class="mb-4"><span>Program &</span> Kegiatan</h2>
                    <p>Berbagai program pendidikan yang mendukung pengembangan akademik, karakter, dan spiritual peserta
                        didik di YPI Nurul Ilmi.</p>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6 course d-lg-flex ftco-animate">
                    <div class="img" style="background-image: url(images/course-1.jpg);"></div>
                    <div class="text bg-light p-4">
                        <h3><a href="#">Kurikulum Nasional Plus</a></h3>
                        <p class="subheading"><span>Waktu:</span> Senin - Jumat, 07:00 - 14:00</p>
                        <p>Pembelajaran standar nasional yang diperkaya dengan pendidikan karakter Islami dan
                            digitalisasi.</p>
                    </div>
                </div>
                <div class="col-md-6 course d-lg-flex ftco-animate">
                    <div class="img" style="background-image: url(images/course-2.jpg);"></div>
                    <div class="text bg-light p-4">
                        <h3><a href="#">Bahasa Inggris</a></h3>
                        <p class="subheading"><span>Waktu:</span> Setiap hari, 14:00 - 15:00</p>
                        <p>Program pengajaran bahasa Inggris intensif untuk mempersiapkan siswa menghadapi era global.
                        </p>
                    </div>
                </div>
                <div class="col-md-6 course d-lg-flex ftco-animate">
                    <div class="img" style="background-image: url(images/course-3.jpg);"></div>
                    <div class="text bg-light p-4">
                        <h3><a href="#">Tahfidz Al-Quran</a></h3>
                        <p class="subheading"><span>Waktu:</span> Sore hari, 15:00 - 17:00</p>
                        <p>Program hafalan Al-Quran intensif yang diasuh oleh ustadz dan ustadzah berpengalaman.</p>
                    </div>
                </div>
                <div class="col-md-6 course d-lg-flex ftco-animate">
                    <div class="img" style="background-image: url(images/course-4.jpg);"></div>
                    <div class="text bg-light p-4">
                        <h3><a href="#">Ekstrakurikuler</a></h3>
                        <p class="subheading"><span>Waktu:</span> Sore hari, 15:00 - 17:00</p>
                        <p>Berbagai kegiatan pilihan seperti Japan Club, Volly, Futsal, English Club, Math Club,
                            Taekwondo, Tahfidz, Badminton, dan masih banyak lagi.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Fasilitas Section -->
   <section class="fasilitas-section ni-theme-green">
			<div class="container">
				<div class="row justify-content-center mb-5" data-aos="fade-down">
					<div class="col-md-9 text-center fasilitas-heading">
						<span class="fasilitas-badge">Fasilitas</span>
						<h2>Fasilitas <span>Pendidikan</span></h2>
						<p>YPI Nurul Ilmi menyediakan fasilitas lengkap untuk mendukung pembelajaran dan perkembangan seluruh peserta didik.</p>
						<p class="fasilitas-hint">Pilih salah satu fasilitas untuk melihat dokumentasi foto.</p>
						<a href="{{ route('facilities.gallery') }}" class="btn-fasilitas-goto"><i class="fas fa-images mr-2"></i>Lihat Semua Fasilitas</a>
					</div>
				</div>

				<!-- Fasilitas Grid -->
				<div class="ni-fas-grid">
				<button type="button" class="ni-fas-card" data-ni-facility="kelas-ac">
					<span class="ni-fas-media">
						<img src="images/kelas.jpeg" alt="Ruang Kelas AC" loading="lazy">
						<span class="ni-fas-icon" aria-hidden="true"><i class="fas fa-snowflake"></i></span>
						<span class="ni-fas-count"></span>
					</span>
					<span class="ni-fas-body">
						<span class="ni-fas-title">Ruang Kelas AC</span>
						<span class="ni-fas-desc">Fasilitas belajar yang nyaman dan mendukung pembelajaran optimal.</span>
						<span class="ni-fas-tags">
							<span class="ni-fas-tag">Semua</span>
						</span>
						<span class="ni-fas-cta">Lihat Galeri <i class="fas fa-arrow-right" aria-hidden="true"></i></span>
					</span>
				</button>
				<button type="button" class="ni-fas-card" data-ni-facility="one-gate">
					<span class="ni-fas-media">
						<!-- foto belum tersedia untuk fasilitas ini -->
						<span class="ni-fas-icon" aria-hidden="true"><i class="fas fa-shield-alt"></i></span>
						<span class="ni-fas-count"></span>
					</span>
					<span class="ni-fas-body">
						<span class="ni-fas-title">One Gate System</span>
						<span class="ni-fas-desc">Satu pintu masuk terkendali untuk keamanan dan keteraturan area sekolah.</span>
						<span class="ni-fas-tags">
							<span class="ni-fas-tag">Semua</span>
						</span>
						<span class="ni-fas-cta">Lihat Galeri <i class="fas fa-arrow-right" aria-hidden="true"></i></span>
					</span>
				</button>
				<button type="button" class="ni-fas-card" data-ni-facility="masjid">
					<span class="ni-fas-media">
						<img src="images/7227fbba-604b-439f-bcf4-2ac4a64e04ca.jpg" alt="Masjid Nurul Ilmi" loading="lazy">
						<span class="ni-fas-icon" aria-hidden="true"><i class="fas fa-mosque"></i></span>
						<span class="ni-fas-count"></span>
					</span>
					<span class="ni-fas-body">
						<span class="ni-fas-title">Masjid Nurul Ilmi</span>
						<span class="ni-fas-desc">Tempat ibadah dan kegiatan keagamaan bagi peserta didik.</span>
						<span class="ni-fas-tags">
							<span class="ni-fas-tag">Semua</span>
						</span>
						<span class="ni-fas-cta">Lihat Galeri <i class="fas fa-arrow-right" aria-hidden="true"></i></span>
					</span>
				</button>
				<button type="button" class="ni-fas-card" data-ni-facility="kantin">
					<span class="ni-fas-media">
						<img src="images/kantin.jpeg" alt="Kantin Sekolah" loading="lazy">
						<span class="ni-fas-icon" aria-hidden="true"><i class="fas fa-utensils"></i></span>
						<span class="ni-fas-count"></span>
					</span>
					<span class="ni-fas-body">
						<span class="ni-fas-title">Kantin Sekolah</span>
						<span class="ni-fas-desc">Area kantin yang melayani warga sekolah.</span>
						<span class="ni-fas-tags">
							<span class="ni-fas-tag">Semua</span>
						</span>
						<span class="ni-fas-cta">Lihat Galeri <i class="fas fa-arrow-right" aria-hidden="true"></i></span>
					</span>
				</button>
				<button type="button" class="ni-fas-card" data-ni-facility="sarana-olahraga">
					<span class="ni-fas-media">
						<img src="images/lapangan.jpeg" alt="Sarana Olahraga" loading="lazy">
						<span class="ni-fas-icon" aria-hidden="true"><i class="fas fa-football-ball"></i></span>
						<span class="ni-fas-count"></span>
					</span>
					<span class="ni-fas-body">
						<span class="ni-fas-title">Sarana Olahraga</span>
						<span class="ni-fas-desc">Lapangan sekolah untuk kegiatan olahraga dan aktivitas bersama.</span>
						<span class="ni-fas-tags">
							<span class="ni-fas-tag">Semua</span>
						</span>
						<span class="ni-fas-cta">Lihat Galeri <i class="fas fa-arrow-right" aria-hidden="true"></i></span>
					</span>
				</button>
				<button type="button" class="ni-fas-card" data-ni-facility="musik-tari">
					<span class="ni-fas-media">
						<img src="images/WhatsApp%20Image%202026-08-22%20at%2015.12.08.jpeg" alt="Sarana Musik & Tari" loading="lazy">
						<span class="ni-fas-icon" aria-hidden="true"><i class="fas fa-music"></i></span>
						<span class="ni-fas-count"></span>
					</span>
					<span class="ni-fas-body">
						<span class="ni-fas-title">Sarana Musik & Tari</span>
						<span class="ni-fas-desc">Instrumen dan ruang latihan untuk mengembangkan bakat seni peserta didik.</span>
						<span class="ni-fas-tags">
							<span class="ni-fas-tag">Semua</span>
						</span>
						<span class="ni-fas-cta">Lihat Galeri <i class="fas fa-arrow-right" aria-hidden="true"></i></span>
					</span>
				</button>
				<button type="button" class="ni-fas-card" data-ni-facility="aula">
					<span class="ni-fas-media">
						<!-- foto belum tersedia untuk fasilitas ini -->
						<span class="ni-fas-icon" aria-hidden="true"><i class="fas fa-home"></i></span>
						<span class="ni-fas-count"></span>
					</span>
					<span class="ni-fas-body">
						<span class="ni-fas-title">Aula Serba Guna</span>
						<span class="ni-fas-desc">Ruang serbaguna untuk berbagai kegiatan sekolah.</span>
						<span class="ni-fas-tags">
							<span class="ni-fas-tag">Semua</span>
						</span>
						<span class="ni-fas-cta">Lihat Galeri <i class="fas fa-arrow-right" aria-hidden="true"></i></span>
					</span>
				</button>
				<button type="button" class="ni-fas-card" data-ni-facility="parkir">
					<span class="ni-fas-media">
						<img src="images/parkir.jpeg" alt="Area Parkir" loading="lazy">
						<span class="ni-fas-icon" aria-hidden="true"><i class="fas fa-parking"></i></span>
						<span class="ni-fas-count"></span>
					</span>
					<span class="ni-fas-body">
						<span class="ni-fas-title">Area Parkir</span>
						<span class="ni-fas-desc">Area parkir kendaraan di lingkungan sekolah.</span>
						<span class="ni-fas-tags">
							<span class="ni-fas-tag">Semua</span>
						</span>
						<span class="ni-fas-cta">Lihat Galeri <i class="fas fa-arrow-right" aria-hidden="true"></i></span>
					</span>
				</button>
				<button type="button" class="ni-fas-card" data-ni-facility="digital-app">
					<span class="ni-fas-media">
						<!-- foto belum tersedia untuk fasilitas ini -->
						<span class="ni-fas-icon" aria-hidden="true"><i class="fas fa-laptop"></i></span>
						<span class="ni-fas-count"></span>
					</span>
					<span class="ni-fas-body">
						<span class="ni-fas-title">Digital Learning App</span>
						<span class="ni-fas-desc">Aplikasi pembelajaran digital untuk SDIT dan SMPIT.</span>
						<span class="ni-fas-tags">
							<span class="ni-fas-tag is-alt">SDIT</span>
							<span class="ni-fas-tag is-alt">SMPIT</span>
						</span>
						<span class="ni-fas-cta">Lihat Galeri <i class="fas fa-arrow-right" aria-hidden="true"></i></span>
					</span>
				</button>
				<button type="button" class="ni-fas-card" data-ni-facility="perpustakaan">
					<span class="ni-fas-media">
						<!-- foto belum tersedia untuk fasilitas ini -->
						<span class="ni-fas-icon" aria-hidden="true"><i class="fas fa-book-open"></i></span>
						<span class="ni-fas-count"></span>
					</span>
					<span class="ni-fas-body">
						<span class="ni-fas-title">Perpustakaan Digital</span>
						<span class="ni-fas-desc">Koleksi buku dan sumber belajar digital bagi peserta didik.</span>
						<span class="ni-fas-tags">
							<span class="ni-fas-tag is-alt">SDIT</span>
							<span class="ni-fas-tag is-alt">SMPIT</span>
						</span>
						<span class="ni-fas-cta">Lihat Galeri <i class="fas fa-arrow-right" aria-hidden="true"></i></span>
					</span>
				</button>
				<button type="button" class="ni-fas-card" data-ni-facility="id-card">
					<span class="ni-fas-media">
						<img src="images/idcard.jpeg" alt="ID Card & Access Control" loading="lazy">
						<span class="ni-fas-icon" aria-hidden="true"><i class="fas fa-id-card"></i></span>
						<span class="ni-fas-count"></span>
					</span>
					<span class="ni-fas-body">
						<span class="ni-fas-title">ID Card & Access Control</span>
						<span class="ni-fas-desc">Kartu identitas dan kontrol akses untuk menjaga keamanan area sekolah.</span>
						<span class="ni-fas-tags">
							<span class="ni-fas-tag is-alt">SDIT</span>
							<span class="ni-fas-tag is-alt">SMPIT</span>
						</span>
						<span class="ni-fas-cta">Lihat Galeri <i class="fas fa-arrow-right" aria-hidden="true"></i></span>
					</span>
				</button>
				<button type="button" class="ni-fas-card" data-ni-facility="laboratorium">
					<span class="ni-fas-media">
						<img src="images/lab.JPG" alt="Laboratorium" loading="lazy">
						<span class="ni-fas-icon" aria-hidden="true"><i class="fas fa-flask"></i></span>
						<span class="ni-fas-count"></span>
					</span>
					<span class="ni-fas-body">
						<span class="ni-fas-title">Laboratorium</span>
						<span class="ni-fas-desc">Laboratorium Fisika, Kimia, dan Biologi untuk kegiatan eksperimen.</span>
						<span class="ni-fas-tags">
							<span class="ni-fas-tag is-alt">SDIT</span>
							<span class="ni-fas-tag is-alt">SMPIT</span>
						</span>
						<span class="ni-fas-cta">Lihat Galeri <i class="fas fa-arrow-right" aria-hidden="true"></i></span>
					</span>
				</button>
				<button type="button" class="ni-fas-card" data-ni-facility="wifi">
					<span class="ni-fas-media">
						<!-- foto belum tersedia untuk fasilitas ini -->
						<span class="ni-fas-icon" aria-hidden="true"><i class="fas fa-wifi"></i></span>
						<span class="ni-fas-count"></span>
					</span>
					<span class="ni-fas-body">
						<span class="ni-fas-title">Wifi / Internet</span>
						<span class="ni-fas-desc">Jaringan internet untuk mendukung pembelajaran digital.</span>
						<span class="ni-fas-tags">
							<span class="ni-fas-tag is-alt">SDIT</span>
							<span class="ni-fas-tag is-alt">SMPIT</span>
						</span>
						<span class="ni-fas-cta">Lihat Galeri <i class="fas fa-arrow-right" aria-hidden="true"></i></span>
					</span>
				</button>
				<button type="button" class="ni-fas-card" data-ni-facility="ava">
					<span class="ni-fas-media">
						<!-- foto belum tersedia untuk fasilitas ini -->
						<span class="ni-fas-icon" aria-hidden="true"><i class="fas fa-tv"></i></span>
						<span class="ni-fas-count"></span>
					</span>
					<span class="ni-fas-body">
						<span class="ni-fas-title">Audio Visual Art (AVA)</span>
						<span class="ni-fas-desc">Ruang praktik seni audio visual bagi peserta didik.</span>
						<span class="ni-fas-tags">
							<span class="ni-fas-tag is-alt">SDIT</span>
							<span class="ni-fas-tag is-alt">SMPIT</span>
						</span>
						<span class="ni-fas-cta">Lihat Galeri <i class="fas fa-arrow-right" aria-hidden="true"></i></span>
					</span>
				</button>
				<button type="button" class="ni-fas-card" data-ni-facility="aula-theater">
					<span class="ni-fas-media">
						<!-- foto belum tersedia untuk fasilitas ini -->
						<span class="ni-fas-icon" aria-hidden="true"><i class="fas fa-theater-masks"></i></span>
						<span class="ni-fas-count"></span>
					</span>
					<span class="ni-fas-body">
						<span class="ni-fas-title">Aula Theater</span>
						<span class="ni-fas-desc">Ruang pertunjukan untuk kegiatan seni dan acara sekolah.</span>
						<span class="ni-fas-tags">
							<span class="ni-fas-tag is-alt">SDIT</span>
							<span class="ni-fas-tag is-alt">SMPIT</span>
						</span>
						<span class="ni-fas-cta">Lihat Galeri <i class="fas fa-arrow-right" aria-hidden="true"></i></span>
					</span>
				</button>
				<button type="button" class="ni-fas-card" data-ni-facility="area-bermain">
					<span class="ni-fas-media">
						<img src="images/main.jpeg" alt="Area Bermain" loading="lazy">
						<span class="ni-fas-icon" aria-hidden="true"><i class="fas fa-gamepad"></i></span>
						<span class="ni-fas-count"></span>
					</span>
					<span class="ni-fas-body">
						<span class="ni-fas-title">Area Bermain</span>
						<span class="ni-fas-desc">Sarana bermain anak yang aman di lingkungan sekolah.</span>
						<span class="ni-fas-tags">
							<span class="ni-fas-tag">TKIT</span>
						</span>
						<span class="ni-fas-cta">Lihat Galeri <i class="fas fa-arrow-right" aria-hidden="true"></i></span>
					</span>
				</button>
				<button type="button" class="ni-fas-card" data-ni-facility="lingkungan">
					<span class="ni-fas-media">
						<img src="images/kolamikan.jpeg" alt="Lingkungan Ramah Sekolah" loading="lazy">
						<span class="ni-fas-icon" aria-hidden="true"><i class="fas fa-tree"></i></span>
						<span class="ni-fas-count"></span>
					</span>
					<span class="ni-fas-body">
						<span class="ni-fas-title">Lingkungan Ramah Sekolah</span>
						<span class="ni-fas-desc">Area hijau, kolam ikan, dan suasana bersih yang nyaman untuk seluruh warga sekolah.</span>
						<span class="ni-fas-tags">
							<span class="ni-fas-tag">Semua</span>
						</span>
						<span class="ni-fas-cta">Lihat Galeri <i class="fas fa-arrow-right" aria-hidden="true"></i></span>
					</span>
				</button>
				</div>
			</div>
		</section>

    <!-- Ekstrakurikuler Section -->
    <section class="ekstra-section"
        style="background: linear-gradient(135deg, #0A4F42 0%, #0d6b5a 100%); padding: 80px 0;">
        <div class="container">
            <div class="row justify-content-center mb-5" data-aos="fade-down">
                <div class="col-md-8 text-center">
                    <span
                        style="display: inline-block; background: rgba(255,255,255,0.2); color: #fff; padding: 8px 24px; border-radius: 30px; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">Ekstrakurikuler</span>
                    <h2 class="mt-4 mb-3"
                        style="font-family: 'Playfair Display', serif; font-size: 2.5rem; font-weight: 700; color: #fff;">
                        Aktivitas <span style="color: #D4AF37;">Ekstrakurikuler</span></h2>
                    <p style="color: rgba(255,255,255,0.9); font-size: 1.1rem;">Berbagai kegiatan ekstrakurikuler untuk
                        mengembangkan potensi dan bakat siswa di setiap jenjang.</p>
                </div>
            </div>

            <div class="row">
                <!-- TKIT Ekstra -->
                <div class="col-lg-4 mb-4">
                    <div
                        style="background: rgba(255,255,255,0.1); border-radius: 20px; padding: 30px; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2); height: 100%;">
                        <div style="text-align: center; margin-bottom: 25px;">
                            <span
                                style="display: inline-block; background: linear-gradient(135deg, #D4940A, #E6A800); color: #fff; padding: 8px 20px; border-radius: 20px; font-size: 14px; font-weight: 700;">TKIT
                                Nurul Ilmi</span>
                        </div>
                        <div style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center;">
                            <span
                                style="background: rgba(212,148,10,0.4); color: #fff; padding: 8px 15px; border-radius: 20px; font-size: 13px;">Calistung</span>
                            <span
                                style="background: rgba(212,148,10,0.3); color: #fff; padding: 8px 15px; border-radius: 20px; font-size: 13px;">Tahfidz</span>
                            <span
                                style="background: rgba(212,148,10,0.3); color: #fff; padding: 8px 15px; border-radius: 20px; font-size: 13px;">Menari</span>
                            <span
                                style="background: rgba(212,148,10,0.3); color: #fff; padding: 8px 15px; border-radius: 20px; font-size: 13px;">English
                                Club</span>
                            <span
                                style="background: rgba(212,148,10,0.3); color: #fff; padding: 8px 15px; border-radius: 20px; font-size: 13px;">Mewarnai</span>
                            <span
                                style="background: rgba(212,148,10,0.3); color: #fff; padding: 8px 15px; border-radius: 20px; font-size: 13px;">Futsal
                                & Taekwondo</span>
                        </div>
                    </div>
                </div>

                <!-- SDIT Ekstra -->
                <div class="col-lg-4 mb-4">
                    <div
                        style="background: rgba(255,255,255,0.15); border-radius: 20px; padding: 30px; backdrop-filter: blur(10px); border: 2px solid #D4AF37; height: 100%; position: relative;">
                        <div
                            style="position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: #D4AF37; color: #fff; padding: 4px 15px; border-radius: 15px; font-size: 11px; font-weight: 700;">
                            TERBANYAK PILIHAN</div>
                        <div style="text-align: center; margin-bottom: 25px; margin-top: 5px;">
                            <span
                                style="display: inline-block; background: linear-gradient(135deg, #0A4F42, #0d6b5a); color: #fff; padding: 8px 20px; border-radius: 20px; font-size: 14px; font-weight: 700;">SDIT
                                Nurul Ilmi</span>
                        </div>
                        <div style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center;">
                            <span
                                style="background: rgba(10,79,66,0.6); color: #fff; padding: 6px 12px; border-radius: 15px; font-size: 12px;">Math
                                Club</span>
                            <span
                                style="background: rgba(10,79,66,0.6); color: #fff; padding: 6px 12px; border-radius: 15px; font-size: 12px;">English
                                Club</span>
                            <span
                                style="background: rgba(10,79,66,0.6); color: #fff; padding: 6px 12px; border-radius: 15px; font-size: 12px;">Japanese
                                Club</span>
                            <span
                                style="background: rgba(10,79,66,0.6); color: #fff; padding: 6px 12px; border-radius: 15px; font-size: 12px;">Robotic
                                & Coding</span>
                            <span
                                style="background: rgba(10,79,66,0.6); color: #fff; padding: 6px 12px; border-radius: 15px; font-size: 12px;">Tahfidz
                                Club</span>
                            <span
                                style="background: rgba(10,79,66,0.6); color: #fff; padding: 6px 12px; border-radius: 15px; font-size: 12px;">Taekwondo</span>
                            <span
                                style="background: rgba(10,79,66,0.6); color: #fff; padding: 6px 12px; border-radius: 15px; font-size: 12px;">Archery</span>
                            <span
                                style="background: rgba(10,79,66,0.6); color: #fff; padding: 6px 12px; border-radius: 15px; font-size: 12px;">Futsal</span>
                            <span
                                style="background: rgba(10,79,66,0.6); color: #fff; padding: 6px 12px; border-radius: 15px; font-size: 12px;">Volly
                                ball</span>
                            <span
                                style="background: rgba(10,79,66,0.6); color: #fff; padding: 6px 12px; border-radius: 15px; font-size: 12px;">Basket</span>
                            <span
                                style="background: rgba(10,79,66,0.6); color: #fff; padding: 6px 12px; border-radius: 15px; font-size: 12px;">Marawis
                                & Hadroh</span>
                            <span
                                style="background: rgba(10,79,66,0.6); color: #fff; padding: 6px 12px; border-radius: 15px; font-size: 12px;">Drumband</span>
                        </div>
                    </div>
                </div>

                <!-- SMPIT Ekstra -->
                <div class="col-lg-4 mb-4">
                    <div
                        style="background: rgba(255,255,255,0.1); border-radius: 20px; padding: 30px; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2); height: 100%;">
                        <div style="text-align: center; margin-bottom: 25px;">
                            <span
                                style="display: inline-block; background: linear-gradient(135deg, #1B4F72, #2874A6); color: #fff; padding: 8px 20px; border-radius: 20px; font-size: 14px; font-weight: 700;">SMPIT
                                Nurul Ilmi</span>
                        </div>
                        <div style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center;">
                            <span
                                style="background: rgba(27,79,114,0.5); color: #fff; padding: 6px 12px; border-radius: 15px; font-size: 12px;">Math
                                Club</span>
                            <span
                                style="background: rgba(27,79,114,0.5); color: #fff; padding: 6px 12px; border-radius: 15px; font-size: 12px;">English
                                Club</span>
                            <span
                                style="background: rgba(27,79,114,0.5); color: #fff; padding: 6px 12px; border-radius: 15px; font-size: 12px;">Japanese
                                Club</span>
                            <span
                                style="background: rgba(27,79,114,0.5); color: #fff; padding: 6px 12px; border-radius: 15px; font-size: 12px;">Robotic
                                & Coding</span>
                            <span
                                style="background: rgba(27,79,114,0.5); color: #fff; padding: 6px 12px; border-radius: 15px; font-size: 12px;">Tahfidz
                                Club</span>
                            <span
                                style="background: rgba(27,79,114,0.5); color: #fff; padding: 6px 12px; border-radius: 15px; font-size: 12px;">Taekwondo</span>
                            <span
                                style="background: rgba(27,79,114,0.5); color: #fff; padding: 6px 12px; border-radius: 15px; font-size: 12px;">Archery</span>
                            <span
                                style="background: rgba(27,79,114,0.5); color: #fff; padding: 6px 12px; border-radius: 15px; font-size: 12px;">Futsal</span>
                            <span
                                style="background: rgba(27,79,114,0.5); color: #fff; padding: 6px 12px; border-radius: 15px; font-size: 12px;">Volly
                                ball</span>
                            <span
                                style="background: rgba(27,79,114,0.5); color: #fff; padding: 6px 12px; border-radius: 15px; font-size: 12px;">Basket</span>
                            <span
                                style="background: rgba(27,79,114,0.5); color: #fff; padding: 6px 12px; border-radius: 15px; font-size: 12px;">Marawis
                                & Hadroh</span>
                            <span
                                style="background: rgba(27,79,114,0.5); color: #fff; padding: 6px 12px; border-radius: 15px; font-size: 12px;">Drumband</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Kegiatan Sekolah Info -->
            <div class="row mt-5" data-aos="fade-up">
                <div class="col-12 text-center">
                    <div
                        style="background: rgba(255,255,255,0.1); border-radius: 20px; padding: 30px; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2); max-width: 800px; margin: 0 auto;">
                        <h4 style="color: #fff; margin-bottom: 15px;"><i class="fas fa-calendar-alt"
                                style="color: #D4AF37; margin-right: 10px;"></i>Kegiatan Sekolah</h4>
                        <p style="color: rgba(255,255,255,0.9); margin-bottom: 15px;">Berbagai kegiatan pendidikan dan
                            perayaan sepanjang tahun ajaran:</p>
                        <div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
                            <span
                                style="background: rgba(212,175,55,0.3); color: #fff; padding: 6px 15px; border-radius: 20px; font-size: 13px;">Field
                                Trip</span>
                            <span
                                style="background: rgba(212,175,55,0.3); color: #fff; padding: 6px 15px; border-radius: 20px; font-size: 13px;">PHBI</span>
                            <span
                                style="background: rgba(212,175,55,0.3); color: #fff; padding: 6px 15px; border-radius: 20px; font-size: 13px;">PHBN</span>
                            <span
                                style="background: rgba(212,175,55,0.3); color: #fff; padding: 6px 15px; border-radius: 20px; font-size: 13px;">PTS
                                / PAS</span>
                            <span
                                style="background: rgba(212,175,55,0.3); color: #fff; padding: 6px 15px; border-radius: 20px; font-size: 13px;">Perlombaan
                                Internal</span>
                            <span
                                style="background: rgba(212,175,55,0.3); color: #fff; padding: 6px 15px; border-radius: 20px; font-size: 13px;">Market
                                Day</span>
                            <span
                                style="background: rgba(212,175,55,0.3); color: #fff; padding: 6px 15px; border-radius: 20px; font-size: 13px;">Porseni</span>
                            <span
                                style="background: rgba(212,175,55,0.3); color: #fff; padding: 6px 15px; border-radius: 20px; font-size: 13px;">Character
                                Building</span>
                            <span
                                style="background: rgba(212,175,55,0.3); color: #fff; padding: 6px 15px; border-radius: 20px; font-size: 13px;">Outbond</span>
                            <span
                                style="background: rgba(212,175,55,0.3); color: #fff; padding: 6px 15px; border-radius: 20px; font-size: 13px;">Wisuda</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="ftco-section ftco-counter img" id="section-counter"
        style="background-image: url(images/bg_4.jpg); background-position: center;"
        data-stellar-background-ratio="0.5">
        <div class="container">
            <div class="row justify-content-center mb-5 pb-2">
                <div class="col-md-8 text-center heading-section heading-section-white ftco-animate">
                    <h2 class="mb-4" style="text-shadow: 0 3px 14px rgba(0,0,0,0.65);"><span>Lebih dari</span> 25
                        Tahun Pengalaman</h2>
                    <p style="text-shadow: 0 2px 8px rgba(0,0,0,0.75);">Berdiri sejak tahun 2001, YPI Nurul Ilmi telah
                        membuktikan kualitasnya dalam mencetak generasi Islam yang berkualitas di tiga jenjang
                        pendidikan.</p>
                </div>
            </div>
            <div class="row d-md-flex align-items-center justify-content-center">
                <div class="col-lg-10">
                    <div class="row d-md-flex align-items-center">
                        <div class="col-md d-flex justify-content-center counter-wrap ftco-animate">
                            <div class="block-18">
                                <div class="icon"><span class="flaticon-doctor"
                                        style="color: #D4AF37; text-shadow: 0 3px 10px rgba(0,0,0,0.6);"></span></div>
                                <div class="text">
                                    <strong class="number" data-number="28"
                                        style="color: #fff; text-shadow: 0 3px 12px rgba(0,0,0,0.7);">0</strong>
                                    <span style="color: #fff; text-shadow: 0 2px 8px rgba(0,0,0,0.75);">Guru
                                        Profesional</span>
                                </div>
                            </div>
                        </div>
                        <div class="col-md d-flex justify-content-center counter-wrap ftco-animate">
                            <div class="block-18">
                                <div class="icon"><span class="flaticon-doctor"
                                        style="color: #D4AF37; text-shadow: 0 3px 10px rgba(0,0,0,0.6);"></span></div>
                                <div class="text">
                                    <strong class="number" data-number="420"
                                        style="color: #fff; text-shadow: 0 3px 12px rgba(0,0,0,0.7);">0</strong>
                                    <span style="color: #fff; text-shadow: 0 2px 8px rgba(0,0,0,0.75);">Siswa
                                        Aktif</span>
                                </div>
                            </div>
                        </div>
                        <div class="col-md d-flex justify-content-center counter-wrap ftco-animate">
                            <div class="block-18">
                                <div class="icon"><span class="flaticon-doctor"
                                        style="color: #D4AF37; text-shadow: 0 3px 10px rgba(0,0,0,0.6);"></span></div>
                                <div class="text">
                                    <strong class="number" data-number="420"
                                        style="color: #fff; text-shadow: 0 3px 12px rgba(0,0,0,0.7);">0</strong>
                                    <span style="color: #fff; text-shadow: 0 2px 8px rgba(0,0,0,0.75);">Wali
                                        Murid</span>
                                </div>
                            </div>
                        </div>
                        <div class="col-md d-flex justify-content-center counter-wrap ftco-animate">
                            <div class="block-18">
                                <div class="icon"><span class="flaticon-doctor"
                                        style="color: #D4AF37; text-shadow: 0 3px 10px rgba(0,0,0,0.6);"></span></div>
                                <div class="text">
                                    <strong class="number" data-number="19"
                                        style="color: #fff; text-shadow: 0 3px 12px rgba(0,0,0,0.7);">0</strong>
                                    <span style="color: #fff; text-shadow: 0 2px 8px rgba(0,0,0,0.75);">Tahun
                                        Pengalaman</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- SECTION KEGIATAN SEKOLAH -->
    <section class="kegiatan-section"
        style="background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%); padding: 80px 0;">
        <div class="container">
            <div class="row justify-content-center mb-5" data-aos="fade-down">
                <div class="col-md-8 text-center">
                    <span class="section-badge">Informasi Sekolah</span>
                    <h2 class="mt-4 mb-3">Kegiatan <span style="color: #D4AF37;">Sekolah</span></h2>
                    <p class="section-subtitle">Berbagai kegiatan pendidikan dan perayaan sepanjang tahun ajaran di
                        SDIT dan SMPIT Nurul Ilmi.</p>
                </div>
            </div>
            <div class="row">
                <!-- SDIT Card - Green Theme -->
                <div class="col-lg-6 mb-4" data-aos="fade-up" data-aos-delay="100">
                    <div
                        style="background: #fff; border-radius: 20px; padding: 35px; box-shadow: 0 15px 50px rgba(0,0,0,0.1); height: 100%; border-top: 5px solid #0A4F42;">
                        <div class="text-center mb-4">
                            <div
                                style="width: 80px; height: 80px; background: linear-gradient(135deg, #0A4F42, #0d6b5a); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; box-shadow: 0 10px 30px rgba(10,79,66,0.3);">
                                <i class="fas fa-book-reader" style="font-size: 32px; color: #fff;"></i>
                            </div>
                            <h3 style="color: #0A4F42; font-weight: 700; margin-bottom: 5px;">SDIT Nurul Ilmi</h3>
                            <span
                                style="display: inline-block; background: linear-gradient(135deg, #0A4F42, #0d6b5a); color: #fff; padding: 5px 15px; border-radius: 15px; font-size: 11px; font-weight: 600;">Sekolah
                                Dasar Islam Terpadu</span>
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                            <div
                                style="display: flex; align-items: center; gap: 10px; padding: 10px; background: #F1F9E9; border-radius: 10px;">
                                <i class="fas fa-map-signs" style="color: #0A4F42; font-size: 18px;"></i>
                                <span style="font-size: 13px; color: #333;">Fieldtrip</span>
                            </div>
                            <div
                                style="display: flex; align-items: center; gap: 10px; padding: 10px; background: #F1F9E9; border-radius: 10px;">
                                <i class="fas fa-moon" style="color: #0A4F42; font-size: 18px;"></i>
                                <span style="font-size: 13px; color: #333;">PHBI</span>
                            </div>
                            <div
                                style="display: flex; align-items: center; gap: 10px; padding: 10px; background: #F1F9E9; border-radius: 10px;">
                                <i class="fas fa-flag" style="color: #0A4F42; font-size: 18px;"></i>
                                <span style="font-size: 13px; color: #333;">PHBN</span>
                            </div>
                            <div
                                style="display: flex; align-items: center; gap: 10px; padding: 10px; background: #F1F9E9; border-radius: 10px;">
                                <i class="fas fa-file-alt" style="color: #0A4F42; font-size: 18px;"></i>
                                <span style="font-size: 13px; color: #333;">PTS & PAS</span>
                            </div>
                            <div
                                style="display: flex; align-items: center; gap: 10px; padding: 10px; background: #F1F9E9; border-radius: 10px;">
                                <i class="fas fa-store" style="color: #0A4F42; font-size: 18px;"></i>
                                <span style="font-size: 13px; color: #333;">Market Day (Jabar Nuril)</span>
                            </div>
                            <div
                                style="display: flex; align-items: center; gap: 10px; padding: 10px; background: #F1F9E9; border-radius: 10px;">
                                <i class="fas fa-trophy" style="color: #0A4F42; font-size: 18px;"></i>
                                <span style="font-size: 13px; color: #333;">Lomba Internal</span>
                            </div>
                            <div
                                style="display: flex; align-items: center; gap: 10px; padding: 10px; background: #F1F9E9; border-radius: 10px;">
                                <i class="fas fa-campground" style="color: #0A4F42; font-size: 18px;"></i>
                                <span style="font-size: 13px; color: #333;">Santri Fest (Pesantren Kilat)</span>
                            </div>
                            <div
                                style="display: flex; align-items: center; gap: 10px; padding: 10px; background: #F1F9E9; border-radius: 10px;">
                                <i class="fas fa-utensils" style="color: #0A4F42; font-size: 18px;"></i>
                                <span style="font-size: 13px; color: #333;">Buka Puasa Bersama</span>
                            </div>
                            <div
                                style="display: flex; align-items: center; gap: 10px; padding: 10px; background: #F1F9E9; border-radius: 10px;">
                                <i class="fas fa-hiking" style="color: #0A4F42; font-size: 18px;"></i>
                                <span style="font-size: 13px; color: #333;">Kegiatan Aktif Pramuka</span>
                            </div>
                            <div
                                style="display: flex; align-items: center; gap: 10px; padding: 10px; background: #F1F9E9; border-radius: 10px;">
                                <i class="fas fa-book-quran" style="color: #0A4F42; font-size: 18px;"></i>
                                <span style="font-size: 13px; color: #333;">Kegiatan Aktif & Rutin Tahfidz</span>
                            </div>
                            <div
                                style="display: flex; align-items: center; gap: 10px; padding: 10px; background: #F1F9E9; border-radius: 10px; grid-column: span 2;">
                                <i class="fas fa-medal" style="color: #0A4F42; font-size: 18px;"></i>
                                <span style="font-size: 13px; color: #333;">Aktif mengikutsertakan siswa terpilih dalam
                                    lomba eksternal</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- SMPIT Card - Blue Theme -->
                <div class="col-lg-6 mb-4" data-aos="fade-up" data-aos-delay="200">
                    <div
                        style="background: #fff; border-radius: 20px; padding: 35px; box-shadow: 0 15px 50px rgba(0,0,0,0.1); height: 100%; border-top: 5px solid #1B4F72;">
                        <div class="text-center mb-4">
                            <div
                                style="width: 80px; height: 80px; background: linear-gradient(135deg, #1B4F72, #2874A6); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; box-shadow: 0 10px 30px rgba(27,79,114,0.3);">
                                <i class="fas fa-graduation-cap" style="font-size: 32px; color: #fff;"></i>
                            </div>
                            <h3 style="color: #1B4F72; font-weight: 700; margin-bottom: 5px;">SMPIT Nurul Ilmi</h3>
                            <span
                                style="display: inline-block; background: linear-gradient(135deg, #1B4F72, #2874A6); color: #fff; padding: 5px 15px; border-radius: 15px; font-size: 11px; font-weight: 600;">Sekolah
                                Menengah Pertama Islam Terpadu</span>
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                            <div
                                style="display: flex; align-items: center; gap: 10px; padding: 10px; background: #EBF5FB; border-radius: 10px;">
                                <i class="fas fa-map-signs" style="color: #1B4F72; font-size: 18px;"></i>
                                <span style="font-size: 13px; color: #333;">Fieldtrip</span>
                            </div>
                            <div
                                style="display: flex; align-items: center; gap: 10px; padding: 10px; background: #EBF5FB; border-radius: 10px;">
                                <i class="fas fa-moon" style="color: #1B4F72; font-size: 18px;"></i>
                                <span style="font-size: 13px; color: #333;">PHBI</span>
                            </div>
                            <div
                                style="display: flex; align-items: center; gap: 10px; padding: 10px; background: #EBF5FB; border-radius: 10px;">
                                <i class="fas fa-flag" style="color: #1B4F72; font-size: 18px;"></i>
                                <span style="font-size: 13px; color: #333;">PHBN</span>
                            </div>
                            <div
                                style="display: flex; align-items: center; gap: 10px; padding: 10px; background: #EBF5FB; border-radius: 10px;">
                                <i class="fas fa-file-alt" style="color: #1B4F72; font-size: 18px;"></i>
                                <span style="font-size: 13px; color: #333;">PTS & PAS</span>
                            </div>
                            <div
                                style="display: flex; align-items: center; gap: 10px; padding: 10px; background: #EBF5FB; border-radius: 10px;">
                                <i class="fas fa-store" style="color: #1B4F72; font-size: 18px;"></i>
                                <span style="font-size: 13px; color: #333;">Market Day (Jabar Nuril)</span>
                            </div>
                            <div
                                style="display: flex; align-items: center; gap: 10px; padding: 10px; background: #EBF5FB; border-radius: 10px;">
                                <i class="fas fa-trophy" style="color: #1B4F72; font-size: 18px;"></i>
                                <span style="font-size: 13px; color: #333;">Lomba Internal</span>
                            </div>
                            <div
                                style="display: flex; align-items: center; gap: 10px; padding: 10px; background: #EBF5FB; border-radius: 10px;">
                                <i class="fas fa-campground" style="color: #1B4F72; font-size: 18px;"></i>
                                <span style="font-size: 13px; color: #333;">Santri Fest (Pesantren Kilat)</span>
                            </div>
                            <div
                                style="display: flex; align-items: center; gap: 10px; padding: 10px; background: #EBF5FB; border-radius: 10px;">
                                <i class="fas fa-utensils" style="color: #1B4F72; font-size: 18px;"></i>
                                <span style="font-size: 13px; color: #333;">Buka Puasa Bersama</span>
                            </div>
                            <div
                                style="display: flex; align-items: center; gap: 10px; padding: 10px; background: #EBF5FB; border-radius: 10px;">
                                <i class="fas fa-hiking" style="color: #1B4F72; font-size: 18px;"></i>
                                <span style="font-size: 13px; color: #333;">Kegiatan Aktif Pramuka</span>
                            </div>
                            <div
                                style="display: flex; align-items: center; gap: 10px; padding: 10px; background: #EBF5FB; border-radius: 10px;">
                                <i class="fas fa-book-quran" style="color: #1B4F72; font-size: 18px;"></i>
                                <span style="font-size: 13px; color: #333;">Kegiatan Aktif & Rutin Tahfidz</span>
                            </div>
                            <div
                                style="display: flex; align-items: center; gap: 10px; padding: 10px; background: #EBF5FB; border-radius: 10px; grid-column: span 2;">
                                <i class="fas fa-medal" style="color: #1B4F72; font-size: 18px;"></i>
                                <span style="font-size: 13px; color: #333;">Aktif mengikutsertakan siswa terpilih dalam
                                    lomba eksternal</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- SECTION KETERANGAN -->
    <section class="keterangan-section"
        style="background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%); padding: 80px 0;">
        <div class="container">
            <div class="row justify-content-center mb-5" data-aos="fade-down">
                <div class="col-md-8 text-center">
                    <span class="section-badge"
                        style="background: linear-gradient(135deg, #1B4F72, #2874A6);">Informasi Penting</span>
                    <h2 class="mt-4 mb-3">Keterangan</h2>
                    <p class="section-subtitle">Informasi penting mengenai kegiatan belajar dan kebijakan sekolah di
                        SDIT dan SMPIT Nurul Ilmi.</p>
                </div>
            </div>
            <div class="row">
                <!-- SDIT Keterangan Card -->
                <div class="col-lg-6 mb-4" data-aos="fade-up" data-aos-delay="100">
                    <div
                        style="background: #fff; border-radius: 20px; padding: 35px; box-shadow: 0 15px 50px rgba(0,0,0,0.1); height: 100%; border-left: 5px solid #0A4F42;">
                        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 25px;">
                            <div
                                style="width: 60px; height: 60px; background: linear-gradient(135deg, #0A4F42, #0d6b5a); border-radius: 15px; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-info-circle" style="font-size: 24px; color: #fff;"></i>
                            </div>
                            <div>
                                <h3 style="color: #0A4F42; font-weight: 700; margin-bottom: 0;">SDIT Nurul Ilmi</h3>
                                <span style="color: #666; font-size: 13px;">Sekolah Dasar Islam Terpadu</span>
                            </div>
                        </div>
                        <ul style="list-style: none; padding: 0; margin: 0;">
                            <li style="display: flex; gap: 15px; padding: 15px 0; border-bottom: 1px solid #eee;">
                                <i class="fas fa-laptop"
                                    style="color: #0A4F42; font-size: 20px; margin-top: 3px;"></i>
                                <p style="margin: 0; color: #555; font-size: 14px; line-height: 1.6;">Mulai kelas 3,
                                    siswa diwajibkan menggunakan gadget/laptop milik pribadi.</p>
                            </li>
                            <li style="display: flex; gap: 15px; padding: 15px 0; border-bottom: 1px solid #eee;">
                                <i class="fas fa-code" style="color: #0A4F42; font-size: 20px; margin-top: 3px;"></i>
                                <p style="margin: 0; color: #555; font-size: 14px; line-height: 1.6;">Mulai kelas 5 dan
                                    6, siswa sudah mengikuti KBM untuk Mata Pelajaran Coding.</p>
                            </li>
                            <li style="display: flex; gap: 15px; padding: 15px 0; border-bottom: 1px solid #eee;">
                                <i class="fas fa-graduation-cap"
                                    style="color: #0A4F42; font-size: 20px; margin-top: 3px;"></i>
                                <p style="margin: 0; color: #555; font-size: 14px; line-height: 1.6;">Menggunakan
                                    Kurikulum Merdeka.</p>
                            </li>
                            <li style="display: flex; gap: 15px; padding: 15px 0; border-bottom: 1px solid #eee;">
                                <i class="fas fa-chalkboard-teacher"
                                    style="color: #0A4F42; font-size: 20px; margin-top: 3px;"></i>
                                <p style="margin: 0; color: #555; font-size: 14px; line-height: 1.6;">Pembelajaran
                                    berlangsung secara reguler.</p>
                            </li>
                            <li style="display: flex; gap: 15px; padding: 15px 0;">
                                <i class="fas fa-clock" style="color: #0A4F42; font-size: 20px; margin-top: 3px;"></i>
                                <p style="margin: 0; color: #555; font-size: 14px; line-height: 1.6;">Pintu gerbang
                                    utama ditutup pukul 06.45 untuk kegiatan pembiasaan pagi (KPP): Sholat Dhuha,
                                    murojaah atau senam ceria.</p>
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- SMPIT Keterangan Card -->
                <div class="col-lg-6 mb-4" data-aos="fade-up" data-aos-delay="200">
                    <div
                        style="background: #fff; border-radius: 20px; padding: 35px; box-shadow: 0 15px 50px rgba(0,0,0,0.1); height: 100%; border-left: 5px solid #1B4F72;">
                        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 25px;">
                            <div
                                style="width: 60px; height: 60px; background: linear-gradient(135deg, #1B4F72, #2874A6); border-radius: 15px; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-info-circle" style="font-size: 24px; color: #fff;"></i>
                            </div>
                            <div>
                                <h3 style="color: #1B4F72; font-weight: 700; margin-bottom: 0;">SMPIT Nurul Ilmi</h3>
                                <span style="color: #666; font-size: 13px;">Sekolah Menengah Pertama Islam
                                    Terpadu</span>
                            </div>
                        </div>
                        <ul style="list-style: none; padding: 0; margin: 0;">
                            <li style="display: flex; gap: 15px; padding: 15px 0; border-bottom: 1px solid #eee;">
                                <i class="fas fa-laptop"
                                    style="color: #1B4F72; font-size: 20px; margin-top: 3px;"></i>
                                <p style="margin: 0; color: #555; font-size: 14px; line-height: 1.6;">Siswa diwajibkan
                                    menggunakan gadget/laptop milik pribadi dari kelas 7.</p>
                            </li>
                            <li style="display: flex; gap: 15px; padding: 15px 0; border-bottom: 1px solid #eee;">
                                <i class="fas fa-code" style="color: #1B4F72; font-size: 20px; margin-top: 3px;"></i>
                                <p style="margin: 0; color: #555; font-size: 14px; line-height: 1.6;">Mulai kelas 7, 8,
                                    dan 9 siswa sudah mengikuti KBM untuk Mata Pelajaran Coding.</p>
                            </li>
                            <li style="display: flex; gap: 15px; padding: 15px 0; border-bottom: 1px solid #eee;">
                                <i class="fas fa-graduation-cap"
                                    style="color: #1B4F72; font-size: 20px; margin-top: 3px;"></i>
                                <p style="margin: 0; color: #555; font-size: 14px; line-height: 1.6;">Menggunakan
                                    Kurikulum Merdeka.</p>
                            </li>
                            <li style="display: flex; gap: 15px; padding: 15px 0; border-bottom: 1px solid #eee;">
                                <i class="fas fa-chalkboard-teacher"
                                    style="color: #1B4F72; font-size: 20px; margin-top: 3px;"></i>
                                <p style="margin: 0; color: #555; font-size: 14px; line-height: 1.6;">Pembelajaran
                                    berlangsung secara reguler.</p>
                            </li>
                            <li style="display: flex; gap: 15px; padding: 15px 0; border-bottom: 1px solid #eee;">
                                <i class="fas fa-clock"
                                    style="color: #1B4F72; font-size: 20px; margin-top: 3px;"></i>
                                <p style="margin: 0; color: #555; font-size: 14px; line-height: 1.6;">Pintu gerbang
                                    utama ditutup pukul 06.45 untuk kegiatan pembiasaan pagi (KPP): Sholat Dhuha,
                                    murojaah atau senam ceria.</p>
                            </li>
                            <li style="display: flex; gap: 15px; padding: 15px 0;">
                                <i class="fas fa-motorcycle"
                                    style="color: #e74c3c; font-size: 20px; margin-top: 3px;"></i>
                                <p style="margin: 0; color: #555; font-size: 14px; line-height: 1.6;">Siswa SMP
                                    dilarang memakai sepeda motor saat berangkat ke sekolah.</p>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- SECTION KETENTUAN UMUM -->
    <section class="ketentuan-section"
        style="background: linear-gradient(135deg, #0A4F42 0%, #0d6b5a 100%); padding: 80px 0;">
        <div class="container">
            <div class="row justify-content-center mb-5" data-aos="fade-down">
                <div class="col-md-8 text-center">
                    <span class="section-badge"
                        style="background: rgba(255,255,255,0.2); color: #fff;">Peraturan</span>
                    <h2 class="mt-4 mb-3" style="color: #fff;">Ketentuan Umum</h2>
                    <p class="section-subtitle" style="color: rgba(255,255,255,0.9);">Ketentuan umum yang berlaku
                        untuk seluruh peserta didik SDIT dan SMPIT Nurul Ilmi.</p>
                </div>
            </div>
            <div class="row justify-content-center">
                <div class="col-lg-10" data-aos="fade-up">
                    <div
                        style="background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-radius: 20px; padding: 40px; border: 1px solid rgba(255,255,255,0.2);">
                        <div
                            style="display: flex; gap: 20px; margin-bottom: 30px; padding-bottom: 30px; border-bottom: 1px solid rgba(255,255,255,0.2);">
                            <div
                                style="width: 50px; height: 50px; background: linear-gradient(135deg, #D4AF37, #FFD700); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                <i class="fas fa-gavel" style="font-size: 20px; color: #fff;"></i>
                            </div>
                            <div>
                                <h4 style="color: #D4AF37; font-weight: 700; margin-bottom: 10px;">Tim Revolusi Akhlak
                                    Sekolah</h4>
                                <p
                                    style="color: rgba(255,255,255,0.9); margin: 0; line-height: 1.8; font-size: 14px;">
                                    Selain meraih prestasi akademik, dalam upaya membentuk karakter murid yang kuat
                                    dengan nilai-nilai Islami, pelanggaran yang dilakukan oleh siswa akan mendapat
                                    bimbingan, pendampingan hingga sanksi dari guru-guru yang terkait sebagai "Tim
                                    Revolusi Akhlak Sekolah". Hukuman berupa menulis/membaca atau menghafal surat pendek
                                    dalam Al-Qur'an.</p>
                            </div>
                        </div>
                        <div
                            style="display: flex; gap: 20px; margin-bottom: 30px; padding-bottom: 30px; border-bottom: 1px solid rgba(255,255,255,0.2);">
                            <div
                                style="width: 50px; height: 50px; background: linear-gradient(135deg, #D4AF37, #FFD700); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                <i class="fas fa-users" style="font-size: 20px; color: #fff;"></i>
                            </div>
                            <div>
                                <h4 style="color: #D4AF37; font-weight: 700; margin-bottom: 10px;">Komunikasi Orang
                                    Tua dan Sekolah</h4>
                                <p
                                    style="color: rgba(255,255,255,0.9); margin: 0; line-height: 1.8; font-size: 14px;">
                                    Orangtua / Wali murid berhak mengikuti kegiatan yang diadakan oleh sekolah dalam
                                    rangka menjalin komunikasi dengan pihak sekolah, di antaranya pengajian rutin
                                    bulanan atau parenting yang dilakukan di Masjid maupun Auditorium / Ruang Serbaguna
                                    Nurul Ilmi.</p>
                            </div>
                        </div>
                        <div style="display: flex; gap: 20px;">
                            <div
                                style="width: 50px; height: 50px; background: linear-gradient(135deg, #D4AF37, #FFD700); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                <i class="fas fa-phone-slash" style="font-size: 20px; color: #fff;"></i>
                            </div>
                            <div>
                                <h4 style="color: #D4AF37; font-weight: 700; margin-bottom: 10px;">Komunikasi Durante
                                    KBM</h4>
                                <p
                                    style="color: rgba(255,255,255,0.9); margin: 0; line-height: 1.8; font-size: 14px;">
                                    Selama jam KBM baik Wali Kelas/Guru pendamping menggunakan mode "silent/senyap"
                                    sehingga tidak dapat menerima telepon atau membalas WA wali murid.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    <!-- SECTION MARS NURUL ILMI -->
    <section class="mars-section" id="mars-nurul-ilmi"
        style="background: linear-gradient(135deg, #0A4F42 0%, #0d6b5a 100%); padding: 80px 0; position: relative; overflow: hidden;">
        <!-- Decorative elements -->
        <div
            style="position: absolute; top: -50px; left: -50px; width: 200px; height: 200px; background: rgba(212,175,55,0.1); border-radius: 50%;">
        </div>
        <div
            style="position: absolute; bottom: -30px; right: -30px; width: 150px; height: 150px; background: rgba(212,175,55,0.08); border-radius: 50%;">
        </div>
        <div
            style="position: absolute; top: 50%; right: 10%; width: 100px; height: 100px; background: rgba(255,255,255,0.03); border-radius: 50%;">
        </div>

        <div class="container" style="position: relative; z-index: 1;">
            <div class="row justify-content-center mb-5" data-aos="fade-down">
                <div class="col-md-8 text-center">
                    <span class="mars-badge"
                        style="display: inline-block; background: linear-gradient(135deg, #D4AF37, #FFD700); color: #0A4F42; padding: 8px 24px; border-radius: 30px; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; box-shadow: 0 4px 15px rgba(212,175,55,0.4);"><i
                            class="fas fa-music" style="margin-right: 8px;"></i>Musik</span>
                    <h2 class="mt-4 mb-3"
                        style="font-family: 'Playfair Display', serif; font-size: 2.5rem; font-weight: 700; color: #fff;">
                        Mars <span style="color: #D4AF37;">Nurul Ilmi</span></h2>
                    <p
                        style="color: rgba(255,255,255,0.85); font-size: 1.1rem; max-width: 600px; margin: 0 auto; line-height: 1.7;">
                        Lirik lagu Mars YPI Nurul Ilmi Bekasi</p>
                </div>
            </div>
            <div class="row justify-content-center" data-aos="fade-up">
                <div class="col-lg-8">
                    <div
                        style="background: linear-gradient(145deg, rgba(255,255,255,0.12), rgba(255,255,255,0.05)); backdrop-filter: blur(10px); border-radius: 24px; padding: 50px 40px; border: 2px solid rgba(212,175,55,0.4); text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                        <div class="mars-lyrics" style="color: #fff; font-size: 17px; line-height: 2.2;">
                            <p class="bait"
                                style="margin-bottom: 35px; padding-bottom: 25px; border-bottom: 1px solid rgba(212,175,55,0.2);">
                                <strong
                                    style="font-size: 19px; display: block; margin-bottom: 12px; color: #FFD700;">Kami
                                    semua siswa di yayasan nurul ilmi</strong>
                                <em>Santun dan berbudi luhur</em><br>
                                <em>Belajar berlandaskan Al-Qur'an dan sunah Nabi Muhammad</em>
                            </p>

                            <p class="bait"
                                style="margin-bottom: 35px; padding-bottom: 25px; border-bottom: 1px solid rgba(212,175,55,0.2);">
                                <em>Sehat kuat iman kita</em><br>
                                <em>Selalu menjaga akidah</em><br>
                                <em>Rajin belajar bukan sekadar</em><br>
                                <em>Pandai dunia semata</em>
                            </p>

                            <p class="bait"
                                style="margin-bottom: 35px; padding-bottom: 25px; border-bottom: 1px solid rgba(212,175,55,0.2);">
                                <em>Menjadi siswa yang unggul</em><br>
                                <em>Berprestasi dan berakhlak</em><br>
                                <em>Jiwa berani sabar peduli</em><br>
                                <em>Menjunjung kalam ilahi</em>
                            </p>

                            <p class="bait" style="margin-bottom: 35px;">
                                <em>Marilah membangun bangsa</em><br>
                                <em>Tuk negeri kita tercinta</em><br>
                                <em>Pribadi cerdas insan pilihan</em><br>
                                <em>Untuk dunia akhirat</em>
                            </p>

                            <p class="balik"
                                style="margin: 30px 0 25px; padding: 12px 25px; background: rgba(212,175,55,0.2); border-radius: 30px; display: inline-block; color: #FFD700; font-weight: 600; font-size: 15px;">
                                Balik lagi ke awal</p>

                            <p class="penutup"
                                style="font-size: 24px; font-weight: 700; color: #FFD700; margin: 20px 0 0; text-shadow: 0 2px 10px rgba(0,0,0,0.3);">
                                Nurul Ilmi Berprestasi</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- SECTION SPMB PROMOSI -->
    <section class="spmb-section" id="spmb"
        style="background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%); padding: 80px 0; position: relative; overflow: hidden;">
        <!-- Decorative Background -->
        <div aria-hidden="true"
            style="position: absolute; inset: 0; opacity: 0.4; pointer-events: none; background-image: radial-gradient(circle, rgba(10,79,66,0.06) 1px, transparent 1px); background-size: 25px 25px;">
        </div>

        <div class="container" style="position: relative; z-index: 1;">

            <!-- Heading -->
            <div class="row justify-content-center mb-5" data-aos="fade-down">
                <div class="col-lg-10 text-center">
                    <span class="spmb-badge"
                        style="display: inline-block; background: linear-gradient(135deg, #0A4F42, #0d6b5a); color: #fff; padding: 10px 30px; border-radius: 30px; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; box-shadow: 0 4px 15px rgba(10,79,66,0.25);">Penerimaan
                        Murid Baru</span>

                    <h2 class="mt-4 mb-3"
                        style="font-family: 'Playfair Display', serif; font-size: clamp(2rem, 4vw, 2.8rem); font-weight: 700; line-height: 1.3; color: #0A4F42;">
                        SPMB Tahun Ajaran <span style="color: #D4AF37;">2026/2027</span></h2>

                    <p style="color: #555; font-size: 1.1rem; font-weight: 500; margin-bottom: 8px;">YPI Nurul Ilmi
                        Bekasi</p>

                    <p style="color: #666; font-size: 1rem; max-width: 750px; margin: 0 auto 20px; line-height: 1.8;">
                        Telah dibuka penerimaan murid baru Tahun Ajaran 2026/2027 untuk jenjang <strong>TK, SD, dan
                            SMP</strong> di lingkungan YPI Nurul Ilmi Bekasi. Hubungi tim kami untuk mendapatkan
                        informasi lengkap mengenai pendaftaran, persyaratan, dan informasi sekolah.</p>

                    <span
                        style="display: inline-flex; align-items: center; gap: 10px; background: linear-gradient(135deg, #D4AF37, #FFD700); color: #fff; padding: 12px 28px; border-radius: 30px; font-size: 15px; font-weight: 700; box-shadow: 0 4px 20px rgba(212,175,55,0.35);"><i
                            class="fas fa-bell" aria-hidden="true"></i> Pendaftaran Telah Dibuka</span>
                </div>
            </div>

            <!-- Poster SPMB -->
            <div class="row justify-content-center mb-5" data-aos="fade-up">
                <div class="col-lg-8">
                    <div
                        style="background: #fff; padding: 15px; border-radius: 20px; border: 1px solid rgba(10,79,66,0.1); box-shadow: 0 20px 50px rgba(10,79,66,0.12);">
                        <img src="{{ asset('landingPage/images/SMBP.jpeg') }}" alt="Poster SPMB YPI Nurul Ilmi Bekasi" loading="lazy"
                            style="display: block; width: 100%; height: auto; max-height: 600px; object-fit: contain; border-radius: 12px;">
                    </div>
                    <p style="text-align: center; color: #888; font-size: 13px; margin-top: 15px; margin-bottom: 0;">
                        <i class="fas fa-image" style="margin-right: 6px;"></i> Poster Informasi SPMB YPI Nurul Ilmi
                        Bekasi</p>
                </div>
            </div>

            <!-- Hubungi Kami Section -->
            <div class="row justify-content-center mt-5" data-aos="fade-up">
                <div class="col-lg-11">
                    <div class="text-center mb-4">
                        <h3
                            style="font-family: 'Playfair Display', serif; font-size: 1.8rem; font-weight: 700; color: #0A4F42; margin-bottom: 10px;">
                            <i class="fas fa-headset" style="color: #D4AF37; margin-right: 12px;"></i>Hubungi Kami
                        </h3>
                        <p style="color: #666; font-size: 1rem; max-width: 600px; margin: 0 auto; line-height: 1.7;">
                            Tim kami siap membantu Anda mendapatkan informasi pendaftaran SPMB Tahun Ajaran 2026/2027
                            untuk jenjang <strong>TK, SD, dan SMP</strong>.</p>
                        <p style="color: #888; font-size: 14px; margin-top: 10px;">Pilih kontak sesuai kebutuhan Anda
                            atau hubungi tim kami melalui WhatsApp untuk mendapatkan informasi lebih lanjut.</p>
                    </div>

                    <!-- Contact Cards Grid -->
                    <div class="spmb-contact-grid"
                        style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 25px;">

                        <!-- Bu Ida - Kepala Sekolah -->
                        <div class="spmb-contact-card"
                            style="background: #fff; border-radius: 16px; padding: 25px 20px; text-align: center; box-shadow: 0 8px 30px rgba(0,0,0,0.08); border-top: 4px solid #0A4F42; transition: transform 0.3s ease, box-shadow 0.3s ease;">
                            <div
                                style="width: 55px; height: 55px; background: linear-gradient(135deg, #0A4F42, #0d6b5a); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; box-shadow: 0 4px 12px rgba(10,79,66,0.25);">
                                <i class="fas fa-user-tie" style="color: #fff; font-size: 22px;"></i>
                            </div>
                            <h4 style="color: #333; font-weight: 700; margin-bottom: 4px; font-size: 1rem;">Bu Ida
                            </h4>
                            <span
                                style="display: inline-block; background: linear-gradient(135deg, #0A4F42, #0d6b5a); color: #fff; padding: 3px 12px; border-radius: 10px; font-size: 11px; font-weight: 600; margin-bottom: 10px;">Kepala
                                Sekolah</span>
                            <p style="color: #555; font-size: 14px; margin-bottom: 15px; font-weight: 500;">+62
                                812-8230-7424</p>
                            <a href="https://wa.me/6281282307424" target="_blank"
                                style="display: inline-flex; align-items: center; gap: 8px; background: #25D366; color: #fff; padding: 10px 18px; border-radius: 25px; font-size: 13px; font-weight: 600; text-decoration: none; box-shadow: 0 4px 12px rgba(37,211,102,0.3); transition: background 0.3s ease;">
                                <i class="fab fa-whatsapp" style="font-size: 16px;"></i> Chat WhatsApp
                            </a>
                        </div>

                        <!-- Bu Linda - Admin SMP -->
                        <div class="spmb-contact-card"
                            style="background: #fff; border-radius: 16px; padding: 25px 20px; text-align: center; box-shadow: 0 8px 30px rgba(0,0,0,0.08); border-top: 4px solid #1B4F72; transition: transform 0.3s ease, box-shadow 0.3s ease;">
                            <div
                                style="width: 55px; height: 55px; background: linear-gradient(135deg, #1B4F72, #2874A6); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; box-shadow: 0 4px 12px rgba(27,79,114,0.25);">
                                <i class="fas fa-user-graduate" style="color: #fff; font-size: 22px;"></i>
                            </div>
                            <h4 style="color: #333; font-weight: 700; margin-bottom: 4px; font-size: 1rem;">Bu Linda
                            </h4>
                            <span
                                style="display: inline-block; background: linear-gradient(135deg, #1B4F72, #2874A6); color: #fff; padding: 3px 12px; border-radius: 10px; font-size: 11px; font-weight: 600; margin-bottom: 10px;">Admin
                                SMP</span>
                            <p style="color: #555; font-size: 14px; margin-bottom: 15px; font-weight: 500;">+62
                                812-8525-7593</p>
                            <a href="https://wa.me/6281285257593" target="_blank"
                                style="display: inline-flex; align-items: center; gap: 8px; background: #25D366; color: #fff; padding: 10px 18px; border-radius: 25px; font-size: 13px; font-weight: 600; text-decoration: none; box-shadow: 0 4px 12px rgba(37,211,102,0.3); transition: background 0.3s ease;">
                                <i class="fab fa-whatsapp" style="font-size: 16px;"></i> Chat WhatsApp
                            </a>
                        </div>

                        <!-- Bu Sofi - Admin SD -->
                        <div class="spmb-contact-card"
                            style="background: #fff; border-radius: 16px; padding: 25px 20px; text-align: center; box-shadow: 0 8px 30px rgba(0,0,0,0.08); border-top: 4px solid #32B768; transition: transform 0.3s ease, box-shadow 0.3s ease;">
                            <div
                                style="width: 55px; height: 55px; background: linear-gradient(135deg, #32B768, #5EDC8A); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; box-shadow: 0 4px 12px rgba(50,183,104,0.25);">
                                <i class="fas fa-chalkboard-teacher" style="color: #fff; font-size: 22px;"></i>
                            </div>
                            <h4 style="color: #333; font-weight: 700; margin-bottom: 4px; font-size: 1rem;">Bu Sofi
                            </h4>
                            <span
                                style="display: inline-block; background: linear-gradient(135deg, #32B768, #5EDC8A); color: #fff; padding: 3px 12px; border-radius: 10px; font-size: 11px; font-weight: 600; margin-bottom: 10px;">Admin
                                SD</span>
                            <p style="color: #555; font-size: 14px; margin-bottom: 15px; font-weight: 500;">+62
                                896-3739-2574</p>
                            <a href="https://wa.me/6289637392574" target="_blank"
                                style="display: inline-flex; align-items: center; gap: 8px; background: #25D366; color: #fff; padding: 10px 18px; border-radius: 25px; font-size: 13px; font-weight: 600; text-decoration: none; box-shadow: 0 4px 12px rgba(37,211,102,0.3); transition: background 0.3s ease;">
                                <i class="fab fa-whatsapp" style="font-size: 16px;"></i> Chat WhatsApp
                            </a>
                        </div>

                        <!-- Bu Eva - Admin SMP -->
                        <div class="spmb-contact-card"
                            style="background: #fff; border-radius: 16px; padding: 25px 20px; text-align: center; box-shadow: 0 8px 30px rgba(0,0,0,0.08); border-top: 4px solid #D4940A; transition: transform 0.3s ease, box-shadow 0.3s ease;">
                            <div
                                style="width: 55px; height: 55px; background: linear-gradient(135deg, #D4940A, #E6A800); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; box-shadow: 0 4px 12px rgba(212,148,10,0.25);">
                                <i class="fas fa-user" style="color: #fff; font-size: 22px;"></i>
                            </div>
                            <h4 style="color: #333; font-weight: 700; margin-bottom: 4px; font-size: 1rem;">Bu Eva
                            </h4>
                            <span
                                style="display: inline-block; background: linear-gradient(135deg, #D4940A, #E6A800); color: #fff; padding: 3px 12px; border-radius: 10px; font-size: 11px; font-weight: 600; margin-bottom: 10px;">Admin
                                SMP</span>
                            <p style="color: #555; font-size: 14px; margin-bottom: 15px; font-weight: 500;">+62
                                857-2336-3762</p>
                            <a href="https://wa.me/6285723363762" target="_blank"
                                style="display: inline-flex; align-items: center; gap: 8px; background: #25D366; color: #fff; padding: 10px 18px; border-radius: 25px; font-size: 13px; font-weight: 600; text-decoration: none; box-shadow: 0 4px 12px rgba(37,211,102,0.3); transition: background 0.3s ease;">
                                <i class="fab fa-whatsapp" style="font-size: 16px;"></i> Chat WhatsApp
                            </a>
                        </div>
                    </div>

                    <!-- Email Section -->
                    <div class="spmb-email"
                        style="text-align: center; padding: 20px; background: linear-gradient(135deg, rgba(10,79,66,0.08), rgba(10,79,66,0.03)); border-radius: 16px; border: 1px solid rgba(10,79,66,0.1);">
                        <p style="margin: 0; color: #555; font-size: 15px;">
                            <i class="fas fa-envelope"
                                style="color: #0A4F42; margin-right: 10px; font-size: 18px;"></i>
                            <strong style="color: #0A4F42;">Email Resmi Yayasan:</strong>
                            <a href="mailto:yayasan@ypinurulilmi.or.id"
                                style="color: #0A4F42; font-weight: 600; text-decoration: none; font-size: 15px; word-break: break-all;">yayasan@ypinurulilmi.or.id</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </section>
    <!-- END SECTION SPMB PROMOSI -->
    <style>
        /* SPMB Section Styles */
        .spmb-section .spmb-badge {
            display: inline-block;
            letter-spacing: 1.5px;
        }

        .spmb-contact-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.12) !important;
        }

        .spmb-email a:hover {
            text-decoration: underline !important;
        }

        /* Responsive Grid */
        @media (max-width: 1024px) {
            .spmb-contact-grid {
                grid-template-columns: repeat(2, 1fr) !important;
            }
        }

        @media (max-width: 576px) {
            .spmb-contact-grid {
                grid-template-columns: 1fr !important;
            }

            .spmb-section {
                padding: 60px 0 !important;
            }
        }

        /* Existing section styles */
        .kegiatan-section .section-badge,
        .keterangan-section .section-badge {
            display: inline-block;
            background: linear-gradient(135deg, #D4AF37, #e8c864);
            color: #fff;
            padding: 8px 24px;
            border-radius: 30px;
            font-size: 13px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 2px;
            box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
        }

        .kegiatan-section h2,
        .keterangan-section h2 {
            font-family: 'Playfair Display', serif;
            font-size: 2.5rem;
            font-weight: 700;
            color: #0A4F42;
        }

        .kegiatan-section .section-subtitle,
        .keterangan-section .section-subtitle {
            font-size: 1.1rem;
            color: #666;
            max-width: 600px;
            margin: 0 auto;
            line-height: 1.7;
        }

        @media (max-width: 768px) {

            .kegiatan-section,
            .keterangan-section,
            .mars-section {
                padding: 60px 0;
            }

            .kegiatan-section h2,
            .keterangan-section h2 {
                font-size: 2rem;
            }

            .keterangan-section ul li {
                flex-direction: column;
                gap: 10px;
            }

            .mars-lyrics {
                font-size: 15px !important;
            }

            .mars-lyrics .bait {
                margin-bottom: 25px !important;
                padding-bottom: 20px !important;
            }

            .mars-lyrics .penutup {
                font-size: 20px !important;
            }
        }
    </style>



    <section class="ftco-section ftco-consult ftco-no-pt ftco-no-pb" style="background-image: url(images/bg_5.jpg);"
        data-stellar-background-ratio="0.5">
        <div class="container">
            <div class="row justify-content-end">
                <div class="col-md-6 py-5 px-md-5 bg-primary">
                    <div class="heading-section heading-section-white ftco-animate mb-5">
                        <h2 class="mb-4">Hubungi Kami</h2>
                        <p>Ada pertanyaan tentang pendaftaran atau program sekolah? Jangan ragu untuk menghubungi kami.
                        </p>
                    </div>
                    <form id="hubungiKamiForm" class="appointment-form ftco-animate">
                        <div class="d-md-flex">
                            <div class="form-group">
                                <input type="text" name="first_name" class="form-control"
                                    placeholder="Nama Lengkap" required>
                            </div>
                            <div class="form-group ml-md-4">
                                <input type="text" name="last_name" class="form-control"
                                    placeholder="Last Name">
                            </div>
                        </div>
                        <div class="d-md-flex">
                            <div class="form-group">
                                <div class="form-field">
                                    <div class="select-wrap">
                                        <div class="icon"><span class="fas fa-chevron-down"></span></div>
                                        <select name="program" id="programSelect" class="form-control" required>
                                            <option value="">Pilih Program</option>
                                            <option value="TKIT Nurul Ilmi">TKIT Nurul Ilmi</option>
                                            <option value="SDIT Nurul Ilmi">SDIT Nurul Ilmi</option>
                                            <option value="SMPIT Nurul Ilmi">SMPIT Nurul Ilmi</option>
                                            <option value="Program Tahfidz">Program Tahfidz</option>
                                            <option value="Ekstrakurikuler">Ekstrakurikuler</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div class="form-group ml-md-4">
                                <input type="tel" name="phone" class="form-control"
                                    placeholder="Nomor Telepon" required>
                            </div>
                        </div>
                        <div class="d-md-flex">
                            <div class="form-group">
                                <textarea name="message" id="messageInput" cols="30" rows="2" class="form-control"
                                    placeholder="Pesan"></textarea>
                            </div>
                            <div class="form-group ml-md-4">
                                <button type="submit" id="submitBtn" class="btn btn-secondary py-3 px-4"><span
                                        id="btnText">Kirim Pesan</span><span id="btnSpinner"
                                        class="spinner-border spinner-border-sm ml-2" role="status"
                                        aria-hidden="true" style="display: none;"></span></button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </section>
    <section class="ftco-section" style="background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);">
        <div class="container">
            <div class="row justify-content-center mb-5 pb-2">
                <div class="col-md-8 text-center">
                    <span class="jenjang-badge">Biaya Pendidikan</span>
                    <h2 class="mt-4 mb-3">Biaya <span style="color: #D4AF37;">Pendidikan</span> TA 2027-2028</h2>
                    <p class="section-subtitle">YPI Nurul Ilmi menyediakan pendidikan Islam berkualitas dengan biaya
                        terjangkau untuk berbagai kalangan.</p>
                </div>
            </div>

            <!-- Note Confirmation -->
            <div class="row mb-4" data-aos="fade-up">
                <div class="col-12 text-center">
                    <div
                        style="background: #FFF3E0; border: 1px solid #FFB74D; border-radius: 12px; padding: 15px 20px; max-width: 700px; margin: 0 auto 30px;">
                        <p style="margin: 0; font-size: 13px; color: #E65100;"><i class="fas fa-clock"
                                style="color: #E65100; margin-right: 8px;"></i> <strong>Tarif TA 2027-2028</strong>
                            beberapa unit masih dalam tahap konfirmasi. Silakan hubungi kami untuk informasi terbaru.
                        </p>
                    </div>
                </div>
            </div>

            <!-- All Pricing Cards - Unified 3-column grid -->
            <div class="row justify-content-center">
                <!-- TK Sigma -->
                <div class="col-lg-4 col-md-6 mb-4" data-aos="fade-up" data-aos-delay="50">
                    <div class="pricing-preview-card"
                        style="background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 15px 50px rgba(0,0,0,0.1); border-top: 5px solid #D4940A;">
                        <div
                            style="background: linear-gradient(135deg, #D4940A, #F5C518); padding: 20px 25px; text-align: center; color: #fff; position: relative;">
                            <span
                                style="position: absolute; top: 10px; right: 10px; background: #fff; color: #D4940A; padding: 3px 12px; border-radius: 15px; font-size: 10px; font-weight: 700;">PAUD</span>
                            <span
                                style="display: inline-block; background: rgba(255,255,255,0.25); padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: 700; margin-bottom: 5px;">TK
                                Sigma</span>
                            <h3 style="margin: 0; font-size: 1.2rem;">Taman Kanak-Kanak Islam Terpadu</h3>
                            <p style="margin: 5px 0 0; font-size: 12px; opacity: 0.9;">Berdiri sejak 2013</p>
                        </div>
                        <div style="padding: 20px 25px; text-align: center;">
                            <p style="font-size: 12px; color: #666; margin-bottom: 10px;">Total Biaya Pendaftaran &
                                Pengembangan</p>
                            <h2 style="color: #D4940A; font-weight: 700; font-size: 1.8rem; margin-bottom: 5px;">
                                Rp3.500.000</h2>
                            <p style="font-size: 11px; color: #999; margin-bottom: 5px;"><em>Termasuk seragam 4 stel +
                                    buku paket + kegiatan 1 tahun</em></p>
                            <p style="font-size: 13px; color: #666; margin-bottom: 15px;">SPP bulanan</p>
                            <h3 style="color: #D4940A; font-weight: 700; font-size: 1.4rem; margin-bottom: 15px;">
                                Rp390.000 <span style="font-size: 11px; font-weight: 400; color: #666;">/bulan</span>
                            </h3>
                            <a href="{{ route('tk-sigma') }}" class="btn"
                                style="display: inline-block; background: linear-gradient(135deg, #D4940A, #E6A800); color: #fff; padding: 10px 25px; border-radius: 25px; font-weight: 600; text-decoration: none; font-size: 13px;">Lihat
                                Informasi TK Sigma</a>
                        </div>
                    </div>
                </div>

                <!-- Daycare Sigma -->
                <div class="col-lg-4 col-md-6 mb-4" data-aos="fade-up" data-aos-delay="100">
                    <div class="pricing-preview-card"
                        style="background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 15px 50px rgba(0,0,0,0.1); border-top: 5px solid #F5C518;">
                        <div
                            style="background: linear-gradient(135deg, #F5C518, #FFD54F); padding: 20px 25px; text-align: center; color: #fff; position: relative;">
                            <span
                                style="position: absolute; top: 10px; right: 10px; background: #fff; color: #D4940A; padding: 3px 12px; border-radius: 15px; font-size: 10px; font-weight: 700;">DAYCARE</span>
                            <span
                                style="display: inline-block; background: rgba(255,255,255,0.25); padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: 700; margin-bottom: 5px;">Daycare
                                Sigma</span>
                            <h3 style="margin: 0; font-size: 1.2rem;">Layanan Penitipan Anak Usia 2-6 Tahun</h3>
                            <p style="margin: 5px 0 0; font-size: 12px; opacity: 0.9;">Senin-Jumat, 07.00-17.00 WIB
                            </p>
                        </div>
                        <div style="padding: 20px 25px; text-align: center;">
                            <div
                                style="display: flex; justify-content: center; gap: 15px; flex-wrap: wrap; margin-bottom: 15px;">
                                <div style="flex: 1; min-width: 120px;">
                                    <p style="font-size: 11px; color: #666; margin-bottom: 3px;">Full Day</p>
                                    <p style="font-size: 13px; color: #D4940A; font-weight: 700;">Rp1.500.000<span
                                            style="font-weight: 400; color: #999; font-size: 11px;">/bln</span></p>
                                </div>
                                <div
                                    style="flex: 1; min-width: 120px; border-left: 1px solid #eee; padding-left: 15px;">
                                    <p style="font-size: 11px; color: #666; margin-bottom: 3px;">Half Day</p>
                                    <p style="font-size: 13px; color: #D4940A; font-weight: 700;">Rp900.000<span
                                            style="font-weight: 400; color: #999; font-size: 11px;">/bln</span></p>
                                </div>
                                <div
                                    style="flex: 1; min-width: 100px; border-left: 1px solid #eee; padding-left: 15px;">
                                    <p style="font-size: 11px; color: #666; margin-bottom: 3px;">Harian</p>
                                    <p style="font-size: 13px; color: #D4940A; font-weight: 700;">Rp100.000<span
                                            style="font-weight: 400; color: #999; font-size: 11px;">/hari</span></p>
                                </div>
                            </div>
                            <p style="font-size: 11px; color: #999; margin-bottom: 15px;"><em>Biaya sudah termasuk
                                    makan 2x + snack 1x</em></p>
                            <a href="{{ route('daycare-sigma') }}" class="btn"
                                style="display: inline-block; background: linear-gradient(135deg, #F5C518, #FFD54F); color: #fff; padding: 10px 25px; border-radius: 25px; font-weight: 600; text-decoration: none; font-size: 13px;">Lihat
                                Paket Daycare</a>
                        </div>
                    </div>
                </div>

                <!-- TKIT Nurul Ilmi -->
                <div class="col-lg-4 col-md-6 mb-4" data-aos="fade-up" data-aos-delay="150">
                    <div class="pricing-preview-card"
                        style="background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 15px 50px rgba(0,0,0,0.1); border-top: 5px solid #FF7043;">
                        <div
                            style="background: linear-gradient(135deg, #FF7043, #FFA726); padding: 25px; text-align: center; color: #fff;">
                            <span
                                style="display: inline-block; background: rgba(255,255,255,0.2); padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: 700; margin-bottom: 10px;">TKIT</span>
                            <h3 style="margin: 0; font-size: 1.3rem;">TKIT Nurul Ilmi</h3>
                            <p style="margin: 5px 0 0; font-size: 13px; opacity: 0.9;">Taman Kanak-Kanak Islam Terpadu
                            </p>
                        </div>
                        <div style="padding: 25px; text-align: center;">
                            <p style="font-size: 13px; color: #666; margin-bottom: 15px;">Total Biaya Pendaftaran</p>
                            <h2 style="color: #FF7043; font-weight: 700; font-size: 2rem; margin-bottom: 5px;">
                                Rp3.990.000</h2>
                            <p style="font-size: 12px; color: #999; margin-bottom: 20px;">SPP Rp290.000/bulan</p>
                            <a href="pricing.html#tkit" class="btn"
                                style="display: inline-block; background: linear-gradient(135deg, #FF7043, #FFA726); color: #fff; padding: 12px 30px; border-radius: 30px; font-weight: 600; text-decoration: none;">Lihat
                                Rincian</a>
                        </div>
                    </div>
                </div>

                <!-- SDIT Nurul Ilmi -->
                <div class="col-lg-4 col-md-6 mb-4" data-aos="fade-up" data-aos-delay="200">
                    <div class="pricing-preview-card"
                        style="background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 15px 50px rgba(0,0,0,0.1); border-top: 5px solid #0A4F42;">
                        <div
                            style="background: linear-gradient(135deg, #0A4F42, #0d6b5a); padding: 25px; text-align: center; color: #fff; position: relative;">
                            <span
                                style="position: absolute; top: 10px; right: 10px; background: #D4AF37; color: #fff; padding: 3px 12px; border-radius: 15px; font-size: 10px; font-weight: 700;">TERPOPULER</span>
                            <span
                                style="display: inline-block; background: rgba(255,255,255,0.2); padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: 700; margin-bottom: 10px;">SDIT</span>
                            <h3 style="margin: 0; font-size: 1.3rem;">SDIT Nurul Ilmi</h3>
                            <p style="margin: 5px 0 0; font-size: 13px; opacity: 0.9;">Sekolah Dasar Islam Terpadu</p>
                        </div>
                        <div style="padding: 25px; text-align: center;">
                            <p style="font-size: 13px; color: #666; margin-bottom: 15px;">Total Biaya Pendaftaran</p>
                            <h2 style="color: #0A4F42; font-weight: 700; font-size: 2rem; margin-bottom: 5px;">
                                Rp8.240.000</h2>
                            <p style="font-size: 12px; color: #999; margin-bottom: 20px;">SPP Rp390.000/bulan</p>
                            <a href="pricing.html#sdit" class="btn"
                                style="display: inline-block; background: linear-gradient(135deg, #0A4F42, #0d6b5a); color: #fff; padding: 12px 30px; border-radius: 30px; font-weight: 600; text-decoration: none;">Lihat
                                Rincian</a>
                        </div>
                    </div>
                </div>

                <!-- SMPIT Nurul Ilmi -->
                <div class="col-lg-4 col-md-6 mb-4" data-aos="fade-up" data-aos-delay="250">
                    <div class="pricing-preview-card"
                        style="background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 15px 50px rgba(0,0,0,0.1); border-top: 5px solid #1B4F72;">
                        <div
                            style="background: linear-gradient(135deg, #1B4F72, #2874A6); padding: 25px; text-align: center; color: #fff;">
                            <span
                                style="display: inline-block; background: rgba(255,255,255,0.2); padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: 700; margin-bottom: 10px;">SMPIT</span>
                            <h3 style="margin: 0; font-size: 1.3rem;">SMPIT Nurul Ilmi</h3>
                            <p style="margin: 5px 0 0; font-size: 13px; opacity: 0.9;">Sekolah Menengah Pertama Islam
                                Terpadu</p>
                        </div>
                        <div style="padding: 25px; text-align: center;">
                            <p style="font-size: 13px; color: #666; margin-bottom: 15px;">Total Biaya Pendaftaran</p>
                            <h2 style="color: #1B4F72; font-weight: 700; font-size: 2rem; margin-bottom: 5px;">
                                Rp8.540.000</h2>
                            <p style="font-size: 12px; color: #999; margin-bottom: 20px;">SPP Rp390.000/bulan</p>
                            <a href="pricing.html#smpit" class="btn"
                                style="display: inline-block; background: linear-gradient(135deg, #1B4F72, #2874A6); color: #fff; padding: 12px 30px; border-radius: 30px; font-weight: 600; text-decoration: none;">Lihat
                                Rincian</a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Bottom Note -->
            <div class="row mt-4" data-aos="fade-up">
                <div class="col-12 text-center">
                    <div
                        style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 15px; padding: 20px; max-width: 700px; margin: 30px auto 0;">
                        <p style="margin: 0; font-size: 14px; color: #856404;"><i class="fas fa-info-circle"
                                style="color: #856404; margin-right: 8px;"></i> <strong>Catatan:</strong> Biaya
                            pendaftaran Rp300.000 berlaku untuk semua jenjang. Biaya masuk dapat dibayarkan lunas atau
                            bertahap sampai dengan April 2027.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="ftco-section bg-light">
        <div class="container">
            <div class="row justify-content-center mb-5 pb-2">
                <div class="col-md-8 text-center heading-section ftco-animate">
                    <h2 class="mb-4"><span>Recent</span> Blog</h2>
                    <p>Separated they live in. A small river named Duden flows by their place and supplies it with the
                        necessary regelialia. It is a paradisematic country</p>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6 col-lg-4 ftco-animate">
                    <div class="blog-entry">
                        <a href="blog-single.html" class="block-20 d-flex align-items-end"
                            style="background-image: url('images/image_1.jpg');">
                            <div class="meta-date text-center p-2">
                                <span class="day">27</span>
                                <span class="mos">January</span>
                                <span class="yr">2019</span>
                            </div>
                        </a>
                        <div class="text bg-white p-4">
                            <h3 class="heading"><a href="#">Skills To Develop Your Child Memory</a></h3>
                            <p>Biaya bulanan untuk seluruh kebutuhan pendidikan dan kegiatan sekolah.</p>
                            <div class="d-flex align-items-center mt-4">
                                <p class="mb-0"><a href="#" class="btn btn-secondary">Read More <span
                                            class="fas fa-arrow-right"></span></a></p>
                                <p class="ml-auto mb-0">
                                    <a href="#" class="mr-2">Admin</a>
                                    <a href="#" class="meta-chat"><span class="fas fa-comment"></span> 3</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6 col-lg-4 ftco-animate">
                    <div class="blog-entry">
                        <a href="blog-single.html" class="block-20 d-flex align-items-end"
                            style="background-image: url('images/image_2.jpg');">
                            <div class="meta-date text-center p-2">
                                <span class="day">27</span>
                                <span class="mos">January</span>
                                <span class="yr">2019</span>
                            </div>
                        </a>
                        <div class="text bg-white p-4">
                            <h3 class="heading"><a href="#">Skills To Develop Your Child Memory</a></h3>
                            <p>Biaya bulanan untuk seluruh kebutuhan pendidikan dan kegiatan sekolah.</p>
                            <div class="d-flex align-items-center mt-4">
                                <p class="mb-0"><a href="#" class="btn btn-secondary">Read More <span
                                            class="fas fa-arrow-right"></span></a></p>
                                <p class="ml-auto mb-0">
                                    <a href="#" class="mr-2">Admin</a>
                                    <a href="#" class="meta-chat"><span class="fas fa-comment"></span> 3</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6 col-lg-4 ftco-animate">
                    <div class="blog-entry">
                        <a href="blog-single.html" class="block-20 d-flex align-items-end"
                            style="background-image: url('images/image_3.jpg');">
                            <div class="meta-date text-center p-2">
                                <span class="day">27</span>
                                <span class="mos">January</span>
                                <span class="yr">2019</span>
                            </div>
                        </a>
                        <div class="text bg-white p-4">
                            <h3 class="heading"><a href="#">Skills To Develop Your Child Memory</a></h3>
                            <p>Biaya bulanan untuk seluruh kebutuhan pendidikan dan kegiatan sekolah.</p>
                            <div class="d-flex align-items-center mt-4">
                                <p class="mb-0"><a href="#" class="btn btn-secondary">Read More <span
                                            class="fas fa-arrow-right"></span></a></p>
                                <p class="ml-auto mb-0">
                                    <a href="#" class="mr-2">Admin</a>
                                    <a href="#" class="meta-chat"><span class="fas fa-comment"></span> 3</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="ftco-gallery">
        <div class="container-wrap">
            <div class="row no-gutters">
                <div class="col-md-3 ftco-animate">
                    <a href="images/image_1.jpg" class="gallery image-popup img d-flex align-items-center"
                        style="background-image: url(images/course-1.jpg);">
                        <div class="icon mb-4 d-flex align-items-center justify-content-center">
                            <span class="fab fa-instagram"></span>
                        </div>
                    </a>
                </div>
                <div class="col-md-3 ftco-animate">
                    <a href="images/image_2.jpg" class="gallery image-popup img d-flex align-items-center"
                        style="background-image: url(images/image_2.jpg);">
                        <div class="icon mb-4 d-flex align-items-center justify-content-center">
                            <span class="fab fa-instagram"></span>
                        </div>
                    </a>
                </div>
                <div class="col-md-3 ftco-animate">
                    <a href="images/image_3.jpg" class="gallery image-popup img d-flex align-items-center"
                        style="background-image: url(images/image_3.jpg);">
                        <div class="icon mb-4 d-flex align-items-center justify-content-center">
                            <span class="fab fa-instagram"></span>
                        </div>
                    </a>
                </div>
                <div class="col-md-3 ftco-animate">
                    <a href="images/image_4.jpg" class="gallery image-popup img d-flex align-items-center"
                        style="background-image: url(images/image_4.jpg);">
                        <div class="icon mb-4 d-flex align-items-center justify-content-center">
                            <span class="fab fa-instagram"></span>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    </section>

    <!-- Toast Notification Container -->
    <div id="toastContainer" class="toast-container"
        style="position: fixed; top: 20px; right: 20px; z-index: 9999;"></div>

    <style>
        /* Toast Notification Styles */
        .custom-toast {
            max-width: 400px;
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            padding: 20px 24px;
            display: flex;
            align-items: flex-start;
            gap: 15px;
            animation: toastSlideIn 0.4s ease forwards;
            margin-bottom: 15px;
            border-left: 5px solid;
        }

        .custom-toast.toast-success {
            border-left-color: #0A4F42;
        }

        .custom-toast.toast-error {
            border-left-color: #e74c3c;
        }

        .custom-toast.toast-exit {
            animation: toastSlideOut 0.3s ease forwards;
        }

        .toast-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .toast-success .toast-icon {
            background: linear-gradient(135deg, #0A4F42, #0d6b5a);
        }

        .toast-error .toast-icon {
            background: linear-gradient(135deg, #e74c3c, #c0392b);
        }

        .toast-icon i {
            color: #fff;
            font-size: 18px;
        }

        .toast-content {
            flex: 1;
        }

        .toast-title {
            font-weight: 700;
            font-size: 15px;
            margin-bottom: 4px;
            color: #333;
        }

        .toast-message {
            font-size: 13px;
            color: #666;
            line-height: 1.5;
            margin: 0;
        }

        .toast-close {
            background: none;
            border: none;
            color: #999;
            cursor: pointer;
            padding: 0;
            font-size: 18px;
            line-height: 1;
            transition: color 0.2s;
        }

        .toast-close:hover {
            color: #333;
        }

        @keyframes toastSlideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }

            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes toastSlideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }

            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }

        .form-control.is-invalid {
            border-color: #e74c3c;
        }

        #submitBtn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }

        @media (max-width: 768px) {
            .custom-toast {
                max-width: calc(100% - 40px);
                margin-left: 20px;
                margin-right: 20px;
            }
        }
    </style>


@endsection

@section('scripts')
    <script src="{{ asset('landingPage/js/fasilitas-gallery.js') }}"></script>
    <script>
        window.NIGaleri.initFasilitas({
            cardsSelector: '.fasilitas-section .ni-fas-card',
            theme: 'green',
            data: {
                'kelas-ac': {
                    title: 'Ruang Kelas AC',
                    desc: 'Fasilitas belajar yang nyaman dan mendukung pembelajaran optimal.',
                    photos: [
                        { src: '{{ asset('landingPage/images/kelas.jpeg') }}', alt: 'Ruang Kelas AC', caption: 'Ruang Kelas AC' }
                    ]
                },
                'one-gate': {
                    title: 'One Gate System',
                    desc: 'Satu pintu masuk terkendali untuk keamanan dan keteraturan area sekolah.',
                    photos: [
                        { src: '{{ asset('landingPage/images/idcard.jpeg') }}', alt: 'Akses kontrol kartu', caption: 'One Gate System' }
                    ]
                },
                masjid: {
                    title: 'Masjid Nurul Ilmi',
                    desc: 'Tempat ibadah dan kegiatan keagamaan bagi peserta didik.',
                    photos: [
                        { src: '{{ asset('landingPage/images/7227fbba-604b-439f-bcf4-2ac4a64e04ca.jpg') }}', alt: 'Masjid Nurul Ilmi', caption: 'Masjid Nurul Ilmi' }
                    ]
                },
                kantin: {
                    title: 'Kantin Sekolah',
                    desc: 'Area kantin yang melayani warga sekolah.',
                    photos: [
                        { src: '{{ asset('landingPage/images/kantin.jpeg') }}', alt: 'Kantin Sekolah', caption: 'Kantin Sekolah' }
                    ]
                },
                'sarana-olahraga': {
                    title: 'Sarana Olahraga',
                    desc: 'Lapangan sekolah untuk kegiatan olahraga dan aktivitas bersama.',
                    photos: [
                        { src: '{{ asset('landingPage/images/lapangan.jpeg') }}', alt: 'Lapangan sekolah', caption: 'Sarana Olahraga' }
                    ]
                },
                'musik-tari': {
                    title: 'Sarana Musik & Tari',
                    desc: 'Instrumen dan ruang latihan untuk mengembangkan bakat seni peserta didik.',
                    photos: [
                        { src: '{{ asset('landingPage/images/WhatsApp Image 2026-08-22 at 15.12.08.jpeg') }}', alt: 'Sarana Musik dan Tari', caption: 'Sarana Musik & Tari' }
                    ]
                },
                aula: {
                    title: 'Aula Serba Guna',
                    desc: 'Ruang serbaguna untuk berbagai kegiatan sekolah.',
                    photos: []
                },
                parkir: {
                    title: 'Area Parkir',
                    desc: 'Area parkir kendaraan di lingkungan sekolah.',
                    photos: [
                        { src: '{{ asset('landingPage/images/parkir.jpeg') }}', alt: 'Area Parkir', caption: 'Area Parkir' }
                    ]
                },
                'digital-app': {
                    title: 'Digital Learning App',
                    desc: 'Aplikasi pembelajaran digital untuk SDIT dan SMPIT.',
                    photos: []
                },
                perpustakaan: {
                    title: 'Perpustakaan Digital',
                    desc: 'Fasilitas literasi untuk mendukung kegiatan belajar.',
                    photos: []
                },
                'id-card': {
                    title: 'ID Card & Access Control',
                    desc: 'Kartu identitas dan kontrol akses untuk menjaga keamanan area sekolah.',
                    photos: [
                        { src: '{{ asset('landingPage/images/idcard.jpeg') }}', alt: 'ID Card dan Access Control', caption: 'ID Card & Access Control' }
                    ]
                },
                laboratorium: {
                    title: 'Laboratorium',
                    desc: 'Laboratorium untuk kegiatan belajar dan eksperimen.',
                    photos: [
                        { src: '{{ asset('landingPage/images/lab.JPG') }}', alt: 'Laboratorium sekolah', caption: 'Laboratorium' }
                    ]
                },
                wifi: {
                    title: 'Wifi / Internet',
                    desc: 'Akses internet untuk mendukung pembelajaran digital.',
                    photos: []
                },
                ava: {
                    title: 'Audio Visual Art (AVA)',
                    desc: 'Ruang praktik seni audio visual bagi peserta didik.',
                    photos: []
                },
                'aula-theater': {
                    title: 'Aula Theater',
                    desc: 'Ruang pertunjukan untuk kegiatan seni dan acara sekolah.',
                    photos: []
                },
                'area-bermain': {
                    title: 'Area Bermain',
                    desc: 'Sarana bermain anak yang aman di lingkungan sekolah.',
                    photos: [
                        { src: '{{ asset('landingPage/images/main.jpeg') }}', alt: 'Area Bermain', caption: 'Area Bermain' }
                    ]
                },
                lingkungan: {
                    title: 'Lingkungan Ramah Sekolah',
                    desc: 'Area hijau, kolam ikan, dan suasana bersih yang nyaman untuk seluruh warga sekolah.',
                    photos: [
                        { src: '{{ asset('landingPage/images/kolamikan.jpeg') }}', alt: 'Lingkungan sekolah dan kolam ikan', caption: 'Lingkungan Ramah Sekolah' }
                    ]
                }
            }
        });
    </script>
@endsection
