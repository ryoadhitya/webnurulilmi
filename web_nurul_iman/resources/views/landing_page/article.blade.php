@extends('landing_page.layout')

@section('title', 'Artikel - YPI Nurul Ilmi Bekasi')

@section('content')
  <section class="hero-wrap hero-wrap-2" style="background-image:url('images/bg_2.jpg')"><div class="overlay"></div><div class="container"><div class="row no-gutters slider-text align-items-center justify-content-center"><div class="col-md-9 ftco-animate text-center"><h1 class="mb-2 bread">Artikel</h1><p class="breadcrumbs"><span class="mr-2"><a href="{{ route('home') }}">Home <i class="fas fa-arrow-right"></i></a></span><span>Artikel</span></p></div></div></div></section>
  <section class="ftco-section bg-light"><div class="container">
    <div class="row justify-content-center mb-5 pb-2"><div class="col-md-8 text-center heading-section ftco-animate"><h2 class="mb-4">Artikel <span>Terbaru</span></h2><p>Berita dan informasi terbaru dari YPI Nurul Ilmi Bekasi.</p></div></div>
    @if (request('kategori') || request('tag'))<div class="mb-4 text-center"><a href="{{ route('articles.index') }}" class="btn btn-outline-secondary">Hapus filter <i class="fas fa-times ml-1"></i></a></div>@endif
    <div class="row">
      @forelse ($rows as $row)
        <div class="col-md-6 col-lg-4 ftco-animate d-flex article-card-column"><div class="blog-entry article-card">
          <a href="{{ route('articles.show', $row) }}" class="block-20 d-flex align-items-end" style="background-image:url('{{ $row->image ? asset('storage/'.$row->image) : asset('landingPage/images/image_1.jpg') }}')"><div class="meta-date text-center p-2"><span class="day">{{ $row->created_at?->format('d') }}</span><span class="mos">{{ $row->created_at?->translatedFormat('M') }}</span><span class="yr">{{ $row->created_at?->format('Y') }}</span></div></a>
          <div class="text bg-white p-4">
            <h3 class="heading"><a href="{{ route('articles.show', $row) }}">{{ $row->title_id }}</a></h3><p>{{ \Illuminate\Support\Str::limit(strip_tags($row->content_id), 130) }}</p>
            <div class="d-flex align-items-center mt-4"><p class="mb-0"><a href="{{ route('articles.show', $row) }}" class="btn btn-secondary">Selengkapnya <span class="fas fa-arrow-right"></span></a></p><p class="ml-auto mb-0"><a href="#" class="mr-2"><span class="fas fa-user"></span> {{ $row->author_name ?: 'Admin' }}</a><a href="{{ route('articles.show', $row) }}#komentar" class="meta-chat"><span class="fas fa-comment"></span> {{ $row->comments_count }}</a></p></div>
          </div>
        </div></div>
      @empty
        <div class="col-12 py-5 text-center"><h3>Belum ada artikel</h3><p>Artikel terbaru akan tampil di halaman ini.</p></div>
      @endforelse
    </div>
    @if ($rows->hasPages())<div class="row no-gutters my-5"><div class="col text-center"><div class="block-27">{{ $rows->links() }}</div></div></div>@endif
  </div></section>
@endsection