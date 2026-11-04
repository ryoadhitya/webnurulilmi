<?php

namespace App\Providers;

use App\Models\Article;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        View::composer('landing_page.footer', function ($view): void {
            $footerRows = Article::withCount('comments')->latest()->take(2)->get();

            $view->with('footerRows', $footerRows);
        });
    }
}
