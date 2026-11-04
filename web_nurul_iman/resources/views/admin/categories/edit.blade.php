@extends('admin.layouts.app')

@section('title', 'Edit Kategori')

@section('content')
	<div class="mx-auto">
		<a href="{{ route('admin.categories.index') }}" class="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-emerald-800">
			<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m15 18-6-6 6-6M9 12h11"/></svg>
			Kembali ke kategori
		</a>
		<div class="mb-6">
			<p class="mb-2 text-xs font-bold uppercase tracking-[.18em] text-emerald-700">Perbarui informasi</p>
			<h1 class="font-display text-3xl font-extrabold tracking-tight text-slate-950">Edit kategori</h1>
			<p class="mt-2 text-sm text-slate-500">Ubah nama kategori. Slug akan diperbarui otomatis.</p>
		</div>

		<form action="{{ route('admin.categories.update', $category) }}" method="POST" class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
			@csrf
			@method('PUT')
			<div class="border-b border-slate-100 px-6 py-5 sm:px-8">
				<h2 class="font-display text-base font-bold text-slate-900">Informasi kategori</h2>
				<p class="mt-1 text-sm text-slate-500">Terakhir diperbarui {{ $category->updated_at?->format('d M Y, H:i') ?? '—' }}.</p>
			</div>
			<div class="space-y-5 px-6 py-7 sm:px-8">
				@if ($errors->any())
					<div role="alert" class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
						<p class="font-bold">Periksa kembali isian berikut:</p>
						<ul class="mt-1 list-inside list-disc space-y-1">@foreach ($errors->all() as $error)<li>{{ $error }}</li>@endforeach</ul>
					</div>
				@endif
				<div>
					<label for="name" class="mb-2 block text-sm font-semibold text-slate-800">Nama kategori <span class="text-rose-600">*</span></label>
					<input id="name" name="name" type="text" value="{{ old('name', $category->name) }}" required maxlength="255" autofocus class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 @error('name') border-rose-400 @enderror">
					@error('name')<p class="mt-2 text-xs font-medium text-rose-700">{{ $message }}</p>@enderror
					<p class="mt-2 text-xs leading-5 text-slate-500">Pastikan nama kategori jelas dan belum digunakan kategori lain.</p>
				</div>
				<div class="rounded-xl bg-slate-50 px-4 py-3">
					<p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Slug saat ini</p>
					<p class="mt-1 break-all font-mono text-sm text-slate-700">{{ $category->slug }}</p>
				</div>
			</div>
			<div class="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
				<a href="{{ route('admin.categories.index') }}" class="inline-flex justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Batal</a>
				<button type="submit" class="inline-flex justify-center rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-200">Simpan perubahan</button>
			</div>
		</form>
	</div>
@endsection
