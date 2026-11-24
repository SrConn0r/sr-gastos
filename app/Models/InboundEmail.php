<?php

namespace App\Models;

use App\Enums\InboundEmailStatus;
use Carbon\CarbonInterface;
use Database\Factories\InboundEmailFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property string $message_id
 * @property string $from
 * @property string $subject
 * @property Carbon $received_at
 * @property string $body
 * @property InboundEmailStatus $status
 * @property int $attempts
 * @property array<string, mixed>|null $ai_result
 * @property string|null $error
 * @property CarbonInterface|null $processed_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read User $user
 * @property-read Transaction|null $transaction
 */
#[Fillable(['user_id', 'message_id', 'from', 'subject', 'received_at', 'body', 'status', 'attempts', 'ai_result', 'error', 'processed_at'])]
#[Hidden(['body'])]
class InboundEmail extends Model
{
    /** @use HasFactory<InboundEmailFactory> */
    use HasFactory;

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'received_at' => 'datetime',
            'processed_at' => 'datetime',
            'status' => InboundEmailStatus::class,
            'ai_result' => 'array',
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return HasOne<Transaction, $this> */
    public function transaction(): HasOne
    {
        return $this->hasOne(Transaction::class);
    }
}
