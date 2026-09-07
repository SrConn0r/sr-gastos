<?php

namespace App\Http\Controllers;

use App\Http\Requests\ExpenseRequest;
use App\Http\Requests\ExpenseFilterRequest;
use App\Models\Category;
use App\Models\Expense;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class ExpenseController extends Controller
{
    public function index(ExpenseFilterRequest $request)
    {
        $filters = $request->filters();
        $expenses = $this->filteredQuery($filters)->paginate(15)->withQueryString();
        $categories = Category::all();
        $monthExpenses = Expense::whereBetween('expense_date', [
            now()->startOfMonth()->toDateString(),
            now()->endOfMonth()->toDateString(),
        ])
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

        $expensesByCategory = $monthExpenses->groupBy('category_id');
        $monthExpenseTotalByCategory = $categories
            ->map(function ($category) use ($expensesByCategory, $groupCurrencyTotals) {
                $categoryExpenses = $expensesByCategory->get($category->id, collect());
                $budget = $category->budget === null ? null : (float) $category->budget;
                $budgetSpent = (float) $categoryExpenses
                    ->where('currency', $category->budget_currency)
                    ->sum('amount');

                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'budget' => $budget,
                    'budget_currency' => $category->budget_currency,
                    'budget_spent' => $budgetSpent,
                    'remaining_budget' => $budget === null ? null : $budget - $budgetSpent,
                    'totals' => $groupCurrencyTotals($categoryExpenses),
                ];
            })
            ->values();

        return Inertia::render('Dashboard', [
            'expenses' => $expenses,
            'categories' => $categories,
            'monthExpenseTotal' => $groupCurrencyTotals($monthExpenses),
            'monthExpenseTotalByCategory' => $monthExpenseTotalByCategory,
            'filters' => $filters,
        ]);
    }

    public function export(ExpenseFilterRequest $request)
    {
        $expenses = $this->filteredQuery($request->filters());

        return response()->streamDownload(function () use ($expenses) {
            $output = fopen('php://output', 'w');
            fwrite($output, "\xEF\xBB\xBF");
            fputcsv($output, ['Title', 'Amount', 'Currency', 'Expense date', 'Category']);

            foreach ($expenses->lazy(100) as $expense) {
                fputcsv($output, [
                    $expense->title,
                    $expense->amount,
                    $expense->currency,
                    $expense->expense_date->toDateString(),
                    $expense->category->name,
                ]);
            }

            fclose($output);
        }, 'expenses.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
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

    private function filteredQuery(array $filters): Builder
    {
        return Expense::query()
            ->with('category')
            ->when($filters['search'] ?? null, fn (Builder $query, string $search) => $query
                ->where('title', 'like', "%{$search}%"))
            ->when($filters['category'] ?? null, fn (Builder $query, int $category) => $query
                ->where('category_id', $category))
            ->when($filters['currency'] ?? null, fn (Builder $query, string $currency) => $query
                ->where('currency', $currency))
            ->when($filters['date_from'] ?? null, fn (Builder $query, string $date) => $query
                ->whereDate('expense_date', '>=', $date))
            ->when($filters['date_to'] ?? null, fn (Builder $query, string $date) => $query
                ->whereDate('expense_date', '<=', $date))
            ->orderByDesc('expense_date')
            ->orderByDesc('id');
    }
}
