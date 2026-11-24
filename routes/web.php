<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\RecurringExpenseController;
use App\Http\Controllers\TransactionController;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => redirect()->route(auth()->check() ? 'dashboard' : 'login'))->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');
    Route::resource('transactions', TransactionController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::resource('categories', CategoryController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::resource('accounts', AccountController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::get('fixed-expenses', [RecurringExpenseController::class, 'fixed'])->name('fixed-expenses.index');
    Route::get('subscriptions', [RecurringExpenseController::class, 'subscriptions'])->name('subscriptions.index');
    Route::resource('recurring-expenses', RecurringExpenseController::class)->only(['store', 'update', 'destroy']);
});

require __DIR__.'/settings.php';
