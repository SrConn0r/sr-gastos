<?php

use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(fn () => $this->travelTo('2026-11-20 12:00:00'));

it('redirects guests to login', function () {
    $this->get(route('dashboard'))->assertRedirect(route('login'));
});

it('summarizes the current month per currency without mixing them', function () {
    $food = Category::factory()->create(['name' => 'Food', 'budget' => 100, 'budget_currency' => 'COP']);
    $salary = Category::factory()->income()->create(['name' => 'Salary']);

    Transaction::factory()->for($salary)->create(['amount' => 500, 'currency' => 'COP', 'date' => '2026-11-01']);
    Transaction::factory()->for($food)->create(['amount' => 80, 'currency' => 'COP', 'date' => '2026-11-10']);
    Transaction::factory()->for($food)->create(['amount' => 30, 'currency' => 'COP', 'date' => '2026-11-11']);
    Transaction::factory()->for($food)->create(['amount' => 20, 'currency' => 'USD', 'date' => '2026-11-12']);
    Transaction::factory()->for($food)->create(['amount' => 999, 'currency' => 'COP', 'date' => '2026-10-31']);

    $this->actingAs(User::factory()->create())
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('currency', 'COP')
            ->where('totals', [
                ['currency' => 'COP', 'income' => 500, 'expense' => 110, 'balance' => 390],
                ['currency' => 'USD', 'income' => 0, 'expense' => 20, 'balance' => -20],
            ])
            ->where('budgets.0.spent', 110)
            ->where('expensesByCategory', [['category' => 'Food', 'total' => 110]])
            ->has('monthly', 12)
            ->where('monthly.10', ['month' => '2026-10', 'income' => 0, 'expense' => 999])
            ->where('monthly.11', ['month' => '2026-11', 'income' => 500, 'expense' => 110])
        );
});

it('draws the charts in the selected currency', function () {
    $food = Category::factory()->create(['name' => 'Food']);
    Transaction::factory()->for($food)->create(['amount' => 20, 'currency' => 'USD', 'date' => '2026-11-12']);
    Transaction::factory()->for($food)->create(['amount' => 80, 'currency' => 'COP', 'date' => '2026-11-12']);

    $this->actingAs(User::factory()->create())
        ->get(route('dashboard', ['currency' => 'USD']))
        ->assertInertia(fn (Assert $page) => $page
            ->where('currency', 'USD')
            ->where('expensesByCategory', [['category' => 'Food', 'total' => 20]])
        );
});
