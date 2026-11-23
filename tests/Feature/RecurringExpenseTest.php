<?php

use App\Enums\Frequency;
use App\Models\Category;
use App\Models\RecurringExpense;
use App\Models\Transaction;
use App\Models\User;
use Carbon\CarbonImmutable;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->travelTo('2026-02-10 12:00:00');
    $this->actingAs(User::factory()->create());
});

it('computes due dates, clamping to the end of short months', function () {
    $monthly = RecurringExpense::factory()->make(['day' => 31]);
    $yearly = RecurringExpense::factory()->yearly(3)->make(['day' => 5]);
    $passed = RecurringExpense::factory()->make(['day' => 9]);
    $yearlyPassed = RecurringExpense::factory()->yearly(1)->make(['day' => 20]);

    expect($monthly->dueDateIn(CarbonImmutable::parse('2026-02-01'))->toDateString())->toBe('2026-02-28')
        ->and($yearly->dueDateIn(CarbonImmutable::parse('2026-02-01')))->toBeNull()
        ->and($monthly->nextDueDate()->toDateString())->toBe('2026-02-28')
        ->and($passed->nextDueDate()->toDateString())->toBe('2026-03-09')
        ->and($yearly->nextDueDate()->toDateString())->toBe('2026-03-05')
        ->and($yearlyPassed->nextDueDate()->toDateString())->toBe('2027-01-20');
});

it('creates fixed expenses and yearly subscriptions', function () {
    $category = Category::factory()->create();

    $this->post(route('recurring-expenses.store'), [
        'kind' => 'fixed', 'name' => 'Rent', 'category_id' => $category->id, 'amount' => 1800000,
        'currency' => 'COP', 'frequency' => 'monthly', 'day' => 5, 'month' => 7, 'active' => '1',
    ])->assertSessionHasNoErrors();
    $this->post(route('recurring-expenses.store'), [
        'kind' => 'subscription', 'name' => 'Domain', 'category_id' => $category->id, 'amount' => 15,
        'currency' => 'USD', 'frequency' => 'yearly', 'day' => 10, 'month' => 3, 'active' => '1',
    ])->assertSessionHasNoErrors();

    [$rent, $domain] = RecurringExpense::orderBy('id')->get();
    expect($rent)->month->toBeNull()->active->toBeTrue()
        ->and($domain)->frequency->toBe(Frequency::Yearly)->month->toBe(3);
});

it('validates recurring expenses', function (array $data, string $field) {
    $category = Category::factory()->create();

    $this->post(route('recurring-expenses.store'), [
        'kind' => 'subscription', 'name' => 'Netflix', 'category_id' => $category->id, 'amount' => 10,
        'currency' => 'COP', 'frequency' => 'monthly', 'day' => 12, ...$data,
    ])->assertSessionHasErrors($field);
})->with([
    'yearly fixed expense' => [['kind' => 'fixed', 'frequency' => 'yearly', 'month' => 1], 'frequency'],
    'yearly without month' => [['frequency' => 'yearly'], 'month'],
    'day out of range' => [['day' => 32], 'day'],
    'income category' => [fn () => ['category_id' => Category::factory()->income()->create()->id], 'category_id'],
]);

it('deactivates when the checkbox is unchecked', function () {
    $item = RecurringExpense::factory()->create();

    $this->put(route('recurring-expenses.update', $item), [
        'kind' => 'fixed', 'name' => $item->name, 'category_id' => $item->category_id, 'amount' => 10,
        'currency' => 'COP', 'frequency' => 'monthly', 'day' => 5,
    ])->assertSessionHasNoErrors();

    expect($item->fresh()->active)->toBeFalse();
});

it('links a recorded payment and shows it as paid this month', function () {
    $item = RecurringExpense::factory()->subscription()->create(['name' => 'Netflix']);

    $this->post(route('transactions.store'), [
        'title' => 'Netflix', 'amount' => 44900, 'currency' => 'COP', 'date' => '2026-02-10',
        'category_id' => $item->category_id, 'recurring_expense_id' => $item->id,
    ])->assertSessionHasNoErrors();

    expect(Transaction::sole()->recurring_expense_id)->toBe($item->id);

    $this->get(route('subscriptions.index'))->assertInertia(fn (Assert $page) => $page
        ->component('subscriptions')
        ->where('items.0.status', 'paid')
    );
});

it('keeps payments when a recurring expense is deleted', function () {
    $item = RecurringExpense::factory()->create();
    $payment = Transaction::factory()->for($item->category)->create(['recurring_expense_id' => $item->id]);

    $this->delete(route('recurring-expenses.destroy', $item));

    expect(RecurringExpense::count())->toBe(0)
        ->and($payment->fresh()->recurring_expense_id)->toBeNull();
});

it('reports each item status for this month', function () {
    $paid = RecurringExpense::factory()->create(['day' => 1]);
    Transaction::factory()->for($paid->category)->create(['recurring_expense_id' => $paid->id, 'date' => '2026-02-01']);
    RecurringExpense::factory()->create(['day' => 5]);
    RecurringExpense::factory()->create(['day' => 10]);
    RecurringExpense::factory()->yearly(3)->create(['day' => 6]);
    RecurringExpense::factory()->create(['day' => 7, 'active' => false]);

    $statuses = RecurringExpense::withMax('transactions as last_paid_on', 'date')->orderBy('id')->get()
        ->map->status()->all();

    expect($statuses)->toBe(['paid', 'overdue', 'pending', 'scheduled', 'inactive']);
});

it('lists only kind-matching items on each page', function () {
    RecurringExpense::factory()->create(['name' => 'Rent']);
    RecurringExpense::factory()->subscription()->create(['name' => 'Netflix']);

    $this->get(route('fixed-expenses.index'))->assertInertia(fn (Assert $page) => $page
        ->component('fixed-expenses')
        ->has('items', 1)
        ->where('items.0.name', 'Rent')
    );
});

it('shows unpaid items due this month on the dashboard', function () {
    $overdue = RecurringExpense::factory()->create(['name' => 'Rent', 'day' => 5]);
    RecurringExpense::factory()->subscription()->create(['name' => 'Spotify', 'day' => 28]);
    $paid = RecurringExpense::factory()->create(['name' => 'Internet', 'day' => 15]);
    Transaction::factory()->for($paid->category)->create(['recurring_expense_id' => $paid->id, 'date' => '2026-02-01']);
    RecurringExpense::factory()->create(['name' => 'Old gym', 'active' => false]);
    RecurringExpense::factory()->subscription()->yearly(3)->create(['name' => 'Domain']);

    $this->get(route('dashboard'))->assertInertia(fn (Assert $page) => $page
        ->has('pending', 2)
        ->where('pending.0.name', 'Rent')
        ->where('pending.0.due_date', '2026-02-05')
        ->where('pending.0.overdue', true)
        ->where('pending.1.name', 'Spotify')
        ->where('pending.1.overdue', false)
    );
});
