<?php

use App\Models\Category;
use App\Models\User;

it('rejects unsupported currencies future dates and zero amounts', function () {
    $category = Category::create(['name' => 'Travel']);

    $this->actingAs(User::factory()->create())
        ->post(route('expenses.store'), [
            'title' => 'Flight',
            'amount' => 0,
            'currency' => 'EUR',
            'expense_date' => now()->addDay()->toDateString(),
            'category_id' => $category->id,
        ])
        ->assertSessionHasErrors(['amount', 'currency', 'expense_date']);
});
