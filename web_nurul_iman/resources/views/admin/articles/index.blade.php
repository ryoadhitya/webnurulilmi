@extends('admin.layouts.app')

@section('title', 'Artikel')

@section('content')
	<div class="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
		<div>
			<p class="mb-2 text-xs font-bold uppercase tracking-[.18em] text-emerald-700">Pustaka konten</p>
			<h1 class="font-display text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">Artikel</h1>
			<p class="mt-2 max-w-xl text-sm leading-6 text-slate-500">Tulis, terjemahkan, dan kelola artikel untuk pembaca Nurul Iman.</p>
		</div>
		<a href="{{ route('admin.articles.create') }}" class="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/10 transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-200">
			<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14m-7-7h14"/></svg>
			Tambah artikel
		</a>
	</div>

	<div class="mb-6 grid gap-4 sm:grid-cols-2">
		<section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
			<div class="flex items-center justify-between">
				<div><p class="text-sm font-medium text-slate-500">Total artikel</p><p class="mt-2 font-display text-3xl font-extrabold tracking-tight text-slate-950">{{ number_format($totalArticles) }}</p></div>
				<span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M7 3.75h7l5 5v11.5H7a2 2 0 0 1-2-2v-12.5a2 2 0 0 1 2-2ZM14 4v5h5M9 13h6M9 16.5h6"/></svg></span>
			</div>
		</section>
		<section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
			<div class="flex items-center justify-between">
				<div><p class="text-sm font-medium text-slate-500">Total dibaca</p><p class="mt-2 font-display text-3xl font-extrabold tracking-tight text-slate-950">{{ number_format($totalViews) }}</p></div>
				<span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700"><svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M2.5 12s3.3-6 9.5-6 9.5 6 9.5 6-3.3 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></svg></span>
			</div>
		</section>
	</div>

	<section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
		<div class="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
			<div><h2 class="font-display text-base font-bold text-slate-900">Daftar artikel</h2><p class="mt-1 text-xs text-slate-500">{{ $articles->total() }} artikel tersedia</p></div>
			<label class="relative block w-full sm:max-w-xs">
				<span class="sr-only">Cari artikel di halaman ini</span>
				<svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path stroke-linecap="round" d="m16 16 4.5 4.5"/></svg>
				<input id="article-search" type="search" placeholder="Cari judul atau penulis..." class="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10">
			</label>
		</div>

		<div class="overflow-x-auto">
			<table class="w-full min-w-[850px] text-left text-sm">
				<thead class="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
					<tr><th scope="col" class="px-6 py-3.5">Artikel</th><th scope="col" class="px-6 py-3.5">Kategori &amp; tag</th><th scope="col" class="px-6 py-3.5">Penulis</th><th scope="col" class="px-6 py-3.5">Dibuat</th><th scope="col" class="px-6 py-3.5 text-right">Aksi</th></tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					@forelse ($articles as $article)
						<tr data-article-row data-search="{{ strtolower($article->title_id.' '.$article->title_en.' '.$article->author_name.' '.($article->category?->name ?? '')) }}" class="transition hover:bg-slate-50/70">
							<td class="px-6 py-4">
								<div class="flex items-center gap-3">
									@if ($article->image)
										<img src="{{ asset('storage/'.$article->image) }}" alt="" class="h-14 w-16 shrink-0 rounded-xl object-cover">
									@else
										<span class="flex h-14 w-16 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M7 3.75h7l5 5v11.5H7a2 2 0 0 1-2-2v-12.5a2 2 0 0 1 2-2ZM14 4v5h5M9 13h6M9 16.5h6"/></svg></span>
									@endif
									<div class="min-w-0"><p class="max-w-sm truncate font-semibold text-slate-900">{{ $article->title_id }}</p><p class="mt-1 max-w-sm truncate text-xs text-slate-500">{{ \Illuminate\Support\Str::limit(strip_tags($article->content_id), 100) }}</p></div>
								</div>
							</td>
							<td class="px-6 py-4">
								<p class="font-medium text-slate-700">{{ $article->category?->name ?? 'Tanpa kategori' }}</p>
								<div class="mt-1 flex max-w-xs flex-wrap gap-1">@forelse ($article->tags as $tag)<span class="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">{{ $tag->name }}</span>@empty<span class="text-xs text-slate-400">Tanpa tag</span>@endforelse</div>
							</td>
							<td class="px-6 py-4 text-slate-600">{{ $article->author_name ?: 'Admin' }}</td>
							<td class="px-6 py-4 text-slate-500">{{ $article->created_at?->format('d M Y') ?? '—' }}</td>
							<td class="px-6 py-4"><div class="flex justify-end gap-2">
								<a href="{{ route('admin.articles.edit', $article) }}" class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800" aria-label="Edit artikel {{ $article->title_id }}"><svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m15.5 5.5 3 3M4 20l4.7-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z"/></svg> Edit</a>
								<form action="{{ route('admin.articles.destroy', $article) }}" method="POST" onsubmit="return confirm('Yakin ingin menghapus artikel ini?')">@csrf @method('DELETE')<button type="submit" class="inline-flex items-center gap-1.5 rounded-lg border border-rose-100 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:border-rose-200 hover:bg-rose-50" aria-label="Hapus artikel {{ $article->title_id }}"><svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M4 7h16M10 11v6m4-6v6M5.5 7l1 13h11l1-13M9 7V4h6v3"/></svg> Hapus</button></form>
							</div></td>
						</tr>
					@empty
						<tr><td colspan="5" class="px-6 py-16 text-center">
							<span class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M7 3.75h7l5 5v11.5H7a2 2 0 0 1-2-2v-12.5a2 2 0 0 1 2-2ZM14 4v5h5"/></svg></span>
							<h3 class="mt-4 font-display text-base font-bold text-slate-900">Belum ada artikel</h3><p class="mt-1 text-sm text-slate-500">Buat artikel pertama untuk mulai mengisi pustaka konten.</p><a href="{{ route('admin.articles.create') }}" class="mt-5 inline-flex rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800">Tambah artikel</a>
						</td></tr>
					@endforelse
					<tr id="article-no-results" class="hidden"><td colspan="5" class="px-6 py-10 text-center text-sm text-slate-500">Tidak ada artikel yang cocok di halaman ini.</td></tr>
				</tbody>
			</table>
		</div>
		@if ($articles->hasPages())<div class="border-t border-slate-100 px-5 py-4 sm:px-6">{{ $articles->links() }}</div>@endif
	</section>
@endsection

@push('scripts')
	<script>
		const articleSearch = document.getElementById('article-search');
		articleSearch?.addEventListener('input', (event) => {
			const query = event.target.value.trim().toLowerCase();
			const rows = [...document.querySelectorAll('[data-article-row]')];
			let visibleRows = 0;
			rows.forEach((row) => {
				const matches = row.dataset.search.includes(query);
				row.classList.toggle('hidden', !matches);
				if (matches) visibleRows++;
			});
			document.getElementById('article-no-results')?.classList.toggle('hidden', !rows.length || visibleRows > 0);
		});
	</script>
@endpush
