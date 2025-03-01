<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class CategoryController extends Controller
{
    use AuthorizesRequests;

    public function index()
    {
        $categories = Category::withSum('expenses', 'amount')
            ->get()
            ->map(function ($category) {
                return [
                    ...$category->toArray(),
                    'remaining_budget' => $category->remaining_budget
                ];
            });

        return Inertia::render('Categories/Index', [
            'categories' => $categories
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'budget' => 'nullable|numeric|min:0'
        ]);

        Category::create($validated);

        return redirect()->back();
    }

    public function update(Request $request, Category $category)
    {
        // $this->authorize('update', $category);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'budget' => 'nullable|numeric|min:0'
        ]);

        $category->update($validated);

        return redirect()->back();
    }

    public function destroy(Category $category)
    {
        // $this->authorize('delete', $category);

        $category->delete();

        return redirect()->back();
    }
}
