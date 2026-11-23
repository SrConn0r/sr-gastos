<?php

namespace App\Http\Controllers;

use App\Enums\CategoryType;
use App\Enums\Currency;
use App\Models\Category;
use App\Models\RecurringExpense;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        // Currencies are never mixed or converted: charts show one at a time.
        $currency = Currency::tryFrom((string) $request->query('currency')) ?? Currency::COP;
        $thisMonth = now()->startOfMonth();
        $firstMonth = $thisMonth->copy()->subMonths(11);

        // ponytail: aggregates a year of rows in PHP; move to SQL GROUP BY if volume grows past a household.
        $transactions = Transaction::with('category:id,name,type')
            ->whereBetween('date', [$firstMonth->toDateString(), $thisMonth->copy()->endOfMonth()->toDateString()])
            ->get();

        $sum = fn (Collection $items, CategoryType $type): float => (float) $items
            ->filter(fn (Transaction $t) => $t->category->type === $type)
            ->sum('amount');

        $month = $transactions->filter(fn (Transaction $t) => $t->date->gte($thisMonth));

        $totals = collect(Currency::cases())
            ->map(function (Currency $code) use ($month, $sum) {
                $items = $month->where('currency', $code);
                $income = $sum($items, CategoryType::Income);
                $expense = $sum($items, CategoryType::Expense);

                return $items->isEmpty() ? null : [
                    'currency' => $code->value,
                    'income' => $income,
                    'expense' => $expense,
                    'balance' => $income - $expense,
                ];
            })
            ->filter()
            ->values();

        $budgets = Category::where('type', CategoryType::Expense)
            ->whereNotNull('budget')
            ->orderBy('name')
            ->get()
            ->map(fn (Category $category) => [
                'id' => $category->id,
                'name' => $category->name,
                'budget' => (float) $category->budget,
                'currency' => $category->budget_currency->value,
                'spent' => (float) $month
                    ->where('category_id', $category->id)
                    ->where('currency', $category->budget_currency)
                    ->sum('amount'),
            ]);

        $inCurrency = $transactions->where('currency', $currency);

        $expensesByCategory = $inCurrency
            ->filter(fn (Transaction $t) => $t->date->gte($thisMonth) && $t->category->type === CategoryType::Expense)
            ->groupBy('category.name')
            ->map(fn (Collection $items, string $name) => ['category' => $name, 'total' => (float) $items->sum('amount')])
            ->sortByDesc('total')
            ->values();

        $byMonth = $inCurrency->groupBy(fn (Transaction $t) => $t->date->format('Y-m'));
        $monthly = collect(range(11, 0))->map(function (int $monthsAgo) use ($thisMonth, $byMonth, $sum) {
            $key = $thisMonth->copy()->subMonths($monthsAgo)->format('Y-m');
            $items = $byMonth->get($key, collect());

            return [
                'month' => $key,
                'income' => $sum($items, CategoryType::Income),
                'expense' => $sum($items, CategoryType::Expense),
            ];
        });

        // Active bills and subscriptions due this month without a payment recorded this month.
        $pending = RecurringExpense::where('active', true)
            ->withMax('transactions as last_paid_on', 'date')
            ->get()
            ->filter(fn (RecurringExpense $item) => in_array($item->status(), ['pending', 'overdue'], true))
            ->map(fn (RecurringExpense $item) => [
                ...$item->toArray(),
                'due_date' => $item->dueDateIn($thisMonth)?->toDateString(),
                'overdue' => $item->status() === 'overdue',
            ])
            ->sortBy('due_date')
            ->values();

        return Inertia::render('dashboard', [
            'currency' => $currency->value,
            'totals' => $totals,
            'budgets' => $budgets,
            'expensesByCategory' => $expensesByCategory,
            'monthly' => $monthly,
            'pending' => $pending,
            'categories' => Category::where('type', CategoryType::Expense)->orderBy('name')->get(['id', 'name', 'type']),
        ]);
    }
}
