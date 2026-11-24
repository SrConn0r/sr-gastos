<?php

use App\Enums\InboundEmailStatus;
use App\Models\InboundEmail;
use App\Models\User;

beforeEach(function () {
    config(['services.inbound_email.token' => 'secret-token', 'app.owner.email' => 'owner@example.com']);
    $this->owner = User::factory()->create(['email' => 'owner@example.com']);
});

function bankEmail(array $overrides = []): array
{
    return [
        'message_id' => 'msg-1',
        'from' => 'BBVA <notificaciones@bbva.com.co>',
        'subject' => 'Transferencia exitosa',
        'date' => '2026-11-24T15:30:00.000Z',
        'body' => 'Enviaste $45.000 a Restaurante El Corral',
        ...$overrides,
    ];
}

it('rejects requests without a valid token', function (?string $token) {
    $this->withToken((string) $token)
        ->postJson(route('api.inbound-emails.store'), ['emails' => [bankEmail()]])
        ->assertUnauthorized();
})->with(['missing' => [null], 'wrong' => ['nope']]);

it('is unavailable when no token is configured', function () {
    config(['services.inbound_email.token' => null]);

    $this->withToken('anything')
        ->postJson(route('api.inbound-emails.store'), ['emails' => [bankEmail()]])
        ->assertServiceUnavailable();
});

it('stores new emails as pending for the owner and skips duplicates', function () {
    $this->withToken('secret-token')
        ->postJson(route('api.inbound-emails.store'), ['emails' => [bankEmail(), bankEmail(['message_id' => 'msg-2'])]])
        ->assertOk()
        ->assertExactJson(['received' => 2, 'new' => 2]);

    $this->withToken('secret-token')
        ->postJson(route('api.inbound-emails.store'), ['emails' => [bankEmail()]])
        ->assertExactJson(['received' => 1, 'new' => 0]);

    $stored = InboundEmail::where('message_id', 'msg-1')->sole();
    expect(InboundEmail::count())->toBe(2)
        ->and($stored->status)->toBe(InboundEmailStatus::Pending)
        ->and($stored->user_id)->toBe($this->owner->id)
        ->and($stored->received_at->format('Y-m-d H:i'))->toBe('2026-11-24 10:30'); // America/Bogota
});

it('validates the payload', function (array $payload) {
    $this->withToken('secret-token')
        ->postJson(route('api.inbound-emails.store'), $payload)
        ->assertUnprocessable();
})->with([
    'no emails' => [['emails' => []]],
    'bad date' => [['emails' => [bankEmail(['date' => 'yesterday-ish'])]]],
    'body too long' => [['emails' => [bankEmail(['body' => str_repeat('a', 100_001)])]]],
]);

it('is unavailable when the owner does not exist', function () {
    config(['app.owner.email' => 'ghost@example.com']);

    $this->withToken('secret-token')
        ->postJson(route('api.inbound-emails.store'), ['emails' => [bankEmail()]])
        ->assertServiceUnavailable();
});

it('accepts an email without a body', function () {
    $this->withToken('secret-token')
        ->postJson(route('api.inbound-emails.store'), ['emails' => [bankEmail(['body' => null])]])
        ->assertOk();

    expect(InboundEmail::sole()->body)->toBe('');
});
