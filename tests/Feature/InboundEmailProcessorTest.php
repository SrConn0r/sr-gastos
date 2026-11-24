<?php

use App\Ai\AiException;
use App\Ai\AiProvider;
use App\Enums\CategoryType;
use App\Enums\InboundEmailStatus;
use App\Models\Account;
use App\Models\Category;
use App\Models\InboundEmail;
use App\Models\Transaction;
use App\Services\InboundEmailProcessor;

beforeEach(function () {
    $this->travelTo('2026-11-24 12:00:00');
    $this->account = Account::factory()->create(['name' => 'BBVA Ahorros', 'currency' => 'COP', 'last4' => '1234']);
    $this->food = Category::factory()->create(['name' => 'Restaurantes']);
    $this->salary = Category::factory()->income()->create(['name' => 'Freelance']);
    $this->email = InboundEmail::factory()->create(['received_at' => '2026-11-23 18:00:00']);
});

/** Binds an AiProvider that returns $answer (or throws it) and records the input it got. */
function fakeAi(array|Throwable $answer): object
{
    $fake = new class($answer) implements AiProvider
    {
        public ?string $input = null;

        public function __construct(private array|Throwable $answer) {}

        public function structured(string $system, string $input, array $schema): array
        {
            $this->input = $input;

            return $this->answer instanceof Throwable ? throw $this->answer : $this->answer;
        }
    };
    app()->instance(AiProvider::class, $fake);

    return $fake;
}

function aiAnswer(array $overrides = []): array
{
    return [
        'kind' => 'expense', 'amount' => 45000, 'currency' => 'COP', 'date' => '2026-11-23',
        'title' => 'Restaurante El Corral', 'account_id' => test()->account->id,
        'category_id' => test()->food->id, 'confident' => true, 'reason' => 'Pago QR a restaurante',
        ...$overrides,
    ];
}

function processEmail(): InboundEmail
{
    app(InboundEmailProcessor::class)->process(test()->email);

    return test()->email->fresh();
}

it('records a confident expense', function () {
    $ai = fakeAi(aiAnswer());

    $email = processEmail();

    expect($email->status)->toBe(InboundEmailStatus::Recorded)
        ->and($email->ai_result['reason'])->toBe('Pago QR a restaurante')
        ->and($ai->input)->toContain('BBVA Ahorros')->toContain('Restaurantes')->toContain('Enviaste $45.000');
    expect(Transaction::sole())
        ->title->toBe('Restaurante El Corral')
        ->amount->toBe('45000.00')
        ->account_id->toBe($this->account->id)
        ->category_id->toBe($this->food->id)
        ->inbound_email_id->toBe($email->id)
        ->user_id->toBe($email->user_id)
        ->needs_review->toBeFalse()
        ->date->toDateString()->toBe('2026-11-23');
});

it('records income', function () {
    fakeAi(aiAnswer(['kind' => 'income', 'category_id' => $this->salary->id, 'title' => 'Pago cliente']));

    processEmail();

    expect(Transaction::sole()->category_id)->toBe($this->salary->id);
});

it('does not record internal transfers or non-transactions', function (string $kind, InboundEmailStatus $status) {
    fakeAi(aiAnswer(['kind' => $kind]));

    expect(processEmail()->status)->toBe($status);
    expect(Transaction::count())->toBe(0);
})->with([
    'internal transfer' => ['internal_transfer', InboundEmailStatus::InternalTransfer],
    'not a transaction' => ['not_a_transaction', InboundEmailStatus::Ignored],
]);

it('falls back to the "Otros" category and flags review when the category does not fit', function () {
    fakeAi(aiAnswer(['category_id' => $this->salary->id])); // income category for an expense

    processEmail();

    $transaction = Transaction::sole();
    expect($transaction->category->name)->toBe('Otros gastos')
        ->and($transaction->category->type)->toBe(CategoryType::Expense)
        ->and($transaction->needs_review)->toBeTrue();
});

it('flags review when the account is unknown, archived or the AI is unsure', function (array $overrides) {
    fakeAi(aiAnswer($overrides));

    processEmail();

    expect(Transaction::sole()->needs_review)->toBeTrue();
})->with([
    'unknown account' => [fn () => ['account_id' => 999]],
    'archived account' => [fn () => ['account_id' => Account::factory()->archived()->create()->id]],
    'not confident' => [fn () => ['confident' => false]],
]);

it('uses the email date when the AI date is missing or in the future', function (?string $date) {
    fakeAi(aiAnswer(['date' => $date]));

    processEmail();

    expect(Transaction::sole()->date->toDateString())->toBe('2026-11-23');
})->with(['missing' => [null], 'future' => ['2026-12-01'], 'garbage' => ['ayer']]);

it('uses the account currency when the AI gives none', function () {
    $littio = Account::factory()->create(['currency' => 'USD']);
    fakeAi(aiAnswer(['currency' => null, 'account_id' => $littio->id]));

    processEmail();

    expect(Transaction::sole()->currency->value)->toBe('USD');
});

it('fails without retry on a non-positive amount', function () {
    fakeAi(aiAnswer(['amount' => 0]));

    expect(processEmail())->status->toBe(InboundEmailStatus::Failed)->error->toContain('Monto');
    expect(Transaction::count())->toBe(0);
});

it('retries AI errors and fails after three attempts', function () {
    fakeAi(new AiException('Anthropic: overloaded'));

    expect(processEmail())->status->toBe(InboundEmailStatus::Pending)->attempts->toBe(1)->error->toBe('Anthropic: overloaded');
    processEmail();
    expect(processEmail())->status->toBe(InboundEmailStatus::Failed)->attempts->toBe(3);
});
