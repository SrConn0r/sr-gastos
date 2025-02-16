<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Category extends Model
{
    protected $fillable = ['name', 'budget'];

    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class);
    }

    public function getRemainingBudgetAttribute(): float
    {
        if (!$this->budget) {
            return 0;
        }

        $totalExpenses = $this->expenses()->sum('amount');
        return $this->budget - $totalExpenses;
    }
}
