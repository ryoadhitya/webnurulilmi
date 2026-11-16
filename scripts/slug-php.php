<?php
/* ==========================================================================
   PEMBANGUN SLUG LARAVEL UNTUK TES PARITAS
   --------------------------------------------------------------------------
   Membaca daftar kasus (JSON) dari stdin lalu menulis hasil slug Laravel
   sebagai JSON ke stdout.

   Composer di repo ini mensyaratkan PHP >= 8.2 sementara mesin ini hanya
   punya PHP 8.1, jadi autoloader resmi (beserta platform_check.php) tidak
   dipakai. ClassLoader dari Composer dipakai langsung supaya
   voku/portable-ascii (yaitu Str::ascii) tetap termuat.

   Dependensi PHP yang dibutuhkan disalin ke scripts/php-vendor saat source
   Laravel dihapus, sehingga skrip ini tetap bisa dijalankan.

   Algoritma di bawah adalah salinan persis Str::slug() Laravel 12.69.2
   (Illuminate\Support\Str.php baris 1552-1575), sehingga hasilnya sama
   dengan memanggil Str::slug() secara langsung.

   Dipakai oleh scripts/test-slug-parity.mjs.
   ========================================================================== */
$vendor = __DIR__ . '/php-vendor';

require $vendor . '/composer/ClassLoader.php';

$loader = new \Composer\Autoload\ClassLoader();
$loader->addPsr4('voku\\helper\\', $vendor . '/voku/portable-ascii/src/voku/helper');
$loader->register();

use voku\helper\ASCII;

function laravel_ascii($value)
{
    return ASCII::to_ascii((string) $value, 'en', replace_single_chars_only: false);
}

function laravel_lower($value)
{
    return mb_strtolower((string) $value, 'UTF-8');
}

function laravel_slug($title, $separator = '-', $language = 'en', $dictionary = ['@' => 'at'])
{
    $title = $language ? laravel_ascii($title) : $title;

    $flip = $separator === '-' ? '_' : '-';
    $title = preg_replace('![' . preg_quote($flip, '!') . ']+!u', $separator, $title);

    foreach ($dictionary as $key => $value) {
        $dictionary[$key] = $separator . $value . $separator;
    }

    $title = str_replace(array_keys($dictionary), array_values($dictionary), $title);

    $title = preg_replace('![^' . preg_quote($separator, '!') . '\pL\pN\s]+!u', '', laravel_lower($title));
    $title = preg_replace('![' . preg_quote($separator, '!') . '\s]+!u', $separator, $title);

    return trim($title, $separator);
}

$cases = json_decode(stream_get_contents(STDIN), true);
$results = [];

foreach ($cases as $case) {
    $results[] = laravel_slug($case);
}

echo json_encode($results, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
