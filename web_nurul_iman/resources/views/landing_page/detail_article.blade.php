@extends('landing_page.layout')

@section('title', $row->title_id . ' - YPI Nurul Ilmi Bekasi')

@section('head')
  <meta name="description" content="{{ \Illuminate\Support\Str::limit(strip_tags($row->content_id), 155) }}">
@endsection

@section('content')

  <section class="hero-wrap hero-wrap-2" style="background-image:url('images/bg_2.jpg')"><div class="overlay"></div><div class="container"><div class="row no-gutters slider-text align-items-center justify-content-center"><div class="col-md-9 ftco-animate text-center"><h1 class="mb-2 bread">Artikel</h1><p class="breadcrumbs"><span class="mr-2"><a href="{{ route('home') }}">Home <i class="fas fa-arrow-right"></i></a></span><span class="mr-2"><a href="{{ route('articles.index') }}">Artikel <i class="fas fa-arrow-right"></i></a></span><span>{{ \Illuminate\Support\Str::limit($row->title_id, 45) }}</span></p></div></div></div></section>

  <section class="ftco-section"><div class="container"><div class="row">
    <main class="col-lg-8 ftco-animate">
      <p class="mb-2 text-muted"><i class="far fa-calendar mr-1"></i>{{ $row->created_at?->translatedFormat('d F Y') }} <span class="mx-2">·</span><i class="fas fa-user mr-1"></i>{{ $row->author_name ?: 'Admin' }} <span class="mx-2">·</span><i class="far fa-eye mr-1"></i>{{ number_format($row->views) }} dibaca</p>
      @if ($row->category)<p><a href="{{ route('articles.index', ['kategori' => $row->category_id]) }}" class="text-success">{{ $row->category->name }}</a></p>@endif
      <h2 class="mb-4">{{ $row->title_id }}</h2>
      @if ($row->image)<p><img src="{{ asset('storage/'.$row->image) }}" alt="{{ $row->title_id }}" class="img-fluid" style="width:100%;max-height:500px;object-fit:cover;border-radius:12px"></p>@endif
      <div class="article-body" style="font-size:17px;line-height:1.9;white-space:pre-line">{{ $row->content_id }}</div>
      @if (filled($row->title_en) || filled($row->content_en))
        <section lang="en" aria-labelledby="article-english-title" class="mt-5 pt-4" style="border-top:2px solid #e9ecef">
          <p class="mb-2" style="color:#0F6A57;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase"><i class="fas fa-language mr-2" aria-hidden="true"></i>English version</p>
          @if (filled($row->title_en))<h2 id="article-english-title" class="mb-4">{{ $row->title_en }}</h2>@endif
          @if (filled($row->content_en))<div class="article-body" style="font-size:17px;line-height:1.9;white-space:pre-line">{{ $row->content_en }}</div>@endif
        </section>
      @endif
      @if ($row->tags->isNotEmpty())<div class="tag-widget post-tag-container mb-5 mt-5"><div class="tagcloud">@foreach ($row->tags as $tag)<a href="{{ route('articles.index', ['tag' => $tag->id]) }}" class="tag-cloud-link">{{ $tag->name }}</a>@endforeach</div></div>@endif

      <div id="komentar" class="pt-4 mt-5">
        <h3 class="mb-4 h4 font-weight-bold">Komentar ({{ $row->comments->count() }})</h3>
        @if (session('comment_success'))<div class="alert alert-success" role="status">{{ session('comment_success') }}</div>@endif
        @if ($errors->any())<div class="alert alert-danger" role="alert"><ul class="mb-0">@foreach ($errors->all() as $error)<li>{{ $error }}</li>@endforeach</ul></div>@endif
        @forelse ($row->comments as $comment)
          <div class="d-flex border-bottom py-4"><div class="mr-3"><span class="d-flex align-items-center justify-content-center rounded-circle text-white" style="width:48px;height:48px;background:#0F6A57;font-weight:700">{{ mb_strtoupper(mb_substr($comment->name, 0, 1)) }}</span></div><div><h3 class="h5 mb-1">{{ $comment->name }}</h3><div class="meta mb-2">{{ $comment->created_at?->translatedFormat('d F Y, H:i') }}</div><p class="mb-0" style="white-space:pre-line">{{ $comment->comment }}</p></div></div>
        @empty
          <p class="text-muted">Belum ada komentar. Jadilah yang pertama berkomentar.</p>
        @endforelse
        <div class="comment-form-wrap pt-5"><h3 class="mb-4 h4 font-weight-bold">Tinggalkan Komentar</h3>
          <form action="{{ route('articles.comments.store', $row) }}" method="POST" class="p-4 p-md-5 bg-light">@csrf
            <div class="form-group"><label for="name">Nama *</label><input type="text" class="form-control @error('name') is-invalid @enderror" id="name" name="name" value="{{ old('name') }}" required maxlength="255">@error('name')<small class="text-danger">{{ $message }}</small>@enderror</div>
            <div class="form-group"><label for="email">Email (opsional)</label><input type="email" class="form-control @error('email') is-invalid @enderror" id="email" name="email" value="{{ old('email') }}" maxlength="255">@error('email')<small class="text-danger">{{ $message }}</small>@enderror</div>
            <div class="form-group"><label for="comment">Komentar *</label><textarea id="comment" name="comment" rows="5" class="form-control @error('comment') is-invalid @enderror" required maxlength="5000">{{ old('comment') }}</textarea>@error('comment')<small class="text-danger">{{ $message }}</small>@enderror</div>
            <button type="submit" class="btn py-3 px-4 btn-primary">Kirim Komentar</button>
          </form>
        </div>
      </div>
    </main>

    <aside class="col-lg-4 sidebar ftco-animate">
      <div class="sidebar-box"><h3>Kategori</h3><ul class="categories">@forelse ($categories as $category)<li><a href="{{ route('articles.index', ['kategori' => $category->id]) }}">{{ $category->name }} <span>({{ $category->articles_count }})</span></a></li>@empty<li>Belum ada kategori</li>@endforelse</ul></div>
      <div class="sidebar-box ftco-animate"><h3>Artikel Lainnya</h3>
        @forelse ($relatedRows as $relatedRow)<div class="block-21 mb-4 d-flex"><a href="{{ route('articles.show', $relatedRow) }}" class="blog-img mr-4" style="background-image:url('{{ $relatedRow->image ? asset('storage/'.$relatedRow->image) : asset('landingPage/images/image_1.jpg') }}')"></a><div class="text"><h3 class="heading"><a href="{{ route('articles.show', $relatedRow) }}">{{ $relatedRow->title_id }}</a></h3><div class="meta"><div><a href="{{ route('articles.show', $relatedRow) }}"><span class="far fa-calendar"></span> {{ $relatedRow->created_at?->translatedFormat('d M Y') }}</a></div><div><a href="{{ route('articles.show', $relatedRow) }}#komentar"><span class="fas fa-comment"></span> {{ $relatedRow->comments_count }}</a></div></div></div></div>@empty<p class="text-muted">Belum ada artikel lain.</p>@endforelse
      </div>
      @if ($row->tags->isNotEmpty())<div class="sidebar-box ftco-animate"><h3>Tag Artikel</h3><div class="tagcloud">@foreach ($row->tags as $tag)<a href="{{ route('articles.index', ['tag' => $tag->id]) }}" class="tag-cloud-link">{{ $tag->name }}</a>@endforeach</div></div>@endif
      <div class="sidebar-box ftco-animate"><h3>Tentang YPI Nurul Ilmi</h3><p>YPI Nurul Ilmi Bekasi menaungi TKIT, SDIT, dan SMPIT Nurul Ilmi di Kedungwaringin, Bekasi.</p></div>
    </aside>
  </div></div></section>

  
@endsection