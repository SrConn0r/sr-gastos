<?php

use App\Models\Category;
use App\Models\Expense;
use App\Models\User;

it('stores a budget currency', function () {
    $this->actingAs(User::factory()->create())
        ->post(route('categories.store'), [
            'name' => 'Food',
            'budget' => 500,
            'budget_currency' => 'USD',
        ])
        ->assertSessionHasNoErrors();

    $this->assertDatabaseHas('categories', [
        'name' => 'Food',
        'budget_currency' => 'USD',
    ]);
});

it('rejects deleting a category that has expenses', function () {
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
        ->delete(route('categories.destroy', $category))
        ->assertSessionHasErrors('category');

    $this->assertDatabaseHas('categories', ['id' => $category->id]);
    $this->assertDatabaseHas('expenses', ['category_id' => $category->id]);
});

it('deletes an empty category', function () {
    $category = Category::create(['name' => 'Unused']);

    $this->actingAs(User::factory()->create())
        ->delete(route('categories.destroy', $category))
        ->assertRedirect();

    $this->assertDatabaseMissing('categories', ['id' => $category->id]);
});
