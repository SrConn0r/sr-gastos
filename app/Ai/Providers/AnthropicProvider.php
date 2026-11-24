<?php

namespace App\Ai\Providers;

use Anthropic\Beta\Messages\BetaOutputConfig\Effort;
use Anthropic\Beta\Messages\BetaTextBlock;
use Anthropic\Client;
use Anthropic\Core\Exceptions\APIException;
use App\Ai\AiException;
use App\Ai\AiProvider;

final class AnthropicProvider implements AiProvider
{
    public function __construct(
        private readonly Client $client,
        private readonly string $model,
        private readonly string $effort,
    ) {}

    public function structured(string $system, string $input, array $schema): array
    {
        try {
            $message = $this->client->beta->messages->create(
                model: $this->model,
                maxTokens: 8000,
                system: $system,
                messages: [['role' => 'user', 'content' => $input]],
                outputConfig: [
                    'effort' => Effort::from($this->effort),
                    'format' => ['type' => 'json_schema', 'schema' => $schema],
                ],
                // On a policy refusal the API retries on a fallback model inside the same call.
                fallbacks: 'default',
                betas: ['server-side-fallback-2026-07-01'],
            );
        } catch (APIException $e) {
            throw new AiException('Anthropic: '.$e->getMessage(), previous: $e);
        }

        $text = null;
        foreach ($message->content as $block) {
            if ($block instanceof BetaTextBlock) {
                $text = $block->text;
                break;
            }
        }

        return self::parse($message->stopReason, $text);
    }

    /** @return array<string, mixed> */
    public static function parse(?string $stopReason, ?string $text): array
    {
        if ($stopReason === 'refusal') {
            throw new AiException('El modelo rechazó la solicitud.');
        }

        if ($stopReason === 'max_tokens') {
            throw new AiException('Respuesta truncada (max_tokens).');
        }

        $data = $text === null ? null : json_decode($text, true);

        if (! is_array($data)) {
            throw new AiException('La respuesta no es un objeto JSON.');
        }

        return $data;
    }
}
