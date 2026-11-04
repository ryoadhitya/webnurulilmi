<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Category;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Stichoza\GoogleTranslate\GoogleTranslate;
use Throwable;

class ArticleAdminController extends Controller
{
    public function index()
    {
        $articles = Article::with(['category', 'tags'])->latest()->paginate(10);
        $totalArticles = Article::count();
        $totalViews = Article::sum('views');

        return view('admin.articles.index', compact('articles', 'totalArticles', 'totalViews'));
    }

    public function create()
    {
        $categories = Category::all();
        $tags = Tag::all();
        return view('admin.articles.create', compact('categories', 'tags'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title_id' => 'required|string|max:255',
            'content_id' => 'required|string',
            'title_en' => 'nullable|string|max:255',
            'content_en' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'author_name' => 'nullable|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,id',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('articles', 'public');
        }

        $tagIds = $validated['tags'] ?? [];
        unset($validated['tags']);
        $validated['author_name'] = $validated['author_name'] ?? 'Admin';
        $article = Article::create($validated);
        $article->tags()->sync($tagIds);

        return redirect()->route('admin.articles.index')->with('success', 'Artikel berhasil disimpan!');
    }

    public function translate(Request $request)
    {
        $validated = $request->validate([
            'title_id' => 'required|string|max:255',
            'content_id' => 'required|string',
        ]);

        try {
            $translator = new GoogleTranslate('en');
            $translator->setSource('id');

            return response()->json([
                'title_en' => $translator->translate($validated['title_id']),
                'content_en' => $translator->translate($validated['content_id']),
            ]);
        } catch (Throwable $exception) {
            return response()->json([
                'message' => 'Terjemahan otomatis gagal. Periksa koneksi internet atau isi terjemahan secara manual.',
            ], 422);
        }
    }

    public function edit(Article $article)
    {
        $categories = Category::all();
        $tags = Tag::all();
        return view('admin.articles.edit', compact('article', 'categories', 'tags'));
    }

    public function update(Request $request, Article $article)
    {
        $validated = $request->validate([
            'title_id' => 'required|string|max:255',
            'content_id' => 'required|string',
            'title_en' => 'nullable|string|max:255',
            'content_en' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'author_name' => 'nullable|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,id',
        ]);

        $imagePath = $article->image;
        if ($request->hasFile('image')) {
            if ($article->image && Storage::disk('public')->exists($article->image)) {
                Storage::disk('public')->delete($article->image);
            }
            $imagePath = $request->file('image')->store('articles', 'public');
        }

        $tagIds = $validated['tags'] ?? [];
        unset($validated['tags']);
        $validated['image'] = $imagePath;
        $validated['author_name'] = $validated['author_name'] ?? $article->author_name;
        $article->update($validated);
        $article->tags()->sync($tagIds);

        return redirect()->route('admin.articles.index')->with('success', 'Artikel berhasil diperbarui!');
    }

    public function destroy(Article $article)
    {
        if ($article->image && Storage::disk('public')->exists($article->image)) {
            Storage::disk('public')->delete($article->image);
        }

        $article->tags()->detach();
        $article->delete();

        return redirect()->route('admin.articles.index')->with('success', 'Artikel berhasil dihapus!');
    }
}
