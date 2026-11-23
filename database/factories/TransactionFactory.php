<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Transaction;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Transaction>
 */
class TransactionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(3),
            'amount' => fake()->numberBetween(5, 500) * 1000,
            'currency' => 'COP',
            'date' => fake()->dateTimeBetween('-11 months', 'now')->format('Y-m-d'),
            'category_id' => Category::factory(),
        ];
    }
}
