<?php

use App\Models\Category;
use App\Models\Expense;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('stores an expense with the selected currency', function () {
    $category = Category::create(['name' => 'Comida']);

    $this->post(route('expense.public-store'), [
        'title' => 'Almuerzo',
        'amount' => 20,
        'expense_date' => '2026-09-06',
        'category_id' => $category->id,
        'currency' => 'USD',
    ])->assertRedirect();

    $this->assertDatabaseHas('expenses', [
        'title' => 'Almuerzo',
        'currency' => 'USD',
    ]);
});

it('defaults currency to COP when omitted', function () {
    $category = Category::create(['name' => 'Transporte']);

    $this->post(route('expense.public-store'), [
        'title' => 'Taxi',
        'amount' => 15000,
        'expense_date' => '2026-09-06',
        'category_id' => $category->id,
    ])->assertRedirect();

    $this->assertDatabaseHas('expenses', [
        'title' => 'Taxi',
        'currency' => 'COP',
    ]);
});

it('rejects an invalid currency', function () {
    $category = Category::create(['name' => 'Otros']);

    $this->post(route('expense.public-store'), [
        'title' => 'Cafe',
        'amount' => 5,
        'expense_date' => '2026-09-06',
        'category_id' => $category->id,
        'currency' => 'EUR',
    ])->assertSessionHasErrors('currency');
});

it('groups monthly totals by currency without mixing them', function () {
    $user = User::factory()->create();
    $category = Category::create(['name' => 'Mercado']);

    Expense::create([
        'title' => 'Mercado COP',
        'amount' => 25000,
        'expense_date' => now(),
        'category_id' => $category->id,
        'currency' => 'COP',
    ]);

    Expense::create([
        'title' => 'Mercado USD',
        'amount' => 20,
        'expense_date' => now(),
        'category_id' => $category->id,
        'currency' => 'USD',
    ]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard')
            ->where('monthExpenseTotal.0.currency', 'COP')
            ->where('monthExpenseTotal.0.total', 25000)
            ->where('monthExpenseTotal.1.currency', 'USD')
            ->where('monthExpenseTotal.1.total', 20)
            ->where('monthExpenseTotalByCategory.0.totals.0.currency', 'COP')
            ->where('monthExpenseTotalByCategory.0.totals.0.total', 25000)
            ->where('monthExpenseTotalByCategory.0.totals.1.currency', 'USD')
            ->where('monthExpenseTotalByCategory.0.totals.1.total', 20)
        );
});
