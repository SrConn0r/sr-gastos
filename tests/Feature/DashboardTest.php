<?php

use App\Models\Category;
use App\Models\Expense;
use App\Models\User;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;

afterEach(fn () => Carbon::setTestNow());

it('uses expense dates for monthly totals and keeps budget currencies separate', function () {
    Carbon::setTestNow('2026-09-15 12:00:00');
    $category = Category::create([
        'name' => 'Food',
        'budget' => 100,
        'budget_currency' => 'USD',
    ]);

    Expense::create([
        'title' => 'USD meal', 'amount' => 40, 'currency' => 'USD',
        'expense_date' => '2026-09-01', 'category_id' => $category->id,
    ]);
    Expense::create([
        'title' => 'COP meal', 'amount' => 20000, 'currency' => 'COP',
        'expense_date' => '2026-09-02', 'category_id' => $category->id,
    ]);
    Expense::create([
        'title' => 'Old meal', 'amount' => 30, 'currency' => 'USD',
        'expense_date' => '2026-08-31', 'category_id' => $category->id,
    ]);

    $this->actingAs(User::factory()->create())
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('monthExpenseTotal.0.currency', 'COP')
            ->where('monthExpenseTotal.0.total', 20000)
            ->where('monthExpenseTotal.1.currency', 'USD')
            ->where('monthExpenseTotal.1.total', 40)
            ->where('monthExpenseTotalByCategory.0.budget', 100)
            ->where('monthExpenseTotalByCategory.0.budget_currency', 'USD')
            ->where('monthExpenseTotalByCategory.0.budget_spent', 40)
            ->where('monthExpenseTotalByCategory.0.remaining_budget', 60)
            ->where('monthExpenseTotalByCategory.0.totals.0.total', 20000)
            ->where('monthExpenseTotalByCategory.0.totals.1.total', 40)
        );
});
