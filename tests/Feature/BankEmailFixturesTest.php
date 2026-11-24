<?php

use App\Enums\AccountKind;
use App\Enums\InboundEmailStatus;
use App\Models\Account;
use App\Models\Category;
use App\Models\InboundEmail;
use App\Models\User;
use App\Services\InboundEmailProcessor;

/*
 * Real bank emails (anonymized) through the real AI provider. Costs a few cents per run, so it
 * only runs on demand: AI_LIVE_TESTS=1 php artisan test --group=live (needs ANTHROPIC_API_KEY).
 */
it('classifies a real bank email', function (string $file, string $kind, ?float $amount, ?string $currency, ?string $date, ?string $account) {
    $user = User::factory()->create(['name' => 'Juan Pablo Pérez Gómez']);

    collect([
        ['BBVA Ahorros', 'BBVA', AccountKind::Deposit, 'COP', '5951'],
        ['BBVA Tarjeta', 'BBVA', AccountKind::CreditCard, 'COP', '9999'],
        ['Lulo Crédito', 'Lulo bank', AccountKind::CreditCard, 'COP', '9267'],
        ['RappiCard', 'RappiCard', AccountKind::CreditCard, 'COP', '0027'],
        ['Nequi', 'Nequi', AccountKind::Deposit, 'COP', null],
        ['Littio', 'Littio', AccountKind::Deposit, 'USD', '1232'],
    ])->each(fn (array $a) => Account::factory()->create(array_combine(['name', 'institution', 'kind', 'currency', 'last4'], $a)));

    foreach (['Mercado', 'Restaurantes', 'Servicios', 'Transporte', 'Software'] as $name) {
        Category::factory()->create(['name' => $name]);
    }
    foreach (['Salario', 'Otros ingresos'] as $name) {
        Category::factory()->income()->create(['name' => $name]);
    }

    [$head, $body] = explode("\n\n", (string) file_get_contents(base_path("tests/Fixtures/emails/{$file}.txt")), 2);
    preg_match('/^From: (.*)$/m', $head, $from);
    preg_match('/^Subject: (.*)$/m', $head, $subject);

    $email = InboundEmail::factory()->for($user)->create(['from' => $from[1], 'subject' => $subject[1], 'body' => $body]);

    app(InboundEmailProcessor::class)->process($email);
    $email->refresh();

    expect($email->ai_result['kind'] ?? null)->toBe($kind, json_encode($email->ai_result) ?: '');

    if ($amount === null) {
        expect($email->transaction)->toBeNull();

        return;
    }

    expect($email->status)->toBe(InboundEmailStatus::Recorded)
        ->and((float) $email->transaction->amount)->toBe($amount)
        ->and($email->transaction->currency->value)->toBe($currency)
        ->and($email->transaction->date->toDateString())->toBe($date)
        ->and($email->transaction->account?->name)->toBe($account);
})->with([
    'BBVA Bre-B a Bancolombia' => ['bbva-breb-envio-bancolombia', 'expense', 70000.0, 'COP', '2026-11-24', 'BBVA Ahorros'],
    'BBVA Bre-B a Nequi de otra persona' => ['bbva-breb-envio-nequi', 'expense', 20000.0, 'COP', '2026-11-23', 'BBVA Ahorros'],
    'BBVA Bre-B recibido' => ['bbva-breb-recibido', 'income', 357000.0, 'COP', '2026-11-12', 'BBVA Ahorros'],
    'BBVA compra con tarjeta' => ['bbva-compra-tarjeta', 'expense', 87350.0, 'COP', '2026-11-22', 'BBVA Tarjeta'],
    'BBVA ingreso a la app' => ['bbva-ingreso-app', 'not_a_transaction', null, null, null, null],
    'Lulo compra crédito' => ['lulo-compra-credito', 'expense', 49900.0, 'COP', '2026-11-23', 'Lulo Crédito'],
    'RappiCard compra' => ['rappicard-compra', 'expense', 17502.4, 'COP', '2026-11-22', 'RappiCard'],
    'Nequi recibido de uno mismo' => ['nequi-recibido-propio', 'internal_transfer', null, null, null, null],
    'Nequi envío' => ['nequi-envio', 'expense', 4500.0, 'COP', '2026-10-05', 'Nequi'],
    'Littio compra en USD' => ['littio-compra-usd', 'expense', 27.17, 'USD', '2026-11-02', 'Littio'],
])->group('live')->skip(fn () => ! env('AI_LIVE_TESTS'), 'Live AI test: set AI_LIVE_TESTS=1');
