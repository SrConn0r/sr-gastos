<?php

return [
    // Phase 2: a super admin overrides these from the database; config stays the fallback.
    'provider' => env('AI_PROVIDER', 'anthropic'),
    'model' => env('AI_MODEL', 'claude-opus-5-5'),
    'effort' => env('AI_EFFORT', 'low'),

    'providers' => [
        'anthropic' => [
            'key' => env('ANTHROPIC_API_KEY'),
        ],
    ],
];
