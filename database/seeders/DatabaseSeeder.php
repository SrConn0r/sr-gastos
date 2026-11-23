<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Local demo data: one user, a few categories and a year of movements.
     */
    public function run(): void
    {
        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        $expenses = collect([
            ['name' => 'Mercado', 'budget' => 1_200_000],
            ['name' => 'Transporte', 'budget' => 300_000],
            ['name' => 'Restaurantes', 'budget' => 400_000],
            ['name' => 'Salud', 'budget' => null],
        ])->map(fn (array $data) => Category::factory()->create($data));

        $salary = Category::factory()->income()->create(['name' => 'Salario']);

        foreach ($expenses as $category) {
            Transaction::factory(30)->for($category)->for($user)->create();
        }

        foreach (range(0, 11) as $monthsAgo) {
            Transaction::factory()->for($salary)->for($user)->create([
                'title' => 'Salario',
                'amount' => 6_500_000,
                'date' => now()->subMonths($monthsAgo)->startOfMonth()->toDateString(),
            ]);
        }
    }
}
