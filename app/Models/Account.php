<?php

namespace App\Models;

use App\Enums\AccountKind;
use App\Enums\Currency;
use Database\Factories\AccountFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string $institution
 * @property AccountKind $kind
 * @property Currency $currency
 * @property string|null $last4
 * @property Carbon|null $archived_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'institution', 'kind', 'currency', 'last4', 'archived_at'])]
class Account extends Model
{
    /** @use HasFactory<AccountFactory> */
    use HasFactory;

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'kind' => AccountKind::class,
            'currency' => Currency::class,
            'archived_at' => 'datetime',
        ];
    }

    /** @return HasMany<Transaction, $this> */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    /** @param Builder<Account> $query */
    public function scopeActive(Builder $query): void
    {
        $query->whereNull('archived_at');
    }
}
