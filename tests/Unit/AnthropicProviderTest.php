<?php

use App\Ai\AiException;
use App\Ai\Providers\AnthropicProvider;

it('decodes the JSON answer', function () {
    expect(AnthropicProvider::parse('end_turn', '{"kind":"expense","amount":1000}'))
        ->toBe(['kind' => 'expense', 'amount' => 1000]);
});

it('turns unusable answers into AiException', function (?string $stopReason, ?string $text, string $message) {
    expect(fn () => AnthropicProvider::parse($stopReason, $text))->toThrow(AiException::class, $message);
})->with([
    'refusal' => ['refusal', null, 'rechazó'],
    'truncated' => ['max_tokens', '{"kind":', 'truncada'],
    'no text' => ['end_turn', null, 'JSON'],
    'invalid json' => ['end_turn', 'not json', 'JSON'],
    'json scalar' => ['end_turn', '"hola"', 'JSON'],
]);
