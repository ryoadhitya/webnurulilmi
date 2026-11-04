@extends('admin.layouts.app')

@section('title', 'Edit Artikel')

@section('content')
	<div class="mx-auto">
		<a href="{{ route('admin.articles.index') }}" class="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-emerald-800">
			<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m15 18-6-6 6-6M9 12h11"/></svg>
			Kembali ke artikel
		</a>
		<div class="mb-6"><p class="mb-2 text-xs font-bold uppercase tracking-[.18em] text-emerald-700">Perbarui konten</p><h1 class="font-display text-3xl font-extrabold tracking-tight text-slate-950">Edit artikel</h1><p class="mt-2 text-sm text-slate-500">Perbarui informasi dan isi artikel “{{ $article->title_id }}”.</p></div>
		@include('admin.articles._form')
	</div>
@endsection