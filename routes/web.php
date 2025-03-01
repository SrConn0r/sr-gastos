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
    return Inertia::render('Dashboard', [
        'expenses' => Expense::with('category')->get(),
        'categories' => Category::all()
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
