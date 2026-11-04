<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Panel Admin') · {{ config('app.name', 'Nurul Iman') }}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@500;600;700;800&display=swap" rel="stylesheet">
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="min-h-screen bg-slate-50 text-slate-800 antialiased">
    <div class="min-h-screen lg:flex">
        <aside class="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
            <a href="{{ route('admin.articles.index') }}" class="flex h-20 items-center gap-3 border-b border-slate-100 px-7">
                <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-lg font-bold text-white">N</span>
                <span>
                    <span class="block font-display text-sm font-extrabold tracking-tight text-slate-900">NURUL IMAN</span>
                    <span class="block text-xs text-slate-400">Panel pengelola</span>
                </span>
            </a>
            <div class="px-5 py-7">
                <p class="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">Menu utama</p>
                <a href="{{ route('admin.articles.index') }}" class="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition {{ request()->routeIs('admin.articles.*') ? 'bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-100' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900' }}">
                    <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M7 3.75h7l5 5v11.5H7a2 2 0 0 1-2-2v-12.5a2 2 0 0 1 2-2ZM14 4v5h5M9 13h6M9 16.5h6"/></svg>
                    Artikel
                </a>
                <a href="{{ route('admin.categories.index') }}" class="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition {{ request()->routeIs('admin.categories.*') ? 'bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-100' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900' }}">
                    <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-11ZM8 8h8M8 12h8M8 16h4"/></svg>
                    Kategori artikel
                </a>
                <a href="{{ route('admin.tags.index') }}" class="mt-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition {{ request()->routeIs('admin.tags.*') ? 'bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-100' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900' }}">
                    <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m20 13-7 7-10-10V3h7l10 10ZM7.5 7.5h.01"/></svg>
                    Tag artikel
                </a>
            </div>
            <div class="mt-auto border-t border-slate-100 p-6">
                <div class="rounded-2xl bg-slate-50 p-4">
                    <p class="text-xs font-semibold text-slate-700">Ruang kerja konten</p>
                    <p class="mt-1 text-xs leading-5 text-slate-500">Kelola topik agar artikel tetap tertata.</p>
                </div>
            </div>
        </aside>

        <div class="min-w-0 flex-1">
            <header class="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8">
                <div class="flex items-center gap-3">
                    <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 font-display font-extrabold text-white lg:hidden">N</span>
                    <div>
                        <p class="text-xs font-medium text-slate-400">Admin / Konten</p>
                        <p class="text-sm font-bold text-slate-800">{{ request()->routeIs('admin.articles.*') ? 'Manajemen artikel' : (request()->routeIs('admin.tags.*') ? 'Manajemen tag' : 'Manajemen kategori') }}</p>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <span class="hidden text-xs font-medium text-slate-500 sm:inline">{{ auth()->user()->email }}</span>
                    <form action="{{ route('admin.logout') }}" method="POST">
                        @csrf
                        <button type="submit" class="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700">Keluar</button>
                    </form>
                </div>
            </header>

            <main class="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
                @if (session('success'))
                    <div role="status" class="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm text-emerald-900 shadow-sm">
                        <svg class="mt-0.5 h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m5 12 4 4L19 6"/></svg>
                        <span>{{ session('success') }}</span>
                    </div>
                @endif
                @yield('content')
            </main>
            <footer class="px-5 pb-7 text-center text-xs text-slate-400 sm:px-8">© {{ date('Y') }} {{ config('app.name', 'Nurul Iman') }} · Panel pengelola</footer>
        </div>
    </div>
    @stack('scripts')
</body>
</html>
