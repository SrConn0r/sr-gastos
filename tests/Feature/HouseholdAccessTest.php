<?php

use App\Models\Category;
use App\Models\User;

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
