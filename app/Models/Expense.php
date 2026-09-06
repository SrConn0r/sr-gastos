<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Expense extends Model
{
    public const CURRENCIES = ['COP', 'USD', 'BRL'];

    public const DEFAULT_CURRENCY = 'COP';

    protected $fillable = ['title', 'amount', 'currency', 'expense_date', 'category_id'];

    protected $casts = [
        'expense_date' => 'date',
        'amount' => 'decimal:2'
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
