<?php

use App\Enums\CategoryType;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;

beforeEach(fn () => $this->actingAs(User::factory()->create()));

it('creates an expense category with a monthly budget', function () {
    $this->post(route('categories.store'), [
        'name' => 'Food', 'type' => 'expense', 'budget' => 1000, 'budget_currency' => 'USD',
    ])->assertSessionHasNoErrors();

    expect(Category::sole())
        ->type->toBe(CategoryType::Expense)
        ->budget->toBe('1000.00')
        ->budget_currency->value->toBe('USD');
});

it('does not allow budgets on income categories', function () {
    $this->post(route('categories.store'), [
        'name' => 'Salary', 'type' => 'income', 'budget' => 1000, 'budget_currency' => 'COP',
    ])->assertSessionHasErrors('budget');
});

it('keeps names unique per type only', function () {
    Category::factory()->create(['name' => 'Other']);

    $this->post(route('categories.store'), ['name' => 'Other', 'type' => 'expense', 'budget_currency' => 'COP'])
        ->assertSessionHasErrors('name');
    $this->post(route('categories.store'), ['name' => 'Other', 'type' => 'income', 'budget_currency' => 'COP'])
        ->assertSessionHasNoErrors();
});

it('never changes the type of an existing category', function () {
    $category = Category::factory()->create(['name' => 'Food']);

    $this->put(route('categories.update', $category), [
        'name' => 'Groceries', 'type' => 'income', 'budget_currency' => 'COP',
    ])->assertSessionHasNoErrors();

    expect($category->fresh())->name->toBe('Groceries')->type->toBe(CategoryType::Expense);
});

it('only deletes categories without movements', function () {
    $used = Transaction::factory()->create()->category;
    $empty = Category::factory()->create();

    $this->delete(route('categories.destroy', $used));
    $this->delete(route('categories.destroy', $empty));

    expect(Category::pluck('id')->all())->toBe([$used->id]);
});
