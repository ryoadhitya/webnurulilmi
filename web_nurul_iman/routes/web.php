<?php

use App\Http\Controllers\AdminLoginController;
use App\Http\Controllers\ArticleAdminController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\PublicArticleController;
use App\Http\Controllers\TagController;
use Illuminate\Support\Facades\Route;

Route::get('/', [PublicArticleController::class, 'home'])->name('home');
Route::view('/tentang-kami', 'landing_page.tentang_kami')->name('about');
Route::view('/pembiasaan-pagi', 'landing_page.pembiasaan_pagi')->name('habituation');
Route::view('/murid-berprestasi', 'landing_page.murid_berprestasi')->name('achievements');
Route::view('/program', 'landing_page.program')->name('program');
Route::view('/biaya', 'landing_page.biaya')->name('pricing');
Route::view('/hubungi-kami', 'landing_page.hubungi_kami')->name('contact');
Route::view('/galeri-fasilitas', 'landing_page.galeri_fasilitas')->name('facilities.gallery');
Route::view('/tk-sigma', 'landing_page.tk_sigma')->name('tk-sigma');
Route::view('/daycare-sigma', 'landing_page.daycare_sigma')->name('daycare-sigma');
Route::get('/artikel', [PublicArticleController::class, 'index'])->name('articles.index');
Route::get('/artikel/{article}', [PublicArticleController::class, 'show'])->name('articles.show');
Route::post('/artikel/{article}/komentar', [PublicArticleController::class, 'storeComment'])->name('articles.comments.store');

Route::name('admin.')->prefix('admin')->group(function () {
    Route::get('login', [AdminLoginController::class, 'create'])->name('login');
    Route::post('login', [AdminLoginController::class, 'store'])->middleware('throttle:5,1')->name('login.store');

    Route::middleware('auth')->group(function () {
        Route::post('logout', [AdminLoginController::class, 'destroy'])->name('logout');
        Route::resource('articles', ArticleAdminController::class)->except('show');
        Route::post('articles/translate', [ArticleAdminController::class, 'translate'])->name('articles.translate');
        Route::resource('categories', CategoryController::class);
        Route::resource('tags', TagController::class)->except('show');
    });
});
