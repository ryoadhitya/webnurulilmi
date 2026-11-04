<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Login Admin · {{ config('app.name', 'Nurul Iman') }}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@500;600;700;800&display=swap" rel="stylesheet">
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="min-h-screen bg-slate-100 text-slate-800 antialiased">
    <main class="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
        <div aria-hidden="true" class="pointer-events-none absolute -left-28 -top-32 h-96 w-96 rounded-full bg-emerald-200/50 blur-3xl"></div>
        <div aria-hidden="true" class="pointer-events-none absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-teal-100/70 blur-3xl"></div>

        <section class="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-2xl shadow-slate-900/10 lg:min-h-[610px] lg:grid-cols-[0.92fr_1.08fr]">
            <aside class="relative hidden flex-col justify-between overflow-hidden bg-emerald-950 p-10 text-white lg:flex xl:p-12" style="background-image: linear-gradient(145deg, #064e3b 0%, #022c22 100%);">
                <div aria-hidden="true" class="absolute -right-24 -top-20 h-72 w-72 rounded-full border-[36px] border-white/[0.04]"></div>
                <div aria-hidden="true" class="absolute -bottom-32 -left-28 h-80 w-80 rounded-full border-[44px] border-white/[0.04]"></div>

                <a href="{{ route('home') }}" class="relative inline-flex items-center gap-3">
                    <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-lg font-extrabold text-emerald-900 shadow-lg shadow-black/10">N</span>
                    <span>
                        <span class="block font-display text-sm font-extrabold tracking-[.12em]">NURUL IMAN</span>
                        <span class="mt-0.5 block text-xs text-emerald-100/70">Panel pengelola</span>
                    </span>
                </a>

                <div class="relative max-w-sm py-12">
                    <span class="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-200">
                        <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M5 4.75h9.5A3.5 3.5 0 0 1 18 8.25v11H8.5A3.5 3.5 0 0 0 5 22V4.75ZM5 18.5A3.5 3.5 0 0 1 8.5 15H18M9 9h5m-5 3h5" />
                        </svg>
                    </span>
                    <p class="text-xs font-bold uppercase tracking-[.2em] text-emerald-200">Ruang pengelola</p>
                    <h1 class="mt-4 font-display text-3xl font-extrabold leading-tight tracking-tight xl:text-4xl">Cerita baik dimulai dari sini.</h1>
                    <p class="mt-4 text-sm leading-7 text-emerald-100/75">Masuk untuk mengelola artikel dan berbagi kabar seputar kegiatan Nurul Ilmi.</p>
                </div>

                <p class="relative text-xs text-emerald-100/55">© {{ date('Y') }} YPI Nurul Ilmi Bekasi</p>
            </aside>

            <div class="flex items-center px-6 py-10 sm:px-10 sm:py-12 lg:px-12 xl:px-16">
                <div class="mx-auto w-full max-w-md">
                    <a href="{{ route('home') }}" class="mb-9 inline-flex items-center gap-3 lg:hidden">
                        <span class="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-800 font-display text-lg font-extrabold text-white">N</span>
                        <span>
                            <span class="block font-display text-sm font-extrabold tracking-tight text-slate-900">NURUL IMAN</span>
                            <span class="block text-xs text-slate-500">Panel pengelola artikel</span>
                        </span>
                    </a>

                    <div class="mb-8">
                        <p class="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">Selamat datang</p>
                        <h2 class="mt-2 font-display text-3xl font-extrabold tracking-tight text-slate-950">Masuk ke dashboard</h2>
                        <p class="mt-3 text-sm leading-6 text-slate-500">Masukkan email dan password akun admin Anda untuk melanjutkan.</p>
                    </div>

                    <form action="{{ route('admin.login.store') }}" method="POST" class="space-y-5">
                        @csrf
                        <div>
                            <label for="email" class="mb-2 block text-sm font-semibold text-slate-700">Alamat email</label>
                            <div class="relative">
                                <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                                    <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">
                                        <rect x="3.5" y="5" width="17" height="14" rx="2.5" />
                                        <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 7 7.5 5.5L19.5 7" />
                                    </svg>
                                </span>
                                <input id="email" name="email" type="email" value="{{ old('email') }}" autocomplete="username" required autofocus class="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-3.5 pl-12 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10 @error('email') border-rose-300 @enderror" placeholder="nama@email.com" aria-describedby="{{ $errors->has('email') ? 'email-error' : '' }}">
                            </div>
                            @error('email')
                                <p id="email-error" class="mt-2 text-sm text-rose-700" role="alert">{{ $message }}</p>
                            @enderror
                        </div>

                        <div>
                            <label for="password" class="mb-2 block text-sm font-semibold text-slate-700">Password</label>
                            <div class="relative">
                                <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                                    <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">
                                        <rect x="4.5" y="10" width="15" height="10.5" rx="2.5" />
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v2.5" />
                                    </svg>
                                </span>
                                <input id="password" name="password" type="password" autocomplete="current-password" required class="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-3.5 pl-12 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10" placeholder="Masukkan password">
                            </div>
                            @error('password')
                                <p class="mt-2 text-sm text-rose-700" role="alert">{{ $message }}</p>
                            @enderror
                        </div>

                        <button type="submit" class="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/15 transition hover:-translate-y-0.5 hover:bg-emerald-900 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-emerald-200">
                            Masuk ke dashboard
                            <svg class="h-4 w-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
                            </svg>
                        </button>
                    </form>

                    <div class="mt-7 border-t border-slate-100 pt-5">
                        <a href="{{ route('home') }}" class="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-emerald-800">
                            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m14.5 5-7 7 7 7M8 12h12" />
                            </svg>
                            Kembali ke halaman utama
                        </a>
                    </div>
                </div>
            </div>
        </section>
    </main>
</body>
</html>
