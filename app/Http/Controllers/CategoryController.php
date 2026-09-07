<?php

namespace App\Http\Controllers;

use App\Http\Requests\CategoryRequest;
use App\Models\Category;

class CategoryController extends Controller
{
    public function store(CategoryRequest $request)
    {
        Category::create($request->validated());

        return back();
    }

    public function update(CategoryRequest $request, Category $category)
    {
        $category->update($request->validated());

        return back();
    }

    public function destroy(Category $category)
    {
        if ($category->expenses()->exists()) {
            return back()->withErrors([
                'category' => 'Move or delete this category’s expenses before deleting it.',
            ]);
        }

        $category->delete();

        return back();
    }
}
