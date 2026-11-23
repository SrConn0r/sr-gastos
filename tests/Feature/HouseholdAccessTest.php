<?php

use App\Models\Transaction;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('redirects the root page to login or dashboard', function () {
    $this->get('/')->assertRedirect(route('login'));

    $this->actingAs(User::factory()->create())->get('/')->assertRedirect(route('dashboard'));
});

it('does not expose self registration', function () {
    $this->get('/register')->assertNotFound();
    $this->post('/register')->assertNotFound();
});

it('requires authentication for ledger routes', function () {
    $this->get(route('transactions.index'))->assertRedirect(route('login'));
    $this->get(route('categories.index'))->assertRedirect(route('login'));
    $this->post(route('transactions.store'))->assertRedirect(route('login'));
});

it('shares every movement between household users', function () {
    $author = User::factory()->create(['name' => 'Ana']);
    Transaction::factory()->for($author)->create(['title' => 'Lunch']);

    $this->actingAs(User::factory()->create())
        ->get(route('transactions.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('transactions.data.0.title', 'Lunch')
            ->where('transactions.data.0.user.name', 'Ana')
        );
});
