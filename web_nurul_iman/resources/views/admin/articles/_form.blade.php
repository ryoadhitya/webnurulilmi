@php
	$isEditing = isset($article);
	$selectedTags = old('tags', $isEditing ? $article->tags->pluck('id')->all() : []);
@endphp

<form action="{{ $isEditing ? route('admin.articles.update', $article) : route('admin.articles.store') }}" method="POST" enctype="multipart/form-data" class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
	@csrf
	@if ($isEditing) @method('PUT') @endif
	<div class="border-b border-slate-100 px-6 py-5 sm:px-8"><h2 class="font-display text-base font-bold text-slate-900">Informasi artikel</h2><p class="mt-1 text-sm text-slate-500">Kolom bertanda <span class="text-rose-600">*</span> wajib diisi.</p></div>
	<div class="space-y-7 px-6 py-7 sm:px-8">
		@if ($errors->any())
			<div role="alert" class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"><p class="font-bold">Periksa kembali isian berikut:</p><ul class="mt-1 list-inside list-disc space-y-1">@foreach ($errors->all() as $error)<li>{{ $error }}</li>@endforeach</ul></div>
		@endif

		<div class="grid gap-5 sm:grid-cols-2">
			<div>
				<label for="title_id" class="mb-2 block text-sm font-semibold text-slate-800">Judul bahasa Indonesia <span class="text-rose-600">*</span></label>
				<input id="title_id" name="title_id" type="text" value="{{ old('title_id', $article->title_id ?? '') }}" required maxlength="255" autofocus placeholder="Contoh: Menjaga Keikhlasan dalam Beribadah" class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 @error('title_id') border-rose-400 @enderror">
				@error('title_id')<p class="mt-2 text-xs font-medium text-rose-700">{{ $message }}</p>@enderror
			</div>
			<div>
				<label for="title_en" class="mb-2 block text-sm font-semibold text-slate-800">Judul bahasa Inggris</label>
				<input id="title_en" name="title_en" type="text" value="{{ old('title_en', $article->title_en ?? '') }}" maxlength="255" placeholder="English title (optional)" class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 @error('title_en') border-rose-400 @enderror">
				@error('title_en')<p class="mt-2 text-xs font-medium text-rose-700">{{ $message }}</p>@enderror
			</div>
		</div>

		<div class="grid gap-5 sm:grid-cols-2">
			<div>
				<label for="content_id" class="mb-2 block text-sm font-semibold text-slate-800">Isi artikel bahasa Indonesia <span class="text-rose-600">*</span></label>
				<textarea id="content_id" name="content_id" rows="12" required placeholder="Tuliskan isi artikel..." class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 @error('content_id') border-rose-400 @enderror">{{ old('content_id', $article->content_id ?? '') }}</textarea>
				@error('content_id')<p class="mt-2 text-xs font-medium text-rose-700">{{ $message }}</p>@enderror
			</div>
			<div>
				<div class="mb-2 flex flex-wrap items-center justify-between gap-2"><label for="content_en" class="block text-sm font-semibold text-slate-800">Isi artikel bahasa Inggris</label><button id="translate-article" type="button" class="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"><svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M4 5h10M9 3v2m4 0c-.7 4.1-3.6 7.2-7.5 9M6 9c1.2 1.8 2.7 3.1 4.5 4M13 20l4-9 4 9m-6.5-3h5"/></svg>Terjemahkan otomatis</button></div>
				<textarea id="content_en" name="content_en" rows="12" placeholder="English article content (optional)" class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 @error('content_en') border-rose-400 @enderror">{{ old('content_en', $article->content_en ?? '') }}</textarea>
				@error('content_en')<p class="mt-2 text-xs font-medium text-rose-700">{{ $message }}</p>@enderror
				<p id="translate-status" class="mt-2 min-h-5 text-xs text-slate-500" role="status" aria-live="polite">Terjemahan memakai layanan Google Translate dan memerlukan koneksi internet.</p>
			</div>
		</div>

		<div class="grid gap-5 sm:grid-cols-2">
			<div>
				<label for="category_id" class="mb-2 block text-sm font-semibold text-slate-800">Kategori</label>
				<select id="category_id" name="category_id" class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 @error('category_id') border-rose-400 @enderror">
					<option value="">Tanpa kategori</option>
					@foreach ($categories as $category)<option value="{{ $category->id }}" @selected((string) old('category_id', $article->category_id ?? '') === (string) $category->id)>{{ $category->name }}</option>@endforeach
				</select>
				@error('category_id')<p class="mt-2 text-xs font-medium text-rose-700">{{ $message }}</p>@enderror
			</div>
			<div>
				<label for="author_name" class="mb-2 block text-sm font-semibold text-slate-800">Nama penulis</label>
				<input id="author_name" name="author_name" type="text" value="{{ old('author_name', $article->author_name ?? 'Admin') }}" maxlength="255" placeholder="Admin" class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 @error('author_name') border-rose-400 @enderror">
				@error('author_name')<p class="mt-2 text-xs font-medium text-rose-700">{{ $message }}</p>@enderror
			</div>
		</div>

		<div>
			<p class="mb-3 text-sm font-semibold text-slate-800">Tag artikel</p>
			@if ($tags->isNotEmpty())
				<div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
					@foreach ($tags as $tag)
						<label class="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm transition hover:border-emerald-200 hover:bg-emerald-50/50"><input type="checkbox" name="tags[]" value="{{ $tag->id }}" @checked(in_array($tag->id, (array) $selectedTags)) class="h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-500"><span class="font-medium text-slate-700">{{ $tag->name }}</span></label>
					@endforeach
				</div>
			@else
				<p class="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">Belum ada tag. Kamu bisa menambahkannya dari menu Tag artikel.</p>
			@endif
			@error('tags')<p class="mt-2 text-xs font-medium text-rose-700">{{ $message }}</p>@enderror
			@error('tags.*')<p class="mt-2 text-xs font-medium text-rose-700">{{ $message }}</p>@enderror
		</div>

		<div>
			<label for="image" class="mb-2 block text-sm font-semibold text-slate-800">Gambar artikel</label>
			@if ($isEditing && $article->image)
				<div class="mb-3 flex items-center gap-3"><img src="{{ asset('storage/'.$article->image) }}" alt="Gambar artikel saat ini" class="h-16 w-20 rounded-xl object-cover"><span class="text-xs text-slate-500">Gambar saat ini</span></div>
			@endif
			<input id="image" name="image" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" class="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:text-xs file:font-bold file:text-emerald-800 hover:file:bg-emerald-100 @error('image') border-rose-400 @enderror">
			<p class="mt-2 text-xs leading-5 text-slate-500">Format JPG, PNG, atau WEBP; ukuran maksimal 2 MB. {{ $isEditing ? 'Kosongkan jika tidak ingin mengganti gambar.' : '' }}</p>
			@error('image')<p class="mt-2 text-xs font-medium text-rose-700">{{ $message }}</p>@enderror
		</div>
	</div>
	<div class="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
		<a href="{{ route('admin.articles.index') }}" class="inline-flex justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Batal</a>
		<button type="submit" class="inline-flex justify-center rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-200">{{ $isEditing ? 'Simpan perubahan' : 'Simpan artikel' }}</button>
	</div>
