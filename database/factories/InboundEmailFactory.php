<?php

namespace Database\Factories;

use App\Enums\InboundEmailStatus;
use App\Models\InboundEmail;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<InboundEmail>
 */
class InboundEmailFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'message_id' => fake()->unique()->uuid(),
            'from' => 'BBVA <notificaciones@bbva.com.co>',
            'subject' => 'Transferencia exitosa',
            'received_at' => now(),
            'body' => 'Enviaste $45.000 a Restaurante El Corral desde tu cuenta *1234.',
            'status' => InboundEmailStatus::Pending,
            'attempts' => 0,
        ];
    }

    public function failed(): static
    {
        return $this->state(['status' => InboundEmailStatus::Failed, 'attempts' => 3, 'error' => 'Anthropic: overloaded']);
    }
}
