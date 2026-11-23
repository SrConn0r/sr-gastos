<?php

namespace Database\Factories;

use App\Enums\Frequency;
use App\Enums\RecurringKind;
use App\Models\Category;
use App\Models\RecurringExpense;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RecurringExpense>
 */
class RecurringExpenseFactory extends Factory
{
    public function definition(): array
    {
        return [
            'kind' => RecurringKind::Fixed,
            'name' => fake()->words(2, true),
            'category_id' => Category::factory(),
            'amount' => fake()->numberBetween(20, 2000) * 1000,
            'currency' => 'COP',
            'frequency' => Frequency::Monthly,
            'day' => fake()->numberBetween(1, 28),
            'month' => null,
            'active' => true,
        ];
    }

    public function subscription(): static
    {
        return $this->state(['kind' => RecurringKind::Subscription]);
    }

    public function yearly(int $month): static
    {
        return $this->state(['frequency' => Frequency::Yearly, 'month' => $month]);
    }
}
