<?php

namespace App\Http\Controllers;

use App\Http\Requests\ExpenseRequest;
use App\Models\Category;
use App\Models\Expense;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class ExpenseController extends Controller
{
    public function index()
    {
        $expenses = Expense::with('category')
            ->orderByDesc('expense_date')
            ->get();
        $categories = Category::all();
        $monthExpenses = Expense::whereMonth('created_at', now()->month)
            ->with('category')
            ->get();

        $groupCurrencyTotals = function ($items) {
            return $items
                ->groupBy('currency')
                ->map(fn ($expenses, $currency) => [
                    'currency' => $currency,
                    'total' => (float) $expenses->sum('amount'),
                ])
                ->sortBy(fn ($item) => array_search($item['currency'], Expense::CURRENCIES, true))
                ->values();
        };

        $monthExpenseTotalByCategory = $monthExpenses
            ->groupBy('category_id')
            ->map(function ($categoryExpenses) use ($groupCurrencyTotals) {
                $category = $categoryExpenses->first()->category;

                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'totals' => $groupCurrencyTotals($categoryExpenses),
                ];
            })
            ->values();

        return Inertia::render('Dashboard', [
            'expenses' => $expenses,
            'categories' => $categories,
            'monthExpenseTotal' => $groupCurrencyTotals($monthExpenses),
            'monthExpenseTotalCategories' => $monthExpenses->groupBy('category_id'),
            'monthExpenseTotalByCategory' => $monthExpenseTotalByCategory,
        ]);
    }

    public function store(ExpenseRequest $request)
    {
        Expense::create($request->validatedExpense());

        return Redirect::back()->with('message', 'Transacción agregada exitosamente!');
    }

    public function update(ExpenseRequest $request, Expense $expense)
    {
        $expense->update($request->validatedExpense());

        return Redirect::back();
    }

    public function destroy(Expense $expense)
    {
        $expense->delete();

        return Redirect::back();
    }
}
