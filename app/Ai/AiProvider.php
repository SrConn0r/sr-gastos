<?php

namespace App\Ai;

/**
 * Any LLM that can answer with JSON matching a schema. Tasks in App\Ai\Tasks depend on this,
 * never on a vendor SDK, so switching providers is a config change plus one implementation.
 */
interface AiProvider
{
    /**
     * @param  array<string, mixed>  $schema  JSON Schema of an object; the answer must match it.
     * @return array<string, mixed>
     *
     * @throws AiException when the provider fails, refuses or returns something unusable.
     */
    public function structured(string $system, string $input, array $schema): array;
}
