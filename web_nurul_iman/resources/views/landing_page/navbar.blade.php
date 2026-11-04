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
            <a href="https://wa.me/6285723363762" target="_blank" style="color: #fff; font-weight: 600; font-size: 14px; text-decoration: none;">+62 857-2336-3762 (Bu Ida)</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<nav class="navbar navbar-expand-lg navbar-dark bg-dark ftco_navbar ftco-navbar-light" id="ftco-navbar">
  <div class="container d-flex align-items-center justify-content-between">
    <a class="navbar-brand-container" href="{{ route('home') }}">
      <img src="{{ asset('landingPage/images/logonurulilmi.png') }}" alt="Logo YPI Nurul Ilmi" class="navbar-brand-logo">
      <span class="navbar-brand-text">
        <span class="navbar-brand-title">Yayasan Pendidikan Islam</span>
        <span class="navbar-brand-subtitle">NURUL ILMI BEKASI</span>
      </span>
    </a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#ftco-nav" aria-controls="ftco-nav" aria-expanded="false" aria-label="Toggle navigation">
      <span class="fas fa-bars"></span>
    </button>
    <div class="collapse navbar-collapse" id="ftco-nav">
      <ul class="navbar-nav ml-auto">
        <li class="nav-item {{ request()->routeIs('home') ? 'active' : '' }}"><a href="{{ route('home') }}" class="nav-link pl-0">Home</a></li>
        <li class="nav-item {{ request()->routeIs('about') ? 'active' : '' }}"><a href="{{ route('about') }}" class="nav-link">Tentang Kami</a></li>
        <li class="nav-item {{ request()->routeIs('habituation') ? 'active' : '' }}"><a href="{{ route('habituation') }}" class="nav-link">Pembiasaan Pagi</a></li>
        <li class="nav-item {{ request()->routeIs('program') ? 'active' : '' }}"><a href="{{ route('program') }}" class="nav-link">Program</a></li>
        <li class="nav-item {{ request()->routeIs('pricing') ? 'active' : '' }}"><a href="{{ route('pricing') }}" class="nav-link">Biaya</a></li>
        <li class="nav-item {{ request()->routeIs('articles.*') ? 'active' : '' }}"><a href="{{ route('articles.index') }}" class="nav-link">Artikel</a></li>
         <li class="nav-item dropdown {{ request()->routeIs('tk-sigma', 'daycare-sigma') ? 'active' : '' }}">
              <a href="#" class="nav-link dropdown-toggle" id="unitDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Unit Sigma</a>
              <div class="dropdown-menu" aria-labelledby="unitDropdown">
                <a class="dropdown-item" href="{{ route('tk-sigma') }}"><i class="fas fa-star mr-2" style="color: #D4940A;"></i>TK Sigma</a>
                <a class="dropdown-item" href="{{ route('daycare-sigma') }}"><i class="fas fa-baby mr-2" style="color: #D4940A;"></i>Daycare Sigma</a>
              </div>
            </li>
      </ul>
    </div>
    <div class="navbar-smartschool-logo">
      <img src="{{ asset('landingPage/images/smartschool.png') }}" alt="Smart School" title="Smart School">
    </div>
  </div>
</nav>
<!-- END nav -->