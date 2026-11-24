<?php

use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->travelTo('2026-11-20 12:00:00');
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

it('records who created a movement', function () {
    $category = Category::factory()->create();

    $this->post(route('transactions.store'), [
        'title' => 'Lunch', 'amount' => 25000, 'currency' => 'COP', 'date' => '2026-11-20', 'category_id' => $category->id,
    ])->assertSessionHasNoErrors();

    expect(Transaction::sole())->user_id->toBe($this->user->id)->amount->toBe('25000.00');
});

it('validates movements', function (array $data, string $field) {
    $category = Category::factory()->create();

    $this->post(route('transactions.store'), [
        'title' => 'Lunch', 'amount' => 10, 'currency' => 'COP', 'date' => '2026-11-20', 'category_id' => $category->id, ...$data,
    ])->assertSessionHasErrors($field);
})->with([
    'future date' => [['date' => '2026-11-21'], 'date'],
    'zero amount' => [['amount' => 0], 'amount'],
    'unknown currency' => [['currency' => 'EUR'], 'currency'],
    'missing category' => [['category_id' => 999], 'category_id'],
]);

it('keeps the original author when another user edits', function () {
    $transaction = Transaction::factory()->for(User::factory()->create())->create();

    $this->put(route('transactions.update', $transaction), [
        'title' => 'Edited', 'amount' => 10, 'currency' => 'USD', 'date' => '2026-11-01', 'category_id' => $transaction->category_id,
    ])->assertSessionHasNoErrors();

    expect($transaction->fresh())->title->toBe('Edited')->user_id->not->toBe($this->user->id);
});

it('deletes movements', function () {
    $transaction = Transaction::factory()->create();

    $this->delete(route('transactions.destroy', $transaction));

    expect(Transaction::count())->toBe(0);
});

it('filters movements', function () {
    $food = Category::factory()->create();
    $salary = Category::factory()->income()->create();
    Transaction::factory()->for($food)->create(['title' => 'Pizza', 'currency' => 'COP', 'date' => '2026-11-10']);
    Transaction::factory()->for($food)->create(['title' => 'Burger', 'currency' => 'USD', 'date' => '2026-10-10']);
    Transaction::factory()->for($salary)->create(['title' => 'Salary', 'currency' => 'COP', 'date' => '2026-11-01']);

    $titles = fn (array $query) => collect($this->get(route('transactions.index', $query))
        ->viewData('page')['props']['transactions']['data'])->pluck('title')->all();

    expect($titles(['type' => 'income']))->toBe(['Salary'])
        ->and($titles(['search' => 'urg']))->toBe(['Burger'])
        ->and($titles(['currency' => 'USD']))->toBe(['Burger'])
        ->and($titles(['category' => $food->id, 'date_from' => '2026-11-01']))->toBe(['Pizza'])
        ->and($titles([]))->toBe(['Pizza', 'Salary', 'Burger']);
});

it('rejects an inverted date range', function () {
    $this->get(route('transactions.index', ['date_from' => '2026-11-10', 'date_to' => '2026-11-01']))
        ->assertSessionHasErrors('date_to');
});

it('renders the movements page', function () {
    $this->get(route('transactions.index'))->assertInertia(fn (Assert $page) => $page
        ->component('transactions/index')
        ->has('categories')
        ->has('transactions.data'));
});

it('stores the account of a movement', function () {
    $category = Category::factory()->create();
    $account = Account::factory()->create();

    $this->post(route('transactions.store'), [
        'title' => 'Lunch', 'amount' => 10, 'currency' => 'COP', 'date' => '2026-11-20',
        'category_id' => $category->id, 'account_id' => $account->id,
    ])->assertSessionHasNoErrors();

    expect(Transaction::sole()->account_id)->toBe($account->id);
});

it('rejects unknown accounts', function () {
    $category = Category::factory()->create();

    $this->post(route('transactions.store'), [
        'title' => 'Lunch', 'amount' => 10, 'currency' => 'COP', 'date' => '2026-11-20',
        'category_id' => $category->id, 'account_id' => 999,
    ])->assertSessionHasErrors('account_id');
});

it('clears the review flag when a movement is edited', function () {
    $transaction = Transaction::factory()->create(['needs_review' => true]);

    $this->put(route('transactions.update', $transaction), [
        'title' => 'Fixed', 'amount' => 10, 'currency' => 'COP', 'date' => '2026-11-20', 'category_id' => $transaction->category_id,
    ])->assertSessionHasNoErrors();

    expect($transaction->fresh()->needs_review)->toBeFalse();
});

it('filters movements by account and by review flag', function () {
    $account = Account::factory()->create();
    $inAccount = Transaction::factory()->create(['account_id' => $account->id]);
    $toReview = Transaction::factory()->create(['needs_review' => true]);
    Transaction::factory()->create();

    $this->get(route('transactions.index', ['account' => $account->id]))
        ->assertInertia(fn (Assert $page) => $page->has('transactions.data', 1)->where('transactions.data.0.id', $inAccount->id));

    $this->get(route('transactions.index', ['review' => 1]))
        ->assertInertia(fn (Assert $page) => $page->has('transactions.data', 1)->where('transactions.data.0.id', $toReview->id)->has('accounts', 1));
});
