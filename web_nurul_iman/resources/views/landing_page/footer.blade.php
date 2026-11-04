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
                    <a href="https://wa.me/6285723363762" target="_blank" style="display: flex; align-items: center; color: rgba(255,255,255,0.7); text-decoration: none;">
                      <span class="fab fa-whatsapp" style="color: #25D366; margin-right: 15px; font-size: 16px;"></span>
                      <span>+62 857-2336-3762 (Bu Ida)</span>
                    </a>
                  </li>
                  <li style="margin-bottom: 12px;">
                    <a href="https://wa.me/6281285257593" target="_blank" style="display: flex; align-items: center; color: rgba(255,255,255,0.7); text-decoration: none;">
                      <span class="fab fa-whatsapp" style="color: #25D366; margin-right: 15px; font-size: 16px;"></span>
                      <span>+62 812-8525-7593 (Bu Linda - Admin TK)</span>
                    </a>
                  </li>
                  <li style="margin-bottom: 12px;">
                    <a href="https://wa.me/6289695742700" target="_blank" style="display: flex; align-items: center; color: rgba(255,255,255,0.7); text-decoration: none;">
                      <span class="fab fa-whatsapp" style="color: #25D366; margin-right: 15px; font-size: 16px;"></span>
                      <span>+62 896-9574-2700 (Bu Sofi - Admin SD)</span>
                    </a>
                  </li>
                  <li style="margin-bottom: 12px;">
                    <a href="https://wa.me/6285723363762" target="_blank" style="display: flex; align-items: center; color: rgba(255,255,255,0.7); text-decoration: none;">
                      <span class="fab fa-whatsapp" style="color: #25D366; margin-right: 15px; font-size: 16px;"></span>
                      <span>+62 857-2336-3762 (Bu Eva - Admin SMP)</span>
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
              <h2 class="ftco-heading-2">Artikel Terbaru</h2>
              @forelse ($footerRows as $footerRow)
                <div class="block-21 mb-4 d-flex">
                  <a href="{{ route('articles.show', $footerRow) }}" class="blog-img mr-4" style="background-image: url('{{ $footerRow->image ? asset('storage/'.$footerRow->image) : asset('landingPage/images/image_1.jpg') }}');"></a>
                  <div class="text">
                    <h3 class="heading"><a href="{{ route('articles.show', $footerRow) }}">{{ \Illuminate\Support\Str::limit($footerRow->title_id, 45) }}</a></h3>
                    <div class="meta">
                      <div><a href="{{ route('articles.show', $footerRow) }}"><span class="far fa-calendar"></span> {{ $footerRow->created_at?->translatedFormat('d M Y') }}</a></div>
                      <div><a href="{{ route('articles.show', $footerRow) }}"><span class="fas fa-user"></span> {{ $footerRow->author_name ?: 'Admin' }}</a></div>
                      <div><a href="{{ route('articles.show', $footerRow) }}#komentar"><span class="fas fa-comment"></span> {{ $footerRow->comments_count }}</a></div>
                    </div>
                  </div>
                </div>
              @empty
                <p class="text-white-50">Belum ada artikel.</p>
              @endforelse
            </div>
          </div>
          <div class="col-md-6 col-lg-3">
            <div class="ftco-footer-widget mb-5 ml-md-4">
              <h2 class="ftco-heading-2">Tautan</h2>
              <ul class="list-unstyled">
                <li><a href="{{ route('home') }}"><span class="fas fa-arrow-right mr-2"></span>Home</a></li>
                <li><a href="{{ route('about') }}"><span class="fas fa-arrow-right mr-2"></span>Tentang Kami</a></li>
                <li><a href="{{ route('program') }}"><span class="fas fa-arrow-right mr-2"></span>Program</a></li>
                <li><a href="{{ route('pricing') }}"><span class="fas fa-arrow-right mr-2"></span>Biaya</a></li>
                <li><a href="{{ route('contact') }}"><span class="fas fa-arrow-right mr-2"></span>Hubungi Kami</a></li>
                <li><a href="{{ route('admin.login') }}"><span class="fas fa-arrow-right mr-2"></span>Login Admin</a></li>
              </ul>
            </div>
          </div>
          <div class="col-md-6 col-lg-3">
            <div class="ftco-footer-widget mb-5">
              <h2 class="ftco-heading-2">Berlangganan</h2>
              <form action="#" class="subscribe-form">
                <div class="form-group">
                  <input type="text" class="form-control mb-2 text-center" placeholder="Masukkan email Anda">
                  <input type="submit" value="Berlangganan" class="form-control submit px-3">
                </div>
              </form>
            </div>
            <div class="ftco-footer-widget mb-5">
              <h2 class="ftco-heading-2 mb-0">Hubungi Kami</h2>
              <ul class="ftco-footer-social list-unstyled float-md-left float-lft mt-3">
                <li class="ftco-animate"><a href="#"><span class="fab fa-twitter"></span></a></li>
                <li class="ftco-animate"><a href="#"><span class="fab fa-facebook-f"></span></a></li>
                <li class="ftco-animate"><a href="#"><span class="fab fa-instagram"></span></a></li>
              </ul>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-md-12 text-center">
            <p>Hak Cipta Dilindungi | YPI Nurul Ilmi Bekasi <span class="fas fa-heart" style="color: #e74c3c;"></span> {{ date('Y') }}</p>
          </div>
        </div>
      </div>
    </footer>
