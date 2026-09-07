<?php

use App\Models\Category;
use App\Models\Expense;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('redirects guests from the root page to login', function () {
    $this->get('/')->assertRedirect(route('login'));
});

it('does not expose self registration', function () {
    $this->get('/register')->assertNotFound();
    $this->post('/register')->assertNotFound();
});

it('requires authentication to create ledger records', function () {
    $category = Category::create(['name' => 'Food']);

    $this->post(route('expenses.store'), [
        'title' => 'Lunch',
        'amount' => 20,
        'currency' => 'COP',
        'expense_date' => '2026-09-07',
        'category_id' => $category->id,
    ])->assertRedirect(route('login'));
});

it('redirects authenticated users from root to the dashboard', function () {
    $this->actingAs(User::factory()->create())
        ->get('/')
        ->assertRedirect(route('dashboard'));
});

it('shows shared expenses to either household user', function () {
    $user = User::factory()->create();
    $category = Category::create(['name' => 'Food']);
    Expense::create([
        'title' => 'Lunch',
        'amount' => 20,
        'currency' => 'USD',
        'expense_date' => '2026-09-07',
        'category_id' => $category->id,
    ]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('expenses.0.title', 'Lunch')
        );
});
