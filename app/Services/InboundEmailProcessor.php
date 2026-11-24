<?php

namespace App\Services;

use App\Ai\AiException;
use App\Ai\Tasks\CategorizeBankEmail;
use App\Enums\CategoryType;
use App\Enums\Currency;
use App\Enums\InboundEmailStatus;
use App\Models\Account;
use App\Models\Category;
use App\Models\InboundEmail;
use App\Models\Transaction;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Throwable;

/** Turns one pending bank email into a movement, trusting the AI only for ids that exist in the database. */
final class InboundEmailProcessor
{
    public const MAX_ATTEMPTS = 3;

    public function __construct(private readonly CategorizeBankEmail $categorize) {}

    public function process(InboundEmail $email): void
    {
        try {
            $this->record($email);
        } catch (AiException $e) {
            $this->retryOrFail($email, $e->getMessage());
        } catch (Throwable $e) {
            // One poison email must not abort the rest of the hourly batch.
            report($e);
            $this->retryOrFail($email, Str::limit($e->getMessage(), 250));
        }
    }

    private function retryOrFail(InboundEmail $email, string $error): void
    {
        $email->refresh(); // drop half-applied in-memory changes; saves only what we set below
        if ($email->status !== InboundEmailStatus::Pending) {
            return;
        }

        $email->attempts++;
        $email->error = $error;
        if ($email->attempts >= self::MAX_ATTEMPTS) {
            $email->status = InboundEmailStatus::Failed;
            $email->processed_at = now();
        }
        $email->save();
    }

    private function record(InboundEmail $email): void
    {
        $accounts = Account::active()->orderBy('name')->get();
        $categories = Category::orderBy('type')->orderBy('name')->get();

        $result = ($this->categorize)($email, $accounts, $categories);

        $email->fill(['ai_result' => $result, 'error' => null, 'processed_at' => now()]);

        $type = CategoryType::tryFrom((string) ($result['kind'] ?? ''));
        if ($type === null) {
            $email->status = match ($result['kind'] ?? null) {
                'internal_transfer' => InboundEmailStatus::InternalTransfer,
                'not_a_transaction' => InboundEmailStatus::Ignored,
                default => InboundEmailStatus::Failed,
            };
            $email->error = $email->status === InboundEmailStatus::Failed ? 'Tipo de movimiento desconocido.' : null;
            $email->save();

            return;
        }

        $amount = is_numeric($result['amount'] ?? null) ? round((float) $result['amount'], 2) : 0.0;
        if (! is_finite($amount) || $amount <= 0 || $amount > 9_999_999_999) { // decimal(12,2)
            $email->fill(['status' => InboundEmailStatus::Failed, 'error' => 'Monto inválido en la respuesta de la IA.'])->save();

            return;
        }

        $review = ($result['confident'] ?? false) !== true;

        $account = $accounts->first(fn (Account $a) => $a->id === (int) ($result['account_id'] ?? 0));
        $review = $review || $account === null;
        $currency = Currency::tryFrom((string) ($result['currency'] ?? '')) ?? $account->currency ?? Currency::COP;
        $review = $review || $currency !== ($account->currency ?? $currency);

        $category = $categories->first(fn (Category $c) => $c->id === (int) ($result['category_id'] ?? 0) && $c->type === $type);
        if ($category === null) {
            $review = true;
            $category = Category::firstOrCreate([
                'name' => $type === CategoryType::Expense ? 'Otros gastos' : 'Otros ingresos',
                'type' => $type,
            ]);
        }

        $title = trim((string) ($result['title'] ?? '')) ?: ($email->subject ?: 'Movimiento automático');

        DB::transaction(function () use ($email, $result, $amount, $currency, $account, $category, $review, $title) {
            Transaction::create([
                'title' => Str::limit($title, 255, ''),
                'amount' => $amount,
                'currency' => $currency,
                'date' => $this->date($result['date'] ?? null) ?? $email->received_at->toDateString(),
                'category_id' => $category->id,
                'account_id' => $account?->id,
                'user_id' => $email->user_id,
                'inbound_email_id' => $email->id,
                'needs_review' => $review,
            ]);

            $email->status = InboundEmailStatus::Recorded;
            $email->save();
        });
    }

    /** A valid YYYY-MM-DD that is not in the future, or null. */
    private function date(mixed $value): ?string
    {
        if (! is_string($value) || ! preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) {
            return null;
        }

        try {
            $date = Date::createFromFormat('!Y-m-d', $value);
        } catch (Throwable) {
            return null;
        }

        return ! $date || $date->format('Y-m-d') !== $value || $date->isFuture() ? null : $date->toDateString();
    }
}
