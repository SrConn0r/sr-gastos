<?php

namespace App\Models;

use App\Enums\Currency;
use Database\Factories\TransactionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $category_id
 * @property int|null $account_id
 * @property int|null $user_id
 * @property int|null $recurring_expense_id
 * @property int|null $inbound_email_id
 * @property string $title
 * @property string $amount
 * @property Currency $currency
 * @property Carbon $date
 * @property bool $needs_review
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Category $category
 * @property-read Account|null $account
 * @property-read User|null $user
 * @property-read RecurringExpense|null $recurringExpense
 * @property-read InboundEmail|null $inboundEmail
 */
#[Fillable(['title', 'amount', 'currency', 'date', 'needs_review', 'category_id', 'account_id', 'user_id', 'recurring_expense_id', 'inbound_email_id'])]
class Transaction extends Model
{
    /** @use HasFactory<TransactionFactory> */
    use HasFactory;

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'currency' => Currency::class,
            'date' => 'date:Y-m-d',
            'needs_review' => 'boolean',
        ];
    }

    /** @return BelongsTo<Category, $this> */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /** @return BelongsTo<Account, $this> */
    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<RecurringExpense, $this> */
    public function recurringExpense(): BelongsTo
    {
        return $this->belongsTo(RecurringExpense::class);
    }

    /** @return BelongsTo<InboundEmail, $this> */
    public function inboundEmail(): BelongsTo
    {
        return $this->belongsTo(InboundEmail::class);
    }
}
