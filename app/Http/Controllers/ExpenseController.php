<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Expense;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;

class ExpenseController extends Controller
{
    use AuthorizesRequests;

    public function index()
    {
        $expenses = Expense::where('user_id', Auth::id())->get()->sort('expense_date')->paginate(15);
        $categories = Category::all();

        return Inertia::render('Dashboard', [
            'expenses' => $expenses,
            'categories' => $categories
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'expense_date' => 'required|date',
            'category_id' => 'required|exists:categories,id'
        ]);

        $category = Category::findOrFail($validated['category_id']);

        Expense::create([
            'title' => $validated['title'],
            'amount' => $validated['amount'],
            'expense_date' => $validated['expense_date'],
            'category_id' => $validated['category_id'],
            'user_id' => Auth::id()
        ]);

        return Redirect::back()->with('message', 'Transacción agregada exitosamente!');
    }

    public function update(Request $request, Expense $expense)
    {
        // $this->authorize('update', $expense);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'expense_date' => 'required|date',
            'category_id' => 'required|exists:categories,id'
        ]);

        $category = Category::findOrFail($validated['category_id']);

        $expense->update($validated);

        return Redirect::back();
    }

    public function destroy(Expense $expense)
    {
        // $this->authorize('delete', $expense);

        $expense->delete();

        return Redirect::back();
    }
}
