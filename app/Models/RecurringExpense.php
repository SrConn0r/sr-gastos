<?php

namespace App\Models;

use App\Enums\Currency;
use App\Enums\Frequency;
use App\Enums\RecurringKind;
use Carbon\CarbonImmutable;
use Database\Factories\RecurringExpenseFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * A fixed monthly bill (rent, utilities) or a subscription with a billing day.
 *
 * @property int $id
 * @property RecurringKind $kind
 * @property string $name
 * @property int $category_id
 * @property string $amount
 * @property Currency $currency
 * @property Frequency $frequency
 * @property int $day
 * @property int|null $month
 * @property bool $active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Category $category
 * @property-read string|null $last_paid_on Loaded with withMax('transactions as last_paid_on', 'date').
 */
#[Fillable(['kind', 'name', 'category_id', 'amount', 'currency', 'frequency', 'day', 'month', 'active'])]
class RecurringExpense extends Model
{
    /** @use HasFactory<RecurringExpenseFactory> */
    use HasFactory;

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'kind' => RecurringKind::class,
            'amount' => 'decimal:2',
            'currency' => Currency::class,
            'frequency' => Frequency::class,
            'active' => 'boolean',
        ];
    }

    /** @return BelongsTo<Category, $this> */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /** @return HasMany<Transaction, $this> */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    /**
     * The due date inside the given month, or null when a yearly charge falls in another month.
     * Days past the end of the month (e.g. 31 in February) fall on its last day.
     */
    public function dueDateIn(CarbonImmutable $month): ?CarbonImmutable
    {
        if ($this->frequency === Frequency::Yearly && $this->month !== $month->month) {
            return null;
        }

        $start = $month->startOfMonth();

        return $start->setDay(min($this->day, $start->daysInMonth));
    }

    /**
     * This month's state: inactive, paid, overdue, pending, or scheduled (not due this month).
     * Needs last_paid_on, loaded with withMax('transactions as last_paid_on', 'date').
     */
    public function status(): string
    {
        $due = $this->dueDateIn(CarbonImmutable::today());

        return match (true) {
            ! $this->active => 'inactive',
            $this->last_paid_on >= CarbonImmutable::today()->startOfMonth()->toDateString() => 'paid',
            $due === null => 'scheduled',
            $due->lt(CarbonImmutable::today()) => 'overdue',
            default => 'pending',
        };
    }

    /** The next due date from today on (today included). */
    public function nextDueDate(): CarbonImmutable
    {
        $today = CarbonImmutable::today();
        $month = $today->startOfMonth();

        if ($this->frequency === Frequency::Yearly) {
            $month = $month->setMonth((int) $this->month);

            if ($month->lt($today->startOfMonth())) {
                $month = $month->addYear();
            }
        }

        while (($date = $this->dueDateIn($month)) === null || $date->lt($today)) {
            $month = $month->addMonthNoOverflow();
        }

        return $date;
    }
}
