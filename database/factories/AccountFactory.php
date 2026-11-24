<?php

namespace Database\Factories;

use App\Enums\AccountKind;
use App\Models\Account;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Account>
 */
class AccountFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->company().' Ahorros',
            'institution' => fake()->randomElement(['BBVA', 'Bancolombia', 'Nequi']),
            'kind' => AccountKind::Deposit,
            'currency' => 'COP',
            'last4' => null,
            'archived_at' => null,
        ];
    }

    public function archived(): static
    {
        return $this->state(['archived_at' => now()]);
    }
}
