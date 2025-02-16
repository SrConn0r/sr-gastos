<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Expense;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Auth;

class ExpenseController extends Controller
{
    use AuthorizesRequests;

    public function index()
    {
        $expenses = Expense::where('user_id', Auth::id())->get()->sort('expense_date')->paginate(15);

        return Inertia::render('Expenses/Index', [
            'expenses' => $expenses
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
            'expense_date' => date('Y-m-d', strtotime($validated['expense_date'])),
            'category_id' => $validated['category_id']
        ]);

        return back()->with([
            'message' => 'Transacción agregada exitosamente!',
        ], 201);
    }

    public function update(Request $request, Expense $expense)
    {
        $this->authorize('update', $expense);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'expense_date' => 'required|date|before_or_equal:today',
            'category_id' => 'required|exists:categories,id'
        ]);

        $category = Category::findOrFail($validated['category_id']);

        $expense->update($validated);

        return redirect()->back();
    }

    public function destroy(Expense $expense)
    {
        $this->authorize('delete', $expense);

        $expense->delete();

        return redirect()->back();
    }
}