</form>

@push('scripts')
	<script>
		const translateButton = document.getElementById('translate-article');
		translateButton?.addEventListener('click', async () => {
			const title = document.getElementById('title_id').value.trim();
			const content = document.getElementById('content_id').value.trim();
			const status = document.getElementById('translate-status');
			if (!title || !content) {
				status.textContent = 'Isi judul dan artikel bahasa Indonesia sebelum menerjemahkan.';
				status.className = 'mt-2 min-h-5 text-xs font-medium text-rose-700';
				return;
			}

			translateButton.disabled = true;
			translateButton.classList.add('cursor-wait', 'opacity-60');
			status.textContent = 'Sedang menerjemahkan…';
			status.className = 'mt-2 min-h-5 text-xs text-slate-500';
			try {
				const response = await fetch(@json(route('admin.articles.translate')), {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Accept': 'application/json',
						'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
					},
					body: JSON.stringify({ title_id: title, content_id: content }),
				});
				const result = await response.json();
				if (!response.ok) throw new Error(result.message || 'Terjemahan otomatis gagal.');
				document.getElementById('title_en').value = result.title_en;
				document.getElementById('content_en').value = result.content_en;
				status.textContent = 'Terjemahan selesai. Silakan periksa kembali hasilnya sebelum menyimpan.';
				status.className = 'mt-2 min-h-5 text-xs font-medium text-emerald-700';
			} catch (error) {
				status.textContent = error.message || 'Terjadi kesalahan saat menerjemahkan.';
				status.className = 'mt-2 min-h-5 text-xs font-medium text-rose-700';
			} finally {
				translateButton.disabled = false;
				translateButton.classList.remove('cursor-wait', 'opacity-60');
			}
		});
	</script>
@endpush