<?php

use App\Ai\AiProvider;
use App\Enums\InboundEmailStatus;
use App\Models\InboundEmail;

it('processes only pending emails', function () {
    app()->instance(AiProvider::class, new class implements AiProvider
    {
        public function structured(string $system, string $input, array $schema): array
        {
            return ['kind' => 'not_a_transaction', 'amount' => null, 'currency' => null, 'date' => null, 'title' => null,
                'account_id' => null, 'category_id' => null, 'confident' => true, 'reason' => 'Promoción'];
        }
    });
    $pending = InboundEmail::factory()->count(2)->create();
    $failed = InboundEmail::factory()->failed()->create();

    $this->artisan('inbound-emails:process')->expectsOutput('Procesados: 2')->assertSuccessful();

    $pending->each(fn (InboundEmail $email) => expect($email->fresh()->status)->toBe(InboundEmailStatus::Ignored));
    expect($failed->fresh()->status)->toBe(InboundEmailStatus::Failed);
});

it('is scheduled hourly', function () {
    $this->artisan('schedule:list')->expectsOutputToContain('inbound-emails:process');
});
