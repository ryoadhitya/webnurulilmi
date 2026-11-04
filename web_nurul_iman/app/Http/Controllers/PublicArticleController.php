<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class PublicArticleController extends Controller
{
    public function home(): View
    {
        $rows = Article::with(['category', 'tags'])->withCount('comments')->latest()->take(3)->get();

        return view('landing_page.front_page', compact('rows'));
    }

    public function index(): View
    {
        $query = Article::with(['category', 'tags'])->withCount('comments')->latest();

        if (request()->filled('kategori')) {
            $query->where('category_id', request('kategori'));
        }

        if (request()->filled('tag')) {
            $query->whereHas('tags', fn ($tagQuery) => $tagQuery->whereKey(request('tag')));
        }

        $rows = $query->paginate(9)->withQueryString();
        $categories = Category::withCount('articles')->orderBy('name')->get();

        return view('landing_page.article', compact('rows', 'categories'));
    }

    public function show(Article $article): View
    {
        $article->increment('views');

        $row = $article->load(['category', 'tags', 'comments' => fn ($query) => $query->latest()]);
        $relatedRows = Article::with(['category', 'tags'])->withCount('comments')
            ->where('id', '!=', $row->getKey())
            ->latest()
            ->take(3)
            ->get();
        $categories = Category::withCount('articles')->orderBy('name')->get();

        return view('landing_page.detail_article', compact('row', 'relatedRows', 'categories'));
    }

    public function storeComment(Request $request, Article $article): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'comment' => 'required|string|max:5000',
        ]);

        $article->comments()->create($validated);

        return redirect()->route('articles.show', $article)->with('comment_success', 'Komentar berhasil dikirim.');
    }
}