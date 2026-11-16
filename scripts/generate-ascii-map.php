<?php
/* ==========================================================================
   PEMBANGUN PETA TRANSLITERASI ASCII
   --------------------------------------------------------------------------
   Menghasilkan peta karakter -> ASCII yang PERSIS sama dengan yang dipakai
   Illuminate\Support\Str::ascii() (voku/portable-ascii, bahasa 'en').

   Hasilnya dipakai js/utils.js supaya slugify() menghasilkan nilai yang sama
   dengan Str::slug() Laravel.

   Dipakai oleh scripts/generate-ascii-map.mjs.
   ========================================================================== */
$vendor = __DIR__ . '/php-vendor';

require $vendor . '/composer/ClassLoader.php';

$loader = new \Composer\Autoload\ClassLoader();
$loader->addPsr4('voku\\helper\\', $vendor . '/voku/portable-ascii/src/voku/helper');
$loader->register();

use voku\helper\ASCII;

$map = [];

for ($cp = 0x80; $cp <= 0x2FFFF; $cp++) {
    $char = mb_chr($cp, 'UTF-8');

    if ($char === false || $char === '') {
        continue;
    }

    $ascii = ASCII::to_ascii($char, 'en', true, false, false, false);

    if ($ascii !== '' && $ascii !== $char) {
        $map[$char] = $ascii;
    }
}

echo json_encode($map, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
