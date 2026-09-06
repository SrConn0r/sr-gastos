<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\ProfileController;
use App\Models\Category;
use App\Models\Expense;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'categories' => Category::all()
    ]);
});

Route::get('/dashboard', function () {
    // Obtener todos los gastos con sus categorías
    $expenses = Expense::with('category')
        ->orderBy('created_at', 'desc')
        ->get();

    // Obtener todas las categorías
    $categories = Category::all();

    $monthExpenses = Expense::whereMonth('created_at', now()->month)
        ->with('category')
        ->get();

    $groupCurrencyTotals = function ($expenses) {
        return $expenses
            ->groupBy('currency')
            ->map(fn ($items, $currency) => [
                'currency' => $currency,
                'total' => (float) $items->sum('amount'),
            ])
            ->sortBy(fn ($item) => array_search($item['currency'], Expense::CURRENCIES, true))
            ->values();
    };

    $monthExpenseTotal = $groupCurrencyTotals($monthExpenses);

    $expensesByCategory = $monthExpenses->groupBy('category_id');

    $monthExpenseTotalByCategory = [];
    foreach ($expensesByCategory as $categoryId => $categoryExpenses) {
        $category = $categoryExpenses->first()->category;
        $monthExpenseTotalByCategory[] = [
            'id' => $categoryId,
            'name' => $category->name,
            'totals' => $groupCurrencyTotals($categoryExpenses),
        ];
    }

    return Inertia::render('Dashboard', [
        'expenses' => $expenses,
        'categories' => $categories,
        'monthExpenseTotal' => $monthExpenseTotal,
        'monthExpenseTotalCategories' => $expensesByCategory,
        'monthExpenseTotalByCategory' => $monthExpenseTotalByCategory
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::resource('expenses', ExpenseController::class);
    Route::put('/expenses/{expense}', [ExpenseController::class, 'update'])->name('expense.update');
    Route::delete('/expenses/{expense}', [ExpenseController::class, 'destroy'])->name('expense.destroy');
    Route::resource('categories', CategoryController::class);
    Route::put('/categories/{category}', [CategoryController::class, 'update'])->name('category.update');
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('category.destroy');
    Route::post('/categories', [CategoryController::class, 'store'])->name('category.store');
});

Route::prefix('api')->group(function () {
    Route::post('/transactions', [ExpenseController::class, 'store'])->name('expense.public-store');
});

require __DIR__ . '/auth.php';
