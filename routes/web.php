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
    $expenses = Expense::with('category')->get();
    
    // Obtener todas las categorías
    $categories = Category::all();
    
    // Calcular el total de gastos del mes actual
    $monthExpenseTotal = Expense::whereMonth('expense_date', now()->month)->sum('amount');
    
    // Obtener los gastos del mes actual agrupados por categoría
    $expensesByCategory = Expense::whereMonth('expense_date', now()->month)
        ->with('category')
        ->get()
        ->groupBy('category_id');
    
    // Calcular el total por cada categoría
    $monthExpenseTotalByCategory = [];
    foreach ($expensesByCategory as $categoryId => $categoryExpenses) {
        $category = Category::find($categoryId);
        $monthExpenseTotalByCategory[] = [
            'id' => $categoryId,
            'name' => $category->name,
            'total' => $categoryExpenses->sum('amount')
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
