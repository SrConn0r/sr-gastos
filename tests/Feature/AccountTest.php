<?php

use App\Enums\AccountKind;
use App\Models\Account;
use App\Models\Transaction;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(fn () => $this->actingAs(User::factory()->create()));

it('creates an account', function () {
    $this->post(route('accounts.store'), [
        'name' => 'BBVA Ahorros', 'institution' => 'BBVA', 'kind' => 'deposit', 'currency' => 'COP', 'last4' => '1234',
    ])->assertSessionHasNoErrors();

    expect(Account::sole())
        ->name->toBe('BBVA Ahorros')
        ->kind->toBe(AccountKind::Deposit)
        ->currency->value->toBe('COP')
        ->last4->toBe('1234')
        ->archived_at->toBeNull();
});

it('validates accounts', function (array $data, string $field) {
    Account::factory()->create(['name' => 'Nequi']);

    $this->post(route('accounts.store'), [
        'name' => 'Littio', 'institution' => 'Littio', 'kind' => 'deposit', 'currency' => 'USD', ...$data,
    ])->assertSessionHasErrors($field);
})->with([
    'duplicated name' => [['name' => 'Nequi'], 'name'],
    'unknown kind' => [['kind' => 'loan'], 'kind'],
    'unknown currency' => [['currency' => 'EUR'], 'currency'],
    'last4 not 4 digits' => [['last4' => '12a'], 'last4'],
]);

it('archives and restores an account', function () {
    $account = Account::factory()->create();
    $data = ['name' => $account->name, 'institution' => 'BBVA', 'kind' => 'credit_card', 'currency' => 'COP'];

    $this->put(route('accounts.update', $account), [...$data, 'archived' => true])->assertSessionHasNoErrors();
    expect($account->fresh())->archived_at->not->toBeNull()->kind->toBe(AccountKind::CreditCard);

    $this->put(route('accounts.update', $account), [...$data, 'archived' => false]);
    expect($account->fresh()->archived_at)->toBeNull();
});

it('only deletes accounts without movements', function () {
    $used = Account::factory()->create();
    Transaction::factory()->create(['account_id' => $used->id]);
    $empty = Account::factory()->create();

    $this->delete(route('accounts.destroy', $used));
    $this->delete(route('accounts.destroy', $empty));

    expect(Account::pluck('id')->all())->toBe([$used->id]);
});

it('renders the accounts page', function () {
    Account::factory()->create();

    $this->get(route('accounts.index'))->assertInertia(fn (Assert $page) => $page
        ->component('accounts/index')
        ->has('accounts', 1));
});
