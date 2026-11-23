<?php

namespace Database\Factories;

use App\Enums\CategoryType;
use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Category>
 */
class CategoryFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->word(),
            'type' => CategoryType::Expense,
            'budget' => null,
            'budget_currency' => 'COP',
        ];
    }

    public function income(): static
    {
        return $this->state(['type' => CategoryType::Income]);
    }
}
