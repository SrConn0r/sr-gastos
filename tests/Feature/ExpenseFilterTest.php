<?php

use App\Models\Category;
use App\Models\Expense;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('filters the dashboard and export with the same criteria', function () {
    $user = User::factory()->create();
    $food = Category::create(['name' => 'Food']);
    $travel = Category::create(['name' => 'Travel']);
    Expense::create([
        'title' => 'Lunch', 'amount' => 20, 'currency' => 'USD',
        'expense_date' => '2026-09-01', 'category_id' => $food->id,
    ]);
    Expense::create([
        'title' => 'Taxi', 'amount' => 50000, 'currency' => 'COP',
        'expense_date' => '2026-08-01', 'category_id' => $travel->id,
    ]);
    $query = [
        'search' => 'Lunch',
        'category' => $food->id,
        'currency' => 'USD',
        'date_from' => '2026-09-01',
        'date_to' => '2026-09-30',
    ];

    $this->actingAs($user)
        ->get(route('dashboard', $query))
        ->assertInertia(fn (Assert $page) => $page
            ->has('expenses.data', 1)
            ->where('expenses.data.0.title', 'Lunch')
            ->where('filters.currency', 'USD')
        );

    $response = $this->actingAs($user)
        ->get(route('expenses.export', $query))
        ->assertOk()
        ->assertHeader('content-type', 'text/csv; charset=UTF-8');

    expect($response->streamedContent())
        ->toContain('Lunch')
        ->not->toContain('Taxi');
});

it('paginates household expenses fifteen at a time', function () {
    $category = Category::create(['name' => 'Food']);

    foreach (range(1, 16) as $number) {
        Expense::create([
            'title' => "Expense {$number}",
            'amount' => $number,
            'currency' => 'COP',
            'expense_date' => '2026-09-07',
            'category_id' => $category->id,
        ]);
    }

    $this->actingAs(User::factory()->create())
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('expenses.data', 15)
            ->where('expenses.last_page', 2)
        );
});
